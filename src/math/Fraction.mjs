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
import BigDecimal from "./BigDecimal.mjs";

// @ts-ignore
import MathContext from "./context/MathContext.mjs";

/**
 * Collection of functions used in Fraction.
 * @ignore
 */
class FractionTool {

	/**
	 * 
	 * @param ntext {string}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_number_string(ntext) {
		let scale = 0;
		let buff;
		// 正規化
		let text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		const number_text = [];
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				number_text.push("-");
			}
		}
		// 整数部があるか
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text.push(buff);
		}
		// 浮動小数点の計算がない場合はここで完了
		if(text.length === 0) {
			return new Fraction([new BigInteger([number_text.join(""), 10]), BigInteger.ONE]);
		}
		// 巡回小数点指定があるか
		let cyclic_decimal = null;
		if(/[()'"[\]]/.test(text)) {
			const match_data = text.match(/([^.]*)\.(\d*)[(['"](\d+)[)\]'"](.*)/);
			if(match_data === null) {
				throw "Fraction Unsupported argument " + text;
			}
			// 巡回少数の場所
			const cyclic_decimal_scale = match_data[2].length;
			const cyclic_decimal_text = match_data[3];
			// 巡回少数以外を抽出
			if(cyclic_decimal_scale === 0) {
				text = match_data[1] + match_data[4];
			}
			else {
				text = match_data[1] + "." + match_data[2] + match_data[4];
			}

			const numerator = new BigInteger([cyclic_decimal_text, 10]);
			const denominator_string = [];
			for(let i = 0; i < cyclic_decimal_text.length; i++) {
				denominator_string.push("9");
			}
			const denominator = new BigInteger([denominator_string.join(""), 10]);
			cyclic_decimal = new Fraction([numerator, denominator]);
			cyclic_decimal = cyclic_decimal.scaleByPowerOfTen(-cyclic_decimal_scale);
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text.push(buff);
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale = scale - parseInt(buff, 10);
		}

		let f = null;
		{
			let numerator = null;
			let denominator = null;
			// 出力用の文字を作成
			if(scale === 0) {
				numerator = new BigInteger([number_text.join(""), 10]);
				denominator = BigInteger.ONE;
			}
			if(scale < 0) {
				for(let i = 0; i < -scale; i++) {
					number_text.push("0");
				}
				numerator = new BigInteger([number_text.join(""), 10]);
				denominator = BigInteger.ONE;
			}
			else if(scale > 0) {
				numerator = new BigInteger([number_text.join(""), 10]);
				const denominator_string = ["1"];
				for(let i = 0; i < scale; i++) {
					denominator_string.push("0");
				}
				denominator = new BigInteger([denominator_string.join(""), 10]);
			}
			f = new Fraction([numerator, denominator]);
		}
		if(cyclic_decimal) {
			f = f.add(cyclic_decimal);
		}
		return f;
	}

	/**
	 * 
	 * @param ntext {string}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_fraction_string(ntext) {
		if(ntext.indexOf("/") === -1) {
			return FractionTool.to_fraction_data_from_number_string(ntext);
		}
		else {
			const fraction_value = ntext.split("/");
			const numerator_value = FractionTool.to_fraction_data_from_number_string(fraction_value[0]);
			const denominator_value = FractionTool.to_fraction_data_from_number_string(fraction_value[1]);
			return numerator_value.div(denominator_value);
		}
	}

	/**
	 * 
	 * @param value {number}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_number(value) {
		let numerator = null;
		let denominator = null;
		// 整数
		if(value === Math.floor(value)) {
			numerator = new BigInteger(value);
			denominator = BigInteger.ONE;
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
			if(scale <= 0) {
				numerator = new BigInteger(value);
				denominator = BigInteger.ONE;
			}
			else {
				numerator = new BigInteger(x);
				const denominator_string = ["1"];
				for(let i = 0; i < scale; i++) {
					denominator_string.push("0");
				}
				denominator = new BigInteger([denominator_string.join(""), 10]);
			}
		}
		return new Fraction([numerator, denominator]);
	}

	/**
	 * @param value {Fraction}
	 */
	static normalization(value) {
		if(value.denominator.equals(BigInteger.ONE)) {
			return;
		}
		if(value.denominator.equals(BigInteger.MINUS_ONE)) {
			value.numerator = value.numerator.negate();
			value.denominator = BigInteger.ONE;
			return;
		}
		if(value.numerator.equals(BigInteger.ZERO)) {
			value.denominator = BigInteger.ONE;
			return;
		}
		const gcd = value.numerator.gcd(value.denominator);
		let numerator = value.numerator.div(gcd);
		let denominator = value.denominator.div(gcd);
		if(denominator.sign() < 0) {
			numerator = numerator.negate();
			denominator = denominator.negate();
		}
		value.numerator = numerator;
		value.denominator = denominator;
	}

}

