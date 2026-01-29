/**
 * Substack Payload Builder
 * Factory centralizado para criar payloads
 */

import { PublishOptions, DraftPayload, ValidationResult, SubstackUserInfo } from './types';
import { Logger } from '../logger';

export class PayloadBuilder {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Construir payload para criar draft
	 * Uma única fonte da verdade para estrutura de payload
	 */
	buildDraftPayload(options: PublishOptions, user: SubstackUserInfo | null): DraftPayload {
		// Validar entrada
		const validation = this.validateOptions(options);
		if (!validation.valid) {
			throw new Error(`Payload inválido: ${validation.error}`);
		}

		// Construir payload base (sempre obrigatório)
		const payload: DraftPayload = {
			draft_title: options.title.trim(),
			draft_body: options.bodyHtml,
			type: 'newsletter',
			draft_bylines: []
		};

		// Adicionar subtitle apenas se tiver valor
		if (options.subtitle && options.subtitle.trim()) {
			payload.draft_subtitle = options.subtitle.trim();
		}

		// Adicionar bylines se user tiver ID válido
		if (user?.id && user.id > 0) {
			payload.draft_bylines = [{ user_id: user.id }];
			this.logger.log(`Byline incluído para user ID: ${user.id}`, 'INFO');
		} else {
			// IMPORTANTE: draft_bylines DEVE estar sempre presente (mesmo que vazio)
			// A API do Substack rejeita requests sem este campo
			payload.draft_bylines = [];
		}

		this.logger.log(`Payload criado: ${Object.keys(payload).join(', ')}`, 'INFO');

		return payload;
	}

	/**
	 * Validar opções de publicação
	 */
	private validateOptions(options: PublishOptions): ValidationResult {
		if (!options.title || options.title.trim().length === 0) {
			return {
				valid: false,
				error: 'Título é obrigatório',
				field: 'title'
			};
		}

		if (!options.bodyHtml || options.bodyHtml.trim().length === 0) {
			return {
				valid: false,
				error: 'Corpo do texto é obrigatório',
				field: 'bodyHtml'
			};
		}

		if (options.title.length > 500) {
			return {
				valid: false,
				error: 'Título muito longo (máximo 500 caracteres)',
				field: 'title'
			};
		}

		return { valid: true };
	}

	/**
	 * Validar payload antes de enviar
	 */
	validatePayload(payload: DraftPayload): ValidationResult {
		// draft_bylines deve estar sempre presente
		if (!Array.isArray(payload.draft_bylines)) {
			return {
				valid: false,
				error: 'draft_bylines deve ser um array',
				field: 'draft_bylines'
			};
		}

		// Se draft_bylines tem user_id, deve ser número válido
		for (const byline of payload.draft_bylines) {
			if (byline.user_id && typeof byline.user_id !== 'number') {
				return {
					valid: false,
					error: 'user_id deve ser número',
					field: 'draft_bylines[].user_id'
				};
			}
		}

		return { valid: true };
	}
}
