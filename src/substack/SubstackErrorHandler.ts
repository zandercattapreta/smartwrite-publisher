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
			return this.handle401Error();
		}

		// HTTP 403 - Forbidden
		if (status === 403) {
			return this.handle403Error();
		}

		// HTTP 404 - Not Found
		if (status === 404) {
			return this.handle404Error(context);
		}

		// HTTP 429 - Rate Limited
		if (status === 429) {
			return this.handle429Error();
		}

		// HTTP 500+ - Server Error
		if (status >= 500) {
			return this.handle5xxError(status);
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
	 * Enhanced 401 error with actionable steps
	 */
	private handle401Error(): SubstackError {
		const message = 'Authentication failed. Your cookie may have expired.\n\n' +
			'Please follow these steps:\n' +
			'1. Open Substack in your browser\n' +
			'2. Log in to your account\n' +
			'3. Copy the new connect.sid cookie\n' +
			'4. Update settings in SmartWrite Publisher';

		return new SubstackError(
			'Authentication Failed (401)',
			401,
			false,
			message
		);
	}

	/**
	 * Enhanced 403 error with possible causes
	 */
	private handle403Error(): SubstackError {
		const message = 'Access forbidden. Possible causes:\n\n' +
			'• Cookie has expired (refresh in browser)\n' +
			'• Insufficient permissions for this publication\n' +
			'• Account not verified or suspended\n\n' +
			'Try logging out and back in to Substack, then update your cookie.';

		return new SubstackError(
			'Access Forbidden (403)',
			403,
			true,
			message
		);
	}

	/**
	 * Enhanced 404 error with context-aware suggestions
	 */
	private handle404Error(context: string): SubstackError {
		let message: string;

		if (context.includes('publication')) {
			message = 'Publication not found. Please check:\n\n' +
				'• URL format: https://yourname.substack.com\n' +
				'• Spelling of your Substack name\n' +
				'• Publication is active and not deleted\n\n' +
				'Verify your URL in settings.';
		} else {
			message = 'Resource not found (404).\n\n' +
				'Please check your Substack URL in settings.';
		}

		return new SubstackError(
			'Not Found (404)',
			404,
			false,
			message
		);
	}

	/**
	 * Enhanced 429 error with wait time guidance
	 */
	private handle429Error(): SubstackError {
		const message = 'Rate limit exceeded. Substack is blocking too many requests.\n\n' +
			'What to do:\n' +
			'• Wait 5-10 minutes before trying again\n' +
			'• Reduce batch publish size to smaller groups\n' +
			'• Increase delay between posts (currently 1.5s)\n\n' +
			'This is temporary and will resolve soon.';

		return new SubstackError(
			'Rate Limited (429)',
			429,
			true,
			message
		);
	}

	/**
	 * Enhanced 5xx error with server status info
	 */
	private handle5xxError(status: number): SubstackError {
		const message = 'Substack server error. This is not your fault.\n\n' +
			'What to do:\n' +
			'• Try again in a few minutes\n' +
			'• Check https://status.substack.com for outages\n' +
			'• Contact Substack support if the issue persists\n\n' +
			'Your content is safe - nothing was lost.';

		return new SubstackError(
			`Server Error (${status})`,
			status,
			true,
			message
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
