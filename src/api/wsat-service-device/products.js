import { service } from '@/utils/service.js';
import { qs } from '@/utils/data.js';

const productsApi = {
  getProductList(params) {
    return service.post('/wsat-service-device/products/getProductList', params);
  },

  addProductMain(params) {
    return service.post('/wsat-service-device/products/addProductMain', params);
  },

  updateProductInfo(params) {
    return service.post('/wsat-service-device/products/updateProductInfo', params);
  },

  deleteProduct(id) {
    return service.post('/wsat-service-device/products/deleteProduct', { id });
  },

  getProductModelsAll() {
    return service.get('/wsat-service-device/products/models/list');
  },

  updateProductReleaseStatus(params) {
    return service.post('/wsat-service-device/products/updateProductReleaseStatus', params);
  },

  getProductInfo(id) {
    return service.post('/wsat-service-device/products/getProductInfo', { id });
  },

  getProductsModels(params) {
    return service.get('/wsat-service-device/products/models', { params });
  },

  addProductModel(params) {
    return service.post('/wsat-service-device/products/models', params);
  },

  editProductsModels(params) {
    return service.put('/wsat-service-device/products/models', params);
  },

  removeProductsModels(modelId) {
    return service.delete(`/wsat-service-device/products/models?${qs({ modelId })}`);
  },

  getProductsModelsProps(params) {
    return service.get('/wsat-service-device/products/models/props', { params });
  },

  createProductsModelsProps(params) {
    return service.post('/wsat-service-device/products/models/props', params);
  },

  editProductsModelsProps(params) {
    return service.put('/wsat-service-device/products/models/props', params);
  },

  removeProductsModelsProps(productModelPropertyId) {
    return service.delete(`/wsat-service-device/products/models/props?${qs({ productModelPropertyId })}`);
  },

  getProductPropertyList(params) {
    return service.post('/wsat-service-device/products/getProductPropertyList', params);
  },

  getProductsModelsTree() {
    return service.get('/wsat-service-device/products/models/class/tree');
  },

  getModelsClassChildren(params) {
    return service.get('/wsat-service-device/products/models/class/children', { params });
  },

  getModelsClass(params) {
    return service.get('/wsat-service-device/products/models/class', { params });
  },

  addTypeClass(params) {
    return service.post('/wsat-service-device/products/models/class', params);
  },

  editTypeClass(params) {
    return service.put('/wsat-service-device/products/models/class', params);
  },

  removeModelsClass(modelClassID) {
    return service.delete(`/wsat-service-device/products/models/class?${qs({ modelClassID })}`);
  },

  addProductProperty(params) {
    return service.post('/wsat-service-device/products/addProductProperty', params);
  },

  updateProductProperty(params) {
    return service.post('/wsat-service-device/products/updateProductProperty', params);
  },

  deleteProductPropertyById(propertyId) {
    return service.post('/wsat-service-device/products/deleteProductPropertyById', { propertyId });
  },

  addProductEvent(params) {
    return service.post('/wsat-service-device/products/addProductEvent', params);
  },

  deleteProductEventById(eventId) {
    return service.post('/wsat-service-device/products/deleteProductEventById', { eventId });
  },

  updateProductEvent(params) {
    return service.post('/wsat-service-device/products/updateProductEvent', params);
  },

  getProductEventList(params) {
    return service.post('/wsat-service-device/products/getProductEventList', params);
  },

  createProductsServices(params) {
    return service.post('/wsat-service-device/products/services', params);
  },

  deleteProductsServicesById(id) {
    return service.delete(`/wsat-service-device/products/services/${id}`);
  },

  updateProductsServices(params) {
    return service.put('/wsat-service-device/products/services', params);
  },

  getProductServiceList(params) {
    return service.post('/wsat-service-device/products/getProductServiceList', params);
  },

  copyProduct(id, productName, code) {
    return service.post(`/wsat-service-device/products/copyProduct?${qs({ id, productName, code })}`);
  },

  exportByProductId(params) {
    return service.post('/wsat-service-device/products/exportByProductId', params, { responseType: 'blob' });
  },

  getAllProductPropertyTree() {
    return service.get('/wsat-service-device/products/getAllProductPropertyTree');
  },

  getProductAlarmRuleList(params) {
    return service.post('/wsat-service-device/products/getProductAlarmRuleList', params);
  },

  // 批量发布/撤销
  batchUpdateProductReleaseStatus(params) {
    return service.post('/wsat-service-device/products/batchUpdateProductReleaseStatus', params);
  },

  // 批量删除
  batchDeleteProduct(params) {
    return service.post('/wsat-service-device/products/batchDeleteProduct', params);
  },

  // 获取产品服务参数列表
  getProductServiceParameterList(params) {
    return service.post('/wsat-service-device/products/getProductServiceParameterList', params);
  }
};

export { productsApi };
