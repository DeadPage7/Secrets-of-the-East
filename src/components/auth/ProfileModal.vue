<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>Профиль</h2>
      <button @click="handleClose" class="close-btn">×</button>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <div v-else-if="user && !isEditing" class="profile-info">
        <div class="avatar-placeholder">{{ getInitials(user.name) }}</div>
        <div class="info-item"><span class="label">Имя:</span> <span>{{ user.name }}</span></div>
        <div class="info-item"><span class="label">Email:</span> <span>{{ user.email }}</span></div>
        <div v-if="user.telephone" class="info-item"><span class="label">Телефон:</span> <span>{{ user.telephone }}</span></div>
        <div class="actions">
          <button @click="startEditing" class="edit-btn">Редактировать</button>
          <button @click="logout" class="logout-btn">Выйти</button>
        </div>
      </div>

      <div v-else-if="isEditing" class="edit-form">
        <div class="form-group">
          <label for="name">Имя:</label>
          <input
            id="name"
            v-model="editForm.name"
            type="text"
            class="form-input"
          />
          <!-- Ошибка с применением стиля из примера -->
          <div v-if="validationErrors.name" class="error-message">{{ validationErrors.name[0] }}</div>
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="editForm.email"
            type="email"
            class="form-input"
          />
          <div v-if="validationErrors.email" class="error-message">{{ validationErrors.email[0] }}</div>
        </div>

        <div class="form-group">
          <label for="telephone">Телефон:</label>
          <input
            id="telephone"
            v-model="editForm.telephone"
            type="tel"
            class="form-input"
          />
          <div v-if="validationErrors.telephone" class="error-message">{{ validationErrors.telephone[0] }}</div>
        </div>

        <div class="form-actions">
          <button @click="saveChanges" class="save-btn" :disabled="isSaving">
            {{ isSaving ? "Сохранение..." : "Сохранить" }}
          </button>
          <button @click="cancelEditing" class="cancel-btn">Отмена</button>
        </div>

        <!-- Общая ошибка -->
        <div v-if="errorMessage" class="error-message" style="margin-top: 15px;">
          {{ errorMessage }}
        </div>
      </div>

      <div v-else class="error-state">
        <p class="error-message">⚠️ Не удалось загрузить данные профиля</p>
        <button @click="retryLoading" class="retry-btn">Повторить попытку</button>
        <button @click="logout" class="logout-btn">Выйти</button>
      </div>
    </div>
  </div>
</template>


<script>
import api from "@/services/api";

export default {
  name: "ProfileModal",
  data() {
    return {
      user: null,
      isVisible: true,
      loading: true,
      error: null,
      isEditing: false,
      isSaving: false,
      editForm: {
        name: "",
        email: "",
        telephone: ""
      },
      validationErrors: {} // Ошибки валидации для полей формы
    };
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    // Загрузка данных пользователя
    async loadUserData() {
      try {
        this.loading = true;
        this.error = null;

        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("Токен отсутствует");

        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.user = response.data;
        this.editForm = {
          name: this.user.name,
          email: this.user.email,
          telephone: this.user.telephone || ""
        };
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        this.error = error.response?.data?.message || error.message;
        if (error.response?.status === 401) this.handleForceLogout();
      } finally {
        this.loading = false;
      }
    },

    // Получение инициалов пользователя для аватара
    getInitials(name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    },

    // Начать редактирование
    startEditing() {
      this.isEditing = true;
      this.validationErrors = {}; // очистка ошибок при начале редактирования
    },

    // Отмена редактирования, восстановление данных
    cancelEditing() {
      this.isEditing = false;
      this.validationErrors = {};
      this.editForm = {
        name: this.user.name,
        email: this.user.email,
        telephone: this.user.telephone || ""
      };
    },

    // Сохранение изменений с обработкой ошибок валидации
    async saveChanges() {
      try {
        this.isSaving = true;
        this.validationErrors = {}; // очищаем ошибки перед отправкой

        const token = localStorage.getItem("auth_token");

        const response = await api.patch("/profile", this.editForm, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const updatedUser = response.data.data;

        // Обновляем данные пользователя в компоненте
        this.user.name = updatedUser.name;
        this.user.email = updatedUser.email;
        this.user.telephone = updatedUser.telephone;

        this.isEditing = false;
        this.$emit("profile-updated", this.user);
      } catch (error) {
        this.validationErrors = {};

        if (error.response && error.response.data) {
          const data = error.response.data;

          if (data.errors) {
            // Записываем ошибки валидации в объект для показа в форме
            this.validationErrors = data.errors;
          } else if (data.message) {
            alert(data.message);
          } else {
            alert("Ошибка при сохранении данных");
          }
        } else {
          alert("Ошибка при сохранении данных");
        }
      } finally {
        this.isSaving = false;
      }
    },

    // Выход из профиля
    logout() {
      localStorage.removeItem("auth_token");
      this.$emit("logout");
      this.$emit("close");
    },

    // Принудительный выход при 401
    handleForceLogout() {
      this.logout();
    },

    // Повторная загрузка данных
    retryLoading() {
      this.loadUserData();
    },

    // Закрытие модального окна с подтверждением если есть несохранённые изменения
    handleClose() {
      if (
        this.isEditing &&
        !confirm("У вас есть несохраненные изменения. Закрыть без сохранения?")
      ) {
        return;
      }
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #0f0f1f;
  padding: 30px;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);
  position: relative;
  animation: slideUp 0.3s ease;
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  color: #ff85c1;
  background: rgba(255, 255, 255, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #ff85c1;
  font-size: 24px;
}

/* Аватар */
.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #5c6bc0, #3949ab);
  border-radius: 50%;
  margin: 0 auto 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(92, 107, 192, 0.3);
}

/* Информация профиля */
.info-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.label {
  font-weight: 600;
  color: #aaa;
  min-width: 100px;
  text-align: left;
}

.value {
  flex: 1;
  text-align: left;
  color: #fff;
}

/* Кнопки действий */
.actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.edit-btn {
  background: #5c6bc0;
  color: white;
}

.edit-btn:hover {
  background: #3949ab;
  transform: translateY(-2px);
}

.logout-btn {
  background: #ff6464;
  color: white;
}

.logout-btn:hover {
  background: #e53935;
  transform: translateY(-2px);
}

/* Форма редактирования */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #aaa;
  text-align: left;
}

.form-input {
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #ff85c1;
  box-shadow: 0 0 0 2px rgba(255, 133, 193, 0.3);
}

/* Подсветка ошибки у input */
.input-error {
  border-color: #ff6464 !important;
  box-shadow: 0 0 5px 1px rgba(255, 100, 100, 0.7);
}

.error-text {
  color: #ff6464;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #388e3c;
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* Состояние загрузки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #fff;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #5c6bc0;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

/* Ошибка */
.error-state {
  text-align: center;
  padding: 20px 0;
}

.error-message {
  color: #ff6464;
  margin-bottom: 25px;
  font-size: 18px;
}

.retry-btn {
  background: #5c6bc0;
  color: white;
  margin-bottom: 15px;
}

.retry-btn:hover {
  background: #3949ab;
  transform: translateY(-2px);
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

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
