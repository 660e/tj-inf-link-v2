import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const monitorStaticApi = {
  // 主机状态
  getAllHostMonitorData() {
    return service.get('/wsat-service-device/monitorStatic/getAllHostMonitorData');
  },

  // 微服务状态
  getPrometheusData(params) {
    return service.get(`/wsat-service-device/monitorStatic/getPrometheusData?${qs(params)}`);
  },

  // 中间件
  getN9eMonitorData(params) {
    return service.get(`/wsat-service-device/monitorStatic/getN9eMonitorData?${qs(params)}`);
  }
};

export { monitorStaticApi };
