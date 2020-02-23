/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Random from "./tools/Random.js";
import Matrix from "./Matrix.js";
import BigInteger from "./BigInteger.js";
import Probability from "./tools/Probability.js";

/**
 * Complex type argument.
 * - Complex
 * - number
 * - boolean
 * - string
 * - Array<number>
 * - {_re:number,_im:number}
 * - {doubleValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @typedef {Complex|number|boolean|string|Array<number>|{_re:number,_im:number}|{doubleValue:number}|{toString:function}} KComplexInputData
 */

/**
 * Random number generation class used within Complex.
 * @type {Random}
 * @ignore
 */
const random_class = new Random();

/**
 * Collection of functions used in Complex.
 * @ignore
 */
class ComplexTool {

	/**
	 * Create data for complex numbers from strings.
	 * @param {string} text - Target strings.
	 * @returns {{real : number, imag : number}}
	 */
	static ToComplexFromString(text) {
		let str = text.replace(/\s/g, "").toLowerCase();
		str = str.replace(/infinity|inf/g, "1e100000");
		// 複素数の宣言がない場合
		if(!(/[ij]/.test(str))) {
			return {
				real : parseFloat(str),
				imag : 0.0
			};
		}
		// この時点で複素数である。
		// 以下真面目に調査
		let re = 0;
		let im = 0;
		let buff;
		// 最後が$なら右側が実数、最後が[+-]なら左側が実数
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))($|[+-])/);
		if(buff) {
			re = parseFloat(buff[0]);
		}
		// 複素数は数値が省略される場合がある
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]/);
		if(buff) {
			buff = buff[0].substring(0, buff[0].length - 1);
			// i, +i, -j のように実数部がなく、数値もない場合
			if((/^[-+]$/.test(buff)) || buff.length === 0) {
				im = buff === "-" ? -1 : 1;
			}
			else {
				im = parseFloat(buff);
			}
		}
		return {
			real : re,
			imag : im
		};
	}

}

/**
 * Complex number class. (immutable)
 */
export default class Complex {

	/**
	 * Create a complex number.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3"
	 * - "3 + 4i", "4j + 3", [3, 4].
	 * @param {KComplexInputData} number - Complex number. See how to use the function.
	 */
	constructor(number) {
		// 行列で使うためイミュータブルは必ず守ること。
		if(arguments.length === 1) {
			const obj = number;
			if(obj instanceof Complex) {
				
				/**
				 * The real part of this Comlex.
				 * @private
				 * @type {number}
				 */
				this._re = obj._re;
				
				/**
				 * The imaginary part of this Comlex.
				 * @private
				 * @type {number}
				 */
				this._im = obj._im;
			}
			else if(typeof obj === "number") {
				this._re = obj;
				this._im = 0.0;
			}
			else if(typeof obj === "string") {
				const x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
			}
			else if(obj instanceof Array) {
				if(obj.length === 2) {
					this._re = obj[0];
					this._im = obj[1];
				}
				else {
					throw "Complex Unsupported argument " + arguments;
				}
			}
			else if(typeof obj === "boolean") {
				this._re = obj ? 1 : 0;
				this._im = 0.0;
			}
			else if("doubleValue" in obj) {
				this._re = obj.doubleValue;
				this._im = 0.0;
			}
			else if(("_re" in obj) && ("_im" in obj)) {
				this._re = obj._re;
				this._im = obj._im;
			}
			else if(obj instanceof Object) {
				const x = ComplexTool.ToComplexFromString(obj.toString());
				this._re = x.real;
				this._im = x.imag;
			}
			else {
				throw "Complex Unsupported argument " + arguments;
			}
		}
		else {
			throw "Complex Many arguments : " + arguments.length;
		}
	}

	/**
	 * Create an entity object of this class.
	 * @param {KComplexInputData} number
	 * @returns {Complex}
	 */
	static create(number) {
		if(number instanceof Complex) {
			return number;
		}
		else {
			return new Complex(number);
		}
	}
	
	/**
	 * Convert number to Complex type.
	 * @param {KComplexInputData} number
	 * @returns {Complex}
	 */
	static valueOf(number) {
		return Complex.create(number);
	}
	
