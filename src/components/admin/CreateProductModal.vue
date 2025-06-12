<template>
  <div class="product-create-form">
    <h2 class="title">Создание товара</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">

      <!-- Название товара -->
      <input v-model="form.name" type="text" placeholder="Название товара" required class="input" />

      <!-- Описание -->
      <textarea v-model="form.description" placeholder="Описание" class="input"></textarea>

      <!-- Пол -->
      <select v-model.number="form.sex" required class="input">
        <option disabled value="">Выберите пол</option>
        <option :value="0">Женский</option>
        <option :value="1">Мужской</option>
      </select>

      <!-- Цена -->
      <input v-model.number="form.price" type="number" placeholder="Цена" min="0" required class="input" />

      <!-- Категория -->
      <select v-model="form.category_id" required class="input">
        <option disabled value="">Выберите категорию</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <!-- Страна -->
      <select v-model="form.country_id" required class="input">
        <option disabled value="">Выберите страну</option>
        <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
      </select>

      <!-- Фото -->
      <input type="file" @change="handleFileChange" class="input" />

      <!-- Цвета и размеры -->
      <div v-for="(color, cIndex) in form.colors" :key="cIndex" class="color-block">
        <div class="color-select-block">
          <!-- Переключатель между существующим и новым цветом -->
          <div class="color-type-toggle">
            <button
              type="button"
              :class="{active: !color.isNewColor}"
              @click="color.isNewColor = false"
              class="toggle-btn"
            >Выбрать цвет</button>
            <button
              type="button"
              :class="{active: color.isNewColor}"
              @click="color.isNewColor = true"
              class="toggle-btn"
            >Новый цвет</button>
          </div>

          <!-- Выбор существующего цвета -->
          <select v-if="!color.isNewColor" v-model="color.color_id" required class="color-select input">
            <option disabled value="">Выберите цвет</option>
            <option v-for="c in availableColors" :key="c.id" :value="c.id">{{ c.name }} ({{ c.hex }})</option>
          </select>

          <!-- Ввод нового цвета -->
          <div v-if="color.isNewColor" class="new-color-fields">
            <input v-model="color.new_color_name" type="text" placeholder="Название цвета" required class="input" />
            <input
              v-model="color.new_color_hex"
              type="text"
              placeholder="#HEX код"
              required
              class="input hex-input"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>

        <!-- Размеры -->
        <div v-for="(size, sIndex) in color.sizes" :key="sIndex" class="size-block">
          <!-- Переключатель -->
          <div class="size-type-toggle">
            <button
              type="button"
              :class="{active: !size.isNewSize}"
              @click="size.isNewSize = false"
              class="toggle-btn small-btn"
            >Выбрать размер</button>
            <button
              type="button"
              :class="{active: size.isNewSize}"
              @click="size.isNewSize = true"
              class="toggle-btn small-btn"
            >Новый размер</button>
          </div>

          <!-- Существующий размер -->
          <select v-if="!size.isNewSize" v-model="size.size_id" required class="size-select input">
            <option disabled value="">Выберите размер</option>
            <option v-for="s in availableSizes" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>

          <!-- Новый размер -->
          <input
            v-if="size.isNewSize"
            v-model="size.new_size_name"
            type="text"
            placeholder="Новый размер"
            required
            class="size-input-new input"
          />

          <!-- Количество -->
          <input type="number" v-model.number="size.quantity" min="1" placeholder="Кол-во" required class="quantity-input" />

          <!-- Кнопка удаления размера -->
          <button @click.prevent="removeSize(cIndex, sIndex)" title="Удалить размер" class="btn-remove">×</button>
        </div>

        <div class="color-controls">
          <button @click.prevent="addSize(cIndex)" class="add-size-btn">+ Размер</button>
          <button @click.prevent="removeColor(cIndex)" class="btn-remove-color">Удалить цвет</button>
        </div>
      </div>

      <button @click.prevent="addColor" class="add-color-btn">+ Добавить цвет</button>

      <div class="buttons">
        <button type="submit" class="btn-submit">Создать товар</button>
        <button type="button" @click="$emit('close')" class="btn-cancel">Отмена</button>
      </div>

      <div v-if="errors.general" class="general-error">{{ errors.general }}</div>
      <div v-for="(err, key) in errors" :key="key" class="error">
        {{ key }}: {{ err.join ? err.join(', ') : err }}
      </div>
    </form>
  </div>
</template>

<script setup>
// ... (оставляем без изменений — из твоего исходника)
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
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    alert('Товар успешно создан')
    emit('close')
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, flattenErrors(err.response.data.errors))
    } else {
      errors.general = 'Ошибка при создании товара'
    }
  }
}
</script>

