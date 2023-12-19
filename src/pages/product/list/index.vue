<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '产品管理' }, { label: '产品列表' }]" />
    <iot-header title="产品列表" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '新增', command: 'create' },
            { label: '导出', command: 'export' },
            { label: '导入', command: 'import' },
            [
              { label: '批量发布', command: 'batch-release', filter: row => row.releaseStatus === 0, name: 'product-list' },
              { label: '批量撤销', command: 'batch-revoke', filter: row => row.releaseStatus === 1, name: 'product-list' },
              { label: '批量删除', command: 'batch-remove', filter: row => row.deviceCounts === 0 && row.releaseStatus === 0, name: 'product-list' }
            ]
          ]"
          :columns="columns"
          @handle="handle"
          @refresh="refresh"
        />
        <iot-table
          :data="data"
          :columns="columns"
          :visible-columns="visibleColumns"
          :pagination="pagination"
          @request="onRequest"
          name="product-list"
          sticky
        >
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 导入 -->
    <import-dialog ref="importDialog" @confirm="refresh" />
    <!-- 复制产品 -->
    <copy-dialog ref="copyDialog" @confirm="refresh" />
    <!-- 添加设备 -->
    <create-device-dialog ref="createDeviceDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { popconfirm } from '@/utils/framework.js';
import { exportFile } from '@/utils/data.js';

import CreateDialog from './dialogs/create.vue';
import CopyDialog from './dialogs/copy.vue';
import ImportDialog from './dialogs/import.vue';
import CreateDeviceDialog from '@/pages/device/list/dialogs/create.vue';

export default {
  name: 'product-list',
  components: {
    CreateDialog,
    CopyDialog,
    ImportDialog,
    CreateDeviceDialog
  },
  data() {
    return {
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    // 流程导图跳转
    if (this.$route.params.create === 'create') {
      this.$refs.createDialog.open();
    }
    // 初始化
    this.fields = [
      { label: '名称', key: 'name', type: 'input' },
      { label: '节点类型', key: 'nodeType', type: 'select', options: [], props: {} },
      { label: '协议类型', key: 'agreementType', type: 'select', options: [], props: {} }
    ];
    this.columns = [
      { label: '名称', required: true, name: 'name', field: 'name', align: 'left' },
      { label: '产品编码', name: 'code', field: 'code', align: 'left' },
      { label: '节点类型', name: 'nodeType', field: 'nodeType', align: 'left' },
      { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
      {
        label: '设备',
        name: 'deviceCounts',
        field: 'deviceCounts',
        align: 'left',
        event: row => {
          this.$router.push({
            name: 'device-list',
            query: {
              productId: row.id,
              nodeType: row.nodeType
            }
          });
        }
      },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
      {
        label: '状态',
        name: 'releaseStatus',
        field: 'releaseStatus',
        align: 'left',
        badge: val => {
          switch (val) {
            case 0:
              return 'negative';
            case 1:
              return 'positive';
          }
        }
      },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          { label: row => (row.releaseStatus === 0 ? '发布' : '撤销'), command: 'release' },
          { label: '详情', command: 'details' },
          { label: '添加设备', command: 'add' },
          [
            { label: '复制产品', command: 'copy' },
            { label: '规则管理', command: 'rule' },
            { label: '删除', command: 'remove', color: 'negative', show: row => row.deviceCounts === 0 && row.releaseStatus === 0 }
          ]
        ]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    extendApi.getDateItemBycodes(['nodeType', 'agreementType', 'releaseStatus']).then(response => {
      // nodeType
      this.fields.find(e => e.key === 'nodeType').options = response.nodeType;
      this.columns.find(e => e.name === 'nodeType').format = val => {
        return response.nodeType.find(e => e.value === val) ? response.nodeType.find(e => e.value === val).label : '-';
      };
      // agreementType
      this.fields.find(e => e.key === 'agreementType').options = response.agreementType;
      this.columns.find(e => e.name === 'agreementType').format = val => {
        return response.agreementType.find(e => e.value === val) ? response.agreementType.find(e => e.value === val).label : '-';
      };
      // releaseStatus
      this.columns.find(e => e.name === 'releaseStatus').format = val => {
        return response.releaseStatus.find(e => e.value === val) ? response.releaseStatus.find(e => e.value === val).label : '-';
      };
      this.search();
    });
  },
  methods: {
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
    search(filters) {
      this.filters = filters;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    },
    refresh() {
      this.onRequest(this.pagination);
    },
    handle({ command, row, columns, selected }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'export':
          productsApi.exportByProductId(this.filters || {}).then(response => exportFile(response, '产品列表.xlsx'));
          break;
        case 'import':
          this.$refs.importDialog.open();
          break;
        case 'release':
          popconfirm({
            message: `是否${row.releaseStatus === 0 ? '发布' : '撤销'}${row.name}`,
            ok: {
              color: row.releaseStatus === 0 ? 'positive' : 'negative'
            }
          }).onOk(() => {
            const params = {
              id: row.id,
              releaseStatus: row.releaseStatus === 0 ? 1 : 0
            };
            productsApi.updateProductReleaseStatus(params).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '操作成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'details':
          this.$router.push({
            name: 'product-list-details',
            params: {
              id: row.id
            },
            query: {
              tab: 1,
              protocolId: row.agreementId,
              protocolType: row.agreementType
            }
          });
          break;
        case 'copy':
          this.$refs.copyDialog.open(row);
          break;
        case 'add':
          this.$refs.createDeviceDialog.open({ productId: row.id, nodeType: row.nodeType });
          break;
        case 'rule':
          this.$router.push({
            name: 'alarm-rule',
            query: {
              productId: row.id
            }
          });
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.deleteProduct(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'visible-columns':
          this.visibleColumns = columns;
          break;
        case 'batch-release':
        case 'batch-revoke':
        case 'batch-remove': {
          let batch;
          let params;
          switch (command) {
            case 'batch-release':
            case 'batch-revoke':
              batch = productsApi.batchUpdateProductReleaseStatus;
              params = selected.map(e => {
                return {
                  productId: e.id,
                  releaseStatus: command === 'batch-release' ? 1 : 0
                };
              });
              break;
            case 'batch-remove':
              batch = productsApi.batchDeleteProduct;
              params = selected.map(e => e.id);
              break;
          }
          batch(params).then(response => {
            if (response) {
              this.$q.notify({
                type: response.httpCode === 200 ? 'positive' : 'negative',
                message: `批量处理${response.httpCode === 200 ? '成功' : '失败'}`
              });
              this.$store.commit('loading', false);
              this.$store.dispatch('batch/cancel');
              this.refresh();
            }
          });
          break;
        }
      }
    }
  }
};
</script>
