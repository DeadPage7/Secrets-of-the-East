<template>
  <header class="header">
    <div class="nav-bar">
      <div class="nav-left">
        <a href="#" class="store-name" @click.prevent="goHome">Тайны Востока</a>
      </div>

      <div class="nav-center">
        <a href="#" class="nav-link" @click.prevent="showDeliveryPoints">Пункт выдачи</a>
        <a href="#" class="nav-link" @click.prevent="goToCart">Корзина</a>
        <a href="#" class="nav-link" @click.prevent="handleProfileClick">Профиль</a>
        <!-- Кнопка "Заказы" теперь вызывает метод openOrdersModal -->
        <a href="#" class="nav-link" @click.prevent="openOrdersModal">Заказы</a>
      </div>

      <div class="nav-right">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder="Поиск..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
        </div>

        <button
          v-if="isAdmin"
          class="secret-button"
          @click="handleSecretClick"
          title="Инструменты"
        >
          Инструменты
        </button>

        <button
          v-if="isAuthenticated"
          class="logout-button"
          @click="handleLogout"
        >
          Выйти
        </button>
      </div>
    </div>

    <!-- Модальные окна -->
    <RegisterModal
      v-if="showRegister"
      @close="showRegister = false"
      @switchToLogin="switchToLogin"
    />
    <LoginModal
      v-if="showLogin"
      @close="showLogin = false"
      @switchToRegister="switchToRegister"
      @loginSuccess="showProfileModal"
    />
    <ProfileModal
      v-if="showProfile"
      @close="showProfile = false"
      @logout="handleLogout"
    />

    <PointsModal
      v-show="store.state.showDeliveryModal"
      @close="store.commit('setShowDeliveryModal', false)"
      @select="handlePointSelect"
    />

    <AdminPanelModal
      v-if="showAdminModal"
      @close="showAdminModal = false"
    />

    <!-- Модалка заказов с управлением видимостью через showOrdersModal -->
    <MyOrdersModal
      v-if="showOrdersModal"
      @close="showOrdersModal = false"
    />
  </header>
</template>

<script>
import RegisterModal from "../auth/RegisterModal.vue";
import LoginModal from "../auth/LoginModal.vue";
import ProfileModal from "../auth/ProfileModal.vue";
import PointsModal from "../Points/PointsModal.vue";
import AdminPanelModal from "../admin/AdminPanelModal.vue";
import MyOrdersModal from "../order/MyOrderModal.vue";

import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "MainHeader",
  components: {
    RegisterModal,
    LoginModal,
    ProfileModal,
    PointsModal,
    AdminPanelModal,
    MyOrdersModal,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    // Поисковый запрос
    const searchQuery = ref("");

    // Флаги отображения модальных окон
    const showRegister = ref(false);
    const showLogin = ref(false);
    const showProfile = ref(false);
    const showAdminModal = ref(false);

    // Флаг отображения модалки заказов
    const showOrdersModal = ref(false);

    // Обработчик поиска по нажатию Enter
    const handleSearch = () => {
      if (router.currentRoute.value.path !== "/") {
        router.push("/");
      }
      window.dispatchEvent(
        new CustomEvent("search-request", {
          detail: { query: searchQuery.value.trim() },
        })
      );
    };

    // Обработчик выбора пункта выдачи
    const handlePointSelect = (point) => {
      store.commit("setSelectedPoint", point);
      store.commit("setShowDeliveryModal", false);
    };

    // Проверка, авторизован ли пользователь
    const isAuthenticated = computed(() => store.state.user.loggedIn);

    // Роль пользователя
    const userRole = computed(() => store.state.user?.role || null);

    // Проверка, является ли пользователь админом
    const isAdmin = computed(() => {
      const role_id = Number(userRole.value);
      return role_id === 1 || role_id === 2;
    });

    // Открыть модалку выбора пункта выдачи
    const showDeliveryPoints = () => {
      store.commit("setShowDeliveryModal", true);
    };

    return {
      router,
      store,
      searchQuery,
      handleSearch,
      showRegister,
      showLogin,
      showProfile,
      showAdminModal,
      showOrdersModal,      // реактивный флаг видимости модалки заказов
      handlePointSelect,
      showDeliveryPoints,
      isAuthenticated,
      isAdmin,
    };
  },
  methods: {
    // Переименованный метод для открытия модалки заказов
    openOrdersModal() {
      this.showOrdersModal = true;
    },
    goHome() {
      this.$router.push("/");
    },
    handleSecretClick() {
      this.showAdminModal = true;
    },
    goToCart() {
      this.$router.push("/cart");
    },
    handleProfileClick() {
      if (this.store.state.user.loggedIn) {
        this.showProfile = true;
      } else {
        this.showLogin = true;
      }
    },
    switchToLogin() {
      this.showRegister = false;
      this.showLogin = true;
    },
    switchToRegister() {
      this.showLogin = false;
      this.showRegister = true;
    },
    showProfileModal() {
      this.showLogin = false;
      this.showProfile = true;
    },
    handleLogout() {
      this.store.dispatch("logout");
      this.showProfile = false;
    },
  },
};
</script>

<style scoped>
/* Ваши стили */
.secret-button {
  background-color: #c84b9e;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  margin-left: 15px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.secret-button:hover {
  background-color: #ff85c1;
  transform: scale(1.05);
}
.nav-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a2e;
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  animation: slideDown 0.5s ease-out;
}
.header {
  background-color: #0f0f1f;
  color: #ffffff;
  padding: 0;
  box-shadow: 0 4px 12px rgba(200, 75, 158, 0.4);
  position: relative;
}
.nav-left {
  position: absolute;
  left: 30px;
}
.store-name {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 1px;
  animation: fadeIn 1s ease-out;
  text-decoration: none;
  transition: color 0.3s ease, transform 0.3s ease;
}
.store-name:hover {
  color: #ff85c1;
  transform: scale(1.05);
}
.nav-center {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex: 2;
}
.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #ffffff;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
}
.nav-link:hover {
  color: #c84b9e;
  transform: scale(1.1);
}
.nav-link:after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff85c1;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}
.nav-link:hover:after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
.nav-right {
  position: absolute;
  right: 30px;
  display: flex;
  align-items: center;
}
.search-container {
  display: flex;
  align-items: center;
  background-color: #2a2a40;
  border-radius: 25px;
  padding: 5px 15px;
  border: 1px solid #444;
  animation: fadeIn 1s ease-out;
}
.search-input {
  background-color: transparent;
  color: #ffffff;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-size: 16px;
  width: 200px;
  transition: width 0.3s ease;
}
.search-input::placeholder {
  color: #ccc;
}
.search-input:focus {
  width: 250px;
}
.logout-button {
  background-color: #c84b9e;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  margin-left: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.logout-button:hover {
  background-color: #ff85c1;
  transform: scale(1.05);
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
