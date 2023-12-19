<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" maxlength="32" width="110" />
      <iot-form-item
        :value.sync="forms.productPropertyId"
        :options="productPropertyIdOptions"
        @input="productPropertyIdInput"
        option-label="name"
        option-value="id"
        label="关联属性"
        type="select"
        width="110"
      />
      <template v-if="surface.agreementType === 2">
        <iot-form-item
          :value.sync="forms.registerTypeId"
          :validator="$v.forms.registerTypeId"
          :options="registerTypeIdOptions"
          label="寄存器类型"
          type="select"
          width="110"
        />
        <iot-form-item :value.sync="forms.startAddress" label="起始地址" type="text" width="110" />
        <iot-form-item :value.sync="forms.registerCounts" label="寄存器个数" type="text" width="110" />
        <iot-form-item :value.sync="forms.registerDateType" :options="registerDateTypeOptions" label="寄存器数据类型" type="radio" width="110" />
      </template>
      <template v-if="surface.agreementType === 3">
        <iot-form-item :value.sync="forms.nameSpaceIndex" label="命名空间索引" type="number" width="110" />
        <iot-form-item :value.sync="forms.identifier" label="点位信息标识符" type="text" maxlength="64" width="110" />
      </template>
      <template v-if="surface.agreementType === 4">
        <iot-form-item :value.sync="forms.propertySn" label="属性序列号" type="text" maxlength="32" width="110" />
        <iot-form-item :value.sync="forms.dataTypeSn" :options="dataTypeSnOptions" label="属性类型" type="select" width="110" />
      </template>
    </q-form>
  </iot-dialog>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

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
        agreementType: ''
      },
      forms: {
        deviceId: this.$route.params.id,
        name: '',
        productPropertyId: '',
        productPropertyName: '',
        dataTypeId: '',
        dataTypeSn: '',
        registerTypeId: '',
        startAddress: '',
        registerCounts: '',
        nameSpaceIndex: 1,
        identifier: '',
        propertySn: '',
        registerDateType: '10'
      },
      productPropertyIdOptions: [],
      dataTypeSnOptions: [],
      registerTypeIdOptions: [],
      registerDateTypeOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      registerTypeId: {
        required: requiredIf(function () {
          return this.surface.agreementType === 2;
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
    open(device, row) {
      this.isCreate = !row;
      this.surface.agreementType = device.agreementType;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      const p0 = productsApi.getProductPropertyList({ id: device.productId });
      const p1 = extendApi.getDateItemBycodes(['bacnetDataType', 'registerType', 'registerDateType']);
      Promise.all([p0, p1]).then(response => {
        this.productPropertyIdOptions = response[0].data;
        this.dataTypeSnOptions = response[1].bacnetDataType;
        this.registerTypeIdOptions = response[1].registerType;
        this.registerDateTypeOptions = response[1].registerDateType.map(e => ({ label: e.label, value: String(e.value) }));
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        const params = extend(true, {}, this.forms);
        let fn;
        switch (this.surface.agreementType) {
          case 2:
            // MODBUS-TCP
            delete params.dataTypeSn;
            delete params.propertySn;
            fn = protocolApi[this.isCreate ? 'addDeviceProtocolModbusTcp' : 'updateDeviceProtocolModbusTcp'];
            break;
          case 3:
            // OPC-UA
            params.productPropertyDataTypeId = this.forms.dataTypeId;
            delete params.dataTypeId;
            delete params.dataTypeSn;
            delete params.propertySn;
            delete params.registerCounts;
            delete params.registerDateType;
            delete params.registerTypeId;
            delete params.startAddress;
            fn = protocolApi[this.isCreate ? 'addDevicePropertyOpcUa' : 'updateDevicePropertyOpcUa'];
            break;
          case 4:
            // BACNET
            params.productPropertyDataTypeId = this.forms.dataTypeId;
            delete params.dataTypeId;
            delete params.identifier;
            delete params.nameSpaceIndex;
            delete params.registerCounts;
            delete params.registerDateType;
            delete params.registerTypeId;
            delete params.startAddress;
            fn = protocolApi[this.isCreate ? 'addDeviceProtocolBacNet' : 'updateDeviceProtocolBacNet'];
            break;
        }
        fn(params).then(response => {
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
    productPropertyIdInput(val) {
      const property = this.productPropertyIdOptions.find(e => e.id === val);
      this.forms.productPropertyName = property.label;
      this.forms.dataTypeId = property.type;
    }
  }
};
</script>
