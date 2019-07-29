// @ts-nocheck

import Fraction from "./Fraction.js";
const $ = Fraction.create;

let test_count = 0;

const testEQ = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = $(y);
	const testname = operator + " " + test_count + " $(" + x + ")." + operator + "(" + y + ")";
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
}

{
	test_count = 0;
	testOperator2("sub", 1, 2, -1);
	testOperator2("sub", 1, -2, 3);
	testOperator2("sub", -2, 2, -4);
	testOperator2("sub", 0.7, 0.3, 0.4);
	testOperator2("sub", "1/3", "2/3", "-1/3");
	testOperator2("sub", "1/2", "2/3", "-1/6");
}

{
	test_count = 0;
	testOperator2("mul", 1, 2, 2);
	testOperator2("mul", 1, -2, -2);
	testOperator2("mul", -2, 2, -4);
	testOperator2("mul", 0.7, 0.3, 0.21);
	testOperator2("mul", "1/3", "2/3", "2/9");
	testOperator2("mul", "1/2", "2/3", "1/3");
}

{
	test_count = 0;
	testOperator2("div", 1, 2, 0.5);
	testOperator2("div", 1, -2, -0.5);
	testOperator2("div", -2, 2, -1);
	testOperator2("div", 0.7, 0.3, "7/3");
	testOperator2("div", "1/3", "2/3", "3/6");
	testOperator2("div", "1/2", "2/3", "3/4");
}

{
	test_count = 0;
	testOperator1("inv", "1/2", "2/1");
}

{
	test_count = 0;
	testOperator2("mod", 3, 2.1, 0.9);
	testOperator2("mod", 5, 1.5, 0.5);
	testOperator2("mod", -3.3, 2, 0.7);
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
}

{
	test_count = 0;
	testOperator1("negate", 12.34, -12.34);
	testOperator1("negate", -12.34, 12.34);
}

{
	test_count = 0;
	testOperator1("sign", 12.34, 1);
	testOperator1("sign", 0, 0);
	testOperator1("sign", -12.34, -1);
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
