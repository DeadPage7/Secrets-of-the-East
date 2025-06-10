import { createStore } from 'vuex';
import api from "@/services/api";

export default createStore({
  state: {
    selectedPoint: null,
    showDeliveryModal: false,
    isLoading: false, // индикатор загрузки
    user: {
      loggedIn: !!localStorage.getItem('auth_token'), // проверяем, есть ли токен в локальном хранилище
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      role: Number(localStorage.getItem('userRole')) || null, // роль пользователя, приводим к числу
    },
  },
  mutations: {
    setLoading(state, value) {
      state.isLoading = value;
    },
    setSelectedPoint(state, point) {
      state.selectedPoint = point;
    },
    setShowDeliveryModal(state, value) {
      state.showDeliveryModal = value;
    },
    setUser(state, user) {
      // сохраняем данные пользователя и токен
      state.user = {
        loggedIn: true,
        name: user.name,
        email: user.email,
        role: Number(user.role), // роль обязательно числом
      };
      localStorage.setItem('auth_token', user.token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role); // сохраняем роль в localStorage
    },
    logout(state) {
      // очистка данных при выходе
      state.user = { loggedIn: false, name: '', email: '', role: null };
      localStorage.removeItem('auth_token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
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

        commit('setUser', {
          token: response.data.token,
          name: response.data.user.name || userCredentials.email,
          email: response.data.user.email || userCredentials.email,
          role: response.data.user.role_id,  // <-- вот тут важно
        });
      } catch (error) {
        console.error('Ошибка авторизации:', error);
        throw error;
      }
    },
    async logout({ commit }) {
      try {
        await api.post('/logout'); // уведомляем сервер о выходе
        console.log('Сервер успешно завершил сессию');
      } catch (error) {
        console.warn('Ошибка при выходе с сервера (возможно, токен уже недействителен):', error);
      } finally {
        commit('logout'); // локально очищаем данные в любом случае
      }
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
    isLoggedIn: (state) => state.user.loggedIn,
    userName: (state) => state.user.name,
    userRole: (state) => state.user.role,
    isAdmin: (state) => state.user.role === 1,     // роль 1 — админ
    isManager: (state) => state.user.role === 2,   // роль 2 — менеджер
    isUser: (state) => state.user.role === 3,      // роль 3 — обычный пользователь
  },
});
