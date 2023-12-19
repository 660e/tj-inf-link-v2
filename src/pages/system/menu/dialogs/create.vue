<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form>
      <iot-form-item :value.sync="forms.menuName" :validator="$v.forms.menuName" label="名称" type="text" width="70" maxlength="32" />
      <iot-form-item :value.sync="forms.parentId" :nodes="parentIdNodes" label="上级菜单" type="cascader" width="70" />
      <iot-form-item :value.sync="forms.menuDesc" :options="menuDescOptions" label="类型" type="radio" width="70" />
      <template v-if="forms.menuDesc === 'button'">
        <iot-form-item :value.sync="forms.authorityId" :validator="$v.forms.authorityId" label="权限ID" type="text" width="70" maxlength="100" />
      </template>
      <template v-else>
        <iot-form-item :value.sync="forms.menuUrl" :validator="$v.forms.menuUrl" label="路径" type="text" width="70" maxlength="100" />
        <iot-form-item :value.sync="forms.smallIconPath" label="图标" type="text" width="70" maxlength="32" />
      </template>
      <iot-form-item
        :value.sync="forms.menuIndex"
        :validator="$v.forms.menuIndex"
        label="排序号"
        type="number"
        min="1"
        max="9999"
        width="70"
        hint="范围：1 ~ 9999"
      />
      <iot-form-item :value.sync="forms.remark" label="备注" type="textarea" width="70" maxlength="100" />
    </q-form>
  </iot-dialog>
</template>

<script>
import { between, required, requiredIf } from 'vuelidate/lib/validators';
import { flattenTree, buildTree } from '@/utils/data.js';
import { sysApi } from '@/api/tdf-service-sys/sys.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';
export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        forms: {}
      },
      forms: {
        menuName: '',
        parentId: '',
        menuDesc: 'menu',
        authorityId: '',
        menuUrl: '',
        smallIconPath: '',
        menuIndex: 1,
        remark: '',
        flag: 1
      },
      parentIdNodes: [],
      menuDescOptions: []
    };
  },
  validations: {
    forms: {
      menuName: { required },
      authorityId: {
        required: requiredIf(forms => forms.menuDesc === 'button')
      },
      menuUrl: {
        required: requiredIf(forms => forms.menuDesc !== 'button')
      },
      menuIndex: { required, between: between(1, 9999) }
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
      const p0 = sysApi.getMenuTree();
      const p1 = extendApi.getDateItemByParentcode({ code: 'menuDesc' });
      Promise.all([p0, p1]).then(response => {
        const temp = flattenTree(response[0].router).map(e => {
          return {
            id: e.id,
            pid: e.parentId,
            name: e.meta.title
          };
        });
        this.parentIdNodes = buildTree(temp);
        this.menuDescOptions = response[1].map(e => ({ label: e.name, value: e.code }));
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        sysApi[this.isCreate ? 'createMenu' : 'editMenu'](this.forms).then(response => {
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
