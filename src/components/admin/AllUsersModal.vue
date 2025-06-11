<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Пользователи</h2>

      <!-- Вкладки -->
      <div class="tabs">
        <button :class="{active: tab === 'list'}" @click="tab = 'list'">Список</button>
        <button :class="{active: tab === 'detail'}" :disabled="!selectedUser" @click="tab = 'detail'">Профиль</button>
      </div>

      <!-- Список пользователей -->
      <div v-if="tab === 'list'">
        <div v-if="loading">Загрузка...</div>
        <ul v-else class="manager-list">
          <li v-for="user in users" :key="user.id" class="manager-item" @click="selectUser(user)">
            <div>
              <strong>{{ user.name }}</strong><br />
              {{ user.email }}<br />
              Роль: {{ user.role.name }}
            </div>
          </li>
        </ul>
      </div>

      <!-- Детали пользователя -->
      <div v-if="tab === 'detail' && selectedUser">
        <input v-model="selectedUser.name" class="modal-input" placeholder="Имя" />
        <input v-model="selectedUser.email" class="modal-input" placeholder="Email" />
        <input v-model="selectedUser.telephone" class="modal-input" placeholder="Телефон" />

        <select v-model="selectedUser.sex" class="modal-input">
          <option disabled value="">Пол</option>
          <option :value="0">Мужской</option>
          <option :value="1">Женский</option>
        </select>

        <!-- ❌ Удалено: поле изменения роли -->

        <button class="submit-btn" @click="updateUser">Сохранить</button>
        <button class="cancel-btn" @click="tab = 'list'">Назад</button>
      </div>

      <!-- Кнопка закрытия -->
      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const tab = ref('list')
const users = ref([])
const selectedUser = ref(null)
const loading = ref(true)

// Получение пользователей
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/user')
    users.value = response.data
  } catch (error) {
    alert('Ошибка загрузки пользователей')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// При выборе пользователя переходим во вкладку detail
const selectUser = (user) => {
  selectedUser.value = { ...user } // копия объекта
  tab.value = 'detail'
}

// Обновление данных пользователя (без роли)
const updateUser = async () => {
  try {
    const payload = {
      name: selectedUser.value.name,
      email: selectedUser.value.email,
      telephone: selectedUser.value.telephone,
      sex: selectedUser.value.sex
    }

    await api.patch(`/user/${selectedUser.value.id}`, payload)
    alert('Пользователь обновлён')
    await fetchUsers()
    tab.value = 'list'
  } catch (error) {
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      alert('Ошибка:\n' + messages)
    } else {
      alert('Ошибка обновления')
      console.error(error)
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* (оставлен без изменений — как у модалки менеджеров) */
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
