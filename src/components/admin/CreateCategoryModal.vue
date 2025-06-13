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

const emit = defineEmits(['close'])

const createCategory = async () => {
  loading.value = true
  try {
    await api.post('/category', form.value)
    alert('Категория успешно создана')
    form.value.name = ''
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
  box-shadow: 0 4px 12px rgba(200, 75, 158, 0.4);
}

h2 {
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #e1bee7;
  text-align: center;
}

input {
  width: 100%;
  padding: 0.6rem 1rem;
  margin-bottom: 1.2rem;
  border-radius: 10px;
  border: none;
  background-color: #2a2a4a;
  color: #b0bec5;
  font-size: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

input::placeholder {
  color: #90a4ae;
}

input:focus {
  color: #e1f5fe;
  background-color: #3c3c7d;
  outline: none;
}

button[type='submit'] {
  background-color: #c84b9e;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  font-size: 1rem;
  transition: background-color 0.25s ease;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #d357b0;
}

button[type='submit']:disabled {
  background-color: #7a3f6a;
  cursor: default;
  opacity: 0.7;
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
  transition: color 0.25s ease;
}

.close-button:hover {
  color: #e066a6;
}
</style>
