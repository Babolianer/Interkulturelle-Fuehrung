<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Meine Umfragen</h1>
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="sortBy"
          class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Älteste zuerst</option>
        </select>
        <router-link
          to="/survey"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-card hover:shadow-card-hover transition"
        >
          <span>➕</span> Neue Umfrage starten
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-slate-500">
      <div class="w-12 h-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-4"></div>
      <p>Lade…</p>
    </div>
    <div v-else-if="surveys.length === 0" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-12 text-center text-slate-500">
      <p class="mb-4">Noch keine eigenen Umfragen.</p>
      <router-link to="/survey" class="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition">
        Neue Umfrage starten
      </router-link>
    </div>
    <template v-else>
      <ul class="space-y-3">
        <li
          v-for="s in displayedSurveys"
          :key="s.id"
          class="bg-white rounded-xl shadow-card hover:shadow-card-hover border border-slate-100 p-4 flex justify-between items-center transition"
        >
          <span class="text-slate-600">Umfrage vom {{ formatDate(s.createdAt) }}</span>
          <router-link
            :to="`/survey/${s.id}?from=admin`"
            class="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition"
          >
            Auswertung anzeigen
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </router-link>
        </li>
      </ul>
      <div v-if="surveys.length > limit" class="mt-4">
        <button
          v-if="!showAll"
          type="button"
          class="text-primary-600 hover:underline font-medium text-sm"
          @click="showAll = true"
        >
          Alle {{ surveys.length }} Umfragen anzeigen
        </button>
        <p v-else class="text-sm text-slate-500">{{ surveys.length }} Umfragen</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { surveyService } from '../../api/surveyService';

const surveys = ref([]);
const loading = ref(true);
const showAll = ref(false);
const sortBy = ref('newest');
const limit = 10;

const sortedSurveys = computed(() => {
  const list = [...surveys.value];
  if (sortBy.value === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
});

const displayedSurveys = computed(() => {
  if (showAll.value) return sortedSurveys.value;
  return sortedSurveys.value.slice(0, limit);
});

onMounted(async () => {
  try {
    surveys.value = await surveyService.getMySurveys();
  } catch {
    surveys.value = [];
  } finally {
    loading.value = false;
  }
});

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
