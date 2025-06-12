<template>
  <!-- Клик по оверлею вызывает закрытие модалки -->
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2 class="title">Создание товара</h2>

      <div class="modal-scrollable-content">
        <form @submit.prevent="handleSubmit" enctype="multipart/form-data">

          <!-- Название товара -->
          <label>Название товара
            <input v-model="form.name" type="text" placeholder="Название товара" required />
          </label>

          <!-- Описание -->
          <label>Описание
            <textarea v-model="form.description" placeholder="Описание"></textarea>
          </label>

          <!-- Пол -->
          <label>Пол
            <select v-model.number="form.sex" required>
              <option disabled value="">Выберите пол</option>
              <option :value="0">Женский</option>
              <option :value="1">Мужской</option>
            </select>
          </label>

          <!-- Цена -->
          <label>Цена
            <input v-model.number="form.price" type="number" placeholder="Цена" min="0" required />
          </label>

          <!-- Категория -->
          <label>Категория
            <select v-model="form.category_id" required>
              <option disabled value="">Выберите категорию</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </label>

          <!-- Страна -->
          <label>Страна
            <select v-model="form.country_id" required>
              <option disabled value="">Выберите страну</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
            </select>
          </label>

          <!-- Фото -->
          <label>Фото
            <input type="file" @change="handleFileChange" />
          </label>

          <!-- Цвета и размеры -->
          <div v-for="(color, cIndex) in form.colors" :key="cIndex" class="color-size-row">
            <div class="button-group">
              <button
                type="button"
                :class="{ active: !color.isNewColor }"
                @click="color.isNewColor = false"
              >Выбрать цвет</button>
              <button
                type="button"
                :class="{ active: color.isNewColor }"
                @click="color.isNewColor = true"
              >Новый цвет</button>
            </div>

            <div v-if="!color.isNewColor" class="select-wrapper">
              <select v-model="color.color_id" required>
                <option disabled value="">Выберите цвет</option>
                <option v-for="c in availableColors" :key="c.id" :value="c.id">{{ c.name }} ({{ c.hex }})</option>
              </select>
            </div>

            <div v-if="color.isNewColor" class="new-color-inputs">
              <input v-model="color.new_color_name" type="text" placeholder="Название цвета" required />
              <input
                v-model="color.new_color_hex"
                type="text"
                placeholder="#HEX код"
                required
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>

            <div
              v-for="(size, sIndex) in color.sizes"
              :key="sIndex"
              class="color-size-row"
              style="margin-top: 10px;"
            >
              <div class="button-group" style="flex-wrap: nowrap;">
                <button
                  type="button"
                  :class="{ active: !size.isNewSize }"
                  @click="size.isNewSize = false"
                  class="small-btn"
                >Выбрать размер</button>
                <button
                  type="button"
                  :class="{ active: size.isNewSize }"
                  @click="size.isNewSize = true"
                  class="small-btn"
                >Новый размер</button>
              </div>

              <div v-if="!size.isNewSize" class="select-wrapper" style="flex: 1;">
                <select v-model="size.size_id" required>
                  <option disabled value="">Выберите размер</option>
                  <option v-for="s in availableSizes" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>

              <div v-if="size.isNewSize" class="new-color-inputs" style="flex: 1;">
                <input v-model="size.new_size_name" type="text" placeholder="Новый размер" required />
              </div>

              <input
                type="number"
                v-model.number="size.quantity"
                min="1"
                placeholder="Кол-во"
                class="quantity-input"
                required
                style="width: 90px;"
              />

              <button
                @click.prevent="removeSize(cIndex, sIndex)"
                class="remove-btn"
                title="Удалить размер"
              >×</button>
            </div>

            <div
              class="button-group"
              style="margin-top: 8px; justify-content: flex-start; gap: 10px;"
            >
              <button @click.prevent="addSize(cIndex)" type="button">+ Размер</button>
              <button
                @click.prevent="removeColor(cIndex)"
                type="button"
                class="remove-btn"
              >Удалить цвет</button>
            </div>
          </div>

          <button @click.prevent="addColor" class="add-color-size-btn" type="button">+ Добавить цвет</button>

          <!-- Кнопки формы -->
          <div class="buttons" style="margin-top: 20px; display: flex; gap: 10px;">
            <button type="submit">Создать товар</button>
            <button type="button" @click="close" class="cancel-btn">Отмена</button>
          </div>

          <!-- Ошибки -->
          <div v-if="errors.general" class="error-message">{{ errors.general }}</div>
          <div v-for="(err, key) in errors" :key="key" class="error-message">
            {{ key }}: {{ Array.isArray(err) ? err.join(', ') : err }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const form = reactive({
  name: '',
  description: '',
  sex: null,
  price: null,
  category_id: '',
  country_id: '',
  photo: null,
  colors: []
})

const errors = reactive({})
const categories = ref([])
const countries = ref([])
const availableColors = ref([])
const availableSizes = ref([])

onMounted(async () => {
  try {
    const [catRes, countryRes, colorsRes, sizesRes] = await Promise.all([
      api.get('/category'),
      api.get('/country'),
      api.get('/colors'),
      api.get('/sizes')
    ])
    categories.value = catRes.data
    countries.value = countryRes.data
    availableColors.value = colorsRes.data
    availableSizes.value = sizesRes.data
    addColor()
  } catch {
    alert('Ошибка загрузки данных')
  }
})

function handleFileChange(e) {
  form.photo = e.target.files[0]
}

function addColor() {
  form.colors.push({
    isNewColor: false,
    color_id: '',
    new_color_name: '',
    new_color_hex: '',
    sizes: [createSize()]
  })
}

function removeColor(index) {
  form.colors.splice(index, 1)
}

function addSize(colorIndex) {
  form.colors[colorIndex].sizes.push(createSize())
}

function removeSize(colorIndex, sizeIndex) {
  form.colors[colorIndex].sizes.splice(sizeIndex, 1)
}

function createSize() {
  return {
    isNewSize: false,
    size_id: '',
    new_size_name: '',
    quantity: 1
  }
}

function flattenErrors(errorObj, prefix = '', target = {}) {
  for (const key in errorObj) {
    const value = errorObj[key]
    const newPrefix = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(value) && typeof value[0] === 'string') {
      target[newPrefix] = value
    } else if (typeof value === 'object' && value !== null) {
      flattenErrors(value, newPrefix, target)
    }
  }
  return target
}

