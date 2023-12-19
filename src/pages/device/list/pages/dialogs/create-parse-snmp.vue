<template>
  <iot-dialog :visible="visible" :width="500" @confirm="confirm" @cancel="cancel" title="解析规则">
    <q-form>
      <iot-form-item :value.sync="forms.snmpVersion" :validator="$v.forms.snmpVersion" label="snmp版本" type="text" maxlength="32" width="120" />
      <iot-form-item :value.sync="forms.snmpCommunity" :validator="$v.forms.snmpCommunity" label="Community" type="text" maxlength="32" width="120" />
      <iot-form-item
        :value.sync="forms.timeOut"
        :validator="$v.forms.timeOut"
        label="snmp超时时间"
        type="number"
        min="1"
        hint="单位：秒"
        width="120"
      />
      <iot-form-item :value.sync="forms.securityLevel" label="安全级别" type="text" maxlength="32" width="120" />
      <iot-form-item :value.sync="forms.authProtocol" label="权限协议" type="text" maxlength="32" width="120" />
      <iot-form-item :value.sync="forms.authPass" label="权限密码" type="text" maxlength="32" width="120" />
      <iot-form-item :value.sync="forms.privProtocol" label="私有协议" type="text" maxlength="32" width="120" />
      <iot-form-item :value.sync="forms.privPass" label="私有密码" type="text" maxlength="32" width="120" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';

export default {
  data() {
    return {
      visible: false,
      device: {},
      RESET: {
        forms: {}
      },
      forms: {
        snmpVersion: '',
        snmpCommunity: '',
        timeOut: 30,
        securityLevel: '',
        authProtocol: '',
        authPass: '',
        privProtocol: '',
        privPass: ''
      }
    };
  },
  validations: {
    forms: {
      snmpVersion: { required },
      snmpCommunity: { required },
      timeOut: { required }
    }
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(device, protocol) {
      this.forms = extend(true, {}, protocol);
      this.device = device;
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.forms.deviceId = this.device.id;
        this.forms.productId = this.device.productId;
        protocolApi.addDeviceProtocolSNMP(this.forms).then(response => {
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
