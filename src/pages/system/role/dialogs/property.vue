<template>
  <iot-dialog :visible="visible" :width="500" title="属性权限" @confirm="confirm" @cancel="cancel">
    <q-form>
      <div style="font-size: 14px; padding-bottom: 10px">当前权限：{{ roleName }}</div>
      <q-tree
        v-if="nodes.length"
        :nodes="nodes"
        :ticked.sync="ticked"
        label-key="name"
        children-key="productPropertyList"
        node-key="id"
        tick-strategy="strict"
        accordion
      />
    </q-form>
  </iot-dialog>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { productsApi } from '@/api/wsat-service-device/products.js';

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
      const p0 = productsApi.getAllProductPropertyTree();
      const p1 = sysApi.findProductPropertyIdsByRoleId(row.id);
      Promise.all([p0, p1]).then(response => {
        this.nodes = response[0].data;
        this.ticked = response[1].map(e => Number(e));
        this.visible = true;
      });
    },
    confirm() {
      this.$store.commit('loading', true);
      const params = this.ticked.map(e => ({ productPropertyId: e }));
      sysApi.addRoleProductPropertyId(this.roleId, params).then(response => {
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
