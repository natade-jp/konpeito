import BigInteger from "./BigInteger.js";
import BigDecimal from "./BigDecimal.js";
import Fraction from "./Fraction.js";
import Complex from "./Complex.js";
import Matrix from "./Matrix.js";
const I = BigInteger.create;
const D = BigDecimal.create;
const F = Fraction.create;
const C = Complex.create;
const M = Matrix.create;

let test_count = 0;

/**
 * @param {*} testtype 
 * @param {*} x 
 * @param {*} y 
 * @param {*} z 
 * @param {*} [tolerance]
 */
const testCompareTo = function(testtype, x, y, z, tolerance) {
	test_count++;
	const X = x.toOneLineString ? x.toOneLineString() : x;
	const Y = y.toOneLineString ? y.toOneLineString() : y;
	const testname = testtype + " " + test_count + " $(" + X + ", " + tolerance + ").compareTo(" + Y + ") = " + z;
	const out = x.compareTo(y, tolerance) === z;
	test(testname, () => { expect(out).toBe(true); });
};

//D=Math.konpeito.BigDecimal.create;F=Math.konpeito.Fraction.create;

{
	test_count = 0;
	testCompareTo("Integer", I(10), 9,   1, null);
	testCompareTo("Integer", I(10), 10,  0, null);
	testCompareTo("Integer", I(10), 11, -1, null);
	testCompareTo("Integer", I(10), I(9),   1, null);
	testCompareTo("Integer", I(10), I(10),  0, null);
	testCompareTo("Integer", I(10), I(11), -1, null);
	testCompareTo("Integer", I(10), D(9),   1, null);
	testCompareTo("Integer", I(10), D(10),  0, null);
	testCompareTo("Integer", I(10), D(11), -1, null);
	testCompareTo("Integer", I(10), F(9),   1, null);
	testCompareTo("Integer", I(10), F(10),  0, null);
	testCompareTo("Integer", I(10), F(11), -1, null);
	testCompareTo("Integer", I(10), C(9),   1, null);
	testCompareTo("Integer", I(10), C(10),  0, null);
	testCompareTo("Integer", I(10), C(11), -1, null);
	testCompareTo("Integer", I(10), M(9),   1, null);
	testCompareTo("Integer", I(10), M(10),  0, null);
	testCompareTo("Integer", I(10), M(11), -1, null);
}

{
	test_count = 0;
	testCompareTo("BigDecimal", D(10), 9,   1, null);
	testCompareTo("BigDecimal", D(10), 10,  0, null);
	testCompareTo("BigDecimal", D(10), 11, -1, null);
	testCompareTo("BigDecimal", D(10), I(9),   1, null);
	testCompareTo("BigDecimal", D(10), I(10),  0, null);
	testCompareTo("BigDecimal", D(10), I(11), -1, null);
	testCompareTo("BigDecimal", D(0.5), D(0.3),  1, 0.01);
	testCompareTo("BigDecimal", D(0.5), D(0.5),  0, 0.01);
	testCompareTo("BigDecimal", D(0.5), D(0.8), -1, 0.01);
	testCompareTo("BigDecimal", D(10), F(9),   1, null);
	testCompareTo("BigDecimal", D(10), F(10),  0, null);
	testCompareTo("BigDecimal", D(10), F(11), -1, null);
	testCompareTo("BigDecimal", D("0.5"), F("1/4"),  1, 0.01);
	testCompareTo("BigDecimal", D("0.5"), F("2/4"),  0, 0.01);
	testCompareTo("BigDecimal", D("0.5"), F("3/4"), -1, 0.01);
	testCompareTo("BigDecimal", D(0.5), C(0.3),  1, 0.01);
	testCompareTo("BigDecimal", D(0.5), C(0.5),  0, 0.01);
	testCompareTo("BigDecimal", D(0.5), C(0.8), -1, 0.01);
	testCompareTo("BigDecimal", D(0.5), M(0.3),  1, 0.01);
	testCompareTo("BigDecimal", D(0.5), M(0.5),  0, 0.01);
	testCompareTo("BigDecimal", D(0.5), M(0.8), -1, 0.01);
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
	testCompareTo("Fraction", F(0.5), C(0.3),  1, 0.01);
	testCompareTo("Fraction", F(0.5), C(0.5),  0, 0.01);
	testCompareTo("Fraction", F(0.5), C(0.8), -1, 0.01);
	testCompareTo("Fraction", F(0.5), M(0.3),  1, 0.01);
	testCompareTo("Fraction", F(0.5), M(0.5),  0, 0.01);
	testCompareTo("Fraction", F(0.5), M(0.8), -1, 0.01);
}

