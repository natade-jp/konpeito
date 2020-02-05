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

/**
 * BigInteger type argument.
 * - BigInteger
 * - number
 * - string
 * - Array<string|number>
 * - {toBigInteger:function}
 * - {intValue:number}
 * - {toString:function}
 * @typedef {BigInteger|number|string|Array<string|number>|{toBigInteger:function}|{intValue:number}|{toString:function}} KBigIntegerInputData
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
	 * @returns {{element : Array<number>, _sign : number}} Data for BigInteger.
	 */
	static toBigIntegerFromNumber(num) {
		let x;
		let sign;
		if(num === 0) {
			sign = 0;
			x = 0;
		}
		else if(num > 0) {
			sign = 1;
			x = num;
		}
		else {
			sign = -1;
			x = -num;
		}
		if(x > 0xFFFFFFFF) {
			return {
				element : BigIntegerTool.toHexadecimalArrayFromPlainString(BigIntegerTool.toPlainStringFromString(x.toFixed()), 10),
				_sign : sign
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
			_sign : sign
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
	 * Return data to represent multi-precision numbers from strings.
	 * @param {string} text - String containing a number.
	 * @param {number} [radix=10] - Base number.
	 * @returns {{element : Array<number>, _sign : number}} Data for BigInteger.
	 */
	static toBigIntegerFromString(text, radix) {
		let x = text.replace(/\s/g, "").toLowerCase();
		const sign_text = x.match(/^[-+]+/);

		/**
		 * @type {Array<number>}
		 */
		let element     = [];
		let _sign        = 1;

		if(sign_text !== null) {
			const hit_text = sign_text[0];
			x = x.substring(hit_text.length, x.length);
			if(hit_text.indexOf("-") !== -1) {
				_sign = -1;
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
		if((element.length === 1)&&(element[0] === 0)) {
			element = [];
			_sign = 0;
		}

		return {
			element : element,
			_sign : _sign
		};
	}
}

// 内部では1変数内の中の16ビットごとに管理
// 2変数で16ビット*16ビットで32ビットを表す
// this.element	...	16ビットごとに管理
// this._sign	...	負なら-1、正なら1、ゼロなら0
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
		
		if(arguments.length === 0) {

			/**
			 * An integer consisting of 16 bits per element of the array.
			 * @private
			 * @type {Array<number>}
			 */
			this.element     = [];

			/**
			 * Positive or negative signs of number.
			 * - +1 if positive, -1 if negative, 0 if 0.
			 * - This value may not be correct ?
			 * @private
			 * @type {number}
			 */
			this._sign        = 0;
		}
		else if(arguments.length === 1) {
			this._sign = 1;
			if(number instanceof BigInteger) {
				this.element = number.element.slice(0);
				this._sign = number._sign;
			}
			else if(typeof number === "number") {
				const x = BigIntegerTool.toBigIntegerFromNumber(number);
				this.element = x.element;
				this._sign = x._sign;
			}
			else if(typeof number === "string") {
				const x = BigIntegerTool.toBigIntegerFromString(number);
				this.element = x.element;
				this._sign = x._sign;
			}
			else if(number instanceof Array) {
				if((number.length === 2) && (typeof number[0] === "string" && (typeof number[1] === "number"))) {
					const x = BigIntegerTool.toBigIntegerFromString(number[0], number[1]);
					this.element = x.element;
					this._sign = x._sign;
				}
				else {
					throw "BigInteger Unsupported argument " + arguments;
				}
			}
			else if(typeof number === "object") {
				if("toBigInteger" in number) {
					const x = number.toBigInteger();
					this.element = x.element;
					this._sign = x._sign;
				}
				else if("intValue" in number) {
					const x = BigIntegerTool.toBigIntegerFromNumber(number.intValue);
					this.element = x.element;
					this._sign = x._sign;
				}
				else {
					const x = BigIntegerTool.toBigIntegerFromString(number.toString());
					this.element = x.element;
					this._sign = x._sign;
				}
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
		const rand = (random && (random instanceof Random)) ? random : DEFAULT_RANDOM;
		const x = new BigInteger();
		x._sign = 1;
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
		x._memory_reduction();
		return x;
	}

	/**
	 * Convert to string.
	 * @param {KBigIntegerInputData} [radix=10] - Base number.
	 * @returns {string}
	 */
	toString(radix) {
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
		if(this.signum() < 0) {
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
		if(y._sign >= 0) {
			return y;
		}
		else {
			// 正にする
			y._sign = 1;
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
		for(let i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !==  0) {
				if(i < this.element.length - 1) {
					this.element.splice(i + 1, this.element.length - i - 1);
				}
				return;
			}
		}
		this._sign = 0;
		this.element = [];
	}

	/**
	 * Absolute value. (mutable)
	 * @returns {BigInteger} A = abs(A)
	 * @private
	 */
	_abs() {
		// -1 -> 1, 0 -> 0, 1 -> 1
		this._sign *= this._sign;
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
		this._sign *= -1;
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
	signum() {
		if(this.element.length === 0) {
			return 0;
		}
		return this._sign;
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {number}
	 */
	sign() {
		return this.signum();
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
		let x1 = o1.element;
		let x2 = o2.element;
		if(o1._sign === o2._sign) {
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
				this._sign = 1;
				return this;
			}
			else if(compare === -1) {
				this._sign = o2._sign;
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
	_subtract(number) {
		const val = BigInteger._toBigInteger(number);
		const _sign = val._sign;
		const out  = this._add(val._negate());
		val._sign = _sign;
		return out;
	}

	/**
	 * Subtract.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A - B
	 */
	subtract(number) {
		return this.clone()._subtract(number);
	}

	/**
	 * Subtract.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A - B
	 */
	sub(number) {
		return this.subtract(number);
	}

	/**
	 * Multiply. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A *= B
	 * @private
	 */
	_multiply(number) {
		const x = this.multiply(number);
		this.element = x.element;
		this._sign    = x._sign;
		return this;
	}

	/**
	 * Multiply.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A * B
	 */
	multiply(number) {
		const val = BigInteger._toBigInteger(number);
		const out  = new BigInteger();
		const buff = new BigInteger();
		const o1 = this;
		const o2 = val;
		const x1 = o1.element;
		const x2 = o2.element;
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
		out._sign = this._sign * val._sign;
		return out;
	}

	/**
	 * Multiply.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A * B
	 */
	mul(number) {
		return this.multiply(number);
	}

	/**
	 * Divide and remainder. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
	 * @private
	 */
	_divideAndRemainder(number) {
		const val = BigInteger._toBigInteger(number);
		const out = [];
		if(val.signum() === 0) {
			throw "BigInteger divideAndRemainder [" + val.toString() +"]";
		}
		const compare = this.compareToAbs(val);
		if(compare < 0) {
			out[0] = new BigInteger(0);
			out[1] = this.clone();
			return out;
		}
		else if(compare === 0) {
			out[0] = new BigInteger(1);
			out[0]._sign = this._sign * val._sign;
			out[1] = new BigInteger(0);
			return out;
		}
		const ONE = new BigInteger(1);
		const size = this.bitLength() - val.bitLength();
		const x1 = this.clone()._abs();
		const x2 = val.shift(size)._abs();
		const y  = new BigInteger();
		for(let i = 0; i <= size; i++) {
			if(x1.compareToAbs(x2) >= 0) {
				x1._subtract(x2);
				y._add(ONE);
			}
			if(i === size) {
				break;
			}
			x2._shift(-1);
			y._shift(1);
		}
		out[0] = y;
		out[0]._sign = this._sign * val._sign;
		out[1] = x1;
		out[1]._sign = this._sign;
		return out;
	}

	/**
	 * Divide and remainder.
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
	_divide(number) {
		return this._divideAndRemainder(number)[0];
	}

	/**
	 * Divide.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} fix(A / B)
	 */
	divide(number) {
		return this.clone()._divide(number);
	}

	/**
	 * Divide.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} fix(A / B)
	 */
	div(number) {
		return this.divide(number);
	}

	/**
	 * Remainder of division. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A %= B
	 * @private
	 */
	_remainder(number) {
		return this._divideAndRemainder(number)[1];
	}

	/**
	 * Remainder of division.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A % B
	 */
	remainder(number) {
		return this.clone()._remainder(number);
	}

	/**
	 * Remainder of division.
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A % B
	 */
	rem(number) {
		return this.remainder(number);
	}

	/**
	 * Modulo, positive remainder of division. (mutable)
	 * @param {KBigIntegerInputData} number
	 * @returns {BigInteger} A = A mod B
	 * @private
	 */
	_mod(number) {
		const val = BigInteger._toBigInteger(number);
		if(val.signum() < 0) {
			return null;
		}
		const y = this._divideAndRemainder(val);
		if(y[1] instanceof BigInteger) {
			if(y[1].signum() >= 0) {
				return y[1];
			}
			else {
				return y[1]._add(val);
			}
		}
		return null;
	}

	/**
	 * Modulo, positive remainder of division.
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
		const y = this.extgcd(m);
		const ONE  = new BigInteger(1);
		if(y[2].compareTo(ONE) !== 0) {
			return null;
		}
		// 正にするため remainder ではなく mod を使用する
		return y[0]._add(m_)._mod(m_);
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * @returns {BigInteger} n!
	 */
	factorial() {
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
		if(this.sign() <= 0) {
			throw "ArithmeticException";
		}
		const precision = this.toString(10).replace(/^-/, "").length;
		const x0 = BigInteger.ONE.scaleByPowerOfTen(precision);
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
		const n = BigInteger._toInteger(point);
		if((n < 0) || (this.element.length <= n)) {
			return 0;
		}
		return this.element[n];
	}

	/**
	 * 32-bit integer value.
	 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
	 * @returns {number}
	 */
	get intValue() {
		let x = this.getShort(0) + (this.getShort(1) << 16);
		x &= 0xFFFFFFFF;
		if((x > 0)&&(this._sign < 0)) {
			x = -x;
		}
		return x;
	}

	/**
	 * 64-bit integer value.
	 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
	 * @returns {number}
	 */
	get longValue() {
		let x = 0;
		for(let i = 3; i >= 0; i--) {
			x *= 65536;
			x += this.getShort(i);
		}
		if(this._sign < 0) {
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
		return parseFloat(this.toString());
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
		/**
		 * @type {any}
		 */
		let x = this, y = val, z;
		while(y.signum() !== 0) {
			z = x.remainder(y);
			x = y;
			y = z;
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
		// 非再帰
		const ONE  = new BigInteger(1);
		const ZERO = new BigInteger(0);
		/**
		 * @type {any}
		 */
		let r0 = this, r1 = val, r2, q1;
		let a0 = ONE,  a1 = ZERO, a2;
		let b0 = ZERO, b1 = ONE,  b2;
		while(r1.signum() !== 0) {
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
		return this.mul(val).div(this.gcd(val));
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
		const x = BigInteger._toBigInteger(number);
		if(this.signum() !== x.signum()) {
			return false;
		}
		if(this.element.length !== x.element.length) {
			return false;
		}
		for(let i = 0; i < x.element.length; i++) {
			if(this.element[i] !==  x.element[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Compare values without sign.
	 * @param {KBigIntegerInputData} number 
	 * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
	 */
	compareToAbs(number) {
		const val = BigInteger._toBigInteger(number);
		if(this.element.length < val.element.length) {
			return -1;
		}
		else if(this.element.length > val.element.length) {
			return 1;
		}
		for(let i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !== val.element[i]) {
				const x = this.element[i] - val.element[i];
				return ( (x === 0) ? 0 : ((x > 0) ? 1 : -1) );
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
		const val = BigInteger._toBigInteger(number);
		if(this.signum() !== val.signum()) {
			if(this._sign > val._sign) {
				return 1;
			}
			else {
				return -1;
			}
		}
		else if(this.signum() === 0) {
			return 0;
		}
		return this.compareToAbs(val) * this._sign;
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
		throw "probablePrime " + create_count;
	}

	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * Attention : it takes a very long time to process.
	 * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const e = this.element;
		//0, 1, 2 -> true
		if( (e.length === 0) || ((e.length === 1)&&(e[0] <= 2)) ) {
			return true;
		}
		//even number -> false
		else if((e[0] & 1) === 0) {
			return false;
		}
		// ミラーラビン素数判定法
		// かなり処理が重たいです。まあお遊び程度に使用という感じで。
		const loop	= certainty !== undefined ? BigInteger._toInteger(certainty) : 100;
		const ZERO	= new BigInteger(0);
		const ONE	= new BigInteger(1);
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
		let target;
		if(this._sign >= 0) {
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
		const s1  = e1.signum(), s2 = e2.signum();
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
			this._sign = 1;
		}
		// 出力が負の場合は、2の補数
		else if(this._sign === -1) {
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
		const s1  = e1.signum(), s2 = e2.signum();
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
		this._sign = ((s1 === -1)||(s2 === -1)) ? -1 : Math.max(s1, s2);
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
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
		const s1  = e1.signum(), s2 = e2.signum();
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
		this._sign = ((s1 !== 0)&&(s1 !== s2)) ? -1 : 1;
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
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
	 * Logical Not-AND. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A &= (!B)
	 * @private
	 */
	_andNot(number) {
		const val = BigInteger._toBigInteger(number);
		return(this._and(val.not()));
	}

	/**
	 * Logical Not-AND.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A & (!B)
	 */
	andNot(number) {
		return(this.clone()._andNot(number));
	}

	/**
	 * Logical Not-AND. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A &= (!B)
	 * @private
	 */
	_nand(number) {
		return(this._andNot(number));
	}

	/**
	 * Logical Not-AND.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A & (!B)
	 */
	nand(number) {
		return(this.andNot(number));
	}

	/**
	 * Logical Not-OR. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A = !(A | B)
	 * @private
	 */
	_orNot(number) {
		const val = BigInteger._toBigInteger(number);
		return(this._or(val)._not());
	}

	/**
	 * Logical Not-OR.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} !(A | B)
	 */
	orNot(number) {
		return(this.clone()._orNot(number));
	}

	/**
	 * Logical Not-OR. (mutable)
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} A = !(A | B)
	 * @private
	 */
	_nor(number) {
		return(this._orNot(number));
	}

	/**
	 * Logical Not-OR.
	 * @param {KBigIntegerInputData} number 
	 * @returns {BigInteger} !(A | B)
	 */
	nor(number) {
		return(this.orNot(number));
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
		this._memory_reduction();
		return this._sign === 0;
	}
	
	/**
	 * this === 1
	 * @returns {boolean}
	 */
	isOne() {
		return this._sign === 1 && this.element.length === 1 && this.element[0] === 1;
	}
	
	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		this._memory_reduction();
		return this._sign > 0;
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return this._sign < 0;
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this._sign >= 0;
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
	TEN : new BigInteger(10)

};
