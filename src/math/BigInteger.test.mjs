/* global test, expect */

import Random from "./tools/Random.mjs";
import BigInteger from "./BigInteger.mjs";
const $ = BigInteger.create;

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

{
	test_count = 0;
	testEQ("new", "1000", 1000);
	testEQ("new", "-1000", -1000);
	testEQ("new", "123e10", 123e10);
	testEQ("new", "-123e10", -123e10);
	testEQ("new", "12.3e10", 12.3e10);
	testEQ("new", "-12.3e10", -12.3e10);
	testEQ("new", "12.3e10", "1.23e11");
	testEQ("new", "12300e-1", "123e+1");
	testEQ("new", "0x1234", 0x1234);
	testEQ("new", "-0x1234", -0x1234);
	testEQ("new", ["1234ffffff0000000000", 16], "85980274126460708454400");
	testEQ("new", "0x1234ffffff0000000000", "85980274126460708454400");
	testEQ("new", "0b101001000100001000000", "1345600");
}

{
	test_count = 0;
	testEQ("longValue", $(1234567890).longValue, 1234567890);
	testEQ("longValue", $(-1234567890).longValue, -1234567890);
}

{
	test_count = 0;
	testOperator2("add", "12345678", "12345678", "24691356");
	testOperator2("add", "12345678", "-1234", "12344444");
	testOperator2("add", "-1234", "12345678", "12344444");
	testOperator2("add", "-1234", "-1234", "-2468");
}

{
	test_count = 0;
	testOperator2("sub", "12345678", "12345678", "0");
	testOperator2("sub", "12345678", "-1234", "12346912");
	testOperator2("sub", "-1234", "12345678", "-12346912");
	testOperator2("sub", "-1234", "-1234", "0");
}

{
	test_count = 0;
	testOperator2("mul", "12345678", "-1234", "-15234566652");
}

{
	test_count = 0;
	testOperator2("div", "12345678", "-1234", "-10004");
	testOperator2("div", "-1234567890123456789012345678901234567890", "123456789012345678901", "-10000000000000000000");
}

{
	test("divideAndRemainder", () => {
		expect(
			$("-1234567890123456789012345678901234567890").divideAndRemainder($("123456789012345678901"))[1].equals($("-2345678901234567890"))
		).toBe(true);
	});
}

{
	test_count = 0;
	testOperator2("rem", "-1234567890123456789012345678901234567890", "123456789012345678901", "-2345678901234567890");
}

{
	test_count = 0;
	testOperator2("mod", "-1234567890123456789012345678901234567890", "123456789012345678901", "121111110111111111011");
}

{
	test_count = 0;
	testOperator1("toString", "0x1234", "4660");
	testOperator2("toString", "0x1234ffffff0000000000", 16, "1234ffffff0000000000");
	testOperator2("toString", "0x1234ffffff0000000000", 2, "10010001101001111111111111111111111110000000000000000000000000000000000000000");
}

{
	test_count = 0;
	testOperator1("bitCount", ["1234ffffff0000000000", 16], 29);
	testOperator1("bitCount", $(["1234ffffff0000000000", 16]).negate(), 68);
}

{
	test_count = 0;
	testOperator1("bitLength", ["1234ffffff0000000000", 16], 77);
	testOperator1("bitLength", $(["1234ffffff0000000000", 16]).negate(), 77);
}

{
	test_count = 0;
	testOperator1("getLowestSetBit", ["1234ffffff0000000000", 16], 40);
	testOperator1("getLowestSetBit", $(["1234ffffff0000000000", 16]).negate(), 40);
}

