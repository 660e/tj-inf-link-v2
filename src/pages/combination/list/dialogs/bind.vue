<template>
  <iot-dialog :visible="visible" :width="1000" :title="title" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <iot-searchbar :fields="fields" @search="search" />
    <q-select
      v-model="active"
      :options="[
        { label: '已绑定设备', value: 'bind-list' },
        { label: '未绑定设备', value: 'unbind-list' }
      ]"
      @input="input"
      class="q-mx-md q-mt-md"
      style="width: 300px"
      dense
      emit-value
      hide-bottom-space
      map-options
      options-dense
      outlined
    />
    <iot-toolbar :buttons="buttons" @handle="handle" @refresh="refresh" />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" name="batch-unbind-and-batch-bind" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
  </iot-dialog>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { popconfirm } from '@/utils/framework.js';

export default {
  data() {
    return {
      visible: false,
      title: '',
      id: '',
      active: '',
      buttons: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      { label: '名称', key: 'devicename', type: 'input' },
      { label: '设备分组', key: 'groupId', type: 'cascader', nodes: [], value: '', props: { label: 'name', children: 'deviceGroupList' } }
    ];
    this.buttons = [{ label: '批量解绑', command: 'batch-unbind', filter: () => true, name: 'batch-unbind-and-batch-bind' }];
    this.columns = [
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '编码', name: 'sn', field: 'sn', align: 'left' },
      {
        label: '状态',
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
      {
        label: '操作',
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
  },
  methods: {
    open(row) {
      this.title = row.name;
      this.id = row.id;
      const p0 = devicesApi.getGroups();
      const p1 = extendApi.getDateItemBycodes(['onlineStatus']);
      Promise.all([p0, p1]).then(response => {
        if (!this.bind) {
          this.fields.find(e => e.key === 'groupId').nodes = response[0].data;
        }
        this.columns.find(e => e.name === 'onlineStatus').format = val => {
          return response[1].onlineStatus.find(e => e.value === val) ? response[1].onlineStatus.find(e => e.value === val).label : '-';
        };
        this.input(row.devicenumber === null || row.devicenumber === '0' ? 'unbind-list' : 'bind-list');
        this.visible = true;
      });
    },
    input(value) {
      this.handle({ command: value });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        id: this.id,
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      perceivedApi[this.active === 'bind-list' ? 'getdevicelist' : 'getUnboundDevices'](params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsNumber = response.total;
        this.data = response.data.map(e => {
          return {
            id: e.ID,
            sn: e.DEVICE_SN,
            name: e.NAME,
            label: e.LABEL,
            onlineStatus: e.ONLINE_STATUS
          };
        });
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
        case 'bind-list':
          this.active = command;
          this.columns.find(e => e.name === 'handle').handles[1] = { label: '解绑', command: 'unbind', color: 'negative' };
          this.buttons = [{ label: '批量解绑', command: 'batch-unbind', filter: () => true, name: 'batch-unbind-and-batch-bind' }];
          this.search();
          break;
        case 'unbind-list': {
          this.active = command;
          this.columns.find(e => e.name === 'handle').handles[1] = { label: '绑定', command: 'bind' };
          this.buttons = [{ label: '批量绑定', command: 'batch-bind', filter: () => true, name: 'batch-unbind-and-batch-bind' }];
          this.search();
          break;
        }
        case 'batch-bind':
        case 'batch-unbind': {
          let batch;
          switch (command) {
            case 'batch-bind':
              batch = perceivedApi.bind;
              break;
            case 'batch-unbind':
              batch = perceivedApi.unbind;
              break;
          }
          batch({ [this.id]: selected.map(e => e.id) }).then(response => {
            if (response) {
              this.$q.notify({
                type: response.httpCode === 200 ? 'positive' : 'negative',
                message: `批量处理${response.httpCode === 200 ? '成功' : '失败'}`
              });
              this.$store.commit('loading', false);
              this.$store.dispatch('batch/cancel');
              this.refresh();
            }
          });
          break;
        }
        case 'bind':
        case 'unbind':
          popconfirm({
            message: `是否${command === 'bind' ? '绑定' : '解绑'}${row.name}`,
            ok: {
              color: command === 'bind' ? 'positive' : 'negative'
            }
          }).onOk(() => {
            perceivedApi[command]({ [this.id]: [row.id] }).then(response => {
              if (response) {
                this.$q.notify({
                  type: response.httpCode === 200 ? 'positive' : 'negative',
                  message: `${command === 'bind' ? '绑定' : '解绑'}${response.httpCode === 200 ? '成功' : '失败'}`
                });
                this.refresh();
              }
            });
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
              from: 'combination-list'
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
