import data from '$lib/../../data/showdown.json';

export function load() {
	return {
		models: data.models,
		categories: data.categories
	};
}
