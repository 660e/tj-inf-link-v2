<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="运行监控" />
    <div class="layout-content row">
      <div class="col flex column">
        <iot-table :data="data_host" :columns="columns_host" title="主机状态" class="col">
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
        <iot-table :data="data_micro_services" :columns="columns_micro_services" title="微服务状态" class="col" style="margin-top: 0" />
      </div>
      <div class="col-3 q-pt-md q-pr-md q-gutter-y-md">
        <q-card
          v-for="m in middlewares"
          @click="handle({ command: 'middleware', row: m })"
          :key="m.name"
          class="cursor-pointer q-hoverable"
          bordered
          flat
        >
          <span class="q-focus-helper"></span>
          <q-card-section>
            <div class="text-h6">{{ m.label }}</div>
            <div class="flex items-center q-pt-md q-gutter-x-md">
              <q-badge label="在线" color="positive" />
              <div class="text-h6">{{ m.length }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { qs } from '@/utils/data.js';
import { monitorStaticApi } from '@/api/wsat-service-device/monitor-static.js';

import DetailsDialog from './dialogs/details.vue';

export default {
  components: {
    DetailsDialog
  },
  data() {
    return {
      breadcrumbs: [{ label: '系统管理' }, { label: '运行监控' }],
      height: '300px',
      data_host: [],
      columns_host: [],
      data_micro_services: [],
      columns_micro_services: [],
      middlewares: [
        { label: 'mysql', name: 'mysql_uptime', length: 0 },
        { label: 'redis', name: 'redis_uptime', length: 0 },
        { label: 'elasticsearch', name: 'elasticsearch_os_timestamp', length: 0 }
      ]
    };
  },
  mounted() {
    // 主机状态
    this.columns_host = [
      { label: '服务器ip', name: 'note', field: 'note', align: 'left' },
      { label: 'ident', name: 'ident', field: 'ident' },
      {
        label: 'cpu使用率（%）',
        name: 'cpu_usage_active',
        field: 'cpu_usage_active',
        format: val => (val && val[1] ? Number(val[1]).toFixed(2) : '-')
      },
      {
        label: 'cpu空闲率（%）',
        name: 'cpu_usage_idle',
        field: 'cpu_usage_idle',
        format: val => (val && val[1] ? Number(val[1]).toFixed(2) : '-')
      },
      {
        label: '内存使用率（%）',
        name: 'mem_used_percent',
        field: 'mem_used_percent',
        format: val => (val && val[1] ? Number(val[1]).toFixed(2) : '-')
      },
      {
        label: '可用内存（G）',
        name: 'mem_available',
        field: 'mem_available',
        format: val => (val && val[1] ? (Number(val[1]) / 1024 ** 3).toFixed(2) : '-')
      },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          {
            show: row => row.cpu_usage_active && row.cpu_usage_active.length,
            label: '详情',
            command: 'host'
          }
        ]
      }
    ];
    monitorStaticApi.getAllHostMonitorData().then(response => {
      this.data_host = response.data;

      // 中间件
      Promise.all(
        this.middlewares.map(m => {
          return monitorStaticApi.getN9eMonitorData({
            urlPath: encodeURIComponent(
              `/api/n9e/prometheus/api/v1/query_range?${qs({
                start: dayjs().subtract(10, 'm').unix(),
                end: dayjs().unix(),
                step: 14,
                query: `avg(${m.name}{ident=~"${response.data.map(e => e.ident).join('|')}"})by(ident)`
              })}`
            )
          });
        })
      ).then(middlewareResponse => {
        this.middlewares.forEach((m, i) => (m.length = JSON.parse(middlewareResponse[i].data).data.result.length));
      });
    });
    // 微服务状态
    this.columns_micro_services = [
      { label: '名称', name: 'scrapePool', field: 'scrapePool', align: 'left' },
      { label: '地址', name: 'scrapeUrl', field: 'scrapeUrl', align: 'left' },
      {
        label: '运行状态',
        name: 'health',
        field: 'health',
        align: 'left',
        format: val => (val === 'up' ? '在线' : '离线'),
        badge: val => (val === 'up' ? 'positive' : 'negative')
      },
      {
        label: '最后更新时间',
        name: 'lastScrape',
        field: 'lastScrape',
        align: 'left',
        format: val => (val ? val.slice(0, 19).replace('T', ' ') : '-')
      },
      { label: '持续时间（秒）', name: 'lastScrapeDuration', field: 'lastScrapeDuration' }
    ];
    monitorStaticApi.getPrometheusData({ urlPath: '/api/v1/targets?state=active' }).then(response => {
      this.data_micro_services = JSON.parse(response.data).data.activeTargets;
    });
  },
  methods: {
    handle({ command, row }) {
      switch (command) {
        case 'host':
          this.$refs.detailsDialog.open(row.note, [
            { id: 'cpu_usage_idle', querys: [`cpu_usage_idle{cpu="cpu-total",ident=~"${row.ident}"}`] },
            { id: 'mem_available_percent', querys: [`mem_available_percent{ident="${row.ident}"}`] },
            { id: 'disk_used_percent', querys: [`disk_used_percent{ident="${row.ident}"}`] },
            { id: 'diskio_io_time', querys: [`rate(diskio_io_time{ident="${row.ident}"}[1m])/10`] },
            { id: 'netstat_tcp_time_wait', querys: [`netstat_tcp_time_wait{ident="${row.ident}"}`] }
          ]);
          break;
        case 'middleware': {
          const start = dayjs().subtract(1, 'd').unix();
          const end = dayjs().unix();
          monitorStaticApi
            .getN9eMonitorData({
              urlPath: encodeURIComponent(`/api/n9e/prometheus/api/v1/series?match[]=${row.name}&start=${start}&end=${end}`)
            })
            .then(response => {
              const data = JSON.parse(response.data).data[0];

              const ident = data.ident;
              const server = data.server;
              const port = data.port;

              const params = {
                mysql_uptime: [
                  { id: 'mysql_queries', querys: [`rate(mysql_queries{ident="${ident}",server="${server}"}[1m])`] },
                  {
                    id: 'mysql_com',
                    querys: [
                      { name: 'mysql_com_insert', query: `rate(mysql_com_insert{ident="${ident}",server="${server}"}[1m])` },
                      { name: 'mysql_com_update', query: `rate(mysql_com_update{ident="${ident}",server="${server}"}[1m])` },
                      { name: 'mysql_com_delete', query: `rate(mysql_com_delete{ident="${ident}",server="${server}"}[1m])` }
                    ]
                  },
                  {
                    id: 'mysql_threads',
                    querys: [
                      { name: 'mysql_threads_running', query: `mysql_threads_running{ident="${ident}",server="${server}"}` },
                      { name: 'mysql_threads_connected', query: `mysql_threads_connected{ident="${ident}",server="${server}"}` }
                    ]
                  },
                  {
                    id: 'mysql_innodb_data',
                    querys: [
                      { name: 'mysql_innodb_data_reads', query: `rate(mysql_innodb_data_reads{ident="${ident}",server="${server}"}[5m])` },
                      { name: 'mysql_innodb_data_writes', query: `rate(mysql_innodb_data_writes{ident="${ident}",server="${server}"}[5m])` }
                    ]
                  },
                  {
                    id: 'mysql_com_commit_and_rollback',
                    querys: [
                      `rate(mysql_com_commit{ident="${ident}",server="${server}"}[1m])
                      +rate(mysql_com_rollback{ident="${ident}",server="${server}"}[1m])`
                    ]
                  },
                  {
                    id: 'mysql_innodb_buffer_pool_reads_and_requests',
                    querys: [
                      `100-increase(mysql_innodb_buffer_pool_reads{ident="${ident}",server="${server}"}[5m])
                      /increase(mysql_innodb_buffer_pool_read_requests{ident="${ident}",server="${server}"}[5m])*100`
                    ]
                  }
                ],
                redis_uptime: [
                  {
                    id: 'redis_used_memory',
                    querys: [
                      { name: 'redis_used_memory', query: `redis_used_memory{ident=~"${ident}",server=~"${server}",port=~"${port}"}` },
                      { name: 'redis_used_memory_lua', query: `redis_used_memory_lua{ident=~"${ident}",server=~"${server}",port=~"${port}"}` },
                      { name: 'redis_used_memory_peak', query: `redis_used_memory_peak{ident=~"${ident}",server=~"${server}",port=~"${port}"}` },
                      { name: 'redis_used_memory_rss', query: `redis_used_memory_rss{ident=~"${ident}",server=~"${server}",port=~"${port}"}` }
                    ]
                  },
                  {
                    id: 'redis_clients',
                    querys: [
                      { name: 'redis_clients', query: `redis_clients{ident=~"${ident}",server=~"${server}",port=~"${port}"}` },
                      { name: 'redis_blocked_clients', query: `redis_blocked_clients{ident=~"${ident}",server=~"${server}",port=~"${port}"}` }
                    ]
                  },
                  {
                    id: 'redis_total_commands_processed',
                    querys: [`rate(redis_total_commands_processed{ident=~"${ident}",server=~"${server}",port=~"${port}"}[1m])`]
                  },
                  {
                    id: 'redis_keyspace',
                    querys: [
                      {
                        name: 'redis_keyspace_hits',
                        query: `irate(redis_keyspace_hits{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      },
                      {
                        name: 'redis_blocked_clients',
                        query: `irate(redis_keyspace_misses{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      }
                    ]
                  },
                  {
                    id: 'redis_total_net',
                    querys: [
                      {
                        name: 'redis_total_net_input_bytes',
                        query: `rate(redis_total_net_input_bytes{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      },
                      {
                        name: 'redis_total_net_output_bytes',
                        query: `rate(redis_total_net_output_bytes{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      }
                    ]
                  },
                  {
                    id: 'redis',
                    querys: [
                      {
                        name: 'redis_expired_keys',
                        query: `rate(redis_expired_keys{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      },
                      {
                        name: 'redis_evicted_keys',
                        query: `rate(redis_evicted_keys{ident=~"${ident}",server=~"${server}",port=~"${port}"}[5m])`
                      }
                    ]
                  }
                ],
                elasticsearch_os_timestamp: [
                  { id: 'elasticsearch_os_timestamp', querys: [`avg(elasticsearch_os_timestamp{ident=~"${ident}"})by(ident)`] }
                ]
              };
              this.$refs.detailsDialog.open(ident, params[row.name]);
            });
          break;
        }
      }
    }
  }
};
</script>
