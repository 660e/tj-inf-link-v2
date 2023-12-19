<template>
  <div class="iot-title">
    <h5>{{ title }}</h5>
    <template v-for="(b, i) in buttons">
      <div v-if="b.show === undefined ? true : b.show" :key="i" :class="[`text-${b.color || 'primary'}`]" @click="handle(b.command)">
        <q-icon v-if="b.icon" :name="b.icon" />
        <span>{{ b.label }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'iot-title',
  props: {
    title: {
      type: String,
      default: '-'
    },
    buttons: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handle(command) {
      this.$emit('handle', { command });
    }
  }
};
</script>

<style lang="scss" scoped>
$space: 16px;
.iot-title {
  display: flex;
  align-items: center;
  & > h5 {
    font-size: 18px;
    line-height: 1;
  }
  & > div {
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    margin-left: $space;
    display: flex;
    align-items: center;
    .q-icon {
      margin-right: 3px;
    }
  }
}
</style>
