// ==============================================================================
// SCRIPT: proseMirrorTypes.ts
// DESCRIÇÃO: Tipos do doc ProseMirror / image2 usados na publicação Substack
// CHAMADO POR: ProseMirrorBuilder, ImageResolver, PayloadBuilder, testes
// TRAZ (CHAMA/IMPORTA): nenhum
// CONTRATO: estruturas serializáveis em draft_body (JSON string)
// ==============================================================================

export interface ProseMirrorMark {
	type: string;
	attrs?: Record<string, unknown>;
}

export interface ProseMirrorNode {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: ProseMirrorMark[];
	text?: string;
}

export interface ProseMirrorDoc {
	type: "doc";
	content: ProseMirrorNode[];
}

/** Imagem local ainda sem upload (nó intermediário, nunca vai à API). */
export interface PendingImageAttrs {
	path: string;
	alt?: string;
	href?: string;
}

/** Metadados após upload bem-sucedido. */
export interface UploadedImageMeta {
	src: string;
	width: number;
	height: number;
	bytes: number;
	contentType: string;
	alt: string;
	href?: string;
}

export type SubstackAudience = "everyone" | "only_paid" | "only_free";
