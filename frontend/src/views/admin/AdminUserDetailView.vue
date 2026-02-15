<template>
  <div>
    <router-link
      to="/admin/users"
      class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Zurück zu Nutzer
    </router-link>

    <div v-if="loading" class="text-slate-500 py-8">Lade…</div>
    <div v-else-if="!user" class="text-slate-500">Nutzer nicht gefunden.</div>
    <template v-else>
      <div class="bg-white rounded-2xl shadow-soft border border-slate-100 p-6 mb-6">
        <h1 class="text-2xl font-bold text-slate-800">{{ user.firstName }} {{ user.lastName }}</h1>
        <dl class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div><dt class="text-slate-500">E-Mail</dt><dd class="font-medium text-slate-800">{{ user.email }}</dd></div>
          <div><dt class="text-slate-500">Kursnummer</dt><dd class="font-medium text-slate-800">{{ user.courseNumber }}</dd></div>
          <div><dt class="text-slate-500">Rolle</dt><dd class="font-medium text-slate-800">{{ user.role }}</dd></div>
          <div v-if="user.age != null"><dt class="text-slate-500">Alter</dt><dd class="font-medium text-slate-800">{{ user.age }}</dd></div>
        </dl>
      </div>

      <h2 class="text-lg font-semibold text-slate-800 mb-4">Ausgefüllte Umfragen</h2>
      <div v-if="!user.surveys?.length" class="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 text-center text-slate-500">
        Dieser Nutzer hat noch keine Umfragen ausgefüllt.
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="s in user.surveys"
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
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { adminService } from '../../api/adminService';

const route = useRoute();
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    user.value = await adminService.getUser(route.params.id);
  } catch {
    user.value = null;
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
