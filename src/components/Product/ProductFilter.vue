<template>
  <div class="filter-container">
    <h2>Фильтры</h2>

    <!-- Ошибка загрузки фильтров -->
    <div v-if="errors.load" class="error-message">{{ errors.load }}</div>

    <!-- Фильтр по категориям -->
    <div class="filter-section" :class="sectionClass">
      <h3>Категории</h3>
      <select v-model="selectedCategory" class="filter-select">
        <option value="">Все категории</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Фильтр по странам -->
    <div class="filter-section" :class="sectionClass">
      <h3>Страны</h3>
      <select v-model="selectedCountry" class="filter-select">
        <option value="">Все страны</option>
        <option v-for="country in countries" :key="country.id" :value="country.id">
          {{ country.name }}
        </option>
      </select>
    </div>

    <!-- Фильтр по полу -->
    <div class="filter-section" :class="sectionClass">
      <h3>Пол</h3>
      <select v-model="selectedGender" class="filter-select">
        <option value="">Не важно</option>
        <option value="0">Мужской</option>
        <option value="1">Женский</option>
      </select>
    </div>

    <!-- Фильтр по цене -->
    <div class="filter-section" :class="sectionClass">
      <h3>Цена</h3>
      <div class="price-range">
        <div class="price-inputs">
          <input
            type="number"
            v-model.number="priceRange[0]"
            :min="minPrice"
            :max="maxPrice"
            @input="updatePriceText"
            class="price-input"
            placeholder="От"
          />
          <span>—</span>
          <input
            type="number"
            v-model.number="priceRange[1]"
            :min="minPrice"
            :max="maxPrice"
            @input="updatePriceText"
            class="price-input"
            placeholder="До"
          />
        </div>
        <div class="price-values">
          <span>{{ priceRange[0] }} ₽</span>
          <span>{{ priceRange[1] }} ₽</span>
        </div>
      </div>
    </div>

    <!-- Кнопки применения и сброса -->
    <button @click="applyFilters" class="apply-btn">Применить фильтры</button>
    <button @click="resetFilters" class="reset-btn">Сбросить фильтры</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from "@/services/api"

// Хранилища для выбранных фильтров
const selectedCategory = ref('')
const selectedCountry = ref('')
const selectedGender = ref('')
const priceRange = ref([0, 100000])

// Границы диапазона цены
const minPrice = 0
const maxPrice = 100000

// Данные для селектов
const categories = ref([])
const countries = ref([])

// Ошибки загрузки данных фильтра
const errors = ref({})

// Эмит события с фильтрами
const emit = defineEmits(['filter-changed'])

// Загрузка категорий и стран с API
const loadFilterData = async () => {
  errors.value.load = null
  try {
    const [cats, cntrs] = await Promise.all([
      api.get('/category'),
      api.get('/country')
    ])
    categories.value = cats.data
    countries.value = cntrs.data
  } catch (error) {
    errors.value.load = 'Не удалось загрузить данные фильтров. Попробуйте обновить страницу.'
  }
}

// Отправляем выбранные фильтры наружу
const applyFilters = () => {
  const filters = {
    category_id: selectedCategory.value || null,
    country_id: selectedCountry.value || null,
    min_price: priceRange.value[0] !== minPrice ? priceRange.value[0] : null,
    max_price: priceRange.value[1] !== maxPrice ? priceRange.value[1] : null,
    sex: selectedGender.value || null,
  }

  // Убираем null значения из объекта фильтров
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined)
  )

  emit('filter-changed', cleanFilters)
}

// Сброс фильтров в начальное состояние
const resetFilters = () => {
  selectedCategory.value = ''
  selectedCountry.value = ''
  selectedGender.value = ''
  priceRange.value = [minPrice, maxPrice]

  emit('filter-changed', {})
}

// Проверка, чтобы минимальная цена не была больше максимальной
const updatePriceText = () => {
  if (priceRange.value[0] > priceRange.value[1]) {
    priceRange.value[0] = priceRange.value[1]
  }
}

onMounted(() => {
  loadFilterData()
})

const sectionClass = 'filter-section-anim' // Класс для анимации
</script>

<style scoped>
/* Ошибки в стиле, чтобы было как в твоем примере */
.error-message {
  color: #ff7a7a;
  background: rgba(255, 122, 122, 0.1);
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

/* Основной контейнер фильтра */
.filter-container {
  background: #1a1a2e; /* Темный фон */
  color: #f7f7f7; /* Светлый текст */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.8s ease-out;
}

/* Секции фильтра */
.filter-section {
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeInUp 0.6s forwards;
  transition: all 0.3s ease;
}

/* Селекты */
.filter-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a40;
  color: #f7f7f7;
  transition: background-color 0.3s ease;
}

.filter-select:hover {
  background: #333;
}

.filter-select:focus {
  border-color: #ff85c1;
  background: #333;
}

.filter-select option {
  background: #2a2a40;
  color: #f7f7f7;
}

/* Диапазон цены */
.price-range {
  padding: 10px 0;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.price-input {
  width: 48%;
  padding: 10px;
  border: 1px solid #444;
  background: #2a2a40;
  color: #f7f7f7;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.price-input:hover {
  background: #333;
}

.price-values {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 14px;
}

/* Кнопки */
button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

button:hover {
  transform: translateY(-3px);
}

.apply-btn {
  background: #4caf50;
  color: white;
}

.reset-btn {
  background: #d32f2f;
  color: white;
}

button:focus {
  outline: none;
}

/* Анимации */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
