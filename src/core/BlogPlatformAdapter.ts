/**
 * @file Defines core interfaces for multi-platform blog publishing adapters.
 * @description This file establishes the contract for integrating different blogging platforms
 *              and a universal post format for consistent content handling.
 */

/**
 * Interface defining common user information across platforms.
 */
export interface UserInfo {
  id: string | number;
  name: string;
  email?: string;
  handle?: string; // e.g., Substack handle or Medium username
  // Add other common user info fields as needed
}

/**
 * Interface defining the result of a connection test to a platform.
 */
export interface ConnectionTestResult {
  success: boolean;
  user?: UserInfo;
  error?: string;
}

/**
 * Platform capability flags indicating what features a platform supports
 */
export interface PlatformCapabilities {
  supportsTags: boolean;
  supportsCategories: boolean;
  supportsScheduling: boolean;
  supportsVisibility: boolean;
  supportsMultipleAuthors: boolean;
  supportsUpdate: boolean;
  supportsDelete: boolean;
  tagLimit?: number;
}

/**
 * Interface defining the contract for a blog platform adapter.
 * Each adapter will implement these methods to interact with a specific blogging platform's API.
 */
export interface BlogPlatformAdapter {
  /** The human-readable name of the blogging platform (e.g., "Substack", "Medium"). */
  name: string;
  
  /** Platform capability flags */
  capabilities: PlatformCapabilities;

  /**
   * Configures the adapter with necessary connection details.
   * This method should be called before attempting authentication or publishing.
   * @param config Platform-specific configuration object.
   */
  configure(config: any): void;

  /**
   * Authenticates with the blogging platform using provided credentials.
   * @param credentials Platform-specific authentication details.
   * @returns A promise resolving to true if authentication is successful, false otherwise.
   */
  authenticate(credentials: any): Promise<boolean>;

  /**
   * Publishes a post to the blogging platform.
   * @param post The universal post format containing content and metadata.
   * @param options Platform-specific publishing options (e.g., publish date, tags, categories).
   * @returns A promise resolving to a PublishResult.
   */
  publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult>;

  /**
   * Creates a draft post on the blogging platform.
   * @param post The universal post format containing content and metadata.
   * @returns A promise resolving to a DraftResult.
   */
  createDraft(post: UniversalPost): Promise<DraftResult>;

  /**
   * Tests the connection to the blogging platform and optionally retrieves user information.
   * @returns A promise resolving to a ConnectionTestResult.
   */
  testConnection(): Promise<ConnectionTestResult>;

  /**
   * Returns a detailed status of the adapter's configuration and connection.
   * @returns An object indicating if the adapter is configured, connected, and optionally user info and errors.
   */
  getDetailedStatus(): { isConfigured: boolean; isConnected: boolean; user?: UserInfo; error?: string; };
  
  /**
   * (Optional) Retrieves all available tags from the platform.
   * @returns A promise resolving to an array of tag names.
   */
  getTags?(): Promise<string[]>;
  
  /**
   * (Optional) Creates a new tag on the platform.
   * @param tagName The name of the tag to create.
   * @returns A promise resolving to the result of the operation.
   */
  createTag?(tagName: string): Promise<{success: boolean; error?: string}>;
  
  /**
   * (Optional) Deletes a tag from the platform.
   * @param tagName The name of the tag to delete.
   * @returns A promise resolving to the result of the operation.
   */
  deleteTag?(tagName: string): Promise<{success: boolean; error?: string}>;
  
  /**
   * (Optional) Retrieves all available categories from the platform.
   * @returns A promise resolving to an array of category names.
   */
  getCategories?(): Promise<string[]>;
  
  /**
   * (Optional) Creates a new category on the platform.
   * @param categoryName The name of the category to create.
   * @returns A promise resolving to the result of the operation.
   */
  createCategory?(categoryName: string): Promise<{success: boolean; error?: string}>;
  
  /**
   * (Optional) Deletes a category from the platform.
   * @param categoryName The name of the category to delete.
   * @returns A promise resolving to the result of the operation.
   */
  deleteCategory?(categoryName: string): Promise<{success: boolean; error?: string}>;
}

/**
 * Defines a universal post format to abstract content across different blogging platforms.
 * This structure allows for consistent handling of content before platform-specific adaptation.
 */
export interface UniversalPost {
  /** The title of the post. */
  title: string;
  /** Optional: A short subtitle or description for the post. */
  subtitle?: string;
  /** The main content of the post, typically in Markdown source format. */
  content: string;
  /** Optional: The HTML version of the post content, if pre-converted. */
  contentHtml?: string;
  /** Optional: An array of tags or keywords for the post. */
  tags?: string[];
  /** Optional: An array of categories for the post. */
  categories?: string[];
  /** Optional: The author of the post. */
  author?: string;
  /** Optional: Visibility setting (public, private, password, unlisted). */
  visibility?: 'public' | 'private' | 'password' | 'unlisted';
  /** Optional: Canonical URL for the post (original source). */
  canonicalUrl?: string;
  /** Optional: Scheduled publication date (for future publishing). */
  scheduledDate?: Date;
  /** Optional: A flexible object for any additional platform-specific metadata. */
  metadata?: Record<string, any>;
}

/**
 * Represents platform-specific publishing options.
 * This interface can be extended by individual adapters to include platform-specific fields.
 */
export interface PublishOptions {
  /** Indicates if the post should be published as a draft (true) or live (false). */
  isDraft: boolean;
  // Add other common publishing options here as needed.
}

/**
 * Represents the result of a publishing operation.
 */
export interface PublishResult {
  /** True if the operation was successful, false otherwise. */
  success: boolean;
  /** Optional: An error message if the operation failed. */
  error?: string;
  /** Optional: The URL of the published post, if successful. */
  postUrl?: string;
  /** Optional: Any platform-specific response data. */
  platformResponse?: any;
  /** Optional: The post ID on the platform, if successful. */
  postId?: string;
}

/**
 * Represents the result of a draft creation operation.
 */
export interface DraftResult {
  /** True if the operation was successful, false otherwise. */
  success: boolean;
  /** Optional: An error message if the operation failed. */
  error?: string;
  /** Optional: The URL to view the draft, if successful. */
  draftUrl?: string;
  /** Optional: Any platform-specific response data. */
  platformResponse?: any;
  /** Optional: The draft ID on the platform, if successful. */
  draftId?: number;
}
