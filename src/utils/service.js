import axios from 'axios';
import router from '@/router';
import store from '@/store';
import { Notify, SessionStorage } from 'quasar';
import { isBlob, isObject } from './data.js';

const service = axios.create({
  timeout: 10000
});

service.interceptors.request.use(
  config => {
    config.headers.Authorization = `Bearer ${SessionStorage.getItem('token')}`;
    config.url = `/api${config.url}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    if (isObject(response.data)) {
      if (response.data.code) {
        switch (response.data.code) {
          case 200:
            return response.data.data || true;
          case 409:
            store.commit('loading', false);
            Notify.create({ type: 'warning', message: response.data.data });
            return false;
          default:
            store.commit('loading', false);
            Notify.create({ type: 'negative', message: response.data.data });
        }
      } else {
        switch (response.data.httpCode) {
          case 200:
            return response.data || true;
          case 409:
            store.commit('loading', false);
            Notify.create({ type: 'warning', message: response.data.msg });
            return false;
          default:
            store.commit('loading', false);
            Notify.create({ type: 'negative', message: response.data.msg });
        }
      }
    } else if (isBlob(response.data)) {
      return response.data;
    } else {
      return response;
    }
  },
  error => {
    switch (error.response.status) {
      case 401:
        Notify.create({ type: 'warning', message: 'token已失效，请重新登录' });
        router.push({ name: 'login' });
        break;
      default:
        store.commit('loading', false);
        Notify.create({ type: 'negative', message: error.response.data.data });
    }
    return Promise.reject(error);
  }
);

export { service };
