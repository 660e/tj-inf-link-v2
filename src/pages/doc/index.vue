<template>
  <div class="col flex column relative-position">
    <div class="mask">
      <div>
        <q-select
          v-model="src"
          :options="options"
          class="bg-white"
          style="border-radius: 4px"
          dense
          emit-value
          hide-bottom-space
          map-options
          options-dense
          outlined
        />
      </div>
      <div></div>
    </div>
    <iframe :src="`${src}/doc.html`" class="col" frameborder="0"></iframe>
  </div>
</template>

<script>
import { systemApi } from '@/api/tdf-service-sys/system.js';

export default {
  data() {
    return {
      options: [],
      src: ''
    };
  },
  mounted() {
    systemApi.getEurekaServices().then(response => {
      if (response.data && response.data.length) {
        this.options = response.data.map(e => {
          return {
            label: Object.keys(e)[0],
            value: Object.values(e)[0]
          };
        });
        this.src = this.options[0].value;
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.mask {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  & > div:first-child {
    background-color: #1e282c;
    box-sizing: border-box;
    width: 320px;
    padding: 10px 10px 0;
  }
  & > div:last-child {
    background-color: #fff;
    width: 68px;
    height: 56px;
  }
}
</style>
