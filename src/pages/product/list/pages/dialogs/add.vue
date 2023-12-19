<template>
  <q-dialog v-model="visible">
    <q-card class="q-pa-md" style="width: 300px">
      <div class="q-gutter-y-md">
        <!--  -->
        <template v-if="name === 'authParamPropertyMap'">
          <q-select v-model="forms.key" label="鉴权URL返回参数值的key" :options="keyOptions" dense emit-value hide-bottom-space outlined />
          <q-input v-model="forms.value" label="数据请求URL中鉴权参数名的key" dense hide-bottom-space outlined />
        </template>
        <!--  -->
        <template v-if="name === 'dataDecodeRuleFieldList'">
          <q-input v-model="forms.name" label="数据名称" dense hide-bottom-space outlined />
          <q-input v-model="forms.fixedStart" label="文本起始位" dense hide-bottom-space outlined />
          <q-input v-model="forms.fixedLength" label="字段长度" dense hide-bottom-space outlined />
          <q-select
            v-model="surface.productProperty"
            label="对应属性"
            :options="productPropertyOptions"
            option-label="name"
            dense
            hide-bottom-space
            outlined
          />
        </template>
        <!--  -->
        <template v-if="name === 'responeMsgList'">
          <q-input v-model="forms.receive" label="接收格式" dense hide-bottom-space outlined />
          <q-input v-model="forms.response" label="响应格式" dense hide-bottom-space outlined />
        </template>
        <!--  -->
        <template v-if="name === 'serviceParameterList'">
          <q-btn-toggle
            v-model="mode"
            :options="[
              { label: '选择已有', value: 1 },
              { label: '手动输入', value: 2 }
            ]"
          />
          <q-select
            v-if="mode === 1"
            v-model="surface.productProperty"
            label="属性名称"
            :options="productPropertyOptions"
            option-label="name"
            dense
            hide-bottom-space
            outlined
          />
          <q-input v-else v-model="forms.label" label="属性名称" dense hide-bottom-space outlined />
          <q-input v-model="forms.value" label="参数值" dense hide-bottom-space outlined />
          <q-select
            v-if="mode === 2"
            v-model.number="forms.type"
            :options="typeOptions"
            label="类型"
            dense
            emit-value
            hide-bottom-space
            map-options
            outlined
          />
        </template>
        <!--  -->
        <template
          v-if="
            name === 'dataParamMap' || name === 'loginParamMap' || name === 'dataHeaderMap' || name === 'stateHeaderMap' || name === 'stateParamMap'
          "
        >
          <q-input v-model="forms.key" label="参数名" dense hide-bottom-space outlined />
          <q-input v-model="forms.value" label="参数值" dense hide-bottom-space outlined />
        </template>
        <!--  -->
        <template v-if="name === 'loginResponseParseTemplateMap'">
          <q-select v-model="forms.respLocation" label="返回参数位置" :options="['headers', 'body']" dense hide-bottom-space outlined />
          <q-select v-model="forms.dataType" label="返回数据对象格式" :options="['String', 'Map']" dense hide-bottom-space outlined />
          <q-input v-model="forms.valueKey" label="返回数据路径key" hint="例：access_token、data/hostList" dense outlined />
        </template>
        <!--  -->
        <template v-if="name === 'dataResponseParseTemplateMap' || name === 'stateResponseParseTemplateMap'">
          <q-select v-model="forms.respLocation" label="返回参数位置" :options="['headers', 'body']" dense hide-bottom-space outlined />
          <q-select v-model="forms.dataType" label="返回数据对象格式" :options="['Map', 'List']" dense hide-bottom-space outlined />
          <q-input v-model="forms.valueKey" label="返回数据路径key" hint="例：access_token、data/hostList" dense outlined />
        </template>
      </div>
      <div class="q-pt-md flex justify-end">
        <div class="q-gutter-x-md">
          <q-btn @click="cancel" label="取消" />
          <q-btn @click="confirm" label="确定" color="primary" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { productsApi } from '@/api/wsat-service-device/products.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';

export default {
  data() {
    return {
      visible: false,
      productId: this.$route.params.id,
      name: '',
      mode: 1,
      source: null,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        productProperty: ''
      },
      forms: {},
      productPropertyOptions: [],
      keyOptions: [],
      typeOptions: []
    };
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(name, source) {
      this.name = name;
      switch (this.name) {
        case 'dataDecodeRuleFieldList':
        case 'serviceParameterList':
          productsApi.getProductPropertyList({ id: this.productId }).then(response => (this.productPropertyOptions = response.data));
          extendApi.getDateItemBycodes(['dataType']).then(response => (this.typeOptions = response.dataType));
          break;
        case 'loginResponseParseTemplateMap':
        case 'dataResponseParseTemplateMap':
        case 'stateResponseParseTemplateMap':
          this.source = source;
          break;
        case 'authParamPropertyMap':
          this.keyOptions = source.map(e => ({ label: e.valueKey, value: e.valueKey }));
          break;
      }
      this.visible = true;
    },
    confirm() {
      switch (this.name) {
        case 'authParamPropertyMap':
        case 'dataParamMap':
        case 'loginParamMap':
        case 'dataHeaderMap':
        case 'stateHeaderMap':
        case 'stateParamMap':
          this.verify(['key', 'value']);
          break;
        case 'loginResponseParseTemplateMap':
        case 'dataResponseParseTemplateMap':
        case 'stateResponseParseTemplateMap':
          if (this.source.some(e => e.valueKey === this.forms.valueKey)) {
            this.$q.notify({ type: 'warning', message: '返回数据路径key不可重复' });
          } else {
            this.verify(['respLocation', 'dataType', 'valueKey']);
          }
          break;
        case 'dataDecodeRuleFieldList':
          this.forms.productPropertyId = this.surface.productProperty.id;
          this.forms.productPropertyLabel = this.surface.productProperty.label;
          this.forms.productPropertyName = this.surface.productProperty.name;
          this.forms.productPropertyDataType = this.surface.productProperty.type;
          this.forms.productPropertyDataTypeName = this.surface.productProperty.dataTypeName;
          this.verify(['name', 'fixedStart', 'fixedLength', 'productPropertyId']);
          break;
        case 'responeMsgList':
          this.verify(['receive', 'response']);
          break;
        case 'serviceParameterList':
          if (this.mode === 1) {
            this.forms.label = this.surface.productProperty.label;
            this.forms.type = this.surface.productProperty.type;
            this.forms.agreementFieldLabel = this.surface.productProperty.id;
            this.verify(['label', 'value']);
          } else {
            this.verify(['label', 'value']);
          }
          break;
      }
    },
    cancel() {
      this.visible = false;
      this.source = null;
      this.mode = 1;
      this.surface = extend(true, {}, this.RESET.surface);
      this.forms = extend(true, {}, this.RESET.forms);
    },
    verify(keys) {
      if (keys.every(k => !!this.forms[k])) {
        this.$emit('confirm', { name: this.name, forms: this.forms });
        this.cancel();
      } else {
        this.$q.notify({ type: 'warning', message: '表单填写不完整' });
      }
    }
  }
};
</script>
