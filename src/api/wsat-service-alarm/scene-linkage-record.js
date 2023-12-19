import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';

const sceneLinkageRecordApi = {
  // 查询场景联动执行记录列表
  querySceneLinkageRecordList(params) {
    return service.get('/wsat-service-alarm/sceneLinkageRecord/querySceneLinkageRecordList', { params });
  },

  // 查看场景联动执行记录详细
  getSceneLinkageRecord(id) {
    return service.post('/wsat-service-alarm/sceneLinkageRecord/getSceneLinkageRecord', { id });
  },

  // 导出
  export() {
    return service.get('/wsat-service-alarm/sceneLinkageRecord/export', { responseType: 'blob' });
  },

  last7SceneLinkStatusCount() {
    return service.get('/wsat-service-alarm/sceneLinkageRecord/last7SceneLinkStatusCount', {
      params: { roleId: SessionStorage.getItem('account').login.role }
    });
  }
};

export { sceneLinkageRecordApi };
