import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://showdown.best/sitemap.xml
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
