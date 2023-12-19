const state = {
  buttonVisible: false,
  dialogVisible: false,
  name: '',
  filter: () => {},
  selected: []
};

const mutations = {
  buttonVisible: (state, n) => (state.buttonVisible = n),
  dialogVisible: (state, n) => (state.dialogVisible = n),
  name: (state, n) => (state.name = n),
  filter: (state, n) => (state.filter = n),
  selected: (state, n) => (state.selected = n)
};

const actions = {
  cancel: ({ commit }) => {
    commit('buttonVisible', false);
    commit('dialogVisible', false);
    commit('name', '');
    commit('filter', () => {});
    commit('selected', []);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
