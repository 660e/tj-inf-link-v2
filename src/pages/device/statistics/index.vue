<template>
  <div class="layout-container">
    <iot-breadcrumbs :breadcrumbs="breadcrumbs" />
    <iot-header title="设备统计" />
    <div class="layout-content" style="height: calc(100vh - 132px); display: block; flex: none">
      <div class="q-pa-md">
        <!-- 1 -->
        <div class="row q-gutter-x-md">
          <q-card class="col flex cursor-pointer q-hoverable" @click="$router.push({ name: 'device-list' })">
            <span class="q-focus-helper"></span>
            <q-card-section class="flex items-center">
              <img src="@/assets/statistics/1.png" style="width: 48px" class="q-mr-md" />
              <ul>
                <li>设备总数：{{ total.totalDeviceNum }}台</li>
                <li>直联设备数量：{{ total.deviceNum }}台</li>
                <li>子设备数量：{{ total.childDeviceNum }}台</li>
                <li>网关数量：{{ total.gatewayDeviceNum }}台</li>
              </ul>
            </q-card-section>
          </q-card>
          <q-card class="col flex cursor-pointer q-hoverable" @click="$router.push({ name: 'combination-list' })">
            <span class="q-focus-helper"></span>
            <q-card-section class="flex items-center">
              <img src="@/assets/statistics/2.png" style="width: 48px" class="q-mr-md" />
              <ul>
                <li>
                  <span class="text-h6">{{ total.perceivedNum }}</span>
                  <span>个</span>
                </li>
                <li>对象个数</li>
              </ul>
            </q-card-section>
          </q-card>
          <q-card class="col flex cursor-pointer q-hoverable" @click="$router.push({ name: 'alarm-status' })">
            <span class="q-focus-helper"></span>
            <q-card-section class="flex items-center">
              <img src="@/assets/statistics/3.png" style="width: 48px" class="q-mr-md" />
              <ul>
                <li>
                  <span class="text-h6">{{ total.getWarningDetailsAll }}</span>
                  <span>条</span>
                </li>
                <li>告警总数</li>
              </ul>
            </q-card-section>
          </q-card>
          <q-card class="col flex cursor-pointer q-hoverable" @click="$router.push({ name: 'alarm-status' })">
            <span class="q-focus-helper"></span>
            <q-card-section class="flex items-center">
              <img src="@/assets/statistics/4.png" style="width: 48px" class="q-mr-md" />
              <ul>
                <li>
                  <span class="text-h6">{{ total.unprocessedWarning }}</span>
                  <span>条</span>
                </li>
                <li>未处理告警</li>
              </ul>
            </q-card-section>
          </q-card>
          <q-card class="col flex">
            <q-card-section class="flex items-center">
              <img src="@/assets/statistics/5.png" style="width: 48px" class="q-mr-md" />
              <ul>
                <li>
                  <span class="text-h6">{{ total.count }}</span>
                  <span>次</span>
                </li>
                <li>被调用次数</li>
              </ul>
            </q-card-section>
          </q-card>
        </div>
        <!-- 2 -->
        <div class="row q-pt-md q-gutter-x-md">
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between">
                <span>设备状态统计</span>
                <span v-if="levels[1].length" @click="back(1)" class="text-primary cursor-pointer">返回上级</span>
              </div>
              <div id="chart-1" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2">设备分类</div>
              <div id="chart-2" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between">
                <span>设备分组</span>
                <span v-if="levels[3].length" @click="back(3)" class="text-primary cursor-pointer">返回上级</span>
              </div>
              <div id="chart-3" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2">对象分组</div>
              <div id="chart-4" style="height: 270px"></div>
            </q-card-section>
          </q-card>
        </div>
        <!-- 3 -->
        <div class="row q-pt-md q-gutter-x-md">
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between">
                <span>API调用时间统计</span>
                <span v-if="levels[5].length" @click="back(5)" class="text-primary cursor-pointer">返回上级</span>
              </div>
              <div id="chart-5" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2">命令下发统计</div>
              <div id="chart-6" style="height: 270px"></div>
            </q-card-section>
          </q-card>
        </div>
        <!-- 4 -->
        <div class="row q-pt-md q-gutter-x-md">
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between">
                <span>告警级别统计</span>
                <span v-if="levels[7].length" @click="back(7)" class="text-primary cursor-pointer">返回上级</span>
              </div>
              <div id="chart-7" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between">
                <span>告警处理统计</span>
                <span v-if="levels[8].length" @click="back(8)" class="text-primary cursor-pointer">返回上级</span>
              </div>
              <div id="chart-8" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2">设备联动统计</div>
              <div id="chart-9" style="height: 270px"></div>
            </q-card-section>
          </q-card>
          <q-card class="col">
            <q-card-section>
              <div class="text-subtitle2 flex justify-between items-center" style="height: 22px; overflow: hidden">
                <span>运行监控</span>
                <select v-model="ident" @change="identChange">
                  <option v-for="i in identOptions" :key="i.id" :value="i.ident">{{ i.ident }}</option>
                </select>
              </div>
              <div style="height: 260px; padding-top: 10px" class="flex column">
                <div class="col row">
                  <div class="col" id="chart-10"></div>
                  <div class="col" id="chart-11"></div>
                </div>
                <div class="col row">
                  <div class="col" id="chart-12"></div>
                  <div class="col"></div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { extend, dom } from 'quasar';
