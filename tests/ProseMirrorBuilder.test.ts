// ==============================================================================
// TEST: ProseMirrorBuilder.test.ts
// DESCRIÇÃO: Builder Markdown → ProseMirror com imagens pendentes e links
// ==============================================================================

import { describe, it, expect } from "vitest";
import { ProseMirrorBuilder } from "../src/substack/ProseMirrorBuilder";
import type { PendingImageAttrs } from "../src/substack/proseMirrorTypes";

const builder = new ProseMirrorBuilder();

describe("ProseMirrorBuilder", () => {
	it("texto simples vira parágrafo", () => {
		const doc = builder.build("Olá mundo.");
		expect(doc.type).toBe("doc");
		expect(doc.content[0]!.type).toBe("paragraph");
		expect(doc.content[0]!.content?.[0]?.text).toContain("Olá mundo");
	});

	it("![[img.jpg]] vira _pendingImage", () => {
		const doc = builder.build("![[_imagens/foto.jpg]]");
		expect(doc.content[0]!.type).toBe("_pendingImage");
		const attrs = doc.content[0]!.attrs as unknown as PendingImageAttrs;
		expect(attrs.path).toBe("_imagens/foto.jpg");
	});

	it("[![[img.jpg]]](url) preenche href", () => {
		const doc = builder.build(
			"[![[_final/capa.jpg]]](https://music.youtube.com/watch?v=1)",
		);
		const attrs = doc.content[0]!.attrs as unknown as PendingImageAttrs;
		expect(attrs.path).toBe("_final/capa.jpg");
		expect(attrs.href).toBe("https://music.youtube.com/watch?v=1");
	});

	it("![alt](path) vira pending", () => {
		const doc = builder.build("![capa](./pics/a.png)");
		const attrs = doc.content[0]!.attrs as unknown as PendingImageAttrs;
		expect(attrs.path).toBe("./pics/a.png");
		expect(attrs.alt).toBe("capa");
	});

	it("link inline vira mark link", () => {
		const doc = builder.build("Veja [site](https://example.com).");
		const texts = doc.content[0]!.content ?? [];
		const linkNode = texts.find((n) => n.marks?.some((m) => m.type === "link"));
		expect(linkNode?.text).toBe("site");
		expect(linkNode?.marks?.[0]?.attrs?.href).toBe("https://example.com");
	});

	it("remove frontmatter e H1", () => {
		const md = `---\ntitle: X\n---\n# Título\n\nCorpo.`;
		const doc = builder.build(md);
		expect(JSON.stringify(doc)).not.toContain("Título");
		expect(doc.content[0]!.content?.[0]?.text).toContain("Corpo");
	});

	it("collectPendingImages lista paths", () => {
		const doc = builder.build("![[a.jpg]]\n\ntexto\n\n![[b.png]]");
		const pending = builder.collectPendingImages(doc);
		expect(pending.map((p) => p.path)).toEqual(["a.jpg", "b.png"]);
	});
});
