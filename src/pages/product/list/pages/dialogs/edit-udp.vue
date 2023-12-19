<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form class="row">
      <section>
        <iot-form-item :value.sync="forms.parserEnCode" :options="reqEnCodeOptions" label="解析编码" type="radio" vertical />
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
            v-model.number="forms.udpClientOffline.interval"
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
        <div class="bg-grey-2 q-pa-sm">在默认解码规则下，如果设备不是固定IP，在UDP协议下，目前约定前15位是设备唯一标识。（如：IEMI编号）</div>
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
              <iot-table-simple :data="t.dataDecodeRuleFieldList" :columns="columns">
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
      protocolType: this.$route.query.protocolType,
      index: 0,
      columns: [],
      RESET: {
        forms: {}
      },
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
        parserEnCode: 4,
        protocolDecodeJarId: 0,
        udpClientOffline: {
          interval: 6
        },
        dataFrameFormat: 1,
        tcpDecodeRuleList: [
          {
            useFlag: 0,
            useCheck: 0,
            dataDecodeRuleFieldList: []
          }
        ]
      },
      reqEnCodeOptions: [],
      valueFormatOptions: [],
      protocolDecodeJarIdOptions: [],
      switchNumberOptions: []
    };
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  mounted() {
    this.columns = [
      { label: '数据名称', name: 'name', field: 'name', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '文本起始位', name: 'fixedStart', field: 'fixedStart', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '字段长度', name: 'fixedLength', field: 'fixedLength', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '对应属性', name: 'productPropertyName', field: 'productPropertyName', align: 'left', style: 'width: 90px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
  },
  methods: {
    open(protocol) {
      const p0 = extendApi.getDateItemByParentcode({ code: 'reqEnCode' });
      const p1 = extendApi.getDateItemByParentcode({ code: 'valueFormat' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'switchNumber' });
      const p3 = protocolApi.getProtocolList({ pageNum: 1, pageSize: 999, type: this.protocolType });
      Promise.all([p0, p1, p2, p3]).then(response => {
        this.reqEnCodeOptions = response[0].map(e => ({ label: e.name, value: Number(e.code) }));
        this.valueFormatOptions = response[1].map(e => ({ label: e.name, value: Number(e.code) }));
        this.switchNumberOptions = response[2].map(e => ({ label: e.name, value: Number(e.code) }));
        this.protocolDecodeJarIdOptions = response[3].data;
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
      this.$store.commit('loading', true);
      protocolApi[this.isCreate ? 'addProtocolUdp' : 'updateProtocolUdp'](this.forms).then(response => {
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
      }
    },
    onAdd(resolve) {
      this.forms.tcpDecodeRuleList[this.index].dataDecodeRuleFieldList.push(resolve.forms);
    }
  }
};
</script>
