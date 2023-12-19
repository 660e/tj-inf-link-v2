import { service } from '@/utils/service.js';

const sceneLinkageRuleApi = {
  // 新建场景联动规则
  saveSceneLinkageRuleBasics(params) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/saveSceneLinkageRuleBasics', params);
  },

  // 删除场景联动规则
  deleteSceneLinkageRuleBasics(id) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/deleteSceneLinkageRuleBasics', { id });
  },

  // 修改场景联动规则
  updateSceneLinkageRuleBasics(params) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/updateSceneLinkageRuleBasics', params);
  },

  // 查看场景联动规则
  getSceneLinkageRuleBasic(id) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/getSceneLinkageRuleBasic', { id });
  },

  // 查询场景联动规则列表
  querySceneLinkageRuleBasicsList(params) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/querySceneLinkageRuleBasicsList', params);
  },

  // 修改场景联动规则状态
  updateSceneLinkageRuleBasicsStatus(params) {
    return service.post('/wsat-service-alarm/sceneLinkageRule/updateSceneLinkageRuleBasicsStatus', params);
  }
};

export { sceneLinkageRuleApi };
