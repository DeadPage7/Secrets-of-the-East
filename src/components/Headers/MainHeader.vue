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
        <a href="#" class="nav-link" @click.prevent="openOrdersModal">Заказы</a>

        <button
          v-if="isAdmin"
          class="nav-link secret-button"
          @click="handleSecretClick"
          title="Инструменты"
          aria-label="Инструменты"
          type="button"
        >
          <img src="@/assets/icons/gear-white.svg" alt="Инструменты" class="icon-default" />
          <img src="@/assets/icons/gear-pink.svg" alt="Инструменты" class="icon-hover" />
        </button>
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
      </div>
    </div>

    <!-- Модальные окна -->
    <RegisterModal v-if="showRegister" @close="showRegister = false" @switchToLogin="switchToLogin" />
    <LoginModal v-if="showLogin" @close="showLogin = false" @switchToRegister="switchToRegister" @loginSuccess="showProfileModal" />
    <ProfileModal v-if="showProfile" @close="showProfile = false" @logout="handleLogout" />
    <PointsModal v-show="store.state.showDeliveryModal" @close="store.commit('setShowDeliveryModal', false)" @select="handlePointSelect" />
    <AdminPanelModal v-if="showAdminModal" @close="showAdminModal = false" />
    <MyOrdersModal v-if="showOrdersModal" @close="showOrdersModal = false" />
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

    const searchQuery = ref("");
    const showRegister = ref(false);
    const showLogin = ref(false);
    const showProfile = ref(false);
    const showAdminModal = ref(false);
    const showOrdersModal = ref(false);

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

    const handlePointSelect = (point) => {
      store.commit("setSelectedPoint", point);
      store.commit("setShowDeliveryModal", false);
    };

    const isAuthenticated = computed(() => store.state.user.loggedIn);
    const userRole = computed(() => store.state.user?.role || null);

    const isAdmin = computed(() => {
      const role_id = Number(userRole.value);
      return role_id === 1 || role_id === 2;
    });

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
      showOrdersModal,
      handlePointSelect,
      showDeliveryPoints,
      isAuthenticated,
      isAdmin,
    };
  },
  methods: {
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
/* Шапка на всю ширину экрана */
.header {
  width: 100%;
  background-color: #1a1a2e;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  animation: slideDown 0.5s ease-out;
}

/* Контейнер для контента с ограничением по ширине и центровкой */
.nav-bar {
  max-width: 1200px; /* Максимальная ширина содержимого */
  margin: 0 auto;    /* Центрирование */
  padding: 15px 20px;
  display: flex;
  justify-content: space-between; /* Распределение элементов */
  align-items: center;
}

/* Основные блоки навигации */
.nav-left,
.nav-center,
.nav-right {
  display: flex;
  align-items: center;
}

/* Левый блок — логотип */
.nav-left {
  flex: 1;
}

/* Центр — ссылки */
.nav-center {
  flex: 2;
  justify-content: center;
  gap: 30px;
}

/* Правый блок — поиск */
.nav-right {
  flex: 1;
  justify-content: flex-end;
}

/* Название магазина */
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

/* Ссылки навигации */
.nav-link {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  color: #ffffff;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  line-height: 28px;
  display: flex;
  align-items: center;
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

/* Контейнер поиска */
.search-container {
  display: flex;
  align-items: center;
  background-color: #2a2a40;
  border-radius: 25px;
  padding: 5px 15px;
  border: 1px solid #444;
  animation: fadeIn 1s ease-out;
}

/* Поле поиска */
.search-input {
  background-color: transparent;
  color: #ffffff;
  border: none;
  outline: none;
  padding: 8px 10px;
  font-size: 16px;
  width: 180px;
  transition: width 0.3s ease;
}

.search-input::placeholder {
  color: #ccc;
}

.search-input:focus {
  width: 220px;
}

/* Кнопка "Инструменты" */
.secret-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  line-height: 28px;
  vertical-align: middle;
  position: relative;
  width: 24px;
}

.secret-button img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  transition: opacity 0.3s ease;
}

.icon-default {
  opacity: 1;
}

.icon-hover {
  opacity: 0;
}

.secret-button:hover .icon-default {
  opacity: 0;
}

.secret-button:hover .icon-hover {
  opacity: 1;
}

/* Анимации */
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
