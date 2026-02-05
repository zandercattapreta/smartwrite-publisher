/**
 * @file WordPress HTTP Client for REST API interactions.
 * @description Wrapper for the WordPress REST API using Obsidian's requestUrl and Basic Auth.
 */

import { requestUrl } from 'obsidian';
import { Logger } from '../logger';

export interface WordPressUser {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls?: Record<string, string>;
}

export interface WordPressPostResponse {
  id: number;
  date: string;
  guid: { rendered: string };
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
}

export class WordPressClient {
  private url: string;
  private username: string;
  private appPassword: string;
  private logger: Logger;

  constructor(url: string, username: string, appPassword: string, logger: Logger) {
    this.url = this.normalizeUrl(url);
    this.username = username.trim();
    this.appPassword = appPassword.trim();
    this.logger = logger;
  }

  /**
   * Gets current user information (requires authentication).
   */
  async getMe(): Promise<WordPressUser | null> {
    try {
      const response = await this.request('GET', '/wp/v2/users/me');
      return response as WordPressUser;
    } catch (error) {
      this.logger.log('Failed to fetch WordPress user info', 'ERROR', error);
      return null;
    }
  }

  /**
   * Creates a post.
   */
  async createPost(postData: {
    title: string,
    content: string,
    status?: 'publish' | 'future' | 'draft' | 'pending' | 'private',
    categories?: number[],
    tags?: number[],
    format?: string,
    sticky?: boolean,
    template?: string
  }): Promise<WordPressPostResponse | null> {
    try {
      const response = await this.request('POST', '/wp/v2/posts', postData);
      return response as WordPressPostResponse;
    } catch (error) {
      this.logger.log(`Failed to create WordPress post: ${postData.title}`, 'ERROR', error);
      return null;
    }
  }

  /**
   * Uploads media.
   */
  async uploadMedia(data: ArrayBuffer, fileName: string, contentType: string): Promise<any> {
    // This will be implemented if we decide to handle local images in Phase 3
    this.logger.warn('Media upload not yet implemented for WordPress.');
    return null;
  }

  /**
   * Internal request helper.
   */
  private async request(method: string, endpoint: string, body: any = null): Promise<any> {
    let url = `${this.url}/wp-json${endpoint}`;
    
    // Use Bearer token if:
    // 1. Username is explicitly "token" or "bearer"
    // 2. It's a WordPress.com site (we default to Bearer/Token for them as Application Passwords are often blocked/complex)
    // 3. Username is empty (defaults to token/bearer behavior)
    let isBearer = !this.username || 
                   this.username.toLowerCase() === 'token' || 
                   this.username.toLowerCase() === 'bearer' ||
                   this.url.includes('.wordpress.com');

    // Handle WordPress.com special routing for Bearer tokens
    if (isBearer && this.url.includes('.wordpress.com')) {
      const siteDomain = this.url.replace(/^https?:\/\//, '').split('/')[0];
      
      // WordPress.com Public API v2 structure: https://public-api.wordpress.com/wp/v2/sites/{site}/{endpoint}
      // If endpoint is /wp/v2/posts, it becomes /sites/{site}/posts
      const cleanEndpoint = endpoint.startsWith('/wp/v2') ? endpoint.replace('/wp/v2', '') : endpoint;
      url = `https://public-api.wordpress.com/wp/v2/sites/${siteDomain}${cleanEndpoint}`;
      
      // SPECIAL CASE: getMe (/wp/v2/users/me) on WP.com works better with global /me or site-specific /users/me
      // Our cleanEndpoint for getMe is already /users/me, so url is correct: sites/{site}/users/me
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (isBearer) {
      headers['Authorization'] = `Bearer ${this.appPassword}`;
    } else {
      const credentials = btoa(`${this.username}:${this.appPassword}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    try {
      this.logger.log(`[WordPress] Requesting: ${method} ${url} (isBearer: ${isBearer}, username: "${this.username}")`, 'INFO');
      
      const response = await requestUrl({
        url,
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        throw: false
      });

      if (response.status >= 400) {
        this.logger.log(`WordPress API error: ${response.status} - ${response.text}`, 'ERROR');
        return null;
      }

      try {
        return JSON.parse(response.text);
      } catch (e) {
        return response.text;
      }
    } catch (error: any) {
      this.logger.log(`Network error calling WordPress API: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  /**
   * Normalizes the WordPress site URL.
   */
  private normalizeUrl(url: string): string {
    let normalized = url.trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    if (!normalized.startsWith('http')) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  }
}
