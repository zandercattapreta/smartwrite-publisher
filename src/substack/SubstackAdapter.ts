/**
 * @file Implements the BlogPlatformAdapter interface for Substack.
 * @description Auth, draft com imagens (ProseMirror), publish live e agendamento.
 */

import type { App } from 'obsidian';
import {
	BlogPlatformAdapter,
	UniversalPost,
	PublishOptions,
	PublishResult,
	DraftResult,
	UserInfo,
	ConnectionTestResult,
} from '../core/BlogPlatformAdapter';
import { Logger } from '../logger';
import { SubstackClient } from './SubstackClient';
import { PayloadBuilder } from './SubstackPayloadBuilder';
import { ErrorHandler } from './SubstackErrorHandler';
import {
	IdStrategyManager,
	PublicationEndpointStrategy,
	ArchiveStrategy,
	UserSelfStrategy,
} from './SubstackIdStrategy';
import { SubstackUserInfo, ConnectionConfig, SubstackError, DraftResponse } from './types';
import { ProseMirrorBuilder } from './ProseMirrorBuilder';
import { ImageResolver } from './ImageResolver';
import type { SubstackAudience } from './proseMirrorTypes';

export class SubstackAdapter implements BlogPlatformAdapter {
	name = 'Substack';
	capabilities = {
		supportsTags: false,
		supportsCategories: false,
		supportsScheduling: true,
		supportsVisibility: false,
		supportsMultipleAuthors: false,
		supportsUpdate: false,
		supportsDelete: false,
	};

	private logger: Logger;
	private client: SubstackClient | null = null;
	private payloadBuilder: PayloadBuilder | null = null;
	private errorHandler: ErrorHandler | null = null;
	private idManager: IdStrategyManager | null = null;
	private proseBuilder = new ProseMirrorBuilder();
	private imageResolver = new ImageResolver();

	private baseUrl = '';
	private cookie = '';
	private currentUser: SubstackUserInfo | null = null;
	private publicationId: number | null = null;
	private lastConnectionError: string | undefined = undefined;
	private app: App | null = null;
	private defaultAudience: SubstackAudience = 'only_paid';

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/** Injeta App do Obsidian para leitura de imagens do vault. */
	setApp(app: App): void {
		this.app = app;
	}

	setDefaultAudience(audience: SubstackAudience): void {
		this.defaultAudience = audience;
	}

	configure(config: ConnectionConfig): void {
		this.cookie = this.normalizeCookie(config.cookie);
		this.baseUrl = this.buildBaseUrl(config.substackUrl);
		this.logger.log(`SubstackAdapter configured for: ${this.baseUrl}`, 'INFO');

		this.client = new SubstackClient(this.baseUrl, this.cookie, this.logger);
		this.payloadBuilder = new PayloadBuilder(this.logger);
		this.errorHandler = new ErrorHandler(this.logger);
		this.idManager = new IdStrategyManager(this.logger);

		this.currentUser = null;
		this.publicationId = null;
		this.lastConnectionError = undefined;
	}

	async authenticate(credentials: ConnectionConfig): Promise<boolean> {
		this.configure(credentials);
		const testResult = await this.testConnection();
		return testResult.success;
	}

	async testConnection(): Promise<ConnectionTestResult> {
		if (!this.isConfiguredInternal()) {
			const error = 'SubstackAdapter not configured. Missing cookie or URL.';
			this.lastConnectionError = error;
			return { success: false, error };
		}

		this.currentUser = null;
		this.publicationId = null;
		this.lastConnectionError = undefined;

		try {
			const response = await this.client!.get('/api/v1/user/self');

			if (response.status === 200 && response.json) {
				const json = response.json as Record<string, unknown>;
				this.currentUser = {
					id: (json.id as number) || 0,
					name: (json.name as string) || (json.username as string) || 'User',
					email: (json.email as string) || '',
					handle: json.handle as string | undefined,
				};
				await this.getPublicationId();
				return { success: true, user: this.currentUser };
			}

			if (response.status === 401 || response.status === 403) {
				const errorMsg =
					'Cookie expirado ou sem permissão — atualize connect.sid nas Settings.';
				this.lastConnectionError = errorMsg;
				return { success: false, error: errorMsg };
			}

			const pubResponse = await this.client!.get('/api/v1/publication');
			if (pubResponse.status === 200 && pubResponse.json) {
				const json = pubResponse.json as Record<string, unknown>;
				this.currentUser = {
					id: 0,
					name: (json.name as string) || 'Publisher',
					email: '',
				};
				await this.getPublicationId();
				return { success: true, user: this.currentUser };
			}

			const errorMsg = `Error ${response.status}`;
			this.lastConnectionError = errorMsg;
			return { success: false, error: errorMsg };
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			this.lastConnectionError = message;
			return { success: false, error: message };
		}
	}

