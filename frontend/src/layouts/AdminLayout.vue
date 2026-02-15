<template>
  <div class="min-h-screen bg-slate-50/80 flex">
    <aside class="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-30 shadow-card">
      <div class="p-4 border-b border-slate-100">
        <router-link to="/admin" class="font-bold text-slate-800 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-sm">⚙️</span>
          Admin
        </router-link>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <router-link
          to="/admin/stats"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition"
          active-class="bg-primary-100 text-primary-700"
        >
          <span>📈</span> Statistiken
        </router-link>
        <router-link
          to="/admin/users"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition"
          active-class="bg-primary-100 text-primary-700"
        >
          <span>👥</span> Nutzer
        </router-link>
        <router-link
          to="/admin/surveys"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition"
          active-class="bg-primary-100 text-primary-700"
        >
          <span>📋</span> Alle Umfragen
        </router-link>
        <router-link
          to="/admin/meine-umfragen"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-primary-50 hover:text-primary-700 font-medium transition"
          active-class="bg-primary-100 text-primary-700"
        >
          <span>📝</span> Meine Umfragen
        </router-link>
      </nav>
      <div class="p-4 border-t border-slate-100 space-y-2">
        <router-link
          to="/dashboard"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm transition"
        >
          ← Dashboard
        </router-link>
        <p class="px-3 text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
        <button type="button" @click="logout" class="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm">
          Abmelden
        </button>
      </div>
    </aside>
    <main class="flex-1 ml-56 p-6 min-w-0">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function logout() {
  authStore.logout();
  router.push('/');
}
</script>
