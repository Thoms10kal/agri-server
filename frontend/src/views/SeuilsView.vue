<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Save } from 'lucide-vue-next'

const thresholds = ref({
  soil_humidity_min: 30,
  air_temperature_max: 35,
  co2_ppm_max: 800,
  water_level_min: 20,
  luminosity_min: 5000
})

const loading = ref(false)

const loadThresholds = async () => {
  const { data } = await supabase
    .from('thresholds')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (data) thresholds.value = data
}

const saveThresholds = async () => {
  loading.value = true
  const { error } = await supabase
    .from('thresholds')
    .upsert({
      ...thresholds.value,
      updated_by: (await supabase.auth.getUser()).data.user?.id
    })

  if (!error) {
    alert('Seuils mis à jour avec succès ✅')
  } else {
    alert('Erreur lors de la sauvegarde')
  }
  loading.value = false
}

onMounted(loadThresholds)
</script>

<template>
  <div class="max-w-2xl mx-auto p-8">
    <h1 class="text-4xl font-bold mb-8">Configuration des seuils</h1>

    <div class="bg-white rounded-3xl shadow p-8 space-y-8">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium mb-2">Humidité sol minimum (%)</label>
          <input v-model.number="thresholds.soil_humidity_min" type="number" class="w-full px-4 py-3 border rounded-2xl">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Température max (°C)</label>
          <input v-model.number="thresholds.air_temperature_max" type="number" class="w-full px-4 py-3 border rounded-2xl">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">CO₂ max (ppm)</label>
          <input v-model.number="thresholds.co2_ppm_max" type="number" class="w-full px-4 py-3 border rounded-2xl">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Niveau eau minimum (%)</label>
          <input v-model.number="thresholds.water_level_min" type="number" class="w-full px-4 py-3 border rounded-2xl">
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Luminosité minimum (lux)</label>
          <input v-model.number="thresholds.luminosity_min" type="number" class="w-full px-4 py-3 border rounded-2xl">
        </div>
      </div>

      <button
        @click="saveThresholds"
        :disabled="loading"
        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
      >
        <Save class="w-5 h-5" />
        <span v-if="loading">Sauvegarde en cours...</span>
        <span v-else>Enregistrer les seuils</span>
      </button>
    </div>
  </div>
</template>