async function handleSubmit() {
  for (const key in errors) delete errors[key]

  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('description', form.description)
  formData.append('sex', form.sex)
  formData.append('price', form.price)
  formData.append('category_id', form.category_id)
  formData.append('country_id', form.country_id)
  if (form.photo) formData.append('photo', form.photo)

  form.colors.forEach((color, cIndex) => {
    if (color.isNewColor) {
      formData.append(`colors[${cIndex}][new_color_name]`, color.new_color_name)
      formData.append(`colors[${cIndex}][new_color_hex]`, color.new_color_hex)
    } else {
      formData.append(`colors[${cIndex}][color_id]`, color.color_id)
    }
    color.sizes.forEach((size, sIndex) => {
      if (size.isNewSize) {
        formData.append(`colors[${cIndex}][sizes][${sIndex}][new_size_name]`, size.new_size_name)
      } else {
        formData.append(`colors[${cIndex}][sizes][${sIndex}][size_id]`, size.size_id)
      }
      formData.append(`colors[${cIndex}][sizes][${sIndex}][quantity]`, size.quantity)
    })
  })

  try {
    await api.post('/product', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })
    alert('Товар успешно создан')
    close()
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, flattenErrors(err.response.data.errors))
    } else {
      errors.general = 'Ошибка при создании товара'
    }
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* Затемнённый фон с центровкой модалки */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 26, 46, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Окно модалки */
.modal-content {
  background: #1a1a2e;
  padding: 20px 25px;
  border-radius: 12px;
  width: 520px;
  max-width: 95%;
  max-height: 90vh;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Скролл внутри формы */
.modal-scrollable-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 10px;
  flex-grow: 1;
  overscroll-behavior: contain;
}

label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #f0c6f7;
  font-size: 14px;
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

/* Кнопка отправки */
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

/* Кнопка отмены */
.cancel-btn {
  background: transparent;
  border: 2px solid #ff85c1;
  color: #ff85c1;
  padding: 12px 24px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.cancel-btn:hover {
  background-color: #ff85c1;
  color: #1a1a2e;
}

/* Остальные стили (цвета, размеры, кнопки) */
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

.select-wrapper,
.new-color-inputs {
  flex: 1 1 120px;
}

.new-color-inputs input[type="text"] {
  margin-bottom: 6px;
}

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

.remove-btn {
  background: #ff4d4d !important;
  color: white !important;
  border: none !important;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.remove-btn:hover {
  background: #ff3333 !important;
}

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

.error-message {
  color: #ff4da6;
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 14px;
}
</style>
