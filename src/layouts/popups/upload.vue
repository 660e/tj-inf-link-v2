<template>
  <q-popup-proxy @show="show" @hide="hide">
    <div class="q-pb-sm" style="width: 350px">
      <div class="relative-position" style="min-height: 100px">
        <q-inner-loading :showing="loading">
          <q-spinner-dots color="primary" size="md" />
        </q-inner-loading>
        <div v-if="!loading && !tasks.length" class="absolute-full flex flex-center">暂无导入任务</div>
        <div v-if="!loading && tasks.length" style="max-height: 300px; overflow: auto" class="q-pa-sm q-gutter-y-sm">
          <q-linear-progress v-for="t in tasks" :key="t.id" :value="1" size="48px" rounded>
            <div class="q-px-sm text-white absolute-full flex items-center justify-between" style="font-size: 12px">
              <div class="flex column">
                <div>{{ t.name }}</div>
                <div>{{ t.createTime }}</div>
              </div>
              <div>{{ (((Number(t.successNum) + Number(t.errorNum)) / Number(t.totalNum)) * 100).toFixed(2) }}%</div>
              <div
                v-if="Number(t.totalNum) === Number(t.successNum) + Number(t.errorNum)"
                @click="updateUploadTask(t)"
                class="absolute-full flex flex-center cursor-pointer stamp"
              >
                <span>任务已完成，共{{ t.totalNum }}条，失败</span>
                <span class="text-negative">{{ t.errorNum }}</span>
                <span>条，单击移除该任务</span>
              </div>
            </div>
          </q-linear-progress>
        </div>
      </div>
      <q-separator class="q-mb-sm" />
      <q-list dense>
        <q-item @click="download" clickable v-ripple>
          <q-item-section>下载模板</q-item-section>
          <q-item-section side>
            <q-icon name="download" />
          </q-item-section>
        </q-item>
        <q-item @click="pick" clickable v-ripple>
          <q-item-section>导入数据</q-item-section>
          <q-item-section side>
            <q-icon name="upload" />
          </q-item-section>
        </q-item>
      </q-list>
      <template v-if="banner.color">
        <q-separator class="q-my-sm" />
        <q-banner :class="[`bg-${banner.color}`]" class="text-white q-mx-sm" dense rounded>
          <div v-for="(t, i) in banner.texts" :key="i" style="font-size: 12px">{{ t }}</div>
        </q-banner>
      </template>
      <q-uploader
        :factory="factory"
        @added="added"
        @uploaded="uploaded"
        @failed="failed"
        accept=".xlsx"
        max-files="1"
        ref="uploader"
        style="display: none"
      ></q-uploader>
    </div>
  </q-popup-proxy>
</template>

<script>
import { uploadApi } from '@/api/wsat-service-device/upload.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { exportFile } from '@/utils/data.js';
import * as XLSX from 'xlsx/xlsx.mjs';

export default {
  data() {
    return {
      loading: true,
      tasks: [],
      timer: null,
      sheetNames: [],
      banner: {}
    };
  },
  destroyed() {
    this.clear();
  },
  methods: {
    getUploadTaskByCurrentUser() {
      uploadApi.getUploadTaskByCurrentUser().then(response => {
        this.tasks = response.data;
        this.loading = false;
      });
    },
    updateUploadTask(t) {
      uploadApi.updateUploadTask(t).then(response => response && this.getUploadTaskByCurrentUser());
    },
    show() {
      this.getUploadTaskByCurrentUser();
      this.timer = setInterval(this.getUploadTaskByCurrentUser, 3000);
    },
    hide() {
      this.clear();
    },
    clear() {
      clearInterval(this.timer);
      this.banner = {};
      this.loading = true;
    },
    download() {
      devicesApi.deviceTemplates().then(response => exportFile(response, '批量导入模板.xlsx'));
    },
    pick() {
      this.$refs.uploader.pickFiles();
    },
    factory() {
      return devicesApi.oneKeyCheckDevices(this.sheetNames.join(','));
    },
    added(files) {
      this.banner = { color: 'grey', texts: ['正在校验数据...'] };
      const reader = new FileReader();
      reader.onload = e => {
        this.sheetNames = XLSX.read(e.target.result).SheetNames;
        this.$refs.uploader.upload();
      };
      reader.readAsArrayBuffer(files[0]);
    },
    uploaded(info) {
      if (info.xhr.status === 200) {
        const data = JSON.parse(info.xhr.response).data;
        if (data.length === 1) {
          if (data[0] === '0') {
            this.banner = { color: 'warning', texts: ['有效数据为0，请检查模板'] };
          } else {
            this.banner = { color: 'positive', texts: [`校验成功，共${data[0]}条数据`] };
            devicesApi.oneKeyUpload({ file: info.files[0], sheetNames: this.sheetNames, totalNum: data[0] });
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
      this.$refs.uploader.reset();
    },
    failed() {
      this.banner = { color: 'negative', texts: ['上传失败，请重试'] };
    }
  }
};
</script>

<style lang="scss" scoped>
.stamp {
  opacity: 0;
  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
    opacity: 1;
  }
}
</style>
