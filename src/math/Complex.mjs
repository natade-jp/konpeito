/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */
// @ts-check

// @ts-ignore
import Random from "./tools/Random.mjs";

// @ts-ignore
import Matrix from "./Matrix.mjs";

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
	 * Initialization can be performed as follows.
	 * - "3 + 4i", "4j + 3", [3, 4].
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - Complex number. See how to use the function.
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
			else if(obj instanceof Array) {
				if(obj.length === 2) {
					this._re = obj[0];
					this._im = obj[1];
				}
				else {
					throw "Complex Unsupported argument " + arguments;
				}
			}
			else if(typeof obj === "string") {
				const x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
			}
			else if((obj instanceof Object) && (typeof obj._re === "number") && (typeof obj._im === "number")) {
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex}
	 */
	static valueOf(number) {
		return Complex.create(number);
	}
	
	/**
	 * Convert to Complex.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		return Math.trunc(Complex._toDouble(number));
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		return Math.trunc(this.real);
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		return this.real;
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
	 * Create random values with uniform random numbers.
	 * @returns {Complex}
	 */
	static rand() {
		return new Complex(random_class.nextDouble());
	}

	/**
	 * Create random values with normal distribution.
	 * @returns {Complex}
	 */
	static randn() {
		return new Complex(random_class.nextGaussian());
	}

	/**
	 * Equals.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, epsilon) {
		const x = Complex._toComplex(number);
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		// 無限大、非数の値も含めて一度確認
		if((this._re === x._re) && (this._im === x._im)) {
			return true;
		}
		// 誤差を含んだ値の比較
		return (Math.abs(this._re - x._re) <  tolerance) && (Math.abs(this._im - x._im) < tolerance);
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
	 * Add.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
	 * @returns {Complex} A + B
	 */
	add(number) {
		const x = new Complex(number);
		x._re = this._re + x._re;
		x._im = this._im + x._im;
		return x;
	}

	/**
	 * Subtract.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex} A - B
	 */
	sub(number) {
		const x = new Complex(number);
		x._re = this._re - x._re;
		x._im = this._im - x._im;
		return x;
	}

	/**
	 * Multiply.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex} A * B
	 */
	mul(number) {
		const x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = - this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			const re = this._re * x._re - this._im * x._im;
			const im = this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	}
	
	/**
	 * Inner product/Dot product.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex} A * conj(B)
	 */
	dot(number) {
		const x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			const re = this._re * x._re + this._im * x._im;
			const im = - this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	}
	
	/**
	 * Divide.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex} A / B
	 */
	div(number) {
		const x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re / x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im / x._im;
			x._im = 0;
			return x;
		}
		else {
			const re = this._re * x._re + this._im * x._im;
			const im = this._im * x._re - this._re * x._im;
			const denominator = 1.0 / (x._re * x._re + x._im * x._im);
			x._re = re * denominator;
			x._im = im * denominator;
			return x;
		}
	}

	/**
	 * Modulo, positive remainder of division.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - Divided value (real number only).
	 * @returns {Complex} A mod B
	 */
	mod(number) {
		const x = new Complex(number);
		if((this._im !== 0) || (x._im !== 0)) {
			throw "calculation method is undefined.";
		}
		let _re = this._re - x._re * (0 | (this._re / x._re));
		if(_re < 0) {
			_re += x._re;
		}
		x._re = _re;
		return x;
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

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Complex} [-1,1] 複素数の場合はノルムを1にした値。
	 */
	sign() {
		if(this._im === 0) {
			if(this._re === 0) {
				return new Complex(0);
			}
			else {
				return new Complex(this._re > 0 ? 1 : -1);
			}
		}
		return this.div(this.norm);
	}
	
	/**
	 * Compare values.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, epsilon) {
		const x1 = this;
		const x2 = Complex._toComplex(number);
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		const a = x1.real + x1.imag;
		const b = x2.real + x2.imag;
		if((Math.abs(a - b) < tolerance)) {
			return 0;
		}
		return a > b ? 1 : -1;
	}
	
	/**
	 * Maximum number.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} min 
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} max
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
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - Math.trunc(this._re)) < tolerance);
	}

	/**
	 * Returns true if the vallue is complex integer (including normal integer).
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} real(A) === integer && imag(A) === integer
	 */
	isComplexInteger(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - Math.trunc(this._re)) < tolerance) &&
				(Math.abs(this._im - Math.trunc(this._im)) < tolerance);
	}

	/**
	 * this === 0
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 0
	 */
	isZero(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * this === 1
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 1
	 */
	isOne(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * Returns true if the vallue is complex number (imaginary part is not 0).
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) !== 0
	 */
	isComplex(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance);
	}
	
	/**
	 * Return true if the value is real number.
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) === 0
	 */
	isReal(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance);
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
	 * @returns {boolean} isInfinite(A)
	 */
	isInfinite() {
		return	(this._re === Number.POSITIVE_INFINITY) ||
				(this._im === Number.POSITIVE_INFINITY) ||
				(this._re === Number.NEGATIVE_INFINITY) ||
				(this._im === Number.NEGATIVE_INFINITY);
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return !this.isNaN() && !this.isInfinite();
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
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
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - X
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
	 * @returns {Complex} fix(A)
	 */
	fix() {
		return new Complex([Math.trunc(this._re), Math.trunc(this._im)]);
	}

	/**
	 * Fraction.
	 * @returns {Complex} fract(A)
	 */
	fract() {
		return new Complex([this._re - Math.trunc(this._re), this._im - Math.trunc(this._im)]);
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
	 * Pi.
	 * @returns {Complex} 3.14...
	 */
	static get PI() {
		return DEFINE.PI;
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
	 * Pi.
	 */
	PI : new Complex(Math.PI),

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

