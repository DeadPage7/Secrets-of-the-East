<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Пользователи</h2>

      <!-- Вкладки переключения между списком и профилем -->
      <div class="tabs">
        <!-- Активная вкладка подсвечивается -->
        <button :class="{active: tab === 'list'}" @click="tab = 'list'">Список</button>
        <!-- Вкладка профиля доступна только если выбран пользователь -->
        <button :class="{active: tab === 'detail'}" :disabled="!selectedUser" @click="tab = 'detail'">Профиль</button>
      </div>

      <!-- Отображение списка пользователей -->
      <div v-if="tab === 'list'">
        <!-- Показ индикатора загрузки -->
        <div v-if="loading">Загрузка...</div>
        <ul v-else class="manager-list">
          <!-- Перебор массива пользователей, клик выбирает пользователя -->
          <li v-for="user in users" :key="user.id" class="manager-item" @click="selectUser(user)">
            <div>
              <strong>{{ user.name }}</strong><br />
              {{ user.email }}<br />
              Роль: {{ user.role.name }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Отображение профиля выбранного пользователя -->
      <div v-if="tab === 'detail' && selectedUser">
        <!-- Поля для редактирования -->
        <input v-model="selectedUser.name" class="modal-input" placeholder="Имя" />
        <input v-model="selectedUser.email" class="modal-input" placeholder="Email" />
        <input v-model="selectedUser.telephone" class="modal-input" placeholder="Телефон" />

        <select v-model="selectedUser.sex" class="modal-input">
          <option disabled value="">Пол</option>
          <option :value="0">Мужской</option>
          <option :value="1">Женский</option>
        </select>

        <!-- Кнопка сохранения изменений -->
        <button class="submit-btn" @click="updateUser">Сохранить</button>
        <!-- Кнопка возврата к списку -->
        <button class="cancel-btn" @click="tab = 'list'">Назад</button>
      </div>

      <!-- Кнопка закрытия модального окна -->
      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'  // импорт API для запросов

const emit = defineEmits(['close']) // событие для закрытия модалки

const tab = ref('list')             // активная вкладка (список или профиль)
const users = ref([])               // массив пользователей
const selectedUser = ref(null)      // выбранный пользователь для редактирования
const loading = ref(true)           // состояние загрузки

// Функция загрузки пользователей с сервера
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/user') // запрос списка пользователей
    users.value = response.data             // сохраняем в reactive переменную
  } catch (error) {
    alert('Ошибка загрузки пользователей')  // ошибка запроса
    console.error(error)
  } finally {
    loading.value = false                    // отключаем индикатор загрузки
  }
}

// При выборе пользователя копируем объект и переключаемся на вкладку профиля
const selectUser = (user) => {
  selectedUser.value = { ...user } // создаём копию объекта для редактирования
  tab.value = 'detail'             // переключение вкладки
}

// Отправка обновлённых данных пользователя на сервер
const updateUser = async () => {
  try {
    // Формируем данные для отправки (без роли)
    const payload = {
      name: selectedUser.value.name,
      email: selectedUser.value.email,
      telephone: selectedUser.value.telephone,
      sex: selectedUser.value.sex
    }

    // Отправка PATCH-запроса на обновление пользователя
    await api.patch(`/user/${selectedUser.value.id}`, payload)
    alert('Пользователь обновлён')

    await fetchUsers() // обновляем список после изменения
    tab.value = 'list' // возвращаемся к списку
  } catch (error) {
    // Если ошибка валидации, показываем её пользователю
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      alert('Ошибка:\n' + messages)
    } else {
      alert('Ошибка обновления')
      console.error(error)
    }
  }
}

// При монтировании компонента загружаем список пользователей
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* Фон и позиционирование модального окна */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

/* Основной контейнер модалки */
.modal-content {
  background-color: #1a1a2e;
  padding: 30px;
  border-radius: 20px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 20px #c84b9e88;
  color: #fff;
  position: relative;
}

/* Заголовок модалки */
.modal-title {
  font-size: 22px;
  margin-bottom: 15px;
  color: #ff85c1;
}

/* Стили вкладок */
.tabs {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: #3a3a5e;
  color: white;
  font-weight: bold;
  transition: background-color 0.3s;
}
.tabs button.active {
  background-color: #c84b9e;
}

/* Список пользователей */
.manager-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}
.manager-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2e2e4e;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

/* Поля ввода */
.modal-input {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
}

/* Кнопки сохранения и отмены */
.submit-btn,
.cancel-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background-color: #c84b9e;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}
.submit-btn:hover,
.cancel-btn:hover {
  background-color: #ff85c1;
}

/* Кнопка закрытия модального окна */
.close-modal-btn {
  margin-top: 15px;
  background-color: #555;
  width: 100%;
  border-radius: 12px;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  transition: 0.3s;
}
.close-modal-btn:hover {
  background-color: #777;
}
</style>
