<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '告警管理' }, { label: '类型管理' }]" />
    <iot-header title="类型管理" />
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
    this.fields = [
      { label: '告警类型名称', key: 'ruleType', type: 'input' },
      { label: '是否启用', key: 'flag', type: 'select', options: [], props: {} }
    ];
    this.columns = [
      { label: '告警类型名称', name: 'ruleType', field: 'ruleType', align: 'left' },
      { label: '告警类型', name: 'ruleTypeCode', field: 'ruleTypeCode', align: 'left' },
      { label: '类型描述', name: 'ruleTypeDesc', field: 'ruleTypeDesc', align: 'left' },
      { label: '是否启用', name: 'flag', field: 'flag', align: 'left', badge: val => (val ? 'positive' : 'negative') },
      {
        label: '操作',
        name: 'handle',
        align: 'left',
        field: 'handle',
        style: 'width: 10px',
        handles: [
          { label: '修改', command: 'edit' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    extendApi.getDateItemBycodes(['state']).then(response => {
      this.fields.find(e => e.key === 'flag').options = response.state;
      this.columns.find(e => e.name === 'flag').format = val => {
        return response.state.find(e => e.value === val) ? response.state.find(e => e.value === val).label : '-';
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
      alarmRuleTypeApi.QueryAlarmRuleType(params).then(response => {
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
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'edit':
          this.$refs.createDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.ruleType}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            alarmRuleTypeApi.DeleteAlarmRuleType({ Id: row.id }).then(response => {
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
