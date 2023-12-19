<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.ruleType" :validator="$v.forms.ruleType" label="分类名称" type="text" maxlength="32" />
      <iot-form-item :value.sync="forms.ruleTypeCode" :validator="$v.forms.ruleTypeCode" label="告警类型" type="number" maxlength="6" />
      <iot-form-item :value.sync="forms.ruleTypeDesc" label="描述" type="textarea" maxlength="100" />
      <iot-form-item :value.sync="forms.flag" label="状态" type="toggle" width="70" :true-value="1" :false-value="0" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
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
        ruleType: '',
        ruleTypeCode: '',
        ruleTypeDesc: '',
        flag: 1
      }
    };
  },
  validations: {
    forms: {
      ruleType: { required },
      ruleTypeCode: { required }
    }
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
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
        alarmRuleTypeApi[this.isCreate ? 'SaveAlarmRuleType' : 'UpadateAlarmRuleType'](this.forms).then(response => {
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
