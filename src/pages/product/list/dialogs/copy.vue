<template>
  <iot-dialog :visible="visible" :width="500" title="复制产品" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item
        :value.sync="surface.hasName"
        :options="[
          { label: '是', value: true },
          { label: '否', value: false }
        ]"
        label="是否添加名称"
        type="radio"
        vertical
      />
      <iot-form-item v-if="surface.hasName" :value.sync="forms.productName" :validator="$v.forms.productName" label="名称" type="text" vertical />
      <iot-form-item :value.sync="forms.code" :validator="$v.forms.code" label="编码" type="text" vertical />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { productsApi } from '@/api/wsat-service-device/products.js';
export default {
  data() {
    return {
      visible: false,
      id: '',
      surface: {
        hasName: true
      },
      forms: {
        productName: '',
        code: ''
      }
    };
  },
  validations: {
    forms: {
      productName: {
        requiredIf: requiredIf(function () {
          return this.surface.hasName;
        })
      },
      code: { required }
    }
  },
  methods: {
    open(row) {
      this.id = row.id;
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        productsApi.copyProduct(this.id, this.forms.productName, this.forms.code).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: '复制成功' });
            this.$emit('confirm');
            this.cancel();
          }
        });
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.surface = {
        hasName: true
      };
      this.forms = {
        productName: '',
        code: ''
      };
      this.$v.$reset();
    }
  }
};
</script>
