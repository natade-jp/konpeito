import RoundingMode from "./RoundingMode.js";

test("UP 1", () => {
	expect(RoundingMode.UP.getAddNumber(3)).toBe(7);
});

test("UP 2", () => {
	expect(RoundingMode.UP.getAddNumber(-33)).toBe(-7);
});

test("DOWN 1", () => {
	expect(RoundingMode.DOWN.getAddNumber(3)).toBe(-3);
});

test("DOWN 2", () => {
	expect(RoundingMode.DOWN.getAddNumber(-3)).toBe(3);
});

test("CEILING 1", () => {
	expect(RoundingMode.CEILING.getAddNumber(3)).toBe(7);
});

test("CEILING 2", () => {
	expect(RoundingMode.CEILING.getAddNumber(-13)).toBe(3);
});

test("FLOOR 1", () => {
	expect(RoundingMode.FLOOR.getAddNumber(3)).toBe(-3);
});

test("FLOOR 2", () => {
	expect(RoundingMode.FLOOR.getAddNumber(-13)).toBe(-7);
});

test("HALF_UP 1", () => {
	expect(RoundingMode.HALF_UP.getAddNumber(4)).toBe(-4);
});

test("HALF_UP 2", () => {
	expect(RoundingMode.HALF_UP.getAddNumber(5)).toBe(5);
});

test("HALF_DOWN 1", () => {
	expect(RoundingMode.HALF_DOWN.getAddNumber(5)).toBe(-5);
});

test("HALF_DOWN 2", () => {
	expect(RoundingMode.HALF_DOWN.getAddNumber(6)).toBe(4);
});

test("HALF_EVEN 1", () => {
	expect(RoundingMode.HALF_EVEN.getAddNumber(15)).toBe(5);
});

test("HALF_EVEN 2", () => {
	expect(RoundingMode.HALF_EVEN.getAddNumber(25)).toBe(-5);
});

test("HALF_EVEN 3", () => {
	expect(RoundingMode.HALF_EVEN.getAddNumber(-15)).toBe(-5);
});

test("HALF_EVEN 4", () => {
	expect(RoundingMode.HALF_EVEN.getAddNumber(-25)).toBe(5);
});

test("UNNECESSARY", () => {
	expect(RoundingMode.UNNECESSARY.getAddNumber(0)).toBe(0);
});
