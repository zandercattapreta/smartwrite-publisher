/**
 * Substack HTTP Client
 * Wrapper limpo para requisições HTTP
 */

import { requestUrl } from 'obsidian';
import { Logger } from '../logger';
import { HttpResponse, SubstackError } from './types';

export class SubstackClient {
	private baseUrl: string;
	private cookie: string;
	private logger: Logger;

	constructor(baseUrl: string, cookie: string, logger: Logger) {
		this.baseUrl = baseUrl;
		this.cookie = cookie;
		this.logger = logger;
	}

	/**
	 * GET request
	 */
	async get(endpoint: string): Promise<HttpResponse> {
		return this.request('GET', endpoint, null);
	}

	/**
	 * POST request
	 */
	async post(endpoint: string, body: any): Promise<HttpResponse> {
		return this.request('POST', endpoint, body);
	}

	/**
	 * Requisição HTTP genérica
	 */
	private async request(method: string, endpoint: string, body: any | null): Promise<HttpResponse> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = this.getHeaders();

		try {
			this.logger.log(`[${method}] ${url}`, 'INFO');

			// Log do payload (para debugging)
			if (body) {
				this.logger.log(`Payload: ${JSON.stringify(body)}`, 'INFO');
			}

			const response = await requestUrl({
				url,
				method,
				headers,
				body: body ? JSON.stringify(body) : undefined,
				throw: false
			});

			// Validar resposta
			if (!response) {
				throw new SubstackError(
					'Resposta vazia do servidor',
					0,
					true,
					'Verifique sua conexão'
				);
			}

			const httpResponse: HttpResponse = {
				status: response.status,
				headers: response.headers || {},
				text: response.text,
				json: this.parseJson(response.text)
			};

			this.logger.log(`[${method}] ${url} → ${response.status}`, 'INFO');

			// Log da response (para debugging)
			if (response.status >= 400 || method === 'POST') {
				this.logger.log(`Response: ${response.text.substring(0, 500)}`, 'INFO');
			}

			return httpResponse;
		} catch (error: any) {
			this.logger.log(`Erro na requisição ${method} ${url}: ${error.message}`, 'ERROR');
			throw new SubstackError(
				`Erro na requisição: ${error.message}`,
				0,
				true,
				'Verifique sua conexão e credenciais'
			);
		}
	}

	/**
	 * Retorna headers padrão para requisições
	 */
	private getHeaders(): Record<string, string> {
		return {
			'Cookie': `connect.sid=${this.cookie}`,
			'Content-Type': 'application/json',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			'Accept': '*/*',
			'Accept-Language': 'en-US,en;q=0.9',
			'X-Requested-With': 'XMLHttpRequest',
			'Cache-Control': 'no-cache',
			'Pragma': 'no-cache',
			'Origin': this.baseUrl,
			'Referer': `${this.baseUrl}/`
		};
	}

	/**
	 * Parse JSON com validação
	 */
	private parseJson(text: string | undefined): any {
		if (!text) return null;

		try {
			return JSON.parse(text);
		} catch (e) {
			this.logger.log('Falha ao fazer parse JSON', 'WARN');
			return null;
		}
	}
}
