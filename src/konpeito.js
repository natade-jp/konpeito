/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Random from "./math/core/tools/Random.js";
import RoundingMode from "./math/core/context/RoundingMode.js";
import MathContext from "./math/core/context/MathContext.js";
import BigDecimal from "./math/core/BigDecimal.js";
import BigInteger from "./math/core/BigInteger.js";
import Fraction from "./math/core/Fraction.js";
import Complex from "./math/core/Complex.js";
import Matrix from "./math/core/Matrix.js";
import DataAnalysis from "./math/tools/DataAnalysis.js";

/**
 * Class collection of numerical calculation processing.
 * These classes are classified into a BigInteger, BigDecimal, Fraction, Matrix.
 * - BigInteger is a calculation class for arbitrary-precision integer arithmetic.
 * - BigDecimal is a calculation class for arbitrary-precision floating point arithmetic.
 * - Fraction is a calculation class for fractions with infinite precision.
 * - Matrix is a general-purpose calculation class with signal processing and statistical processing.
 */
export default class konpeito {

	/**
	 * Return typedef BigInteger for arbitrary-precision integer calculation.
	 * @returns {typeof BigInteger}
	 */
	static get BigInteger() {
		return BigInteger;
	}

	/**
	 * Return typedef BigDecimal for arbitrary-precision floating-point number.
	 * @returns {typeof BigDecimal}
	 */
	static get BigDecimal() {
		return BigDecimal;
	}

	/**
	 * Return Rounding class for BigDecimal.
	 * @returns {typeof RoundingMode}
	 */
	static get RoundingMode() {
		return RoundingMode;
	}

	/**
	 * Return Configuration class for BigDecimal.
	 * @returns {typeof MathContext}
	 */
	static get MathContext() {
		return MathContext;
	}

	/**
	 * Return typedef Fraction for infinite precision arithmetic.
	 * @returns {typeof Fraction}
	 */
	static get Fraction() {
		return Fraction;
	}

	/**
	 * Return typedef Complex for complex number calculation.
	 * @returns {typeof Complex}
	 */
	static get Complex() {
		return Complex;
	}

	/**
	 * Return typedef Matrix for complex matrix calculation.
	 * @returns {typeof Matrix}
	 */
	static get Matrix() {
		return Matrix;
	}

	/**
	 * Return typedef Random.
	 * @returns {typeof Random}
	 */
	static get Random() {
		return Random;
	}
	
	/**
	 * Return typedef DataAnalysis.
	 * @returns {typeof DataAnalysis}
	 */
	static get DataAnalysis() {
		return DataAnalysis;
	}
	
}
