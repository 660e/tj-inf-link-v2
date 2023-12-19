<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '告警管理' }, { label: '告警监控' }]" />
    <iot-header title="告警监控" />
    <iot-searchbar :fields="fields" @search="search" />
    <q-tabs v-model="tab" @input="input" active-color="primary" align="left" class="text-grey" dense>
      <q-tab label="未处理" :name="1" />
      <q-tab label="已处理" :name="2" />
    </q-tabs>
    <div class="layout-content">
      <div class="layout-main">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-for="n in 2" :key="n" :name="n">
            <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
              <template v-slot:handle="{ props }">
                <iot-table-handle :props="props" @handle="handle" />
              </template>
            </iot-table>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <!-- 处理 -->
    <deal-dialog ref="dealDialog" @confirm="refresh" />
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" />
  </div>
</template>

<script>
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
import { alarmInfoApi } from '@/api/wsat-service-alarm/alarm-info.js';
import dayjs from 'dayjs';

import DealDialog from './dialogs/deal.vue';
import DetailsDialog from './dialogs/details.vue';

export default {
  components: {
    DealDialog,
    DetailsDialog
  },
  data() {
    return {
      fields: [],
      tab: Number(this.$route.query.tab) || 1,
      data: [],
      columns: [],
      defaultColumns: [
        { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
        {
          label: '设备状态',
          name: 'devOnlineStatus',
          field: 'devOnlineStatus',
          align: 'left',
          badge: val => {
            switch (val) {
              case 0:
                return 'negative';
              case 1:
                return 'positive';
              case 2:
                return 'grey';
            }
          }
        },
        { label: '告警规则名称', name: 'alarmRuleName', field: 'alarmRuleName', align: 'left' },
        { label: '告警级别', name: 'alarmLevel', field: 'alarmLevel', align: 'left' },
        { label: '告警类型', name: 'alarmTypeCode', field: 'alarmTypeCode', align: 'left' },
        { label: '告警来源', name: 'alarmSource', field: 'alarmSource', align: 'left' },
        { label: '首次发生时间', name: 'startTime', field: 'startTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') },
        { label: '告警次数', name: 'alarmCount', field: 'alarmCount', align: 'left' },
        { label: '最近发生时间', name: 'lastTime', field: 'lastTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') }
      ],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
      computed: {
        alarmLevel: [],
        alarmSource: [],
        alarmTypeCode: []
      }
    };
  },
  mounted() {
    this.fields = [
      { label: '设备名称', key: 'deviceName', type: 'input' },
      { label: '告警级别', key: 'alarmLevel', type: 'select', options: [], props: {} },
      { label: '告警类别', key: 'alarmTypeCode', type: 'select', options: [], props: {} },
      { label: '日期范围', key: 'date-time-range', type: 'date-time-range', value: [], props: { start: 'startTime', end: 'endTime' } }
    ];
    const p0 = extendApi.getDateItemBycodes(['alarmLevel', 'alarmSource', 'onlineStatus']);
    const p1 = alarmRuleTypeApi.SelectAlarmRuleType();
    Promise.all([p0, p1]).then(response => {
      const alarmTypeCodeOptions = response[1].data.map(e => ({ label: e.ruleType, value: e.ruleTypeCode }));
      this.fields.find(e => e.key === 'alarmLevel').options = response[0].alarmLevel;
      this.fields.find(e => e.key === 'alarmTypeCode').options = alarmTypeCodeOptions;
      this.defaultColumns.find(e => e.name === 'alarmLevel').format = val => {
        return response[0].alarmLevel.find(e => e.value === val) ? response[0].alarmLevel.find(e => e.value === val).label : '-';
      };
      this.defaultColumns.find(e => e.name === 'alarmSource').format = val => {
        return response[0].alarmSource.find(e => e.value === val) ? response[0].alarmSource.find(e => e.value === val).label : '-';
      };
      this.defaultColumns.find(e => e.name === 'alarmTypeCode').format = val => {
        return alarmTypeCodeOptions.find(e => e.value === val) ? alarmTypeCodeOptions.find(e => e.value === val).label : '-';
      };
      this.defaultColumns.find(e => e.name === 'devOnlineStatus').format = val => {
        return response[0].onlineStatus.find(e => e.value === val) ? response[0].onlineStatus.find(e => e.value === val).label : '-';
      };
      this.computed = {
        alarmLevel: response[0].alarmLevel,
        alarmSource: response[0].alarmSource,
        alarmTypeCode: alarmTypeCodeOptions,
        onlineStatus: response[0].onlineStatus
      };
      this.input(this.tab);
    });
  },
  methods: {
    input(value) {
      switch (value) {
        case 1:
          this.columns = [
            ...this.defaultColumns,
            {
              label: '操作',
              name: 'handle',
              field: 'handle',
              align: 'left',
              style: 'width: 10px',
              handles: [
                { label: '处理', command: 'deal' },
                { label: '详情', command: 'details' }
              ]
            }
          ];
          break;
        case 2:
          this.columns = [
            ...this.defaultColumns,
            {
              label: '处理时间',
              name: 'handleTime',
              field: 'handleTime',
              align: 'left',
              format: val => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-')
            },
            {
              label: '操作',
              name: 'handle',
              field: 'handle',
              align: 'left',
              style: 'width: 10px',
              handles: [
                { label: '查看处理结果', command: 'deal' },
                { label: '详情', command: 'details' }
              ]
            }
          ];
          break;
      }
      this.search(this.filters);
      const query = extend(true, {}, this.$route.query);
      query.tab = value;
      this.$router.push({ query });
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        alarmStatus: this.tab,
        ...this.filters
      };
      alarmInfoApi[this.tab === 1 ? 'alarmQuery' : 'hisAlarmQuery'](params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    handle({ command, row }) {
      switch (command) {
        case 'deal':
          this.$refs.dealDialog.open(row);
          break;
        case 'details':
          this.$refs.detailsDialog.open(row, this.computed);
          break;
      }
    }
  }
};
</script>
