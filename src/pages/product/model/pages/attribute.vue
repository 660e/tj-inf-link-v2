<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '产品模型', name: 'product-model' }, { label: '属性' }]" />
    <iot-header :title="title" @back="back" back />
    <iot-toolbar :buttons="[{ label: '新增', command: 'create' }]" @handle="handle" @refresh="onRequest" />
    <iot-table :data="data" :columns="columns" @refresh="onRequest" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
    <create-dialog ref="createDialog" @confirm="onRequest" />
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
      title: this.$route.query.title,
      data: [],
      columns: []
    };
  },
  mounted() {
    this.columns = [
      { label: '属性名称', name: 'propertyName', field: 'propertyName', align: 'left' },
      { label: '标识符', name: 'label', field: 'label', align: 'left' },
      { label: '数据类型', name: 'typeName', field: 'typeName', align: 'left' },
      { label: '取值范围', name: 'propertyRange', field: 'propertyRange', align: 'left' },
      { label: '单位', name: 'unitName', field: 'unitName', align: 'left' },
      { label: '描述', name: 'describe', field: 'describe', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: '修改', command: 'edit' },
          { label: '删除', command: 'remove', color: 'negative' }
        ]
      }
    ];
    this.onRequest();
  },
  methods: {
    back() {
      this.$router.push({ name: 'product-model' });
    },
    onRequest() {
      productsApi.getProductsModelsProps({ modelId: this.$route.params.id }).then(response => {
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'edit':
          this.$refs.createDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.propertyName}`,
            ok: {
              text: '删除',
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.removeProductsModelsProps(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.onRequest();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
