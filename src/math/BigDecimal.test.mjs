/* global test, expect */

import RoundingMode from "./context/RoundingMode.mjs";
import MathContext from "./context/MathContext.mjs";
import BigDecimal from "./BigDecimal.mjs";
const $ = BigDecimal.create;

let test_count = 0;

const testOperator3  = function(operator, x, p1, p2, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator](p1, p2);
	const Y_str = ""+ Y;
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + Y_str;
	const out = $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

{
	//	number,			toString,	toPlainString,		toEngineeringString, unscaledValue, scale
	const testString = [
		[ "0",			"0",		"0",				"0",		"0",	"e0"],
		[ "0.00",		"0.00",		"0.00",				"0.00",		"0",	"e-2"],
		[ "123",		"123",		"123",				"123",		"123",	"e0"],
		[ "-123",		"-123",		"-123",				"-123",		"-123",	"e0"],
		[ "1.23E3",		"1.23E+3",	"1230",				"1.23E+3",	"123",	"e1"],
		[ "1.23E+3",	"1.23E+3",	"1230",				"1.23E+3",	"123",	"e1"],
		[ "12.3E+7",	"1.23E+8",	"123000000",		"123E+6",	"123",	"e6"],
		[ "12.0",		"12.0",		"12.0",				"12.0",		"120",	"e-1"],
		[ "12.3",		"12.3",		"12.3",				"12.3",		"123",	"e-1"],
		[ "0.00123",	"0.00123",	"0.00123",			"0.00123",	"123",	"e-5"],
		[ "1234.5E-4",	"0.12345",	"0.12345",			"0.12345",	"12345","e-5"],
		[ "0E+7",		"0E+7",		"00000000",			"00E+6",	"0",	"e7"],
		[ "-0",			"0",		"0",				"0",		"0",	"e0"],
		[ "123e0",		"123",		"123",				"123",		"123",	"e0"],
		[ "-123e0",		"-123",		"-123",				"-123",		"-123",	"e0"],
		[ "123e+1",		"1.23E+3",	"1230",				"1.23E+3",	"123",	"e1"],
		[ "123e+3",		"1.23E+5",	"123000",			"123E+3",	"123",	"e3"],
		[ "123e-1",		"12.3",		"12.3",				"12.3",		"123",	"e-1"],
		[ "123e-5",		"0.00123",	"0.00123",			"0.00123",	"123",	"e-5"],
		[ "123e-10",	"1.23E-8",	"0.0000000123",		"12.3E-9",	"123",	"e-10"],
		[ "-123e-12",	"-1.23E-10","-0.000000000123",	"-123E-12",	"-123",	"e-12"]
	];

	for(let i = 0; i < testString.length; i++) {
		const data = testString[i];
		const decimal = $(data[0]);
		const test_name = "string " + (i + 1) + " \"" + data[0] + "\" => \t";
		test(test_name + "toString\t"				+ data[1],	() => {expect(decimal.toString()).toBe(data[1]);});
		test(test_name + "toPlainString\t"			+ data[2],	() => {expect(decimal.toPlainString()).toBe(data[2]);});
		test(test_name + "toEngineeringString\t"	+ data[3],	() => {expect(decimal.toEngineeringString()).toBe(data[3]);});
		test(test_name + "unscaledValue\t"			+ data[4],	() => {expect(decimal.unscaledValue().toString()).toBe(data[4]);});
		test(test_name + "scale\t"					+ data[5],	() => {expect(("e" + -1 * decimal.scale())).toBe(data[5]);});
	}
}

{
	const x = $("0.0000001234").ulp().toPlainString();
	const y =   "0.0000000001";
	test("ulp", () => { expect(x).toBe(y); });
}

{
	const x = $("0.0013540");
	const y = x.setScale(5, RoundingMode.HALF_EVEN);
	test("RoundingMode 1", () => { expect(x.scale()).toBe(7); });
	test("RoundingMode 2", () => { expect(y.scale()).toBe(5); });
}

{
	const x = $("0.5925");
	test("setScale 1", () => { expect(x.setScale(0, RoundingMode.HALF_UP).toString()).toBe("0"); });
	test("setScale 2", () => { expect(x.setScale(1, RoundingMode.HALF_UP).toString()).toBe("0.6"); });
	test("setScale 3", () => { expect(x.setScale(2, RoundingMode.HALF_UP).toString()).toBe("0.59"); });
	test("setScale 4", () => { expect(x.setScale(3, RoundingMode.HALF_UP).toString()).toBe("0.593"); });
}

{
	const x = $("999");
	const mc = new BigDecimal.MathContext(2, RoundingMode.UP);
	const y = x.round(mc);
	test("round 1", () => { expect(x.toString()).toBe("999"); });
	test("round 2", () => { expect(x.precision()).toBe(3); });
	test("round 3", () => { expect(y.toString()).toBe("1.0E+3"); });
	test("round 4", () => { expect(y.precision()).toBe(2); });
}

{
	const x = $(["3333.3333", MathContext.UNLIMITED]);
	const y = $(["-123.45", MathContext.UNLIMITED]);
	const add = x.add(y).toString();
	const sub = x.sub(y).toString();
	const mul = x.mul(y).toString();
	test("add " + x + " + " + y + " = " + add, () => { expect(add).toBe("3209.8833"); });
	test("sub " + x + " + " + y + " = " + sub, () => { expect(sub).toBe("3456.7833"); });
	test("mul " + x + " + " + y + " = " + mul, () => { expect(mul).toBe("-411499.995885"); });
}

