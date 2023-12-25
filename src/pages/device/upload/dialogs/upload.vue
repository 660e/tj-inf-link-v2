<template>
  <iot-dialog
    :visible="visible"
    :title="card.name === 'ALL' ? '一键导入' : `导入${card.name}${card.type}`"
    :width="500"
    :buttons="buttons"
    @handle="handle"
  >
    <div class="q-pa-md q-gutter-y-md">
      <q-select
        v-model="resource"
        :options="resourceOptions"
        label="资源空间"
        option-label="resSpaceName"
        option-value="id"
        dense
        emit-value
        hide-bottom-space
        map-options
        options-dense
        outlined
      />
      <q-uploader
        :factory="factory"
        :disable="!resource"
        @added="added"
        @removed="removed"
        @uploaded="uploaded"
        @failed="failed"
        ref="uploader"
        label="选择模板"
        accept=".xlsx"
        class="full-width"
        max-files="1"
      />
    </div>
    <div class="q-px-md q-gutter-y-md">
      <q-banner v-if="banner.color" :class="[`bg-${banner.color}`]" class="text-white" rounded>
        <div v-for="(t, i) in banner.texts" :key="i" style="font-size: 12px">{{ t }}</div>
      </q-banner>
    </div>
  </iot-dialog>
</template>

<script>
import { extend } from 'quasar';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import * as XLSX from 'xlsx/xlsx.mjs';

export default {
  data() {
    return {
      visible: false,
      buttons: [{ label: '取消', command: 'cancel' }],
      card: {},
      sheetNames: [],
      totalNum: 0,
      banner: {},
      file: null,
      resource: '',
      resourceOptions: []
    };
  },
  methods: {
    open(card) {
      this.card = extend(true, {}, card);
      sysApi.resSpacelist().then(response => {
        this.resourceOptions = response;
        this.visible = true;
      });
    },
    factory() {
      return devicesApi.oneKeyCheckDevices(this.sheetNames.join(','));
    },
    added(files) {
      const reader = new FileReader();
      reader.onload = e => {
        this.sheetNames = this.card.sheetName ? [this.card.sheetName] : XLSX.read(e.target.result).SheetNames;
        this.$refs.uploader.upload();
      };
      reader.readAsArrayBuffer(files[0]);
    },
    removed() {
      this.banner = {};
      this.$refs.uploader.reset();
      this.buttons = [{ label: '取消', command: 'cancel' }];
    },
    uploaded(info) {
      if (info.xhr.status === 200) {
        const data = JSON.parse(info.xhr.response).data;
        if (data.length === 1) {
          if (data[0] === '0') {
            this.banner = { color: 'warning', texts: ['有效数据为0，请检查模板'] };
          } else {
            this.banner = { color: 'positive', texts: [`校验成功，共${data[0]}条数据等待上传...`] };
            this.card.total = Number(data[0]);
            this.file = info.files[0];
            this.totalNum = data[0];
            this.buttons = [
              { label: '上传', command: 'upload', color: 'primary' },
              { label: '取消', command: 'cancel' }
            ];
          }
        } else {
          this.banner = {
            color: 'negative',
            texts: data
              .map((e, i, a) => {
                if (i !== a.length - 1) {
                  return e.split(';&&');
                }
              })
              .flat()
              .filter(e => e)
          };
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
          const params = {
            file: this.file,
            sheetNames: this.sheetNames,
            totalNum: this.totalNum,
            resSpaceId: this.resource
          };
          devicesApi.oneKeyUpload(params).then(response => {
            if (response) {
              this.$store.commit('upload', { ...this.card, ...response.data });
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
