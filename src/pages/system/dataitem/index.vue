<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="数据字典" />
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
  name: 'system-dataitem',
  components: {
    CreateDialog
  },
  data() {
    return {
      breadcrumbs: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '系统管理' }, { label: '数据字典' }];
    this.fields = [
      { label: '名称', key: 'name', type: 'input' },
      { label: '规则码', key: 'code', type: 'input' }
    ];
    this.columns = [
      { label: '排序号', name: 'codeIndex', field: 'codeIndex', style: 'width: 70px' },
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '规则码', name: 'code', field: 'code', align: 'left' },
      { label: '备注', name: 'remark', field: 'remark', align: 'left', style: 'width: 600px', classes: 'ellipsis' },
      {
        label: '状态',
        name: 'state',
        field: 'state',
        align: 'left',
        badge: val => {
          switch (val) {
            case '0':
              return 'negative';
            case '1':
              return 'positive';
          }
        }
      },
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
          { label: '修改', command: 'edit' },
          { label: '维护', command: 'config' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    extendApi.getDateItemByParentcode({ code: 'state' }).then(response => {
      this.columns.find(e => e.name === 'state').format = val => {
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
        sorts: [{ fieldName: 'codeIndex', direction: 'asc' }],
        filters: {
          parentId: -1,
          ...this.filters
        }
      };
      sysApi.queryDataitemAlldata(params).then(response => {
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
          this.$refs.createDialog.open(null, -1);
          break;
        case 'edit':
          this.$refs.createDialog.open(row);
          break;
        case 'config':
          this.$router.push({
            name: 'system-dataitem-config',
            params: {
              id: row.id
            },
            query: {
              name: row.name
            }
          });
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeDataitem(row.id).then(response => {
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
