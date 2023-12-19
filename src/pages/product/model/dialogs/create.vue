<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="模型名称" type="text" maxlength="32" />
      <iot-form-item
        :value.sync="forms.modelClassID"
        :validator="$v.forms.modelClassID"
        :nodes="nodes"
        label="模型分类"
        type="cascader"
        label-key="name"
      />
      <iot-form-item :value.sync="forms.describe" label="模型描述" type="textarea" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { flattenTree } from '@/utils/data.js';
import { productsApi } from '@/api/wsat-service-device/products.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        name: '',
        modelClassID: '',
        describe: ''
      },
      nodes: [],
      items: []
    };
  },
  validations: {
    forms: {
      name: { required },
      modelClassID: { required }
    }
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      productsApi.getProductsModelsTree().then(response => {
        this.nodes = response.data;
        this.items = flattenTree(this.nodes);
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.forms.allModelClassName = this.items.find(e => e.id === this.forms.modelClassID).name;
        productsApi[this.isCreate ? 'addProductModel' : 'editProductsModels'](this.forms).then(response => {
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
    }
  }
};
</script>
