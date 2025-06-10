<template>
  <div class="product-create-form">
    <h2 class="title">Создание товара</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <!-- Название -->
      <input
        type="text"
        v-model="form.name"
        placeholder="Название"
        class="input"
        required
      />
      <p v-if="errors.name" class="error">{{ errors.name[0] }}</p>

      <!-- Описание -->
      <textarea
        v-model="form.description"
        placeholder="Описание"
        class="input"
        required
      ></textarea>
      <p v-if="errors.description" class="error">{{ errors.description[0] }}</p>

      <!-- Пол -->
      <select v-model="form.sex" class="input" required>
        <option disabled value="">Выберите пол</option>
        <option :value="1">Мужской</option>
        <option :value="0">Женский</option>
      </select>
      <p v-if="errors.sex" class="error">{{ errors.sex[0] }}</p>

      <!-- Цена -->
      <input
        type="number"
        v-model.number="form.price"
        placeholder="Цена"
        class="input"
        required
        min="0"
      />
      <p v-if="errors.price" class="error">{{ errors.price[0] }}</p>

      <!-- Категория -->
      <select v-model="form.category_id" class="input" required>
        <option disabled value="">Выберите категорию</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <p v-if="errors.category_id" class="error">{{ errors.category_id[0] }}</p>

      <!-- Страна -->
      <select v-model="form.country_id" class="input" required>
        <option disabled value="">Выберите страну</option>
        <option
          v-for="country in countries"
          :key="country.id"
          :value="country.id"
        >
          {{ country.name }}
        </option>
      </select>
      <p v-if="errors.country_id" class="error">{{ errors.country_id[0] }}</p>

      <!-- Фото -->
      <input type="file" @change="handleFileChange" class="input" />
      <p v-if="errors.photo" class="error">{{ errors.photo[0] }}</p>

      <!-- Цвета и размеры -->
      <div
        v-for="(color, cIndex) in form.colors"
        :key="cIndex"
        class="color-block"
      >
        <div class="color-select-block">
          <select v-model="color.color_id" class="input color-select" required>
            <option disabled value="">Выберите цвет</option>
            <option
              v-for="c in availableColors"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>
          <p v-if="errors[`colors.${cIndex}.color_id`]" class="error">
            {{ errors[`colors.${cIndex}.color_id`][0] }}
          </p>

          <input
            v-model="newColorName[cIndex]"
            type="text"
            placeholder="Новый цвет"
            class="input input-new-color"
          />
          <button
            @click.prevent="addNewColor(cIndex)"
            class="btn-add-new-color"
            :disabled="!newColorName[cIndex]"
            title="Добавить цвет"
          >
            +
          </button>
        </div>

        <div
          v-for="(size, sIndex) in color.sizes"
          :key="sIndex"
          class="size-block"
        >
          <select
            v-model="size.size_id"
            class="input size-select"
            required
          >
            <option disabled value="">Выберите размер</option>
            <option
              v-for="s in availableSizes"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }}
            </option>
          </select>
          <p v-if="errors[`colors.${cIndex}.sizes.${sIndex}.size_id`]" class="error">
            {{ errors[`colors.${cIndex}.sizes.${sIndex}.size_id`][0] }}
          </p>

          <input
            v-model="newSizeName[cIndex][sIndex]"
            type="text"
            placeholder="Новый размер"
            class="input input-new-size"
          />
          <button
            @click.prevent="addNewSize(cIndex, sIndex)"
            class="btn-add-new-size"
            :disabled="!newSizeName[cIndex][sIndex]"
            title="Добавить размер"
          >
            +
          </button>

          <input
            type="number"
            v-model.number="size.quantity"
            placeholder="Кол-во"
            class="input quantity-input"
            min="1"
            required
          />
          <p v-if="errors[`colors.${cIndex}.sizes.${sIndex}.quantity`]" class="error">
            {{ errors[`colors.${cIndex}.sizes.${sIndex}.quantity`][0] }}
          </p>

          <button
            @click.prevent="removeSize(cIndex, sIndex)"
            class="btn-remove"
            title="Удалить размер"
          >
            ×
          </button>
        </div>
        <button
          @click.prevent="addSize(cIndex)"
          class="add-size-btn"
          title="Добавить размер"
        >
          + размер
        </button>
        <button
          @click.prevent="removeColor(cIndex)"
          class="btn-remove-color"
          title="Удалить цвет"
        >
          × Цвет
        </button>
      </div>

      <button @click.prevent="addColor" class="add-color-btn" title="Добавить цвет">
        + цвет
      </button>

      <!-- Кнопки -->
      <div class="buttons">
        <button type="submit" class="btn-submit">Создать</button>
        <button type="button" @click="$emit('close')" class="btn-cancel">Отмена</button>
      </div>

      <!-- Общая ошибка, если есть -->
      <p v-if="errors.general" class="error general-error">{{ errors.general }}</p>
    </form>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

