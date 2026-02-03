/**
 * @file Implements the BlogPlatformAdapter interface for Substack.
 * @description This adapter handles all Substack-specific API interactions, including
 *              authentication, post publishing (drafts and live), and connection testing.
 */

import { BlogPlatformAdapter, UniversalPost, PublishOptions, PublishResult, DraftResult, UserInfo, ConnectionTestResult } from '../core/BlogPlatformAdapter';
import { Logger } from '../logger';
import { SubstackClient } from './SubstackClient';
import { PayloadBuilder } from './SubstackPayloadBuilder';
import { ErrorHandler } from './SubstackErrorHandler';
import { IdStrategyManager, PublicationEndpointStrategy, ArchiveStrategy, UserSelfStrategy } from './SubstackIdStrategy';
import { SubstackUserInfo, ConnectionConfig, SubstackError, DraftResponse } from './types';

/**
 * Substack-specific implementation of the BlogPlatformAdapter.
 * Manages communication with the Substack API.
 */
export class SubstackAdapter implements BlogPlatformAdapter {
  name: string = 'Substack';
  capabilities = {
    supportsTags: false,
    supportsCategories: false,
    supportsScheduling: false,
    supportsVisibility: false,
    supportsMultipleAuthors: false,
    supportsUpdate: false,
    supportsDelete: false
  };
  private logger: Logger;
  private client: SubstackClient | null = null;
  private payloadBuilder: PayloadBuilder | null = null;
  private errorHandler: ErrorHandler | null = null;
  private idManager: IdStrategyManager | null = null;

  // Internal state
  private baseUrl: string = '';
  private cookie: string = '';
  private currentUser: SubstackUserInfo | null = null; // Renamed to avoid conflict with UserInfo interface
  private publicationId: number | null = null;
  private lastConnectionError: string | undefined = undefined;


  /**
   * Creates an instance of SubstackAdapter.
   * @param logger The logger instance for logging messages.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Configures the adapter with Substack connection details.
   * This method is called internally or by the PlatformManager to set up the adapter.
   * @param config The connection configuration for Substack (cookie and URL).
   */
  configure(config: ConnectionConfig): void {
    this.cookie = this.normalizeCookie(config.cookie);
    this.baseUrl = this.buildBaseUrl(config.substackUrl);

    this.logger.log(`SubstackAdapter configured for: ${this.baseUrl}`, 'INFO');

    // Initialize components
    this.client = new SubstackClient(this.baseUrl, this.cookie, this.logger);
    this.payloadBuilder = new PayloadBuilder(this.logger); // Fixed typo
    this.errorHandler = new ErrorHandler(this.logger);
    this.idManager = new IdStrategyManager(this.logger);

    // Reset connection status
    this.currentUser = null;
    this.publicationId = null;
    this.lastConnectionError = undefined;
  }

  /**
   * Authenticates with Substack by testing the connection and retrieving user/publication info.
   * @param credentials A connection configuration object containing cookie and substackUrl.
   * @returns A promise resolving to true if authentication is successful, false otherwise.
   */
  async authenticate(credentials: ConnectionConfig): Promise<boolean> {
    this.configure(credentials); // Configure before testing connection
    const testResult = await this.testConnection();
    return testResult.success;
  }

