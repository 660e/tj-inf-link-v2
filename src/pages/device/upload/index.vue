<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="[{ label: '设备管理' }, { label: '导入管理' }]" />
    <iot-header title="导入管理" :buttons="[[{ label: '下载模板', icon: 'download' }]]" @handle="download" />
    <div class="layout-content" style="height: calc(100vh - 132px); display: block; flex: none">
      <div class="q-pa-md">
        <div v-for="(c, i) in cards" :key="i">
          <div v-if="i !== 0" class="text-subtitle2 q-py-md">- {{ i === 1 ? '产品' : '设备' }}导入 -</div>
          <div class="flex q-gutter-md">
            <q-card v-for="(e, j) in c" :key="j" @click="$refs.uploadDialog.open(e)" style="width: 300px" class="cursor-pointer q-hoverable" v-ripple>
              <span class="q-focus-helper"></span>
              <q-card-section>
                <div class="flex items-center">
                  <span class="text-h5 text-primary">{{ e.name }}</span>
                  <span class="q-pl-sm">{{ e.type }}导入</span>
                </div>
                <div class="text-grey q-pt-sm">{{ e.describe || '-' }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <!-- 导入 -->
    <upload-dialog ref="uploadDialog" />
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { exportFile } from '@/utils/data.js';

import UploadDialog from './dialogs/upload.vue';

export default {
  components: {
    UploadDialog
  },
  data() {
    return {
      cards: [
        [{ name: 'ALL', type: '产品、设备', describe: '一键导入所有产品、设备' }],
        [
          { name: '非网关', type: '产品', describe: '设备产品', sheetName: '设备产品' },
          { name: '网关', type: '产品', describe: '网关产品', sheetName: '网关产品' }
        ],
        [
          { name: 'MQTT', type: '设备', describe: '消息队列遥测传输协议', sheetName: 'MQTT设备表' },
          { name: 'TCP', type: '服务端设备', describe: '传输控制协议', sheetName: 'TCP服务端设备表' },
          { name: 'TCP', type: '客户端设备', describe: '传输控制协议', sheetName: 'TCP客户端设备表' },
          { name: 'HTTP/HTTPS', type: '服务端设备', describe: '超文本传输协议/超文本传输安全协议', sheetName: 'HTTP服务端设备表' },
          { name: 'HTTP/HTTPS', type: '客户端设备', describe: '超文本传输协议/超文本传输安全协议', sheetName: 'HTTP客户端设备表' },
          { name: 'Modbus', type: '设备', describe: 'Modbus通讯协议', sheetName: 'MODBUS设备表' },
          { name: 'BACnet', type: '设备', describe: 'BACnet通讯协议', sheetName: 'BACNET设备表' },
          { name: 'OPC-UA', type: '设备', sheetName: 'OPC设备表' },
          { name: 'UDP', type: '设备', describe: '用户数据报协议', sheetName: 'UDP设备表' }
        ]
      ]
    };
  },
  methods: {
    download() {
      devicesApi.deviceTemplates().then(response => exportFile(response, '批量导入模板.xlsx'));
    }
  }
};
</script>
