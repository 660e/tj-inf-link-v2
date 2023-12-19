<template>
  <div class="window-height q-pa-md q-gutter-x-md flex">
    <div style="width: 300px">
      <iot-form-item v-for="(v, k) in forms" :key="k" :value.sync="forms[k]" :label="k" :validator="$v.forms[k]" type="text" vertical />
    </div>
    <q-separator vertical />
    <pre>{{ $v.forms }}</pre>
    <q-separator vertical />
    <pre>{{ random }}</pre>
  </div>
</template>

<script>
import { licensesApi } from '@/api/wsat-service-device/licenses.js';
import { requiredIf } from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      random: Math.random() > 0.5,
      forms: {}
    };
  },
  validations: {
    forms: {
      copyright: {
        required: requiredIf(function () {
          return this.random;
        })
      },
      authUnit: {
        required: requiredIf(function () {
          return !this.random;
        })
      }
    }
  },
  mounted() {
    licensesApi.getLicenseInfo().then(r => {
      ['effectiveDate', 'expiryDate', 'macAddress', 'productName', 'productVersion', 'serverIp', 'try'].forEach(k => delete r[k]);
      this.forms = r;
    });
  }
};
</script>
