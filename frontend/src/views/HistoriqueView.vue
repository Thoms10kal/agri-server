<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { AlertTriangle, Clock, Activity } from 'lucide-vue-next'

const alerts = ref<any[]>([])
const actions = ref<any[]>([])

const fetchAlerts = async () => {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20)
  if (data) alerts.value = data
}

const fetchActions = async () => {
  const { data } = await supabase
    .from('actuator_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(20)
  if (data) actions.value = data
}

const subscribeRealtime = () => {
  // Realtime Alertes
  supabase
    .channel('alerts-realtime')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => {
        alerts.value.unshift(payload.new)
        if (alerts.value.length > 20) alerts.value.pop()
      }
    )
    .subscribe()

  // Realtime Actions
  supabase
    .channel('actions-realtime')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'actuator_logs' },
      (payload) => {
        actions.value.unshift(payload.new)
        if (actions.value.length > 20) actions.value.pop()
      }
    )
    .subscribe()
}

onMounted(() => {
  fetchAlerts()
  fetchActions()
  subscribeRealtime()
})

onUnmounted(() => {
  supabase.removeAllChannels()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-8">
    <h1 class="text-4xl font-bold mb-8">Historique des alertes & actions</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Alertes -->
      <div>
        <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2 text-amber-600">
          <AlertTriangle class="w-6 h-6" />
          Dernières alertes
        </h2>
        <div class="bg-white rounded-3xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-amber-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-medium text-amber-700">Date</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-amber-700">Type</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-amber-700">Message</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="alert in alerts" :key="alert.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(alert.timestamp).toLocaleString('fr-FR') }}</td>
                <td class="px-6 py-4">
                  <span :class="alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'" 
                        class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ alert.type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">{{ alert.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div>
        <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2 text-emerald-600">
          <Activity class="w-6 h-6" />
          Historique des actions
        </h2>
        <div class="bg-white rounded-3xl shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-emerald-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-medium text-emerald-700">Date</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-emerald-700">Action</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-emerald-700">Valeur</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-emerald-700">Déclenché par</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="action in actions" :key="action.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(action.timestamp).toLocaleString('fr-FR') }}</td>
                <td class="px-6 py-4 font-medium">{{ action.action_type }}</td>
                <td class="px-6 py-4">{{ action.value }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ action.triggered_by }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>