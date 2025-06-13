<template>
  <!-- Основной контейнер отзывов -->
  <div class="product-reviews">
    <!-- Блок с отзывами, если они есть -->
    <div v-if="reviews.length">
      <h3 class="reviews-title">Отзывы</h3>
      <div class="reviews-container">
        <!-- Отдельный отзыв -->
        <div v-for="review in reviews" :key="review.id" class="review">
          <div class="review-header">
            <div class="review-user">{{ review.user.name }}</div>
            <!-- Рейтинг звездами -->
            <div class="review-stars">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ filled: star <= review.rating }"
              >★</span>
            </div>
          </div>
          <p class="review-text">{{ review.description }}</p>

          <!-- Кнопка удаления (видна админу/менеджеру/автору) -->
          <button
            v-if="canDeleteReview(review)"
            @click="deleteReview(review.id)"
            class="delete-button"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
    <!-- Блок, когда отзывов нет -->
    <div v-else class="no-reviews">
      <div class="no-reviews-content">
        <h3>Нет отзывов для этого товара</h3>
      </div>
    </div>

    <!-- Форма добавления нового отзыва -->
    <div v-if="isLoggedIn" class="review-form">
      <h3>Оставьте свой отзыв</h3>
      <form @submit.prevent="submitReview">
        <!-- Поле оценки -->
        <div class="form-group rating-group">
          <label>Оценка:</label>
          <div class="rating-stars">
            <span
              v-for="star in 5"
              :key="star"
              class="star"
              :class="{ selected: star <= newReview.rating }"
              @click="newReview.rating = star"
              role="button"
              tabindex="0"
            >★</span>
          </div>
        </div>

        <!-- Поле текста отзыва -->
        <div class="form-group">
          <label for="description">Комментарий:</label>
          <textarea
            v-model="newReview.description"
            id="description"
            rows="4"
            required
            placeholder="Напишите ваш отзыв здесь..."
          ></textarea>
        </div>

        <!-- Сообщение об ошибке -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button type="submit">Отправить отзыв</button>
      </form>
    </div>

    <!-- Блок для неавторизованных пользователей -->
    <div v-else class="login-warning">
      <p class="warning-text">Чтобы оставить отзыв, необходимо авторизоваться через профиль в шапке профиля.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const store = useStore();
const route = useRoute();
const productId = route.params.id;

// Реактивные данные
const reviews = ref([]);
const newReview = ref({ rating: 0, description: '' });
const errorMessage = ref('');

// Вычисляемые свойства из хранилища
const isLoggedIn = computed(() => store.state.user.loggedIn);
const currentUserEmail = computed(() => store.state.user.email);
const userRole = computed(() => store.state.user.role);

// Загрузка отзывов для товара
const fetchReviews = async () => {
  try {
    const response = await api.get(`/product/${productId}/review`);
    reviews.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
  }
};

// Отправка нового отзыва
const submitReview = async () => {
  errorMessage.value = '';

  // Валидация перед отправкой
  if (!newReview.value.rating || !newReview.value.description.trim()) {
    errorMessage.value = 'Пожалуйста, заполните оценку и комментарий.';
    return;
  }

  try {
    const response = await api.post(`/product/${productId}/review`, newReview.value);
    reviews.value.push(response.data);
    newReview.value = { rating: 0, description: '' }; // Сброс формы
  } catch (error) {
    // Обработка ошибок с сервера
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join(' ');
    } else {
      errorMessage.value = 'Произошла ошибка при отправке отзыва.';
    }
  }
};

// Проверка прав на удаление отзыва
const canDeleteReview = (review) => {
  const isOwner = review.user?.email === currentUserEmail.value;
  const isAdminOrManager = userRole.value === 1 || userRole.value === 2;
  return isOwner || isAdminOrManager;
};

// Удаление отзыва
const deleteReview = async (reviewId) => {
  try {
    await api.delete(`/product/${productId}/review/${reviewId}`);
    reviews.value = reviews.value.filter((review) => review.id !== reviewId);
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
    errorMessage.value = 'Не удалось удалить отзыв';
  }
};

// Загрузка отзывов при монтировании компонента
onMounted(fetchReviews);
</script>

<style scoped>
/* Основной контейнер */
.product-reviews {
  background: radial-gradient(circle at top, #1a1a2f, #0f0f1f);
  padding: 40px;
  border-radius: 16px;
  margin-top: 50px;
  color: #f0f0f0;
  box-shadow: 0 0 40px #ff85c110, 0 0 60px #c84b9e10;
  backdrop-filter: blur(8px);
}

/* Заголовок отзывов */
.reviews-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
  color: #ff85c1;
  text-shadow: 0 0 10px #ff85c180;
}

