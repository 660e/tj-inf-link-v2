<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? `在${surface.pname}下新增` : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="分组名称" type="text" maxlength="32" />
      <iot-form-item :value.sync="forms.describe" label="分组描述" type="textarea" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { extend } from 'quasar';
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
        pname: ''
      },
      forms: {
        pid: 0,
        name: '',
        describe: ''
      }
    };
  },
  validations: {
    forms: {
      name: { required }
    }
  },
  created() {
    this.RESET = {
      surface: extend(true, {}, this.surface),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(command, node) {
      switch (command) {
        case 'create':
          this.isCreate = true;
          this.surface.pname = node.name;
          this.forms.pid = node.id;
          break;
        case 'edit':
          this.isCreate = false;
          this.forms = extend(true, {}, node);
          break;
      }
      this.visible = true;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        perceivedApi[this.isCreate ? 'addGroup' : 'updateGroup'](this.forms).then(response => {
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
