<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="属性名称" type="text" maxlength="32" vertical />
      <iot-form-item
        :value.sync="forms.label"
        :validator="$v.forms.label"
        hint="英文、数字、下划线，最少两个字符，必须英文开头"
        label="标识符"
        type="text"
        maxlength="32"
        vertical
      />
      <iot-form-item :value.sync="forms.convertLabel" label="标准化标识符" type="text" maxlength="32" vertical />
      <iot-form-item v-if="protocolType === 9" label="OID" :validator="$v.forms.extRelId" :value.sync="forms.extRelId" type="text" readonly vertical>
        <template v-slot:after>
          <q-btn @click="selectMib" icon="add" dense round />
        </template>
      </iot-form-item>
      <iot-form-item :value.sync="forms.isMajorKey" :options="switchNumberOptions" label="是否为标识设备的主键" type="radio" vertical />
      <iot-form-item
        :value.sync="forms.type"
        :validator="$v.forms.type"
        :options="typeOptions"
        @input="input"
        label="数据类型"
        type="select"
        vertical
      />
      <iot-form-item v-if="surface.hasDecimalPlaces" :value.sync="forms.decimalPlaces" label="保留小数点位数" type="number" min="0" vertical />
      <iot-form-item
        v-if="surface.hasCompute"
        :value.sync="forms.secondCalculateFlag"
        :options="switchBooleanOptions"
        label="是否二次运算"
        type="radio"
        vertical
      />
      <iot-form-item label="取值范围" vertical>
        <div class="row items-center">
          <q-input v-model="surface.range1" class="col" type="number" min="0" dense hide-bottom-space outlined />
          <span class="q-px-sm">~</span>
          <q-input v-model="surface.range2" class="col" type="number" min="0" dense hide-bottom-space outlined />
        </div>
      </iot-form-item>
      <template v-if="forms.secondCalculateFlag">
        <iot-form-item :value.sync="forms.operationMode" :options="operationModeOptions" label="运算方式" type="select" vertical />
        <iot-form-item :value.sync="forms.operationValue" label="运算值" type="number" min="0" vertical />
        <iot-form-item
          v-if="surface.hasDecimalPlaces"
          :value.sync="forms.decimalPlacesCalculate"
          label="运算后保留小数点位数"
          type="number"
          min="0"
          vertical
        />
      </template>
      <iot-form-item :value.sync="forms.unitId" :options="unitIdOptions" label="单位" type="select" vertical />
      <iot-form-item :value.sync="forms.describe" label="备注" type="textarea" maxlength="100" vertical />
    </q-form>
    <!-- SNMP -->
    <select-mib-dialog ref="selectMibDialog" @confirm="resolveMib" />
  </iot-dialog>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { extend } from 'quasar';

import SelectMibDialog from './select-mib.vue';

const labelRegexp = value => !value || /[a-zA-Z][a-zA-Z0-9_-]+$/.test(value);

export default {
  components: { SelectMibDialog },
  data() {
    return {
      visible: false,
      isCreate: true,
      productId: this.$route.params.id,
      protocolType: Number(this.$route.query.protocolType),
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        hasDecimalPlaces: false,
        hasCompute: false,
        range1: 0,
        range2: 0
      },
      forms: {
        name: '',
        label: '',
        convertLabel: '',
        isMajorKey: 0,
        type: 1,
        secondCalculateFlag: 0,
        decimalPlaces: 0,
        decimalPlacesCalculate: 0,
        operationMode: '+',
        operationValue: 0,
        unitId: '',
        describe: '',
        extRelId: ''
      },
      typeOptions: [],
      unitIdOptions: [],
      switchNumberOptions: [],
      switchBooleanOptions: [],
      operationModeOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      label: { required, labelRegexp },
      type: { required },
      extRelId: {
        required: requiredIf(function () {
          return this.protocolType === 9;
        })
      }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
        this.surface.range1 = row.range ? row.range.split('~')[0] : '';
        this.surface.range2 = row.range ? row.range.split('~')[1] : '';
      }
      extendApi.getDateItemBycodes(['dataType', 'units', 'switchNumber', 'switchBoolean', 'operationMode']).then(response => {
        this.typeOptions = response.dataType;
        this.unitIdOptions = response.units;
        this.switchNumberOptions = response.switchNumber;
        this.switchBooleanOptions = response.switchBoolean;
        this.operationModeOptions = response.operationMode;
        this.input(this.forms.type);
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        const params = {
          productId: this.productId,
          id: this.forms.id,
          name: this.forms.name,
          label: this.forms.label,
          convertLabel: this.forms.convertLabel,
          isMajorKey: this.forms.isMajorKey,
          type: this.forms.type,
          unitId: this.forms.unitId,
          range: `${this.surface.range1}~${this.surface.range2}`,
          secondCalculateFlag: this.forms.secondCalculateFlag,
          describe: this.forms.describe
        };
        if (this.protocolType === 9) {
          params.extRelId = this.forms.extRelId;
        }
        if (this.surface.hasDecimalPlaces) {
          params.decimalPlaces = this.forms.decimalPlaces;
          params.decimalPlacesCalculate = this.forms.decimalPlacesCalculate;
        }
        if (this.forms.secondCalculateFlag) {
          params.operationMode = this.forms.operationMode;
          params.operationValue = this.forms.operationValue;
        }
        productsApi[this.isCreate ? 'addProductProperty' : 'updateProductProperty'](params).then(response => {
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
    },
    input(value) {
      switch (value) {
        case 1:
        case 2:
        case 3:
        case 4:
          this.surface.hasDecimalPlaces = false;
          this.surface.hasCompute = true;
          break;
        case 5:
        case 6:
          this.surface.hasDecimalPlaces = true;
          this.surface.hasCompute = true;
          break;
        default:
          this.surface.hasDecimalPlaces = false;
          this.surface.hasCompute = false;
      }
    },
    selectMib() {
      this.$refs.selectMibDialog.open();
    },
    resolveMib(resolve) {
      this.forms.extRelId = resolve;
    }
  }
};
</script>
