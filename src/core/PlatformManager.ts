import { BlogPlatformAdapter, UniversalPost, PublishOptions, PublishResult, ConnectionTestResult } from './BlogPlatformAdapter';
import { Logger } from '../logger';

/**
 * Interface defining the configuration for a registered platform.
 */
export interface PlatformConfig {
  id: string;
  name: string;
  adapter: BlogPlatformAdapter;
  isEnabled: boolean;
  credentials: any; // Platform-specific credentials
  settings: any;    // Platform-specific settings
}

/**
 * Orchestrates interactions with multiple blogging platforms through their adapters.
 * Manages registered platforms, their configurations, and facilitates publishing operations.
 */
export class PlatformManager {
  private registeredPlatforms: Map<string, PlatformConfig> = new Map();
  private logger: Logger;

  /**
   * Creates an instance of PlatformManager.
   * @param logger The logger instance for logging messages.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Registers a new blogging platform adapter with the manager.
   * @param id A unique identifier for the platform (e.g., 'substack', 'medium').
   * @param name The human-readable name of the platform.
   * @param adapter An instance of the BlogPlatformAdapter for this platform.
   * @param initialConfig Optional initial configuration for the platform.
   */
  registerPlatform(id: string, name: string, adapter: BlogPlatformAdapter, initialConfig?: Partial<PlatformConfig>): void {
    if (this.registeredPlatforms.has(id)) {
      this.logger.warn(`Platform with ID '${id}' is already registered. Overwriting.`);
    }

    const config: PlatformConfig = {
      id,
      name,
      adapter,
      isEnabled: initialConfig?.isEnabled ?? false,
      credentials: initialConfig?.credentials ?? {},
      settings: initialConfig?.settings ?? {},
    };
    this.registeredPlatforms.set(id, config);
    this.logger.info(`Platform '${name}' (${id}) registered.`);
  }

  /**
   * Retrieves a registered platform's configuration.
   * @param id The unique identifier of the platform.
   * @returns The PlatformConfig if found, otherwise undefined.
   */
  getPlatform(id: string): PlatformConfig | undefined {
    return this.registeredPlatforms.get(id);
  }

  /**
   * Updates the configuration for a registered platform.
   * @param id The unique identifier of the platform.
   * @param updates Partial PlatformConfig object with changes to apply.
   */
  updatePlatformConfig(id: string, updates: Partial<Omit<PlatformConfig, 'id' | 'name' | 'adapter'>>): void {
    const config = this.registeredPlatforms.get(id);
    if (config) {
      Object.assign(config, updates);
      this.logger.info(`Platform '${config.name}' (${id}) configuration updated.`);
    } else {
      this.logger.warn(`Cannot update config: Platform with ID '${id}' not found.`);
    }
  }

  /**
   * Returns a list of all registered platform configurations.
   * @returns An array of PlatformConfig objects.
   */
  getAllPlatforms(): PlatformConfig[] {
    return Array.from(this.registeredPlatforms.values());
  }

  /**
   * Publishes a universal post to one or more selected platforms.
   * @param post The UniversalPost to publish.
   * @param platformIds An array of IDs of platforms to publish to. If empty, publishes to all enabled platforms.
   * @param globalOptions Global publishing options that can be overridden by platform-specific settings.
   * @returns A promise resolving to a map of platform IDs to their PublishResult.
   */
  async publishPost(
    post: UniversalPost,
    platformIds: string[] = [],
    globalOptions: PublishOptions
  ): Promise<Map<string, PublishResult>> {
    const results = new Map<string, PublishResult>();
    const platformsToPublish = platformIds.length > 0
      ? platformIds.map(id => this.getPlatform(id)).filter(Boolean) as PlatformConfig[]
      : this.getAllPlatforms().filter(p => p.isEnabled);

    if (platformsToPublish.length === 0) {
      this.logger.warn("No platforms selected or enabled for publishing.");
      return results;
    }

    const publishPromises = platformsToPublish.map(async (p) => {
      let result: PublishResult;
      try {
        // Merge global options with platform-specific ones
        const options: PublishOptions = { ...globalOptions, ...p.settings?.publishOptions };
        
        // Decide whether to publish as draft or live based on options
        if (options.isDraft) {
          const draftResult = await p.adapter.createDraft(post);
          result = { success: draftResult.success, error: draftResult.error, postUrl: draftResult.draftUrl };
        } else {
          result = await p.adapter.publish(post, options);
        }
      } catch (error: any) {
        result = { success: false, error: String(error) };
        this.logger.error(`Error publishing to ${p.name}:`, error);
      }
      results.set(p.id, result);
    });

    await Promise.all(publishPromises);
    return results;
  }

  /**
   * Tests the connection for all registered platforms or a specific one.
   * @param platformId Optional: The ID of a specific platform to test.
   * @returns A promise resolving to a map of platform IDs to their connection test result.
   */
  async testConnections(platformId?: string): Promise<Map<string, ConnectionTestResult>> {
    const connectionResults = new Map<string, ConnectionTestResult>();
    const platformsToTest = platformId
      ? [this.getPlatform(platformId)].filter(Boolean) as PlatformConfig[]
      : this.getAllPlatforms();

    const testPromises = platformsToTest.map(async (p) => {
      let result: ConnectionTestResult;
      try {
        result = await p.adapter.testConnection();
      } catch (error: any) {
        result = { success: false, error: String(error) };
        this.logger.error(`Error testing connection for ${p.name}:`, error);
      }
      connectionResults.set(p.id, result);
    });

    await Promise.all(testPromises);
    return connectionResults;
  }
}
