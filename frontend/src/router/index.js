import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { public: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/survey',
    name: 'Survey',
    component: () => import('../views/SurveyView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/survey/:id',
    name: 'SurveyDetail',
    component: () => import('../views/SurveyDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/stats' },
      { path: 'stats', name: 'AdminStats', component: () => import('../views/admin/AdminStatsView.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/AdminUsersView.vue') },
      { path: 'users/:id', name: 'AdminUserDetail', component: () => import('../views/admin/AdminUserDetailView.vue') },
      { path: 'surveys', name: 'AdminSurveys', component: () => import('../views/admin/AdminSurveysView.vue') },
      { path: 'meine-umfragen', name: 'AdminMySurveys', component: () => import('../views/admin/AdminMySurveysView.vue') },
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const needsUser = authStore.token && (!authStore.user || to.meta.requiresAdmin);
  if (needsUser) {
    try {
      await authStore.fetchUser();
    } catch {
      authStore.logout();
    }
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard' });
  }
  next();
});

export default router;
