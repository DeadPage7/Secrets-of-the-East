<template>
  <div class="product-reviews">
    <!-- Отображаем отзывы -->
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

    <!-- Сообщение, если отзывов нет -->
    <div v-else>
      <p>Нет отзывов для этого товара.</p>
    </div>

    <!-- Форма для добавления отзыва -->
    <div v-if="isLoggedIn" class="review-form">
      <h3>Оставьте свой отзыв</h3>
      <form @submit.prevent="submitReview">
        <div>
          <label for="rating">Оценка:</label>
          <select v-model="newReview.rating" id="rating" required>
            <option v-for="rating in ratings" :key="rating" :value="rating">{{ rating }}</option>
          </select>
        </div>
        <div>
          <label for="description">Комментарий:</label>
          <textarea v-model="newReview.description" id="description" required></textarea>
        </div>
        <button type="submit">Отправить отзыв</button>
      </form>
    </div>

    <!-- Если пользователь не авторизован -->
    <div v-else>
      <p>
        Для оставления отзыва необходимо авторизоваться.
        <router-link to="/login">Войти</router-link> или
        <router-link to="/register">зарегистрироваться</router-link>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import api from '@/services/api';

const store = useStore();
const route = useRoute();
const productId = route.params.id;
const reviews = ref([]);
const newReview = ref({ rating: 1, description: '' });

const isLoggedIn = computed(() => store.state.user.loggedIn);
const ratings = [1, 2, 3, 4, 5];

const fetchReviews = async () => {
  try {
    const response = await api.get(`/product/${productId}/review`);
    reviews.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
  }
};

const submitReview = async () => {
  if (!newReview.value.rating || !newReview.value.description) return;

  try {
    const response = await api.post(`/product/${productId}/review`, newReview.value);
    reviews.value.push(response.data);
    newReview.value = { rating: 1, description: '' };
  } catch (error) {
    console.error('Ошибка при добавлении отзыва:', error);
  }
};

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
}

.star.filled {
  color: #ffc107;
  text-shadow: 0 0 4px #ffc10790;
}

.review-text {
  font-size: 14px;
  color: #ddd;
}

.review-form {
  background: linear-gradient(to bottom right, #1a1a2f, #2a2a3f);
  padding: 30px;
  border-radius: 14px;
  margin-top: 50px;
  box-shadow: 0 0 20px #c84b9e50, 0 0 10px #ff85c140;
  backdrop-filter: blur(6px);
}

.review-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #ff85c1;
  text-shadow: 0 0 4px #ff85c170;
}

.review-form select,
.review-form textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 18px;
  background-color: #2a2a3f;
  border: 1px solid #555;
  color: #f0f0f0;
  border-radius: 8px;
  box-shadow: inset 0 0 5px #00000060;
}

.review-form button {
  padding: 12px 24px;
  background-color: #ff85c1;
  border: none;
  color: #0f0f1f;
  font-size: 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px #ff85c180;
}

.review-form button:hover {
  background-color: #c84b9e;
  transform: scale(1.06);
  box-shadow: 0 0 15px #c84b9e90, 0 0 5px #ff85c160;
}

.product-reviews p {
  color: #c2c2da;
  text-align: center;
  margin-top: 20px;
}

</style>
