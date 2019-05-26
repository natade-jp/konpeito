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
 * Complex 内で使用する乱数生成クラス
 */
const random_class = new Random();

/**
 * Complex 内で使用する関数群
 */
class ComplexTool {

	/**
	 * 文字列から複素数を解析する
	 * @param {string} text - 解析したい文字列
	 * @returns {{real : number, imag : number}}
	 */
	static ToComplexFromString(text) {
		const str = text.replace(/\s/g, "").toLowerCase();
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
		buff = str.match(/[+-]?[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?($|[+-])/);
		if(buff) {
			re = parseFloat(buff[0]);
		}
		// 複素数は数値が省略される場合がある
		buff = str.match(/[+-]?([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)?[ij]/);
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
 * 複素数クラス (immutable)
 */
export default class Complex {

	/**
	 * 複素数を作成
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - 複素数( "1 + j", [1 , 1] など)
	 */
	constructor(number) {
		// 行列で使うためイミュータブルは必ず守ること。
		if(arguments.length === 1) {
			const obj = number;
			if(obj instanceof Complex) {
				
				/**
				 * 実部
				 * @private
				 * @type {number}
				 */
				this._re = obj._re;
				
				/**
				 * 虚部
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
	 * Complex を作成
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
	 * 指定した数値から Complex 型に変換
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex}
	 */
	static valueOf(number) {
		return Complex.valueOf(number);
	}
	
	/**
	 * 複素数を作成
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
	 * 実数を作成
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
	 * 整数を作成
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		throw Complex._toDouble(number) | 0;
	}

	/**
	 * 32ビット整数に変換
	 * @returns {number}
	 */
	get intValue() {
		return this.real | 0;
	}

	/**
	 * 64ビット実数に変換
	 * @returns {number}
	 */
	get doubleValue() {
		return this.real;
	}

	/**
	 * ディープコピー
	 * @returns {Complex} 
	 */
	clone() {
		return this;
	}

	/**
	 * 文字列データ
	 * @returns {string} 
	 */
	toString() {
		const formatG = function(x) {
			let numstr = x.toPrecision(6);
			if(numstr.indexOf(".") !== -1) {
				numstr = numstr.replace(/\.?0+$/, "");  // 1.00 , 1.10
				numstr = numstr.replace(/\.?0+e/, "e"); // 1.0e , 1.10e
			}
			return numstr;
		};
		if(!this.isReal()) {
			if(this._re === 0) {
				return formatG(this._im) + "i";
			}
			else if(this._im >= 0) {
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
	 * ランダムな値を作成
	 * @returns {Complex}
	 */
	static rand() {
		return new Complex(random_class.nextDouble());
	}

	/**
	 * 正規分布に従うランダムな値を作成
	 * @returns {Complex}
	 */
	static randn() {
		return new Complex(random_class.nextGaussian());
	}

	/**
	 * 等式
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} A === B
	 */
	equals(number, epsilon) {
		const x = Complex._toComplex(number);
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - x._re) <  tolerance) && (Math.abs(this._im - x._im) < tolerance);
	}

	/**
	 * 実部
	 * @returns {number} real(A)
	 */
	get real() {
		return this._re;
	}
	
	/**
	 * 虚部
	 * @returns {number} imag(A)
	 */
	get imag() {
		return this._im;
	}

	/**
	 * ノルム
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
	 * 偏角
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
	 * 実部、虚部を表す際の小数点以下の桁数
	 * @returns {number} 小数点の桁数
	 */
	getDecimalPosition() {
		let point = 0;

		/**
		 * @type Complex
		 */
		let x = this;
		for(let i = 0; i < 20; i++) {
			if(x.isComplexInteger()) {
				break;
			}
			x = x.mul(Complex.TEN);
			point++;
		}
		return point;
	}

	/**
	 * 加算
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
	 * 減算
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
	 * 乗算
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
	 * ドット積
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
	 * 割り算
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
	 * 割り算の正の余り
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - 複素数を含まない数値 
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
	 * 逆数
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
	 * 符号値
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
	 * 最大値
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {Complex} max([A, B])
	 */
	max(number, epsilon) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x, epsilon) >= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * 最小値
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {Complex} min([A, B])
	 */
	min(number, epsilon) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x, epsilon) <= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * 値同士を比較
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
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

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * 整数を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean}
	 */
	isInteger(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - (this._re | 0)) < tolerance);
	}

	/**
	 * 複素整数（整数も含む）を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} real(A) === 整数 && imag(A) === 整数
	 */
	isComplexInteger(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - (this._re | 0)) < tolerance) &&
				(Math.abs(this._im - (this._im | 0)) < tolerance);
	}

	/**
	 * 0 を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} A === 0
	 */
	isZero(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * 1 を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} A === 1
	 */
	isOne(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * 複素数（虚部が0以外）を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} imag(A) !== 0
	 */
	isComplex(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance);
	}
	
