import { service } from '@/utils/service.js';

const uploadApi = {
  // 物模型产品导入
  productUploadByObjModel(params) {
    const fd = new FormData();
    Object.keys(params).forEach(k => fd.append(k, params[k]));
    return service.post('/wsat-service-device/upload/productUploadByObjModel', fd);
  },

  // 获取当前用户导入任务列表
  getUploadTaskByCurrentUser() {
    return service.get('/wsat-service-device/upload/getUploadTaskByCurrentUser');
  },

  // 修改导入任务
  updateUploadTask(params) {
    return service.post('/wsat-service-device/upload/updateUploadTask', params);
  }
};

export { uploadApi };
