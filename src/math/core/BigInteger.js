/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Polyfill from "../tools/Polyfill.js";
import Random from "./tools/Random.js";
import Fraction from "./Fraction.js";
import BigDecimal from "./BigDecimal.js";
import Complex from "./Complex.js";
import Matrix from "./Matrix.js";
import MathContext from "./context/MathContext.js";

/**
 * BigInteger type argument.
 * - BigInteger
 * - number
 * - string
 * - Array<string|number>
 * - {toBigInteger:function}
 * - {intValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
 * - "0xff", ["ff", 16]
 * - "0o01234567", ["01234567", 8]
 * - "0b0110101", ["0110101", 2]
 * @typedef {BigInteger|number|boolean|string|Array<string|number>|{toBigInteger:function}|{intValue:number}|{toString:function}} KBigIntegerInputData
 */

/**
 * Random number class to be used when the random number class is not set.
 * @type {Random}
 * @ignore
 */
let DEFAULT_RANDOM = new Random();

/**
 * Collection of functions used in BigInteger.
 * @ignore
 */
class BigIntegerTool {

	/**
	 * Return a hex array from a string containing numbers.
	 * @param {string} text - String containing a number (remove the negative sign).
	 * @param {number} radix - Base number.
	 * @returns {Array<number>} Hex array.
	 */
	static toHexadecimalArrayFromPlainString(text, radix) {
		// 下の変換をすることで、2進数での変換時に内部のforの繰り返す回数が減る
		// v0.03 出来る限りまとめてn進数変換する
		const max_num = 0x3FFFFFFF;
		const keta = Math.floor( Math.log(max_num) / Math.log(radix) );

		/**
		 * @type {Array<number>}
		 */
		let x = [];
		
		/**
		 * @type {Array<number>}
		 */
		const y = [];
		const len = Math.ceil(text.length / keta);
		let offset = text.length;
		for(let i = 0; i < len; i++ ) {
			offset -= keta;
			if(offset >= 0) {
				x[i] = parseInt(text.substring(offset, offset + keta), radix);
			}
			else {
				x[i] = parseInt(text.substring(0, offset + keta), radix);
			}
		}
		const calcradix = Math.round(Math.pow(radix, keta));
		// v0.03ここまで
		// 2で割っていくアルゴリズムで2進数に変換する
		while(x.length !==  0) {
			// 2で割っていく
			// 隣の桁でたcarryはradix進数をかけて桁上げしてる
			let carry = 0;
			for(let i = x.length - 1; i >= 0; i--) {
				const a = x[i] + carry * calcradix;
				x[i]  = a >>> 1;
				carry = a & 1;
			}
			// 1余るかどうかをテストする
			y[y.length] = carry;
			// xが0になっている部分は削除していく
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		// メモリ節約のため1つの変数（16ビット）に収めるだけ収めていく
		x = [];
		for(let i = 0; i < y.length; i++) {
			x[i >>> 4] |= y[i] << (i & 0xF);
		}
		return x;
	}

	/**
	 * Remove exponent notation in strings representing unsigned numbers.
	 * @param {string} ntext 
	 * @returns {string}
	 */
	static toPlainStringFromString(ntext) {
		let scale = 0;
		let buff;
		// 正規化
		let text = ntext.replace(/\s/g, "").toLowerCase();

		/**
		 * @type {Array<string>}
		 */
		const number_text = [];
		// 整数部を抽出
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text.push(buff);
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
			scale -= parseInt(buff, 10);
		}
		// 出力用の文字を作成
		let output_string;
		if(scale === 0) {
			output_string = number_text.join("");
		}
		if(scale < 0) {
			for(let i = 0; i < -scale; i++) {
				number_text.push("0");
			}
			output_string = number_text.join("");
		}
		else if(scale > 0) {
			output_string = number_text.join("");
			output_string = output_string.substring(0, output_string.length - scale);
			output_string = output_string.length !== 0 ? output_string : "0";
		}
		return output_string;
	}

	/**
	 * Return a hexadecimal array from the number.
	 * @param {number} num - Target number.
	 * @returns {{element : Array<number>, state : number}} Data for BigInteger.
	 */
	static toBigIntegerFromNumber(num) {
		if(!isFinite(num)) {
			if(num === Number.POSITIVE_INFINITY) {
				return {
					state : BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY,
					element : []
				};
			}
			if(num === Number.NEGATIVE_INFINITY) {
				return {
					state : BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY,
					element : []
				};
			}
			else {
				return {
					state : BIGINTEGER_NUMBER_STATE.NOT_A_NUMBER,
					element : []
				};
			}
		}
		let x;
		let state;
		if(num === 0) {
			state = BIGINTEGER_NUMBER_STATE.ZERO;
			x = 0;
		}
		else if(num > 0) {
			state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
			x = num;
		}
		else {
			state = BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
			x = -num;
		}
		if(x > 0xFFFFFFFF) {
			return {
				element : BigIntegerTool.toHexadecimalArrayFromPlainString(BigIntegerTool.toPlainStringFromString(x.toFixed()), 10),
				state : state
			};
		}
		/**
		 * @type {Array<number>}
		 */
		const y = [];
		while(x !==  0) {
			y[y.length] = x & 1;
			x >>>= 1;
		}
		/**
		 * @type {Array<number>}
		 */
		const z = [];
		for(let i = 0; i < y.length; i++) {
			z[i >>> 4] |= y[i] << (i & 0xF);
		}
		
		return {
			element : z,
			state : state
		};
	}

	/**
	 * Return string of number from a hexadecimal array.
	 * @param {Array<number>} binary - Hex array.
	 * @param {number} radix - Base number.
	 * @returns {Array<number>} Numeric array for each digit in the specified base number.
	 */
	static toPlainStringFromHexadecimalArray(binary, radix) {

		/**
		 * @param {Array<number>} x1 
		 * @param {Array<number>} x2 
		 * @param {Array<number>} y 
		 */
		const add = function(x1, x2, y) {
			const size = x1.length;
			let carry = 0;
			for(let i = 0; i < size; i++) {
				y[i] = x1[i] + ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(y[i] >= radix) {
					carry = 1;
					y[i] -= radix;
				}
				else {
					carry = 0;
				}
			}
			if(carry === 1) {
				y[size] = 1;
			}
		};
		const y = [0];
		const t = [1];
		for(let i = 0;i < binary.length;i++) {
			for(let j = 0; j < 16; j++) {
				if((binary[i] >>> j) & 1) {
					add(t, y, y);
				}
				add(t, t, t);
			}
		}
		return y;
	}

	/**
	 * @param {number[]} element
	 * @returns {boolean}
	 * @ignore
	 */
	static isZeroElement(element) {
		if(element.length === 0) {
			return true;
		}
		if((element.length === 1 && element[0] === 0)) {
			return true;
		}
		return false;
	}

