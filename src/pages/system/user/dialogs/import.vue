<template>
  <iot-dialog
    :visible="visible"
    :width="500"
    :buttons="[
      { label: '上传', command: 'upload', color: 'primary' },
      { label: '取消', command: 'cancel' }
    ]"
    @handle="handle"
    title="导入"
  >
    <q-form>
      <q-uploader
        :factory="factory"
        @uploaded="uploaded"
        @failed="failed"
        ref="uploader"
        label="选择模板"
        accept=".xlsx"
        class="full-width"
        max-files="1"
      />
      <q-btn class="q-mt-md" @click="download">下载模板</q-btn>
    </q-form>
  </iot-dialog>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { exportFile } from '@/utils/data.js';

export default {
  data() {
    return {
      visible: false,
      buttons: []
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    download() {
      extendApi.Templatedownload().then(response => exportFile(response, '模板.xlsx'));
    },
    factory() {
      return extendApi.posts();
    },
    uploaded(info) {
      if (info.xhr.status === 200) {
        this.handle({ command: 'cancel' });
      } else {
        this.failed();
      }
    },
    failed() {
      this.$q.notify({ type: 'negative', message: '上传失败，请重试' });
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
        case 'upload': {
          this.$refs.uploader.upload();
          break;
        }
      }
    }
  }
};
</script>
