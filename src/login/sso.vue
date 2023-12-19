<template>
  <div class="window-height flex flex-center column">
    <div class="q-pb-sm">{{ label }}</div>
    <q-linear-progress :value="value" style="width: 30%" rounded stripe />
  </div>
</template>

<script>
import axios from 'axios';
import { login } from '@/utils/login.js';
import { LocalStorage } from 'quasar';

export default {
  data() {
    return {
      label: '',
      value: 0,
      code: ''
    };
  },
  mounted() {
    const code = this.$route.query.code;
    if (code) {
      window.location.href = `/#/sso?code=${code}`;
      this.progress('获取token...', 0.3);
      axios
        .post(
          `https://oauth2.taiji.com.cn/oauth/token?client_id=inf-link&client_secret=iot&code=${code}&grant_type=authorization_code&redirect_uri=http://192.168.67.14:1883/`,
          {
            headers: {
              Authorization: `Basic ${window.btoa(unescape(encodeURIComponent('inf-link:iot')))}`
            }
          }
        )
        .then(tokenResponse => {
          this.progress('获取用户信息...', 0.6);
          LocalStorage.set('access_token', tokenResponse.data.access_token);
          const createUserParams = {
            userName: `tj_${tokenResponse.data.sub}`,
            loginName: `tj_${tokenResponse.data.sub}`,
            password: 123456,
            phoneNum: '',
            email: '',
            gender: '1',
            userIndex: 1,
            state: '1'
          };
          axios.post('/sys/sys/user', createUserParams).then(createUserResponse => {
            if (createUserResponse.data.code === 200) {
              this.progress('配置权限...', 0.9);
              const addRoleForUserParams = {
                roleId: window.$CONFIG.ui.login.sso_role,
                userId: createUserResponse.data.data.id
              };
              axios.post('/sys/sys/role-user', addRoleForUserParams).then(() => {
                login({ username: `tj_${tokenResponse.data.sub}`, password: 123456 });
              });
            } else if (createUserResponse.data.code === 409) {
              this.progress('正在登录...', 0.9);
              login({ username: `tj_${tokenResponse.data.sub}`, password: 123456 });
            }
          });
        });
    } else {
      this.$router.push({ name: 'login' });
    }
  },
  methods: {
    progress(label, value) {
      this.label = label;
      this.value = value;
    }
  }
};
</script>
