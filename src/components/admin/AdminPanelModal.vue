<template>
  <!-- Основная модалка панели управления -->
  <div class="admin-modal">
    <div class="modal-content">
      <h2 class="title">Панель управления</h2>
      <p class="subtitle">Выберите действие:</p>

      <div class="button-list">
        <!-- Кнопки для менеджера и администратора -->
        <template v-if="isManager || isAdmin">
          <button class="admin-btn" @click="showCreateProduct = true">Создать товар</button>
          <!-- Управляем открытием модалки заказов через метод -->
          <button class="admin-btn" @click="openUserOrdersModal">Заказы</button>
        </template>

        <!-- Кнопки только для администратора -->
        <template v-if="isAdmin">
          <button class="admin-btn" @click="showCreateManager = true">Менеджеры</button>
          <button class="admin-btn" @click="showCreateCategory = true">Создать категорию</button>
          <button class="admin-btn" @click="showCreatePoint = true">Пункт выдачи</button>
        </template>

        <button class="close-btn" @click="$emit('close')">Закрыть</button>
      </div>
    </div>

    <!-- Вложенные модальные окна -->
    <CreateProductModal v-if="showCreateProduct" @close="showCreateProduct = false" />
    <CreateManagerModal v-if="showCreateManager" @close="showCreateManager = false" />
    <CreatePointsModal v-if="showCreatePoint" @close="showCreatePoint = false" />
    <UserOrdersModal v-if="showUserOrdersModal" @close="showUserOrdersModal = false" />
    <CreateCategoryModal v-if="showCreateCategory" @close="showCreateCategory = false" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'

import CreateProductModal from '../admin/CreateProductModal.vue'
import CreateManagerModal from '../admin/CreateManagerModal.vue'
import CreatePointsModal from '../admin/CreatePointsModal.vue'
import UserOrdersModal from '../admin/UserOrdersModal.vue'
import CreateCategoryModal from '../admin/CreateCategoryModal.vue'

const showCreateProduct = ref(false)
const showCreateManager = ref(false)
const showCreatePoint = ref(false)
const showUserOrdersModal = ref(false)
const showCreateCategory = ref(false)

const store = useStore()

const userRole = computed(() => Number(store.state.user?.role || 0))
const isAdmin = computed(() => userRole.value === 1)
const isManager = computed(() => userRole.value === 2)

// Метод для повторного открытия модалки заказов
function openUserOrdersModal() {
  showUserOrdersModal.value = false
  nextTick(() => {
    showUserOrdersModal.value = true
  })
}
</script>

<style scoped>
.admin-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* затемнение фона */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background-color: #1a1a2e;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 0 20px #c84b9e88;
  max-width: 500px;
  width: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #ff85c1;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
}

.button-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.admin-btn,
.close-btn {
  background-color: #c84b9e;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.admin-btn:hover,
.close-btn:hover {
  background-color: #ff85c1;
  transform: scale(1.05);
}
</style>
