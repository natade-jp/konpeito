import MathContext from "./MathContext.mjs";

test("test 1", () => {
	expect(MathContext.DECIMAL32.equals(MathContext.DECIMAL32)).toBe(true);
});

test("test 2", () => {
	expect(MathContext.DECIMAL64.toString() === "precision=16 roundingMode=HALF_EVEN").toBe(true);
});

test("test 3", () => {
	expect((new MathContext(MathContext.DECIMAL64.toString())).equals(MathContext.DECIMAL64)).toBe(true);
});

