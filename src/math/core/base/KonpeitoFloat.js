/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Polyfill from "../../tools/Polyfill.js";
import KonpeitoInteger from "./KonpeitoInteger.js";

/**
 * Base class for numbers (immutable).
 */
export default class KonpeitoFloat extends KonpeitoInteger {

	/**
	 * Create an number.
	 * @param {any} [number] - Numeric data. See how to use the function.
	 */
	constructor(number) {
		super();
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Square root.
	 * @returns {KonpeitoFloat} sqrt(A)
	 */
	sqrt() {
		return null;
	}

	/**
	 * Cube root.
	 * @returns {KonpeitoFloat} cbrt(A)
	 */
	cbrt() {
		return null;
	}

	/**
	 * Reciprocal square root.
	 * @returns {KonpeitoFloat} rsqrt(A)
	 */
	rsqrt() {
		return null;
	}

	/**
	 * Logarithmic function.
	 * @returns {KonpeitoFloat} log(A)
	 */
	log() {
		return null;
	}

	/**
	 * Exponential function.
	 * @returns {KonpeitoFloat} exp(A)
	 */
	exp() {
		return null;
	}

	/**
	 * e^x - 1
	 * @returns {KonpeitoFloat} expm1(A)
	 */
	expm1() {
		return null;
	}

	/**
	 * ln(1 + x)
	 * @returns {KonpeitoFloat} log1p(A)
	 */
	log1p() {
		return null;
	}
	
	/**
	 * log_2(x)
	 * @returns {KonpeitoFloat} log2(A)
	 */
	log2() {
		return null;
	}

	/**
	 * log_10(x)
	 * @returns {KonpeitoFloat} log10(A)
	 */
	log10() {
		return null;
	}

	// ----------------------
	// 三角関数
	// ----------------------
	
	/**
	 * Sine function.
	 * @returns {KonpeitoFloat} sin(A)
	 */
	sin() {
		return null;
	}

	/**
	 * Cosine function.
	 * @returns {KonpeitoFloat} cos(A)
	 */
	cos() {
		return null;
	}

	/**
	 * Tangent function.
	 * @returns {KonpeitoFloat} tan(A)
	 */
	tan() {
		return null;
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {KonpeitoFloat} atan(A)
	 */
	atan() {
		return null;
	}

	/**
	 * Atan (arc tangent) function.
	 * Return the values of [-PI, PI] .
	 * Supports only real numbers.
	 * @param {any} [number] - X
	 * @returns {KonpeitoFloat} atan2(Y, X)
	 */
	atan2(number) {
		return null;
	}
	
	// ----------------------
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {KonpeitoFloat} asin(A)
	 */
	asin() {
		return null;
	}

	/**
	 * Arc cosine function.
	 * @returns {KonpeitoFloat} acos(A)
	 */
	acos() {
		return null;
	}
	

	/**
	 * Hyperbolic sine function.
	 * @returns {KonpeitoFloat} sinh(A)
	 */
	sinh() {
		return null;
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {KonpeitoFloat} asinh(A)
	 */
	asinh() {
		return null;
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {KonpeitoFloat} cosh(A)
	 */
	cosh() {
		return null;
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {KonpeitoFloat} acosh(A)
	 */
	acosh() {
		return null;
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {KonpeitoFloat} tanh(A)
	 */
	tanh() {
		return null;
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {KonpeitoFloat} atanh(A)
	 */
	atanh() {
		return null;
	}

	/**
	 * Secant function.
	 * @returns {KonpeitoFloat} sec(A)
	 */
	sec() {
		return null;
	}

	/**
	 * Reverse secant function.
	 * @returns {KonpeitoFloat} asec(A)
	 */
	asec() {
		return null;
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {KonpeitoFloat} sech(A)
	 */
	sech() {
		return null;
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {KonpeitoFloat} asech(A)
	 */
	asech() {
		return null;
	}

	/**
	 * Cotangent function.
	 * @returns {KonpeitoFloat} cot(A)
	 */
	cot() {
		return null;
	}

	/**
	 * Inverse cotangent function.
	 * @returns {KonpeitoFloat} acot(A)
	 */
	acot() {
		return null;
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {KonpeitoFloat} coth(A)
	 */
	coth() {
		return null;
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {KonpeitoFloat} acoth(A)
	 */
	acoth() {
		return null;
	}

	/**
	 * Cosecant function.
	 * @returns {KonpeitoFloat} csc(A)
	 */
	csc() {
		return null;
	}

	/**
	 * Inverse cosecant function.
	 * @returns {KonpeitoFloat} acsc(A)
	 */
	acsc() {
		return null;
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {KonpeitoFloat} csch(A)
	 */
	csch() {
		return null;
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {KonpeitoFloat} acsch(A)
	 */
	acsch() {
		return null;
	}

	// ----------------------
	// 確率・統計系
	// ----------------------
	
	/**
	 * Logit function.
	 * @returns {KonpeitoFloat} logit(A)
	 */
	logit() {
		return null;
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {KonpeitoFloat} sinc(A)
	 */
	sinc() {
		return null;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * PI.
	 * @returns {KonpeitoFloat} 3.14...
	 */
	static get PI() {
		return null;
	}

	/**
	 * 0.25 * PI.
	 * @returns {KonpeitoFloat} 0.78...
	 */
	static get QUARTER_PI() {
		return null;
	}

	/**
	 * 0.5 * PI.
	 * @returns {KonpeitoFloat} 1.57...
	 */
	static get HALF_PI() {
		return null;
	}

	/**
	 * 2 * PI.
	 * @returns {KonpeitoFloat} 6.28...
	 */
	static get TWO_PI() {
		return null;
	}

	/**
	 * E, Napier's constant.
	 * @returns {KonpeitoFloat} 2.71...
	 */
	static get E() {
		return null;
	}

	/**
	 * log_e(2)
	 * @returns {KonpeitoFloat} ln(2)
	 */
	static get LN2() {
		return null;
	}

	/**
	 * log_e(10)
	 * @returns {KonpeitoFloat} ln(10)
	 */
	static get LN10() {
		return null;
	}

	/**
	 * log_2(e)
	 * @returns {KonpeitoFloat} log_2(e)
	 */
	static get LOG2E() {
		return null;
	}
	
	/**
	 * log_10(e)
	 * @returns {KonpeitoFloat} log_10(e)
	 */
	static get LOG10E() {
		return null;
	}
	
	/**
	 * sqrt(2)
	 * @returns {KonpeitoFloat} sqrt(2)
	 */
	static get SQRT2() {
		return null;
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {KonpeitoFloat} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return null;
	}
	
	/**
	 * 0.5
	 * @returns {KonpeitoFloat} 0.5
	 */
	static get HALF() {
		return null;
	}



}


