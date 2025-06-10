<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Менеджеры</h2>

      <!-- Навигация: список или создание -->
      <div class="tabs">
        <button :class="{active: tab === 'list'}" @click="tab = 'list'">Список</button>
        <button :class="{active: tab === 'create'}" @click="tab = 'create'">Создать</button>
      </div>

      <!-- Список менеджеров -->
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

      <!-- Форма создания -->
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

        <button class="submit-btn" @click="handleSubmit">Создать</button>
        <button class="cancel-btn" @click="tab = 'list'">Отмена</button>
      </div>

      <!-- Кнопка закрыть модал -->
      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const tab = ref('list') // Управляет отображением вкладок: 'list' или 'create'

const name = ref('')
const email = ref('')
const password = ref('')
const telephone = ref('')
const sex = ref('')

const managers = ref([])
const loading = ref(true)

const fetchManagers = async () => {
  loading.value = true
  try {
    const response = await api.get('/manager')
    managers.value = response.data
  } catch (e) {
    alert('Ошибка загрузки менеджеров')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await api.post('/manager', {
      name: name.value,
      email: email.value,
      password: password.value,
      telephone: telephone.value,
      sex: sex.value
    })

    alert('Менеджер создан')
    name.value = ''
    email.value = ''
    password.value = ''
    telephone.value = ''
    sex.value = ''
    tab.value = 'list' // Вернуться к списку после создания
    await fetchManagers()
  } catch (error) {
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      alert('Ошибка:\n' + messages)
    } else {
      alert('Ошибка при создании менеджера')
      console.error(error)
    }
  }
}

const deleteManager = async (id) => {
  if (!confirm('Удалить менеджера?')) return
  try {
    await api.delete(`/manager/${id}`)
    alert('Менеджер удален')
    await fetchManagers()
  } catch (error) {
    alert('Ошибка удаления')
    console.error(error)
  }
}

onMounted(fetchManagers)
</script>

<style scoped>
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

.modal-title {
  font-size: 22px;
  margin-bottom: 15px;
  color: #ff85c1;
}

/* Навигация вкладок */
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

/* Список менеджеров */
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
}
.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

/* Форма */
.modal-input {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
}

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

/* Кнопка закрытия */
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
