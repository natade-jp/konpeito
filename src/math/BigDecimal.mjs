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
import BigInteger from "./BigInteger.mjs";

// @ts-ignore
import RoundingMode, {RoundingModeEntity} from "./context/RoundingMode.mjs";

// @ts-ignore
import MathContext from "./context/MathContext.mjs";

/**
 * Setting of calculation result of division.
 * @typedef {Object} BigDecimalDivideType
 * @property {number} [scale] Scale of rounding.
 * @property {RoundingModeEntity} [roundingMode] Rounding mode.
 * @property {MathContext} [context] Configuration.(scale and roundingMode are unnecessary.)
 */

/**
 * Default MathContext class.
 * Used when MathContext not specified explicitly.
 * @type {MathContext}
 * @ignore
 */
let DEFAULT_CONTEXT = MathContext.DECIMAL128;

/**
 * Collection of functions used in BigDecimal.
 * @ignore
 */
class BigDecimalTool {

	/**
	 * Create data for BigDecimal from strings.
	 * @param {string} ntext 
	 * @returns {{scale : number, integer : BigInteger}}
	 */
	static ToBigDecimalFromString(ntext) {
		let scale = 0;
		let buff;
		// 正規化
		let text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		let number_text = "";
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				number_text += "-";
			}
		}
		// 整数部があるか
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text += buff;
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text += buff;
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale   = scale - parseInt(buff, 10);
		}
		return {
			scale : scale,
			integer : new BigInteger([number_text, 10])
		};
	}

	/**
	 * Create data for BigDecimal from number.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} value 
	 * @returns {{scale : number, integer : BigInteger}}
	 */
	static ToBigDecimalFromNumber(value) {
		// 整数
		if(value === Math.floor(value)) {
			return {
				scale : 0,
				integer : new BigInteger(Math.round(value))
			};
		}
		// 浮動小数
		else {
			let scale = Math.trunc(Math.log(Math.abs(value)) / Math.log(10));
			let x = value / Math.pow(10, scale);
			// スケールを逆にする
			scale = - scale;
			for(let i = 0; i < 14; i++) {
				x = x * 10;
				scale = scale + 1;
				if(Math.abs(x - Math.round(x)) <= Number.EPSILON) {
					break;
				}
			}
			// 最も下の桁は四捨五入する
			x = Math.round(x * 1e14) / 1e14;
			return {
				scale : scale,
				integer : new BigInteger(x)
			};
			// 64ビットの実数型は15桁程度まで正しい
			// 余裕をもって12桁程度までを抜き出すのが良いかと思われる。
		}
	}
}

/**
 * Arbitrary-precision floating-point number class (immutable).
 * - Sorry. Infinity and NaN do not correspond yet.
 */
export default class BigDecimal {
	
