/* global test, expect */

import Complex from "./Complex.mjs";
const $ = Complex.create;

{
	const testString = [
		[ 10,	"10" ],
		[ [1, 3], "1 + 3i" ],
		[ "-20", "-20" ],
		[ "5 + 3j", "5 + 3i" ],
		[ "1000j", "1000i" ],
		[ "-10j + 3", "3 - 10i" ],
		[ "-10.1e5j + 3.4e7", "3.4e+7 - 1.01e+6i" ],
		[ "-199e7 + -20e2j", "-1.99e+9 - 2000i" ],
		[ "100000", "100000" ],
		[ "1000000", "1e+6" ],
		[ "100000j", "100000i" ],
		[ "1000000j", "1e+6i" ],
	];

	for(let i = 0; i < testString.length; i++) {
		const data = testString[i];
		const x = $(data[0]);
		const y = x.toString();
		const name = "string " + (i + 1) + " \"" + data[0] + "\" =>\t\"" + y + "\"";
		test(name,	() => {expect(y.toString()).toBe(data[1]);});
	}
}

{
	test("equals 1", () => { expect($("3+j").equals("3+j")).toBe(true); });
	test("equals 2", () => { expect($("3+j").equals("3+2j")).toBe(false); });
	test("equals 3", () => { expect($("3+j").equals("3+2j", 2)).toBe(true); });
}

