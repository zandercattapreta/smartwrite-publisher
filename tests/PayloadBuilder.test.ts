// ==============================================================================
// TEST: PayloadBuilder.test.ts
// DESCRIÇÃO: draft vazio + PUT body com draft_body string JSON
// ==============================================================================

import { describe, it, expect } from "vitest";
import { PayloadBuilder } from "../src/substack/SubstackPayloadBuilder";
import { Logger } from "../src/logger";

const builder = new PayloadBuilder(new Logger());

describe("PayloadBuilder", () => {
	it("empty draft inclui audience e bylines", () => {
		const p = builder.buildEmptyDraftPayload("Título", "only_paid", {
			id: 42,
			name: "Z",
			email: "z@x.com",
		});
		expect(p.draft_title).toBe("Título");
		expect(p.audience).toBe("only_paid");
		expect(p.draft_bylines).toEqual([{ user_id: 42 }]);
		expect(p.draft_body).toBeUndefined();
	});

	it("update body serializa ProseMirror como string", () => {
		const doc = {
			type: "doc",
			content: [
				{
					type: "captionedImage",
					content: [{ type: "image2", attrs: { src: "https://cdn/x.jpg" } }],
				},
			],
		};
		const p = builder.buildUpdateBodyPayload("T", "only_paid", doc);
		expect(typeof p.draft_body).toBe("string");
		const parsed = JSON.parse(p.draft_body as string);
		expect(parsed.content[0].type).toBe("captionedImage");
		expect(parsed.content[0].content[0].type).toBe("image2");
	});
});
