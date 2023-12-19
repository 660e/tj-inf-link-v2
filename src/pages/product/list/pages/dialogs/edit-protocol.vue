<template>
  <iot-dialog :visible="visible" :width="500" title="修改" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value="field.nodeType" label="节点类型" type="field" />
      <iot-form-item :value="field.label" label="协议类型" type="field" />
      <iot-form-item :value="field.name" label="关联产品" type="field" />
      <iot-form-item
        :value.sync="forms.encoderClass"
        :options="encoderClassOptions"
        option-label="name"
        option-value="protocolCodeClass"
        label="协议编码"
        type="select"
      />
      <iot-form-item
        v-if="[2, 3, 4, 5, 7].includes(this.forms.type)"
        :value.sync="forms.offlineCount"
        label="离线规则"
        hint="客户端连续连接失败次数（超出次数则设备离线）"
        type="number"
      />
      <iot-form-item
        v-if="[2, 3, 4, 5].includes(this.forms.type)"
        :value.sync="forms.collectInterval"
        :validator="$v.forms.collectInterval"
        label="采集频率"
        hint="单位：秒；最小：30"
        min="30"
        type="number"
      />
      <iot-form-item :value.sync="forms.describe" label="备注" type="textarea" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { minValue } from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      visible: false,
      protocolType: Number(this.$route.query.protocolType),
      RESET: {
        field: {},
        forms: {}
      },
      field: {
        nodeType: '',
        label: '',
        name: ''
      },
      forms: {
        encoderClass: '',
        offlineCount: 3,
        collectInterval: 60,
        describe: ''
      },
      encoderClassOptions: []
    };
  },
  validations: {
    forms: {
      collectInterval: { minValue: minValue(30) }
    }
  },
  created() {
    this.RESET = {
      field: extend(true, {}, this.field),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.forms = extend(true, {}, row);
      const p0 = extendApi.getDateItemBycodes(['nodeType']);
      const p1 = protocolApi.fixedtemplate(this.protocolType);
      Promise.all([p0, p1]).then(response => {
        const nodeType = response[0].nodeType.find(e => e.value === this.forms.nodeType);
        this.field = {
          nodeType: nodeType ? nodeType.label : '',
          label: this.forms.label,
          name: this.forms.name
        };
        this.encoderClassOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$store.commit('loading', true);
      protocolApi.updateProtocolConfig(this.forms).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: '修改成功' });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
    }
  }
};
</script>