const testGet  = function(operator, number, x1, y) {
	const cx1 = $(x1);
	const cy = cx1[operator];
	const testname = operator + " " + number + " " + operator + "(" + x1 + ") = " + cy;
	const out = $(y).equals(cy, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1  = function(operator, number, x1, y) {
	const cx1 = $(x1);
	const cy = cx1[operator]();
	const testname = operator + " " + number + " " + operator + "(" + x1 + ") = " + cy;
	const out = $(y).equals(cy, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, number, x1, x2, y, epsilon) {
	const tolerance = epsilon ? epsilon : 0.1;
	const cx1 = $(x1);
	const cx2 = $(x2);
	const cy = cx1[operator](cx2);
	const testname = operator + " " + number + " " + operator + "(" + x1 + "," + x2 + ") = " + cy;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1Bool  = function(operator, number, x1, y) {
	const cx1 = $(x1);
	const cy = cx1[operator]();
	const testname = operator + " " + number + " " + operator + "(" + x1 + ") = " + cy;
	const out = y === cy;
	test(testname, () => { expect(out).toBe(true); });
};


{
	testGet("real", 1, "-3-1j", -3);
	testGet("imag", 1, "-3-1j", -1);
}
{
	testGet("norm", 1, "3", 3);
	testGet("norm", 2, "-1j", 1);
	testGet("norm", 3, "1-1j", 1.4142135623730951);
}
{
	testGet("arg", 1, "1", 0);
	testGet("arg", 2, "-1", 3.141592653589793);
	testGet("arg", 3, "j", 1.5707963267948966);
	testGet("arg", 4, "1+j", 0.7853981633974483);
}
{
	testOperator2("add", 1, "1", "1", "2");
	testOperator2("add", 2, "1", "j", "1 + 1i");
	testOperator2("add", 3, "1 + 2j", "3 + 4j", "4 + 6i");
}
{
	testOperator2("sub", 1, "12", "312", "-300");
	testOperator2("sub", 2, "4", "-3j", "4 + 3i");
	testOperator2("sub", 3, "1 + 2j", "3 + 4j", "-2 - 2i");
}
{
	testOperator2("mul", 1, "12", "312", "3744");
	testOperator2("mul", 2, "2j", "-3j", "6");
	testOperator2("mul", 3, "1 - 2j", "-3 + 4j", "5 + 10i");
}
{
	testOperator2("div", 1, "3423", "312", "10.971");
	testOperator2("div", 2, "2j", "-3j", "-0.66667");
	testOperator2("div", 3, "10 - 20j", "-3 + 4j", "-4.4 + 0.8i");
}
{
	testOperator2("dot", 1, "3423", "312", "1067976");
	testOperator2("dot", 2, "2j", "-3j", "-6");
	testOperator2("dot", 3, "10 - 20j", "-3 + 4j", "-110 - 20i");
}
{
	testOperator2("mod", 1, "30.4", "2.5", "0.4");
	testOperator2("mod", 2, "-30.4", "2.5", "2.1");
}
{
	testOperator1("inv", 1, "3423", "2.9214e-004");
	testOperator1("inv", 2, "2j", "-0.5i");
	testOperator1("inv", 3, "10 - 20j", "0.02 + 0.04i");
}
{
	testOperator1("sign", 1, "3423", "1");
	testOperator1("sign", 2, "0", "0");
	testOperator1("sign", 3, "-20", "-1");
	testOperator1("sign", 4, "3i", "i");
	testOperator1("sign", 5, "-42 - 23j", "-0.87710 - 0.48031i");
}
{
	testOperator2("compareTo", 1, "10", "5", "1");
	testOperator2("compareTo", 2, "5", "5", "0");
	testOperator2("compareTo", 3, "0", "5", "-1");
	testOperator2("compareTo", 4, "10j", "5j", "1");
	testOperator2("compareTo", 5, "5j", "5j", "0");
	testOperator2("compareTo", 6, "3+3j", "3-3j", "1");
	testOperator2("compareTo", 7, "-3+3j", "3-3j", "0");
}
{
	testOperator1Bool("isInteger", 1, "10", true);
	testOperator1Bool("isInteger", 2, "10.1", false);
	testOperator1Bool("isInteger", 3, "10j", false);
	testOperator1Bool("isComplexInteger", 1, "10", true);
	testOperator1Bool("isComplexInteger", 2, "10.4", false);
	testOperator1Bool("isComplexInteger", 3, "10j", true);
	testOperator1Bool("isComplexInteger", 4, "10.1j", false);
	testOperator1Bool("isZero", 1, "-3j", false);
	testOperator1Bool("isZero", 2, "0", true);
	testOperator1Bool("isOne", 1, "-1j", false);
	testOperator1Bool("isOne", 2, "1", true);
	testOperator1Bool("isComplex", 1, "1", false);
	testOperator1Bool("isComplex", 2, "1.2", false);
	testOperator1Bool("isComplex", 3, "-1j", true);
	testOperator1Bool("isComplex", 4, "4+6j", true);
	testOperator1Bool("isReal", 1, "1", true);
	testOperator1Bool("isReal", 2, "1.2", true);
	testOperator1Bool("isReal", 3, "-1j", false);
	testOperator1Bool("isReal", 4, "4+6j", false);
	testOperator1Bool("isNaN", 1, NaN, true);
	testOperator1Bool("isNaN", 2, "1.2", false);
	testOperator1Bool("isNaN", 3, [3, NaN], true);
	testOperator1Bool("isPositive", 1, 0, false);
	testOperator1Bool("isPositive", 2, 1, true);
	testOperator1Bool("isNegative", 1, 0, false);
	testOperator1Bool("isNegative", 2, -1, true);
	testOperator1Bool("isNotNegative", 1, -1, false);
	testOperator1Bool("isNotNegative", 2, 0, true);
	testOperator1Bool("isNotNegative", 3, 1, true);
	testOperator1Bool("isInfinite", 1, Infinity, true);
	testOperator1Bool("isInfinite", 2, "1.2", false);
	testOperator1Bool("isInfinite", 3, [3, Infinity], true);
	testOperator1Bool("isFinite", 1, Infinity, false);
	testOperator1Bool("isFinite", 2, "1.2", true);
	testOperator1Bool("isFinite", 3, [3, NaN], false);
}
{
	testOperator1("abs", 1, "1+1j", "1.4142");
	testOperator1("conj", 1, "1+1j", "1-j");
	testOperator1("negate", 1, "1+1j", "-1-j");
}
{
	testOperator1("log", 1, "3", "1.0986");
	testOperator1("log", 2, "-3", "1.0986 + 3.1416i");
	testOperator1("log", 3, "3j", " 1.0986 + 1.5708i");
	testOperator1("log", 4, "2+3j", "1.28247 + 0.98279i");
	testOperator1("log", 5, "-3+2j", "1.2825 + 2.5536i");
}
{
	testOperator1("exp", 1, "3", "20.086");
	testOperator1("exp", 2, "-3", "0.049787");
	testOperator1("exp", 3, "3j", " -0.98999 + 0.14112i");
	testOperator1("exp", 4, "2+3j", "-7.3151 + 1.0427i");
}
{
	testOperator2("pow", 1, "3", "5", "243");
	testOperator2("pow", 2, "3", "5+j", "110.52 + 216.41i");
	testOperator2("pow", 3, "-2", "0.5", "1.4142i");
	testOperator2("pow", 4, "3+2j", "3", "-9 + 46i");
	testOperator2("pow", 5, "-3+2j", "4-3j", "357595 + 30019.1j", 1);
}
{
	testOperator1("square", 1, "3", "9");
	testOperator1("square", 2, "3j", "-9");
	testOperator1("square", 3, "-1+3j", "-8-6i");
	testOperator1("square", 4, "2-3j", "-5-12i");
}
{
	testOperator1("sqrt", 1, "3", "1.7321");
	testOperator1("sqrt", 2, "3j", "1.2247 + 1.2247i");
	testOperator1("sqrt", 3, "-1+3j", "1.0398 + 1.4426i");
	testOperator1("sqrt", 4, "2-3j", "1.67415 - 0.89598i");
}
{
	testOperator1("sin", 1, "1.72", "0.98889");
	testOperator1("sin", 2, "3.14", "0.0015927");
	testOperator1("sin", 3, "0.4j", "0.41075i");
	testOperator1("sin", 4, "-0.8+1.2j", "-1.2989 + 1.0517i");
	testOperator1("sin", 5, "1.8-2.8j", "8.0369 + 1.8612i");
}
{
	testOperator1("cos", 1, "1.72", "-0.14865");
	testOperator1("cos", 2, "3.14", "-1.00");
	testOperator1("cos", 3, "0.4j", "1.0811");
	testOperator1("cos", 4, "-0.8+1.2j", "1.2615 + 1.0828i");
	testOperator1("cos", 5, "1.8-2.8j", "-1.8750 + 7.9777i");
}
{
	testOperator1("tan", 1, "1.72", "-6.6524");
	testOperator1("tan", 2, "3.14", "-0.0015927");
	testOperator1("tan", 3, "0.4j", "0.37995i");
	testOperator1("tan", 4, "-0.8+1.2j", "-0.18083 + 0.98887i");
	testOperator1("tan", 5, "1.8-2.8j", "-0.0032946 - 1.0066488i");
}
{
	testOperator1("atan", 1, "1.72", "1.0442");
	testOperator1("atan", 2, "3.14", "1.2625");
	testOperator1("atan", 3, "0.4j", "0.42365i");
	testOperator1("atan", 4, "-0.8+1.2j", "-1.08227 + 0.52169i");
	testOperator1("atan", 5, "1.8-2.8j", "1.39928 - 0.25093i");
}
{
	testOperator2("atan2", 1, "1.72", "1.2", "0.96163");
}
{
	testOperator1("sinc", 1, "1.72", "-0.14259");
	testOperator1("sinc", 2, "0", "1");
	testOperator1("sinc", 3, "0.4j", "1.2848");
	testOperator1("sinc", 4, "-0.8+1.2j", "-1.6589 + 4.4892i");
	testOperator1("sinc", 5, "1.8-0.8j", "-0.21369 - 0.97227i");
}