import { qs } from '@/utils/data.js';

import { alarmInfoApi } from '@/api/wsat-service-alarm/alarm-info.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { monitorStaticApi } from '@/api/wsat-service-device/monitor-static.js';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { platformApi } from '@/api/wsat-service-device/platform.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { sceneLinkageRecordApi } from '@/api/wsat-service-alarm/scene-linkage-record.js';

export default {
  data() {
    return {
      breadcrumbs: [{ label: '设备管理' }, { label: '设备统计' }],
      total: {
        totalDeviceNum: 0,
        deviceNum: 0,
        gatewayDeviceNum: 0,
        perceivedNum: 0,
        getWarningDetailsAll: 0,
        unprocessedWarning: 0,
        count: 0
      },
      ident: 'wlkj67.14',
      identOptions: [],
      radius: 0,
      levels: [],
      chart1: null,
      chart3: null,
      chart5: null,
      chart7: null,
      chart8: null,
      chart10: null,
      chart11: null,
      chart12: null
    };
  },
  created() {
    this.radius = dom.width(window) / 35;
    this.levels = extend(true, [], Array(12).fill([]));
  },
  mounted() {
    this.chart1 = this.$echarts.init(document.querySelector('#chart-1'));
    this.chart1.on('click', e => {
      if (e.data.onlineStatus) {
        this.updateLevels(1, e.data.onlineStatus);
        devicesApi.getAgreementTypeOnlineStatusNum(e.data.onlineStatus).then(response => {
          this.chart1.setOption(
            this.setPieOption(
              Object.entries(response.data).map(e => ({ name: e[0], value: e[1] })),
              [0, `${this.radius}%`]
            )
          );
        });
      }
    });
    this.getChart1();
    perceivedApi.getPerceived({ pageNum: 1, pageSize: 10 }).then(response => (this.total.perceivedNum = response.total));
    platformApi.getapiall().then(response => (this.total.count = response.data[0].count));
    platformApi.getWarningDetails().then(response => {
      this.total.getWarningDetailsAll = response.data[0].getWarningDetailsAll;
      this.total.unprocessedWarning = response.data[5].unprocessedWarning;
    });
    // 2
    productsApi.getProductList({ pageNum: 1, pageSize: 10 }).then(response => {
      const x = response.data.map(e => e.name);
      const y = response.data.map(e => e.deviceCounts);
      this.$echarts.init(document.querySelector('#chart-2')).setOption(this.setBarOption(x, y));
    });
    // 3
    this.chart3 = this.$echarts.init(document.querySelector('#chart-3'));
    this.chart3.on('click', e => {
      this.getChart3Detail(e.data._data.groupId);
    });
    this.getChart3();
    // 4
    platformApi.geterceivedObjectCount({ pageNum: 1, pageSize: 10 }).then(response => {
      const x = response.data.map(e => e.NAME);
      const y = response.data.map(e => e.total);
      this.$echarts.init(document.querySelector('#chart-4')).setOption(this.setBarOption(x, y));
    });
    // 5
    this.chart5 = this.$echarts.init(document.querySelector('#chart-5'));
    this.chart5.on('click', e => {
      if (e.seriesType === 'line') {
        this.updateLevels(5, e.seriesType);
        platformApi.getapicount(e.name).then(response => {
          const x = response.data.map(e => e.log_method_name).reverse();
          const y = response.data.map(e => e.count).reverse();
          this.chart5.setOption(this.setBarOption(x, y, true));
        });
      }
    });
    this.getChart5();
    // 6
    platformApi.getDeviceServiceExecuteHistoryCount().then(response => {
      const x = response.data.map(e => e.executeDate);
      const y = [
        { name: '总数', data: response.data.map(e => e.count) },
        { name: '成功', data: response.data.map(e => e.successNum) },
        { name: '失败', data: response.data.map(e => e.failNum) }
      ];
      this.$echarts.init(document.querySelector('#chart-6')).setOption(this.setLineOption(x, y));
    });
    // 7
    this.chart7 = this.$echarts.init(document.querySelector('#chart-7'));
    this.chart7.on('click', e => {
      if (e.data._data) {
        this.updateLevels(7, e.data._data.total);
        const d = [
          { name: '未处理', value: e.data._data.status1Num },
          { name: '已处理', value: e.data._data.status2Num },
          { name: '已忽略', value: e.data._data.status3Num }
        ];
        const r = [`${this.radius - 20}%`, `${this.radius}%`];
        this.chart7.setOption(this.setPieOption(d, r));
      }
    });
    this.getChart7();
    // 8
    this.chart8 = this.$echarts.init(document.querySelector('#chart-8'));
    this.chart8.on('click', e => {
      if (e.data._data) {
        this.updateLevels(8, e.data._data.total);
        const d = [
          { name: '提示', value: e.data._data.level1Num },
          { name: '主要', value: e.data._data.level2Num },
          { name: '严重', value: e.data._data.level3Num },
          { name: '紧急', value: e.data._data.level4Num }
        ];
        const r = [`${this.radius - 20}%`, `${this.radius}%`];
        this.chart8.setOption(this.setPieOption(d, r));
      }
    });
    this.getChart8();
    // 9
    sceneLinkageRecordApi.last7SceneLinkStatusCount().then(response => {
      const x = Object.entries(response.data).map(e => e[0]);
      const y = Object.entries(response.data).map(e => Object.values(e[0]));
      this.$echarts.init(document.querySelector('#chart-9')).setOption(this.setBarOption(x, y));
    });
    // 10 11 12
    this.chart10 = this.$echarts.init(document.querySelector('#chart-10'));
    this.chart11 = this.$echarts.init(document.querySelector('#chart-11'));
    this.chart12 = this.$echarts.init(document.querySelector('#chart-12'));
    monitorStaticApi.getAllHostMonitorData().then(response => {
      this.identOptions = response.data;
      this.ident = this.identOptions[0].ident;
      this.getChart10_11_12();
    });
  },
  methods: {
    getChart1() {
      devicesApi.statistics().then(response => {
        extend(this.total, response.data);
        const d = [
          { name: '离线', value: response.data.curOfflineDeviceNum, onlineStatus: 0 },
          { name: '在线', value: response.data.curOnlineDeviceNum, onlineStatus: 1 },
          { name: '未启用', value: response.data.closeDeviceNum, onlineStatus: 2 }
        ];
        this.chart1.setOption(this.setPieOption(d, [0, `${this.radius}%`]));
      });
    },
    getChart3() {
      platformApi.getDeviceGroupCountNew().then(response => {
        const x = response.data.map(e => e.NAME);
        const y = response.data.map(e => ({ value: e.total, _data: e }));
        this.chart3.setOption(this.setBarOption(x, y));
      });
    },
    getChart3Detail(groupId) {
      platformApi.getDeviceGroupCountDetail(groupId).then(response => {
        if (response.data.length) {
          this.updateLevels(3, groupId);
          const x = response.data.map(e => e.NAME);
          const y = response.data.map(e => ({ value: e.total, _data: e }));
          this.chart3.setOption(this.setBarOption(x, y));
        }
      });
    },
    getChart5() {
      platformApi.getapicountbytime().then(response => {
        const x = response.data.map(e => e.click_date);
        const y = [{ name: '次数', data: response.data.map(e => e.count) }];
        this.chart5.setOption(this.setLineOption(x, y));
      });
    },
    getChart7() {
      alarmInfoApi.last7AlarmLevelCount().then(response => {
        const d = [
          { name: '提示', value: response.data.level1.total, _data: response.data.level1 },
          { name: '主要', value: response.data.level2.total, _data: response.data.level2 },
          { name: '严重', value: response.data.level3.total, _data: response.data.level3 },
          { name: '紧急', value: response.data.level4.total, _data: response.data.level4 }
        ];
        const r = [`${this.radius - 20}%`, `${this.radius}%`];
        this.chart7.setOption(this.setPieOption(d, r));
      });
    },
    getChart8() {
      alarmInfoApi.last7AlarmHandleCount().then(response => {
        const d = Object.entries(response.data).map(e => ({ name: e[0], value: e[1].total, _data: e[1] }));
        const r = [`${this.radius - 20}%`, `${this.radius}%`];
        this.chart8.setOption(this.setPieOption(d, r));
      });
    },
    getChart10_11_12() {
      [
        { chart: 'chart10', name: 'cpu使用率', query: `cpu_usage_idle{cpu="cpu-total",ident=~"${this.ident}"}` },
        { chart: 'chart11', name: '内存使用率', query: `mem_used_percent{ident=~"${this.ident}"}` },
        { chart: 'chart12', name: '磁盘使用率', query: `disk_used_percent{ident=~"${this.ident}"}` }
      ].forEach(e => {
        monitorStaticApi
          .getN9eMonitorData({
            urlPath: encodeURIComponent(
              `/api/n9e/prometheus/api/v1/query_range?${qs({
                start: dayjs().subtract(1, 'm').unix(),
                end: dayjs().unix(),
                step: 14,
                query: e.query
              })}`
            )
          })
          .then(response => {
            const d = JSON.parse(response.data).data.result[0].values[0][1];
            this[e.chart].setOption(this.setGaugeOption(d, e.name));
          });
      });
    },
    back(i) {
      switch (i) {
        case 1:
        case 5:
        case 7:
        case 8:
          this[`getChart${i}`]();
          this.levels[i] = [];
          break;
        case 3:
          this.levels[i].pop();
          if (this.levels[i][this.levels[i].length - 1]) {
            this.getChart3Detail(this.levels[i][this.levels[i].length - 1]);
          } else {
            this.getChart3();
          }
          break;
      }
      this.$forceUpdate();
    },
    identChange() {
      this.getChart10_11_12();
    },
    updateLevels(i, d) {
      this.levels[i].push(d);
      this.levels[i] = Array.from(new Set(this.levels[i]));
      this.$forceUpdate();
    },
    setPieOption(d, r) {
      return {
        legend: { bottom: 0, left: 'center' },
        series: { type: 'pie', radius: r, center: ['50%', '40%'], label: { formatter: '{b}：{c}' }, data: d }
      };
    },
    setBarOption(x, y, h) {
      const option = {
        grid: { top: 20, left: 0, right: 0, bottom: 0, containLabel: true },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        series: [{ type: 'bar', data: y }]
      };
      if (h) {
        option.xAxis = { type: 'value' };
        option.yAxis = { type: 'category', data: x };
      } else {
        option.xAxis = {
          type: 'category',
          data: x,
          axisLabel: { rotate: 45, formatter: v => (v.length > 3 ? `${v.substring(0, 5)}...` : v) }
        };
        option.yAxis = { type: 'value' };
      }
      return option;
    },
    setLineOption(x, y) {
      return {
        legend: { top: 0, right: 0 },
        grid: { top: 40, left: 0, right: 0, bottom: 0, containLabel: true },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: x, axisLabel: { rotate: 45 } },
        yAxis: { type: 'value' },
        series: y.map(e => ({ name: e.name, data: e.data, type: 'line' }))
      };
    },
    setGaugeOption(d, n) {
      return {
        series: [
          {
            type: 'gauge',
            radius: '90%',
            axisLine: {
              lineStyle: {
                width: 10,
                color: [
                  [0.3, '#67e0e3'],
                  [0.7, '#37a2da'],
                  [1, '#fd666d']
                ]
              }
            },
            pointer: { itemStyle: { color: 'inherit' } },
            axisTick: { distance: -10, length: 5, lineStyle: { color: '#fff', width: 1 } },
            splitLine: { show: false },
            axisLabel: { color: 'inherit', distance: -5, fontSize: 8 },
            detail: { fontSize: 15, formatter: n, color: 'inherit', offsetCenter: [0, '85%'] },
            data: [{ value: Number(d) }]
          }
        ]
      };
    }
  }
};
</script>
