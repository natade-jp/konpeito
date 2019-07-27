import Complex from "./Complex.mjs";
const $ = Complex.create;

let test_count = 0;

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

const testGet  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator];
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "= " + Y;
	const out = $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1  = function(operator, x, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const X = $(x);
	const Y = X[operator]();
	const Y_str = Y;
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + Y_str;
	const out = $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x, p, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const X = $(x);
	const Y = X[operator](p);
	const Y_str = Y;
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p + ") = " + Y_str;
	const out = $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x, p1, p2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const X = $(x);
	const Y = X[operator](p1, p2);
	const Y_str = Y;
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + Y_str;
	const out = $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1Bool  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + Y;
	const out = y === Y;
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testGet("real", "-3-1j", -3);
}

{
	test_count = 0;
	testGet("imag", "-3-1j", -1);
}

{
	test_count = 0;
	testGet("norm", "3", 3);
	testGet("norm", "-1j", 1);
	testGet("norm", "1-1j", 1.4142135623730951);
}

{
	test_count = 0;
	testGet("arg", "1", 0);
	testGet("arg", "-1", 3.141592653589793);
	testGet("arg", "j", 1.5707963267948966);
	testGet("arg", "1+j", 0.7853981633974483);
}

{
	test_count = 0;
	testOperator2("add", "1", "1", "2");
	testOperator2("add", "1", "j", "1 + 1i");
	testOperator2("add", "1 + 2j", "3 + 4j", "4 + 6i");
}

{
	test_count = 0;
	testOperator2("sub", "12", "312", "-300");
	testOperator2("sub", "4", "-3j", "4 + 3i");
	testOperator2("sub", "1 + 2j", "3 + 4j", "-2 - 2i");
}

{
	test_count = 0;
	testOperator2("mul", "12", "312", "3744");
	testOperator2("mul", "2j", "-3j", "6");
	testOperator2("mul", "1 - 2j", "-3 + 4j", "5 + 10i");
}

{
	test_count = 0;
	testOperator2("div", "3423", "312", "10.971");
	testOperator2("div", "2j", "-3j", "-0.66667");
	testOperator2("div", "10 - 20j", "-3 + 4j", "-4.4 + 0.8i");
}

{
	test_count = 0;
	testOperator2("dot", "3423", "312", "1067976");
	testOperator2("dot", "2j", "-3j", "-6");
	testOperator2("dot", "10 - 20j", "-3 + 4j", "-110 - 20i");
}

{
	test_count = 0;
	testOperator2("mod", "30.4", "2.5", "0.4");
	testOperator2("mod", "-30.4", "2.5", "2.1");
}

{
	test_count = 0;
	testOperator1("inv", "3423", "2.9214e-004");
	testOperator1("inv", "2j", "-0.5i");
	testOperator1("inv", "10 - 20j", "0.02 + 0.04i");
}

{
	test_count = 0;
	testOperator1("sign", "3423", "1");
	testOperator1("sign", "0", "0");
	testOperator1("sign", "-20", "-1");
	testOperator1("sign", "3i", "i");
	testOperator1("sign", "-42 - 23j", "-0.87710 - 0.48031i");
}

{
	test_count = 0;
	testOperator2("compareTo", "10", "5", "1");
	testOperator2("compareTo", "5", "5", "0");
	testOperator2("compareTo", "0", "5", "-1");
	testOperator2("compareTo", "10j", "5j", "1");
	testOperator2("compareTo", "5j", "5j", "0");
	testOperator2("compareTo", "3+3j", "3-3j", "1");
	testOperator2("compareTo", "-3+3j", "3-3j", "0");
}

{
	test_count = 0;
	testOperator1Bool("isInteger", "10", true);
	testOperator1Bool("isInteger", "10.1", false);
	testOperator1Bool("isInteger", "10j", false);
}

{
	test_count = 0;
	testOperator1Bool("isComplexInteger", "10", true);
	testOperator1Bool("isComplexInteger", "10.4", false);
	testOperator1Bool("isComplexInteger", "10j", true);
	testOperator1Bool("isComplexInteger", "10.1j", false);
}

{
	test_count = 0;
	testOperator1Bool("isZero", "-3j", false);
	testOperator1Bool("isZero", "0", true);
}

{
	test_count = 0;
	testOperator1Bool("isOne", "-1j", false);
	testOperator1Bool("isOne", "1", true);
}

{
	test_count = 0;
	testOperator1Bool("isComplex", "1", false);
	testOperator1Bool("isComplex", "1.2", false);
	testOperator1Bool("isComplex", "-1j", true);
	testOperator1Bool("isComplex", "4+6j", true);
}

{
	test_count = 0;
	testOperator1Bool("isReal", "1", true);
	testOperator1Bool("isReal", "1.2", true);
	testOperator1Bool("isReal", "-1j", false);
	testOperator1Bool("isReal", "4+6j", false);
}

{
	test_count = 0;
	testOperator1Bool("isNaN", NaN, true);
	testOperator1Bool("isNaN", "1.2", false);
	testOperator1Bool("isNaN", [3, NaN], true);
}

{
	test_count = 0;
	testOperator1Bool("isPositive", 0, false);
	testOperator1Bool("isPositive", 1, true);
}

{
	test_count = 0;
	testOperator1Bool("isNegative", 0, false);
	testOperator1Bool("isNegative", -1, true);
}

{
	test_count = 0;
	testOperator1Bool("isNotNegative", -1, false);
	testOperator1Bool("isNotNegative", 0, true);
	testOperator1Bool("isNotNegative", 1, true);
}

