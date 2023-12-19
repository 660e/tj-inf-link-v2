<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="服务名称" type="text" maxlength="32" vertical />
      <iot-form-item :value.sync="forms.label" :validator="$v.forms.label" label="标识符" type="text" maxlength="32" vertical />
      <iot-table-simple :data="forms.serviceParameterList" :columns="columns" title="服务参数">
        <template v-slot:handle="{ props }">
          <q-icon @click="remove('serviceParameterList', props.rowIndex)" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
        </template>
      </iot-table-simple>
      <div class="q-pt-xs q-pb-md">
        <span @click="add('serviceParameterList')" class="text-primary cursor-pointer">添加</span>
      </div>
      <template v-if="protocolType === 5">
        <iot-form-item :value.sync="forms.httpUrl" label="服务请求URL" type="text" vertical />
        <iot-form-item :value.sync="forms.httpMethod" label="服务请求方式" :options="httpMethodOptions" type="radio" vertical />
        <iot-form-item :value.sync="forms.paramJson" label="自定义参数（JSON格式）" type="textarea" maxlength="100" vertical />
      </template>
      <iot-form-item :value.sync="forms.describe" label="备注" type="textarea" maxlength="100" vertical />
    </q-form>
    <!-- 添加 -->
    <add-dialog ref="addDialog" @confirm="onAdd" />
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
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
      protocolType: Number(this.$route.query.protocolType),
      columns: [],
      RESET: {
        forms: {}
      },
      forms: {
        productId: this.$route.params.id,
        name: '',
        label: '',
        serviceParameterList: [],
        httpUrl: '',
        httpMethod: 'PUT',
        paramJson: '',
        describe: ''
      },
      httpMethodOptions: []
    };
  },
  validations: {
    forms: {
      name: { required },
      label: { required }
    }
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  mounted() {
    this.columns = [
      { label: '属性名称', name: 'label', field: 'label', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '参数值', name: 'value', field: 'value', align: 'left', style: 'width: 180px', classes: 'ellipsis' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    extendApi.getDateItemByParentcode({ code: 'httpMethod' }).then(response => {
      this.httpMethodOptions = response.map(e => ({ label: e.name, value: e.code }));
    });
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.forms.serviceParameterList.length) {
          this.$store.commit('loading', true);
          productsApi[this.isCreate ? 'createProductsServices' : 'updateProductsServices'](this.forms).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
              this.$emit('confirm');
              this.cancel();
            }
          });
        } else {
          this.$q.notify({ type: 'warning', message: '至少选择一个服务参数' });
        }
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    },
    add(name) {
      this.$refs.addDialog.open(name);
    },
    remove(name, index) {
      this.forms[name].splice(index, 1);
    },
    onAdd(resolve) {
      this.forms[resolve.name].push(resolve.forms);
    }
  }
};
</script>
