<template>
  <q-dialog :value="visible" @show="show" @hide="hide" position="right" maximized>
    <q-card class="iot-dialog column" :style="{ width: `${width}px` }">
      <div class="iot-dialog__header flex items-center q-px-md">
        <h5>{{ title }}</h5>
      </div>
      <q-separator />
      <div class="iot-dialog__container col column" :class="{ dense }">
        <slot />
      </div>
      <q-separator />
      <div class="q-gutter-x-md q-pa-md">
        <template v-if="buttons && buttons.length">
          <q-btn
            v-for="(b, i) in buttons"
            v-show="b.show === undefined ? true : isFunction(b.show) ? b.show() : b.show"
            :key="i"
            :label="b.label"
            :color="b.color"
            :loading="b.loading ? $store.getters.loading : false"
            @click="handle(b.command)"
          />
        </template>
        <template v-else>
          <q-btn @click="confirm" label="确定" color="primary" :loading="$store.getters.loading" />
          <q-btn @click="cancel" label="取消" />
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { isFunction } from '@/utils/data.js';
export default {
  name: 'iot-dialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 500
    },
    title: {
      type: String,
      default: ''
    },
    buttons: {
      type: Array,
      buttons: () => []
    },
    dense: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    show() {
      this.$emit('handle', { command: 'show' });
    },
    hide() {
      this.cancel();
      this.handle('cancel');
    },
    confirm() {
      this.$emit('confirm');
    },
    cancel() {
      this.$emit('cancel');
    },
    handle(command) {
      this.$emit('handle', { command });
    },
    isFunction(source) {
      return isFunction(source);
    }
  }
};
</script>

<style lang="scss" scoped>
$space: 16px;
.iot-dialog {
  .iot-dialog__header {
    height: 49px;
    & > h5 {
      font-size: 18px;
      line-height: 1;
    }
  }
  .iot-dialog__container {
    overflow-y: auto;
    & > ::v-deep .q-form {
      flex: 1;
      padding: $space;
      & > section {
        flex: 1;
        padding-right: $space;
        &:last-child {
          padding: 0;
        }
      }
    }
  }
}
</style>
