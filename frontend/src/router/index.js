import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'sources',
    component: () => import('../views/SourceSelectView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/source/:source',
    name: 'source',
    component: () => import('../views/TreeView.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/source/:source/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/read/:source/:filePath(.*)',
    name: 'file',
    component: () => import('../views/FileView.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'sources' };
  }
  return true;
});

export default router;
