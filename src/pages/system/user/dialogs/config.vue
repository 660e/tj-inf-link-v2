<template>
  <iot-dialog :visible="visible" :width="500" title="维护" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <q-form>
      <template v-if="isSysAdmin">
        <iot-form-item
          v-model="tenant"
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
        <iot-table-simple :data="tenantData" :columns="tenantColumns">
          <template v-slot:handle="{ props }">
            <q-icon
              @click="remove('tenantId', 'deleteTenantFromUser', props.row)"
              class="cursor-pointer text-negative"
              name="delete_outline"
              size="xs"
            />
          </template>
        </iot-table-simple>
      </template>
      <template v-else>
        <div class="text-sm leading-none" style="padding-bottom: 6px">租户</div>
        <iot-table-simple :data="tenantData" :columns="tenantColumns" />
      </template>

      <q-separator class="q-my-md" />

      <iot-form-item
        v-model="dept"
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
      <iot-table-simple :data="deptData" :columns="deptColumns">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('deptId', 'deleteDeptFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>

      <q-separator class="q-my-md" />

      <iot-form-item
        v-model="role"
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
      <iot-table-simple :data="roleData" :columns="roleColumns">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('roleId', 'deleteRoleFromUser', props.row)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>

      <q-separator class="q-my-md" />

      <iot-form-item
        v-model="resource"
        :options="resourceOptions"
        :clearable="false"
        :hint="`为“${loginName}”关联资源空间`"
        @input="resSpaceIdInput"
        label="资源空间"
        option-label="resSpaceName"
        option-value="id"
        type="select"
        width="40"
        vertical
      />
      <iot-table-simple :data="resourceData" :columns="resourceColumns">
        <template v-slot:handle="{ props }">
          <q-icon
            @click="remove('resSpaceId', 'deleteResspaceFromUser', props.row)"
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
import { SessionStorage } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      id: '',
      loginName: '-',
      isSysAdmin: false,

      tenant: '',
      tenantOptions: [],
      tenantData: [],
      tenantColumns: [
        { label: '租户名称', name: 'tenantName', field: 'tenantName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],

      dept: '',
      deptNodes: [],
      deptData: [],
      deptColumns: [
        { label: '机构名称', name: 'deptName', field: 'deptName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],

      role: '',
      roleOptions: [],
      roleData: [],
      roleColumns: [
        { label: '账号', name: 'roleName', field: 'roleName', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ],

      resource: '',
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

      const p0 = sysApi.checkCurrUserIsSysAdmin(SessionStorage.getItem('account').login.name);
      const p1 = sysApi.tenantlist();
      const p2 = sysApi.getDeptTree();
      const p3 = sysApi.rolelist();
      const p4 = sysApi.resSpacelist();

      Promise.all([p0, p1, p2, p3, p4]).then(response => {
        this.isSysAdmin = response[0];

        flattenTree(response[1]).forEach(e => (e.disabled = e.deptState === '0'));
        this.tenantOptions = response[1];
        this.deptNodes = response[2];
        this.roleOptions = response[3];
        this.resourceOptions = response[4];

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
    tenantIdInput(val) {
      if (val) {
        sysApi.addTenantForUser({ tenantId: val, userId: this.id }).then(response => response && this.onRequest());
      }
    },
    deptIdInput(val) {
      if (val) {
        sysApi.addDeptForUser({ deptId: val, userId: this.id }).then(response => response && this.onRequest());
      }
    },
    roleIdInput(val) {
      if (val) {
        sysApi.addRoleForUser({ roleId: val, userId: this.id }).then(response => response && this.onRequest());
      }
    },
    resSpaceIdInput(val) {
      if (val) {
        sysApi.addResspaceForUser({ resSpaceId: val, userId: this.id }).then(response => response && this.onRequest());
      }
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

      const p0 = sysApi.findTenantsByUserId({ userId: this.id });
      const p1 = sysApi.findDeptInfosByUserId({ userId: this.id });
      const p2 = sysApi.findRolesByUserId({ userId: this.id });
      const p3 = sysApi.findResSpacesByUserId({ userId: this.id });

      Promise.all([p0, p1, p2, p3]).then(response => {
        this.tenantData = response[0];
        this.deptData = response[1];
        this.roleData = response[2];
        this.resourceData = response[3];

        this.tenant = '';
        this.dept = '';
        this.role = '';
        this.resource = '';

        this.$store.commit('loading', false);
      });
    }
  }
};
</script>
