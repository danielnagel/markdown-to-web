<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';

const route = useRoute();
const sidebarOpen = ref(false);

const showChrome = computed(() => route.meta.requiresAuth === true);

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  },
);
</script>

<template>
  <div
    v-if="showChrome"
    class="flex h-full"
  >
    <AppSidebar
      :open="sidebarOpen"
      @close="sidebarOpen = false"
    />
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center gap-3 border-b border-black/10 px-4 py-3 md:hidden">
        <button
          type="button"
          class="text-2xl leading-none"
          aria-label="Toggle navigation"
          @click="sidebarOpen = !sidebarOpen"
        >
          ☰
        </button>
        <span class="font-semibold">Markdown to Web</span>
      </header>
      <main class="min-w-0 flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
  <router-view v-else />
</template>
