<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.propertyName" :validator="$v.forms.propertyName" label="属性名称" type="text" maxlength="32" />
      <iot-form-item :value.sync="forms.label" :validator="$v.forms.label" label="标识符" type="text" maxlength="64" />
      <iot-form-item
        :value.sync="forms.propertyType"
        :options="propertyTypeOptions"
        :validator="$v.forms.propertyType"
        label="数据类型"
        type="select"
      />
      <iot-form-item label="取值范围">
        <div class="col row items-center">
          <q-input v-model="surface.range1" class="col" type="number" min="0" dense hide-bottom-space outlined />
          <span class="q-px-sm">~</span>
          <q-input v-model="surface.range2" class="col" type="number" min="0" dense hide-bottom-space outlined />
        </div>
      </iot-form-item>
      <iot-form-item :value.sync="forms.unitId" :options="unitIdOptions" label="单位" type="select" />
      <iot-form-item :value.sync="forms.describe" label="描述" type="textarea" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        range1: 0,
        range2: 0
      },
      forms: {
        modelId: Number(this.$route.params.id),
        propertyName: '',
        label: '',
        propertyType: '',
        unitId: '',
        describe: ''
      },
      propertyTypeOptions: [],
      unitIdOptions: []
    };
  },
  validations: {
    forms: {
      propertyName: { required },
      label: { required },
      propertyType: { required }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['dataType', 'units']).then(response => {
      this.propertyTypeOptions = response.dataType;
      this.unitIdOptions = response.units;
    });
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
        this.surface.range1 = this.forms.propertyRange.split('~')[0];
        this.surface.range2 = this.forms.propertyRange.split('~')[1];
      }
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.forms.propertyRange = `${this.surface.range1}~${this.surface.range2}`;
        this.forms.unitName = this.forms.unitId && this.unitIdOptions.find(e => e.value === this.forms.unitId).label;
        productsApi[this.isCreate ? 'createProductsModelsProps' : 'editProductsModelsProps'](this.forms).then(response => {
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
      this.surface = extend(true, {}, this.RESET.surface);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    }
  }
};
</script>
