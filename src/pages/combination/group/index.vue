<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '感知对象' }, { label: '分组管理' }]" />
    <iot-header title="分组管理" />
    <div class="layout-content">
      <iot-tree
        :nodes="nodes"
        :default-expanded="defaultExpanded"
        :default-selected="defaultSelected"
        :buttons="[
          { command: 'edit', icon: 'edit', show: node => node.id !== 0 },
          { command: 'create', icon: 'add' },
          { command: 'remove', icon: 'remove', show: node => node.id !== 0 }
        ]"
        @selected="selected"
        @handle="handle"
        filter
      />
      <div class="layout-main" v-if="groupId !== 0">
        <iot-title title="分组基本信息" class="q-mx-md q-mt-md" />
        <q-list class="layout-details" dense>
          <q-item>
            <q-item-section>分组名称：{{ group.name }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>感知对象数量：{{ group.perceivedobjectnumber }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>创建时间：{{ group.createTime }}</q-item-section>
          </q-item>
          <q-item class="full-width">
            <q-item-section>分组描述：{{ group.describe }}</q-item-section>
          </q-item>
        </q-list>
        <iot-title title="感知对象列表" class="q-mx-md q-mt-md" />
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '批量解绑', command: 'batch-unbind', filter: () => true, name: 'batch-unbind' },
            { label: '绑定', command: 'bind' }
          ]"
          :columns="columns"
          @handle="handle"
          @refresh="refresh"
        />
        <iot-table
          :data="data"
          :columns="columns"
          :visible-columns="visibleColumns"
          :pagination="pagination"
          @request="onRequest"
          name="batch-unbind"
          sticky
        >
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增、修改 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 绑定 -->
    <bind-dialog ref="bindDialog" @confirm="refresh" />
  </div>
</template>

<script>
import CreateDialog from './dialogs/create.vue';
import BindDialog from './dialogs/bind.vue';

import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { popconfirm } from '@/utils/framework.js';

export default {
  components: {
    CreateDialog,
    BindDialog
  },
  data() {
    return {
      nodes: [{ id: 0, name: 'ROOT', children: [] }],
      defaultExpanded: [0],
      defaultSelected: 0,
      groupId: '',
      group: {},
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [{ label: '名称', key: 'name', type: 'input' }];
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
          { label: '详情', command: 'details' },
          { label: '解绑', command: 'unbind', color: 'negative' }
        ]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    perceivedApi.getGroupTree().then(response => {
      this.nodes[0].children = response.data;
      if (this.nodes[0].children.length) {
        this.groupId = this.nodes[0].children[0].id;
        this.$router.push({ query: { id: this.groupId } });
        this.defaultSelected = this.groupId;
        this.getGroupInfo();
        this.search();
      }
    });
  },
  methods: {
    getGroupInfo() {
      if (this.groupId !== 0) {
        perceivedApi.getGroupInfo(this.groupId).then(response => (this.group = response.data));
      } else {
        this.group = {};
      }
    },
    selected({ selected }) {
      this.defaultSelected = selected;
      this.groupId = selected;
      this.$router.push({ query: { id: this.groupId } });
      this.getGroupInfo();
      this.search();
    },
    onRequest(pagination) {
      if (this.groupId !== 0) {
        this.$store.commit('loading', true);
        const params = {
          groupId: this.groupId,
          pageNum: pagination.page,
          pageSize: pagination.rowsPerPage,
          ...this.filters
        };
        perceivedApi.getPerceivedobjectByGroupId(params).then(response => {
          this.pagination.page = response.current;
          this.pagination.rowsPerPage = response.size;
          this.pagination.rowsNumber = response.total;
          this.data = response.data;
          this.$store.commit('loading', false);
        });
      }
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      perceivedApi.getGroupTree().then(response => (this.nodes[0].children = response.data));
      this.getGroupInfo();
      this.onRequest(this.pagination);
    },
    handle({ command, node, row, columns, selected }) {
      switch (command) {
        case 'create':
        case 'edit':
          this.$refs.createDialog.open(command, node);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${node.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            perceivedApi.deleteGroup(node.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.selected({ selected: node.pid });
                this.refresh();
              }
            });
          });
          break;
        case 'bind':
          this.$refs.bindDialog.open();
          break;
        case 'details':
          this.$router.push({
            name: 'combination-list-monitor',
            params: {
              id: row.id
            },
            query: {
              tab: 1
            }
          });
          break;
        case 'unbind':
          popconfirm({
            message: `是否解绑${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            perceivedApi.removeToGroup({ groupId: this.groupId, id: row.id }).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '解绑成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'batch-unbind':
          perceivedApi.removeToGroup({ groupId: this.groupId, id: selected.map(e => e.id).join(',') }).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: '解绑成功' });
              this.$store.commit('loading', false);
              this.$store.dispatch('batch/cancel');
              this.refresh();
            }
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
