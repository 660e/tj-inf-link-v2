import { extend } from 'quasar';
import { required, requiredIf } from 'vuelidate/lib/validators';

import { alarmRuleTypeApi } from '@/api/wsat-service-alarm/alarm-rule-type.js';
import { alarmRuleApi } from '@/api/wsat-service-alarm/alarm-rule.js';
import { linkageProductsApi } from '@/api/wsat-service-device/linkage-products.js';
import { linkageDevicesApi } from '@/api/wsat-service-device/linkage-devices.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

import AddUserDialog from '@/pages/linkage/rule/dialogs/add-user.vue';
import BindUserDialog from '@/pages/linkage/rule/dialogs/bind-user.vue';

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
      columns: [],
      step: 1,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        debounce: false,
        date: [],
        time: ['00:00:00', '23:59:59'],
        users1: [],
        users2: []
      },
      forms: {
        // 1
        ruleName: '',
        alarmTypeCode: '',
        productId: '',
        deviceId: '',
        alarmLevel: 1,
        isIgnore: 0,
        isHandle: 0,
        flag: 0,
        alarmSuppress: {
          minuteTimeRange: 1,
          alarmNumber: 1,
          type: 1
        },
        ruleDescribe: '',
        // 2
        alarmRuleConditionList: [{ splicing: 'AND' }],
        // 3
        notifyList: [
          {
            notifyUserType: 2,
            notifyMethod: 'email',
            userList: []
          }
        ]
      },
      alarmTypeCodeOptions: [],
      alarmLevelOptions: [],
      linkageProductOptions: [],
      linkageDeviceOptions: [],
      alarmSuppressTypeOptions: [],
      propertyOptions: [],
      triggerConditionOptions: [],
      notifyUserTypeOptions: [],
      notifyMethodOptions: [],
      isIgnoreOptions: [],
      isHandleOptions: []
    };
  },
  validations: {
    forms: {
      ruleName: {
        required: requiredIf(function () {
          return this.step === 1;
        })
      },
      alarmTypeCode: { required },
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
      const p0 = extendApi.getDateItemBycodes([
        'alarmLevel',
        'alarmSuppressType',
        'operator',
        'notifyUserType',
        'notifyMethod',
        'isIgnore',
        'isHandle'
      ]);
      const p1 = alarmRuleTypeApi.SelectAlarmRuleType();
      const p2 = linkageProductsApi.queryProductAndLinkageProduct();
      Promise.all([p0, p1, p2]).then(response => {
        this.alarmLevelOptions = response[0].alarmLevel;
        this.alarmSuppressTypeOptions = response[0].alarmSuppressType;
        this.triggerConditionOptions = response[0].operator;
        this.notifyUserTypeOptions = response[0].notifyUserType;
        this.notifyMethodOptions = response[0].notifyMethod;
        this.isIgnoreOptions = response[0].isIgnore;
        this.isHandleOptions = response[0].isHandle;
        this.alarmTypeCodeOptions = response[1].data.map(e => ({ label: e.ruleType, value: e.ruleTypeCode, id: e.id }));
        this.linkageProductOptions = response[2].data;
        if (!this.isCreate) {
          this.forms = extend(true, {}, row);
          // 1
          linkageDevicesApi.queryDeviceOrLinkageDevice({ id: this.forms.productId }).then(step_1_response => {
            this.linkageDeviceOptions = step_1_response.data.map(e => ({ label: e.name, value: String(e.id) }));
            this.forms.alarmTypeCode = Number(row.alarmTypeCode);
            this.surface.debounce = !!this.forms.alarmSuppress;
            if (!this.surface.debounce) {
              this.forms.alarmSuppress = {
                minuteTimeRange: 1,
                alarmNumber: 1,
                type: 3
              };
            }
            this.surface.date = row.effectiveDataScope ? row.effectiveDataScope.split('~') : [];
            this.surface.time = row.effectiveTimeScope ? row.effectiveTimeScope.split('~') : [];
            // 2
            linkageProductsApi.getRulePropertyList({ productId: this.forms.productId, deviceId: this.forms.deviceId }).then(step_2_response => {
              this.propertyOptions = step_2_response.data;
              this.forms.alarmRuleConditionList.forEach(a => {
                this.getTriggerConditionOptions(a);
                a._v = a._t === 2 ? [a.propValue.split('~')[0], a.propValue.split('~')[1]] : [a.propValue];
              });
              // 3
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
        } else {
          this.visible = true;
        }
      });
    },
    handle({ command }) {
      switch (command) {
        case 'next':
          this.$v.$touch();
          if (!this.$v.$invalid) {
            this.$refs.stepper.next();
            switch (this.step) {
              case 2: {
                const params = { productId: this.forms.productId, deviceId: this.forms.deviceId };
                linkageProductsApi.getRulePropertyList(params).then(response => (this.propertyOptions = response.data));
                break;
              }
            }
          }
          break;
        case 'prev':
          this.$refs.stepper.previous();
          break;
        case 'confirm': {
          this.$store.commit('loading', true);
          const params = extend(true, {}, this.forms);
          // 1
          params.alarmTypeId = this.alarmTypeCodeOptions.find(e => e.value === this.forms.alarmTypeCode).id;
          params.effectiveDataScope = this.surface.date && this.surface.date.join('~');
          params.effectiveTimeScope = this.surface.time && this.surface.time.join('~');
          // 2
          params.alarmRuleConditionList.forEach((a, i) => {
            a.orderNumber = i;
            a.propertyType = this.propertyOptions.find(e => e.id === a.propertyLabel).type;
            a.propValue = a._v.join('~');
            delete a._t;
            delete a._o;
            delete a._v;
          });
          params.alarmRuleExpr = params.alarmRuleConditionList
            .map(a => {
              return `${a.propertyLabel} ${a.triggerCondition} ${a.propValue} ${a.splicing}`;
            })
            .join(' ');
          // 3
          if (params.notifyList[0].notifyUserType === 2) {
            this.surface.users1.forEach(u => delete u.id);
            params.notifyList[0].userList = this.surface.users1.concat(this.surface.users2);
          } else {
            params.notifyList[0].userList = [];
          }
          // submit
          alarmRuleApi[this.isCreate ? 'SaveAlarmRule' : 'UpadateAlarmRule'](params).then(response => {
            if (response) {
              this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
              this.$emit('confirm');
              this.handle({ command: 'cancel' });
            }
          });
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
          this.forms.alarmRuleConditionList.push({ splicing: 'AND' });
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
      this.forms.alarmRuleConditionList = [{ splicing: 'AND' }];
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
