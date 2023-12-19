<template>
  <iot-dialog :visible="visible" :width="500" title="设备权限" @confirm="confirm" @cancel="cancel">
    <q-form>
      <div style="font-size: 14px; padding-bottom: 10px">当前权限：{{ roleName }}</div>
      <q-tree
        v-if="nodes.length"
        :nodes="nodes"
        :ticked.sync="ticked"
        children-key="deviceGroupList"
        label-key="name"
        node-key="id"
        tick-strategy="strict"
        accordion
      />
    </q-form>
  </iot-dialog>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
export default {
  data() {
    return {
      visible: false,
      roleName: '-',
      roleId: '',
      nodes: [],
      ticked: []
    };
  },
  methods: {
    open(row) {
      this.roleName = row.roleName;
      this.roleId = row.id;
      const p0 = devicesApi.getDeviceGroupInfoTreeList({ rootNodeId: -1 });
      const p1 = sysApi.getDatapermissions(this.roleId);
      Promise.all([p0, p1]).then(response => {
        this.nodes = response[0].data;
        this.ticked = response[1].map(e => Number(e));
        this.visible = true;
      });
    },
    confirm() {
      this.$store.commit('loading', true);
      sysApi.addDatapermissions(this.roleId, this.ticked.join(',')).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: '更新成功' });
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.ticked = [];
    }
  }
};
</script>
