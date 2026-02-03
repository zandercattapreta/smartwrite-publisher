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
    this.username = username;
    this.appPassword = appPassword;
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
    const url = `${this.url}/wp-json${endpoint}`;
    
    // Basic Auth header: base64(username:app_password)
    const credentials = btoa(`${this.username}:${this.appPassword}`);
    
    const headers: Record<string, string> = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      this.logger.log(`[WordPress] ${method} ${url}`, 'INFO');
      
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
