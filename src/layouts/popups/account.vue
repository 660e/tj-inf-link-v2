<template>
  <q-popup-proxy>
    <div class="account">
      <div :class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']">
        <h6>{{ account.name }}</h6>
        <q-avatar class="absolute" color="white" size="64px" :style="{ borderColor: account.gender ? '#90caf9' : '#f48fb1' }" />
      </div>
      <q-list dense>
        <q-item tag="label" clickable v-ripple>
          <q-item-section>深色模式</q-item-section>
          <q-item-section side>
            <q-toggle v-model="dark" dense />
          </q-item-section>
        </q-item>
        <q-expansion-item label="系统语言" dense>
          <q-list dense>
            <q-item v-for="l in langOptions" :key="l.value" tag="label" clickable v-ripple>
              <q-item-section>- {{ l.label }}</q-item-section>
              <q-item-section side>
                <q-radio v-model="lang" :val="l.value" dense />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item clickable>
          <q-item-section>系统版本</q-item-section>
          <q-item-section side>v{{ version.app }}</q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>框架版本</q-item-section>
          <q-item-section side>v{{ version.quasar }}</q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>许可证有效期至</q-item-section>
          <q-item-section side>{{ licenses || '-' }}</q-item-section>
          <q-uploader :factory="factory" @uploaded="uploaded" @failed="failed" accept=".license" class="hidden" max-files="1" ref="uploader" auto-upload />
        </q-item>
        <q-item v-if="!update" @click="upload" clickable>
          <q-item-section class="text-primary">更新许可证</q-item-section>
        </q-item>
      </q-list>
      <q-separator class="q-mt-sm" />
      <div class="q-pa-sm flex">
        <q-btn @click="logout" label="退出" class="col" color="negative" dense flat />
      </div>
    </div>
  </q-popup-proxy>
</template>

<script>
import { logout } from '@/utils/login.js';
import { licensesApi } from '@/api/wsat-service-device/licenses.js';
import { minioApi } from '@/api/wsat-service-device/minio.js';
import PKG from '../../../package.json';
import languages from 'quasar/lang/index.json';
import zh_hans from 'quasar/lang/zh-hans.js';
import en_us from 'quasar/lang/en-us.js';

export default {
  props: {
    account: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dark: this.$q.localStorage.getItem('dark'),
      lang: this.$q.localStorage.getItem('lang'),
      langOptions: [],
      version: {
        app: PKG.version,
        quasar: this.$q.version
      },
      licenses: '',
      update: window.$CONFIG.license
    };
  },
  created() {
    console.log(`%cApp: v${this.version.app}`, 'color: green');
    console.log(`%cQuasar: v${this.version.quasar}`, 'color: green');
  },
  mounted() {
    this.langOptions = languages
      .filter(lang => ['zh-hans', 'en-us'].includes(lang.isoName))
      .map(lang => ({
        label: lang.nativeName,
        value: lang.isoName
      }));
    this.getLicenses();
  },
  methods: {
    logout() {
      logout();
    },
    getLicenses() {
      licensesApi.getLicenseInfo().then(response => (this.licenses = response.expiryDate));
    },
    upload() {
      this.$refs.uploader.pickFiles();
    },
    factory(files) {
      return minioApi.coverUpload(files);
    },
    uploaded() {
      this.$q.notify({ type: 'positive', message: '许可证上传成功' });
      this.getLicenses();
      this.$refs.uploader.reset();
    },
    failed() {
      this.$q.notify({ type: 'negative', message: '许可证上传失败，请重试' });
      this.$refs.uploader.reset();
    }
  },
  watch: {
    dark(dark) {
      this.$q.dark.set(dark);
      this.$q.localStorage.set('dark', dark);
    },
    lang(lang) {
      switch (lang) {
        case 'zh-hans':
          this.$q.lang.set(zh_hans);
          break;
        case 'en-us':
          this.$q.lang.set(en_us);
          break;
      }
      this.$i18n.locale = lang;
      this.$q.localStorage.set('lang', lang);
    }
  }
};
</script>

<style lang="scss" scoped>
.account {
  width: 300px;
  overflow: hidden;
  & > div:nth-child(1) {
    height: 80px;
    & > h6 {
      font-size: 14px;
      line-height: 1;
      padding-top: 25px;
      text-align: center;
    }
    .q-avatar {
      border: 2px solid;
      top: 80px;
      left: 150px;
      transform: translate(-50%, -50%);
    }
  }
  & > .q-list {
    padding-top: 50px;
  }
}
</style>
