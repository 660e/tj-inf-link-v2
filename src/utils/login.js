import { SessionStorage, LocalStorage } from 'quasar';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import router from '@/router';

function encrypt(source) {
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
  const params = window.$CONFIG.params.oauth;
  const query = Object.keys(params).map(k => `${k}=${params[k]}`);
  query.push(`username=${encodeURIComponent(window.$CONFIG.aes ? encrypt(username) : username)}`);
  query.push(`password=${encodeURIComponent(window.$CONFIG.aes ? encrypt(password) : password)}`);
  return axios.post(`${window.$CONFIG.url.oauth}?${query.join('&')}`).then(response => {
    SessionStorage.set('token', response.data.access_token);
    router.push({ name: 'guide' });
  });
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
