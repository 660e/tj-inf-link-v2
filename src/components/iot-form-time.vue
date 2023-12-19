<template>
  <div class="iot-form-item" :class="{ 'iot-form-item--vertical': vertical }">
    <h6 v-if="label" :style="{ width: vertical ? '100%' : `${width}px` }">
      <em v-if="validator.$params.required || validator.$params.requiredIf">*</em>
      <span>{{ label }}</span>
    </h6>
    <div class="col row items-center">
      <div class="col row q-gutter-x-sm items-center">
        <q-select v-model="time[0]" :options="fill(24)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
        <span>:</span>
        <q-select v-model="time[1]" :options="fill(60)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
        <span>:</span>
        <q-select v-model="time[2]" :options="fill(60)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
      </div>
      <template v-if="range">
        <span class="q-px-sm">至</span>
        <div class="col row q-gutter-x-sm items-center">
          <q-select v-model="time[3]" :options="fill(24)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
          <span>:</span>
          <q-select v-model="time[4]" :options="fill(60)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
          <span>:</span>
          <q-select v-model="time[5]" :options="fill(60)" @input="input" class="col" dense hide-dropdown-icon options-dense outlined />
        </div>
      </template>
      <div v-else class="col"></div>
    </div>
  </div>
</template>

<script>
import { format } from 'quasar';
export default {
  props: {
    value: [String, Array],
    label: String,
    width: {
      type: String,
      default: '80'
    },
    vertical: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    validator: {
      type: Object,
      default: () => {
        return {
          $error: false,
          $touch: () => {},
          $reset: () => {},
          $params: {
            required: false
          },
          required: false
        };
      }
    }
  },
  data() {
    return {
      time: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    input() {
      if (this.range && this.time.filter(e => e).length === 6) {
        this.$emit('input', [this.time.filter((e, i) => i < 3).join(':'), this.time.filter((e, i) => i > 2).join(':')]);
      } else if (!this.range && this.time.filter(e => e).length === 3) {
        this.$emit('input', this.time.join(':'));
      } else {
        this.$emit('input', null);
      }
    },
    init() {
      if (this.range) {
        if (this.value && this.value.length) {
          this.time = this.value[0].split(':').concat(this.value[1].split(':'));
        } else {
          this.time = [];
        }
      } else {
        if (this.value) {
          this.time = this.value.split(':');
        } else {
          this.time = [];
        }
      }
    },
    fill(n) {
      return Array(n)
        .fill()
        .map((e, i) => format.pad(i, 2));
    }
  }
};
</script>

<style src="./iot-form-item.scss" lang="scss" scoped />
