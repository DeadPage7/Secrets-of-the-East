<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>

      <h2>Редактирование товара</h2>

      <div v-if="loading">Загрузка товара...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else>
        <form @submit.prevent="submitForm">

          <!-- Основные поля товара -->
          <label>
            Название:
            <input type="text" v-model="form.name" required />
          </label>

          <label>
            Описание:
            <textarea v-model="form.description" rows="3"></textarea>
          </label>

          <label>
            Цена:
            <input type="number" v-model.number="form.price" min="0" required />
          </label>

          <label>
            Количество на складе (общее):
            <input type="number" v-model.number="form.quantity" min="0" />
          </label>

          <label>
            Пол (sex):
            <select v-model.number="form.sex">
              <option :value="0">Не указан</option>
              <option :value="1">Мужской</option>
              <option :value="2">Женский</option>
            </select>
          </label>

          <!-- Категория -->
          <label>
            Категория:
            <select v-model.number="form.category_id" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </label>

          <!-- Страна -->
          <label>
            Страна:
            <select v-model.number="form.country_id" required>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
          </label>

          <hr />

          <!-- Редактирование остатков по цветам и размерам -->
          <h3>Цвета и размеры (остатки)</h3>

          <div v-for="(pcs, index) in form.product_color_sizes" :key="pcs.id" class="color-size-row">
            <select v-model.number="pcs.color_id" required>
              <option v-for="color in colors" :key="color.id" :value="color.id">
                {{ color.name }}
              </option>
            </select>

            <select v-model.number="pcs.size_id" required>
              <option v-for="size in sizes" :key="size.id" :value="size.id">
                {{ size.name }}
              </option>
            </select>

            <input type="number" v-model.number="pcs.quantity" min="0" />

            <button type="button" @click="removeColorSize(index)">Удалить</button>
          </div>

          <button type="button" @click="addColorSize">Добавить цвет и размер</button>

          <hr />

          <button type="submit" :disabled="loadingSubmit">
            {{ loadingSubmit ? 'Сохраняем...' : 'Сохранить' }}
          </button>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '@/services/api';

// Принимаем productId в пропсах
const props = defineProps({
  productId: {
    type: [Number, String],
    required: true
  }
});
const emits = defineEmits(['close', 'updated']);

// Состояния загрузки, ошибок и данных
const loading = ref(false);
const loadingSubmit = ref(false);
const error = ref(null);
const product = ref(null);

// Данные для селектов категорий, стран, цветов, размеров — нужно загрузить из API отдельно или передать из родителя
const categories = ref([]);
const countries = ref([]);
const colors = ref([]);
const sizes = ref([]);

// Форма редактирования, по умолчанию пустая структура с нужными полями
const form = ref({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  sex: 0,
  category_id: null,
  country_id: null,
  product_color_sizes: []
});

// Функция для загрузки справочных данных (категорий, стран, цветов и размеров)
async function loadReferenceData() {
  try {
    // Запрашиваем все справочные данные параллельно
    const [catRes, countryRes, colorRes, sizeRes] = await Promise.all([
      api.get('/category'),  // путь для категорий
      api.get('/country'),   // путь для стран
      api.get('/colors'),    // путь для цветов
      api.get('/sizes'),     // путь для размеров
    ]);
    // Записываем полученные данные в реактивные переменные
    categories.value = catRes.data;
    countries.value = countryRes.data;
    colors.value = colorRes.data;
    sizes.value = sizeRes.data;
  } catch (e) {
    // Логируем ошибку загрузки справочных данных
    console.error('Ошибка загрузки справочных данных:', e);
    error.value = 'Ошибка загрузки справочных данных';
  }
}

// Загрузка данных товара по id
async function fetchProduct(id) {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get(`/product/${id}`);
    product.value = response.data;

    // Копируем данные в форму
    form.value.name = product.value.name || '';
    form.value.description = product.value.description || '';
    form.value.price = Number(product.value.price) || 0;
    form.value.quantity = product.value.quantity || 0;
    form.value.sex = product.value.sex || 0;
    form.value.category_id = product.value.category_id || null;
    form.value.country_id = product.value.country_id || null;

    // Копируем массив product_color_sizes, если есть
    form.value.product_color_sizes = (product.value.product_color_sizes || []).map(pcs => ({
      id: pcs.id,
      color_id: pcs.color_id,
      size_id: pcs.size_id,
      quantity: pcs.quantity,
    }));
  } catch (e) {
    error.value = 'Ошибка загрузки товара';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// Следим за изменением productId, чтобы загрузить новый товар
watch(() => props.productId, (newId) => {
  if (newId) {
    fetchProduct(newId);
  }
}, { immediate: true });

// Загрузка справочных данных при монтировании компонента
onMounted(() => {
  loadReferenceData();
});

// Добавить новый блок цвет+размер+кол-во
function addColorSize() {
  form.value.product_color_sizes.push({
    id: null,
    color_id: null,
    size_id: null,
    quantity: 0
  });
}

// Удалить блок по индексу
function removeColorSize(index) {
  form.value.product_color_sizes.splice(index, 1);
}

// Закрытие модалки
function close() {
  emits('close');
}

// Отправка данных на сервер
async function submitForm() {
  loadingSubmit.value = true;
  error.value = null;

  try {
    // Отправляем обновлённые данные на сервер
    await api.put(`/product/${props.productId}`, form.value);
    emits('updated'); // Уведомляем родителя об обновлении
    close(); // Закрываем модалку
  } catch (e) {
    error.value = 'Ошибка при сохранении данных';
    console.error(e);
  } finally {
    loadingSubmit.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 26, 46, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  color: #fff;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 22px;
  background: transparent;
  border: none;
  color: #ff85c1;
  cursor: pointer;
  transition: color 0.3s ease;
}
.close-button:hover {
  color: #ff4da6;
}

label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #f0c6f7;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 8px 12px;
  margin-top: 6px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1.5px solid #6a4b99;
  background: #2c2c4a;
  color: #fff;
  font-weight: 500;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #ff85c1;
  background: #3a2c5a;
}

button[type="submit"] {
  background: #ff85c1;
  border: none;
  padding: 12px 24px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  color: #1a1a2e;
  font-size: 16px;
  margin-top: 15px;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background: #ff4da6;
}

button[type="submit"]:disabled {
  background: #a86a8c;
  cursor: default;
}

.color-size-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}

.color-size-row select,
.color-size-row input {
  flex: 1;
  border-radius: 10px;
  border: 1.5px solid #6a4b99;
  background: #2c2c4a;
  color: #fff;
  font-weight: 500;
  padding: 6px 10px;
  transition: border-color 0.3s ease;
}

.color-size-row select:focus,
.color-size-row input:focus {
  outline: none;
  border-color: #ff85c1;
  background: #3a2c5a;
}

.color-size-row button {
  flex: 0 0 auto;
  padding: 6px 12px;
  background: #ff85c1;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  color: #1a1a2e;
  transition: background-color 0.3s ease;
}

.color-size-row button:hover {
  background: #ff4da6;
}

.error-message {
  color: #ff4da6;
  margin-bottom: 15px;
  font-weight: 700;
}
</style>
