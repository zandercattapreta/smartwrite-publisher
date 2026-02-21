/**
 * @file Platform detection utility for identifying blogging platforms from URLs
 * @description Automatically detects Substack, Medium, and WordPress platforms
 */

import { PlatformType } from '../types';
import { requestUrl } from 'obsidian';

/**
 * Utility class for detecting blogging platforms from URLs
 */
export class PlatformDetector {
	/**
	 * Detects the platform type from a blog URL
	 * @param url The blog URL to analyze
	 * @returns The detected platform type, or null if unable to detect
	 */
	static async detectPlatform(url: string): Promise<PlatformType | null> {
		// Normalize URL
		const normalizedUrl = this.normalizeUrl(url);
		
		// Check URL patterns
		if (this.isSubstack(normalizedUrl)) return 'substack';
		if (this.isMedium(normalizedUrl)) return 'medium';
		
		// Try WordPress REST API detection
		if (await this.isWordPress(normalizedUrl)) return 'wordpress';
		
		return null;
	}
	
	/**
	 * Checks if URL is a Substack blog
	 * @param url Normalized URL
	 * @returns True if Substack
	 */
	private static isSubstack(url: string): boolean {
		return url.includes('substack.com');
	}
	
	/**
	 * Checks if URL is a Medium blog
	 * @param url Normalized URL
	 * @returns True if Medium
	 */
	private static isMedium(url: string): boolean {
		return url.includes('medium.com') || url.includes('@');
	}
	
	/**
	 * Checks if URL is a WordPress site by testing REST API endpoint
	 * @param url Normalized URL
	 * @returns True if WordPress REST API is detected
	 */
	private static async isWordPress(url: string): Promise<boolean> {
		try {
			const endpoint = `${url}/wp-json/wp/v2/`;
			const response = await requestUrl({ url: endpoint, 
				method: 'HEAD',
				headers: {
					'User-Agent': 'SmartWrite Publisher/1.1.0'
				}
			});
			return response.status >= 200 && response.status < 300;
		} catch (error) {
			return false;
		}
	}
	
	/**
	 * Normalizes a URL by ensuring it has a protocol and removing trailing slashes
	 * @param url The raw URL input
	 * @returns Normalized URL
	 */
	private static normalizeUrl(url: string): string {
		let normalized = url.trim();
		
		// Add https:// if no protocol
		if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
			normalized = 'https://' + normalized;
		}
		
		// Remove trailing slash
		normalized = normalized.replace(/\/$/, '');
		
		return normalized;
	}
	
	/**
	 * Gets a user-friendly platform name
	 * @param platformType The platform type
	 * @returns Display name for the platform
	 */
	static getPlatformDisplayName(platformType: PlatformType): string {
		const names: Record<PlatformType, string> = {
			substack: 'Substack',
			medium: 'Medium',
			wordpress: 'WordPress'
		};
		return names[platformType];
	}
	
	/**
	 * Gets platform icon/emoji
	 * @param platformType The platform type
	 * @returns Icon for the platform
	 */
	static getPlatformIcon(platformType: PlatformType): string {
		const icons: Record<PlatformType, string> = {
			substack: '📧',
			medium: '📝',
			wordpress: '📰'
		};
		return icons[platformType];
	}
}
