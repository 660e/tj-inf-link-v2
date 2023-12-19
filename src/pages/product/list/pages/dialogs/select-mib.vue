<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '取消', command: 'cancel' }]" @handle="handle" title="选择配置">
    <iot-table :data="data" :columns="columns" :visible-columns="visibleColumns" :pagination="pagination" @request="onRequest" row-key="oid" sticky>
      <template v-slot:handle="{ props }">
        <iot-table-handle :props="props" @handle="handle" />
      </template>
    </iot-table>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { snmpmibOidApi } from '@/api/wsat-service-device/snmpmib-oid.js';

export default {
  data() {
    return {
      visible: false,
      fields: [],
      filters: {},
      data: [],
      columns: [],
      visibleColumns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  methods: {
    open() {
      this.fields = [
        { label: 'MIB OID', key: 'mibOid', type: 'input' },
        { label: 'MIB英文名', key: 'mibEnName', type: 'input' },
        { label: 'MIB中文名', key: 'mibCnName', type: 'input' },
        { label: '厂商', key: 'manufacturer', type: 'select', options: [], props: {} },
        { label: '设备类型', key: 'snmpResClass', type: 'select', options: [], props: {} }
      ];
      this.columns = [
        { label: 'MIB OID', required: true, name: 'mibOid', field: 'mibOid', align: 'left' },
        { label: 'MIB英文名', name: 'mibEnName', field: 'mibEnName', align: 'left' },
        { label: 'MIB中文名', name: 'mibCnName', field: 'mibCnName', align: 'left' },
        { label: 'MIB数据类型', name: 'mibType', field: 'mibType', align: 'left' },
        { label: 'TableID', name: 'tableId', field: 'tableId', align: 'left' },
        { label: '计算公式', name: 'formula', field: 'formula', align: 'left' },
        { label: '厂商', name: 'manufacturer', field: 'manufacturer', align: 'left' },
        { label: '设备类型', name: 'snmpResClass', field: 'snmpResClass', align: 'left' },
        {
          label: '操作',
          required: true,
          name: 'handle',
          field: 'handle',
          align: 'left',
          style: 'width: 10px',
          handles: [{ label: '选择', command: 'select' }]
        }
      ];
      this.visibleColumns = this.columns.map(c => c.name);
      extendApi.getDateItemBycodes(['deviceBrand', 'snmpResClass']).then(response => {
        // deviceBrand
        this.fields.find(e => e.key === 'manufacturer').options = response.deviceBrand;
        // snmpResClass
        this.fields.find(e => e.key === 'snmpResClass').options = response.snmpResClass;
        this.search();
        this.visible = true;
      });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      snmpmibOidApi.mibOidQuery(params).then(response => {
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
        case 'select':
          this.$emit('confirm', row.oid);
          this.handle({ command: 'cancel' });
          break;
        case 'cancel':
          this.visible = false;
          this.filters = {};
          this.data = [];
          this.pagination.rowsNumber = 0;
          break;
      }
    }
  }
};
</script>
