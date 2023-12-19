<template>
  <div class="iot-form-item" :class="{ 'iot-form-item--vertical': vertical }" @click="show">
    <h6 v-if="label" :style="{ width: vertical ? '100%' : `${width}px` }">
      <em v-if="validator.$params.required || validator.$params.requiredIf">*</em>
      <span>{{ label }}</span>
    </h6>
    <q-field class="cursor-pointer" dense outlined>
      <template v-slot:prepend>
        <q-icon name="event">
          <q-popup-proxy ref="popup" @hide="hide">
            <div class="row">
              <q-date v-model="date[0]" :mask="mask" class="no-shadow" minimal />
              <q-date v-if="range" v-model="date[1]" :mask="mask" class="no-shadow" minimal />
            </div>
            <div class="row justify-end q-px-md q-pb-md">
              <q-btn @click="confirm" label="确定" color="primary" />
            </div>
          </q-popup-proxy>
        </q-icon>
      </template>
      <template v-slot:control>
        <div>{{ text }}</div>
      </template>
    </q-field>
  </div>
</template>

<script>
import dayjs from 'dayjs';
export default {
  props: {
    value: [String, Number, Array],
    label: String,
    width: {
      type: String,
      default: '80'
    },
    vertical: {
      type: Boolean,
      default: false
    },
    timestamp: {
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
      text: '',
      date: [],
      mask: 'YYYY-MM-DD'
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.range) {
        if (this.value && this.value.length) {
          this.date = this.timestamp
            ? [dayjs(this.value[0]).format(this.mask), dayjs(this.value[1]).format(this.mask)]
            : [this.value[0], this.value[1]];
          this.text = this.date.join(' 至 ');
        } else {
          this.date = [];
          this.text = '';
        }
      } else {
        if (this.value) {
          this.date = this.timestamp ? [dayjs(this.value[0]).format(this.mask)] : [this.value];
          this.text = this.date[0];
        } else {
          this.date = [];
          this.text = '';
        }
      }
    },
    show() {
      this.init();
      this.$refs.popup.show();
    },
    hide() {
      this.init();
    },
    confirm() {
      if (this.date.filter(e => e).length === 2 && this.range && this.date.every(e => e)) {
        this.text = this.date.join(' 至 ');
        this.$emit('input', this.timestamp ? this.date.map(e => dayjs(e).valueOf()) : this.date);
      } else if (this.date.filter(e => e).length === 1 && !this.range) {
        this.text = this.date[0];
        this.$emit('input', this.timestamp ? dayjs(this.date[0]).valueOf() : this.date[0]);
      } else {
        this.text = '';
        this.$emit('input', null);
      }
      this.$refs.popup.hide();
    }
  }
};
</script>

<style src="./iot-form-item.scss" lang="scss" scoped />
