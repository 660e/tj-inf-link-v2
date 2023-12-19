<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '告警管理' }, { label: '规则管理' }]" />
    <iot-header title="规则管理" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '新增', command: 'create' }]" @handle="handle" @refresh="refresh" />
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { popconfirm } from '@/utils/framework.js';
import { alarmRuleApi } from '@/api/wsat-service-alarm/alarm-rule.js';
import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

import CreateDialog from './dialogs/create.vue';

export default {
  components: {
    CreateDialog
  },
  data() {
    return {
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    // 产品创建事件跳转
    if (this.$route.params.create === 'create') {
      this.$refs.createDialog.open();
    }
    this.fields = [
      { label: '告警规则名称', key: 'ruleName', type: 'input' },
      { label: '启停状态', key: 'flag', type: 'select', options: [], props: {} },
      { label: '告警类型', key: 'alarmTypeCode', type: 'select', options: [], props: {} },
      { label: '告警级别', key: 'alarmLevel', type: 'select', options: [], props: {} }
    ];
    this.columns = [
      { label: '规则名称', name: 'ruleName', field: 'ruleName', align: 'left' },
      { label: '告警类型', name: 'alarmTypeName', field: 'alarmTypeName', align: 'left' },
      { label: '告警级别', name: 'alarmLevel', field: 'alarmLevel', align: 'left' },
      { label: '产品名称', name: 'productName', field: 'productName', align: 'left' },
      { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
      { label: '触发条件', name: 'htmlRuleExpr', field: 'htmlRuleExpr', align: 'left' },
      { label: '启停状态', name: 'flag', field: 'flag', align: 'left', badge: val => (val ? 'positive' : 'negative') },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        style: 'width: 10px',
        handles: [
          { label: row => (row.flag ? '禁用' : '启用'), command: 'enable' },
          { label: '修改', command: 'edit' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    const p0 = extendApi.getDateItemBycodes(['state', 'alarmLevel']);
    const p1 = alarmRuleTypeApi.SelectAlarmRuleType();
    Promise.all([p0, p1]).then(response => {
      this.fields.find(e => e.key === 'flag').options = response[0].state;
      this.fields.find(e => e.key === 'alarmLevel').options = response[0].alarmLevel;
      this.fields.find(e => e.key === 'alarmTypeCode').options = response[1].data.map(e => ({ label: e.ruleType, value: e.ruleTypeCode }));
      this.columns.find(e => e.name === 'alarmLevel').format = val => {
        return response[0].alarmLevel.find(e => e.value === val) ? response[0].alarmLevel.find(e => e.value === val).label : '-';
      };
      this.columns.find(e => e.name === 'flag').format = val => {
        return response[0].state.find(e => e.value === val) ? response[0].state.find(e => e.value === val).label : '-';
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
        productId: this.$route.query.productId || '',
        ...this.filters
      };
      alarmRuleApi.QueryAlarmRuleBasic(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters || {};
      this.filters.alarmLevel = filters && filters.alarmLevel && [filters.alarmLevel];
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'enable':
          popconfirm({
            message: `是否${row.flag ? '禁用' : '启用'}${row.ruleName}`
          }).onOk(() => {
            alarmRuleApi.updateAlarmRuleBasicStatus({ id: row.idStr, flag: row.flag ? 0 : 1 }).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'edit':
          alarmRuleApi.getAlarmRuleBasic(row.idStr).then(response => this.$refs.createDialog.open(response.data || {}));
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.ruleName}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            alarmRuleApi.deleteAlarmRuleBasic(row.idStr).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
