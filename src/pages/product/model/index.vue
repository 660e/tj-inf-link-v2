<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '产品模型' }]" />
    <iot-header title="产品模型" />
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
    <!-- 新增 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { productsApi } from '@/api/wsat-service-device/products.js';
import { popconfirm } from '@/utils/framework.js';

import CreateDialog from './dialogs/create.vue';

export default {
  components: {
    CreateDialog
  },
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
      }
    };
  },
  mounted() {
    // 流程导图跳转，默认打开新增弹框
    if (this.$route.params.create === 'create') {
      this.$refs.createDialog.open();
    }
    this.fields = [
      { label: '模型名称', key: 'name', type: 'input' },
      { label: '模型分类', key: 'modelClassId', type: 'cascader', nodes: [], value: '', props: { label: 'name' } }
    ];
    this.columns = [
      { label: '模型名称', name: 'name', field: 'name', align: 'left' },
      { label: '模型描述', name: 'describe', field: 'describe', align: 'left' },
      { label: '所属模型分类', name: 'allModelClassName', field: 'allModelClassName', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: '修改', command: 'edit' },
          { label: '属性', command: 'attribute' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    productsApi.getProductsModelsTree().then(response => {
      this.fields.find(e => e.key === 'modelClassId').nodes = response.data;
      this.search();
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        page: pagination.page,
        size: pagination.rowsPerPage,
        ...this.filters
      };
      productsApi.getProductsModels(params).then(response => {
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
          this.$refs.createDialog.open();
          break;
        case 'edit':
          this.$refs.createDialog.open(row);
          break;
        case 'attribute':
          this.$router.push({ name: 'product-model-attribute', params: { id: row.id }, query: { title: row.name } });
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.removeProductsModels(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
