/**
 * SmartWrite Publisher - Substack Service (v0.3.0)
 * Complete refactoring with clean architecture
 */

import { Logger } from '../logger';
import { SubstackClient } from './SubstackClient';
import { PayloadBuilder } from './SubstackPayloadBuilder';
import { ErrorHandler } from './SubstackErrorHandler';
import { IdStrategyManager, PublicationEndpointStrategy, ArchiveStrategy, UserSelfStrategy } from './SubstackIdStrategy';
import {
	SubstackUserInfo,
	PublishOptions,
	PublishResult,
	DraftResponse,
	ConnectionConfig,
	SubstackError
} from './types';

export class SubstackService {
	private logger: Logger;
	private client: SubstackClient | null = null;
	private payloadBuilder: PayloadBuilder | null = null;
	private errorHandler: ErrorHandler | null = null;
	private idManager: IdStrategyManager | null = null;

	// Estado
	private baseUrl: string = '';
	private cookie: string = '';
	private user: SubstackUserInfo | null = null;
	private publicationId: number | null = null;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Configure the service with credentials
	 */
	configure(config: ConnectionConfig): void {
		this.cookie = this.normalizeCookie(config.cookie);
		this.baseUrl = this.buildBaseUrl(config.substackUrl);

		this.logger.log(`Configured for: ${this.baseUrl}`, 'INFO');

		// Initialize components
		this.client = new SubstackClient(this.baseUrl, this.cookie, this.logger);
		this.payloadBuilder = new PayloadBuilder(this.logger);
		this.errorHandler = new ErrorHandler(this.logger);
		this.idManager = new IdStrategyManager(this.logger);
	}

