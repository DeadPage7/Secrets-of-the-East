<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Пункты выдачи</h2>

      <!-- Навигация вкладок: список / создание / редактирование -->
      <div class="tabs">
        <button :class="{active: tab === 'list'}" @click="switchTab('list')">Список</button>
        <button :class="{active: tab === 'create'}" @click="switchTab('create')">Создать</button>
        <button v-if="tab === 'edit'" :class="{active: tab === 'edit'}" disabled>Редактировать</button>
      </div>

      <!-- Список пунктов выдачи -->
      <div v-if="tab === 'list'">
        <div v-if="loading">Загрузка...</div>
        <ul v-else class="points-list">
          <li v-for="point in points" :key="point.id" class="point-item">
            <div>
              <strong>{{ point.city }}, {{ point.street }}, д. {{ point.house }}</strong>
            </div>
            <div>
              <button class="edit-btn" @click="startEdit(point)">Редактировать</button>
              <button class="delete-btn" @click="deletePoint(point.id)">Удалить</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Форма создания -->
      <div v-if="tab === 'create'">
        <input v-model="city" type="text" placeholder="Город" class="modal-input" />
        <input v-model="street" type="text" placeholder="Улица" class="modal-input" />
        <input v-model="house" type="text" placeholder="Дом" class="modal-input" />

        <button class="submit-btn" @click="handleCreate">Создать</button>
        <button class="cancel-btn" @click="switchTab('list')">Отмена</button>
      </div>

      <!-- Форма редактирования -->
      <div v-if="tab === 'edit'">
        <input v-model="city" type="text" placeholder="Город" class="modal-input" />
        <input v-model="street" type="text" placeholder="Улица" class="modal-input" />
        <input v-model="house" type="text" placeholder="Дом" class="modal-input" />

        <button class="submit-btn" @click="handleEdit">Сохранить</button>
        <button class="cancel-btn" @click="switchTab('list')">Отмена</button>
      </div>

      <!-- Кнопка закрыть -->
      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const tab = ref('list')

const points = ref([])
const loading = ref(false)

// Поля формы (используются и для создания, и для редактирования)
const city = ref('')
const street = ref('')
const house = ref('')

const editingId = ref(null) // id пункта, который редактируется

const fetchPoints = async () => {
  loading.value = true
  try {
    const response = await api.get('/point')
    points.value = response.data
  } catch (error) {
    alert('Ошибка загрузки пунктов выдачи')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const switchTab = (newTab) => {
  tab.value = newTab
  if (newTab !== 'edit') {
    clearForm()
    editingId.value = null
  }
}

const clearForm = () => {
  city.value = ''
  street.value = ''
  house.value = ''
}

const handleCreate = async () => {
  if (!city.value || !street.value || !house.value) {
    alert('Заполните все поля')
    return
  }

  try {
    await api.post('/point', {
      city: city.value,
      street: street.value,
      house: house.value
    })
    alert('Пункт выдачи создан')
    switchTab('list')
    await fetchPoints()
  } catch (error) {
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      alert('Ошибка:\n' + messages)
    } else if (error.response?.status === 403) {
      alert('Нет прав для создания пункта выдачи')
    } else {
      alert('Ошибка при создании пункта выдачи')
      console.error(error)
    }
  }
}

const startEdit = (point) => {
  editingId.value = point.id
  city.value = point.city
  street.value = point.street
  house.value = point.house
  tab.value = 'edit'
}

const handleEdit = async () => {
  if (!city.value || !street.value || !house.value) {
    alert('Заполните все поля')
    return
  }
  try {
    await api.patch(`/point/${editingId.value}`, {
      city: city.value,
      street: street.value,
      house: house.value
    })
    alert('Пункт выдачи обновлен')
    switchTab('list')
    await fetchPoints()
  } catch (error) {
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      alert('Ошибка:\n' + messages)
    } else if (error.response?.status === 403) {
      alert('Нет прав для редактирования пункта выдачи')
    } else {
      alert('Ошибка при обновлении пункта выдачи')
      console.error(error)
    }
  }
}

const deletePoint = async (id) => {
  if (!confirm('Удалить пункт выдачи?')) return

  try {
    await api.delete(`/point/${id}`)
    alert('Пункт выдачи удалён')
    await fetchPoints()
  } catch (error) {
    if (error.response?.status === 409) {
      alert('Нельзя удалить пункт выдачи: есть связанные заказы')
    } else if (error.response?.status === 403) {
      alert('Нет прав на удаление')
    } else {
      alert('Ошибка при удалении пункта')
      console.error(error)
    }
  }
}

onMounted(fetchPoints)
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
  width: 480px;
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

.points-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}
.point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2e2e4e;
  padding: 10px 15px;
  border-radius: 10px;
  margin-bottom: 10px;
  gap: 10px;
}

.point-item > div:first-child {
  flex-grow: 1;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
}

/* Контейнер для кнопок */
.point-item > div:last-child {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.2;
  transition: background-color 0.3s;
  user-select: none;
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-btn {
  background-color: #e74c3c;
}

.edit-btn:hover {
  background-color: #2980b9;
}
.delete-btn:hover {
  background-color: #c0392b;
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
