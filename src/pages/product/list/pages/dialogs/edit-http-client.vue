<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form class="row">
      <section>
        <!-- 登录模块 S -->
        <iot-form-item
          :value.sync="forms.requestAuthentication"
          :options="requestAuthenticationOptions"
          :clearable="false"
          label="认证方式"
          type="select"
          vertical
        />
        <template v-if="forms.requestAuthentication !== 0">
          <iot-form-item :value.sync="forms.loginUrl" :validator="$v.forms.loginUrl" label="认证URL" type="text" vertical />
          <iot-form-item :value.sync="forms.loginHttpMethod" :options="loginHttpMethodOptions" label="认证请求方法类型" type="radio" vertical />
          <iot-form-item
            v-if="forms.loginHttpMethod === 'POST'"
            :value.sync="forms.loginParamType"
            :options="requestParamTypeOptions"
            label="认证请求参数类型"
            type="radio"
            vertical
          />
          <iot-table-simple :data="surface.loginParamMap" :columns="columns1" title="认证请求参数">
            <template v-slot:handle="{ props }">
              <q-icon @click="remove('loginParamMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
            </template>
          </iot-table-simple>
          <div class="q-pt-xs q-pb-md">
            <span @click="add('loginParamMap')" class="text-primary cursor-pointer">添加</span>
          </div>
          <iot-table-simple :data="forms.loginResponseParseTemplateMap" :columns="columns2" title="认证返回解析模板">
            <template v-slot:handle="{ props }">
              <q-icon
                @click="remove('loginResponseParseTemplateMap', props.rowIndex)"
                class="cursor-pointer text-negative"
                name="delete_outline"
                size="xs"
              />
            </template>
          </iot-table-simple>
          <div class="q-pt-xs q-pb-md">
            <span @click="add('loginResponseParseTemplateMap', forms.loginResponseParseTemplateMap)" class="text-primary cursor-pointer">添加</span>
          </div>
          <iot-table-simple :data="forms.authParamPropertyMap" :columns="columns3" title="鉴权参数">
            <template v-slot:handle="{ props }">
              <q-icon @click="remove('authParamPropertyMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
            </template>
          </iot-table-simple>
          <div class="q-pt-xs q-pb-md">
            <span @click="add('authParamPropertyMap', forms.loginResponseParseTemplateMap)" class="text-primary cursor-pointer">添加</span>
          </div>
          <iot-form-item :value.sync="forms.tokenTimeout" label="Token失效时间（秒）" type="number" min="1" vertical />
        </template>
        <!-- 登录模块 E -->

        <!-- 数据请求模块 S -->
        <iot-form-item :value.sync="forms.dataUrl" :validator="$v.forms.dataUrl" label="数据请求URL" type="text" vertical />
        <iot-form-item :value.sync="forms.dataHttpMethod" :options="dataHttpMethodOptions" label="数据URL请求方式" type="radio" vertical />
        <iot-table-simple :data="surface.dataHeaderMap" :columns="columns4" title="header请求头数据">
          <template v-slot:handle="{ props }">
            <q-icon @click="remove('dataHeaderMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('dataHeaderMap', forms.dataHeaderMap)" class="text-primary cursor-pointer">添加</span>
        </div>
        <iot-form-item
          v-if="forms.dataHttpMethod === 'POST' || forms.dataHttpMethod === 'PUT'"
          :value.sync="forms.dataParamType"
          :options="requestParamTypeOptions"
          label="数据请求参数类型"
          type="radio"
          vertical
        />
        <iot-table-simple :data="surface.dataParamMap" :columns="columns1" title="数据请求参数">
          <template v-slot:handle="{ props }">
            <q-icon @click="remove('dataParamMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('dataParamMap')" class="text-primary cursor-pointer">添加</span>
        </div>
        <iot-table-simple :data="forms.dataResponseParseTemplateMap" :columns="columns2" title="数据返回解析模板">
          <template v-slot:handle="{ props }">
            <q-icon
              @click="remove('dataResponseParseTemplateMap', props.rowIndex)"
              class="cursor-pointer text-negative"
              name="delete_outline"
              size="xs"
            />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('dataResponseParseTemplateMap', forms.dataResponseParseTemplateMap)" class="text-primary cursor-pointer">添加</span>
        </div>
        <!-- 数据请求模块 E -->
      </section>
      <section>
        <!-- 状态请求模块 S -->
        <iot-form-item :value.sync="forms.stateUrl" label="状态请求URL" type="text" vertical />
        <iot-form-item :value.sync="forms.stateHttpMethod" :options="dataHttpMethodOptions" label="状态URL请求方式" type="radio" vertical />
        <iot-table-simple :data="surface.stateHeaderMap" :columns="columns4" title="header请求头数据">
          <template v-slot:handle="{ props }">
            <q-icon @click="remove('stateHeaderMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('stateHeaderMap', forms.stateHeaderMap)" class="text-primary cursor-pointer">添加</span>
        </div>
        <iot-form-item
          v-if="forms.stateHttpMethod === 'POST' || forms.stateHttpMethod === 'PUT'"
          :value.sync="forms.stateParamType"
          :options="requestParamTypeOptions"
          label="状态请求参数类型"
          type="radio"
          vertical
        />
        <iot-table-simple :data="surface.stateParamMap" :columns="columns1" title="状态请求参数">
          <template v-slot:handle="{ props }">
            <q-icon @click="remove('stateParamMap', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('stateParamMap')" class="text-primary cursor-pointer">添加</span>
        </div>
        <iot-table-simple :data="forms.stateResponseParseTemplateMap" :columns="columns2" title="状态返回解析模板">
          <template v-slot:handle="{ props }">
            <q-icon
              @click="remove('stateResponseParseTemplateMap', props.rowIndex)"
              class="cursor-pointer text-negative"
              name="delete_outline"
              size="xs"
            />
          </template>
        </iot-table-simple>
        <div class="q-pt-xs q-pb-md">
          <span @click="add('stateResponseParseTemplateMap', forms.stateResponseParseTemplateMap)" class="text-primary cursor-pointer">添加</span>
        </div>
        <!-- 状态请求模块 E -->

        <iot-form-item
          :value.sync="forms.protocolDecodeJarId"
          :options="protocolDecodeJarIdOptions"
          :clearable="false"
          option-label="name"
          option-value="id"
          label="解析插件"
          type="select"
          vertical
        />
        <iot-form-item :value.sync="forms.timeout" label="URL请求失效时间（秒）" type="number" min="1" vertical />
      </section>
    </q-form>
    <!-- 添加 -->
    <add-dialog ref="addDialog" @confirm="onAdd" />
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { required, requiredIf } from 'vuelidate/lib/validators';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