	/**
	 * Convert to Complex.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KComplexInputData} number 
	 * @returns {Complex}
	 * @private
	 */
	static _toComplex(number) {
		if(number instanceof Complex) {
			return number;
		}
		else if(number instanceof Matrix) {
			return Matrix._toComplex(number);
		}
		else {
			return new Complex(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {KComplexInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toDouble(number) {
		if(typeof number === "number") {
			return number;
		}
		const complex_number = Complex._toComplex(number);
		if(complex_number.isReal()) {
			return complex_number.real;
		}
		else {
			throw "not support complex numbers.[" + number + "]";
		}
	}

	/**
	 * Convert to integer.
	 * @param {KComplexInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		return Math.trunc(Complex._toDouble(number));
	}

	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return this._re !== 0 || this._im !== 0;
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		return Math.trunc(this._re);
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		return this._re;
	}

	/**
	 * Deep copy.
	 * @returns {Complex} 
	 */
	clone() {
		return this;
	}

	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		/**
		 * @type {function(number): string }
		 */
		const formatG = function(x) {
			let numstr = x.toPrecision(6);
			if(numstr.indexOf(".") !== -1) {
				numstr = numstr.replace(/\.?0+$/, "");  // 1.00 , 1.10
				numstr = numstr.replace(/\.?0+e/, "e"); // 1.0e , 1.10e
			}
			else if(/inf/i.test(numstr)) {
				if(x === Number.POSITIVE_INFINITY) {
					return "Inf";
				}
				else {
					return "-Inf";
				}
			}
			else if(/nan/i.test(numstr)) {
				return "NaN";
			}
			return numstr;
		};
		if(!this.isReal()) {
			if(this._re === 0) {
				return formatG(this._im) + "i";
			}
			else if((this._im >= 0) || (Number.isNaN(this._im))) {
				return formatG(this._re) + " + " + formatG(this._im) + "i";
			}
			else {
				return formatG(this._re) + " - " + formatG(-this._im) + "i";
			}
		}
		else {
			return formatG(this._re);
		}
	}
	
	/**
	 * The real part of this Comlex.
	 * @returns {number} real(A)
	 */
	get real() {
		return this._re;
	}
	
	/**
	 * The imaginary part of this Comlex.
	 * @returns {number} imag(A)
	 */
	get imag() {
		return this._im;
	}

	/**
	 * norm.
	 * @returns {number} |A|
	 */
	get norm() {
		if(this._im === 0) {
			return Math.abs(this._re);
		}
		else if(this._re === 0) {
			return Math.abs(this._im);
		}
		else {
			return Math.sqrt(this._re * this._re + this._im * this._im);
		}
	}

	/**
	 * The argument of this complex number.
	 * @returns {number} arg(A)
	 */
	get arg() {
		if(this._im === 0) {
			return this._re >= 0 ? 0 : Math.PI;
		}
		else if(this._re === 0) {
			return Math.PI * (this._im >= 0.0 ? 0.5 : -0.5);
		}
		else {
			return Math.atan2(this._im, this._re);
		}
	}

	/**
	 * Return number of decimal places for real and imaginary parts.
	 * - Used to make a string.
	 * @returns {number} Number of decimal places.
	 */
	getDecimalPosition() {
		/**
		 * @type {function(number): number }
		 */
		const getDecimal = function(x) {
			if(!Number.isFinite(x)) {
				return 0;
			}
			let a = x;
			let point = 0;
			for(let i = 0; i < 20; i++) {
				if(Math.abs(a - Math.round(a)) <= Number.EPSILON) {
					break;
				}
				a *= 10;
				point++;
			}
			return point;
		};
		return Math.max( getDecimal(this.real), getDecimal(this.imag) );
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Complex} 
	 */
	sign() {
		if(!this.isFinite()) {
			if(this.isNaN() || this._im === Infinity || this._im === -Infinity) {
				return Complex.NaN;
			}
			if(this._re === Infinity) {
				return Complex.ONE;
			}
			else {
				return Complex.MINUS_ONE;
			}
		}
		if(this._im === 0) {
			if(this._re === 0) {
				return Complex.ZERO;
			}
			else {
				return new Complex(this._re > 0 ? 1 : -1);
			}
		}
		return this.div(this.norm);
	}
	
	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A + B
	 */
	add(number) {
		const A = this;
		const B = new Complex(number);
		B._re = A._re + B._re;
		B._im = A._im + B._im;
		return B;
	}

	/**
	 * Subtract.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A - B
	 */
	sub(number) {
		const A = this;
		const B = new Complex(number);
		B._re = A._re - B._re;
		B._im = A._im - B._im;
		return B;
	}

	/**
	 * Multiply.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * B
	 */
	mul(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re * B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = - A._im * B._im;
			B._im = 0;
			return B;
		}
		else {
			const re = A._re * B._re - A._im * B._im;
			const im = A._im * B._re + A._re * B._im;
			B._re = re;
			B._im = im;
			return B;
		}
	}
	
	/**
	 * Inner product/Dot product.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * conj(B)
	 */
	dot(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re * B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = A._im * B._im;
			B._im = 0;
			return B;
		}
		else {
			const re =   A._re * B._re + A._im * B._im;
			const im = - A._im * B._re + A._re * B._im;
			B._re = re;
			B._im = im;
			return B;
		}
	}
	
	/**
	 * Divide.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A / B
	 */
	div(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re / B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = A._im / B._im;
			B._im = 0;
			return B;
		}
		else {
			const re = A._re * B._re + A._im * B._im;
			const im = A._im * B._re - A._re * B._im;
			const denominator = 1.0 / (B._re * B._re + B._im * B._im);
			B._re = re * denominator;
			B._im = im * denominator;
			return B;
		}
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KComplexInputData} number - Divided value (real number only).
	 * @returns {Complex} A rem B
	 */
	rem(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im !== 0) || (B._im !== 0)) {
			throw "calculation method is undefined.";
		}
		if(!A.isFinite() || !B.isFinite() || B.isZero()) {
			return Complex.NaN;
		}
		B._re = A._re - B._re * (Math.trunc(A._re / B._re));
		return B;
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Divisor.
	 * @param {KComplexInputData} number - Divided value (real number only).
	 * @returns {Complex} A mod B
	 */
	mod(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im !== 0) || (B._im !== 0)) {
			throw "calculation method is undefined.";
		}
		if(B.isZero()) {
			return A;
		}
		const ret = A.rem(B);
		if(!A.equalsState(B)) {
			return ret.add(B);
		}
		else {
			return ret;
		}
	}

	/**
	 * Inverse number of this value.
	 * @returns {Complex} 1 / A
	 */
	inv() {
		if(this._im === 0) {
			return new Complex(1.0 / this._re);
		}
		else if(this._re === 0) {
			return new Complex([0, - 1.0 / this._im]);
		}
		return Complex.ONE.div(this);
	}

	// ----------------------
	// 比較
	// ----------------------
	
	/**
	 * Equals.
	 * @param {KComplexInputData} number
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		const A = this;
		const B = Complex._toComplex(number);
		// 無限大、非数の値も含めて一度確認
		if(A.isNaN() || B.isNaN()) {
			return false;
		}
		if((A._re === B._re) && (A._im === B._im)) {
			return true;
		}
		// 誤差を含んだ値の比較
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(A._re - B._re) <  tolerance_) && (Math.abs(A._im - B._im) < tolerance_);
	}

	/**
	 * Numeric type match.
	 * @param {KComplexInputData} number 
	 * @returns {boolean}
	 */
	equalsState(number) {
		const A = this;
		const B = Complex._toComplex(number);
		/**
		 * @param {Complex} num
		 * @returns {number}
		 */
		const getState = function(num) {
			if(num.isZero()) {
				return 0;
			}
			if(!num.isFinite()) {
				if(num.isPositiveInfinity()) {
					return 4;
				}
				else if(num.isNegativeInfinity()) {
					return 5;
				}
				else {
					return 3;
				}
			}
			return num.isPositive() ? 1 : 2;
		};
		const A_type = getState(A);
		const B_type = getState(B);
		return A_type === B_type;
	}

	/**
	 * Compare values.
	 * @param {KComplexInputData} number
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const A = this;
		const B = Complex._toComplex(number);
		if(!A.isFinite() || !B.isFinite()) {
			if(A.equals(B)) {
				return 0;
			}
			else if(
				A.isNaN() || B.isNaN() ||
				(A.real ===  Infinity && A.imag === -Infinity) ||
				(A.real === -Infinity && A.imag ===  Infinity) ||
				(B.real ===  Infinity && B.imag === -Infinity) ||
				(B.real === -Infinity && B.imag ===  Infinity) ) {
				return NaN;
			}
			else if(A.isFinite()) {
				return B.real + B.imag < 0 ? 1 : -1;
			}
			else if(B.isFinite()) {
				return A.real + A.imag > 0 ? 1 : -1;
			}
			else {
				return NaN;
			}
		}
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		const a = A.real + A.imag;
		const b = B.real + B.imag;
		if((Math.abs(a - b) <= tolerance_)) {
			return 0;
		}
		return a > b ? 1 : -1;
	}
	
	/**
	 * Maximum number.
	 * @param {KComplexInputData} number
	 * @returns {Complex} max([A, B])
	 */
	max(number) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x) >= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * Minimum number.
	 * @param {KComplexInputData} number
	 * @returns {Complex} min([A, B])
	 */
	min(number) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x) <= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * Clip number within range.
	 * @param {KComplexInputData} min 
	 * @param {KComplexInputData} max
	 * @returns {Complex} min(max(x, min), max)
	 */
	clip(min, max) {
		const min_ = Complex._toComplex(min);
		const max_ = Complex._toComplex(max);
		const arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	}

	// ----------------------
	// 丸め
	// ----------------------
	
	/**
	 * Floor.
	 * @returns {Complex} floor(A)
	 */
	floor() {
		return new Complex([Math.floor(this._re), Math.floor(this._im)]);
	}

	/**
	 * Ceil.
	 * @returns {Complex} ceil(A)
	 */
	ceil() {
		return new Complex([Math.ceil(this._re), Math.ceil(this._im)]);
	}
	
	/**
	 * Rounding to the nearest integer.
	 * @returns {Complex} round(A)
	 */
	round() {
		return new Complex([Math.round(this._re), Math.round(this._im)]);
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {Complex} fix(A), trunc(A)
	 */
	fix() {
		return new Complex([Math.trunc(this._re), Math.trunc(this._im)]);
	}

	/**
	 * Fraction.
	 * @returns {Complex} fract(A)
	 */
	fract() {
		return new Complex([this._re - Math.floor(this._re), this._im - Math.floor(this._im)]);
	}

	// ----------------------
	// 複素数
	// ----------------------
	
	/**
	 * Absolute value.
	 * @returns {Complex} abs(A)
	 */
	abs() {
		return new Complex(this.norm);
	}

	/**
	 * Complex conjugate.
	 * @returns {Complex} real(A) - imag(A)j
	 */
	conj() {
		if(this._im === 0) {
			return this;
		}
		// 共役複素数
		return new Complex([this._re, -this._im]);
	}

	/**
	 * this * -1
	 * @returns {Complex} -A
	 */
	negate() {
		return new Complex([-this._re, -this._im]);
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * @param {KComplexInputData} number
	 * @returns {Complex} pow(A, B)
	 */
	pow(number) {
		const A = this;
		const B = new Complex(number);
		// -2 ^ 0.5 ... 複素数
		// -2 ^ 1   ... 実数
		//  2 ^ 0.5 ... 実数
		if(B.isReal()) {
			if(A.isReal() && (A.isNotNegative() || B.isInteger())) {
				B._re = Math.pow(A._re, B._re);
				return B;
			}
			else {
				const r = Math.pow(A.norm, B._re);
				const s = A.arg * B._re;
				B._re = r * Math.cos(s);
				B._im = r * Math.sin(s);
				return B;
			}
		}
		else {
			return B.mul(A.log()).exp();
		}
	}

	/**
	 * Square.
	 * @returns {Complex} pow(A, 2)
	 */
	square() {
		if(this._im === 0.0) {
			return new Complex(this._re * this._re);
		}
		return this.mul(this);
	}

	/**
	 * Square root.
	 * @returns {Complex} sqrt(A)
	 */
	sqrt() {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(Math.sqrt(this._re));
			}
			else {
				return new Complex([0, Math.sqrt(-this._re)]);
			}
		}
		const r = Math.sqrt(this.norm);
		const s = this.arg * 0.5;
		return new Complex([r * Math.cos(s), r * Math.sin(s)]);
	}

	/**
	 * Cube root.
	 * @param {KComplexInputData} [n=0] - Value type(0,1,2)
	 * @returns {Complex} cbrt(A)
	 */
	cbrt(n) {
		const type = Complex._toInteger(n !== undefined ? n : 0);
		const x = this.log().div(3).exp();
		if(type === 0) {
			return x;
		}
		else if(type === 1) {
			return x.mul([-0.5, Math.sqrt(3) * 0.5]);
		}
		else {
			return x.mul([-0.5, - Math.sqrt(3) * 0.5]);
		}
	}

	/**
	 * Reciprocal square root.
	 * @returns {Complex} rsqrt(A)
	 */
	rsqrt() {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(1.0 / Math.sqrt(this._re));
			}
			else {
				return new Complex([0, - 1.0 / Math.sqrt(-this._re)]);
			}
		}
		return this.sqrt().inv();
	}

	/**
	 * Logarithmic function.
	 * @returns {Complex} log(A)
	 */
	log() {
		if(this.isReal() && this.isNotNegative()) {
			return new Complex(Math.log(this._re));
		}
		// 負の値が入っているか、もともと複素数が入っている場合は、複素対数関数
		return new Complex([Math.log(this.norm), this.arg]);
	}

	/**
	 * Exponential function.
	 * @returns {Complex} exp(A)
	 */
	exp() {
		if(this.isReal()) {
			return new Complex(Math.exp(this._re));
		}
		// 複素指数関数
		const r = Math.exp(this._re);
		return new Complex([r * Math.cos(this._im), r * Math.sin(this._im)]);
	}

	/**
	 * e^x - 1
	 * @returns {Complex} expm1(A)
	 */
	expm1() {
		return this.exp().sub(1);
	}

	/**
	 * ln(1 + x)
	 * @returns {Complex} log1p(A)
	 */
	log1p() {
		return this.add(1).log();
	}
	
	/**
	 * log_2(x)
	 * @returns {Complex} log2(A)
	 */
	log2() {
		return this.log().div(Complex.LN2);
		
	}

	/**
	 * log_10(x)
	 * @returns {Complex} log10(A)
	 */
	log10() {
		return this.log().div(Complex.LN10);
	}

	// ----------------------
	// 三角関数
	// ----------------------
	
	/**
	 * Sine function.
	 * @returns {Complex} sin(A)
	 */
	sin() {
		if(this.isReal()) {
			return new Complex(Math.sin(this._re));
		}
		// オイラーの公式より
		// sin x = (e^ix - e^-ex) / 2i
		const a = this.mul(Complex.I).exp();
		const b = this.mul(Complex.I.negate()).exp();
		return a.sub(b).div([0, 2]);
	}

	/**
	 * Cosine function.
	 * @returns {Complex} cos(A)
	 */
	cos() {
		if(this.isReal()) {
			return new Complex(Math.cos(this._re));
		}
		// オイラーの公式より
		// cos x = (e^ix + e^-ex) / 2
		const a = this.mul(Complex.I).exp();
		const b = this.mul(Complex.I.negate()).exp();
		return a.add(b).div(2);
	}

	/**
	 * Tangent function.
	 * @returns {Complex} tan(A)
	 */
	tan() {
		if(this.isReal()) {
			return new Complex(Math.tan(this._re));
		}
		// 三角関数の相互関係 tan x = sin x / cos x
		return this.sin().div(this.cos());
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {Complex} atan(A)
	 */
	atan() {
		if(this.isReal()) {
			return new Complex(Math.atan(this._re));
		}
		// 逆正接 tan-1 x = i/2 log( i+x / i-x )
		return Complex.I.div(Complex.TWO).mul(Complex.I.add(this).div(Complex.I.sub(this)).log());
	}

	/**
	 * Atan (arc tangent) function.
	 * Return the values of [-PI, PI] .
	 * Supports only real numbers.
	 * @param {KComplexInputData} [number] - X
	 * @returns {Complex} atan2(Y, X)
	 */
	atan2(number) {
		if(arguments.length === 0) {
			return new Complex(this.arg);
		}
		// y.atan2(x) とする。
		const y = this;
		const x = Complex._toComplex(number);
		if(y.isReal() && x.isReal()) {
			return new Complex(Math.atan2(y._re, x._re));
		}
		// 複素数のatan2は未定義である（実装不可能）
		throw "calculation method is undefined.";
	}
	
	// ----------------------
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {Complex} asin(A)
	 */
	asin() {
		// 逆正弦
		return this.mul(Complex.I).add(Complex.ONE.sub(this.square()).sqrt()).log().mul(Complex.MINUS_I);
	}

	/**
	 * Arc cosine function.
	 * @returns {Complex} acos(A)
	 */
	acos() {
		// 逆余弦
		return this.add(Complex.I.mul(Complex.ONE.sub(this.square()).sqrt())).log().mul(Complex.MINUS_I);
	}
	

	/**
	 * Hyperbolic sine function.
	 * @returns {Complex} sinh(A)
	 */
	sinh() {
		// 双曲線正弦
		const y = this.exp();
		return y.sub(y.inv()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {Complex} asinh(A)
	 */
	asinh() {
		// 逆双曲線正弦 Math.log(x + Math.sqrt(x * x + 1));
		if(this.isInfinite()) {
			return this;
		}
		return this.add(this.mul(this).add(1).sqrt()).log();
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {Complex} cosh(A)
	 */
	cosh() {
		// 双曲線余弦
		return this.exp().add(this.negate().exp()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {Complex} acosh(A)
	 */
	acosh() {
		// 逆双曲線余弦 Math.log(x + Math.sqrt(x * x - 1));
		// Octave だと log(0.5+(0.5*0.5-1)^0.5) !== acosh(0.5) になる。
		// おそらく log(0.5-(0.5*0.5-1)^0.5) の式に切り替わるようになっている
		// これは2つの値を持っているためだと思われるので合わせてみる
		if(this.isZero()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		if(this.compareTo(Complex.ONE) >= 1) {
			return this.add(this.square().sub(1).sqrt()).log();
		}
		else {
			return this.sub(this.square().sub(1).sqrt()).log();
		}
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {Complex} tanh(A)
	 */
	tanh() {
		// 双曲線正接
		if(this.isNaN()) {
			return Complex.NaN;
		}
		const y =  this.mul(2).exp();
		if(y.isZero()) {
			return Complex.MINUS_ONE;
		}
		else if(y.isPositiveInfinity()) {
			return Complex.ONE;
		}
		return y.sub(1).div(y.add(1));
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {Complex} atanh(A)
	 */
	atanh() {
		// 逆双曲線正接
		if(this.isInfinite() && this.isReal()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		return this.add(1).div(this.negate().add(1)).log().mul(0.5);
	}

	/**
	 * Secant function.
	 * @returns {Complex} sec(A)
	 */
	sec() {
		// 正割
		return this.cos().inv();
	}

	/**
	 * Reverse secant function.
	 * @returns {Complex} asec(A)
	 */
	asec() {
		// 逆正割
		return this.inv().acos();
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {Complex} sech(A)
	 */
	sech() {
		// 双曲線正割
		return this.exp().add(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {Complex} asech(A)
	 */
	asech() {
		// 逆双曲線正割
		if(this.isInfinite() && this.isReal()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		if(this.isPositive() || (this.compareTo(Complex.MINUS_ONE) == -1)) {
			return this.inv().add(this.square().inv().sub(1).sqrt()).log();
		}
		else {
			return this.inv().sub(this.square().inv().sub(1).sqrt()).log();
		}
	}

	/**
	 * Cotangent function.
	 * @returns {Complex} cot(A)
	 */
	cot() {
		// 余接
		return this.tan().inv();
	}

	/**
	 * Inverse cotangent function.
	 * @returns {Complex} acot(A)
	 */
	acot() {
		// 逆余接
		return this.inv().atan();
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {Complex} coth(A)
	 */
	coth() {
		// 双曲線余接
		if(this.isZero()) {
			return Complex.POSITIVE_INFINITY;
		}
		return this.tanh().inv();
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {Complex} acoth(A)
	 */
	acoth() {
		// 逆双曲線余接
		if(this.isInfinite()) {
			return Complex.ZERO;
		}
		return this.add(1).div(this.sub(1)).log().mul(0.5);
	}

	/**
	 * Cosecant function.
	 * @returns {Complex} csc(A)
	 */
	csc() {
		// 余割
		return this.sin().inv();
	}

	/**
	 * Inverse cosecant function.
	 * @returns {Complex} acsc(A)
	 */
	acsc() {
		// 逆余割
		return this.inv().asin();
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {Complex} csch(A)
	 */
	csch() {
		// 双曲線余割
		return this.exp().sub(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {Complex} acsch(A)
	 */
	acsch() {
		// 逆双曲線余割
		return this.inv().add(this.square().inv().add(1).sqrt()).log();
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {Complex} sinc(A)
	 */
	sinc() {
		if(this.isReal()) {
			if(this._re === 0) {
				return(Complex.ONE);
			}
			const x = Math.PI * this._re;
			return new Complex(Math.sin(x) / x);
		}
		const x = this.mul(Complex.PI);
		return new Complex( x.sin().div(x) );
	}

	// ----------------------
	// 乱数
	// ----------------------
	
	/**
	 * Create random values with uniform random numbers.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Complex}
	 */
	static rand(random) {
		const rand = (random !== undefined && random instanceof Random) ? random : random_class;
		return new Complex(rand.nextDouble());
	}

	/**
	 * Create random values with normal distribution.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Complex}
	 */
	static randn(random) {
		const rand = (random !== undefined && random instanceof Random) ? random : random_class;
		return new Complex(rand.nextGaussian());
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - Math.trunc(this._re)) < tolerance_);
	}

	/**
	 * Returns true if the vallue is complex integer (including normal integer).
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} real(A) === integer && imag(A) === integer
	 */
	isComplexInteger(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - Math.trunc(this._re)) < tolerance_) &&
				(Math.abs(this._im - Math.trunc(this._im)) < tolerance_);
	}

	/**
	 * this === 0
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 0
	 */
	isZero(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance_) && (Math.abs(this._im) < tolerance_);
	}

	/**
	 * this === 1
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 1
	 */
	isOne(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance_) && (Math.abs(this._im) < tolerance_);
	}

	/**
	 * Returns true if the vallue is complex number (imaginary part is not 0).
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) !== 0
	 */
	isComplex(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance_);
	}
	
	/**
	 * Return true if the value is real number.
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) === 0
	 */
	isReal(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance_);
	}

	/**
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return isNaN(this._re) || isNaN(this._im);
	}

	/**
	 * Return true if this real part of the complex positive.
	 * @returns {boolean} real(x) > 0
	 */
	isPositive() {
		// Number.EPSILONは使用しない。どちらにぶれるか不明な点及び
		// わずかな負の数だった場合に、sqrtでエラーが発生するため
		return 0.0 < this._re;
	}

	/**
	 * real(this) < 0
	 * @returns {boolean} real(x) < 0
	 */
	isNegative() {
		return 0.0 > this._re;
	}

	/**
	 * real(this) >= 0
	 * @returns {boolean} real(x) >= 0
	 */
	isNotNegative() {
		return 0.0 <= this._re;
	}

	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this._re === Number.POSITIVE_INFINITY || this._im === Number.POSITIVE_INFINITY;
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this._re === Number.NEGATIVE_INFINITY || this._im === Number.NEGATIVE_INFINITY;
	}

	/**
	 * this === Infinity or -Infinity
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return this.isPositiveInfinity() || this.isNegativeInfinity();
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return !this.isNaN() && !this.isInfinite();
	}

	// ----------------------
	// 確率
	// ----------------------
	
	/**
	 * Log-gamma function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	gammaln() {
		return new Complex(Probability.gammaln(this._re));
	}
	
	/**
	 * Gamma function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	gamma() {
		return new Complex(Probability.gamma(this._re));
	}
	
	/**
	 * Incomplete gamma function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	gammainc(a, tail) {
		const a_ = Complex._toDouble(a);
		return new Complex(Probability.gammainc(this._re, a_, tail));
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gampdf(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gampdf(this._re, k_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gamcdf(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gamcdf(this._re, k_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gaminv(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gaminv(this._re, k_, s_));
	}

	/**
	 * Beta function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} y
	 * @returns {Complex}
	 */
	beta(y) {
		const y_ = Complex._toDouble(y);
		return new Complex(Probability.beta(this._re, y_));
	}

	/**
	 * Incomplete beta function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	betainc(a, b, tail) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betainc(this._re, a_, b_, tail));
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betapdf(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betapdf(this._re, a_, b_));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betacdf(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betacdf(this._re, a_, b_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betainv(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betainv(this._re, a_, b_));
	}

	/**
	 * Factorial function, x!.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	factorial() {
		return new Complex(Probability.factorial(this._re));
	}

	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k
	 * @returns {Complex}
	 */
	nchoosek(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.nchoosek(this._re, k_));
	}
	
	/**
	 * Error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erf() {
		return new Complex(Probability.erf(this._re));
	}

	/**
	 * Complementary error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfc() {
		return new Complex(Probability.erfc(this._re));
	}

	/**
	 * Inverse function of Error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfinv() {
		return new Complex(Probability.erfinv(this._re));
	}

	/**
	 * Inverse function of Complementary error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfcinv() {
		return new Complex(Probability.erfcinv(this._re));
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	normpdf(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.normpdf(this._re, u_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	normcdf(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.normcdf(this._re, u_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	norminv(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.norminv(this._re, u_, s_));
	}
	
	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tpdf(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tpdf(this._re, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tcdf(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tcdf(this._re, v_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tinv(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tinv(this._re, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @param {KComplexInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Complex}
	 */
	tdist(v, tails) {
		const v_ = Complex._toDouble(v);
		const tails_ = Complex._toInteger(tails);
		return new Complex(Probability.tdist(this._re, v_, tails_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tinv2(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tinv2(this._re, v_));
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2pdf(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2pdf(this._re, k_));
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2cdf(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2cdf(this._re, k_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2inv(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2inv(this._re, k_));
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	fpdf(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.fpdf(this._re, d1_, d2_));
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	fcdf(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.fcdf(this._re, d1_, d2_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	finv(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.finv(this._re, d1_, d2_));
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A & B
	 */
	and(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src & n_tgt);
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A | B
	 */
	or(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src | n_tgt);
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A ^ B
	 */
	xor(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src ^ n_tgt);
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {Complex} !A
	 */
	not() {
		const n_src = Math.round(this.real);
		return new Complex(!n_src);
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KComplexInputData} n
	 * @returns {Complex} A << n
	 */
	shift(n) {
		const src = Math.round(this.real);
		const number = Math.round(Complex._toDouble(n));
		return new Complex(src << number);
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} gcd(x, y)
	 */
	gcd(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).gcd(y);
		return new Complex(result);
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Array<Complex>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).extgcd(y);
		return [new Complex(result[0]), new Complex(result[1]), new Complex(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} lcm(x, y)
	 */
	lcm(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).lcm(y);
		return new Complex(result);
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} exponent
	 * @param {KComplexInputData} m 
	 * @returns {Complex} A^B mod m
	 */
	modPow(exponent, m) {
		const A = Math.round(this.real);
		const B = Math.round(Complex._toDouble(exponent));
		const m_ = Math.round(Complex._toDouble(m));
		const result = new BigInteger(A).modPow(B, m_);
		return new Complex(result);
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} m
	 * @returns {Complex} A^(-1) mod m
	 */
	modInverse(m) {
		const A = Math.round(this.real);
		const m_ = Math.round(Complex._toDouble(m));
		const result = new BigInteger(A).modInverse(m_);
		return new Complex(result);
	}
	
	// ----------------------
	// 素数
	// ----------------------
	
	/**
	 * Return true if the value is prime number.
	 * - Calculated as an integer.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		const src = new BigInteger(Math.round(this.real));
		return src.isPrime();
	}
	
	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const src = new BigInteger(Math.round(this.real));
		return src.isProbablePrime(certainty !== undefined ? Math.round(Complex._toDouble(certainty)) : undefined);
	}

	/**
	 * Next prime.
	 * @param {KComplexInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KComplexInputData} [search_max=100000] - Search range of next prime.
	 * @returns {Complex}
	 */
	nextProbablePrime(certainty, search_max) {
		const src = new BigInteger(Math.round(this.real));
		const p1 = certainty !== undefined ? Math.round(Complex._toDouble(certainty)) : undefined;
		const p2 = search_max !== undefined ? Math.round(Complex._toDouble(search_max)) : undefined;
		return new Complex(src.nextProbablePrime(p1, p2));
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 1
	 * @returns {Complex} 1
	 */
	static get ONE() {
		return DEFINE.ONE;
	}
	
	/**
	 * 2
	 * @returns {Complex} 2
	 */
	static get TWO() {
		return DEFINE.TWO;
	}
	
	/**
	 * 10
	 * @returns {Complex} 10
	 */
	static get TEN() {
		return DEFINE.TEN;
	}
	
	/**
	 * 0
	 * @returns {Complex} 0
	 */
	static get ZERO() {
		return DEFINE.ZERO;
	}

	/**
	 * -1
	 * @returns {Complex} -1
	 */
	static get MINUS_ONE() {
		return DEFINE.MINUS_ONE;
	}

	/**
	 * i, j
	 * @returns {Complex} i
	 */
	static get I() {
		return DEFINE.I;
	}

	/**
	 * - i, - j
	 * @returns {Complex} - i
	 */
	static get MINUS_I() {
		return DEFINE.MINUS_I;
	}

	/**
	 * PI.
	 * @returns {Complex} 3.14...
	 */
	static get PI() {
		return DEFINE.PI;
	}

	/**
	 * 0.25 * PI.
	 * @returns {Complex} 0.78...
	 */
	static get QUARTER_PI() {
		return DEFINE.QUARTER_PI;
	}

	/**
	 * 0.5 * PI.
	 * @returns {Complex} 1.57...
	 */
	static get HALF_PI() {
		return DEFINE.HALF_PI;
	}

	/**
	 * 2 * PI.
	 * @returns {Complex} 6.28...
	 */
	static get TWO_PI() {
		return DEFINE.TWO_PI;
	}

	/**
	 * E, Napier's constant.
	 * @returns {Complex} 2.71...
	 */
	static get E() {
		return DEFINE.E;
	}

	/**
	 * log_e(2)
	 * @returns {Complex} ln(2)
	 */
	static get LN2() {
		return DEFINE.LN2;
	}

	/**
	 * log_e(10)
	 * @returns {Complex} ln(10)
	 */
	static get LN10() {
		return DEFINE.LN10;
	}

	/**
	 * log_2(e)
	 * @returns {Complex} log_2(e)
	 */
	static get LOG2E() {
		return DEFINE.LOG2E;
	}
	
	/**
	 * log_10(e)
	 * @returns {Complex} log_10(e)
	 */
	static get LOG10E() {
		return DEFINE.LOG10E;
	}
	
	/**
	 * sqrt(2)
	 * @returns {Complex} sqrt(2)
	 */
	static get SQRT2() {
		return DEFINE.SQRT2;
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {Complex} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return DEFINE.SQRT1_2;
	}
	
	/**
	 * 0.5
	 * @returns {Complex} 0.5
	 */
	static get HALF() {
		return DEFINE.HALF;
	}

	/**
	 * Positive infinity.
	 * @returns {Complex} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {Complex} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {Complex} NaN
	 */
	static get NaN() {
		return DEFINE.NaN;
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Complex}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KComplexInputData} number
	 * @returns {Complex} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {Complex} fix(A), trunc(A)
	 */
	trunc() {
		return this.fix();
	}
	
}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE = {

	/**
	 * 0
	 */
	ZERO : new Complex(0),

	/**
	 * 1
	 */
	ONE : new Complex(1),

	/**
	 * 2
	 */
	TWO : new Complex(2),

	/**
	 * 10
	 */
	TEN : new Complex(10),

	/**
	 * -1
	 */
	MINUS_ONE : new Complex(-1),

	/**
	 * i, j
	 */
	I : new Complex([0, 1]),

	/**
	 * - i, - j
	 */
	MINUS_I : new Complex([0, -1]),

	/**
	 * PI.
	 */
	PI : new Complex(Math.PI),

	/**
	 * 0.25 * PI.
	 */
	QUARTER_PI : new Complex(0.25 * Math.PI),

	/**
	 * 0.5 * PI.
	 */
	HALF_PI : new Complex(0.5 * Math.PI),

	/**
	 * 2 * PI.
	 */
	TWO_PI : new Complex(2.0 * Math.PI),

	/**
	 * E, Napier's constant.
	 */
	E : new Complex(Math.E),

	/**
	 * log_e(2)
	 */
	LN2 : new Complex(Math.LN2),

	/**
	 * log_e(10)
	 */
	LN10 : new Complex(Math.LN10),

	/**
	 * log_2(e)
	 */
	LOG2E : new Complex(Math.LOG2E),

	/**
	 * log_10(e)
	 */
	LOG10E : new Complex(Math.LOG10E),

	/**
	 * sqrt(2)
	 */
	SQRT2 : new Complex(Math.SQRT2),

	/**
	 * sqrt(0.5)
	 */
	SQRT1_2 : new Complex(Math.SQRT1_2),

	/**
	 * 0.5
	 */
	HALF : new Complex(0.5),

	/**
	 * Positive infinity.
	 */
	POSITIVE_INFINITY : new Complex(Number.POSITIVE_INFINITY),

	/**
	 * Negative Infinity.
	 */
	NEGATIVE_INFINITY : new Complex(Number.NEGATIVE_INFINITY),

	/**
	 * Not a Number.
	 */
	NaN : new Complex(Number.NaN)
};

