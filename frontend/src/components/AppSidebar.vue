<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSourcesStore } from '../stores/sources.store';
import { useAuthStore } from '../stores/auth.store';
import SearchBar from './SearchBar.vue';
import TreeEntry from './TreeEntry.vue';

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();
const sourcesStore = useSourcesStore();
const authStore = useAuthStore();

const currentSource = computed(() => route.params.source);
const tree = computed(() => (currentSource.value ? sourcesStore.trees[currentSource.value] : null));

watch(
  currentSource,
  (name) => {
    if (name && !sourcesStore.trees[name]) {
      sourcesStore.fetchTree(name);
    }
  },
  { immediate: true },
);

function logout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-20 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-black/10 bg-primary transition-transform md:static md:w-64 md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between border-b border-black/10 px-4 py-3">
      <router-link
        :to="{ name: 'sources' }"
        class="flex items-center gap-2 font-semibold"
      >
        <img
          src="/logo.svg"
          alt="Logo"
          class="h-7 w-7"
        >
        Markdown to Web
      </router-link>
      <button
        type="button"
        class="text-xl leading-none md:hidden"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <div
      v-if="currentSource"
      class="flex-1 space-y-3 p-3"
    >
      <SearchBar :source="currentSource" />
      <nav
        v-if="tree"
        aria-label="File tree"
      >
        <ul>
          <li
            v-for="entry in tree"
            :key="entry.path"
          >
            <TreeEntry
              :entry="entry"
              :source="currentSource"
            />
          </li>
        </ul>
      </nav>
      <p
        v-else
        class="text-sm text-secondary/60"
      >
        Loading…
      </p>
    </div>

    <div class="border-t border-black/10 p-3">
      <button
        type="button"
        class="text-sm text-secondary/70 hover:text-secondary"
        @click="logout"
      >
        Log out
      </button>
    </div>
  </aside>
</template>
