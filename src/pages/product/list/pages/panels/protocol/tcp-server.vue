<template>
  <div class="q-pt-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !releaseStatus }]" @handle="edit" title="解析规则" />
    <q-list dense padding>
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
        <q-item-section>
          在默认解码规则下，如果设备不是固定IP，在TCP Server协议下，目前约定按固定分隔符$进行分隔，并且前15位是设备唯一标识。（如：IEMI编号）
        </q-item-section>
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
    <edit-tcp-server-dialog ref="editTcpServerDialog" @confirm="getProtocolTcpServerVo" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import EditTcpServerDialog from '../../dialogs/edit-tcp-server.vue';
export default {
  components: {
    EditTcpServerDialog
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
      columns: [],
      computed: {
        decodeType: [],
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
    this.getProtocolTcpServerVo();
  },
  methods: {
    getProtocolTcpServerVo() {
      const p0 = protocolApi.getProtocolTcpServerVo(this.protocolId);
      const p1 = extendApi.getDateItemByParentcode({ code: 'decodeType' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'characterEnCode' });
      const p3 = extendApi.getDateItemByParentcode({ code: 'valueFormat' });
      Promise.all([p0, p1, p2, p3]).then(response => {
        this.protocol = response[0].data || { tcpDecodeRuleList: [{}] };
        this.computed.decodeType = response[1];
        this.computed.characterEnCode = response[2];
        this.computed.valueFormat = response[3];
      });
    },
    edit() {
      this.$refs.editTcpServerDialog.open(this.protocol);
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => Number(e.code) === val);
      return item ? item.name : '-';
    }
  }
};
</script>
