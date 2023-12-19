import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const linkageDevicesApi = {
  // 新增联动设备
  addLinkageDevice(params) {
    return service.post('/wsat-service-device/linkageDevices/addLinkageDevice', params);
  },

  // 获取设备和联动设备
  queryDeviceOrLinkageDevice(params) {
    return service.get('/wsat-service-device/linkageProducts/queryDeviceOrLinkageDevice', { params });
  },

  // 删除联动设备
  delLinkageDevice(id) {
    return service.post('/wsat-service-device/linkageDevices/delLinkageDevice', { id });
  },

  // 修改联动设备
  updateLinkageDevice(params) {
    return service.post('/wsat-service-device/linkageDevices/updateLinkageDevice', params);
  },

  // 分页获取联动设备列表
  linkageDeviceList(params) {
    return service.get('/wsat-service-device/linkageDevices/linkageDeviceList', { params });
  },

  // 联动设备详情
  linkageDeviceDetail(id) {
    return service.get('/wsat-service-device/linkageDevices/linkageDeviceDetail', { params: { id } });
  },

  // 导出联动设备列表
  exportLinkageDevice(params) {
    return service.post('/wsat-service-device/linkageDevices/exportLinkageDevice', qs(params), { responseType: 'blob' });
  },

  // 联动设备解绑
  unboundLinkageDevice(params) {
    return service.post('/wsat-service-device/linkageDevices/unboundLinkageDevice', params);
  },

  // 复制联动设备
  copyLinkageDevice(linkageDeviceId) {
    return service.post('/wsat-service-device//linkageDevices/copyLinkageDevice', { linkageDeviceId });
  }
};

export { linkageDevicesApi };
