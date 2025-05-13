<template>
  <div class="product-detail-view">
    <ProductDetailCard />
    <ProductReviews />
  </div>
</template>

<script setup>
import ProductDetailCard from '@/components/Product/ProductDetailCard.vue';
import ProductReviews from '@/components/Product/ProductReviews.vue'
</script>

<style scoped>
.product-detail-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 60px;
}
</style>
