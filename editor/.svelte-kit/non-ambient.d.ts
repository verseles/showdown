
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/data" | "/api/git" | "/api/git/commit" | "/api/git/push" | "/api/git/status";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/data": Record<string, never>;
			"/api/git": Record<string, never>;
			"/api/git/commit": Record<string, never>;
			"/api/git/push": Record<string, never>;
			"/api/git/status": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/data" | "/api/data/" | "/api/git" | "/api/git/" | "/api/git/commit" | "/api/git/commit/" | "/api/git/push" | "/api/git/push/" | "/api/git/status" | "/api/git/status/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}