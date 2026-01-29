/**
 * Substack API Service
 * Implementação usando requestUrl nativo do Obsidian
 * (A biblioteca substack-api não suporta criação de posts)
 */

import { requestUrl, RequestUrlParam } from 'obsidian';
import { Logger } from './logger';

export interface SubstackUserInfo {
	id: number;
	name: string;
	email: string;
	handle?: string;
}

export interface PublishOptions {
	title: string;
	subtitle?: string;
	bodyHtml: string;
	isDraft?: boolean;
	scheduledAt?: Date;
}

export interface PublishResult {
	success: boolean;
	postId?: string;
	postUrl?: string;
	error?: string;
}

export class SubstackService {
	private logger: Logger;
	private baseUrl: string = '';
	private cookie: string = '';
	private hostname: string = '';
	private user: SubstackUserInfo | null = null;
	private publicationId: number | null = null;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Configura o serviço com as credenciais
	 */
	configure(cookie: string, substackUrl: string): void {
		this.cookie = this.normalizeCookie(cookie);
		this.hostname = this.extractHostname(substackUrl);
		this.baseUrl = `https://${this.hostname}`;

		this.logger.log(`Configurado para: ${this.hostname}`);
	}

	/**
	 * Normaliza o cookie removendo prefixos e espaços
	 */
	private normalizeCookie(cookie: string): string {
		let normalized = cookie.trim();

		// Se o usuário colou a string inteira "cookie: substack.sid=...", limpa
		normalized = normalized.replace(/^cookie:\s*/i, '');

		// Se tem substack.sid=, tenta extrair apenas o valor se houver outros cookies
		// Caso contrário, mantém a string como está (pode ser o valor puro)
		const match = normalized.match(/substack\.sid=([^;\s]+)/);
		if (match && match[1]) {
			normalized = match[1];
		}

		this.logger.log(`Cookie normalizado (${normalized.length} chars)`);
		return normalized;
	}

	/**
	 * Extrai o hostname da URL do Substack
	 */
	private extractHostname(url: string): string {
		let hostname = url.trim();

		// Remove protocolo
		hostname = hostname.replace(/^https?:\/\//, '');

		// Remove trailing slash e path
		hostname = hostname.replace(/\/.*$/, '');

		// Se não tem domínio completo, adiciona .substack.com
		if (!hostname.includes('.')) {
			hostname = `${hostname}.substack.com`;
		}

		return hostname;
	}

	/**
	 * Headers padrão para requisições
	 * Minimiza headers Sec-Fetch que podem ser bloqueados se estiverem incorretos
	 */
	private getHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			"Cookie": `substack.sid=${this.cookie}`,
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			"Accept": "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			"X-Requested-With": "XMLHttpRequest",
			"Cache-Control": "no-cache",
			"Pragma": "no-cache"
		};

		// Se tivermos um hostname, adicionamos Referer e Origin
		if (this.hostname) {
			headers["Origin"] = `https://${this.hostname}`;
			headers["Referer"] = `https://${this.hostname}/`;
		}

