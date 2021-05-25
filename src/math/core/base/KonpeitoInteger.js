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
import Random from "../tools/Random.js";
import MathContext from "../context/MathContext.js";
import BigInteger from "../BigInteger.js";
import BigDecimal from "../BigDecimal.js";
import Fraction from "../Fraction.js";
import Complex from "../Complex.js";
import Matrix from "../Matrix.js";

/**
 * Base class for numbers (immutable).
 */
export default class KonpeitoInteger {

	/**
	 * Create an number.
	 * @param {any} [number] - Numeric data. See how to use the function.
	 */
	constructor(number) {
	}

	/**
	 * Create an entity object of this class.
	 * @param {any} number 
	 * @returns {KonpeitoInteger}
	 */
	static create(number) {
		return null;
	}

	/**
	 * Create number.
	 * @param {any} number 
	 * @returns {KonpeitoInteger}
	 */
	static valueOf(number) {
		return null;
	}

	/**
	 * Convert to string.
	 * @returns {string}
	 */
	toString() {
		return "no";
	}

	/**
	 * Convert to JSON.
	 * @returns {string} 
	 */
	toJSON() {
		return this.toString();
	}

	/**
	 * Deep copy.
	 * @returns {KonpeitoInteger}
	 */
	clone() {
		return null;
	}

	/**
	 * Absolute value.
	 * @returns {KonpeitoInteger} abs(A)
	 */
	abs() {
		return null;
	}

	/**
	 * this * -1
	 * @returns {KonpeitoInteger} -A
	 */
	negate() {
		return null;
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {any}
	 */
	sign() {
		return null;
	}

	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A + B
	 */
	add(number) {
		return null;
	}

	/**
	 * Subtract.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A - B
	 */
	sub(number) {
		return null;
	}

	/**
	 * Multiply.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A * B
	 */
	mul(number) {
		return null;
	}

	/**
	 * Divide.
	 * @param {any} number
	 * @returns {KonpeitoInteger} fix(A / B)
	 */
	div(number) {
		return null;
	}

	/**
	 * Inverse number of this value.
	 * @returns {KonpeitoInteger} 1 / A
	 */
	inv() {
		return null;
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A % B
	 */
	rem(number) {
		return null;
	}

	/**
	 * Modulo, positive rem of division.
	 * - Result has same sign as the Divisor.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A mod B
	 */
	mod(number) {
		return null;
	}

	/**
	 * Modular exponentiation.
	 * @param {any} exponent
	 * @param {any} m 
	 * @returns {KonpeitoInteger} A^B mod m
	 */
	modPow(exponent, m) {
		return null;
	}

	/**
	 * Modular multiplicative inverse.
	 * @param {any} m
	 * @returns {KonpeitoInteger} A^(-1) mod m
	 */
	modInverse(m) {
		return null;
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * @returns {KonpeitoInteger} n!
	 */
	factorial() {
		return null;
	}

	/**
	 * Multiply a multiple of ten.
	 * @param {any} n
	 * @returns {KonpeitoInteger} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		return null;
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * @param {any} exponent
	 * @returns {KonpeitoInteger} pow(A, B)
	 */
	pow(exponent) {
		return null;
	}

	/**
	 * Square.
	 * @returns {KonpeitoInteger} pow(A, 2)
	 */
	square() {
		return null;
	}

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return null;
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		return null;
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		return null;
	}
	
	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return null;
	}

	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		return null;
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return null;
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return null;
	}
	
	/**
	 * return Matrix.
	 * @returns {Matrix}
	 */
	toMatrix() {
		return null;
	}

	// ----------------------
	// 比較
	// ----------------------
	
	/**
	 * Equals.
	 * @param {any} number
	 * @returns {boolean} A === B
	 */
	equals(number) {
		return null;
	}

