<template>
  <!-- Модальное окно с профилем пользователя, отображается, если isVisible = true -->
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2>Профиль</h2>

      <!-- Если данные пользователя загружены -->
      <div v-if="user">
        <p><strong>Имя:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <!-- Кнопка для выхода из системы -->
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>

      <!-- Если данные пользователя не найдены -->
      <div v-else>
        <p>Пользователь не найден или удалён.</p>
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>

      <!-- Кнопка для закрытия модального окна -->
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import api from "@/services/api"; // Импорт API для получения данных пользователя

export default {
  name: "ProfileModal",
  data() {
    return {
      user: null, // Данные пользователя
      isVisible: true, // Видимость модального окна
    };
  },
  async mounted() {
    try {
      const response = await api.get("/user"); // Запрос на сервер для получения данных пользователя
      this.user = response.data; // Сохраняем данные пользователя в переменную
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      this.user = null; // Если произошла ошибка, устанавливаем user в null
    }
  },
  methods: {
    // Метод для выхода из аккаунта
    logout() {
      // Удаляем токен аутентификации из localStorage
      localStorage.removeItem("auth_token");

      // Закрываем модальное окно и уведомляем родителя о выходе
      this.$emit("logout");
      this.$emit("close");
    },
    // Метод для принудительного выхода (например, при ошибках)
    handleForceLogout() {
      this.logout(); // Вызов метода logout без предупреждений
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
  background: rgba(10, 10, 10, 0.8); /* Затемняем фон */
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease;
  z-index: 1000; /* Слой модального окна */
}

/* Стили для содержимого модального окна */
.modal-content {
  background: #222; /* Тёмный фон окна */
  padding: 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.4s ease;
  position: relative; /* Для кнопки закрытия */
}

/* Стили для кнопки закрытия окна */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}

/* Стили для информации о пользователе */
.profile-info {
  color: #fff;
  margin-bottom: 20px;
}

/* Стили для кнопки выхода */
.logout-btn {
  padding: 12px;
  background: #ff6464; /* Красный цвет кнопки */
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
}

/* Анимация появления окна */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Анимация скольжения окна сверху */
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
