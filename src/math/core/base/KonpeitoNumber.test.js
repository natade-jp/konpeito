import BigInteger from "../BigInteger.js";
import BigDecimal from "../BigDecimal.js";
import Fraction from "../Fraction.js";
import Complex from "../Complex.js";
import Matrix from "../Matrix.js";
import KonpeitoFloat from "./KonpeitoFloat.js";
import KonpeitoInteger from "./KonpeitoInteger.js";

let $ = BigInteger.create;
let class_name = "";
let test_count = 0;

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testEQString = function(operator, x, y) {
	test_count++;
	// @ts-ignore
	const X = $(x)[operator]();
	const testname = operator + " " + test_count + " $(" + x + ")." + operator + "===" + y;
	const out = X.toString() === y;
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} y 
 */
const testEQ = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = $(y);
	const testname = class_name + " " + test_count + " " + operator + " $(" + x + ")." + operator + "(" + y + ")";
	const out = ($(X).isNaN() && $(Y).isNaN()) ? true : $(X).equals(Y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} X
 * @param {*} y 
 */
const testStaticGet  = function(operator, X, y) {
	test_count++;
	// @ts-ignore
	const Y = X[operator];
	const testname = class_name + " " + test_count + " " + X.name + "." + operator + "= " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, 0.001);
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
	const testname = class_name + " " + test_count + " " + operator + " (" + x + ")." + operator + "() = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : Y === y;
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
	const testname = class_name + " " + test_count + " " + operator + " (" + x + ")." + operator + "() = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, 0.001);
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
	const testname = class_name + " " + test_count + " " + operator + " (" + x1 + ")." + operator + "(" + x2 + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * @param {*} operator 
 * @param {*} x 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} y 
 */