{
	test("shiftLeft, shiftRight", () => {
		const testFunction = function() {
			let x = BigInteger.ONE;
			for(let i = 0;i < 18; i++) {
				x = x.shiftLeft(1);
				const x_string_2 = x.toString(2);
				const x_len = x.bitLength();
				const x_lsb = x.getLowestSetBit();
				if(x_string_2 !== "100000000000000000000000".substr(0, 2 + i)) {
					return false;
				}
				if(x_len !== 2 + i) {
					return false;
				}
				if(x_lsb !== (x_len - 1)) {
					return false;
				}
			}
			for(let i = 0;i < 18; i++) {
				x = x.shiftRight(1);
				const x_string_2 = x.toString(2);
				const x_len = x.bitLength();
				const x_lsb = x.getLowestSetBit();
				if(x_string_2 !== "100000000000000000000000".substr(0, 18 - i)) {
					return false;
				}
				if(x_len !== 18 - i) {
					return false;
				}
				if(x_lsb !== (x_len - 1)) {
					return false;
				}
			}
			return true;
		};
		expect(testFunction()).toBe(true);
	});
	
	test("testBit", () => {
		const testFunction = function() {
			const binary_text = "101001000100001000000";
			const s1 = $([binary_text, 2]);
			const s2 = s1.bitLength();
			let output = "";
			for(let i = s2 - 1; i >= 0; i--) {
				output += s1.testBit(i) ? "1" : "0";
			}
			return output === binary_text;
		};
		expect(testFunction()).toBe(true);
	});

	test("setBit", () => {
		const testFunction = function() {
			const binary_text = "101001000100001000000";
			const s1 = $([binary_text, 2]);
			const s2 = s1.bitLength();
			let s3 = BigInteger.ZERO;
			for(let i = 0; i < s2; i++) {
				if(s1.testBit(i)) {
					s3 = s3.setBit(i);
				}
			}
			return s3.toString(2) === binary_text;
		};
		expect(testFunction()).toBe(true);
	});

	test("clearBit", () => {
		const testFunction = function() {
			const binary_text = "101001000100001000000";
			const s1 = $([binary_text, 2]);
			const s2 = s1.bitLength();
			let j = 0;
			for(let i = 0; i < s2; i++) {
				if(s1.testBit(i)) {
					j++;
					const clear = s1.clearBit(i).toString(2);
					if((j === 1) && (clear !== "101001000100000000000")) {
						return false;
					}
					else if((j === 2) && (clear !== "101001000000001000000")) {
						return false;
					}
					else if((j === 3) && (clear !== "101000000100001000000")) {
						return false;
					}
					else if((j === 4) && (clear !== "100001000100001000000")) {
						return false;
					}
					else if((j === 5) && (clear !== "1001000100001000000")) {
						return false;
					}
				}
			}
			return true;
		};
		expect(testFunction()).toBe(true);
	});

	test("flipBit", () => {
		const flip = function(text) {
			let s1 = $(text);
			const s2 = s1.bitLength();
			for(let i = 0; i < s2; i++) {
				s1 = s1.flipBit(i);
			}
			return s1;
		};
		expect(
			flip("0b101001000100001000000").equals($("0b10110111011110111111"))
		).toBe(true);
	});
}

{
	test_count = 0;
	testOperator2("and", "0x1234ffffff0000000000", $("0x1234ffffff0000000000").negate(), "0x10000000000");
	testOperator2("and", "0x1234ffffff0000000000", $("0x8765ffffff0000000000"), "0x224ffffff0000000000");
	testOperator2("and", $("0x1234ffffff0000000000").negate(), $("0x8765ffffff0000000000").negate(), "-0x9775ffffff0000000000");
}

{
	test_count = 0;
	testOperator2("or", "0x1234ffffff0000000000", $("0x1234ffffff0000000000").negate(), "-0x10000000000");
	testOperator2("or", "0x1234ffffff0000000000", $("0x8765ffffff0000000000"), "0x9775ffffff0000000000");
	testOperator2("or", $("0x1234ffffff0000000000").negate(), $("0x8765ffffff0000000000").negate(), "-0x224ffffff0000000000");
}

{
	test_count = 0;
	testOperator2("xor", 123, 456, 435);
	testOperator2("xor", "0x1234ffffff0000000000", $("0x1234ffffff0000000000").negate(), "-0x20000000000");
	testOperator2("xor", "0x1234ffffff0000000000", $("0x8765ffffff0000000000"), "0x95510000000000000000");
	testOperator2("xor", $("0x1234ffffff0000000000").negate(), $("0x8765ffffff0000000000").negate(), "0x95510000000000000000");
}

{
	test_count = 0;
	testOperator1("not", "0x1234ffffff0000000000", "-0x1234ffffff0000000001");
	testOperator1("not", $("0x1234ffffff0000000000").negate(), "0x1234fffffeffffffffff");
}

