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

        <!-- Кнопка Инструменты, видна если роль === 1 или 2 -->
        <button
          v-if="isAdmin"
          class="secret-button"
          @click="handleSecretClick"
          title="Инструменты"
        >
          Инструменты
        </button>

        <!-- Кнопка выхода, видна только если пользователь авторизован -->
        <button v-if="isAuthenticated" class="logout-button" @click="handleLogout">
          Выйти
        </button>
      </div>
    </div>

    <RegisterModal v-if="showRegister" @close="showRegister = false" @switchToLogin="switchToLogin" />
    <LoginModal v-if="showLogin" @close="showLogin = false" @switchToRegister="switchToRegister" @loginSuccess="showProfileModal" />
    <ProfileModal v-if="showProfile" @close="showProfile = false" @logout="handleLogout" />
    <PointsModal v-show="showDeliveryModal" @close="showDeliveryModal = false" />
    <AdminPanelModal v-if="showAdminModal" @close="showAdminModal = false" />
  </header>
</template>

<script>
import RegisterModal from "../auth/RegisterModal.vue";
import LoginModal from "../auth/LoginModal.vue";
import ProfileModal from "../auth/ProfileModal.vue";
import PointsModal from "../Points/PointsModal.vue";
import AdminPanelModal from "../admin/AdminPanelModal.vue";
import { useRouter } from "vue-router";
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

export default {
  name: "MainHeader",
  components: {
    RegisterModal,
    LoginModal,
    ProfileModal,
    PointsModal,
    AdminPanelModal,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const searchQuery = ref("");

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

    // Проверка авторизации
    const isAuthenticated = computed(() => store.state.user.loggedIn);

    // Получение роли пользователя
    const userRole = computed(() => store.state.user?.role || null);

    // Проверка админской роли
    const isAdmin = computed(() => {
      const role_id = Number(userRole.value);
      return role_id === 1 || role_id === 2;
    });

    // Отладка роли
    watch(
      userRole,
      (newRole) => {
        console.log("Текущая роль пользователя:", newRole);
      },
      { immediate: true }
    );

    return {
      searchQuery,
      handleSearch,
      router,
      isAuthenticated,
      store,
      userRole,
      isAdmin,
    };
  },
  data() {
    return {
      showRegister: false,
      showLogin: false,
      showProfile: false,
      showDeliveryModal: false,
      showAdminModal: false,
    };
  },
  methods: {
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
      if (this.isAuthenticated) {
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
    showDeliveryPoints() {
      this.showDeliveryModal = true;
    },
  },
};
</script>

<style scoped>
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
