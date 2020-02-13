import Fraction from "./Fraction.js";
const $ = Fraction.create;

let test_count = 0;

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testEQ = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = $(y);
	const testname = operator + " " + test_count + " $(" + x + ")." + operator + "(" + y + ")";
	const out = ($(X).isNaN() && $(Y).isNaN()) ? true : $(X).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testBool = function(operator, x, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y;
	const out = Y === y;
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testOperator1  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator]();
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "() = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x1 
 * @param {*} x2 
 * @param {*} y 
 */
const testOperator2  = function(operator, x1, x2, y) {
	test_count++;
	const X1 = $(x1);
	const X2 = $(x2);
	// @ts-ignore
	const Y = X1[operator](X2);
	const testname = operator + " " + test_count + " (" + x1 + ")." + operator + "(" + x2 + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} y 
 */
const testOperator3  = function(operator, x, p1, p2, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator](p1, p2);
	const testname = operator + " " + test_count + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y);
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testEQ("create", "-1", -1);
	testEQ("create", "0", 0);
	testEQ("create", "1", 1);
	testEQ("create", "100", 100);
	testEQ("create", "1e2", 100);
	testEQ("create", "1000e-1", 100);
	testEQ("create", "12.3", 12.3);
	testEQ("create", "0.5", "1/2");
	testEQ("create", "1.5", "3/2");
	testEQ("create", "0.(3)", "1/3");
	testEQ("create", "0.[3]", "1/3");
	testEQ("create", "0.'3'", "1/3");
	testEQ("create", "0.\"3\"", "1/3");
	testEQ("create", "-0.5", "-1/2");
	testEQ("create", "-1.5", "-3/2");
	testEQ("create", "-0.(3)", "-1/3");
	testEQ("create", "-0.[3]", "-1/3");
	testEQ("create", "-0.'3'", "-1/3");
	testEQ("create", "-0.\"3\"", "-1/3");
	testEQ("create", "-1/2", "1/-2");
}

{
	test_count = 0;
	testOperator2("add", 1, 2, 3);
	testOperator2("add", 1, -2, -1);
	testOperator2("add", -2, 2, 0);
	testOperator2("add", 0.7, 0.3, 1);
	testOperator2("add", "1/3", "2/3", 1);
	testOperator2("add", "1/2", "2/3", "7/6");
	testOperator2("add", Infinity, 100, Infinity);
	testOperator2("add", -Infinity, 0, -Infinity);
	testOperator2("add", 0, Infinity, Infinity);
	testOperator2("add", -100, -Infinity, -Infinity);
	testOperator2("add", Infinity, -Infinity, NaN);
	testOperator2("add", -Infinity, Infinity, NaN);
	testOperator2("add", Infinity, NaN, NaN);
}

{
	test_count = 0;
	testOperator2("sub", 1, 2, -1);
	testOperator2("sub", 1, -2, 3);
	testOperator2("sub", -2, 2, -4);
	testOperator2("sub", 0.7, 0.3, 0.4);
	testOperator2("sub", "1/3", "2/3", "-1/3");
	testOperator2("sub", "1/2", "2/3", "-1/6");
	testOperator2("sub", Infinity, 100, Infinity);
	testOperator2("sub", -Infinity, 0, -Infinity);
	testOperator2("sub", 0, Infinity, -Infinity);
	testOperator2("sub", -100, -Infinity, Infinity);
	testOperator2("sub", Infinity, -Infinity, Infinity);
	testOperator2("sub", -Infinity, Infinity, -Infinity);
	testOperator2("sub", Infinity, NaN, NaN);
}

{
	test_count = 0;
	testOperator2("mul", 1, 2, 2);
	testOperator2("mul", 1, -2, -2);
	testOperator2("mul", -2, 2, -4);
	testOperator2("mul", 0.7, 0.3, 0.21);
	testOperator2("mul", "1/3", "2/3", "2/9");
	testOperator2("mul", "1/2", "2/3", "1/3");
	testOperator2("mul", Infinity, 100, Infinity);
	testOperator2("mul", Infinity, -100, -Infinity);
	testOperator2("mul", 100, Infinity, Infinity);
	testOperator2("mul", -100, Infinity, -Infinity);
	testOperator2("mul", Infinity, Infinity, Infinity);
	testOperator2("mul", -Infinity, -Infinity, Infinity);
	testOperator2("mul", Infinity, 0, NaN);
	testOperator2("mul", 0, -Infinity, NaN);
	testOperator2("mul", NaN, 0, NaN);
	testOperator2("mul", Infinity, NaN, NaN);
}

