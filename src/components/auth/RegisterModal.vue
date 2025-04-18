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
import api from "@/services/api"; // Импортируем API для работы с сервером

export default {
  props: ["show"], // Пропс для показа модального окна
  emits: ["close", "switchToLogin"], // События для взаимодействия с родительским компонентом
  data() {
    return {
      name: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      errors: {} // Объект для хранения ошибок
    };
  },
  methods: {
    // Метод для регистрации пользователя
    async register() {
      this.errors = {}; // Очищаем предыдущие ошибки

      try {
        const requestData = {
          name: this.name,
          email: this.email,
          telephone: this.phone ? this.phone : null, // Если телефон пуст, отправляем null
          sex: this.gender === "male" ? true : false, // Преобразуем пол в boolean
          password: this.password,
        };

        const response = await api.post("/register", requestData); // Отправляем запрос на сервер

        if (response.status === 201) { // Если регистрация прошла успешно
          // Сохраняем токен в localStorage
          localStorage.setItem('auth_token', response.data.token);

          alert("Вы успешно зарегистрированы!");
          this.$emit("close"); // Закрываем окно регистрации

          // Открываем модальное окно профиля
          this.$emit("openProfile");
        }
      } catch (error) {
        if (error.response) {
          const serverErrors = error.response.data.errors; // Получаем ошибки от сервера
          if (serverErrors) {
            this.errors = serverErrors; // Присваиваем ошибки в объект errors
          } else {
            alert(error.response.data.message || "Ошибка регистрации");
          }
        } else {
          alert("Что-то пошло не так");
        }
      }
    },

    // Переключение на форму авторизации
    switchToLogin() {
      this.$emit("switchToLogin"); // Сигнализируем родителю о переходе на форму авторизации
      this.$emit("close"); // Закрываем окно регистрации
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
  color: #007bff;
  cursor: pointer;
}

.switch-to-login .link:hover {
  text-decoration: underline;
}

/* Стили для ошибок ввода */
.error {
  color: #ff4d4f;
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
  background: #1e1e2f;
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.4s ease;
  position: relative;
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
  color: #ff6464;
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
  background: #2c2c3e;
  color: #fff;
  transition: all 0.3s ease;
}

/* Стили для плейсхолдера в полях ввода */
input::placeholder {
  color: #bbb;
}

/* Стили для фокуса на полях ввода */
input:focus, select:focus {
  background: #3c3c50;
  box-shadow: 0 0 0 2px #5c6bc0;
}

/* Кнопка отправки формы */
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
