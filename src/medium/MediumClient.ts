/**
 * @file Medium HTTP Client for API interactions.
 * @description Wrapper for the Medium API v1 using Obsidian's requestUrl.
 */

import { requestUrl } from 'obsidian';
import { Logger } from '../logger';

export interface MediumUser {
  id: string;
  username: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface MediumPostResponse {
  data: {
    id: string;
    title: string;
    authorId: string;
    url: string;
    canonicalUrl: string;
    publishStatus: string;
    license: string;
    licenseUrl: string;
    tags: string[];
  }
}

export class MediumClient {
  private apiToken: string;
  private logger: Logger;
  private readonly baseUrl = 'https://api.medium.com/v1';

  constructor(apiToken: string, logger: Logger) {
    this.apiToken = apiToken;
    this.logger = logger;
  }

  /**
   * Gets current user information.
   */
  async getMe(): Promise<MediumUser | null> {
    try {
      const response = await this.request('GET', '/me');
      if (response && response.data) {
        return response.data as MediumUser;
      }
      return null;
    } catch (error) {
      this.logger.log('Failed to fetch Medium user info', 'ERROR', error);
      return null;
    }
  }

  /**
   * Creates a post for the authenticated user.
   */
  async createPost(userId: string, postData: {
    title: string,
    contentFormat: 'html' | 'markdown',
    content: string,
    tags?: string[],
    canonicalUrl?: string,
    publishStatus?: 'public' | 'draft' | 'unlisted',
    notifyFollowers?: boolean
  }): Promise<MediumPostResponse | null> {
    try {
      const response = await this.request('POST', `/users/${userId}/posts`, postData);
      return response as MediumPostResponse;
    } catch (error) {
      this.logger.log(`Failed to create Medium post: ${postData.title}`, 'ERROR', error);
      return null;
    }
  }

  /**
   * Internal request helper.
   */
  private async request(method: string, endpoint: string, body: any = null): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    };

    try {
      this.logger.log(`[Medium] ${method} ${url}`, 'INFO');
      
      const response = await requestUrl({
        url,
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        throw: false
      });

      if (response.status >= 400) {
        this.logger.log(`Medium API error: ${response.status} - ${response.text}`, 'ERROR');
        return null;
      }

      try {
        return JSON.parse(response.text);
      } catch (e) {
        return response.text;
      }
    } catch (error: any) {
      this.logger.log(`Network error calling Medium API: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}
