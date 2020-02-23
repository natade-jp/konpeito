import konpeito from "./konpeito.js";

let test_count = 0;

/**
 * @param {*} testtype 
 */
const testType = function(testtype) {
	test_count++;
	const testname = "konpeito." + testtype;
	test(testname, () => { expect(konpeito[testtype] !== undefined).toBe(true); });
};

{
	testType("Matrix");
	testType("Complex");
	testType("BigDecimal");
	testType("BigInteger");
	testType("Fraction");
	testType("Random");
	testType("RoundingMode");
	testType("MathContext");
	testType("DataAnalysis");
}
