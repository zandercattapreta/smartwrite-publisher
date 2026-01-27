/**
 * Conversor de Markdown (Obsidian) para HTML (Substack)
 *
 * Transforma a sintaxe do Obsidian em HTML compatível com o Substack
 */

export interface ConversionResult {
	html: string;
	title: string;
	subtitle?: string;
	tags: string[];
}

export interface FrontmatterData {
	title?: string;
	subtitle?: string;
	tags?: string[];
	[key: string]: any;
}

export class MarkdownConverter {

	/**
	 * Converte conteúdo Markdown completo para HTML
	 */
	convert(markdown: string, fallbackTitle: string = 'Sem título'): ConversionResult {
		// Extrai frontmatter se existir
		const { frontmatter, content } = this.extractFrontmatter(markdown);

		// Converte o corpo para HTML
		const html = this.markdownToHtml(content);

		// Determina título (frontmatter > primeiro H1 > fallback)
		let title = frontmatter.title || this.extractFirstHeading(content) || fallbackTitle;

		return {
			html,
			title,
			subtitle: frontmatter.subtitle,
			tags: frontmatter.tags || []
		};
	}

	/**
	 * Extrai frontmatter YAML do markdown
	 */
	private extractFrontmatter(markdown: string): { frontmatter: FrontmatterData; content: string } {
		const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
		const match = markdown.match(frontmatterRegex);

		if (!match) {
			return { frontmatter: {}, content: markdown };
		}

		const yamlContent = match[1] || '';
		const content = markdown.slice(match[0].length);

		// Parse simples do YAML (não usa biblioteca externa)
		const frontmatter: FrontmatterData = {};
		const lines = yamlContent.split('\n');

		for (const line of lines) {
			const colonIndex = line.indexOf(':');
			if (colonIndex === -1) continue;

			const key = line.substring(0, colonIndex).trim();
			let value = line.substring(colonIndex + 1).trim();

			// Remove aspas
			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}

			// Trata arrays simples (tags: [a, b, c] ou lista multiline)
			if (value.startsWith('[') && value.endsWith(']')) {
				frontmatter[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
			} else if (key === 'tags' && value === '') {
				// Tags podem estar em formato lista (próximas linhas com -)
				frontmatter[key] = [];
			} else {
				frontmatter[key] = value;
			}
		}

		return { frontmatter, content };
	}

	/**
	 * Extrai o primeiro heading H1 do conteúdo
	 */
	private extractFirstHeading(markdown: string): string | null {
		const h1Match = markdown.match(/^#\s+(.+)$/m);
		return h1Match && h1Match[1] ? h1Match[1].trim() : null;
	}

	/**
	 * Converte Markdown para HTML
	 */
	private markdownToHtml(markdown: string): string {
		let html = markdown;

		// Remove o primeiro H1 se existir (será usado como título)
		html = html.replace(/^#\s+.+\n?/, '');

		// Escapa HTML existente
		html = this.escapeHtml(html);

		// Converte blocos de código (antes de inline para não conflitar)
		html = this.convertCodeBlocks(html);

		// Converte headings (H2-H6, H1 já foi removido)
		html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
		html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
		html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
		html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
		html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');

		// Converte bold e italic
		html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
		html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
		html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
		html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
		html = html.replace(/_(.+?)_/g, '<em>$1</em>');

		// Converte strikethrough
		html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

		// Converte links externos [text](url)
		html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

		// Converte wiki links [[note]] -> texto simples (sem link)
		html = html.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2'); // [[note|alias]] -> alias
		html = html.replace(/\[\[([^\]]+)\]\]/g, '$1'); // [[note]] -> note

		// Converte imagens ![alt](url)
		html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

		// Converte callouts do Obsidian para blockquotes (deve vir antes de blockquotes genéricos)
		html = this.convertCallouts(html);

		// Converte blockquotes genéricos
		html = this.convertBlockquotes(html);

		// Converte listas não ordenadas
		html = this.convertUnorderedLists(html);

		// Converte listas ordenadas
		html = this.convertOrderedLists(html);

		// Converte linhas horizontais
		html = html.replace(/^[-*_]{3,}$/gm, '<hr />');

		// Converte parágrafos (linhas que não são tags)
		html = this.convertParagraphs(html);

		// Limpa espaços extras
		html = html.replace(/\n{3,}/g, '\n\n');
		html = html.trim();

		return html;
	}

	/**
	 * Escapa caracteres HTML
	 */
	private escapeHtml(text: string): string {
		// Preserva tags que vamos criar depois
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	/**
	 * Converte blocos de código
	 */
	private convertCodeBlocks(html: string): string {
		// Blocos de código com linguagem
		html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
			const langAttr = lang ? ` class="language-${lang}"` : '';
			return `<pre><code${langAttr}>${code.trim()}</code></pre>`;
		});

		// Código inline
		html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

		return html;
	}

