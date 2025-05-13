import { createStore } from 'vuex';

export default createStore({
  state: {
    isLoading: false, // Состояние для загрузки
    user: {
      loggedIn: false, // Статус авторизации
      name: '',         // Имя пользователя
      email: '',        // Email пользователя
    },
  },
  mutations: {
    setLoading(state, value) {
      state.isLoading = value; // Изменяет состояние загрузки
    },
    setUser(state, user) {
      state.user = user; // Обновляет данные пользователя
    },
  },
  actions: {
    startLoading({ commit }) {
      commit('setLoading', true);
    },
    stopLoading({ commit }) {
      commit('setLoading', false);
    },
    // Действие для загрузки данных пользователя
    setUser({ commit }, user) {
      commit('setUser', user);
    },
    // Действие для авторизации пользователя
    login({ commit }, userCredentials) {
      // Здесь может быть логика для авторизации через API
      // Пример:
      // const response = await api.login(userCredentials);
      // commit('setUser', response.data);
      commit('setUser', { loggedIn: true, name: userCredentials.name, email: userCredentials.email });
    },
    // Действие для выхода
    logout({ commit }) {
      commit('setUser', { loggedIn: false, name: '', email: '' });
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
    isLoggedIn: (state) => state.user.loggedIn, // Геттер для авторизации
    userName: (state) => state.user.name,       // Геттер для имени пользователя
  },
});
