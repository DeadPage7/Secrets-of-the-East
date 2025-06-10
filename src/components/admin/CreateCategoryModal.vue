<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-window">
      <h2>Создание категории</h2>

      <form @submit.prevent="createCategory">
        <!-- Поле ввода названия категории -->
        <input
          v-model="form.name"
          type="text"
          placeholder="Название категории"
          required
        />

        <!-- Кнопка отправки формы -->
        <button type="submit" :disabled="loading">
          {{ loading ? 'Создание...' : 'Создать категорию' }}
        </button>
      </form>

      <!-- Кнопка закрытия -->
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const form = ref({
  name: '',
})

const loading = ref(false)

const createCategory = async () => {
  loading.value = true
  try {
    await api.post('/category', form.value)
    alert('Категория успешно создана')
    form.value.name = ''
    // Закрываем окно
    emit('close')
  } catch (error) {
    alert(error.response?.data?.message || 'Ошибка при создании категории')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-window {
  background: #1a1a2e;
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  color: white;
  position: relative;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  border: none;
}

button[type='submit'] {
  background-color: #c84b9e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
