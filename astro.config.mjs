import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Netrunner Academy',
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Getting Started', link: '/getting-started/introduction/' },
					],
				},
				{
					label: 'OS Security',
					collapsed: true,
					items: [
						{ label: 'Windows', link: '/os-security/windows/'}
					]
				},
			],
			pagination: false,
		}),
	],
});
