<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Менеджеры</h2>

      <!-- Навигация: переключение вкладок -->
      <div class="tabs">
        <button :class="{active: tab === 'list'}" @click="tab = 'list'">Список</button>
        <button :class="{active: tab === 'create'}" @click="tab = 'create'">Создать</button>
      </div>

      <!-- Ошибка при загрузке списка менеджеров -->
      <div v-if="errorLoading" class="error-message">{{ errorLoading }}</div>

      <!-- Вкладка: список менеджеров -->
      <div v-if="tab === 'list'">
        <div v-if="loading">Загрузка...</div>
        <ul v-else class="manager-list">
          <li v-for="manager in managers" :key="manager.id" class="manager-item">
            <div>
              <strong>{{ manager.name }}</strong><br />
              {{ manager.email }}<br />
              {{ manager.telephone }}
            </div>
            <button class="delete-btn" @click="deleteManager(manager.id)">Удалить</button>
          </li>
        </ul>
      </div>

      <!-- Вкладка: форма создания менеджера -->
      <div v-if="tab === 'create'">
        <input v-model="name" type="text" placeholder="Имя" class="modal-input" />
        <input v-model="email" type="email" placeholder="Email" class="modal-input" />
        <input v-model="password" type="password" placeholder="Пароль" class="modal-input" />
        <input v-model="telephone" type="text" placeholder="Телефон" class="modal-input" />

        <select v-model="sex" class="modal-input">
          <option disabled value="">Выберите пол</option>
          <option value="0">Мужской</option>
          <option value="1">Женский</option>
        </select>

        <!-- Вывод ошибок валидации или API -->
        <div v-if="formError" class="error-message">{{ formError }}</div>

        <button class="submit-btn" @click="handleSubmit">Создать</button>
        <button class="cancel-btn" @click="tab = 'list'">Отмена</button>
      </div>

      <!-- Кнопка закрытия модального окна -->
      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const tab = ref('list') // Активная вкладка: 'list' или 'create'

const name = ref('')
const email = ref('')
const password = ref('')
const telephone = ref('')
const sex = ref('')

const managers = ref([])
const loading = ref(true)

// Переменные для ошибок
const errorLoading = ref('') // Ошибка загрузки списка
const formError = ref('')     // Ошибка формы создания

// Функция загрузки списка менеджеров с обработкой ошибок
const fetchManagers = async () => {
  loading.value = true
  errorLoading.value = ''
  try {
    const response = await api.get('/manager')
    managers.value = response.data
  } catch (e) {
    // Выводим ошибку загрузки
    errorLoading.value = e.response?.data?.message || 'Ошибка загрузки менеджеров'
    console.error('Ошибка загрузки менеджеров:', e)
  } finally {
    loading.value = false
  }
}

// Функция создания менеджера с обработкой ошибок
const handleSubmit = async () => {
  formError.value = '' // Сбрасываем ошибки при новом запросе
  try {
    await api.post('/manager', {
      name: name.value,
      email: email.value,
      password: password.value,
      telephone: telephone.value,
      sex: sex.value
    })

    alert('Менеджер создан')

    // Сброс формы после успешного создания
    name.value = ''
    email.value = ''
    password.value = ''
    telephone.value = ''
    sex.value = ''
    tab.value = 'list' // Переход к списку
    await fetchManagers() // Обновление списка
  } catch (error) {
    // Обработка ошибок валидации (422)
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      formError.value = messages
    }
    // Ошибки с кодом 403 или 400 — выводим сообщение из API
    else if ([400, 403].includes(error.response?.status)) {
      formError.value = error.response.data.message || 'Ошибка при выполнении действия'
    } else {
      formError.value = 'Ошибка при создании менеджера'
    }
    console.error('Ошибка создания менеджера:', error)
  }
}

// Функция удаления менеджера с подтверждением и обработкой ошибок
const deleteManager = async (id) => {
  if (!confirm('Удалить менеджера?')) return
  try {
    await api.delete(`/manager/${id}`)
    alert('Менеджер удален')
    await fetchManagers() // Обновление списка после удаления
  } catch (error) {
    // Ошибка удаления — выводим alert и логируем
    alert(error.response?.data?.message || 'Ошибка удаления менеджера')
    console.error('Ошибка удаления менеджера:', error)
  }
}

// Загрузка списка менеджеров при монтировании компонента
onMounted(fetchManagers)
</script>

<style scoped>
/* Стили для сообщений об ошибках */
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

/* Общие стили модального окна */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 20px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(200, 75, 158, 0.4);
  color: white;
  position: relative;
}

.modal-title {
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #e1bee7;
  text-align: center;
  font-size: 1.5rem;
}

/* Вкладки */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
}
.tabs button {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: none;
  background-color: #2a2a4a;
  color: #b0bec5;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.tabs button.active {
  background-color: #c84b9e;
  color: white;
}

/* Список менеджеров */
.manager-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}
.manager-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a4a;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #b0bec5;
}
.manager-item strong {
  color: #e1bee7;
}
.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.25s ease;
}
.delete-btn:hover {
  background-color: #ff5252;
}

/* Форма создания */
.modal-input {
  width: 100%;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  border: none;
  background-color: #2a2a4a;
  color: #b0bec5;
  font-size: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.modal-input::placeholder {
  color: #90a4ae;
}
.modal-input:focus {
  outline: none;
  background-color: #3c3c7d;
  color: #e1f5fe;
}

/* Кнопки */
.submit-btn,
.cancel-btn {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 0.7rem;
  color: white;
  background-color: #c84b9e;
}
.submit-btn:hover,
.cancel-btn:hover {
  background-color: #d357b0;
}

/* Кнопка закрытия модального окна */
.close-modal-btn {
  margin-top: 1.2rem;
  width: 100%;
  padding: 0.7rem;
  background-color: #555;
  color: white;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.close-modal-btn:hover {
  background-color: #777;
}
</style>
