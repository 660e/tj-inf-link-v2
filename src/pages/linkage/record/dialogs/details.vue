<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" :title="record.ruleName" dense>
    <div class="layout-container">
      <q-list class="layout-details" dense>
        <q-item>
          <q-item-section>设备位置：{{ record.positionDescr }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>触发时间：{{ dayjs(record.triggerTime).format('YYYY-MM-DD HH:mm:ss') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>是否告警：{{ record.isAlarm ? '是' : '否' }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>联动产品：{{ record.deviceType === 1 ? record.productName : record.corrProductName }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>联动设备：{{ record.deviceType === 1 ? record.deviceName : record.corrDeviceName }}</q-item-section>
        </q-item>
      </q-list>
      <div class="layout-content">
        <div class="layout-main q-px-md q-pt-sm">
          <div class="q-px-md">
            <iot-table-simple :data="record.devDataValueList || []" :columns="columns1" class="q-mb-md" />
            <iot-table-simple :data="record.deviceServiceRecordList || []" :columns="columns2" />
          </div>
        </div>
      </div>
    </div>
  </iot-dialog>
</template>

<script>
import { sceneLinkageRecordApi } from '@/api/wsat-service-alarm/scene-linkage-record.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      visible: false,
      record: {},
      columns1: [
        { label: '触发设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
        { label: '设备标识', name: 'deviceLabel', field: 'deviceLabel', align: 'left' },
        { label: '属性', name: 'propertyLabel', field: 'propertyLabel', align: 'left' },
        { label: '属性值', name: 'propertyValue', field: 'propertyValue', align: 'left' },
        { label: '时间', name: 'tsv', field: 'tsv', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') }
      ],
      columns2: [
        { label: '执行设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
        { label: '设备SN码', name: 'deviceSn', field: 'deviceSn', align: 'left' },
        { label: '设备位置', name: 'positionDescription', field: 'positionDescription', align: 'left' },
        { label: '执行动作（服务名）', name: 'serviceName', field: 'serviceName', align: 'left' },
        { label: '执行时间', name: 'execTime', field: 'execTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') },
        { label: '执行状态', name: 'status', field: 'status', align: 'left', format: val => (val === 1 ? '成功' : '失败') }
      ]
    };
  },
  methods: {
    open(row) {
      sceneLinkageRecordApi.getSceneLinkageRecord(row.id).then(response => {
        this.record = response.data;
        this.visible = true;
      });
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
      }
    },
    dayjs
  }
};
</script>
