<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '设备管理' }, { label: '数据标签' }]" />
    <iot-header title="数据标签" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar :buttons="[{ label: '新增', command: 'create' }]" @handle="handle" @refresh="refresh" />
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <q-dialog v-model="visible">
      <q-card class="q-pa-md" style="width: 300px">
        <q-input v-model="name" :error="$v.name.$error" error-message="必填项" label="标签名称" class="q-pb-md" dense outlined />
        <div class="flex justify-end">
          <div class="q-gutter-x-md">
            <q-btn @click="cancel" label="取消" />
            <q-btn @click="confirm" label="确定" color="primary" />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { datalabelsApi } from '@/api/wsat-service-device/datalabels.js';
import { popconfirm } from '@/utils/framework.js';
import { required } from 'vuelidate/lib/validators';

export default {
  data() {
    return {
      fields: [],
      filters: {},
      data: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      visible: false,
      name: ''
    };
  },
  validations: {
    name: { required }
  },
  mounted() {
    this.fields = [{ label: '数据标签名称', key: 'name', type: 'input' }];
    this.columns = [
      { label: '名称', name: 'tagname', field: 'tagname', align: 'left' },
      { label: '创建人', name: 'createdby', field: 'createdby', align: 'left' },
      { label: '创建日期', name: 'createdtime', field: 'createdtime', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [{ label: '删除', command: 'remove', color: 'negative' }]
      }
    ];
    this.search();
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      datalabelsApi.getlist(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.visible = true;
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.tagname}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            datalabelsApi.deleteDatalabel(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
      }
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        datalabelsApi
          .addDatalabel({
            name: this.name,
            username: this.$q.sessionStorage.getItem('account').name
          })
          .then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: '新增成功' });
              this.cancel();
              this.refresh();
            }
          });
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.$v.$reset();
    }
  }
};
</script>