const testOperator3 = function(operator, x, p1, p2, y) {
	test_count++;
	const X = $(x);
	// @ts-ignore
	const Y = X[operator](p1, p2);
	const testname = class_name + " " + test_count + " " + operator + " (" + x + ")." + operator + "(" + p1 + ", " + p2 + ") = " + y + " === " + Y;
	const out = ($(Y).isNaN() && $(y).isNaN()) ? true : $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

/**
 * 実装されているか調べる
 * @param {typeof KonpeitoInteger} class_type 
 */
const testClass = function(class_type) {
	class_name = class_type.name;
	$ = class_type.create;
	test_count = 0;

	// Integer
	{
		testEQ("create", "1", 1);
		testEQ("valueOf", "1", 1);

		testOperator1("abs", -12, 12);
		testOperator1("negate", 12, -12);
		testOperator1("sign", 12, 1);

		testOperator2("add", 1, 2, 3);
		testOperator2("sub", 1, -2, 3);
		testOperator2("mul", 1, -2, -2);
		testOperator2("div", -2, 2, -1);
		testOperator1("inv", 2, 0.5);
		testOperator2("rem",-4, 5,-4);
		testOperator2("mod",-4, 5, 1);

		testOperator3("modPow", -324, 123, 55, 51);
		testOperator2("modInverse", 15, 4, 3);

		testOperator1("factorial", 4, 1*2*3*4);
		testOperator2("scaleByPowerOfTen", 3, 1, 30);

		testOperator2("pow", 2, 1, 2);
		testOperator1("square", 2, 4);

		testOperator1("round", 3.0, 3);
		testOperator1("floor", 3.2, 3);
		testOperator1("ceil", -3.2, -3);
		testOperator1("fix", -3.8, -3);
		testOperator1("fract", 3.0, 0.0);

		testEQString("factor", 13244, "2,2,7,11,43");
		
		testOperator2("gcd", 12, 18, 6);
		// extgcd 省略
		testOperator2("lcm", 63, 30, 630);

		testBool("isPrime", 37, true);
		testBool("isProbablePrime", 37, true);
		testOperator1("nextProbablePrime", 37, 41);

		testOperator2("shift", 1, 2, 1 << 2);
		testOperator2("and", 1, 2, 1 & 2);
		testOperator2("or", 1, 2, 1 | 2);
		testOperator2("xor", 1, 2, 1 ^ 2);
		// not 省略

		testBool("isZero", 1, false);
		testBool("isOne", 1, true);
		testBool("isPositive", -1, false);
		testBool("isNegative", 1, false);
		testBool("isNotNegative", -1, false);

		testBool("isNaN", NaN, true);
		testBool("isPositiveInfinity", Number.POSITIVE_INFINITY, true);
		testBool("isNegativeInfinity", Number.NEGATIVE_INFINITY, true);
		testBool("isInfinite", Number.NEGATIVE_INFINITY, true);
		testBool("isFinite", 100, true);

		testStaticGet("MINUS_ONE", class_type, -1);
		testStaticGet("ZERO", class_type, 0);
		testStaticGet("ONE", class_type, 1);
		testStaticGet("TWO", class_type, 2);
		testStaticGet("TEN", class_type, 10);
		testStaticGet("POSITIVE_INFINITY", class_type, Number.POSITIVE_INFINITY);
		testStaticGet("NEGATIVE_INFINITY", class_type, Number.NEGATIVE_INFINITY);
		testStaticGet("NaN", class_type, Number.NaN);

	}

	// Float
	if($(1) instanceof KonpeitoFloat) {
	
		testOperator1("sqrt", 4, 2);
		testOperator1("cbrt", 8, 2);
		testOperator1("rsqrt", 2, 1.0 / Math.sqrt(2));
		testOperator1("log", 7, Math.log(7));
		testOperator1("exp", 7, Math.exp(7));
		testOperator1("expm1", 7, Math.expm1(7));
		testOperator1("log1p", 7, Math.log1p(7));
		testOperator1("exp", 7, Math.exp(7));
		testOperator1("log2", 7, Math.log2(7));
		testOperator1("log10", 7, Math.log10(7));

		testOperator1("sin", 1.72, Math.sin(1.72));
		testOperator1("cos", 1.72, Math.cos(1.72));
		testOperator1("tan", 1.72, Math.tan(1.72));
		testOperator1("atan", 1.72, Math.atan(1.72));
		testOperator2("atan2", 1.72, 1.2, Math.atan2(1.72, 1.2));

		testOperator1("acos", 0.5, Math.acos(0.5));
		testOperator1("sinh", 0.5, Math.sinh(0.5));
		testOperator1("asinh", 0.5, Math.asinh(0.5));
		testOperator1("cosh", 0.5, Math.cosh(0.5));
		testOperator1("acosh", 5, Math.acosh(5));
		testOperator1("tanh", 0.5, Math.tanh(0.5));
		testOperator1("atanh", 0.5, Math.atanh(0.5));
		testOperator1("sec", 0.5, 1.13949392732455);
		testOperator1("asec", 5, 1.36943840600457);
		testOperator1("sech", 0.5, 0.886818883970074);
		testOperator1("asech", 0.5, 1.31695789692482);
		testOperator1("cot", 0.5, 1.83048772171245);
		testOperator1("acot", 0.5, 1.10714871779409);
		testOperator1("coth", 0.5, 2.16395341373865);
		testOperator1("acoth", 5, 0.202732554054082);
		testOperator1("csc", 0.5, 2.08582964293349);
		testOperator1("acsc", 5, 0.201357920790331);
		testOperator1("csch", 0.5, 1.91903475133494);
		testOperator1("acsch", 0.5, 1.44363547517881);
		testOperator1("sinc", 0, 1);

		testStaticGet("PI", class_type, Math.PI);
		testStaticGet("QUARTER_PI", class_type, Math.PI / 4);
		testStaticGet("HALF_PI", class_type, Math.PI / 2);
		testStaticGet("TWO_PI", class_type, Math.PI * 2);

		testStaticGet("E", class_type, Math.E);
		testStaticGet("LN2", class_type, Math.LN2);
		testStaticGet("LN10", class_type, Math.LN10);
		testStaticGet("LOG2E", class_type, Math.LOG2E);
		testStaticGet("LOG10E", class_type, Math.LOG10E);
		testStaticGet("SQRT2", class_type, Math.SQRT2);
		testStaticGet("SQRT1_2", class_type, Math.SQRT1_2);
		testStaticGet("HALF", class_type, 0.5);
	}

};

testClass(BigInteger);
testClass(BigDecimal);
testClass(Fraction);
testClass(Complex);
testClass(Matrix);


