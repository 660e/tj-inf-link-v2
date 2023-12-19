<template>
  <div class="iot-table col q-ma-md" ref="table">
    <q-table
      v-if="height && width"
      :loading="$store.getters.loading"
      :title="title"
      :data="data"
      :columns="columns"
      :pagination.sync="pagination_"
      :hide-pagination="!pagination"
      :rows-per-page-options="[10, 20, 50]"
      :selection="selection_"
      :selected.sync="selected_"
      :visible-columns="visibleColumns"
      :style="{ height, width }"
      :class="[sticky ? 'sticky-header-column' : 'sticky-header']"
      :row-key="rowKey"
      @request="onRequest"
      @update:selected="onSelected"
      title-class="text-subtitle2"
      bordered
      flat
    >
      <template v-slot:body-selection="scope" v-if="$store.state.batch.buttonVisible">
        <q-checkbox v-model="scope.selected" v-if="$store.getters['batch/filter'](scope.row)" />
      </template>
      <template v-slot:body-cell="props">
        <!-- ellipsis -->
        <td
          v-if="props.col.classes && props.col.classes.indexOf('ellipsis') > -1"
          :class="props.col.__thClass"
          :style="props.col.style"
          style="padding-left: 0; padding-right: 0"
        >
          <div :class="props.col.classes" :style="props.col.style">
            <q-tooltip>{{ props.value }}</q-tooltip>
            <span>{{ props.value }}</span>
          </div>
        </td>
        <td v-else :class="props.col.__thClass" :style="props.col.style">{{ props.value }}</td>
      </template>
      <!-- badge -->
      <template v-for="b in badge" v-slot:[b]="props">
        <td :key="b" :class="props.col.__thClass" :style="props.col.style">
          <div class="badge flex items-center no-wrap">
            <em :class="[`bg-${props.col.badge(props.row[b.slice(10, b.length)]) || 'primary'}`]"></em>
            <span>{{ props.value }}</span>
          </div>
        </td>
      </template>
      <!-- event -->
      <template v-for="t in event" v-slot:[t]="props">
        <td :key="t" :class="props.col.__thClass" :style="props.col.style">
          <div
            v-if="props.col.eventEnable === undefined || props.col.eventEnable(props.row)"
            @click="props.col.event(props.row)"
            class="cursor-pointer text-primary"
          >
            {{ props.value }}
          </div>
          <div v-else>-</div>
        </td>
      </template>
      <!-- loading -->
      <template v-slot:loading>
        <q-inner-loading showing><img src="../assets/loading.gif" /></q-inner-loading>
      </template>
      <!-- no-data -->
      <template v-slot:no-data>
        <div class="full-width flex flex-center">暂无数据</div>
      </template>
      <!-- handle -->
      <template v-slot:body-cell-handle="props">
        <q-td :props="props">
          <slot name="handle" :props="props" />
        </q-td>
      </template>
    </q-table>
    <!-- skeleton -->
    <q-markup-table v-else :style="{ height }" bordered flat>
      <thead>
        <tr>
          <th v-for="th in 4" :key="th">
            <q-skeleton animation="blink" type="text" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tr in 10" :key="tr">
          <td v-for="td in 4" :key="td">
            <q-skeleton animation="blink" type="text" :width="`${Math.random() * 100 + 10}px`" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script>
import { dom } from 'quasar';
export default {
  name: 'iot-table',
  props: {
    name: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => [{ label: 'ID', name: 'id', field: 'id', align: 'left' }]
    },
    visibleColumns: {
      type: Array,
      default: undefined
    },
    pagination: {
      type: Object,
      default: () => {}
    },
    selection: {
      type: String,
      default: 'none'
    },
    selected: {
      type: Array,
      default: () => []
    },
    sticky: {
      type: Boolean,
      default: false
    },
    rowKey: {
      type: String,
      default: 'id'
    }
  },
  data() {
    return {
      pagination_: {},
      selection_: 'none',
      selected_: [],
      height: 0,
      width: 0,
      badge: [],
      event: []
    };
  },
  watch: {
    'pagination': {
      deep: true,
      handler(n) {
        this.pagination_ = n;
      }
    },
    'selected': {
      deep: true,
      handler(n) {
        this.selected_ = n;
      }
    },
    '$store.state.expand'() {
      this.resetHeight();
    },
    '$store.state.collapsed'() {
      this.resetWidth();
    },
    '$store.state.batch.buttonVisible'(n) {
      this.selection_ = n && this.$store.getters['batch/name'] === this.name ? 'multiple' : 'none';
      this.selected_ = [];
    }
  },
  mounted() {
    this.selection_ = this.selection;
    setTimeout(() => {
      this.height = `${dom.height(this.$refs.table)}px`;
      this.width = `${dom.width(this.$refs.table)}px`;
      this.badge = this.columns.filter(e => e.badge).map(e => `body-cell-${e.name}`);
      this.event = this.columns.filter(e => e.event).map(e => `body-cell-${e.name}`);
    }, 1);
  },
  methods: {
    onRequest(props) {
      this.$emit('request', props.pagination);
    },
    onSelected(selected) {
      if (this.$store.getters['batch/buttonVisible']) {
        this.selected_ = selected.filter(e => this.$store.getters['batch/filter'](e));
        this.$store.commit('batch/selected', this.selected_);
      }
      this.$emit('selected', selected);
    },
    resetHeight() {
      this.height = 0;
      this.$nextTick(() => (this.height = `${dom.height(this.$refs.table)}px`));
    },
    resetWidth() {
      this.width = 0;
      setTimeout(() => (this.width = `${dom.width(this.$refs.table)}px`), 200);
    }
  }
};
</script>

<style src="./iot-table.scss" lang="scss" scoped />
