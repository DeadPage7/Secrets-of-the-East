<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>
      <h2>Редактирование товара</h2>

      <div v-if="loading">Загрузка товара...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else>
        <div class="modal-scrollable-content">
          <form @submit.prevent="submitForm">

            <!-- Основные поля формы -->
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
              Пол (sex):
              <select v-model.number="form.sex">
                <option :value="0">Не указан</option>
                <option :value="1">Мужской</option>
                <option :value="2">Женский</option>
              </select>
            </label>

            <label>
              Категория:
              <select v-model.number="form.category_id" required>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </label>

            <label>
              Страна:
              <select v-model.number="form.country_id" required>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name }}
                </option>
              </select>
            </label>

            <hr />

            <!-- Заголовок и общий остаток по всем цветам/размерам -->
            <div class="colors-header">
              <h3>Цвета и размеры (остатки)</h3>
              <div class="total-quantity">
                Общее количество на складе: <strong>{{ totalQuantity }}</strong>
              </div>
            </div>

            <!-- Список цветов и размеров -->
            <div
              v-for="(pcs, index) in form.product_color_sizes"
              :key="pcs.id || index"
              class="color-size-row"
            >
              <!-- Кнопки выбора: существующий или новый цвет -->
              <div class="button-group">
                <button
                  type="button"
                  :class="{ 'active': !pcs.isNewColor }"
                  @click="pcs.isNewColor = false"
                >
                  Существующий цвет
                </button>
                <button
                  type="button"
                  :class="{ 'active': pcs.isNewColor }"
                  @click="pcs.isNewColor = true"
                >
                  Новый цвет
                </button>
              </div>

              <!-- Выбор цвета -->
              <div v-if="!pcs.isNewColor" class="select-wrapper">
                <select v-model.number="pcs.color_id" required>
                  <option value="" disabled>Выберите цвет</option>
                  <option v-for="color in colors" :key="color.id" :value="color.id">
                    {{ color.name }}
                  </option>
                </select>
              </div>

              <div v-else class="new-color-inputs">
                <input
                  type="text"
                  v-model="pcs.new_color_name"
                  placeholder="Название нового цвета"
                  required
                />
                <input
                  type="color"
                  v-model="pcs.new_color_hex"
                  title="Выберите цвет"
                  required
                />
              </div>

              <!-- Кнопки выбора: существующий или новый размер -->
              <div class="button-group">
                <button
                  type="button"
                  :class="{ 'active': !pcs.isNewSize }"
                  @click="pcs.isNewSize = false"
                >
                  Существующий размер
                </button>
                <button
                  type="button"
                  :class="{ 'active': pcs.isNewSize }"
                  @click="pcs.isNewSize = true"
                >
                  Новый размер
                </button>
              </div>

              <!-- Выбор размера -->
              <div v-if="!pcs.isNewSize" class="select-wrapper">
                <select v-model.number="pcs.size_id" required>
                  <option value="" disabled>Выберите размер</option>
                  <option v-for="size in sizes" :key="size.id" :value="size.id">
                    {{ size.name }}
                  </option>
                </select>
              </div>

              <div v-else>
                <input
                  type="text"
                  v-model="pcs.new_size_name"
                  placeholder="Название нового размера"
                  required
                />
              </div>

              <!-- Количество -->
              <input
                type="number"
                v-model.number="pcs.quantity"
                min="0"
                placeholder="Количество"
                required
                class="quantity-input"
              />

              <!-- Кнопка удаления -->
              <button type="button" @click="removeColorSize(index)" class="remove-btn">Удалить</button>
            </div>

            <!-- Кнопка добавления нового цвета и размера внизу -->
            <button
              type="button"
              class="add-color-size-btn"
              @click="addColorSize"
              aria-label="Добавить новый цвет и размер"
            >
              Добавить новый цвет и размер
            </button>

            <hr />

            <!-- Кнопка сохранения -->
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
// Импорты и объявления, как у тебя
import { ref, watch, computed, onMounted } from 'vue';
import api from '@/services/api';

const props = defineProps({
  productId: {
    type: [Number, String],
    required: true,
  },
});
const emits = defineEmits(['close', 'updated']);

const loading = ref(false);
const loadingSubmit = ref(false);
const error = ref(null);

const categories = ref([]);
const countries = ref([]);
const colors = ref([]);
const sizes = ref([]);

const form = ref({
  name: '',
  description: '',
  price: 0,
  sex: 0,
  category_id: null,
  country_id: null,
  product_color_sizes: [],
});

// Загружаем справочные данные
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
    error.value = 'Ошибка загрузки справочных данных';
    console.error(e);
  }
}

