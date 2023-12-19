import { service } from '@/utils/service.js';

const msgInfoApi = {
  MsgInfoQuery(params) {
    return service.get('/wsat-service-alarm/msgInfo/MsgInfoQuery', { params });
  },

  updateMsgInfoVo(params) {
    return service.get('/wsat-service-alarm/msgInfo/updateMsgInfoVo', { params });
  },

  deleteMsgInfoVo(id) {
    return service.post(`/wsat-service-alarm/msgInfo/deleteMsgInfoVo?Id=${id}`);
  },

  pageQueryMsgRuleList(params) {
    return service.post('/wsat-service-alarm/msgInfo/pageQueryMsgRuleList', params);
  },

  updateMsgRuleState(params) {
    return service.post('/wsat-service-alarm/msgInfo/updateMsgRuleState', params);
  },

  updateMsgRule(params) {
    return service.post('/wsat-service-alarm/msgInfo/updateMsgRule', params);
  }
};

export { msgInfoApi };
