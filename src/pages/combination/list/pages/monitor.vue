<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header
      :title="device.name"
      :buttons="[[{ label: '修改', icon: 'edit', command: 'edit' }], [{ label: '绑定', command: 'bind' }]]"
      @handle="handle"
      @back="back"
      back
    />
    <q-list class="layout-details" dense>
      <q-item>
        <q-item-section>序列号：{{ device.number }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>安装位置：{{ device.position }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>生产厂商：{{ device.manufacyuer }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>设备数量：{{ device.devicenumber || 0 }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>创建时间：{{ device.creationtime }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>更新时间：{{ device.modificationtime }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="flex items-center">
            <span>二维码：</span>
            <q-icon v-if="device.qrurl" @click="zoom(device.qrurl)" name="image" class="cursor-pointer text-primary" size="xs">
              <q-tooltip :content-style="{ padding: '10px' }">
                <q-img :src="device.qrurl" style="width: 200px" />
              </q-tooltip>
            </q-icon>
          </div>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div class="flex items-center">
            <span>感知对象图片：</span>
            <q-icon v-if="device.pictureurl" @click="zoom(device.pictureurl)" name="image" class="cursor-pointer text-primary" size="xs">
              <q-tooltip :content-style="{ padding: '10px' }">
                <q-img :src="device.pictureurl" style="width: 200px" />
              </q-tooltip>
            </q-icon>
          </div>
        </q-item-section>
      </q-item>
      <q-item class="full-width">
        <q-item-section>备注：{{ device.describe }}</q-item-section>
      </q-item>
    </q-list>
    <q-tabs v-model="tab" @input="input" active-color="primary" align="left" class="text-grey" dense>
      <q-tab :name="1" label="实时数据" />
      <q-tab :name="2" label="历史数据" />
      <q-tab :name="3" label="感知对象拓扑" />
    </q-tabs>
    <q-separator />
    <div class="layout-content">
      <div class="layout-main">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel :name="1">
            <realtime-panel />
          </q-tab-panel>
          <q-tab-panel :name="2">
            <record-panel />
          </q-tab-panel>
          <q-tab-panel :name="3">
            <topology-panel />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <!-- 修改 -->
    <edit-dialog ref="editDialog" @confirm="getdetails" />
    <!-- 绑定 -->
    <bind-dialog ref="bindDialog" @confirm="getdetails" />
  </div>
</template>

<script>
import { openURL, extend } from 'quasar';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';

import EditDialog from '../dialogs/create.vue';
import BindDialog from '../dialogs/bind.vue';
import RealtimePanel from './panels/realtime.vue';
import RecordPanel from './panels/record.vue';
import TopologyPanel from './panels/topology.vue';

export default {
  components: {
    EditDialog,
    BindDialog,
    RealtimePanel,
    RecordPanel,
    TopologyPanel
  },
  data() {
    return {
      breadcrumbs: [],
      id: this.$route.params.id,
      tab: Number(this.$route.query.tab),
      device: {}
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '感知对象' }, { label: '感知对象列表', name: 'combination-list' }, { label: '监控' }];
    this.getdetails();
  },
  methods: {
    back() {
      this.$router.push({ name: this.$route.query.from || 'combination-list' });
    },
    getdetails() {
      switch (this.tab) {
        case 4:
          this.$refs.bindPanel.refresh();
          break;
      }
      perceivedApi.getdetails({ id: this.id }).then(response => (this.device = response.data));
    },
    handle({ command }) {
      switch (command) {
        case 'bind':
          this.$refs.bindDialog.open(this.device, 2);
          break;
        case 'edit':
          this.$refs.editDialog.open(this.device);
          break;
      }
    },
    input(value) {
      const query = extend(true, {}, this.$route.query);
      query.tab = value;
      this.$router.push({ query });
    },
    zoom(src) {
      openURL(src);
    }
  }
};
</script>
