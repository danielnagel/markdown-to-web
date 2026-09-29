<script setup>
// eslint-disable-next-line no-unused-vars
const props = defineProps({ source: { type: String, required: true } });
</script>

<template>
  <div class="flex h-full items-center justify-center p-8 text-center text-secondary/60">
    <p>Select a file from the sidebar to start reading.</p>
  </div>
</template>