	/**
	 * Compare values.
	 * @param {any} number 
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number) {
		return null;
	}

	// max, min, clip などは行列だと意味が違うため外す

	// ----------------------
	// 丸め
	// ----------------------
	
	/**
	 * Floor.
	 * @returns {KonpeitoInteger} floor(A)
	 */
	floor() {
		return null;
	}

	/**
	 * Ceil.
	 * @returns {KonpeitoInteger} ceil(A)
	 */
	ceil() {
		return null;
	}
	
	/**
	 * Rounding to the nearest integer.
	 * @returns {KonpeitoInteger} round(A)
	 */
	round() {
		return null;
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {KonpeitoInteger} fix(A), trunc(A)
	 */
	fix() {
		return null;
	}

	/**
	 * Fraction.
	 * @returns {KonpeitoInteger} fract(A)
	 */
	fract() {
		return BigInteger.ZERO;
	}
	
	// ----------------------
	// factor
	// ----------------------

	/**
	 * Factorization.
	 * - Calculate up to `9007199254740991`.
	 * @returns {KonpeitoInteger[]} factor
	 */
	factor() {
		return null;
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} gcd(x, y)
	 */
	gcd(number) {
		return null;
	}

	/**
	 * Extended Euclidean algorithm.
	 * @param {any} number 
	 * @returns {KonpeitoInteger[]} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		return null;
	}

	/**
	 * Least common multiple.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} lcm(x, y)
	 */
	lcm(number) {
		return null;
	}

	// ----------------------
	// 素数系
	// ----------------------
	
	/**
	 * Return true if the value is prime number.
	 * - Calculate up to `9007199254740991`.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		return null;
	}

	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * @param {any} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		return null;
	}

	/**
	 * Next prime.
	 * @param {any} [certainty=100] - Repeat count (prime precision).
	 * @param {any} [search_max=100000] - Search range of next prime.
	 * @returns {KonpeitoInteger}
	 */
	nextProbablePrime(certainty, search_max) {
		return null;
	}

	// ----------------------
	// シフト演算系
	// ----------------------
	
	/**
	 * this << n
	 * @param {any} n
	 * @returns {KonpeitoInteger} A << n
	 */
	shift(n) {
		return null;
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A & B
	 */
	and(number) {
		return null;
	}

	/**
	 * Logical OR.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A | B
	 */
	or(number) {
		return null;
	}

	/**
	 * Logical Exclusive-OR.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A ^ B
	 */
	xor(number) {
		return null;
	}

	/**
	 * Logical Not. (mutable)
	 * @returns {KonpeitoInteger} !A
	 */
	not() {
		return null;
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * this === 0
	 * @returns {boolean}
	 */
	isZero() {
		return null;
	}
	
	/**
	 * this === 1
	 * @returns {boolean}
	 */
	isOne() {
		return null;
	}
	
	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return null;
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return null;
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return null;
	}
	
	/**
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return null;
	}
	
	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return null;
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return null;
	}

	/**
	 * this === Infinity or -Infinity
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return null;
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return null;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * -1
	 * @returns {KonpeitoInteger} -1
	 */
	static get MINUS_ONE() {
		return null;
	}
	
	/**
	 * 0
	 * @returns {KonpeitoInteger} 0
	 */
	static get ZERO() {
		return null;
	}

	/**
	 * 1
	 * @returns {KonpeitoInteger} 1
	 */
	static get ONE() {
		return null;
	}
	
	/**
	 * 2
	 * @returns {KonpeitoInteger} 2
	 */
	static get TWO() {
		return null;
	}
	
	/**
	 * 10
	 * @returns {KonpeitoInteger} 10
	 */
	static get TEN() {
		return null;
	}

	/**
	 * Positive infinity.
	 * @returns {KonpeitoInteger} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return null;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {KonpeitoInteger} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return null;
	}

	/**
	 * Not a Number.
	 * @returns {KonpeitoInteger} NaN
	 */
	static get NaN() {
		return null;
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {any}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {any} number
	 * @returns {KonpeitoInteger} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
}


