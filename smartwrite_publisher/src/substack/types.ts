/**
 * SmartWrite Publisher - Substack Service Types
 * Tipagem centralizada e contracts
 */

/**
 * Informações do usuário autenticado
 */
export interface SubstackUserInfo {
	id: number;
	name: string;
	email: string;
	handle?: string;
}

/**
 * Opções para publicar um post
 */
export interface PublishOptions {
	title: string;
	subtitle?: string;
	bodyHtml: any; // Tiptap JSON ou string (para compatibilidade)
	isDraft?: boolean;
	scheduledAt?: Date;
}

/**
 * Resultado da publicação
 */
export interface PublishResult {
	success: boolean;
	postId?: string;
	postUrl?: string;
	error?: string;
}

/**
 * Resposta da API Substack para criação de draft
 */
export interface DraftResponse {
	id: number;
	slug?: string;
	draft_id?: number;
	draft_slug?: string;
	uuid?: string;
	draft_created_at?: string;
	[key: string]: any;
}

/**
 * Payload para criar um draft
 * Usa Tiptap JSON para o corpo (formato nativo do Substack)
 */
export interface DraftPayload {
	draft_title: string;
	draft_subtitle?: string;
	bodyJson: any; // Tiptap JSON structure
	type: string;
	draft_bylines: Array<{ user_id: number }>;
	[key: string]: any;
}

/**
 * Resultado de validação de payload
 */
export interface ValidationResult {
	valid: boolean;
	error?: string;
	field?: string;
}

/**
 * Resposta HTTP genérica
 */
export interface HttpResponse {
	status: number;
	headers: Record<string, string>;
	text?: string;
	json?: any;
}

/**
 * Erro do Substack com contexto
 */
export class SubstackError extends Error {
	constructor(
		message: string,
		public status: number,
		public retryable: boolean = false,
		public suggestion: string = ''
	) {
		super(message);
		this.name = 'SubstackError';
	}
}

/**
 * Configuração da conexão
 */
export interface ConnectionConfig {
	cookie: string;
	substackUrl: string;
}

/**
 * Estratégia para obter ID da publicação
 */
export interface IdStrategyResult {
	success: boolean;
	id?: number;
	error?: string;
}