	async publish(post: UniversalPost, options: PublishOptions): Promise<PublishResult> {
		if (!this.isReadyForPublishingInternal()) {
			return {
				success: false,
				error: 'SubstackAdapter not ready. Test connection in Settings.',
			};
		}

		const audience = (options.audience ?? this.defaultAudience) as SubstackAudience;
		const scheduledAt = options.scheduledAt ?? post.scheduledDate;
		const wantLive = !options.isDraft && !scheduledAt;

		this.logger.log(
			`Publish "${post.title}" draft=${options.isDraft} schedule=${!!scheduledAt} audience=${audience}`,
			'INFO',
		);

		try {
			const draft = await this.createDraftInternal(post, audience);
			if (!draft.success || !draft.draftId) {
				return { success: false, error: draft.error || 'Failed to create draft.' };
			}

			if (scheduledAt) {
				const sched = await this.scheduleDraftInternal(draft.draftId, scheduledAt, audience);
				if (!sched.success) {
					return {
						success: false,
						error: sched.error,
						postId: String(draft.draftId),
						postUrl: draft.draftUrl,
					};
				}
				return {
					success: true,
					postId: String(draft.draftId),
					postUrl: draft.draftUrl,
				};
			}

			if (wantLive) {
				return await this.publishDraftInternal(draft.draftId);
			}

			return {
				success: true,
				postUrl: draft.draftUrl,
				postId: String(draft.draftId),
			};
		} catch (error: unknown) {
			const message =
				error instanceof SubstackError
					? error.message
					: error instanceof Error
						? error.message
						: 'Unknown Substack error';
			this.logger.error(`Failed to publish: ${message}`, error);
			return { success: false, error: message };
		}
	}

	async createDraft(post: UniversalPost): Promise<DraftResult> {
		if (!this.isReadyForPublishingInternal()) {
			return { success: false, error: 'SubstackAdapter not ready.' };
		}
		return this.createDraftInternal(post, this.defaultAudience);
	}

	/**
	 * Fluxo validado no handoff: draft vazio → upload imagens → PUT body ProseMirror.
	 */
	private async createDraftInternal(
		post: UniversalPost,
		audience: SubstackAudience,
	): Promise<{ success: boolean; error?: string; draftId?: number; draftUrl?: string }> {
		try {
			const pubId = await this.getPublicationId();
			if (!pubId) {
				return { success: false, error: 'Substack publication ID not found.' };
			}

			const empty = this.payloadBuilder!.buildEmptyDraftPayload(
				post.title,
				audience,
				this.currentUser,
			);
			const createRes = await this.client!.post(
				`/api/v1/drafts?publication_id=${pubId}`,
				empty,
			);

			if (createRes.status !== 200 && createRes.status !== 201) {
				if (createRes.status === 401 || createRes.status === 403) {
					return {
						success: false,
						error: 'Cookie expirado — atualize connect.sid nas Settings.',
					};
				}
				const err = this.errorHandler!.handle(createRes, 'Substack draft creation');
				throw err;
			}

			const data = createRes.json as DraftResponse;
			const draftId = data.id || data.draft_id;
			if (!draftId) {
				return { success: false, error: 'Draft criado sem id na resposta.' };
			}

			// Monta doc (imagens pendentes) → upload → captionedImage
			const skeleton = this.proseBuilder.build(post.content);
			let finalDoc = skeleton;
			if (this.app) {
				finalDoc = await this.imageResolver.process(skeleton, {
					app: this.app,
					client: this.client!,
					baseUrl: this.baseUrl,
					draftId,
				});
			} else {
				this.logger.log('App não injetado — imagens locais não serão enviadas', 'WARN');
			}

			const updateBody = this.payloadBuilder!.buildUpdateBodyPayload(
				post.title,
				audience,
				finalDoc,
				post.subtitle,
			);

			const putRes = await this.client!.put(`/api/v1/drafts/${draftId}`, updateBody);
			if (putRes.status !== 200 && putRes.status !== 201) {
				this.logger.log(`PUT draft body HTTP ${putRes.status}`, 'WARN');
				// Draft existe; corpo pode estar vazio — reporta parcial
				return {
					success: false,
					error: `Draft ${draftId} criado, mas falhou ao gravar o corpo (HTTP ${putRes.status}).`,
					draftId,
					draftUrl: `${this.baseUrl}/publish/post/${draftId}`,
				};
			}

			this.logger.log(`Substack draft ready: ${draftId}`, 'INFO');
			return {
				success: true,
				draftId,
				draftUrl: `${this.baseUrl}/publish/post/${draftId}`,
			};
		} catch (error: unknown) {
			const message =
				error instanceof SubstackError
					? error.message
					: error instanceof Error
						? error.message
						: 'Unknown draft error';
			this.logger.error(`Failed to create draft: ${message}`, error);
			return { success: false, error: message };
		}
	}