		return headers;
	}

	/**
	 * Testa a conexão e retorna informações do usuário
	 */
	async testConnection(): Promise<{ success: boolean; user?: SubstackUserInfo; error?: string }> {
		if (!this.cookie || !this.hostname) {
			return { success: false, error: 'Cookie ou URL não configurados.' };
		}

		this.logger.log(`Testando conexão para: ${this.hostname}...`);

		// Lista de endpoints para tentar, do mais específico para o mais genérico
		const endpoints = [
			`${this.baseUrl}/api/v1/user/self`,
			`https://substack.com/api/v1/user/self`,
			`${this.baseUrl}/api/v1/publication`
		];

		let lastStatus = 0;
		let lastError = '';

		for (const url of endpoints) {
			try {
				this.logger.log(`Tentando endpoint: ${url}`);
				const response = await requestUrl({
					url: url,
					method: "GET",
					headers: this.getHeaders(),
					throw: false
				});

				this.logger.log(`Resposta (${url}): ${response.status}`, 'INFO');
				lastStatus = response.status;

				if (response.status === 200 && response.json) {
					const data = response.json;

					// Endpoints /user/self retornam dados de usuário
					if (url.includes('/user/self')) {
						const userInfo: SubstackUserInfo = {
							id: data.id || 0,
							name: data.name || data.username || 'Usuário',
							email: data.email || '',
							handle: data.handle
						};

						this.logger.log(`Conexão bem sucedida via ${url} (User: ${userInfo.name})`);
						this.user = userInfo;

						// Proativamente busca o ID da publicação para cache
						await this.getPublicationId();

						return { success: true, user: userInfo };
					} else if (url.includes('/publication')) {
						// Endpoint /publication retorna dados de publicação, não de usuário
						// Mas indica que a conexão está autenticada
						this.logger.log(`Conexão bem sucedida via ${url} (Publication)`);

						// Tenta extrair nome da publicação como fallback
						const userName = data.name || data.author_name || 'Publicador';
						this.user = {
							id: 0, // Sem user ID de /publication, será 0
							name: userName,
							email: '',
							handle: undefined
						};

						// Proativamente busca o ID da publicação para cache
						await this.getPublicationId();

						return { success: true, user: this.user };
					}
				}

				if (response.status === 403) {
					lastError = "403 Forbidden: O Substack bloqueou a requisição. Verifique se o cookie é recente.";
				} else if (response.status === 401) {
					lastError = "401 Unauthorized: Cookie inválido ou expirado.";
				} else {
					lastError = `Erro ${response.status}`;
				}

			} catch (error: any) {
				const errorMsg = error?.message || String(error);
				this.logger.log(`Erro no endpoint ${url}: ${errorMsg}`, 'ERROR');
				lastError = `Erro de rede: ${errorMsg}`;
			}
		}

		return { success: false, error: lastError || 'Falha desconhecida na conexão.' };
	}

	/**
	 * Obtém o ID da publicação com múltiplos fallbacks
	 */
	private async getPublicationId(): Promise<number | null> {
		if (this.publicationId) return this.publicationId;

		this.logger.log('Buscando ID da publicação...');

		// Lista de estratégias para encontrar o ID
		const strategies = [
			// 1. Endpoint direto da publicação
			{
				name: 'Endpoint Publication',
				url: `${this.baseUrl}/api/v1/publication`
			},
			// 2. Dashboard da publicação
			{
				name: 'Dashboard info',
				url: `${this.baseUrl}/api/v1/dashboard`
			},
			// 3. Informações do usuário logado (pode conter lista de publicações)
			{
				name: 'User Self info',
				url: `https://substack.com/api/v1/user/self`
			},
			// 4. Archive de posts (posts individuais contém o ID da publicação)
			{
				name: 'Archive Info',
				url: `${this.baseUrl}/api/v1/archive?limit=1`
			},
			// 5. Fallback: Parsear HTML da página inicial
			{
				name: 'HTML Homepage',
				url: `${this.baseUrl}/`
			}
		];

		for (const strategy of strategies) {
			try {
				this.logger.log(`Tentando estratégia: ${strategy.name}`);
				const isHtmlStrategy = strategy.name === 'HTML Homepage';
				
				const response = await requestUrl({
					url: strategy.url,
					method: "GET",
					headers: this.getHeaders(),
					throw: false
				});

				this.logger.log(`Resposta (${strategy.name}): ${response.status}`, 'INFO');

				if (response.status === 200) {
					if (isHtmlStrategy) {
						const html = response.text;
						// 1. Procura por scripts de app data (JSON robusto)
						if (html.includes('substack-app-data')) {
							const scriptMatch = html.match(/<script id="substack-app-data"[^>]*>([\s\S]*?)<\/script>/);
							if (scriptMatch && scriptMatch[1]) {
								try {
									const appData = JSON.parse(scriptMatch[1]);
									const id = appData.publication?.id || appData.publication_id;
									if (id) {
										this.logger.log(`ID encontrado via substack-app-data: ${id}`);
										this.publicationId = id;
										return id;
									}
								} catch (e) {
									this.logger.log('Falha ao parsear substack-app-data script.');
								}
							}
						}

						// 2. Procura por diversos padrões de ID no HTML/JS
						const patterns = [
							/"publication_id":\s*(\d+)/,
							/publication_id\s*[:=]\s*(\d+)/,
							/["']id["']\s*:\s*(\d+)/,
							/["']id["']\s*:\s*["'](\d+)["']/,
							/substack-publication-id["']\s*content=["'](\d+)/,
							/pub-(\d+)/,
							/publication-(\d+)/
						];

						for (const pattern of patterns) {
							const match = html.match(pattern);
							if (match && match[1]) {
								const id = parseInt(match[1]);
								this.logger.log(`ID encontrado via HTML regex: ${id}`);
								this.publicationId = id;
								return id;
							}
						}
					} else if (response.json) {
						const data = response.json;
						let id: number | null = null;

						this.logger.log(`Inspecionando resposta de ${strategy.name}: ${Object.keys(data).join(', ')}`);
						
						// Se for Archive Info, o ID está dentro dos posts
						if (strategy.name === 'Archive Info' && Array.isArray(data)) {
							const post = data[0];
							id = post?.publication_id || post?.publication?.id;
						} else {
							// Log snippet do JSON decodificado para ver se o ID está lá com outro nome
							const rawSnippet = JSON.stringify(data).substring(0, 300);
							this.logger.log(`RAW Snippet: ${rawSnippet}`, 'INFO');

							// Diferentes payloads para diferentes endpoints
							if (data.id && (typeof data.id === 'number' || !isNaN(parseInt(data.id)))) {
								id = typeof data.id === 'number' ? data.id : parseInt(data.id);
							} else if (data.publication?.id) {
								id = data.publication.id;
							} else if (data.publication_id) {
								id = data.publication_id;
							} else if (data.pub_id) {
								id = data.pub_id;
							} else if (Array.isArray(data.publications) && data.publications.length > 0) {
								// Se for uma lista de publicações do usuário, tenta bater pelo hostname
								const pub = data.publications.find((p: any) => 
									p.subdomain === this.hostname.split('.')[0] || 
									p.hostname === this.hostname
								);
								id = pub ? pub.id : data.publications[0].id;
							} else if (data.publication) {
								// Tenta extrair ID de dentro de um objeto publication se ele não estiver direto
								id = data.publication.id || data.publication.publication_id;
							}
						}

						if (id) {
							this.logger.log(`ID encontrado via ${strategy.name}: ${id}`);
							this.publicationId = id;
							return id;
						} else {
							this.logger.log(`Aviso: Status 200 via ${strategy.name}, mas nenhum ID detectado ou ID inválido.`);
						}
					}
				}
			} catch (e) {
				this.logger.log(`Falha na estratégia ${strategy.name}`);
			}
		}

		this.logger.log('Não foi possível determinar o ID da publicação em nenhum endpoint.', 'ERROR');
		return null;
	}

	/**
	 * Cria um rascunho no Substack
	 */
	async publishPost(options: PublishOptions): Promise<PublishResult> {
		if (!this.cookie || !this.hostname) {
			return { success: false, error: 'Serviço não configurado.' };
		}

		this.logger.log(`Criando post: "${options.title}"`);

		try {
			// Obtém ID da publicação
			const pubId = await this.getPublicationId();
			if (!pubId) {
				this.logger.log('Não foi possível obter ID da publicação', 'ERROR');
				return { success: false, error: 'Não foi possível identificar a publicação.' };
			}

			// Payload para criar draft
			const payload: any = {
				draft_title: options.title,
				draft_subtitle: options.subtitle || '',
				draft_body: options.bodyHtml,
				type: 'newsletter',
				audience: 'everyone'
			};

			// Se tivermos um user ID válido (não 0, não null, não undefined), incluímos no byline
			// NOTE: Alguns endpoints retornam 0 como user_id se não conseguem extrair, então verificamos > 0
			if (this.user?.id && this.user.id > 0) {
				payload.draft_bylines = [{ user_id: this.user.id }];
				this.logger.log(`Incluindo byline para user ID: ${this.user.id}`, 'INFO');
			} else {
				this.logger.log('Aviso: User ID não válido. Tentando criar draft sem byline.', 'WARN');
				// Não incluímos draft_bylines se não temos um ID válido
				// A API do Substack pode aceitar ou rejeitar, vamos tentar o endpoint alternativo se falhar
			}

			this.logger.log('Enviando para API...', 'INFO', { pubId, titleLength: options.title.length });

			// Se temos um user_id válido, tenta o endpoint /api/v1/drafts
			if (this.user?.id && this.user.id > 0) {
				const response = await requestUrl({
					url: `${this.baseUrl}/api/v1/drafts`,
					method: "POST",
					headers: this.getHeaders(),
					body: JSON.stringify(payload),
					throw: false
				});

				this.logger.log(`Resposta criar draft: ${response.status}`, 'INFO');

				if (response.status === 200 || response.status === 201) {
					const data = response.json;
					const postId = data.id || data.draft_id;
					const slug = data.slug || data.draft_slug || postId;

					this.logger.log(`Draft criado: ${postId}`);

					if (!options.isDraft && postId) {
						return await this.publishDraft(postId, slug);
					}

					return {
						success: true,
						postId: String(postId),
						postUrl: `${this.baseUrl}/publish/post/${postId}`
					};
				}
			}

			// Tenta endpoint alternativo (com ou sem user_id válido)
			this.logger.log('Tentando endpoint alternativo /api/v1/posts...', 'INFO');
			const altPayload = {
				title: options.title,
				subtitle: options.subtitle || '',
				body_html: options.bodyHtml,
				type: 'newsletter'
			};

			const altResponse = await requestUrl({
				url: `${this.baseUrl}/api/v1/posts`,
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify(altPayload),
				throw: false
			});

			this.logger.log(`Resposta endpoint alternativo: ${altResponse.status}`, 'INFO');

			if (altResponse.status === 200 || altResponse.status === 201) {
				const data = altResponse.json;
				return {
					success: true,
					postId: String(data.id),
					postUrl: `${this.baseUrl}/p/${data.slug || data.id}`
				};
			}

			// Se ambos falharam, retorna erro
			const errorText = altResponse.text || 'Erro desconhecido';
			this.logger.log(`Erro ao criar post: ${errorText.substring(0, 200)}`, 'ERROR');
			return { success: false, error: `Erro ${altResponse.status}: ${errorText.substring(0, 100)}` };

		} catch (error: any) {
			const errorMsg = error?.message || String(error);
			this.logger.log(`Exceção: ${errorMsg}`, 'ERROR');
			return { success: false, error: errorMsg };
		}
	}

	/**
	 * Publica um draft existente
	 */
	private async publishDraft(draftId: string | number, slug: string): Promise<PublishResult> {
		this.logger.log(`Publicando draft: ${draftId}`);

		try {
			const response = await requestUrl({
				url: `${this.baseUrl}/api/v1/drafts/${draftId}/publish`,
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify({ send: true }),
				throw: false
			});

			if (response.status === 200 || response.status === 201) {
				const postUrl = `${this.baseUrl}/p/${slug}`;
				this.logger.log(`Publicado: ${postUrl}`);
				return {
					success: true,
					postId: String(draftId),
					postUrl
				};
			}

			this.logger.log(`Erro ao publicar draft: ${response.status}`, 'WARN');
			// Retorna sucesso parcial - draft foi criado
			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft criado, mas não foi possível publicar automaticamente.'
			};

		} catch (error: any) {
			this.logger.log(`Exceção ao publicar: ${error?.message}`, 'ERROR');
			return {
				success: true,
				postId: String(draftId),
				postUrl: `${this.baseUrl}/publish/post/${draftId}`,
				error: 'Draft criado. Publique manualmente no Substack.'
			};
		}
	}

	/**
	 * Verifica se o serviço está configurado
	 */
	isConfigured(): boolean {
		return !!this.cookie && !!this.hostname;
	}

	isConnected(): boolean {
		return !!this.user && !!this.publicationId;
	}
}
