/**
 * Memoization cache interface
 */
interface MemoCache {
	[key: string]: any;
}

/**
 * Create a simple memoization function
 * @param fn - Function to memoize
 * @returns Memoized function with clearCache method
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T & { clearCache: () => void } {
	const cache: MemoCache = {};

	const memoized = function (...args: Parameters<T>): ReturnType<T> {
		const key = JSON.stringify(args);

		if (cache.hasOwnProperty(key)) {
			return cache[key];
		}

		const result = fn(...args);
		cache[key] = result;
		return result;
	} as T & { clearCache: () => void };

	memoized.clearCache = () => {
		Object.keys(cache).forEach(key => delete cache[key]);
	};

	return memoized;
}

/**
 * Create a memoized version of a function with a custom key generator
 * @param fn - Function to memoize
 * @param keyGenerator - Custom function to generate cache keys
 * @returns Memoized function with clearCache method
 */
export function memoizeWithKey<T extends (...args: any[]) => any>(
	fn: T,
	keyGenerator: (...args: Parameters<T>) => string
): T & { clearCache: () => void } {
	const cache: MemoCache = {};

	const memoized = function (...args: Parameters<T>): ReturnType<T> {
		const key = keyGenerator(...args);

		if (cache.hasOwnProperty(key)) {
			return cache[key];
		}

		const result = fn(...args);
		cache[key] = result;
		return result;
	} as T & { clearCache: () => void };

	memoized.clearCache = () => {
		Object.keys(cache).forEach(key => delete cache[key]);
	};

	return memoized;
}

/**
 * LRU (Least Recently Used) cache for memoization with limited size
 */
export class LRUCache<V> {
	private cache: Map<string, V>;
	private maxSize: number;

	constructor(maxSize: number = 100) {
		this.cache = new Map();
		this.maxSize = maxSize;
	}

	get(key: string): V | undefined {
		if (!this.cache.has(key)) return undefined;

		const value = this.cache.get(key)!;
		this.cache.delete(key);
		this.cache.set(key, value);
		return value;
	}

	set(key: string, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
		} else if (this.cache.size >= this.maxSize) {
			const firstKey = this.cache.keys().next().value;
			this.cache.delete(firstKey);
		}
		this.cache.set(key, value);
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}
}
