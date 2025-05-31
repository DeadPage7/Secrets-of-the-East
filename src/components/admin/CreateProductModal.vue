<template>
  <div class="overlay">
    <div class="modal">
      <h2 class="title">Создание товара</h2>
      <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <!-- Название товара -->
        <input
          type="text"
          v-model="form.name"
          placeholder="Название"
          class="input"
          required
        />
        <!-- Описание -->
        <textarea
          v-model="form.description"
          placeholder="Описание"
          class="input"
          required
        ></textarea>
        <!-- Цена -->
        <input
          type="number"
          v-model.number="form.price"
          placeholder="Цена"
          class="input"
          required
        />

        <!-- Пол -->
        <select v-model="form.sex" class="input" required>
          <option disabled value="">Выберите пол</option>
          <option :value="true">Мужской</option>
          <option :value="false">Женский</option>
        </select>

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

        <!-- Загрузка фото -->
        <input type="file" @change="handleFileChange" class="input" />

        <!-- Цвета и размеры -->
        <div v-for="(color, index) in form.colors" :key="index" class="color-block">
          <select v-model="color.color_id" class="input">
            <option disabled value="">Выберите цвет</option>
            <option
              v-for="c in availableColors"
              :key="c.id"
              :value="c.id"
            >
              {{ c.name }}
            </option>
          </select>

          <div v-for="(size, sIndex) in color.sizes" :key="sIndex" class="size-block">
            <select v-model="size.size_id" class="input size-select">
              <option disabled value="">Размер</option>
              <option
                v-for="s in availableSizes"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>
            <input
              type="number"
              v-model.number="size.quantity"
              placeholder="Кол-во"
              class="input quantity-input"
            />
          </div>

          <button @click.prevent="addSize(index)" class="add-size-btn">+ размер</button>
        </div>
        <button @click.prevent="addColor" class="add-color-btn">+ цвет</button>

        <!-- Кнопки Создать и Отмена -->
        <div class="buttons">
          <button type="submit" class="btn-submit">Создать</button>
          <button type="button" @click="$emit('close')" class="btn-cancel">Отмена</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close'])

const form = ref({
  name: '',
  description: '',
  sex: '',
  price: 0,
  category_id: '',
  country_id: '',
  photo: null,
  colors: []
})

const categories = ref([])
const countries = ref([])
const availableColors = ref([])
const availableSizes = ref([])

onMounted(async () => {
  // Загрузка данных для селектов
  const [cat, ctr, col, siz] = await Promise.all([
    api.get('/categories'),
    api.get('/countries'),
    api.get('/colors'),
    api.get('/sizes')
  ])
  categories.value = cat.data
  countries.value = ctr.data
  availableColors.value = col.data
  availableSizes.value = siz.data
})

const handleFileChange = (e) => {
  form.value.photo = e.target.files[0]
}

const addColor = () => {
  form.value.colors.push({ color_id: '', sizes: [] })
}
const addSize = (colorIndex) => {
  form.value.colors[colorIndex].sizes.push({ size_id: '', quantity: 0 })
}

const handleSubmit = async () => {
  try {
    const formData = new FormData()
    for (const key in form.value) {
      if (key === 'colors') {
        formData.append(key, JSON.stringify(form.value[key]))
      } else if (key === 'photo' && form.value[key]) {
        formData.append(key, form.value[key])
      } else {
        formData.append(key, form.value[key])
      }
    }

    await api.post('/product', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
    })

    alert('Товар создан успешно!')
    emit('close')
  } catch (err) {
    console.error(err)
    alert('Ошибка при создании товара')
  }
}
</script>

<style scoped>
/* Фон модального окна — затемнённый */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

/* Основной контейнер модального окна */
.modal {
  background-color: #1a1a2e;
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 700px;
  color: #fff;
  box-shadow: 0 0 20px #c84b9e88;
  overflow-y: auto;
  max-height: 90vh;
}

/* Заголовок */
.title {
  font-size: 28px;
  font-weight: 700;
  color: #ff85c1;
  margin-bottom: 20px;
}

/* Общий стиль для всех инпутов, textarea и селектов */
.input {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: #2c2c44;
  border: 1px solid #ff85c1;
  color: #fff;
  font-size: 16px;
  font-weight: 400;
}

/* Блок для цвета с отступом сверху */
.color-block {
  margin-top: 20px;
  border-top: 1px solid #ff85c1;
  padding-top: 15px;
}

/* Блок для размеров внутри цвета — горизонтально */
.size-block {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  align-items: center;
}

/* Размер селекта для размера */
.size-select {
  flex: 1;
}

/* Поле ввода количества */
.quantity-input {
  width: 100px;
}

/* Кнопка добавить размер */
.add-size-btn {
  background: none;
  border: none;
  color: #ff85c1;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: color 0.3s ease;
}

.add-size-btn:hover {
  color: #c84b9e;
}

/* Кнопка добавить цвет */
.add-color-btn {
  background: none;
  border: none;
  color: #ff85c1;
  font-size: 16px;
  cursor: pointer;
  margin-top: 15px;
  display: block;
  transition: color 0.3s ease;
}

.add-color-btn:hover {
  color: #c84b9e;
}

/* Блок с кнопками создания и отмены */
.buttons {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Кнопка Создать */
.btn-submit {
  background-color: #ff85c1;
  border: none;
  padding: 12px 30px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background-color: #c84b9e;
}

/* Кнопка Отмена */
.btn-cancel {
  background: none;
  border: none;
  color: #aaa;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-cancel:hover {
  color: #ff85c1;
}
</style>