	private async scheduleDraftInternal(
		draftId: number,
		when: Date,
		audience: SubstackAudience,
	): Promise<{ success: boolean; error?: string }> {
		const triggerAt = when.toISOString();
		try {
			await this.client!.prepublish(draftId, triggerAt);
			const res = await this.client!.scheduleRelease(draftId, triggerAt, audience);
			if (res.status === 200 || res.status === 201) {
				this.logger.log(`Scheduled draft ${draftId} at ${triggerAt}`, 'INFO');
				return { success: true };
			}
			if (res.status === 401 || res.status === 403) {
				return {
					success: false,
					error: 'Cookie expirado — atualize connect.sid nas Settings.',
				};
			}
			return {
				success: false,
				error: `Falha ao agendar (HTTP ${res.status}).`,
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			return { success: false, error: message };
		}
	}

	private async publishDraftInternal(draftId: number): Promise<PublishResult> {
		try {
			const response = await this.client!.post(`/api/v1/drafts/${draftId}/publish`, {
				send: true,
			});

			if (response.status === 200 || response.status === 201) {
				const postUrl = `${this.baseUrl}/p/${draftId}`;
				return { success: true, postId: String(draftId), postUrl };
			}

			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft created, but automatic publishing failed. Publish manually on Substack.',
			};
		} catch {
			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft created. Automatic publishing failed. Publish manually on Substack.',
			};
		}
	}

	private isConfiguredInternal(): boolean {
		return !!this.cookie && !!this.baseUrl && !!this.client;
	}

	private isReadyForPublishingInternal(): boolean {
		return this.isConfiguredInternal() && !!this.currentUser && !!this.publicationId;
	}

	getDetailedStatus(): {
		isConfigured: boolean;
		isConnected: boolean;
		user?: UserInfo;
		error?: string;
	} {
		return {
			isConfigured: this.isConfiguredInternal(),
			isConnected: this.isReadyForPublishingInternal(),
			user: this.currentUser || undefined,
			error: this.lastConnectionError,
		};
	}

	private async getPublicationId(): Promise<number | null> {
		if (this.publicationId) return this.publicationId;
		if (!this.idManager || !this.client) return null;

		const strategies = [
			new PublicationEndpointStrategy(this.client, this.logger),
			new ArchiveStrategy(this.client, this.logger),
			new UserSelfStrategy(this.client, this.logger),
		];
		this.publicationId = await this.idManager.findPublicationId(strategies);
		return this.publicationId;
	}

	private normalizeCookie(cookie: string): string {
		let normalized = cookie.trim();
		normalized = normalized.replace(/^cookie:\s*/i, '');
		const match = normalized.match(/connect\.sid=([^;\s]+)/);
		return match && match[1] ? match[1] : normalized;
	}

	private buildBaseUrl(url: string): string {
		let hostname = url.trim();
		hostname = hostname.replace(/^https?:\/\//, '');
		hostname = hostname.replace(/\/.*$/, '');
		if (!hostname.includes('.')) {
			hostname = `${hostname}.substack.com`;
		}
		return `https://${hostname}`;
	}
}
