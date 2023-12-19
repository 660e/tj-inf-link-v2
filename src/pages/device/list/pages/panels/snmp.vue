<template>
  <div class="q-pa-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !device.useStatus }]" @handle="handle" title="解析规则" />
    <q-list dense padding>
      <q-item>
        <q-item-section>snmp版本：{{ protocol.snmpVersion }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>Community：{{ protocol.snmpCommunity }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>snmp超时时间：{{ protocol.timeOut }}秒</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>安全级别：{{ protocol.securityLevel }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>权限协议：{{ protocol.authProtocol }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>权限密码：{{ protocol.authPass }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>私有协议：{{ protocol.privProtocol }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>私有密码：{{ protocol.privPass }}</q-item-section>
      </q-item>
    </q-list>
    <!-- 新增 -->
    <create-parse-snmp-dialog ref="createParseSnmpDialog" @confirm="getData" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import CreateParseSnmpDialog from '../dialogs/create-parse-snmp.vue';

export default {
  components: {
    CreateParseSnmpDialog
  },
  props: {
    device: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      protocol: {}
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      protocolApi.getDeviceProtocolSNMP(this.id).then(response => {
        this.protocol = response.data || {};
      });
    },
    handle({ command }) {
      switch (command) {
        case 'edit':
          this.$refs.createParseSnmpDialog.open(this.device, this.protocol);
          break;
      }
    }
  }
};
</script>
