<script setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { useRouter } from 'vue-router';

const props = defineProps({ content: { type: String, required: true } });
const router = useRouter();

// html: false escapes raw HTML in the source instead of passing it through -
// notes come from configured git/local sources, which this deployment's
// admin controls but which may still mirror third-party content.
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

const html = computed(() => md.render(props.content));

// Internal links are resolved server-side to /read/<source>/<path> (see
// backend/src/search/wikilinks.js); intercepting clicks on them keeps
// navigation inside the SPA router instead of a full page reload.
function onClick(event) {
  const link = event.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  if (href?.startsWith('/read/')) {
    event.preventDefault();
    router.push(href);
  }
}
</script>

<template>
  <!-- markdown-it (html: false above) escapes raw HTML from the source before this ever runs. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown-body" @click="onClick" v-html="html" />
</template>
