/**
 * Substack Payload Builder
 * Factory centralizado para criar payloads
 */

import { PublishOptions, DraftPayload, ValidationResult, SubstackUserInfo } from './types';
import { Logger } from '../logger';
import type { SubstackAudience } from './proseMirrorTypes';

export class PayloadBuilder {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Payload mínimo para criar draft vazio (passo 1 do fluxo com imagens).
	 */
	buildEmptyDraftPayload(
		title: string,
		audience: SubstackAudience,
		user: SubstackUserInfo | null,
	): DraftPayload {
		const payload: DraftPayload = {
			draft_title: title.trim(),
			type: 'newsletter',
			draft_bylines: [],
			audience,
		};

		if (user?.id && user.id > 0) {
			payload.draft_bylines = [{ user_id: user.id }];
		}

		return payload;
	}

	/**
	 * Body do PUT: draft_body = JSON string do doc ProseMirror.
	 */
	buildUpdateBodyPayload(
		title: string,
		audience: SubstackAudience,
		proseMirrorDoc: object,
		subtitle?: string,
	): Record<string, unknown> {
		const draftBody = JSON.stringify(proseMirrorDoc);
		const payload: Record<string, unknown> = {
			draft_title: title.trim(),
			audience,
			draft_body: draftBody,
		};
		if (subtitle?.trim()) {
			payload.draft_subtitle = subtitle.trim();
		}
		this.logger.log(`draft_body length: ${draftBody.length}`, 'INFO');
		return payload;
	}

	/**
	 * @deprecated Prefer buildEmptyDraftPayload + PUT. Mantido para compat.
	 */
	buildDraftPayload(options: PublishOptions, user: SubstackUserInfo | null): DraftPayload {
		const validation = this.validateOptions(options);
		if (!validation.valid) {
			throw new Error(`Payload inválido: ${validation.error}`);
		}

		const contentString =
			typeof options.bodyHtml === 'string'
				? options.bodyHtml
				: JSON.stringify(options.bodyHtml);

		const payload: DraftPayload = {
			draft_title: options.title.trim(),
			bodyJson: options.bodyHtml,
			type: 'newsletter',
			draft_bylines: [],
			draft_body: contentString,
			audience: options.audience ?? 'everyone',
		};

		if (options.subtitle?.trim()) {
			payload.draft_subtitle = options.subtitle.trim();
		}

		if (user?.id && user.id > 0) {
			payload.draft_bylines = [{ user_id: user.id }];
		}

		return payload;
	}

	private validateOptions(options: PublishOptions): ValidationResult {
		if (!options.title || options.title.trim().length === 0) {
			return { valid: false, error: 'Título é obrigatório', field: 'title' };
		}
		if (!options.bodyHtml) {
			return { valid: false, error: 'Corpo do texto é obrigatório', field: 'bodyHtml' };
		}
		if (typeof options.bodyHtml === 'string' && options.bodyHtml.trim().length === 0) {
			return { valid: false, error: 'Corpo do texto é obrigatório', field: 'bodyHtml' };
		}
		if (options.title.length > 500) {
			return { valid: false, error: 'Título muito longo (máximo 500 caracteres)', field: 'title' };
		}
		return { valid: true };
	}

	validatePayload(payload: DraftPayload): ValidationResult {
		if (!Array.isArray(payload.draft_bylines)) {
			return { valid: false, error: 'draft_bylines deve ser um array', field: 'draft_bylines' };
		}
		for (const byline of payload.draft_bylines) {
			if (byline.user_id && typeof byline.user_id !== 'number') {
				return {
					valid: false,
					error: 'user_id deve ser número',
					field: 'draft_bylines[].user_id',
				};
			}
		}
		return { valid: true };
	}
}
