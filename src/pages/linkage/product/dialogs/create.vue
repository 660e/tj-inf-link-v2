<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel" dense>
    <q-form class="row">
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" width="60" maxlength="32" class="col q-mr-md" />
      <iot-form-item v-if="isCreate" :value.sync="forms.code" label="序列号" type="text" width="60" maxlength="32" class="col" />
      <iot-form-item v-else :value="field.code" label="序列号" type="field" width="60" class="col" />
    </q-form>
    <q-separator class="q-mx-md" />
    <div class="col flex column row">
      <iot-searchbar :fields="fields" @search="search" />
      <iot-table
        :data="data"
        :selected="selected"
        :columns="columns"
        :pagination="pagination"
        @request="onRequest"
        @selected="onSelected"
        title="绑定产品（最少两项）"
        selection="multiple"
      />
    </div>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { linkageProductsApi } from '@/api/wsat-service-device/linkage-products.js';
import { productsApi } from '@/api/wsat-service-device/products.js';

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
        correlationIds: []
      },
      field: {
        code: ''
      },
      fields: [],
      filters: {},
      data: [],
      selected: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  validations: {
    forms: {
      name: { required }
    }
  },
  created() {
    this.RESET = {
      field: extend(true, {}, this.field),
      forms: extend(true, {}, this.forms)
    };
  },
  mounted() {
    this.fields = [{ label: '名称', key: 'name', type: 'input' }];
    this.columns = [
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '节点类型', name: 'nodeType', field: 'nodeType', align: 'left' },
      { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' }
    ];
    extendApi.getDateItemBycodes(['nodeType', 'agreementType']).then(response => {
      this.columns.find(e => e.name === 'nodeType').format = val => {
        return response.nodeType.find(e => e.value === val) ? response.nodeType.find(e => e.value === val).label : '-';
      };
      this.columns.find(e => e.name === 'agreementType').format = val => {
        return response.agreementType.find(e => e.value === val) ? response.agreementType.find(e => e.value === val).label : '-';
      };
    });
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
        this.field.code = this.forms.code;
        linkageProductsApi.linkageProductDetail(row.id).then(response => {
          this.selected = response.data.bindProducts;
          this.forms.correlationIds = this.selected.map(e => e.id);
          this.search();
        });
      } else {
        this.search();
      }
      this.visible = true;
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      productsApi.getProductList(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    onSelected(selected) {
      this.forms.correlationIds = selected.map(e => e.id);
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.forms.correlationIds.length > 1) {
          this.$store.commit('loading', true);
          linkageProductsApi[this.isCreate ? 'addLinkageProduct' : 'updateLinkageProduct'](this.forms).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
              this.$emit('confirm');
              this.cancel();
            }
          });
        } else {
          this.$q.notify({ type: 'warning', message: '最少绑定两项产品' });
        }
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
      this.selected = [];
      this.pagination.rowsNumber = 0;
      this.$v.$reset();
    }
  }
};
</script>
