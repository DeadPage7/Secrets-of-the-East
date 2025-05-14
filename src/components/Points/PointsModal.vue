<template>
  <div class="modal-overlay" v-if="show" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">×</button>
      <h2 class="modal-title">Пункты выдачи</h2>

      <div class="points-list">
        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="points.length === 0" class="no-points">Нет доступных пунктов выдачи</div>

        <div v-else v-for="point in points" :key="point.id" class="point-item">
          <h3>{{ point.city }}</h3>
          <p>Адрес: {{ point.street }}, {{ point.house }}</p>
          <p v-if="point.additional_info">Дополнительно: {{ point.additional_info }}</p>
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
      points: [],
      loading: false,
      error: null
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    async fetchPoints() {
      try {
        this.loading = true;
        this.error = null;
        const response = await api.get('/point');
        this.points = response.data;
      } catch (err) {
        console.error('Ошибка при загрузке пунктов выдачи:', err);
        this.error = 'Не удалось загрузить пункты выдачи';
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.fetchPoints();
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1a1a2e;
  padding: 30px;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: white;
  border: 1px solid #c84b9e;
  box-shadow: 0 0 20px rgba(200, 75, 158, 0.5);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: #c84b9e;
}

.modal-title {
  margin-top: 0;
  color: #ff85c1;
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.point-item {
  background-color: #2a2a40;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #c84b9e;
}

.point-item h3 {
  margin-top: 0;
  color: #ff85c1;
}

.loading, .error, .no-points {
  text-align: center;
  padding: 20px;
}

.error {
  color: #ff6b6b;
}
</style>