	/**
	 * Create an arbitrary-precision floating-point number.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3"
	 * - When initializing with array. [ integer, [scale = 0], [context=default]].
	 * - When initializing with object. { integer, [scale = 0], [context=default]}.
	 * 
	 * Description of the settings are as follows, you can also omitted.
	 * - The "scale" is an integer scale factor.
	 * - The "context" is used to normalize the created floating point.
	 * 
	 * If "context" is not specified, the "default_context" set for the class is used.
	 * The "context" is the used when no environment settings are specified during calculation.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,context:?MathContext}|BigInteger|Object} number - Real data.
	 */
	constructor(number) {

		/**
		 * The scale of this BigDecimal.
		 * @private
		 * @type {number}
		 */
		this._scale	= 0;
		
		/**
		 * Context used during initialization.
		 * @private
		 * @type {MathContext}
		 */
		this.default_context = DEFAULT_CONTEXT;

		// この値がtrueの場合は最後に正規化を実行する
		let is_set_context = false;

		if(arguments.length > 1) {
			throw "BigDecimal Unsupported argument[" + arguments.length + "]";
		}
		if(number instanceof BigDecimal) {

			/**
			 * Integer part.
			 * @private
			 * @type {BigInteger}
			 */
			this.integer			= number.integer.clone();

			this._scale				= number._scale;
			
			/**
			 * Integer part of string (for cache).
			 * @private
			 * @type {string}
			 */
			this.int_string			= number.int_string;

			this.default_context	= number.default_context;

		}
		else if(typeof number === "number") {
			const data = BigDecimalTool.ToBigDecimalFromNumber(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				const prm1 = number[0];
				if(typeof prm1 === "number") {
					const data = BigDecimalTool.ToBigDecimalFromNumber(prm1);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
				else if(prm1 instanceof BigDecimal) {
					this.integer			= prm1.integer.clone();
					this._scale				= prm1._scale;
				}
				else if(prm1 instanceof BigInteger) {
					this.integer			= prm1.clone();
				}
				else if((prm1 instanceof Object) && (prm1.toBigDecimal)) {
					const data				= prm1.toBigDecimal();
					this.integer			= data.integer;
					this._scale				= data._scale;
				}
				else if((prm1 instanceof Object) && (prm1.doubleValue)) {
					const data = BigDecimalTool.ToBigDecimalFromNumber(prm1.doubleValue);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
				else {
					const data = BigDecimalTool.ToBigDecimalFromString(prm1.toString());
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number" || number[1] instanceof Number) {
					// 2つめが数値の場合は、2つ目をスケール値として使用する
					this._scale	= number[1];
					if(number.length >= 3) {
						this.default_context = number[2] !== undefined ? number[2] : DEFAULT_CONTEXT;
						is_set_context = true;
					}
				}
				else {
					if(number.length >= 2) {
						this.default_context = number[1] !== undefined ? number[1] : DEFAULT_CONTEXT;
						is_set_context = true;
					}
				}
			}
		}
		else if(typeof number === "string") {
			const data = BigDecimalTool.ToBigDecimalFromString(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(number instanceof BigInteger) {
			this.integer	= number.clone();
		}
		else if((number instanceof Object) && (number.toBigDecimal)) {
			const data				= number.toBigDecimal();
			this.integer			= data.integer;
			this._scale				= data._scale;
			this.default_context	= data.default_context;
		}
		else if((number instanceof Object) && (number.scale !== undefined && number.default_context !== undefined)) {
			this.integer	= new BigInteger(number.integer);
			if(number.scale) {
				this._scale = number.scale;
			}
			if(number.context) {
				this.default_context = number.context;
				is_set_context = true;
			}
		}
		else if((number instanceof Object) && (number.doubleValue)) {
			const data = BigDecimalTool.ToBigDecimalFromNumber(number.doubleValue);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(number instanceof Object) {
			const data = BigDecimalTool.ToBigDecimalFromString(number.toString());
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else {
			throw "BigDecimal Unsupported argument " + arguments;
		}
		// データを正規化
		if(is_set_context) {
			const newbigdecimal = this.round(this.default_context);
			this.integer	= newbigdecimal.integer;
			this._scale		= newbigdecimal._scale;
			delete this.int_string;
		}
		// データが正しいかチェックする
		if((!(this.integer instanceof BigInteger)) || (!(this.default_context instanceof MathContext))) {
			throw "BigDecimal Unsupported argument " + arguments;
		}
	}

	/**
	 * Create an arbitrary-precision floating-point number.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3"
	 * - When initializing with array. [ integer, [scale = 0], [context=default]].
	 * - When initializing with object. { integer, [scale = 0], [context=default]}.
	 * 
	 * Description of the settings are as follows, you can also omitted.
	 * - The "scale" is an integer scale factor.
	 * - The "context" is used to normalize the created floating point.
	 * 
	 * If "context" is not specified, the "default_context" set for the class is used.
	 * The "context" is the used when no environment settings are specified during calculation.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
	 * @returns {BigDecimal}
	 */
	static create(number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	}

	/**
	 * Create a number using settings of this number.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
	 * @param {MathContext} [mc] - Setting preferences when creating objects.
	 * @returns {BigDecimal}
	 */
	createUsingThisSettings(number, mc) {
		if(mc) {
			return new BigDecimal([number, mc]);
		}
		else {
			return new BigDecimal([number, this.default_context]);
		}
	}

	/**
	 * Convert number to BigDecimal type.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} x 
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [scale] 
	 * @returns {BigDecimal}
	 */
	static valueOf(x, scale) {
		if(arguments.length === 1) {
			return new BigDecimal(x);
		}
		else {
			return new BigDecimal([x, scale]);
		}
	}

	/**
	 * Convert to BigDecimal.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @returns {BigDecimal}
	 * @private
	 */
	static _toBigDecimal(number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	}

	/**
	 * Convert to BigInteger.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @returns {BigInteger}
	 * @private
	 */
	static _toBigInteger(number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.toBigInteger();
		}
		else {
			return new BigInteger(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.doubleValue;
		}
		else {
			return (new BigDecimal(number)).doubleValue;
		}
	}

	/**
	 * Convert to integer.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		if(typeof number === "number") {
			return Math.trunc(number);
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	}

	/**
	 * Return string of this number without sign.
	 * If cache is already created, return cache.
	 * @returns {string} 
	 */
	_getUnsignedIntegerString() {
		// キャッシュする
		if(typeof this.int_string === "undefined") {
			this.int_string = this.integer.toString(10).replace(/^-/, "");
		}
		return this.int_string;
	}

	/**
	 * Deep copy.
	 * @returns {BigDecimal} 
	 */
	clone() {
		return new BigDecimal(this);
	}
	
	/**
	 * The scale of this BigDecimal.
	 * @returns {number} 
	 */
	scale() {
		return this._scale;
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {number}
	 */
	signum() {
		return this.integer.signum();
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {number}
	 */
	sign() {
		return this.signum();
	}

	/**
	 * Precision.
	 * @returns {number} 
	 */
	precision() {
		return this._getUnsignedIntegerString().length;
	}

	/**
	 * An integer with the exponent part removed.
	 * @returns {BigInteger} 
	 */
	unscaledValue() {
		return new BigInteger(this.integer);
	}

	/**
	 * The smallest value that can be represented with the set precision.
	 * @returns {BigDecimal} 
	 */
	ulp() {
		return new BigDecimal([BigInteger.ONE, this.scale()]);
	}

	/**
	 * Absolute value.
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} abs(A)
	 */
	abs(mc) {
		const output = this.clone();
		output.integer = output.integer.abs();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * this * 1
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
	 * @returns {BigDecimal} +A
	 */
	plus(mc) {
		const output = this.clone();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * this * -1
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
	 * @returns {BigDecimal} -A
	 */
	negate(mc) {
		const output = this.clone();
		output.integer = output.integer.negate();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * Move the decimal point to the left.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
	 * @returns {BigDecimal} 
	 */
	movePointLeft(n) {
		const x = BigDecimal._toInteger(n);
		let output = this.scaleByPowerOfTen( -x );
		output = output.setScale(Math.max(this.scale() + x, 0));
		return output;
	}

	/**
	 * Move the decimal point to the right.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
	 * @returns {BigDecimal} 
	 */
	movePointRight(n) {
		const x = BigDecimal._toInteger(n);
		let output = this.scaleByPowerOfTen( x );
		output = output.setScale(Math.max(this.scale() - x, 0));
		return output;
	}

	/**
	 * Remove the 0 to the right of the numbers and normalize the scale.
	 * @returns {BigDecimal} 
	 */
	stripTrailingZeros() {
		// 0をできる限り取り除く
		const sign		= this.signum();
		const sign_text	= sign >= 0 ? "" : "-";
		const text		= this.integer.toString(10).replace(/^-/, "");
		const zeros		= text.match(/0+$/);
		let zero_length	= (zeros !== null) ? zeros[0].length : 0;
		if(zero_length === text.length) {
			// 全て 0 なら 1 ケタ残す
			zero_length = text.length - 1;
		}
		const newScale	= this.scale() - zero_length;
		return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), newScale]);
	}

	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A + B
	 */
	add(number, context) {
		const augend = BigDecimal._toBigDecimal(number);
		const mc = context ? context : augend.default_context;
		const src			= this;
		const tgt			= augend;
		const newscale	= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			// 1 e1 + 1 e1 = 1
			return new BigDecimal([src.integer.add(tgt.integer), newscale, mc]);
		}
		else if(src._scale > tgt._scale) {
			// 1 e-2 + 1 e-1
			const newdst = tgt.setScale(src._scale);
			// 0.01 + 0.10 = 0.11 = 11 e-2
			return new BigDecimal([src.integer.add(newdst.integer), newscale, mc]);
		}
		else {
			// 1 e-1 + 1 e-2
			const newsrc = src.setScale(tgt._scale);
			// 0.1 + 0.01 = 0.11 = 11 e-2
			return new BigDecimal([newsrc.integer.add(tgt.integer), newscale, mc]);
		}
	}

	/**
	 * Subtract.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A - B
	 */
	subtract(number, context) {
		const subtrahend = BigDecimal._toBigDecimal(number);
		const mc = context ? context : subtrahend.default_context;
		const src			= this;
		const tgt			= subtrahend;
		const newscale	= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			return new BigDecimal([src.integer.subtract(tgt.integer), newscale, mc]);
		}
		else if(src._scale > tgt._scale) {
			const newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.subtract(newdst.integer), newscale, mc]);
		}
		else {
			const newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.subtract(tgt.integer), newscale, mc]);
		}
	}

	/**
	 * Subtract.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A - B
	 */
	sub(number, context) {
		return this.subtract(number, context);
	}

	/**
	 * Multiply.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A * B
	 */
	multiply(number, context) {
		const multiplicand = BigDecimal._toBigDecimal(number);
		const mc = context ? context : multiplicand.default_context;
		const src			= this;
		const tgt			= multiplicand;
		const newinteger	= src.integer.multiply(tgt.integer);
		// 0.1 * 0.01 = 0.001
		const newscale	= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	}

	/**
	 * Multiply.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A * B
	 */
	mul(number, context) {
		return this.multiply(number, context);
	}

	/**
	 * Divide not calculated to the decimal point.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} (int)(A / B)
	 */
	divideToIntegralValue(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		const mc = context ? context : divisor.default_context;
		const getDigit  = function( num ) {
			let i;
			let text = "1";
			for(i = 0; i < num; i++) {
				text = text + "0";
			}
			return new BigInteger(text);
		};
		if(divisor.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		// 1000e0		/	1e2				=	1000e-2
		// 1000e0		/	10e1			=	100e-1
		// 1000e0		/	100e0			=	10e0
		// 1000e0		/	1000e-1			=	1e1
		// 1000e0		/	10000e-2		=	1e1
		// 1000e0		/	100000e-3		=	1e1

		// 10e2			/	100e0			=	1e1
		// 100e1		/	100e0			=	1e1
		// 1000e0		/	100e0			=	10e0
		// 10000e-1		/	100e0			=	100e-1	
		// 100000e-2	/	100e0			=	1000e-2

		const src		= this;
		const tgt		= divisor;
		let src_integer	= src.integer;
		let tgt_integer	= tgt.integer;
		const newScale	= src._scale - tgt._scale;

		// 100e-2 / 3e-1 = 1 / 0.3 -> 100 / 30
		if(src._scale > tgt._scale) {
			// src._scale に合わせる
			tgt_integer = tgt_integer.multiply(getDigit(  newScale ));
		}
		// 1e-1 / 3e-2 = 0.1 / 0.03 -> 10 / 3
		else if(src._scale < tgt._scale) {
			// tgt._scale に合わせる
			src_integer = src_integer.multiply(getDigit( -newScale ));
		}

		// とりあえず計算結果だけ作ってしまう
		const new_integer	= src_integer.divide(tgt_integer);
		const sign			= new_integer.signum();
		if(sign !== 0) {
			const text	= new_integer.toString(10).replace(/^-/, "");
			// 指定した桁では表すことができない
			if((mc.getPrecision() !== 0) && (text.length > mc.getPrecision())) {
				throw "ArithmeticException";
			}
			// 結果の優先スケール に合わせる (this.scale() - divisor.scale())
			if(text.length <= (-newScale)) {
				// 合わせることができないので、0をできる限り削る = stripTrailingZerosメソッド
				const zeros			= text.match(/0+$/);
				const zero_length	= (zeros !== null) ? zeros[0].length : 0;
				const sign_text		= sign >= 0 ? "" : "-";
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), -zero_length, mc]);
			}
		}

		let output = new BigDecimal(new_integer);
		output = output.setScale(newScale, RoundingMode.UP);
		output = output.round(mc);
		output.default_context = mc;
		return output;
	}

