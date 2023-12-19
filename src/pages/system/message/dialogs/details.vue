<template>
  <iot-dialog :visible="visible" :width="500" :buttons="[{ label: '关闭', command: 'cancel' }]" @handle="handle" title="详情">
    <div class="q-py-md">
      <q-list dense>
        <q-item>
          <q-item-section>{{ row.title }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>{{ row.createTime }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>{{ row.context }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </iot-dialog>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      row: {}
    };
  },
  methods: {
    open(row) {
      this.row = row;
      this.visible = true;
    },
    handle({ command }) {
      switch (command) {
        case 'cancel':
          this.visible = false;
          break;
      }
    }
  }
};
</script>
