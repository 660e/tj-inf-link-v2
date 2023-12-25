<template>
  <iot-dialog :visible="visible" :width="500" title="用户权限" @confirm="confirm" @cancel="cancel">
    <q-form>
      <div style="font-size: 14px; padding-bottom: 10px">当前租户：{{ tenantName }}</div>
      <iot-table-simple v-if="data.length" :data="data" :columns="columns">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove(props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>
    </q-form>
  </iot-dialog>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { popconfirm } from '@/utils/framework.js';

export default {
  data() {
    return {
      visible: false,
      tenantName: '-',
      tenantId: '',
      data: [],
      columns: []
    };
  },
  mounted() {
    this.columns = [
      { label: '登录名', name: 'loginName', field: 'loginName', align: 'left' },
      { label: '用户名', name: 'userName', field: 'userName', align: 'left', style: 'width: 100px' },
      { label: '性别', name: 'gender', field: 'gender', align: 'left', style: 'width: 50px', format: val => (val === '1' ? '男' : '女') },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
  },
  methods: {
    open(row) {
      this.tenantName = row.tenantName;
      this.tenantId = row.id;
      this.onRequest();
      this.visible = true;
    },
    confirm() {
      this.cancel();
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
    },
    onRequest() {
      this.$store.commit('loading', true);
      sysApi.findUsersByTenantId(this.tenantId).then(response => {
        this.data = response;
        this.$store.commit('loading', false);
      });
    },
    remove(row) {
      popconfirm({
        message: `是否删除${row.loginName}`,
        ok: {
          color: 'negative'
        }
      }).onOk(() => {
        sysApi.deleteTenantFromUser({ tenantId: this.tenantId, userId: row.id }).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: '删除成功' });
            this.onRequest();
          }
        });
      });
    }
  }
};
</script>
