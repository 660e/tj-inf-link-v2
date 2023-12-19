<template>
  <div class="q-pa-md">
    <iot-title title="实时数据" />
    <div class="flex q-pt-md q-gutter-md">
      <q-card v-for="(p, i) in propertys" :key="i" style="width: 300px">
        <q-card-section class="q-gutter-y-sm">
          <div>{{ p.name || '-' }}</div>
          <div class="text-grey">{{ p.deviceName || '-' }}</div>
          <div class="text-h6">{{ p.value || '-' }} {{ p.unitName }}</div>
          <div class="flex justify-between items-center">
            <div>{{ p.modifyTime || '-' }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      id: this.$route.params.id,
      propertys: [],
      WSs: []
    };
  },
  mounted() {
    perceivedApi.getdevicelist({ id: this.id, pageNum: 1, pageSize: 999 }).then(deviceResponse => {
      if (deviceResponse.data.length) {
        perceivedApi.getpropertys(deviceResponse.data.map(d => d.ID)).then(propertyResponse => {
          this.propertys = propertyResponse.data;
          deviceResponse.data.forEach(d => this.openWebSocket(d.LABEL));
        });
      }
    });
  },
  destroyed() {
    this.WSs.forEach(ws => ws.close());
  },
  methods: {
    openWebSocket(label) {
      const ws = new WebSocket(`${window.$CONFIG.url.websocket}${label}`);
      ws.onopen = () => console.log(`%c${label} 已连接`, 'color: green');
      ws.onmessage = message => {
        const { b, h } = JSON.parse(message.data);
        if (h.c === 'device_data') {
          this.propertys.forEach(p => {
            if (p.deviceId === Number(h.id)) {
              b.forEach(e => {
                const key = Object.keys(e).filter(k => k !== 'timestampR')[0];
                if (p.label === key) {
                  p.value = e[key];
                  p.modifyTime = dayjs(e.timestampR).format('YYYY-MM-DD HH:mm:ss');
                }
              });
            }
          });
        }
      };
      ws.onerror = () => {
        console.log(`%c${label} 正在重连...`, 'color: red');
        setTimeout(() => this.openWebSocket(label), 5000);
      };
      ws.onclose = () => console.log(`%c${label} 已断开`, 'color: red');
      this.WSs.push(ws);
    }
  }
};
</script>
