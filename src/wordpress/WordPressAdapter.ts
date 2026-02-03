/**
 * @file Implements the BlogPlatformAdapter interface for WordPress.
 * @description This adapter will handle all WordPress-specific API interactions, including
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
import { WordPressClient } from './WordPressClient';

/**
 * WordPress-specific implementation of the BlogPlatformAdapter.
 * Manages communication with the WordPress REST API.
 */
export class WordPressAdapter implements BlogPlatformAdapter {
  name: string = 'WordPress';
  capabilities = {
    supportsTags: true,
    supportsCategories: true,
    supportsScheduling: true,
    supportsVisibility: true,
    supportsMultipleAuthors: true,
    supportsUpdate: true,
    supportsDelete: true
  };
  private logger: Logger;
  private client: WordPressClient | null = null;
  private isConfiguredInternal: boolean = false;
  private isConnectedInternal: boolean = false;
  private currentUser: UserInfo | null = null;
  private lastConnectionError: string | undefined = undefined;

  /**
   * Creates an instance of WordPressAdapter.
   * @param logger The logger instance for logging messages.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Configures the adapter with WordPress connection details.
   * @param config The connection configuration for WordPress (url, username, appPassword).
   */
  configure(config: any): void {
    if (config && config.url && config.username && config.appPassword) {
      this.client = new WordPressClient(config.url, config.username, config.appPassword, this.logger);
      this.isConfiguredInternal = true;
      this.logger.log('WordPressAdapter configured.', 'INFO');
    } else {
      this.isConfiguredInternal = false;
      this.logger.warn('WordPressAdapter configured with missing credentials.', 'WARN');
    }
    
    this.isConnectedInternal = false;
    this.currentUser = null;
    this.lastConnectionError = undefined;
  }

  /**
   * Authenticates with WordPress.
   * @param credentials WordPress-specific authentication details.
   * @returns A promise resolving to true if authentication is successful, false otherwise.
   */
  async authenticate(credentials: any): Promise<boolean> {
    this.configure(credentials);
    const testResult = await this.testConnection();
    return testResult.success;
  }

  /**
   * Publishes a post to WordPress.
   * @param post The universal post format.
   * @param options Publishing options, including whether to publish as a draft or live.
   * @returns A promise resolving to a PublishResult.
   */
  async publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult> {
    if (!this.isConnectedInternal || !this.currentUser || !this.client) {
      return { success: false, error: 'WordPress adapter not connected or configured.' };
    }

    this.logger.log(`WordPressAdapter: Attempting to publish "${post.title}" (isDraft: ${options.isDraft})`, 'INFO');

    try {
      const status = options.isDraft ? 'draft' : 'publish';
      
      // Convert Markdown to Gutenberg Blocks
      const contentWithBlocks = this.convertToGutenberg(post.content);

      const response = await this.client.createPost({
        title: post.title,
        content: contentWithBlocks,
        status: status,
        // categories: post.categories, // To be implemented (needs mapping names to IDs)
        // tags: post.tags              // To be implemented (needs mapping names to IDs)
      });

      if (response && response.id) {
        return {
          success: true,
          postId: String(response.id),
          postUrl: response.link,
          platformResponse: response
        };
      } else {
        return { success: false, error: 'Failed to create post on WordPress.' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error during WordPress publish.' };
    }
  }

  /**
   * Creates a draft post on WordPress.
   * @param post The universal post format.
   * @returns A promise resolving to a DraftResult.
   */
  async createDraft(post: UniversalPost): Promise<DraftResult> {
    const result = await this.publish(post, { isDraft: true });
    return {
      success: result.success,
      error: result.error,
      draftId: Number(result.postId),
      draftUrl: result.postUrl,
      platformResponse: result.platformResponse
    };
  }

  /**
   * Tests the connection to WordPress.
   * @returns A promise resolving to a ConnectionTestResult.
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.client || !this.isConfiguredInternal) {
      return { success: false, error: 'WordPress adapter not configured.' };
    }

    this.logger.log('WordPressAdapter: Testing connection...', 'INFO');
    
    try {
      const me = await this.client.getMe();
      if (me) {
        this.currentUser = {
          id: me.id,
          name: me.name,
          handle: me.slug
        };
        this.isConnectedInternal = true;
        return { success: true, user: this.currentUser };
      } else {
        this.isConnectedInternal = false;
        this.lastConnectionError = 'Failed to verify WordPress authentication. Check URL, Username, and App Password.';
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

  /**
   * Simple conversion from Markdown to Gutenberg-style blocks.
   * For now, it wraps the entire content in a paragraph block as a fallback,
   * but ideally it should parse markdown and wrap each element.
   * @param content Markdown content
   */
  private convertToGutenberg(content: string): string {
    // Split by double newlines to create paragraph blocks
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.map(p => `<!-- wp:paragraph -->\n<p>${p}</p>\n<!-- /wp:paragraph -->`).join('\n\n');
  }
}
