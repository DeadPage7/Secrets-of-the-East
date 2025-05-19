<template>
  <div class="product-reviews">
    <!-- Отзывы -->
    <div v-if="reviews.length">
      <h3 class="reviews-title">Отзывы</h3>
      <div class="reviews-container">
        <div v-for="review in reviews" :key="review.id" class="review">
          <div class="review-header">
            <div class="review-user">{{ review.user.name }}</div>
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
        </div>
      </div>
    </div>

    <div v-else>
      <p>Нет отзывов для этого товара.</p>
    </div>

    <!-- Форма отзыва -->
    <div v-if="isLoggedIn" class="review-form">
      <h3>Оставьте свой отзыв</h3>
      <form @submit.prevent="submitReview">
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
              @keydown.enter.prevent="newReview.rating = star"
              aria-label="Оценить {{ star }} звёзд"
            >★</span>
          </div>
        </div>
        <div class="form-group">
          <label for="description">Комментарий:</label>
          <textarea
            v-model="newReview.description"
            id="description"
            rows="4"
            placeholder="Напишите ваш отзыв здесь..."
            required
          ></textarea>
        </div>

        <!-- Ошибка отображения -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit">Отправить отзыв</button>
      </form>
    </div>

    <div v-else>
      <p>Чтобы оставить отзыв, необходимо нажать на профиль и авторизоваться.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import api from '@/services/api';

// Получаем store и параметры роутера
const store = useStore();
const route = useRoute();
const productId = route.params.id;

// Данные отзывов и новой формы
const reviews = ref([]);
const newReview = ref({ rating: 0, description: '' });
const errorMessage = ref(''); // Для отображения ошибок пользователю

// Проверка авторизации
const isLoggedIn = computed(() => store.state.user.loggedIn);

// Функция загрузки отзывов с сервера
const fetchReviews = async () => {
  try {
    const response = await api.get(`/product/${productId}/review`);
    reviews.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
  }
};

// Отправка нового отзыва
const submitReview = async () => {
  errorMessage.value = ''; // Сбрасываем ошибку

  if (!newReview.value.rating || !newReview.value.description.trim()) {
    errorMessage.value = 'Пожалуйста, заполните оценку и комментарий.';
    return;
  }

  try {
    const response = await api.post(`/product/${productId}/review`, newReview.value);
    reviews.value.push(response.data); // Добавляем новый отзыв в список
    newReview.value = { rating: 0, description: '' }; // Очищаем форму
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else if (error.response && error.response.data && typeof error.response.data === 'object') {
      // Если Laravel вернул объект с validation errors
      const messages = [];
      for (const key in error.response.data.errors) {
        messages.push(...error.response.data.errors[key]);
      }
      errorMessage.value = messages.join(' ');
    } else {
      errorMessage.value = 'Произошла ошибка при отправке отзыва.';
    }
  }
};

// Загружаем отзывы при загрузке компонента
onMounted(fetchReviews);
</script>

<style scoped>
.product-reviews {
  background: radial-gradient(circle at top, #1a1a2f, #0f0f1f);
  padding: 40px;
  border-radius: 16px;
  margin-top: 50px;
  color: #f0f0f0;
  box-shadow: 0 0 40px #ff85c110, 0 0 60px #c84b9e10;
  backdrop-filter: blur(8px);
}

.reviews-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 30px;
  color: #ff85c1;
  text-shadow: 0 0 10px #ff85c180;
}

.reviews-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  max-width: 1000px;
  margin: 0 auto;
  gap: 25px;
  justify-items: center;
}

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
  color: #ff85c1; /* Цвет под вашу палитру */
  text-shadow: 0 0 6px #ff85c180;
}

/* Форма для отзыва */
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

/* Звёзды выбора рейтинга */
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

.review-form select,
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

.review-form select:focus,
.review-form textarea:focus {
  border-color: #ff85c1;
  outline: none;
  box-shadow: 0 0 8px #ff85c1a0 inset;
}

.review-form textarea::placeholder {
  color: #888;
  font-style: italic;
}

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

/* Ошибка */
.error-message {
  color: #ff6f91;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 0 0 6px #ff6f9160;
}
</style>
