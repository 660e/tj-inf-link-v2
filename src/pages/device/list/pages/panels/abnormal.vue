<template>
  <div class="col column">
    <iot-title title="异常数据" class="q-px-md q-pt-md" />
    <iot-searchbar ref="searchbar" :fields="fields" @search="search" />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      id: this.$route.params.id,
      label: this.$route.query.label,
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      {
        label: '属性',
        key: 'monitorObject',
        type: 'select',
        options: [],
        props: { label: 'name', value: 'convertLabel' },
        value: '',
        clearable: false
      },
      {
        label: '日期范围',
        key: 'date-range',
        type: 'date-range',
        value: [dayjs().subtract(1, 'M').valueOf(), dayjs().valueOf()],
        props: { start: 'startTime', end: 'endTime' }
      }
    ];
    this.columns = [
      { label: '监测属性', name: 'monitorObject', field: 'monitorObject', align: 'left' },
      { label: '属性值', name: 'monitorValue', field: 'monitorValue', align: 'left' },
      { label: '单位', name: 'unit', field: 'unit', align: 'left' },
      { label: '采集时间', name: 'monitorTime', field: 'monitorTime', align: 'left' }
    ];
    devicesApi.getDevicePropertys(this.id).then(response => {
      const monitorObject = this.fields.find(e => e.key === 'monitorObject');
      monitorObject.options = response.data;
      monitorObject.value = monitorObject.options.length ? monitorObject.options[0].label : '';
      monitorObject.value && this.$refs.searchbar.search();
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        deviceLabel: this.label,
        ...this.filters
      };
      devicesApi.getDeviceAbnormalDataForIotdb(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data || [];
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
