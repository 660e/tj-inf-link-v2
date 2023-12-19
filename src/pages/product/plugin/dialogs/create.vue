<template>
  <iot-dialog :visible="visible" :width="500" :title="isCreate ? '新增' : '修改'" @confirm="confirm" @cancel="cancel">
    <q-form ref="forms">
      <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="协议名称" type="text" maxlength="32" />
      <template v-if="isCreate">
        <iot-form-item :value.sync="forms.type" :options="typeOptions" label="协议类型" type="select" />
        <div class="text-subtitle2" style="padding: 0 0 20px 80px">
          请根据协议，下载各个协议的解析代码示例，<span @click="download" class="text-primary cursor-pointer">点击下载</span>
        </div>
      </template>
      <iot-form-item v-else :value="field.type" label="协议类型" type="field" />
      <iot-form-item :value.sync="forms.desc" label="协议描述" type="textarea" maxlength="100" />
      <iot-form-item label="解析文件">
        <q-uploader :factory="factory" label="选取jar" accept=".jar" class="col" ref="uploader" />
      </iot-form-item>
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { protocolApi } from '@/api/wsat-service-device/protocol.js';
import { extendApi } from '@/api/tdf-service-sys/extend.js';
import { extend } from 'quasar';
import { exportFile } from '@/utils/data.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      RESET: {
        field: {},
        forms: {}
      },
      field: {},
      forms: {
        name: '',
        type: '',
        desc: ''
      },
      typeOptions: []
    };
  },
  validations: {
    forms: {
      name: { required }
    }
  },
  created() {
    this.RESET = {
      field: extend(true, {}, this.field),
      forms: extend(true, {}, this.forms)
    };
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      extendApi.getDateItemBycodes(['pluginAgreement']).then(response => {
        this.typeOptions = response.pluginAgreement;
        if (!this.isCreate) {
          this.forms = extend(true, {}, row);
          this.field.type = response.pluginAgreement.find(e => e.value === this.forms.type).label;
        }
        this.visible = true;
      });
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store.commit('loading', true);
        this.$refs.uploader.upload();
      }
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.field = extend(true, {}, this.RESET.field);
      this.forms = extend(true, {}, this.RESET.forms);
      this.$v.$reset();
    },
    factory(files) {
      const params = {
        id: this.forms.id,
        name: this.forms.name,
        type: this.forms.type,
        desc: this.forms.desc,
        label: this.forms.label,
        file: files[0],
        fileName: files[0].name
      };
      return protocolApi[this.isCreate ? 'jarUpload' : 'jarUploadEdit'](params).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: '处理成功' });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    download() {
      if (this.forms.type !== '') {
        protocolApi.jarPluginTemplates(this.forms.type).then(response => exportFile(response, '插件模板', 'application/zip'));
      }
    }
  }
};
</script>
