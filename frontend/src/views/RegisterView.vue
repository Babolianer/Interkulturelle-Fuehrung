<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white/80 backdrop-blur rounded-2xl shadow-soft border border-white/60 p-8">
        <div class="text-center mb-6">
          <router-link to="/" class="inline-block text-slate-600 hover:text-primary-600 mb-4 text-sm font-medium">
            ← Zur Startseite
          </router-link>
          <h1 class="text-2xl font-bold text-slate-800">Registrieren</h1>
          <p class="text-slate-500 text-sm mt-1">Erstelle deinen Account für die Umfrage</p>
        </div>
        <form @submit.prevent="submit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Vorname</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nachname</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Alter</label>
            <input
              v-model.number="form.age"
              type="number"
              min="1"
              max="120"
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Kursnummer</label>
            <input
              v-model="form.courseNumber"
              type="text"
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
              placeholder="z. B. 12345"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">E-Mail</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Passwort (min. 6 Zeichen)</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="6"
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
            {{ loading ? 'Wird registriert…' : 'Account erstellen' }}
          </button>
        </form>
        <p class="mt-6 text-sm text-slate-500 text-center">
          Bereits angemeldet?
          <router-link to="/login" class="text-primary-600 hover:underline font-medium">Anmelden</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  age: null,
  courseNumber: '',
  email: '',
  password: '',
});
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.register(form);
    router.push('/dashboard');
  } catch (err) {
    const data = err.response?.data;
    error.value = data?.message || (data?.errors?.[0]?.msg) || 'Registrierung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
}
</script>
