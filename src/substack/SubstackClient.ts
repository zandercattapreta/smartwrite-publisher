/**
 * Substack HTTP Client
 * Wrapper limpo para requisições HTTP
 */

import { requestUrl } from 'obsidian';
import { Logger } from '../logger';
import { HttpResponse, SubstackError } from './types';
import type { SubstackAudience } from './proseMirrorTypes';

export interface ImageUploadResult {
	url: string;
	imageWidth?: number;
	imageHeight?: number;
	bytes?: number;
	contentType?: string;
}

export class SubstackClient {
	private baseUrl: string;
	private cookie: string;
	private logger: Logger;

	constructor(baseUrl: string, cookie: string, logger: Logger) {
		this.baseUrl = baseUrl;
		this.cookie = cookie;
		this.logger = logger;
	}

	async get(endpoint: string): Promise<HttpResponse> {
		return this.request('GET', endpoint, null);
	}

	async post(endpoint: string, body: unknown): Promise<HttpResponse> {
		return this.request('POST', endpoint, body);
	}

	async put(endpoint: string, body: unknown): Promise<HttpResponse> {
		return this.request('PUT', endpoint, body);
	}

	async delete(endpoint: string): Promise<HttpResponse> {
		return this.request('DELETE', endpoint, null);
	}

	/**
	 * Upload de imagem via data-URL base64 (multipart não funciona — ver handoff Pipeline).
	 */
	async uploadImage(dataUri: string): Promise<ImageUploadResult | null> {
		const response = await this.post('/api/v1/image', { image: dataUri });
		if ((response.status === 200 || response.status === 201) && response.json?.url) {
			return {
				url: response.json.url as string,
				imageWidth: response.json.imageWidth as number | undefined,
				imageHeight: response.json.imageHeight as number | undefined,
				bytes: response.json.bytes as number | undefined,
				contentType: response.json.contentType as string | undefined,
			};
		}
		this.logger.log(
			`Image upload failed: HTTP ${response.status}`,
			'ERROR',
		);
		if (response.status === 401 || response.status === 403) {
			throw new SubstackError(
				'Cookie expirado ou sem permissão — atualize connect.sid nas Settings.',
				response.status,
				false,
				'Cole um cookie fresco do navegador',
			);
		}
		return null;
	}

	/**
	 * Pré-checagem antes de agendar.
	 */
	async prepublish(draftId: number, publishDateIso: string): Promise<HttpResponse> {
		const q = encodeURIComponent(publishDateIso);
		return this.get(`/api/v1/drafts/${draftId}/prepublish?publish_date=${q}`);
	}

	/**
	 * Agenda release. Campo correto: trigger_at (não post_date).
	 */
	async scheduleRelease(
		draftId: number,
		triggerAtIso: string,
		audience: SubstackAudience,
	): Promise<HttpResponse> {
		return this.post(`/api/v1/drafts/${draftId}/scheduled_release`, {
			trigger_at: triggerAtIso,
			post_audience: audience,
		});
	}

	private async request(method: string, endpoint: string, body: unknown | null): Promise<HttpResponse> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = this.getHeaders();

		try {
			this.logger.log(`[${method}] ${endpoint}`, 'INFO');

			// Nunca logar data-URI / cookie — só tamanho do body
			if (body && typeof body === 'object') {
				const keys = Object.keys(body as object);
				this.logger.log(`Payload keys: ${keys.join(', ')}`, 'INFO');
			}

			const response = await requestUrl({
				url,
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				throw: false,
			});

			if (!response) {
				throw new SubstackError(
					'Resposta vazia do servidor',
					0,
					true,
					'Verifique sua conexão',
				);
			}

			const httpResponse: HttpResponse = {
				status: response.status,
				headers: response.headers || {},
				text: response.text,
				json: this.parseJson(response.text),
			};

			this.logger.log(`[${method}] ${endpoint} → ${response.status}`, 'INFO');

			if (response.status >= 400) {
				const snippet = (response.text || '').substring(0, 200);
				this.logger.log(`Error body: ${snippet}`, 'WARN');
			}

			return httpResponse;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			if (error instanceof SubstackError) throw error;
			this.logger.log(`Erro na requisição ${method} ${endpoint}: ${message}`, 'ERROR');
			throw new SubstackError(
				`Erro na requisição: ${message}`,
				0,
				true,
				'Verifique sua conexão e credenciais',
			);
		}
	}

	private getHeaders(): Record<string, string> {
		return {
			Cookie: `connect.sid=${this.cookie}`,
			'Content-Type': 'application/json',
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			Accept: 'application/json',
			'Accept-Language': 'en-US,en;q=0.9',
			'X-Requested-With': 'XMLHttpRequest',
			'Cache-Control': 'no-cache',
			Pragma: 'no-cache',
			Origin: this.baseUrl,
			Referer: `${this.baseUrl}/`,
		};
	}

	private parseJson(text: string | undefined): unknown {
		if (!text) return null;
		try {
			return JSON.parse(text);
		} catch {
			this.logger.log('Falha ao fazer parse JSON', 'WARN');
			return null;
		}
	}
}