  /**
   * Tests the connection to Substack and obtains user/publication information.
   * This method also sets the internal currentUser and publicationId state.
   * @returns A promise resolving to a ConnectionTestResult.
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (!this.isConfiguredInternal()) {
      const error = 'SubstackAdapter not configured for connection test. Missing cookie or URL.';
      this.lastConnectionError = error;
      this.logger.error(error, 'ERROR');
      return { success: false, error: error };
    }

    this.currentUser = null;
    this.publicationId = null;
    this.lastConnectionError = undefined;

    try {
      // Try to obtain user info
      const response = await this.client!.get('/api/v1/user/self');

      if (response.status === 200 && response.json) {
        this.currentUser = {
          id: response.json.id || 0,
          name: response.json.name || response.json.username || 'User',
          email: response.json.email || '',
          handle: response.json.handle
        };
        await this.getPublicationId(); // Fetch publication ID
        return { success: true, user: this.currentUser };
      }

      // Fallback: try /api/v1/publication
      const pubResponse = await this.client!.get('/api/v1/publication');
      if (pubResponse.status === 200 && pubResponse.json) {
        this.currentUser = {
          id: 0, // No user ID from this endpoint
          name: pubResponse.json.name || 'Publisher',
          email: '',
          handle: undefined
        };
        await this.getPublicationId(); // Fetch publication ID
        return { success: true, user: this.currentUser };
      }

      const errorMsg = response.status === 403
        ? '403 Forbidden: Cookie expired or insufficient permissions'
        : `Error ${response.status}: ${response.text?.substring(0, 100)}`;
      this.lastConnectionError = errorMsg;
      this.logger.error(`Substack connection failed: ${errorMsg}`, 'ERROR');
      return { success: false, error: errorMsg };

    } catch (error: any) {
      this.lastConnectionError = error.message;
      this.logger.error(`Substack connection test failed: ${error.message}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Publishes a post to Substack. This method will create a draft and then publish it if 'isDraft' is false.
   * @param post The universal post format.
   * @param options Publishing options, including whether to publish as a draft or live.
   * @returns A promise resolving to a PublishResult.
   */
  async publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult> {
    if (!this.isReadyForPublishingInternal()) {
      return { success: false, error: 'SubstackAdapter not ready for publishing. Configuration or connection issue.' };
    }

    this.logger.log(`Attempting to publish: "${post.title}" (isDraft: ${options.isDraft})`, 'INFO');

    try {
      // Always create a draft first
      const draftCreationResult = await this.createDraftInternal(post);
      if (!draftCreationResult.success || !draftCreationResult.draftId) {
        return { success: false, error: draftCreationResult.error || 'Failed to create draft.' };
      }

      // If not meant to be a draft, then publish it
      if (!options.isDraft) {
        const publishInternalResult = await this.publishDraftInternal(draftCreationResult.draftId);
        return {
          success: publishInternalResult.success,
          error: publishInternalResult.error,
          postId: publishInternalResult.postId,
          postUrl: publishInternalResult.postUrl,
          platformResponse: publishInternalResult.platformResponse
        };
      }

      // If it's meant to be a draft, return the draft creation result as a PublishResult
      return {
        success: true,
        postUrl: draftCreationResult.draftUrl,
        postId: String(draftCreationResult.draftId)
      };

    } catch (error: any) {
      const message = error instanceof SubstackError
        ? error.message
        : error.message || 'Unknown error during Substack publish.';
      this.logger.error(`Failed to publish post to Substack: ${message}`, error);
      return { success: false, error: message };
    }
  }

  /**
   * Creates a draft post on Substack.
   * @param post The universal post format.
   * @returns A promise resolving to a DraftResult.
   */
  async createDraft(post: UniversalPost): Promise<DraftResult> {
    if (!this.isReadyForPublishingInternal()) {
      return { success: false, error: 'SubstackAdapter not ready for creating draft. Configuration or connection issue.' };
    }
    return this.createDraftInternal(post);
  }

