import { createStore } from 'vuex';
import api from "@/services/api";

export default createStore({
  state: {
    selectedPoint: JSON.parse(localStorage.getItem('selectedPoint')) || null, // выбранный пункт выдачи (загружается из localStorage)
    showDeliveryModal: false,     // видимость модального окна
    isLoading: false,             // индикатор загрузки
    user: {
      loggedIn: !!localStorage.getItem('auth_token'),
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      role: Number(localStorage.getItem('userRole')) || null,
    },
  },
  mutations: {
    setLoading(state, value) {
      state.isLoading = value;
    },
    setSelectedPoint(state, point) {
      state.selectedPoint = point;   // сохраняем выбранный пункт
      localStorage.setItem('selectedPoint', JSON.stringify(point)); // сохраняем в localStorage
    },
    setShowDeliveryModal(state, value) {
      state.showDeliveryModal = value;
    },
    setUser(state, user) {
      state.user = {
        loggedIn: true,
        name: user.name,
        email: user.email,
        role: Number(user.role),
      };
      localStorage.setItem('auth_token', user.token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
    },
    logout(state) {
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
        if (!response.data || !response.data.token) {
          throw new Error('Неверная структура ответа сервера');
        }
        commit('setUser', {
          token: response.data.token,
          name: response.data.user.name || userCredentials.email,
          email: response.data.user.email || userCredentials.email,
          role: response.data.user.role_id,
        });
      } catch (error) {
        throw error;
      }
    },
    async logout({ commit }) {
      try {
        await api.post('/logout');
      } catch (error) {
        // игнорируем ошибку выхода с сервера
      } finally {
        commit('logout');
      }
    },
    setSelectedPoint({ commit }, point) {
      commit('setSelectedPoint', point); // действие для выбора пункта
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
    isLoggedIn: (state) => state.user.loggedIn,
    userName: (state) => state.user.name,
    userRole: (state) => state.user.role,
    isAdmin: (state) => state.user.role === 1,
    isManager: (state) => state.user.role === 2,
    isUser: (state) => state.user.role === 3,
    selectedPoint: (state) => state.selectedPoint,   // геттер выбранного пункта
    showDeliveryModal: (state) => state.showDeliveryModal,
  },
});
