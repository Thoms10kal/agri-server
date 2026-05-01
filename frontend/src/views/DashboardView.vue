<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Droplets, Thermometer, Wind, Sun, AlertTriangle, Zap, Fan, Sprout } from 'lucide-vue-next'

const readings = ref<any>({})
const lastUpdate = ref('')

// États des actionneurs
const actuators = ref({
  irrigation: { status: false, mode: 'auto' as 'auto' | 'manual' },
  ventilation: { status: false, mode: 'auto' as 'auto' | 'manual' },
  lighting: { status: false, mode: 'auto' as 'auto' | 'manual' }
})

const fetchLatestReadings = async () => {
  const { data } = await supabase
    .from('sensor_readings')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  if (data) readings.value = data
}

const subscribeToReadings = () => {
  supabase.channel('realtime-readings')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
      readings.value = payload.new
      lastUpdate.value = new Date().toLocaleTimeString('fr-FR')
    })
    .subscribe()
}

// Fonction pour contrôler un actionneur
const toggleActuator = async (key: 'irrigation' | 'ventilation' | 'lighting') => {
  const actuator = actuators.value[key]
  actuator.status = !actuator.status

  const actionType = key === 'irrigation' ? 'irrigation' : key === 'ventilation' ? 'ventilation' : 'lighting'
  const value = actuator.status ? 'ON' : 'OFF'

  await supabase.from('actuator_logs').insert({
    action_type: actionType,
    value: value,
    triggered_by: `${actuator.mode} - manual`
  })

  // Ici tu pourras plus tard ajouter l'appel HTTP/MQTT vers l'ESP32
}

onMounted(() => {
  fetchLatestReadings()
  subscribeToReadings()
})

onUnmounted(() => supabase.removeAllChannels())
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-10">
      <h1 class="text-4xl lg:text-5xl font-bold text-gray-900">Tableau de bord en temps réel</h1>
      <div class="flex items-center gap-2 text-emerald-600 font-medium mt-3 lg:mt-0">
        <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        En direct • {{ lastUpdate || 'Chargement...' }}
      </div>
    </div>

    <!-- Cartes Capteurs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow transition">
        <div class="flex justify-between">
          <div>
            <p class="text-emerald-600 text-sm font-semibold">HUMIDITÉ DU SOL</p>
            <p class="text-6xl font-semibold text-gray-900 mt-4">{{ readings.soil_humidity ?? '--' }}<span class="text-3xl text-gray-400">%</span></p>
          </div>
          <Droplets class="w-14 h-14 text-blue-500" />
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow transition">
        <div class="flex justify-between">
          <div>
            <p class="text-red-600 text-sm font-semibold">TEMPÉRATURE</p>
            <p class="text-6xl font-semibold text-gray-900 mt-4">{{ readings.air_temperature ?? '--' }}<span class="text-3xl text-gray-400">°C</span></p>
          </div>
          <Thermometer class="w-14 h-14 text-red-500" />
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow transition">
        <div class="flex justify-between">
          <div>
            <p class="text-emerald-600 text-sm font-semibold">CO₂</p>
            <p class="text-6xl font-semibold text-gray-900 mt-4">{{ readings.co2_ppm ?? '--' }}<span class="text-3xl text-gray-400">ppm</span></p>
          </div>
          <Wind class="w-14 h-14 text-emerald-500" />
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow transition">
        <div class="flex justify-between">
          <div>
            <p class="text-amber-600 text-sm font-semibold">LUMINOSITÉ</p>
            <p class="text-6xl font-semibold text-gray-900 mt-4">{{ readings.luminosity ?? '--' }}<span class="text-3xl text-gray-400">lux</span></p>
          </div>
          <Sun class="w-14 h-14 text-yellow-500" />
        </div>
      </div>
    </div>

    <!-- Contrôle des Actionneurs -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10">
      <h2 class="text-2xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
        <Zap class="w-7 h-7 text-emerald-600" />
        Contrôle des Actionneurs
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Arroseur -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Sprout class="w-9 h-9 text-blue-500" />
              <div>
                <p class="font-semibold">Arroseur</p>
                <p class="text-sm text-gray-500">Pompe d'irrigation</p>
              </div>
            </div>
            <button @click="toggleActuator('irrigation')" 
                    :class="actuators.irrigation.status ? 'bg-emerald-500' : 'bg-gray-300'"
                    class="w-14 h-8 rounded-full relative transition">
              <span :class="actuators.irrigation.status ? 'translate-x-7' : 'translate-x-1'" 
                    class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition"></span>
            </button>
          </div>
          <div class="text-xs text-gray-500">Mode : <span class="font-medium">{{ actuators.irrigation.mode === 'auto' ? 'Automatique' : 'Manuel' }}</span></div>
        </div>

        <!-- Ventilateur -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Fan class="w-9 h-9 text-cyan-500" />
              <div>
                <p class="font-semibold">Ventilateur</p>
                <p class="text-sm text-gray-500">Ventilation serre</p>
              </div>
            </div>
            <button @click="toggleActuator('ventilation')" 
                    :class="actuators.ventilation.status ? 'bg-emerald-500' : 'bg-gray-300'"
                    class="w-14 h-8 rounded-full relative transition">
              <span :class="actuators.ventilation.status ? 'translate-x-7' : 'translate-x-1'" 
                    class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition"></span>
            </button>
          </div>
          <div class="text-xs text-gray-500">Mode : <span class="font-medium">{{ actuators.ventilation.mode === 'auto' ? 'Automatique' : 'Manuel' }}</span></div>
        </div>

        <!-- Éclairage -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <Sun class="w-9 h-9 text-amber-500" />
              <div>
                <p class="font-semibold">Éclairage</p>
                <p class="text-sm text-gray-500">Lampes de croissance</p>
              </div>
            </div>
            <button @click="toggleActuator('lighting')" 
                    :class="actuators.lighting.status ? 'bg-emerald-500' : 'bg-gray-300'"
                    class="w-14 h-8 rounded-full relative transition">
              <span :class="actuators.lighting.status ? 'translate-x-7' : 'translate-x-1'" 
                    class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition"></span>
            </button>
          </div>
          <div class="text-xs text-gray-500">Mode : <span class="font-medium">{{ actuators.lighting.mode === 'auto' ? 'Automatique' : 'Manuel' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>