  /**
   * Internal method to handle the actual draft creation on Substack.
   * @param post The universal post format.
   * @returns A promise resolving to an object containing success, error, and draftId.
   */
  private async createDraftInternal(post: UniversalPost): Promise<{ success: boolean; error?: string; draftId?: number; draftUrl?: string }> {
    try {
      const pubId = await this.getPublicationId();
      if (!pubId) {
        return { success: false, error: 'Substack publication ID not found.' };
      }

      // Use contentHtml if provided, otherwise convert markdown
      const bodyHtml = post.contentHtml || this.convertMarkdownToHtml(post.content);

      const payload = this.payloadBuilder!.buildDraftPayload({
        title: post.title,
        bodyHtml: bodyHtml,
        subtitle: post.subtitle
        // Other options can be passed here once payloadBuilder is extended
      }, this.currentUser);

      const validation = this.payloadBuilder!.validatePayload(payload);
      if (!validation.valid) {
        return { success: false, error: `Invalid payload: ${validation.error}` };
      }

      const response = await this.client!.post(
        `/api/v1/drafts?publication_id=${pubId}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        const data: DraftResponse = response.json;
        const draftId = data.id || data.draft_id;
        this.logger.log(`Substack draft created: ${draftId}`, 'INFO');
        // Log word_count for debugging if needed (as in original SubstackService)
        return {
          success: true,
          draftId,
          draftUrl: `${this.baseUrl}/publish/post/${draftId}`
        };
      }

      const error = this.errorHandler!.handle(response, 'Substack draft creation');
      throw error;

    } catch (error: any) {
      const message = error instanceof SubstackError
        ? error.message
        : error.message || 'Unknown error during Substack draft creation.';
      this.logger.error(`Failed to create draft on Substack: ${message}`, error);
      return { success: false, error: message };
    }
  }

  /**
   * Internal method to publish an existing draft on Substack.
   * @param draftId The ID of the draft to publish.
   * @returns A promise resolving to a PublishResult.
   */
  private async publishDraftInternal(draftId: number): Promise<PublishResult> {
    try {
      this.logger.log(`Publishing Substack draft: ${draftId}`, 'INFO');

      const response = await this.client!.post(
        `/api/v1/drafts/${draftId}/publish`,
        { send: true }
      );

      if (response.status === 200 || response.status === 201) {
        const postUrl = `${this.baseUrl}/p/${draftId}`;
        this.logger.log(`Substack post published: ${postUrl}`, 'INFO');
        return { success: true, postId: String(draftId), postUrl };
      }

      // If publishing fails but draft was created, consider it a partial success
      return {
        success: true, // Draft was created, so not a full failure
        postId: String(draftId),
        postUrl: `${this.baseUrl}/publish/post/${draftId}`,
        error: 'Draft created, but automatic publishing failed. Please publish manually on Substack.'
      };

    } catch (error: any) {
      // Draft was created even if publishing failed, so report partial success
      return {
        success: true,
        postId: String(draftId),
        postUrl: `${this.baseUrl}/publish/post/${draftId}`,
        error: 'Draft created. Automatic publishing failed due to an error. Please publish manually on Substack.'
      };
    }
  }

  /**
   * Checks if the adapter is configured (cookie and base URL are set).
   * @returns True if configured, false otherwise.
   */
  private isConfiguredInternal(): boolean {
    return !!this.cookie && !!this.baseUrl && !!this.client;
  }

  /**
   * Checks if the adapter is fully ready for publishing (configured, authenticated, publication ID found).
   * @returns True if ready, false otherwise.
   */
  private isReadyForPublishingInternal(): boolean {
    return this.isConfiguredInternal() && !!this.currentUser && !!this.publicationId;
  }

  /**
   * Returns a detailed status of the adapter's configuration and connection.
   * @returns An object indicating if the adapter is configured, connected, and optionally user info and errors.
   */
  getDetailedStatus(): { isConfigured: boolean; isConnected: boolean; user?: UserInfo; error?: string; } {
    return {
      isConfigured: this.isConfiguredInternal(),
      isConnected: this.isReadyForPublishingInternal(),
      user: this.currentUser || undefined,
      error: this.lastConnectionError
    };
  }

  /**
   * Retrieves the Substack publication ID, utilizing internal strategies.
   * Caches the ID for subsequent calls.
   * @returns A promise resolving to the publication ID, or null if not found.
   */
  private async getPublicationId(): Promise<number | null> {
    if (this.publicationId) {
      return this.publicationId;
    }

    if (!this.idManager || !this.client) {
      this.logger.warn('ID Manager or Client not initialized for getPublicationId.', 'WARN');
      return null;
    }

    // Define strategies in order of preference
    const strategies = [
      new PublicationEndpointStrategy(this.client, this.logger),
      new ArchiveStrategy(this.client, this.logger),
      new UserSelfStrategy(this.client, this.logger)
    ];

    this.publicationId = await this.idManager.findPublicationId(strategies);
    return this.publicationId;
  }

  /**
   * Normalizes the provided cookie string to extract the `connect.sid` value.
   * @param cookie The raw cookie string.
   * @returns The normalized cookie value.
   */
  private normalizeCookie(cookie: string): string {
    let normalized = cookie.trim();
    normalized = normalized.replace(/^cookie:\s*/i, ''); // Remove "cookie: " prefix
    const match = normalized.match(/connect\.sid=([^;\s]+)/);
    return match && match[1] ? match[1] : normalized; // Return extracted sid or original if no match
  }

  /**
   * Builds the base URL for Substack API requests from a given URL.
   * @param url The Substack URL (e.g., 'yourname.substack.com').
   * @returns The normalized base URL (e.g., 'https://yourname.substack.com').
   */
  private buildBaseUrl(url: string): string {
    let hostname = url.trim();
    hostname = hostname.replace(/^https?:\/\//, ''); // Remove protocol
    hostname = hostname.replace(/\/.*$/, '');     // Remove path and trailing slash
    if (!hostname.includes('.')) {                 // If no full domain, add .substack.com
      hostname = `${hostname}.substack.com`;
    }
    return `https://${hostname}`;
  }

  /**
   * Converts Markdown content to HTML. (Placeholder for now, will use MarkdownConverter).
   * This is a temporary placeholder and will eventually utilize a proper MarkdownConverter instance.
   * @param markdown The markdown string to convert.
   * @returns The converted HTML string.
   */
  private convertMarkdownToHtml(markdown: string): string {
    // This will eventually use the MarkdownConverter, but for now, a simple passthrough or basic conversion.
    // In a real scenario, MarkdownConverter instance would be passed or created here.
    return `<p>${markdown}</p>`; // Basic placeholder
  }
}