import { service } from '@/utils/service.js';

const logQueryApi = {
  queryOptLogBeanList(params) {
    return service.get('/wsat-service-device/logQuery/queryOptLogBeanList', { params });
  },

  querySysErrLogBeanList(params) {
    return service.get('/wsat-service-device/logQuery/querySysErrLogBeanList', { params });
  },

  queryRemoteCallLogBeanList(params) {
    return service.get('/wsat-service-device/logQuery/queryRemoteCallLogBeanList', { params });
  },

  queryDataReportLogBeanList(params) {
    return service.get('/wsat-service-device/logQuery/queryDataReportLogBeanList', { params });
  }
};

export { logQueryApi };
