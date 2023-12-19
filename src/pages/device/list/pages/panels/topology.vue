<template>
  <div class="q-pa-md col flex column">
    <iot-title title="设备拓扑" />
    <div class="col q-mt-md" id="topology"></div>
  </div>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { flattenTree, buildTree } from '@/utils/data.js';
export default {
  props: {
    ids: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      topology: null
    };
  },
  mounted() {
    this.topology = this.$echarts.init(document.getElementById('topology'));
    this.getData();
  },
  methods: {
    getData() {
      const params = this.ids.length ? this.ids : [this.id];
      devicesApi.getDeviceTreeList(params).then(response => {
        const data = flattenTree(response.data.childDeviceList, 'childDeviceList').map(e => {
          return {
            id: e.id,
            pid: e.pid,
            name: e.name
          };
        });
        data.push({ id: -1, pid: null, name: '物联网平台' });
        this.topology.setOption({
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
            data: buildTree(data)
          }
        });
      });
    }
  },
  watch: {
    ids() {
      this.getData();
    }
  }
};
</script>
