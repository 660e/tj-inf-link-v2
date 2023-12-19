import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';

const platformApi = {
  getapiall() {
    return service.get('/wsat-service-device/platform/overview/getapiall');
  },

  getWarningDetails() {
    return service.get('/wsat-service-device/platform/overview/getWarningDetails', {
      params: { roleId: SessionStorage.getItem('account').login.role }
    });
  },

  // 获取设备分组统计图
  getDeviceGroupCountNew() {
    return service.get('/wsat-service-device/platform/overview/getDeviceGroupCountNew');
  },

  // 获取设备分组统计图详情
  getDeviceGroupCountDetail(groupId) {
    return service.get('/wsat-service-device/platform/overview/getDeviceGroupCountDetail', { params: { groupId } });
  },

  geterceivedObjectCount(params) {
    return service.get('/wsat-service-device/platform/overview/geterceivedObjectCount', { params });
  },

  getapicountbytime() {
    return service.get('/wsat-service-device/platform/overview/getapicountbytime');
  },

  getapicount(dataTime) {
    return service.get('/wsat-service-device/platform/overview/getapicount', { params: { dataTime } });
  },

  getDeviceServiceExecuteHistoryCount(params) {
    return service.get('/wsat-service-device/platform/overview/getDeviceServiceExecuteHistoryCount', { params });
  }
};

export { platformApi };
