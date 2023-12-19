import { service } from '@/utils/service.js';

const alarmRuleTypeApi = {
  SaveAlarmRuleType(params) {
    return service.post('/wsat-service-alarm/alarmRuleType/SaveAlarmRuleType', params);
  },

  DeleteAlarmRuleType(params) {
    return service.post('/wsat-service-alarm/alarmRuleType/DeleteAlarmRuleType', params);
  },

  UpadateAlarmRuleType(params) {
    return service.post('/wsat-service-alarm/alarmRuleType/UpadateAlarmRuleType', params);
  },

  QueryAlarmRuleType(params) {
    return service.post('/wsat-service-alarm/alarmRuleType/QueryAlarmRuleType', params);
  },

  SelectAlarmRuleType() {
    return service.post('/wsat-service-alarm/alarmRuleType/SelectAlarmRuleType');
  }
};

export { alarmRuleTypeApi };