	/**
	 * Test connection and obtain user information
	 */
	async testConnection(): Promise<{ success: boolean; user?: SubstackUserInfo; error?: string }> {
		if (!this.isConfigured()) {
			return { success: false, error: 'Service not configured' };
		}

		try {
			// Try to obtain user info
			const response = await this.client!.get('/api/v1/user/self');

			if (response.status === 200 && response.json) {
				this.user = {
					id: response.json.id || 0,
					name: response.json.name || response.json.username || 'User',
					email: response.json.email || '',
					handle: response.json.handle
				};

				// Fetch publication ID
				await this.getPublicationId();

				return { success: true, user: this.user };
			}

			// Fallback: try /api/v1/publication
			const pubResponse = await this.client!.get('/api/v1/publication');
			if (pubResponse.status === 200 && pubResponse.json) {
				this.user = {
					id: 0, // No user ID
					name: pubResponse.json.name || 'Publisher',
					email: '',
					handle: undefined
				};

				await this.getPublicationId();

				return { success: true, user: this.user };
			}

			// No endpoint worked
			const errorMsg = response.status === 403
				? '403 Forbidden: Cookie expired or insufficient permissions'
				: `Error ${response.status}: ${response.text?.substring(0, 100)}`;

			return { success: false, error: errorMsg };

		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * Get publication ID (with cache)
	 */
	async getPublicationId(): Promise<number | null> {
		if (this.publicationId) {
			return this.publicationId;
		}

		if (!this.idManager || !this.client) {
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
	 * Publicar um post (criar draft e opcionalmente publicar)
	 */
	async publishPost(options: PublishOptions): Promise<PublishResult> {
		if (!this.isConnected()) {
			return {
				success: false,
				error: 'Serviço não configurado ou não conectado'
			};
		}

		try {
			this.logger.log(`Publicando: "${options.title}"`, 'INFO');

			// 1. Obter ID da publicação
			const pubId = await this.getPublicationId();
			if (!pubId) {
				return {
					success: false,
					error: 'Publicação não encontrada'
				};
			}

			// 2. Construir payload
			const payload = this.payloadBuilder!.buildDraftPayload(options, this.user);
			const validation = this.payloadBuilder!.validatePayload(payload);
			if (!validation.valid) {
				return {
					success: false,
					error: `Payload inválido: ${validation.error}`
				};
			}

			// 3. Tentar criar draft
			const response = await this.client!.post(
				`/api/v1/drafts?publication_id=${pubId}`,
				payload
			);

			// 4. Processar resposta
			if (response.status === 200 || response.status === 201) {
				const data: DraftResponse = response.json;
				const draftId = data.id || data.draft_id;

				// DEBUGGING: Log word_count para verificar se conteúdo foi processado
				const wordCount = data.word_count || 0;
				this.logger.log(`Draft criado: ${draftId}`, 'INFO');
				this.logger.log(`Word count: ${wordCount} (${wordCount === 0 ? 'VAZIO ❌' : 'OK ✓'})`, 'INFO');

				// Se word_count = 0, logar campos testados
				if (wordCount === 0) {
					this.logger.log('⚠️ ATENÇÃO: Post criado mas word_count = 0', 'WARN');
					this.logger.log('Campos enviados no payload:', 'INFO');
					this.logger.log(`- bodyJson: ${typeof payload.bodyJson} (${typeof payload.bodyJson === 'string' ? payload.bodyJson.length + ' chars' : 'object'})`, 'INFO');
					this.logger.log(`- body: ${payload.body ? payload.body.length + ' chars' : 'não enviado'}`, 'INFO');
					this.logger.log(`- draft_body: ${payload.draft_body ? payload.draft_body.length + ' chars' : 'não enviado'}`, 'INFO');
					this.logger.log(`- body_markdown: ${payload.body_markdown ? payload.body_markdown.length + ' chars' : 'não enviado'}`, 'INFO');
				}

				// Se não é apenas draft, tentar publicar
				if (!options.isDraft && draftId) {
					return this.publishDraft(draftId);
				}

				return {
					success: true,
					postId: String(draftId),
					postUrl: `${this.baseUrl}/publish/post/${draftId}`
				};
			}

			// Erro na resposta
			const error = this.errorHandler!.handle(response, 'draft creation');
			throw error;

		} catch (error: any) {
			const message = error instanceof SubstackError
				? error.message
				: error.message || 'Erro desconhecido';

			this.logger.log(`Erro ao publicar: ${message}`, 'ERROR');

			return {
				success: false,
				error: message
			};
		}
	}

	/**
	 * Publicar um draft existente
	 */
	private async publishDraft(draftId: number): Promise<PublishResult> {
		try {
			this.logger.log(`Publicando draft: ${draftId}`, 'INFO');

			const response = await this.client!.post(
				`/api/v1/drafts/${draftId}/publish`,
				{ send: true }
			);

			if (response.status === 200 || response.status === 201) {
				const postUrl = `${this.baseUrl}/p/${draftId}`;
				this.logger.log(`Post publicado: ${postUrl}`, 'INFO');

				return {
					success: true,
					postId: String(draftId),
					postUrl
				};
			}

			// Publicação falhou, mas draft foi criado
			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft criado, mas não foi possível publicar automaticamente'
			};

		} catch (error: any) {
			// Draft foi criado mesmo se publicação falhou
			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft criado. Publique manualmente no Substack.'
			};
		}
	}

	/**
	 * Verificar se está configurado
	 */
	isConfigured(): boolean {
		return !!this.cookie && !!this.baseUrl && !!this.client;
	}

	/**
	 * Verificar se está conectado
	 */
	isConnected(): boolean {
		return this.isConfigured() && !!this.user && !!this.publicationId;
	}

	/**
	 * Normalizar cookie (extrair valor puro)
	 */
	private normalizeCookie(cookie: string): string {
		let normalized = cookie.trim();

		// Remove prefixo "cookie: " se existir
		normalized = normalized.replace(/^cookie:\s*/i, '');

		// Tenta extrair connect.sid
		const match = normalized.match(/connect\.sid=([^;\s]+)/);
		if (match && match[1]) {
			return match[1];
		}

		// Caso contrário, retorna como está (pode ser o valor puro)
		return normalized;
	}

	/**
	 * Construir base URL
	 */
	private buildBaseUrl(url: string): string {
		let hostname = url.trim();

		// Remove protocolo
		hostname = hostname.replace(/^https?:\/\//, '');

		// Remove path e trailing slash
		hostname = hostname.replace(/\/.*$/, '');

		// Se não tem domínio completo, adiciona .substack.com
		if (!hostname.includes('.')) {
			hostname = `${hostname}.substack.com`;
		}

		return `https://${hostname}`;
	}
}

// Exportar tudo
export { SubstackClient } from './SubstackClient';
export { PayloadBuilder } from './SubstackPayloadBuilder';
export { ErrorHandler } from './SubstackErrorHandler';
export { IdStrategyManager, IdStrategy } from './SubstackIdStrategy';
export * from './types';
