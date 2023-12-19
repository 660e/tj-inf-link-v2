<template>
  <iot-dialog :visible="visible" :width="500" @confirm="confirm" @cancel="cancel" title="导入">
    <q-form class="q-gutter-y-md">
      <q-btn @click="exportTemplate" label="下载模板" />
      <q-uploader :factory="factory" @uploaded="uploaded" @failed="failed" label="上传模板" class="full-width" accept=".xls, .xlsx" ref="uploader" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { exportFile } from '@/utils/data.js';
export default {
  data() {
    return {
      visible: false
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    confirm() {
      this.$refs.uploader.upload();
    },
    cancel() {
      this.visible = false;
    },
    exportTemplate() {
      perceivedApi.exportTemplate().then(response => exportFile(response, '模板.xlsx'));
    },
    factory() {
      return perceivedApi.import();
    },
    uploaded() {
      this.$emit('confirm');
      this.cancel();
    },
    failed() {
      this.$q.notify({ type: 'negative', message: '上传失败，请重试' });
    }
  }
};
</script>
