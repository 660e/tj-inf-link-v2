<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.roleName" :validator="$v.forms.roleName" label="名称" type="text" width="70" maxlength="32" />
      <iot-form-item
        v-if="tenantIdOptions.length"
        label="租户"
        :value.sync="forms.tenantId"
        :validator="$v.forms.tenantId"
        :options="tenantIdOptions"
        option-label="tenantName"
        option-value="id"
        type="select"
        width="70"
      />
      <iot-form-item
        :value.sync="forms.roleIndex"
        :validator="$v.forms.roleIndex"
        label="排序号"
        type="number"
        min="1"
        max="9999"
        width="70"
        hint="范围：1 ~ 9999"
      />
      <iot-form-item :value.sync="forms.remark" label="备注" type="textarea" width="70" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { between, required } from 'vuelidate/lib/validators';
import { extend, SessionStorage } from 'quasar';
import { sysApi } from '@/api/tdf-service-sys/sys.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        roleName: '',
        tenantId: '',
        roleIndex: 1,
        remark: '',
        flag: 1
      },
      tenantIdOptions: []
    };
  },
  validations: {
    forms: {
      roleName: { required },
      tenantId: { required },
      roleIndex: { required, between: between(1, 9999) }
    }
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      const p0 = sysApi.checkCurrUserIsSysAdmin(SessionStorage.getItem('account').login.name);
      const p1 = sysApi.tenantlist();
      Promise.all([p0, p1]).then(response => {
        if (response[0]) {
          this.tenantIdOptions = response[1];
        }
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        sysApi[this.isCreate ? 'createRole' : 'editRole'](this.forms).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功，请关联菜单、用户、资源空间` });
            this.$emit('confirm');
            this.cancel();
          }
        });
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    }
  }
};
</script>
