<template>
  <div class="q-pt-md">
    <iot-title :buttons="[{ label: '修改', command: 'edit', icon: 'edit', show: !releaseStatus }]" @handle="edit" title="解析规则" />
    <q-list dense padding>
      <!-- 登录模块 S -->
      <q-item>
        <q-item-section>认证方式：{{ valueComputed(protocol.requestAuthentication, 'requestAuthentication') }}</q-item-section>
      </q-item>
      <template v-if="protocol.requestAuthentication !== 0">
        <q-item>
          <q-item-section>认证URL：{{ protocol.loginUrl }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>认证请求方法类型：{{ protocol.loginHttpMethod }}</q-item-section>
        </q-item>
        <q-item v-if="protocol.loginHttpMethod === 'POST'">
          <q-item-section>认证请求参数类型：{{ valueComputed(protocol.loginParamType, 'loginParamType') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>认证请求参数：</q-item-section>
        </q-item>
        <q-item>
          <iot-table-simple :data="protocol._loginParamMap" :columns="columns1" />
        </q-item>
        <q-item>
          <q-item-section>认证返回解析模板：</q-item-section>
        </q-item>
        <q-item>
          <iot-table-simple :data="protocol.loginResponseParseTemplateMap" :columns="columns2" />
        </q-item>
        <q-item>
          <q-item-section>鉴权参数：</q-item-section>
        </q-item>
        <q-item>
          <iot-table-simple :data="protocol.authParamPropertyMap" :columns="columns3" />
        </q-item>
        <q-item>
          <q-item-section>Token失效时间：{{ protocol.tokenTimeout }}秒</q-item-section>
        </q-item>
      </template>
      <!-- 登录模块 E -->

      <!-- 数据请求模块 S -->
      <q-item>
        <q-item-section>数据请求URL：{{ protocol.dataUrl }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>数据URL请求方式：{{ protocol.dataHttpMethod }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>header请求头数据：</q-item-section>
      </q-item>
      <q-item>
        <iot-table-simple :data="protocol._dataHeaderMap" :columns="columns4" />
      </q-item>
      <q-item v-if="protocol.dataHttpMethod === 'POST' || protocol.dataHttpMethod === 'GET'">
        <q-item-section>数据请求参数类型：{{ valueComputed(protocol.dataParamType, 'loginParamType') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>数据返回解析模板：</q-item-section>
      </q-item>
      <q-item>
        <iot-table-simple :data="protocol.dataResponseParseTemplateMap" :columns="columns2" />
      </q-item>
      <!-- 数据请求模块 E -->

      <!-- 状态请求模块 S -->
      <q-item>
        <q-item-section>状态请求URL：{{ protocol.stateUrl }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>状态URL请求方式：{{ protocol.stateHttpMethod }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>header请求头数据：</q-item-section>
      </q-item>
      <q-item>
        <iot-table-simple :data="protocol._stateHeaderMap" :columns="columns4" />
      </q-item>
      <q-item v-if="protocol.stateHttpMethod === 'POST' || protocol.stateHttpMethod === 'GET'">
        <q-item-section>状态请求参数类型：{{ valueComputed(protocol.stateParamType, 'loginParamType') }}</q-item-section>
      </q-item>
      <q-item>
        <q-item-section>状态返回解析模板：</q-item-section>
      </q-item>
      <q-item>
        <iot-table-simple :data="protocol.stateResponseParseTemplateMap" :columns="columns2" />
      </q-item>
      <!-- 状态请求模块 E -->

      <q-item>
        <q-item-section>URL请求失效时间：{{ protocol.timeout }}秒</q-item-section>
      </q-item>
    </q-list>
    <!-- 修改 -->
    <edit-http-client-dialog ref="editHttpClientDialog" @confirm="getProtocolHttpClientVo" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

import EditHttpClientDialog from '../../dialogs/edit-http-client.vue';

export default {
  components: { EditHttpClientDialog },
  props: {
    releaseStatus: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      protocol: {},
      columns1: [],
      columns2: [],
      columns3: [],
      columns4: [],
      computed: {
        requestAuthentication: [],
        loginParamType: []
      }
    };
  },
  mounted() {
    this.columns1 = [
      { label: '解析路径', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '数据类型', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' }
    ];
    this.columns2 = [
      { label: '返回参数位置', name: 'respLocation', field: 'respLocation', align: 'left', style: 'width: 120px', classes: 'ellipsis' },
      { label: '返回数据对象格式', name: 'dataType', field: 'dataType', align: 'left', style: 'width: 120px', classes: 'ellipsis' },
      { label: '返回数据路径key', name: 'valueKey', field: 'valueKey', align: 'left', style: 'width: 120px', classes: 'ellipsis' }
    ];
    this.columns3 = [
      { label: '鉴权URL返回参数值的key', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '数据请求URL中鉴权参数名的key', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' }
    ];
    this.columns4 = [
      { label: 'key', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: 'value', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' }
    ];
    this.getProtocolHttpClientVo();
  },
  methods: {
    getProtocolHttpClientVo() {
      const p0 = protocolApi.getProtocolHttpClientVo(this.$route.query.protocolId);
      const p1 = extendApi.getDateItemBycodes(['reqAuthentication', 'requestParamType']);
      Promise.all([p0, p1]).then(response => {
        this.protocol = response[0].data || {};

        this.protocol._loginParamMap = Object.keys(this.protocol.loginParamMap).map(k => ({ key: k, value: this.protocol.loginParamMap[k] }));
        this.protocol._dataHeaderMap = Object.keys(this.protocol.dataHeaderMap).map(k => ({ key: k, value: this.protocol.dataHeaderMap[k] }));
        this.protocol._stateHeaderMap = Object.keys(this.protocol.stateHeaderMap).map(k => ({ key: k, value: this.protocol.stateHeaderMap[k] }));

        this.computed.requestAuthentication = response[1].reqAuthentication;
        this.computed.loginParamType = response[1].requestParamType;
      });
    },
    edit() {
      this.$refs.editHttpClientDialog.open(this.protocol);
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => e.value === val);
      return item ? item.label : '-';
    }
  }
};
</script>
