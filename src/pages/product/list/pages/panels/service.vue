<template>
  <div class="q-pa-md">
    <iot-title
      :buttons="[{ label: '新增', command: 'create', icon: 'add_circle_outline', show: !releaseStatus }]"
      @handle="handle"
      title="自定义服务"
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
    <create-service-dialog ref="createServiceDialog" @confirm="getProductServiceList" />
  </div>
</template>

<script>
import { productsApi } from '@/api/wsat-service-device/products.js';
import { popconfirm } from '@/utils/framework.js';
import CreateServiceDialog from '../dialogs/create-service.vue';
export default {
  components: {
    CreateServiceDialog
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
        label: '服务名称',
        name: 'name',
        field: 'name',
        align: 'left'
      },
      {
        label: '标识符',
        name: 'label',
        field: 'label',
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
    this.getProductServiceList();
  },
  methods: {
    getProductServiceList() {
      productsApi.getProductServiceList({ id: this.productId }).then(response => (this.data = response.data));
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createServiceDialog.open();
          break;
        case 'edit':
          this.$refs.createServiceDialog.open(row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            productsApi.deleteProductsServicesById(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.getProductServiceList();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
