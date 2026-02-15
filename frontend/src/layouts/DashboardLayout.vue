<template>
  <div class="min-h-screen bg-slate-50/80">
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200/80 shadow-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <router-link
          to="/dashboard"
          class="font-bold text-slate-800 hover:text-primary-600 transition flex items-center gap-2"
        >
          <span class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-sm">📊</span>
          Interkulturelle Führung
        </router-link>
        <div class="relative" ref="profileRef">
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            @click="profileOpen = !profileOpen"
            aria-haspopup="true"
            :aria-expanded="profileOpen"
          >
            <span class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold shadow-card">
              {{ profileInitial }}
            </span>
            <span class="hidden sm:inline text-sm font-medium truncate max-w-[140px]">{{ authStore.user?.email }}</span>
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-if="profileOpen"
            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-soft border border-slate-100 py-1.5 z-50"
          >
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
            </div>
            <router-link
              to="/dashboard"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition"
              @click="profileOpen = false"
            >
              <span>📋</span> Meine Umfragen
            </router-link>
            <router-link
              to="/survey"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition"
              @click="profileOpen = false"
            >
              <span>➕</span> Neue Umfrage starten
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition"
              @click="profileOpen = false"
            >
              <span>⚙️</span> Admin-Bereich
            </router-link>
            <button
              type="button"
              class="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              @click="logout"
            >
              <span>🚪</span> Abmelden
            </button>
          </div>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const profileOpen = ref(false);
const profileRef = ref(null);

const profileInitial = computed(() => {
  const first = authStore.user?.firstName?.charAt(0) || '';
  const last = authStore.user?.lastName?.charAt(0) || '';
  if (first || last) return (first + last).toUpperCase().slice(0, 2);
  return (authStore.user?.email?.charAt(0) || '?').toUpperCase();
});

function logout() {
  profileOpen.value = false;
  authStore.logout();
  router.push('/');
}

function onClickOutside(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>
