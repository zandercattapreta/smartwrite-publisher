import { Logger } from '../logger';
import { SubstackAdapter } from './SubstackAdapter'; // Import the new adapter
import {
	PublishOptions,
	PublishResult,
	ConnectionTestResult,
	UniversalPost
} from '../core/BlogPlatformAdapter'; // Import from core adapter interfaces

import { ConnectionConfig, SubstackUserInfo } from './types';


/**
 * SubstackService acts as a facade, delegating calls to the SubstackAdapter.
 * This ensures existing code can transition smoothly to the new adapter pattern.
 */
export class SubstackService {
	private logger: Logger;
	private adapter: SubstackAdapter; // Use the new adapter

	constructor(logger: Logger) {
		this.logger = logger;
		this.adapter = new SubstackAdapter(logger); // Instantiate the adapter
	}

	/**
	 * Configure the service with credentials. Delegates to the adapter.
	 */
	configure(config: ConnectionConfig): void {
		this.adapter.configure(config);
	}

	/**
	 * Test connection and obtain user information. Delegates to the adapter.
	 * @returns A promise resolving to a ConnectionTestResult.
	 */
	async testConnection(): Promise<ConnectionTestResult> {
		return this.adapter.testConnection();
	}

	/**
	 * Publish a post (create draft and optionally publish). Delegates to the adapter.
	 * @param options The publishing options in the old SubstackService format.
	 * @returns A promise resolving to a PublishResult.
	 */
	async publishPost(options: {
		title: string;
		subtitle?: string;
		bodyHtml: string;
		isDraft: boolean;
	}): Promise<PublishResult> {
		const universalPost: UniversalPost = {
			title: options.title,
			subtitle: options.subtitle,
			content: '', // Assuming old SubstackService only dealt with HTML directly
			contentHtml: options.bodyHtml,
		};

		const publishOptions: PublishOptions = {
			isDraft: options.isDraft
		};

		return this.adapter.publish(universalPost, publishOptions);
	}

	/**
	 * Check if the service is configured. Delegates to the adapter.
	 * @returns True if configured, false otherwise.
	 */
	isConfigured(): boolean {
		return this.adapter.getDetailedStatus().isConfigured;
	}

	/**
	 * Check if the service is connected. Delegates to the adapter.
	 * @returns True if connected, false otherwise.
	 */
	isConnected(): boolean {
		return this.adapter.getDetailedStatus().isConnected;
	}
}

// Export the types for backward compatibility if needed by external modules
export type { ConnectionConfig, SubstackUserInfo };
