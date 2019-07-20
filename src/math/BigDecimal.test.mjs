/* global test, expect */

import RoundingMode from "./context/RoundingMode.mjs";
import MathContext from "./context/MathContext.mjs";
import BigDecimal from "./BigDecimal.mjs";
const $ = BigDecimal.create;

let test_count = 0;

const testCompareTo = function(operator, x, y, z, tolerance) {
	test_count++;
	const X = $(x);
	const Y = $(y);
	const testname = operator + " " + test_count + " $(" + x + ", " + tolerance + ")." + operator + "(" + y + ") = " + z;
	const out = $(X).compareTo(Y, tolerance) === z;
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

const testOperator1  = function(operator, x, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.0;
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y;
	const out = $(Y).compareTo(y, tolerance_) === 0;
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.0;
	const X1 = $(x1);
	const X2 = $(x2);
	const Y = X1[operator](X2);
	const testname = operator + " " + test_count + " (" + x1 + ")." + operator + "(" + x2 + ") = " + y;
	const out = $(Y).compareTo(y, tolerance_) === 0;
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x, p1, p2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.0;
	const X = $(x);
	const Y = X[operator](p1, p2);
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + y;
	const out = $(Y).compareTo(y, tolerance_) === 0;
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testCompareTo("compareTo", 10, 9,  1, null);
	testCompareTo("compareTo", 10, 10, 0, null);
	testCompareTo("compareTo", 10, 11,-1, null);
	testCompareTo("compareTo", -10, -9, -1, null);
	testCompareTo("compareTo", -10, -10, 0, null);
	testCompareTo("compareTo", -10, -11, 1, null);
}

{
	test_count = 0;
	testCompareTo("compareTo", 10, 8,  1, 1);
	testCompareTo("compareTo", 10, 9,  0, 1);
	testCompareTo("compareTo", 10, 10, 0, 1);
	testCompareTo("compareTo", 10, 11, 0, 1);
	testCompareTo("compareTo", 10, 12,-1, 1);
	testCompareTo("compareTo",-10,-8, -1, 1);
	testCompareTo("compareTo",-10,-9,  0, 1);
	testCompareTo("compareTo",-10,-10, 0, 1);
	testCompareTo("compareTo",-10,-11, 0, 1);
	testCompareTo("compareTo",-10,-12, 1, 1);
}

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
	test("new", () => { expect($(123e50).compareTo("123e50") === 0).toBe(true); });
	test("new", () => { expect($(1.23e-50).compareTo("1.23e-50") === 0).toBe(true); });
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
	const x = $(0.5925);
	test("setScale 1", () => { expect(x.setScale(0, RoundingMode.HALF_UP).toString()).toBe("0"); });
	test("setScale 2", () => { expect(x.setScale(1, RoundingMode.HALF_UP).toString()).toBe("0.6"); });
	test("setScale 3", () => { expect(x.setScale(2, RoundingMode.HALF_UP).toString()).toBe("0.59"); });
	test("setScale 4", () => { expect(x.setScale(3, RoundingMode.HALF_UP).toString()).toBe("0.593"); });
	test("setScale 5", () => { expect(x.setScale(4, RoundingMode.HALF_UP).toString()).toBe("0.5925"); });
	test("setScale 6", () => { expect(x.setScale(5, RoundingMode.HALF_UP).toString()).toBe("0.59250"); });
}

{
	const x = $("999");
	const y1 = x.round(new BigDecimal.MathContext(2, RoundingMode.UP));
	const y2 = x.round(new BigDecimal.MathContext(3, RoundingMode.UP));
	const y3 = x.round(new BigDecimal.MathContext(4, RoundingMode.UP));
	test("round 1", () => { expect(x.toString()).toBe("999"); });
	test("round 2", () => { expect(x.precision()).toBe(3); });
	test("round 3", () => { expect(y1.toString()).toBe("1.0E+3"); });
	test("round 4", () => { expect(y1.precision()).toBe(2); });
	test("round 5", () => { expect(y2.toString()).toBe("999"); });
	test("round 6", () => { expect(y2.precision()).toBe(3); });
	test("round 7", () => { expect(y3.toString()).toBe("999.0"); });
	test("round 8", () => { expect(y3.precision()).toBe(4); });
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
	test_count = 0;
	testOperator2("rem", 110, 100, 10);
	testOperator2("rem",  80, 100, 80);
	testOperator2("rem",-110, 100,-10);
	testOperator2("rem", -80, 100,-80);
}

