/**
 * Substack Error Handler
 * Tratamento centralizado e inteligente de erros
 */

import { HttpResponse, SubstackError } from './types';
import { Logger } from '../logger';

export class ErrorHandler {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Processar resposta HTTP e retornar erro apropriado
	 */
	handle(response: HttpResponse, context: string): SubstackError {
		const { status, json, text } = response;

		this.logger.log(`Erro ${status} em ${context}: ${text?.substring(0, 200)}`, 'WARN');

		// HTTP 400 - Bad Request
		if (status === 400) {
			const error = this.parse400Error(json, text);
			if (error) return error;

			return new SubstackError(
				'Requisição inválida (400)',
				400,
				false,
				'Verifique os dados que está enviando'
			);
		}

		// HTTP 401 - Unauthorized
		if (status === 401) {
			return new SubstackError(
				'Não autenticado (401)',
				401,
				false,
				'Cookie inválido ou expirado. Atualize suas credenciais.'
			);
		}

		// HTTP 403 - Forbidden
		if (status === 403) {
			return new SubstackError(
				'Acesso negado (403)',
				403,
				true,
				'Cookie expirado ou sem permissões. Tente novamente em alguns minutos.'
			);
		}

		// HTTP 404 - Not Found
		if (status === 404) {
			return new SubstackError(
				'Recurso não encontrado (404)',
				404,
				false,
				'Endpoint ou publicação não encontrado. Verifique a URL.'
			);
		}

		// HTTP 429 - Rate Limited
		if (status === 429) {
			return new SubstackError(
				'Muitas requisições (429)',
				429,
				true,
				'Você foi rate limitado. Aguarde alguns minutos antes de tentar novamente.'
			);
		}

		// HTTP 500+ - Server Error
		if (status >= 500) {
			return new SubstackError(
				`Erro no servidor Substack (${status})`,
				status,
				true,
				'Tente novamente em alguns minutos.'
			);
		}

		// Erro genérico
		return new SubstackError(
			`Erro HTTP ${status} em ${context}`,
			status,
			true,
			'Tente novamente'
		);
	}

	/**
	 * Processar erro 400 (Bad Request) com inteligência
	 */
	private parse400Error(json: any, text: string | undefined): SubstackError | null {
		// Substack retorna erros estruturados
		if (json?.errors && Array.isArray(json.errors)) {
			const error = json.errors[0];
			const { param, msg } = error;

			if (param === 'draft_bylines' && msg === 'Invalid value') {
				return new SubstackError(
					'Campo draft_bylines inválido (400)',
					400,
					false,
					'Erro na estrutura do payload. Tente novamente.'
				);
			}

			if (param === 'draft_title') {
				return new SubstackError(
					`Erro no título: ${msg}`,
					400,
					false,
					'Verifique o título do seu post'
				);
			}

			if (param === 'draft_body') {
				return new SubstackError(
					`Erro no corpo: ${msg}`,
					400,
					false,
					'Verifique o conteúdo do seu post'
				);
			}

			// Erro genérico de validação
			return new SubstackError(
				`Validação falhou (${param}): ${msg}`,
				400,
				false,
				'Corrija o campo apontado e tente novamente'
			);
		}

		return null;
	}
}
