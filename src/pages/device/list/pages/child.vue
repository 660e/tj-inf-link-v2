<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '设备管理' }, { label: '设备列表', name: 'device-list' }, { label: '子设备' }]" />
    <iot-header :title="device.name" @back="back" back />
    <details-header :device="device" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar v-if="!$route.query.productId" :fields="fields.filter(e => e.type)" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '新增', command: 'create' },
            { label: '导出', command: 'export' },
            [
              { label: '批量同步', command: 'batch-sync', filter: row => Number(row.productVersion) > Number(row.version), name: 'device-list' },
              { label: '批量删除', command: 'batch-remove', filter: row => !row.useStatus && row.childDeviceNum === 0, name: 'device-list' },
              { label: '批量启用', command: 'batch-enable', filter: row => row.releaseStatus === 1 && !row.useStatus, name: 'device-list' },
              { label: '批量禁用', command: 'batch-disable', filter: row => row.releaseStatus === 1 && row.useStatus, name: 'device-list' }
            ]
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
          name="device-list"
          sticky
        >
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
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import { exportFile } from '@/utils/data.js';

import DetailsHeader from './details-header.vue';
import CreateDialog from '../dialogs/create.vue';

export default {
  name: 'device-list-child',
  components: {
    DetailsHeader,
    CreateDialog
  },
  data() {
    return {
      id: Number(this.$route.params.id),
      device: {},
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      { label: '设备名称', key: 'name', type: 'input' },
      { label: '设备SN码', key: 'deviceSn', type: 'input' },
      {
        label: '是否启用',
        key: 'useStatus',
        type: 'select',
        options: [],
        props: {},
        input: value => {
          switch (value) {
            case 0:
              this.fields.find(e => e.key === 'onlineStatus1').type = null;
              this.fields.find(e => e.key === 'onlineStatus2').type = null;
              break;
            case 1:
              this.fields.find(e => e.key === 'onlineStatus1').type = 'select';
              this.fields.find(e => e.key === 'onlineStatus2').type = null;
              break;
            case null:
              this.fields.find(e => e.key === 'onlineStatus1').type = null;
              this.fields.find(e => e.key === 'onlineStatus2').type = 'select';
              break;
          }
        }
      },
      {
        label: '是否在线',
        key: 'onlineStatus1',
        type: null,
        options: [
          { label: '离线', value: 0 },
          { label: '在线', value: 1 }
        ],
        props: {}
      },
      {
        label: '是否在线',
        key: 'onlineStatus2',
        type: 'select',
        options: [
          { label: '离线', value: 0 },
          { label: '在线', value: 1 },
          { label: '未启用', value: 2 }
        ],
        props: {}
      }
    ];
    this.columns = [
      { label: '设备名称', required: true, name: 'name', field: 'name', align: 'left' },
      { label: '设备SN码', name: 'deviceSn', field: 'deviceSn', align: 'left' },
      {
        label: '所属产品',
        name: 'productName',
        field: 'productName',
        align: 'left',
        event: row => {
          this.$router.push({
            name: 'product-list-details',
            params: {
              id: row.productId
            },
            query: {
              tab: 1,
              protocolId: row.protocolId,
              protocolType: row.agreementType,
              from: 'device-list-child',
              pid: this.id
            }
          });
        }
      },
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
      { label: '协议类型', name: 'accessModeAndProtocol', field: 'accessModeAndProtocol', align: 'left' },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: '配置', command: 'config' },
          { label: '监控', command: 'monitor' },
          {
            label: '启用',
            command: 'enable',
            show: row => !row.useStatus,
            disable: row => row.releaseStatus === 0,
            tooltip: '当前设备所属产品未发布'
          },
          { label: '禁用', command: 'disable', show: row => row.useStatus },
          [
            {
              label: '同步',
              command: 'sync',
              disable: row => !(Number(row.productVersion) > Number(row.version)),
              tooltip: '当前设备版本与引用产品版本一致'
            },
            {
              label: '删除',
              command: 'remove',
              color: 'negative',
              disable: row => !(!row.useStatus && row.childDeviceNum === 0),
              tooltip: '当前设备已启用或网关/系统下含有子设备'
            }
          ]
        ]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    const p0 = extendApi.getDateItemBycodes(['onlineStatus', 'state']);
    const p1 = devicesApi.getDevice(this.id);
    Promise.all([p0, p1]).then(response => {
      // onlineStatus
      this.columns.find(e => e.name === 'onlineStatus').format = val => {
        return response[0].onlineStatus.find(e => e.value === val) ? response[0].onlineStatus.find(e => e.value === val).label : '-';
      };
      // useStatus
      this.fields.find(e => e.key === 'useStatus').options = response[0].state;

      this.device = response[1].data;
      this.onRequest(this.pagination);
    });
  },
  methods: {
    back() {
      this.$router.push({
        name: 'device-list',
        query: {
          productId: this.$route.query.productId
        }
      });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        roleId: this.$q.sessionStorage.getItem('account').login.role,
        pid: this.id,
        ...this.filters
      };
      devicesApi.getDevicesChildren(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;

      if (this.filters.useStatus === 1) {
        this.filters.onlineStatus = filters.onlineStatus1;
      } else if (this.filters.useStatus === null || this.filters.useStatus === undefined) {
        this.filters.onlineStatus = filters.onlineStatus2;
      }
      this.filters.onlineStatus1 = null;
      this.filters.onlineStatus2 = null;

      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row, columns, selected }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open({ productId: this.device.productId, pid: this.id });
          break;
        case 'export':
          devicesApi.exportDevices({ ...this.filters, pid: this.id, nodeType: 2 }).then(response => exportFile(response, '子设备列表.xlsx'));
          break;
        case 'config':
        case 'monitor':
          this.$router.push({
            name: 'device-list-details',
            params: {
              id: row.id
            },
            query: {
              pid: this.id,
              type: command,
              label: row.label,
              tab: 1,
              productId: this.$route.query.productId,
              from: 'device-list-child'
            }
          });
          break;
        case 'enable':
        case 'disable':
          popconfirm({
            message: `是否${command === 'enable' ? '启用' : '禁用'}${row.name}`,
            ok: {
              color: command === 'enable' ? 'positive' : 'negative'
            }
          }).onOk(() => {
            devicesApi[command === 'enable' ? 'enableDevices' : 'unenableDevices'](row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'sync':
          popconfirm({ message: `是否同步${row.name}` }).onOk(() => {
            devicesApi.updateDeviceVersion(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '同步成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            devicesApi.removeDevice(row.id).then(response => {
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
        case 'batch-sync':
        case 'batch-remove':
        case 'batch-enable':
        case 'batch-disable': {
          let batch;
          switch (command) {
            case 'batch-sync':
              batch = devicesApi.batchUpdateDeviceVersion;
              break;
            case 'batch-remove':
              batch = devicesApi.batchDelDevice;
              break;
            case 'batch-enable':
              batch = devicesApi.batchEnable;
              break;
            case 'batch-disable':
              batch = devicesApi.batchUnEnable;
              break;
          }
          batch(selected.map(e => e.id)).then(response => {
            if (response) {
              this.$q.notify({ type: response.data ? 'positive' : 'negative', message: `批量处理${response.data ? '成功' : '失败'}` });
              this.$store.commit('loading', false);
              this.$store.dispatch('batch/cancel');
              this.refresh();
            }
          });
          break;
        }
      }
    }
  }
};
</script>
