<template>
  <q-dialog v-model="visible">
    <q-card class="q-pa-md" style="width: 300px">
      <div class="q-gutter-y-md">
        <q-input v-model="forms.name" label="键" dense hide-bottom-space outlined />
        <q-input v-model="forms.value" label="值" dense hide-bottom-space outlined />
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
      forms: {}
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    confirm() {
      this.verify(['name', 'value']);
    },
    cancel() {
      this.visible = false;
      this.forms = {};
    },
    verify(keys) {
      if (keys.every(k => !!this.forms[k])) {
        this.$emit('confirm', { forms: this.forms });
        this.cancel();
      } else {
        this.$q.notify({ type: 'warning', message: '表单填写不完整' });
      }
    }
  }
};
</script>
