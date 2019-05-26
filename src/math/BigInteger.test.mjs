/* global test, expect */

import Random from "./tools/Random.mjs";
import BigInteger from "./BigInteger.mjs";
const $ = BigInteger.create;

{
	test("add 1", () => {
		expect(
			$("12345678").add($("12345678")).equals($("24691356"))
		).toBe(true);
	});

	test("add 2", () => {
		expect(
			$("12345678").add($("-1234")).equals($("12344444"))
		).toBe(true);
	});

	test("add 3", () => {
		expect(
			$("-1234").add($("12345678")).equals($("12344444"))
		).toBe(true);
	});

	test("add 4", () => {
		expect(
			$("-1234").add($("-1234")).equals($("-2468"))
		).toBe(true);
	});

	test("sub 1", () => {
		expect(
			$("12345678").sub($("12345678")).equals($("0"))
		).toBe(true);
	});

	test("sub 2", () => {
		expect(
			$("12345678").sub($("-1234")).equals($("12346912"))
		).toBe(true);
	});

	test("sub 3", () => {
		expect(
			$("-1234").sub($("12345678")).equals($("-12346912"))
		).toBe(true);
	});

	test("sub 4", () => {
		expect(
			$("-1234").sub($("-1234")).equals($("0"))
		).toBe(true);
	});

	test("mul", () => {
		expect(
			$("12345678").mul($("-1234")).equals($("-15234566652"))
		).toBe(true);
	});

	test("div 1", () => {
		expect(
			$("12345678").div($("-1234")).equals($("-10004"))
		).toBe(true);
	});

	test("div 2", () => {
		expect(
			$("-1234567890123456789012345678901234567890").div($("123456789012345678901")).equals($("-10000000000000000000"))
		).toBe(true);
	});

	test("divideAndRemainder", () => {
		expect(
			$("-1234567890123456789012345678901234567890").divideAndRemainder($("123456789012345678901"))[1].equals($("-2345678901234567890"))
		).toBe(true);
	});

	test("rem", () => {
		expect(
			$("-1234567890123456789012345678901234567890").rem($("123456789012345678901")).equals($("-2345678901234567890"))
		).toBe(true);
	});

	test("mod", () => {
		expect(
			$("-1234567890123456789012345678901234567890").mod($("123456789012345678901")).equals($("121111110111111111011"))
		).toBe(true);
	});
}

{
	test("new 1", () => {
		expect(
			$(["1234ffffff0000000000", 16]).equals($("85980274126460708454400"))
		).toBe(true);
	});

	test("new 2", () => {
		expect(
			$("0x1234ffffff0000000000").equals($("85980274126460708454400"))
		).toBe(true);
	});

	test("new 3", () => {
		expect(
			$("0b101001000100001000000").equals($("1345600"))
		).toBe(true);
	});
	
	test("new 4", () => {
		expect(
			$(1234567890).longValue === 1234567890
		).toBe(true);
	});

	test("new 5", () => {
		expect(
			$(-1234567890).longValue === -1234567890
		).toBe(true);
	});
}

test("toString 1", () => {
	expect(
		$("0x1234").toString() === "4660"
	).toBe(true);
});

test("toString 2", () => {
	expect(
		$("0x1234ffffff0000000000").toString(16) === "1234ffffff0000000000"
	).toBe(true);
});

test("toString 3", () => {
	expect(
		$("0x1234ffffff0000000000").toString(2) === "10010001101001111111111111111111111110000000000000000000000000000000000000000"
	).toBe(true);
});

{
	const s1 = $(["1234ffffff0000000000", 16]);
	const s2 = s1.negate();

	test("bitCount 1", () => {
		expect(s1.bitCount()).toBe(29);
	});

	test("bitCount 2", () => {
		expect(s2.bitCount()).toBe(68);
	});

	test("bitLength 1", () => {
		expect(s1.bitLength()).toBe(77);
	});

	test("bitLength 2", () => {
		expect(s2.bitLength()).toBe(77);
	});

	test("getLowestSetBit 1", () => {
		expect(s1.getLowestSetBit()).toBe(40);
	});

	test("getLowestSetBit 2", () => {
		expect(s2.getLowestSetBit()).toBe(40);
	});

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
	const s1 = $(["1234ffffff0000000000", 16]);
	const s2 = s1.negate();
	const s3 = $(["8765ffffff0000000000", 16]);
	const s4 = s3.negate();

	test("and 1", () => {
		expect(
			s1.and(s2).toString(16) === "10000000000"
		).toBe(true);
	});

	test("and 2", () => {
		expect(
			s1.and(s3).toString(16) === "224ffffff0000000000"
		).toBe(true);
	});

	test("and 3", () => {
		expect(
			s2.and(s4).toString(16) === "-9775ffffff0000000000"
		).toBe(true);
	});

	test("or 1", () => {
		expect(
			s1.or(s2).toString(16) === "-10000000000"
		).toBe(true);
	});

	test("or 2", () => {
		expect(
			s1.or(s3).toString(16) === "9775ffffff0000000000"
		).toBe(true);
	});

	test("or 3", () => {
		expect(
			s2.or(s4).toString(16) === "-224ffffff0000000000"
		).toBe(true);
	});

	test("xor 1", () => {
		expect(
			s1.xor(s2).toString(16) === "-20000000000000000000"
		).toBe(true);
	});

	test("xor 2", () => {
		expect(
			s1.xor(s3).toString(16) === "0"
		).toBe(true);
	});

	test("xor 3", () => {
		expect(
			s2.xor(s4).toString(16) === "0"
		).toBe(true);
	});

	test("not 1", () => {
		expect(
			s1.not().toString(16) === "-1234ffffff0000000001"
		).toBe(true);
	});

	test("not 2", () => {
		expect(
			s2.not().toString(16) === "1234fffffeffffffffff"
		).toBe(true);
	});

	test("andNot 1", () => {
		expect(
			s1.andNot(s2).toString(16) === "1234fffffe0000000000"
		).toBe(true);
	});

	test("andNot 2", () => {
		expect(
			s1.andNot(s3).toString(16) === "10100000000000000000"
		).toBe(true);
	});

	test("andNot 3", () => {
		expect(
			s2.andNot(s4).toString(16) === "85410000000000000000"
		).toBe(true);
	});
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
	test("compareTo 1", () => {
		expect(
			$(12345678).compareTo(1234567)
		).toBe(1);
	});

	test("compareTo 2", () => {
		expect(
			$(12345678).compareTo(12345678)
		).toBe(0);
	});

	test("compareTo 3", () => {
		expect(
			$(12345678).compareTo(123456789)
		).toBe(-1);
	});
}

test("gcd", () => {
	expect(
		$(12).gcd(18).equals(6)
	).toBe(true);
});

test("pow", () => {
	expect(
		$(2).pow(100).equals("0x10000000000000000000000000")
	).toBe(true);
});

test("modPow 1", () => {
	expect(
		$(-324).modPow($(123), $(55)).equals(51)
	).toBe(true);
});

test("modPow 2", () => {
	expect(
		$("14123999253219").modPow($("70276475859277"), $("86706662670157")).equals("285102795107")
	).toBe(true);
});

test("modInverse 1", () => {
	expect(
		$(15).modInverse(4).equals(3)
	).toBe(true);
});

test("modInverse 2", () => {
	expect(
		$(19).modInverse(41).equals(13)
	).toBe(true);
});

test("factorial", () => {
	expect(
		$(50).factorial().toString(16) === "49eebc961ed279b02b1ef4f28d19a84f5973a1d2c7800000000000"
	).toBe(true);
});

