<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="详情" dense>
    <div class="layout-container">
      <q-list class="layout-details" dense>
        <q-item>
          <q-item-section>
            <span>名称：{{ device.name }}</span>
            <q-tooltip>{{ device.name }}</q-tooltip>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <span>序列号：{{ device.code }}</span>
            <q-tooltip>{{ device.code }}</q-tooltip>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>联动产品：{{ device.linkageProductName }}</q-item-section>
        </q-item>
      </q-list>
      <iot-toolbar :buttons="[{ label: '解绑', command: 'unbind' }]" @handle="handle" @refresh="refresh" />
      <iot-table
        :data="data"
        :selected="selected"
        :columns="columns"
        :pagination="pagination"
        @request="onRequest"
        @selected="onSelected"
        selection="multiple"
        title="已绑定设备列表"
        sticky
      >
        <template v-slot:handle="{ props }">
          <iot-table-handle :props="props" @handle="handle" />
        </template>
      </iot-table>
    </div>
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { linkageDevicesApi } from '@/api/wsat-service-device/linkage-devices.js';
import { popconfirm } from '@/utils/framework.js';
export default {
  data() {
    return {
      visible: false,
      device: {},
      data: [],
      selected: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 0,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.columns = [
      { label: '标签', name: 'label', field: 'label', align: 'left' },
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '位置坐标', name: 'location', field: 'location', align: 'left' },
      { label: '产品名称', name: 'productName', field: 'productName', align: 'left' },
      { label: '产品ID', name: 'productId', field: 'productId', align: 'left' },
      { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
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
    extendApi.getDateItemByParentcode({ code: 'agreementType' }).then(response => {
      this.columns.find(e => e.name === 'agreementType').format = val => {
        return response.find(e => Number(e.code) === val) ? response.find(e => Number(e.code) === val).name : '-';
      };
    });
  },
  methods: {
    open(row) {
      this.device = extend(true, {}, row);
      this.onRequest();
      this.visible = true;
    },
    onRequest() {
      this.$store.commit('loading', true);
      linkageDevicesApi.linkageDeviceDetail(this.device.id).then(response => {
        this.data = response.data.bindDevices;
        this.pagination.rowsNumber = this.data.length;
        this.$store.commit('loading', false);
      });
    },
    onSelected(selected) {
      this.selected = selected;
    },
    refresh() {
      this.onRequest();
    },
    handle({ command, row }) {
      switch (command) {
        case 'details':
          this.$router.push({
            name: 'device-list-details',
            params: {
              id: row.id
            },
            query: {
              type: 'config',
              label: row.label,
              tab: 1
            }
          });
          break;
        case 'unbind':
          if (this.selected.length) {
            popconfirm({
              message: `是否解绑${this.selected.map(e => e.name).join('；')}`,
              ok: {
                color: 'negative'
              }
            }).onOk(() => {
              linkageDevicesApi
                .unboundLinkageDevice({
                  deviceIds: this.selected.map(e => e.id),
                  linkageDeviceId: this.device.id
                })
                .then(response => {
                  if (response) {
                    this.$q.notify({ type: 'positive', message: '解绑成功' });
                    this.refresh();
                  }
                });
            });
          }
          break;
        case 'cancel':
          this.visible = false;
          this.$store.commit('loading', false);
          this.pagination.rowsNumber = 0;
          this.$emit('confirm');
          break;
      }
    }
  }
};
</script>
