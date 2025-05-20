import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetailView from '../views/ProductDetailView.vue';
import CartView from "../views/CartView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/product/:id', // Параметр `id` будет использоваться для получения информации о товаре
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView,
    },
  ],
})

export default router
