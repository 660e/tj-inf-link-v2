<template>
  <div class="q-pa-md">
    <iot-title title="标准属性" />
    <q-list dense padding>
      <q-item>
        <iot-table-simple :data="data1" :columns="columns1" width="100%" />
      </q-item>
    </q-list>
    <iot-title
      :buttons="[{ label: '新增', command: 'create', icon: 'add_circle_outline', show: !releaseStatus }]"
      @handle="handle"
      title="自定义属性"
      class="q-pt-md"
    />
    <q-list dense padding>
      <q-item>
        <iot-table-simple :data="data2" :columns="columns2" width="100%">
          <template v-slot:handle="{ props }">
            <div class="q-gutter-x-sm">
              <q-icon @click="handle({ command: 'edit', row: props.row })" class="cursor-pointer" color="primary" name="edit" size="xs" />
              <q-icon @click="handle({ command: 'remove', row: props.row })" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
            </div>
          </template>
        </iot-table-simple>
      </q-item>
    </q-list>
    <!-- 新增 -->
    <create-attribute-dialog ref="createAttributeDialog" @confirm="getProductPropertyList" />
  </div>
</template>

<script>
import { productsApi } from '@/api/wsat-service-device/products.js';
import { popconfirm } from '@/utils/framework.js';
import CreateAttributeDialog from '../dialogs/create-attribute.vue';
export default {
  components: {
    CreateAttributeDialog
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
      data1: [],
      data2: [],
      columns1: [],
      columns2: []
    };
  },
  mounted() {
    const columns = [
      {
        label: '属性名称',
        name: 'name',
        field: 'name',
        align: 'left',
        icon: {
          after: {
            show: row => row.isMajorKey === 1,
            name: 'vpn_key',
            color: 'negative'
          }
        }
      },
      { label: '标识符', name: 'label', field: 'label', align: 'left' },
      { label: '标准化标识符', name: 'convertLabel', field: 'convertLabel', align: 'left' },
      { label: '数据类型', name: 'dataTypeName', field: 'dataTypeName', align: 'left' },
      { label: '单位', name: 'unitName', field: 'unitName', align: 'left' }
    ];
    this.columns1 = [...columns];
    this.columns2 = [...columns, { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }];
    this.getProductPropertyList();
  },
  methods: {
    getProductPropertyList() {
      productsApi.getProductPropertyList({ id: this.productId }).then(response => {
        this.data1 = response.data.filter(e => e.modelId);
        this.data2 = response.data.filter(e => !e.modelId);
      });
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createAttributeDialog.open();
          break;
        case 'edit':
          this.$refs.createAttributeDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.deleteProductPropertyById(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.getProductPropertyList();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
