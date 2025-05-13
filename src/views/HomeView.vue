<template>
  <HeaderInfo></HeaderInfo>
  <div class="home-container">
    <!-- Левая часть — фильтрация -->
    <ProductFilter @filter-changed="handleFilterChange" />

    <!-- Правая часть — карточки товаров -->
    <div class="products-section">
      <ProductCards :filters="activeFilters" />
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import ProductFilter from '@/components/Product/ProductFilter.vue'
import ProductCards from '@/components/Product/ProductCards.vue'
import HeaderInfo from "@/components/Headers/HeaderInfo.vue";
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
};
</script>


<style scoped>
.home-container {
  display: flex;
  gap: 30px;
  padding: 40px;
}

.products-section {
  flex: 1;
}
</style>