{
	test_count = 0;
	testOperator2("mod", 110, 100, 10);
	testOperator2("mod",  80, 100, 80);
	testOperator2("mod", -110, 100, 90);
	testOperator2("mod",  -80, 100, 20);
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
	test("divide 1 " + x1 + " / " + x2 + " = " + y, () => { expect(y).toBe("1.282352941176470588235294117647059"); });
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

{
	test_count = 0;
	testOperator2("scaleByPowerOfTen", "123456789", 1, "1234567890");
	testOperator2("scaleByPowerOfTen", "123456789", 0, "123456789");
	testOperator2("scaleByPowerOfTen", "123456789", -2, "1234567.89");
	testOperator2("scaleByPowerOfTen", "-123456789", 3, "-123456789000");
	testOperator2("scaleByPowerOfTen", "-123456789", 0, "-123456789");
	testOperator2("scaleByPowerOfTen", "-123456789", -4, "-12345.6789");
}

{
	test_count = 0;
	testBool("isZero", 1, false);
	testBool("isZero", 0, true);
	testBool("isZero", -1, false);
}

{
	test_count = 0;
	testBool("isOne", 1, true);
	testBool("isOne", 0, false);
	testBool("isOne", -1, false);
}

{
	test_count = 0;
	testBool("isPositive", 1, true);
	testBool("isPositive", 0, false);
	testBool("isPositive", -1, false);
}

{
	test_count = 0;
	testBool("isNegative", 1, false);
	testBool("isNegative", 0, false);
	testBool("isNegative", -1, true);
}

{
	test_count = 0;
	testBool("isNotNegative", 1, true);
	testBool("isNotNegative", 0, true);
	testBool("isNotNegative", -1, false);
}

{
	test_count = 0;
	testOperator1("round", 3.2, 3);
	testOperator1("round", 3.8, 4);
}

{
	test_count = 0;
	testOperator1("floor", 3.2, 3);
	testOperator1("floor", 3.8, 3);
	testOperator1("floor", -3.2, -4);
	testOperator1("floor", -3.8, -4);
}

{
	test_count = 0;
	testOperator1("ceil", 3.2, 4);
	testOperator1("ceil", 3.8, 4);
	testOperator1("ceil", -3.2, -3);
	testOperator1("ceil", -3.8, -3);
}

{
	test_count = 0;
	testOperator1("fix", 3.2, 3);
	testOperator1("fix", 3.8, 3);
	testOperator1("fix", -3.2, -3);
	testOperator1("fix", -3.8, -3);
}

{
	test_count = 0;
	testOperator1("fract", 3.2, 0.2);
	testOperator1("fract", 3.8, 0.8);
	testOperator1("fract", -3.2, 0.8);
	testOperator1("fract", -3.8, 0.2);
}

{
	test_count = 0;
	testOperator1("factorial", 20, "2432902008176640000");
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("inv", "2", "0.5", EPS);
	testOperator1("inv", "10", "0.1", EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("sqrt", "2", "1.41421356237", EPS);
	testOperator1("sqrt", "4", "2", EPS);
	testOperator1("sqrt", "1000000", "1000", EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("rsqrt", "2", 1.0 / Math.sqrt(2), EPS);
	testOperator1("rsqrt", "4", 0.5, EPS);
	testOperator1("rsqrt", "1000000", 0.001, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testCompareTo("PI", BigDecimal.PI, "3.14159265359", 0, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testCompareTo("E", BigDecimal.E, "2.71828182845904523536", 0, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("sin", -10,  0.54402111088, EPS);
	testOperator1("sin",  -1, -0.8414709848, EPS);
	testOperator1("sin",   0,  0, EPS);
	testOperator1("sin",   1,  0.8414709848, EPS);
	testOperator1("sin",  10, -0.54402111088, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("cos", -10, -0.83907152907, EPS);
	testOperator1("cos",  -1,  0.54030230586, EPS);
	testOperator1("cos",   0,  1, EPS);
	testOperator1("cos",   1,  0.54030230586, EPS);
	testOperator1("cos",  10, -0.83907152907, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("tan", -10, -0.64836082745, EPS);
	testOperator1("tan",  -1, -1.55740772465, EPS);
	testOperator1("tan",   0,  0, EPS);
	testOperator1("tan",   1,  1.55740772465, EPS);
	testOperator1("tan",  10,  0.64836082745, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator1("atan",  -10, -1.47112767, EPS);
	testOperator1("atan",   -1, -0.785398163, EPS);
	testOperator1("atan", -0.2, -0.19739556, EPS);
	testOperator1("atan",    0,  0, EPS);
	testOperator1("atan",  0.2,  0.19739556, EPS);
	testOperator1("atan",    1,  0.785398163, EPS);
	testOperator1("atan",   10,  1.47112767, EPS);
}

{
	const EPS = 1e-5;
	test_count = 0;
	testOperator2("atan2",   1, 2, 0.4636476090008061, EPS);
	testOperator2("atan2",   2, 1, 1.1071487177940904, EPS);
	testOperator2("atan2",  -1, 2,-0.4636476090008061, EPS);
	testOperator2("atan2",   2,-1, 2.0344439357957027, EPS);
	testOperator2("atan2",  -2,-1,-2.0344439357957027, EPS);
	testOperator2("atan2",   0, 1, 0, EPS);
	testOperator2("atan2",   1, 0, 1.5707963267948966, EPS);
	testOperator2("atan2",   0,-1, 3.141592653589793, EPS);
	testOperator2("atan2",  -1, 0,-1.5707963267948966, EPS);
}