{
	test_count = 0;
	testOperator1Bool("isInfinite", Infinity, true);
	testOperator1Bool("isInfinite", "1.2", false);
	testOperator1Bool("isInfinite", [3, Infinity], true);
}

{
	test_count = 0;
	testOperator1Bool("isFinite", Infinity, false);
	testOperator1Bool("isFinite", "1.2", true);
	testOperator1Bool("isFinite", [3, NaN], false);
}

{
	test_count = 0;
	testOperator1("abs", "1+1j", "1.4142");
}

{
	test_count = 0;
	testOperator1("conj", "1+1j", "1-j");
}

{
	test_count = 0;
	testOperator1("negate", "1+1j", "-1-j");
}

{
	test_count = 0;
	testOperator1("log", "3", "1.0986");
	testOperator1("log", "-3", "1.0986 + 3.1416i");
	testOperator1("log", "3j", " 1.0986 + 1.5708i");
	testOperator1("log", "2+3j", "1.28247 + 0.98279i");
	testOperator1("log", "-3+2j", "1.2825 + 2.5536i");
}

{
	test_count = 0;
	testOperator1("exp", "3", "20.086");
	testOperator1("exp", "-3", "0.049787");
	testOperator1("exp", "3j", " -0.98999 + 0.14112i");
	testOperator1("exp", "2+3j", "-7.3151 + 1.0427i");
}

{
	test_count = 0;
	testOperator2("pow", "3", "5", "243");
	testOperator2("pow", "3", "5+j", "110.52 + 216.41i");
	testOperator2("pow", "-2", "0.5", "1.4142i");
	testOperator2("pow", "3+2j", "3", "-9 + 46i");
	testOperator2("pow", "-3+2j", "4-3j", "357595 + 30019.1j", 1);
}

{
	test_count = 0;
	testOperator1("square", "3", "9");
	testOperator1("square", "3j", "-9");
	testOperator1("square", "-1+3j", "-8-6i");
	testOperator1("square", "2-3j", "-5-12i");
}

{
	test_count = 0;
	testOperator1("sqrt", "3", "1.7321");
	testOperator1("sqrt", "3j", "1.2247 + 1.2247i");
	testOperator1("sqrt", "-1+3j", "1.0398 + 1.4426i");
	testOperator1("sqrt", "2-3j", "1.67415 - 0.89598i");
}

{
	test_count = 0;
	testOperator1("sin", "1.72", "0.98889");
	testOperator1("sin", "3.14", "0.0015927");
	testOperator1("sin", "0.4j", "0.41075i");
	testOperator1("sin", "-0.8+1.2j", "-1.2989 + 1.0517i");
	testOperator1("sin", "1.8-2.8j", "8.0369 + 1.8612i");
}

{
	test_count = 0;
	testOperator1("cos", "1.72", "-0.14865");
	testOperator1("cos", "3.14", "-1.00");
	testOperator1("cos", "0.4j", "1.0811");
	testOperator1("cos", "-0.8+1.2j", "1.2615 + 1.0828i");
	testOperator1("cos", "1.8-2.8j", "-1.8750 + 7.9777i");
}

{
	test_count = 0;
	testOperator1("tan", "1.72", "-6.6524");
	testOperator1("tan", "3.14", "-0.0015927");
	testOperator1("tan", "0.4j", "0.37995i");
	testOperator1("tan", "-0.8+1.2j", "-0.18083 + 0.98887i");
	testOperator1("tan", "1.8-2.8j", "-0.0032946 - 1.0066488i");
}

{
	test_count = 0;
	testOperator1("atan", "1.72", "1.0442");
	testOperator1("atan", "3.14", "1.2625");
	testOperator1("atan", "0.4j", "0.42365i");
	testOperator1("atan", "-0.8+1.2j", "-1.08227 + 0.52169i");
	testOperator1("atan", "1.8-2.8j", "1.39928 - 0.25093i");
}

{
	test_count = 0;
	testOperator2("atan2", "1.72", "1.2", "0.96163");
}

{
	test_count = 0;
	testOperator1("sinc", "1.72", "-0.14259");
	testOperator1("sinc", "0", "1");
	testOperator1("sinc", "0.4j", "1.2848");
	testOperator1("sinc", "-0.8+1.2j", "-1.6589 + 4.4892i");
	testOperator1("sinc", "1.8-0.8j", "-0.21369 - 0.97227i");
}

{
	test_count = 0;
	testOperator3("clip", "1.0", "1.5", "2.5", "1.5");
	testOperator3("clip", "2.0", "1.5", "2.5", "2.0");
	testOperator3("clip", "3.0", "1.5", "2.5", "2.5");
	testOperator3("clip", "-1.0", "-2.5", "-1.5", "-1.5");
	testOperator3("clip", "-2.0", "-2.5", "-1.5", "-2.0");
	testOperator3("clip", "-3.0", "-2.5", "-1.5", "-2.5");
	testOperator3("clip", "1.0j", "1.5j", "2.5j", "1.5j");
	testOperator3("clip", "2.0j", "1.5j", "2.5j", "2.0j");
	testOperator3("clip", "3.0j", "1.5j", "2.5j", "2.5j");
}

{
	test_count = 0;
	testOperator1("rsqrt", "2", 1.0 / Math.sqrt(2));
	testOperator1("rsqrt", "-2", "-0.70711i");
	testOperator1("rsqrt", "2i", "0.5 - 0.5i");
}

