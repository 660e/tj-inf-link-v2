<template>
  <div class="col flex column">
    <div class="col q-pa-md">
      <iot-title title="命令下发" :buttons="[{ label: '刷新', command: 'refresh', icon: 'refresh' }]" @handle="handle" />
      <div class="flex q-pt-md q-gutter-md">
        <q-card v-for="service in services" :key="service.id" style="width: 300px">
          <q-card-section class="q-gutter-y-sm">
            <div class="flex items-center justify-between">
              <span>{{ service.name || '-' }}</span>
              <q-spinner-radio v-if="$store.getters.loading" color="primary" size="14px" />
              <q-icon
                v-else
                @click="handle({ command: 'execute', service })"
                name="play_circle_outline"
                class="cursor-pointer text-primary"
                size="xs"
              />
            </div>
            <q-input
              v-for="param in service.deviceServiceParameterList"
              v-model="param.value"
              :key="param.id"
              :label="param.label"
              :disable="$store.getters.loading"
              dense
              outlined
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div style="height: 400px" class="flex column">
      <q-separator class="q-mx-md" />
      <iot-searchbar :fields="fields" @search="search" />
      <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
    </div>
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { logQueryApi } from '@/api/wsat-service-device/log-query.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

export default {
  data() {
    return {
      id: this.$route.params.id,
      label: this.$route.query.label,
      services: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [{ label: '日期范围', key: 'date-range', type: 'date-range', value: [], props: { start: 'startTime', end: 'endTime' } }];
    this.columns = [
      {
        label: '结果',
        name: 'result',
        field: 'result',
        align: 'left',
        badge: val => {
          switch (val) {
            case 1:
              return 'positive';
            case 2:
              return 'negative';
          }
        }
      },
      { label: '操作时间', name: 'optStartTimeStr', field: 'optStartTimeStr', align: 'left' },
      { label: '操作描述', name: 'logMessage', field: 'logMessage', align: 'left', style: 'width: 500px', classes: 'ellipsis' },
      { label: '用户请求IP', name: 'clientIp', field: 'clientIp', align: 'left' },
      { label: '用户名', name: 'optUserAccount', field: 'optUserAccount', align: 'left' }
    ];
    extendApi.getDateItemBycodes(['optResult']).then(response => {
      this.columns.find(e => e.name === 'result').format = val => {
        return response.optResult.find(e => e.value === val) ? response.optResult.find(e => e.value === val).label : '-';
      };
      this.search();
      this.getServices();
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        deviceId: this.id,
        optType: 10,
        ...this.filters
      };
      logQueryApi.queryOptLogBeanList(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    getServices() {
      devicesApi.services(this.id).then(response => (this.services = response.data));
    },
    handle({ command, service }) {
      switch (command) {
        case 'refresh':
          this.getServices();
          break;
        case 'execute':
          if (service.deviceServiceParameterList.every(e => e.value.trim() !== '')) {
            this.$store.commit('loading', true);
            devicesApi.executeDeviceServices(this.label, service.id, service.deviceServiceParameterList).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '命令下发成功' });
                this.getServices();
              }
              this.$store.commit('loading', false);
            });
          } else {
            this.$q.notify({ type: 'warning', message: '服务参数不能为空' });
          }
          break;
      }
    }
  }
};
</script>
