import data from '$lib/../../data/showdown.json';
import { rankModels } from '$lib/ranking.js';

export function load() {
  const rankedModels = rankModels(data.models, data.categories);
  return {
    models: rankedModels,
    categories: data.categories,
    meta: data.meta
  };
}
