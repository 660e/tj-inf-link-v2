<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="事件名称" type="text" maxlength="32" vertical />
      <iot-form-item :value.sync="forms.label" :validator="$v.forms.label" label="标识符" type="text" maxlength="32" vertical />
      <iot-form-item :value.sync="forms.type" :validator="$v.forms.type" :options="typeOptions" label="事件类型" type="radio" vertical />
      <iot-form-item
        :value.sync="forms.warningId"
        :validator="$v.forms.warningId"
        :options="warningIdOptions"
        option-label="RULE_NAME"
        option-value="ID"
        label="规则"
        type="select"
        vertical
      />
      <iot-form-item :value.sync="forms.describe" label="描述" type="textarea" maxlength="100" vertical />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        name: '',
        label: '',
        type: 1,
        warningId: '',
        describe: '',
        deviceId: this.$route.params.id
      },
      typeOptions: [],
      warningIdOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      label: { required },
      warningId: { required }
    }
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(productId, row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      const p0 = extendApi.getDateItemBycodes(['eventType']);
      const p1 = productsApi.getProductAlarmRuleList({ pageNum: 1, pageSize: 999, productId });
      Promise.all([p0, p1]).then(response => {
        this.typeOptions = response[0].eventType;
        this.warningIdOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        devicesApi[this.isCreate ? 'createDeviceEvents' : 'updateDeviceEvents'](this.forms).then(response => {
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
