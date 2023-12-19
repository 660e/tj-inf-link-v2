<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.mibOid" label="MIB OID" type="text" maxlength="32" width="110" />
      <iot-form-item :value.sync="forms.mibEnName" label="MIB英文名" type="text" maxlength="32" width="110" />
      <iot-form-item :value.sync="forms.mibCnName" label="MIB中文名" type="text" maxlength="32" width="110" />
      <iot-form-item :value.sync="forms.mibType" :options="mibTypeOptions" label="MIB数据类型" type="select" width="110" />
      <iot-form-item :value.sync="forms.tableId" label="TableID" type="text" maxlength="32" width="110" />
      <iot-form-item :value.sync="forms.formula" label="计算公式" type="text" maxlength="100" width="110" />
      <iot-form-item :value.sync="forms.manufacturer" :options="deviceBrandOptions" label="厂商" type="select" width="110" />
      <iot-form-item :value.sync="forms.snmpResClass" :options="snmpResClassOptions" label="设备类型" type="select" width="110" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { snmpmibOidApi } from '@/api/wsat-service-device/snmpmib-oid.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        mibOid: '',
        mibEnName: '',
        mibCnName: '',
        mibType: '',
        tableId: '',
        formula: '',
        manufacturer: '',
        snmpResClass: ''
      },
      deviceBrandOptions: [],
      mibTypeOptions: [],
      snmpResClassOptions: []
    };
  },
  validations: {
    forms: {}
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      extendApi.getDateItemBycodes(['deviceBrand', 'mibType', 'snmpResClass']).then(response => {
        this.deviceBrandOptions = response.deviceBrand;
        this.mibTypeOptions = response.mibType;
        this.snmpResClassOptions = response.snmpResClass;
        this.forms = extend(true, {}, row);
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        snmpmibOidApi.saveOrUpdateMibOidBean(this.forms).then(response => {
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