/**
 * Fraction class (immutable).
 */
export default class Fraction {

	/**
	 * Create an fraction.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} [number] - Fraction data. See how to use the function.
	 */
	constructor(number) {
		
		// 分子
		/**
		 * @type {BigInteger}
		 */
		this.numerator = null;

		// 分母
		/**
		 * @type {BigInteger}
		 */
		this.denominator = null;

		if(arguments.length === 0) {
			this.numerator = BigInteger.ZERO;
			this.denominator = BigInteger.ONE;
		}
		else if(arguments.length === 1) {
			let is_normalization = false;
			if(typeof number === "number") {
				const x = FractionTool.to_fraction_data_from_number(number);
				this.numerator = x.numerator;
				this.denominator = x.denominator;
			}
			else if(typeof number === "string") {
				const x = FractionTool.to_fraction_data_from_fraction_string(number);
				this.numerator = x.numerator;
				this.denominator = x.denominator;
			}
			else if(number instanceof BigInteger) {
				this.numerator = number;
				this.denominator = BigInteger.ONE;
			}
			else if(number instanceof Fraction) {
				this.numerator = number.numerator;
				this.denominator = number.denominator;
			}
			else if((number instanceof Array) && (number.length === 2)) {
				this.numerator = (number[0] instanceof BigInteger) ? number[0] : new BigInteger(number[0]);
				this.denominator = (number[1] instanceof BigInteger) ? number[1] : new BigInteger(number[1]);
				is_normalization = true;
			}
			else if((number instanceof Object) && number.numerator && number.denominator) {
				this.numerator = (number.numerator instanceof BigInteger) ? number.numerator : new BigInteger(number.numerator);
				this.denominator = (number.denominator instanceof BigInteger) ? number.denominator : new BigInteger(number.denominator);
				is_normalization = true;
			}
			else if(number instanceof BigDecimal) {
				const value = new Fraction(number.unscaledValue());
				const x = value.scaleByPowerOfTen(-number.scale());
				this.numerator = x.numerator;
				this.denominator = x.denominator;
			}
			else if(number instanceof Object) {
				const x1 = FractionTool.to_fraction_data_from_fraction_string(number.toString());
				this.numerator = x1.numerator;
				this.denominator = x1.denominator;
			}
			else {
				throw "Fraction Unsupported argument " + number;
			}
			if(is_normalization) {
				FractionTool.normalization(this);
			}
		}
		else {
			throw "Fraction Unsupported argument " + number;
		}
	}

	/**
	 * Create an entity object of this class.
	 * @returns {Fraction}
	 */
	static create(number) {
		if(number instanceof Fraction) {
			return number;
		}
		else {
			return new Fraction(number);
		}
	}

	/**
	 * Convert number to Fraction type.
	 * @returns {Fraction}
	 */
	static valueOf(number) {
		return Fraction.create(number);
	}

