<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="资源空间管理" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <div class="q-mx-md q-mt-md flex justify-between">
          <q-btn @click="handle({ command: 'create' })" label="新增" />
          <q-btn @click="refresh" label="刷新" />
        </div>
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增、修改 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 用户权限 -->
    <user-dialog ref="userDialog" />
  </div>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { popconfirm } from '@/utils/framework.js';
import CreateDialog from './dialogs/create.vue';
import UserDialog from './dialogs/user.vue';

export default {
  components: { CreateDialog, UserDialog },
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
    this.breadcrumbs = [{ label: '系统管理' }, { label: '资源空间管理' }];
    this.fields = [{ label: '名称', key: 'resSpaceName', type: 'input' }];
    this.columns = [
      { label: '名称', name: 'resSpaceName', field: 'resSpaceName', align: 'left' },
      { label: '描述', name: 'resSpaceDescription', field: 'resSpaceDescription', align: 'left' },
      {
        label: '创建时间',
        name: 'createdDate',
        field: 'createdDate',
        align: 'left',
        format: val => (val ? val.slice(0, 19).replace('T', ' ') : '-')
      },
      {
        label: '修改时间',
        name: 'modifiedDate',
        field: 'modifiedDate',
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
          { label: '删除', command: 'remove', color: 'negative' },
          { label: '用户权限', command: 'user' }
        ]
      }
    ];
    this.search();
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: '', direction: 'asc' }],
        filters: this.filters
      };
      sysApi.queryResspaceAlldata(params).then(response => {
        this.pagination.page = response.page;
        this.pagination.rowsPerPage = response.pageSize;
        this.pagination.rowsNumber = response.total;
        this.data = response.list;
        this.$store.commit('loading', false);
      });
    },
    search(filters = {}) {
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
            message: `是否删除${row.tenantName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeResspace(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'user':
          this.$refs.userDialog.open(row);
          break;
      }
    }
  }
};
</script>
