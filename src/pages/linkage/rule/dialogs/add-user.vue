<template>
  <q-dialog v-model="visible">
    <q-card class="q-pa-md">
      <div class="q-gutter-y-md">
        <q-input v-model="forms.userName" label="用户名" dense hide-bottom-space outlined />
        <q-input v-model="forms.mobile" label="手机号" dense hide-bottom-space outlined />
        <q-input v-model="forms.email" label="邮箱" dense hide-bottom-space outlined />
      </div>
      <div class="q-pt-md flex justify-end">
        <div class="q-gutter-x-md">
          <q-btn @click="cancel" label="取消" />
          <q-btn @click="confirm" label="确定" color="primary" />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      forms: {
        userName: '',
        mobile: '',
        email: ''
      }
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    confirm() {
      if (this.forms.userName) {
        this.$emit('confirm', { name: 'add-user', data: this.forms });
        this.cancel();
      } else {
        this.$q.notify({ type: 'warning', message: '表单填写不完整' });
      }
    },
    cancel() {
      this.visible = false;
      this.forms = {
        userName: '',
        mobile: '',
        email: ''
      };
    }
  }
};
</script>