	/**
	 * 実数を判定
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
	 * @returns {boolean} imag(A) === 0
	 */
	isReal(epsilon) {
		const tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance);
	}

	/**
	 * 非数を判定
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return isNaN(this._re) || isNaN(this._im);
	}

	/**
	 * 実部の正数を判定
	 * @returns {boolean} real(x) > 0
	 */
	isPositive() {
		// Number.EPSILONは使用しない。どちらにぶれるか不明な点及び
		// わずかな負の数だった場合に、sqrtでエラーが発生するため
		return 0.0 < this._re;
	}

	/**
	 * 実部の負数を判定
	 * @returns {boolean} real(x) < 0
	 */
	isNegative() {
		return 0.0 > this._re;
	}

	/**
	 * 実部の非負値を判定
	 * @returns {boolean} real(x) >= 0
	 */
	isNotNegative() {
		return 0.0 <= this._re;
	}

	/**
	 * 無限を判定
	 * @returns {boolean} isInfinite(A)
	 */
	isInfinite() {
		return	(this._re === Number.POSITIVE_INFINITY) ||
				(this._im === Number.POSITIVE_INFINITY) ||
				(this._re === Number.NEGATIVE_INFINITY) ||
				(this._im === Number.NEGATIVE_INFINITY);
	}
	
	/**
	 * 有限数を判定
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return !this.isNaN() && !this.isInfinite();
	}

	// ----------------------
	// 複素数
	// ----------------------
	
	/**
	 * 絶対値
	 * @returns {Complex} abs(A)
	 */
	abs() {
		return new Complex(this.norm);
	}

	/**
	 * 共役複素数
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
	 * 負数
	 * @returns {Complex} -A
	 */
	negate() {
		return new Complex([-this._re, -this._im]);
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * 累乗
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
	 * @returns {Complex} pow(A, B)
	 */
	pow(number) {
		const x = new Complex(number);
		if((this.isReal()) && (x.isReal()) && (this.isNotNegative())) {
			x._re = Math.pow(this._re, x._re);
			return x;
		}
		else if(x.isReal()) {
			const r = Math.pow(this.norm, x._re);
			const s = this.arg * x._re;
			x._re = r * Math.cos(s);
			x._im = r * Math.sin(s);
			return x;
		}
		else {
			return x.mul(this.log()).exp();
		}
	}

	/**
	 * 2乗
	 * @returns {Complex} pow(A, 2)
	 */
	square() {
		if(this._im === 0.0) {
			return new Complex(this._re * this._re);
		}
		return this.mul(this);
	}

	/**
	 * 平方根
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
	 * 対数
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
	 * 指数
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
	 * sin
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
	 * cos
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
	 * tan
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
	 * atan
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
	 * atan2
	 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - 実数で指定。省略時は、本オブジェクトの偏角を返す。
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
	 * 正規化 sinc
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
	 * floor
	 * @returns {Complex} floor(A)
	 */
	floor() {
		return new Complex([Math.floor(this._re), Math.floor(this._im)]);
	}

	/**
	 * ceil
	 * @returns {Complex} ceil(A)
	 */
	ceil() {
		return new Complex([Math.ceil(this._re), Math.ceil(this._im)]);
	}
	
	/**
	 * 四捨五入
	 * @returns {Complex} round(A)
	 */
	round() {
		return new Complex([Math.round(this._re), Math.round(this._im)]);
	}

	/**
	 * 整数化
	 * @returns {Complex} fix(A)
	 */
	fix() {
		return new Complex([this._re | 0, this._im | 0]);
	}

	/**
	 * 小数部の抽出
	 * @returns {Complex} fract(A) 
	 */
	fract() {
		return new Complex([this._re - (this._re | 0), this._im - (this._im | 0)]);
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
	 * PI
	 * @returns {Complex} 3.14...
	 */
	static get PI() {
		return DEFINE.PI;
	}

	/**
	 * E
	 * @returns {Complex} 2.71...
	 */
	static get E() {
		return DEFINE.E;
	}

	/**
	 * LN2
	 * @returns {Complex} ln(2)
	 */
	static get LN2() {
		return DEFINE.LN2;
	}

	/**
	 * LN10
	 * @returns {Complex} ln(10)
	 */
	static get LN10() {
		return DEFINE.LN10;
	}

	/**
	 * LOG2E
	 * @returns {Complex} log_2(e)
	 */
	static get LOG2E() {
		return DEFINE.LOG2E;
	}
	
	/**
	 * LOG10E
	 * @returns {Complex} log_10(e)
	 */
	static get LOG10E() {
		return DEFINE.LOG10E;
	}
	
	/**
	 * SQRT2
	 * @returns {Complex} sqrt(2)
	 */
	static get SQRT2() {
		return DEFINE.SQRT2;
	}
	
	/**
	 * SQRT1_2
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
	 * 正の無限大
	 * @returns {Complex} Inf
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE.POSITIVE_INFINITY;
	}
	
	/**
	 * 負の無限大
	 * @returns {Complex} -Inf
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE.NEGATIVE_INFINITY;
	}

	/**
	 * 非数
	 * @returns {Complex} NaN
	 */
	static get NaN() {
		return DEFINE.NaN;
	}

}

/**
 * 内部で使用する定数値
 */
const DEFINE = {
	ZERO : new Complex(0),
	ONE : new Complex(1),
	TWO : new Complex(2),
	TEN : new Complex(10),
	MINUS_ONE : new Complex(-1),
	I : new Complex([0, 1]),
	PI : new Complex(Math.PI),
	E : new Complex(Math.E),
	LN2 : new Complex(Math.LN2),
	LN10 : new Complex(Math.LN10),
	LOG2E : new Complex(Math.LOG2E),
	LOG10E : new Complex(Math.LOG10E),
	SQRT2 : new Complex(Math.SQRT2),
	SQRT1_2 : new Complex(Math.SQRT1_2),
	HALF : new Complex(0.5),
	POSITIVE_INFINITY : new Complex(Number.POSITIVE_INFINITY),
	NEGATIVE_INFINITY : new Complex(Number.NEGATIVE_INFINITY),
	NaN : new Complex(Number.NaN)
};

