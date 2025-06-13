<template>
  <!-- Оверлей модального окна авторизации -->
  <div class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- Кнопка закрытия -->
      <button class="close-btn" @click="close">×</button>
      <h2 class="modal-title">Авторизация</h2>

      <form @submit.prevent="login">
        <!-- Ввод email -->
        <input v-model="email" type="email" placeholder="Email" required />

        <!-- Ввод пароля -->
        <input v-model="password" type="password" placeholder="Пароль" required />

        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <!-- Кнопка входа -->
        <button type="submit" class="submit-btn">Войти</button>
      </form>

      <!-- Ссылка для перехода к регистрации -->
      <p class="switch-to-register">
        Нет аккаунта?
        <span @click="switchToRegister" class="link">Зарегистрироваться</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["show"],
  emits: ["close", "switchToRegister"],
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "", // Сюда будет записываться сообщение об ошибке
    };
  },
  methods: {
    // Метод авторизации
    async login() {
      this.errorMessage = ""; // Сброс ошибки перед отправкой

      try {
        // Отправка запроса на login через Vuex
        await this.$store.dispatch("login", {
          email: this.email,
          password: this.password,
        });

        // Закрываем модалку после успешного входа
        this.$emit("close");
      } catch (error) {
        // Обработка ошибок от сервера (Laravel)
        if (error.response) {
          const { status, data } = error.response;

          // Ошибка через ApiException (например, 401)
          if (data.message) {
            this.errorMessage = data.message;
          }
          // Ошибка валидации формы (422)
          else if (status === 422 && data.errors) {
            const firstField = Object.keys(data.errors)[0];
            this.errorMessage = data.errors[firstField][0];
          } else {
            this.errorMessage = "Ошибка сервера. Попробуйте позже.";
          }
        } else {
          this.errorMessage = "Сервер не отвечает.";
        }
      }
    },

    // Переход на регистрацию
    switchToRegister() {
      this.$emit("switchToRegister");
      this.$emit("close");
    },

    // Закрытие окна
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
/* Фон модального окна */
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

/* Контейнер модального окна */
.modal {
  background: #1a1a2e;
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);
  position: relative;
  animation: slideIn 0.4s ease;
}

/* Кнопка закрытия */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: #fff;
  font-size: 24px;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  color: #ff6464;
}

/* Заголовок */
.modal-title {
  font-size: 28px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

/* Форма */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Поля ввода */
input {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #2c2c44;
  color: #fff;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #bbb;
}

input:focus {
  background: #3c3c50;
  box-shadow: 0 0 0 2px #5c6bc0;
}

/* Кнопка входа */
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

/* Ошибка авторизации */
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

/* Переход к регистрации */
.switch-to-register {
  margin-top: 15px;
  text-align: center;
}

.switch-to-register .link {
  color: #ff85c1;
  cursor: pointer;
}

.switch-to-register .link:hover {
  text-decoration: underline;
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
