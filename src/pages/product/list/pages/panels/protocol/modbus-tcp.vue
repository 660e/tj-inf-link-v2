<template>
  <div class="q-pt-md">
    <iot-title
      :buttons="[{ label: '新增', command: 'create', icon: 'add_circle_outline', show: !releaseStatus }]"
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
    <create-modbus-tcp-dialog ref="createModbusTcpDialog" @confirm="getProductProtocolModbusTcpList" />
  </div>
</template>

<script>
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import CreateModbusTcpDialog from '../../dialogs/create-modbus-tcp.vue';
export default {
  components: {
    CreateModbusTcpDialog
  },
  props: {
    releaseStatus: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      productId: this.$route.params.id,
      data: [],
      columns: []
    };
  },
  mounted() {
    this.columns = [
      {
        label: '名称',
        name: 'name',
        field: 'name',
        align: 'left'
      },
      {
        label: '关联属性',
        name: 'productPropertyName',
        field: 'productPropertyName',
        align: 'left'
      },
      {
        label: '数据类型',
        name: 'dataTypeNmae',
        field: 'dataTypeNmae',
        align: 'left'
      },
      {
        label: '起始地址',
        name: 'startAddress',
        field: 'startAddress',
        align: 'left'
      },
      {
        label: '寄存器类型',
        name: 'registerTypeId',
        field: 'registerTypeId',
        align: 'left',
        format: () => {}
      },
      {
        label: '寄存器个数',
        name: 'registerCounts',
        field: 'registerCounts',
        align: 'left'
      },
      {
        label: '操作',
        name: 'handle',
        field: 'handle',
        align: 'left',
        style: 'width: 10px'
      }
    ];
    extendApi.getDateItemByParentcode({ code: 'registerType' }).then(response => {
      this.columns.find(e => e.name === 'registerTypeId').format = val => {
        return response.find(e => Number(e.code) === val) ? response.find(e => Number(e.code) === val).name : '-';
      };
      this.getProductProtocolModbusTcpList();
    });
  },
  methods: {
    getProductProtocolModbusTcpList() {
      protocolApi.getProductProtocolModbusTcpList(this.productId).then(response => (this.data = response.data));
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createModbusTcpDialog.open();
          break;
        case 'edit':
          this.$refs.createModbusTcpDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            protocolApi.deleteProductProtocolModbusTcpById(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.getProductProtocolModbusTcpList();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
