/* global test, expect */

import BigInteger from "./BigInteger.mjs";
import BigDecimal from "./BigDecimal.mjs";
import Fraction from "./Fraction.mjs";
const I = BigInteger.create;
const D = BigDecimal.create;
const F = Fraction.create;

let test_count = 0;

const testCompareTo = function(testtype, x, y, z, tolerance) {
	test_count++;
	const testname = testtype + " " + test_count + " $(" + x + ", " + tolerance + ").compareTo(" + y + ") = " + z;
	const out = x.compareTo(y, tolerance) === z;
	test(testname, () => { expect(out).toBe(true); });
};

//D=Math.konpeito.BigDecimal.create;F=Math.konpeito.Fraction.create;

{
	test_count = 0;
	testCompareTo("Integer", I(10), 9,   1, null);
	testCompareTo("Integer", I(10), 10,  0, null);
	testCompareTo("Integer", I(10), 11, -1, null);
	testCompareTo("Integer", I(10), D(9),   1, null);
	testCompareTo("Integer", I(10), D(10),  0, null);
	testCompareTo("Integer", I(10), D(11), -1, null);
	testCompareTo("Integer", I(10), F(9),   1, null);
	testCompareTo("Integer", I(10), F(10),  0, null);
	testCompareTo("Integer", I(10), F(11), -1, null);
}

{
	test_count = 0;
	testCompareTo("BigDecimal", D(10), 9,   1, null);
	testCompareTo("BigDecimal", D(10), 10,  0, null);
	testCompareTo("BigDecimal", D(10), 11, -1, null);
	testCompareTo("BigDecimal", D(10), I(9),   1, null);
	testCompareTo("BigDecimal", D(10), I(10),  0, null);
	testCompareTo("BigDecimal", D(10), I(11), -1, null);
	testCompareTo("BigDecimal", D(10), F(9),   1, null);
	testCompareTo("BigDecimal", D(10), F(10),  0, null);
	testCompareTo("BigDecimal", D(10), F(11), -1, null);
	testCompareTo("BigDecimal", D("0.5"), F("1/4"),  1, 0.01);
	testCompareTo("BigDecimal", D("0.5"), F("2/4"),  0, 0.01);
	testCompareTo("BigDecimal", D("0.5"), F("3/4"), -1, 0.01);
}

{
	test_count = 0;
	testCompareTo("Fraction", F(10), 9,   1, null);
	testCompareTo("Fraction", F(10), 10,  0, null);
	testCompareTo("Fraction", F(10), 11, -1, null);
	testCompareTo("Fraction", F(10), I(9),   1, null);
	testCompareTo("Fraction", F(10), I(10),  0, null);
	testCompareTo("Fraction", F(10), I(11), -1, null);
	testCompareTo("Fraction", F(10), D(9),   1, null);
	testCompareTo("Fraction", F(10), D(10),  0, null);
	testCompareTo("Fraction", F(10), D(11), -1, null);
	testCompareTo("Fraction", F("1/2"), F("0.25"),  1, 0.01);
	testCompareTo("Fraction", F("1/2"), F("0.5"),  0, 0.01);
	testCompareTo("Fraction", F("1/2"), F("0.75"), -1, 0.01);
}

