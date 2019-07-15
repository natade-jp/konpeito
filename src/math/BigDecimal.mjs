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
class DecimalTool {

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
 */
export default class BigDecimal {
	
	/**
	 * Create an arbitrary-precision floating-point number.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3"
	 * - When initializing with array. [ integer, [scale = 0], [default_context=default], [context=default] ].
	 * - When initializing with object. { integer, [scale = 0], [default_context=default], [context=default] }.
	 * 
	 * Description of the settings are as follows, you can also omitted.
	 * - The "scale" is an integer scale factor.
	 * - The "default_context" is the used when no environment settings are specified during calculation.
	 * - The "context" is used to normalize the created floating point.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
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

		let context = null;

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
			const data = DecimalTool.ToBigDecimalFromNumber(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				if(!(typeof number[0] === "string" || number[0] instanceof String)) {
					this.integer = new BigInteger(number[0]);
				}
				else {
					// 1番目が文字列の場合は、文字列用の設定初期化を行う
					const data = DecimalTool.ToBigDecimalFromString(number[0]);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number" || number[1] instanceof Number) {
					this._scale	= number[1];
					if(number.length >= 3) {
						this.default_context = number[2];
					}
					if(number.length >= 4) {
						context = number[3];
					}
				}
				else {
					if(number.length >= 2) {
						this.default_context = number[1];
					}
					if(number.length >= 3) {
						context = number[2];
					}
				}
			}
		}
		else if(typeof number === "string") {
			const data = DecimalTool.ToBigDecimalFromString(number);
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
			if(number.default_context) {
				this.default_context = number.default_context;
			}
			if(number.context) {
				context = number.context;
			}
		}
		else if(number instanceof Object) {
			const data = DecimalTool.ToBigDecimalFromString(number.toString());
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else {
			throw "BigDecimal Unsupported argument " + arguments;
		}
		// データを正規化
		if(context) {
			const newbigdecimal = this.round(context);
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
	 * - When initializing with array. [ integer, [scale = 0], [default_context=default], [context=default] ].
	 * - When initializing with object. { integer, [scale = 0], [default_context=default], [context=default] }.
	 * 
	 * default_context
	 * - The "scale" is an integer scale factor.
	 * - The "default_context" is the used when no environment settings are specified during calculation.
	 * - The "context" is used to normalize the created floating point.
	 * 
	 * These 3 settings can be omitted.
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
		return new BigDecimal([BigInteger.ONE, this.scale(), this.default_context]);
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
	 * Multiply a multiple of ten.
	 * Only the scale is changed without changing the precision.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
	 * @returns {BigDecimal} A * 10^floor(n)
	 */
	scaleByPowerOfTen(n) {
		const x = BigDecimal._toInteger(n);
		const output = this.clone();
		output._scale = this.scale() - x;
		return output;
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
		return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), newScale, this.default_context]);
	}

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
			return new BigDecimal([src.integer.add(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			// 1 e-2 + 1 e-1
			const newdst = tgt.setScale(src._scale);
			// 0.01 + 0.10 = 0.11 = 11 e-2
			return new BigDecimal([src.integer.add(newdst.integer), newscale, mc, mc]);
		}
		else {
			// 1 e-1 + 1 e-2
			const newsrc = src.setScale(tgt._scale);
			// 0.1 + 0.01 = 0.11 = 11 e-2
			return new BigDecimal([newsrc.integer.add(tgt.integer), newscale, mc, mc]);
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
			return new BigDecimal([src.integer.subtract(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			const newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.subtract(newdst.integer), newscale, mc, mc]);
		}
		else {
			const newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.subtract(tgt.integer), newscale, mc, mc]);
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
	}

	/**
	 * Divide.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
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
		if(type && type.scale) {
			isPriorityScale	= false;
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
			roundingMode = type.context.getRoundingMode();
			newScale = type.context.getPrecision();
			mc = type.context;
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
		
		if(tgt.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}
		let newsrc;
		const result_map = [];
		let result, result_divide, result_remaind, all_result;
		all_result = BigDecimal.ZERO;
		const precision = mc.getPrecision();
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
		{
			if(type && type.context) {
				all_result.default_context = type.context;
			}
			else {
				all_result.default_context = this.default_context;
			}
		}
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
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
	 * @param {BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
	 * @returns {BigDecimal} A / B
	 */
	div(number, type) {
		return this.divide(number, type);
	}

	/**
	 * Power function.
	 * - Supports only integers.
	 * - An exception occurs when doing a huge multiplication.
	 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} pow(A, B)
	 */
	pow(number, context) {
		let n = BigDecimal._toInteger(number);
		const mc = context ? context : this.default_context;
		if(Math.abs(n) > 999999999) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() === 0) && (n < 0)) {
			throw "ArithmeticException";
		}
		let x, y;
		x = this.clone();
		y = BigDecimal.ONE;
		while(n !== 0) {
			if((n & 1) !== 0) {
				y = y.multiply(x, MathContext.UNLIMITED);
			}
			x = x.multiply(x, MathContext.UNLIMITED);
			n >>>= 1;
		}
		return y.round(mc);
	}
	
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
		const p = this.precision();
		if(MathContext.DECIMAL64.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
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
	 * @param {MathContext} [mc] - Rounding setting after calculation. For rounding purposes, use the round method.
	 * @returns {BigDecimal} 
	 */
	setScale(new_scale, rounding_mode, mc) {
		const newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		const roundingMode = (rounding_mode !== undefined) ? RoundingMode.valueOf(rounding_mode) : RoundingMode.UNNECESSARY;
		const context = (mc !== undefined) ? mc : this.default_context;
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
			return new BigDecimal([new BigInteger(sign_text + text), newScale, context]);
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
			return new BigDecimal([new BigInteger(outdata), newScale, context]);
		}
		{
			// 0を削るだけで解決する場合
			// 単純な切捨て(0を削るのみ)
			const zeros			= text.match(/0+$/);
			const zero_length		= (zeros !== null) ? zeros[0].length : 0;
			if(( (zero_length + delta) >= 0 ) || (roundingMode === RoundingMode.DOWN)) {
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, keta)), newScale, context]);
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
			return new BigDecimal([new BigInteger(text.substring(0, text.length - 1)), newScale, context]);
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
			const newBigDecimal = this.setScale( this.scale() + delta, mc.getRoundingMode(), mc);
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
			return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1, mc]);
		}
		else {
			// 小数点以下を四捨五入する
			return this.setScale(0, RoundingMode.HALF_UP);
		}
	}

	/**
	 * Floor.
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} floor(A)
	 */
	floor(mc) {
		return this.setScale(0, RoundingMode.FLOOR, mc);
	}

	/**
	 * Ceil.
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} ceil(A)
	 */
	ceil(mc) {
		return this.setScale(0, RoundingMode.CEILING, mc);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} fix(A), trunc(A)
	 */
	fix(mc) {
		return this.setScale(0, RoundingMode.DOWN, mc);
	}

	/**
	 * Fraction.
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} fract(A)
	 */
	fract(mc) {
		return this.sub(this.floor(mc), mc);
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * this === 0
	 * @returns {boolean}
	 */
	isZero() {
		return this.integer.isZero();
	}
	
	/**
	 * this === 1
	 * @returns {boolean}
	 */
	isOne() {
		return this.compareTo(BigDecimal.ONE) === 0;
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
		const x = new BigDecimal(-1);
		return x;
	}

	/**
	 * 0
	 * @returns {BigDecimal} 0
	 */
	static get ZERO() {
		const x = new BigDecimal(0);
		return x;
	}
	
	/**
	 * 0.5
	 * @returns {BigDecimal} 0.5
	 */
	static get HALF() {
		const x = new BigDecimal(0.5);
		return x;
	}
	
	/**
	 * 1
	 * @returns {BigDecimal} 1
	 */
	static get ONE() {
		const x = new BigDecimal(1);
		return x;
	}
	
	/**
	 * 2
	 * @returns {BigDecimal} 2
	 */
	static get TWO() {
		const x = new BigDecimal(2);
		return x;
	}
	
	/**
	 * 10
	 * @returns {BigDecimal} 10
	 */
	static get TEN() {
		const x = new BigDecimal(10);
		return x;
	}

}

BigDecimal.RoundingMode = RoundingMode;
BigDecimal.MathContext = MathContext;
