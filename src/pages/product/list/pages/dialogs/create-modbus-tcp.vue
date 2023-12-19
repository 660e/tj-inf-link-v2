<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" vertical />
      <iot-form-item
        :value.sync="forms.productPropertyId"
        :validator="$v.forms.productPropertyId"
        :options="productPropertyIdOptions"
        @input="productPropertyIdInput"
        option-value="id"
        label="关联属性"
        type="select"
        vertical
      />
      <iot-form-item :value.sync="forms.startAddress" :validator="$v.forms.startAddress" label="起始地址" type="text" vertical />
      <iot-form-item
        :value.sync="forms.registerTypeId"
        :validator="$v.forms.registerTypeId"
        :options="registerTypeIdOptions"
        label="寄存器类型"
        type="select"
        vertical
      />
      <iot-form-item :value.sync="forms.registerCounts" :validator="$v.forms.registerCounts" label="寄存器个数" type="number" min="0" vertical />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
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
        protocolId: this.$route.query.protocolId,
        name: '',
        productPropertyId: '',
        productPropertyName: '',
        dataTypeId: '',
        startAddress: '',
        registerTypeId: '',
        registerTypeName: '',
        registerCounts: 0
      },
      productPropertyIdOptions: [],
      registerTypeIdOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      productPropertyId: { required },
      startAddress: { required },
      registerTypeId: { required },
      registerCounts: { required }
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
      const p0 = extendApi.getDateItemBycodes(['registerType']);
      const p1 = productsApi.getProductPropertyList({ id: this.forms.productId });
      Promise.all([p0, p1]).then(response => {
        this.registerTypeIdOptions = response[0].registerType;
        this.productPropertyIdOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.forms.productPropertyName = this.productPropertyIdOptions.find(e => e.id === this.forms.productPropertyId).label;
        this.forms.registerTypeName = this.registerTypeIdOptions.find(e => e.value === this.forms.registerTypeId).label;
        protocolApi[this.isCreate ? 'addProductProtocolModbusTcp' : 'updateProductProtocolModbusTcp'](this.forms).then(response => {
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
    },
    productPropertyIdInput(val) {
      this.forms.dataTypeId = this.productPropertyIdOptions.find(e => e.id === val).type;
    }
  }
};
</script>
