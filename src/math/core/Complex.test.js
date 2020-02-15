import Complex from "./Complex.js";
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

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testGet  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator];
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "= " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 * @param {*} [tolerance]
 */
const testOperator1  = function(operator, x, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance !== undefined ? tolerance : 0.1;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} p 
 * @param {*} y 
 * @param {*} [tolerance]
 */
const testOperator2  = function(operator, x, p, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance !== undefined ? tolerance : 0.1;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator](p);
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} y 
 * @param {*} [tolerance]
 */
const testOperator3  = function(operator, x, p1, p2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator](p1, p2);
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testOperator1Bool  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y + " === " + Y;
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
	testOperator2("rem", 110, 100, 10);
	testOperator2("rem",  80, 100, 80);
	testOperator2("rem",-110, 100,-10);
	testOperator2("rem", -80, 100,-80);
	testOperator2("rem", 4, 3, 1);
	testOperator2("rem", 4,-3, 1);
	testOperator2("rem",-4, 3,-1);
	testOperator2("rem",-4,-3,-1);
	testOperator2("rem", 4, 5, 4);
	testOperator2("rem", 4,-5, 4);
	testOperator2("rem",-4, 5,-4);
	testOperator2("rem",-4,-5,-4);
	testOperator2("rem", 0, 0, NaN);
	testOperator2("rem", 100, 0, NaN);
	testOperator2("rem", Infinity, 0, NaN);
	testOperator2("rem", -Infinity, 0, NaN);
	testOperator2("rem", Infinity, 100, NaN);
	testOperator2("rem", Infinity, -100, NaN);
	testOperator2("rem", 100, Infinity, NaN);
	testOperator2("rem", -100, Infinity, NaN);
	testOperator2("rem", Infinity, Infinity, NaN);
	testOperator2("rem", -Infinity, -Infinity, NaN);
	testOperator2("rem", 0, -Infinity, NaN);
	testOperator2("rem", NaN, 0, NaN);
	testOperator2("rem", Infinity, NaN, NaN);
}

