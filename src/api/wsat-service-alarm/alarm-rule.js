import { service } from '@/utils/service.js';

const alarmRuleApi = {
  SaveAlarmRule(params) {
    return service.post('/wsat-service-alarm/alarmRule/SaveAlarmRule', params);
  },

  deleteAlarmRuleBasic(id) {
    return service.post('/wsat-service-alarm/alarmRule/deleteAlarmRuleBasic', { id });
  },

  UpadateAlarmRule(params) {
    return service.post('/wsat-service-alarm/alarmRule/UpadateAlarmRule', params);
  },

  QueryAlarmRuleBasic(params) {
    return service.post('/wsat-service-alarm/alarmRule/QueryAlarmRuleBasic', params);
  },

  getAlarmRuleBasic(basicsRuleId) {
    return service.post('/wsat-service-alarm/alarmRule/getAlarmRuleBasic', { basicsRuleId });
  },

  // 修改告警规则的状态
  updateAlarmRuleBasicStatus(params) {
    return service.post('/wsat-service-alarm/alarmRule/updateAlarmRuleBasicStatus', params);
  }
};

export { alarmRuleApi };
