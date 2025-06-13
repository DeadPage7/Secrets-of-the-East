<template>
  <div class="modal-overlay" v-show="show" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>
      <h2 class="modal-title">Пункты выдачи</h2>

      <div class="points-list">
        <!-- Состояния загрузки -->
        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="points.length === 0" class="no-points">Нет доступных пунктов выдачи</div>

        <!-- Список пунктов выдачи -->
        <div
          v-else
          v-for="point in points"
          :key="point.id"
          class="point-item"
          :class="{ selected: selectedPoint && selectedPoint.id === point.id }"
          @click="selectPoint(point)"
          tabindex="0"
          role="button"
        >
          <div class="point-card">
            <div class="point-header">
              <h3>{{ point.city }}</h3>
            </div>
            <div class="point-details">
              <p>Адрес: {{ point.street }}, {{ point.house }}</p>
              <p v-if="point.additional_info" class="additional-info">Дополнительно: {{ point.additional_info }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PointsModal',
  props: {
    show: Boolean
  },
  data() {
    return {
      points: [],         // список всех пунктов выдачи
      loading: false,     // индикатор загрузки пунктов
      error: null,        // ошибка загрузки
      selectedPoint: null // текущий выбранный пункт (локально в компоненте)
    };
  },
  methods: {
    // Закрытие модального окна
    close() {
      this.$emit('close');
    },
    // Загрузка списка пунктов с API
    async fetchPoints() {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.get('/point');
        this.points = response.data;

        // Если уже есть выбранный пункт в Vuex или localStorage, восстанавливаем его
        const savedPoint = this.$store.getters.selectedPoint;
        if (savedPoint) {
          this.selectedPoint = savedPoint;
        } else {
          // Если в хранилище нет, попробуем из localStorage (на случай если Vuex ещё не инициализирован)
          const localPoint = localStorage.getItem('selectedPoint');
          if (localPoint) {
            try {
              this.selectedPoint = JSON.parse(localPoint);
            } catch {
              this.selectedPoint = null;
            }
          }
        }

      } catch (err) {
        this.error = 'Не удалось загрузить пункты выдачи';
      } finally {
        this.loading = false;
      }
    },
    // Обработка выбора пункта
    selectPoint(point) {
      this.selectedPoint = point;

      // Сохраняем выбранный пункт в Vuex
      this.$store.commit("setSelectedPoint", point);

      // Сохраняем в localStorage (на всякий случай)
      localStorage.setItem("selectedPoint", JSON.stringify(point));

      // Передаём выбор родителю, если нужно
      this.$emit("select", point);

      // Закрываем модалку
      this.close();
    }
  },
  mounted() {
    this.fetchPoints();
  },
  watch: {
    // При открытии модалки повторно загружаем пункты и сбрасываем выбранный пункт
    show(newVal) {
      if (newVal) {
        // Не сбрасываем selectedPoint при открытии, чтобы всегда показывался последний выбранный
        this.fetchPoints();
      }
    }
  }
};
</script>

<style scoped>
/* Стили без изменений */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e, #2c2c44);
  padding: 25px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  color: white;
  border: 2px solid #c84b9e;
  box-shadow: 0 0 30px rgba(200, 75, 158, 0.6);
  transform: translateY(-50px);
  animation: slideUp 0.5s ease-out;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-button:hover {
  transform: scale(1.2);
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #ff85c1;
}

.points-list {
  margin-top: 20px;
  max-height: 60vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c84b9e #333348;
}

.points-list::-webkit-scrollbar {
  width: 8px;
}

.points-list::-webkit-scrollbar-thumb {
  background-color: #c84b9e;
  border-radius: 8px;
}

.points-list::-webkit-scrollbar-track {
  background: #333348;
}

.point-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #333348;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  outline: none;
}

.point-item:hover,
.point-item:focus {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.point-item.selected {
  background: #c84b9e;
  box-shadow: 0 0 15px #ff85c1;
  color: white;
}

.point-item.selected .point-header h3,
.point-item.selected .point-details p,
.point-item.selected .additional-info {
  color: white;
}

.point-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-header h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #ff85c1;
}

.point-details p {
  font-size: 16px;
  margin: 0;
  color: #ccc;
}

.additional-info {
  font-style: italic;
  color: #ff85c1;
}

.loading,
.error,
.no-points {
  text-align: center;
  font-size: 18px;
  padding: 20px;
}

.error {
  color: red;
}

.no-points {
  color: #ccc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
