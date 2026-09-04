// ==============================================================================
// SCRIPT: ImageResolver.ts
// DESCRIÇÃO: Resolve imagens do vault, faz upload CDN e troca _pendingImage → captionedImage
// CHAMADO POR: SubstackAdapter (após criar draft vazio)
// TRAZ (CHAMA/IMPORTA): obsidian App/TFile, SubstackClient, proseMirrorTypes
// CONTRATO: process(doc, ctx) → doc final pronto para draft_body (sem _pendingImage)
// ==============================================================================

import type { App, TFile } from "obsidian";
import type { SubstackClient } from "./SubstackClient";
import type {
	ProseMirrorDoc,
	ProseMirrorNode,
	PendingImageAttrs,
	UploadedImageMeta,
} from "./proseMirrorTypes";

const MIME_BY_EXT: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
};

export interface ImageResolveContext {
	app: App;
	client: SubstackClient;
	baseUrl: string;
	draftId: number;
}

/**
 * Resolve embeds locais e monta nós captionedImage → image2 (contrato validado no handoff).
 */
export class ImageResolver {
	/**
	 * Percorre o doc, faz upload das pendentes e devolve doc limpo para a API.
	 */
	async process(doc: ProseMirrorDoc, ctx: ImageResolveContext): Promise<ProseMirrorDoc> {
		const content: ProseMirrorNode[] = [];

		for (const node of doc.content) {
			if (node.type === "_pendingImage" && node.attrs) {
				const pending = node.attrs as unknown as PendingImageAttrs;
				const uploaded = await this.uploadPending(pending, ctx);
				if (uploaded) {
					content.push(this.toCaptionedImage(uploaded, ctx));
				} else {
					// Fallback: parágrafo com o path (visível no editor, sem quebrar o draft)
					content.push({
						type: "paragraph",
						content: [{ type: "text", text: `[imagem não enviada: ${pending.path}]` }],
					});
				}
				continue;
			}
			content.push(node);
		}

		return { type: "doc", content };
	}

	/**
	 * Lê arquivo do vault e envia ao Substack.
	 */
	private async uploadPending(
		pending: PendingImageAttrs,
		ctx: ImageResolveContext,
	): Promise<UploadedImageMeta | null> {
		if (/^https?:\/\//i.test(pending.path)) {
			// URL remota — sem upload; dimensões desconhecidas → defaults seguros
			return {
				src: pending.path,
				width: 1500,
				height: 800,
				bytes: 0,
				contentType: "image/jpeg",
				alt: pending.alt ?? "",
				href: pending.href,
			};
		}

		const file = this.findFile(ctx.app, pending.path);
		if (!file) {
			return null;
		}

		const data = await ctx.app.vault.readBinary(file);
		const ext = (file.extension || "").toLowerCase();
		const contentType = MIME_BY_EXT[ext] ?? "image/jpeg";
		const dims = readImageDimensions(data, contentType);
		const b64 = arrayBufferToBase64(data);
		const dataUri = `data:${contentType};base64,${b64}`;

		const uploaded = await ctx.client.uploadImage(dataUri);
		if (!uploaded) {
			return null;
		}

		return {
			src: uploaded.url,
			width: uploaded.imageWidth || dims.width,
			height: uploaded.imageHeight || dims.height,
			bytes: uploaded.bytes || data.byteLength,
			contentType: uploaded.contentType || contentType,
			alt: pending.alt || file.basename,
			href: pending.href,
		};
	}

	private findFile(app: App, rawPath: string): TFile | null {
		const cleaned = rawPath.replace(/^\.\//, "").trim();
		const direct = app.vault.getAbstractFileByPath(cleaned);
		if (direct && "extension" in direct) {
			return direct as TFile;
		}

		// Busca por nome de arquivo (wiki sem pasta)
		const base = cleaned.split("/").pop() ?? cleaned;
		const matches = app.vault.getFiles().filter((f) => f.path === cleaned || f.name === base);
		return matches[0] ?? null;
	}

	private toCaptionedImage(meta: UploadedImageMeta, ctx: ImageResolveContext): ProseMirrorNode {
		const internalRedirect =
			`${ctx.baseUrl}/i/${ctx.draftId}?img=${encodeURIComponent(meta.src)}`;

		const image2: ProseMirrorNode = {
			type: "image2",
			attrs: {
				src: meta.src,
				width: meta.width,
				height: meta.height,
				bytes: meta.bytes,
				type: meta.contentType,
				alt: meta.alt,
				href: meta.href ?? null,
				imageSize: "large",
				topImage: true,
				belowTheFold: false,
				internalRedirect,
				srcNoWatermark: null,
				fullscreen: null,
				resizeWidth: null,
				title: null,
				isProcessing: false,
			},
		};

		return {
			type: "captionedImage",
			content: [image2],
		};
	}
}

/** ArrayBuffer → base64 (sem Buffer, roda no Obsidian). */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]!);
	}
	return btoa(binary);
}

/** Lê width/height de PNG/JPEG; fallback 1500×800. */
export function readImageDimensions(
	data: ArrayBuffer,
	contentType: string,
): { width: number; height: number } {
	const bytes = new Uint8Array(data);
	try {
		if (contentType.includes("png") || (bytes[0] === 0x89 && bytes[1] === 0x50)) {
			// IHDR em offset 16
			if (bytes.byteLength >= 24) {
				const width =
					(bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!;
				const height =
					(bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!;
				if (width > 0 && height > 0) return { width, height };
			}
		}
		if (contentType.includes("jpeg") || contentType.includes("jpg") || bytes[0] === 0xff) {
			const dims = readJpegSize(bytes);
			if (dims) return dims;
		}
	} catch {
		/* fallback abaixo */
	}
	return { width: 1500, height: 800 };
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
	let i = 2;
	while (i < bytes.byteLength - 8) {
		if (bytes[i] !== 0xff) break;
		const marker = bytes[i + 1]!;
		const length = (bytes[i + 2]! << 8) | bytes[i + 3]!;
		// SOF0–SOF3
		if (marker >= 0xc0 && marker <= 0xc3) {
			const height = (bytes[i + 5]! << 8) | bytes[i + 6]!;
			const width = (bytes[i + 7]! << 8) | bytes[i + 8]!;
			return { width, height };
		}
		i += 2 + length;
	}
	return null;
}
