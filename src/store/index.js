import { createStore } from 'vuex';
import api from "@/services/api";

export default createStore({
  state: {
    isLoading: false,
    user: {
      loggedIn: !!localStorage.getItem('auth_token'),
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
    },
  },
  mutations: {
    setLoading(state, value) {
      state.isLoading = value;
    },
    setUser(state, user) {
      console.log('Setting user:', user);
      state.user = {
        loggedIn: true,
        name: user.name,
        email: user.email,
      };
      localStorage.setItem('auth_token', user.token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
    },
    logout(state) {
      state.user = { loggedIn: false, name: '', email: '' };
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    },
  },
  actions: {
    startLoading({ commit }) {
      commit('setLoading', true);
    },
    stopLoading({ commit }) {
      commit('setLoading', false);
    },
    async login({ commit }, userCredentials) {
      try {
        const response = await api.post('/login', userCredentials);
        console.log('Login response:', response.data);

        if (!response.data || !response.data.token) {
          throw new Error('Неверная структура ответа сервера');
        }

        // Можем временно использовать email как имя
        commit('setUser', {
          token: response.data.token,
          name: userCredentials.email, // временно
          email: userCredentials.email
        });

      } catch (error) {
        console.error('Ошибка авторизации:', error);
        throw error; // пробросим, чтобы в компоненте поймать
      }
    },
    async logout({ commit }) {
      try {
        await api.post('/logout'); // Уведомляем сервер
        console.log('Сервер успешно завершил сессию');
      } catch (error) {
        console.warn('Ошибка при выходе с сервера (возможно, токен уже недействителен):', error);
      } finally {
        commit('logout'); // Локально выходим в любом случае
      }
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
    isLoggedIn: (state) => state.user.loggedIn,
    userName: (state) => state.user.name,
  },
});
