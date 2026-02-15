<template>
  <div class="bg-white rounded-2xl shadow-soft border border-slate-100 p-5 min-w-0 flex flex-col h-full min-h-0">
    <h3 class="text-sm font-semibold text-slate-800 mb-4 flex-shrink-0">{{ dimensionName }}</h3>
    <div ref="containerRef" class="relative w-full flex-1 min-h-[256px]">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import { Chart } from 'chart.js/auto';

const props = defineProps({
  dimensionName: { type: String, required: true },
  ownValue: { type: Number, default: 0 },
  averageValue: { type: Number, default: 0 },
  userDurchschnittValue: { type: Number, default: null },
});

const chartRef = ref(null);
const containerRef = ref(null);
let chartInstance = null;

const hasUserDurchschnitt = computed(() => props.userDurchschnittValue != null);

const chartData = () => {
  let data;
  let labels;
  let colors;
  if (hasUserDurchschnitt.value) {
    labels = ['Ihr Wert (ICH)', 'Ihr eingeschätzter Durchschnitt', 'Durchschnitt aller Teilnehmer'];
    data = [props.ownValue, props.userDurchschnittValue, props.averageValue];
    colors = ['#22c55e', '#0ea5e9', '#94a3b8'];
  } else {
    labels = ['Ihr Wert', 'Durchschnitt aller Teilnehmer'];
    data = [props.ownValue, props.averageValue];
    colors = ['#22c55e', '#94a3b8'];
  }
  const sum = data.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    data = data.map(() => 1);
  }
  return {
    labels,
    datasets: [{ data, backgroundColor: colors, borderWidth: 0 }],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.raw}`,
      },
    },
  },
};

function initChart() {
  if (!chartRef.value || !containerRef.value) return;
  const container = containerRef.value;
  if (container.offsetWidth === 0 || container.offsetHeight === 0) return false;
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return false;
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: chartData(),
    options: chartOptions,
  });
  return true;
}

function tryInitChart(attempt = 0) {
  if (initChart()) return;
  if (attempt < 15) {
    requestAnimationFrame(() => setTimeout(() => tryInitChart(attempt + 1), 50));
  }
}

onMounted(async () => {
  await nextTick();
  setTimeout(() => tryInitChart(), 150);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

watch(
  () => [props.ownValue, props.averageValue, props.userDurchschnittValue],
  () => {
    if (chartInstance) {
      chartInstance.data = chartData();
      chartInstance.update();
    }
  },
  { deep: true }
);
</script>
