// ==============================================================================
// SCRIPT: ProseMirrorBuilder.ts
// DESCRIÇÃO: Converte Markdown Obsidian → doc ProseMirror (Substack), com imagens pendentes
// CHAMADO POR: SubstackAdapter (antes do upload)
// TRAZ (CHAMA/IMPORTA): proseMirrorTypes.ts
// CONTRATO: build(markdown) → ProseMirrorDoc com nós `_pendingImage` ou texto;
//   draft_body final (após ImageResolver) usa captionedImage → image2
// ==============================================================================

import type {
	ProseMirrorDoc,
	ProseMirrorMark,
	ProseMirrorNode,
	PendingImageAttrs,
} from "./proseMirrorTypes";

/** Regex: imagem linkada wiki `[![[path]]](href)` */
const LINKED_WIKI =
	/^\[!\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]\]\(([^)]+)\)$/;

/** Regex: imagem linkada markdown `[![alt](src)](href)` */
const LINKED_MD =
	/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)$/;

/** Regex: embed wiki `![[path]]` ou `![[path|alias]]` */
const WIKI_EMBED =
	/^!\[\[([^\]|#]+)(?:\|([^\]]*))?\]\]$/;

/** Regex: markdown `![alt](src)` */
const MD_IMAGE =
	/^!\[([^\]]*)\]\(([^)]+)\)$/;

/**
 * Construtor puro Markdown → ProseMirror (sem I/O de vault).
 * Imagens locais ficam como `_pendingImage` até o ImageResolver.
 */
export class ProseMirrorBuilder {
	/**
	 * @param markdown - corpo da nota (com ou sem frontmatter)
	 * @returns doc ProseMirror (ainda pode conter `_pendingImage`)
	 */
	build(markdown: string): ProseMirrorDoc {
		const body = this.stripFrontmatter(markdown)
			.replace(/^#\s+[^\n]*\n?/, "")
			.trim();

		if (!body) {
			return {
				type: "doc",
				content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
			};
		}

		const content: ProseMirrorNode[] = [];
		const lines = body.split("\n");
		let i = 0;

		while (i < lines.length) {
			const raw = lines[i] ?? "";
			const line = raw.trim();

			if (!line) {
				i++;
				continue;
			}

			const pending = this.tryParseImageLine(line);
			if (pending) {
				content.push({
					type: "_pendingImage",
					attrs: pending as unknown as Record<string, unknown>,
				});
				i++;
				continue;
			}

			const heading = /^(#{2,6})\s+(.+)$/.exec(line);
			if (heading) {
				content.push({
					type: "heading",
					attrs: { level: heading[1]!.length },
					content: this.parseInline(heading[2]!.trim()),
				});
				i++;
				continue;
			}

			if (/^[-*_]{3,}$/.test(line)) {
				content.push({ type: "horizontalRule" });
				i++;
				continue;
			}

			// Parágrafo: junta linhas até bloco vazio ou especial
			const paraLines: string[] = [];
			while (i < lines.length) {
				const l = (lines[i] ?? "").trim();
				if (!l) break;
				if (this.tryParseImageLine(l)) break;
				if (/^#{2,6}\s+/.test(l)) break;
				if (/^[-*_]{3,}$/.test(l)) break;
				paraLines.push(l);
				i++;
			}

			if (paraLines.length > 0) {
				content.push({
					type: "paragraph",
					content: this.parseInline(paraLines.join(" ")),
				});
			}
		}

		if (content.length === 0) {
			content.push({ type: "paragraph", content: [{ type: "text", text: "" }] });
		}

		return { type: "doc", content };
	}

	/**
	 * Extrai paths de imagens pendentes (para pré-checagem).
	 */
	collectPendingImages(doc: ProseMirrorDoc): PendingImageAttrs[] {
		const out: PendingImageAttrs[] = [];
		for (const node of doc.content) {
			if (node.type === "_pendingImage" && node.attrs) {
				out.push(node.attrs as unknown as PendingImageAttrs);
			}
		}
		return out;
	}

	private tryParseImageLine(line: string): PendingImageAttrs | null {
		let m = LINKED_WIKI.exec(line);
		if (m) {
			return { path: m[1]!.trim(), href: m[2]!.trim(), alt: "" };
		}
		m = LINKED_MD.exec(line);
		if (m) {
			return { path: m[2]!.trim(), href: m[3]!.trim(), alt: m[1] ?? "" };
		}
		m = WIKI_EMBED.exec(line);
		if (m) {
			return { path: m[1]!.trim(), alt: (m[2] ?? "").trim() };
		}
		m = MD_IMAGE.exec(line);
		if (m) {
			return { path: m[2]!.trim(), alt: m[1] ?? "" };
		}
		return null;
	}

	private stripFrontmatter(markdown: string): string {
		const match = /^---\s*\n[\s\S]*?\n---\s*\n/.exec(markdown);
		if (!match) return markdown;
		return markdown.slice(match[0].length);
	}

	private parseInline(text: string): ProseMirrorNode[] {
		const nodes: ProseMirrorNode[] = [];
		const regex =
			/\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
		let last = 0;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(text)) !== null) {
			if (match.index > last) {
				nodes.push({ type: "text", text: text.slice(last, match.index) });
			}

			if (match[1] !== undefined && match[2] !== undefined) {
				const marks: ProseMirrorMark[] = [
					{ type: "link", attrs: { href: match[2] } },
				];
				nodes.push({ type: "text", text: match[1], marks });
			} else if (match[3] !== undefined) {
				nodes.push({
					type: "text",
					text: match[3],
					marks: [{ type: "strong" }],
				});
			} else if (match[4] !== undefined) {
				nodes.push({
					type: "text",
					text: match[4],
					marks: [{ type: "em" }],
				});
			} else if (match[5] !== undefined) {
				nodes.push({
					type: "text",
					text: match[5],
					marks: [{ type: "code" }],
				});
			}

			last = regex.lastIndex;
		}

		if (last < text.length) {
			nodes.push({ type: "text", text: text.slice(last) });
		}
		if (nodes.length === 0) {
			nodes.push({ type: "text", text });
		}
		return nodes;
	}
}