{
	test_count = 0;
	testOperator2("mod", "30.4", "2.5", "0.4");
	testOperator2("mod", "-30.4", "2.5", "2.1");
	testOperator2("mod", 4, 3, 1);
	testOperator2("mod", 4,-3,-2);
	testOperator2("mod",-4, 3, 2);
	testOperator2("mod",-4,-3,-1);
	testOperator2("mod", 4, 5, 4);
	testOperator2("mod", 4,-5,-1);
	testOperator2("mod",-4, 5, 1);
	testOperator2("mod",-4,-5,-4);
	testOperator2("mod", 0, 0, 0);
	testOperator2("mod", 0, 0, 0);
	testOperator2("mod", 100, 0, 100);
	testOperator2("mod", Infinity, 0, Infinity);
	testOperator2("mod", -Infinity, 0, -Infinity);
	testOperator2("mod", Infinity, 100, NaN);
	testOperator2("mod", Infinity, -100, NaN);
	testOperator2("mod", 100, Infinity, NaN);
	testOperator2("mod", -100, Infinity, NaN);
	testOperator2("mod", Infinity, Infinity, NaN);
	testOperator2("mod", -Infinity, -Infinity, NaN);
	testOperator2("mod", 0, -Infinity, NaN);
	testOperator2("mod", NaN, 0, NaN);
	testOperator2("mod", Infinity, NaN, NaN);
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
	testOperator1("asin", -Infinity, NaN);
	testOperator1("asin",   -5, "-1.5708 + 2.2924i");
	testOperator1("asin", -0.5, -0.523598775598299);
	testOperator1("asin",    0,  0);
	testOperator1("asin",  0.5,  0.523598775598299);
	testOperator1("asin",    5, "1.5708 - 2.2924i");
	testOperator1("asin", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("acos", -Infinity, NaN);
	testOperator1("acos",   -5, "3.1416 - 2.2924i");
	testOperator1("acos", -0.5, 2.09439510239320);
	testOperator1("acos",    0, 1.57079632679490);
	testOperator1("acos",  0.5, 1.04719755119660);
	testOperator1("acos",    5, "2.29243i");
	testOperator1("acos", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("sinh", -Infinity, -Infinity);
	testOperator1("sinh",   -5, -74.2032105777888);
	testOperator1("sinh", -0.5, -0.521095305493747);
	testOperator1("sinh",    0,  0);
	testOperator1("sinh",  0.5,  0.521095305493747);
	testOperator1("sinh",    5,  74.2032105777888);
	testOperator1("sinh", Infinity, Infinity);
}

{
	test_count = 0;
	testOperator1("asinh", -Infinity, -Infinity);
	testOperator1("asinh",   -5, -2.31243834127275);
	testOperator1("asinh", -0.5, -0.481211825059603);
	testOperator1("asinh",    0,  0);
	testOperator1("asinh",  0.5,  0.481211825059603);
	testOperator1("asinh",    5,  2.31243834127275, 1);
	testOperator1("asinh", Infinity, Infinity);
}

{
	test_count = 0;
	testOperator1("cosh", -Infinity, Infinity);
	testOperator1("cosh",   -5, 74.2099485247878);
	testOperator1("cosh", -0.5,  1.12762596520638);
	testOperator1("cosh",    0,  1);
	testOperator1("cosh",  0.5,  1.12762596520638);
	testOperator1("cosh",    5, 74.2099485247878);
	testOperator1("cosh", Infinity, Infinity);
}

{
	test_count = 0;
//	testOperator1("acosh", -Infinity, NaN);
	testOperator1("acosh",   -5,  "2.2924 + 3.1416i");
	testOperator1("acosh", -0.5,  "1.1102e-016 - 2.0944e+000i");
	testOperator1("acosh",    0,  "1.57080i");
	testOperator1("acosh",  0.5,  "1.1102e-016 - 1.0472e+000i");
	testOperator1("acosh",    5,  2.29243166956118, 1);
//	testOperator1("acosh", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("tanh", -Infinity, -1);
	testOperator1("tanh",   -5, -0.999909204262595);
	testOperator1("tanh", -0.5, -0.462117157260010);
	testOperator1("tanh",    0,  0);
	testOperator1("tanh",  0.5,  0.462117157260010);
	testOperator1("tanh",    5,  0.999909204262595);
	testOperator1("tanh", Infinity, 1);
}

{
	test_count = 0;
	testOperator1("atanh", -Infinity, "1.57080i");
	testOperator1("atanh",   -5,  "-0.20273 + 1.57080i");
	testOperator1("atanh",   -1,  -Infinity);
	testOperator1("atanh", -0.5, -0.549306144334055);
	testOperator1("atanh",    0,  0);
	testOperator1("atanh",  0.5,  0.549306144334055);
	testOperator1("atanh",    1,  Infinity);
	testOperator1("atanh",    5,  "0.20273 + 1.57080i");
	testOperator1("atanh", Infinity, "1.57080i");
}

{
	test_count = 0;
	testOperator1("sec", -Infinity, NaN);
	testOperator1("sec",   -5,  3.52532008581609);
	testOperator1("sec", -0.5,  1.13949392732455);
	testOperator1("sec",    0,  1);
	testOperator1("sec",  0.5,  1.13949392732455);
	testOperator1("sec",    5,  3.52532008581609);
	testOperator1("sec", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("asec", -Infinity, 1.57079632679490);
	testOperator1("asec",   -5,  1.77215424758523);
	testOperator1("asec", -0.5,  "3.1416 - 1.3170i");
//	testOperator1("asec",    0,  NaN);
	testOperator1("asec",  0.5,  "1.31696i");
	testOperator1("asec",    5,  1.36943840600457);
	testOperator1("asec", Infinity, 1.57079632679490);
}

{
	test_count = 0;
	testOperator1("sech", -Infinity, 0);
	testOperator1("sech",   -5,  0.0134752822213046);
	testOperator1("sech", -0.5,  0.886818883970074);
	testOperator1("sech",    0,  1);
	testOperator1("sech",  0.5,  0.886818883970074);
	testOperator1("sech",    5,  0.0134752822213046);
	testOperator1("sech", Infinity, 0);
}

{
	test_count = 0;
	testOperator1("asech", -Infinity, "1.57080i");
	testOperator1("asech",   -5,  "1.77215i");
	testOperator1("asech", -0.5,  "1.3170 + 3.1416i");
//	testOperator1("asech",    0,  NaN);
	testOperator1("asech",  0.5,  1.31695789692482);
	testOperator1("asech",    1,  0.0);
	testOperator1("asech",    5,  "1.36944i");
	testOperator1("asech", Infinity, "1.57080i");
}

{
	test_count = 0;
	testOperator1("cot", -Infinity, NaN);
	testOperator1("cot",   -5,  0.295812915532746);
	testOperator1("cot", -0.5, -1.83048772171245);
	testOperator1("cot",    0,  Infinity);
	testOperator1("cot",  0.5,  1.83048772171245);
	testOperator1("cot",    5, -0.295812915532746);
	testOperator1("cot", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("acot", -Infinity, 0);
	testOperator1("acot",   -5, -0.197395559849881);
	testOperator1("acot", -0.5, -1.10714871779409);
	testOperator1("acot",    0,  1.57079632679490);
	testOperator1("acot",  0.5,  1.10714871779409);
	testOperator1("acot",    5,  0.197395559849881);
	testOperator1("acot", Infinity, 0);
}

{
	test_count = 0;
	testOperator1("coth", -Infinity, -1);
	testOperator1("coth",   -5, -1.00009080398202);
	testOperator1("coth", -0.5, -2.16395341373865);
	testOperator1("coth",    0,  Infinity);
	testOperator1("coth",  0.5,  2.16395341373865);
	testOperator1("coth",    5,  1.00009080398202);
	testOperator1("coth", Infinity, 1);
}

{
	test_count = 0;
	testOperator1("acoth", -Infinity, 0);
	testOperator1("acoth",   -5, -0.202732554054082);
	testOperator1("acoth", -0.5,  " -0.54931 + 1.57080i");
	testOperator1("acoth",    0,  " 1.57080i");
	testOperator1("acoth",  0.5,  " 0.54931 + 1.57080i");
	testOperator1("acoth",    5,  0.202732554054082);
	testOperator1("acoth", Infinity, 0);
}

{
	test_count = 0;
	testOperator1("csc", -Infinity, NaN);
	testOperator1("csc",   -5,  1.04283521277141);
	testOperator1("csc", -0.5, -2.08582964293349);
	testOperator1("csc",    0,  Infinity);
	testOperator1("csc",  0.5,  2.08582964293349);
	testOperator1("csc",    5, -1.04283521277141);
	testOperator1("csc", Infinity, NaN);
}

{
	test_count = 0;
	testOperator1("acsc", -Infinity, 0);
	testOperator1("acsc",   -5, -0.201357920790331);
	testOperator1("acsc", -0.5,  "-1.5708 + 1.3170i");
	testOperator1("acsc",    0,  NaN);
	testOperator1("acsc",  0.5,  "1.5708 - 1.3170i");
	testOperator1("acsc",    5,  0.201357920790331);
	testOperator1("acsc", Infinity, 0);
}

{
	test_count = 0;
	testOperator1("csch", -Infinity, 0);
	testOperator1("csch",   -5, -0.0134765058305891);
	testOperator1("csch", -0.5, -1.91903475133494);
	testOperator1("csch",    0,  Infinity);
	testOperator1("csch",  0.5,  1.91903475133494);
	testOperator1("csch",    5,  0.0134765058305891);
	testOperator1("csch", Infinity, 0);
}

{
	test_count = 0;
	testOperator1("acsch", -Infinity, 0);
	testOperator1("acsch",   -5, -0.198690110349241);
	testOperator1("acsch", -0.5, -1.44363547517881);
	testOperator1("acsch",    0,  Infinity);
	testOperator1("acsch",  0.5,  1.44363547517881);
	testOperator1("acsch",    5,  0.198690110349241);
	testOperator1("acsch", Infinity, 0);
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

