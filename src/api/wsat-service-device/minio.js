import { SessionStorage } from 'quasar';

const minioApi = {
  upload(files, bucketName = 'taiji') {
    return {
      url: '/api/wsat-service-device/minio/upload',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file',
      formFields: [
        { name: 'bucketName', value: bucketName },
        { name: 'fileName', value: files[0].name }
      ]
    };
  },

  // 上传证书接口
  coverUpload(files) {
    return {
      url: '/api/tdf-service-sys/dlLicenseController/licenseUpload',
      headers: [{ name: 'Authorization', value: `Bearer ${SessionStorage.getItem('token')}` }],
      fieldName: 'file',
      formFields: [
        { name: 'bucketName', value: 'license' },
        { name: 'fileName', value: files[0].name }
      ]
    };
  }
};

export { minioApi };
