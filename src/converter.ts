/**
 * Conversor de Markdown (Obsidian) para Tiptap JSON (Substack)
 *
 * Transforma a sintaxe do Obsidian em Tiptap JSON compatível com o Substack
 */

// Tipos para Tiptap JSON
interface TiptapNode {
	type: string;
	attrs?: Record<string, any>;
	content?: Array<TiptapNode | TiptapText>;
	marks?: Array<{ type: string }>;
	text?: string;
}

interface TiptapText {
	type: 'text';
	text: string;
	marks?: Array<{ type: string }>;
}

interface TiptapDocument {
	type: 'doc';
	attrs: { schemaVersion: 'v1' };
	content: TiptapNode[];
}

export interface ConversionResult {
	html: TiptapDocument | string; // Tiptap JSON ou fallback HTML
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
	 * Converte conteúdo Markdown completo para Tiptap JSON (formato Substack)
	 */
	convert(markdown: string, fallbackTitle: string = 'Sem título'): ConversionResult {
		// Extrai frontmatter se existir
		const { frontmatter, content } = this.extractFrontmatter(markdown);

		// Converte o corpo para Tiptap JSON
		const tiptapJson = this.markdownToTiptapJson(content);

		// Determina título (frontmatter > primeiro H1 > fallback)
		let title = frontmatter.title || this.extractFirstHeading(content) || fallbackTitle;

		return {
			html: tiptapJson, // Agora é Tiptap JSON, não HTML
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
	 * Converte Markdown para Tiptap JSON (formato nativo do Substack)
	 */
	private markdownToTiptapJson(markdown: string): TiptapDocument {
		// Remove o primeiro H1 se existir (será usado como título)
		const body = markdown.replace(/^# +[^\n]*\n?/, '');

		const nodes: TiptapNode[] = [];
		const lines = body.split('\n');
		let i = 0;

		while (i < lines.length) {
			const line = lines[i] || '';

			// Pula linhas vazias
			if (!line.trim()) {
				i++;
				continue;
			}

			// Headings (H2-H6)
			const headingMatch = line.match(/^(#{2,6})\s+(.+)$/);
			if (headingMatch) {
				const level = headingMatch[1]?.length || 2;
				const text = (headingMatch[2] || '').trim();
				if (text) {
					const headingContent = this.parseInlineMarkdown(text);
					nodes.push({
						type: 'heading',
						attrs: { level },
						content: headingContent
					});
				}
				i++;
				continue;
			}

			// Linha horizontal
			if (line && /^[-*_]{3,}$/.test(line)) {
				nodes.push({ type: 'horizontalRule' });
				i++;
				continue;
			}

			// Parágrafo normal (com formatação inline)
			if (line.trim()) {
				const paragraphContent = this.parseInlineMarkdown(line.trim());
				// Só adiciona parágrafo se houver conteúdo
				if (paragraphContent && paragraphContent.length > 0) {
					nodes.push({
						type: 'paragraph',
						content: paragraphContent
					});
				}
			}

			i++;
		}

		// Se nenhum node foi criado, cria parágrafo vazio
		if (nodes.length === 0) {
			nodes.push({
				type: 'paragraph',
				content: [{ type: 'text', text: '' }]
			});
		}

		return {
			type: 'doc',
			attrs: { schemaVersion: 'v1' },
			content: nodes
		};
	}

	/**
	 * Parse de formatação inline (bold, italic, code, etc)
	 */
	private parseInlineMarkdown(text: string): Array<TiptapText> {
		const result: Array<TiptapText> = [];
		let i = 0;

		// Se texto vazio, retorna array vazio (parágrafo pode ser vazio)
		if (!text || !text.trim()) {
			return [{
				type: 'text',
				text: text || ''
			}];
		}

		while (i < text.length) {
			// Bold: **text** ou __text__ (ANTES de italic para evitar conflito)
			const boldMatch = text.substring(i).match(/^\*\*(.+?)\*\*|^__(.+?)__/);
			if (boldMatch) {
				const boldText = boldMatch[1] || boldMatch[2] || '';
				if (boldText) {
					result.push({
						type: 'text',
						text: boldText,
						marks: [{ type: 'bold' }]
					});
				}
				i += boldMatch[0].length;
				continue;
			}

			// Italic: _text_ (EXATO: underscore) ou *text* (EXATO: single asterisk, sem bold)
			// Nota: *text* será italic apenas se não for **text**
			const italicMatch = text.substring(i).match(/^_(.+?)_/);
			if (italicMatch) {
				const italicText = italicMatch[1] || '';
				if (italicText) {
					result.push({
						type: 'text',
						text: italicText,
						marks: [{ type: 'italic' }]
					});
				}
				i += italicMatch[0].length;
				continue;
			}

			// Code: `text`
			const codeMatch = text.substring(i).match(/^`(.+?)`/);
			if (codeMatch) {
				const codeText = codeMatch[1] || '';
				if (codeText) {
					result.push({
						type: 'text',
						text: codeText,
						marks: [{ type: 'code' }]
					});
				}
				i += codeMatch[0].length;
				continue;
			}

			// Strikethrough: ~~text~~
			const strikeMatch = text.substring(i).match(/^~~(.+?)~~/);
			if (strikeMatch) {
				const strikeText = strikeMatch[1] || '';
				if (strikeText) {
					result.push({
						type: 'text',
						text: strikeText,
						marks: [{ type: 'strikethrough' }]
					});
				}
				i += strikeMatch[0].length;
				continue;
			}

			// Texto normal (tudo que não é formatação)
			const nextFormatIndex = text.substring(i).search(/[\*_`~]/);
			if (nextFormatIndex === -1) {
				// Resto do texto
				const plainText = text.substring(i);
				if (plainText) {
					result.push({
						type: 'text',
						text: plainText
					});
				}
				break;
			} else if (nextFormatIndex > 0) {
				// Texto até o próximo formato
				const plainText = text.substring(i, i + nextFormatIndex);
				if (plainText) {
					result.push({
						type: 'text',
						text: plainText
					});
				}
				i += nextFormatIndex;
			} else {
				// Se está no início de um format (não deveria chegar aqui), avança 1 char
				i++;
			}
		}

		// Se result está vazio, retorna texto vazio
		if (result.length === 0) {
			return [{
				type: 'text',
				text: text || ''
			}];
		}

		return result;
	}

	/**
	 * Converte Markdown para HTML
	 */
	private markdownToHtml(markdown: string): string {
		let html = markdown;

		// Remove o primeiro H1 se existir (será usado como título)
		// IMPORTANTE: Usar ^# (exatamente um hash) não ^#+ (um ou mais hashes)
		// Caso contrário, remove H2, H3, etc também!
		html = html.replace(/^# +[^\n]*\n?/, '');

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
