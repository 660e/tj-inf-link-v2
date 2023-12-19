<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import zh_hans from 'quasar/lang/zh-hans.js';
import en_us from 'quasar/lang/en-us.js';

export default {
  data() {
    return {
      dark: this.$q.localStorage.getItem('dark') || false,
      lang: this.$q.localStorage.getItem('lang') || 'zh-hans',
      dnd: this.$q.localStorage.getItem('dnd') || false
    };
  },
  mounted() {
    // dark
    this.$q.dark.set(this.dark);
    this.$q.localStorage.set('dark', this.dark);
    // lang
    switch (this.lang) {
      case 'zh-hans':
        this.$q.lang.set(zh_hans);
        break;
      case 'en-us':
        this.$q.lang.set(en_us);
        break;
    }
    this.$i18n.locale = this.lang;
    this.$q.localStorage.set('lang', this.lang);
    // dnd
    this.$q.localStorage.set('dnd', this.dnd);
  }
};
</script>
