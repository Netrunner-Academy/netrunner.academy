import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			favicon: '/favicon.png',
			title: 'Netrunner Academy',
			social: {
				github: 'https://github.com/Netrunner-Academy',
				signal: 'https://signal.me/#eu/uMi0jCmn-sROI_W4ONWRWkoh7LFN1TVh8P9d-HyR2njyYHpv_yVIN6at0dp-dtez'
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
					label: 'CPU Security',
					collapsed: false,
					items: [
						{ label: 'CPU Security', link: '/cpu-security/cpu-security/'}
					]
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
