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
        option-label="ruleName"
        option-value="id"
        label="规则"
        type="select"
        vertical
      >
        <template v-slot:hint>
          <div>
            <span>创建事件需先</span>
            <span @click="$router.push({ name: 'alarm-rule', params: { create: 'create' } })" class="text-primary cursor-pointer">创建相应规则</span>
          </div>
        </template>
      </iot-form-item>
      <iot-form-item :value.sync="forms.describe" label="描述" type="textarea" maxlength="100" vertical />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { alarmRuleApi } from '@/api/wsat-service-alarm/alarm-rule.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
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
        productId: this.$route.params.id,
        name: '',
        label: '',
        type: 1,
        warningId: '',
        describe: ''
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
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      const p0 = extendApi.getDateItemByParentcode({ code: 'eventType' });
      const p1 = alarmRuleApi.QueryAlarmRuleBasic({ pageNum: 1, pageSize: 999, productId: this.forms.productId });
      Promise.all([p0, p1]).then(response => {
        this.typeOptions = response[0].map(e => ({ label: e.name, value: Number(e.code) }));
        this.warningIdOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        productsApi[this.isCreate ? 'addProductEvent' : 'updateProductEvent'](this.forms).then(response => {
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
