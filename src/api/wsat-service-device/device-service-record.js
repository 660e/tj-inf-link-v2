import { service } from '@/utils/service.js';

const deviceServiceRecordApi = {
  // 分页获取设备（下发）服务记录的列表
  queryDeviceServiceRecordList(params) {
    return service.get('/wsat-service-device/deviceServiceRecord/queryDeviceServiceRecordList', { params });
  }
};

export { deviceServiceRecordApi };
