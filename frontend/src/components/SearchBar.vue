<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({ source: { type: String, required: true } });
const router = useRouter();
const query = ref('');

function submit() {
  const q = query.value.trim();
  if (!q) return;
  router.push({ name: 'search', params: { source: props.source }, query: { q } });
}
</script>

<template>
  <form
    class="flex gap-2"
    @submit.prevent="submit"
  >
    <input
      v-model="query"
      type="search"
      placeholder="Search…"
      class="w-full rounded border border-black/15 px-2 py-1.5 text-sm"
    >
  </form>
</template>
