<template>
  <div class="q-pa-md col flex column">
    <iot-title title="感知对象拓扑" />
    <div class="col q-mt-md" id="topology"></div>
  </div>
</template>

<script>
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
export default {
  mounted() {
    perceivedApi.topology(this.$route.params.id).then(response => {
      this.$echarts.init(document.getElementById('topology')).setOption({
        series: {
          type: 'tree',
          top: '5%',
          left: '25%',
          right: '25%',
          bottom: '5%',
          edgeShape: 'polyline',
          label: {
            backgroundColor: '#fff',
            position: 'left',
            verticalAlign: 'middle',
            align: 'right'
          },
          leaves: {
            label: {
              position: 'right',
              align: 'left'
            }
          },
          data: [
            {
              name: response.data.perceivedobjectName,
              children: [
                {
                  name: '所属分组',
                  children: response.data.groupName.map(e => ({ name: e }))
                },
                {
                  name: '已绑定的网关',
                  children: response.data.gatewayDeviceName.map(e => ({ name: e.name }))
                },
                {
                  name: '已绑定的设备',
                  children: response.data.deviceName.map(e => ({ name: e }))
                }
              ]
            }
          ]
        }
      });
    });
  }
};
</script>
