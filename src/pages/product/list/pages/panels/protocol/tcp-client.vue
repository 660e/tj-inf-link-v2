<template>
  <div class="q-pt-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !releaseStatus }]" @handle="edit" title="解析规则" />
    <q-list dense padding>
      <q-item>
        <q-item-section>认证信息：{{ protocol.reqMessage }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>发送数据格式：{{ valueComputed(protocol.reqEnCode, 'reqEnCode') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>解析方式：{{ valueComputed(protocol.decodeType, 'decodeType') }}</q-item-section>
      </q-item>
      <template v-if="protocol.decodeType === 1">
        <q-item>
          <q-item-section>定长：{{ protocol.fixedLength_decode }}</q-item-section>
        </q-item>
      </template>
      <template v-if="protocol.decodeType === 2">
        <q-item>
          <q-item-section>固定分隔符：{{ protocol.delimiter_decode }}</q-item-section>
        </q-item>
      </template>
      <template v-if="protocol.decodeType === 3">
        <q-item>
          <q-item-section>长度字段偏移量：{{ protocol.tcpDecodeLengthField.lengthFieldOffset }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>起始删除字节数：{{ protocol.tcpDecodeLengthField.initialBytesToStrip }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>长度字段长度：{{ protocol.tcpDecodeLengthField.lengthFieldLength }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>长度字段补偿值：{{ protocol.tcpDecodeLengthField.lengthAdjustment }}</q-item-section>
        </q-item>
      </template>
      <q-item>
        <q-item-section>编码类型：{{ valueComputed(protocol.parserEnCode, 'characterEnCode') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>设备标识字段：{{ protocol.identifyVariable }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>消息响应机制：</q-item-section>
      </q-item>
      <q-item>
        <iot-table-simple :data="protocol.responeMsgList" :columns="columns2" />
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
          <iot-table-simple :data="t.dataDecodeRuleFieldList" :columns="columns1" />
        </q-item>
      </q-list>
    </q-list>
    <!-- 修改 -->
    <edit-tcp-client-dialog ref="editTcpClientDialog" @confirm="getProtocolTcpClientVo" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import EditTcpClientDialog from '../../dialogs/edit-tcp-client.vue';
export default {
  components: {
    EditTcpClientDialog
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
        tcpDecodeRuleList: [{}]
      },
      columns1: [],
      columns2: [],
      computed: {
        reqEnCode: [],
        decodeType: [],
        characterEnCode: [],
        valueFormat: []
      }
    };
  },
  mounted() {
    this.columns1 = [
      { label: '数据名称', name: 'name', field: 'name', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '文本起始位', name: 'fixedStart', field: 'fixedStart', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '字段长度', name: 'fixedLength', field: 'fixedLength', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
      { label: '对应属性', name: 'productPropertyName', field: 'productPropertyName', align: 'left', style: 'width: 150px', classes: 'ellipsis' }
    ];
    this.columns2 = [
      { label: '接收格式', name: 'receive', field: 'receive', align: 'left', style: 'width: 300px', classes: 'ellipsis' },
      { label: '响应格式', name: 'response', field: 'response', align: 'left', style: 'width: 300px', classes: 'ellipsis' }
    ];
    this.getProtocolTcpClientVo();
  },
  methods: {
    getProtocolTcpClientVo() {
      const p0 = protocolApi.getProtocolTcpClientVo(this.protocolId);
      const p1 = extendApi.getDateItemByParentcode({ code: 'reqEnCode' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'decodeType' });
      const p3 = extendApi.getDateItemByParentcode({ code: 'characterEnCode' });
      const p4 = extendApi.getDateItemByParentcode({ code: 'valueFormat' });
      Promise.all([p0, p1, p2, p3, p4]).then(response => {
        this.protocol = response[0].data || { tcpDecodeRuleList: [{}] };
        this.computed.reqEnCode = response[1];
        this.computed.decodeType = response[2];
        this.computed.characterEnCode = response[3];
        this.computed.valueFormat = response[4];
      });
    },
    edit() {
      this.$refs.editTcpClientDialog.open(this.protocol);
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => Number(e.code) === val);
      return item ? item.name : '-';
    }
  }
};
</script>
