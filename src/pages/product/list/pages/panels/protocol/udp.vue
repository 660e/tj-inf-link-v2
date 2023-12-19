<template>
  <div class="q-pt-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !releaseStatus }]" @handle="edit" title="解析规则" />
    <q-list dense padding>
      <q-item>
        <q-item-section>解析编码：{{ valueComputed(protocol.parserEnCode, 'characterEnCode') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <div>
            <span>服务端与客户端断开条件：</span>
            <span>超过{{ protocol.udpClientOffline.interval }}分钟</span>
          </div>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>在默认解码规则下，如果设备不是固定IP，在UDP协议下，目前约定前15位是设备唯一标识。（如：IEMI编号）</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>数据帧格式：{{ valueComputed(protocol.dataFrameFormat, 'valueFormat') }}</q-item-section>
      </q-item>
      <q-list v-for="t in protocol.tcpDecodeRuleList" :key="t.id" dense>
        <template v-if="t.useFlag === 1">
          <q-item>
            <q-item-section>标志位-起始位置：{{ t.flagStart }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>标志位-长度：{{ t.flagLen }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>标志位-标志位信息：{{ t.flagsValue }}</q-item-section>
          </q-item>
        </template>
        <template v-if="t.useCheck === 1">
          <q-item>
            <q-item-section>校验位-起始位置：{{ t.checkKeyStart }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>校验位-长度：{{ t.checkKeyLen }}</q-item-section>
          </q-item>
        </template>
        <q-item>
          <iot-table-simple :data="t.dataDecodeRuleFieldList" :columns="columns" />
        </q-item>
      </q-list>
    </q-list>
    <!-- 修改 -->
    <edit-udp-dialog ref="editUdpDialog" @confirm="getProtocolUdpVo" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import EditUdpDialog from '../../dialogs/edit-udp.vue';
export default {
  components: {
    EditUdpDialog
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
        udpClientOffline: {},
        tcpDecodeRuleList: [{}]
      },
      columns: [],
      computed: {
        characterEnCode: [],
        valueFormat: []
      }
    };
  },
  mounted() {
    this.columns = [
      { label: '数据名称', name: 'name', field: 'name', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '文本起始位', name: 'fixedStart', field: 'fixedStart', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '字段长度', name: 'fixedLength', field: 'fixedLength', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '对应属性', name: 'productPropertyName', field: 'productPropertyName', align: 'left', style: 'width: 150px', classes: 'ellipsis' }
    ];
    this.getProtocolUdpVo();
  },
  methods: {
    getProtocolUdpVo() {
      const p0 = protocolApi.getProtocolUdpVo(this.protocolId);
      const p1 = extendApi.getDateItemByParentcode({ code: 'characterEnCode' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'valueFormat' });
      Promise.all([p0, p1, p2]).then(response => {
        this.protocol = response[0].data || { udpClientOffline: {}, tcpDecodeRuleList: [{}] };
        this.computed.characterEnCode = response[1];
        this.computed.valueFormat = response[2];
      });
    },
    edit() {
      this.$refs.editUdpDialog.open(this.protocol);
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => Number(e.code) === val);
      return item ? item.name : '-';
    }
  }
};
</script>
