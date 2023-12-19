import { requiredIf } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { linkageProductsApi } from '@/api/wsat-service-device/linkage-products.js';
import { linkageDevicesApi } from '@/api/wsat-service-device/linkage-devices.js';
import { productsApi } from '@/api/wsat-service-device/products.js';
import { devicesApi } from '@/api/wsat-service-device/devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
import { sceneLinkageRuleApi } from '@/api/wsat-service-alarm/scene-linkage-rule.js';
import AddUserDialog from './add-user.vue';
import BindUserDialog from './bind-user.vue';

export default {
  components: {
    AddUserDialog,
    BindUserDialog
  },
  data() {
    return {
      visible: false,
      isCreate: true,
      buttons: [],
      step: 1,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        debounce: false,
        alarm: false,
        users1: [],
        users2: []
      },
      forms: {
        // 1
        ruleName: '',
        productId: '',
        deviceId: '',
        flag: 0,
        alarmSuppress: {
          minuteTimeRange: 1,
          alarmNumber: 1,
          type: 3
        },
        ruleDescribe: '',
        // 2
        triggerConditionList: [{ splicing: 'AND' }],
        alarmRuleExpr: '',
        // 3
        execActionList: [{ actionType: 2, serviceParams: {}, _s: [] }],
        sceneLinkageAlarmRuleList: [
          {
            ruleName: '',
            alarmTypeCode: '',
            alarmLevel: 1,
            isIgnore: 0,
            isHandle: 0,
            flag: 0
          }
        ],
        notifyList: [
          {
            notifyUserType: 2,
            notifyMethod: 'email',
            userList: []
          }
        ]
      },
      linkageProductOptions: [],
      linkageDeviceOptions: [],
      propertyOptions: [],
      serviceOptions: [],
      triggerConditionOptions: [],
      alarmTypeCodeOptions: [],
      alarmLevelOptions: [],
      isIgnoreOptions: [],
      isHandleOptions: [],
      notifyUserTypeOptions: [],
      notifyMethodOptions: [],
      actionTypeOptions: [],
      deviceOptions: [],
      columns: []
    };
  },
  validations: {
    forms: {
      ruleName: {
        required: requiredIf(function () {
          return this.step === 1;
        })
      },
      productId: {
        required: requiredIf(function () {
          return this.step === 1;
        })
      }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  mounted() {
    this.buttons = [
      { label: '上一步', command: 'prev', show: false },
      { label: '下一步', command: 'next', color: 'primary' },
      { label: '确定', command: 'confirm', color: 'primary', loading: true, show: false },
      { label: '取消', command: 'cancel' }
    ];
    this.columns = [
      { label: '用户名', name: 'userName', field: 'userName', align: 'left' },
      { label: '手机号', name: 'mobile', field: 'mobile', align: 'left' },
      { label: '邮箱', name: 'email', field: 'email', align: 'left' },
      { label: '操作', name: 'handle', field: 'handle', align: 'left', style: 'width: 10px' }
    ];
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      const p0 = linkageProductsApi.queryProductAndLinkageProduct();
      const p1 = alarmRuleTypeApi.SelectAlarmRuleType();
      const p2 = extendApi.getDateItemBycodes(['operator', 'alarmLevel', 'isIgnore', 'isHandle', 'notifyUserType', 'notifyMethod', 'actionType']);
      const p3 = devicesApi.getAllDeviceSelect();
      Promise.all([p0, p1, p2, p3]).then(response => {
        this.linkageProductOptions = response[0].data;
        this.alarmTypeCodeOptions = response[1].data.map(e => ({ label: e.ruleType, value: String(e.ruleTypeCode) }));
        this.triggerConditionOptions = response[2].operator;
        this.alarmLevelOptions = response[2].alarmLevel;
        this.isIgnoreOptions = response[2].isIgnore;
        this.isHandleOptions = response[2].isHandle;
        this.notifyUserTypeOptions = response[2].notifyUserType;
        this.notifyMethodOptions = response[2].notifyMethod;
        this.actionTypeOptions = response[2].actionType;
        this.deviceOptions = response[3].data;
        if (!this.isCreate) {
          this.forms = extend(true, {}, row);
          // 1
          linkageDevicesApi.queryDeviceOrLinkageDevice({ id: this.forms.productId }).then(step_1_response => {
            this.linkageDeviceOptions = step_1_response.data.map(e => ({ label: e.name, value: String(e.id) }));
            this.surface.debounce = !!this.forms.alarmSuppress;
            if (!this.surface.debounce) {
              this.forms.alarmSuppress = {
                minuteTimeRange: 1,
                alarmNumber: 1,
                type: 3
              };
            }
            // 2
            linkageProductsApi.getRulePropertyList({ productId: this.forms.productId, deviceId: this.forms.deviceId }).then(step_2_response => {
              this.propertyOptions = step_2_response.data;
              this.forms.triggerConditionList.forEach(c => {
                this.getTriggerConditionOptions(c);
                c._v = c._t === 2 ? [c.propValue.split('~')[0], c.propValue.split('~')[1]] : [c.propValue];
              });
              // 3
              linkageProductsApi.getProductServerList({ productId: this.forms.productId, deviceId: this.forms.deviceId }).then(step_3_response => {
                this.serviceOptions = step_3_response.data;
                if (this.forms.productId.indexOf('LK') === -1) {
                  this.forms.execActionList.forEach(a => {
                    devicesApi.services(a.deviceId).then(response => (a._s = response.data));
                  });
                }
                if (this.forms.sceneLinkageAlarmRuleList.length) {
                  this.surface.alarm = true;
                } else {
                  this.forms.sceneLinkageAlarmRuleList = [
                    {
                      ruleName: '',
                      alarmTypeCode: '',
                      alarmLevel: 1,
                      isIgnore: 0,
                      isHandle: 0,
                      flag: 0
                    }
                  ];
                }
                if (this.forms.notifyList.length) {
                  if (this.forms.notifyList[0].notifyUserType === 2) {
                    this.surface.users1 = this.forms.notifyList[0].userList
                      .filter(u => u.userId)
                      .map(u => {
                        return {
                          id: u.userId,
                          userId: u.userId,
                          userAccount: u.userAccount,
                          userName: u.userName,
                          mobile: u.mobile,
                          email: u.email
                        };
                      });
                    this.surface.users2 = this.forms.notifyList[0].userList.filter(u => u.userId === null);
                  }
                } else {
                  this.forms.notifyList = [
                    {
                      notifyUserType: 2,
                      notifyMethod: 'email',
                      userList: []
                    }
                  ];
                }
                // open
                this.visible = true;
              });
            });
          });
        } else {
          this.visible = true;
        }
      });
    },
    handle({ command }) {
      switch (command) {
        case 'next':
          switch (this.step) {
            case 1:
              this.$v.$touch();
              if (!this.$v.$invalid) {
                this.$refs.stepper.next();
                const params = { productId: this.forms.productId, deviceId: this.forms.deviceId };
                linkageProductsApi.getRulePropertyList(params).then(response => (this.propertyOptions = response.data));
              }
              break;
            case 2:
              if (
                this.forms.triggerConditionList.every(e => {
                  return e.propertyLabel && e.triggerCondition && e._v.length;
                })
              ) {
                this.$refs.stepper.next();
                const params = { productId: this.forms.productId, deviceId: this.forms.deviceId };
                linkageProductsApi.getProductServerList(params).then(response => (this.serviceOptions = response.data));
              } else {
                this.$q.notify({ type: 'warning', message: '请完整填写条件项目' });
              }
              break;
          }
          break;
        case 'prev':
          this.$refs.stepper.previous();
          break;
        case 'confirm': {
          if (
            this.forms.execActionList.every(e => {
              if (this.forms.productId.indexOf('LK') === -1) {
                return e.deviceId && e.serviceId;
              } else {
                return e.serviceId;
              }
            })
          ) {
            this.$store.commit('loading', true);
            const params = extend(true, {}, this.forms);
            // 1
            if (!this.surface.debounce) {
              params.alarmSuppress = null;
            }
            // 2
            params.triggerConditionList.forEach((c, i) => {
              c.orderNumber = i;
              c.propertyType = this.propertyOptions.find(e => e.id === c.propertyLabel).type;
              c.propValue = c._v.join('~');
              delete c._t;
              delete c._o;
              delete c._v;
            });
            params.alarmRuleExpr = params.triggerConditionList
              .map(c => {
                return `${c.propertyLabel} ${c.triggerCondition} ${c.propValue} ${c.splicing}`;
              })
              .join(' ');
            // 3
            params.execActionList.forEach(a => {
              delete a._s;
            });
            if (!this.surface.alarm) {
              params.sceneLinkageAlarmRuleList = [];
            }
            if (params.notifyList[0].notifyUserType === 2) {
              this.surface.users1.forEach(u => delete u.id);
              params.notifyList[0].userList = this.surface.users1.concat(this.surface.users2);
            } else {
              params.notifyList[0].userList = [];
            }
            // submit
            sceneLinkageRuleApi[this.isCreate ? 'saveSceneLinkageRuleBasics' : 'updateSceneLinkageRuleBasics'](params).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
                this.$emit('confirm');
                this.handle({ command: 'cancel' });
              }
            });
          } else {
            this.$q.notify({ type: 'warning', message: '请完整填写服务调用项目' });
          }
          break;
        }
        case 'cancel':
          this.visible = false;
          this.$store.commit('loading', false);
          this.step = 1;
          this.surface = extend(true, {}, this.RESET.surface);
          this.forms = extend(true, {}, this.RESET.forms);
          this.$v.$reset();
          break;
        case 'bind-user':
          this.$refs.bindUserDialog.open(this.surface.users1);
          break;
        case 'add-user':
          this.$refs.addUserDialog.open();
          break;
      }
    },
    add({ name, data }) {
      switch (name) {
        case 'condition':
          this.forms.triggerConditionList.push({ splicing: 'AND' });
          break;
        case 'actions':
          this.forms.execActionList.push({ actionType: 2, serviceParams: {}, _s: [] });
          break;
        case 'bind-user':
          this.surface.users1 = data;
          break;
        case 'add-user':
          this.surface.users2.push(data);
          break;
      }
    },
    del(data, index) {
      data.splice(index, 1);
    },
    // 1
    linkageProductInput(id) {
      this.forms.deviceId = '';
      linkageDevicesApi.queryDeviceOrLinkageDevice({ id }).then(response => {
        this.linkageDeviceOptions = response.data.map(e => ({ label: e.name, value: String(e.id) }));
      });
      this.linkageDeviceInput();
    },
    linkageDeviceInput() {
      this.propertyOptions = [];
      this.forms.triggerConditionList = [{ splicing: 'AND' }];
      this.forms.alarmRuleExpr = '';
      this.forms.execActionList = [{ actionType: 2, serviceParams: {}, _s: [] }];
    },
    // 2
    propertyLabelInput(data) {
      this.$nextTick(() => {
        data.triggerCondition = '';
        data._v = [];
        this.getTriggerConditionOptions(data);
      });
    },
    triggerConditionInput(data) {
      this.$nextTick(() => {
        data._v = [];
        this.getTriggerConditionOptions(data);
      });
    },
    getTriggerConditionOptions(data) {
      data._o = this.triggerConditionOptions;
      if ([1, 7, 8, 9].includes(this.propertyOptions.find(e => e.id === data.propertyLabel).type)) {
        // 1-byte；7-boolean；8-char；9-String
        data.triggerCondition = '==';
        data._o = this.triggerConditionOptions.filter(e => e.value === '==');
        data._t = 1;
      } else if (['Out', 'Range'].includes(data.triggerCondition)) {
        // 2-short；3-int；4-long；5-float；6-double && Out；Range
        data._t = 2;
      } else if (data.triggerCondition.indexOf('Rate') !== -1) {
        // 2-short；3-int；4-long；5-float；6-double && Rate
        data._t = 3;
      } else if (data.triggerCondition) {
        // 2-short；3-int；4-long；5-float；6-double
        data._t = 4;
      } else {
        data._t = 0;
      }
      this.$forceUpdate();
    },
    // 3
    deviceInput(data) {
      this.$nextTick(() => {
        data.serviceId = '';
        devicesApi.services(data.deviceId).then(response => (data._s = response.data));
      });
    },
    serviceIdInput(data) {
      this.$nextTick(() => {
        if (this.forms.productId.indexOf('LK') === -1) {
          devicesApi.getDeviceServiceParameterList({ id: data.serviceId }).then(response => {
            const params = {};
            response.data.forEach(e => (params[e.label] = e.value));
            data.serviceParams = extend(true, {}, params);
          });
        } else {
          productsApi.getProductServiceParameterList({ id: data.serviceId }).then(response => {
            const params = {};
            response.data.forEach(e => (params[e.label] = e.value));
            data.serviceParams = extend(true, {}, params);
          });
        }
      });
    },
    toProductDetail() {
      const row = this.linkageProductOptions.find(e => (e.id = this.forms.productId));
      this.$router.push({
        name: 'product-list-details',
        params: {
          id: row.id
        },
        query: {
          tab: 1,
          protocolId: row.agreementId,
          protocolType: row.agreementType
        }
      });
    }
  },
  watch: {
    step(n) {
      switch (n) {
        case 1:
          this.buttons[0].show = false; // prev
          this.buttons[1].show = true; // next
          this.buttons[2].show = false; // confirm
          break;
        case 2:
          this.buttons[0].show = true; // prev
          this.buttons[1].show = true; // next
          this.buttons[2].show = false; // confirm
          break;
        case 3:
          this.buttons[0].show = true; // prev
          this.buttons[1].show = false; // next
          this.buttons[2].show = true; // confirm
          break;
      }
    }
  }
};
