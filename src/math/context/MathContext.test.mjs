/* global test, expect */

import MathContext from "./MathContext.mjs";

test("MathContext 1", () => {
	expect(MathContext.DECIMAL32.equals(MathContext.DECIMAL32)).toBe(true);
});

test("MathContext 2", () => {
	expect(MathContext.DECIMAL64.toString() === "precision=16 roundingMode=HALF_EVEN").toBe(true);
});

test("MathContext 3", () => {
	expect((new MathContext(MathContext.DECIMAL64.toString())).equals(MathContext.DECIMAL64)).toBe(true);
});

