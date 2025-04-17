<template>
  <HeaderInfo/>
  <div class="home-container">
    <!-- Левая часть — фильтрация -->
    <ProductFilter />

    <!-- Правая часть — карточки товаров -->
    <div class="products-section">
      <ProductCards />
    </div>
  </div>
</template>

<script setup>
import ProductFilter from '@/components/Product/ProductFilter.vue'
import ProductCards from '@/components/Product/ProductCards.vue'
import HeaderInfo from "@/components/Headers/HeaderInfo.vue";
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
