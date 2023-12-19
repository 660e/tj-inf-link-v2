<template>
  <div class="q-pt-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !releaseStatus }]" @handle="edit" title="解析规则" />
    <q-list dense padding>
      <q-item>
        <q-item-section>是否使用SSL：{{ protocol.isSSL === 1 ? '是' : '否' }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>请求方式：{{ protocol.httpMethod }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>解析模板：</q-item-section>
      </q-item>
      <q-item>
        <pre>{{ pre }}</pre>
      </q-item>
      <q-item>
        <q-item-section>
          <div>
            <span>服务端与客户端断开条件：</span>
            <span>超过{{ protocol.httpClientOffline.interval }}分钟</span>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <!-- 修改 -->
    <edit-http-server-dialog ref="editHttpServerDialog" @confirm="getProtocolHttpServerVo" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import EditHttpServerDialog from '../../dialogs/edit-http-server.vue';
export default {
  components: {
    EditHttpServerDialog
  },
  props: {
    releaseStatus: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      protocolId: this.$route.query.protocolId,
      protocol: {
        httpClientOffline: {}
      },
      pre: {
        code: '设备唯一标识',
        label1: '属性值1',
        label2: '属性值2'
      }
    };
  },
  mounted() {
    this.getProtocolHttpServerVo();
  },
  methods: {
    getProtocolHttpServerVo() {
      protocolApi.getProtocolHttpServerVo(this.protocolId).then(response => (this.protocol = response.data || { httpClientOffline: {} }));
    },
    edit() {
      this.$refs.editHttpServerDialog.open(this.protocol);
    }
  }
};
</script>
