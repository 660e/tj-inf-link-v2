<template>
  <div class="flex items-center q-mx-md q-mt-md" style="height: 32px">
    <q-icon
      v-if="back"
      @click="$emit('back')"
      class="cursor-pointer q-mr-xs"
      color="primary"
      name="arrow_circle_up"
      size="32px"
      style="transform: rotate(-90deg)"
    />
    <h4 class="text-h5">{{ title }}</h4>
    <div v-if="buttons.length" class="col flex justify-between">
      <div class="q-gutter-x-md q-pl-md flex items-center">
        <div
          v-for="(b, i) in buttons[0]"
          v-show="b.show === undefined ? true : isFunction(b.show) ? b.show() : b.show"
          :key="i"
          @click="handle(b.command)"
          class="flex items-center cursor-pointer text-primary text-subtitle2"
        >
          <q-icon v-if="b.icon" :name="b.icon" class="q-mr-xs" />
          <span>{{ b.label }}</span>
        </div>
      </div>
      <div class="q-gutter-x-md">
        <q-btn
          v-for="(b, i) in buttons[1]"
          v-show="b.show === undefined ? true : isFunction(b.show) ? b.show() : b.show"
          :key="i"
          :label="b.label"
          @click="handle(b.command)"
          size="12px"
        />
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
import { isFunction } from '@/utils/data.js';
export default {
  name: 'iot-header',
  props: {
    back: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '-'
    },
    buttons: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handle(command) {
      this.$emit('handle', { command });
    },
    isFunction(source) {
      return isFunction(source);
    }
  }
};
</script>
