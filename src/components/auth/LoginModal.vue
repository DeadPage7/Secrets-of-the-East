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
        <!-- Кнопка входа -->
        <button type="submit" class="submit-btn">Войти</button>
      </form>

      <!-- Ссылка для перехода к регистрации -->
      <p class="switch-to-register">
        Нет аккаунта? <span @click="switchToRegister" class="link">Зарегистрироваться</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["show"],
  emits: ["close", "switchToRegister"], // События для управления окнами
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    // Метод входа
    async login() {
      try {
        // Вызов Vuex экшена для логина
        await this.$store.dispatch("login", {
          email: this.email,
          password: this.password,
        });

        this.$emit("close"); // Закрываем окно при успехе
      } catch (error) {
        console.error("Ошибка входа:", error);
        alert("Неверный email или пароль");
      }
    },

    // Переход к регистрации
    switchToRegister() {
      this.$emit("switchToRegister");
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
/* Стили для фона модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.8); /* Затемнение фона */
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease;
  z-index: 1000;
}

/* Стили для самого модального окна */
.modal {
  background: #1a1a2e; /* Темный фон */
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);  position: relative;
  animation: slideIn 0.4s ease;
  position: relative;
}

/* Кнопка закрытия модального окна */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: #fff;
  font-size: 24px;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff6464; /* Розовый неоновый при наведении */
}

/* Заголовок модального окна */
.modal-title {
  font-size: 28px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

/* Стили для формы внутри модального окна */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Стили для полей ввода */
input {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: #2c2c44; /* Темный фон для полей ввода */
  color: #fff;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #bbb; /* Серый цвет для placeholder */
}

/* Стили при фокусе на поле ввода */
input:focus {
  background: #3c3c50; /* Более светлый темный фон при фокусе */
  box-shadow: 0 0 0 2px #5c6bc0; /* Синий неоновый цвет для фокуса */
}

/* Кнопка для отправки формы */
.submit-btn {
  padding: 12px;
  background: #5c6bc0; /* Синий неоновый фон */
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #7986cb; /* Светлый синий при наведении */
}

/* Анимация появления модального окна */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Анимация скольжения модального окна */
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

/* Стили для ссылки перехода на регистрацию */
.switch-to-register {
  margin-top: 15px;
  text-align: center;
}

.switch-to-register .link {
  color: #ff85c1; /* Розовый неоновый для ссылки */
  cursor: pointer;
}

.switch-to-register .link:hover {
  text-decoration: underline;
}
</style>
