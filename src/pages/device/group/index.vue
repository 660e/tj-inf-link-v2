<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '设备管理' }, { label: '分组管理' }]" />
    <iot-header title="分组管理" />
    <div class="layout-content">
      <iot-tree
        :nodes="nodes"
        :default-expanded="defaultExpanded"
        :default-selected="defaultSelected"
        :buttons="[
          { command: 'edit', icon: 'edit', show: node => node.id !== -1 },
          { command: 'create', icon: 'add' },
          { command: 'remove', icon: 'remove', show: node => node.id !== -1 }
        ]"
        @selected="selected"
        @handle="handle"
        children-key="deviceGroupList"
        filter
      />
      <div class="layout-main" v-if="groupId !== -1">
        <iot-title title="分组基本信息" class="q-mx-md q-mt-md" />
        <q-list class="layout-details" dense>
          <q-item>
            <q-item-section>分组名称：{{ group.name }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>设备总数：{{ group.deviceCount }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>启用设备数：{{ group.activatedDeviceCount }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>创建时间：{{ group.createTime }}</q-item-section>
          </q-item>
          <q-item class="full-width">
            <q-item-section>分组描述：{{ group.describe }}</q-item-section>
          </q-item>
        </q-list>
        <iot-title title="设备列表" class="q-mx-md q-mt-md" />
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

import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { popconfirm } from '@/utils/framework.js';

export default {
  name: 'device-group',
  components: {
    CreateDialog,
    BindDialog
  },
  data() {
    return {
      nodes: [{ id: -1, name: 'ROOT', deviceGroupList: [], pidPath: '' }],
      defaultExpanded: [-1],
      defaultSelected: -1,
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
      { label: '设备名称', required: true, name: 'name', field: 'name', align: 'left' },
      { label: '设备SN码', name: 'deviceSn', field: 'deviceSn', align: 'left' },
      { label: '节点类型', name: 'nodeType', field: 'nodeType', align: 'left' },
      {
        label: '设备状态',
        name: 'onlineStatus',
        field: 'onlineStatus',
        align: 'left',
        badge: val => {
          switch (val) {
            case 0:
              return 'negative';
            case 1:
              return 'positive';
            case 2:
              return 'grey';
          }
        }
      },
      { label: '最近上线时间', name: 'createTime', field: 'createTime', align: 'left' },
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
    const p0 = extendApi.getDateItemBycodes(['onlineStatus']);
    const p1 = devicesApi.getDeviceGroupInfoTreeList({ rootNodeId: -1 });
    Promise.all([p0, p1]).then(response => {
      this.columns.find(e => e.name === 'onlineStatus').format = val => {
        return response[0].onlineStatus.find(e => e.value === val) ? response[0].onlineStatus.find(e => e.value === val).label : '-';
      };
      this.nodes[0].deviceGroupList = response[1].data;
      if (this.nodes[0].deviceGroupList.length) {
        this.groupId = this.nodes[0].deviceGroupList[0].id;
        this.defaultSelected = this.groupId;
        this.getDeviceGroupObject();
        this.search();
      }
    });
  },
  methods: {
    getDeviceGroupObject() {
      if (this.groupId !== -1) {
        devicesApi.getDeviceGroupObject(this.groupId).then(response => (this.group = response.data));
      } else {
        this.group = {};
      }
    },
    selected({ selected }) {
      this.defaultSelected = selected;
      this.groupId = selected;
      this.getDeviceGroupObject();
      this.search();
    },
    onRequest(pagination) {
      if (this.groupId !== -1) {
        this.$store.commit('loading', true);
        const params = {
          groupId: this.groupId,
          pageNum: pagination.page,
          pageSize: pagination.rowsPerPage,
          ...this.filters
        };
        devicesApi.getDeviceGroupDeviceList(params).then(response => {
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
      devicesApi.getDeviceGroupInfoTreeList({ rootNodeId: -1 }).then(response => (this.nodes[0].deviceGroupList = response.data));
      this.getDeviceGroupObject();
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
            devicesApi.deleteDeviceGroup(node.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.selected({ selected: node.pid });
                this.refresh();
              }
            });
          });
          break;
        case 'bind':
          this.$refs.bindDialog.open(this.groupId);
          break;
        case 'details':
          this.$router.push({
            name: 'device-list-details',
            params: {
              id: row.id
            },
            query: {
              type: 'config',
              label: row.label,
              tab: 1,
              from: 'device-group'
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
            devicesApi.deleteDeviceGroupCorrelationBatch([{ groupId: this.groupId, deviceId: row.id }]).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '解绑成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'batch-unbind':
          devicesApi.deleteDeviceGroupCorrelationBatch(selected.map(e => ({ groupId: this.groupId, deviceId: e.id }))).then(response => {
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
