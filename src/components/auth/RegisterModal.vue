<template>
  <!-- Оверлей для модального окна регистрации -->
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- Кнопка для закрытия модального окна -->
      <button class="close-btn" @click="close">×</button>
      <h2 class="modal-title">Регистрация</h2>
      <!-- Форма регистрации -->
      <form @submit.prevent="register">
        <!-- Поле для ввода ФИО -->
        <input v-model="name" type="text" placeholder="ФИО" required />
        <div v-if="errors.name" class="error">{{ errors.name }}</div>

        <!-- Поле для ввода Email -->
        <input v-model="email" type="email" placeholder="Email" required />
        <div v-if="errors.email" class="error">{{ errors.email }}</div>

        <!-- Поле для ввода телефона -->
        <input v-model="phone" type="text" placeholder="Телефон" required />
        <div v-if="errors.phone" class="error">{{ errors.phone }}</div>

        <!-- Поле для ввода пароля -->
        <input v-model="password" type="password" placeholder="Пароль" required />
        <div v-if="errors.password" class="error">{{ errors.password }}</div>

        <!-- Селектор для выбора пола -->
        <select v-model="gender" required>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
        </select>
        <div v-if="errors.gender" class="error">{{ errors.gender }}</div>

        <!-- Кнопка для отправки формы -->
        <button type="submit" class="submit-btn">Зарегистрироваться</button>
      </form>

      <!-- Ссылка для перехода на форму авторизации -->
      <p class="switch-to-login">
        Уже есть аккаунт? <span @click="switchToLogin" class="link">Авторизация</span>
      </p>
    </div>
  </div>
</template>

<script>
import api from "@/services/api"; // Импорт API для общения с backend

export default {
  props: ["show"], // Пропс для контроля показа модального окна
  emits: ["close", "switchToLogin", "openProfile"], // События для взаимодействия с родителем
  data() {
    return {
      name: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      errors: {} // Объект для хранения ошибок валидации
    };
  },
  methods: {
    // Метод регистрации пользователя
    async register() {
      this.errors = {}; // Сброс ошибок перед отправкой

      try {
        const requestData = {
          name: this.name,
          email: this.email,
          telephone: this.phone ? this.phone : null, // Телефон может быть null
          sex: this.gender === "male", // Преобразуем в boolean
          password: this.password,
        };

        const response = await api.post("/register", requestData); // Запрос регистрации

        if (response.status === 201) {
          // Если успешно, сохраняем токен и закрываем модалку
          localStorage.setItem('auth_token', response.data.token);
          alert("Вы успешно зарегистрированы!");
          this.$emit("close"); // Закрываем окно
          this.$emit("openProfile"); // Открываем окно профиля
        }
      } catch (error) {
        if (error.response) {
          const serverErrors = error.response.data.errors;
          if (serverErrors) {
            this.errors = serverErrors; // Показываем ошибки от сервера
          } else {
            alert(error.response.data.message || "Ошибка регистрации");
          }
        } else {
          alert("Что-то пошло не так");
        }
      }
    },

    // Переход к форме авторизации
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
/* Стили для текста ссылки "Авторизация" */
.switch-to-login {
  margin-top: 15px;
  text-align: center;
}

.switch-to-login .link {
  color: #ff85c1; /* Розовый неоновый цвет */
  cursor: pointer;
}

.switch-to-login .link:hover {
  text-decoration: underline;
}

/* Стили для ошибок ввода */
.error {
  color: #ff4d4f; /* Красный цвет для ошибок */
  font-size: 12px;
  margin-top: 5px;
}

/* Стили для оверлея модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.8); /* Полупрозрачный фон */
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease;
  z-index: 1000;
}

/* Стили для модального окна */
.modal {
  background: #1a1a2e; /* Темно-синий цвет фона */
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  animation: slideIn 0.4s ease;
  position: relative;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);  position: relative;
}

/* Кнопка для закрытия окна */
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
  color: #ff6464; /* Цвет для кнопки закрытия */
}

/* Заголовок модального окна */
.modal-title {
  font-size: 28px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

/* Стили для формы */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Стили для полей ввода */
input, select {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #2c2c3e; /* Темный фон для полей ввода */
  color: #fff;
  transition: all 0.3s ease;
}

/* Стили для плейсхолдера в полях ввода */
input::placeholder {
  color: #bbb;
}

/* Стили для фокуса на полях ввода */
input:focus, select:focus {
  background: #3c3c50; /* Цвет при фокусе */
  box-shadow: 0 0 0 2px #5c6bc0; /* Светлый фиолетовый */
}

/* Кнопка отправки формы */
.submit-btn {
  padding: 12px;
  background: #5c6bc0; /* Неоновый фиолетовый цвет */
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #7986cb; /* Светлый фиолетовый для ховера */
}

/* Анимации */
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
