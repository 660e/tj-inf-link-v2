<template>
  <div class="col column">
    <iot-title title="绑定/解绑感知对象" class="q-px-md q-pt-md" />
    <iot-searchbar :fields="fields" @search="search" />
    <q-select
      v-model="active"
      :options="[
        { label: '已绑定设备', value: 'bind-list' },
        { label: '未绑定设备', value: 'unbind-list' }
      ]"
      @input="input"
      class="q-mx-md q-mt-md"
      style="width: 200px"
      dense
      emit-value
      hide-bottom-space
      map-options
      options-dense
      outlined
    />
    <iot-toolbar :buttons="buttons" @handle="handle" @refresh="refresh" />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" name="batch-unbind" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
  </div>
</template>

<script>
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { popconfirm } from '@/utils/framework.js';
import { objectToLowerCase } from '@/utils/data.js';

export default {
  data() {
    return {
      id: this.$route.params.id,
      active: 'bind-list',
      fields: [],
      buttons: [],
      filters: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      { label: '名称', key: 'name', type: 'input' },
      { label: '序列号', key: 'number', type: 'input' },
      { label: '安装位置', key: 'position', type: 'input' },
      { label: '日期范围', key: 'date-range', type: 'date-range', value: [], props: { start: 'starttime', end: 'endtime' } },
      { label: '生产厂商', key: 'manufacyuer', type: 'input' }
    ];
    this.buttons = [{ label: '批量解绑', command: 'batch-unbind', filter: () => true, name: 'batch-unbind' }];
    this.columns = [
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '序列号', name: 'number', field: 'number', align: 'left' },
      { label: '安装位置', name: 'position', field: 'position', align: 'left' },
      { label: '生产厂商', name: 'manufacyuer', field: 'manufacyuer', align: 'left' },
      { label: '创建时间', name: 'creationtime', field: 'creationtime', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [{ label: '解绑', command: 'unbind', color: 'negative' }]
      }
    ];
    this.search();
  },
  methods: {
    input(value) {
      this.handle({ command: value });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        deviceId: this.id,
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      perceivedApi[this.active === 'bind-list' ? 'getAllByDeviceId' : 'getPerceived'](params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsNumber = response.total;
        this.data = response.data.map(e => objectToLowerCase(e));
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
          this.columns.find(e => e.name === 'handle').handles[0] = { label: '解绑', command: 'unbind', color: 'negative' };
          this.buttons = [{ label: '批量解绑', command: 'batch-unbind', filter: () => true, name: 'batch-unbind' }];
          this.search();
          break;
        case 'unbind-list': {
          this.active = command;
          this.columns.find(e => e.name === 'handle').handles[0] = { label: '绑定', command: 'bind' };
          this.buttons = [{ label: '批量绑定', command: 'batch-bind', filter: () => true, name: 'batch-unbind' }];
          this.search();
          break;
        }
        case 'batch-bind':
        case 'batch-unbind': {
          let batch;
          switch (command) {
            case 'batch-bind':
              batch = perceivedApi.devicebinding;
              break;
            case 'batch-unbind':
              batch = perceivedApi.deviceUnbind;
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
        case 'unbind': {
          let batch;
          switch (command) {
            case 'bind':
              batch = perceivedApi.devicebinding;
              break;
            case 'unbind':
              batch = perceivedApi.deviceUnbind;
              break;
          }
          popconfirm({
            message: `是否${command === 'bind' ? '绑定' : '解绑'}`,
            ok: {
              color: command === 'bind' ? 'positive' : 'negative'
            }
          }).onOk(() => {
            batch({ [this.id]: [row.id] }).then(response => {
              if (response) {
                this.$q.notify({
                  type: response.httpCode === 200 ? 'positive' : 'negative',
                  message: `${command === 'bind' ? '绑定' : '解绑'}${response.httpCode === 200 ? '成功' : '失败'}`
                });
                this.$store.commit('loading', false);
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
