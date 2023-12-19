<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" width="70" maxlength="32" />
      <iot-form-item :value.sync="forms.code" :validator="$v.forms.code" label="规则码" type="text" width="70" maxlength="32" />
      <iot-form-item
        :value.sync="forms.codeIndex"
        :validator="$v.forms.codeIndex"
        label="排序号"
        type="number"
        min="1"
        max="9999"
        width="70"
        hint="范围：1 ~ 9999"
      />
      <iot-form-item :value.sync="forms.remark" label="备注" type="textarea" width="70" maxlength="200" />
      <iot-form-item :value.sync="forms.state" label="状态" type="toggle" width="70" true-value="1" false-value="0" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { between, required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
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
        parentId: '',
        name: '',
        code: '',
        codeIndex: 1,
        remark: '',
        state: '0',
        flag: 1
      }
    };
  },
  validations: {
    forms: {
      name: { required },
      code: { required },
      codeIndex: { required, between: between(1, 9999) }
    }
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row, parentId) {
      this.isCreate = !row;
      this.forms.parentId = parentId;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        sysApi[this.isCreate ? 'createDataitem' : 'editDataitem'](this.forms).then(response => {
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
