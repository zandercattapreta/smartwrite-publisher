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
   * @param config The connection configuration for Medium (e.g., API token).
   */
  configure(config: any): void {
    // Placeholder: In a real implementation, this would store and validate Medium API keys or other credentials.
    this.logger.log(`MediumAdapter configured with: ${JSON.stringify(config)}`, 'INFO');
    this.isConfiguredInternal = true;
    this.isConnectedInternal = false; // Reset connection status on configure
    this.currentUser = null;
    this.lastConnectionError = undefined;
  }

  /**
   * Authenticates with Medium.
   * @param credentials Medium-specific authentication details (e.g., API token).
   * @returns A promise resolving to true if authentication is successful, false otherwise.
   */
  async authenticate(credentials: any): Promise<boolean> {
    this.configure(credentials); // Configure with provided credentials
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
    this.logger.log(`MediumAdapter: Attempting to publish "${post.title}" (isDraft: ${options.isDraft})`, 'INFO');
    // Placeholder: Implement actual Medium API call to publish post
    return { success: false, error: 'Medium publishing not yet implemented.' };
  }

  /**
   * Creates a draft post on Medium.
   * @param post The universal post format.
   * @returns A promise resolving to a DraftResult.
   */
  async createDraft(post: UniversalPost): Promise<DraftResult> {
    this.logger.log(`MediumAdapter: Attempting to create draft "${post.title}"`, 'INFO');
    // Placeholder: Implement actual Medium API call to create draft
    return { success: false, error: 'Medium draft creation not yet implemented.' };
  }

  /**
   * Tests the connection to Medium.
   * @returns A promise resolving to a ConnectionTestResult.
   */
  async testConnection(): Promise<ConnectionTestResult> {
    this.logger.log('MediumAdapter: Testing connection...', 'INFO');
    // Placeholder: Implement actual Medium API call to test connection
    try {
      // Simulate API call
      // const response = await this.client.get('/me');
      // if (response.status === 200) {
      //   this.currentUser = { id: response.json.id, name: response.json.username };
      //   this.isConnectedInternal = true;
      //   return { success: true, user: this.currentUser };
      // } else {
      //   this.lastConnectionError = `Medium API error: ${response.status}`;
      //   this.isConnectedInternal = false;
      //   return { success: false, error: this.lastConnectionError };
      // }
      
      // For now, assume success if configured
      if (this.isConfiguredInternal) {
        this.currentUser = { id: 'medium-user-123', name: 'Placeholder Medium User' };
        this.isConnectedInternal = true;
        return { success: true, user: this.currentUser };
      } else {
        this.lastConnectionError = 'MediumAdapter not configured.';
        this.isConnectedInternal = false;
        return { success: false, error: this.lastConnectionError };
      }

    } catch (error: any) {
      this.lastConnectionError = `Medium connection failed: ${error.message}`;
      this.isConnectedInternal = false;
      return { success: false, error: this.lastConnectionError };
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
