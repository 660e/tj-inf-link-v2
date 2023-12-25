import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const sysApi = {
  getMenuTree() {
    return service.get('/tdf-service-sys/sys/menu/query/all/tree');
  },

  getMenuTreeAll() {
    return service.get('/tdf-service-sys/sys/menu/query/all');
  },

  createDataitem(params) {
    return service.post('/tdf-service-sys/sys/dataitem', params);
  },

  removeDataitem(id) {
    return service.delete(`/tdf-service-sys/sys/dataitem/${id}`);
  },

  editDataitem(params) {
    return service.put('/tdf-service-sys/sys/dataitem', params);
  },

  getDataitem(params) {
    return service.post('/tdf-service-sys/sys/dataitem/search', params);
  },

  getLog(params) {
    return service.post('/tdf-service-sys/sys/log/search', params);
  },

  createMenu(params) {
    return service.post('/tdf-service-sys/sys/menu', params);
  },

  removeMenu(id) {
    return service.delete(`/tdf-service-sys/sys/menu/${id}`);
  },

  editMenu(params) {
    return service.put('/tdf-service-sys/sys/menu', params);
  },

  getMenu(params) {
    return service.post('/tdf-service-sys/sys/menu/search', params);
  },

  createRole(params) {
    return service.post('/tdf-service-sys/sys/role/', params);
  },

  removeRole(id) {
    return service.delete(`/tdf-service-sys/sys/role/${id}`);
  },

  editRole(params) {
    return service.put('/tdf-service-sys/sys/role/', params);
  },

  getRole(params) {
    return service.post('/tdf-service-sys/sys/role/search', params);
  },

  getRoleAll() {
    return service.get('/tdf-service-sys/sys/role/query/all');
  },

  findUsersByRoleId(params) {
    return service.get('/tdf-service-sys/sys/role-user/findUsersByRoleId', { params });
  },

  findMenusByRoleId(params) {
    return service.get('/tdf-service-sys/sys/role-menu/findMenusByRoleId', { params });
  },

  deleteUserFromRole(data) {
    return service.delete('/tdf-service-sys/sys/role-user/delete', { data });
  },

  resetMenus(params) {
    return service.post('/tdf-service-sys/sys/role-menu/reset-menus', params);
  },

  addDatapermissions(roleid, deviceid) {
    return service.post(`/tdf-service-sys/sys/role/addDatapermissions?${qs({ roleid, deviceid })}`);
  },

  getDatapermissions(roleid) {
    return service.post(`/tdf-service-sys/sys/role/getDatapermissions?roleid=${roleid}`);
  },

  createDept(params) {
    return service.post('/tdf-service-sys/sys/dept', params);
  },

  removeDept(id) {
    return service.delete(`/tdf-service-sys/sys/dept/${id}`);
  },

  editDept(params) {
    return service.put('/tdf-service-sys/sys/dept', params);
  },

  getDeptTree() {
    return service.get('/tdf-service-sys/sys/dept/query/all/tree');
  },

  createUser(params) {
    return service.post('/tdf-service-sys/sys/user', params);
  },

  removeUser(id) {
    return service.delete(`/tdf-service-sys/sys/user/${id}`);
  },

  editUser(params) {
    return service.put('/tdf-service-sys/sys/user', params);
  },

  addDeptForUser(params) {
    return service.post('/tdf-service-sys/sys/dept-user', params);
  },

  deleteDeptFromUser(data) {
    return service.delete('/tdf-service-sys/sys/dept-user/delete', { data });
  },

  findDeptInfosByUserId(params) {
    return service.get('/tdf-service-sys/sys/dept-user/findDeptInfosByUserId', { params });
  },

  addRoleForUser(params) {
    return service.post('/tdf-service-sys/sys/role-user', params);
  },

  deleteRoleFromUser(data) {
    return service.delete('/tdf-service-sys/sys/role-user/delete', { data });
  },

  findRolesByUserId(params) {
    return service.get('/tdf-service-sys/sys/role-user/findRolesByUserId', { params });
  },

  findProductPropertyIdsByRoleId(roleId) {
    return service.get('/tdf-service-sys/sys/role-productproperty/findProductPropertyIdsByRoleId', { params: { roleId } });
  },

  addRoleProductPropertyId(roleId, params) {
    return service.post(`/tdf-service-sys/sys/role-productproperty/addRoleProductPropertyId?roleId=${roleId}`, params);
  },

  checkCurrUserIsSysAdmin(userAccount) {
    return service.get('/tdf-service-sys/sys/role/query/checkCurrUserIsSysAdmin', { params: { userAccount } });
  },

  getUserMenuList() {
    return service.get('/tdf-service-sys/sys/menu/query/getUserMenuList');
  },

  getTenantMenuList() {
    return service.get('/tdf-service-sys/sys/menu/query/getTenantMenuList');
  },

  tenantlist() {
    return service.get('/tdf-service-sys/sys/tenant/query/tenantlist');
  },

  queryTenantAlldata(params) {
    return service.post('/tdf-service-sys/sys/tenant/query/alldata', params);
  },

  createTenant(params) {
    return service.post('/tdf-service-sys/sys/tenant/', params);
  },

  removeTenant(id) {
    return service.delete(`/tdf-service-sys/sys/tenant/${id}`);
  },

  editTenant(params) {
    return service.put('/tdf-service-sys/sys/tenant/', params);
  },

  rolelist() {
    return service.get('/tdf-service-sys/sys/role/query/rolelist');
  },

  queryRoleAlldata(params) {
    return service.post('/tdf-service-sys/sys/role/query/alldata', params);
  },

  queryDataitemAlldata(params) {
    return service.post('/tdf-service-sys/sys/dataitem/query/alldata', params);
  },

  queryMenuAlldata(params) {
    return service.post('/tdf-service-sys/sys/menu/query/alldata', params);
  },

  resSpacelist() {
    return service.get('/tdf-service-sys/sys/resspace/query/resSpacelist');
  },

  queryResspaceAlldata(params) {
    return service.post('/tdf-service-sys/sys/resspace/query/alldata', params);
  },

  createResspace(params) {
    return service.post('/tdf-service-sys/sys/resspace/', params);
  },

  removeResspace(id) {
    return service.delete(`/tdf-service-sys/sys/resspace/${id}`);
  },

  editResspace(params) {
    return service.put('/tdf-service-sys/sys/resspace/', params);
  }
};

export { sysApi };
