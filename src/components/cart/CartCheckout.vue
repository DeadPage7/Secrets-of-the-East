<template>
  <div class="cart-checkout">
    <!-- Если выбран пункт выдачи -->
    <div v-if="selectedPoint" class="delivery-point-info">
      <h4>Пункт выдачи:</h4>
      <p>{{ selectedPoint.city }}, {{ selectedPoint.street }}, {{ selectedPoint.house }}</p>
      <p v-if="selectedPoint.additional_info">({{ selectedPoint.additional_info }})</p>
      <button class="change-point-btn" @click="changePoint">Изменить</button>
    </div>

    <!-- Если не выбран -->
    <div v-else class="no-point-selected">
      <p>Пункт выдачи не выбран</p>
      <button class="select-point-btn" @click="selectPoint">Выбрать пункт</button>
    </div>

    <!-- Итого и кнопка -->
    <h3>Итого</h3>
    <p class="total-cost">{{ totalCost }} ₽</p>

    <button
      class="order-btn"
      @click="placeOrder"
      :disabled="totalCost === 0 || !selectedPoint || isLoading"
    >
      {{ isLoading ? "Оформляем..." : "Оформить заказ" }}
    </button>

    <!-- Модалка -->
    <div v-if="modal.visible" class="modal-overlay" @click.self="modal.visible = false">
      <div class="modal-content">
        <h4>{{ modal.title }}</h4>
        <p>{{ modal.message }}</p>
        <button @click="modal.visible = false">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, onMounted} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import api from "@/services/api";

const props = defineProps({
  totalCost: {
    type: Number,
    default: 0,
  },
});

const store = useStore();
const route = useRoute();
const router = useRouter();

const isLoading = ref(false);

// Модальное окно для любых уведомлений
const modal = ref({
  visible: false,
  title: "",
  message: ""
});

// Получаем выбранный пункт
const selectedPoint = computed(() => store.state.selectedPoint);

// Выбрать/изменить пункт
const selectPoint = () => store.commit("setShowDeliveryModal", true);
const changePoint = () => store.commit("setShowDeliveryModal", true);

// Обработка оплаты Stripe через параметры success в URL
onMounted(() => {
  const success = route.query.success;
  if (success === "true") {
    showModal("Успешно", "Оплата прошла успешно. Заказ оформлен!");
  } else if (success === "false") {
    showModal("Отмена", "Вы отменили оплату. Заказ не был оформлен.");
  }

  // Удаляем параметр из URL
  if (success !== undefined) {
    const newQuery = {...route.query};
    delete newQuery.success;
    router.replace({query: newQuery});
  }
});

// Отправка заказа
const placeOrder = async () => {
  if (!selectedPoint.value) {
    showModal("Ошибка", "Пожалуйста, выберите пункт выдачи.");
    return;
  }

  isLoading.value = true;

  try {
    const response = await api.post("/order", {
      point_id: selectedPoint.value.id,
    });

    if (response.data.status === "payment_required") {
      // Переход на Stripe
      window.location.href = response.data.payment_url;
    } else {
      showModal("Успешно", "Заказ успешно оформлен без оплаты.");
    }
  } catch (error) {
    const msg = error.response?.data?.message || "Ошибка при оформлении заказа.";
    showModal("Ошибка", msg);
  } finally {
    isLoading.value = false;
  }
};

// Показ уведомления
function showModal(title, message) {
  modal.value.title = title;
  modal.value.message = message;
  modal.value.visible = true;
}
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

/* ====== Модальное окно ====== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: #2e2e4d;
  padding: 2rem;
  border-radius: 12px;
  color: #fff;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 20px rgba(255, 133, 193, 0.4);
}

.modal-content h4 {
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: #ff85c1;
}

.modal-content button {
  margin-top: 1.5rem;
  padding: 8px 20px;
  background-color: #c84b9e;
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-content button:hover {
  background-color: #ff85c1;
}
</style>
