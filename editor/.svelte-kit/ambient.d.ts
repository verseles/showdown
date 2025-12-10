
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const LSCOLORS: string;
	export const npm_command: string;
	export const npm_config_userconfig: string;
	export const COLORTERM: string;
	export const FONTAWESOME_NPM_AUTH_TOKEN: string;
	export const npm_config_cache: string;
	export const LESS: string;
	export const XDG_MENU_PREFIX: string;
	export const DATABASE_URL: string;
	export const QT_IM_MODULES: string;
	export const SYNC_DIR: string;
	export const NODE: string;
	export const JAVA_HOME: string;
	export const CLOUDFLARE_EMAIL: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const OPENAI_API_KEY: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const HOMEBREW_PREFIX: string;
	export const XMODIFIERS: string;
	export const DESKTOP_SESSION: string;
	export const npm_config_globalconfig: string;
	export const GPG_TTY: string;
	export const CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: string;
	export const EDITOR: string;
	export const GUAKE_TAB_UUID: string;
	export const PWD: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const THIS_SCRIPT: string;
	export const npm_config_init_module: string;
	export const SYSTEMD_EXEC_PID: string;
	export const _: string;
	export const XAUTHORITY: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const QT_STYLE_OVERRIDE: string;
	export const MOTD_SHOWN: string;
	export const GDM_LANG: string;
	export const GTK2_RC_FILES: string;
	export const HOME: string;
	export const USERNAME: string;
	export const LANG: string;
	export const ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE: string;
	export const GITHUB_TOKEN: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const OLLAMA_CLOUD_API_KEY: string;
	export const npm_package_version: string;
	export const WASMTIME_HOME: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const VTE_VERSION: string;
	export const WAYLAND_DISPLAY: string;
	export const BRAVE_API_KEY: string;
	export const INVOCATION_ID: string;
	export const MANAGERPID: string;
	export const INIT_CWD: string;
	export const QT_QPA_PLATFORM: string;
	export const INFOPATH: string;
	export const npm_lifecycle_script: string;
	export const CONTEXT7_API_KEY: string;
	export const GNOME_SETUP_DISPLAY: string;
	export const npm_config_npm_version: string;
	export const XDG_SESSION_CLASS: string;
	export const ANDROID_HOME: string;
	export const CLOUDFLARE_API_KEY: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const ZSH: string;
	export const PB_ACCESS_TOKEN: string;
	export const CLONES_DIR: string;
	export const npm_config_prefix: string;
	export const USER: string;
	export const OPENCV_LOG_LEVEL: string;
	export const HOMEBREW_CELLAR: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const CHROME_EXECUTABLE: string;
	export const PAGER: string;
	export const OPENCLAUDE_API_KEY: string;
	export const ANDROID_SDK_ROOT: string;
	export const QT_IM_MODULE: string;
	export const HOMEBREW_REPOSITORY: string;
	export const MANAGERPIDFDID: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const XDG_RUNTIME_DIR: string;
	export const VULTR_API_KEY: string;
	export const DOCKER_REGISTRY: string;
	export const GIT_EXTERNAL_DIFF: string;
	export const DEBUGINFOD_URLS: string;
	export const DOCKER_HOST: string;
	export const npm_package_json: string;
	export const JOURNAL_STREAM: string;
	export const REMOTE_SYNC: string;
	export const BROWSER: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const BUILDAH_FORMAT: string;
	export const GDMSESSION: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const npm_config_global_prefix: string;
	export const MAIL: string;
	export const POSTGRES_CONNECTION_STRING: string;
	export const MINIMAX_API_KEY: string;
	export const GIO_LAUNCHED_DESKTOP_FILE_PID: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const GIO_LAUNCHED_DESKTOP_FILE: string;
	export const PROJECTS_DIR: string;
	export const OLDPWD: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		LSCOLORS: string;
		npm_command: string;
		npm_config_userconfig: string;
		COLORTERM: string;
		FONTAWESOME_NPM_AUTH_TOKEN: string;
		npm_config_cache: string;
		LESS: string;
		XDG_MENU_PREFIX: string;
		DATABASE_URL: string;
		QT_IM_MODULES: string;
		SYNC_DIR: string;
		NODE: string;
		JAVA_HOME: string;
		CLOUDFLARE_EMAIL: string;
		MEMORY_PRESSURE_WRITE: string;
		OPENAI_API_KEY: string;
		COLOR: string;
		npm_config_local_prefix: string;
		HOMEBREW_PREFIX: string;
		XMODIFIERS: string;
		DESKTOP_SESSION: string;
		npm_config_globalconfig: string;
		GPG_TTY: string;
		CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: string;
		EDITOR: string;
		GUAKE_TAB_UUID: string;
		PWD: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		THIS_SCRIPT: string;
		npm_config_init_module: string;
		SYSTEMD_EXEC_PID: string;
		_: string;
		XAUTHORITY: string;
		FZF_DEFAULT_COMMAND: string;
		QT_STYLE_OVERRIDE: string;
		MOTD_SHOWN: string;
		GDM_LANG: string;
		GTK2_RC_FILES: string;
		HOME: string;
		USERNAME: string;
		LANG: string;
		ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE: string;
		GITHUB_TOKEN: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		OLLAMA_CLOUD_API_KEY: string;
		npm_package_version: string;
		WASMTIME_HOME: string;
		MEMORY_PRESSURE_WATCH: string;
		VTE_VERSION: string;
		WAYLAND_DISPLAY: string;
		BRAVE_API_KEY: string;
		INVOCATION_ID: string;
		MANAGERPID: string;
		INIT_CWD: string;
		QT_QPA_PLATFORM: string;
		INFOPATH: string;
		npm_lifecycle_script: string;
		CONTEXT7_API_KEY: string;
		GNOME_SETUP_DISPLAY: string;
		npm_config_npm_version: string;
		XDG_SESSION_CLASS: string;
		ANDROID_HOME: string;
		CLOUDFLARE_API_KEY: string;
		TERM: string;
		npm_package_name: string;
		ZSH: string;
		PB_ACCESS_TOKEN: string;
		CLONES_DIR: string;
		npm_config_prefix: string;
		USER: string;
		OPENCV_LOG_LEVEL: string;
		HOMEBREW_CELLAR: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		MOZ_ENABLE_WAYLAND: string;
		CHROME_EXECUTABLE: string;
		PAGER: string;
		OPENCLAUDE_API_KEY: string;
		ANDROID_SDK_ROOT: string;
		QT_IM_MODULE: string;
		HOMEBREW_REPOSITORY: string;
		MANAGERPIDFDID: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		XDG_RUNTIME_DIR: string;
		VULTR_API_KEY: string;
		DOCKER_REGISTRY: string;
		GIT_EXTERNAL_DIFF: string;
		DEBUGINFOD_URLS: string;
		DOCKER_HOST: string;
		npm_package_json: string;
		JOURNAL_STREAM: string;
		REMOTE_SYNC: string;
		BROWSER: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		BUILDAH_FORMAT: string;
		GDMSESSION: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		npm_config_global_prefix: string;
		MAIL: string;
		POSTGRES_CONNECTION_STRING: string;
		MINIMAX_API_KEY: string;
		GIO_LAUNCHED_DESKTOP_FILE_PID: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		GIO_LAUNCHED_DESKTOP_FILE: string;
		PROJECTS_DIR: string;
		OLDPWD: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