	/**
	 * Divide and remainder.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
	 */
	divideAndRemainder(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		const mc = context ? context : divisor.default_context;

		// 1000e0		/	1e2				=	1000e-2	... 0e0
		// 1000e0		/	10e1			=	100e-1	... 0e0
		// 1000e0		/	100e0			=	10e0	... 0e0
		// 1000e0		/	1000e-1			=	1e1		... 0e0
		// 1000e0		/	10000e-2		=	1e1		... 0e-1
		// 1000e0		/	100000e-3		=	1e1		... 0e-2

		// 10e2			/	100e0			=	1e1		... 0e1
		// 100e1		/	100e0			=	1e1		... 0e1
		// 1000e0		/	100e0			=	10e0	... 0e0
		// 10000e-1		/	100e0			=	100e-1	... 0e-1
		// 100000e-2	/	100e0			=	1000e-2	... 0e-2

		const result_divide	= this.divideToIntegralValue(divisor, mc);
		const result_remaind	= this.subtract(result_divide.multiply(divisor, mc), mc);

		const output = [result_divide, result_remaind];
		return output;
	}

	/**
	 * Remainder of division.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A % B
	 */
	rem(number, context) {
		return this.divideAndRemainder(number, context)[1];
	}

	/**
	 * Modulo, positive remainder of division.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A mod B
	 */
	mod(number, context) {
		const x = this.rem(number, context);
		if(x.compareTo(BigDecimal.ZERO) < 0) {
			return x.add(number, context);
		}
		else {
			return x;
		}
	}

