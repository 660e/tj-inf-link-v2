<template>
  <div class="iot-table-simple" :style="{ width }">
    <h6 v-if="title">{{ title }}</h6>
    <q-table
      :loading="$store.getters.loading"
      :data="data"
      :columns="columns"
      :pagination="{ rowsPerPage: 0 }"
      :style="{ maxHeight }"
      bordered
      dense
      flat
      hide-pagination
    >
      <template v-slot:body-cell="props">
        <!-- ellipsis -->
        <td
          v-if="props.col.classes && !isFunction(props.col.classes) && props.col.classes.indexOf('ellipsis') > -1"
          :class="props.col.__thClass"
          :style="props.col.style"
          style="padding-left: 0; padding-right: 0"
        >
          <div :class="props.col.classes" :style="props.col.style">
            <q-tooltip>{{ props.value }}</q-tooltip>
            <span>{{ props.value }}</span>
          </div>
        </td>
        <!-- icon -->
        <td
          v-else-if="
            props.col.icon &&
            ((props.col.icon.after && props.col.icon.after.show(props.row)) || (props.col.icon.before && props.col.icon.before.show(props.row)))
          "
          :class="[props.col.__thClass, isFunction(props.col.classes) && props.col.classes(props.row)]"
          :style="props.col.style"
        >
          <q-icon v-if="props.col.icon.before" :name="props.col.icon.before.name" :color="props.col.icon.before.color" />
          {{ props.value }}
          <q-icon v-if="props.col.icon.after" :name="props.col.icon.after.name" :color="props.col.icon.after.color" />
        </td>
        <td v-else :class="[props.col.__thClass, isFunction(props.col.classes) && props.col.classes(props.row)]" :style="props.col.style">
          {{ props.value }}
        </td>
      </template>
      <template v-slot:no-data>
        <div class="full-width flex flex-center">暂无数据</div>
      </template>
      <template v-slot:body-cell-handle="props">
        <q-td :props="props">
          <slot name="handle" :props="props" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { isFunction } from '@/utils/data.js';
export default {
  name: 'iot-table-simple',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => [{ label: 'ID', name: 'id', field: 'id', align: 'left' }]
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: 'auto'
    },
    maxHeight: {
      type: String,
      default: 'none'
    }
  },
  methods: {
    isFunction(source) {
      return isFunction(source);
    }
  }
};
</script>

<style lang="scss" scoped>
$space: 16px;
.iot-table-simple {
  & > h6 {
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
    padding-bottom: 6px;
  }
  ::v-deep .q-table {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #fff;
    }
    thead tr th {
      position: sticky;
      z-index: 1;
    }
    thead tr:first-child th {
      top: 0;
    }
    div.ellipsis {
      padding: 0 $space;
    }
  }
  .q-table--dark ::v-deep .q-table {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #1d1d1d;
    }
  }
}
</style>
