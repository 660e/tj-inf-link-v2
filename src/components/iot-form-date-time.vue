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
            <q-date v-model="date" :mask="mask.date" class="no-shadow" minimal />
            <div class="row q-gutter-x-md q-pb-md q-px-md">
              <q-input v-model="time" type="time" class="col" dense outlined />
              <q-btn @click="reset" label="重置" />
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
    value: [String, Number],
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
      date: '',
      time: '',
      text: '',
      mask: {
        date: 'YYYY-MM-DD',
        datetime: 'YYYY-MM-DD HH:mm'
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.value) {
        this.text = this.timestamp ? dayjs(this.value).format(this.mask.datetime) : this.value;
        this.date = this.text.substring(0, 10);
        this.time = this.text.substring(11, 16);
      } else {
        this.text = '';
      }
    },
    show() {
      this.init();
      this.$refs.popup.show();
    },
    hide() {
      this.date = this.text.substring(0, 10);
      this.time = this.text.substring(11, 16);
    },
    confirm() {
      if (this.date) {
        this.text = `${this.date} ${this.time || '00:00'}`;
        this.$emit('input', this.timestamp ? dayjs(this.text).valueOf() : this.text);
      } else {
        this.text = '';
        this.$emit('input', this.text);
      }
      this.$refs.popup.hide();
    },
    reset() {
      this.date = '';
      this.time = '';
    }
  }
};
</script>

<style src="./iot-form-item.scss" lang="scss" scoped />
