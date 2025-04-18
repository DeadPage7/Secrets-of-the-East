import { createStore } from 'vuex';

export default createStore({
  state: {
    isLoading: false, // Состояние для загрузки
  },
  mutations: {
    setLoading(state, value) {
      state.isLoading = value; // Изменяет состояние загрузки
    },
  },
  actions: {
    startLoading({ commit }) {
      commit('setLoading', true);
    },
    stopLoading({ commit }) {
      commit('setLoading', false);
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
  },
});
