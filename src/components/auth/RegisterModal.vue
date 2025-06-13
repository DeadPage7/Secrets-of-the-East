<template>
  <!-- Оверлей, закрывается при клике вне модального окна -->
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- Кнопка закрытия окна -->
      <button class="close-btn" @click="close">×</button>
      <h2 class="modal-title">Регистрация</h2>

      <!-- Форма регистрации -->
      <form @submit.prevent="register">
        <input v-model="name" type="text" placeholder="ФИО" required />
        <div v-if="errors.name" class="error-message">{{ errors.name[0] }}</div>

        <input v-model="email" type="email" placeholder="Email" required />
        <div v-if="errors.email" class="error-message">{{ errors.email[0] }}</div>

        <input v-model="phone" type="text" placeholder="Телефон" required />
        <div v-if="errors.telephone" class="error-message">{{ errors.telephone[0] }}</div>

        <!-- Блок с паролем и кнопкой показа/скрытия -->
        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Пароль"
            required
          />
          <button type="button" class="toggle-password" @click="togglePassword">
            {{ showPassword ? 'Скрыть' : 'Показать' }}
          </button>
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password[0] }}</div>

        <select v-model="gender" required>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
        </select>
        <div v-if="errors.gender" class="error-message">{{ errors.gender[0] }}</div>

        <button type="submit" class="submit-btn">Зарегистрироваться</button>
      </form>

      <!-- Переключение на форму авторизации -->
      <p class="switch-to-login">
        Уже есть аккаунт? <span @click="switchToLogin" class="link">Авторизация</span>
      </p>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  props: ["show"],
  emits: ["close", "switchToLogin", "openProfile"],

  data() {
    return {
      name: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      errors: {}, // Хранит ошибки валидации от сервера
      showPassword: false, // Переключатель видимости пароля
    };
  },

  methods: {
    // Переключение видимости пароля
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    // Отправка данных на сервер для регистрации
    async register() {
      this.errors = {}; // Сброс ошибок перед запросом

      try {
        // Подготовка объекта с данными для API
        const requestData = {
          name: this.name,
          email: this.email,
          telephone: this.phone || null, // Телефон может отсутствовать
          sex: this.gender === "male", // Преобразуем в boolean для API
          password: this.password,
        };

        const response = await api.post("/register", requestData);

        if (response.status === 201) {
          // Сохраняем токен и закрываем модалку
          localStorage.setItem("auth_token", response.data.token);
          alert("Вы успешно зарегистрированы!");
          this.$emit("close");
          this.$emit("openProfile"); // Открываем профиль после регистрации
        }
      } catch (error) {
        if (error.response) {
          // Валидационные ошибки от API
          const serverErrors = error.response.data.errors;
          if (serverErrors) {
            this.errors = serverErrors;
          } else {
            alert(error.response.data.message || "Ошибка регистрации");
          }
        } else {
          alert("Что-то пошло не так");
        }
      }
    },

    // Переход на форму авторизации
    switchToLogin() {
      this.$emit("switchToLogin");
      this.$emit("close");
    },

    // Закрытие модального окна
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
/* Стили ссылки для перехода на авторизацию */
.switch-to-login {
  margin-top: 15px;
  text-align: center;
}

.switch-to-login .link {
  color: #ff85c1;
  cursor: pointer;
}

.switch-to-login .link:hover {
  text-decoration: underline;
}

/* Стили ошибок валидации */
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

/* Оверлей модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease;
  z-index: 1000;
}

/* Основной контейнер модалки */
.modal {
  background: #1a1a2e;
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  animation: slideIn 0.4s ease;
  position: relative;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);
}

/* Кнопка закрытия */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff6464;
}

/* Заголовок модального окна */
.modal-title {
  font-size: 28px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

/* Форма и поля ввода */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input,
select {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #2c2c3e;
  color: #fff;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #bbb;
}

input:focus,
select:focus {
  background: #3c3c50;
  box-shadow: 0 0 0 2px #5c6bc0;
}

/* Обертка поля пароля и кнопки показать/скрыть */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Кнопка показать/скрыть пароль */
.toggle-password {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #ff85c1;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
  padding: 0 6px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #ff4d7e;
}

/* Кнопка отправки */
.submit-btn {
  padding: 12px;
  background: #5c6bc0;
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #7986cb;
}

/* Анимации появления */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
