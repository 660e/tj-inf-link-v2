<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '感知对象' }, { label: '感知对象列表' }]" />
    <iot-header title="感知对象列表" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '新增', command: 'create' },
            { label: '导入', command: 'import' },
            { label: '导出', command: 'export' }
          ]"
          :columns="columns"
          @handle="handle"
          @refresh="refresh"
        />
        <iot-table :data="data" :columns="columns" :visible-columns="visibleColumns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 导入 -->
    <import-dialog ref="importDialog" @confirm="refresh" />
    <!-- 绑定 -->
    <bind-dialog ref="bindDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { popconfirm } from '@/utils/framework.js';
import { exportFile } from '@/utils/data.js';

import CreateDialog from './dialogs/create.vue';
import ImportDialog from './dialogs/import.vue';
import BindDialog from './dialogs/bind.vue';

export default {
  name: 'combination-list',
  components: { CreateDialog, ImportDialog, BindDialog },
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
    // 引导窗跳转
    if (this.$route.params.create === 'create') {
      this.$refs.createDialog.open();
    }
    this.fields = [
      { label: '名称', key: 'name', type: 'input' },
      { label: '序列号', key: 'number', type: 'input' },
      { label: '安装位置', key: 'position', type: 'input' },
      { label: '日期范围', key: 'date-range', type: 'date-range', value: [], props: { start: 'starttime', end: 'endtime' } },
      { label: '生产厂商', key: 'manufacyuer', type: 'input' }
    ];
    this.columns = [
      { label: '名称', required: true, name: 'name', field: 'name', align: 'left' },
      { label: '序列号', name: 'number', field: 'number', align: 'left' },
      { label: '安装位置', name: 'position', field: 'position', align: 'left' },
      { label: '生产厂商', name: 'manufacyuer', field: 'manufacyuer', align: 'left' },
      { label: '创建时间', name: 'creationtime', field: 'creationtime', align: 'left' },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: row => `已绑定(${row.devicenumber})`, command: 'bind-1', show: row => Number(row.devicenumber) },
          { label: '未绑定', command: 'bind-2', show: row => !Number(row.devicenumber) },
          { label: '监控', command: 'monitor' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
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
      perceivedApi.getPerceived(params).then(response => {
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
    refresh(row) {
      this.onRequest(this.pagination);
      if (row) {
        this.handle({ command: 'bind-2', row });
      }
    },
    handle({ command, row, columns }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'import':
          this.$refs.importDialog.open();
          break;
        case 'export':
          perceivedApi.export(this.filters).then(response => exportFile(response, '感知对象列表.xlsx'));
          break;
        case 'bind-1':
          this.$refs.bindDialog.open(row);
          break;
        case 'bind-2':
          this.$refs.bindDialog.open(row);
          break;
        case 'monitor':
          this.$router.push({ name: 'combination-list-monitor', params: { id: row.id }, query: { tab: 1 } });
          break;
        case 'remove':
          popconfirm({ message: `是否删除${row.name}`, ok: { color: 'negative' } }).onOk(() => {
            perceivedApi.deletePerceived([row.id]).then(response => {
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
