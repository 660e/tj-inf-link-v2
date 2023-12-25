<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.tenantName" :validator="$v.forms.tenantName" label="名称" type="text" width="70" maxlength="32" />
      <iot-form-item :value.sync="forms.tenantDescription" label="描述" type="textarea" width="70" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { extend } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        tenantName: '',
        tenantDescription: ''
      }
    };
  },
  validations: {
    forms: {
      tenantName: { required }
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
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        sysApi[this.isCreate ? 'createTenant' : 'editTenant'](this.forms).then(response => {
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
