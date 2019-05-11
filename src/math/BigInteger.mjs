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
 * 乱数用クラスを指定しなかった場合に使用するデフォルト乱数クラス
 */
const DEFAULT_RANDOM = new Random();

/**
 * BigInteger 内で使用する関数群
 */
class IntegerTool {

	/**
	 * 数値が入った文字列から16進数ごとの配列へ変換する
	 * @param {string} text - 数値が入ったテキストデータ（負の値などを含めない）
	 * @param {number} radix - テキストデータの進数
	 * @returns {Array<number>} 16進数ごとに代入された配列 
	 */
	static string_to_binary_number(text, radix) {
		// 下の変換をすることで、2進数での変換時に内部のforの繰り返す回数が減る
		// v0.03 出来る限りまとめてn進数変換する
		const max_num = 0x3FFFFFFF;
		const keta = Math.floor( Math.log(max_num) / Math.log(radix) );
		let x = [];
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
	 * 数値から16進数ごとの配列へ変換する
	 * @param {number} x - 変換したい数値 
	 * @returns {Array<number>} 16進数ごとに代入された配列 
	 */
	static number_to_binary_number(x) {
		if(x > 0xFFFFFFFF) {
			return IntegerTool.string_to_binary_number(x.toFixed(), 10);
		}
		let num = x;
		const y = [];
		while(num !==  0) {
			y[y.length] = num & 1;
			num >>>= 1;
		}
		const z = [];
		for(let i = 0; i < y.length; i++) {
			z[i >>> 4] |= y[i] << (i & 0xF);
		}
		return z;
	}

	/**
	 * 16進数の配列データから数列が入った文字列を作成
	 * @param {Array<number>} binary - 16進数ごとに代入された配列 
	 * @param {number} radix - 変換後の進数
	 * @returns {string} 文字列化したデータ 
	 */
	static binary_number_to_string(binary, radix) {
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
	 * 数値が入った文字列から多倍長数値を表すためのデータを作成する
	 * @param {string} text - 数値が入ったテキストデータ
	 * @param {number} [radix=10] - テキストデータの進数
	 * @returns {Object} 多倍長数値を表すためのデータ 
	 */
	static ToBigIntegerFromString(text, radix) {
		let x = text.replace(/\s/g, "").toLowerCase();
		let buff = x.match(/^[-+]+/);

		let element     = [];
		let _sign        = 1;

		if(buff !== null) {
			buff = buff[0];
			x = x.substring(buff.length, x.length);
			if(buff.indexOf("-") !== -1) {
				_sign = -1;
			}
		}
		if(radix) {
			element = IntegerTool.string_to_binary_number(x, radix);
		}
		else if(/^0x/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(2, x.length), 16);
		}
		else if(/^0b/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(2, x.length), 2);
		}
		else if(/^0/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(1, x.length), 8);
		}
		else {
			element = IntegerTool.string_to_binary_number(x, 10);
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
 * 多倍長整数演算クラス (immutable)
 */
export default class BigInteger {

	/**
	 * 多倍長整数を作成
	 * 文字列で指定する場合は指数表記には非対応。
	 * 指定した進数で指定する場合は["ff", 16] という配列で指定する。
	 * @param {BigInteger|number|string|Array<string|number>} number - 整数値
	 */
	constructor(number) {
		
		/**
		 * 1要素、16ビット整数の配列
		 * @private
		 * @type {Array<number>}
		 */
		this.element     = [];

		/**
		 * 正負（プラスなら+1、マイナスなら-1、0なら0）
		 * ※計算によってはここの値の再設定をしていない箇所があるので、ここを見る時は注意
		 * @private
		 * @type {Array<number>}
		 */
		this._sign        = 0;

		if(arguments.length === 0) {
			this.element     = [];
			this._sign        = 0;
		}
		else if(arguments.length === 1) {
			this._sign = 1;
			if(number instanceof BigInteger) {
				for(let i = 0; i < number.element.length; i++) {
					this.element[i] = number.element[i];
				}
				this._sign = arguments[0]._sign;
			}
			else if((typeof number === "number") || (number instanceof Number)) {
				let x = number;
				if(x < 0) {
					this._sign = -1;
					x = -x;
				}
				this.element = IntegerTool.number_to_binary_number(x);
			}
			else if((typeof number === "string") || (number instanceof String)) {
				const x = IntegerTool.ToBigIntegerFromString(number);
				this.element = x.element;
				this._sign = x._sign;
			}
			else if(number instanceof Array) {
				const x = IntegerTool.ToBigIntegerFromString(number[0], number[1]);
				this.element = x.element;
				this._sign = x._sign;
			}
			else if(number instanceof Object && number.toString) {
				const x = IntegerTool.ToBigIntegerFromString(number.toString());
				this.element = x.element;
				this._sign = x._sign;
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
	 * BigIntegerを作成する
	 * @param {BigInteger} number 
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
	 * BigInteger を作成
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	static valueOf(number) {
		return BigInteger.create(number);
	}

	/**
	 * BigInteger を作成
	 * @param {BigInteger} number 
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
	 * 実数を作成
	 * @param {BigInteger} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if((typeof number === "number") || (number instanceof Number)) {
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
	 * 整数を作成
	 * @param {BigInteger} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		if((typeof number === "number") || (number instanceof Number)) {
			return number | 0;
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	}

	/**
	 * 指定したビット数以内の乱数
	 * @param {number} bitsize - 作成する乱数のビット数
	 * @param {Random} [random] - 作成に使用するRandom
	 * @returns {BigInteger}
	 */
	static createRandomBigInteger(bitsize, random) {
		const rand = (random && (random instanceof Random)) ? random : DEFAULT_RANDOM;
		const x = new BigInteger();
		x._sign = 1;
		const bits = BigInteger._toInteger(bitsize);
		const size = ((bits - 1) >> 4) + 1;
		let r;
		if(bits === 0) {
			return BigInteger.ZERO;
		}
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
	 * 指定したビット数以内の素数
	 * @param {number} bits - 作成する素数の乱数のビット数
	 * @param {Random} [random] - 作成に使用するRandom
	 * @param {number} [certainty=100] - ミラーラビン素数判定法に使用する繰り返し回数
	 * @returns {BigInteger}
	 */
	static probablePrime(bits, random, certainty = 100) {
		while(true) {
			const x = BigInteger.createRandomBigInteger(bits, random);
			if(x.isProbablePrime(certainty)) {
				return x;
			}
		}
	}

	/**
	 * A === B
	 * @param {BigInteger} number
	 * @returns {boolean}
	 */
	equals(number) {
		const x = BigInteger._toBigInteger(number);
		if(this.signum() !==  x.signum()) {
			return false;
		}
		if(this.element.length !==  x.element.length) {
			return false;
		}
		for(let i = 0;i < x.element.length; i++) {
			if(this.element[i] !==  x.element[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 文字列化
	 * @param {number} [radix=10] - 文字列変換後の進数
	 * @returns {string}
	 */
	toString(radix = 10) {
		// int型で扱える数値で toString が可能なので、
		// せっかくだからより大きな進数で計算していけば、あとでtoStringする回数が減るテクニック
		// 2進数であれば、2^n乗で計算しても問題がない 4進数や8進数で計算して、2進数に戻せば巡回少数なし
		// v0.03 出来る限りまとめてn進数変換する
		const max_num = 0x3FFFFFFF;
		//                        max_num > radix^x
		// floor(log max_num / log radix) = x
		const keta = Math.floor( Math.log(max_num) / Math.log(radix) );
		const calcradix = Math.round(Math.pow(radix, keta));
		// zeros = "00000000...."
		let zeros = [];
		let i;
		for(i = 0; i < keta; i++) {
			zeros[i] = "0";
		}
		zeros = zeros.join("");
		// v0.03ここまで
		const x = IntegerTool.binary_number_to_string(this.element, calcradix);
		const y = [];
		let z = "";
		if(this.signum() < 0) {
			y[y.length] = "-";
		}
		for(i = x.length - 1;i >= 0; i--) {
			z = x[i].toString(radix);
			if(i < (x.length - 1)) {
				y[y.length] = zeros.substring(0, keta - z.length);
			}
			y[y.length] = z;
		}
		return y.join("");
	}

	/**
	 * 16進数ごとの配列で構成される内部値の指定した位置の値
	 * @param {number} point - 位置
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
	 * 32ビット整数値
	 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
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
	 * 64ビット整数値
	 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
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
	 * 64ビット実数値
	 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
	 * @returns {number}
	 */
	get doubleValue() {
		return parseFloat(this.toString());
	}

	/**
	 * ディープコピー
	 * @returns {BigInteger}
	 */
	clone() {
		const y = new BigInteger();
		y.element = this.element.slice(0);
		y._sign    = this._sign;
		return y;
	}

	/**
	 * x < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return this._sign < 0;
	}

	/**
	 * x === 0
	 * @returns {boolean}
	 */
	isZero() {
		this._memory_reduction();
		return this._sign === 0;
	}
	
	/**
	 * x > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return this._sign > 0;
	}

	/**
	 * 2進数で表した場合に最も右側に現れる1の桁数
	 * @returns {number} 存在しない場合は -1
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
	 * 2進数で表した場合の長さ
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
	 * 2の補数表現で表した場合に立つビットの数
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
	 * 加算に適用できる数値（負の場合は、2の補数表現）
	 * @param [bit_length] - ビット長（省略時は自動計算）
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
			const len = (arguments.length !== 0) ? bit_length : y.bitLength();
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
	 * A &= B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 * @private
	 */
	_and(number) {
		const val = BigInteger._toBigInteger(number);
		let e1 = this;
		let e2 = val;
		const s1  = e1.signum(), s2 = e2.signum();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		e1 = e1.getTwosComplement(len).element;
		e2 = e2.getTwosComplement(len).element;
		const size = Math.max(e1.length, e2.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1.length) ? 0 : e1[i];
			const x2 = (i >= e2.length) ? 0 : e2[i];
			this.element[i] = x1 & x2;
		}
		if(this.bitLength() === 0) {
			this.element = [];
			this._sign = 0;
		}
		if((s1 === 1)||(s2 === 1)) {
			this._sign = 1;
		}
		// 出力が負の場合は、2の補数
		else if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	}

	/**
	 * A & B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	and(number) {
		return this.clone()._and(number);
	}

	/**
	 * A |= B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 * @private
	 */
	_or(number) {
		const val = BigInteger._toBigInteger(number);
		let e1 = this;
		let e2 = val;
		const s1  = e1.signum(), s2 = e2.signum();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		e1 = e1.getTwosComplement(len).element;
		e2 = e2.getTwosComplement(len).element;
		const size = Math.max(e1.length, e2.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1.length) ? 0 : e1[i];
			const x2 = (i >= e2.length) ? 0 : e2[i];
			this.element[i] = x1 | x2;
		}
		this._sign = ((s1 === -1)||(s2 === -1)) ? -1 : Math.max(s1, s2);
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	}

	/**
	 * A | B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	or(number) {
		return this.clone()._or(number);
	}

	/**
	 * A ^= B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 * @private
	 */
	_xor(number) {
		const val = BigInteger._toBigInteger(number);
		let e1 = this;
		let e2 = val;
		const s1  = e1.signum(), s2 = e2.signum();
		const len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		e1 = e1.getTwosComplement(len).element;
		e2 = e2.getTwosComplement(len).element;
		const size = Math.max(e1.length, e2.length);
		this.element = [];
		for(let i = 0;i < size;i++) {
			const x1 = (i >= e1.length) ? 0 : e1[i];
			const x2 = (i >= e2.length) ? 0 : e2[i];
			this.element[i] = x1 ^ x2;
		}
		this._sign = ((s1 !== 0)&&(s1 !== s2)) ? -1 : 1;
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	}

	/**
	 * A ^ B
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	xor(number) {
		return(this.clone()._xor(number));
	}

	/**
	 * A = !A
	 * @returns {BigInteger}
	 * @private
	 */
	_not() {
		return(this._add(new BigInteger(1))._negate());
	}

	/**
	 * !A
	 * @returns {BigInteger}
	 */
	not() {
		return(this.clone()._not());
	}

	/**
	 * A &= (!B)
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 * @private
	 */
	_andNot(number) {
		const val = BigInteger._toBigInteger(number);
		return(this._and(val.not()));
	}

	/**
	 * A & (!B)
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	andNot(number) {
		return(this.clone()._andNot(number));
	}

	/**
	 * 指定したビット長まで配列を拡張
	 * @param {number} bit_length - ビット数
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
	 * 内部データの正規化
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
	 * ユークリッド互除法
	 * x = this, y = number としたとき gcd(x,y)を返す
	 * @param {BigInteger} number 
	 * @returns {BigInteger}
	 */
	gcd(number) {
		const val = BigInteger._toBigInteger(number);
		// 非再帰
		let x = this, y = val, z;
		while(y.signum() !== 0) {
			z = x.remainder(y);
			x = y;
			y = z;
		}
		return x;
	}

	/**
	 * 拡張ユークリッド互除法
	 * x = this, y = number としたとき、 a*x + b*y = c = gcd(x, y) の[a, b, c]を返す
	 * @param {BigInteger} number 
	 * @returns {Array<BigInteger>} BigInteger が入った配列
	 */
	extgcd(number) {
		const val = BigInteger._toBigInteger(number);
		// 非再帰
		const ONE  = new BigInteger(1);
		const ZERO = new BigInteger(0);
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
	 * A = abs(A)
	 * @returns {BigInteger}
	 * @private
	 */
	_abs() {
		// -1 -> 1, 0 -> 0, 1 -> 1
		this._sign *= this._sign;
		return this;
	}

	/**
	 * abs(A)
	 * @returns {BigInteger}
	 */
	abs() {
		return this.clone()._abs();
	}

	/**
	 * A = -A
	 * @returns {BigInteger}
	 * @private
	 */
	_negate() {
		this._sign *= -1;
		return this;
	}

	/**
	 * -A
	 * @returns {BigInteger}
	 */
	negate() {
		return this.clone()._negate();
	}

	/**
	 * 符号値
	 * 1, -1, 0の場合は0を返す
	 * @returns {number}
	 */
	signum() {
		if(this.element.length === 0) {
			return 0;
		}
		return this._sign;
	}

	/**
	 * 符号値
	 * 1, -1, 0の場合は0を返す
	 * @returns {number}
	 */
	sign() {
		return this.signum();
	}

	/**
	 * 絶対値をとった値同士で比較
	 * 戻り値は、number 型
	 * @param {BigInteger} number 
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
	 * 値同士を比較
	 * 戻り値は、number 型
	 * @param {BigInteger} number 
	 * @returns {number} A < B ? 1 : (A === B ? 0 : -1)
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
	 * max([A, B])
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * min([A, B])
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * A <<= n
	 * @param {number} shift_length
	 * @returns {BigInteger}
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
	 * A << n
	 * @param {number} n
	 * @returns {BigInteger}
	 */
	shift(n) {
		return this.clone()._shift(n);
	}

	/**
	 * A << n
	 * @param {number} n
	 * @returns {BigInteger}
	 */
	shiftLeft(n) {
		return this.shift(n);
	}

	/**
	 * A >> n
	 * @param {number} n
	 * @returns {BigInteger}
	 */
	shiftRight(n) {
		return this.shift(-n);
	}

	/**
	 * A += B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * A + B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	add(number) {
		return this.clone()._add(number);
	}

	/**
	 * A -= B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * A - B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	subtract(number) {
		return this.clone()._subtract(number);
	}

	/**
	 * A - B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	sub(number) {
		return this.subtract(number);
	}

	/**
	 * A *= B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 * @private
	 */
	_multiply(number) {
		const x = this.multiply(number);
		this.element = x.element;
		this._sign    = x._sign;
		return this;
	}

	/**
	 * A * B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * A * B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	mul(number) {
		return this.multiply(number);
	}

	/**
	 * A /= B
	 * @param {BigInteger} number
	 * @returns {Array<BigInteger>} [C = floor(A / B), A - C * B]
	 * @private
	 */
	_divideAndRemainder(number) {
		const val = BigInteger._toBigInteger(number);
		const out = [];
		if(val.signum() === 0) {
			out[0] = 1 / 0;
			out[1] = 0 / 0;
			return out;
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
	 * A / B
	 * @param {BigInteger} number
	 * @returns {Array<BigInteger>} [C = floor(A / B), A - C * B]
	 */
	divideAndRemainder(number) {
		return this.clone()._divideAndRemainder(number);
	}

	/**
	 * A /= B
	 * @param {BigInteger} number
	 * @returns {BigInteger} floor(A / B)
	 * @private
	 */
	_divide(number) {
		return this._divideAndRemainder(number)[0];
	}

	/**
	 * A / B
	 * @param {BigInteger} number
	 * @returns {BigInteger} floor(A / B)
	 */
	divide(number) {
		return this.clone()._divide(number);
	}

	/**
	 * A / B
	 * @param {BigInteger} number
	 * @returns {BigInteger} floor(A / B)
	 */
	div(number) {
		return this.divide(number);
	}

	/**
	 * A %= B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 * @private
	 */
	_remainder(number) {
		return this._divideAndRemainder(number)[1];
	}

	/**
	 * A % B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	remainder(number) {
		return this.clone()._remainder(number);
	}

	/**
	 * A % B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	rem(number) {
		return this.remainder(number);
	}

	/**
	 * A = A mod B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
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
	 * A mod B
	 * @param {BigInteger} number
	 * @returns {BigInteger}
	 */
	mod(number) {
		return this.clone()._mod(number);
	}

	/**
	 * 特定のビットを立てる
	 * @param {number} bit
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
	 * 特定のビットを立てる
	 * @param {number} bit
	 * @returns {BigInteger}
	 */
	setBit(bit) {
		const n = BigInteger._toInteger(bit);
		return this.clone()._setBit(n);
	}

	/**
	 * 特定のビットを反転させる
	 * @param {number} bit
	 * @returns {BigInteger}
	 * @private
	 */
	_flipBit(bit) {
		const n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] ^= 1 << (n & 0xF);
		return this;
	}

	/**
	 * 特定のビットを反転させる
	 * @param {number} bit
	 * @returns {BigInteger}
	 */
	flipBit(bit) {
		const n = BigInteger._toInteger(bit);
		return this.clone()._flipBit(n);
	}

	/**
	 * 特定のビットを下げる
	 * @param {number} bit 
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
	 * 指定のビットの判定
	 * @param {number} bit
	 * @returns {boolean}
	 */
	testBit(bit) {
		const n = BigInteger._toInteger(bit);
		return ((this.element[n >>> 4] >>> (n & 0xF)) & 1) !== 0;
	}

	/**
	 * pow(A, B)
	 * @param {BigInteger} exponent
	 * @returns {BigInteger}
	 */
	pow(exponent) {
		const e = new BigInteger(exponent);
		let x = new BigInteger(this);
		let y = new BigInteger(1);
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
	 * A^B mod m
	 * @param {BigInteger} exponent
	 * @param {BigInteger} m 
	 * @returns {BigInteger}
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
	 * A^(-1) mod m
	 * @param {BigInteger} m
	 * @returns {BigInteger}
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

	/**
	 * ミラーラビン素数判定法による複素判定
	 * @param {number} [certainty=100] - 素数判定法の繰り返し回数
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const e = this.element;
		//0, 1, 2 -> true
		if( (e.length === 0) || ((e.length === 1)&&(e[0] <= 2)) ) {
			return true;
		}
		//even number -> false
		else if( ((e[0] & 1) === 0) || (certainty <= 0) ) {
			return false;
		}
		// ミラーラビン素数判定法
		// かなり処理が重たいです。まあお遊び程度に使用という感じで。
		const loop	= certainty ? (BigInteger._toInteger(certainty) >> 1) : 50;
		const ZERO	= new BigInteger(0);
		const ONE	= new BigInteger(1);
		const n		= this;
		const LEN	= n.bitLength();
		const n_1	= n.subtract(ONE);
		const s 	= n_1.getLowestSetBit();
		const d 	= n_1.shift(-s);
		let a;
		let isComposite;
		for(let i = 0; i < loop; i++ ) {
			//[ 1, n - 1] の範囲から a を選択
			do {
				a = BigInteger.createRandomBigInteger(LEN);
			} while(( a.compareTo(ZERO) === 0 )||( a.compareTo(n) !== -1 ));
			// a^d != 1 mod n
			a = a.modPow(d, n);
			if( a.compareTo(ONE) === 0 ) {
				continue;
			}
			// x ^ 4 % 2 = ((x ^ 2 % 2) ^ 2 % 2) のように分解
			isComposite = true;
			for(let j = 0; j <= s; j++) {
				if(a.compareTo(n_1) === 0) {
					isComposite = false;
					break;
				}
				if(j < s) {
					a = a.multiply(a)._mod(n);
				}
			}
			if(isComposite) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 次の素数
	 * @returns {BigInteger}
	 */
	nextProbablePrime() {
		const x = this.clone();
		while(true) {
			x._add(BigInteger.ONE);
			if(x.isProbablePrime(100)) {
				break;
			}
		}
		return x;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 0
	 * @returns {BigInteger}
	 */
	static get ZERO() {
		return DEFINE.ZERO;
	}

	/**
	 * 1
	 * @returns {BigInteger}
	 */
	static get ONE() {
		return DEFINE.ONE;
	}
	
	/**
	 * 2
	 * @returns {BigInteger}
	 */
	static get TWO() {
		return DEFINE.TWO;
	}
	
	/**
	 * 10
	 * @returns {BigInteger}
	 */
	static get TEN() {
		return DEFINE.TEN;
	}

}

/**
 * 内部で使用する定数値
 */
const DEFINE = {
	ONE : new BigInteger(1),
	TWO : new BigInteger(2),
	TEN : new BigInteger(10),
	ZERO : new BigInteger(0)
};
