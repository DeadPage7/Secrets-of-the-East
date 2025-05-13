<template>
  <div class="filter-container">
    <h2>Фильтры</h2>

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
        <option value="">Все полы</option>
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
            v-model="priceRange[0]"
            :min="minPrice"
            :max="maxPrice"
            @input="updatePriceText"
            class="price-input"
            placeholder="От"
          />
          <span>—</span>
          <input
            type="number"
            v-model="priceRange[1]"
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

    <button @click="applyFilters" class="apply-btn">Применить фильтры</button>
    <button @click="resetFilters" class="reset-btn">Сбросить фильтры</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from "@/services/api";

const selectedCategory = ref('')
const selectedCountry = ref('')
const selectedGender = ref('')
const priceRange = ref([0, 100000])
const minPrice = 0
const maxPrice = 100000

const categories = ref([])
const countries = ref([])

const emit = defineEmits(['filter-changed'])


const loadFilterData = async () => {
  try {
    const [cats, cntrs] = await Promise.all([
      api.get('/category'),
      api.get('/country')
    ])
    categories.value = cats.data
    countries.value = cntrs.data
  } catch (error) {
    console.error('Ошибка загрузки фильтров:', error)
  }
}

const applyFilters = () => {
  const filters = {
    category_id: selectedCategory.value || null,
    country_id: selectedCountry.value || null,
    min_price: priceRange.value[0] !== minPrice ? priceRange.value[0] : null,
    max_price: priceRange.value[1] !== maxPrice ? priceRange.value[1] : null,
    sex: selectedGender.value || null // Используем 'sex' вместо 'gender' для соответствия API
  }

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== null && value !== undefined)
  );

  emit('filter-changed', cleanFilters)
}

const resetFilters = () => {
  selectedCategory.value = ''
  selectedCountry.value = ''
  selectedGender.value = ''
  priceRange.value = [minPrice, maxPrice]
  emit('filter-changed', {
    category_id: '',
    country_id: '',
    price_min: minPrice,
    price_max: maxPrice,
    sex: ''
  })
}

const updatePriceText = () => {
  if (priceRange.value[0] > priceRange.value[1]) {
    priceRange.value[0] = priceRange.value[1]
  }
}

onMounted(() => {
  loadFilterData()
})

const sectionClass = 'filter-section-anim' // Добавление класса для анимации
</script>

<style scoped>
/* Основной контейнер */
.filter-container {
  background: #1a1a2e; /* Темный фон */
  color: #f7f7f7; /* Светлый текст */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.8s ease-out;
}

/* Элементы фильтров */
.filter-section {
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeInUp 0.6s forwards;
  transition: all 0.3s ease;
}

/* Выделение элементов фильтров */
.filter-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a40; /* Тёмный фон для инпутов */
  color: #f7f7f7; /* Светлый текст */
  transition: background-color 0.3s ease;
}

/* Активные и фокусные состояния */
.filter-select:hover {
  background: #333;
}

.filter-select:focus {
  border-color: #ff85c1; /* Неоновый розовый для фокуса */
  background: #333;
}

/* Рамки и фон в элементах списка */
.filter-select option {
  background: #2a2a40; /* Тёмный фон */
  color: #f7f7f7; /* Светлый текст */
}

/* Диапазон цен */
.price-range {
  padding: 10px 0;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

/* Инпуты для диапазона цен */
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

/* Зелёная кнопка для применения */
.apply-btn {
  background: #4CAF50; /* Тёмно-зелёный для кнопки "Применить фильтры" */
  color: white;
}

/* Красная кнопка для сброса */
.reset-btn {
  background: #D32F2F; /* Тёмно-красный для кнопки "Сбросить фильтры" */
  color: white;
}

button:focus {
  outline: none;
}

/* Анимация появления */
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
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
