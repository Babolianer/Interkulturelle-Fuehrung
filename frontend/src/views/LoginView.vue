<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white/80 backdrop-blur rounded-2xl shadow-soft border border-white/60 p-8">
        <div class="text-center mb-6">
          <router-link to="/" class="inline-block text-slate-600 hover:text-primary-600 mb-4 text-sm font-medium">
            ← Zur Startseite
          </router-link>
          <h1 class="text-2xl font-bold text-slate-800">Anmelden</h1>
          <p class="text-slate-500 text-sm mt-1">Melde dich mit deinem Account an</p>
        </div>
        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">E-Mail</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
              placeholder="name@beispiel.de"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Passwort</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
              placeholder="••••••••"
            />
          </div>
          <p v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition shadow-card hover:shadow-card-hover"
          >
            {{ loading ? 'Wird angemeldet…' : 'Anmelden' }}
          </button>
        </form>
        <p class="mt-6 text-sm text-slate-500 text-center">
          Noch kein Account?
          <router-link to="/register" class="text-primary-600 hover:underline font-medium">Registrieren</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    const redirect = route.query.redirect || (authStore.isAdmin ? '/admin' : '/dashboard');
    router.push(redirect);
  } catch (err) {
    error.value = err.response?.data?.message || 'Anmeldung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
}
</script>
