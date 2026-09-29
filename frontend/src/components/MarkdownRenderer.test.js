import { it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { createRouter, createWebHistory } from 'vue-router';
import MarkdownRenderer from './MarkdownRenderer.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div/>' } }],
});

it('renders markdown to HTML', () => {
  const { container } = render(MarkdownRenderer, {
    props: { content: '# Hello\n\nSome *text*.' },
    global: { plugins: [router] },
  });

  expect(container.querySelector('h1').textContent).toBe('Hello');
  expect(container.querySelector('em').textContent).toBe('text');
});

it('escapes raw HTML in the source instead of executing it', () => {
  const { container } = render(MarkdownRenderer, {
    props: { content: '<img src=x onerror="window.__pwned = true">' },
    global: { plugins: [router] },
  });

  expect(container.querySelector('img')).toBeNull();
  expect(window.__pwned).toBeUndefined();
});
