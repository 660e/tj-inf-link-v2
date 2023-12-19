<template>
  <div class="window-height flex flex-center">
    <q-card style="width: 500px">
      <q-card-section>
        <div class="text-subtitle1 q-pb-xs">申请码</div>
        <q-input v-model="serverId" @click="copy" class="cursor-pointer" dense outlined readonly>
          <template v-slot:append>
            <q-icon name="content_copy" />
          </template>
        </q-input>
        <div class="text-subtitle1 q-pb-xs q-pt-md">授权码</div>
        <q-input v-model="code" :readonly="processing" type="textarea" dense outlined />
        <div class="q-pt-md flex flex-center">
          <q-btn v-if="accredited" @click="$router.push({ name: 'login' })" label="已授权，点击跳转登录" color="positive" />
          <q-btn v-else @click="accredit" :disabled="processing" :label="processing ? '授权中...' : '授权'" color="primary" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { licensesApi } from '@/api/wsat-service-device/licenses.js';
import { copyToClipboard } from 'quasar';

export default {
  data() {
    return {
      serverId: '',
      code: '',
      processing: false,
      accredited: false
    };
  },
  mounted() {
    licensesApi.getLicenseInfoDL().then(response => {
      if (response.status === 200) {
        this.serverId = response.data.serverId;
        this.accredited = response.data.state === 2;
      } else {
        this.$q.notify({ type: 'negative', message: '申请码获取失败，请重试' });
      }
    });
  },
  methods: {
    copy() {
      copyToClipboard(this.serverId).then(() => this.$q.notify({ type: 'positive', message: '已复制到剪贴板' }));
    },
    accredit() {
      this.processing = true;
      licensesApi.code(this.code).then(response => {
        this.processing = false;
        if (response.data && response.data.state === 2) {
          this.accredited = true;
        } else {
          this.$q.notify({ type: 'negative', message: '授权失败，请重试' });
        }
      });
    }
  }
};
</script>
