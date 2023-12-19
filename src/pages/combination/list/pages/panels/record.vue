<template>
  <div class="col column">
    <iot-title title="历史数据" class="q-px-md q-pt-md" />
    <iot-searchbar ref="searchbar" :fields="fields" @search="search" />
    <iot-toolbar
      :buttons="[
        { label: '表格', command: 'table' },
        { label: '图表', command: 'chart' }
      ]"
      @handle="handle"
      @refresh="refresh"
    />
    <q-tab-panels v-model="tab" class="col transparent" animated keep-alive>
      <q-tab-panel name="table">
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
      </q-tab-panel>
      <q-tab-panel name="chart">
        <div class="q-ma-md col" id="chart"></div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      id: this.$route.params.id,
      label: '',
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
      tab: 'table',
      chart: null
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
        key: 'date-time-range',
        type: 'date-time-range',
        value: [dayjs().subtract(1, 'M').valueOf(), dayjs().valueOf()],
        props: { start: 'startTime', end: 'endTime' }
      },
      { label: '聚合方式', key: 'convergence', type: 'select', options: [], props: {}, value: 'TRIM', clearable: false },
      { label: '聚合时间粒度', key: 'granularity', type: 'select', options: [], props: {}, value: 'Days', clearable: false }
    ];
    this.columns = [
      { label: '监测属性', name: 'monitorObject', field: 'monitorObject', align: 'left' },
      { label: '属性值', name: 'monitorValue', field: 'monitorValue', align: 'left' },
      { label: '单位', name: 'unit', field: 'unit', align: 'left' },
      { label: '采集时间', name: 'monitorTime', field: 'monitorTime', align: 'left' },
      { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
      { label: '设备标识符', name: 'deviceLabel', field: 'deviceLabel', align: 'left' }
    ];
    const p0 = perceivedApi.getdevicelist({ id: this.id, pageNum: 1, pageSize: 999 });
    const p1 = extendApi.getDateItemBycodes(['granularity', 'convergence']);
    Promise.all([p0, p1]).then(response => {
      const monitorObject = this.fields.find(e => e.key === 'monitorObject');
      if (response[0].data.length) {
        perceivedApi.getpropertys(response[0].data.map(e => e.ID)).then(propertys => {
          monitorObject.options = propertys.data;
          monitorObject.value = monitorObject.options.length ? monitorObject.options[0].label : '';
          this.label = 'todo1';
          this.fields.find(e => e.key === 'granularity').options = response[1].granularity;
          this.fields.find(e => e.key === 'convergence').options = response[1].convergence;
          monitorObject.value && this.$refs.searchbar.search();
        });
      }
    });
  },
  methods: {
    onRequest(pagination) {
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        deviceLabel: this.label,
        ...this.filters
      };
      switch (this.tab) {
        case 'table':
          this.$store.commit('loading', true);
          devicesApi.getDeviceHistoryDataForIotdb(params).then(response => {
            this.pagination.page = response.current;
            this.pagination.rowsPerPage = response.size;
            this.pagination.rowsNumber = response.total;
            this.data = response.data || [];
            this.$store.commit('loading', false);
          });
          break;
        case 'chart':
          devicesApi.getDeviceDataPointsForIotdb(params).then(response => {
            this.chart = this.chart || this.$echarts.init(document.querySelector('#chart'));
            this.chart.setOption({
              grid: {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                containLabel: true
              },
              tooltip: {
                trigger: 'axis'
              },
              xAxis: {
                type: 'category',
                data: response.data.map(e => e.monitorTime)
              },
              yAxis: {
                type: 'value'
              },
              series: [
                {
                  data: response.data.map(e => e.monitorValue),
                  type: 'line'
                }
              ]
            });
          });
          break;
      }
    },
    search(filters) {
      this.label = 'todo2';
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command }) {
      this.tab = command;
      this.onRequest(this.pagination);
    }
  }
};
</script>
