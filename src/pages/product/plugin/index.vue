<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '解析插件' }]" />
    <iot-header title="解析插件" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '上传jar', command: 'create' }]" @handle="handle" @refresh="refresh" />
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
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';

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
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.fields = [{ label: '协议类型', key: 'type', type: 'select', options: [], props: {} }];
    this.columns = [
      { label: '协议名称', name: 'name', field: 'name', align: 'left' },
      { label: 'jar文件名称', name: 'jarName', field: 'jarName', align: 'left' },
      { label: '协议类型', name: 'type', field: 'type', align: 'left' },
      { label: '协议解析类型', name: 'protocolCodeClass', field: 'protocolCodeClass', align: 'left' },
      { label: '描述', name: 'describe', field: 'describe', align: 'left' },
      { label: '是否自定义', name: 'default', field: 'default', align: 'left', format: val => (val ? '系统默认' : '用户自定义') },
      { label: '创建人', name: 'createBy', field: 'createBy', align: 'left' },
      {
        label: '创建时间',
        name: 'createTime',
        field: 'createTime',
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
          { label: '编辑', command: 'edit', show: row => !row.default },
          { label: '启用', command: 'install', show: row => !row.default && !row.register },
          { label: '禁用', command: 'uninstall', show: row => !row.default && row.register },
          { label: '删除', command: 'remove', show: row => !row.default && !row.register, color: 'negative' }
        ]
      }
    ];

    extendApi.getDateItemBycodes(['agreementType']).then(response => {
      this.fields.find(e => e.key === 'type').options = response.agreementType;
      this.columns.find(e => e.name === 'type').format = val => {
        return response.agreementType.find(e => e.value === val) ? response.agreementType.find(e => e.value === val).label : '-';
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
      protocolApi.getProtocolList(params).then(response => {
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
        case 'install':
        case 'uninstall':
        case 'remove': {
          let fn, text;
          switch (command) {
            case 'remove':
              text = '删除';
              fn = 'removeProtocol';
              break;
            case 'install':
              text = '启用';
              fn = 'installProtocol';
              break;
            case 'uninstall':
              text = '禁用';
              fn = 'uninstallProtocol';
              break;
          }
          popconfirm({
            message: `是否${text}${row.name}`,
            ok: { text }
          }).onOk(() => {
            protocolApi[fn](row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: `${text}成功` });
                this.refresh();
              }
            });
          });
          break;
        }
      }
    }
  }
};
</script>
