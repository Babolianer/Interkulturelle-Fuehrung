<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Alle Umfragen</h1>
    <div v-if="loading" class="text-slate-500 py-8">Lade…</div>
    <div v-else class="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Datum</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Nutzer</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Kurs</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Antworten</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="s in surveys" :key="s.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 text-slate-600">{{ formatDate(s.createdAt) }}</td>
            <td class="px-4 py-3">
              <router-link :to="`/admin/users/${s.user?.id}`" class="text-primary-600 hover:underline font-medium">
                {{ s.user?.firstName }} {{ s.user?.lastName }}
              </router-link>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ s.user?.courseNumber }}</td>
            <td class="px-4 py-3 text-slate-600">{{ s._count?.answers ?? 0 }}</td>
            <td class="px-4 py-3 text-right">
              <router-link :to="`/survey/${s.id}?from=admin`" class="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg font-medium text-sm inline-block">
                Auswertung anzeigen
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { adminService } from '../../api/adminService';

const surveys = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    surveys.value = await adminService.getSurveys();
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
