<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Кнопка закрытия модального окна -->
      <button class="close-button" @click="close">×</button>

      <h2>Редактирование товара</h2>

      <!-- Статусы загрузки и ошибок -->
      <div v-if="loading">Загрузка товара...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else>
        <!-- Контейнер с прокруткой для формы -->
        <div class="modal-scrollable-content">
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

            <div
              v-for="(pcs, index) in form.product_color_sizes"
              :key="pcs.id || index"
              class="color-size-row"
            >
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

            <!-- Кнопка добавления новой пары цвет+размер с улучшенным стилем -->
            <button
              type="button"
              class="add-color-size-btn"
              @click="addColorSize"
            >
              Добавить цвет и размер
            </button>

            <hr />

            <!-- Кнопка сохранения с индикацией загрузки -->
            <button type="submit" :disabled="loadingSubmit">
              {{ loadingSubmit ? 'Сохраняем...' : 'Сохранить' }}
            </button>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';
import api from '@/services/api';

// Пропсы — id товара для редактирования
const props = defineProps({
  productId: {
    type: [Number, String],
    required: true
  }
});

// События для закрытия модалки и обновления списка
const emits = defineEmits(['close', 'updated']);

// Состояния загрузки и ошибок
const loading = ref(false);
const loadingSubmit = ref(false);
const error = ref(null);

// Справочные данные
const categories = ref([]);
const countries = ref([]);
const colors = ref([]);
const sizes = ref([]);

// Данные формы
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

// Загрузка справочных данных (категории, страны, цвета, размеры)
async function loadReferenceData() {
  try {
    const [catRes, countryRes, colorRes, sizeRes] = await Promise.all([
      api.get('/category'),
      api.get('/country'),
      api.get('/colors'),
      api.get('/sizes'),
    ]);
    categories.value = catRes.data;
    countries.value = countryRes.data;
    colors.value = colorRes.data;
    sizes.value = sizeRes.data;
  } catch (e) {
    console.error('Ошибка загрузки справочных данных:', e);
    error.value = 'Ошибка загрузки справочных данных';
  }
}

// Загрузка данных товара по ID
async function fetchProduct(id) {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get(`/product/${id}`);
    const product = response.data;

    // Заполняем форму данными товара
    form.value.name = product.name || '';
    form.value.description = product.description || '';
    form.value.price = Number(product.price) || 0;
    form.value.quantity = product.quantity || 0;
    form.value.sex = product.sex || 0;
    form.value.category_id = product.category_id || null;
    form.value.country_id = product.country_id || null;

    // Копируем массив product_color_sizes для редактирования
    form.value.product_color_sizes = (product.product_color_sizes || []).map(pcs => ({
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

// Перезагружаем данные при изменении productId
watch(() => props.productId, (id) => {
  if (id) {
    fetchProduct(id);
  }
}, {immediate: true});

// Загружаем справочные данные при монтировании компонента
onMounted(() => {
  loadReferenceData();
});

// Добавить новую пару цвет + размер
function addColorSize() {
  form.value.product_color_sizes.push({
    id: null,
    color_id: null,
    size_id: null,
    quantity: 0
  });
}

// Удалить пару по индексу
function removeColorSize(index) {
  form.value.product_color_sizes.splice(index, 1);
}

// Закрыть модальное окно
function close() {
  emits('close');
}

// Отправить обновленные данные на сервер
async function submitForm() {
  loadingSubmit.value = true;
  error.value = null;
  try {
    await api.patch(`/product/${props.productId}`, form.value);
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
/* Фон и центрирование модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Само модальное окно */
.modal-content {
  background: #1a1a2e;
  padding: 20px;
  border-radius: 12px;
  width: 500px;
  max-width: 95%;
  position: relative;
  max-height: 90vh; /* ограничение высоты окна */
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* Убираем overflow здесь, чтобы прокрутка была внутри вложенного контейнера */
  /* overflow-y: auto; */
}

/* Контейнер с прокруткой для формы */
.modal-scrollable-content {
  max-height: 70vh; /* ограничиваем высоту формы */
  overflow-y: auto; /* вертикальная прокрутка */
  padding-right: 10px; /* чтобы скролл не перекрывал контент */
  margin-bottom: 10px;
}

/* Кнопка закрытия модального окна */
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

/* Метки полей */
label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #f0c6f7;
  font-size: 14px;
}

/* Общие стили для input, textarea и select */
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
  font-size: 14px;
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

/* Кнопка сохранения */
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

/* Строка с выбором цвета и размера */
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
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.color-size-row select:focus,
.color-size-row input:focus {
  outline: none;
  border-color: #ff85c1;
  background: #3a2c5a;
}

/* Кнопка удаления пары цвет+размер */
.color-size-row button {
  flex: 0 0 auto;
  padding: 6px 12px;
  background: #ff85c1;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  color: #1a1a2e;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.color-size-row button:hover {
  background: #ff4da6;
}

/* Кнопка "Добавить цвет и размер" */
.add-color-size-btn {
  background: #7f5fc5;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 15px;
  transition: background-color 0.3s ease;
}

.add-color-size-btn:hover {
  background: #9e7edc;
}

/* Сообщение об ошибке */
.error-message {
  color: #ff4da6;
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 14px;
}
</style>
