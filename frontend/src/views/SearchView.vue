<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '../api/client';
import { parseSnippet } from '../lib/snippet';

const props = defineProps({ source: { type: String, required: true } });
const route = useRoute();

const results = ref([]);
const loading = ref(false);

async function runSearch(q) {
  if (!q) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    results.value = await apiClient.get(`/search/${encodeURIComponent(props.source)}`, { q });
  } finally {
    loading.value = false;
  }
}

watch(() => route.query.q, (q) => runSearch(q), { immediate: true });

const parsedResults = computed(() => results.value.map((r) => ({ ...r, parts: parseSnippet(r.snippet) })));
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4 text-lg font-semibold">
      Search results for "{{ route.query.q }}"
    </h1>
    <p
      v-if="loading"
      class="text-sm text-secondary/60"
    >
      Searching…
    </p>
    <p
      v-else-if="parsedResults.length === 0"
      class="text-sm text-secondary/60"
    >
      No results.
    </p>
    <ul
      v-else
      class="space-y-4"
    >
      <li
        v-for="r in parsedResults"
        :key="r.path"
      >
        <router-link
          :to="{ name: 'file', params: { source, filePath: r.path } }"
          class="font-medium text-accent hover:underline"
        >
          {{ r.filename }}
        </router-link>
        <p class="text-sm text-secondary/70">
          <template
            v-for="(part, i) in r.parts"
            :key="i"
          >
            <mark
              v-if="part.highlighted"
              class="bg-accent/20 text-secondary"
            >{{ part.text }}</mark>
            <template v-else>
              {{ part.text }}
            </template>
          </template>
        </p>
      </li>
    </ul>
  </div>
</template>
