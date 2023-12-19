<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="权限管理" />
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
    <!-- 用户权限 -->
    <user-dialog ref="userDialog" />
    <!-- 菜单权限 -->
    <menu-dialog ref="menuDialog" />
    <!-- 设备权限 -->
    <device-dialog ref="deviceDialog" />
    <!-- 属性权限 -->
    <property-dialog ref="propertyDialog" />
  </div>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { popconfirm } from '@/utils/framework.js';
import CreateDialog from './dialogs/create.vue';
import UserDialog from './dialogs/user.vue';
import MenuDialog from './dialogs/menu.vue';
import DeviceDialog from './dialogs/device.vue';
import PropertyDialog from './dialogs/property.vue';
export default {
  components: {
    CreateDialog,
    UserDialog,
    MenuDialog,
    DeviceDialog,
    PropertyDialog
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
    this.breadcrumbs = [{ label: '系统管理' }, { label: '权限管理' }];
    this.fields = [
      {
        label: '名称',
        key: 'roleName',
        type: 'input'
      }
    ];
    this.columns = [
      {
        label: '排序号',
        name: 'roleIndex',
        field: 'roleIndex',
        style: 'width: 70px'
      },
      {
        label: '名称',
        name: 'roleName',
        field: 'roleName',
        align: 'left'
      },
      {
        label: '备注',
        name: 'remark',
        field: 'remark',
        align: 'left',
        style: 'width: 300px',
        classes: 'ellipsis'
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
          {
            label: '修改',
            command: 'edit'
          },
          {
            label: '删除',
            command: 'remove',
            color: 'negative'
          },
          [
            {
              label: '用户权限',
              command: 'user'
            },
            {
              label: '菜单权限',
              command: 'menu'
            },
            {
              label: '设备权限',
              command: 'device'
            },
            {
              label: '属性权限',
              command: 'property'
            }
          ]
        ]
      }
    ];
    this.onRequest(this.pagination);
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: 'roleIndex', direction: 'asc' }],
        filters: this.filters
      };
      sysApi.getRole(params).then(response => {
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
            message: `是否删除${row.roleName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeRole(row.id).then(response => {
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
        case 'menu':
          this.$refs.menuDialog.open(row);
          break;
        case 'device':
          this.$refs.deviceDialog.open(row);
          break;
        case 'property':
          this.$refs.propertyDialog.open(row);
          break;
      }
    }
  }
};
</script>