// Загружаем данные товара по ID
async function fetchProduct(id) {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get(`/product/${id}`);
    const product = response.data;

    form.value.name = product.name || '';
    form.value.description = product.description || '';
    form.value.price = Number(product.price) || 0;
    form.value.sex = product.sex || 0;
    form.value.category_id = product.category_id || null;
    form.value.country_id = product.country_id || null;

    form.value.product_color_sizes = (product.product_color_sizes || []).map(pcs => ({
      id: pcs.id,
      color_id: pcs.color_id,
      size_id: pcs.size_id,
      quantity: pcs.quantity,
      isNewColor: false,
      new_color_name: '',
      new_color_hex: '#000000',
      isNewSize: false,
      new_size_name: '',
    }));
  } catch (e) {
    error.value = 'Ошибка загрузки товара';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// Следим за сменой ID продукта
watch(() => props.productId, (id) => {
  if (id) fetchProduct(id);
}, { immediate: true });

// Загружаем справочные данные при монтировании
onMounted(() => {
  loadReferenceData();
});

// Добавление новой пары цвет-размер
function addColorSize() {
  form.value.product_color_sizes.push({
    id: null,
    color_id: null,
    size_id: null,
    quantity: 0,
    isNewColor: false,
    new_color_name: '',
    new_color_hex: '#000000',
    isNewSize: false,
    new_size_name: '',
  });
}

// Удаление пары цвет-размер
function removeColorSize(index) {
  form.value.product_color_sizes.splice(index, 1);
}

function close() {
  emits('close');
}

// Вычисляем общее количество по всем цветам и размерам
const totalQuantity = computed(() => {
  return form.value.product_color_sizes.reduce((sum, pcs) => sum + (pcs.quantity || 0), 0);
});

// Отправка данных на сервер
async function submitForm() {
  loadingSubmit.value = true;
  error.value = null;

  try {
    const colorsGrouped = [];
    const mapColors = new Map();

    for (const pcs of form.value.product_color_sizes) {
      let colorKey = pcs.isNewColor ? `new_${pcs.new_color_name}_${pcs.new_color_hex}` : pcs.color_id;
      if (!colorKey) continue;

      if (!mapColors.has(colorKey)) {
        const colorObj = {sizes: []};
        if (pcs.isNewColor) {
          colorObj.new_color_name = pcs.new_color_name;
          colorObj.new_color_hex = pcs.new_color_hex;
        } else {
          colorObj.color_id = pcs.color_id;
        }
        mapColors.set(colorKey, colorObj);
      }

      const sizeObj = {};
      if (pcs.isNewSize) {
        sizeObj.new_size_name = pcs.new_size_name;
      } else {
        sizeObj.size_id = pcs.size_id;
      }
      sizeObj.quantity = pcs.quantity;

      mapColors.get(colorKey).sizes.push(sizeObj);
    }

    for (const val of mapColors.values()) {
      colorsGrouped.push(val);
    }

    const payload = {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      sex: form.value.sex,
      category_id: form.value.category_id,
      country_id: form.value.country_id,
      colors: colorsGrouped,
    };

    await api.patch(`/product/${props.productId}`, payload);
    emits('updated');
    close();
  } catch (e) {
    error.value = 'Ошибка при сохранении данных';
    console.error(e);
  } finally {
    loadingSubmit.value = false;
  }
}
</script>

<style scoped>
.button-group {
  display: flex;
  gap: 6px;
  flex: 1 1 100%;
}

.button-group button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #6a4b99;
  background: #2c2c4a;
  color: #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.button-group button.active {
  background: #7f5fc5;
  color: white;
  border-color: #7f5fc5;
}

.button-group button:hover {
  background: #6a4b99;
  color: white;
}

/* Кнопка удаления */
.remove-btn {
  background: #ff4d4d !important;
  color: white !important;
  border: none !important;
}

.remove-btn:hover {
  background: #ff3333 !important;
}

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

/* Основное окно */
.modal-content {
  background: #1a1a2e;
  padding: 20px 25px;
  border-radius: 12px;
  width: 520px;
  max-width: 95%;
  position: relative;
  max-height: 90vh;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Прокручиваемая часть формы */
.modal-scrollable-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 10px;
}

/* Кнопка закрытия */
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

/* Метки */
label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #f0c6f7;
  font-size: 14px;
}

/* Общие стили input, select, textarea */
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

/* Блок с заголовком цветов и общим остатком */
.colors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.total-quantity {
  font-weight: 700;
  font-size: 14px;
  color: #ff85c1;
}

/* Строка выбора цвета и размера */
.color-size-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
  background: #29294a;
  padding: 10px;
  border-radius: 12px;
}


/* Обертки для селектов и новых цветов */
.select-wrapper,
.new-color-inputs {
  flex: 1 1 120px;
}

/* Поля для нового цвета (текст + цвет) */
.new-color-inputs input[type="text"] {
  margin-bottom: 6px;
}

/* Количество */
.quantity-input {
  width: 80px;
  border-radius: 10px;
  padding: 6px 10px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  background: #2c2c4a;
  border: 1.5px solid #6a4b99;
  color: #fff;
  transition: border-color 0.3s ease;
}

.quantity-input:focus {
  border-color: #ff85c1;
  background: #3a2c5a;
}

/* Кнопка удаления */
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

/* Кнопка добавления пары цвет и размер (внизу) */
.add-color-size-btn {
  background: #7f5fc5;
  border: none;
  padding: 12px 20px;
  border-radius: 15px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 10px;
  width: 100%;
  transition: background-color 0.3s ease;
}

.add-color-size-btn:hover {
  background: #9e7edc;
}

/* Ошибка */
.error-message {
  color: #ff4da6;
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 14px;
}
</style>
