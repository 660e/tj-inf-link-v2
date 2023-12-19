import { service } from '@/utils/service.js';

const alarmHandleApi = {
  addAlarmHandle(params) {
    return service.post('/wsat-service-alarm/alarmHandle/addAlarmHandle', params);
  },

  alarmHandleQuery(alarmId) {
    return service.get('/wsat-service-alarm/alarmHandle/alarmHandleQuery', { params: { alarmId } });
  }
};

export { alarmHandleApi };
