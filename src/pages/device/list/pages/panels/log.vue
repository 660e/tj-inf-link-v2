<template>
  <div class="col column">
    <iot-title title="操作日志" class="q-px-md q-pt-md" />
    <iot-searchbar :fields="fields" @search="search" />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
  </div>
</template>

<script>
import { logQueryApi } from '@/api/wsat-service-device/log-query.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

export default {
  data() {
    return {
      id: this.$route.params.id,
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [{ label: '操作行为', key: 'optType', type: 'select', options: [], props: {} }];
    this.columns = [
      { label: '操作行为', name: 'optType', field: 'optType', align: 'left' },
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
    extendApi.getDateItemBycodes(['devOptType', 'optResult']).then(response => {
      this.fields.find(e => e.key === 'optType').options = response.devOptType;
      this.columns.find(e => e.name === 'optType').format = val => {
        return response.devOptType.find(e => e.value === val) ? response.devOptType.find(e => e.value === val).label : '-';
      };
      this.columns.find(e => e.name === 'result').format = val => {
        return response.optResult.find(e => e.value === val) ? response.optResult.find(e => e.value === val).label : '-';
      };
      this.search();
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        deviceId: this.id,
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
    }
  }
};
</script>
