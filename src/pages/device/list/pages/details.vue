<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '设备管理' }, { label: '设备列表', name: 'device-list' }, { label: '详情' }]" />
    <iot-header
      :title="device.name"
      :buttons="[
        [{ label: '修改', icon: 'edit', command: 'edit' }],
        [
          {
            label: this.device.useStatus ? '禁用' : '启用',
            command: 'enable',
            show: this.device.releaseStatus === 1
          }
        ]
      ]"
      @handle="handle"
      @back="back"
      back
    />
    <details-header :device="device" />
    <q-tabs v-model="tab" @input="input" active-color="primary" align="left" class="text-grey" dense>
      <template v-if="type === 'config'">
        <q-tab :name="1" label="设备信息" />
        <q-tab :name="2" label="解析规则" v-if="[2, 3, 4].includes(device.agreementType)" />
        <q-tab :name="5" label="解析规则" v-if="[9].includes(device.agreementType)" />
        <q-tab :name="3" label="事件" />
        <q-tab :name="4" label="绑定/解绑感知对象" />
      </template>
      <template v-if="type === 'monitor'">
        <q-tab :name="1" label="实时数据" />
        <q-tab :name="2" label="命令下发" />
        <q-tab :name="3" label="历史数据" />
        <q-tab :name="4" label="异常数据" />
        <q-tab :name="5" label="设备告警" />
        <q-tab :name="6" label="设备拓扑" />
        <q-tab :name="7" label="操作日志" />
      </template>
    </q-tabs>
    <q-separator />
    <div class="layout-content" style="flex: none" :style="{ height }">
      <div class="layout-main">
        <q-tab-panels v-model="tab" animated>
          <template v-if="type === 'config'">
            <q-tab-panel :name="1">
              <details-panel :device="device" />
            </q-tab-panel>
            <q-tab-panel :name="2">
              <parse-panel :device="device" />
            </q-tab-panel>
            <q-tab-panel :name="3">
              <event-panel :device="device" />
            </q-tab-panel>
            <q-tab-panel :name="4">
              <combination-bind-panel />
            </q-tab-panel>
            <q-tab-panel :name="5">
              <snmp-panel :device="device" />
            </q-tab-panel>
          </template>
          <template v-if="type === 'monitor'">
            <q-tab-panel :name="1">
              <realtime-panel />
            </q-tab-panel>
            <q-tab-panel :name="2">
              <execute-panel />
            </q-tab-panel>
            <q-tab-panel :name="3">
              <record-panel />
            </q-tab-panel>
            <q-tab-panel :name="4">
              <abnormal-panel />
            </q-tab-panel>
            <q-tab-panel :name="5">
              <alarm-panel />
            </q-tab-panel>
            <q-tab-panel :name="6">
              <topology-panel />
            </q-tab-panel>
            <q-tab-panel :name="7">
              <log-panel />
            </q-tab-panel>
          </template>
        </q-tab-panels>
      </div>
    </div>
    <!-- 修改 -->
    <create-dialog ref="createDialog" @confirm="getDevices" />
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { popconfirm } from '@/utils/framework.js';
import { extend } from 'quasar';

import DetailsHeader from './details-header.vue';
import CreateDialog from '../dialogs/create.vue';

import DetailsPanel from './panels/details.vue';
import ParsePanel from './panels/parse.vue';
import EventPanel from './panels/event.vue';
import CombinationBindPanel from './panels/combination-bind.vue';
import SnmpPanel from './panels/snmp.vue';

import RealtimePanel from './panels/realtime.vue';
import ExecutePanel from './panels/execute.vue';
import RecordPanel from './panels/record.vue';
import AbnormalPanel from './panels/abnormal.vue';
import AlarmPanel from './panels/alarm.vue';
import TopologyPanel from './panels/topology.vue';
import LogPanel from './panels/log.vue';

export default {
  components: {
    DetailsHeader,
    CreateDialog,

    DetailsPanel,
    ParsePanel,
    EventPanel,
    CombinationBindPanel,
    SnmpPanel,

    RealtimePanel,
    ExecutePanel,
    RecordPanel,
    AbnormalPanel,
    AlarmPanel,
    TopologyPanel,
    LogPanel
  },
  data() {
    return {
      id: Number(this.$route.params.id),
      tab: Number(this.$route.query.tab),
      type: this.$route.query.type,
      device: {},
      height: 0
    };
  },
  mounted() {
    this.getDevices();
    this.height = `${document.querySelector('.layout-container').offsetHeight - document.querySelector('.layout-details').offsetHeight - 151}px`;
  },
  methods: {
    back() {
      this.$router.push({
        name: this.$route.query.from || 'device-list',
        params: {
          id: this.$route.query.pid
        },
        query: {
          id: this.$route.query.groupId,
          productId: this.$route.query.productId
        }
      });
    },
    handle({ command }) {
      switch (command) {
        case 'edit':
          this.$refs.createDialog.open({
            device: this.device,
            productId: this.device.productId,
            pid: this.device.pid
          });
          break;
        case 'enable':
          popconfirm({
            message: `是否${this.device.useStatus ? '禁用' : '启用'}${this.device.name}`,
            ok: {
              color: this.device.useStatus ? 'negative' : 'positive'
            }
          }).onOk(() => {
            devicesApi[this.device.useStatus ? 'unenableDevices' : 'enableDevices'](this.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.getDevices();
              }
            });
          });
          break;
      }
    },
    getDevices() {
      devicesApi.getDevice(this.id).then(response => (this.device = response.data));
    },
    input(value) {
      const query = extend(true, {}, this.$route.query);
      query.tab = value;
      this.$router.push({ query });
    }
  }
};
</script>
