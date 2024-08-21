import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			favicon: '/favicon.png',
			title: 'Netrunner Academy',
			social: {
				github: 'https://github.com/miahacybersec',
				signal: 'https://signal.me/#eu/xJL5Uush7CTieP5Zd5GGCIW53o6rS2Zq4oX8Vu31FhR_MmSZgRVGPYbta2iAf4Ep'
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
					collapsed: false,
					items: [
						{ label: 'ChromeOS', link: '/os-security/chromeos/'},
						{ label: 'Linux', link: '/os-security/linux/'},
						{ label: 'macOS', link: '/os-security/macos/'},
						{ label: 'Windows', link: '/os-security/windows/'}
					]
				},
			],
			pagination: false,
		}),
	],
});
