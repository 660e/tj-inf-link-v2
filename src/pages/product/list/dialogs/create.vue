<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" maxlength="32" />
      <template v-if="isCreate">
        <iot-form-item :value.sync="forms.code" :validator="$v.forms.code" label="产品编码" type="text" maxlength="32" />
        <iot-form-item :value.sync="forms.modelId" :options="modelIdOptions" option-label="name" option-value="id" label="产品模型" type="select" />
        <iot-form-item :value.sync="forms.nodeType" :options="nodeTypeOptions" label="节点类型" type="radio" />
        <iot-form-item
          :value.sync="forms.agreementType"
          :validator="$v.forms.agreementType"
          :options="agreementTypeOptions"
          option-label="name"
          option-value="code"
          @input="agreementTypeInput"
          label="协议类型"
          type="select"
        />
        <iot-form-item
          :value.sync="forms.encoderClass"
          :validator="$v.forms.encoderClass"
          :options="encoderClassOptions"
          option-label="name"
          option-value="protocolCodeClass"
          label="协议编码"
          type="select"
        />
      </template>
      <template v-else>
        <iot-form-item :value="field.code" label="产品编码" type="field" />
        <iot-form-item :value="field.nodeType" label="节点类型" type="field" />
        <iot-form-item :value="field.agreementType" label="协议类型" type="field" />
        <iot-form-item :value="field.createTime" label="创建时间" type="field" />
      </template>
      <iot-form-item :value.sync="forms.describe" label="产品描述" type="textarea" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extend } from 'quasar';
export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        field: {},
        forms: {}
      },
      forms: {
        name: '',
        code: '',
        modelId: '',
        nodeType: 0,
        agreementType: 0,
        encoderClass: '',
        describe: ''
      },
      field: {
        code: '',
        nodeType: '',
        agreementType: '',
        createTime: ''
      },
      modelIdOptions: [],
      nodeTypeOptions: [],
      agreementTypeOptions: [],
      encoderClassOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      code: {
        required: requiredIf(function () {
          return this.isCreate;
        })
      },
      agreementType: {
        required: requiredIf(function () {
          return this.isCreate;
        })
      },
      encoderClass: {
        required: requiredIf(function () {
          return this.isCreate;
        })
      }
    }
  },
  created() {
    this.RESET = {
      field: extend(true, {}, this.field),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      const p0 = productsApi.getProductModelsAll();
      const p1 = extendApi.getDateItemByParentcode({ code: 'nodeType' });
      const p2 = extendApi.getDateItemByParentcode({ code: 'agreementType' });
      Promise.all([p0, p1, p2]).then(response => {
        this.modelIdOptions = response[0].data;
        this.nodeTypeOptions = response[1].map(e => ({ label: e.name, value: Number(e.code) }));
        this.agreementTypeOptions = response[2].map(e => ({ name: e.name, code: Number(e.code) }));
        if (!this.isCreate) {
          this.forms = extend(true, {}, row);
          const nodeType = this.nodeTypeOptions.find(e => e.value === this.forms.nodeType);
          const agreementType = this.agreementTypeOptions.find(e => e.code === this.forms.agreementType);
          this.field = {
            code: this.forms.code,
            nodeType: nodeType ? nodeType.label : '',
            agreementType: agreementType ? agreementType.name : '',
            createTime: this.forms.createTime
          };
        }
        this.agreementTypeInput(this.forms.agreementType);
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        productsApi[this.isCreate ? 'addProductMain' : 'updateProductInfo'](this.forms).then(response => {
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
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    },
    agreementTypeInput(value) {
      protocolApi.fixedtemplate(value).then(response => (this.encoderClassOptions = response.data));
    }
  }
};
</script>
