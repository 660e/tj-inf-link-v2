<template>
  <div class="iot-searchbar flex q-mx-md q-mt-md">
    <div
      class="iot-searchbar__fields grid gap-md"
      :class="{ col: c <= fields.length }"
      :style="{
        gridTemplateColumns: Array(Math.min(c, fields.length)).fill('minmax(0, 1fr)').join(' ')
      }"
    >
      <template v-for="f in fields.slice(0, e ? fields.length : c)">
        <!-- input -->
        <q-input
          v-if="f.type === 'input'"
          v-model="f.value"
          :key="f.key"
          :label="f.label"
          :clearable="f.clearable === undefined ? true : f.clearable"
          :style="{ width: c <= fields.length ? 'auto' : '300px' }"
          @keypress.enter="search"
          clear-icon="close"
          dense
          outlined
        />
        <!-- select -->
        <q-select
          v-if="f.type === 'select'"
          v-model="f.value"
          :key="f.key"
          :label="f.label"
          :options="f.options"
          :option-label="f.props.label"
          :option-value="f.props.value"
          :clearable="f.clearable === undefined ? true : f.clearable"
          :style="{ width: c <= fields.length ? 'auto' : '300px' }"
          :disable="f.disable"
          @input="f.input"
          clear-icon="close"
          dense
          emit-value
          map-options
          options-dense
          outlined
        />
        <!-- cascader -->
        <q-field
          v-if="f.type === 'cascader'"
          v-model="f.props.name"
          :key="f.key"
          :label="f.label"
          :clearable="f.clearable === undefined ? true : f.clearable"
          :style="{ width: c <= fields.length ? 'auto' : '300px' }"
          @clear="f.value = ''"
          class="cursor-pointer"
          clear-icon="close"
          dense
          outlined
        >
          <q-popup-proxy>
            <q-tree
              :nodes="f.nodes"
              :label-key="f.props.label"
              :children-key="f.props.children"
              :selected.sync="f.value"
              @update:selected="selected(f)"
              style="min-width: 200px"
              class="q-ma-sm"
              no-nodes-label="暂无数据"
              node-key="id"
              ref="tree"
              selected-color="primary"
              accordion
              no-connectors
            />
          </q-popup-proxy>
          <template v-slot:prepend>
            <q-icon class="cursor-pointer" name="account_tree" />
          </template>
          <template v-slot:control>
            <div>{{ f.props.name }}</div>
          </template>
        </q-field>
        <!-- date-range && date-time-range -->
        <q-field
          v-if="f.type === 'date-range' || f.type === 'date-time-range'"
          v-model="f.value"
          :key="f.key"
          :label="f.label"
          :style="{ width: c <= fields.length ? 'auto' : '300px' }"
          class="cursor-pointer"
          dense
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="event" />
          </template>
          <q-popup-proxy>
            <div class="row">
              <q-date v-model="f.value[0]" :mask="d" class="no-shadow col" style="max-width: 300px" minimal />
              <q-date v-model="f.value[1]" :mask="d" class="no-shadow col" style="max-width: 300px" minimal />
            </div>
            <div class="row q-px-md q-pb-md">
              <div v-if="f.type === 'date-time-range'" class="col row items-center">
                <q-input v-model="f.value[2]" type="time" class="col" dense outlined />
                <span class="q-px-md">~</span>
                <q-input v-model="f.value[3]" type="time" class="col" dense outlined />
              </div>
              <div class="col flex justify-end" style="height: 40px">
                <q-btn @click="confirm(f)" label="确定" color="primary" v-close-popup />
              </div>
            </div>
          </q-popup-proxy>
          <template v-slot:control v-if="f.value[0] && f.value[1]">
            <div v-if="f.type === 'date-range'">
              <span>{{ `${f.value[0]} 至 ${f.value[1]}` }}</span>
            </div>
            <div v-if="f.type === 'date-time-range'">
              <span style="font-size: 11px">{{ `${f.value[0]} ${f.value[2] || '00:00'} 至 ${f.value[1]} ${f.value[3] || '23:59'}` }}</span>
            </div>
          </template>
        </q-field>
        <!--  -->
      </template>
    </div>
    <div class="flex q-gutter-x-md q-pl-md" style="height: 40px">
      <q-btn v-if="fields.length > c" @click="expand" icon="more_vert" dense flat />
      <q-btn @click="search" label="查询" color="primary" />
      <q-btn @click="reset" label="重置" v-if="!hideReset" />
    </div>
  </div>
