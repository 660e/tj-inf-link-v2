<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form class="row">
      <section>
        <iot-form-item :value.sync="forms.reqMessage" label="认证信息" type="textarea" maxlength="100" vertical />
        <iot-form-item :value.sync="forms.reqEnCode" :options="reqEnCodeOptions" label="发送数据格式" type="radio" vertical />
        <iot-form-item :value.sync="forms.decodeType" :options="decodeTypeOptions" label="解析方式" type="radio" vertical />
        <template v-if="forms.decodeType === 1">
          <iot-form-item :value.sync="forms.fixedLength_decode" label="定长" type="number" min="1" vertical />
        </template>
        <template v-if="forms.decodeType === 2">
          <iot-form-item :value.sync="forms.delimiter_decode" label="固定分隔符" type="text" vertical />
        </template>
        <template v-if="forms.decodeType === 3">
          <iot-form-item :value.sync="forms.tcpDecodeLengthField.lengthFieldOffset" label="长度字段偏移量" type="number" min="1" vertical />
          <iot-form-item :value.sync="forms.tcpDecodeLengthField.initialBytesToStrip" label="起始删除字节数" type="number" min="1" vertical />
          <iot-form-item :value.sync="forms.tcpDecodeLengthField.lengthFieldLength" label="长度字段长度" type="number" min="1" vertical />
          <iot-form-item :value.sync="forms.tcpDecodeLengthField.lengthAdjustment" label="长度字段补偿值" type="number" min="1" vertical />
        </template>
        <iot-form-item :value.sync="forms.parserEnCode" :options="reqEnCodeOptions" label="编码类型" type="radio" vertical />
        <iot-form-item
          :value.sync="forms.protocolDecodeJarId"
          :options="protocolDecodeJarIdOptions"
          option-label="name"
          option-value="id"
          type="select"
          label="解析插件"
          vertical
        />
        <iot-table-simple :data="forms.responeMsgList" :columns="columns2" title="消息响应机制">
          <template v-slot:handle="{ props }">
            <q-icon @click="remove('responeMsgList', null, props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs">
          <span @click="add('responeMsgList')" class="text-primary cursor-pointer">添加</span>
        </div>
      </section>
      <section>
        <iot-form-item
          :value.sync="forms.dataFrameFormat"
          :options="valueFormatOptions"
          label="数据帧格式"
          type="radio"
          style="padding-bottom: 0"
          vertical
        />
        <template v-if="forms.dataFrameFormat === 1">
          <q-card v-for="(t, i) in forms.tcpDecodeRuleList" :key="i" class="q-mt-md">
            <q-card-section>
              <div class="flex justify-between" style="font-size: 14px">
                <span>解析规则{{ i + 1 }}</span>
                <span @click="remove('tcpDecodeRuleList', i)" class="cursor-pointer text-negative">删除</span>
              </div>
              <q-separator class="q-my-md" />
              <iot-form-item :value.sync="t.useFlag" :options="switchNumberOptions" label="是否开启标志位" type="radio" vertical />
              <template v-if="t.useFlag">
                <div class="row">
                  <div class="col row q-mr-md">
                    <iot-form-item :value.sync="t.flagStart" label="起始位置" type="number" min="0" max="9999" class="col q-mr-md" vertical />
                    <iot-form-item :value.sync="t.flagLen" label="长度" type="number" min="0" max="9999" class="col" vertical />
                  </div>
                  <iot-form-item :value.sync="t.flagsValue" label="标志位信息" type="text" maxlength="32" class="col" vertical />
                </div>
              </template>
              <iot-form-item :value.sync="t.useCheck" :options="switchNumberOptions" label="是否开启校验位" type="radio" vertical />
              <template v-if="t.useCheck">
                <div class="row">
                  <iot-form-item :value.sync="t.checkKeyStart" label="起始位置" type="number" min="0" max="9999" class="col q-mr-md" vertical />
                  <iot-form-item :value.sync="t.checkKeyLen" label="长度" type="number" min="0" max="9999" class="col" vertical />
                </div>
              </template>
              <iot-table-simple :data="t.dataDecodeRuleFieldList" :columns="columns1">
                <template v-slot:handle="{ props }">
                  <q-icon
                    @click="remove('dataDecodeRuleFieldList', i, props.rowIndex)"
                    class="cursor-pointer text-negative"
                    name="delete_outline"
                    size="xs"
                  />
                </template>
              </iot-table-simple>
              <div class="q-pt-xs">
                <span @click="add('dataDecodeRuleFieldList', i)" class="text-primary cursor-pointer">添加</span>
              </div>
            </q-card-section>
          </q-card>
          <div class="q-pt-md">
            <span @click="add('tcpDecodeRuleList')" class="text-primary cursor-pointer">添加</span>
          </div>
        </template>
        <pre v-else class="q-mt-md">{{ surface.pre }}</pre>
      </section>
    </q-form>
    <!-- 添加 -->
    <add-dialog ref="addDialog" @confirm="onAdd" />
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extend } from 'quasar';
import AddDialog from './add.vue';
export default {
  components: {
    AddDialog
  },
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      protocolType: this.$route.query.protocolType,
      columns1: [],
      columns2: [],
      surface: {
        pre: {
          payload: [
            { code: '设备唯一标识', label1: '属性值1', label2: '属性值2' },
            { code: '设备唯一标识', label1: '属性值1', label2: '属性值2' }
          ]
        }
      },
      forms: {
        productId: this.$route.params.id,
        protocolId: this.$route.query.protocolId,
        reqMessage: '',
        reqEnCode: 4,
        decodeType: 1,
        fixedLength_decode: 1,
        delimiter_decode: '',
        parserEnCode: 4,
        tcpDecodeLengthField: {
          lengthFieldOffset: 1,
          initialBytesToStrip: 1,
          lengthFieldLength: 1,
          lengthAdjustment: 1
        },
        protocolDecodeJarId: '',
        dataFrameFormat: 1,
        tcpDecodeRuleList: [
          {
            useFlag: 0,
            useCheck: 0,
            dataDecodeRuleFieldList: []
          }
        ],
        responeMsgList: []
      },
      reqEnCodeOptions: [],
      valueFormatOptions: [],
      decodeTypeOptions: [],
      protocolDecodeJarIdOptions: [],
      switchNumberOptions: []
    };
  },
  validations: {},
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  mounted() {
    this.columns1 = [
      { label: '数据名称', name: 'name', field: 'name', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '文本起始位', name: 'fixedStart', field: 'fixedStart', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '字段长度', name: 'fixedLength', field: 'fixedLength', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '对应属性', name: 'productPropertyName', field: 'productPropertyName', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    this.columns2 = [
      { label: '接收格式', name: 'receive', field: 'receive', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '响应格式', name: 'response', field: 'response', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
  },
  methods: {
    open(protocol) {
      const p0 = extendApi.getDateItemByParentcode({ code: 'reqEnCode' });
      const p1 = extendApi.getDateItemByParentcode({ code: 'decodeType' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'valueFormat' });
      const p3 = extendApi.getDateItemByParentcode({ code: 'switchNumber' });
      const p4 = protocolApi.getProtocolList({ pageNum: 1, pageSize: 999, type: this.protocolType });
      Promise.all([p0, p1, p2, p3, p4]).then(response => {
        this.reqEnCodeOptions = response[0].map(e => ({ label: e.name, value: Number(e.code) }));
        this.decodeTypeOptions = response[1].map(e => ({ label: e.name, value: Number(e.code) }));
        this.valueFormatOptions = response[2].map(e => ({ label: e.name, value: Number(e.code) }));
        this.switchNumberOptions = response[3].map(e => ({ label: e.name, value: Number(e.code) }));
        this.protocolDecodeJarIdOptions = response[4].data;
        if (protocol.id || protocol.id === 0) {
          this.isCreate = false;
          this.forms = extend(true, {}, protocol);
        } else {
          this.isCreate = true;
          this.forms.protocolDecodeJarId = this.protocolDecodeJarIdOptions.length ? this.protocolDecodeJarIdOptions[0].id : '';
        }
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        protocolApi[this.isCreate ? 'addProtocolTcpClient' : 'updateProtocolTcpClient'](this.forms).then(response => {
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
    },
    add(name, index) {
      switch (name) {
        case 'tcpDecodeRuleList':
          this.forms.tcpDecodeRuleList.push({
            useFlag: 0,
            useCheck: 0,
            dataDecodeRuleFieldList: []
          });
          break;
        case 'dataDecodeRuleFieldList':
          this.index = index;
          this.$refs.addDialog.open(name);
          break;
        case 'responeMsgList':
          this.$refs.addDialog.open(name);
          break;
      }
    },
    remove(name, index, rowIndex) {
      switch (name) {
        case 'tcpDecodeRuleList':
          this.forms.tcpDecodeRuleList.splice(index, 1);
          break;
        case 'dataDecodeRuleFieldList':
          this.forms.tcpDecodeRuleList[index].dataDecodeRuleFieldList.splice(rowIndex, 1);
          break;
        case 'responeMsgList':
          this.forms.responeMsgList.splice(rowIndex, 1);
          break;
      }
    },
    onAdd(resolve) {
      switch (resolve.name) {
        case 'dataDecodeRuleFieldList':
          this.forms.tcpDecodeRuleList[this.index].dataDecodeRuleFieldList.push(resolve.forms);
          break;
        default:
          this.forms[resolve.name].push(resolve.forms);
      }
    }
  }
};
</script>
