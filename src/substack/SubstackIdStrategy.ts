/**
 * Substack ID Strategy
 * Estratégias para obter o ID da publicação
 */

import { SubstackClient } from './SubstackClient';
import { IdStrategyResult } from './types';
import { Logger } from '../logger';

/**
 * Interface base para estratégias
 */
export abstract class IdStrategy {
	abstract name: string;
	abstract execute(): Promise<IdStrategyResult>;
}

/**
 * Estratégia 1: Usar endpoint /api/v1/publication
 */
export class PublicationEndpointStrategy extends IdStrategy {
	name = 'Publication Endpoint';

	constructor(private client: SubstackClient, private logger: Logger) {
		super();
	}

	async execute(): Promise<IdStrategyResult> {
		try {
			const response = await this.client.get('/api/v1/publication');

			if (response.status === 200 && response.json?.id) {
				return { success: true, id: response.json.id };
			}

			return { success: false, error: `Status ${response.status}` };
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}
}

/**
 * Estratégia 2: Usar endpoint /api/v1/archive
 */
export class ArchiveStrategy extends IdStrategy {
	name = 'Archive Info';

	constructor(private client: SubstackClient, private logger: Logger) {
		super();
	}

	async execute(): Promise<IdStrategyResult> {
		try {
			const response = await this.client.get('/api/v1/archive?limit=1');

			if (response.status === 200 && Array.isArray(response.json) && response.json.length > 0) {
				const id = response.json[0].publication_id || response.json[0].publication?.id;
				if (id) {
					return { success: true, id };
				}
			}

			return { success: false, error: 'Nenhum post encontrado' };
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}
}

/**
 * Estratégia 3: Usar endpoint /api/v1/user/self
 */
export class UserSelfStrategy extends IdStrategy {
	name = 'User Self Info';

	constructor(private client: SubstackClient, private logger: Logger) {
		super();
	}

	async execute(): Promise<IdStrategyResult> {
		try {
			const response = await this.client.get('/api/v1/user/self');

			if (response.status === 200 && response.json?.publications && Array.isArray(response.json.publications)) {
				if (response.json.publications.length > 0) {
					return { success: true, id: response.json.publications[0].id };
				}
			}

			return { success: false, error: 'Nenhuma publicação encontrada' };
		} catch (error: any) {
			return { success: false, error: error.message };
		}
	}
}

/**
 * Gerenciador de estratégias para obter ID
 */
export class IdStrategyManager {
	private logger: Logger;

	constructor(logger: Logger) {
		this.logger = logger;
	}

	/**
	 * Tentar obter ID da publicação usando múltiplas estratégias
	 */
	async findPublicationId(strategies: IdStrategy[]): Promise<number | null> {
		this.logger.log('Buscando ID da publicação...', 'INFO');

		for (const strategy of strategies) {
			try {
				this.logger.log(`Tentando: ${strategy.name}`, 'INFO');
				const result = await strategy.execute();

				if (result.success && result.id) {
					this.logger.log(`ID encontrado via ${strategy.name}: ${result.id}`, 'INFO');
					return result.id;
				}

				this.logger.log(`${strategy.name} falhou: ${result.error}`, 'INFO');
			} catch (error: any) {
				this.logger.log(`${strategy.name} exceção: ${error.message}`, 'INFO');
			}
		}

		this.logger.log('Não foi possível encontrar o ID da publicação', 'ERROR');
		return null;
	}
}