</template>

<script>
import { flattenTree } from '@/utils/data.js';
import { dom } from 'quasar';
import dayjs from 'dayjs';

export default {
  name: 'iot-searchbar',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    hideReset: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      c: Math.floor((dom.width(window) - 400) / 300),
      n: dayjs(),
      d: 'YYYY-MM-DD',
      m: 'YYYY-MM-DD HH:mm:ss',
      e: this.$store.getters.expand
    };
  },
  mounted() {
    setTimeout(() => {
      this.fields.forEach(f => {
        if (f.value) {
          switch (f.type) {
            case 'cascader':
              f.props.name = flattenTree(f.nodes, f.props.children).find(e => e.id === f.value)[f.props.label];
              break;
            case 'date-range':
              if (f.value[0] && f.value[1]) {
                f.value = [dayjs(f.value[0]).format(this.d), dayjs(f.value[1]).format(this.d)];
              } else {
                f.value = [];
              }
              break;
            case 'date-time-range':
              if (f.value[0] && f.value[1]) {
                f.value = [
                  dayjs(f.value[0]).format(this.d),
                  dayjs(f.value[1]).format(this.d),
                  dayjs(f.value[0]).format(this.m).substring(11, 16),
                  dayjs(f.value[1]).format(this.m).substring(11, 16)
                ];
              } else {
                f.value = [];
              }
              break;
          }
        }
      });
    }, 1);
  },
  methods: {
    selected(f) {
      f.props.name = f.value ? this.$refs.tree[0].getNodeByKey(f.value)[f.props.label] : '';
    },
    confirm(f) {
      switch (f.type) {
        case 'date-range':
        case 'date-time-range':
          if (!f.value[0] || !f.value[1]) {
            f.value = [];
          }
          break;
      }
    },
    search() {
      const filters = {};
      this.fields.forEach(f => {
        if (f.value || f.value === 0) {
          switch (f.type) {
            case 'date-range': {
              if (f.value[0] && f.value[1]) {
                const s = dayjs(f.value[0], this.d).valueOf();
                const e = dayjs(f.value[1], this.d).valueOf();
                filters[f.props.start || 'start'] = Math.min(s, e);
                filters[f.props.end || 'end'] = Math.max(s, e);
              }
              break;
            }
            case 'date-time-range': {
              if (f.value[0] && f.value[1]) {
                const s = dayjs(`${f.value[0]} ${f.value[2] || '00:00'}`, this.m).valueOf();
                const e = dayjs(`${f.value[1]} ${f.value[3] || '23:59'}`, this.m).valueOf();
                filters[f.props.start || 'start'] = Math.min(s, e);
                filters[f.props.end || 'end'] = Math.max(s, e);
              }
              break;
            }
            default:
              filters[f.key] = f.value;
          }
        }
      });
      this.$emit('search', filters);
    },
    reset() {
      this.fields.forEach(f => {
        switch (f.type) {
          case 'cascader':
            f.props.name = '';
            f.value = null;
            break;
          case 'date-range':
          case 'date-time-range':
            f.value = [];
            break;
          default:
            f.value = null;
        }
      });
      this.search();
    },
    expand() {
      this.$store.commit('expand', !this.e);
    }
  },
  watch: {
    '$store.state.expand'(n) {
      this.e = n;
    }
  }
};
</script>