{
	test_count = 0;
	testOperator2("andNot", "0x1234ffffff0000000000", $("0x1234ffffff0000000000").negate(), "0x1234fffffe0000000000");
	testOperator2("andNot", "0x1234ffffff0000000000", $("0x8765ffffff0000000000"), "0x10100000000000000000");
	testOperator2("andNot", $("0x1234ffffff0000000000").negate(), $("0x8765ffffff0000000000").negate(), "0x85410000000000000000");
}

{
	test("intValue", () => {
		expect(
			$("0x3334342423423").intValue.toString(16) === "42423423"
		).toBe(true);
	});

	test("longValue", () => {
		expect(
			$("0x3334342423423").longValue.toString(16) === "3334342423423"
		).toBe(true);
	});

	test("doubleValue", () => {
		expect(
			$("0x1122334455").doubleValue === 0x1122334455
		).toBe(true);
	});
}

{
	BigInteger.setDefaultRandom(new Random(0));

	test("createRandomBigInteger", () => {
		expect(
			!BigInteger.createRandomBigInteger(50).equals(BigInteger.createRandomBigInteger(50))
		).toBe(true);
	});
	
	test("nextProbablePrime 1", () => {
		expect(
			$(100000).nextProbablePrime().longValue === 100003
		).toBe(true);
	});

	test("nextProbablePrime 2", () => {
		expect(
			$(100003).nextProbablePrime().longValue === 100019
		).toBe(true);
	});
	
	test("nextProbablePrime 3", () => {
		expect(
			$(100019).nextProbablePrime().longValue === 100043
		).toBe(true);
	});

	test("isProbablePrime 1", () => {
		expect(
			$("2147483647").isProbablePrime()
		).toBe(true);
	});

	test("isProbablePrime 2", () => {
		expect(
			$("826446446281").isProbablePrime()
		).toBe(false);
	});
	
	test("probablePrime", () => {
		expect(
			BigInteger.probablePrime(20).isProbablePrime()
		).toBe(true);
	});	
}

{
	test_count = 0;
	testOperator2("compareTo", 12345678, 1234567, 1);
	testOperator2("compareTo", 12345678, 12345678, 0);
	testOperator2("compareTo", 12345678, 123456789, -1);
}

{
	test_count = 0;
	testOperator2("gcd", 12, 18, 6);
	testOperator2("gcd", 18, 12, 6);
}

{
	test_count = 0;
	testEQ("extgcd", $(12).extgcd(7)[0], 3);
	testEQ("extgcd", $(12).extgcd(7)[1], -5);
	testEQ("extgcd", $(12).extgcd(7)[2], 1);
	testEQ("extgcd", $(12).extgcd(78)[0], -6);
	testEQ("extgcd", $(12).extgcd(78)[1], 1);
	testEQ("extgcd", $(12).extgcd(78)[2], 6);
}

{
	test_count = 0;
	testOperator2("lcm", 63, 30, 630);
}

{
	test_count = 0;
	testOperator2("pow", 2, 100, "0x10000000000000000000000000");
}

{
	test_count = 0;
	testOperator3("modPow", -324, 123, 55, 51);
	testOperator3("modPow", "14123999253219", "70276475859277", "86706662670157", "285102795107");
}

{
	test_count = 0;
	testOperator2("modInverse", 15, 4, 3);
	testOperator2("modInverse", 19, 41, 13);
}

{
	test_count = 0;
	testOperator1("factorial", 50, "0x49eebc961ed279b02b1ef4f28d19a84f5973a1d2c7800000000000");
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
	testOperator2("scaleByPowerOfTen", "123456789", 1, "1234567890");
	testOperator2("scaleByPowerOfTen", "123456789", 0, "123456789");
	testOperator2("scaleByPowerOfTen", "123456789", -2, "1234567");
	testOperator2("scaleByPowerOfTen", "-123456789", 3, "-123456789000");
	testOperator2("scaleByPowerOfTen", "-123456789", 0, "-123456789");
	testOperator2("scaleByPowerOfTen", "-123456789", -4, "-12345");
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



