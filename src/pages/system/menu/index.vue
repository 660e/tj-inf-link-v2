<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="菜单管理" />
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
    <!-- 新增、修改 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import CreateDialog from './dialogs/create.vue';

export default {
  components: { CreateDialog },
  data() {
    return {
      breadcrumbs: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '系统管理' }, { label: '菜单管理' }];
    this.fields = [
      { label: '名称', key: 'menuName', type: 'input' },
      { label: '类型', key: 'menuDesc', type: 'select', options: [], props: { label: 'name', value: 'code' } }
    ];
    this.columns = [
      { label: '排序号', name: 'menuIndex', field: 'menuIndex', style: 'width: 70px' },
      { label: '名称', name: 'menuName', field: 'menuName', align: 'left' },
      { label: '类型', name: 'menuDesc', field: 'menuDesc', align: 'left' },
      { label: '图标', name: 'smallIconPath', field: 'smallIconPath', align: 'left' },
      { label: '路径', name: 'menuUrl', field: 'menuUrl', align: 'left' },
      {
        label: '创建时间',
        name: 'createdDate',
        field: 'createdDate',
        align: 'left',
        format: val => (val ? val.slice(0, 19).replace('T', ' ') : '-')
      },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          {
            label: '修改',
            command: 'edit',
            disable: row => row.customType === 1,
            tooltip: '系统内置菜单'
          },
          {
            label: '删除',
            command: 'remove',
            color: 'negative',
            disable: row => row.customType === 1,
            tooltip: '系统内置菜单'
          }
        ]
      }
    ];
    extendApi.getDateItemByParentcode({ code: 'menuDesc' }).then(response => {
      this.fields.find(e => e.key === 'menuDesc').options = response;
      this.columns.find(e => e.name === 'menuDesc').format = val => {
        return response.find(e => e.code === val) ? response.find(e => e.code === val).name : '-';
      };
      this.search();
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: 'menuIndex', direction: 'asc' }],
        filters: this.filters
      };
      sysApi.queryMenuAlldata(params).then(response => {
        this.pagination.page = response.page;
        this.pagination.rowsPerPage = response.pageSize;
        this.pagination.rowsNumber = response.total;
        this.data = response.list;
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
            message: `是否删除${row.menuName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeMenu(row.id).then(response => {
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
