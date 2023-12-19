<template>
  <iot-dialog :visible="visible" :width="1000" :title="isCreate ? '新增' : '修改'" :buttons="buttons" @handle="handle" dense>
    <q-form>
      <q-list>
        <q-expansion-item label="基本信息" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
          <q-card-section class="row">
            <section class="col q-mr-md">
              <iot-form-item :value.sync="forms.name" :validator="$v.forms.name" label="名称" type="text" width="70" maxlength="32" />
              <iot-form-item :value.sync="forms.manufacyuer" label="生产厂商" type="text" width="70" maxlength="32" />
              <iot-form-item :value.sync="forms.describe" label="备注" type="textarea" width="70" maxlength="100" />
            </section>
            <section class="col">
              <iot-form-item :value.sync="forms.number" :validator="$v.forms.number" label="序列号" type="text" width="70" maxlength="32" />
              <iot-form-item :value.sync="forms.position" label="安装位置" type="text" width="70" maxlength="32" />
            </section>
          </q-card-section>
        </q-expansion-item>
        <q-expansion-item label="感知对象分组" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
          <q-card-section>
            <q-tree :nodes="nodes" :ticked.sync="forms.groupids" label-key="name" node-key="id" tick-strategy="strict" accordion />
          </q-card-section>
        </q-expansion-item>
        <q-expansion-item label="感知对象图片" :header-class="[$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3']" default-opened dense>
          <q-card-section class="row">
            <q-uploader
              :factory="factory"
              @uploaded="qrurlUploaded"
              @removed="qrurlRemoved"
              @failed="failed"
              label="二维码"
              ref="qr"
              accept=".bmp, .jpg, .png"
              class="col"
              max-files="1"
              auto-upload
            >
              <template v-slot:list="scope">
                <div class="layout-uploader__list">
                  <div v-for="file in scope.files" :key="file.name">
                    <img :src="file.__img.src" />
                    <q-icon @click="scope.removeFile(file)" name="delete_outline" size="md" color="negative" />
                  </div>
                </div>
              </template>
            </q-uploader>
            <q-uploader
              :factory="factory"
              @uploaded="pictureurlUploaded"
              @removed="pictureurlRemoved"
              @failed="failed"
              label="感知对象图片"
              ref="picture"
              accept=".bmp, .jpg, .png"
              class="col q-ml-md"
              max-files="1"
              auto-upload
            >
              <template v-slot:list="scope">
                <div class="layout-uploader__list">
                  <div v-for="file in scope.files" :key="file.name">
                    <img :src="file.__img.src" />
                    <q-icon @click="scope.removeFile(file)" name="delete_outline" size="md" color="negative" />
                  </div>
                </div>
              </template>
            </q-uploader>
          </q-card-section>
        </q-expansion-item>
      </q-list>
    </q-form>
  </iot-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { perceivedApi } from '@/api/wsat-service-device/perceived.js';
import { minioApi } from '@/api/wsat-service-device/minio.js';
import { extend } from 'quasar';
import { urlsToFiles } from '@/utils/data.js';

export default {
  data() {
    return {
      visible: false,
      isCreate: true,
      buttons: [],
      RESET: {
        forms: {}
      },
      forms: {
        name: '',
        number: '',
        manufacyuer: '',
        position: '',
        describe: '',
        groupids: [],
        qrurl: '',
        pictureurl: ''
      },
      nodes: []
    };
  },
  validations: {
    forms: {
      name: { required },
      number: { required }
    }
  },
  created() {
    this.RESET.forms = extend(true, {}, this.forms);
  },
  methods: {
    open(row) {
      this.isCreate = !row;
      this.buttons = [
        { label: '确定', command: 'confirm', color: 'primary', loading: true },
        { label: '确定并绑定设备', command: 'confirm & bind', color: 'primary', loading: true },
        { label: '取消', command: 'cancel' }
      ];
      if (!this.isCreate) {
        this.forms = extend(true, {}, row);
        this.buttons[1].show = false;
      }
      perceivedApi.getGroupTree().then(response => {
        this.nodes = response.data;
        this.visible = true;
      });
    },
    handle({ command }) {
      switch (command) {
        case 'show':
          if (!this.isCreate) {
            urlsToFiles([this.forms.qrurl]).then(files => this.$refs.qr.addFiles(files));
            urlsToFiles([this.forms.pictureurl]).then(files => this.$refs.picture.addFiles(files));
          }
          break;
        case 'confirm':
        case 'confirm & bind':
          this.$v.$touch();
          if (!this.$v.$invalid) {
            this.$store.commit('loading', true);
            perceivedApi[this.isCreate ? 'addPerceived' : 'updatePerceived'](this.forms).then(response => {
              if (response) {
                this.$q.notify({ type: 'positive', message: `${this.isCreate ? '新增' : '修改'}成功` });
                this.$emit('confirm', command === 'confirm & bind' && response.data);
                this.handle({ command: 'cancel' });
              }
            });
          }
          break;
        case 'cancel':
          this.visible = false;
          this.$store.commit('loading', false);
          this.forms = extend(true, {}, this.RESET.forms);
          this.$v.$reset();
          break;
      }
    },
    // 感知对象图片
    factory(files) {
      return minioApi.upload(files, 'taiji');
    },
    qrurlUploaded(info) {
      this.forms.qrurl = JSON.parse(info.xhr.response).data;
    },
    pictureurlUploaded(info) {
      this.forms.pictureurl = JSON.parse(info.xhr.response).data;
    },
    qrurlRemoved() {
      this.forms.qrurl = '';
    },
    pictureurlRemoved() {
      this.forms.pictureurl = '';
    },
    failed() {
      this.$q.notify({ type: 'negative', message: '上传失败，请重试' });
    }
  }
};
</script>
