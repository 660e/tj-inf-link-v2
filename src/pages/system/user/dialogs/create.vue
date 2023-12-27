<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.userName" :validator="$v.forms.userName" label="姓名" type="text" maxlength="32" />
      <iot-form-item :value.sync="forms.loginName" :validator="$v.forms.loginName" label="账号" type="text" maxlength="32" />
      <iot-form-item
        v-if="isCreate"
        :value.sync="surface.password1"
        :validator="$v.surface.password1"
        label="密码"
        type="password"
        hint="10~32个字符，包含大写字母、小写字母、数字、字符（@$!%*?&）"
      />
      <iot-form-item
        v-else
        :value.sync="surface.password2"
        :validator="$v.surface.password2"
        label="密码"
        type="password"
        hint="10~32个字符，包含大写字母、小写字母、数字、字符（@$!%*?&）"
      />
      <iot-form-item :value.sync="forms.phoneNum" :validator="$v.forms.phoneNum" label="手机号" type="text" maxlength="11" />
      <iot-form-item :value.sync="forms.email" :validator="$v.forms.email" label="邮箱" type="text" maxlength="100" />
      <iot-form-item :value.sync="forms.gender" :options="genderOptions" label="性别" type="radio" />
      <iot-form-item :value.sync="forms.state" label="状态" type="toggle" true-value="1" false-value="0" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';

const password = value => value === '' || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,32}/.test(value);

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        surface: {},
        forms: {}
      },
      surface: {
        password1: '',
        password2: ''
      },
      forms: {
        userName: '',
        loginName: '',
        phoneNum: '',
        email: '',
        gender: '1',
        userIndex: 1,
        state: '1'
      },
      genderOptions: []
    };
  },
  validations: {
    surface: {
      password1: {
        required: requiredIf(function () {
          return this.isCreate;
        }),
        password
      },
      password2: {
        password
      }
    },
    forms: {
      userName: { required },
      loginName: { required },
      email: { email }
    }
  },
  created() {
    this.RESET.surface = extend(true, {}, this.surface);
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      extendApi.getDateItemBycodes(['gender']).then(response => {
        this.genderOptions = response.gender.map(e => {
          e.value = String(e.value);
          return e;
        });
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.forms.password = this.isCreate ? this.surface.password1 : this.surface.password2;
        sysApi[this.isCreate ? 'createUser' : 'editUser'](this.forms).then(response => {
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
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    }
  }
};
</script>