import { protocolApi } from '@/api/wsat-service-device/protocol.js';

import AddDialog from './add.vue';

export default {
  components: { AddDialog },
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        loginParamMap: [],
        dataHeaderMap: [],
        dataParamMap: [],
        stateHeaderMap: [],
        stateParamMap: []
      },
      forms: {
        productId: this.$route.params.id,
        protocolId: this.$route.query.protocolId,

        requestAuthentication: 0,
        loginUrl: '',
        loginHttpMethod: 'GET',
        loginParamMap: {},
        loginParamType: 'raw-json',
        loginResponseParseTemplateMap: [],
        authParamPropertyMap: [],
        tokenTimeout: 1800,

        dataUrl: '',
        dataHttpMethod: 'GET',
        dataHeaderMap: {},
        dataParamType: 'raw-json',
        dataParamMap: {},
        dataResponseParseTemplateMap: [],

        stateUrl: '',
        stateHttpMethod: 'GET',
        stateHeaderMap: {},
        stateParamType: 'raw-json',
        stateParamMap: {},
        stateResponseParseTemplateMap: [],

        protocolDecodeJarId: 0,
        timeout: 7200
      },

      requestAuthenticationOptions: [],
      loginHttpMethodOptions: [],
      requestParamTypeOptions: [],
      dataHttpMethodOptions: [],
      protocolDecodeJarIdOptions: [],

      columns1: [],
      columns2: [],
      columns3: [],
      columns4: []
    };
  },
  validations: {
    forms: {
      loginUrl: {
        required: requiredIf(function () {
          return this.forms.requestAuthentication !== 0;
        })
      },
      dataUrl: { required }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  mounted() {
    this.columns1 = [
      { label: '解析路径', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '数据类型', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    this.columns2 = [
      { label: '返回参数位置', name: 'respLocation', field: 'respLocation', align: 'left', style: 'width: 120px', classes: 'ellipsis' },
      { label: '返回数据对象格式', name: 'dataType', field: 'dataType', align: 'left', style: 'width: 120px', classes: 'ellipsis' },
      { label: '返回数据路径key', name: 'valueKey', field: 'valueKey', align: 'left', style: 'width: 120px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    this.columns3 = [
      { label: '鉴权URL返回参数值的key', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '数据请求URL中鉴权参数名的key', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    this.columns4 = [
      { label: 'key', name: 'key', field: 'key', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: 'value', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
  },
  methods: {
    open(protocol) {
      if (protocol.id || protocol.id === 0) {
        this.isCreate = false;

        this.surface.loginParamMap = Object.keys(protocol.loginParamMap).map(k => ({ key: k, value: protocol.loginParamMap[k] }));

        this.surface.dataHeaderMap = Object.keys(protocol.dataHeaderMap).map(k => ({ key: k, value: protocol.dataHeaderMap[k] }));
        this.surface.dataParamMap = Object.keys(protocol.dataParamMap).map(k => ({ key: k, value: protocol.dataParamMap[k] }));

        this.surface.stateHeaderMap = Object.keys(protocol.stateHeaderMap).map(k => ({ key: k, value: protocol.stateHeaderMap[k] }));
        this.surface.stateParamMap = Object.keys(protocol.stateParamMap).map(k => ({ key: k, value: protocol.stateParamMap[k] }));

        this.forms = extend(true, {}, protocol);
      } else {
        this.isCreate = true;
        this.forms.protocolDecodeJarId = this.protocolDecodeJarIdOptions.length ? this.protocolDecodeJarIdOptions[0].id : '';
      }
      const p0 = extendApi.getDateItemBycodes(['reqAuthentication', 'requestMode', 'requestParamType', 'httpMethod']);
      const p1 = protocolApi.getProtocolList({ pageNum: 1, pageSize: 999, type: this.$route.query.protocolType });
      Promise.all([p0, p1]).then(response => {
        this.requestAuthenticationOptions = response[0].reqAuthentication;
        this.loginHttpMethodOptions = response[0].requestMode;
        this.requestParamTypeOptions = response[0].requestParamType;
        this.dataHttpMethodOptions = response[0].httpMethod;
        this.protocolDecodeJarIdOptions = response[1].data;
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);

        this.forms.loginParamMap = {};
        this.surface.loginParamMap.forEach(e => (this.forms.loginParamMap[e.key] = e.value));

        this.forms.dataHeaderMap = {};
        this.surface.dataHeaderMap.forEach(e => (this.forms.dataHeaderMap[e.key] = e.value));
        this.forms.dataParamMap = {};
        this.surface.dataParamMap.forEach(e => (this.forms.dataParamMap[e.key] = e.value));

        this.forms.stateHeaderMap = {};
        this.surface.stateHeaderMap.forEach(e => (this.forms.stateHeaderMap[e.key] = e.value));
        this.forms.stateParamMap = {};
        this.surface.stateParamMap.forEach(e => (this.forms.stateParamMap[e.key] = e.value));

        protocolApi[this.isCreate ? 'addProtocolHttpClient' : 'updateProtocolHttpClient'](this.forms).then(response => {
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
      this.surface = extend(true, {}, this.RESET.surface);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    },
    add(name, source) {
      this.$refs.addDialog.open(name, source);
    },
    remove(name, index) {
      this[
        name === 'loginParamMap' || name === 'dataHeaderMap' || name === 'dataParamMap' || name === 'stateHeaderMap' || name === 'stateParamMap'
          ? 'surface'
          : 'forms'
      ][name].splice(index, 1);
    },
    onAdd(resolve) {
      this[
        resolve.name === 'loginParamMap' ||
        resolve.name === 'dataHeaderMap' ||
        resolve.name === 'dataParamMap' ||
        resolve.name === 'stateHeaderMap' ||
        resolve.name === 'stateParamMap'
          ? 'surface'
          : 'forms'
      ][resolve.name].push(resolve.forms);
    }
  }
};
</script>
