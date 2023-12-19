<template>
  <q-list class="layout-details" dense>
    <q-item>
      <q-item-section>设备SN码：{{ device.deviceSn }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>所属产品：{{ device.productName }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>节点类型：{{ valueComputed(Number(device.nodeType), 'nodeType') }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>设备状态：{{ valueComputed(device.onlineStatus, 'onlineStatus') }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>协议类型：{{ device.accessModeAndProtocol }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>位置描述：{{ device.positionDescription }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>创建时间：{{ device.createTime }}</q-item-section>
    </q-item>
    <q-item>
      <q-item-section>最近在线：{{ device.lastOfflineTime }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
export default {
  props: {
    device: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      computed: {
        nodeType: [],
        onlineStatus: []
      }
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['nodeType', 'onlineStatus']).then(response => {
      this.computed.nodeType = response.nodeType;
      this.computed.onlineStatus = response.onlineStatus;
    });
  },
  methods: {
    valueComputed(val, key) {
      const item = this.computed[key].find(e => e.value === val);
      return item ? item.label : '-';
    }
  }
};
</script>