{
	test_count = 0;
	testCompareTo("Complex", C(10), 9,   1, null);
	testCompareTo("Complex", C(10), 10,  0, null);
	testCompareTo("Complex", C(10), 11, -1, null);
	testCompareTo("Complex", C(10), I(9),   1, null);
	testCompareTo("Complex", C(10), I(10),  0, null);
	testCompareTo("Complex", C(10), I(11), -1, null);
	testCompareTo("Complex", C(0.5), D(0.3),  1, 0.01);
	testCompareTo("Complex", C(0.5), D(0.5),  0, 0.01);
	testCompareTo("Complex", C(0.5), D(0.8), -1, 0.01);
	testCompareTo("Complex", C(0.5), F(0.3),  1, 0.01);
	testCompareTo("Complex", C(0.5), F(0.5),  0, 0.01);
	testCompareTo("Complex", C(0.5), F(0.8), -1, 0.01);
	testCompareTo("Complex", C(0.5), M(0.3),  1, 0.01);
	testCompareTo("Complex", C(0.5), M(0.5),  0, 0.01);
	testCompareTo("Complex", C(0.5), M(0.8), -1, 0.01);
}

{
	test_count = 0;
	testCompareTo("Matrix", M(10), 9,   1, null);
	testCompareTo("Matrix", M(10), 10,  0, null);
	testCompareTo("Matrix", M(10), 11, -1, null);
	testCompareTo("Matrix", M(10), I(9),   1, null);
	testCompareTo("Matrix", M(10), I(10),  0, null);
	testCompareTo("Matrix", M(10), I(11), -1, null);
	testCompareTo("Matrix", M(0.5), D(0.3),  1, 0.01);
	testCompareTo("Matrix", M(0.5), D(0.5),  0, 0.01);
	testCompareTo("Matrix", M(0.5), D(0.8), -1, 0.01);
	testCompareTo("Matrix", M(0.5), F(0.3),  1, 0.01);
	testCompareTo("Matrix", M(0.5), F(0.5),  0, 0.01);
	testCompareTo("Matrix", M(0.5), F(0.8), -1, 0.01);
	testCompareTo("Matrix", M(0.5), M(0.3),  1, 0.01);
	testCompareTo("Matrix", M(0.5), M(0.5),  0, 0.01);
	testCompareTo("Matrix", M(0.5), M(0.8), -1, 0.01);
}

/**
 * 
 * @param {*} testtype 
 * @param {*} from_class_type
 * @param {*} to_class_type
 * @param {*} num
 */
const testInstance = function(testtype, from_class_type, to_class_type, num) {
	test_count++;
	const from_class_name = from_class_type.name;
	const to_class_name = to_class_type.name;
	const to_class_func_name = "to" + to_class_name;
	const x = new from_class_type(num);
	const y = x[to_class_func_name]();
	const testname = testtype + " " + test_count + " " + from_class_name + ".create(" + num + ")." + to_class_func_name + "() = " + y;
	const out = (y instanceof to_class_type) && (y.equals(x));
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testInstance("to", BigInteger, BigInteger, 100);
	testInstance("to", BigInteger, BigDecimal, 100);
	testInstance("to", BigInteger, Fraction, 100);
	testInstance("to", BigInteger, Complex, 100);
	testInstance("to", BigInteger, Matrix, 100);
	testInstance("to", BigDecimal, BigInteger, 100);
	testInstance("to", BigDecimal, BigDecimal, 100);
	testInstance("to", BigDecimal, Fraction, 100);
	testInstance("to", BigDecimal, Complex, 100);
	testInstance("to", BigDecimal, Matrix, 100);
	testInstance("to", Fraction, BigInteger, 100);
	testInstance("to", Fraction, BigDecimal, 100);
	testInstance("to", Fraction, Fraction, 100);
	testInstance("to", Fraction, Complex, 100);
	testInstance("to", Fraction, Matrix, 100);
	testInstance("to", Complex, BigInteger, 100);
	testInstance("to", Complex, BigDecimal, 100);
	testInstance("to", Complex, Fraction, 100);
	testInstance("to", Complex, Complex, 100);
	testInstance("to", Complex, Matrix, 100);
	testInstance("to", Matrix, BigInteger, 100);
	testInstance("to", Matrix, BigDecimal, 100);
	testInstance("to", Matrix, Fraction, 100);
	testInstance("to", Matrix, Complex, 100);
	testInstance("to", Matrix, Matrix, 100);
}