	/**
	 * Return data to represent multi-precision numbers from strings.
	 * @param {string} text - String containing a number.
	 * @param {number} [radix=10] - Base number.
	 * @returns {{element : Array<number>, state : number}} Data for BigInteger.
	 */
	static toBigIntegerFromString(text, radix) {
		let x = text.replace(/\s/g, "").toLowerCase();
		// 特殊な状態
		{
			if(/nan/.test(text)) {
				return {
					state : BIGINTEGER_NUMBER_STATE.NOT_A_NUMBER,
					element : []
				};
			}
			else if(/inf/.test(text)) {
				if(!/-/.test(text)) {
					return {
						state : BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY,
						element : []
					};
				}
				else {
					return {
						state : BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY,
						element : []
					};
				}
			}
		}
		const sign_text = x.match(/^[-+]+/);

		/**
		 * @type {Array<number>}
		 */
		let element     = [];
		let state       = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;

		if(sign_text !== null) {
			const hit_text = sign_text[0];
			x = x.substring(hit_text.length, x.length);
			if(hit_text.indexOf("-") !== -1) {
				state = BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
			}
		}

		if(radix) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x, radix);
		}
		else if(/^0x/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 16);
		}
		else if(/^0b/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 2);
		}
		else if(/^0o/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 8);
		}
		else {
			x = BigIntegerTool.toPlainStringFromString(x);
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x, 10);
		}
		// "0"の場合がある為
		if(BigIntegerTool.isZeroElement(element)) {
			element = [];
			state = BIGINTEGER_NUMBER_STATE.ZERO;
		}

		return {
			element : element,
			state : state
		};
	}
}

/**
 * Numeric state.
 * @type {{ZERO:number, POSITIVE_NUMBER:number, NEGATIVE_NUMBER:number, NOT_A_NUMBER:number, POSITIVE_INFINITY:number, NEGATIVE_INFINITY:number}}
 * @ignore
 */
const BIGINTEGER_NUMBER_STATE = {
	ZERO : 0,
	POSITIVE_NUMBER : 1,
	NEGATIVE_NUMBER : 2,
	NOT_A_NUMBER : 3,
	POSITIVE_INFINITY : 4,
	NEGATIVE_INFINITY : 5
};

// 内部では1変数内の中の16ビットごとに管理
// 2変数で16ビット*16ビットで32ビットを表す
// this.element	...	16ビットごとに管理
//
// 本クラスはイミュータブルです。
// 内部の「_」から始まるメソッドは内部計算用で非公開です。またミュータブルです。

/**
 * Arbitrary-precision integer class (immutable).
 */
export default class BigInteger {

	/**
	 * Create an arbitrary-precision integer.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
	 * - "0xff", ["ff", 16]
	 * - "0o01234567", ["01234567", 8]
	 * - "0b0110101", ["0110101", 2]
	 * @param {KBigIntegerInputData} [number] - Numeric data. See how to use the function.
	 */
	constructor(number) {
		
		/**
		 * Numeric state.
		 * @private
		 * @type {number}
		 */
		this.state = BIGINTEGER_NUMBER_STATE.ZERO;

		if(arguments.length === 0) {

			/**
			 * An integer consisting of 16 bits per element of the array.
			 * @private
			 * @type {Array<number>}
			 */
			this.element     = [];

		}
		else if(arguments.length === 1) {
			if(number instanceof BigInteger) {
				this.element = number.element.slice(0);
				this.state = number.state;
			}
			else if(typeof number === "number") {
				const x = BigIntegerTool.toBigIntegerFromNumber(number);
				this.element = x.element;
				this.state = x.state;
			}
			else if(typeof number === "string") {
				const x = BigIntegerTool.toBigIntegerFromString(number);
				this.element = x.element;
				this.state = x.state;
			}
			else if(number instanceof Array) {
				if((number.length === 2) && (typeof number[0] === "string" && (typeof number[1] === "number"))) {
					const x = BigIntegerTool.toBigIntegerFromString(number[0], number[1]);
					this.element = x.element;
					this.state = x.state;
				}
				else {
					throw "BigInteger Unsupported argument " + arguments;
				}
			}
			else if(typeof number === "object") {
				if("toBigInteger" in number) {
					const x = number.toBigInteger();
					this.element = x.element;
					this.state = x.state;
				}
				else if("intValue" in number) {
					const x = BigIntegerTool.toBigIntegerFromNumber(number.intValue);
					this.element = x.element;
					this.state = x.state;
				}
				else {
					const x = BigIntegerTool.toBigIntegerFromString(number.toString());
					this.element = x.element;
					this.state = x.state;
				}
			}
			else if(typeof number === "boolean") {
				const x = BigIntegerTool.toBigIntegerFromNumber(number ? 1 : 0);
				this.element = x.element;
				this.state = x.state;
			}
			else {
				throw "BigInteger Unsupported argument " + number;
			}
		}
		else {
			throw "BigInteger Unsupported argument " + number;
		}
	}

	/**
	 * Create an entity object of this class.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger}
	 */
	static create(number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	}

	/**
	 * Create an arbitrary-precision integer.
	 * - Does not support strings using exponential notation.
	 * - If you want to initialize with the specified base number, please set up with an array ["ff", 16].
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger}
	 */
	static valueOf(number) {
		return BigInteger.create(number);
	}

	/**
	 * Convert to BigInteger.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger}
	 * @private
	 */
	static _toBigInteger(number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {KBigIntegerInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigInteger) {
			return number.doubleValue;
		}
		else {
			return (new BigInteger(number)).doubleValue;
		}
	}

	/**
	 * Convert to integer.
	 * @param {KBigIntegerInputData} number 
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
	 * Random number of specified bit length.
	 * @param {KBigIntegerInputData} bitsize - Bit length.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {BigInteger}
	 */
	static createRandomBigInteger(bitsize, random) {
		const rand = (random !== undefined && random instanceof Random) ? random : DEFAULT_RANDOM;
		const x = new BigInteger();
		const bits = BigInteger._toInteger(bitsize);
		const size = ((bits - 1) >> 4) + 1;
		if(bits === 0) {
			return BigInteger.ZERO;
		}
		let r;
		for(let i = 0, j = 0; i < size; i++) {
			if(j === 0) {
				r = rand.nextInt(); // 32ビットずつ作成する
				x.element[i] = r & 0xFFFF;
				j = 1;
			}
			else {
				x.element[i] = (r >>> 16) & 0xFFFF;
				j = 0;
			}
		}
		// 1～15ビット余る場合は、16ビットずつ作成しているので削る
		if((bits % 16) !== 0) {
			x.element[x.element.length - 1] &= (1 << (bits % 16)) - 1;
		}
		// 最後のビットに 0 をたくさん作成していると、
		// 0のみのデータになる可能性があるためメモリを修正
		x.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		x._memory_reduction();
		return x;
	}

	/**
	 * Convert to string.
	 * @param {KBigIntegerInputData} [radix=10] - Base number.
	 * @returns {string}
	 */
	toString(radix) {
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
		const radix_ = radix ? BigInteger._toInteger(radix) : 10;

		// int型で扱える数値で toString が可能なので、
		// せっかくだからより大きな進数で計算していけば、あとでtoStringする回数が減るテクニック
		// 2進数であれば、2^n乗で計算しても問題がない 4進数や8進数で計算して、2進数に戻せば巡回少数なし
		// v0.03 出来る限りまとめてn進数変換する
		const max_num = 0x3FFFFFFF;
		//                        max_num > radix^x
		// floor(log max_num / log radix) = x
		const keta = Math.floor( Math.log(max_num) / Math.log(radix_) );
		const calcradix = Math.round(Math.pow(radix_, keta));
		// zeros = "00000000...."
		const zeros_array = [];
		for(let i = 0; i < keta; i++) {
			zeros_array[i] = "0";
		}
		const zeros_string = zeros_array.join("");
		// v0.03ここまで
		const x = BigIntegerTool.toPlainStringFromHexadecimalArray(this.element, calcradix);
		const y = [];
		let z = "";
		if(this.sign() < 0) {
			y[y.length] = "-";
		}
		for(let i = x.length - 1; i >= 0; i--) {
			z = x[i].toString(radix_);
			if(i < (x.length - 1)) {
				y[y.length] = zeros_string.substring(0, keta - z.length);
			}
			y[y.length] = z;
		}
		return y.join("");
	}

