<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { LogIn, Leaf } from 'lucide-vue-next'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMsg.value = error.message
  } else {
    router.push('/dashboard')
  }

  loading.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-800 px-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-emerald-600 px-8 py-10 text-white text-center">
        <div class="flex justify-center mb-4">
          <Leaf class="w-16 h-16" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight">Agriculture Intelligente</h1>
        <p class="mt-2 opacity-90">Système de gestion agricole IoT</p>
      </div>

      <!-- Form -->
      <div class="p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <LogIn class="w-5 h-5" />
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <p v-if="errorMsg" class="text-red-500 text-center mt-4 text-sm">
          {{ errorMsg }}
        </p>

        <div class="text-center mt-8 text-sm text-gray-500">
          Prototype UCAC-ICAM • 2025
        </div>
      </div>
    </div>
  </div>
</template>