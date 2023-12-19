<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="详情" dense>
    <div class="layout-container">
      <q-list class="layout-details" dense>
        <q-item>
          <q-item-section>
            <span>名称：{{ product.name }}</span>
            <q-tooltip>{{ product.name }}</q-tooltip>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <span>序列号：{{ product.code }}</span>
            <q-tooltip>{{ product.code }}</q-tooltip>
          </q-item-section>
        </q-item>
      </q-list>
      <iot-toolbar :buttons="[{ label: '解绑', command: 'unbind' }]" @handle="handle" @refresh="refresh" />
      <iot-table
        :data="data"
        :selected="selected"
        :columns="columns"
        :pagination="pagination"
        @request="onRequest"
        @selected="onSelected"
        selection="multiple"
        title="已绑定产品列表"
        sticky
      >
        <template v-slot:handle="{ props }">
          <iot-table-handle :props="props" @handle="handle" />
        </template>
      </iot-table>
    </div>
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { linkageProductsApi } from '@/api/wsat-service-device/linkage-products.js';
import { popconfirm } from '@/utils/framework.js';
export default {
  data() {
    return {
      visible: false,
      product: {},
      data: [],
      selected: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 0,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.columns = [
      { label: '名称', name: 'name', field: 'name', align: 'left' },
      { label: '节点类型', name: 'nodeType', field: 'nodeType', align: 'left' },
      { label: '协议类型', name: 'agreementType', field: 'agreementType', align: 'left' },
      { label: '创建时间', name: 'createTime', field: 'createTime', align: 'left' },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [{ label: '详情', command: 'details' }]
      }
    ];
    const p0 = extendApi.getDateItemByParentcode({ code: 'nodeType' });
    const p1 = extendApi.getDateItemByParentcode({ code: 'agreementType' });
    Promise.all([p0, p1]).then(response => {
      this.columns.find(e => e.name === 'nodeType').format = val => {
        return response[0].find(e => Number(e.code) === val) ? response[0].find(e => Number(e.code) === val).name : '-';
      };
      this.columns.find(e => e.name === 'agreementType').format = val => {
        return response[1].find(e => Number(e.code) === val) ? response[1].find(e => Number(e.code) === val).name : '-';
      };
    });
  },
  methods: {
    open(row) {
      this.product = extend(true, {}, row);
      this.onRequest();
      this.visible = true;
    },
    onRequest() {
      this.$store.commit('loading', true);
      linkageProductsApi.linkageProductDetail(this.product.id).then(response => {
        this.data = response.data.bindProducts;
        this.pagination.rowsNumber = this.data.length;
        this.$store.commit('loading', false);
      });
    },
    onSelected(selected) {
      this.selected = selected;
    },
    refresh() {
      this.onRequest();
    },
    handle({ command, row }) {
      switch (command) {
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
        case 'unbind':
          if (this.selected.length) {
            popconfirm({
              message: `是否解绑${this.selected.map(e => e.name).join('；')}`,
              ok: {
                color: 'negative'
              }
            }).onOk(() => {
              linkageProductsApi
                .unboundLinkageProduct({
                  productIds: this.selected.map(e => e.id),
                  linkageProductId: this.product.id
                })
                .then(response => {
                  if (response) {
                    this.$q.notify({ type: 'positive', message: '解绑成功' });
                    this.refresh();
                  }
                });
            });
          }
          break;
        case 'cancel':
          this.visible = false;
          this.$store.commit('loading', false);
          this.pagination.rowsNumber = 0;
          this.$emit('confirm');
          break;
      }
    }
  }
};
</script>
