import data from '../../data/showdown.json';
import type { ShowdownData } from '$lib/types.js';

export function load() {
	const typedData = data as unknown as ShowdownData;
	return {
		models: typedData.models,
		categories: typedData.categories,
		meta: typedData.meta
	};
}
