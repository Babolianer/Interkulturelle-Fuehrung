<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col items-center justify-center px-4 py-12">
    <div class="max-w-2xl w-full text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
        <span aria-hidden="true">📊</span>
        Umfrage zu den Hofstede-Dimensionen
      </div>
      <h1 class="text-4xl sm:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
        Interkulturelle Führung
      </h1>
      <p class="text-xl text-slate-600 mb-2 font-medium">
        „Interkulturell kompetente Führung – bei uns eine Selbstverständlichkeit?“
      </p>
      <p class="text-slate-500 mb-10 max-w-lg mx-auto">
        Nimm nur mit Account teil. Die Umfrage basiert auf den Hofstede-Dimensionen und hilft dir, deine Einschätzung einzuordnen.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <router-link
          to="/login"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-card hover:shadow-card-hover"
        >
          Jetzt teilnehmen
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </router-link>
        <router-link
          to="/register"
          class="inline-flex items-center px-6 py-4 border-2 border-primary-200 text-primary-700 font-medium rounded-xl hover:bg-primary-50 transition-colors"
        >
          Account erstellen
        </router-link>
      </div>
      <p class="mt-8 text-sm text-slate-500">
        Bereits angemeldet?
        <router-link to="/login" class="text-primary-600 hover:underline font-medium">Anmelden</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
</script>
