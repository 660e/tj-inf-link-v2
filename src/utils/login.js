import { SessionStorage, LocalStorage, Notify } from 'quasar';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import router from '@/router';
import store from '@/store';

export function encrypt(source) {
  const words = CryptoJS.enc.Utf8.parse(source);
  const key = CryptoJS.enc.Utf8.parse('Wlkj@5U4#$bXzICg');
  const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
  const encrypted = CryptoJS.AES.encrypt(words, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

export function login({ username, password }) {
  return axios.get('/sys2/extend/tenant/check/getTenantsByUser', {
    params: {
      loginName: encrypt(username),
      userPwd: encrypt(password)
    }
  });
}

export function getToken({ username, password, tenant }) {
  const params = window.$CONFIG.params.oauth;
  params.tenant = tenant;

  const query = Object.keys(params).map(k => `${k}=${params[k]}`);
  query.push(`username=${encodeURIComponent(window.$CONFIG.aes ? encrypt(username) : username)}`);
  query.push(`password=${encodeURIComponent(window.$CONFIG.aes ? encrypt(password) : password)}`);

  return axios.post(`${window.$CONFIG.url.oauth}?${query.join('&')}`);
}

export function logout() {
  if (LocalStorage.getItem('access_token')) {
    axios.get('https://oauth2.taiji.com.cn/exit', {
      headers: {
        Authorization: `Bearer ${LocalStorage.getItem('access_token')}`
      }
    });
  }
  SessionStorage.remove('account');
  SessionStorage.remove('token');
  LocalStorage.remove('access_token');
  router.push({ name: 'login' });
}

export function changePassword({ loginName, origPwd, newPwd }) {
  axios
    .get(
      '/sys/user/updateUserPasswd',
      {
        params: {
          loginName: encrypt(loginName),
          origPwd: encrypt(origPwd),
          newPwd: encrypt(newPwd)
        }
      },
      {
        headers: {
          Authorization: `Bearer ${LocalStorage.getItem('access_token')}`
        }
      }
    )
    .then(response => {
      console.log(response);
      Notify.create({ type: 'positive', message: '密码修改成功，请重新登录' });
      logout();
    })
    .finally(() => {
      store.commit('loading', false);
    });
}
