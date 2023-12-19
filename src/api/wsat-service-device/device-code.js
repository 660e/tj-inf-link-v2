import { service } from '@/utils/service.js';

const deviceCodeApi = {
  // 新增设备编码规则
  addDeviceCodeRule(params) {
    return service.post('/wsat-service-device/deviceCode/addDeviceCodeRule', params);
  },

  // 新增设备编码属性
  addDeviceCodeProperty(params) {
    return service.post('/wsat-service-device/deviceCode/addDeviceCodeProperty', params);
  },

  // 查询设备编码规则
  findDeviceCodeRule() {
    return service.post('/wsat-service-device/deviceCode/findDeviceCodeRule');
  },

  // 查询设备编码属性
  findDeviceCodeProperty(codeRuleId, pid = -1) {
    return service.post('/wsat-service-device/deviceCode/findDeviceCodeProperty', { codeRuleId, pid });
  }
};

export { deviceCodeApi };
