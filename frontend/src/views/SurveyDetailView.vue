<template>
  <DashboardLayout>
    <div>
      <router-link
        :to="fromAdmin ? '/admin' : '/dashboard'"
        class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ fromAdmin ? 'Zurück zum Admin' : 'Zurück zu Meine Umfragen' }}
      </router-link>
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Umfrage vom {{ formatDate(survey?.createdAt) }}</h1>
      <p class="text-slate-600 mb-8">Deine Werte (ICH) im Vergleich zu deinem eingeschätzten und zum Gesamtdurchschnitt.</p>
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-slate-500">
        <div class="w-12 h-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-4"></div>
        <p>Lade Auswertung…</p>
      </div>
      <template v-else>
        <div v-if="!stats?.ownAverages || Object.keys(stats.ownAverages).length === 0" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 text-slate-600 mb-6">
          <p class="font-medium mb-2">Keine Auswertung möglich</p>
          <p class="text-sm">Diese Umfrage enthält keine gültigen Antworten. Starte eine neue Umfrage und fülle alle Felder (ICH und DURCHSCHNITT) aus.</p>
        </div>
        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch" style="min-height: 380px;">
            <div class="min-w-0 h-full">
              <DimensionPieChart
                v-for="(ownVal, dim) in stats.ownAverages"
                :key="dim"
                :dimension-name="dim"
                :own-value="Number(ownVal)"
                :average-value="Number(stats.globalAverages?.[dim] ?? 0)"
                :user-durchschnitt-value="stats.ownDurchschnittAverages?.[dim] != null ? Number(stats.ownDurchschnittAverages[dim]) : null"
                class="h-full"
              />
            </div>
            <div v-if="survey?.answers?.length" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 min-w-0 flex flex-col min-h-0">
              <h2 class="text-sm font-semibold text-slate-800 mb-3 flex-shrink-0">Deine Antworten</h2>
              <div class="overflow-x-auto overflow-y-auto flex-1 min-h-0 rounded-xl border border-slate-100">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50/80 sticky top-0">
                    <tr>
                      <th class="text-left py-2.5 px-3 font-medium text-slate-700">Kriterium</th>
                      <th class="text-center py-2.5 px-3 w-16 font-medium text-slate-700">ICH</th>
                      <th class="text-center py-2.5 px-3 w-20 font-medium text-slate-700">Durchschn.</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="a in survey.answers"
                      :key="a.id"
                      class="border-t border-slate-100"
                    >
                      <td class="py-2 px-3 text-slate-700">{{ a.question?.criterion || a.question?.text || '—' }}</td>
                      <td class="py-2 px-3 text-center font-medium">{{ a.value }}</td>
                      <td class="py-2 px-3 text-center">{{ a.valueDurchschnitt != null ? a.valueDurchschnitt : '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>
        <div v-if="stats?.history?.length > 1" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Verlauf deiner Umfragen</h2>
          <div ref="historyChartContainerRef" class="w-full relative rounded-xl overflow-hidden" style="height: 256px;">
            <canvas ref="historyChartRef"></canvas>
          </div>
        </div>
        <div v-else-if="stats?.ownAverages && Object.keys(stats.ownAverages).length > 0" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 text-slate-500 text-sm">
          Verlauf wird ab 2 Umfragen angezeigt.
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Chart } from 'chart.js/auto';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import DimensionPieChart from '../components/DimensionPieChart.vue';
import { surveyService } from '../api/surveyService';

const route = useRoute();
const fromAdmin = computed(() => route.query.from === 'admin');
const survey = ref(null);
const stats = ref(null);
const loading = ref(true);
const historyChartRef = ref(null);
const historyChartContainerRef = ref(null);
let historyChart = null;

function computeStatsFromAnswers(surveyData) {
  if (!surveyData?.answers?.length) return null;
  const byDim = {};
  const byDimDurchschnitt = {};
  for (const a of surveyData.answers) {
    const q = a.question;
    if (!q?.dimensionName) continue;
    const dim = q.dimensionName;
    if (!byDim[dim]) byDim[dim] = { sum: 0, count: 0 };
    byDim[dim].sum += Number(a.value) || 0;
    byDim[dim].count += 1;
    if (a.valueDurchschnitt != null) {
      if (!byDimDurchschnitt[dim]) byDimDurchschnitt[dim] = { sum: 0, count: 0 };
      byDimDurchschnitt[dim].sum += Number(a.valueDurchschnitt);
      byDimDurchschnitt[dim].count += 1;
    }
  }
  const ownAverages = {};
  const ownDurchschnittAverages = {};
  for (const [dim, { sum, count }] of Object.entries(byDim)) {
    ownAverages[dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
  }
  for (const [dim, { sum, count }] of Object.entries(byDimDurchschnitt)) {
    ownDurchschnittAverages[dim] = count ? Math.round((sum / count) * 10) / 10 : 0;
  }
  return { ownAverages, ownDurchschnittAverages };
}

onMounted(async () => {
  try {
    const [surveyRes, statsRes] = await Promise.all([
      surveyService.getSurvey(route.params.id),
      surveyService.getSurveyStats(route.params.id),
    ]);
    survey.value = surveyRes.survey;
    let resolvedStats = statsRes;
    const hasOwnAverages = statsRes?.ownAverages && Object.keys(statsRes.ownAverages).length > 0;
    if (!hasOwnAverages && surveyRes.survey?.answers?.length) {
      const fallback = computeStatsFromAnswers(surveyRes.survey);
      if (fallback) {
        resolvedStats = {
          ...statsRes,
          ownAverages: fallback.ownAverages,
          ownDurchschnittAverages: fallback.ownDurchschnittAverages,
          globalAverages: statsRes?.globalAverages || {},
          history: statsRes?.history || [],
        };
      }
    }
    stats.value = resolvedStats;
    if (resolvedStats?.history?.length > 1) {
      await nextTick();
      setTimeout(() => tryDrawHistoryChart(), 250);
    }
  } catch {
    survey.value = null;
    stats.value = null;
  } finally {
    loading.value = false;
  }
});

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function drawHistoryChart() {
  if (!historyChartRef.value || !historyChartContainerRef.value || !stats.value?.history?.length) return false;
  const container = historyChartContainerRef.value;
  if (container.offsetWidth === 0 || container.offsetHeight === 0) return false;
  const history = stats.value.history;
  const dimensions = [...new Set(history.flatMap((h) => Object.keys(h.averagesByDimension)))];
  const labels = history.map((h) => formatDate(h.createdAt));
  const datasets = dimensions.map((dim, i) => ({
    label: dim,
    data: history.map((h) => h.averagesByDimension[dim] ?? 0),
    borderColor: ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
    tension: 0.3,
    fill: false,
  }));
  if (historyChart) historyChart.destroy();
  historyChart = new Chart(historyChartRef.value.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { min: 0, max: 100 },
      },
    },
  });
  return true;
}

function tryDrawHistoryChart(attempt = 0) {
  if (drawHistoryChart()) return;
  if (attempt < 15) {
    requestAnimationFrame(() => setTimeout(() => tryDrawHistoryChart(attempt + 1), 50));
  }
}

onBeforeUnmount(() => {
  if (historyChart) {
    historyChart.destroy();
    historyChart = null;
  }
});
</script>
