<template>
  <iot-dialog :visible="visible" :width="1000" title="绑定" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <iot-searchbar :fields="fields" @search="search" />
    <iot-toolbar
      :buttons="[
        {
          label: '批量绑定',
          command: 'batch-bind',
          filter: row => !(row.groupIds && row.groupIds.split(',').includes(this.groupId)),
          name: 'batch-bind'
        }
      ]"
      @handle="handle"
      @refresh="refresh"
    />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" name="batch-bind" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
  </iot-dialog>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { popconfirm } from '@/utils/framework.js';

export default {
  data() {
    return {
      visible: false,
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
      groupId: ''
    };
  },
  mounted() {
    this.fields = [{ label: '名称', key: 'name', type: 'input' }];
    this.columns = [
      { label: '设备名称', name: 'name', field: 'name', align: 'left' },
      { label: '设备SN码', name: 'deviceSn', field: 'deviceSn', align: 'left' },
      { label: '节点类型', name: 'nodeType', field: 'nodeType', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: '详情', command: 'details' },
          { label: '绑定', command: 'bind', show: row => !(row.groupIds && row.groupIds.split(',').includes(this.groupId)) }
        ]
      }
    ];
  },
  methods: {
    open(groupId) {
      this.groupId = String(groupId);
      this.search();
      this.visible = true;
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      devicesApi.getDevicesList(params).then(response => {
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
    handle({ command, row, selected }) {
      switch (command) {
        case 'bind':
          popconfirm({
            message: `是否绑定${row.name}`,
            ok: {
              color: 'positive'
            }
          }).onOk(() => {
            devicesApi.addDeviceGroupCorrelation([{ groupId: this.groupId, deviceId: row.id }]).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '绑定成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'batch-bind':
          devicesApi.addDeviceGroupCorrelation(selected.map(e => ({ groupId: this.groupId, deviceId: e.id }))).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: '绑定成功' });
              this.$store.commit('loading', false);
              this.$store.dispatch('batch/cancel');
              this.refresh();
            }
          });
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
        case 'cancel':
          this.visible = false;
          this.$emit('confirm');
          break;
      }
    }
  }
};
</script>
