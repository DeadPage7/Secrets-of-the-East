<template>
  <!-- Оверлей модалки, клик по нему закрывает окно -->
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2 class="modal-title">Мои заказы</h2>

      <!-- Вкладки: список заказов и детали заказа -->
      <div class="tabs">
        <!-- Кнопка для списка заказов -->
        <button :class="{ active: tab === 'list' }" @click="tab = 'list'">
          Список заказов
        </button>
        <!-- Кнопка для деталей заказа отображается, если выбран заказ -->
        <button v-if="selectedOrder" :class="{ active: tab === 'details' }" @click="tab = 'details'">
          Детали заказа
        </button>
      </div>

      <!-- Вкладка "Список заказов" -->
      <div v-if="tab === 'list'">
        <div v-if="loading">Загрузка...</div>
        <div v-else-if="!orders.length">Нет заказов</div>
        <ul v-else class="order-list">
          <!-- Список заказов -->
          <li
            v-for="order in orders"
            :key="order.id"
            class="order-item"
            @click="loadOrderDetails(order.id)"
          >
            <strong>Заказ №{{ order.id }}</strong><br />
            <span>Статус: <strong>{{ order.status }}</strong></span><br />
            Дата: {{ formatDate(order.order_date) }}<br />
            Адрес: {{ formatAddress(order.address) }}<br />
            Сумма: {{ order.total_cost }} ₽
          </li>
        </ul>
      </div>

      <!-- Вкладка "Детали заказа" -->
      <div v-if="tab === 'details' && selectedOrder" class="order-details">
        <h3>Заказ №{{ selectedOrder.id }}</h3>
        <p>Дата: {{ formatDate(selectedOrder.order_date) }}</p>
        <p>Адрес: {{ formatAddress(selectedOrder.address) }}</p>
        <p>Итого: {{ selectedOrder.total_cost }} ₽</p>

        <p>Статус: <strong>{{ selectedOrder.status }}</strong></p>

        <h4>Товары:</h4>
        <ul class="items-list">
          <li v-for="item in selectedOrder.items" :key="item.product_id" class="item-card">
            <img :src="item.photo" alt="Фото товара" />
            <div class="item-info">
              <strong class="item-name">{{ item.name }}</strong>
              <div class="item-quantity-price">
                {{ item.quantity }} шт
              </div>
              <div class="item-params">
                Цвет: <span>{{ item.color || '—' }}</span>, Размер: <span>{{ item.size || '—' }}</span>
              </div>
            </div>
          </li>
        </ul>

        <!-- Кнопка для отмены заказа -->
        <button
          @click="cancelOrder"
          class="cancel-btn"
          :disabled="cancelLoading"
          v-if="selectedOrder.status !== 'Отменён' && selectedOrder.status !== 'Выполнен'"
        >
          {{ cancelLoading ? 'Отмена...' : 'Отменить заказ' }}
        </button>

      </div>

      <!-- Кнопка закрытия модалки -->
      <button class="close-modal-btn" @click="closeModal">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// Событие для закрытия модалки
const emit = defineEmits(['close'])

const tab = ref('list')
const orders = ref([])
const selectedOrder = ref(null)
const loading = ref(false)
const cancelLoading = ref(false)

// Закрыть модалку
function closeModal() {
  emit('close')
}

// Загрузить список заказов с сервера
async function fetchOrders() {
  loading.value = true
  try {
    const res = await api.get('/order')
    // Если данные в data.data или в data
    orders.value = Array.isArray(res.data) ? res.data : res.data.data || []
  } catch (e) {
    alert('Ошибка загрузки заказов')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Загрузить детали заказа по id
async function loadOrderDetails(id) {
  loading.value = true
  try {
    const res = await api.get(`/order/${id}`)
    selectedOrder.value = res.data
    tab.value = 'details'
  } catch (e) {
    alert('Ошибка при загрузке деталей заказа')
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Отмена заказа с запросом на сервер
async function cancelOrder() {
  if (!selectedOrder.value) return;
  if (!confirm('Вы уверены, что хотите отменить заказ?')) return;

  cancelLoading.value = true;
  try {
    // Отправляем PATCH запрос на правильный URL для отмены
    await api.patch(`/order/cancelled/${selectedOrder.value.id}`);

    alert('Заказ отменён');
    await fetchOrders();
    selectedOrder.value = null;
    tab.value = 'list';
  } catch (e) {
    alert('Ошибка при отмене заказа');
    console.error(e);
  } finally {
    cancelLoading.value = false;
  }
}

// Форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) + ' ' + d.toLocaleTimeString('ru-RU', {
    hour: '2-digit', minute: '2-digit'
  })
}

// Форматирование адреса
function formatAddress(addr) {
  if (!addr) return '—'
  if (typeof addr === 'string') return addr
  return [addr.city, addr.street, addr.house].filter(Boolean).join(', ')
}

// При монтировании загружаем список заказов
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
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

/* Новый стиль для списка товаров */
.items-list {
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Карточка товара */
.item-card {
  display: flex;
  gap: 20px;
  background: #2e2e4e;
  padding: 15px 20px;
  border-radius: 15px;
  align-items: center;
  box-shadow: 0 3px 10px rgba(200, 75, 158, 0.4);
  transition: background-color 0.3s;
}

.item-card:hover {
  background-color: #3a3a5e;
}

/* Картинка товара */
.item-card img {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0; /* Не сжимать изображение */
  box-shadow: 0 0 10px #c84b9e88;
}

/* Информация о товаре */
.item-info {
  display: flex;
  flex-direction: column;
  color: #fff;
  font-size: 16px;
  user-select: none;
}

/* Название товара */
.item-name {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 6px;
  color: #ff85c1;
}

/* Количество и цена */
.item-quantity-price {
  margin-bottom: 6px;
  color: #f0d3f7;
}

/* Цвет и размер */
.item-params span {
  color: #d7a9df;
  font-weight: 600;
}

.close-modal-btn {
  margin-top: 15px;
  background-color: #c84b9e;
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

/* Новый стиль для кнопки отмены */
.cancel-btn {
  margin-top: 15px;
  background-color: #e03e3e;
  width: 100%;
  border-radius: 12px;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #ff5555;
}

.cancel-btn:disabled {
  background-color: #a33a3a;
  cursor: not-allowed;
}
</style>
