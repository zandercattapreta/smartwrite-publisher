/**
 * @file Implements the BlogPlatformAdapter interface for Medium.
 * @description This adapter will handle all Medium-specific API interactions, including
 *              authentication, post publishing (drafts and live), and connection testing.
 */

import {
  BlogPlatformAdapter,
  UniversalPost,
  PublishOptions,
  PublishResult,
  DraftResult,
  ConnectionTestResult,
  UserInfo
} from '../core/BlogPlatformAdapter';
import { Logger } from '../logger';
import { MediumClient } from './MediumClient';

/**
 * Medium-specific implementation of the BlogPlatformAdapter.
 * Manages communication with the Medium API.
 */
export class MediumAdapter implements BlogPlatformAdapter {
  name: string = 'Medium';
  capabilities = {
    supportsTags: true,
    supportsCategories: false,
    supportsScheduling: false,
    supportsVisibility: true, // public/unlisted/draft
    supportsMultipleAuthors: false,
    supportsUpdate: false,
    supportsDelete: false,
    tagLimit: 5
  };
  private logger: Logger;
  private client: MediumClient | null = null;
  private isConfiguredInternal: boolean = false;
  private isConnectedInternal: boolean = false;
  private currentUser: UserInfo | null = null;
  private lastConnectionError: string | undefined = undefined;

  /**
   * Creates an instance of MediumAdapter.
   * @param logger The logger instance for logging messages.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Configures the adapter with Medium connection details.
   * @param config The connection configuration for Medium (e.g., apiKey).
   */
  configure(config: any): void {
    if (config && config.apiKey) {
      this.client = new MediumClient(config.apiKey, this.logger);
      this.isConfiguredInternal = true;
      this.logger.log('MediumAdapter configured with API Key.', 'INFO');
    } else {
      this.isConfiguredInternal = false;
      this.logger.warn('MediumAdapter configured without API Key.', 'WARN');
    }
    
    this.isConnectedInternal = false;
    this.currentUser = null;
    this.lastConnectionError = undefined;
  }

  /**
   * Authenticates with Medium.
   * @param credentials Medium-specific authentication details (e.g., apiKey).
   * @returns A promise resolving to true if authentication is successful, false otherwise.
   */
  async authenticate(credentials: any): Promise<boolean> {
    this.configure(credentials);
    const testResult = await this.testConnection();
    return testResult.success;
  }

  /**
   * Publishes a post to Medium.
   * @param post The universal post format.
   * @param options Publishing options, including whether to publish as a draft or live.
   * @returns A promise resolving to a PublishResult.
   */
  async publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult> {
    if (!this.isConnectedInternal || !this.currentUser || !this.client) {
      return { success: false, error: 'Medium adapter not connected or configured.' };
    }

    this.logger.log(`MediumAdapter: Attempting to publish "${post.title}" (isDraft: ${options.isDraft})`, 'INFO');

    try {
      const publishStatus = options.isDraft ? 'draft' : 'public';
      
      const response = await this.client.createPost(String(this.currentUser.id), {
        title: post.title,
        contentFormat: 'markdown', // UniversalPost content is typically markdown
        content: post.content,
        tags: post.tags,
        canonicalUrl: post.canonicalUrl,
        publishStatus: publishStatus
      });

      if (response && response.data) {
        return {
          success: true,
          postId: response.data.id,
          postUrl: response.data.url,
          platformResponse: response.data
        };
      } else {
        return { success: false, error: 'Failed to create post on Medium.' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error during Medium publish.' };
    }
  }

  /**
   * Creates a draft post on Medium.
   * @param post The universal post format.
   * @returns A promise resolving to a DraftResult.
   */
  async createDraft(post: UniversalPost): Promise<DraftResult> {
    const result = await this.publish(post, { isDraft: true });
    return {
      success: result.success,
      error: result.error,
      draftId: result.postId as any,
      draftUrl: result.postUrl,
      platformResponse: result.platformResponse
    };
  }

  /**
   * Tests the connection to Medium.
   * @returns A promise resolving to a ConnectionTestResult.
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.client || !this.isConfiguredInternal) {
      return { success: false, error: 'Medium adapter not configured.' };
    }

    this.logger.log('MediumAdapter: Testing connection...', 'INFO');
    
    try {
      const me = await this.client.getMe();
      if (me) {
        this.currentUser = {
          id: me.id,
          name: me.name,
          handle: me.username
        };
        this.isConnectedInternal = true;
        return { success: true, user: this.currentUser };
      } else {
        this.isConnectedInternal = false;
        this.lastConnectionError = 'Failed to verify Medium authentication.';
        return { success: false, error: this.lastConnectionError };
      }
    } catch (error: any) {
      this.isConnectedInternal = false;
      this.lastConnectionError = error.message;
      return { success: false, error: error.message };
    }
  }

  /**
   * Returns a detailed status of the adapter's configuration and connection.
   * @returns An object indicating if the adapter is configured, connected, and optionally user info and errors.
   */
  getDetailedStatus(): { isConfigured: boolean; isConnected: boolean; user?: UserInfo; error?: string; } {
    return {
      isConfigured: this.isConfiguredInternal,
      isConnected: this.isConnectedInternal,
      user: this.currentUser || undefined,
      error: this.lastConnectionError
    };
  }
}
