import { service } from '@/utils/service.js';

const protocolApi = {
  getProtocolList(params) {
    return service.get('/wsat-service-device/protocolPlugin/page', { params });
  },

  removeProtocol(id) {
    return service.post(`/wsat-service-device/protocolPlugin/jarDelete/${id}`);
  },

  installProtocol(id) {
    return service.post(`/wsat-service-device/protocolPlugin/register/${id}`);
  },

  uninstallProtocol(id) {
    return service.post(`/wsat-service-device/protocolPlugin/jarUnload/${id}`);
  },

  jarUpload(params) {
    const fd = new FormData();
    Object.keys(params).forEach(k => fd.append(k, params[k]));
    return service.post('/wsat-service-device/protocolPlugin/jarUpload', fd);
  },

  jarUploadEdit(params) {
    const fd = new FormData();
    Object.keys(params).forEach(k => fd.append(k, params[k]));
    return service.post('/wsat-service-device/protocolPlugin/jarUploadEdit', fd);
  },

  jarPluginTemplates(agreementType) {
    return service.get('/wsat-service-device/protocolPlugin/download/jarpluginTemplat', {
      params: { agreementType },
      responseType: 'blob'
    });
  },

  fixedtemplate(protocolType) {
    return service.post('/wsat-service-device/protocolConfig/fixedtemplate', { protocolType });
  },

  updateProtocolConfig(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolConfig', params);
  },

  getProtocolConfig(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolConfig', { protocolId });
  },

  // 通过http协议客户端规则ID获取规则详细信息
  getProtocolHttpClientVo(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolHttpClientVo', { protocolId });
  },

  // 新增http协议客户端规则
  addProtocolHttpClient(params) {
    return service.post('/wsat-service-device/protocolConfig/addProtocolHttpClient', params);
  },

  // 修改http协议客户端规则
  updateProtocolHttpClient(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolHttpClient', params);
  },

  // 通过http协议服务端规则ID获取规则详细信息
  getProtocolHttpServerVo(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolHttpServerVo', { protocolId });
  },

  // 新增http协议服务端规则
  addProtocolHttpServer(params) {
    return service.post('/wsat-service-device/protocolConfig/addProtocolHttpServer', params);
  },

  // 修改http协议服务端规则
  updateProtocolHttpServer(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolHttpServer', params);
  },

  // 通过TCP客户规则ID获取规则详细信息
  getProtocolTcpClientVo(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolTcpClientVo', { protocolId });
  },

  // 新增TCP协议客户端规则
  addProtocolTcpClient(params) {
    return service.post('/wsat-service-device/protocolConfig/addProtocolTcpClient', params);
  },

  // 修改tcp协议客户端规则
  updateProtocolTcpClient(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolTcpClient', params);
  },

  // 通过TCP服务端规则ID获取规则详细信息
  getProtocolTcpServerVo(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolTcpServerVo', { protocolId });
  },

  // 新增TCP协议服务端规则
  addProtocolTcpServer(params) {
    return service.post('/wsat-service-device/protocolConfig/addProtocolTcpServer', params);
  },

  // 修改tcp协议服务端规则
  updateProtocolTcpServer(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolTcpServer', params);
  },

  // 新增udp协议
  addProtocolUdp(params) {
    return service.post('/wsat-service-device/protocolConfig/addProtocolUdp', params);
  },

  // 修改udp协议规则
  updateProtocolUdp(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProtocolUdp', params);
  },

  // 通过udp协议规则ID获取规则详细信息
  getProtocolUdpVo(protocolId) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolUdpVo', { protocolId });
  },

  // 新增MODBUSTCP协议规则（产品侧）
  addProductProtocolModbusTcp(params) {
    return service.post('/wsat-service-device/protocolConfig/addProductProtocolModbusTcp', params);
  },

  // 通过MODBUSTCP规则id删除一条规则（产品侧）
  deleteProductProtocolModbusTcpById(modbusTcpId) {
    return service.post('/wsat-service-device/protocolConfig/deleteProductProtocolModbusTcpById', { modbusTcpId });
  },

  // 修改MODBUSTCP协议规则（产品侧）
  updateProductProtocolModbusTcp(params) {
    return service.post('/wsat-service-device/protocolConfig/updateProductProtocolModbusTcp', params);
  },

  // 通过产品ID获取MODBUSTCP协议规则列表（产品侧）
  getProductProtocolModbusTcpList(productId) {
    return service.post('/wsat-service-device/protocolConfig/getProductProtocolModbusTcpList', { productId });
  },

  // 协议管理（通过协议ID获取协议信息）
  getProtocolConfigs(params) {
    return service.post('/wsat-service-device/protocolConfig/getProtocolConfig', params);
  },

  addDeviceProtocolModbusTcp(params) {
    return service.post('/wsat-service-device/protocolConfig/addDeviceProtocolModbusTcp', params);
  },

  deleteDeviceProtocolModbusTcpById(deviceModbusTcpId) {
    return service.post('/wsat-service-device/protocolConfig/deleteDeviceProtocolModbusTcpById', { deviceModbusTcpId });
  },

  updateDeviceProtocolModbusTcp(params) {
    return service.post('/wsat-service-device/protocolConfig/updateDeviceProtocolModbusTcp', params);
  },

  getDeviceProtocolModbusTcpList(deviceId) {
    return service.post('/wsat-service-device/protocolConfig/getDeviceProtocolModbusTcpList', { deviceId });
  },

  addDevicePropertyOpcUa(params) {
    return service.post('/wsat-service-device/protocolConfig/addDevicePropertyOpcUa', params);
  },

  deleteDevicePropertyOpcUaById(id) {
    return service.post('/wsat-service-device/protocolConfig/deleteDevicePropertyOpcUaById', { id });
  },

  updateDevicePropertyOpcUa(params) {
    return service.post('/wsat-service-device/protocolConfig/updateDevicePropertyOpcUa', params);
  },

  getDeviceProtocolOpcUaList(deviceId) {
    return service.post('/wsat-service-device/protocolConfig/getDeviceProtocolOpcUaList', { deviceId });
  },

  addDeviceProtocolBacNet(params) {
    return service.post('/wsat-service-device/protocolConfig/addDeviceProtocolBacNet', params);
  },

  deleteDeviceProtocolBacNetById(deviceId) {
    return service.post('/wsat-service-device/protocolConfig/deleteDeviceProtocolBacNetById', { deviceId });
  },

  updateDeviceProtocolBacNet(params) {
    return service.post('/wsat-service-device/protocolConfig/updateDeviceProtocolBacNet', params);
  },

  getDeviceProtocolBacNetList(deviceId) {
    return service.post('/wsat-service-device/protocolConfig/getDeviceProtocolBacNetList', { deviceId });
  },

  // 新增SNMP协议规则
  addDeviceProtocolSNMP(params) {
    return service.post('/wsat-service-device/protocolConfig/addDeviceProtocolSNMP', params);
  },

  // 通过设备ID获取SNMP协议规则
  getDeviceProtocolSNMP(deviceId) {
    return service.post('/wsat-service-device//protocolConfig/getDeviceProtocolSNMP', { deviceId });
  }
};

export { protocolApi };
