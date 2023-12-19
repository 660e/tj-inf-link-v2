import { service } from '@/utils/service.js';

const systemApi = {
  userDetails() {
    return service.get('/tdf-service-sys/user-details');
  },

  getStatusMetrics(params) {
    return service.get('/tdf-service-sys/system/status/metrics', { params });
  },

  getStatusHealth(params) {
    return service.get('/tdf-service-sys/system/status/health', { params });
  },

  getEurekaServices() {
    return service.get('/tdf-service-sys/system/status/getEurekaServices');
  }
};

export { systemApi };
