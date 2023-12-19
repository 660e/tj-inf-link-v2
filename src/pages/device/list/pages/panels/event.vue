<template>
  <div class="q-pa-md">
    <iot-title :buttons="[{ label: '新增', command: 'create', icon: 'add_circle_outline', show: !device.useStatus }]" @handle="handle" title="事件" />
    <q-list dense padding>
      <q-item>
        <iot-table-simple :data="data" :columns="columns" width="100%">
          <template v-slot:handle="{ props }">
            <div v-if="props.row.deviceId" class="q-gutter-x-sm">
              <q-icon @click="handle({ command: 'edit', row: props.row })" class="cursor-pointer text-primary" name="edit" size="xs" />
              <q-icon @click="handle({ command: 'remove', row: props.row })" class="cursor-pointer text-negative" name="delete_outline" size="xs" />
            </div>
          </template>
        </iot-table-simple>
      </q-item>
    </q-list>
    <!-- 新增 -->
    <create-event-dialog ref="createEventDialog" @confirm="getDeviceEvents" />
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { popconfirm } from '@/utils/framework.js';
import CreateEventDialog from '../dialogs/create-event.vue';

export default {
  components: {
    CreateEventDialog
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
      columns: []
    };
  },
  mounted() {
    this.columns = [
      { label: '事件名称', name: 'name', field: 'name', align: 'left' },
      { label: '标识符', name: 'label', field: 'label', align: 'left' },
      { label: '事件类型', name: 'type', field: 'type', align: 'left', format: val => (val === '1' ? '信息' : val === '2' ? '告警' : '故障') },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
    this.getDeviceEvents();
    extendApi.getDateItemBycodes(['eventType']).then(response => {
      this.columns.find(e => e.name === 'type').format = val => {
        return response.eventType.find(e => e.value === val) ? response.eventType.find(e => e.value === val).label : '-';
      };
    });
  },
  methods: {
    getDeviceEvents() {
      devicesApi.getDeviceEvents({ deviceId: this.id }).then(response => (this.data = response.data));
    },
    handle({ command, row }) {
      switch (command) {
        case 'create':
          this.$refs.createEventDialog.open(this.device.productId);
          break;
        case 'edit':
          this.$refs.createEventDialog.open(this.device.productId, row);
          break;
        case 'remove':
          popconfirm({
            message: `是否删除${row.name}`,
            ok: {
              color: 'negative'
            }
          }).onOk(() => {
            devicesApi.removeDeviceEvents(row.id).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: '删除成功' });
                this.getDeviceEvents();
              }
            });
          });
          break;
      }
    }
  }
};
</script>
