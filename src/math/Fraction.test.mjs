/* global test, expect */

import Fraction from "./Fraction.mjs";
const $ = Fraction.create;

let test_count = 0;

const testEQ = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = $(y);
	const testname = operator + " " + test_count + " $(" + x + ")";
	const out = $(X).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

const testBool = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y;
	const out = Y === y;
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y;
	const out = $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y) {
	test_count++;
	const X1 = $(x1);
	const X2 = $(x2);
	const Y = X1[operator](X2);
	const testname = operator + " " + test_count + " (" + x1 + ")." + operator + "(" + x2 + ") = " + y;
	const out = $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x, p1, p2, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator](p1, p2);
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + y;
	const out = $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

test("testname", () => { expect(true).toBe(true); });