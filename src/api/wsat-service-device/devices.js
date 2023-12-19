import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const devicesApi = {
  // 设备分组
  getGroups() {
    return service.get('/wsat-service-device/devices/groups');
  },

  // 启用
  enableDevices(id) {
    return service.post(`/wsat-service-device/devices/enable/${id}`);
  },

  // 禁用
  unenableDevices(id) {
    return service.post(`/wsat-service-device/devices/unenable/${id}`);
  },

  // 新增设备
  createDevice(params) {
    return service.post('/wsat-service-device/devices', params);
  },

  // 删除设备
  removeDevice(id) {
    return service.delete(`/wsat-service-device/devices/${id}`);
  },

  // 修改设备
  updateDevice(params) {
    return service.put('/wsat-service-device/devices', params);
  },

  // 设备详情
  getDevice(id) {
    return service.get(`/wsat-service-device/devices/${id}`);
  },

  // 产品列表 - 全部
  getDeviceProducts(params) {
    return service.post('/wsat-service-device/devices/products', params);
  },

  // 设备属性
  getDevicePropertys(id) {
    return service.get(`/wsat-service-device/devices/${id}/propertys`);
  },

  // 设备拓扑
  getDeviceTreeList(params) {
    return service.post('/wsat-service-device/devices/getDeviceTreeList', params);
  },

  // 设备同步接口
  updateDeviceVersion(deviceId) {
    return service.post('/wsat-service-device/devices/updateDeviceVersion', { deviceId });
  },

  // 设备导出
  exportDevices(params) {
    params.roleId = SessionStorage.getItem('account').login.role;
    return service.get(`/wsat-service-device/devices/export?${qs(params)}`, { responseType: 'blob' });
  },

  // 历史数据接口
  getDeviceHistoryDataForIotdb(params) {
    return service.get('/wsat-service-device/devices/getDeviceSinglePropertyHistoryDataForIotdb', { params });
  },

  getDeviceDataPointsForIotdb(params) {
    return service.get('/wsat-service-device/devices/getDeviceDataPointsForIotdb', { params });
  },

  // 设备命令下发列表
  services(deviceId) {
    return service.get('/wsat-service-device/devices/services', { params: { deviceId } });
  },

  // 命令下发
  executeDeviceServices(label, id, params) {
    return service.post(`/wsat-service-device/devices/${label}/services/${id}/execute`, params);
  },

  // 异常数据接口
  getDeviceAbnormalDataForIotdb(params) {
    return service.get('/wsat-service-device/devices/getDeviceAbnormalDataForIotdb', { params });
  },

  // 新增事件
  createDeviceEvents(params) {
    return service.post('/wsat-service-device/devices/events', params);
  },

  // 删除事件
  removeDeviceEvents(id) {
    return service.delete(`/wsat-service-device/devices/events/${id}`);
  },

  // 修改事件
  updateDeviceEvents(params) {
    return service.put('/wsat-service-device/devices/events', params);
  },

  // 获取事件
  getDeviceEvents(params) {
    return service.get('/wsat-service-device/devices/events', { params });
  },

  // 批量同步
  batchUpdateDeviceVersion(params) {
    return service.post('/wsat-service-device/devices/batchUpdateDeviceVersion', params);
  },

  // 批量删除
  batchDelDevice(params) {
    return service.post('/wsat-service-device/devices/batchDelDevice', params);
  },

  // 批量启用
  batchEnable(params) {
    return service.post('/wsat-service-device/devices/batchEnable', params);
  },

  // 批量禁用
  batchUnEnable(params) {
    return service.post('/wsat-service-device/devices/batchUnEnable', params);
  },

  // 通过设备id获取服务参数
  getDeviceServiceParameterList(params) {
    return service.get('/wsat-service-device/devices/getDeviceServiceParameterList', { params });
  },

  // 设备列表
  getDevicesList(params) {
    params.roleId = SessionStorage.getItem('account').login.role;
    return service.get('/wsat-service-device/devices', { params });
  },

  // 子设备列表
  getDevicesChildren(params) {
    return service.get('/wsat-service-device/devices/children', { params });
  },

  // 获取全部设备 - 下拉框
  getAllDeviceSelect(params) {
    return service.get('/wsat-service-device/devices/getAllDeviceSelect', { params });
  },

  // 获取全部产品 - 下拉框
  getAllProductSelect(params) {
    return service.post('/wsat-service-device/devices/getAllProductSelect', params);
  },

  statistics() {
    return service.get('/wsat-service-device/devices/statistics', {
      params: { roleId: SessionStorage.getItem('account').login.role }
    });
  },

  getDeviceGroupInfoTreeList(params) {
    return service.post('/wsat-service-device/devices/group/getDeviceGroupInfoTreeList', params);
  },

  getDeviceGroupObject(groupId) {
    return service.post('/wsat-service-device/devices/group/getDeviceGroupObject', { groupId });
  },

  getDeviceGroupDeviceList(params) {
    params.roleId = SessionStorage.getItem('account').login.role;
    return service.post('/wsat-service-device/devices/group/getDeviceGroupDeviceList', params);
  },

  deleteDeviceGroup(groupId) {
    return service.post('/wsat-service-device/devices/group/deleteDeviceGroup', { groupId });
  },

  addDeviceGroup(params) {
    return service.post('/wsat-service-device/devices/group/addDeviceGroup', params);
  },

  updateDeviceGroup(params) {
    return service.post('/wsat-service-device/devices/group/updateDeviceGroup', params);
  },

  // 批量绑定
  addDeviceGroupCorrelation(params) {
    return service.post('/wsat-service-device/devices/group/addDeviceGroupCorrelation', params);
  },

  // 批量解绑
  deleteDeviceGroupCorrelationBatch(params) {
    return service.post('/wsat-service-device/devices/group/deleteDeviceGroupCorrelationBatch', params);
  },

  // 导出模板
  deviceTemplates() {
    return service.get('/wsat-service-device/upload/download/deviceTemplates', { responseType: 'blob' });
  },

  // 导入管理 - 校验
  oneKeyCheckDevices(sheetNames, totalNum) {
    return {
      url: '/api/wsat-service-device/check/oneKeyCheckDevices',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file',
      formFields: [
        { name: 'sheetNames', value: sheetNames },
        { name: 'totalNum', value: totalNum }
      ]
    };
  },

  // 导入管理 - 导入
  oneKeyUpload(params) {
    const fd = new FormData();
    Object.keys(params).forEach(k => fd.append(k, params[k]));
    return service.post('/wsat-service-device/upload/oneKeyUpload', fd);
  },

  // 产品列表：导入物模型 - 校验
  checkProductObj() {
    return {
      url: '/api/wsat-service-device/check/checkProductObj',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file',
      formFields: [{ name: 'sheetName', value: '产品列表' }]
    };
  },

  // 导入进度
  getRateOfProgress(id) {
    return service.get('/wsat-service-device/upload/getRateOfProgress', { params: { id } });
  },

  // 设备统计状态（按协议区分）
  getAgreementTypeOnlineStatusNum(onlineStatus) {
    return service.get('/wsat-service-device/devices/getAgreementTypeOnlineStatusNum', { params: { onlineStatus } });
  },

  // 批量修改设备运维信息
  batchUpdateDeviceBasicMessage(params) {
    return service.post('wsat-service-device/devices/batchUpdateDeviceBasicMessage', params);
  }
};

export { devicesApi };
