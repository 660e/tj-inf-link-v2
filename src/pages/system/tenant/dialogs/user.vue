<template>
  <iot-dialog :visible="visible" :width="500" title="关联用户" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item
        v-model="userId"
        :options="userIdOptions"
        :clearable="false"
        :label="`当前租户：${tenantName}`"
        @input="userIdInput"
        option-label="userName"
        option-value="id"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple :data="data" :columns="columns">
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
      userId: '',
      tenantName: '-',
      tenantId: '',
      data: [],
      columns: [],
      userIdOptions: []
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

      sysApi.userAllList().then(response => {
        this.userIdOptions = response;
        this.onRequest();
        this.visible = true;
      });
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
        this.userId = '';
      });
    },
    userIdInput(val) {
      if (val) {
        sysApi.addTenantForUser({ tenantId: this.tenantId, userId: val }).then(response => response && this.onRequest());
      }
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
