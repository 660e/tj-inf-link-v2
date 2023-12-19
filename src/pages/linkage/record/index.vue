<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="联动列表" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '导出', command: 'export' }]" :columns="columns" @handle="handle" @refresh="refresh" />
        <iot-table :data="data" :columns="columns" :visible-columns="visibleColumns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" />
  </div>
</template>

<script>
import { sceneLinkageRecordApi } from '@/api/wsat-service-alarm/scene-linkage-record.js';
import { exportFile } from '@/utils/data.js';
import dayjs from 'dayjs';

import DetailsDialog from './dialogs/details.vue';

export default {
  components: {
    DetailsDialog
  },
  data() {
    return {
      breadcrumbs: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '场景联动' }, { label: '联动列表' }];
    this.fields = [
      { label: '场景名称', key: 'ruleName', type: 'input' },
      { label: '联动产品', key: 'productName', type: 'input' },
      { label: '联动设备', key: 'deviceName', type: 'input' },
      { label: '设备位置', key: 'positionDescr', type: 'input' },
      { label: '日期范围', key: 'date-range', type: 'date-range', value: [], props: { start: 'triggerTimeStart', end: 'triggerTimeEnd' } }
    ];
    this.columns = [
      { label: '场景名称', required: true, name: 'ruleName', field: 'ruleName', align: 'left' },
      { label: '联动产品', name: 'productName', field: 'productName', align: 'left' },
      { label: '联动设备', name: 'deviceName', field: 'deviceName', align: 'left' },
      { label: '设备类型', name: 'deviceType', field: 'deviceType', align: 'left', format: val => (val === 1 ? '设备' : '联动设备') },
      { label: '触发条件', name: 'alarmRuleExpr', field: 'alarmRuleExpr', align: 'left' },
      { label: '触发时间', name: 'triggerTime', field: 'triggerTime', align: 'left' },
      { label: '执行设备', name: 'actionDevice', field: 'actionDevice', align: 'left' },
      { label: '设备位置', name: 'positionDescr', field: 'positionDescr', align: 'left' },
      { label: '执行动作', name: 'serviceName', field: 'serviceName', align: 'left' },
      { label: '执行状态', name: 'status', field: 'status', align: 'left' },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [{ label: '详情', command: 'details' }]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    this.search();
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      sceneLinkageRecordApi.querySceneLinkageRecordList(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total > 2000 ? 2000 : response.total;
        this.data = response.data.map(r => {
          const s = r.deviceServiceRecordList ? r.deviceServiceRecordList : [];
          return {
            id: r.id,
            ruleName: r.ruleName,
            productName: r.productName,
            deviceName: r.deviceName,
            alarmRuleExpr: r.alarmRuleExpr,
            actionDevice: s.length ? s.map(e => e.deviceName).join('，') : '-',
            positionDescr: r.positionDescr,
            serviceName: s.length ? s.map(e => e.serviceName).join('，') : '-',
            triggerTime: dayjs(r.triggerTime).format('YYYY-MM-DD HH:mm:ss'),
            status: s.length ? s.map(e => (e.status === 1 ? '成功' : '失败')).join('，') : '-'
          };
        });
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row, columns }) {
      switch (command) {
        case 'export':
          sceneLinkageRecordApi.export().then(response => exportFile(response, '联动列表.xlsx'));
          break;
        case 'details':
          this.$refs.detailsDialog.open(row);
          break;
        case 'visible-columns':
          this.visibleColumns = columns;
          break;
      }
    }
  }
};
</script>
