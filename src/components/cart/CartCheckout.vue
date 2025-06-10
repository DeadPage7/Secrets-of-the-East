<template>
  <div class="cart-checkout">
    <!-- Информация о выбранном пункте выдачи -->
    <div v-if="selectedPoint" class="delivery-point-info">
      <h4>Пункт выдачи:</h4>
      <p>{{ selectedPoint.city }}, {{ selectedPoint.street }}, {{ selectedPoint.house }}</p>
      <p v-if="selectedPoint.additional_info">({{ selectedPoint.additional_info }})</p>
      <button class="change-point-btn" @click="changePoint">Изменить</button>
    </div>

    <!-- Если пункт выдачи не выбран -->
    <div v-else class="no-point-selected">
      <p>Пункт выдачи не выбран</p>
      <button class="select-point-btn" @click="selectPoint">Выбрать пункт</button>
    </div>

    <h3>Итого</h3>
    <!-- Отображение итоговой стоимости -->
    <p class="total-cost">{{ totalCost }} ₽</p>

    <!-- Кнопка оформления заказа -->
    <button
      class="order-btn"
      @click="placeOrder"
      :disabled="totalCost === 0 || !selectedPoint"
    >
      Оформить заказ
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

// Принимаем итоговую стоимость из пропсов
const props = defineProps({
  totalCost: {
    type: Number,
    default: 0,
  },
});

// Получаем выбранный пункт выдачи из Vuex
const selectedPoint = computed(() => store.state.selectedPoint);

// Функция оформления заказа
const placeOrder = () => {
  if (!selectedPoint.value) {
    alert("Пожалуйста, выберите пункт выдачи");
    return;
  }
  // Логика оформления заказа, например, отправка данных на сервер
  alert(`Заказ оформлен! Пункт выдачи: ${selectedPoint.value.city}, ${selectedPoint.value.street}`);
};

// Открытие модального окна выбора пункта
const selectPoint = () => {
  store.commit("setShowDeliveryModal", true);
};

// Изменение выбранного пункта
const changePoint = () => {
  store.commit("setShowDeliveryModal", true);
};
</script>

<style scoped>
.cart-checkout {
  width: 100%;
  max-width: 320px;
  padding: 2rem;
  background: #1a1a2e;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(255, 133, 193, 0.5);
  color: white;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.delivery-point-info,
.no-point-selected {
  width: 100%;
  background: #2e2e4d;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}

.delivery-point-info h4 {
  margin-bottom: 0.5rem;
  color: #ff85c1;
}

.change-point-btn,
.select-point-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background-color: #c84b9e;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.change-point-btn:hover,
.select-point-btn:hover {
  background-color: #ff85c1;
}

.cart-checkout h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #ff85c1;
}

.total-cost {
  font-size: 2rem;
  font-weight: bold;
  color: #c84b9e;
}

.order-btn {
  width: 100%;
  padding: 12px 0;
  background-color: #c84b9e;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.order-btn:hover:not(:disabled) {
  background-color: #ff85c1;
}

.order-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>
