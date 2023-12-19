import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const datalabelsApi = {
  getlist(params) {
    return service.get('/wsat-service-device/Datalabels/getlist', { params });
  },

  addDatalabel(params) {
    return service.post(`/wsat-service-device/Datalabels/add?${qs(params)}`);
  },

  deleteDatalabel(ids) {
    return service.post(`/wsat-service-device/Datalabels/delete?${qs({ ids })}`);
  },

  getlabelsBybeviceid(deviceid) {
    return service.post(`/wsat-service-device/Datalabels/getlabelsBybeviceid?${qs({ deviceid })}`);
  },

  deviceaddlabels(deviceid, labelsids) {
    return service.post(`/wsat-service-device/Datalabels/deviceaddlabels?${qs({ deviceid, labelsids })}`);
  }
};

export { datalabelsApi };
