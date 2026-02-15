<template>
  <DashboardLayout>
    <div class="max-w-full">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Hofstede: Kulturdimensionen</h1>
        <p class="text-slate-600 mt-1">Skala 0–100 Punkte je Zeile unter ICH und DURCHSCHNITT.</p>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-slate-500">
        <div class="w-12 h-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-4"></div>
        <p>Fragen werden geladen…</p>
      </div>

      <template v-else>
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Tabelle (bzw. Karten auf Mobile) -->
          <div class="flex-1 min-w-0">
            <!-- Desktop: scrollbare Tabelle -->
            <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-soft">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th class="sticky left-0 z-10 bg-slate-50/80 px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">Kriterien</th>
                    <th class="px-4 py-3.5 font-semibold text-slate-800">Schwache Ausprägung</th>
                    <th class="px-4 py-3.5 font-semibold text-slate-800">Starke Ausprägung</th>
                    <th class="px-4 py-3.5 font-semibold text-slate-800 text-center w-24">ICH</th>
                    <th class="px-4 py-3.5 font-semibold text-slate-800 text-center w-28">DURCHSCHNITT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(q, idx) in questions"
                    :key="q.id"
                    :class="idx % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'"
                    class="border-b border-slate-100 last:border-0"
                  >
                    <td class="sticky left-0 z-10 px-4 py-3 bg-inherit font-medium text-slate-800">
                      {{ displayCriterion(q) }}
                      <a
                        v-if="idx === 0"
                        href="#"
                        class="ml-1 text-xs text-primary-600 hover:underline font-normal"
                        @click.prevent="showErklaerung = true"
                      >
                        Erklärung Hofstede
                      </a>
                    </td>
                    <td class="px-4 py-3 text-slate-600">{{ displayWeak(q) }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ displayStrong(q) }}</td>
                    <td class="px-2 py-3 text-center">
                      <input
                        :value="answers[q.id].value"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0–100"
                        class="w-16 h-11 text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 min-h-[44px]"
                        @input="clampInput(q.id, 'value', $event)"
                      />
                    </td>
                    <td class="px-2 py-3 text-center">
                      <input
                        :value="answers[q.id].valueDurchschnitt"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0–100"
                        class="w-16 h-11 text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 min-h-[44px]"
                        @input="clampInput(q.id, 'valueDurchschnitt', $event)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile: Karten pro Kriterium -->
            <div class="md:hidden space-y-4">
              <div
                v-for="(q, idx) in questions"
                :key="q.id"
                class="bg-white rounded-xl border border-slate-100 shadow-card p-4"
              >
                <div class="font-medium text-slate-800 mb-1">{{ displayCriterion(q) }}</div>
                <div v-if="idx === 0" class="mb-2">
                  <a href="#" class="text-xs text-primary-600 hover:underline" @click.prevent="showErklaerung = true">Erklärung Hofstede</a>
                </div>
                <div class="text-sm text-slate-600 mb-2">
                  <span class="font-medium">Schwach:</span> {{ displayWeak(q) }}
                </div>
                <div class="text-sm text-slate-600 mb-4">
                  <span class="font-medium">Stark:</span> {{ displayStrong(q) }}
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">ICH</label>
                    <input
                      :value="answers[q.id].value"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0–100"
                      class="w-full h-12 text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 min-h-[44px]"
                      @input="clampInput(q.id, 'value', $event)"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">DURCHSCHNITT</label>
                    <input
                      :value="answers[q.id].valueDurchschnitt"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0–100"
                      class="w-full h-12 text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/30 min-h-[44px]"
                      @input="clampInput(q.id, 'valueDurchschnitt', $event)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p v-if="submitError" class="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{{ submitError }}</p>
            <button
              type="button"
              :disabled="submitting"
              class="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 min-h-[48px] shadow-card hover:shadow-card-hover transition"
              @click="submit"
            >
              {{ submitting ? 'Wird gesendet…' : 'Zur Auswertung' }}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <!-- Sidebar Anleitung -->
          <aside class="lg:w-72 flex-shrink-0">
            <div class="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-5 shadow-soft">
              <h2 class="font-bold text-lg mb-3">So funktioniert’s</h2>
              <p class="text-primary-50 text-sm mb-3">
                Trage in jeder Zeile unter <strong class="text-white">ICH</strong> und <strong class="text-white">DURCHSCHNITT</strong> Punkte von 0–100 ein: deine Einschätzung von dir selbst und vom „Durchschnitts-Deutschen“.
              </p>
              <p class="text-primary-50 text-sm">
                Skala: 0 = sehr schwach, 100 = sehr stark. Am Ende siehst du deine Auswertung im Vergleich zu anderen.
              </p>
            </div>
          </aside>
        </div>
      </template>

      <!-- Modal Erklärung Hofstede -->
      <div
        v-if="showErklaerung"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        @click.self="showErklaerung = false"
      >
        <div class="bg-white rounded-2xl shadow-soft max-w-md w-full p-6 border border-slate-100" @click.stop>
          <h3 class="font-semibold text-slate-800 mb-2">Erklärung Hofstede</h3>
          <p class="text-slate-600 text-sm mb-6">
            Die Kulturdimensionen nach Geert Hofstede beschreiben typische Wertorientierungen in Gesellschaften.
            Mit dieser Umfrage schätzt du dich selbst (ICH) und den „Durchschnitts-Deutschen“ (DURCHSCHNITT) ein.
          </p>
          <button
            type="button"
            class="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition"
            @click="showErklaerung = false"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { surveyService } from '../api/surveyService';

