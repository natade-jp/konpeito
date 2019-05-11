/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Random from "./tool/Random.mjs";

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
	 * @param {Complex|number|string|Array<number>} number - 複素数データ( "1 + j", [1 , 1] など)
	 */
	constructor(number) {
		// 行列で使うためイミュータブルは必ず守ること。
		if(arguments.length === 1) {
			const obj = number;
			if((obj instanceof Complex) || ((obj instanceof Object) && (obj._re && obj._im))) {
				
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
			else if(typeof obj === "number" || obj instanceof Number) {
				this._re = obj;
				this._im = 0.0;
			}
			else if(obj instanceof Array && obj.length === 2) {
				this._re = obj[0];
				this._im = obj[1];
			}
			else if(typeof obj === "string" || obj instanceof String) {
				const x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
			}
			else if(obj instanceof Object && obj.toString) {
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
	 * @param {Complex|number|string|Array<number>} number
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
	 * @param {Complex} number
	 * @returns {Complex}
	 */
	static valueOf(number) {
		return Complex.valueOf(number);
	}
	
	/**
	 * 複素数を作成
	 * @param {Complex} number 
	 * @returns {Complex}
	 * @private
	 */
	static _toComplex(number) {
		if(number instanceof Complex) {
			return number;
		}
		else {
			return new Complex(number);
		}
	}

	/**
	 * 実数を作成
	 * @param {Complex} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if((typeof number === "number") || (number instanceof Number)) {
			return number;
		}
		const x = (number instanceof Complex) ? number : new Complex(number);
		if(x.isReal()) {
			return (new Complex(number)).real;
		}
		else {
			throw "not support complex numbers.";
		}
	}

	/**
	 * 整数を作成
	 * @param {Complex} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		throw Complex._toFloat(number) | 0;
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
	 * A === B
	 * @param {Complex} number
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean} A === B
	 */
	equals(number, epsilon) {
		const x = Complex._toComplex(number);
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - x._re) <  tolerance) && (Math.abs(this._im - x._im) < tolerance);
	}

	/**
	 * 実部
	 * 戻り値は、number 型
	 * @returns {number} 実部の数値
	 */
	get real() {
		return this._re;
	}
	
	/**
	 * 虚部
	 * 戻り値は、number 型
	 * @returns {number} 虚部の数値
	 */
	get imag() {
		return this._im;
	}

	/**
	 * ノルム
	 * 極座標のノルム
	 * 戻り値は、number 型
	 * @returns {number} ノルムの数値
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
	 * 極座標の角度
	 * 戻り値は、number 型
	 * @returns {number} 偏角の数値
	 */
	get angle() {
		if(this._im === 0) {
			return 0;
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
	 * 戻り値は、number 型
	 * @returns {number} 小数点の桁数
	 */
	getDecimalPosition() {
		let point = 0;
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
	 * A + B
	 * @param {Complex} number
	 * @returns {Complex}
	 */
	add(number) {
		const x = new Complex(number);
		x._re = this._re + x._re;
		x._im = this._im + x._im;
		return x;
	}

	/**
	 * A - B
	 * @param {Complex} number
	 * @returns {Complex}
	 */
	sub(number) {
		const x = new Complex(number);
		x._re = this._re - x._re;
		x._im = this._im - x._im;
		return x;
	}

	/**
	 * A * B
	 * @param {Complex} number
	 * @returns {Complex}
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
	 * A・B, A * conj(B)
	 * @param {Complex} number
	 * @returns {Complex}
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
	 * A / B
	 * @param {Complex} number
	 * @returns {Complex}
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
	 * A mod B
	 * @param {Complex} number - 複素数を含まない数値 
	 * @returns {Complex}
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
	 * 1 / A
	 * @returns {Complex}
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
	 * 1, -1, 0の場合は0を返す。複素数の場合はノルムを1にする。
	 * @returns {Complex}
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
	 * max([A, B])
	 * @param {Complex} number
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {Complex}
	 */
	max(number, epsilon) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x, epsilon) <= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * min([A, B])
	 * @param {Complex} number
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {Complex}
	 */
	min(number, epsilon) {
		const x = Complex._toComplex(number);
		if(this.compareTo(x, epsilon) >= 0) {
			return this;
		}
		else {
			return x;
		}
	}

	/**
	 * 値同士を比較
	 * 戻り値は、number 型
	 * @param {Complex} number
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {number} A < B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, epsilon) {
		// ※実数を返す（非Complexオブジェクト）
		const x = Complex._toComplex(number);
		if(this.equals(x, epsilon)) {
			return 0;
		}
		// 実部と虚部の比較は、どちらを優先すべきか分からない
		// 符号付きでマンハッタン距離を算出して、距離の比較を行う
		const a = this.real + this.imag;
		const b = x.real + x.imag;
		return a < b ? 1 : -1;
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * 整数を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isInteger(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - (this._re | 0)) < tolerance);
	}

	/**
	 * 複素整数を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isComplexInteger(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - (this._re | 0)) < tolerance) &&
				(Math.abs(this._im - (this._im | 0)) < tolerance);
	}

	/**
	 * 0 を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isZero(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * 1 を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isOne(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance) && (Math.abs(this._im) < tolerance);
	}

	/**
	 * 複素数を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isComplex(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance);
	}
	
	/**
	 * 実数を判定
	 * @param {number} [epsilon=Number.EPSILON] - 誤差
	 * @returns {boolean}
	 */
	isReal(epsilon) {
		const tolerance = epsilon ? Complex._toFloat(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance);
	}

	/**
	 * 非数を判定
	 * @returns {boolean}
	 */
	isNaN() {
		return Math.isNaN(this._re) || Math.isNaN(this._im);
	}

	/**
	 * real(x) > 0
	 * @returns {boolean}
	 */
	isPositive() {
		// Number.EPSILONは使用しない。どちらにぶれるか不明な点及び
		// わずかな負の数だった場合に、sqrtでエラーが発生するため
		return 0.0 < this._re;
	}

	/**
	 * real(x) < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return 0.0 > this._re;
	}

	/**
	 * real(x) >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return 0.0 <= this._re;
	}

	/**
	 * 無限を判定
	 * @returns {boolean}
	 */
	isInfinite() {
		return	(this._re === Number.POSITIVE_INFINITY) ||
				(this._im === Number.POSITIVE_INFINITY) ||
				(this._re === Number.NEGATIVE_INFINITY) ||
				(this._im === Number.NEGATIVE_INFINITY);
	}
	
	/**
	 * 有限数を判定
	 * @returns {boolean}
	 */
	isFinite() {
		return !this.isNaN() && !this.isInfinite();
	}

	// ----------------------
	// 複素数
	// ----------------------
	
	/**
	 * abs(A)
	 * @returns {Complex}
	 */
	abs() {
		return new Complex(this.norm);
	}

	/**
	 * real(A) - imag(A)j 共役複素数
	 * @returns {Complex}
	 */
	conj() {
		if(this._im === 0) {
			return this;
		}
		// 共役複素数
		return new Complex([this._re, -this._im]);
	}

	/**
	 * -A
	 * @returns {Complex}
	 */
	negate() {
		return new Complex([-this._re, -this._im]);
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * pow(A, B)
	 * @param {Complex} number
	 * @returns {Complex}
	 */
	pow(number) {
		const x = new Complex(number);
		if((this.isReal()) && (x.isReal()) && (this.isNotNegative())) {
			x._re = Math.pow(this._re, x._re);
			return x;
		}
		else if(x.isReal()) {
			const r = Math.pow(this.norm, x._re);
			const s = this.angle * x._re;
			x._re = r * Math.cos(s);
			x._im = r * Math.sin(s);
			return x;
		}
		else {
			return x.mul(this.log()).exp();
		}
	}

	/**
	 * pow(A, 2)
	 * @returns {Complex}
	 */
	square() {
		return new Complex(this._re * this._re + this._im * this._im);
	}

	/**
	 * sqrt(A)
	 * @returns {Complex}
	 */
	sqrt() {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(Math.sqrt(this._re));
			}
			else {
				return new Complex([0, Math.sqrt(this._re)]);
			}
		}
		const r = Math.sqrt(this.norm);
		const s = this.angle * 0.5;
		return new Complex([r * Math.cos(s), r * Math.sin(s)]);
	}

	/**
	 * log(A)
	 * @returns {Complex}
	 */
	log() {
		if(this.isReal() && this.isNotNegative()) {
			return new Complex(Math.log(this._re));
		}
		// 負の値が入っているか、もともと複素数が入っている場合は、複素対数関数
		return new Complex([Math.log(this.norm), this.angle]);
	}

	/**
	 * exp(A)
	 * @returns {Complex}
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
	 * sin(A)
	 * @returns {Complex}
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
	 * cos(A)
	 * @returns {Complex}
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
	 * tan(A)
	 * @returns {Complex}
	 */
	tan() {
		if(this.isReal()) {
			return new Complex(Math.tan(this._re));
		}
		// 三角関数の相互関係 tan x = sin x / cos x
		return this.sin().div(this.cos());
	}

	/**
	 * atan(A)
	 * @returns {Complex}
	 */
	atan() {
		if(this.isReal()) {
			return new Complex(Math.atan(this._re));
		}
		// 逆正接 tan-1 x = i/2 log( i+x / i-x )
		return Complex.I.div(Complex.TWO).mul(Complex.I.add(this).div(Complex.I.sub(this)).log());
	}

	/**
	 * atan2(Y, X)
	 * @param {Complex} [number] - 実数。省略した場合は、本オブジェクトの複素数の偏角を返す。
	 * @returns {Complex}
	 */
	atan2(number) {
		if(arguments.length === 0) {
			return new Complex(this.angle);
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
	 * sinc(A)
	 * @returns {Complex}
	 */
	sinc() {
		if(this.isReal()) {
			if(this._re === 0) {
				return(Complex.ONE);
			}
			return new Complex(Math.sin(this._re) / this._re);
		}
		return new Complex( this.sin().div(this) );
	}

	// ----------------------
	// 丸め
	// ----------------------
	
	/**
	 * floor(A)
	 * @returns {Complex}
	 */
	floor() {
		return new Complex([Math.floor(this._re), Math.floor(this._im)]);
	}

	/**
	 * ceil(A)
	 * @returns {Complex}
	 */
	ceil() {
		return new Complex([Math.ceil(this._re), Math.ceil(this._im)]);
	}
	
	/**
	 * round(A)
	 * @returns {Complex}
	 */
	round() {
		return new Complex([Math.round(this._re), Math.round(this._im)]);
	}

	/**
	 * fix(A) 小数部を取り除く
	 * @returns {Complex}
	 */
	fix() {
		return new Complex([this._re | 0, this._im | 0]);
	}

	/**
	 * fract(A) 小数部の抽出
	 * @returns {Complex}
	 */
	fract() {
		return new Complex([this._re - (this._re | 0), this._im - (this._im | 0)]);
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 1
	 * @returns {Complex}
	 */
	static get ONE() {
		return DEFINE.ONE;
	}
	
	/**
	 * 2
	 * @returns {Complex}
	 */
	static get TWO() {
		return DEFINE.TWO;
	}
	
	/**
	 * 10
	 * @returns {Complex}
	 */
	static get TEN() {
		return DEFINE.TEN;
	}
	
	/**
	 * 0
	 * @returns {Complex}
	 */
	static get ZERO() {
		return DEFINE.ZERO;
	}

	/**
	 * -1
	 * @returns {Complex}
	 */
	static get MINUS_ONE() {
		return DEFINE.MINUS_ONE;
	}

	/**
	 * i, j
	 * @returns {Complex}
	 */
	static get I() {
		return DEFINE.I;
	}

	/**
	 * PI
	 * @returns {Complex}
	 */
	static get PI() {
		return DEFINE.PI;
	}

	/**
	 * 0.5
	 * @returns {Complex}
	 */
	static get HALF() {
		return DEFINE.HALF;
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
	HALF : new Complex(0.5)
};

