<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '产品列表', name: 'product-list' }, { label: '详情' }]" />
    <iot-header
      :title="product.name"
      :buttons="[
        [{ label: '修改', icon: 'edit', command: 'edit-product' }],
        [{ label: !this.product.releaseStatus ? '发布' : '撤销', command: 'release' }]
      ]"
      @handle="handle"
      @back="back"
      back
    />
    <q-list class="layout-details" dense>
      <q-item>
        <q-item-section>
          <span>产品编码：{{ product.code }}</span>
          <q-tooltip>{{ product.code }}</q-tooltip>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>产品模型：{{ product.modelName }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>协议类型：{{ valueComputed(product.agreementType, 'agreementType') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>节点类型：{{ valueComputed(product.nodeType, 'nodeType') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>设备数量：-</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>创建时间：{{ product.createTime }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>更新时间：{{ product.modifyTime }}</q-item-section>
      </q-item>
      <q-item />
      <q-item class="full-width">
        <q-item-section>产品描述：{{ product.describe }}</q-item-section>
      </q-item>
    </q-list>
    <q-tabs v-model="tab" @input="input" active-color="primary" align="left" class="text-grey" dense>
      <q-tab :name="1" label="属性" />
      <q-tab :name="2" label="事件" />
      <q-tab :name="3" label="服务" />
      <q-tab :name="4" label="协议" />
    </q-tabs>
    <q-separator />
    <div class="layout-content" style="flex: none" :style="{ height }">
      <div class="layout-main">
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel :name="1">
            <attribute-panel :release-status="product.releaseStatus" />
          </q-tab-panel>
          <q-tab-panel :name="2">
            <event-panel :release-status="product.releaseStatus" />
          </q-tab-panel>
          <q-tab-panel :name="3">
            <service-panel :release-status="product.releaseStatus" />
          </q-tab-panel>
          <q-tab-panel :name="4">
            <div class="q-pa-md">
              <iot-title :buttons="[{ label: '修改', command: 'edit-protocol', icon: 'edit' }]" @handle="handle" title="协议信息" />
              <q-list dense padding>
                <q-item>
                  <q-item-section>协议编码：{{ protocol.encoderClass }}</q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>备注：{{ protocol.describe }}</q-item-section>
                </q-item>
                <q-item v-if="[2, 3, 4, 5, 7].includes(protocolType)">
                  <q-item-section>离线规则：{{ protocol.offlineCount }}次</q-item-section>
                </q-item>
                <q-item v-if="[2, 3, 4, 5].includes(protocolType)">
                  <q-item-section>采集频率：{{ protocol.collectInterval }}秒</q-item-section>
                </q-item>
              </q-list>
              <template v-if="[0, 1, 2, 5, 6, 7, 8].includes(protocolType)">
                <tcp-server-panel v-if="protocolType === 1" :release-status="product.releaseStatus" />
                <modbus-tcp-panel v-if="protocolType === 2" :release-status="product.releaseStatus" />
                <http-client-panel v-if="protocolType === 5" :release-status="product.releaseStatus" />
                <udp-panel v-if="protocolType === 6" :release-status="product.releaseStatus" />
                <tcp-client-panel v-if="protocolType === 7" :release-status="product.releaseStatus" />
                <http-server-panel v-if="protocolType === 8" :release-status="product.releaseStatus" />
              </template>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <!-- 修改 -->
    <edit-product-dialog ref="editProductDialog" @confirm="getProductInfo" />
    <edit-protocol-dialog ref="editProtocolDialog" @confirm="getProtocolConfig" />
  </div>
</template>

<script>
import { productsApi } from '@/api/wsat-service-device/products.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import { extend } from 'quasar';

import EditProductDialog from '../dialogs/create.vue';
import EditProtocolDialog from './dialogs/edit-protocol.vue';
import HttpClientPanel from './panels/protocol/http-client.vue';
import HttpServerPanel from './panels/protocol/http-server.vue';
import ModbusTcpPanel from './panels/protocol/modbus-tcp.vue';
import TcpClientPanel from './panels/protocol/tcp-client.vue';
import TcpServerPanel from './panels/protocol/tcp-server.vue';
import UdpPanel from './panels/protocol/udp.vue';

import AttributePanel from './panels/attribute.vue';
import EventPanel from './panels/event.vue';
import ServicePanel from './panels/service.vue';

export default {
  components: {
    EditProductDialog,
    EditProtocolDialog,
    HttpClientPanel,
    HttpServerPanel,
    ModbusTcpPanel,
    TcpClientPanel,
    TcpServerPanel,
    UdpPanel,
    AttributePanel,
    EventPanel,
    ServicePanel
  },
  data() {
    return {
      id: this.$route.params.id,
      tab: Number(this.$route.query.tab),
      protocolId: this.$route.query.protocolId,
      protocolType: Number(this.$route.query.protocolType),
      product: {},
      protocol: {},
      computed: {
        nodeType: [],
        agreementType: []
      },
      height: 0
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['nodeType', 'agreementType']).then(response => {
      this.computed.nodeType = response.nodeType;
      this.computed.agreementType = response.agreementType;
    });
    this.getProductInfo();
    this.getProtocolConfig();
    this.height = `${document.querySelector('.layout-container').offsetHeight - document.querySelector('.layout-details').offsetHeight - 151}px`;
  },
  methods: {
    back() {
      const query = this.$route.query;
      switch (query.from) {
        case 'device-list-child':
          this.$router.push({ name: query.from, params: { id: query.pid } });
          break;
        default:
          this.$router.push({ name: query.from || 'product-list' });
      }
    },
    getProductInfo() {
      productsApi.getProductInfo(this.id).then(response => (this.product = response.data));
    },
    getProtocolConfig() {
      protocolApi.getProtocolConfig(this.protocolId).then(response => (this.protocol = response.data));
    },
    handle({ command }) {
      switch (command) {
        case 'release':
          popconfirm({
            message: `是否${this.product.releaseStatus === 0 ? '发布' : '撤销'}${this.product.name}`,
            ok: {
              color: this.product.releaseStatus === 0 ? 'positive' : 'negative'
            }
          }).onOk(() => {
            const params = {
              id: this.product.id,
              releaseStatus: this.product.releaseStatus === 0 ? 1 : 0
            };
            productsApi.updateProductReleaseStatus(params).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.getProductInfo();
              }
            });
          });
          break;
        case 'edit-product':
          this.$refs.editProductDialog.open(this.product);
          break;
        case 'edit-protocol':
          this.$refs.editProtocolDialog.open(this.protocol);
          break;
      }
    },
    input(value) {
      const query = extend(true, {}, this.$route.query);
      query.tab = value;
      this.$router.push({ query });
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => e.value === val);
      return item ? item.label : '-';
    }
  }
};
</script>
