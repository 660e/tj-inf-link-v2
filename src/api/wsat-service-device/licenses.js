import { service } from '@/utils/service.js';
import axios from 'axios';

const licensesApi = {
  // 获取license许可证信息
  getLicenseInfo() {
    return service.get('/tdf-service-sys/dlLicenseController/getLicenseDetail');
  },

  // 查询授权信息
  getLicenseInfoDL() {
    return axios.get('/sys/dlLicenseController/getLicenseInfo');
  },

  // 获取申请码
  code(code) {
    return axios.post('/sys/dlLicenseController/code', { code });
  }
};

export { licensesApi };
