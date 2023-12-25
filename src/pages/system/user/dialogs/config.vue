<template>
  <iot-dialog :visible="visible" :width="500" title="维护" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <q-form>
      <iot-form-item
        :nodes="deptNodes"
        :clearable="false"
        :hint="`将“${loginName}”添加到机构`"
        @input="deptIdInput"
        label="机构"
        type="cascader"
        label-key="deptName"
        width="40"
        vertical
      />
      <iot-table-simple v-if="deptData.length" :data="deptData" :columns="deptColumns">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('deptId', 'deleteDeptFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>

      <q-separator class="q-my-md" />

      <iot-form-item
        :options="roleOptions"
        :clearable="false"
        :hint="`为“${loginName}”分配权限`"
        @input="roleIdInput"
        label="权限"
        option-label="roleName"
        option-value="id"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple v-if="roleData.length" :data="roleData" :columns="roleColumns">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('roleId', 'deleteRoleFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>

      <q-separator class="q-my-md" />

      <iot-form-item
        :options="tenantOptions"
        :clearable="false"
        :hint="`为“${loginName}”关联租户`"
        @input="tenantIdInput"
        label="租户"
        option-label="tenantName"
        option-value="id"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple v-if="tenantData.length" :data="tenantData" :columns="tenantColumns">
        <template v-slot:handle="{ props }">
          <q-icon
            @click="remove('tenantId', 'deleteTenantFromUser', props.row)"
            class="cursor-pointer text-negative"
            name="delete_outline"
            size="xs"
          />
        </template>
      </iot-table-simple>

      <q-separator class="q-my-md" />

      <iot-form-item
        :options="resourceOptions"
        :clearable="false"
        :hint="`为“${loginName}”关联资源空间`"
        @input="resSapceIdInput"
        label="资源空间"
        option-label="resSpaceName"
        option-value="id"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple v-if="resourceData.length" :data="resourceData" :columns="resourceColumns">
        <template v-slot:handle="{ props }">
          <q-icon
            @click="remove('resSapceId', 'deleteResspaceFromUser', props.row)"
            class="cursor-pointer text-negative"
            name="delete_outline"
            size="xs"
          />
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
      deptNodes: [],
      deptData: [],
      deptColumns: [
        { label: '机构名称', name: 'deptName', field: 'deptName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],
      roleOptions: [],
      roleData: [],
      roleColumns: [
        { label: '账号', name: 'roleName', field: 'roleName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],
      tenantOptions: [],
      tenantData: [],
      tenantColumns: [
        { label: '租户名称', name: 'tenantName', field: 'tenantName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],
      resourceOptions: [],
      resourceData: [],
      resourceColumns: [
        { label: '资源空间名称', name: 'resSpaceName', field: 'resSpaceName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ]
    };
  },
  methods: {
    open(row) {
      this.id = row.id;
      this.loginName = row.loginName;

      const p0 = sysApi.getDeptTree();
      const p1 = sysApi.rolelist();
      const p2 = sysApi.tenantlist();
      const p3 = sysApi.resSpacelist();

      Promise.all([p0, p1, p2, p3]).then(response => {
        flattenTree(response[0]).forEach(e => (e.disabled = e.deptState === '0'));
        this.deptNodes = response[0];
        this.roleOptions = response[1];
        this.tenantOptions = response[2];
        this.resourceOptions = response[3];

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
    tenantIdInput(val) {
      sysApi.addTenantForUser({ tenantId: val, userId: this.id }).then(response => response && this.onRequest());
    },
    resSapceIdInput(val) {
      sysApi.addResspaceForUser({ resSapceId: val, userId: this.id }).then(response => response && this.onRequest());
    },
    remove(id, fn, row) {
      popconfirm({
        message: `是否删除${row.deptName || row.roleName || row.tenantName || row.resSpaceName}`,
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
      const p2 = sysApi.findTenantsByUserId({ userId: this.id });
      const p3 = sysApi.findResSpacesByUserId({ userId: this.id });

      Promise.all([p0, p1, p2, p3]).then(response => {
        this.deptData = response[0];
        this.roleData = response[1];
        this.tenantData = response[2];
        this.resourceData = response[3];

        this.$store.commit('loading', false);
      });
    }
  }
};
</script>
