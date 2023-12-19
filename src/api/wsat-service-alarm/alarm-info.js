import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';

const alarmInfoApi = {
  alarmQuery(params) {
    return service.get('/wsat-service-alarm/alarmInfo/alarmQuery', { params });
  },

  last7AlarmLevelCount() {
    return service.get('/wsat-service-alarm/alarmInfo/last7AlarmLevelCount', {
      params: { roleId: SessionStorage.getItem('account').login.role }
    });
  },

  last7AlarmHandleCount() {
    return service.get('/wsat-service-alarm/alarmInfo/last7AlarmHandleCount', {
      params: { roleId: SessionStorage.getItem('account').login.role }
    });
  },

  hisAlarmQuery(params) {
    params.roleId = SessionStorage.getItem('account').login.role;
    return service.get('/wsat-service-alarm/alarmInfo/hisAlarmQuery', { params });
  },

  alarmDeviceHisData(params) {
    return service.get('/wsat-service-alarm/alarmInfo/alarmDeviceHisData', { params });
  }
};

export { alarmInfoApi };
