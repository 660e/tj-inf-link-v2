<template>
  <iot-dialog :visible="visible" :width="1000" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="详情" dense>
    <div class="layout-container">
      <q-list class="layout-details" dense>
        <q-item>
          <q-item-section>
            <span>设备名称：{{ alarm.deviceName }}</span>
            <q-tooltip>{{ alarm.deviceName }}</q-tooltip>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>告警规则名称：{{ alarm.alarmRuleName }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>告警级别：{{ valueComputed(alarm.alarmLevel, 'alarmLevel') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>告警类型：{{ valueComputed(alarm.alarmTypeCode, 'alarmTypeCode') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>告警来源：{{ valueComputed(alarm.alarmSource, 'alarmSource') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>告警次数：{{ alarm.alarmCount }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>首次发生时间：{{ dayjs(alarm.startTime).format('YYYY-MM-DD HH:mm:ss') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>最近发生时间：{{ dayjs(alarm.lastTime).format('YYYY-MM-DD HH:mm:ss') }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>设备状态：{{ valueComputed(alarm.devOnlineStatus, 'onlineStatus') }}</q-item-section>
        </q-item>
        <q-item class="full-width">
          <q-item-section>告警次数：{{ alarm.alarmDesc }}</q-item-section>
        </q-item>
      </q-list>
      <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
    </div>
  </iot-dialog>
</template>

<script>
import { alarmInfoApi } from '@/api/wsat-service-alarm/alarm-info.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      visible: false,
      alarm: {},
      data: [],
      columns: [],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 },
      computed: {
        alarmLevel: [],
        alarmSource: [],
        alarmTypeCode: [],
        onlineStatus: []
      }
    };
  },
  methods: {
    open(alarm, computed) {
      this.alarm = alarm;
      this.computed = computed;
      this.columns = [
        { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
        { label: '设备标签', name: 'deviceLabel', field: 'deviceLabel', align: 'left', style: 'width: 150px', classes: 'ellipsis' },
        { label: '监测属性名称', name: 'monitorObject', field: 'monitorObject', align: 'left' },
        { label: '监测属性标签', name: 'propertyLabel', field: 'propertyLabel', align: 'left' },
        { label: '监测时间', name: 'monitorTime', field: 'monitorTime', align: 'left' },
        { label: '监测值', name: 'monitorValue', field: 'monitorValue', align: 'left' },
        { label: '单位', name: 'unit', field: 'unit', align: 'left' }
      ];
      this.onRequest(this.pagination);
      this.visible = true;
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
      }
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        alarmId: this.alarm.idStr,
        startTime: this.alarm.startTime,
        endTime: this.alarm.lastTime,
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage
      };
      alarmInfoApi.alarmDeviceHisData(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    valueComputed(val, key) {
      const item = this.computed[key].find(e => e.value === val);
      return item ? item.label : '-';
    },
    dayjs(val) {
      return dayjs(val);
    }
  }
};
</script>
