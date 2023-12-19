import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const linkageProductsApi = {
  // 新增联动产品
  addLinkageProduct(params) {
    return service.post('/wsat-service-device/linkageProducts/addLinkageProduct', params);
  },

  // 获取产品和联动产品
  queryProductAndLinkageProduct(params) {
    return service.get('/wsat-service-device/linkageProducts/queryProductAndLinkageProduct', params);
  },

  // 删除联动产品
  delLinkageProduct(id) {
    return service.post('/wsat-service-device/linkageProducts/delLinkageProduct', { id });
  },

  // 修改联动产品
  updateLinkageProduct(params) {
    return service.post('/wsat-service-device/linkageProducts/updateLinkageProduct', params);
  },

  // 分页获取联动产品列表
  linkageProductList(params) {
    return service.get('/wsat-service-device/linkageProducts/linkageProductList', { params });
  },

  // 联动产品详情
  linkageProductDetail(id) {
    return service.get('/wsat-service-device/linkageProducts/linkageProductDetail', { params: { id } });
  },

  // 导出联动产品列表
  exportLinkageProduct(params) {
    return service.post('/wsat-service-device/linkageProducts/exportLinkageProduct', qs(params), { responseType: 'blob' });
  },

  // 联动产品解绑
  unboundLinkageProduct(params) {
    return service.post('/wsat-service-device/linkageProducts/unboundLinkageProduct', params);
  },

  // 复制联动产品
  copyLinkageProduct(linkageProductId) {
    return service.post('/wsat-service-device/linkageProducts/copyLinkageProduct', { linkageProductId });
  },

  // 查询所有联动产品
  linkageProductAllList() {
    return service.get('/wsat-service-device/linkageProducts/linkageProductAllList');
  },

  // 查询产品和设备的属性
  getRulePropertyList(params) {
    return service.get('/wsat-service-device/linkageProducts/getRulePropertyList', { params });
  },

  // 查询产品和设备的服务
  getProductServerList(params) {
    return service.get('/wsat-service-device/linkageProducts/getProductServerList', { params });
  },

  // 查询联动产品下设备列表
  getdeviceListByLKProductId(params) {
    return service.get('/wsat-service-device/linkageProducts/getdeviceListByLKProductId', { params });
  },

  getdeviceListByLKProductIdPage(params) {
    return service.get('/wsat-service-device/linkageProducts/getdeviceListByLKProductIdPage', { params });
  }
};

export { linkageProductsApi };
