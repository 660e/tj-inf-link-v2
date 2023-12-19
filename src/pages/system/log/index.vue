<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="日志管理" />
    <q-tabs v-model="tab" @input="input" active-color="primary" align="left" class="text-grey" dense>
      <q-tab v-for="(t, i) in tabs" :key="i" :label="t.name" :name="i" />
    </q-tabs>
    <q-separator />
    <div class="layout-content">
      <div class="layout-main">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-for="(t, i) in tabs" :key="i" :name="i">
            <iot-searchbar :fields="t.fields" @search="filters => search(filters, t)" />
            <iot-table :data="t.data" :columns="t.columns" :pagination="t.pagination" @request="pagination => onRequest(pagination, t)" sticky>
              <template v-slot:handle="{ props }">
                <iot-table-handle :props="props" @handle="$refs.detailsDialog.open(t.name, props.row)" />
              </template>
            </iot-table>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" />
  </div>
</template>

<script>
import { extend } from 'quasar';
import { logQueryApi } from '@/api/wsat-service-device/log-query.js';
import { deviceServiceRecordApi } from '@/api/wsat-service-device/device-service-record.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import dayjs from 'dayjs';
import DetailsDialog from './dialogs/details.vue';

export default {
  components: {
    DetailsDialog
  },
  data() {
    return {
      breadcrumbs: [{ label: '系统管理' }, { label: '日志管理' }],
      tab: Number(this.$route.query.tab) || 0,
      tabs: [
        {
          name: '操作记录',
          fields: [
            { label: '用户名', key: 'optUserAccount', type: 'input' },
            { label: 'ip地址', key: 'clientIp', type: 'input' },
            { label: '操作类型', key: 'optType', type: 'select', options: [], props: {} },
            { label: '执行结果', key: 'result', type: 'select', options: [], props: {} }
          ],
          filters: {},
          data: [],
          columns: [
            { label: '用户名', name: 'optUserAccount', field: 'optUserAccount', align: 'left' },
            { label: 'ip地址', name: 'clientIp', field: 'clientIp', align: 'left' },
            { label: '操作模块', name: 'module', field: 'module', align: 'left' },
            { label: '操作类型', name: 'optType', field: 'optType', align: 'left' },
            { label: '访问时间', name: 'optStartTimeStr', field: 'optStartTimeStr', align: 'left' },
            { label: '执行结果', name: 'result', field: 'result', align: 'left', badge: val => (val === 1 ? 'positive' : 'negative') },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px', handles: [{ label: '详情', command: 'details' }] }
          ],
          pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
        },
        {
          name: '远程调用',
          fields: [
            { label: '请求目标ip', key: 'reqIp', type: 'input' },
            { label: '请求时间', key: 'reqStartTimeStr', type: 'date-time-range', value: [], props: { start: 'reqTimeStart', end: 'reqTimeEnd' } }
          ],
          filters: {},
          data: [],
          columns: [
            { label: '发起方名称', name: 'logMethodName', field: 'logMethodName', align: 'left' },
            { label: '发起方所在类', name: 'logClassName', field: 'logClassName', align: 'left' },
            { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
            { label: '请求目标ip', name: 'reqIp', field: 'reqIp', align: 'left' },
            { label: '请求目标端口', name: 'reqPort', field: 'reqPort', align: 'left' },
            { label: '请求时间', name: 'reqStartTimeStr', field: 'reqStartTimeStr', align: 'left' },
            { label: '执行结果', name: 'result', field: 'result', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px', handles: [{ label: '详情', command: 'details' }] }
          ],
          pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
        },
        {
          name: '设备上报',
          fields: [
            { label: '上报所在类', key: 'logMethodName', type: 'input' },
            { label: '协议类型', key: 'agreementType', type: 'input' },
            { label: '系统/设备ip', key: 'ip', type: 'input' },
            { label: '访问时间', key: 'dcTimeStr', type: 'date-time-range', value: [], props: { start: 'dcTimeStart', end: 'dcTimeEnd' } }
          ],
          filters: {},
          data: [],
          columns: [
            { label: '上报所在类', name: 'logMethodName', field: 'logMethodName', align: 'left' },
            { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
            { label: '系统/设备ip', name: 'ip', field: 'ip', align: 'left' },
            { label: '访问时间', name: 'dcTimeStr', field: 'dcTimeStr', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px', handles: [{ label: '详情', command: 'details' }] }
          ],
          pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
        },
        {
          name: '命令下发',
          fields: [
            { label: '产品名称', key: 'productName', type: 'input' },
            { label: '设备名称', key: 'deviceName', type: 'input' }
          ],
          filters: {},
          data: [],
          columns: [
            { label: '产品名称', name: 'productName', field: 'productName', align: 'left' },
            { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
            { label: '服务标签', name: 'serviceLabel', field: 'serviceLabel', align: 'left' },
            { label: '服务名称', name: 'serviceName', field: 'serviceName', align: 'left' },
            { label: '协议', name: 'agreementType', field: 'agreementType', align: 'left' },
            { label: '服务执行时间', name: 'execTime', field: 'execTime', align: 'left' },
            { label: '执行结果', name: 'status', field: 'status', align: 'left', badge: val => (val === 1 ? 'positive' : 'negative') },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px', handles: [{ label: '详情', command: 'details' }] }
          ],
          pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
        },
        {
          name: '系统异常',
          fields: [
            { label: '微服务名称', key: 'hostName', type: 'input' },
            { label: '异常方法名', key: 'logMethodName', type: 'input' }
          ],
          filters: {},
          data: [],
          columns: [
            { label: '微服务名称', name: 'hostName', field: 'hostName', align: 'left' },
            { label: '异常方法名', name: 'logMethodName', field: 'logMethodName', align: 'left' },
            { label: '异常类名称', name: 'logClassName', field: 'logClassName', align: 'left' },
            { label: '发生时间', name: 'occurTimeStr', field: 'occurTimeStr', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px', handles: [{ label: '详情', command: 'details' }] }
          ],
          pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
        }
      ]
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['optResult', 'optType', 'agreementType']).then(response => {
      // 操作记录
      const optLogBean = this.tabs.find(e => e.name === '操作记录');
      optLogBean.fields.find(e => e.key === 'result').options = response.optResult;
      optLogBean.columns.find(e => e.name === 'result').format = val => {
        return response.optResult.find(e => e.value === val) ? response.optResult.find(e => e.value === val).label : '-';
      };
      optLogBean.fields.find(e => e.key === 'optType').options = response.optType;
      optLogBean.columns.find(e => e.name === 'optType').format = val => {
        return response.optType.find(e => e.value === val) ? response.optType.find(e => e.value === val).label : '-';
      };
      // 命令下发
      const deviceServiceRecord = this.tabs.find(e => e.name === '命令下发');
      deviceServiceRecord.columns.find(e => e.name === 'agreementType').format = val => {
        return response.agreementType.find(e => e.value === val) ? response.agreementType.find(e => e.value === val).label : '-';
      };
      deviceServiceRecord.columns.find(e => e.name === 'status').format = val => {
        return response.optResult.find(e => e.value === val) ? response.optResult.find(e => e.value === val).label : '-';
      };
      deviceServiceRecord.columns.find(e => e.name === 'execTime').format = val => {
        return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
      };
      this.input(this.tab);
    });
  },
  methods: {
    input(value) {
      this.onRequest(this.tabs[value].pagination, this.tabs[value]);
      const query = extend(true, {}, this.$route.query);
      query.tab = value;
      this.$router.push({ query });
    },
    search(filters, t) {
      t.filters = filters;
      t.pagination.page = 1;
      this.onRequest(t.pagination, t);
    },
    onRequest(pagination, t) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...t.filters
      };
      let fn;
      switch (t.name) {
        case '操作记录':
          fn = logQueryApi.queryOptLogBeanList;
          break;
        case '远程调用':
          fn = logQueryApi.queryRemoteCallLogBeanList;
          break;
        case '设备上报':
          fn = logQueryApi.queryDataReportLogBeanList;
          break;
        case '命令下发':
          fn = deviceServiceRecordApi.queryDeviceServiceRecordList;
          break;
        case '系统异常':
          fn = logQueryApi.querySysErrLogBeanList;
          break;
      }
      fn(params).then(response => {
        t.pagination.page = response.current;
        t.pagination.rowsPerPage = response.size;
        t.pagination.rowsNumber = response.total > 2000 ? 2000 : response.total;
        t.data = response.data;
        this.$store.commit('loading', false);
      });
    }
  }
};
</script>
