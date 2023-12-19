<template>
  <iot-dialog :visible="visible" :width="1000" @confirm="confirm" @cancel="cancel" title="批量修改">
    <q-form>
      <div class="card-section">
        <iot-form-date label="安装日期" v-model="forms.installationDate" width="110" />
        <iot-form-date label="保修起始日" v-model="forms.warrantyStartDate" width="110" />
        <iot-form-date label="保修有效期" v-model="forms.warrantyValidity" width="110" />
        <iot-form-item label="使用年限" :value.sync="forms.serviceLife" type="number" width="110" />
        <iot-form-item label="主管部门" :value.sync="forms.competentDepartment" type="text" maxlength="32" width="110" />
        <iot-form-item label="权属单位" :value.sync="forms.ownershipUnit" type="text" maxlength="32" width="110" />
        <iot-form-item label="维养单位" :value.sync="forms.maintenanceUnit" type="text" maxlength="32" width="110" />
        <iot-form-item label="使用部门" :value.sync="forms.useDepartment" type="text" maxlength="32" width="110" />
        <iot-form-item label="责任人" :value.sync="forms.responsible" type="text" maxlength="32" width="110" />
        <iot-form-item label="施工单位" :value.sync="forms.constructionUnit" type="text" maxlength="32" width="110" />
        <iot-form-date label="上次维修日期" v-model="forms.lastRepairDate" width="110" />
        <iot-form-item label="尺寸" :value.sync="forms.size" type="text" maxlength="32" width="110" />
        <iot-form-item label="主要技术参数" :value.sync="forms.mainParameters" type="text" maxlength="32" width="110" />
        <iot-form-item label="出厂编号" :value.sync="forms.factoryNo" type="text" maxlength="32" width="110" />
        <iot-form-date label="出厂日期" v-model="forms.manufactureDate" width="110" />
      </div>
    </q-form>
  </iot-dialog>
</template>

<script>
import { devicesApi } from '@/api/wsat-service-device/devices.js';

export default {
  data() {
    return {
      visible: false,
      forms: {}
    };
  },
  methods: {
    open(ids) {
      this.visible = true;
      this.$store.commit('loading', false);
      this.forms.ids = ids;
    },
    confirm() {
      this.$store.commit('loading', true);
      devicesApi.batchUpdateDeviceBasicMessage(this.forms).then(response => {
        if (response) {
          this.$q.notify({ type: 'positive', message: '批量修改成功' });
          this.$emit('confirm');
          this.cancel();
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$store.commit('loading', false);
      this.$store.dispatch('batch/cancel');
      this.forms = {};
    }
  }
};
</script>

<style src="./create.scss" lang="scss" scoped />
