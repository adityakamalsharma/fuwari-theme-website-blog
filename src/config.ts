import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Aditya Kamal Sharma",
	subtitle: "Offensive Security & Penetration Testing",
	lang: "en", 
	themeColor: {
		hue: 250, 
		fixed: false, 
	},
	banner: {
		enable: true,
		src: "assets/images/actual-banner.png", 
		position: "center", 
		credit: {
			enable: false, 
			text: "", 
			url: "", 
		},
	},
	toc: {
		enable: true, 
		depth: 2, 
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/adityakamalsharma", 
			external: true, 
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/actual-avatar.jpg", // Update this when you add your image to the assets folder
	name: "Aditya Kamal Sharma",
	bio: "OSCP, OSCP+ | Penetration Tester |  Web Application & API Security | OWASP Top 10 | Network Exploitation | CTF Player | Python & Rust",
	
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github", 
			url: "https://github.com/adityakamalsharma",
		},
		{
			name: "Hack The Box",
			icon: "simple-icons:hackthebox",
			url: "https://app.hackthebox.com/public/users/1837073", 
		},
		{
			name: "OSCP",
			icon: "fa6-solid:award",
			url: "https://credentials.offsec.com/12e2f301-f9e7-4263-91f0-97f16d1734ba#acc.rSVTBntX", 
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};