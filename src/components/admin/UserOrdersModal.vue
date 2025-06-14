<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h2 class="modal-title">Мои заказы</h2>

      <!-- Вкладки -->
      <div class="tabs">
        <button :class="{ active: tab === 'list' }" @click="tab = 'list'">
          Список заказов
        </button>
        <button v-if="selectedOrder" :class="{ active: tab === 'details' }" @click="tab = 'details'">
          Детали заказа
        </button>
      </div>

      <!-- Список заказов -->
      <div v-if="tab === 'list'">
        <div v-if="loading">Загрузка...</div>
        <div v-else-if="!orders.length">Нет заказов</div>
        <ul v-else class="order-list">
          <li v-for="order in orders" :key="order.id" class="order-item" @click="loadOrderDetails(order.id)">
            <strong>Заказ №{{ order.id }}</strong><br />
            Статус: {{ order.status }}<br />
            Дата: {{ formatDate(order.order_date) }}<br />
            Адрес: {{ formatAddress(order.address) }}<br />
            Сумма: {{ order.total_cost }} ₽
          </li>
        </ul>
      </div>

      <!-- Детали заказа -->
      <div v-if="tab === 'details' && selectedOrder" class="order-details">
        <h3>Заказ №{{ selectedOrder.id }}</h3>
        <p>Дата: {{ formatDate(selectedOrder.order_date) }}</p>
        <p>Адрес: {{ formatAddress(selectedOrder.address) }}</p>
        <p>Итого: {{ selectedOrder.total_cost }} ₽</p>

        <!-- Селект для смены статуса -->
        <label>Статус:</label>
        <select v-model="selectedStatusId" @change="updateOrderStatus">
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>

        <h4>Товары:</h4>
        <ul>
          <li v-for="item in selectedOrder.items" :key="item.product_id" class="item-block">
            <img :src="item.photo" alt="Фото товара" />
            <div>
              <strong>{{ item.name }}</strong><br />
              {{ item.quantity }} шт. по {{ item.price }} ₽<br />
              Цвет: {{ item.color || '—' }}, Размер: {{ item.size || '—' }}<br />
              Сумма: {{ item.total }} ₽
            </div>
          </li>
        </ul>

        <button @click="tab = 'list'" class="back-btn">Назад к списку</button>
      </div>

      <button class="close-modal-btn" @click="emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const tab = ref('list')
const orders = ref([])
const selectedOrder = ref(null)
const loading = ref(false)
const statuses = ref([])
const selectedStatusId = ref(null)

// Получение списка заказов
async function fetchOrders() {
  loading.value = true
  try {
    const res = await api.get('/order')
    orders.value = Array.isArray(res.data) ? res.data : res.data.data || []
  } catch (e) {
    alert('Ошибка загрузки заказов')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Загрузка деталей заказа
async function loadOrderDetails(id) {
  loading.value = true
  try {
    const res = await api.get(`/order/${id}`)
    selectedOrder.value = res.data
    selectedStatusId.value = res.data.status_id // выбранный статус
    tab.value = 'details'
  } catch (e) {
    alert('Ошибка при загрузке деталей')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Загрузка списка возможных статусов
async function fetchStatuses() {
  try {
    const res = await api.get('/statuses') // <--- Исправлено: правильный путь
    statuses.value = Array.isArray(res.data) ? res.data : res.data.data || []
  } catch (e) {
    console.error('Ошибка загрузки статусов', e)
  }
}
// Обновление статуса заказа
async function updateOrderStatus() {
  try {
    await api.patch(`/order/${selectedOrder.value.id}`, {
      status_id: selectedStatusId.value,
    })

    // Повторная загрузка данных для актуализации
    await loadOrderDetails(selectedOrder.value.id)
    await fetchOrders()

    alert('Статус обновлён')
  } catch (e) {
    console.error('Ошибка обновления статуса', e)
    alert('Не удалось обновить статус')
  }
}

// Формат даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Формат адреса
function formatAddress(addr) {
  if (!addr) return '—'
  if (typeof addr === 'string') return addr
  return [addr.city, addr.street, addr.house].filter(Boolean).join(', ')
}

// Первичная загрузка
onMounted(() => {
  fetchOrders()
  fetchStatuses()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #1a1a2e;
  padding: 30px;
  border-radius: 20px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 20px #c84b9e88;
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}
.modal-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #ff85c1;
  text-align: center;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  background-color: #2c2c4e;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.tabs button.active {
  background-color: #c84b9e;
}
.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
}
.order-item {
  background: #2e2e4e;
  padding: 12px 15px;
  margin-bottom: 10px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;
}
.order-item:hover {
  background-color: #3a3a5e;
}
.order-details {
  padding: 10px;
  flex-grow: 1;
  overflow-y: auto;
}
.item-block {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  background: #2e2e4e;
  padding: 10px;
  border-radius: 10px;
}
.item-block img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
.back-btn {
  margin-top: 20px;
  background-color: #c84b9e;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  transition: background-color 0.3s;
}
.back-btn:hover {
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
  font-weight: bold;
  transition: background-color 0.3s;
}
.close-modal-btn:hover {
  background-color: #777;
}
select {
  padding: 8px;
  margin-top: 8px;
  margin-bottom: 12px;
  border-radius: 8px;
  width: 100%;
}
</style>
