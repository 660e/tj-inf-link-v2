<template>
  <div class="iot-toolbar q-mx-md q-mt-md flex justify-between">
    <div class="q-gutter-x-md flex" v-if="$store.getters['batch/buttonVisible'] && $store.getters['batch/name'] === button.name">
      <q-btn @click="batch" :label="button.label" color="primary" />
      <q-btn @click="cancel" label="取消" />
    </div>
    <div class="q-gutter-x-md flex" v-else>
      <template v-for="(button, i) in buttons">
        <q-btn v-if="isObject(button)" :key="i" :label="button.label" :color="button.color" @click="handle(button)" no-caps />
        <q-btn-dropdown v-if="isArray(button)" :key="i" :label="button[0].label" @click="handle(button[0])" split>
          <q-list dense>
            <q-item v-for="sub in button.slice(1, button.length)" :key="sub.label" @click="handle(sub)" clickable v-close-popup>
              <q-item-section>
                <q-item-label>{{ sub.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </div>
    <div class="q-gutter-x-md flex">
      <q-select
        v-if="columns.length"
        v-model="visibleColumns"
        :options="columns.filter(c => !c.required)"
        @input="input"
        display-value="自定义列"
        option-value="name"
        dense
        emit-value
        map-options
        multiple
        options-cover
        options-dense
        outlined
      />
      <q-btn v-if="!hideRefresh" @click="refresh" label="刷新" />
    </div>
    <!-- 批量确认 -->
    <q-dialog v-model="$store.getters['batch/dialogVisible']">
      <q-card class="q-pa-md">
        <iot-table-simple
          :data="$store.getters['batch/selected']"
          :columns="[
            { label: 'ID', name: 'id', field: 'id', align: 'left' },
            { label: '项', name: 'name', field: 'name', align: 'left' }
          ]"
          max-height="400px"
        />
        <div class="q-gutter-x-md q-pt-md flex justify-end">
          <q-btn @click="$store.commit('batch/dialogVisible', false)" label="取消" />
          <q-btn @click="confirm" label="确定" color="primary" :loading="$store.getters.loading" />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { isArray, isObject, isFunction } from '@/utils/data.js';

export default {
  name: 'iot-toolbar',
  props: {
    buttons: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Array,
      default: () => []
    },
    hideRefresh: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleColumns: [],
      button: {}
    };
  },
  mounted() {
    this.cancel();
    this.$nextTick(() => (this.visibleColumns = this.columns.map(c => c.name)));
  },
  methods: {
    handle(button) {
      if (button.command && !button.command.indexOf('batch-') && isFunction(button.filter)) {
        this.button = button;
        this.$store.commit('batch/buttonVisible', true);
        this.$store.commit('batch/name', button.name);
        this.$store.commit('batch/filter', button.filter);
      } else {
        this.$emit('handle', { command: button.command });
      }
    },
    batch() {
      if (this.$store.getters['batch/selected'].length) {
        this.$store.commit('batch/dialogVisible', true);
      }
    },
    cancel() {
      this.$store.dispatch('batch/cancel');
    },
    confirm() {
      this.$store.commit('loading', true);
      this.$emit('handle', { command: this.button.command, selected: this.$store.getters['batch/selected'] });
    },
    input(columns) {
      this.$emit('handle', { command: 'visible-columns', columns });
    },
    refresh() {
      this.$emit('refresh');
    },
    isArray(source) {
      return isArray(source);
    },
    isObject(source) {
      return isObject(source);
    }
  }
};
</script>

<style lang="scss" scoped>
.iot-toolbar > div:first-child {
  .q-btn-dropdown ::v-deep .q-btn-dropdown__arrow-container {
    border-color: #eee;
  }
}
.q-dark .iot-toolbar > div:first-child .q-btn-dropdown ::v-deep .q-btn-dropdown__arrow-container {
  border-color: #222;
}
</style>
