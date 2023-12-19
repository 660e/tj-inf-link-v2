<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="机构管理" />
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
  components: {
    CreateDialog
  },
  data() {
    return {
      breadcrumbs: [],
      nodes: [
        {
          id: -1,
          deptName: 'ROOT',
          children: []
        }
      ],
      defaultExpanded: [-1],
      defaultSelected: -1,
      parentId: '',
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
    this.breadcrumbs = [{ label: '系统管理' }, { label: '机构管理' }];
    this.fields = [
      {
        label: '名称',
        key: 'deptName',
        type: 'input'
      }
    ];
    this.columns = [
      {
        label: '排序号',
        name: 'deptIndex',
        field: 'deptIndex',
        style: 'width: 70px'
      },
      {
        label: '名称',
        name: 'deptName',
        field: 'deptName',
        align: 'left'
      },
      {
        label: '类型',
        name: 'deptType',
        field: 'deptType',
        align: 'left'
      },
      {
        label: '状态',
        name: 'deptState',
        field: 'deptState',
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
          {
            label: '修改',
            command: 'edit'
          },
          {
            label: '删除',
            command: 'remove',
            color: 'negative',
            show: row => (row.id === this.parentId ? false : true)
          }
        ]
      }
    ];
    extendApi.getDateItemByParentcode({ code: 'state' }).then(response => {
      this.columns.find(e => e.name === 'deptState').format = val => {
        return response.find(e => e.code === val) ? response.find(e => e.code === val).name : '-';
      };
      this.getDeptTree();
      this.onRequest(this.pagination);
    });
  },
  methods: {
    selected({ selected }) {
      this.parentId = selected || '';
      this.fields.forEach(e => (e.value = ''));
      this.search();
    },
    getDeptTree() {
      sysApi.getDeptTree().then(response => (this.nodes[0].children = response));
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        sorts: [{ fieldName: 'deptIndex', direction: 'asc' }],
        filters: {
          deptName: (this.filters && this.filters.deptName) || '',
          deptState: '',
          parentId: this.parentId === -1 ? '' : this.parentId
        }
      };
      extendApi.getDept(params).then(response => {
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
        case 'remove':
          popconfirm({
            message: `是否删除${row.deptName}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            sysApi.removeDept(row.id).then(response => {
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