<style scoped>
/* Основной фон и оформление формы */
.product-create-form {
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #1a1a2e; /* Темный фон для контраста */
  padding: 30px 40px;
  border-radius: 24px;
  color: #fff;
  box-shadow: 0 0 25px #c84b9e88; /* Розоватая тень */
  display: flex;
  flex-direction: column;
}

/* Заголовок */
.title {
  font-size: 30px;
  font-weight: 700;
  color: #ff85c1;
  margin-bottom: 30px;
}

/* Инпуты и селекты */
.input {
  width: 100%;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background-color: #2c2c44;
  border: 1.5px solid #ff85c1;
  color: #fff;
  font-size: 17px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.input:focus {
  border-color: #ff4d6d;
  outline: none;
}

/* Ошибки */
.error {
  color: #ff4d6d;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 12px;
}

/* Контейнер для одного цвета с размерами */
.color-block {
  border: 1.5px solid #ff85c1;
  margin: 20px 0;
  padding: 22px 25px 18px 25px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: #241c3a;
}

/* Блок переключения типа цвета (старый/новый) и выбора цвета */
.color-select-block {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

/* Кнопки переключения выбора цвета */
.color-type-toggle {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.toggle-btn {
  background-color: transparent;
  border: 1.8px solid #ff85c1;
  border-radius: 14px;
  color: #ff85c1;
  padding: 7px 18px;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  transition: background-color 0.3s ease, color 0.3s ease;
  user-select: none;
  white-space: nowrap;
}

.toggle-btn.active,
.toggle-btn:hover {
  background-color: #ff85c1;
  color: #1a1a2e;
}

/* Селект выбора существующего цвета */
.color-select {
  flex: 1 1 65%;
  min-width: 220px;
}

/* Новые цветовые поля (название + HEX) */
.new-color-fields {
  display: flex;
  gap: 16px;
  flex: 1 1 65%;
  min-width: 220px;
}

.hex-input {
  max-width: 120px;
}

/* Блок с одним размером и количеством */
.size-block {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

/* Переключение типа размера (старый/новый) */
.size-type-toggle {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.small-btn {
  padding: 5px 12px;
  font-size: 14px;
  border-radius: 12px;
}

/* Выбор размера */
.size-select {
  flex: 1 1 35%;
  min-width: 130px;
}

/* Новый размер (текстовое поле) */
.size-input-new {
  flex: 1 1 35%;
  min-width: 130px;
}

/* Поле количества */
.quantity-input {
  width: 75px;
  text-align: center;
  border-radius: 14px;
  background-color: #2c2c44;
  border: 1.5px solid #ff85c1;
  color: #fff;
  font-size: 17px;
  padding: 12px 8px;
  user-select: none;
  flex-shrink: 0;
}

/* Кнопка удаления размера */
.btn-remove {
  background-color: #ff385c;
  border: none;
  border-radius: 50%;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 22px;
  user-select: none;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  margin-left: 6px;
}

.btn-remove:hover {
  background-color: #c8324e;
}

/* Блок управления цветом (добавить размер, удалить цвет) */
.color-controls {
  display: flex;
  gap: 14px;
  justify-content: flex-start;
  align-items: center;
  margin-top: 14px;
}

/* Кнопка добавить размер */
.add-size-btn {
  padding: 9px 18px;
  background-color: #ff85c1;
  border: none;
  border-radius: 16px;
  color: #1a1a2e;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
}

.add-size-btn:hover {
  background-color: #c84b9e;
}

/* Кнопка удалить цвет */
.btn-remove-color {
  background-color: #ff385c;
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 17px;
  user-select: none;
  transition: background-color 0.3s ease;
  align-self: center;
}

.btn-remove-color:hover {
  background-color: #c8324e;
}

/* Кнопка добавить цвет */
.add-color-btn {
  margin-top: 28px;
  padding: 12px 24px;
  background-color: #ff85c1;
  border: none;
  border-radius: 20px;
  color: #1a1a2e;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
  user-select: none;
  width: max-content;
}

.add-color-btn:hover {
  background-color: #c84b9e;
}

/* Нижний блок с кнопками отправки и отмены */
.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.btn-submit,
.btn-cancel {
  padding: 14px 32px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
  user-select: none;
  min-width: 140px;
  text-align: center;
}

.btn-submit {
  background-color: #ff85c1;
  color: #1a1a2e;
}

.btn-submit:hover {
  background-color: #c84b9e;
}

.btn-cancel {
  background-color: transparent;
  color: #ff85c1;
  border: 2px solid #ff85c1;
}

.btn-cancel:hover {
  background-color: #ff85c1;
  color: #1a1a2e;
}

</style>
