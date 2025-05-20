<template>
  <div class="cart-checkout">
    <h3>Итого</h3>
    <p class="total-cost">{{ totalCost }} ₽</p>
    <button class="order-btn" @click="placeOrder" :disabled="totalCost === 0">
      Оформить заказ
    </button>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  totalCost: {
    type: Number,
    default: 0,
  },
});

const placeOrder = () => {
  alert("Функция оформления заказа пока не реализована");
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
