<template>
  <!-- Основная модалка панели управления -->
  <div class="admin-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="title">Панель управления</h2>
        <p class="subtitle">Выберите действие:</p>
      </div>

      <div class="button-list">
        <!-- Кнопки для менеджера и администратора -->
        <template v-if="isManager || isAdmin">
          <button class="admin-btn" @click="showCreateProduct = true">Создать товар</button>
          <button class="admin-btn" @click="openUserOrdersModal">Заказы</button>
        </template>

        <!-- Кнопки только для администратора -->
        <template v-if="isAdmin">
          <button class="admin-btn" @click="showCreateManager = true">Менеджеры</button>
          <button class="admin-btn" @click="showCreateCategory = true">Категории</button>
          <button class="admin-btn" @click="showCreatePoint = true">Пункты выдачи</button>
          <button class="admin-btn" @click="showAllUsersModal = true">Пользователи</button>
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
    <AllUsersModal v-if="showAllUsersModal" @close="showAllUsersModal = false" />
  </div>
</template>

<script setup>
import {ref, computed, nextTick} from 'vue'
import {useStore} from 'vuex'

// Импорты компонентов
import CreateProductModal from '../admin/CreateProductModal.vue'
import CreateManagerModal from '../admin/CreateManagerModal.vue'
import CreatePointsModal from '../admin/CreatePointsModal.vue'
import UserOrdersModal from '../admin/UserOrdersModal.vue'
import CreateCategoryModal from '../admin/CreateCategoryModal.vue'
import AllUsersModal from '../admin/AllUsersModal.vue'

// Переменные управления видимостью окон
const showCreateProduct = ref(false)
const showCreateManager = ref(false)
const showCreatePoint = ref(false)
const showUserOrdersModal = ref(false)
const showCreateCategory = ref(false)
const showAllUsersModal = ref(false)

// Получаем роль из store
const store = useStore()
const userRole = computed(() => Number(store.state.user?.role || 0))
const isAdmin = computed(() => userRole.value === 1)
const isManager = computed(() => userRole.value === 2)

// Метод повторного открытия модалки заказов
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(200, 75, 158, 0.2);
  max-width: 500px;
  width: 90%;
  color: #fff;
  border: 1px solid rgba(200, 75, 158, 0.3);
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ff85c1, #c84b9e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
}

.subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.button-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.admin-btn,
.close-btn {
  background: rgba(200, 75, 158, 0.2);
  border: 1px solid rgba(200, 75, 158, 0.4);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
}

.admin-btn:hover {
  background: rgba(200, 75, 158, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 75, 158, 0.3);
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 10px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
