<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel" dense>
    <q-form class="row" style="height: 152px">
      <div class="col q-mr-md">
        <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" maxlength="32" />
        <iot-form-item
          :value.sync="forms.linkageProductId"
          :validator="$v.forms.linkageProductId"
          :options="linkageProductIdOptions"
          @input="input"
          option-label="name"
          option-value="id"
          label="联动产品"
          type="select"
        />
      </div>
      <div class="col">
        <iot-form-item v-if="isCreate" :value.sync="forms.code" label="序列号" type="text" maxlength="32" />
        <iot-form-item v-else :value="field.code" label="序列号" type="field" />
      </div>
    </q-form>
    <q-separator class="q-mx-md" />
    <div class="col flex column">
      <iot-searchbar :fields="fields" @search="search" />
      <div class="col row">
        <iot-table
          :data="data"
          :selected="selected"
          :columns="columns"
          :pagination="pagination"
          @request="onRequest"
          @selected="onSelected"
          title="绑定设备（最少两项）"
          selection="multiple"
        />
      </div>
    </div>
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { required } from 'vuelidate/lib/validators';
import { linkageDevicesApi } from '@/api/wsat-service-device/linkage-devices.js';
import { linkageProductsApi } from '@/api/wsat-service-device/linkage-products.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        field: {},
        forms: {}
      },
      field: {
        code: ''
      },
      forms: {
        name: '',
        code: '',
        linkageProductId: '',
        correlationIds: []
      },
      linkageProductIdOptions: [],
      fields: [],
      filters: {},
      data: [],
      selected: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  validations: {
    forms: {
      name: { required },
      linkageProductId: { required }
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
    const p0 = linkageProductsApi.linkageProductAllList();
    const p1 = extendApi.getDateItemByParentcode({ code: 'agreementType' });
    Promise.all([p0, p1]).then(response => {
      this.linkageProductIdOptions = response[0].data;
      this.columns.find(e => e.name === 'agreementType').format = val => {
        return response[1].find(e => Number(e.code) === val) ? response[1].find(e => Number(e.code) === val).name : '-';
      };
    });
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
        this.field.code = this.forms.code;
        linkageDevicesApi.linkageDeviceDetail(row.id).then(response => {
          this.selected = response.data.bindDevices;
          this.forms.correlationIds = this.selected.map(e => e.id);
          this.onRequest(this.pagination);
        });
      }
      this.visible = true;
    },
    onRequest(pagination) {
      if (this.forms.linkageProductId) {
        this.$store.commit('loading', true);
        const params = {
          productId: this.forms.linkageProductId,
          pageNum: pagination.page,
          pageSize: pagination.rowsPerPage,
          ...this.filters
        };
        linkageProductsApi.getdeviceListByLKProductIdPage(params).then(response => {
          this.pagination.page = response.current;
          this.pagination.rowsPerPage = response.size;
          this.pagination.rowsNumber = response.total;
          this.data = response.data;
          this.$store.commit('loading', false);
        });
      }
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    onSelected(selected) {
      this.forms.correlationIds = selected.map(e => e.id);
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.forms.correlationIds.length > 1) {
          this.$store.commit('loading', true);
          linkageDevicesApi[this.isCreate ? 'addLinkageDevice' : 'updateLinkageDevice'](this.forms).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
              this.$emit('confirm');
              this.cancel();
            }
          });
        } else {
          this.$q.notify({ type: 'warning', message: '最少绑定两项设备' });
        }
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
      this.fields.find(e => e.key === 'name').value = '';
      this.filters = {};
      this.data = [];
      this.selected = [];
      this.pagination.rowsNumber = 0;
      this.$v.$reset();
    },
    input() {
      this.$nextTick(() => {
        this.selected = [];
        this.onRequest(this.pagination);
      });
    }
  }
};
</script>