	/**
	 * Deep copy.
	 * @returns {BigInteger}
	 */
	clone() {
		return new BigInteger(this);
	}

	/**
	 * Create a numerical value for addition. If negative, two's complement.
	 * @param {number} [bit_length] - Bit length. If not set, it will be calculated automatically.
	 * @returns {BigInteger}
	 * @private
	 */
	getTwosComplement(bit_length) {
		const y = this.clone();
		if(!this.isFinite()) {
			return y;
		}
		if(y.isNotNegative()) {
			return y;
		}
		else {
			// 正にする
			y.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
			// ビットの数が存在しない場合は数える
			const len = (bit_length !== undefined) ? bit_length : y.bitLength();
			const e = y.element;
			// ビット反転後
			for(let i = 0; i < e.length; i++) {
				e[i] ^= 0xFFFF;
			}
			// 1～15ビット余る場合は、16ビットずつ作成しているので削る
			// nビットのマスク（なお負の値を表す最上位ビットは削除する）
			if((len % 16) !== 0) {
				e[e.length - 1] &= (1 << (len % 16)) - 1;
			}
			// 1を加算
			y._add(new BigInteger(1));
			return y;
		}
	}

	/**
	 * Expand memory to specified bit length. (mutable)
	 * @param {number} bit_length - Bit length.
	 * @private
	 */
	_memory_allocation(bit_length) {
		if(!this.isFinite()) {
			return;
		}
		const n = BigInteger._toInteger(bit_length);
		const elementsize = this.element.length << 4;
		if(elementsize < n) {
			const addsize = (((n - elementsize - 1) & 0xFFFFFFF0) >>> 4) + 1;
			for(let i = 0;i < addsize;i++) {
				this.element[this.element.length] = 0;
			}
		}
	}

