<template>
  <iot-dialog :visible="visible" :width="500" :buttons="buttons" @handle="handle" title="导入">
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
        auto-upload
      />
      <div class="q-pt-md">
        <q-banner v-if="banner.color" :class="[`bg-${banner.color}`]" class="text-white" rounded>
          <div v-for="(t, i) in banner.texts" :key="i" style="font-size: 12px">{{ t }}</div>
        </q-banner>
      </div>
    </q-form>
  </iot-dialog>
</template>

<script>
import { uploadApi } from '@/api/wsat-service-device/upload.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';

export default {
  data() {
    return {
      visible: false,
      buttons: [{ label: '取消', command: 'cancel' }],
      banner: {},
      file: null
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    factory() {
      return devicesApi.checkProductObj();
    },
    uploaded(info) {
      if (info.xhr.status === 200) {
        const response = JSON.parse(info.xhr.response);
        if (response.httpCode === 409) {
          this.banner = { color: 'warning', texts: [response.data] };
        } else if (response.httpCode === 200 && response.data) {
          this.banner = {
            color: 'negative',
            texts: response.data
              .map((e, i, a) => {
                if (i !== a.length - 1) {
                  return e.split(';&&');
                }
              })
              .flat()
              .filter(e => e)
          };
        } else {
          this.banner = { color: 'positive', texts: ['校验成功'] };
          this.file = info.files[0];
          this.buttons = [
            { label: '上传', command: 'upload', color: 'primary' },
            { label: '取消', command: 'cancel' }
          ];
        }
      }
    },
    failed() {
      this.$q.notify({ type: 'negative', message: '上传失败，请重试' });
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          this.banner = {};
          this.buttons = [{ label: '取消', command: 'cancel' }];
          break;
        case 'upload': {
          uploadApi.productUploadByObjModel({ file: this.file }).then(response => {
            if (response) {
              this.handle({ command: 'cancel' });
            }
          });
          break;
        }
      }
    }
  }
};
</script>
