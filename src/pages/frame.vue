<template>
  <iframe :src="path" frameborder="0" class="col"></iframe>
</template>

<script>
export default {
  data() {
    return {
      path: ''
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      this.path = this.$route.query.path;
    }
  },
  watch: {
    $route: {
      deep: true,
      handler() {
        this.load();
      }
    }
  }
};
</script>
