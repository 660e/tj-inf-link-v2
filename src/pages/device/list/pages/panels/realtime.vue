<template>
  <div class="q-pa-md">
    <iot-title title="实时数据" />
    <div class="flex q-pt-md q-gutter-md">
      <q-card v-for="(p, i) in propertys" :key="i" style="width: 300px">
        <q-card-section class="q-gutter-y-sm">
          <div>{{ p.name || '-' }}</div>
          <div class="text-h6">
            <div class="ellipsis full-width">{{ p.value === 0 ? 0 : p.value || '-' }} {{ p.unitName }}</div>
            <q-tooltip>{{ p.value === 0 ? 0 : p.value || '-' }} {{ p.unitName }}</q-tooltip>
          </div>
          <div>{{ p.timestamp | timestamp }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      id: this.$route.params.id,
      label: this.$route.query.label,
      propertys: [],
      ws: null,
      timer: null
    };
  },
  mounted() {
    devicesApi.getDevicePropertys(this.id).then(response => {
      this.propertys = response.data;
      this.openWebSocket(this.label);
    });
  },
  destroyed() {
    this.ws && this.ws.close();
    this.timer && clearTimeout(this.timer);
  },
  methods: {
    openWebSocket(label) {
      this.ws = new WebSocket(`${window.$CONFIG.url.websocket}${label}`);
      this.ws.onopen = () => console.log(`%c${label} 已连接`, 'color: green');
      this.ws.onmessage = message => {
        const { b, h } = JSON.parse(message.data);
        if (h.c === 'device_data') {
          this.propertys.forEach(p => {
            b.forEach(e => {
              const key = Object.keys(e).filter(k => k !== 'timestampR')[0];
              if (p.convertLabel === key) {
                p.value = e[key] === 0 ? 0 : e[key];
                p.timestamp = dayjs(e.timestampR).format('YYYY-MM-DD HH:mm:ss');
              }
            });
          });
        }
      };
      this.ws.onerror = () => {
        console.log(`%c${label} 正在重连...`, 'color: red');
        this.timer = setTimeout(() => this.openWebSocket(label), 5000);
      };
      this.ws.onclose = () => console.log(`%c${label} 已断开`, 'color: red');
    }
  },
  filters: {
    timestamp(val) {
      return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-';
    }
  }
};
</script>
