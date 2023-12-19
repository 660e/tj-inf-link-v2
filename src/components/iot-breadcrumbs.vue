<template>
  <div class="flex q-mt-md q-mx-md">
    <div v-for="(b, i) in breadcrumbs" :key="i">
      <span :class="[b.name ? 'text-primary cursor-pointer' : 'text-grey-6']" @click="to(b)">{{ b.label }}</span>
      <span v-if="i !== breadcrumbs.length - 1" class="q-px-sm text-grey-6">/</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    breadcrumbs: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    to(b) {
      if (b.name) {
        this.$router.push(b);
      }
    }
  }
};
</script>