	/**
	 * Convert to Fraction.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
	 * @returns {Fraction}
	 * @private
	 */
	static _toFraction(number) {
		if(number instanceof Fraction) {
			return number;
		}
		else {
			return new Fraction(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof Fraction) {
			return number.doubleValue;
		}
		else {
			return (new Fraction(number)).doubleValue;
		}
	}

	/**
	 * Convert to integer.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		if(typeof number === "number") {
			return Math.trunc(number);
		}
		else if(number instanceof Fraction) {
			return number.intValue;
		}
		else {
			return (new Fraction(number)).intValue;
		}
	}

	/**
	 * Deep copy.
	 * @returns {Fraction} 
	 */
	clone() {
		return new Fraction(this);
	}
	
	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		if(this.isInteger()) {
			return Math.trunc(this.numerator.doubleValue);
		}
		return Math.trunc(this.doubleValue);
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		if(this.isInteger()) {
			return this.numerator.doubleValue;
		}
		const x = new BigDecimal([this.numerator, MathContext.UNLIMITED]);
		const y = new BigDecimal([this.denominator, MathContext.UNLIMITED]);
		return x.div(y, {context : MathContext.DECIMAL64}).doubleValue;
	}

	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		return this.numerator.toString() + " / " + this.denominator.toString();
	}

	/**
	 * 
	 * @return {boolean}
	 */
	isInteger() {
		return this.denominator.equals(BigInteger.ONE);
	}

	/**
	 * this === 0
	 * @return {boolean} A === 0
	 */
	isZero() {
		return this.numerator.equals(BigInteger.ZERO) && this.denominator.equals(BigInteger.ONE);
	}

	/**
	 * this === 1
	 * @return {boolean} A === 1
	 */
	isOne() {
		return this.numerator.equals(BigInteger.ONE) && this.denominator.equals(BigInteger.ONE);
	}

	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return this.numerator.isPositive();
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return this.numerator.isNegative();
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this.numerator.isNotNegative();
	}

	/**
	 * Add.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
	 * @return {Fraction}
	 */
	add(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		let f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.add(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([
				x.numerator.mul(y.denominator).add(y.numerator.mul(x.denominator)),
				x.denominator.mul(y.denominator)
			]);
		}
		return f;
	}

	/**
	 * Subtract.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
	 * @return {Fraction}
	 */
	sub(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		let f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.sub(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([
				x.numerator.mul(y.denominator).sub(y.numerator.mul(x.denominator)),
				x.denominator.mul(y.denominator)
			]);
		}
		return f;
	}

	/**
	 * Multiply.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
	 * @return {Fraction}
	 */
	mul(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		let f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.mul(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([ x.numerator.mul(y.numerator), x.denominator.mul(y.denominator) ]);
		}
		return f;
	}

	/**
	 * Divide.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
	 * @return {Fraction}
	 */
	div(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		let f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator, y.denominator]);
		}
		else {
			f = new Fraction([ x.numerator.mul(y.denominator), y.denominator.mul(x.numerator)]);
		}
		return f;
	}

	/**
	 * Multiply a multiple of ten.
	 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} n
	 * @returns {Fraction}
	 */
	scaleByPowerOfTen(n) {
		const scale = Fraction._toInteger(n);
		if(scale === 0) {
			return this;
		}
		let f;
		if(scale > 0) {
			f = new Fraction([ this.numerator.scaleByPowerOfTen(scale), this.denominator]);
		}
		else if(scale < 0) {
			f = new Fraction([ this.numerator, this.denominator.scaleByPowerOfTen(-scale)]);
		}
		return f;
	}

	/**
	 * 1
	 * @returns {Fraction} 1
	 */
	static get ONE() {
		return DEFINE.ONE;
	}
	
	/**
	 * 0
	 * @returns {Fraction} 0
	 */
	static get ZERO() {
		return DEFINE.ZERO;
	}

	/**
	 * -1
	 * @returns {Fraction} -1
	 */
	static get MINUS_ONE() {
		return DEFINE.MINUS_ONE;
	}

}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE = {

	/**
	 * 1
	 */
	ONE : new Fraction([BigInteger.ONE, BigInteger.ONE]),

	/**
	 * 0
	 */
	ZERO : new Fraction([BigInteger.ZERO, BigInteger.ONE]),
	
	/**
	 * -1
	 */
	MINUS_ONE : new Fraction([BigInteger.MINUS_ONE, BigInteger.ONE]),

};
