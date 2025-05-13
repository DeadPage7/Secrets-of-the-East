<template>
  <header class="header">
    <div class="nav-bar">
      <div class="nav-left">
        <!-- Название магазина -->
        <span class="store-name">Тайны Востока</span>
      </div>
      <div class="nav-center">
        <!-- Ссылки для навигации -->
        <a href="#" class="nav-link">Пункт выдачи</a>
        <a href="#" class="nav-link">Корзина</a>
        <!-- Ссылка для открытия модального окна профиля -->
        <a href="#" class="nav-link" @click.prevent="handleProfileClick">Профиль</a>
      </div>
      <div class="nav-right">
        <div class="search-container">
          <!-- Поле для поиска -->
          <input type="text" class="search-input" placeholder="Поиск..." />
        </div>

        <!-- Кнопка выхода, которая скрывается после выхода -->
        <button v-if="isAuthenticated()" class="logout-button" @click="handleLogout">
          Выйти
        </button>
      </div>
    </div>

    <!-- Модальные окна для регистрации, авторизации и профиля -->
    <RegisterModal v-if="showRegister" @close="showRegister = false" @switchToLogin="switchToLogin" />
    <LoginModal v-if="showLogin" @close="showLogin = false" @switchToRegister="switchToRegister" @loginSuccess="showProfileModal" />
    <ProfileModal v-if="showProfile" @close="showProfile = false" @logout="handleLogout" />
  </header>
</template>

<script>
import RegisterModal from "../auth/RegisterModal.vue";
import LoginModal from "../auth/LoginModal.vue";
import ProfileModal from "../auth/ProfileModal.vue";

export default {
  name: "MainHeader",
  components: {
    RegisterModal,
    LoginModal,
    ProfileModal,
  },
  data() {
    return {
      showRegister: false, // Состояние для модального окна регистрации
      showLogin: false, // Состояние для модального окна входа
      showProfile: false, // Состояние для модального окна профиля
    };
  },
  methods: {
    // Обработчик клика по ссылке "Профиль"
    handleProfileClick() {
      if (this.isAuthenticated()) {
        // Если пользователь авторизован, показываем профиль
        this.showProfile = true;
      } else {
        // Если пользователь не авторизован, показываем окно входа
        this.showLogin = true;
      }
    },
    // Проверка на аутентификацию (наличие токена в localStorage)
    isAuthenticated() {
      return localStorage.getItem("auth_token") !== null;
    },
    // Переключение на форму входа из формы регистрации
    switchToLogin() {
      this.showRegister = false;
      this.showLogin = true;
    },
    // Переключение на форму регистрации из формы входа
    switchToRegister() {
      this.showLogin = false;
      this.showRegister = true;
    },
    // Отображение модального окна профиля после успешного входа
    showProfileModal() {
      this.showLogin = false;
      this.showProfile = true;
    },
    // Обработчик выхода из аккаунта
    handleLogout() {
      // Удаляем токен из localStorage
      localStorage.removeItem("auth_token");
      this.showProfile = false; // Закрываем модальное окно профиля

      // Скрыть кнопку "Выйти" сразу после выхода
      this.$nextTick(() => {
        this.$forceUpdate(); // Принудительно перерисовываем компонент, чтобы скрыть кнопку
      });
    },
  },
};
</script>

<style scoped>
  /* Панель навигации */
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

/* Левый блок */
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
}

/* Центровка навигации */
.nav-center {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex: 2;
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

/* Правый блок */
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


