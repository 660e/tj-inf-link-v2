import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { deviceCodeApi } from '@/api/wsat-service-device/device-code.js';
import { minioApi } from '@/api/wsat-service-device/minio.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend, format } from 'quasar';
import { required, requiredIf, ipAddress } from 'vuelidate/lib/validators';
import { urlsToFiles } from '@/utils/data.js';
import AddKvDialog from './add-kv.vue';

const nonChinese = value => !value || /^[^\u4e00-\u9fa5]+$/.test(value);
const isLatlng = value => {
  if (value) {
    const [lng, lat] = value.split(',').map(l => Number(l));
    return value.split(',').filter(e => e).length > 1 && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
  } else {
    return true;
  }
};

export default {
  components: {
    AddKvDialog
  },
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        surface: {},
        field: {},
        forms: {}
      },
      surface: {
        nodeType: 0,
        agreementType: 0,
        rules: [],
        props: [],
        qrCode: [],
        equipmentPicture: []
      },
      field: {
        productId: '',
        pid: ''
      },
      forms: {
        // 基本信息
        name: '',
        deviceSn: '',
        productId: '',
        pid: null,
        // --- 4-BACNET
        instanceNumber: 0,
        // --- 2-MODBUS-TCP；4-BACNET；7-TCP客户端
        serverIp: '',
        serverPort: 0,
        // --- 1-TCP服务端；5-HTTP/HTTPS客户端；6-UDP；8-HTTP/HTTPS服务端
        isFixedIp: 1,
        clientIp: '',
        // --- 3-OPC-UA
        endPointUrl: '',
        securityMode: 'None',
        securityPolicy: '',
        userName: '',
        password: '',
        digitalrKey: '',
        cipherKey: '',
        // ---
        deviceBrand: '',
        deviceModel: '',
        firmwareVersion: '',
        location: '',
        positionArea: '',
        positionSite: '',
        positionDescription: '',
        describe: '',
        // 运维信息
        installationDate: '',
        warrantyStartDate: '',
        warrantyValidity: '',
        serviceLife: 0,
        competentDepartment: '',
        ownershipUnit: '',
        maintenanceUnit: '',
        useDepartment: '',
        responsible: '',
        constructionUnit: '',
        lastRepairDate: '',
        size: '',
        mainParameters: '',
        factoryNo: '',
        manufactureDate: '',
        // 设备编码
        sn: '',
        // 设备分组与自定义信息
        kvList: []
      },
      productIdOptions: [],
      pidOptions: [],
      switchNumberOptions: [],
      securityPolicyOptions: [],
      securityModeOptions: [],
      deviceBrandOptions: [],
      nodes: [],
      ticked: [],
      columns: [
        { label: '名称', name: 'name', field: 'name', align: 'left' },
        { label: '数值', name: 'value', field: 'value', align: 'left' },
        { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
      ]
    };
  },
  validations: {
    forms: {
      name: { required },
      deviceSn: { required },
      productId: { required },
      serverIp: { ipAddress },
      clientIp: {
        ipAddress,
        required: requiredIf(function () {
          return this.forms.isFixedIp && [1, 5, 6, 8].includes(this.surface.agreementType);
        })
      },
      deviceModel: { nonChinese },
      location: { isLatlng }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      field: extend(true, {}, this.field),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open({ device, productId, nodeType, pid }) {
      const p0 = devicesApi.getAllProductSelect(nodeType !== undefined ? [nodeType] : pid === -1 || !pid ? [0, 1] : [2]);
      const p1 = devicesApi.getAllDeviceSelect({ pid: -1 });
      const p2 = extendApi.getDateItemBycodes(['switchNumber', 'securityPolicy', 'securityMode', 'deviceBrand']);
      const p3 = deviceCodeApi.findDeviceCodeRule();
      const p4 = devicesApi.getGroups();
      Promise.all([p0, p1, p2, p3, p4]).then(response => {
        this.productIdOptions = response[0].data;
        this.pidOptions = response[1].data;
        this.switchNumberOptions = response[2].switchNumber;
        this.securityPolicyOptions = response[2].securityPolicy;
        this.securityModeOptions = response[2].securityMode;
        this.deviceBrandOptions = response[2].deviceBrand;
        if (!pid && (productId === 0 || !!productId)) {
          const product = this.productIdOptions.find(p => p.id === productId);
          this.surface.nodeType = product.nodeType;
          this.surface.agreementType = product.agreementType;
          this.field.productId = product.name;
          this.forms.productId = productId;
        }
        if (!!pid && pid !== -1) {
          this.field.pid = this.pidOptions.find(d => d.id === pid).name;
          this.forms.pid = pid;
        }
        Promise.all(response[3].data.map(r => deviceCodeApi.findDeviceCodeProperty(r.id))).then(propResponse => {
          this.surface.rules = response[3].data.map(e => {
            return {
              id: e.id,
              pid: e.relationRuleId,
              type: e.ruleType,
              label: e.ruleName,
              value: '',
              connect: !!e.isBeginParagraph
            };
          });
          this.surface.props = propResponse
            .map(e => e.data)
            .flat()
            .filter(e => e)
            .map(e => ({
              rid: e.codeRuleId,
              pid: e.pid,
              code: e.code,
              label: `${e.code}（${e.codeDesc}）`,
              value: e.id
            }));
          this.nodes = response[4].data;
          // edit
          this.isCreate = !device;
          if (!this.isCreate) {
            this.surface.agreementType = this.productIdOptions.find(p => p.id === device.productId).agreementType;
            this.surface.rules.forEach((r, i) => (r.value = device.deviceCodeSeparator ? JSON.parse(device.deviceCodeSeparator)[i] : ''));
            this.ticked = device.groupIds ? device.groupIds.split(',').map(e => Number(e)) : [];
            this.forms = extend(true, {}, device);
          }
          // open
          this.visible = true;
        });
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        const params = extend(true, {}, this.forms);
        params.pid = this.forms.pid === null ? -1 : this.forms.pid;
        params.deviceCodeSeparator = JSON.stringify(this.surface.rules.map(e => e.value));
        params.groupIds = this.ticked.join(',');
        params.qrCode = JSON.stringify(this.surface.qrCode);
        params.equipmentPicture = JSON.stringify(this.surface.equipmentPicture);
        devicesApi[this.isCreate ? 'createDevice' : 'updateDevice'](params).then(response => {
          if (response) {
            this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
            this.$emit('confirm');
            this.cancel();
          }
        });
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.surface = extend(true, {}, this.RESET.surface);
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    },
    handle({ command }) {
      switch (command) {
        case 'show':
          if (!this.isCreate) {
            if (this.forms.qrCode) {
              urlsToFiles(JSON.parse(this.forms.qrCode)).then(files => this.$refs.qrCode.addFiles(files));
            }
            if (this.forms.equipmentPicture) {
              urlsToFiles(JSON.parse(this.forms.equipmentPicture)).then(files => this.$refs.equipmentPicture.addFiles(files));
            }
          }
          break;
      }
    },
    productIdInput(value) {
      const product = value ? this.productIdOptions.find(p => p.id === value) : {};
      if (product.nodeType === 2) {
        const params = {
          pid: -1,
          nodeType: 1
        };
        devicesApi.getAllDeviceSelect(params).then(response => (this.pidOptions = response.data));
      }
      this.surface.nodeType = product.nodeType;
      this.surface.agreementType = product.agreementType;
    },
    refreshPidOptions() {
      devicesApi.getAllDeviceSelect({ pid: -1 }).then(response => (this.pidOptions = response.data));
    },
    // 设备编码
    getOptions(rule) {
      if (rule.pid === '0') {
        return this.surface.props.filter(p => p.rid === rule.id);
      } else {
        const pid = this.surface.rules.find(r => r.id === rule.pid).value;
        return this.surface.props.filter(p => p.pid === pid);
      }
    },
    updateSn() {
      this.$nextTick(() => {
        const sn = this.surface.rules.map(r => {
          if (r.value) {
            switch (r.type) {
              case 1:
                return `${r.connect ? '-' : ''}${r.value}`;
              case 2:
                return `${r.connect ? '-' : ''}${this.surface.props.find(p => p.value === r.value).code}`;
              case 3:
                return `${r.connect ? '-' : ''}${format.pad(r.value, 4)}`;
            }
          }
        });
        this.forms.sn = sn.join('');
      });
    },
    // 设备分组与自定义信息
    addKv() {
      this.$refs.addKvDialog.open();
    },
    onAddKv(resolve) {
      this.forms.kvList.push(resolve.forms);
    },
    delKv(i) {
      this.forms.kvList.splice(i, 1);
    },
    // 设备图片
    factory(files) {
      return minioApi.upload(files, 'taiji');
    },
    qrCodeUploaded(info) {
      this.surface.qrCode.push(JSON.parse(info.xhr.response).data);
    },
    equipmentPictureUploaded(info) {
      this.surface.equipmentPicture.push(JSON.parse(info.xhr.response).data);
    },
    qrCodeRemoved(files) {
      const index = this.surface.qrCode.indexOf(JSON.parse(files[0].xhr.response).data);
      this.surface.qrCode.splice(index, 1);
    },
    equipmentPictureRemoved(files) {
      const index = this.surface.equipmentPicture.indexOf(JSON.parse(files[0].xhr.response).data);
      this.surface.equipmentPicture.splice(index, 1);
    }
  }
};