	/**
	 * Divide.
	 * - The argument can specify the scale after calculation.
	 * - In the case of precision infinity, it may generate an error by a repeating decimal.
	 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
	 * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext|BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
	 * @returns {BigDecimal}
	 */
	divide(number, type) {
		const divisor = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= divisor;
		let roundingMode	= null;
		let mc				= null;
		let newScale		= 0;
		let isPriorityScale	= false;

		// 設定をロードする
		if(!type) {
			mc = tgt.default_context;
			roundingMode = mc.getRoundingMode();
			newScale = mc.getPrecision();
		}
		else if(type instanceof MathContext) {
			mc = type;
			roundingMode = mc.getRoundingMode();
			newScale = mc.getPrecision();
		}
		else {
			if(type && type.scale) {
				newScale = type.scale;
			}
			else {
				isPriorityScale	= true;
				if(type && (type.roundingMode || type.context)) {
					newScale = src.scale();
				}
				else {
					newScale = src.scale() - tgt.scale();
				}
			}
			if(type && type.context) {
				mc = type.context;
				roundingMode = mc.getRoundingMode();
				newScale = mc.getPrecision();
			}
			else {
				mc = this.default_context;
			}
			if(type && type.roundingMode) {
				roundingMode = type.roundingMode;
			}
			else {
				roundingMode = mc.getRoundingMode();
			}
		}
		
		if(tgt.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		const precision = mc.getPrecision();

		let all_result;
		// 無限精度か、精度が小さい場合は厳密に求める
		if((precision === 0) || (precision <= 100)) {
			let newsrc;
			const result_map = [];
			let result, result_divide, result_remaind;
			all_result = BigDecimal.ZERO;
			const check_max = precision !== 0 ? (precision + 8) : 0x3FFFF;
			newsrc = src;
			for(let i = 0; i < check_max; i++) {
				result = newsrc.divideAndRemainder(tgt, MathContext.UNLIMITED);
				result_divide	= result[0];
				result_remaind	= result[1];
				// ここで default_context が MathContext.UNLIMITED に書き換わる
				all_result = all_result.add(result_divide.scaleByPowerOfTen(-i), MathContext.UNLIMITED);
				if(result_remaind.compareTo(BigDecimal.ZERO) !== 0) {
					if(precision === 0) {	// 精度無限大の場合は、循環小数のチェックが必要
						if(result_map[result_remaind._getUnsignedIntegerString()]) {
							throw "ArithmeticException " + all_result + "[" + result_remaind._getUnsignedIntegerString() + "]";
						}
						else {
							result_map[result_remaind._getUnsignedIntegerString()] = true;
						}
					}
					newsrc = result_remaind.scaleByPowerOfTen(1);
				}
				else {
					break;
				}
			}
			// default_context の設定を元に戻す
		}
		else {
			// 巨大な値は繰り返しで求める
			const new_mc = new MathContext(precision + 4,	RoundingMode.HALF_UP);
			all_result = this.mul(tgt.inv(new_mc), new_mc);
		}
	
		all_result.default_context = mc;
		if(isPriorityScale) {
			// 優先スケールの場合は、スケールの変更に失敗する可能性あり
			try {
				all_result = all_result.setScale(newScale, roundingMode);
			}
			catch(e) {
				// falls through
			}
		}
		else {
			all_result = all_result.setScale(newScale, roundingMode);
		}
		all_result = all_result.round(mc);
		return all_result;
	}

	/**
	 * Divide.
	 * - The argument can specify the scale after calculation.
	 * - In the case of precision infinity, it may generate an error by a repeating decimal.
	 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
	 * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {MathContext|BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
	 * @returns {BigDecimal} A / B
	 */
	div(number, type) {
		return this.divide(number, type);
	}

	/**
	 * Inverse number of this value.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} 1 / A
	 */
	inv(context) {
		// 通常の割り算を行うと、「1」÷巨大な数を計算したときに、
		// 1 の仮数部の精度によってしまい、結果が0になってしまう場合がある
		// const mc = context ? context : this.default_context;
		// const b1 = this.createUsingThisSettings(1, mc);
		// return b1.div(this, mc);
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		// 計算は絶対値を用いて行う
		const is_negative = this.isNegative();
		/**
		 * @type {BigDecimal}
		 */
		let A = !is_negative ? this: this.negate();
		BigDecimal.setDefaultContext(mc);
		// 3次のニュートン・ラフソン法で求める
		const B1 = BigDecimal.create(1);
		// 初期値は、指数部の情報を使用する
		const scale = - A.scale() + (A.precision() - 1);
		const x0 = new BigDecimal([1, scale + 1]);
		if(x0.isZero()) {
			BigDecimal.setDefaultContext(default_context);
			return null;
		}
		A = A.round(mc);
		let xn = x0;
		for(let i = 0; i < 20; i++) {
			const h = B1.sub(A.mul(xn));
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h).add(h.square()));
		}
		BigDecimal.setDefaultContext(default_context);
		// 参考
		// Lyuka - 逆数と平方根を求める高次収束アルゴリズム
		// http://www.finetune.co.jp/~lyuka/technote/fract/sqrt.html
		return !is_negative ? xn : xn.negate();
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * - Supports only integers.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} n!
	 */
	factorial(context) {
		const mc = context ? context : this.default_context;
		const y = new BigDecimal((new BigInteger(this)).factorial());
		return y.round(mc);
	}

	/**
	 * Multiply a multiple of ten.
	 * - Supports only integers.
	 * - Only the scale is changed without changing the precision.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
	 * @returns {BigDecimal} A * 10^floor(n)
	 */
	scaleByPowerOfTen(n) {
		const x = BigDecimal._toInteger(n);
		const output = this.clone();
		output._scale = this.scale() - x;
		return output;
	}

	// ----------------------
	// 環境設定用
	// ----------------------
	
	/**
	 * Set default the MathContext.
	 * This is used if you do not specify MathContext when creating a new object.
	 * @param {MathContext} [context=MathContext.DECIMAL128]
	 */
	static setDefaultContext(context) {
		DEFAULT_CONTEXT = context ? context : MathContext.DECIMAL128;
	}

	/**
	 * Return default MathContext class.
	 * Used when MathContext not specified explicitly.
	 * @returns {MathContext}
	 */
	static getDefaultContext() {
		return DEFAULT_CONTEXT;
	}

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * 32-bit integer value.
	 * @returns {number}
	 */
	get intValue() {
		const bigintdata = this.toBigInteger();
		const x = bigintdata.intValue;
		return x & 0xFFFFFFFF;
	}

	/**
	 * 32-bit integer value.
	 * An error occurs if conversion fails.
	 * @returns {number}
	 */
	get intValueExact() {
		const bigintdata = this.toBigInteger();
		const x = bigintdata.intValue;
		if((x < -2147483648) || (2147483647 < x)) {
			throw "ArithmeticException";
		}
		return x;
	}

	/**
	 * 32-bit floating point.
	 * @returns {number}
	 */
	get floatValue() {
		const p = this.precision();
		if(MathContext.DECIMAL32.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	}

	/**
	 * 64-bit floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		return parseFloat(this.toEngineeringString());
	}

	/**
	 * Get as a BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return this.integer.scaleByPowerOfTen(-this.scale());
	}

	// ----------------------
	// 比較
	// ----------------------
	
	/**
	 * Equals.
	 * - Attention : Test for equality, including the precision and the scale. 
	 * - Use the "compareTo" if you only want to find out whether they are also mathematically equal.
	 * - If you specify a "tolerance", it is calculated by ignoring the test of the precision and the scale.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		// 誤差を指定しない場合は、厳密に調査
		if(!tolerance) {
			if(number instanceof BigDecimal) {
				return ((this._scale === number._scale) && (this.integer.equals(number.integer)));
			}
			else if((typeof number === "string") || (number instanceof String)) {
				const val = BigDecimal._toBigDecimal(number);
				return ((this._scale === val._scale) && (this.integer.equals(val.integer)));
			}
			else {
				return this.compareTo(number) === 0;
			}
		}
		else {
			return this.compareTo(number, tolerance) === 0;
		}
	}

	/**
	 * Compare values.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const src = this;
		const tgt = BigDecimal._toBigDecimal(number);
		if(!tolerance) {
			// 誤差の指定がない場合
			// 簡易計算
			{
				const src_sign	= src.signum();
				const tgt_sign	= tgt.signum();
				if((src_sign === 0) && (src_sign === tgt_sign)) {
					return 0;
				}
				else if(src_sign === 0) {
					return - tgt_sign;
				}
				else if(tgt_sign === 0) {
					return src_sign;
				}
			}
			// 実際に計算する
			if(src._scale === tgt._scale) {
				return src.integer.compareTo(tgt.integer);
			}
			else if(src._scale > tgt._scale) {
				const newdst = tgt.setScale(src._scale);
				return src.integer.compareTo(newdst.integer);
			}
			else {
				const newsrc = src.setScale(tgt._scale);
				return newsrc.integer.compareTo(tgt.integer);
			}
		}
		else {
			const tolerance_ = BigDecimal._toBigDecimal(tolerance);
			const delta = src.sub(tgt, MathContext.UNLIMITED);
			const delta_abs = delta.abs();
			if(delta_abs.compareTo(tolerance_) <= 0) {
				return 0;
			}
			else {
				return delta.sign();
			}
		}
	}

	/**
	 * Maximum number.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @returns {BigDecimal} max([A, B])
	 */
	max(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * Minimum number.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @returns {BigDecimal} min([A, B])
	 */
	min(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) <= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * Clip number within range.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} min
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} max
	 * @returns {BigDecimal} min(max(x, min), max)
	 */
	clip(min, max) {
		const min_ = BigDecimal._toBigDecimal(min);
		const max_ = BigDecimal._toBigDecimal(max);
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
	// 文字列化
	// ----------------------
	
	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		// 「調整された指数」
		const x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			return this.toScientificNotation(x);
		}
	}

	/**
	 * Convert to string using scientific notation.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} e_len - Number of digits in exponent part.
	 * @returns {string} 
	 */
	toScientificNotation(e_len) {
		const e		= BigDecimal._toInteger(e_len);
		const text	= this._getUnsignedIntegerString();
		let s		= this.scale();
		const x		= [];
		let i, k;
		// -
		if(this.signum() === -1) {
			x[x.length] = "-";
		}
		// 表示上の桁数
		s = - e - s;
		// 小数点が付かない
		if(s >= 0) {
			x[x.length] = text;
			for(i = 0; i < s; i++) {
				x[x.length] = "0";
			}
		}
		// 小数点が付く
		else {
			k = this.precision() + s;
			if(0 < k) {
				x[x.length] = text.substring(0, k);
				x[x.length] = ".";
				x[x.length] = text.substring(k, text.length);
			}
			else {
				k = - k;
				x[x.length] = "0.";
				for(i = 0; i < k; i++) {
					x[x.length] = "0";
				}
				x[x.length] = text;
			}
		}
		x[x.length] = "E";
		if(e >= 0) {
			x[x.length] = "+";
		}
		x[x.length] = e;
		return x.join("");
	}

	/**
	 * Convert to string usding technical notation.
	 * @returns {string} 
	 */
	toEngineeringString() {
		// 「調整された指数」
		const x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			// 0 でない値の整数部が 1 〜 999 の範囲に収まるように調整
			return this.toScientificNotation(Math.floor(x / 3) * 3);
		}
	}

	/**
	 * Convert to string without exponential notation.
	 * @returns {string} 
	 */
	toPlainString() {
		// スケールの変換なし
		if(this.scale() === 0) {
			if(this.signum() < 0) {
				return "-" + this._getUnsignedIntegerString();
			}
			else {
				return this._getUnsignedIntegerString();
			}
		}
		// 指数0で文字列を作成後、Eの後ろの部分をとっぱらう
		const text = this.toScientificNotation(0);
		return text.match(/^[^E]*/)[0];
	}

	// ----------------------
	// 丸め
	// ----------------------
	
	/**
	 * Change the scale.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} new_scale - New scale.
	 * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - Rounding method when converting precision.
	 * @returns {BigDecimal} 
	 */
	setScale(new_scale, rounding_mode) {
		const newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		const roundingMode = (rounding_mode !== undefined) ? RoundingMode.valueOf(rounding_mode) : RoundingMode.UNNECESSARY;
		// 文字列を扱ううえで、符号があるとやりにくいので外しておく
		let text		= this._getUnsignedIntegerString();
		const sign		= this.signum();
		const sign_text	= sign >= 0 ? "" : "-";
		// scale の誤差
		// 0 以上なら 0 を加えればいい。0未満なら0を削るか、四捨五入など丸めを行う
		const delta		= newScale - this.scale();	// この桁分増やすといい
		if(0 <= delta) {
			// 0を加える
			let i;
			for(i = 0; i < delta; i++) {
				text = text + "0";
			}
			return new BigDecimal([new BigInteger(sign_text + text), newScale]);
		}
		const keta = text.length + delta;		// 最終的な桁数
		const keta_marume = keta + 1;
		if(keta <= 0) {
			// 指定した scale では設定できない場合
			// 例えば "0.1".setScale(-2), "10".setScale(-3) としても表すことは不可能であるため、
			// sign（-1, 0, +1）のどれかの数値を使用して丸める
			const outdata = (sign + roundingMode.getAddNumber(sign)) / 10;
			// 上記の式は、CEILINGなら必ず1、正でCEILINGなら1、負でFLOORなら1、それ以外は0となり、
			// さらに元々の数値が 0 なら 0、切り捨て不能なら例外が返る計算式である。
			// これは Java の動作をまねています。
			return new BigDecimal([new BigInteger(outdata), newScale]);
		}
		{
			// 0を削るだけで解決する場合
			// 単純な切捨て(0を削るのみ)
			const zeros			= text.match(/0+$/);
			const zero_length		= (zeros !== null) ? zeros[0].length : 0;
			if(( (zero_length + delta) >= 0 ) || (roundingMode === RoundingMode.DOWN)) {
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, keta)), newScale]);
			}
		}
		{
			// 丸め計算で解決する場合
			// 12345 -> '123'45
			text = text.substring(0, keta_marume);
			// 丸め計算に必要な切り取る桁数(後ろの1～2桁を取得)
			const cutsize = text.length > 1 ? 2 : 1;
			// '123'45 -> 1'23'4
			const number = parseInt(text.substring(text.length - cutsize, text.length)) * sign;
			// 「元の数」と「丸めに必要な数」を足す
			const x1 = new BigInteger(sign_text + text);
			const x2 = new BigInteger(roundingMode.getAddNumber(number));
			text = x1.add(x2).toString();
			// 丸め後の桁数に戻して
			return new BigDecimal([new BigInteger(text.substring(0, text.length - 1)), newScale]);
		}
	}

	/**
	 * Round with specified settings.
	 * 
	 * This method is not a method round the decimal point.
	 * This method converts numbers in the specified Context and rounds unconvertible digits.
	 * 
	 * Use this.setScale(0, RoundingMode.HALF_UP) if you want to round the decimal point.
	 * When the argument is omitted, such decimal point rounding operation is performed.
	 * @param {MathContext} [mc] - New setting.
	 * @returns {BigDecimal} 
	 */
	round(mc) {
		if(mc) {
			// MathContext を設定した場合
			if(!(mc instanceof MathContext)) {
				throw "not MathContext";
			}
			const newPrecision	= mc.getPrecision();
			const delta			= newPrecision - this.precision();
			if((delta === 0)||(newPrecision === 0)) {
				return this.clone();
			}
			const newBigDecimal = this.setScale( this.scale() + delta, mc.getRoundingMode());
			/* 精度を上げる必要があるため、0を加えた場合 */
			if(delta > 0) {
				return newBigDecimal;
			}
			/* 精度を下げる必要があるため、丸めた場合は、桁の数が正しいか調べる */
			if(newBigDecimal.precision() === mc.getPrecision()) {
				return newBigDecimal;
			}
			/* 切り上げなどで桁数が１つ増えた場合 */
			const sign_text	= newBigDecimal.integer.signum() >= 0 ? "" : "-";
			const abs_text	= newBigDecimal._getUnsignedIntegerString();
			const inte_text	= sign_text + abs_text.substring(0, abs_text.length - 1);
			return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1]);
		}
		else {
			// 小数点以下を四捨五入する
			return this.setScale(0, RoundingMode.HALF_UP);
		}
	}

	/**
	 * Floor.
	 * @returns {BigDecimal} floor(A)
	 */
	floor() {
		return this.setScale(0, RoundingMode.FLOOR);
	}

	/**
	 * Ceil.
	 * @returns {BigDecimal} ceil(A)
	 */
	ceil() {
		return this.setScale(0, RoundingMode.CEILING);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {BigDecimal} fix(A), trunc(A)
	 */
	fix() {
		return this.setScale(0, RoundingMode.DOWN);
	}

	/**
	 * Fraction.
	 * @returns {BigDecimal} fract(A)
	 */
	fract() {
		return this.sub(this.floor());
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * - An exception occurs when doing a huge multiplication.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} pow(A, B)
	 */
	pow(number, context) {
		const num = BigDecimal._toBigDecimal(number);
		const integer = num.intValue;
		const mc = context ? context : this.default_context;
		if(Math.abs(integer) > 1000) {
			throw "ArithmeticException";
		}
		else if(this.isZero()) {
			return context ? BigDecimal.ONE.round(context) : BigDecimal.ONE;
		}
		else if(this.isOne()) {
			return context ? this.round(context) : this;
		}
		else if((mc.getPrecision() === 0) && (num.isNegative())) {
			throw "ArithmeticException";
		}
		if(num.isInteger()) {
			const is_negative = num.isNegative();
			let n = Math.round(Math.abs(integer));
			let x, y;
			x = this.clone();
			y = BigDecimal.ONE;
			while(n !== 0) {
				if((n & 1) !== 0) {
					y = y.multiply(x, MathContext.UNLIMITED);
				}
				x = x.multiply(x.clone(), MathContext.UNLIMITED);
				n >>>= 1;
			}
			if(!is_negative) {
				y = y.round(mc);
			}
			else {
				y = y.inv(mc);
			}
			return y;
		}
		else {
			return this.log(mc).mul(number, mc).exp(mc);
		}
	}
	
	/**
	 * Square.
	 * param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} A^2
	 */
	square(mc) {
		return this.mul(this, mc);
	}

	/**
	 * Square root.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sqrt(A)
	 */
	sqrt(context) {
		/*
		// 【以下は直接求める方法】
		// ニュートンラフソン法
		// A^0.5  = x
		//     A  = x^2
		//     0  = x^2 - A
		//   f(x) = x^2 - A
		// ここで f(x) = 0 となるような x を知りたい
		// なお f(x) は単調増加関数なのでニュートンラフソン法で求められる
		// x_(n+1) = x_n - f(x_n)/f'(x_n)
		// ここで f'(x) = 2x なので以下を求めればよい
		// x_(n+1) = x_n - (x_n^2 - A) / (2 * x_n)
		// 初期値の決め方は近い値のほうがよい
		// 使用する固定値を列挙
		const B1 = this.createUsingThisSettings(1, context);
		const B2 = this.createUsingThisSettings(2, context);
		// 初期値
		const scale = - this.scale() + (this.precision() - 1);
		const x0 = B1.scaleByPowerOfTen(scale);
		let xn = x0;
		for(let i = 0; i < 300; i++) {
			const xn1 = xn.sub( (xn.mul(xn).sub(this)).div(xn.mul(B2)) );
			const delta = xn1.sub(xn);
			if(delta.isZero()) {
				break;
			}
			xn = xn1;
		}
		*/
		//return xn;
		// 上記は割り算があり速度が遅いので、以下の計算で求める。
		return this.rsqrt(context).inv(context);
	}

	/**
	 * Reciprocal square root.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} rsqrt(A)
	 */
	rsqrt(context) {
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		/**
		 * @type {BigDecimal}
		 */
		const A = this.round(mc);
		BigDecimal.setDefaultContext(mc);
		// 4次収束のニュートン・ラフソン法で求める
		// 使用する固定値を列挙
		const B1 = BigDecimal.create(1);
		const B5 = BigDecimal.create(5);
		const B6 = BigDecimal.create(6);
		const B8 = BigDecimal.create(8);
		const B16 = BigDecimal.create(16);
		const B16r = B16.inv();
		// 初期値
		const x0 = A.inv();
		if(x0.isZero()) {
			BigDecimal.setDefaultContext(default_context);
			return null;
		}
		let xn = x0;
		for(let i = 0; i < 50; i++) {
			const h = B1.sub(A.mul(xn.square())).round(mc);
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h.mul(B8.add(h.mul(B6.add(B5.mul(h))))).mul(B16r)));
		}
		BigDecimal.setDefaultContext(default_context);
		// 参考
		// Lyuka - 逆数と平方根を求める高次収束アルゴリズム
		// http://www.finetune.co.jp/~lyuka/technote/fract/sqrt.html
		return xn;
	}
	
	/**
	 * Logarithmic function.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} log(A)
	 */
	log(context) {
		if(this.isZero() || this.isNegative()) {
			throw "ArithmeticException";
		}
		const mc = context ? context : this.default_context;
		if(this.isOne()) {
			return new BigDecimal([0, mc]);
		}
		const default_context = BigDecimal.getDefaultContext();
		// log(x)
		// -> x = a * E -> log(a * E) = log(a) + log(E)
		// -> x = a / E -> log(a / E) = log(E) - log(a)
		// 上記の式を使用して、適切な値の範囲で計算できるように調整する
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const new_mc = new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.setDefaultContext(new_mc);
		let a = this.round(new_mc);
		let b = 0;
		{
			// 範囲を 1 < x <= e の間に収める
			const e = BigDecimal.E;
			const compare_to_e = a.compareTo(e);
			if(compare_to_e === 0) {
				BigDecimal.setDefaultContext(mc);
				return new BigDecimal([1, mc]);
			}
			// 内部の値が大きすぎるので小さくする
			else if(compare_to_e > 0) {
				for(; b < 300; b++) {
					if(a.compareTo(e) <= 0) {
						break;
					}
					a = a.divide(e, mc);
				}
			}
			// 内部の値が小さすぎるので大きくする
			else {
				const B1 = new BigDecimal(1);
				if(a.compareTo(B1) < 0) {
					for(; b > -300; b--) {
						if(a.compareTo(B1) > 0) {
							break;
						}
						a = a.mul(e, mc);
					}
				}
			}
		}
		BigDecimal.setDefaultContext(mc);
		a = a.round(mc);
		// この時点で 1 < x <= e となる
		// log((1+u)/(1-u)) = 2 * (u + u^3/3 + u^5/5 + ...) の式を使用する
		// solve((1+u)/(1-u)-x=0,[u]);->u=(x-1)/(x+1)
		const u = a.sub(BigDecimal.ONE).div(a.add(BigDecimal.ONE));
		const u_x2 = u.mul(u);
		{
			// 初期値
			let x = u;
			let n0 = u;
			let k = BigDecimal.ONE;
			// 繰り返し求める
			for(let i = 0; i < 300; i++) {
				k = k.add(BigDecimal.TWO);
				x = x.mul(u_x2);
				const n1 = n0.add(x.div(k));
				const delta = n1.sub(n0);
				n0 = n1;
				if(delta.isZero()) {
					break;
				}
			}
			a = n0.mul(BigDecimal.TWO);
		}
		// 最終結果
		const y = a.add(b);
		BigDecimal.setDefaultContext(default_context);
		return y;
	}

	/**
	 * Exponential function.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} exp(A)
	 */
	exp(context) {
		if(this.isZero()) {
			return new BigDecimal([1, context]);
		}
		const is_negative = this.isNegative();
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		/**
		 * @type {BigDecimal}
		 */
		let number = this;
		// 負の値でマクローリン展開すると振動して桁落ちする可能性があるため正の値にしておく
		if(is_negative) {
			number = number.negate();
		}
		// X = exp(x) とすると X = exp(x/A)^A である。
		// そのため、収束を早くするためにexpの中を小さくしておき、最後にpowを行う。
		// scale > (10^a) = b ≒ this
		// 小さな値で計算するため精度をあげる
		const scale = - number.scale() + (number.precision() - 1) + 1;
		const new_mc = new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.setDefaultContext(new_mc);
		let a = 0;
		let b = 1;
		{
			const val = number.doubleValue;
			if(val >= 10) {
				a = Math.floor(Math.log(Math.floor(val)) / Math.log(10));
				b = Math.pow(10, a);
			}
		}
		// ここでターゲットの数値を割ってしまう
		const target = number.div(b, mc);
		// 小さくなった値に対してexpを計算する
		let y;
		{
			// マクローリン展開で計算する
			// 初期値
			let x = target;
			let n0 = BigDecimal.ONE.add(target);
			let k = BigDecimal.ONE;
			// 繰り返し求める
			for(let i = 2; i < 300; i++) {
				k = k.mul(i);
				x = x.mul(target);
				const n1 = n0.add(x.div(k));
				const delta = n1.sub(n0);
				n0 = n1;
				if(delta.isZero()) {
					break;
				}
			}
			y = n0;
		}
		// exp(x) = pow(y, b)である。
		y = y.pow(b);
		BigDecimal.setDefaultContext(default_context);
		// 負の値だったら 1/(x^2) にして戻す
		if(is_negative) {
			return y.round(mc).inv();
		}
		else {
			return y.round(mc);
		}
	}

	// ----------------------
	// 三角関数
	// ----------------------

	/**
	 * Sine function.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sin(A)
	 */
	sin(context) {
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		// 2PIの余りを実際の計算で使用する。
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const new_mc = new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.setDefaultContext(new_mc);
		let target = this.mod(BigDecimal.TWO_PI, mc);
		BigDecimal.setDefaultContext(mc);
		target = target.round(mc);
		// マクローリン展開で計算する
		// 初期値
		let n0 = target;
		{
			const t_x2 = target.mul(target);
			let x = target;
			let k = BigDecimal.ONE;
			let sign = -1;
			// 繰り返し求める
			for(let i = 2; i < 300; i++) {
				k = k.mul(i);
				if((i % 2) === 1) {
					x = x.mul(t_x2);
					let n1;
					if(sign < 0) {
						n1 = n0.sub(x.div(k));
						sign = 1;
					}
					else {
						n1 = n0.add(x.div(k));
						sign = -1;
					}
					const delta = n1.sub(n0);
					n0 = n1;
					if(delta.isZero()) {
						break;
					}
				}
			}
		}
		BigDecimal.setDefaultContext(default_context);
		return n0;
	}

	/**
	 * Cosine function.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} cos(A)
	 */
	cos(context) {
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		// 2PIの余りを実際の計算で使用する。
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const new_mc = new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.setDefaultContext(new_mc);
		let target = this.mod(BigDecimal.TWO_PI, mc);
		BigDecimal.setDefaultContext(mc);
		target = target.round(mc);
		// マクローリン展開で計算する
		// 初期値
		let n0 = BigDecimal.ONE;
		{
			let x = BigDecimal.ONE;
			const t_x2 = target.mul(target);
			let k = BigDecimal.ONE;
			let sign = -1;
			// 繰り返し求める
			for(let i = 2; i < 300; i++) {
				k = k.mul(i);
				if((i % 2) === 0) {
					x = x.mul(t_x2);
					let n1;
					if(sign < 0) {
						n1 = n0.sub(x.div(k));
						sign = 1;
					}
					else {
						n1 = n0.add(x.div(k));
						sign = -1;
					}
					const delta = n1.sub(n0);
					n0 = n1;
					if(delta.isZero()) {
						break;
					}
				}
			}
		}
		BigDecimal.setDefaultContext(default_context);
		return n0;
	}

	/**
	 * Tangent function.
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} tan(A)
	 */
	tan(context) {
		const mc = context ? context : this.default_context;
		return this.sin(mc).div(this.cos(mc));
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} atan(A)
	 */
	atan(context) {
		const mc = context ? context : this.default_context;
		const default_context = BigDecimal.getDefaultContext();
		BigDecimal.setDefaultContext(mc);
		if(this.isZero()) {
			const y = BigDecimal.ZERO;
			BigDecimal.setDefaultContext(default_context);
			return y;
		}
		else if(this.compareTo(BigDecimal.ONE) === 0) {
			const y = BigDecimal.QUARTER_PI;
			BigDecimal.setDefaultContext(default_context);
			return y;
		}
		else if(this.compareTo(BigDecimal.MINUS_ONE) === 0) {
			const y = BigDecimal.QUARTER_PI.negate();
			BigDecimal.setDefaultContext(default_context);
			return y;
		}
		// x を 0 <= x <= 0.5 に収める
		const target_sign = this.sign();
		let target = this.abs(mc);
		let type;
		if(target.compareTo(BigDecimal.TWO) === 1) {
			// atan(x) = pi/2-atan(1/x)
			type = 1;
			target = target.inv();
		}
		else if(target.compareTo(BigDecimal.HALF) === 1) {
			// atan(x) = pi/4-atan((1-x)/(1+x))
			type = 2;
			target = BigDecimal.ONE.sub(target).div(BigDecimal.ONE.add(target));
		}
		else {
			type = 3;
		}
		// グレゴリー級数
		// 初期値
		let n0 = target;
		{
			const t_x2 = target.mul(target);
			let x = target;
			let k = BigDecimal.ONE;
			let sign = -1;
			// 繰り返し求める
			for(let i = 0; i < 300; i++) {
				x = x.mul(t_x2);
				k = k.add(BigDecimal.TWO);
				let n1;
				if(sign < 0) {
					n1 = n0.sub(x.div(k));
					sign = 1;
				}
				else {
					n1 = n0.add(x.div(k));
					sign = -1;
				}
				const delta = n1.sub(n0);
				n0 = n1;
				if(delta.isZero()) {
					break;
				}
			}
		}
		if(type === 1) {
			n0 = BigDecimal.HALF_PI.sub(n0);
		}
		else if(type === 2) {
			n0 = BigDecimal.QUARTER_PI.sub(n0);
		}
		if(target_sign < 0) {
			n0 = n0.negate();
		}
		BigDecimal.setDefaultContext(default_context);
		return n0;
	}

	/**
	 * Atan (arc tangent) function.
	 * Return the values of [-PI, PI] .
	 * Supports only real numbers.
	* @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	* @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} atan2(Y, X)
	 */
	atan2(number, context) {
		const default_context = BigDecimal.getDefaultContext();
		// y.atan2(x) とする。
		const y = this.round(context);
		const x = new BigDecimal([number, context]);
		// 参考: https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
		let ret;
		if(x.isPositive()) {
			ret = y.div(x).atan();
		}
		else if(y.isNotNegative() && x.isNegative()) {
			ret = y.div(x).atan().add(BigDecimal.PI);
		}
		else if(y.isNegative() && x.isNegative()) {
			ret = y.div(x).atan().sub(BigDecimal.PI);
		}
		else if(y.isPositive()) {
			ret = BigDecimal.HALF_PI;
		}
		else if(y.isNegative()) {
			ret = BigDecimal.HALF_PI.negate();
		}
		else {
			throw "ArithmeticException";
		}
		BigDecimal.setDefaultContext(default_context);
		return ret;
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		return this.sub(this.fix()).isZero(tolerance);
	}

	/**
	 * this === 0
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZero(tolerance) {
		if(tolerance) {
			return this.equals(BigDecimal.ZERO, tolerance);
		}
		else {
			return this.integer.isZero();
		}
	}
	
	/**
	 * this === 1
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOne(tolerance) {
		return this.compareTo(BigDecimal.ONE, tolerance) === 0;
	}
	
	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return this.integer.isPositive();
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return this.integer.isNegative();
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this.integer.isNotNegative();
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * -1
	 * @returns {BigDecimal} -1
	 */
	static get MINUS_ONE() {
		return CACHED_DATA.MINUS_ONE.get();
	}

	/**
	 * 0
	 * @returns {BigDecimal} 0
	 */
	static get ZERO() {
		return CACHED_DATA.ZERO.get();
	}
	
	/**
	 * 0.5
	 * @returns {BigDecimal} 0.5
	 */
	static get HALF() {
		return CACHED_DATA.HALF.get();
	}
	
	/**
	 * 1
	 * @returns {BigDecimal} 1
	 */
	static get ONE() {
		return CACHED_DATA.ONE.get();
	}
	
	/**
	 * 2
	 * @returns {BigDecimal} 2
	 */
	static get TWO() {
		return CACHED_DATA.TWO.get();
	}
	
	/**
	 * 10
	 * @returns {BigDecimal} 10
	 */
	static get TEN() {
		return CACHED_DATA.TEN.get();
	}

	/**
	 * PI
	 * @returns {BigDecimal} 3.14...
	 */
	static get PI() {
		return CACHED_DATA.PI.get();
	}

	/**
	 * 0.25 * PI.
	 * @returns {BigDecimal} 0.78...
	 */
	static get QUARTER_PI() {
		return CACHED_DATA.QUARTER_PI.get();
	}

	/**
	 * 0.5 * PI.
	 * @returns {BigDecimal} 1.57...
	 */
	static get HALF_PI() {
		return CACHED_DATA.HALF_PI.get();
	}

	/**
	 * 2 * PI.
	 * @returns {BigDecimal} 6.28...
	 */
	static get TWO_PI() {
		return CACHED_DATA.TWO_PI.get();
	}

	/**
	 * E, Napier's constant.
	 * @returns {BigDecimal} E
	 */
	static get E() {
		return CACHED_DATA.E.get();
	}

	/**
	 * log_e(2)
	 * @returns {BigDecimal} ln(2)
	 */
	static get LN2() {
		return CACHED_DATA.LN2.get();
	}

	/**
	 * log_e(10)
	 * @returns {BigDecimal} ln(10)
	 */
	static get LN10() {
		return CACHED_DATA.LN10.get();
	}

	/**
	 * log_2(e)
	 * @returns {BigDecimal} log_2(e)
	 */
	static get LOG2E() {
		return CACHED_DATA.LOG2E.get();
	}
	
	/**
	 * log_10(e)
	 * @returns {BigDecimal} log_10(e)
	 */
	static get LOG10E() {
		return CACHED_DATA.LOG10E.get();
	}
	
	/**
	 * sqrt(2)
	 * @returns {BigDecimal} sqrt(2)
	 */
	static get SQRT2() {
		return CACHED_DATA.SQRT2.get();
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {BigDecimal} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return CACHED_DATA.SQRT1_2.get();
	}
	
}

