import { SessionStorage } from 'quasar';
import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const perceivedApi = {
  // 新增感知对象
  addPerceived(params) {
    return service.post('/wsat-service-device/Perceived/add', params);
  },

  // 删除感知对象
  deletePerceived(params) {
    return service.post('/wsat-service-device/Perceived/delete', params);
  },

  // 修改感知对象
  updatePerceived(params) {
    return service.post('/wsat-service-device/Perceived/update', params);
  },

  // 获取感知对象管理列表
  getPerceived(params) {
    return service.post('/wsat-service-device/Perceived/getlist', qs(params));
  },

  // 获取感知对象下已绑定设备列表
  getdevicelist(params) {
    return service.post('/wsat-service-device/Perceived/getdevicelist', qs(params));
  },

  // 获取感知对象下未绑定设备列表
  getUnboundDevices(params) {
    return service.post('/wsat-service-device/Perceived/getUnboundDevices', qs(params));
  },

  // 感知对象下所有设备列表
  getalldeviceByPid(id) {
    return service.post('/wsat-service-device/Perceived/getalldeviceByPid', qs({ id }));
  },

  // 获取感知对象详情
  getdetails(params) {
    return service.post('/wsat-service-device/Perceived/getdetails', qs(params));
  },

  // 感知对象拓扑
  topology(id) {
    return service.post('/wsat-service-device/Perceived/topology', qs({ id }));
  },

  // 绑定设备
  bind(params) {
    return service.post('/wsat-service-device/Perceived/bindingdevice', params);
  },

  // 解绑设备
  unbind(params) {
    return service.post('/wsat-service-device/Perceived/Unbind', params);
  },

  // 感知对象列表导出
  export(params) {
    return service.post('/wsat-service-device/Perceived/export', qs(params), { responseType: 'blob' });
  },

  // 感知对象导入
  import() {
    return {
      url: '/api/wsat-service-device/Perceived/posts',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file'
    };
  },

  // 下载导入模板
  exportTemplate() {
    return service.get('/wsat-service-device/Perceived/Templatedownload', { responseType: 'blob' });
  },

  // 获取感知对象属性
  getpropertys(params) {
    return service.post('/wsat-service-device/Perceived/getpropertys', params);
  },

  // 新增分组
  addGroup(params) {
    return service.post('/wsat-service-device/Perceived/Group', params);
  },

  // 删除分组
  deleteGroup(id) {
    return service.delete(`/wsat-service-device/Perceived/Group?modelClassID=${id}`);
  },

  // 修改分组
  updateGroup(params) {
    return service.put('/wsat-service-device/Perceived/Group', params);
  },

  // 查询分组 - 树
  getGroupTree(params) {
    return service.get('/wsat-service-device/Perceived/Group/tree', params);
  },

  // 查询分组
  getGroupInfo(id) {
    return service.get(`/wsat-service-device/Perceived/Group/${id}`);
  },

  // 根据分组获取感知对象列表
  getPerceivedobjectByGroupId(params) {
    return service.get('/wsat-service-device/Perceived/Group/getPerceivedobjectByGroupId', { params });
  },

  // 添加对象到分组
  addToGroup(params) {
    return service.get('/wsat-service-device/Perceived/Group/addToGroup', { params });
  },

  // 分组中移除感知对象
  removeToGroup(params) {
    return service.get('/wsat-service-device/Perceived/Group/removetogroup', { params });
  },

  // 获取设备绑定的感知对象
  getAllByDeviceId(params) {
    return service.post('/wsat-service-device/Perceived/getAllByDeviceId', qs(params));
  },

  // 获取设备绑定的感知对象ids
  getallObjectBydeviceId(params) {
    return service.post('/wsat-service-device/Perceived/getallObjectBydeviceId', qs(params));
  },

  // 设备绑定感知对象
  devicebinding(params) {
    return service.post('/wsat-service-device/Perceived/devicebinding', params);
  },

  // 设备解绑感知对象
  deviceUnbind(params) {
    return service.post('/wsat-service-device/Perceived/deviceUnbind', params);
  }
};

export { perceivedApi };
