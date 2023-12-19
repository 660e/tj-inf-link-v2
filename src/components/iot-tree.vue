<template>
  <div class="iot-tree" ref="tree">
    <q-input v-if="filter" v-model="f" label="过滤" dense outlined>
      <template v-slot:append>
        <q-icon v-if="f !== ''" @click="f = ''" class="cursor-pointer" name="clear" />
      </template>
    </q-input>
    <q-tree
      :nodes="nodes"
      :label-key="labelKey"
      :children-key="childrenKey"
      :filter="f"
      :expanded.sync="e"
      :selected.sync="s"
      :style="{ height }"
      @update:selected="selected"
      node-key="id"
      no-nodes-label="暂无数据"
      no-results-label="暂无结果"
      selected-color="primary"
      accordion
    >
      <template v-slot:default-header="prop">
        <div class="col flex justify-between items-center">
          <div>{{ prop.node[labelKey] }}</div>
          <div class="flex" v-if="buttons.length && prop.node.id === s">
            <q-icon
              v-for="(b, i) in buttons"
              v-show="b.show === undefined ? true : isFunction(b.show) ? b.show(prop.node) : b.show"
              :key="i"
              :name="b.icon"
              @click="handle(b.command, prop.node)"
              class="cursor-pointer"
              size="16px"
            />
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import { isFunction } from '@/utils/data.js';
import { dom } from 'quasar';

export default {
  name: 'iot-tree',
  props: {
    filter: {
      type: Boolean,
      default: false
    },
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
    },
    defaultExpanded: {
      type: Array,
      default: () => []
    },
    defaultSelected: {
      type: [String, Number],
      default: ''
    },
    buttons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      f: '',
      e: [],
      s: '',
      o: '',
      height: 0
    };
  },
  watch: {
    defaultExpanded: {
      deep: true,
      handler(n) {
        this.e = n;
      }
    },
    defaultSelected(n) {
      this.s = n;
      this.o = n;
    }
  },
  mounted() {
    this.e = this.defaultExpanded;
    this.s = this.defaultSelected;
    this.o = this.defaultSelected;
    this.height = `${dom.height(this.$refs.tree) - (this.filter ? 56 : 0)}px`;
  },
  methods: {
    selected(selected) {
      if (selected !== null) {
        this.o = selected;
        this.$emit('selected', { selected, expanded: this.e });
      } else {
        this.s = this.o;
      }
    },
    handle(command, node) {
      this.$emit('handle', { command, node });
    },
    isFunction(source) {
      return isFunction(source);
    }
  }
};
</script>

<style lang="scss" scoped>
$space: 16px;
.iot-tree {
  margin: $space 0 $space $space;
  width: 200px;
  & > .q-field {
    margin-bottom: $space;
  }
  .q-tree {
    overflow-y: auto;
  }
}
</style>
