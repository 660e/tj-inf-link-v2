<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '模型分类' }]" />
    <iot-header title="模型分类" />
    <div class="layout-content">
      <iot-tree
        :nodes="nodes"
        :default-expanded="defaultExpanded"
        :default-selected="defaultSelected"
        :buttons="[
          { command: 'edit', icon: 'edit', show: node => node.id !== 0 },
          { command: 'create', icon: 'add' },
          { command: 'remove', icon: 'remove', show: node => node.id !== 0 }
        ]"
        @selected="selected"
        @handle="handle"
        filter
      />
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
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
      nodes: [
        {
          id: 0,
          name: 'ROOT',
          children: []
        }
      ],
      defaultExpanded: [0],
      defaultSelected: 0,
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
    this.fields = [{ label: '分类名称', key: 'name', type: 'input' }];
    this.columns = [
      { label: '分类名称', name: 'name', field: 'name', align: 'left' },
      { label: '描述', name: 'describe', field: 'describe', align: 'left' },
      { label: '创建日期', name: 'createTime', field: 'createTime', align: 'left', format: val => (val ? val.slice(0, 19).replace('T', ' ') : '-') }
    ];
    productsApi.getProductsModelsTree().then(response => {
      this.nodes[0].children = response.data;
      if (response.data.length) {
        this.defaultSelected = this.nodes[0].children[0].id;
      }
      this.$router.push({ query: { pid: this.defaultSelected } });
      this.search();
    });
  },
  methods: {
    selected({ selected }) {
      this.defaultSelected = selected;
      this.$router.push({ query: { pid: selected } });
      this.search();
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
        pid: this.$route.query.pid,
        ...this.filters
      };
      productsApi.getModelsClassChildren(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    refresh() {
      productsApi.getProductsModelsTree().then(response => (this.nodes[0].children = response.data));
      this.onRequest(this.pagination);
    },
    handle({ command, node }) {
      switch (command) {
        case 'create':
        case 'edit':
          this.$refs.createDialog.open(command, node);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${node.name}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.removeModelsClass(node.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.selected({ selected: node.pid });
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