{
	test_count = 0;
	testOperator2("div", 1, 2, 0.5);
	testOperator2("div", 1, -2, -0.5);
	testOperator2("div", -2, 2, -1);
	testOperator2("div", 0.7, 0.3, "7/3");
	testOperator2("div", "1/3", "2/3", "3/6");
	testOperator2("div", "1/2", "2/3", "3/4");
	testOperator2("div", 100, 0, Infinity);
	testOperator2("div", -100, 0, -Infinity);
	testOperator2("div", 0, 0, NaN);
	testOperator2("div", Infinity, 100, Infinity);
	testOperator2("div", Infinity, -100, -Infinity);
	testOperator2("div", 100, Infinity, 0);
	testOperator2("div", -100, Infinity, 0);
	testOperator2("div", Infinity, Infinity, NaN);
	testOperator2("div", -Infinity, -Infinity, NaN);
	testOperator2("div", Infinity, 0, Infinity);
	testOperator2("div", 0, -Infinity, 0);
	testOperator2("div", NaN, 0, NaN);
	testOperator2("div", Infinity, NaN, NaN);
}

{
	test_count = 0;
	testOperator1("inv", "1/2", "2/1");
	testOperator1("inv", 0, NaN);
	testOperator1("inv", NaN, NaN);
	testOperator1("inv", Infinity, 0);
	testOperator1("inv", -Infinity, 0);
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
	testOperator2("mod", 3, 2.1, 0.9);
	testOperator2("mod", 5, 1.5, 0.5);
	testOperator2("mod", -3.3, 2, 0.7);
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
	testOperator2("scaleByPowerOfTen", "1/3", 1, "10/3");
	testOperator2("scaleByPowerOfTen", "1/3", 0, "1/3");
	testOperator2("scaleByPowerOfTen", "1/3", -1, "1/30");
}

{
	test_count = 0;
	testOperator2("pow", 3, 0, 1);
	testOperator2("pow", 3, 3, 27);
	testOperator2("pow", "2/3", 2, "4/9");
	testOperator2("pow", 2, 0, 1);
	testOperator2("pow", 2, 1, 2);
	testOperator2("pow", 2, 2, 4);
	testOperator2("pow",-2, 0, 1);
	testOperator2("pow",-2, 1,-2);
	testOperator2("pow",-2, 2, 4);
	testOperator2("pow", Infinity, 0, 1);
	testOperator2("pow", Infinity, 1, Infinity);
	testOperator2("pow", -Infinity, 2, Infinity);
	testOperator2("pow", -Infinity, 3, -Infinity);
	testOperator2("pow", -1, Infinity, NaN);
	testOperator2("pow", 0.5, Infinity, 0);
	testOperator2("pow", 1.2, Infinity, Infinity);
	testOperator2("pow", 0.5, -Infinity, Infinity);
	testOperator2("pow", 1.2, -Infinity, 0);
}

{
	test_count = 0;
	testOperator2("max", 1, 2, 2);
	testOperator2("max", 2, 1, 2);
}

{
	test_count = 0;
	testOperator2("min", 1, 2, 1);
	testOperator2("min", 2, 1, 1);
}

{
	test_count = 0;
	testOperator3("clip", "10", "15", "25", "15");
	testOperator3("clip", "20", "15", "25", "20");
	testOperator3("clip", "30", "15", "25", "25");
	testOperator3("clip", "-10", "-25", "-15", "-15");
	testOperator3("clip", "-20", "-25", "-15", "-20");
	testOperator3("clip", "-30", "-25", "-15", "-25");
}

{
	test_count = 0;
	testOperator1("abs", 12.34, 12.34);
	testOperator1("abs", -12.34, 12.34);
	testOperator1("abs",  Infinity, Infinity);
	testOperator1("abs", -Infinity, Infinity);
	testOperator1("abs", NaN, NaN);
}

{
	test_count = 0;
	testOperator1("negate", 12.34, -12.34);
	testOperator1("negate", -12.34, 12.34);
	testOperator1("negate",  Infinity, -Infinity);
	testOperator1("negate", -Infinity,  Infinity);
	testOperator1("negate", NaN, NaN);
}

{
	test_count = 0;
	testOperator1("sign", 12.34, 1);
	testOperator1("sign", 0, 0);
	testOperator1("sign", -12.34, -1);
	testOperator1("sign", Infinity, 1);
	testOperator1("sign", -Infinity, -1);
	testOperator1("sign", NaN, NaN);
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
