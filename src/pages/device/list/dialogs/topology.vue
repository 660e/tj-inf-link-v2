<template>
  <iot-dialog :visible="visible" :width="1000" title="拓扑" :buttons="buttons" @handle="handle">
    <q-stepper v-model="step" ref="stepper" color="primary" class="col column no-shadow" animated keep-alive>
      <q-step :name="1" title="选择设备" icon="edit" :done="step > 1">
        <iot-table
          :data="data"
          :selected="selected"
          :columns="columns"
          :pagination="pagination"
          @request="onRequest"
          @selected="onSelected"
          selection="multiple"
        />
      </q-step>
      <q-step :name="2" title="生成拓扑" icon="edit">
        <topology-panel :ids="selected.map(e => e.id)" />
      </q-step>
    </q-stepper>
  </iot-dialog>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import TopologyPanel from '../pages/panels/topology.vue';
export default {
  components: {
    TopologyPanel
  },
  data() {
    return {
      visible: false,
      buttons: [],
      step: 1,
      data: [],
      selected: [],
      columns: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      }
    };
  },
  mounted() {
    this.buttons = [
      { label: '生成拓扑', command: 'create', color: 'primary' },
      { label: '选择设备', command: 'select', color: 'primary', show: false },
      { label: '取消', command: 'cancel' }
    ];
    this.columns = [
      {
        label: '名称',
        name: 'name',
        field: 'name',
        align: 'left'
      },
      {
        label: '设备状态',
        name: 'onlineStatus',
        field: 'onlineStatus',
        align: 'left',
        badge: val => {
          switch (val) {
            case 0:
              return 'negative';
            case 1:
              return 'positive';
            case 2:
              return 'grey';
          }
        }
      },
      {
        label: '最后上线时间',
        name: 'lastOfflineTime',
        field: 'lastOfflineTime',
        align: 'left'
      }
    ];
  },
  methods: {
    open() {
      extendApi.getDateItemByParentcode({ code: 'onlineStatus' }).then(response => {
        this.columns.find(e => e.name === 'onlineStatus').format = val => {
          return response.find(e => Number(e.code) === val) ? response.find(e => Number(e.code) === val).name : '-';
        };
        this.onRequest(this.pagination);
        this.visible = true;
      });
    },
    onRequest(pagination) {
      this.$store.commit('loading', true);
      const params = {
        pageNum: pagination.page,
        pageSize: pagination.rowsPerPage,
        roleId: this.$q.sessionStorage.getItem('account').login.role
      };
      devicesApi.getDevicesList(params).then(response => {
        this.pagination.page = response.current;
        this.pagination.rowsPerPage = response.size;
        this.pagination.rowsNumber = response.total;
        this.data = response.data;
        this.$store.commit('loading', false);
      });
    },
    onSelected(selected) {
      this.selected = selected;
    },
    handle({ command }) {
      switch (command) {
        case 'create':
          if (this.selected.length) {
            this.$refs.stepper.next();
          } else {
            this.$q.notify({ type: 'warning', message: '最少选择一项设备' });
          }
          break;
        case 'select':
          this.$refs.stepper.previous();
          break;
        case 'cancel':
          this.visible = false;
          this.$store.commit('loading', false);
          this.step = 1;
          this.selected = [];
          this.pagination.rowsNumber = 0;
          break;
      }
    }
  },
  watch: {
    step(n) {
      switch (n) {
        case 1:
          this.buttons[0].show = true; // create
          this.buttons[1].show = false; // select
          break;
        case 2:
          this.buttons[0].show = false; // create
          this.buttons[1].show = true; // select
          break;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
$space: 16px;
.q-stepper ::v-deep .q-stepper__content {
  flex: 1;
  .q-stepper__step-content {
    height: 100%;
    .q-stepper__step-inner {
      height: 100%;
      padding: 0;
      display: flex;
    }
  }
}
</style>
