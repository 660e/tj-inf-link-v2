import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import batchModules from './modules/batch.js';

import getters from './getters.js';

export default new Vuex.Store({
  strict: process.env.DEBUGGING,
  modules: {
    batch: batchModules
  },
  state: {
    collapsed: true,
    help: false,
    expand: false,
    loading: false
  },
  mutations: {
    collapsed: (state, n) => (state.collapsed = n),
    help: (state, n) => (state.help = n),
    expand: (state, n) => (state.expand = n),
    loading: (state, n) => (state.loading = n)
  },
  getters
});
