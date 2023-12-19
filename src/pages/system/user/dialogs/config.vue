<template>
  <iot-dialog :visible="visible" :width="500" title="维护" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <q-form>
      <iot-form-item
        :nodes="nodes"
        :hint="`为“${loginName}”分配机构`"
        :clearable="false"
        @input="deptIdInput"
        label="机构"
        type="cascader"
        label-key="deptName"
        width="40"
        vertical
      />
      <iot-table-simple v-if="deptData.length" :data="deptData" :columns="deptColumns" class="q-my-md">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('deptId', 'deleteDeptFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>
      <iot-form-item
        :options="options"
        :hint="`为“${loginName}”分配权限`"
        :clearable="false"
        @input="roleIdInput"
        option-label="roleName"
        option-value="id"
        label="权限"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple v-if="roleData.length" :data="roleData" :columns="roleColumns" class="q-my-md">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('roleId', 'deleteRoleFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>
    </q-form>
  </iot-dialog>
</template>

<script>
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { popconfirm } from '@/utils/framework.js';
import { flattenTree } from '@/utils/data.js';

export default {
  data() {
    return {
      visible: false,
      id: '',
      loginName: '-',
      nodes: [],
      deptData: [],
      deptColumns: [
        { label: '名称', name: 'deptName', field: 'deptName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],
      options: [],
      roleData: [],
      roleColumns: [
        { label: '账号', name: 'roleName', field: 'roleName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ]
    };
  },
  methods: {
    open(row) {
      this.id = row.id;
      this.loginName = row.loginName;
      const p0 = sysApi.getDeptTree();
      const p1 = sysApi.getRoleAll();
      Promise.all([p0, p1]).then(response => {
        flattenTree(response[0]).forEach(e => (e.disabled = e.deptState === '0'));
        this.nodes = response[0];
        this.options = response[1];
        this.onRequest();
        this.visible = true;
      });
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.$emit('confirm');
          this.visible = false;
          this.$store.commit('loading', false);
          break;
      }
    },
    deptIdInput(val) {
      sysApi.addDeptForUser({ deptId: val, userId: this.id }).then(response => response && this.onRequest());
    },
    roleIdInput(val) {
      sysApi.addRoleForUser({ roleId: val, userId: this.id }).then(response => response && this.onRequest());
    },
    remove(id, fn, row) {
      popconfirm({
        message: `是否删除${fn === 'deleteDeptFromUser' ? row.deptName : row.roleName}`,
        ok: {
          color: 'negative'
        }
      }).onOk(() => {
        const params = {
          userId: this.id
        };
        params[id] = row.id;
        sysApi[fn](params).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: '删除成功' });
            this.onRequest();
          }
        });
      });
    },
    onRequest() {
      this.$store.commit('loading', true);
      const p0 = sysApi.findDeptInfosByUserId({ userId: this.id });
      const p1 = sysApi.findRolesByUserId({ userId: this.id });
      Promise.all([p0, p1]).then(response => {
        this.deptData = response[0];
        this.roleData = response[1];
        this.$store.commit('loading', false);
      });
    }
  }
};
</script>