BigDecimal.RoundingMode = RoundingMode;
BigDecimal.MathContext = MathContext;

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE = {

	/**
	 * -1
	 * @returns {BigDecimal} -1
	 */
	MINUS_ONE : function() {
		return new BigDecimal(-1);
	},

	/**
	 * 0
	 * @returns {BigDecimal} 0
	 */
	ZERO : function() {
		return new BigDecimal(0);
	},
	
	/**
	 * 0.5
	 * @returns {BigDecimal} 0.5
	 */
	HALF : function() {
		return new BigDecimal(0.5);
	},
	
	/**
	 * 1
	 * @returns {BigDecimal} 1
	 */
	ONE : function() {
		return new BigDecimal(1);
	},
	
	/**
	 * 2
	 * @returns {BigDecimal} 2
	 */
	TWO : function() {
		return new BigDecimal(2);
	},
	
	/**
	 * 10
	 * @returns {BigDecimal} 10
	 */
	TEN : function() {
		return new BigDecimal(10);
	},

	/**
	 * PI
	 * @returns {BigDecimal} 3.14...
	 */
	PI : function() {
		// ガウス＝ルジャンドルのアルゴリズム
		// 使用する固定値を列挙
		const B1		= BigDecimal.create(1);
		const B2		= BigDecimal.create(2);
		const B4		= BigDecimal.create(4);
		// 初期値
		let a = B1;
		let b = B2.sqrt().inv();
		let t = B4.inv();
		let p = B1;
		let pi = B1;
		// 繰り返し求める
		for(let i = 0; i < 300; i++) {
			const a1 = a.add(b).div(B2);
			const b1 = a.mul(b).sqrt();
			const t1 = t.sub(p.mul(a.sub(a1).square()));
			const p1 = p.mul(B2);
			const pi1 = a1.add(b1).square().div(t1.mul(B4));
			const delta = pi1.sub(pi);
			pi = pi1;
			if(delta.isZero()) {
				break;
			}
			a = a1;
			b = b1;
			t = t1;
			p = p1;
		}
		return pi;
	},

	/**
	 * 0.25 * PI.
	 * @returns {BigDecimal} 0.78...
	 */
	QUARTER_PI : function() {
		return DEFINE.PI().div(4);
	},

	/**
	 * 0.5 * PI.
	 * @returns {BigDecimal} 1.57...
	 */
	HALF_PI : function() {
		return DEFINE.PI().div(2);
	},

	/**
	 * 2 * PI.
	 * @returns {BigDecimal} 6.28...
	 */
	TWO_PI : function() {
		return DEFINE.PI().mul(2);
	},
	
	/**
	 * E, Napier's constant.
	 * @returns {BigDecimal} E
	 */
	E : function() {
		// 初期値
		let n0 = BigDecimal.create(2);
		let k = BigDecimal.create(1);
		// 繰り返し求める
		for(let i = 2; i < 300; i++) {
			k = k.mul(i);
			const n1 = n0.add(k.inv());
			const delta = n1.sub(n0);
			n0 = n1;
			if(delta.isZero()) {
				break;
			}
		}
		return n0;
	},

	/**
	 * log_e(2)
	 * @returns {BigDecimal} ln(2)
	 */
	LN2 : function() {
		return (new BigDecimal(2)).log();
	},

	/**
	 * log_e(10)
	 * @returns {BigDecimal} ln(10)
	 */
	LN10 : function() {
		return (new BigDecimal(10)).log();
	},

	/**
	 * log_2(e)
	 * @returns {BigDecimal} log_2(e)
	 */
	LOG2E : function() {
		return (new BigDecimal(2)).log().inv();
	},
	
	/**
	 * log_10(e)
	 * @returns {BigDecimal} log_10(e)
	 */
	LOG10E : function() {
		return (new BigDecimal(10)).log().inv();
	},
	
	/**
	 * sqrt(2)
	 * @returns {BigDecimal} sqrt(2)
	 */
	SQRT2 : function() {
		return (new BigDecimal(2)).sqrt();
	},
	
	/**
	 * sqrt(0.5)
	 * @returns {BigDecimal} sqrt(0.5)
	 */
	SQRT1_2 : function() {
		return (new BigDecimal(0.5)).sqrt();
	}
	
};

