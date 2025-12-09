import data from '../../data/showdown.json';

/** @type {import('./$types').PageLoad} */
export function load() {
	return {
		models: data.models,
		categories: data.categories,
		meta: data.meta
	};
}