	/**
	 * Normalization of the internal data. (mutable)
	 * @private
	 */
	_memory_reduction() {
		if(!this.isFinite()) {
			return;
		}
		for(let i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !==  0) {
				// 最終行以外で見つかったら、上の領域を削除する
				if(i < this.element.length - 1) {
					this.element.splice(i + 1, this.element.length - i - 1);
				}
				return;
			}
		}
		// 全て0だった場合
		this.state = BIGINTEGER_NUMBER_STATE.ZERO;
		this.element = [];
	}

	/**
	 * Absolute value. (mutable)
	 * @returns {BigInteger} A = abs(A)
	 * @private
	 */
	_abs() {
		// -1 -> 1, 0 -> 0, 1 -> 1
		if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER) {
			this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		}
		else if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY) {
			this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY;
		}
		return this;
	}

	/**
	 * Absolute value.
	 * @returns {BigInteger} abs(A)
	 */
	abs() {
		return this.clone()._abs();
	}

	/**
	 * this *= -1
	 * @returns {BigInteger} A = -A
	 * @private
	 */
	_negate() {
		if(this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER) {
			this.state = BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
		}
		else if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER) {
			this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		}
		else if(this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY) {
			this.state = BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY;
		}
		else if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY) {
			this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY;
		}
		return this;
	}

	/**
	 * this * -1
	 * @returns {BigInteger} -A
	 */
	negate() {
		return this.clone()._negate();
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {number}
	 */
	sign() {
		if(this.isNaN()) {
			return NaN;
		}
		else if(this.isZero()) {
			return 0;
		}
		else if(this.isPositive()) {
			return 1;
		}
		else {
			return -1;
		}
	}

	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A += B
	 * @private
	 */
	_add(number) {
		const val = BigInteger._toBigInteger(number);
		const o1 = this;
		const o2 = val;
		if(!o1.isFinite() || !o2.isFinite()) {
			let ret;
			if(o1.isNaN() || o2.isNaN() || (o1.isInfinite() && o2.isInfinite() && !o1.equalsState(o2))) {
				ret = BigInteger.NaN.clone();
			}
			else if(o1.isPositiveInfinity() || o2.isPositiveInfinity()) {
				ret = BigInteger.POSITIVE_INFINITY.clone();
			}
			else {
				ret = BigInteger.NEGATIVE_INFINITY.clone();
			}
			this.element = ret.element;
			this.state = ret.state;
			return this;
		}
		let x1 = o1.element;
		let x2 = o2.element;
		if(o1.sign() === o2.sign()) {
			//足し算
			this._memory_allocation(x2.length << 4);
			let carry = 0;
			for(let i = 0; i < x1.length; i++) {
				x1[i] += ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(x1[i] > 0xFFFF) {
					carry = 1;
					x1[i] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x1[x1.length] = carry;
			}
		}
		else {
			// 引き算
			const compare = o1.compareToAbs(o2);
			if(compare === 0) {
				this.element = [];
				this.state = BIGINTEGER_NUMBER_STATE.ZERO;
				return this;
			}
			else if(compare === -1) {
				this.state = o2.state;
				const swap = x1;
				x1 = x2.slice(0);
				x2 = swap;
			}
			let carry = 0;
			for(let i = 0; i < x1.length; i++) {
				x1[i] -= ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(x1[i] < 0) {
					x1[i] += 0x10000;
					carry  = 1;
				}
				else {
					carry  = 0;
				}
			}
			this.element = x1;
			this._memory_reduction();
		}
		return this;
	}

	/**
	 * Add.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A + B
	 */
	add(number) {
		return this.clone()._add(number);
	}

	/**
	 * Subtract. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A -= B
	 * @private
	 */
	_sub(number) {
		// 一時的に記録しておいて引数の情報は書き換えないようにする
		const val = BigInteger._toBigInteger(number);
		const state = val.state;
		const out  = this._add(val._negate());
		val.state = state;
		return out;
	}

	/**
	 * Subtract.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A - B
	 */
	sub(number) {
		return this.clone()._sub(number);
	}

	/**
	 * Multiply. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A *= B
	 * @private
	 */
	_mul(number) {
		const x = this.mul(number);
		this.element = x.element;
		this.state   = x.state;
		return this;
	}

	/**
	 * Multiply.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A * B
	 */
	mul(number) {
		const val = BigInteger._toBigInteger(number);
		const o1 = this;
		const o2 = val;
		if(!o1.isFinite() || !o2.isFinite()) {
			if(o1.isNaN() || o2.isNaN() || (o1.isZero() || o2.isZero())) {
				return BigInteger.NaN.clone();
			}
			else if(o1.sign() * o2.sign() > 0) {
				return BigInteger.POSITIVE_INFINITY.clone();
			}
			else {
				return BigInteger.NEGATIVE_INFINITY.clone();
			}
		}
		const x1 = o1.element;
		const x2 = o2.element;
		const out  = new BigInteger();
		const buff = new BigInteger();
		const y  = out.element;
		for(let i = 0; i < x1.length; i++) {
			buff.element = [];
			// x3 = x1[i] * x2
			const x3 = buff.element;
			let carry = 0;
			for(let j = 0; j < x2.length; j++) {
				x3[j] = x1[i] * x2[j] + carry;
				if(x3[j] > 0xFFFF) {
					carry = x3[j] >>> 16;
					x3[j] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x3[x3.length] = carry;
			}
			// x3 = x3 << (i * 16)
			//buff._shift(i << 4);
			for(let j = x3.length - 1; j >= 0; j--) {
				x3[j + i] = x3[j];
			}
			for(let j = i - 1; j >= 0; j--) {
				x3[j] = 0;
			}
			// y = y + x3 (out._add(buff))
			//out._add(buff);
			carry = 0;
			out._memory_allocation(x3.length << 4);
			for(let j = i; j < y.length; j++) {
				y[j] += ((x3.length >= (j + 1)) ? x3[j] : 0) + carry;
				if(y[j] > 0xFFFF) {
					carry = 1;
					y[j] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				y[y.length] = carry;
			}
		}
		const sign = this.sign() * val.sign();
		out.state = sign === 0 ? BIGINTEGER_NUMBER_STATE.ZERO :	(sign === 1 ? BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER : BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER);
		return out;
	}

	/**
	 * Divide and rem. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
	 * @private
	 */
	_divideAndRemainder(number) {
		const o1 = this;
		const o2 = BigInteger._toBigInteger(number);
		if(!o1.isFinite() || !o2.isFinite()) {
			if(o1.isNaN() || o2.isNaN() || (o1.isInfinite() && o2.isInfinite())) {
				return [BigInteger.NaN, BigInteger.NaN];
			}
			else if(o1.isInfinite()) {
				if(o1.sign() * o2.sign() >= 0) {
					return [BigInteger.POSITIVE_INFINITY, BigInteger.NaN];
				}
				else {
					return [BigInteger.NEGATIVE_INFINITY, BigInteger.NaN];
				}
			}
			else {
				return [BigInteger.ZERO, BigInteger.NaN];
			}
		}
		else if(o2.isZero()) {
			if(o1.isZero()) {
				return [BigInteger.NaN, BigInteger.NaN];
			}
			else {
				return [o1.sign() >= 0 ? BigInteger.POSITIVE_INFINITY : BigInteger.NEGATIVE_INFINITY, BigInteger.NaN];
			}
		}
		const out = [];
		const compare = o1.compareToAbs(o2);
		const sign = o1.sign() * o2.sign();
		if(compare < 0) {
			out[0] = new BigInteger(0);
			out[1] = o1.clone();
			return out;
		}
		else if(compare === 0) {
			out[0] = new BigInteger(1);
			out[0].state = sign === 1 ? BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER : BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
			out[1] = new BigInteger(0);
			return out;
		}
		const ONE = new BigInteger(1);
		const size = o1.bitLength() - o2.bitLength();
		const x1 = o1.clone()._abs();
		const x2 = o2.shift(size)._abs();
		const y  = new BigInteger();
		for(let i = 0; i <= size; i++) {
			if(x1.compareToAbs(x2) >= 0) {
				x1._sub(x2);
				y._add(ONE);
			}
			if(i === size) {
				break;
			}
			x2._shift(-1);
			y._shift(1);
		}
		out[0] = y;
		out[0].state = sign === 1 ? BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER : BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
		out[1] = x1;
		out[1].state = x1.state !== BIGINTEGER_NUMBER_STATE.ZERO ? o1.state : x1.state;
		return out;
	}

	/**
	 * Divide and rem.
	 * @param {KBigIntegerInputData} number
	 * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
	 */
	divideAndRemainder(number) {
		return this.clone()._divideAndRemainder(number);
	}

	/**
	 * Divide. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} fix(A / B)
	 * @private
	 */
	_div(number) {
		return this._divideAndRemainder(number)[0];
	}

	/**
	 * Divide.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} fix(A / B)
	 */
	div(number) {
		return this.clone()._div(number);
	}

	/**
	 * Remainder of division. (mutable)
	 * - Result has same sign as the Dividend.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A %= B
	 * @private
	 */
	_rem(number) {
		const y = this._divideAndRemainder(number)[1];
		this.element = y.element;
		this.state = y.state;
		return this;
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A % B
	 */
	rem(number) {
		return this.clone()._rem(number);
	}

	/**
	 * Modulo, positive rem of division. (mutable)
	 * - Result has same sign as the Divisor.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A = A mod B
	 * @private
	 */
	_mod(number) {
		const o1 = this;
		const o2 = BigInteger._toBigInteger(number);
		if(o2.isZero()) {
			return o1;
		}
		const y = o1._divideAndRemainder(o2)[1];
		if(o1.state !== o2.state) {
			y._add(o2);
		}
		this.element = y.element;
		this.state = y.state;
		return this;
	}

	/**
	 * Modulo, positive rem of division.
	 * - Result has same sign as the Divisor.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A mod B
	 */
	mod(number) {
		return this.clone()._mod(number);
	}

	/**
	 * Modular exponentiation.
	 * @param {KBigIntegerInputData} exponent
	 * @param {KBigIntegerInputData} m 
	 * @returns {BigInteger} A^B mod m
	 */
	modPow(exponent, m) {
		const m_ = BigInteger._toBigInteger(m);
		let x = new BigInteger(this);
		let y = new BigInteger(1);
		const e = new BigInteger(exponent);
		if(!x.isFinite() || !e.isFinite()) {
			return BigInteger.NaN;
		}
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x).mod(m_);
			}
			x = x.multiply(x).mod(m_);
			e._shift(-1);
		}
		return y;
	}

	/**
	 * Modular multiplicative inverse.
	 * @param {KBigIntegerInputData} m
	 * @returns {BigInteger} A^(-1) mod m
	 */
	modInverse(m) {
		const m_ = BigInteger._toBigInteger(m);
		if(!this.isFinite() || !m_.isFinite()) {
			return BigInteger.NaN;
		}
		const y = this.extgcd(m);
		const ONE  = new BigInteger(1);
		if(y[2].compareTo(ONE) !== 0) {
			return BigInteger.NaN;
		}
		// 正にするため rem ではなく mod を使用する
		return y[0]._add(m_).rem(m_);
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * @returns {BigInteger} n!
	 */
	factorial() {
		{
			if(!this.isFinite()) {
				return this;
			}
			else if(this.isNegative()) {
				return BigInteger.NaN;
			}
		}
		const loop_max = BigInteger._toInteger(this);
		let x = BigInteger.ONE;
		for(let i = 2; i <= loop_max; i++) {
			x = x.multiply(i);
		}
		return x;
	}

	/**
	 * Multiply a multiple of ten.
	 * @param {KBigIntegerInputData} n
	 * @returns {BigInteger} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		const x = BigInteger._toInteger(n);
		if(x === 0) {
			return this;
		}
		if(x > 0) {
			return this.mul(BigInteger.TEN.pow(x));
		}
		else {
			return this.div(BigInteger.TEN.pow(x));
		}
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * @param {KBigIntegerInputData} exponent
	 * @returns {BigInteger} pow(A, B)
	 */
	pow(exponent) {
		const e = new BigInteger(exponent);
		{
			if(this.isNaN() || e.isNaN()) {
				return BigInteger.NaN;
			}
			if(e.isZero()) {
				return BigInteger.ONE;
			}
			else if(this.isZero()) {
				if(e.isNegativeInfinity()) {
					return BigInteger.POSITIVE_INFINITY;
				}
				else {
					return BigInteger.ZERO;
				}
			}
			else if(this.isOne()) {
				return this;
			}
			else if(this.isInfinite()) {
				if(this.isPositiveInfinity()) {
					return BigInteger.POSITIVE_INFINITY;
				}
				else {
					if(e.isPositiveInfinity()) {
						return BigInteger.NaN;
					}
					else {
						return BigInteger.create(Infinity * Math.pow(-1, Math.round(e.doubleValue)));
					}
				}
			}
			else if(e.isInfinite()) {
				if(this.isNegative()) {
					// 複素数
					return BigInteger.NaN;
				}
				if(this.compareTo(BigInteger.ONE) < 0) {
					if(e.isPositiveInfinity()) {
						return BigInteger.ZERO;
					}
					else if(e.isNegativeInfinity()) {
						return BigInteger.POSITIVE_INFINITY;
					}
				}
				else {
					if(e.isPositiveInfinity()) {
						return BigInteger.POSITIVE_INFINITY;
					}
					else if(e.isNegativeInfinity()) {
						return BigInteger.ZERO;
					}
				}
			}
		}
		let x = BigInteger._toBigInteger(this);
		let y = BigInteger._toBigInteger(1);
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x);
			}
			x = x.multiply(x);
			e._shift(-1);
		}
		return y;
	}

	/**
	 * Square.
	 * @returns {BigInteger} A^2
	 */
	square() {
		return this.mul(this);
	}

	/**
	 * Square root.
	 * @returns {BigInteger} floor(sqrt(A))
	 */
	sqrt() {
		{
			if(this.isZero()) {
				return BigInteger.ZERO;
			}
			else if(this.isNaN()) {
				return BigInteger.NaN;
			}
			else if(this.isNegative()) {
				return BigInteger.NaN; // 複素数
			}
			else if(this.isInfinite()) {
				return BigInteger.POSITIVE_INFINITY;
			}
		}
		// ニュートン法によって求める
		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// A^0.5  = x
		//     A  = x^2
		//     0  = x^2 - A
		//   f(x) = x^2 - A
		//   f'(x) = 2x
		// x_(n+1) = x_n - f(x_n)/f'(x_n)
		//         = x_n - (x_n^2 - A)/2x_n
		//         = (2*x_n^2 - x_n^2 + A)/2x_n
		//         = (x_n^2 + A)/2x_n
		//         = (x_n + (A/x_n)) / 2
		let s = BigInteger.ONE;
		/**
		 * @type {BigInteger}
		 */
		let t = this;
		while(s.compareToAbs(t) === -1) {
			s = s.shiftLeft(1);
			t = t.shiftRight(1);
		}
		const x0 = t;
		let xn = x0;
		for(let i = 0; i < 300; i++) {
			const xn1 = xn.add(this.div(xn)).shiftRight(1);
			const delta = xn1.sub(xn);
			if(delta.isZero()) {
				break;
			}
			xn = xn1;
		}
		return xn;
	}
	
	/**
	 * Cube root.
	 * @returns {BigInteger} floor(cbrt(A))
	 */
	cbrt() {
		{
			if(this.isZero()) {
				return BigInteger.ZERO;
			}
			else if(this.isNaN()) {
				return BigInteger.NaN;
			}
			else if(this.isInfinite()) {
				return this;
			}
		}
		// ニュートン法によって求める
		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		let s = BigInteger.ONE;
		/**
		 * @type {BigInteger}
		 */
		let t = this;
		while(s.compareToAbs(t) === -1) {
			s = s.shiftLeft(1);
			t = t.shiftRight(2);
		}
		const x0 = t;
		let xn = x0;
		for(let i = 0; i < 300; i++) {
			const xn_2 = xn.mul(xn);
			const xn1 = xn.shiftLeft(1).add(this.div(xn_2)).div(3);
			const delta = xn1.sub(xn);
			if(delta.isZero()) {
				break;
			}
			xn = xn1;
		}
		return xn;
	}

	/**
	 * log_2(x)
	 * @returns {BigInteger} log2(A)
	 */
	log2() {
		{
			if(this.isZero()) {
				return BigInteger.ZERO;
			}
			else if(this.isNaN()) {
				return BigInteger.NaN;
			}
			else if(this.isNegative()) {
				return BigInteger.NaN;
			}
			else if(this.isInfinite()) {
				return BigInteger.POSITIVE_INFINITY;
			}
		}
		return BigInteger.create(this.bitLength() - 1);
	}

	/**
	 * log_10(x)
	 * @returns {BigInteger} log10(A)
	 */
	log10() {
		{
			if(this.isZero()) {
				return BigInteger.ZERO;
			}
			else if(this.isNaN()) {
				return BigInteger.NaN;
			}
			else if(this.isNegative()) {
				return BigInteger.NaN;
			}
			else if(this.isInfinite()) {
				return BigInteger.POSITIVE_INFINITY;
			}
		}
		return BigInteger.create(this.toString(10).length - 1);
	}

	// ----------------------
	// 環境設定用
	// ----------------------
	
	/**
	 * Set default class of random.
	 * This is used if you do not specify a random number.
	 * @param {Random} random
	 */
	static setDefaultRandom(random) {
		DEFAULT_RANDOM = random;
	}

	/**
	 * Return default Random class.
	 * Used when Random not specified explicitly.
	 * @returns {Random}
	 */
	static getDefaultRandom() {
		return DEFAULT_RANDOM;
	}

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * Value at the specified position of the internally used array that composed of hexadecimal numbers.
	 * @param {KBigIntegerInputData} point - Array address.
	 * @returns {number}
	 */
	getShort(point) {
		if(this.isZero()) {
			return 0;
		}
		const n = BigInteger._toInteger(point);
		return ((0 <= n) && (n <= this.element.length)) ? this.element[n] : NaN;
	}

	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return !this.isZero() && !this.isNaN();
	}

	/**
	 * 32-bit integer value.
	 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
	 * @returns {number}
	 */
	get intValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		let x = this.getShort(0) + (this.getShort(1) << 16);
		x &= 0xFFFFFFFF;
		if((x > 0) && this.isNegative()) {
			x = -x;
		}
		return x;
	}

	/**
	 * 64-bit integer value.
	 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
	 * @returns {number}
	 * @deprecated
	 */
	get longValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		let x = 0;
		for(let i = Math.min(3, this.element.length - 1); i >= 0; i--) {
			x *= 65536;
			x += this.getShort(i);
		}
		if(this.isNegative()) {
			x = -x;
		}
		return x;
	}

	/**
	 * 64-bit floating point.
	 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
	 * @returns {number}
	 */
	get doubleValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		return parseFloat(this.toString());
	}
	
	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return this;
	}

	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(mc) {
			return new BigDecimal([this, mc]);
		}
		else {
			return new BigDecimal(this);
		}
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return new Fraction(this);
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return new Complex(this);
	}
	
	/**
	 * return Matrix.
	 * @returns {Matrix}
	 */
	toMatrix() {
		return new Matrix(this);
	}

	// ----------------------
	// 比較
	// ----------------------
	
	/**
	 * Equals.
	 * @param {KBigIntegerInputData} number
	 * @returns {boolean} A === B
	 */
	equals(number) {
		const x = this;
		const y = BigInteger._toBigInteger(number);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN()) {
				return false;
			}
			else if(x.state === y.state) {
				return true;
			}
			else {
				return false;
			}
		}
		if(x.state !== y.state) {
			return false;
		}
		if(x.element.length !== y.element.length) {
			return false;
		}
		for(let i = 0; i < y.element.length; i++) {
			if(x.element[i] !==  y.element[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Compare values without sign.
	 * @param {KBigIntegerInputData} number 
	 * @returns {number} abs(A) > abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
	 */
	compareToAbs(number) {
		const x = this;
		const y = BigInteger._toBigInteger(number);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN()) {
				return NaN;
			}
			else if(x.isInfinite() || y.isInfinite()) {
				return 0;
			}
			else if(y.isInfinite()) {
				return -1;
			}
			else {
				return 1;
			}
		}
		if(x.element.length < y.element.length) {
			return -1;
		}
		else if(x.element.length > y.element.length) {
			return 1;
		}
		for(let i = x.element.length - 1;i >= 0;i--) {
			if(x.element[i] !== y.element[i]) {
				const val = x.element[i] - y.element[i];
				return ( (val === 0) ? 0 : ((val > 0) ? 1 : -1) );
			}
		}
		return 0;
	}

	/**
	 * Compare values.
	 * @param {KBigIntegerInputData} number 
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number) {
		const x = this;
		const y = BigInteger._toBigInteger(number);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN()) {
				return NaN;
			}
			if(x.state === y.state) {
				return 0;
			}
			if(x.isPositiveInfinity() || y.isNegativeInfinity()) {
				return 1;
			}
			else {
				return -1;
			}
		}
		const x_sign = x.sign();
		const y_sign = y.sign();
		if(x_sign !== y_sign) {
			if(x_sign > y_sign) {
				return 1;
			}
			else {
				return -1;
			}
		}
		else if(x_sign === 0) {
			return 0;
		}
		return x.compareToAbs(y) * x_sign;
	}

	/**
	 * Numeric type match.
	 * @param {KBigIntegerInputData} number 
	 * @returns {boolean}
	 */
	equalsState(number) {
		const x = this;
		const y = BigInteger._toBigInteger(number);
		return x.state === y.state;
	}

	/**
	 * Maximum number.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} max([A, B])
	 */
	max(number) {
		const val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * Minimum number.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} min([A, B])
	 */
	min(number) {
		const val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return val.clone();
		}
		else {
			return this.clone();
		}
	}

	/**
	 * Clip number within range.
	 * @param {KBigIntegerInputData} min 
	 * @param {KBigIntegerInputData} max
	 * @returns {BigInteger} min(max(x, min), max)
	 */
	clip(min, max) {
		const min_ = BigInteger._toBigInteger(min);
		const max_ = BigInteger._toBigInteger(max);
		if(this.isNaN() || min_.isNaN() || max_.isNaN()) {
			return BigInteger.NaN;
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
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} gcd(x, y)
	 */
	gcd(number) {
		const val = BigInteger._toBigInteger(number);
		if(!this.isFinite() || !val.isFinite()) {
			return BigInteger.NaN;
		}
		/**
		 * @type {any}
		 */
		let x = this, y = val, z;
		let i = 10;
		while(y.sign() !== 0 && i) {
			z = x.rem(y);
			x = y;
			y = z;
			i--;
		}
		return x;
	}

	/**
	 * Extended Euclidean algorithm.
	 * @param {KBigIntegerInputData} number 
	 * @returns {Array<BigInteger>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		const val = BigInteger._toBigInteger(number);
		if(!this.isFinite() || !val.isFinite()) {
			return [BigInteger.NaN, BigInteger.NaN, BigInteger.NaN];
		}
		// 非再帰
		const ONE  = new BigInteger(1);
		const ZERO = new BigInteger(0);
		/**
		 * @type {any}
		 */
		let r0 = this, r1 = val, r2, q1;
		let a0 = ONE,  a1 = ZERO, a2;
		let b0 = ZERO, b1 = ONE,  b2;
		while(r1.sign() !== 0) {
			const y = r0.divideAndRemainder(r1);
			q1 = y[0];
			r2 = y[1];
			a2 = a0.subtract(q1.multiply(a1));
			b2 = b0.subtract(q1.multiply(b1));
			a0 = a1;
			a1 = a2;
			b0 = b1;
			b1 = b2;
			r0 = r1;
			r1 = r2;
		}
		return [a0, b0, r0];
	}

	/**
	 * Least common multiple.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} lcm(x, y)
	 */
	lcm(number) {
		const val = BigInteger._toBigInteger(number);
		if(!this.isFinite() || !val.isFinite()) {
			return BigInteger.NaN;
		}
		return this.mul(val).div(this.gcd(val));
	}

	// ----------------------
	// 素数系
	// ----------------------
	
	/**
	 * Prime represented within the specified bit length.
	 * @param {KBigIntegerInputData} bits - Bit length.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KBigIntegerInputData} [create_count=500] - Number of times to retry if prime generation fails.
	 * @returns {BigInteger}
	 */
	static probablePrime(bits, random, certainty, create_count ) {
		const certainty_ = certainty ? BigInteger._toInteger(certainty) : 100;
		const create_count_ = create_count ? BigInteger._toInteger(create_count) : 500;
		for(let i = 0; i < create_count_; i++) {
			const x = BigInteger.createRandomBigInteger(bits, random);
			if(x.isProbablePrime(certainty_)) {
				return x;
			}
		}
		console.log("probablePrime " + create_count);
		return BigInteger.NaN;
	}

	/**
	 * Return true if the value is prime number.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		if(!this.isFinite()) {
			return false;
		}
		// 0や負の値は、素数ではない
		if(this.sign() <= 0) {
			return false;
		}
		// 47453132.81212578 = Math.sqrt(Number.MAX_SAFE_INTEGER)
		const limit = Math.sqrt(Math.pow(2, 51));
		const target_number = this.doubleValue;
		const count_max = Math.ceil(Math.sqrt(target_number));
		// 1, 2 -> true
		if(target_number <= 2) {
			return true;
		}
		// 指定した値より大きい場合は計算不可能として false を返す
		if(count_max > limit) {
			return null;
		}
		for(let i = 2; i <= count_max; i++) {
			if((target_number % i) === 0) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		if(!this.isFinite()) {
			return false;
		}
		const e = this.element;
		// 0や負の値は、素数ではない
		if(this.sign() <= 0) {
			return false;
		}
		// 1, 2 -> true
		if((e.length === 1)&&(e[0] <= 2)) {
			return true;
		}
		// even number -> false
		else if((e[0] & 1) === 0) {
			return false;
		}
		// ミラーラビン素数判定法
		// かなり処理が重たいです。まあお遊び程度に使用という感じで。
		const loop	= certainty !== undefined ? BigInteger._toInteger(certainty) : 100;
		const ZERO	= BigInteger.ZERO;
		const ONE	= BigInteger.ONE;
		const n		= this;
		const LEN	= n.bitLength();
		const n_1	= n.subtract(ONE);
		const s 	= n_1.getLowestSetBit();
		const d 	= n_1.shift(-s);

		if(loop <= 0) {
			return false;
		}

		for(let i = 0; i < loop; i++ ) {
			//[ 1, n - 1] の範囲から a を選択
			let a;
			do {
				a = BigInteger.createRandomBigInteger(LEN);
			} while(( a.compareTo(ZERO) === 0 )||( a.compareTo(n) !== -1 ));

			let t = d;
			// a^t != 1 mod n
			let y = a.modPow(t, n);
			
			while(true) {
				if((t.equals(n_1)) || (y.equals(ONE)) || (y.equals(n_1))) {
					break;
				}
				y = y.mul(y)._mod(n);
				t = t.shiftLeft(1);
			}

			if((!y.equals(n_1)) && ((t.element[0] & 1) === 0)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Next prime.
	 * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KBigIntegerInputData} [search_max=100000] - Search range of next prime.
	 * @returns {BigInteger}
	 */
	nextProbablePrime(certainty, search_max) {
		if(!this.isFinite()) {
			return BigInteger.NaN;
		}
		const loop	= certainty !== undefined ? (BigInteger._toInteger(certainty) >> 1) : 100 / 2;
		const search_max_ = search_max !== undefined ? BigInteger._toInteger(search_max) : 100000;
		const x = this.clone();
		for(let i = 0; i < search_max_; i++) {
			x._add(BigInteger.ONE);
			if(x.isProbablePrime(loop)) {
				return x;
			}
		}
		throw "nextProbablePrime [" + search_max_ +"]";
	}

	// ----------------------
	// シフト演算系
	// ----------------------
	
	/**
	 * this <<= n
	 * @param {KBigIntegerInputData} shift_length - Bit shift size.
	 * @returns {BigInteger} A <<= n
	 * @private
	 */
	_shift(shift_length) {
		if(!this.isFinite()) {
			return this;
		}
		let n = BigInteger._toInteger(shift_length);
		if(n === 0) {
			return this;
		}
		const x = this.element;
		// 1ビットなら専用コードで高速計算
		if(n === 1) {
			let i = x.length - 1;
			if((x[i] & 0x8000) !==  0) {
				x[x.length] = 1;
			}
			for(;i >= 0;i--) {
				x[i] <<= 1;
				x[i]  &= 0xFFFF;
				if((i > 0) && ((x[i - 1] & 0x8000) !==  0)) {
					x[i] += 1;
				}
			}
		}
		else if(n === -1) {
			for(let i = 0;i < x.length;i++) {
				x[i] >>>= 1;
				if((i < x.length - 1) && ((x[i + 1] & 1) !==  0)) {
					x[i] |= 0x8000;
				}
			}
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		else {
			// 16ビット単位なら配列を追加削除する高速計算
			if(n >= 16) {
				const m = n >>> 4;
				for(let i = x.length - 1; i >= 0; i--) {
					x[i + m] = x[i];
				}
				for(let i = m - 1; i >= 0; i--) {
					x[i] = 0;
				}
				n &= 0xF;
			}
			else if(n <= -16){
				const m = (-n) >>> 4;
				x.splice(0, m);
				n += m << 4;
			}
			if(n !== 0) {
				// 15ビット以内ならビット演算でまとめて操作
				if(0 < n) {
					let carry = 0;
					for(let i = 0; i < x.length; i++) {
						x[i] = (x[i] << n) + carry;
						if(x[i] > 0xFFFF) {
							carry = x[i] >>> 16;
							x[i] &= 0xFFFF;
						}
						else {
							carry = 0;
						}
					}
					if(carry !== 0) {
						x[x.length] = carry;
					}
				}
				else {
					n = -n;
					for(let i = 0; i < x.length; i++) {
						if(i !== x.length - 1) {
							x[i] += x[i + 1] << 16;
							x[i] >>>= n;
							x[i] &= 0xFFFF;
						}
						else {
							x[i] >>>= n;
						}
					}
					if(x[x.length - 1] === 0) {
						x.pop();
					}
				}
			}
		}
		return this;
	}

	/**
	 * this << n
	 * @param {KBigIntegerInputData} n
	 * @returns {BigInteger} A << n
	 */
	shift(n) {
		return this.clone()._shift(n);
	}

	/**
	 * this << n
	 * @param {KBigIntegerInputData} n
	 * @returns {BigInteger} A << n
	 */
	shiftLeft(n) {
		return this.shift(n);
	}

	/**
	 * this >> n
	 * @param {KBigIntegerInputData} n
	 * @returns {BigInteger} A >> n
	 */
	shiftRight(n) {
		return this.shift(-n);
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Number of digits in which the number "1" appears first when expressed in binary.
	 * - Return -1 If 1 is not found it.
	 * @returns {number}
	 */
	getLowestSetBit() {
		if(!this.isFinite()) {
			return NaN;
		}
		for(let i = 0; i < this.element.length; i++) {
			if(this.element[i] !==  0) {
				const x = this.element[i];
				for(let j = 0; j < 16; j++) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j;
					}
				}
			}
		}
		return -1;
	}

	/**
	 * Length when the number is binary.
	 * @returns {number}
	 */
	bitLength() {
		if(!this.isFinite()) {
			return NaN;
		}
		for(let i = this.element.length - 1; i >= 0; i--) {
			if(this.element[i] !==  0) {
				const x = this.element[i];
				for(let j = 15; j >= 0; j--) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j + 1;
					}
				}
			}
		}
		return 0;
	}

	/**
	 * Sum that the bit is 1 when represented in the two's complement.
	 * @returns {number}
	 */
	bitCount() {
		if(!this.isFinite()) {
			return NaN;
		}
		let target;
		if(this.sign() >= 0) {
			target = this;
		}
		else {
			target = this.add(new BigInteger(1));
		}
		const len = target.bitLength();
		let bit = 0;
		let count = 0;
		for(let i = 0;bit < len;i++) {
			const x = target.element[i];
			for(let j = 0;((j < 16) && (bit < len));j++, bit++) {
				if(((x >>> j) & 1) !==  0) {
					count = count + 1;
				}
			}
		}
		return count;
	}

	/**
	 * Logical AND. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A &= B
	 * @private
	 */
	_and(number) {
		const val = BigInteger._toBigInteger(number);
		const e1 = this;
		const e2 = val;
		if((!e1.isFinite()) || (!e2.isFinite())) {
			let ret;
			if(e1.isNaN() || e2.isNaN()) {
				ret = BigInteger.NaN;
			}
			else {
				ret = BigInteger.ZERO;
			}
			ret = ret.clone();
			this.element = ret.element;
			this.state = ret.state;
			return this;
		}
		const s1  = e1.sign(), s2 = e2.sign();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		const e1_array = e1.getTwosComplement(len).element;
		const e2_array = e2.getTwosComplement(len).element;
		const size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			const x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 & x2;
		}
		// 配列の上位が空になる可能性があるためノーマライズが必要
		this._memory_reduction();
		// 符号を計算
		if((s1 === 1)||(s2 === 1)) {
			this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		}
		// 出力が負の場合は、2の補数
		else if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER) {
			this.element = this.getTwosComplement(len).element;
			// 反転させたことで配列の上位が空になる可能性があるためノーマライズが必要
			this._memory_reduction();
		}
		return this;
	}

	/**
	 * Logical AND.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A & B
	 */
	and(number) {
		return this.clone()._and(number);
	}

	/**
	 * Logical OR. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A |= B
	 * @private
	 */
	_or(number) {
		const val = BigInteger._toBigInteger(number);
		const e1 = this;
		const e2 = val;
		if((!e1.isFinite()) || (!e2.isFinite())) {
			let ret;
			if(e1.isNaN() || e2.isNaN()) {
				ret = BigInteger.NaN.clone();
			}
			else if(e1.isInfinite() || e2.isInfinite()) {
				ret = BigInteger.ZERO;
			}
			else {
				ret = e1.isInfinite() ? e2 : e1;
			}
			ret = ret.clone();
			this.element = ret.element;
			this.state = ret.state;
			return this;
		}

		const s1  = e1.sign(), s2 = e2.sign();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		const e1_array = e1.getTwosComplement(len).element;
		const e2_array = e2.getTwosComplement(len).element;
		const size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			const x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 | x2;
		}
		// 符号を計算
		this.state = ((s1 === -1)||(s2 === -1)) ?
			BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER :
			(Math.max(s1, s2) === 0 ? BIGINTEGER_NUMBER_STATE.ZERO : BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER);
		// 出力が負の場合は、2の補数
		if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER) {
			this.element = this.getTwosComplement(len).element;
			// 反転させたことで配列の上位が空になる可能性があるためノーマライズが必要
			this._memory_reduction();
		}
		return this;
	}

	/**
	 * Logical OR.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A | B
	 */
	or(number) {
		return this.clone()._or(number);
	}

	/**
	 * Logical Exclusive-OR. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A ^= B
	 * @private
	 */
	_xor(number) {
		const val = BigInteger._toBigInteger(number);
		const e1 = this;
		const e2 = val;
		if((!e1.isFinite()) || (!e2.isFinite())) {
			let ret;
			if(e1.isNaN() || e2.isNaN()) {
				ret = BigInteger.NaN;
			}
			else if(e1.isInfinite() || e2.isInfinite()) {
				ret = BigInteger.ZERO;
			}
			else {
				ret = e1.isInfinite() ? e2 : e1; 
			}
			ret = ret.clone();
			this.element = ret.element;
			this.state = ret.state;
			return this;
		}
		const s1  = e1.sign(), s2 = e2.sign();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		const e1_array = e1.getTwosComplement(len).element;
		const e2_array = e2.getTwosComplement(len).element;
		const size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			const x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 ^ x2;
		}
		// 配列の上位が空になる可能性があるためノーマライズが必要
		this._memory_reduction();
		// 符号を計算
		this.state = ((s1 !== 0)&&(s1 !== s2)) ? BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER : BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		// 出力が負の場合は、2の補数
		if(this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER) {
			this.element = this.getTwosComplement(len).element;
			// 反転したことでさらに空になる可能性がある
			this._memory_reduction();
		}
		return this;
	}

	/**
	 * Logical Exclusive-OR.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A ^ B
	 */
	xor(number) {
		return(this.clone()._xor(number));
	}

	/**
	 * Logical Not.
	 * @returns {BigInteger} A = !A
	 * @private
	 */
	_not() {
		return(this._add(new BigInteger(1))._negate());
	}

	/**
	 * Logical Not. (mutable)
	 * @returns {BigInteger} !A
	 */
	not() {
		return(this.clone()._not());
	}

	/**
	 * this | (1 << n) (mutable)
	 * @param {KBigIntegerInputData} bit
	 * @returns {BigInteger}
	 * @private
	 */
	_setBit(bit) {
		const n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] |= 1 << (n & 0xF);
		this.state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
		return this;
	}

	/**
	 * this | (1 << n)
	 * @param {KBigIntegerInputData} bit
	 * @returns {BigInteger}
	 */
	setBit(bit) {
		const n = BigInteger._toInteger(bit);
		return this.clone()._setBit(n);
	}

	/**
	 * Invert a specific bit.) (mutable)
	 * @param {KBigIntegerInputData} bit
	 * @returns {BigInteger}
	 * @private
	 */
	_flipBit(bit) {
		const n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] ^= 1 << (n & 0xF);
		this._memory_reduction();
		return this;
	}

	/**
	 * Invert a specific bit.
	 * @param {KBigIntegerInputData} bit
	 * @returns {BigInteger}
	 */
	flipBit(bit) {
		const n = BigInteger._toInteger(bit);
		return this.clone()._flipBit(n);
	}

	/**
	 * Lower a specific bit.
	 * @param {KBigIntegerInputData} bit 
	 * @returns {BigInteger}
	 */
	clearBit(bit) {
		const n = BigInteger._toInteger(bit);
		const y = this.clone();
		y.element[n >>> 4] &= ~(1 << (n & 0xF));
		y._memory_reduction();
		return y;
	}

	/**
	 * Test if a particular bit is on.
	 * @param {KBigIntegerInputData} bit
	 * @returns {boolean}
	 */
	testBit(bit) {
		const n = BigInteger._toInteger(bit);
		return ((this.element[n >>> 4] >>> (n & 0xF)) & 1) !== 0;
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * this === 0
	 * @returns {boolean}
	 */
	isZero() {
		return this.state === BIGINTEGER_NUMBER_STATE.ZERO;
	}
	
	/**
	 * this === 1
	 * @returns {boolean}
	 */
	isOne() {
		return this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER && this.element.length === 1 && this.element[0] === 1;
	}
	
	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER || this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY;
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER || this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY;
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this.state === BIGINTEGER_NUMBER_STATE.ZERO || this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER || this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY;
	}
	
	/**
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return this.state === BIGINTEGER_NUMBER_STATE.NOT_A_NUMBER;
	}
	
	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this.state === BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY;
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this.state === BIGINTEGER_NUMBER_STATE.NEGATIVE_INFINITY;
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
	// 定数
	// ----------------------
	
	/**
	 * -1
	 * @returns {BigInteger} -1
	 */
	static get MINUS_ONE() {
		return DEFINE.MINUS_ONE;
	}
	
	/**
	 * 0
	 * @returns {BigInteger} 0
	 */
	static get ZERO() {
		return DEFINE.ZERO;
	}

	/**
	 * 1
	 * @returns {BigInteger} 1
	 */
	static get ONE() {
		return DEFINE.ONE;
	}
	
	/**
	 * 2
	 * @returns {BigInteger} 2
	 */
	static get TWO() {
		return DEFINE.TWO;
	}
	
	/**
	 * 10
	 * @returns {BigInteger} 10
	 */
	static get TEN() {
		return DEFINE.TEN;
	}

	/**
	 * Positive infinity.
	 * @returns {BigInteger} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {BigInteger} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {BigInteger} NaN
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
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}

}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE = {

	/**
	 * -1
	 */
	MINUS_ONE : new BigInteger(-1),

	/**
	 * 0
	 */
	ZERO : new BigInteger(0),
	
	/**
	 * 1
	 */
	ONE : new BigInteger(1),

	/**
	 * 2
	 */
	TWO : new BigInteger(2),

	/**
	 * 10
	 */
	TEN : new BigInteger(10),

	/**
	 * Positive infinity.
	 */
	POSITIVE_INFINITY : new BigInteger(Number.POSITIVE_INFINITY),

	/**
	 * Negative Infinity.
	 */
	NEGATIVE_INFINITY : new BigInteger(Number.NEGATIVE_INFINITY),

	/**
	 * Not a Number.
	 */
	NaN : new BigInteger(Number.NaN)
};
