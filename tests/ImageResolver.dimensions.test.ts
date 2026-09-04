// ==============================================================================
// TEST: ImageResolver.dimensions.test.ts
// DESCRIÇÃO: parse de dimensões PNG/JPEG + base64
// ==============================================================================

import { describe, it, expect } from "vitest";
import {
	arrayBufferToBase64,
	readImageDimensions,
} from "../src/substack/ImageResolver";

describe("readImageDimensions / base64", () => {
	it("arrayBufferToBase64 funciona", () => {
		const buf = new Uint8Array([72, 105]).buffer; // "Hi"
		expect(arrayBufferToBase64(buf)).toBe(btoa("Hi"));
	});

	it("PNG IHDR", () => {
		const bytes = new Uint8Array(24);
		bytes[0] = 0x89;
		bytes[1] = 0x50;
		// width 100, height 50
		bytes[16] = 0;
		bytes[17] = 0;
		bytes[18] = 0;
		bytes[19] = 100;
		bytes[20] = 0;
		bytes[21] = 0;
		bytes[22] = 0;
		bytes[23] = 50;
		const d = readImageDimensions(bytes.buffer, "image/png");
		expect(d).toEqual({ width: 100, height: 50 });
	});

	it("fallback 1500x800", () => {
		const d = readImageDimensions(new Uint8Array([1, 2, 3]).buffer, "image/webp");
		expect(d).toEqual({ width: 1500, height: 800 });
	});
});
