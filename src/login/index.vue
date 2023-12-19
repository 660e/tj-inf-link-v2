<template>
  <div class="bg relative-position">
    <img src="./v.png" class="absolute" />
    <div @keyup.enter="login" class="card bg-white absolute q-px-xl q-pt-xl">
      <div class="flex flex-center q-pb-xl">
        <img v-show="ui.logo.show" :src="ui.logo.src" :style="ui.logo.style" />
        <span v-show="ui.text.show" v-text="ui.text.content" :style="ui.text.style"></span>
      </div>
      <div class="q-gutter-y-md q-pb-xl">
        <q-input v-model="forms.username" clear-icon="close" label="账号">
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input v-model="forms.password" clear-icon="close" label="密码" type="password">
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>
        <div v-if="ui.captcha" class="flex">
          <q-input v-model="forms.captcha" label="验证码" maxlength="4" class="col q-mr-md"> </q-input>
          <canvas id="captcha"></canvas>
        </div>
      </div>
      <q-btn :loading="loading" @click="login" class="q-mb-lg full-width text-h6" color="primary" label="登录" />
      <div v-if="ui.sso" class="text-center">
        <span @click="ssologin" class="text-primary cursor-pointer">统一认证</span>
      </div>
      <div class="py-10 text-center text-gray-400">{{ ui.copyright }}</div>
    </div>
  </div>
</template>

<script>
import Captcha from 'captcha-mini';
import { licensesApi } from '@/api/wsat-service-device/licenses.js';
import { login } from '@/utils/login.js';
import { getUrlParams } from '@/utils/data.js';

export default {
  data() {
    return {
      loading: false,
      ui: window.$CONFIG.ui.login,
      forms: {
        username: '',
        password: '',
        captcha: ''
      },
      captcha: {
        instance: null,
        text: ''
      }
    };
  },
  mounted() {
    if (window.$CONFIG.license) {
      licensesApi.getLicenseInfoDL().then(response => {
        if (response.data.state === 2) {
          this.initCaptcha();
        } else {
          this.$router.push({ name: 'license' });
        }
      });
    } else {
      if (location.search) {
        this.$router.push({ name: 'sso', query: { code: getUrlParams(location.search).code } });
      } else if (this.ui.captcha) {
        this.initCaptcha();
      }
    }
  },
  methods: {
    login() {
      this.loading = true;
      if (this.ui.captcha && this.forms.captcha.toLowerCase() !== this.captcha.text.toLowerCase()) {
        this.$q.notify({ type: 'negative', message: '验证码错误' });
        this.captcha.instance.drawAgain();
        this.forms.captcha = '';
        this.loading = false;
      } else {
        login(this.forms).catch(error => {
          this.$q.notify({ type: 'negative', message: error.response.data.error_description });
          this.captcha.instance.drawAgain();
          this.loading = false;
        });
      }
    },
    ssologin() {
      window.location.href =
        'https://oauth2.taiji.com.cn/oauth/authorize?client_id=inf-link&response_type=code&scope=user_info&state=&redirect_uri=http://192.168.67.14:1883/#/sso';
    },
    initCaptcha() {
      this.captcha.instance = new Captcha({ fontSize: 77 });
      this.captcha.instance.draw(document.querySelector('#captcha'), c => (this.captcha.text = c));
    }
  }
};
</script>

<style lang="scss" scoped>
.bg {
  background: url('./bg.png') no-repeat center center / cover;
  height: 100vh;
  & > img {
    height: 80%;
    transform: translateY(-50%);
    top: 50%;
    left: 15%;
    z-index: 2;
  }
  .card {
    box-shadow: rgba(0, 0, 0, 0.15) 0 2px 15px;
    border-radius: 4px;
    width: 25%;
    transform: translateY(-50%);
    top: 50%;
    right: 10%;
    z-index: 3;
    canvas {
      border-radius: 4px;
      height: 50px;
      width: 150px;
      margin-top: 6px;
    }
    ::v-deep .q-field--standard .q-field__control:before {
      border-color: #dedede;
    }
    .q-btn::v-deep .q-btn__wrapper::before {
      box-shadow: 0 1px 1px #e6e7eb;
    }
  }
}
@media screen and (max-width: 1600px) {
  .bg {
    .card {
      width: 30%;
      right: 10%;
    }
  }
}
</style>
