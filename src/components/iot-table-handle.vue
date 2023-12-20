<template>
  <div class="iot-table-handle flex items-center no-wrap">
    <template v-for="(h, i) in props.col.handles">
      <div
        v-if="isObject(h)"
        v-show="h.show === undefined ? true : isFunction(h.show) ? h.show(props.row) : h.show"
        class="cursor-pointer"
        :key="i"
        :class="[`text-${h.color || 'primary'}`, { 'q-mr-md': props.col.handles.length - 1 !== i }, `text-`]"
        @click="handle(h.command, props.row, isFunction(h.disable) ? h.disable(props.row) : h.disable)"
      >
        <span :class="{ 'text-grey-6': isFunction(h.disable) ? h.disable(props.row) : h.disable }">
          {{ isFunction(h.label) ? h.label(props.row) : h.label }}
        </span>
        <q-tooltip v-if="isFunction(h.disable) ? h.disable(props.row) : h.disable">
          {{ isFunction(h.tooltip) ? h.tooltip(props.row) : h.tooltip }}
        </q-tooltip>
      </div>
      <div v-if="isArray(h)" :key="i" class="cursor-pointer">
        <span class="text-primary">更多</span>
        <q-icon color="primary" name="expand_more" />
        <q-popup-proxy>
          <q-list>
            <q-item
              v-for="c in h"
              v-show="c.show === undefined ? true : isFunction(c.show) ? c.show(props.row) : c.show"
              :key="c.label"
              @click="handle(c.command, props.row, isFunction(c.disable) ? c.disable(props.row) : c.disable)"
              clickable
              dense
              v-close-popup
            >
              <q-item-section>
                <q-item-label :class="[`text-${c.color || 'primary'}`]">
                  <span :class="{ 'text-grey-6': isFunction(c.disable) ? c.disable(props.row) : c.disable }">
                    {{ isFunction(c.label) ? c.label(props.row) : c.label }}
                  </span>
                </q-item-label>
              </q-item-section>
              <q-tooltip v-if="isFunction(c.disable) ? c.disable(props.row) : c.disable">{{ c.tooltip }}</q-tooltip>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </div>
    </template>
  </div>
</template>

<script>
import { isArray, isFunction, isObject } from '@/utils/data.js';
export default {
  name: 'iot-table-handle',
  props: {
    props: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  methods: {
    handle(command, row, disable) {
      if (!disable) {
        this.$emit('handle', { command, row });
      }
    },
    isArray(source) {
      return isArray(source);
    },
    isFunction(source) {
      return isFunction(source);
    },
    isObject(source) {
      return isObject(source);
    }
  }
};
</script>
