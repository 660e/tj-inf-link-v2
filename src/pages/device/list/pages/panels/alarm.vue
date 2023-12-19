<template>
  <div class="col column">
    <iot-title title="设备告警" class="q-px-md q-pt-md" />
    <iot-searchbar :fields="fields" @search="search" />
    <iot-table :data="data" :columns="columns" :pagination="pagination" @request="onRequest" />
  </div>
</template>

<script>
import { alarmInfoApi } from '@/api/wsat-service-alarm/alarm-info.js';
import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      id: this.$route.params.id,
      fields: [],
      filters: {},
      data: [],
      columns: [],
      defaultColumns: [
        { label: '设备名称', name: 'deviceName', field: 'deviceName', align: 'left' },
        { label: '告警规则名称', name: 'alarmRuleName', field: 'alarmRuleName', align: 'left' },
        { label: '告警级别', name: 'alarmLevel', field: 'alarmLevel', align: 'left' },
        { label: '告警类型', name: 'alarmTypeCode', field: 'alarmTypeCode', align: 'left' },
        { label: '告警来源', name: 'alarmSource', field: 'alarmSource', align: 'left' },
        { label: '首次发生时间', name: 'startTime', field: 'startTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') },
        { label: '告警次数', name: 'alarmCount', field: 'alarmCount', align: 'left' },
        { label: '最近发生时间', name: 'lastTime', field: 'lastTime', align: 'left', format: val => dayjs(val).format('YYYY-MM-DD HH:mm:ss') }
      ],
      pagination: { page: 1, rowsPerPage: 10, rowsNumber: 0 }
    };
  },
  mounted() {
    this.fields = [
      {
        label: '告警状态',
        key: 'alarmStatus',
        type: 'select',
        options: [
          { label: '未处理', value: 1 },
          { label: '已处理', value: 2 }
        ],
        props: {},
        value: 1,
        clearable: false
      },
      { label: '告警级别', key: 'alarmLevel', type: 'select', options: [], props: {} },
      { label: '日期范围', key: 'date-range', type: 'date-range', value: [], props: { start: 'startTime', end: 'endTime' } }
    ];
    this.columns = [
      { label: '开始时间', name: 'startTime', field: 'startTime', align: 'left' },
      { label: '结束时间', name: 'endTime', field: 'endTime', align: 'left' },
      { label: '设备属性', name: 'propertyValue', field: 'propertyValue', align: 'left' },
      { label: '设备分组', name: 'deviceGroup', field: 'deviceGroup', align: 'left' },
      { label: '告警级别', name: 'alarmLevel', field: 'alarmLevel', align: 'left' },
      { label: '告警次数', name: 'alarmCount', field: 'alarmCount', align: 'left' },
      { label: '告警状态', name: 'alarmStatus', field: 'alarmStatus', align: 'left' }
    ];
    const p0 = extendApi.getDateItemBycodes(['alarmLevel', 'alarmSource']);
    const p1 = alarmRuleTypeApi.SelectAlarmRuleType();
    Promise.all([p0, p1]).then(response => {
      const alarmTypeCodeOptions = response[1].data.map(e => ({ label: e.ruleType, value: e.ruleTypeCode }));
      this.fields.find(e => e.key === 'alarmLevel').options = response[0].alarmLevel;
      this.defaultColumns.find(e => e.name === 'alarmLevel').format = val => {
        return response[0].alarmLevel.find(e => e.value === val) ? response[0].alarmLevel.find(e => e.value === val).label : '-';
      };
      this.defaultColumns.find(e => e.name === 'alarmSource').format = val => {
        return response[0].alarmSource.find(e => e.value === val) ? response[0].alarmSource.find(e => e.value === val).label : '-';
      };
      this.defaultColumns.find(e => e.name === 'alarmTypeCode').format = val => {
        return alarmTypeCodeOptions.find(e => e.value === val) ? alarmTypeCodeOptions.find(e => e.value === val).label : '-';
      };
      this.search({ alarmStatus: 1 });
    });
  },
  methods: {
    onRequest(pagination) {
      this.$store.commit('loading', true);
      switch (this.filters.alarmStatus) {
        case 1:
          this.columns = [...this.defaultColumns];
          break;
        case 2:
          this.columns = [
            ...this.defaultColumns,
            {
              label: '处理时间',
              name: 'handleTime',
              field: 'handleTime',
              align: 'left',
              format: val => (val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-')
            }
          ];
          break;
      }
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        ...this.filters
      };
      alarmInfoApi[this.filters.alarmStatus === 1 ? 'alarmQuery' : 'hisAlarmQuery'](params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    search(filters) {
      this.filters = filters;
      this.filters.deviceId = this.id;
      this.pagination.page = 1;
      this.onRequest(this.pagination);
    }
  }
};
</script>
