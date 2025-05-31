<template>
  <div class="admin-modal">
    <div class="modal-content">
      <h2 class="title">Панель управления</h2>
      <p class="subtitle">Выберите действие:</p>

      <div class="button-list">
        <!-- Если роль менеджер (2) -->
        <template v-if="isManager">
          <button class="admin-btn" @click="showCreateProduct = true">Создать товар</button>
          <button class="admin-btn" @click="goToCreateColor">Создать цвет</button>
          <button class="admin-btn" @click="goToCreateSize">Создать размер</button>
        </template>

        <!-- Если роль администратор (1) -->
        <template v-if="isAdmin">
          <button class="admin-btn" @click="goToCreateManager">Создать менеджера</button>
        </template>

        <button class="close-btn" @click="$emit('close')">Закрыть</button>
      </div>
    </div>

    <!-- Вложенное модальное окно создания товара -->
    <CreateProductModal v-if="showCreateProduct" @close="showCreateProduct = false" />
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'
import {computed, ref} from 'vue'
import {useStore} from 'vuex'
import CreateProductModal from '../admin/CreateProductModal.vue'  // компонент создания товара

const router = useRouter()
const store = useStore()
const showCreateProduct = ref(false)  // показывать форму создания товара или нет

// Получаем роль пользователя из Vuex (1 - админ, 2 - менеджер)
const userRole = computed(() => Number(store.state.user?.role || 0))
const isAdmin = computed(() => userRole.value === 1)
const isManager = computed(() => userRole.value === 2)

// Навигация на страницы создания цветов, размеров, менеджеров
const goToCreateColor = () => router.push('/admin/colors/create')
const goToCreateSize = () => router.push('/admin/sizes/create')
const goToCreateManager = () => router.push('/admin/users/create-manager')
</script>

<style scoped>
/* Основные стили для модального окна с затемнением и центрированием */
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
  z-index: 50;
}

.modal-content {
  background: #1a1a2e;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 0 20px #c84b9e88;
  max-width: 500px;
  width: 100%;
  color: #fff;
}

.title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #ff85c1;
}

.subtitle {
  font-size: 18px;
  margin-bottom: 20px;
}

.button-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
}

.admin-btn:hover,
.close-btn:hover {
  background-color: #ff85c1;
  transform: scale(1.05);
}
</style>