/**
 * Simple cache class.
 * @ignore
 */
class BigDecimalCache {
	
	/**
	 * Create Cache.
	 * @param {string} method_name - Method name in the DEFINE.
	 * @param {number} cache_size - Maximum number of caches.
	 */
	constructor(method_name, cache_size) {

		/**
		 * Method name in the DEFINE.
		 */
		this.method_name = method_name;
		
		/**
		 * @type {Array<{name:string, number:BigDecimal}>}
		 */
		this.table = [];

		/**
		 * Maximum number of caches.
		 */
		this.table_max = cache_size;

	}

	/**
	 * Use from cache if it exists in cache.
	 * @returns {BigDecimal}
	 */
	get() {
		const name = BigDecimal.getDefaultContext().toString();

		for(let index = 0; index < this.table.length; index++) {
			if(this.table[index].name === name) {
				// 先頭にもってくる
				const object = this.table.splice(index, 1)[0];
				this.table.unshift(object);
				return object.number;
			}
		}
		const new_number = DEFINE[this.method_name]();
		if(this.table.length === this.table_max) {
			// 後ろのデータを消去
			this.table.pop();
		}
		// 前方に追加
		this.table.unshift({
			name : name,
			number : new_number
		});
		return new_number;
	}

}

/**
 * Simple cache class.
 * @ignore
 */
