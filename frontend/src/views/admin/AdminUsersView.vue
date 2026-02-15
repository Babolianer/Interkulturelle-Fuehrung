<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Nutzer</h1>
    <div v-if="loading" class="text-slate-500 py-8">Lade…</div>
    <div v-else class="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">E-Mail</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Kurs</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rolle</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Umfragen</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <router-link :to="`/admin/users/${u.id}`" class="text-primary-600 hover:underline font-medium">
                {{ u.firstName }} {{ u.lastName }}
              </router-link>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
            <td class="px-4 py-3 text-slate-600">{{ u.courseNumber }}</td>
            <td class="px-4 py-3">
              <select
                :value="u.role"
                @change="changeRole(u.id, $event.target.value)"
                class="text-sm border border-slate-300 rounded px-2 py-1"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ u._count?.surveys ?? 0 }}</td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="u.id !== authStore.user?.id"
                type="button"
                @click="confirmDelete(u)"
                class="text-red-600 hover:underline text-sm"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { adminService } from '../../api/adminService';

const authStore = useAuthStore();
const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    users.value = await adminService.getUsers();
  } catch {
    users.value = [];
  } finally {
    loading.value = false;
  }
});

async function changeRole(id, role) {
  try {
    await adminService.updateUser(id, { role });
    const u = users.value.find((x) => x.id === id);
    if (u) u.role = role;
  } catch (err) {
    alert(err.response?.data?.message || 'Fehler');
  }
}

function confirmDelete(user) {
  if (!confirm(`Nutzer "${user.email}" wirklich löschen?`)) return;
  deleteUser(user.id);
}

async function deleteUser(id) {
  try {
    await adminService.deleteUser(id);
    users.value = users.value.filter((u) => u.id !== id);
  } catch (err) {
    alert(err.response?.data?.message || 'Löschen fehlgeschlagen');
  }
}
</script>
