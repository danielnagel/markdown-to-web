<script setup>
import { ref, watch } from 'vue';
import { apiClient } from '../api/client';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const props = defineProps({
  source: { type: String, required: true },
  filePath: { type: String, required: true },
});

const content = ref('');
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const encodedPath = props.filePath.split('/').map(encodeURIComponent).join('/');
    const data = await apiClient.get(`/file/${encodeURIComponent(props.source)}/${encodedPath}`);
    content.value = data.content;
  } catch {
    error.value = 'Could not load this file.';
  } finally {
    loading.value = false;
  }
}

watch(() => [props.source, props.filePath], load, { immediate: true });
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 md:p-8">
    <p
      v-if="loading"
      class="text-sm text-secondary/60"
    >
      Loading…
    </p>
    <p
      v-else-if="error"
      class="text-sm text-red-600"
    >
      {{ error }}
    </p>
    <MarkdownRenderer
      v-else
      :content="content"
    />
  </div>
</template>
