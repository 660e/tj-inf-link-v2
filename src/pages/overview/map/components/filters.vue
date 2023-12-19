<template>
  <div class="glassy rounded-borders shadow-3 fixed absolute flex">
    <div class="col q-gutter-y-md q-pa-md flex column">
      <q-btn-toggle
        v-model="type"
        @input="input"
        :options="[
          { label: '标准设备', value: 1 },
          { label: '感知对象', value: 2 }
        ]"
        spread
      />
      <q-input
        v-model="filters.name"
        @input="input"
        :label="type === 1 ? '设备名称' : '感知对象名称'"
        clear-icon="close"
        debounce="1000"
        clearable
        dense
        outlined
      />
      <template v-if="type === 1">
        <q-select
          v-model="filters.onlineStatus"
          :options="onlineStatusOptions"
          @input="input"
          label="是否在线"
          clear-icon="close"
          clearable
          dense
          emit-value
          map-options
          options-dense
          outlined
        />
        <q-field label="设备分组" dense disabled outlined />
        <q-select
          v-model="filters.nodeType"
          :options="nodeTypeOptions"
          @input="input"
          label="节点类型"
          clear-icon="close"
          clearable
          dense
          emit-value
          map-options
          options-dense
          outlined
        />
        <q-select
          v-model="filters.useStatus"
          :options="useStatusOptions"
          @input="input"
          label="是否启用"
          clear-icon="close"
          clearable
          dense
          emit-value
          map-options
          options-dense
          outlined
        />
        <q-select
          v-model="filters.agreementType"
          :options="agreementTypeOptions"
          @input="input"
          label="协议类型"
          clear-icon="close"
          clearable
          dense
          emit-value
          map-options
          options-dense
          outlined
        />
      </template>
    </div>
  </div>
</template>

<script>
import { extendApi } from '@/api/tdf-service-sys/extend.js';
export default {
  data() {
    return {
      type: 1,
      filters: {
        name: null,
        onlineStatus: null,
        nodeType: null,
        useStatus: null,
        agreementType: null
      },
      onlineStatusOptions: [],
      nodeTypeOptions: [],
      useStatusOptions: [],
      agreementTypeOptions: []
    };
  },
  mounted() {
    extendApi.getDateItemBycodes(['onlineStatus', 'nodeType', 'state', 'agreementType']).then(response => {
      this.onlineStatusOptions = response.onlineStatus;
      this.nodeTypeOptions = response.nodeType;
      this.useStatusOptions = response.state;
      this.agreementTypeOptions = response.agreementType;
      this.input();
    });
  },
  methods: {
    input() {
      switch (this.type) {
        case 1:
          this.$emit('search', { filters: this.filters, type: this.type });
          break;
        case 2:
          this.$emit('search', { filters: { name: this.filters.name || '' }, type: this.type });
          break;
      }
    }
  }
};
</script>

<style src="../index.scss" lang="scss" scoped />
