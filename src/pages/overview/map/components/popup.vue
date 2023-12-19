<template>
  <div class="q-pa-sm">
    <div class="q-pb-sm q-gutter-y-sm">
      <div class="flex items-center justify-between">
        <span class="text-subtitle2">{{ device.name }}</span>
        <span class="text-primary cursor-pointer" @click="$parent.to(device)">详情</span>
      </div>
      <div class="q-gutter-x-md">
        <template v-if="type === 1">
          <span>类型：{{ device.nodeType }}</span>
          <span>状态：{{ onlineStatus(device.onlineStatus) }}</span>
        </template>
        <span v-if="type === 2">位置：{{ device.position }}</span>
      </div>
    </div>
    <q-table :data="data" :columns="columns" bordered dense flat hide-pagination>
      <template v-slot:body-cell-handle="props">
        <q-td :props="props">
          <q-icon @click="to(props.row)" name="info_outline" size="16px" class="text-primary cursor-pointer" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapApi } from '@/api/wsat-service-device/map.js';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';

export default {
  props: {
    dict: {
      type: Object,
      default: () => {}
    },
    type: Number,
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      device: this.object.device,
      marker: this.object.marker,
      data: [],
      columns: [],
      options: {
        offset: [0, -20],
        minWidth: 350,
        maxWidth: 350
      }
    };
  },
  mounted() {
    this.marker.bindPopup(this.$L.popup(this.options).setContent(this.$el)).on('click', () => {
      switch (this.type) {
        case 1: {
          const params = {
            deviceId: this.device.id,
            label: this.device.label,
            nodeType: this.nodeType(this.device.nodeType)
          };
          mapApi.getMapDeviceMessage(params).then(response => {
            if (response.data.nodeType === '1') {
              this.columns = [
                { label: '子设备', name: 'name', field: 'name', align: 'left' },
                { label: '状态', name: 'status', field: 'status', align: 'left' },
                { label: '详情', name: 'handle', field: 'handle', align: 'center' }
              ];
              this.data =
                response.data.childDeviceList.map(e => {
                  return {
                    id: e.deviceId,
                    name: e.deviceName,
                    label: e.label,
                    status: this.onlineStatus(e.onLineStatus)
                  };
                }) || [];
            } else {
              this.columns = [
                { label: '属性名', name: 'label', field: 'label', align: 'left' },
                { label: '属性值', name: 'value', field: 'value' }
              ];
              this.data =
                response.data.devicePropertyList.map(e => {
                  return {
                    label: `${e.propertyName || '-'}（${e.propertyLabel || '-'}）`,
                    value: `${e.propertyValue || '-'}${e.unitName || ''}`
                  };
                }) || [];
            }
          });
          break;
        }
        case 2: {
          this.columns = [
            { label: '设备', name: 'name', field: 'name', align: 'left' },
            { label: '状态', name: 'status', field: 'status', align: 'left' },
            { label: '详情', name: 'handle', field: 'handle', align: 'center' }
          ];
          const params = {
            id: this.device.id,
            pageNum: 1,
            pageSize: 999
          };
          perceivedApi.getdevicelist(params).then(response => {
            this.data = response.data.map(e => {
              return {
                id: e.ID,
                name: e.NAME,
                label: e.LABEL,
                status: this.onlineStatus(e.ONLINE_STATUS)
              };
            });
          });
          break;
        }
      }
    });
  },
  methods: {
    nodeType(value) {
      switch (value) {
        case '直连设备':
          return 0;
        case '网关(网关/系统)':
          return 1;
        case '子设备':
          return 2;
        default:
          return '-';
      }
    },
    onlineStatus(value) {
      return this.dict.onlineStatus.find(e => e.value === value) ? this.dict.onlineStatus.find(e => e.value === value).label : '-';
    },
    to(device) {
      this.$router.push({
        name: 'device-list-details',
        params: {
          id: device.id
        },
        query: {
          type: 'config',
          label: device.label,
          tab: 1,
          from: 'overview-map'
        }
      });
    }
  }
};
</script>
