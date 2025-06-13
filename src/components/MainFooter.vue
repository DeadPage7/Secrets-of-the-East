<template>
  <!-- Обёртка всего компонента -->
  <div>
    <!-- Футер -->
    <footer class="footer">
      <div class="footer-content">
        <button @click="openModal('about')" class="footer-link">О нас</button>
        <button @click="openModal('contacts')" class="footer-link">Контакты</button>
      </div>
      <p class="footer-copy">© 2025 Тайны востока. Все права защищены.</p>
    </footer>

    <!-- Модальные окна ВНЕ футера -->
    <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-window">
        <button class="modal-close" @click="closeModal">×</button>
        <div class="modal-content">
          <template v-if="activeModal === 'about'">
            <h3>О нас</h3>
            <p>
              «Тайны Востока» — интернет-магазин стильной и доступной одежды из Китая, Кореи и Японии.
              Мы вдохновляемся восточной культурой и привозим лучшие тренды прямо к вам.
            </p>
          </template>
          <template v-else-if="activeModal === 'contacts'">
            <h3>Контакты</h3>
            <p>Свяжитесь с нами:</p>
            <div class="employee-cards">
              <!-- Первый сотрудник -->
              <div class="employee-card">
                <div class="employee-info">
                  <h4>Федоров Алексей Алексеевич</h4>
                  <p>Frontend-разработчик</p>
                  <p>Телефон: <a>+7 996 205 0982</a></p>
                  <div class="social-links">
                    <a href="https://vk.com/a_d_e_q_u_a_t_e_7" target="_blank" class="social-link vk">ВКонтакте</a>
                    <a href="https://t.me/AriStoCraTT7" target="_blank" class="social-link tg">Telegram</a>
                    <a href="https://github.com/DeadPage7" target="_blank" class="social-link gh">GitHub</a>
                  </div>
                </div>
              </div>
              <!-- Второй сотрудник -->
              <div class="employee-card">
                <div class="employee-info">
                  <h4>Рюгин Алексей Иванович</h4>
                  <p>Backend-разработчик</p>
                  <p>Телефон: <a>+7 952 804 6123</a></p>
                  <div class="social-links">
                    <a href="https://vk.com/name_unknooown" target="_blank" class="social-link vk">ВКонтакте</a>
                    <a href="https://t.me/name_unknooown" target="_blank" class="social-link tg">Telegram</a>
                    <a href="https://github.com/Fatalex2005" target="_blank" class="social-link gh">GitHub</a>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeModal = ref(null);

const openModal = (modalName) => {
  activeModal.value = modalName;
};

const closeModal = () => {
  activeModal.value = null;
};
</script>

<style scoped>
.footer {
  background-color: #1a1a2e;
  color: #fff;
  text-align: center;
  padding: 1.5rem 0;
  position: relative;
  overflow: hidden;
}

.footer-content {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.footer-link {
  background: none;
  border: none;
  color: #c84b9e;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s, text-shadow 0.3s;
}

.footer-link:hover {
  transform: scale(1.1);
  text-shadow: 0 0 10px #ff85c1, 0 0 20px #ff85c1;
  animation: pulse 1s ease-in-out infinite;
}

.footer-copy {
  font-size: 0.8rem;
  color: #ccc;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 25, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-window {
  background-color: #2c2c44;
  padding: 1.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  color: white;
  box-shadow: 0 0 20px rgba(255, 133, 193, 0.3);
  animation: scaleIn 0.3s ease;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: #ff85c1;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-content h3 {
  color: #ff85c1;
  margin-bottom: 0.5rem;
}

/* Карточки сотрудников */
.employee-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.employee-card {
  background-color: #2c2c44;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(255, 133, 193, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.employee-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 25px rgba(255, 133, 193, 0.4);
}

.employee-info h4 {
  color: #ff85c1;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.employee-info p {
  color: #fff;
  font-size: 1rem;
  margin: 0.3rem 0;
}

.employee-info a {
  color: #ff85c1;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.employee-info a:hover {
  color: #c84b9e;
}

/* Ссылки соцсетей */
.social-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.social-link {
  font-size: 1.1rem;
  color: #ff85c1;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease, transform 0.3s ease;
}

.social-link:hover {
  color: #c84b9e;
  transform: scale(1.1);
}

/* Анимации */
@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
