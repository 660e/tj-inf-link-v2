<template>
  <div class="q-pa-md">
    <iot-title
      :buttons="[{ label: '新增', command: 'create', icon: 'add_circle_outline', show: !device.useStatus }]"
      @handle="handle"
      title="解析规则"
    />
    <q-list dense padding>
      <q-item>
        <iot-table-simple :data="data" :columns="columns" width="100%">
          <template v-slot:handle="{ props }">
            <div class="q-gutter-x-sm">
              <q-icon @click="handle({ command: 'edit', row: props.row })" class="cursor-pointer text-primary" name="edit" size="xs" />
              <q-icon @click="handle({ command: 'remove', row: props.row })" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
            </div>
          </template>
        </iot-table-simple>
      </q-item>
    </q-list>
    <!-- 新增 -->
    <create-parse-dialog ref="createParseDialog" @confirm="getData" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import CreateParseDialog from '../dialogs/create-parse.vue';

export default {
  components: {
    CreateParseDialog
  },
  props: {
    device: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      data: [],
      columns: [
        { label: '名称', name: 'name', field: 'name', align: 'left' },
        { label: '关联属性', name: 'productPropertyLabel', field: 'productPropertyLabel', align: 'left' },
        { label: '数据类型', name: 'dataTypeId', field: 'dataTypeId', align: 'left', format: () => {} }
      ]
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['dataType']).then(response => {
      this.columns.find(e => e.name === 'dataTypeId').format = val => {
        return response.dataType.find(e => e.value === val) ? response.dataType.find(e => e.value === val).label : '-';
      };
      this.init();
    });
  },
  methods: {
    init() {
      switch (this.device.agreementType) {
        case 2:
          this.columns = this.columns.concat([
            { label: '寄存器类型', name: 'registerTypeId', field: 'registerTypeId', align: 'left', format: () => {} },
            { label: '起始地址', name: 'startAddress', field: 'startAddress', align: 'left' },
            { label: '寄存器个数', name: 'registerCounts', field: 'registerCounts', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
          ]);
          extendApi.getDateItemBycodes(['registerType']).then(response => {
            this.columns.find(e => e.name === 'registerTypeId').format = val => {
              return response.registerType.find(e => e.value === val) ? response.registerType.find(e => e.value === val).label : '-';
            };
          });
          break;
        case 3:
          this.columns = this.columns.concat([
            { label: '命名空间索引', name: 'nameSpaceIndex', field: 'nameSpaceIndex', align: 'left' },
            { label: '点位信息标识符', name: 'identifier', field: 'identifier', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
          ]);
          break;
        case 4:
          this.columns = this.columns.concat([
            { label: '属性序列号', name: 'propertySn', field: 'propertySn', align: 'left' },
            { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
          ]);
          break;
      }
      this.getData();
    },
    getData() {
      switch (this.device.agreementType) {
        case 2:
          protocolApi.getDeviceProtocolModbusTcpList(this.id).then(response => (this.data = response.data));
          break;
        case 3:
          protocolApi.getDeviceProtocolOpcUaList(this.id).then(response => (this.data = response.data));
          break;
        case 4:
          protocolApi.getDeviceProtocolBacNetList(this.id).then(response => (this.data = response.data));
          break;
      }
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createParseDialog.open(this.device);
          break;
        case 'edit':
          this.$refs.createParseDialog.open(this.device, row);
          break;
        case 'remove': {
          let fn;
          switch (this.device.agreementType) {
            case 2:
              fn = protocolApi.deleteDeviceProtocolModbusTcpById;
              break;
            case 3:
              fn = protocolApi.deleteDevicePropertyOpcUaById;
              break;
            case 4:
              fn = protocolApi.deleteDeviceProtocolBacNetById;
              break;
          }
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            fn(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.getData();
              }
            });
          });
          break;
        }
      }
    }
  },
  watch: {
    device: {
      deep: true,
      handler() {
        this.init();
      }
    }
  }
};
</script>
