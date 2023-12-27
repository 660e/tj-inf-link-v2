<template>
  <iot-dialog :visible="visible" :width="500" @confirm="confirm" @cancel="cancel" title="修改密码">
    <q-form>
      <iot-form-item :value.sync="forms.origPwd" :validator="$v.forms.origPwd" label="旧密码" type="password" />
      <iot-form-item
        :value.sync="forms.newPwd"
        :validator="$v.forms.newPwd"
        hint="10~32个字符，包含大写字母、小写字母、数字、字符（@$!%*?&）"
        label="新密码"
        type="password"
      />
      <iot-form-item :value.sync="forms.confirmPwd" label="确认密码" type="password" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { SessionStorage, extend } from 'quasar';
import { required } from 'vuelidate/lib/validators';
import { changePassword } from '@/utils/login.js';

const password = value => value === '' || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,32}/.test(value);

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        origPwd: '',
        newPwd: '',
        confirmPwd: ''
      }
    };
  },
  validations: {
    forms: {
      origPwd: { required },
      newPwd: { required, password },
      confirmPwd: { required }
    }
  },
  created() {
    this.RESET = {
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.forms.confirmPwd === this.forms.newPwd) {
          this.$store.commit('loading', true);
          const params = {
            loginName: SessionStorage.getItem('account').login.name,
            origPwd: this.forms.origPwd,
            newPwd: this.forms.newPwd
          };
          changePassword(params);
        } else {
          this.$q.notify({ type: 'warning', message: '两次密码输入不一致' });
        }
      }
    },
    cancel() {
      this.visible = false;
    }
  }
};
</script>
