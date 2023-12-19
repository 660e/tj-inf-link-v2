import { service } from '@/utils/service.js';

const snmpmibOidApi = {
  // 保存或更新SNMP OID对象
  saveOrUpdateMibOidBean(params) {
    return service.post('/wsat-service-device/snmpmibOid/saveOrUpdateMibOidBean', params);
  },

  // 删除SNMP MibOID对象
  deleteMibOidBean(id) {
    return service.get('/wsat-service-device/snmpmibOid/deleteMibOidBean', { params: { id } });
  },

  // 获取SNMP MibOID列表
  mibOidQuery(params) {
    return service.get('/wsat-service-device/snmpmibOid/mibOidQuery', { params });
  }
};

export { snmpmibOidApi };
