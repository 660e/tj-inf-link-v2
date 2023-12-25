<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '系统管理' }, { label: '用户管理' }]" />
    <iot-header title="用户管理" />
    <div class="layout-content">
      <iot-tree
        :nodes="nodes"
        :default-expanded="defaultExpanded"
        :default-selected="defaultSelected"
        @selected="selected"
        label-key="deptName"
        filter
      />
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '新增', command: 'create' },
            { label: '导入', command: 'import' }
          ]"
          @handle="handle"
          @refresh="refresh"
        />
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增、修改 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 导入 -->
    <import-dialog ref="importDialog" @confirm="refresh" />
    <!-- 维护 -->
    <config-dialog ref="configDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import { flattenTree } from '@/utils/data.js';
import { SessionStorage } from 'quasar';

import CreateDialog from './dialogs/create.vue';
import ImportDialog from './dialogs/import.vue';
import ConfigDialog from './dialogs/config.vue';

export default {
  components: { CreateDialog, ImportDialog, ConfigDialog },
  data() {
    return {
      nodes: [{ id: -1, deptName: 'ROOT', children: [] }],
      defaultExpanded: [-1],
      defaultSelected: -1,
      deptId: '',
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [{ label: '姓名', key: 'userName', type: 'input' }];
    this.columns = [
      { label: '账号', name: 'loginName', field: 'loginName', align: 'left' },
      { label: '姓名', name: 'userName', field: 'userName', align: 'left' },
      { label: '部门', name: 'nickname', field: 'nickname', align: 'left' },
      { label: '手机号', name: 'phoneNum', field: 'phoneNum', align: 'left' },
      { label: '邮箱', name: 'email', field: 'email', align: 'left' },
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
          {
            label: '删除',
            command: 'remove',
            color: 'negative',
            show: row => {
              return row.loginName !== 'sys_admin' && row.loginName !== SessionStorage.getItem('account').login.name;
            }
          }
        ]
      }
    ];
    extendApi.getDateItemByParentcode({ code: 'state' }).then(response => {
      this.columns.find(e => e.name === 'state').format = val => {
        return response.find(e => e.code === val) ? response.find(e => e.code === val).name : '-';
      };
      this.getDeptTree();
      this.search();
    });
  },
  methods: {
    selected({ selected }) {
      this.deptId = selected || '';
      this.fields.forEach(e => (e.value = ''));
      this.search();
    },
    getDeptTree() {
      sysApi.getDeptTree().then(response => {
        flattenTree(response).forEach(e => (e.disabled = e.deptState === '0'));
        this.nodes[0].children = response;
      });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: 'userIndex', direction: 'asc' }],
        filters: {
          userName: (this.filters && this.filters.userName) || '',
          state: '',
          deptId: this.deptId === -1 ? '' : this.deptId
        }
      };
      extendApi.getUser(params).then(response => {
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
      this.getDeptTree();
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
        case 'import':
          this.$refs.importDialog.open();
          break;
        case 'config':
          this.$refs.configDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.loginName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeUser(row.id).then(response => {
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
