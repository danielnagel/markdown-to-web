<script setup>
defineProps({
  entry: { type: Object, required: true },
  source: { type: String, required: true },
});
</script>

<template>
  <div
    v-if="entry.type === 'dir'"
    class="my-0.5"
  >
    <details open>
      <summary class="cursor-pointer select-none rounded px-2 py-1 text-sm font-medium hover:bg-black/5">
        {{ entry.name }}
      </summary>
      <ul class="border-l border-black/10 pl-3">
        <li
          v-for="child in entry.children"
          :key="child.path"
        >
          <TreeEntry
            :entry="child"
            :source="source"
          />
        </li>
      </ul>
    </details>
  </div>
  <router-link
    v-else
    :to="{ name: 'file', params: { source, filePath: entry.path } }"
    class="block truncate rounded px-2 py-1 text-sm hover:bg-black/5"
    active-class="bg-black/10 font-medium"
  >
    {{ entry.name }}
  </router-link>
</template>
