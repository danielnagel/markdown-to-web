import { defineStore } from 'pinia';
import { apiClient } from '../api/client';

export const useSourcesStore = defineStore('sources', {
  state: () => ({
    sources: [],
    loaded: false,
    trees: {},
  }),

  actions: {
    async fetchSources() {
      this.sources = await apiClient.get('/sources');
      this.loaded = true;
      return this.sources;
    },

    async fetchTree(source) {
      const tree = await apiClient.get(`/tree/${source}`);
      this.trees[source] = tree;
      return tree;
    },
  },
});
