/**
 * @file Frontmatter parsing utility for extracting metadata from markdown
 * @description Parses YAML/TOML frontmatter and extracts title, subtitle, tags, etc.
 */

import matter from 'gray-matter';
import { FrontmatterData } from '../types';

/**
 * Utility class for parsing markdown frontmatter and extracting metadata
 */
export class FrontmatterParser {
	/**
	 * Parses markdown content and extracts frontmatter
	 * @param markdown The raw markdown content
	 * @returns Parsed frontmatter data and content without frontmatter
	 */
	static parse(markdown: string): { frontmatter: FrontmatterData; content: string } {
		try {
			const parsed = matter(markdown);
			return {
				frontmatter: parsed.data as FrontmatterData,
				content: parsed.content
			};
		} catch (error) {
			// If parsing fails, return empty frontmatter
			return {
				frontmatter: {},
				content: markdown
			};
		}
	}
	
	/**
	 * Extracts the title from markdown
	 * Priority: frontmatter.title → first H1 → 'Untitled'
	 * @param markdown The markdown content (with frontmatter removed)
	 * @param frontmatter Parsed frontmatter data
	 * @returns Extracted title
	 */
	static extractTitle(markdown: string, frontmatter: FrontmatterData): string {
		// 1. Check frontmatter
		if (frontmatter.title) {
			return frontmatter.title.trim();
		}
		
		// 2. Extract first H1
		const h1Match = markdown.match(/^#\s+(.+)$/m);
		if (h1Match && h1Match[1]) {
			return h1Match[1].trim();
		}
		
		// 3. Default
		return 'Untitled';
	}
	
	/**
	 * Extracts the subtitle from markdown
	 * Priority: frontmatter.subtitle → frontmatter.description → first paragraph (truncated)
	 * @param markdown The markdown content (with frontmatter removed)
	 * @param frontmatter Parsed frontmatter data
	 * @returns Extracted subtitle
	 */
	static extractSubtitle(markdown: string, frontmatter: FrontmatterData): string {
		// 1. Check frontmatter subtitle
		if (frontmatter.subtitle) {
			return frontmatter.subtitle.trim();
		}
		
		// 2. Check frontmatter description
		if (frontmatter.description) {
			return frontmatter.description.trim();
		}
		
		// 3. Extract first paragraph after title
		// Remove H1 first
		const withoutH1 = markdown.replace(/^#\s+.+$/m, '').trim();
		
		// Find first non-empty paragraph
		const paragraphMatch = withoutH1.match(/^[^\n#*->\[\]]+$/m);
		if (paragraphMatch) {
			const paragraph = paragraphMatch[0].trim();
			// Truncate to 300 characters
			return paragraph.length > 300 
				? paragraph.substring(0, 300) + '...' 
				: paragraph;
		}
		
		return '';
	}
	
	/**
	 * Extracts tags from frontmatter
	 * @param frontmatter Parsed frontmatter data
	 * @returns Array of tags, or empty array if none
	 */
	static extractTags(frontmatter: FrontmatterData): string[] {
		const tags = frontmatter.tags;
		if (!tags) {
			return [];
		}
		
		// Handle both array and comma-separated string
		if (Array.isArray(tags)) {
			return tags.map((tag: any) => String(tag).trim()).filter(Boolean);
		}
		
		if (typeof tags === 'string') {
			return tags.split(',').map(tag => tag.trim()).filter(Boolean);
		}
		
		return [];
	}
	
	/**
	 * Extracts categories from frontmatter
	 * @param frontmatter Parsed frontmatter data
	 * @returns Array of categories, or empty array if none
	 */
	static extractCategories(frontmatter: FrontmatterData): string[] {
		// Check both 'categories' and 'category' fields
		const cats = frontmatter.categories || frontmatter.category;
		
		if (!cats) {
			return [];
		}
		
		// Handle array
		if (Array.isArray(cats)) {
			return cats.map(cat => String(cat).trim()).filter(Boolean);
		}
		
		// Handle string
		if (typeof cats === 'string') {
			// Single category or comma-separated
			return cats.split(',').map(cat => cat.trim()).filter(Boolean);
		}
		
		return [];
	}
	
	/**
	 * Extracts author from frontmatter
	 * @param frontmatter Parsed frontmatter data
	 * @returns Author name or undefined
	 */
	static extractAuthor(frontmatter: FrontmatterData): string | undefined {
		return frontmatter.author ? String(frontmatter.author).trim() : undefined;
	}
	
	/**
	 * Extracts visibility from frontmatter
	 * @param frontmatter Parsed frontmatter data
	 * @returns Visibility setting or undefined
	 */
	static extractVisibility(frontmatter: FrontmatterData): string | undefined {
		if (!frontmatter.visibility) {
			return undefined;
		}
		
		const visibility = String(frontmatter.visibility).toLowerCase().trim();
		const validValues = ['public', 'private', 'password', 'unlisted'];
		
		return validValues.includes(visibility) ? visibility : undefined;
	}
	
	/**
	 * Extracts scheduled date from frontmatter
	 * @param frontmatter Parsed frontmatter data
	 * @returns Date object or undefined
	 */
	static extractScheduledDate(frontmatter: FrontmatterData): Date | undefined {
		if (!frontmatter.date) {
			return undefined;
		}
		
		try {
			const date = new Date(frontmatter.date);
			// Check if valid date and in the future
			if (!isNaN(date.getTime()) && date > new Date()) {
				return date;
			}
		} catch (error) {
			// Invalid date format
		}
		
		return undefined;
	}
	
	/**
	 * Convenience method to extract all common metadata at once
	 * @param markdown The raw markdown content including frontmatter
	 * @returns Object with all extracted metadata
	 */
	static extractAll(markdown: string): {
		title: string;
		subtitle: string;
		tags: string[];
		categories: string[];
		author?: string;
		visibility?: string;
		scheduledDate?: Date;
		content: string;
	} {
		const { frontmatter, content } = this.parse(markdown);
		
		return {
			title: this.extractTitle(content, frontmatter),
			subtitle: this.extractSubtitle(content, frontmatter),
			tags: this.extractTags(frontmatter),
			categories: this.extractCategories(frontmatter),
			author: this.extractAuthor(frontmatter),
			visibility: this.extractVisibility(frontmatter),
			scheduledDate: this.extractScheduledDate(frontmatter),
			content: content
		};
	}
}
