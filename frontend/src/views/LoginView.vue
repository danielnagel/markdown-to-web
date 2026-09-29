<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { isDemoMode } from '../constants/mode';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(username.value, password.value);
    router.push(route.query.redirect || { name: 'sources' });
  } catch {
    error.value = 'Invalid username or password.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex items-center justify-center gap-2">
        <img
          src="/logo.svg"
          alt="Logo"
          class="h-8 w-8"
        >
        <h1 class="text-xl font-semibold">
          Markdown to Web
        </h1>
      </div>

      <div
        v-if="isDemoMode()"
        class="mb-4 rounded border border-accent/30 bg-accent/5 p-3 text-sm"
      >
        <p class="mb-1">
          This is a public demo. Log in with:
        </p>
        <p><strong>Username:</strong> demo &nbsp; <strong>Password:</strong> demo</p>
        <a
          href="https://github.com/danielnagel/markdown-to-web/tree/main/demo/notes"
          target="_blank"
          rel="noopener"
          class="mt-1 inline-block text-accent underline"
        >
          View the demo notes on GitHub
        </a>
      </div>

      <form
        class="space-y-3"
        @submit.prevent="submit"
      >
        <input
          v-model="username"
          type="text"
          placeholder="Username"
          autocomplete="username"
          class="w-full rounded border border-black/15 px-3 py-2"
        >
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
          class="w-full rounded border border-black/15 px-3 py-2"
        >
        <p
          v-if="error"
          class="text-sm text-red-600"
        >
          {{ error }}
        </p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded bg-accent px-3 py-2 text-white disabled:opacity-50"
        >
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>
    </div>
  </div>
</template>
