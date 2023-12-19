<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form ref="forms">
      <iot-form-item label="解析模板" vertical>
        <pre>{{ pre }}</pre>
      </iot-form-item>
      <iot-form-item
        :value.sync="forms.protocolDecodeJarId"
        :options="protocolDecodeJarIdOptions"
        option-label="name"
        option-value="id"
        label="解析插件"
        type="select"
        vertical
      />
      <iot-form-item label="服务端与客户端断开条件" vertical>
        <q-input
          v-model.number="forms.httpClientOffline.interval"
          type="number"
          min="3"
          prefix="超过"
          suffix="分钟"
          class="col"
          dense
          hide-bottom-space
          outlined
        />
      </iot-form-item>
    </q-form>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extend } from 'quasar';
export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      protocolType: this.$route.query.protocolType,
      RESET: {
        forms: {}
      },
      forms: {
        productId: this.$route.params.id,
        protocolId: this.$route.query.protocolId,
        isSSL: 0,
        httpMethod: 'POST',
        protocolDecodeJarId: 0,
        httpClientOffline: {
          interval: 6
        }
      },
      protocolDecodeJarIdOptions: [],
      pre: {
        code: '设备唯一标识',
        label1: '属性值1',
        label2: '属性值2'
      }
    };
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(protocol) {
      if (protocol.id || protocol.id === 0) {
        this.isCreate = false;
        this.forms = extend(true, {}, protocol);
      } else {
        this.isCreate = true;
        this.forms.protocolDecodeJarId = this.protocolDecodeJarIdOptions.length ? this.protocolDecodeJarIdOptions[0].id : '';
      }
      const p0 = extendApi.getDateItemByParentcode({ code: 'requestMode' });
      const p1 = protocolApi.getProtocolList({ pageNum: 1, pageSize: 999, type: this.protocolType });
      Promise.all([p0, p1]).then(response => {
        this.requestModeOptions = response[0].map(e => ({ label: e.name, value: e.code }));
        this.protocolDecodeJarIdOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$store.commit('loading', true);
      protocolApi[this.isCreate ? 'addProtocolHttpServer' : 'updateProtocolHttpServer'](this.forms).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.forms = extend(true, {}, this.RESET.forms);
    }
  }
};
</script>
