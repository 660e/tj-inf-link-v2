<template>
  <iot-dialog :visible="visible" :width="1000" :title="title" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle">
    <div class="col column no-scroll">
      <iot-searchbar :fields="fields" @search="search" class="q-pb-md" />
      <q-separator />
      <div class="col scroll q-px-md q-pb-md">
        <div v-for="c in charts" :key="c.id" class="q-mt-md">
          <div class="text-subtitle2 q-pb-xs">{{ c.name || c.id }}</div>
          <q-card bordered flat>
            <q-card-section>
              <div :id="c.id" style="height: 200px"></div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </iot-dialog>
</template>

<script>
import dayjs from 'dayjs';
import { qs, isObject } from '@/utils/data.js';
import { monitorStaticApi } from '@/api/wsat-service-device/monitor-static.js';

export default {
  data() {
    return {
      visible: false,
      title: '',
      charts: [],
      fields: [
        {
          label: '日期时间范围',
          key: 'date-time-range',
          type: 'date-time-range',
          value: [],
          props: {}
        }
      ]
    };
  },
  methods: {
    open(title, charts) {
      this.title = title;
      this.charts = charts;
      this.fields[0].value = [this.start(), this.end()];
      this.search({});
      this.visible = true;
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
      }
    },
    search({ start = this.start(), end = this.end() }) {
      this.charts.forEach(c => {
        this.$nextTick(() => {
          if (!c.chart) {
            c.chart = this.$echarts.init(document.querySelector(`#${c.id}`));
          }
          c.chart.showLoading();

          Promise.all(
            c.querys.map(q => {
              return monitorStaticApi.getN9eMonitorData({
                urlPath: encodeURIComponent(
                  `/api/n9e/prometheus/api/v1/query_range?${qs({
                    start: dayjs(start).unix(),
                    end: dayjs(end).unix(),
                    step: 14,
                    query: isObject(q) ? q.query : q
                  })}`
                )
              });
            })
          ).then(response => {
            const xAxis = JSON.parse(response[0].data).data.result[0].values;
            const yAxis = response.map((r, i) => {
              return {
                name: c.querys[i].name,
                data: JSON.parse(r.data).data.result[0].values
              };
            });
            c.chart.setOption({
              grid: {
                top: 10,
                left: 0,
                right: 0,
                bottom: 0,
                containLabel: true
              },
              tooltip: {
                trigger: 'axis'
              },
              xAxis: {
                type: 'category',
                data: xAxis.map(e => dayjs.unix(e[0]).format('HH:mm'))
              },
              yAxis: {
                type: 'value'
              },
              series: yAxis.map((y, i) => {
                return {
                  name: y.name,
                  data: y.data.map(e => Number(e[1]).toFixed(2)),
                  type: 'line',
                  zlevel: i
                };
              })
            });
            c.chart.hideLoading();
          });
        });
      });
    },
    start() {
      const now = dayjs();
      return (now.subtract(1, 'h').unix() - now.second()) * 1000;
    },
    end() {
      const now = dayjs();
      return (now.unix() - now.second()) * 1000;
    }
  }
};
</script>
