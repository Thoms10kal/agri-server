<script setup lang="ts">
import { RouterView } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { LogOut, Leaf } from 'lucide-vue-next'

const router = useRouter()

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header vert professionnel -->
    <nav class="bg-emerald-600 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Leaf class="w-9 h-9" />
          <span class="text-3xl font-bold tracking-tight">Agriculture Intelligente</span>
        </div>

        <div class="hidden md:flex items-center gap-10 text-lg font-medium">
          <router-link to="/dashboard" class="hover:text-emerald-100 transition">Tableau de bord</router-link>
          <router-link to="/historique" class="hover:text-emerald-100 transition">Historique</router-link>
          <router-link to="/seuils" class="hover:text-emerald-100 transition">Seuils</router-link>
        </div>

        <button @click="handleLogout" class="flex items-center gap-2 hover:text-emerald-100 transition">
          <LogOut class="w-5 h-5" />
          <span class="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </nav>

    <RouterView />
  </div>
</template>