const router = useRouter();
const questions = ref([]);
const answers = ref({});
const loading = ref(true);
const submitting = ref(false);
const submitError = ref('');
const showErklaerung = ref(false);

function displayCriterion(q) {
  if (q.criterion) return q.criterion;
  const m = q.text && q.text.match(/^([^:]+):/);
  return m ? m[1].trim() : q.text || '—';
}

function displayWeak(q) {
  if (q.weakExpression) return q.weakExpression;
  const m = q.text && q.text.match(/Schwach\s*=\s*([^|]+)/);
  return m ? m[1].trim() : '—';
}

function displayStrong(q) {
  if (q.strongExpression) return q.strongExpression;
  const m = q.text && q.text.match(/Stark\s*=\s*([^(\n]+)/);
  return m ? m[1].trim() : '—';
}

function clampInput(questionId, field, event) {
  const raw = event.target.value;
  if (raw === '' || raw === null || raw === undefined) {
    answers.value[questionId][field] = '';
    return;
  }
  const num = Number(raw);
  if (Number.isNaN(num)) {
    answers.value[questionId][field] = '';
    return;
  }
  const clamped = Math.min(100, Math.max(0, num));
  answers.value[questionId][field] = clamped === num ? num : clamped;
  event.target.value = clamped;
}

onMounted(async () => {
  try {
    questions.value = await surveyService.getQuestions();
    const initial = {};
    questions.value.forEach((q) => {
      initial[q.id] = { value: '', valueDurchschnitt: '' };
    });
    answers.value = initial;
  } catch {
    questions.value = [];
  } finally {
    loading.value = false;
  }
});

async function submit() {
  submitError.value = '';
  const missing = questions.value.some((q) => {
    const a = answers.value[q.id];
    const v = a?.value;
    const d = a?.valueDurchschnitt;
    return v === '' || v === null || v === undefined || d === '' || d === null || d === undefined;
  });
  if (missing) {
    submitError.value = 'Bitte alle Zeilen ausfüllen (ICH und DURCHSCHNITT 0–100).';
    return;
  }
  for (const q of questions.value) {
    const a = answers.value[q.id];
    const v = Number(a.value);
    const d = Number(a.valueDurchschnitt);
    if (v < 0 || v > 100 || d < 0 || d > 100) {
      submitError.value = 'Alle Werte müssen zwischen 0 und 100 liegen.';
      return;
    }
  }
  submitting.value = true;
  try {
    const answerList = questions.value.map((q) => {
      const a = answers.value[q.id];
      return {
        questionId: q.id,
        value: Number(a.value),
        valueDurchschnitt: Number(a.valueDurchschnitt),
      };
    });
    const survey = await surveyService.createSurvey(answerList);
    router.push(`/survey/${survey.id}`);
  } catch (err) {
    submitError.value = err.response?.data?.message || 'Speichern fehlgeschlagen';
  } finally {
    submitting.value = false;
  }
}
</script>
