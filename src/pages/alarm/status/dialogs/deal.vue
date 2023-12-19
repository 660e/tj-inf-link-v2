<template>
  <iot-dialog :visible="visible" :width="500" :title="isDeal ? '处理' : '处理结果'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <template v-if="isDeal">
        <iot-form-item :value.sync="forms.handleType" label="处理方式" type="radio" :options="handleTypeOptions" />
        <iot-form-item :value.sync="forms.handleNote" label="处理描述" type="textarea" maxlength="100" />
      </template>
      <template v-else>
        <iot-form-item :value="field.handleType" label="处理方式" type="field" />
        <iot-form-item :value="field.handleNote" label="处理描述" type="field" />
        <iot-form-item :value="field.handleTime" label="处理时间" type="field" />
        <iot-form-item :value="field.userAccount" label="处理人" type="field" />
      </template>
    </q-form>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { alarmHandleApi } from '@/api/wsat-service-alarm/alarm-handle.js';
import { extend } from 'quasar';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      visible: false,
      isDeal: true,
      row: {},
      RESET: {
        forms: {},
        field: {}
      },
      forms: {
        handleType: 1,
        handleNote: ''
      },
      field: {},
      handleTypeOptions: []
    };
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms),
      field: extend(true, {}, this.field)
    };
  },
  methods: {
    open(row) {
      this.isDeal = row.alarmStatus === 1;
      extendApi.getDateItemBycodes(['handleType']).then(response => {
        this.handleTypeOptions = response.handleType;
        if (this.isDeal) {
          this.row = extend(true, {}, row);
        } else {
          alarmHandleApi.alarmHandleQuery(row.alarmId).then(alarm => {
            this.field = {
              handleType: alarm.data[0].handleType === 1 ? '已处理' : '已忽略',
              handleNote: alarm.data[0].handleNote,
              handleTime: dayjs(alarm.data[0].handleTime).format('YYYY-MM-DD HH:mm:ss'),
              userAccount: alarm.data[0].userAccount
            };
          });
        }
        this.visible = true;
      });
    },
    confirm() {
      if (this.isDeal) {
        const params = {
          productId: this.row.productId,
          alarmId: this.row.alarmId,
          ...this.forms
        };
        alarmHandleApi.addAlarmHandle(params).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: '处理成功' });
            this.$emit('confirm');
            this.cancel();
          }
        });
      } else {
        this.cancel();
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.forms = extend(true, {}, this.RESET.forms);
      this.field = extend(true, {}, this.RESET.field);
    }
  }
};
</script>
