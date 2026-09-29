<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSourcesStore } from '../stores/sources.store';

const sourcesStore = useSourcesStore();
const router = useRouter();

onMounted(async () => {
  if (!sourcesStore.loaded) {
    await sourcesStore.fetchSources();
  }
  // Skip the picker entirely when there's nothing to pick between.
  if (sourcesStore.sources.length === 1) {
    router.replace({ name: 'source', params: { source: sourcesStore.sources[0].name } });
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-lg font-semibold">
      Sources
    </h1>
    <ul
      v-if="sourcesStore.sources.length > 1"
      class="space-y-2"
    >
      <li
        v-for="s in sourcesStore.sources"
        :key="s.name"
      >
        <router-link
          :to="{ name: 'source', params: { source: s.name } }"
          class="block rounded border border-black/10 px-3 py-2 hover:bg-black/5"
        >
          {{ s.name }}
        </router-link>
      </li>
    </ul>
    <p
      v-else-if="sourcesStore.loaded"
      class="text-sm text-secondary/60"
    >
      Loading…
    </p>
  </div>
</template>
