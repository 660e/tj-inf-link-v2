<template>
  <div class="iot-form-item" :class="{ 'iot-form-item--vertical': vertical }">
    <h6 v-if="label" :style="{ width: vertical ? '100%' : `${width}px` }">
      <em v-if="validator.$params.required || validator.$params.requiredIf">*</em>
      <span>{{ label }}</span>
    </h6>
    <!-- field -->
    <span v-if="type === 'field'">{{ v }}</span>
    <!-- text || textarea -->
    <q-input
      v-if="type === 'text' || type === 'textarea'"
      v-model="v"
      :type="type"
      :error="validator.$error"
      :error-message="validator.required || validator.required === undefined ? '格式错误' : '必填项'"
      :hint="hint"
      :counter="!!maxlength"
      :maxlength="maxlength"
      :disable="disable"
      :readonly="readonly"
      @blur="input"
      @input="input"
      dense
      hide-bottom-space
      outlined
    >
      <template v-slot:after>
        <slot name="after" />
      </template>
    </q-input>
    <!-- number -->
    <q-input
      v-if="type === 'number'"
      v-model.number="v"
      type="number"
      :error="validator.$error"
      :error-message="validator.required || validator.required === undefined ? '格式错误' : '必填项'"
      :hint="hint"
      :disable="disable"
      :readonly="readonly"
      :min="min"
      :max="max"
      @blur="input"
      @input="input"
      dense
      hide-bottom-space
      outlined
    />
    <!-- select -->
    <q-select
      v-if="type === 'select'"
      v-model="v"
      :options="o"
      :option-label="optionLabel"
      :option-value="optionValue"
      :clearable="clearable && !validator.required"
      :error="validator.$error"
      :hint="hint"
      :disable="disable"
      :readonly="readonly"
      :use-input="filter"
      @input="input"
      @clear="clear"
      @popup-hide="popupHide"
      @filter="filterFn"
      clear-icon="close"
      error-message="必填项"
      dense
      emit-value
      hide-bottom-space
      map-options
      options-dense
      outlined
    >
      <template v-slot:after>
        <slot name="after" />
      </template>
      <template v-slot:hint>
        <slot name="hint" />
      </template>
    </q-select>
    <!-- toggle -->
    <q-toggle v-if="type === 'toggle'" v-model="v" @input="input" :true-value="trueValue" :false-value="falseValue" :disable="disable" />
    <!-- cascader -->
    <q-field
      v-if="type === 'cascader'"
      v-model="n"
      :clearable="clearable && !validator.required"
      :hint="hint"
      @clear="selected(null)"
      class="cursor-pointer"
      clear-icon="close"
      dense
      hide-bottom-space
      outlined
    >
      <q-popup-proxy v-model="p">
        <q-tree
          :nodes="nodes"
          :label-key="labelKey"
          :children-key="childrenKey"
          :selected.sync="v"
          @update:selected="selected"
          style="min-width: 300px"
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
        <div>{{ n }}</div>
      </template>
    </q-field>
    <!-- radio -->
    <q-btn-toggle v-if="type === 'radio'" v-model="v" :options="o" :disable="disable" :readonly="readonly" @input="input" no-caps />
    <!-- slot -->
    <slot />
  </div>
</template>

<script>
import { flattenTree } from '@/utils/data.js';
export default {
  name: 'iot-form-item',
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
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
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '80'
    },
    disable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    // --- text || textarea
    hint: {
      type: String,
      default: ''
    },
    maxlength: {
      type: String,
      default: ''
    },
    // --- number
    min: {
      type: [String, Number],
      default: -Infinity
    },
    max: {
      type: [String, Number],
      default: Infinity
    },
    // --- select
    options: {
      type: Array,
      default: () => []
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Boolean,
      default: false
    },
    // --- toggle
    trueValue: {
      type: [String, Number, Boolean],
      default: true
    },
    falseValue: {
      type: [String, Number, Boolean],
      default: false
    },
    // --- cascader
    nodes: {
      type: Array,
      default: () => []
    },
    labelKey: {
      type: String,
      default: 'name'
    },
    childrenKey: {
      type: String,
      default: 'children'
    }
  },
  data() {
    return {
      v: null,
      o: [],
      p: false,
      n: ''
    };
  },
  watch: {
    value: {
      deep: true,
      handler(n) {
        this.v = n;
      }
    }
  },
  mounted() {
    this.v = this.value;
    this.o = this.options;
    if (this.v) {
      switch (this.type) {
        case 'cascader':
          this.n = flattenTree(this.nodes).find(e => e.id === this.v)[this.labelKey];
          break;
      }
    }
  },
  methods: {
    input() {
      this.touch();
      this.$emit('input', this.v);
      this.$emit('update:value', this.v === null ? '' : this.v); // 后台不接收null
    },
    clear() {
      this.$emit('clear');
    },
    popupHide() {
      this.$emit('popup-hide');
    },
    filterFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.o = this.options.filter(v => v[this.optionLabel].toLowerCase().indexOf(needle) > -1);
      });
    },
    touch() {
      this.validator.$touch();
    },
    reset() {
      this.validator.$reset();
    },
    selected(selected) {
      if (selected) {
        this.n = this.$refs.tree.getNodeByKey(selected)[this.labelKey];
        this.p = false;
      } else {
        this.n = '';
        this.v = selected;
      }
      this.input();
    }
  }
};
</script>

<style src="./iot-form-item.scss" lang="scss" scoped />
