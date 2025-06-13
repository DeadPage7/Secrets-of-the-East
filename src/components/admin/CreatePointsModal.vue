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

        <!-- Отображение ошибок -->
        <div v-if="errorMessageCreate" class="error-message">{{ errorMessageCreate }}</div>

        <button class="submit-btn" @click="handleCreate">Создать</button>
        <button class="cancel-btn" @click="switchTab('list')">Отмена</button>
      </div>

      <!-- Форма редактирования -->
      <div v-if="tab === 'edit'">
        <input v-model="city" type="text" placeholder="Город" class="modal-input" />
        <input v-model="street" type="text" placeholder="Улица" class="modal-input" />
        <input v-model="house" type="text" placeholder="Дом" class="modal-input" />

        <!-- Отображение ошибок -->
        <div v-if="errorMessageEdit" class="error-message">{{ errorMessageEdit }}</div>

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

// Поля формы (общие для создания и редактирования)
const city = ref('')
const street = ref('')
const house = ref('')

const editingId = ref(null) // ID редактируемого пункта

// Переменные для сообщений об ошибках (для двух форм отдельно)
const errorMessageCreate = ref('')
const errorMessageEdit = ref('')

// Получение списка пунктов выдачи с сервера
const fetchPoints = async () => {
  loading.value = true
  try {
    const response = await api.get('/point')
    points.value = response.data
  } catch (error) {
    errorMessageCreate.value = 'Ошибка загрузки пунктов выдачи'
    errorMessageEdit.value = 'Ошибка загрузки пунктов выдачи'
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Смена вкладки и очистка ошибок и формы при смене
const switchTab = (newTab) => {
  tab.value = newTab
  clearForm()
  editingId.value = null
  errorMessageCreate.value = ''
  errorMessageEdit.value = ''
}

// Очистка полей формы
const clearForm = () => {
  city.value = ''
  street.value = ''
  house.value = ''
}

// Создание нового пункта выдачи с обработкой ошибок из API
const handleCreate = async () => {
  // Проверка заполнения всех полей
  if (!city.value || !street.value || !house.value) {
    errorMessageCreate.value = 'Заполните все поля'
    return
  }
  errorMessageCreate.value = '' // Сброс ошибки перед запросом

  try {
    await api.post('/point', {
      city: city.value,
      street: street.value,
      house: house.value
    })
    // Успешное создание — переход к списку и обновление данных
    switchTab('list')
    await fetchPoints()
  } catch (error) {
    // Обработка ошибок, приходящих из Laravel API
    if (error.response?.status === 422) {
      // Валидационные ошибки
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      errorMessageCreate.value = messages
    } else if (error.response?.status === 403) {
      errorMessageCreate.value = 'Нет прав для создания пункта выдачи'
    } else {
      errorMessageCreate.value = 'Ошибка при создании пункта выдачи'
      console.error(error)
    }
  }
}

// Инициализация формы редактирования пунктом, заполнение полей
const startEdit = (point) => {
  editingId.value = point.id
  city.value = point.city
  street.value = point.street
  house.value = point.house
  errorMessageEdit.value = ''
  tab.value = 'edit'
}

// Сохранение изменений редактируемого пункта с обработкой ошибок
const handleEdit = async () => {
  if (!city.value || !street.value || !house.value) {
    errorMessageEdit.value = 'Заполните все поля'
    return
  }
  errorMessageEdit.value = ''

  try {
    await api.patch(`/point/${editingId.value}`, {
      city: city.value,
      street: street.value,
      house: house.value
    })
    // После успешного обновления — возврат к списку и обновление данных
    switchTab('list')
    await fetchPoints()
  } catch (error) {
    if (error.response?.status === 422) {
      const messages = Object.values(error.response.data.errors).flat().join('\n')
      errorMessageEdit.value = messages
    } else if (error.response?.status === 403) {
      errorMessageEdit.value = 'Нет прав для редактирования пункта выдачи'
    } else if (error.response?.status === 404) {
      errorMessageEdit.value = 'Пункт выдачи не найден'
    } else {
      errorMessageEdit.value = 'Ошибка при обновлении пункта выдачи'
      console.error(error)
    }
  }
}

// Удаление пункта с подтверждением и обработкой ошибок
const deletePoint = async (id) => {
  if (!confirm('Удалить пункт выдачи?')) return

  try {
    await api.delete(`/point/${id}`)
    await fetchPoints()
  } catch (error) {
    if (error.response?.status === 409) {
      alert('Нельзя удалить пункт выдачи: есть связанные заказы')
    } else if (error.response?.status === 403) {
      alert('Нет прав на удаление')
    } else if (error.response?.status === 404) {
      alert('Пункт выдачи не найден')
    } else {
      alert('Ошибка при удалении пункта')
      console.error(error)
    }
  }
}

onMounted(fetchPoints)
</script>

<style scoped>
/* Обновленный цвет для инпутов (как ты просил) */
.modal-input {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #c84b9e; /* твой основной цвет для бордера */
  background-color: #2e2e4e;
  color: white;
  font-size: 16px;
  transition: border-color 0.3s;
}

.modal-input:focus {
  outline: none;
  border-color: #ff85c1; /* светлый акцент при фокусе */
  background-color: #3a3a5e;
}

/* Класс для отображения ошибок из API и валидации */
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

/* Остальные стили оставлены без изменений */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
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
