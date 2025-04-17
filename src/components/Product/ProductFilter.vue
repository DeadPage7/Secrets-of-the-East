<template>
  <div class="filter-container">
    <h2>Фильтры</h2>

    <!-- Категории с раскрывающимся списком -->
    <div class="filter-section">
      <h3>Категории</h3>
      <ul class="category-list">
        <li v-for="(category, index) in categories" :key="index">
          <div class="category-header" @click="toggleCategory(index)">
            {{ category.name }}
            <span class="arrow" :class="{ open: category.open }">▶</span>
          </div>
          <ul v-if="category.open" class="subcategory-list">
            <li v-for="(sub, i) in category.subcategories" :key="i">{{ sub }}</li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- Фильтр по цене (ввод вручную) -->
    <div class="filter-section">
      <h3>Цена</h3>
      <div class="price-inputs">
        <input
          type="number"
          v-model="priceFrom"
          :min="minPrice"
          :max="priceTo"
          @input="validatePriceRange"
          placeholder="От"
        />
        <span>-</span>
        <input
          type="number"
          v-model="priceTo"
          :min="priceFrom"
          :max="maxPrice"
          @input="validatePriceRange"
          placeholder="До"
        />
      </div>
      <div class="price-values">
        <span>{{ priceFrom }} ₽</span>
        <span>{{ priceTo }} ₽</span>
      </div>
    </div>

    <!-- Цвет -->
    <div class="filter-section">
      <h3>Цвет</h3>
      <div class="color-options">
        <div
          v-for="color in colors"
          :key="color.name"
          class="color-circle"
          :style="{
            backgroundColor: color.value,
            border: selectedColors.includes(color.name)
              ? '3px solid #5C6BC0'
              : '1px solid #333'
          }"
          @click="toggleColor(color.name)"
        >
          <span v-if="selectedColors.includes(color.name)">✔</span>
        </div>
      </div>
    </div>

    <!-- Размер -->
    <div class="filter-section">
      <h3>Размер</h3>
      <div class="size-options">
        <div
          v-for="size in sizes"
          :key="size"
          class="size-box"
          :class="{ selected: selectedSizes.includes(size) }"
          @click="toggleSize(size)"
        >
          {{ size }}
        </div>
      </div>
    </div>

    <!-- Фильтр по полу -->
    <div class="filter-section">
      <h3>Пол</h3>
      <div class="gender-options">
        <div
          v-for="gender in genders"
          :key="gender"
          class="gender-box"
          :class="{ selected: selectedGender === gender }"
          @click="toggleGender(gender)"
        >
          {{ gender }}
        </div>
      </div>
    </div>

    <!-- Кнопка применить фильтры -->
    <div class="apply-filters">
      <button class="button" @click="applyFilters">Применить фильтры</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

// Пример тестовых категорий
const categories = ref([
  {
    name: 'Платья',
    open: false,
    subcategories: ['Летние', 'Офисные', 'Вечерние'],
  },
  {
    name: 'Куртки',
    open: false,
    subcategories: ['Демисезонные', 'Зимние', 'Легкие'],
  },
  {
    name: 'Худи',
    open: false,
    subcategories: ['Мужские', 'Женские'],
  },
]);

const colors = ref([
  { name: 'Черный', value: '#111' },
  { name: 'Белый', value: '#fff' },
  { name: 'Красный', value: '#e53935' },
]);

const sizes = ref(['S', 'M', 'L', 'XL']);
const genders = ref(['Мужской', 'Женский', 'Унисекс']);

const priceFrom = ref(1000);
const priceTo = ref(10000);
const minPrice = 0;
const maxPrice = 100000;
const selectedColors = ref([]);
const selectedSizes = ref([]);
const selectedGender = ref('Мужской');

// Функции фильтрации
function toggleCategory(index) {
  categories.value[index].open = !categories.value[index].open;
}

function validatePriceRange() {
  if (priceFrom.value > priceTo.value) {
    priceFrom.value = priceTo.value;
  }
  if (priceFrom.value < minPrice) {
    priceFrom.value = minPrice;
  }
  if (priceTo.value > maxPrice) {
    priceTo.value = maxPrice;
  }
}

function toggleColor(colorName) {
  if (selectedColors.value.includes(colorName)) {
    selectedColors.value = selectedColors.value.filter(
      (color) => color !== colorName
    );
  } else {
    selectedColors.value.push(colorName);
  }
}

function toggleSize(size) {
  if (selectedSizes.value.includes(size)) {
    selectedSizes.value = selectedSizes.value.filter((s) => s !== size);
  } else {
    selectedSizes.value.push(size);
  }
}

function toggleGender(gender) {
  selectedGender.value = gender;
}

function applyFilters() {
  console.log("Фильтры применены:");
  console.log("Категории:", categories.value);
  console.log("Цена от:", priceFrom.value);
  console.log("Цена до:", priceTo.value);
  console.log("Цвета:", selectedColors.value);
  console.log("Размеры:", selectedSizes.value);
  console.log("Пол:", selectedGender.value);
}
</script>
<style scoped>
.filter-container {
  background-color: #1c1c1c; /* Темно-серый фон */
  padding: 20px;
  border-radius: 16px;
  animation: fadeIn 0.5s ease-out; /* Плавное появление контейнера */
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section h3 {
  color: #fff;
  font-size: 18px;
}

.category-list {
  list-style: none;
  padding: 0;
}

.category-header {
  display: flex;
  justify-content: space-between; /* Стрелочка в конце */
  align-items: center;
  color: #bbb;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 0;
  transition: color 0.3s ease;
}

.category-header:hover {
  color: #5c6bc0; /* Акцентный цвет при наведении */
}

.arrow {
  transition: transform 0.3s ease; /* Плавное вращение стрелочки */
}

.arrow.open {
  transform: rotate(90deg); /* Стрелочка поворачивается на 90 градусов */
}

.subcategory-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.subcategory-list li {
  color: #ccc;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.price-inputs input {
  width: 45%;
  padding: 8px;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #333;
  color: #fff;
}

.price-values {
  display: flex;
  justify-content: space-between;
  color: #ccc;
  margin-top: 10px;
}

.color-options {
  display: flex;
  gap: 10px;
}

.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease, border 0.3s ease;
}

.color-circle:hover {
  transform: scale(1.2); /* Масштабирование при наведении */
}

.size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.size-box {
  padding: 10px 20px;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.size-box.selected {
  background-color: #5c6bc0; /* Цвет акцента */
  transform: scale(1.1); /* Увеличение размера при выборе */
}

.gender-options {
  display: flex;
  gap: 10px;
}

.gender-box {
  padding: 10px 20px;
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.gender-box.selected {
  background-color: #5c6bc0; /* Цвет акцента для пола */
  transform: scale(1.1); /* Увеличение размера при выборе */
}

.apply-filters {
  margin-top: 20px;
  text-align: center;
}

.button {
  background-color: #f50057; /* Неоновый розовый для кнопки */
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.button:hover {
  background-color: #c51162; /* Тёмный оттенок розового при наведении */
  transform: scale(1.1); /* Увеличение кнопки при наведении */
}

/* Анимация появления элементов */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expand {
  from {
    opacity: 0;
    height: 0;
  }
  to {
    opacity: 1;
    height: auto;
  }
}
</style>
