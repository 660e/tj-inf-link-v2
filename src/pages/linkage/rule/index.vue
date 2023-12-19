<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '场景联动' }, { label: '联动规则' }]" />
    <iot-header title="联动规则" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '新增', command: 'create' }]" :columns="columns" @handle="handle" @refresh="refresh" />
        <iot-table :data="data" :columns="columns" :visible-columns="visibleColumns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增、修改 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { popconfirm } from '@/utils/framework.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { sceneLinkageRuleApi } from '@/api/wsat-service-alarm/scene-linkage-rule.js';

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
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      { label: '场景名称', key: 'ruleName', type: 'input' },
      { label: '产品名称', key: 'productName', type: 'input' },
      { label: '设备名称', key: 'deviceName', type: 'input' },
      { label: '启停状态', key: 'flag', type: 'select', options: [], props: {} }
    ];
    this.columns = [
      { label: '场景名称', required: true, name: 'ruleName', field: 'ruleName', align: 'left' },
      { label: '产品名称', name: 'productName', field: 'productName', align: 'left' },
      { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
      { label: '触发条件', name: 'htmlRuleExpr', field: 'htmlRuleExpr', align: 'left' },
      { label: '启停状态', name: 'flag', field: 'flag', align: 'left', badge: val => (val ? 'positive' : 'negative') },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: row => (row.flag ? '禁用' : '启用'), command: 'enable' },
          { label: '修改', command: 'edit' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    extendApi.getDateItemBycodes(['state']).then(response => {
      this.fields.find(e => e.key === 'flag').options = response.state;
      this.columns.find(e => e.name === 'flag').format = val => {
        return response.state.find(e => Number(e.value) === val) ? response.state.find(e => Number(e.value) === val).label : '-';
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
        ...this.filters
      };
      sceneLinkageRuleApi.querySceneLinkageRuleBasicsList(params).then(response => {
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
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row, columns }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'enable':
          popconfirm({
            message: `是否${row.flag ? '禁用' : '启用'}${row.ruleName}`
          }).onOk(() => {
            sceneLinkageRuleApi.updateSceneLinkageRuleBasicsStatus({ id: row.idStr, flag: row.flag ? 0 : 1 }).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'edit':
          sceneLinkageRuleApi.getSceneLinkageRuleBasic(row.idStr).then(response => this.$refs.createDialog.open(response.data));
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.ruleName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sceneLinkageRuleApi.deleteSceneLinkageRuleBasics(row.idStr).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'visible-columns':
          this.visibleColumns = columns;
          break;
      }
    }
  }
};
</script>