/* Контейнер для списка отзывов */
.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  max-width: 1000px;
  margin: 0 auto;
  gap: 25px;
  justify-items: center;
}

/* Стиль отдельного отзыва */
.review {
  background: linear-gradient(145deg, #1e1e30, #29293f);
  border: 1px solid #ff85c150;
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  max-width: 280px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: left;
  box-shadow: 0 0 15px #ff85c120;
  position: relative;
  z-index: 1;
}

.review:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px #ff85c180, 0 0 10px #c84b9e80;
}

/* Шапка отзыва (пользователь и рейтинг) */
.review-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.review-user {
  font-weight: bold;
  color: #ff85c1;
  margin-bottom: 5px;
  text-shadow: 0 0 5px #ff85c180;
}

/* Стили звезд рейтинга */
.review-stars {
  font-size: 18px;
}

.star {
  color: #444;
  margin-right: 2px;
  transition: color 0.3s ease;
  cursor: default;
}

.star.filled {
  color: #ff85c1;
  text-shadow: 0 0 6px #ff85c180;
}

/* Стили для отсутствия отзывов */
.no-reviews {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: linear-gradient(to right, #1a1a2f, #29293f);
  border: 1px dashed #ff85c150;
  border-radius: 14px;
  margin: 30px 0;
  text-align: center;
  padding: 40px;
}

.no-reviews-content {
  max-width: 300px;
  margin: 0 auto;
}

.no-reviews h3 {
  color: #ff85c1;
  margin: 15px 0 5px;
  font-size: 22px;
}

/* Стили формы отзыва */
.review-form {
  background: linear-gradient(to bottom right, #1a1a2f, #2a2a3f);
  padding: 30px 35px;
  border-radius: 14px;
  margin-top: 50px;
  box-shadow: 0 0 20px #c84b9e50, 0 0 10px #ff85c140;
  backdrop-filter: blur(6px);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.review-form h3 {
  text-align: center;
  margin-bottom: 25px;
  color: #ff85c1;
  text-shadow: 0 0 10px #ff85c180;
}

/* Группы полей формы */
.form-group {
  margin-bottom: 20px;
}

.review-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #ff85c1;
  text-shadow: 0 0 4px #ff85c170;
}

/* Стили звезд рейтинга в форме */
.rating-group .rating-stars {
  user-select: none;
}

.rating-stars .star {
  font-size: 30px;
  color: #444;
  margin-right: 6px;
  cursor: pointer;
  transition: color 0.3s ease;
  text-shadow: none;
}

.rating-stars .star.selected {
  color: #ff85c1;
  text-shadow: 0 0 6px #ff85c180;
}

/* Поле текста отзыва */
.review-form textarea {
  width: 100%;
  padding: 12px;
  background-color: #2a2a3f;
  border: 1px solid #555;
  color: #f0f0f0;
  border-radius: 10px;
  box-shadow: inset 0 0 6px #00000080;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.review-form textarea:focus {
  border-color: #ff85c1;
  outline: none;
  box-shadow: 0 0 8px #ff85c1a0 inset;
}

.review-form textarea::placeholder {
  color: #888;
  font-style: italic;
}

/* Кнопка отправки */
.review-form button {
  width: 100%;
  padding: 14px 0;
  background-color: #ff85c1;
  border: none;
  color: #0f0f1f;
  font-size: 18px;
  cursor: pointer;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 0 15px #ff85c180;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.review-form button:hover {
  background-color: #c84b9e;
  box-shadow: 0 0 20px #c84b9ecc;
}

/* Кнопка удаления */
.delete-button {
  margin-top: 10px;
  background-color: #ff4d6d;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 0 10px #ff4d6d80;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #cc0033;
}

/* Сообщение об ошибке */
.error-message {
  color: #ff6f91;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 0 0 6px #ff6f9160;
}

/* Стили для неавторизованных пользователей */
.login-warning {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: linear-gradient(to right, #1a1a2f, #29293f);
  border: 1px solid #ff85c130;
  border-radius: 14px;
  box-shadow: 0 0 20px #ff85c140;
  margin-top: 40px;
  text-align: center;
  padding: 30px;
  animation: fadeIn 0.6s ease-in-out;
}

.warning-text {
  color: #ff85c1;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 10px #ff85c180;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