// Форма с реактивными свойствами
const form = reactive({
  name: '',
  description: '',
  sex: '',
  price: 0,
  category_id: '',
  country_id: '',
  photo: null,
  colors: [] // массив цветов с размерами
})

// Объект для ошибок валидации (будет содержать плоский список ошибок)
const errors = reactive({})

// Загружаемые данные для селектов
const categories = ref([])
const countries = ref([])
const availableColors = ref([])
const availableSizes = ref([])

// Хранение вводимых названий новых цветов и размеров
const newColorName = reactive([])
const newSizeName = reactive([])

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    const [cat, ctr, col, siz] = await Promise.all([
      api.get('/category'),
      api.get('/country'),
      api.get('/colors'),
      api.get('/sizes')
    ])
    categories.value = cat.data
    countries.value = ctr.data
    availableColors.value = col.data
    availableSizes.value = siz.data
  } catch (err) {
    alert('Ошибка загрузки данных для формы')
  }
})

// Обработчик выбора файла для фото
const handleFileChange = (e) => {
  form.photo = e.target.files[0]
}

// Добавление нового блока цвета
const addColor = () => {
  form.colors.push({color_id: '', sizes: []})
  newColorName.push('')
  newSizeName.push([])
}

// Удаление цвета
const removeColor = (index) => {
  form.colors.splice(index, 1)
  newColorName.splice(index, 1)
  newSizeName.splice(index, 1)
}

// Добавление размера к конкретному цвету
const addSize = (colorIndex) => {
  form.colors[colorIndex].sizes.push({size_id: '', quantity: 1})
  if (!newSizeName[colorIndex]) {
    newSizeName[colorIndex] = []
  }
  newSizeName[colorIndex].push('')
}

// Удаление размера у цвета
const removeSize = (colorIndex, sizeIndex) => {
  form.colors[colorIndex].sizes.splice(sizeIndex, 1)
  newSizeName[colorIndex].splice(sizeIndex, 1)
}

// Добавление нового цвета в список availableColors и в форму
const addNewColor = (colorIndex) => {
  const newName = newColorName[colorIndex]?.trim()
  if (!newName) return
  // Чтобы id был уникален (в реальном приложении id должен выдавать сервер)
  const newId = Date.now() + Math.floor(Math.random() * 1000)
  const newColor = {id: newId, name: newName}
  availableColors.value.push(newColor)
  form.colors[colorIndex].color_id = newId
  newColorName[colorIndex] = ''
}

// Добавление нового размера в список availableSizes и в форму
const addNewSize = (colorIndex, sizeIndex) => {
  const newName = newSizeName[colorIndex]?.[sizeIndex]?.trim()
  if (!newName) return
  const newId = Date.now() + Math.floor(Math.random() * 1000)
  const newSize = {id: newId, name: newName}
  availableSizes.value.push(newSize)
  form.colors[colorIndex].sizes[sizeIndex].size_id = newId
  newSizeName[colorIndex][sizeIndex] = ''
}

