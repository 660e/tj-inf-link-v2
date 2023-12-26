<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.resSpaceName" :validator="$v.forms.resSpaceName" label="名称" type="text" width="70" maxlength="32" />
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
      <iot-form-item :value.sync="forms.resSpaceDescription" label="描述" type="textarea" width="70" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
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
        resSpaceName: '',
        tenantId: '',
        resSpaceDescription: ''
      },
      tenantIdOptions: []
    };
  },
  validations: {
    forms: {
      resSpaceName: { required },
      tenantId: { required }
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
        sysApi[this.isCreate ? 'createResspace' : 'editResspace'](this.forms).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
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
