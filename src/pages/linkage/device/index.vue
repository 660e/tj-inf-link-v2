<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="联动设备" />
    <div class="layout-content">
      <div class="layout-main">
        <iot-searchbar :fields="fields" @search="search" />
        <iot-toolbar
          :buttons="[
            { label: '新增', command: 'create' },
            { label: '导出', command: 'export' }
          ]"
          :columns="columns"
          @handle="handle"
          @refresh="refresh"
        />
        <iot-table :data="data" :columns="columns" :visible-columns="visibleColumns" :pagination="pagination" @request="onRequest" sticky>
          <template v-slot:handle="{ props }">
            <iot-table-handle :props="props" @handle="handle" />
          </template>
        </iot-table>
      </div>
    </div>
    <!-- 新增 -->
    <create-dialog ref="createDialog" @confirm="refresh" />
    <!-- 详情 -->
    <details-dialog ref="detailsDialog" @confirm="refresh" />
  </div>
</template>

<script>
import { popconfirm } from '@/utils/framework.js';
import { exportFile } from '@/utils/data.js';
import CreateDialog from './dialogs/create.vue';
import DetailsDialog from './dialogs/details.vue';
import { linkageDevicesApi } from '@/api/wsat-service-device/linkage-devices.js';
export default {
  components: {
    CreateDialog,
    DetailsDialog
  },
  data() {
    return {
      breadcrumbs: [],
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.breadcrumbs = [{ label: '场景联动' }, { label: '联动设备' }];
    this.fields = [
      {
        label: '名称',
        key: 'name',
        type: 'input'
      }
    ];
    this.columns = [
      {
        label: '名称',
        required: true,
        name: 'name',
        field: 'name',
        align: 'left'
      },
      {
        label: '序列号',
        name: 'code',
        field: 'code',
        align: 'left',
        style: 'width: 200px',
        classes: 'ellipsis'
      },
      {
        label: '所属联动产品',
        name: 'linkageProductName',
        field: 'linkageProductName',
        align: 'left',
        style: 'width: 200px',
        classes: 'ellipsis'
      },
      {
        label: '已绑定设备名称',
        name: 'deviceNames',
        field: 'deviceNames',
        align: 'left',
        format: val => (val ? val.split(',').join('；') : ''),
        style: 'width: 300px',
        classes: 'ellipsis'
      },
      {
        label: '创建时间',
        name: 'createTime',
        field: 'createTime',
        align: 'left'
      },
      {
        label: '操作',
        required: true,
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px',
        handles: [
          {
            label: '复制',
            command: 'copy'
          },
          {
            label: '详情',
            command: 'details'
          },
          {
            label: '修改',
            command: 'edit'
          },
          {
            label: '删除',
            command: 'remove',
            color: 'negative'
          }
        ]
      }
    ];
    this.visibleColumns = this.columns.map(c => c.name);
    this.onRequest(this.pagination);
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      linkageDevicesApi.linkageDeviceList(params).then(response => {
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
    handle({ command, row, columns }) {
      switch (command) {
        case 'create':
          this.$refs.createDialog.open();
          break;
        case 'export':
          linkageDevicesApi.exportLinkageDevice(this.filters).then(response => exportFile(response, '联动设备.xlsx'));
          break;
        case 'copy':
          popconfirm({
            message: `是否复制${row.name}`
          }).onOk(() => {
            linkageDevicesApi.copyLinkageDevice(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '复制成功' });
                this.refresh();
              }
            });
          });
          break;
        case 'details':
          this.$refs.detailsDialog.open(row);
          break;
        case 'edit':
          this.$refs.createDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            linkageDevicesApi.delLinkageDevice(row.id).then(response => {
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
      }
    }
  }
};
</script>