class BigDecimalConst {
	/**
	 * Constructor
	 */
	constructor() {
		/**
		 * -1
		 */
		this.MINUS_ONE = new BigDecimalCache("MINUS_ONE", 10);

		/**
		 * 0
		 */
		this.ZERO = new BigDecimalCache("ZERO", 10);

		/**
		 * 0.5
		 */
		this.HALF = new BigDecimalCache("HALF", 10);

		/**
		 * 1
		 */
		this.ONE = new BigDecimalCache("ONE", 10);

		/**
		 * 2
		 */
		this.TWO = new BigDecimalCache("TWO", 10);

		/**
		 * 10
		 */
		this.TEN = new BigDecimalCache("TEN", 10);

		/**
		 * PI
		 */
		this.PI = new BigDecimalCache("PI", 10);

		/**
		 * QUARTER_PI
		 */
		this.QUARTER_PI = new BigDecimalCache("QUARTER_PI", 10);

		/**
		 * HALF_PI
		 */
		this.HALF_PI = new BigDecimalCache("HALF_PI", 10);

		/**
		 * TWO_PI
		 */
		this.TWO_PI = new BigDecimalCache("TWO_PI", 10);

		/**
		 * E
		 */
		this.E = new BigDecimalCache("E", 10);

		/**
		 * LN2
		 */
		this.LN2 = new BigDecimalCache("LN2", 10);

		/**
		 * LN10
		 */
		this.LN10 = new BigDecimalCache("LN10", 10);

		/**
		 * LOG2E
		 */
		this.LOG2E = new BigDecimalCache("LOG2E", 10);
		
		/**
		 * LOG10E
		 */
		this.LOG10E = new BigDecimalCache("LOG10E", 10);
		
		/**
		 * SQRT2
		 */
		this.SQRT2 = new BigDecimalCache("SQRT2", 10);
		
		/**
		 * SQRT1_2
		 */
		this.SQRT1_2 = new BigDecimalCache("SQRT1_2", 10);
	}
}

/**
 * Cache of the constant.
 * @ignore
 */
const CACHED_DATA = new BigDecimalConst();