{
	const x = $("100");
	const y = $("-234434");
	const max = x.max(y).toString();
	const min = x.min(y).toString();
	test("max " + x + " , " + y + " = " + max, () => { expect(max).toBe("100"); });
	test("min " + x + " , " + y + " = " + min, () => { expect(min).toBe("-234434"); });
}

{
	const x = $("110");
	const y = $("1.1e2");
	const compareTo = x.compareTo(y);
	test("compareTo " + x + " , " + y + " = " + compareTo, () => { expect(compareTo).toBe(0); });
}

{
	// x, y, divide, remainder
	const testDiv = [
		["1000e0",	"1e2",	"1000e-2",	"0e0"],
		["1000e0",	"10e1",	"100e-1",	"0e0"],
		["1000e0",	"100e0",	"10e0",	"0e0"],
		["1000e0",	"1000e-1",	"1e1",	"0e0"],
		["1000e0",	"10000e-2",	"1e1",	"0e-1"],
		["1000e0",	"100000e-3",	"1e1",	"0e-2"],
		["10e2",	"100e0",	"1e1",	"0e1"],
		["100e1",	"100e0",	"1e1",	"0e1"],
		["1000e0",	"100e0",	"10e0",	"0e0"],
		["10000e-1",	"100e0",	"100e-1",	"0e-1"],
		["100000e-2",	"100e0",	"1000e-2",	"0e-2"]
	];

	for(let i = 0; i < testDiv.length; i++) {
		const data = testDiv[i];
		const x1 = $([data[0], MathContext.UNLIMITED]);
		const x2 = $([data[1], MathContext.UNLIMITED]);
		const y  = x1.divideAndRemainder(x2);
		const y1 = "" + y[0].unscaledValue() + "e" + -1 * y[0].scale();
		const y2 = "" + y[1].unscaledValue() + "e" + -1 * y[1].scale();
		const test_name = "divideAndRemainder " + (i + 1) + " [" + data[0] + "/" + data[1] + "]\t";
		test(test_name + "div\t"	+ y1,	() => {expect(y1).toBe(data[2]);});
		test(test_name + "rem\t"	+ y2,	() => {expect(y2).toBe(data[3]);});
	}
}

{
	const x = $("10");
	const y_r = x.movePointRight(1);
	const y_l = x.movePointLeft(1);
	const y_rs = "" + y_r.unscaledValue() + "e" + -1 * y_r.scale();
	const y_ls = "" + y_l.unscaledValue() + "e" + -1 * y_l.scale();
	test("movePointRight " + x + " , 1 = " + y_rs, () => { expect(y_rs).toBe("100e0"); });
	test("movePointLeft " + x + " , 1 = " + y_ls, () => { expect(y_ls).toBe("10e-1"); });
}

{
	const x1 = $("4.36");
	const x2 = $("3.4");
	const y = x1.divide(x2, MathContext.DECIMAL128).toString();
	test("divide 1 " + x1 + " / " + x2 + " = " + y, () => { expect(y).toBe("1.280000000000000000000000000000000"); });
}

{
	const x1 = $(["1", MathContext.UNLIMITED]);
	const x2 = $(["7", MathContext.UNLIMITED]);
	let y1 = "";
	try {
		x1.divide(x2);
	}
	catch(e) {
		y1 = e;
	}
	const y2 = x1.divide(x2, { context : MathContext.DECIMAL128 }).toString();
	test("divide 2 " + x1 + " / " + x2 + " = " + y1, () => { expect(y1).toBe("ArithmeticException 0.142857[1]"); });
	test("divide 3 " + x1 + " / " + x2 + " = " + y2, () => { expect(y2).toBe("0.1428571428571428571428571428571428"); });
}

{
	const x = $("-1123.00000");
	const y = x.stripTrailingZeros();
	const stripTrailingZeros_s = "" + y.unscaledValue() + "e" + -1 * y.scale();
	const intValueExact = x.intValueExact;
	test("stripTrailingZeros " + x + " = " + stripTrailingZeros_s, () => { expect(stripTrailingZeros_s).toBe("-1123e0"); });
	test("intValueExact " + x + " = " + intValueExact, () => { expect(intValueExact).toBe(-1123); });
}

{
	const x1 = $("123.456");
	const x2 = $(30);
	const y = x1.pow(x2, MathContext.UNLIMITED).toString();
	test("pow " + x1 + " ** " + x2, () => { expect(y).toBe("556373003462553278521277665419333757914477429707861621164878013.831986527054745197804565133259323738549131155563320488179330998057446584571938059401035776"); });
}

{
	test_count = 0;
	testOperator3("clip", "1.0", "1.5", "2.5", "1.5");
	testOperator3("clip", "2.0", "1.5", "2.5", "2.0");
	testOperator3("clip", "3.0", "1.5", "2.5", "2.5");
	testOperator3("clip", "-1.0", "-2.5", "-1.5", "-1.5");
	testOperator3("clip", "-2.0", "-2.5", "-1.5", "-2.0");
	testOperator3("clip", "-3.0", "-2.5", "-1.5", "-2.5");
}
