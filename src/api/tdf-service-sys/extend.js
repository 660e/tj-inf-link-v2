import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const extendApi = {
  getDateItemByParentcode(params) {
    return service.post(`/tdf-service-sys/extend/dataItem/getDateItemByParentcode?${qs(params)}`);
  },

  getDateItemBycodes(params) {
    return new Promise(resolve => {
      service.post('/tdf-service-sys/extend/dataItem/getDateItemBycodes', params).then(response => {
        resolve(
          response.reduce((accumulator, current) => {
            const element = {};
            for (const [key, value] of Object.entries(current)) {
              element[key] = value
                .map(e => {
                  return {
                    index: e.codeIndex,
                    label: e.name,
                    // '1' -> 1
                    // 'true' -> true
                    // 'code' -> 'code'
                    value: !isNaN(Number(e.code)) ? Number(e.code) : ['true', 'false'].includes(e.code) ? JSON.parse(e.code) : e.code,
                    state: e.state === '1'
                  };
                })
                .sort((a, b) => a.index - b.index)
                .filter(e => e.state);
            }
            return { ...accumulator, ...element };
          }, {})
        );
      });
    });
  },

  getDept(params) {
    return service.post('/tdf-service-sys/extend/dept/getDeptList', params);
  },

  getUser(params) {
    return service.post('/tdf-service-sys/extend/user/getUserList', params);
  },

  posts() {
    return {
      url: '/api/tdf-service-sys/extend/user/posts',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file'
    };
  },

  Templatedownload() {
    return service.get('/tdf-service-sys/extend/user/Templatedownload', { responseType: 'blob' });
  }
};

export { extendApi };