// Функция для "разворачивания" вложенных ошибок из API (Laravel возвращает вложенные ошибки)
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

// Отправка формы на сервер
const handleSubmit = async () => {
  // Сброс ошибок
  for (const key in errors) delete errors[key]

  // Формируем FormData
  const formData = new FormData()

  // Добавляем простые поля
  formData.append('name', form.name)
  formData.append('description', form.description)
  formData.append('sex', form.sex)
  formData.append('price', form.price)
  formData.append('category_id', form.category_id)
  formData.append('country_id', form.country_id)
  if (form.photo) formData.append('photo', form.photo)

  // Критически важный момент - добавляем каждый цвет и размер отдельно
  form.colors.forEach((color, cIndex) => {
    formData.append(`colors[${cIndex}][color_id]`, color.color_id)

    color.sizes.forEach((size, sIndex) => {
      formData.append(`colors[${cIndex}][sizes][${sIndex}][size_id]`, size.size_id)
      formData.append(`colors[${cIndex}][sizes][${sIndex}][quantity]`, size.quantity)
    })
  })

  // Логирование для отладки
  console.log('Отправляемые данные:')
  for (let [key, value] of formData.entries()) {
    console.log(key, value)
  }

  try {
    const response = await api.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    alert('Товар создан успешно')
    emit('close')
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors)
      console.error('Ошибки валидации:', err.response.data)
    } else {
      errors.general = 'Произошла ошибка при создании товара'
      console.error('Ошибка:', err)
    }
  }
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 14px;
  margin: 2px 0 8px 0;
}

.general-error {
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}

.product-create-form {
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #1a1a2e;
  padding: 30px;
  border-radius: 24px;
  color: #fff;
  box-shadow: 0 0 20px #c84b9e88;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #ff85c1;
  margin-bottom: 20px;
}

.input {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: #2c2c44;
  border: 1px solid #ff85c1;
  color: #fff;
  font-size: 16px;
}

.color-select-block {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.color-select {
  flex: 1 1 70%;
}

.input-new-color {
  flex: 1 1 25%;
}

.btn-add-new-color {
  flex: 0 0 30px;
  background-color: #ff85c1;
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: bold;
  cursor: pointer;
  font-size: 20px;
  line-height: 18px;
  transition: background-color 0.3s ease;
}

.btn-add-new-color:disabled {
  background-color: #7a4d69;
  cursor: default;
}

.btn-add-new-color:hover:not(:disabled) {
  background-color: #c84b9e;
}

.size-block {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.size-select {
  flex: 1 1 40%;
}

.input-new-size {
  flex: 1 1 30%;
}

.btn-add-new-size {
  flex: 0 0 30px;
  background-color: #ff85c1;
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: bold;
  cursor: pointer;
  font-size: 20px;
  line-height: 18px;
  transition: background-color 0.3s ease;
}

.btn-add-new-size:disabled {
  background-color: #7a4d69;
  cursor: default;
}

.btn-add-new-size:hover:not(:disabled) {
  background-color: #c84b9e;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.btn-remove,
.btn-remove-color {
  background-color: #ff385c;
  border: none;
  border-radius: 50%;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  width: 28px;
  height: 28px;
  line-height: 26px;
  text-align: center;
  font-size: 18px;
  user-select: none;
  transition: background-color 0.3s ease;
}

.btn-remove:hover,
.btn-remove-color:hover {
  background-color: #c8324e;
}

.add-size-btn,
.add-color-btn {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #ff85c1;
  border: none;
  border-radius: 16px;
  color: #1a1a2e;
  font-weight: 700;
  cursor: pointer;
  width: max-content;
  transition: background-color 0.3s ease;
}

.add-size-btn:hover,
.add-color-btn:hover {
  background-color: #c84b9e;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.btn-submit,
.btn-cancel {
  padding: 12px 20px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
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
