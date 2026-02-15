<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Statistiken</h1>
    <div v-if="loading" class="text-slate-500 py-8">Lade…</div>
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
          <h2 class="text-slate-600 text-sm font-medium mb-2">Gesamt</h2>
          <p class="text-3xl font-bold text-primary-600">{{ stats?.totalSurveys ?? 0 }} Umfragen</p>
          <p class="text-slate-500 mt-1">{{ stats?.totalUsers ?? 0 }} Nutzer</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Durchschnitt je Dimension (alle Umfragen)</h2>
        <dl class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="(val, dim) in stats?.globalAveragesByDimension"
            :key="dim"
            class="flex justify-between py-2 border-b border-slate-100"
          >
            <dt class="text-slate-600">{{ dim }}</dt>
            <dd class="font-medium text-slate-800">{{ val }}</dd>
          </div>
        </dl>
      </div>
      <div v-if="stats?.averagesByCourseNumber && Object.keys(stats.averagesByCourseNumber).length" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Durchschnitt pro Kursnummer</h2>
        <div
          v-for="(dims, course) in stats.averagesByCourseNumber"
          :key="course"
          class="mb-6 last:mb-0"
        >
          <h3 class="font-medium text-slate-800 mb-2">Kurs {{ course }}</h3>
          <dl class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div v-for="(val, dim) in dims" :key="dim" class="flex justify-between">
              <dt class="text-slate-600">{{ dim }}</dt>
              <dd class="font-medium">{{ val }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminService } from '../../api/adminService';

const stats = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    stats.value = await adminService.getStats();
  } catch {
    stats.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
