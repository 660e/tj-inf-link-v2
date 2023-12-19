<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.deptName" :validator="$v.forms.deptName" label="名称" type="text" width="70" maxlength="32" />
      <iot-form-item :value.sync="forms.parentId" :nodes="parentIdNodes" label="上级机构" type="cascader" label-key="deptName" width="70" />
      <iot-form-item :value.sync="forms.deptType" :validator="$v.forms.deptType" label="类型" type="text" width="70" maxlength="32" />
      <iot-form-item
        :value.sync="forms.deptIndex"
        :validator="$v.forms.deptIndex"
        label="排序号"
        type="number"
        min="1"
        max="9999"
        width="70"
        hint="范围：1 ~ 9999"
      />
      <iot-form-item :value.sync="forms.remark" label="备注" type="textarea" width="70" maxlength="100" />
      <iot-form-item :value.sync="forms.deptState" label="状态" type="toggle" width="70" true-value="1" false-value="0" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { between, required } from 'vuelidate/lib/validators';
import { extend } from 'quasar';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        deptName: '',
        parentId: '',
        deptType: '',
        deptIndex: 1,
        remark: '',
        deptState: '1'
      },
      parentIdNodes: []
    };
  },
  validations: {
    forms: {
      deptName: { required },
      deptIndex: { required, between: between(1, 9999) }
    }
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
      }
      sysApi.getDeptTree().then(response => {
        this.parentIdNodes = response;
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        sysApi[this.isCreate ? 'createDept' : 'editDept'](this.forms).then(response => {
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
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    }
  }
};
</script>
