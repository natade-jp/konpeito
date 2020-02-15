/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import BigInteger from "./BigInteger.js";
import RoundingMode, {RoundingModeEntity} from "./context/RoundingMode.js";
import MathContext from "./context/MathContext.js";

/**
 * BigDecimal type argument.(local)
 * - number
 * - boolean
 * - string
 * - BigDecimal
 * - BigInteger
 * - {toBigDecimal:function}
 * - {doubleValue:number}
 * - {toString:function}
 * @typedef {number|boolean|string|BigDecimal|BigInteger|{toBigDecimal:function}|{doubleValue:number}|{toString:function}} KBigDecimalLocalInputData
 */

/**
 * ScaleData for argument of BigDecimal.
 * - {integer:BigInteger,scale:?number,context:?MathContext}
 * @typedef {{integer:BigInteger,scale:?number,context:?MathContext}} KBigDecimalScaleData
 */

/**
 * BigDecimal type argument.
 * - KBigDecimalLocalInputData
 * - Array<KBigDecimalLocalInputData|MathContext>
 * - KBigDecimalScaleData
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
 * @typedef {KBigDecimalLocalInputData|Array<KBigDecimalLocalInputData|MathContext>|KBigDecimalScaleData} KBigDecimalInputData
 */

/**
 * Setting of calculation result of division.
 * @typedef {Object} KBigDecimalDivideType
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
		// 特殊な状態
		{
			if(/nan/.test(text)) {
				return {
					scale : 0,
					integer : BigInteger.NaN
				};
			}
			else if(/inf/.test(text)) {
				if(!/-/.test(text)) {
					return {
						scale : 0,
						integer : BigInteger.POSITIVE_INFINITY
					};
				}
				else {
					return {
						scale : 0,
						integer : BigInteger.NEGATIVE_INFINITY
					};
				}
			}
		}
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
	 * @param {number|boolean} number 
	 * @returns {{scale : number, integer : BigInteger}}
	 */
	static ToBigDecimalFromNumber(number) {
		const value = typeof number !== "boolean" ? number : (number ? 1 : 0);
		if(!isFinite(value)) {
			if(value === Infinity) {
				return {
					scale : 0,
					integer : BigInteger.POSITIVE_INFINITY
				};
			}
			else if(value === - Infinity) {
				return {
					scale : 0,
					integer : BigInteger.NEGATIVE_INFINITY
				};
			}
			else {
				return {
					scale : 0,
					integer : BigInteger.NaN
				};
			}
		}
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
	 * - When initializing with array. [ integer, [scale = 0], [context=default]].
	 * - When initializing with object. { integer, [scale = 0], [context=default]}.
	 * 
	 * Description of the settings are as follows, you can also omitted.
	 * - The "scale" is an integer scale factor.
	 * - The "context" is used to normalize the created floating point.
	 * 
	 * If "context" is not specified, the "default_context" set for the class is used.
	 * The "context" is the used when no environment settings are specified during calculation.
	 * @param {KBigDecimalInputData} number - Real data.
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

			/**
			 * Integer part of string (for cache).
			 * @private
			 * @type {string}
			 */
			this.int_string			= number.int_string;

			this._scale				= number._scale;
			this.default_context	= number.default_context;

		}
		else if((typeof number === "number") || (typeof number === "boolean")) {
			const data = BigDecimalTool.ToBigDecimalFromNumber(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(typeof number === "string") {
			const data = BigDecimalTool.ToBigDecimalFromString(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				const prm1 = number[0];
				if((typeof prm1 === "number") || (typeof prm1 === "boolean")) {
					const data		= BigDecimalTool.ToBigDecimalFromNumber(prm1);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
				else if(typeof prm1 === "string") {
					const data		= BigDecimalTool.ToBigDecimalFromString(prm1);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
				else if(prm1 instanceof BigDecimal) {
					this.integer	= prm1.integer.clone();
					this._scale		= prm1._scale;
				}
				else if(prm1 instanceof BigInteger) {
					this.integer			= prm1.clone();
				}
				else if(typeof prm1 === "object") {
					if("toBigDecimal" in prm1) {
						const data		= prm1.toBigDecimal();
						this.integer	= data.integer;
						this._scale		= data._scale;
					}
					else if("doubleValue" in prm1) {
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
				else {
					throw "BigDecimal Unsupported argument " + prm1 + "(" + (typeof prm1) + ")";
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number") {
					// 2つめが数値の場合は、2つ目をスケール値として使用する
					this._scale	= number[1];
					if(number.length >= 3) {
						this.default_context = ((number[2] !== undefined) && (number[2] instanceof MathContext)) ? number[2] : DEFAULT_CONTEXT;
						is_set_context = true;
					}
				}
				else {
					if(number.length >= 2) {
						this.default_context = ((number[1] !== undefined) && (number[1] instanceof MathContext)) ? number[1] : DEFAULT_CONTEXT;
						is_set_context = true;
					}
				}
			}
		}
		else if(number instanceof BigInteger) {
			this.integer	= number.clone();
		}
		else if(typeof number === "object") {
			if("toBigDecimal" in number) {
				const data				= number.toBigDecimal();
				this.integer			= data.integer;
				this._scale				= data._scale;
				this.default_context	= data.default_context;
			}
			else if("doubleValue" in number) {
				const data = BigDecimalTool.ToBigDecimalFromNumber(number.doubleValue);
				this.integer	= data.integer;
				this._scale		= data.scale;
			}
			else if(("integer" in number) && ("scale" in number) && ("context" in number)) {
				this.integer	= new BigInteger(number.integer);
				if(number.scale) {
					this._scale = number.scale;
				}
				if(number.context) {
					this.default_context = number.context;
					is_set_context = true;
				}
			}
			else if(number instanceof Object) {
				const data = BigDecimalTool.ToBigDecimalFromString(number.toString());
				this.integer	= data.integer;
				this._scale		= data.scale;
			}
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
	 * @param {KBigDecimalInputData} number - Real data.
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
	 * @param {KBigDecimalLocalInputData} number - Real data.
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
	 * @param {KBigDecimalLocalInputData} x 
	 * @param {MathContext} [scale] 
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
	 * @param {KBigDecimalInputData} number 
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
	 * @param {KBigDecimalInputData} number 
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
			// @ts-ignore
			return new BigInteger(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {KBigDecimalInputData} number 
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
	 * @param {KBigDecimalInputData} number 
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
			// @ts-ignore
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
	sign() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? 1 : -1);
		}
		return this.integer.sign();
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
		if(!this.isFinite()) {
			return this.isNegativeInfinity() ? BigDecimal.POSITIVE_INFINITY : this;
		}
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
		if(!this.isFinite()) {
			return this;
		}
		const output = this.clone();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * this * -1
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
	 * @returns {BigDecimal} -A
	 */
	negate(mc) {
		if(!this.isFinite()) {
			if(this.isPositiveInfinity()) {
				return BigDecimal.NEGATIVE_INFINITY;
			}
			else if(this.isNegativeInfinity()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
			else {
				return this;
			}
		}
		const output = this.clone();
		output.integer = output.integer.negate();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * Move the decimal point to the left.
	 * @param {KBigDecimalInputData} n 
	 * @returns {BigDecimal} 
	 */
	movePointLeft(n) {
		if(!this.isFinite()) {
			return this;
		}
		const x = BigDecimal._toInteger(n);
		let output = this.scaleByPowerOfTen( -x );
		output = output.setScale(Math.max(this.scale() + x, 0));
		return output;
	}

	/**
	 * Move the decimal point to the right.
	 * @param {KBigDecimalInputData} n 
	 * @returns {BigDecimal} 
	 */
	movePointRight(n) {
		if(!this.isFinite()) {
			return this;
		}
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
		if(!this.isFinite()) {
			return this;
		}
		// 0をできる限り取り除く
		const sign		= this.sign();
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
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A + B
	 */
	add(number, context) {
		const augend = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= augend;
		if(!src.isFinite() || !tgt.isFinite()) {
			if(src.isNaN() || tgt.isNaN() || (src.isInfinite() && tgt.isInfinite() && !src.equalsState(tgt))) {
				return BigDecimal.NaN;
			}
			else if(src.isPositiveInfinity() || tgt.isPositiveInfinity()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
			else {
				return BigDecimal.NEGATIVE_INFINITY;
			}
		}
		const mc = context ? context : augend.default_context;
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
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A - B
	 */
	sub(number, context) {
		const subtrahend = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= subtrahend;
		if(!src.isFinite() || !tgt.isFinite()) {
			if(src.isNaN() || tgt.isNaN() || src.equalsState(tgt)) {
				return BigDecimal.NaN;
			}
			else if(src.isNegativeInfinity() || tgt.isPositiveInfinity()) {
				return BigDecimal.NEGATIVE_INFINITY;
			}
			else {
				return BigDecimal.POSITIVE_INFINITY;
			}
		}
		const mc = context ? context : subtrahend.default_context;
		const newscale	= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			return new BigDecimal([src.integer.sub(tgt.integer), newscale, mc]);
		}
		else if(src._scale > tgt._scale) {
			const newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.sub(newdst.integer), newscale, mc]);
		}
		else {
			const newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.sub(tgt.integer), newscale, mc]);
		}
	}

	/**
	 * Multiply.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A * B
	 */
	mul(number, context) {
		const multiplicand = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= multiplicand;
		if(!src.isFinite() || !tgt.isFinite()) {
			if(src.isNaN() || tgt.isNaN() || (src.isZero() || tgt.isZero())) {
				return BigDecimal.NaN;
			}
			else if(src.sign() * tgt.sign() > 0) {
				return BigDecimal.POSITIVE_INFINITY;
			}
			else {
				return BigDecimal.NEGATIVE_INFINITY;
			}
		}
		const mc = context ? context : multiplicand.default_context;
		const newinteger	= src.integer.mul(tgt.integer);
		// 0.1 * 0.01 = 0.001
		const newscale	= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	}

	/**
	 * Divide not calculated to the decimal point.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} (int)(A / B)
	 */
	divideToIntegralValue(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		const src		= this;
		const tgt		= divisor;
		if(!src.isFinite() || !tgt.isFinite()) {
			if(src.isNaN() || tgt.isNaN() || (src.isInfinite() && tgt.isInfinite())) {
				return BigDecimal.NaN;
			}
			else if(src.isInfinite()) {
				if(src.sign() * tgt.sign() >= 0) {
					return BigDecimal.POSITIVE_INFINITY;
				}
				else {
					return BigDecimal.NEGATIVE_INFINITY;
				}
			}
			else {
				return BigDecimal.ZERO;
			}
		}
		else if(tgt.isZero()) {
			if(src.isZero()) {
				return BigDecimal.NaN;
			}
			else {
				return src.sign() >= 0 ? BigDecimal.POSITIVE_INFINITY : BigDecimal.NEGATIVE_INFINITY;
			}
		}
		const mc = context ? context : divisor.default_context;
		/**
		 * @param {number} num 
		 * @returns {BigInteger}
		 */
		const getDigit  = function( num ) {
			let i;
			let text = "1";
			for(i = 0; i < num; i++) {
				text = text + "0";
			}
			return new BigInteger(text);
		};
		if(tgt.compareTo(BigDecimal.ZERO) === 0) {
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
		let src_integer	= src.integer;
		let tgt_integer	= tgt.integer;
		const newScale	= src._scale - tgt._scale;

		// 100e-2 / 3e-1 = 1 / 0.3 -> 100 / 30
		if(src._scale > tgt._scale) {
			// src._scale に合わせる
			tgt_integer = tgt_integer.mul(getDigit(  newScale ));
		}
		// 1e-1 / 3e-2 = 0.1 / 0.03 -> 10 / 3
		else if(src._scale < tgt._scale) {
			// tgt._scale に合わせる
			src_integer = src_integer.mul(getDigit( -newScale ));
		}

		// とりあえず計算結果だけ作ってしまう
		const new_integer	= src_integer.div(tgt_integer);
		const sign			= new_integer.sign();
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
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
	 */
	divideAndRemainder(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		if(!this.isFinite() || !divisor.isFinite()) {
			if(this.isNaN() || divisor.isNaN() || (this.isInfinite() && divisor.isInfinite())) {
				return [BigDecimal.NaN, BigDecimal.NaN];
			}
			else if(this.isInfinite()) {
				if(this.sign() * divisor.sign() >= 0) {
					return [BigDecimal.POSITIVE_INFINITY, BigDecimal.NaN];
				}
				else {
					return [BigDecimal.NEGATIVE_INFINITY, BigDecimal.NaN];
				}
			}
			else {
				return [BigDecimal.ZERO, BigDecimal.NaN];
			}
		}
		else if(divisor.isZero()) {
			if(this.isZero()) {
				return [BigDecimal.NaN, BigDecimal.NaN];
			}
			else {
				return [this.sign() >= 0 ? BigDecimal.POSITIVE_INFINITY : BigDecimal.NEGATIVE_INFINITY, BigDecimal.NaN];
			}
		}
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
		const result_remaind	= this.sub(result_divide.mul(divisor, mc), mc);

		const output = [result_divide, result_remaind];
		return output;
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A % B
	 */
	rem(number, context) {
		return this.divideAndRemainder(number, context)[1];
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Divisor.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A mod B
	 */
	mod(number, context) {
		const src = this;
		const tgt = BigDecimal._toBigDecimal(number);
		if(tgt.isZero()) {
			return src;
		}
		const x = src.rem(tgt, context);
		if(!src.equalsState(tgt)) {
			return x.add(tgt, context);
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
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext|KBigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
	 * @returns {BigDecimal}
	 */
	div(number, type) {
		const divisor = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= divisor;
		if(!src.isFinite() || !tgt.isFinite()) {
			if(src.isNaN() || tgt.isNaN() || (src.isInfinite() && tgt.isInfinite())) {
				return BigDecimal.NaN;
			}
			else if(src.isInfinite()) {
				if(src.sign() * tgt.sign() >= 0) {
					return BigDecimal.POSITIVE_INFINITY;
				}
				else {
					return BigDecimal.NEGATIVE_INFINITY;
				}
			}
			else {
				return BigDecimal.ZERO;
			}
		}
		else if(tgt.isZero()) {
			if(src.isZero()) {
				return BigDecimal.NaN;
			}
			else {
				return src.sign() >= 0 ? BigDecimal.POSITIVE_INFINITY : BigDecimal.NEGATIVE_INFINITY;
			}
		}
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
			/**
			 * @type {any}
			 */
			const result_map = {};
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
	 * Inverse number of this value.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} 1 / A
	 */
	inv(context) {
		{
			if(!this.isFinite()) {
				return this.isNaN() ? BigDecimal.NaN : BigDecimal.ZERO;
			}
			if(this.isZero()) {
				return BigDecimal.NaN;
			}
		}
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
			const h = B1.sub(A.mul(xn), mc);
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h).add(h.square()), mc);
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
		if(!this.isFinite()) {
			return this;
		}
		const mc = context ? context : this.default_context;
		const y = new BigDecimal((new BigInteger(this)).factorial());
		return y.round(mc);
	}

	/**
	 * Multiply a multiple of ten.
	 * - Supports only integers.
	 * - Only the scale is changed without changing the precision.
	 * @param {KBigDecimalInputData} n 
	 * @returns {BigDecimal} A * 10^floor(n)
	 */
	scaleByPowerOfTen(n) {
		if(!this.isFinite()) {
			return this;
		}
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
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return this.integer.booleanValue;
	}

	/**
	 * 32-bit integer value.
	 * @returns {number}
	 */
	get intValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
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
		if(!this.isFinite()) {
			throw "ArithmeticException";
		}
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
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		const p = this.precision();
		if(MathContext.DECIMAL32.getPrecision() < p) {
			return(this.sign() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	}

	/**
	 * 64-bit floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
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
	 * @param {KBigDecimalInputData} number 
	 * @param {KBigDecimalInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		// 誤差を指定しない場合は、厳密に調査
		if(!tolerance) {
			if((number instanceof BigDecimal) || (typeof number === "string")) {
				const val = number instanceof BigDecimal ? number : BigDecimal._toBigDecimal(number);
				if(this.isNaN() || val.isNaN()) {
					return false;
				}
				else {
					return (this.equalsState(val) && (this._scale === val._scale) && this.integer.equals(val.integer));
				}
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
	 * Numeric type match.
	 * @param {KBigDecimalInputData} number 
	 * @returns {boolean}
	 */
	equalsState(number) {
		const x = this;
		const y = BigDecimal._toBigDecimal(number);
		return x.integer.equalsState(y.integer);
	}

	/**
	 * Compare values.
	 * @param {KBigDecimalInputData} number
	 * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const src = this;
		const tgt = BigDecimal._toBigDecimal(number);
		// 特殊な条件
		if(!src.isFinite() || !tgt.isFinite()) {
			return src.integer.compareTo(tgt.integer);
		}
		// 通常の条件
		if(!tolerance) {
			// 誤差の指定がない場合
			// 簡易計算
			{
				const src_sign	= src.sign();
				const tgt_sign	= tgt.sign();
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
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} max([A, B])
	 */
	max(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.isNaN() || val.isNaN()) {
			return BigDecimal.NaN;
		}
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * Minimum number.
	 * @param {KBigDecimalInputData} number 
	 * @returns {BigDecimal} min([A, B])
	 */
	min(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.isNaN() || val.isNaN()) {
			return BigDecimal.NaN;
		}
		if(this.compareTo(val) <= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * Clip number within range.
	 * @param {KBigDecimalInputData} min
	 * @param {KBigDecimalInputData} max
	 * @returns {BigDecimal} min(max(x, min), max)
	 */
	clip(min, max) {
		const min_ = BigDecimal._toBigDecimal(min);
		const max_ = BigDecimal._toBigDecimal(max);
		if(this.isNaN() || min_.isNaN() || max_.isNaN()) {
			return BigDecimal.NaN;
		}
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
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
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
	 * @param {KBigDecimalInputData} e_len - Number of digits in exponent part.
	 * @returns {string} 
	 */
	toScientificNotation(e_len) {
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
		const e		= BigDecimal._toInteger(e_len);
		const text	= this._getUnsignedIntegerString();
		let s		= this.scale();
		const x		= [];
		let i, k;
		// -
		if(this.sign() === -1) {
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
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
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
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
		// スケールの変換なし
		if(this.scale() === 0) {
			if(this.sign() < 0) {
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
	 * @param {KBigDecimalInputData} new_scale - New scale.
	 * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - Rounding method when converting precision.
	 * @returns {BigDecimal} 
	 */
	setScale(new_scale, rounding_mode) {
		if(!this.isFinite()) {
			return this;
		}
		const newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		const roundingMode = (rounding_mode !== undefined) ? RoundingMode.valueOf(rounding_mode) : RoundingMode.UNNECESSARY;
		// 文字列を扱ううえで、符号があるとやりにくいので外しておく
		let text		= this._getUnsignedIntegerString();
		const sign		= this.sign();
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
		if(!this.isFinite()) {
			return this;
		}
		if(arguments.length === 1) {
			if(mc !== undefined) {
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
				const sign_text	= newBigDecimal.integer.sign() >= 0 ? "" : "-";
				const abs_text	= newBigDecimal._getUnsignedIntegerString();
				const inte_text	= sign_text + abs_text.substring(0, abs_text.length - 1);
				return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1]);
			}
			else {
				return this;
			}
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
		if(!this.isFinite()) {
			return this;
		}
		return this.setScale(0, RoundingMode.FLOOR);
	}

	/**
	 * Ceil.
	 * @returns {BigDecimal} ceil(A)
	 */
	ceil() {
		if(!this.isFinite()) {
			return this;
		}
		return this.setScale(0, RoundingMode.CEILING);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {BigDecimal} fix(A), trunc(A)
	 */
	fix() {
		if(!this.isFinite()) {
			return this;
		}
		return this.setScale(0, RoundingMode.DOWN);
	}

	/**
	 * Fraction.
	 * @returns {BigDecimal} fract(A)
	 */
	fract() {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
		return this.sub(this.floor());
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * - An exception occurs when doing a huge multiplication.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} pow(A, B)
	 */
	pow(number, context) {
		const num = BigDecimal._toBigDecimal(number);
		const src = this;
		const tgt = num;
		const mc = context ? context : this.default_context;
		{
			if(src.isNaN() || tgt.isNaN()) {
				return BigDecimal.NaN;
			}
			if(tgt.isZero()) {
				return context ? BigDecimal.ONE.round(context) : BigDecimal.ONE;
			}
			else if(src.isZero()) {
				return BigDecimal.ZERO;
			}
			else if(src.isOne()) {
				return context ? src.round(context) : src;
			}
			else if(src.isInfinite()) {
				if(src.isPositiveInfinity()) {
					return BigDecimal.POSITIVE_INFINITY;
				}
				else {
					if(tgt.isPositiveInfinity()) {
						return BigDecimal.NaN;
					}
					else {
						return BigDecimal.create(Infinity * Math.pow(-1, Math.round(tgt.doubleValue)));
					}
				}
			}
			else if(tgt.isInfinite()) {
				if(src.isNegative()) {
					// 複素数
					return BigDecimal.NaN;
				}
				if(src.compareTo(BigDecimal.ONE) < 0) {
					if(tgt.isPositiveInfinity()) {
						return BigDecimal.ZERO;
					}
					else if(tgt.isNegativeInfinity()) {
						return BigDecimal.POSITIVE_INFINITY;
					}
				}
				else {
					if(tgt.isPositiveInfinity()) {
						return BigDecimal.POSITIVE_INFINITY;
					}
					else if(tgt.isNegativeInfinity()) {
						return BigDecimal.ZERO;
					}
				}
			}
		}
		const integer = tgt.intValue;
		if(Math.abs(integer) > 1000) {
			throw BigDecimal.POSITIVE_INFINITY;
		}
		else if((mc.getPrecision() === 0) && (tgt.isNegative())) {
			return BigDecimal.NaN; // 複素数
		}
		if(tgt.isInteger()) {
			const is_negative = tgt.isNegative();
			let n = Math.round(Math.abs(integer));
			let x, y;
			x = this.clone();
			y = BigDecimal.ONE;
			while(n !== 0) {
				if((n & 1) !== 0) {
					y = y.mul(x, MathContext.UNLIMITED);
				}
				x = x.mul(x.clone(), MathContext.UNLIMITED);
				n >>>= 1;
			}
			// コンテキストの状態が変わっているので元に戻す
			y.default_context = mc;
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
	 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} A^2
	 */
	square(mc) {
		return this.mul(this, mc);
	}

	/**
	 * Square root.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sqrt(A)
	 */
	sqrt(context) {
		{
			if(this.isZero()) {
				return BigDecimal.ZERO;
			}
			else if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isNegative()) {
				return BigDecimal.NaN; // 複素数
			}
			else if(this.isInfinite()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
		}
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
		if(this.isZero()) {
			return BigDecimal.ZERO.round(context);
		}
		// 上記は割り算があり速度が遅いので、以下の計算で求める。
		return this.rsqrt(context).inv(context);
	}

	/**
	 * Reciprocal square root.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} rsqrt(A)
	 */
	rsqrt(context) {
		{
			if(this.isZero()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
			else if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isInfinite()) {
				return BigDecimal.ZERO;
			}
			else if(this.isNegative()) {
				return BigDecimal.NaN; // 複素数
			}
		}
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
			throw "ArithmeticException";
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
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} log(A)
	 */
	log(context) {
		{
			if(this.isZero()) {
				return BigDecimal.NEGATIVE_INFINITY;
			}
			else if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isNegative()) {
				return BigDecimal.NaN; // 複素数
			}
			else if(this.isInfinite()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
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
					a = a.div(e, mc);
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
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} exp(A)
	 */
	exp(context) {
		{
			if(this.isZero()) {
				return new BigDecimal([1, context]);
			}
			else if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isNegativeInfinity()) {
				return BigDecimal.ZERO;
			}
			else if(this.isPositiveInfinity()) {
				return BigDecimal.POSITIVE_INFINITY;
			}
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
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sin(A)
	 */
	sin(context) {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
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
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} cos(A)
	 */
	cos(context) {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
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
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} tan(A)
	 */
	tan(context) {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
		const mc = context ? context : this.default_context;
		return this.sin(mc).div(this.cos(mc));
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} atan(A)
	 */
	atan(context) {
		if(!this.isFinite()) {
			if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isPositiveInfinity()) {
				return BigDecimal.HALF_PI;
			}
			else {
				return BigDecimal.HALF_PI.negate();
			}
		}
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
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} atan2(Y, X)
	 */
	atan2(number, context) {
		const default_context = BigDecimal.getDefaultContext();
		// y.atan2(x) とする。
		const y = this.round(context);
		const x = new BigDecimal([number, context]);
		if(x.isNaN() || y.isNaN()) {
			return BigDecimal.NaN;
		}
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
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} asin(A)
	 */
	asin(context) {
		// 逆正弦
		const mc = context ? context : this.default_context;
		// 複素数
		const re_1 = this.square().negate().add(1).sqrt();
		const im_1 = this;
		// 複素数のログ
		const norm = re_1.square().add(im_1.square()).sqrt();
		const arg  = im_1.atan2(re_1);
		const re_2 = norm.log();
		const im_2 = arg;
		// -i を掛け算する
		return re_2.add(im_2, mc);
	}

	/**
	 * Arc cosine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acos(A)
	 */
	acos(context) {
		// 逆余弦
		const mc = context ? context : this.default_context;
		// 複素数
		const re_1 = this;
		const im_1 = this.square().negate().add(1).sqrt();
		// 複素数のログ
		const norm = re_1.square().add(im_1.square()).sqrt();
		const arg  = im_1.atan2(re_1);
		const re_2 = norm.log();
		const im_2 = arg;
		// -i を掛け算する
		return re_2.add(im_2, mc);
	}
	

	/**
	 * Hyperbolic sine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sinh(A)
	 */
	sinh(context) {
		// 双曲線正弦
		if(this.isInfinite()) {
			return this;
		}
		const mc = context ? context : this.default_context;
		const y = this.exp();
		return y.sub(y.inv()).mul(0.5, mc);
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} asinh(A)
	 */
	asinh(context) {
		// 逆双曲線正弦 Math.log(x + Math.sqrt(x * x + 1));
		if(this.isInfinite()) {
			return this;
		}
		const mc = context ? context : this.default_context;
		return this.add(this.mul(this).add(1).sqrt()).log(mc);
	}

	/**
	 * Hyperbolic cosine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} cosh(A)
	 */
	cosh(context) {
		// 双曲線余弦
		if(this.isInfinite()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		const mc = context ? context : this.default_context;
		return this.exp().add(this.negate().exp()).mul(0.5, mc);
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acosh(A)
	 */
	acosh(context) {
		// 逆双曲線余弦 Math.log(x + Math.sqrt(x * x - 1));
		if(this.isInfinite()) {
			return BigDecimal.NaN;
		}
		const mc = context ? context : this.default_context;
		return this.add(this.mul(this).sub(1).sqrt()).log(mc);
	}

	/**
	 * Hyperbolic tangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} tanh(A)
	 */
	tanh(context) {
		// 双曲線正接
		if(this.isInfinite()) {
			return BigDecimal.create(this.sign());
		}
		const mc = context ? context : this.default_context;
		const y =  this.mul(2).exp();
		return y.sub(1).div(y.add(1), mc);
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} atanh(A)
	 */
	atanh(context) {
		// 逆双曲線正接
		const mc = context ? context : this.default_context;
		return this.add(1).div(this.negate().add(1)).log().mul(0.5, mc);
	}

	/**
	 * Secant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sec(A)
	 */
	sec(context) {
		// 正割
		const mc = context ? context : this.default_context;
		return this.cos().inv(mc);
	}

	/**
	 * Reverse secant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} asec(A)
	 */
	asec(context) {
		// 逆正割
		const mc = context ? context : this.default_context;
		return this.inv().acos(mc);
	}

	/**
	 * Hyperbolic secant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sech(A)
	 */
	sech(context) {
		// 双曲線正割
		if(this.isNegativeInfinity()) {
			return BigDecimal.ZERO;
		}
		const mc = context ? context : this.default_context;
		return this.exp().add(this.negate().exp()).inv().mul(2, mc);
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} asech(A)
	 */
	asech(context) {
		// 逆双曲線正割
		const mc = context ? context : this.default_context;
		return this.inv().add(this.square().inv().sub(1).sqrt()).log(mc);
	}

	/**
	 * Cotangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} cot(A)
	 */
	cot(context) {
		// 余接
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		const mc = context ? context : this.default_context;
		return this.tan().inv(mc);
	}

	/**
	 * Inverse cotangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acot(A)
	 */
	acot(context) {
		// 逆余接
		if(this.isZero()) {
			return BigDecimal.HALF_PI;
		}
		const mc = context ? context : this.default_context;
		return this.inv().atan(mc);
	}

	/**
	 * Hyperbolic cotangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} coth(A)
	 */
	coth(context) {
		// 双曲線余接
		if(this.isInfinite()) {
			return BigDecimal.create(this.sign());
		}
		const mc = context ? context : this.default_context;
		const y =  this.mul(2).exp();
		return y.add(1).div(y.sub(1), mc);
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acoth(A)
	 */
	acoth(context) {
		// 逆双曲線余接
		if(this.isInfinite()) {
			return BigDecimal.ZERO;
		}
		const mc = context ? context : this.default_context;
		return this.add(1).div(this.sub(1)).log().mul(0.5, mc);
	}

	/**
	 * Cosecant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} csc(A)
	 */
	csc(context) {
		// 余割
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		const mc = context ? context : this.default_context;
		return this.sin().inv(mc);
	}

	/**
	 * Inverse cosecant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acsc(A)
	 */
	acsc(context) {
		// 逆余割
		const mc = context ? context : this.default_context;
		return this.inv().asin(mc);
	}

	/**
	 * Hyperbolic cosecant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} csch(A)
	 */
	csch(context) {
		if(this.isInfinite()) {
			return BigDecimal.ZERO;
		}
		else if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		// 双曲線余割
		const mc = context ? context : this.default_context;
		return this.exp().sub(this.negate().exp()).inv().mul(2, mc);
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} acsch(A)
	 */
	acsch(context) {
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		// 逆双曲線余割
		const mc = context ? context : this.default_context;
		return this.inv().add(this.square().inv().add(1).sqrt()).log(mc);
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
	 * @returns {BigDecimal} sinc(A)
	 */
	sinc(context) {
		const mc = context ? context : this.default_context;
		if(this.isZero()) {
			return(BigDecimal.ONE);
		}
		const x = BigDecimal.PI.mul(this);
		return x.sin().div(x, mc);
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		if(!this.isFinite()) {
			return false;
		}
		return this.sub(this.fix()).isZero(tolerance);
	}

	/**
	 * this === 0
	 * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZero(tolerance) {
		if(!this.isFinite()) {
			return false;
		}
		if(tolerance) {
			return this.equals(BigDecimal.ZERO, tolerance);
		}
		else {
			return this.integer.isZero();
		}
	}
	
	/**
	 * this === 1
	 * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOne(tolerance) {
		if(!this.isFinite()) {
			return false;
		}
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
	
	/**
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return this.integer.isNaN();
	}
	
	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this.integer.isPositiveInfinity();
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this.integer.isNegativeInfinity();
	}

	/**
	 * this === Infinity or -Infinity
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return this.integer.isInfinite();
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return this.integer.isFinite();
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A & B
	 */
	and(number, context) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const mc = context ? context : n_tgt.default_context;
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal([src.and(tgt), mc]);
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A | B
	 */
	or(number, context) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const mc = context ? context : n_tgt.default_context;
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal([src.or(tgt), mc]);
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A ^ B
	 */
	xor(number, context) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const mc = context ? context : n_tgt.default_context;
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal([src.xor(tgt), mc]);
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} !A
	 */
	not(context) {
		const mc = context ? context : this.default_context;
		const n_src = this;
		const src	= n_src.round().toBigInteger();
		return new BigDecimal([src.not(), mc]);
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} n
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} A << n
	 */
	shift(n, context) {
		const mc = context ? context : this.default_context;
		const src		= this.round().toBigInteger();
		const number	= BigDecimal._toInteger(n);
		return new BigDecimal([src.shift(number), mc]);
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} gcd(x, y)
	 */
	gcd(number, context) {
		const mc = context ? context : this.default_context;
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.gcd(y);
		return new BigDecimal([result, mc]);
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {Array<BigDecimal>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number, context) {
		const mc = context ? context : this.default_context;
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.extgcd(y);
		return [new BigDecimal([result[0], mc]), new BigDecimal([result[1], mc]), new BigDecimal([result[2], mc])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} lcm(x, y)
	 */
	lcm(number, context) {
		const mc = context ? context : this.default_context;
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.lcm(y);
		return new BigDecimal([result, mc]);
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} exponent
	 * @param {KBigDecimalInputData} m 
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} A^B mod m
	 */
	modPow(exponent, m, context) {
		const mc = context ? context : this.default_context;
		const A = this.round().toBigInteger();
		const B = BigDecimal._toBigDecimal(exponent).toBigInteger();
		const m_ = BigDecimal._toBigDecimal(m).toBigInteger();
		const result = A.modPow(B, m_);
		return new BigDecimal([result, mc]);
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} m
	 * @param {MathContext} [context] - MathContext setting after calculation.
	 * @returns {BigDecimal} A^(-1) mod m
	 */
	modInverse(m, context) {
		const mc = context ? context : this.default_context;
		const A = this.round().toBigInteger();
		const m_ = BigDecimal._toBigDecimal(m).toBigInteger();
		const result = A.modInverse(m_);
		return new BigDecimal([result, mc]);
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
		const src = this.round().toBigInteger();
		return src.isPrime();
	}
	
	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const src = this.round().toBigInteger();
		return src.isProbablePrime(certainty !== undefined ? BigDecimal._toInteger(certainty) : undefined);
	}

	/**
	 * Next prime.
	 * @param {KBigDecimalInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KBigDecimalInputData} [search_max=100000] - Search range of next prime.
	 * @returns {BigDecimal}
	 */
	nextProbablePrime(certainty, search_max) {
		const src = this.round().toBigInteger();
		const p1 = certainty !== undefined ? BigDecimal._toInteger(certainty) : undefined;
		const p2 = search_max !== undefined ? BigDecimal._toInteger(search_max) : undefined;
		return BigDecimal.create(src.nextProbablePrime(p1, p2));
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

	/**
	 * Positive infinity.
	 * @returns {BigDecimal} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {BigDecimal} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {BigDecimal} NaN
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
	 * @returns {number}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {KBigDecimalInputData} number 
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A - B
	 */
	subtract(number, context) {
		return this.sub(number, context);
	}

	/**
	 * Multiply.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A * B
	 */
	multiply(number, context) {
		return this.mul(number, context);
	}

	/**
	 * Divide.
	 * - The argument can specify the scale after calculation.
	 * - In the case of precision infinity, it may generate an error by a repeating decimal.
	 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
	 * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext|KBigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
	 * @returns {BigDecimal} A / B
	 */
	divide(number, type) {
		return this.div(number, type);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KBigDecimalInputData} number
	 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
	 * @returns {BigDecimal} A % B
	 */
	remainder(number, context) {
		return this.rem(number, context);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {BigDecimal} fix(A), trunc(A)
	 */
	trunc() {
		return this.fix();
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
	},
	
	/**
	 * Positive infinity.
	 */
	POSITIVE_INFINITY : new BigDecimal(Number.POSITIVE_INFINITY),

	/**
	 * Negative Infinity.
	 */
	NEGATIVE_INFINITY : new BigDecimal(Number.NEGATIVE_INFINITY),

	/**
	 * Not a Number.
	 */
	NaN : new BigDecimal(Number.NaN)
	
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
		 * @type {string}
		 */
		this.method_name = method_name;
		
		/**
		 * @type {Array<{name:string, number:BigDecimal}>}
		 */
		this.table = [];

		/**
		 * Maximum number of caches.
		 * @type {number}
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
		// @ts-ignore
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

