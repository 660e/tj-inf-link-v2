import { service } from '@/utils/service.js';

const mapApi = {
  getMapDeviceMessage(params) {
    return service.get('/wsat-service-device/map/getMapDeviceMessage', { params });
  }
};

export { mapApi };