	/**
	 * Converte blockquotes
	 */
	private convertBlockquotes(html: string): string {
		const lines = html.split('\n');
		const result: string[] = [];
		let inBlockquote = false;
		let blockquoteContent: string[] = [];

		for (const line of lines) {
			if (line.startsWith('&gt; ') || line === '&gt;') {
				if (!inBlockquote) {
					inBlockquote = true;
					blockquoteContent = [];
				}
				blockquoteContent.push(line.replace(/^&gt;\s?/, ''));
			} else {
				if (inBlockquote) {
					result.push(`<blockquote><p>${blockquoteContent.join('<br />')}</p></blockquote>`);
					inBlockquote = false;
					blockquoteContent = [];
				}
				result.push(line);
			}
		}

		if (inBlockquote) {
			result.push(`<blockquote><p>${blockquoteContent.join('<br />')}</p></blockquote>`);
		}

		return result.join('\n');
	}

	/**
	 * Converte callouts do Obsidian para blockquotes
	 */
	private convertCallouts(html: string): string {
		// > [!note] Título
		// > Conteúdo
		return html.replace(
			/&gt; \[!(\w+)\]\s*([^\n]*)\n((?:&gt;.*\n?)*)/g,
			(_, type, title, content) => {
				const cleanContent = content
					.split('\n')
					.map((line: string) => line.replace(/^&gt;\s?/, ''))
					.join('<br />');
				const titleHtml = title ? `<strong>${title}</strong><br />` : '';
				return `<blockquote>${titleHtml}${cleanContent}</blockquote>`;
			}
		);
	}

	/**
	 * Converte listas não ordenadas
	 */
	private convertUnorderedLists(html: string): string {
		const lines = html.split('\n');
		const result: string[] = [];
		let inList = false;

		for (const line of lines) {
			const listMatch = line.match(/^[-*+]\s+(.+)$/);
			if (listMatch) {
				if (!inList) {
					result.push('<ul>');
					inList = true;
				}
				result.push(`<li>${listMatch[1]}</li>`);
			} else {
				if (inList) {
					result.push('</ul>');
					inList = false;
				}
				result.push(line);
			}
		}

		if (inList) {
			result.push('</ul>');
		}

		return result.join('\n');
	}

	/**
	 * Converte listas ordenadas
	 */
	private convertOrderedLists(html: string): string {
		const lines = html.split('\n');
		const result: string[] = [];
		let inList = false;

		for (const line of lines) {
			const listMatch = line.match(/^\d+\.\s+(.+)$/);
			if (listMatch) {
				if (!inList) {
					result.push('<ol>');
					inList = true;
				}
				result.push(`<li>${listMatch[1]}</li>`);
			} else {
				if (inList) {
					result.push('</ol>');
					inList = false;
				}
				result.push(line);
			}
		}

		if (inList) {
			result.push('</ol>');
		}

		return result.join('\n');
	}

	/**
	 * Converte linhas em parágrafos
	 */
	private convertParagraphs(html: string): string {
		const lines = html.split('\n');
		const result: string[] = [];
		let paragraph: string[] = [];

		const isBlock = (line: string) => {
			return line.startsWith('<h') ||
				   line.startsWith('<ul') ||
				   line.startsWith('<ol') ||
				   line.startsWith('<li') ||
				   line.startsWith('</ul') ||
				   line.startsWith('</ol') ||
				   line.startsWith('<blockquote') ||
				   line.startsWith('<pre') ||
				   line.startsWith('<hr') ||
				   line.trim() === '';
		};

		for (const line of lines) {
			if (isBlock(line)) {
				if (paragraph.length > 0) {
					result.push(`<p>${paragraph.join(' ')}</p>`);
					paragraph = [];
				}
				if (line.trim() !== '') {
					result.push(line);
				}
			} else {
				paragraph.push(line);
			}
		}

		if (paragraph.length > 0) {
			result.push(`<p>${paragraph.join(' ')}</p>`);
		}

		return result.join('\n');
	}
}
