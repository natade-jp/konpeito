/*!
 * konpeito.js (version 5.2.2, 2020/3/23)
 * https://github.com/natade-jp/konpeito
 * Copyright 2013-2020 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */
/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Class for improving compatibility.
 * @ignore
 */
class Polyfill {

	/**
	 * Improved compatibility
	 * @private
	 * @ignore
	 */
	static run() {
		if(Math.imul === undefined) {
			Math.imul = function(x1, x2) {
				let y = ((x1 & 0xFFFF) * (x2 & 0xFFFF)) >>> 0;
				let b = (x1 & 0xFFFF) * (x2 >>> 16);
				y = (y + ((b & 0xFFFF) << 16)) >>> 0;
				b = (x1 >>> 16) * (x2 & 0xFFFF);
				y = (y + ((b & 0xFFFF) << 16));
				return (y & 0xFFFFFFFF);
			};
		}
		if(Math.trunc === undefined) {
			Math.trunc = function(x) {
				return x > 0 ? Math.floor(x) : Math.ceil(x);
			};
		}
		if(Number.isFinite === undefined) {
			Number.isFinite = isFinite;
		}
		if(Number.isInteger === undefined) {
			Number.isInteger = function(x) {
				return isFinite(x) && ((x | 0) === x);
			};
		}
		if(Number.isNaN === undefined) {
			Number.isNaN = isNaN;
		}
		if(Number.NaN === undefined) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.NaN = NaN;
		}
		if(Number.EPSILON === undefined) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.EPSILON = 2.220446049250313e-16;
		}
		if(Number.MIN_SAFE_INTEGER === undefined) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.MIN_SAFE_INTEGER = -9007199254740991;
		}
		if(Number.MAX_SAFE_INTEGER === undefined) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.MAX_SAFE_INTEGER = 9007199254740991;
		}
		if(Number.parseFloat === undefined) {
			Number.parseFloat = parseFloat;
		}
		if(Number.parseInt === undefined) {
			Number.parseInt = parseInt;
		}
	}
}

Polyfill.run();

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Random number class.
 * @private
 * @ignore
 */
class MaximumLengthSequence {
	
	/**
	 * Create Random.
	 * @param {number} [seed] - Seed number for random number generation. If not specified, create from time.
	 */
	constructor(seed) {
		// 「M系列乱数」で乱数を作成します。
		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 比較的長い 2^521 - 1通りを出力します。
		// 乱数はCでの動作と同じ値が出ることを確認。(seed = 1として1000番目の値が等しいことを確認)

		/**
		 * Random number array.
		 * @private
		 * @type {Array<number>}
		 */
		this.x = [];
		for(let i = 0;i < 521;i++) {
			this.x[i] = 0;
		}
		if(seed !== undefined) {
			this.setSeed(seed);
		}
		else {
			// 線形合同法で適当に乱数を作成する
			const seed = ((new Date()).getTime() + MaximumLengthSequence.seedUniquifier) & 0xFFFFFFFF;
			MaximumLengthSequence.seedUniquifier = (MaximumLengthSequence.seedUniquifier + 1) & 0xFFFFFFFF;
			this.setSeed(seed);
		}
	}

	/**
	 * 内部データをシャッフル
	 */
	_rnd521() {
		const x = this.x;
		for(let i = 0; i < 32; i++) {
			x[i] ^= x[i + 489];
		}
		for(let i = 32; i < 521; i++) {
			x[i] ^= x[i - 32];
		}
	}

	/**
	 * Initialize random seed.
	 * @param {number} seed
	 */
	setSeed(seed) {
		// 伏見「乱数」東京大学出版会,1989 の方法により初期値を設定
		let u = 0;
		const x = this.x;
		// seedを使用して線形合同法でx[0-16]まで初期値を設定
		let random_seed = seed;
		for(let i = 0; i <= 16; i++) {
			for(let j = 0; j < 32; j++) {
				random_seed = Math.imul(random_seed, 0x5D588B65) + 1;
				u = (u >>> 1) + ((random_seed < 0) ? 0x80000000 : 0);
			}
			x[i] = u;
		}
		// 残りのビットはx[i] = x[i-32] ^ x[i-521]で生成
		for(let i = 16; i < 521; i++) {
			u = (i === 16) ? i : (i - 17);
			x[i] = ((x[u] << 23) & 0xFFFFFFFF) ^ (x[i - 16] >>> 9) ^ x[i - 1];
		}
		// ビットをシャッフル
		for(let i = 0; i < 4; i++) {
			this._rnd521();
		}
		
		/**
		 * Number of random number array to use.
		 * @private
		 * @type {number}
		 */
		this.xi = 0;
		
		/**
		 * Is keep random numbers based on Gaussian distribution.
		 * @private
		 * @type {boolean}
		 */
		this.haveNextNextGaussian = false;
		
		/**
		 * Next random number based on Gaussian distribution.
		 * @private
		 * @type {number}
		 */
		this.nextNextGaussian = 0;
	}

	/**
	 * 32-bit random number.
	 * @returns {number} - 32ビットの乱数
	 */
	genrand_int32() {
		// 全て使用したら、再び混ぜる
		if(this.xi === 521) {
			this._rnd521();
			this.xi = 0;
		}
		const y = this.x[this.xi] >>> 0; // Create a 32-bit nonnegative integer.
		this.xi = this.xi + 1;
		return y;
	}

}

/**
 * Random number creation integer when no seed is set.
 * @type {number}
 * @ignore
 */
MaximumLengthSequence.seedUniquifier = 0x87654321;

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Random number class.
 * @private
 * @ignore
 */
class Xorshift {
	
	/**
	 * Create Random.
	 * @param {number} [seed] - Seed number for random number generation. If not specified, create from time.
	 */
	constructor(seed) {

		/**
		 * @type {number}
		 * @private
		 * @ignore
		 */
		this.x = 123456789;
		
		/**
		 * @type {number}
		 * @private
		 * @ignore
		 */
		this.y = 362436069;
		
		/**
		 * @type {number}
		 * @private
		 * @ignore
		 */
		this.z = 521288629;
		
		/**
		 * @type {number}
		 * @private
		 * @ignore
		 */
		this.w = 88675123;

		if(seed !== undefined) {
			this.setSeed(seed);
		}
		else {
			// 線形合同法で適当に乱数を作成する
			const new_seed = ((new Date()).getTime() + Xorshift.seedUniquifier) & 0xFFFFFFFF;
			Xorshift.seedUniquifier = (Xorshift.seedUniquifier + 1) & 0xFFFFFFFF;
			this.setSeed(new_seed);
		}
	}

	/**
	 * シード値の初期化
	 * @param {number} seed
	 */
	setSeed(seed) {
		// seedを使用して線形合同法で初期値を設定
		let random_seed = seed;
		random_seed = (Math.imul(random_seed, 214013) + 2531011) >>> 0;
		this.z = random_seed;
		random_seed = (Math.imul(random_seed, 214013) + 2531011) >>> 0;
		this.w = random_seed;

		/**
		 * Is keep random numbers based on Gaussian distribution.
		 * @private
		 * @type {boolean}
		 */
		this.haveNextNextGaussian = false;
		
		/**
		 * Next random number based on Gaussian distribution.
		 * @private
		 * @type {number}
		 */
		this.nextNextGaussian = 0;
	}

	/**
	 * 32-bit random number.
	 * @returns {number} - 32ビットの乱数
	 * @private
	 */
	genrand_int32() {
		const t = this.x ^ (this.x << 11);
		this.x = this.y;
		this.y = this.z;
		this.z = this.w;
		this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
		return this.w;
	}

}

/**
 * Random number creation integer when no seed is set.
 * @type {number}
 * @ignore
 */
Xorshift.seedUniquifier = 0x87654321;

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Setting random numbers
 * @typedef {Object} KRandomSettings
 * @property {number} [seed] Seed number for random number generation. If not specified, create from time.
 * @property {string} [algorithm="FAST"] Algorithm type : "XORSHIFT" / "MLS" / "FAST"
 */

/**
 * Random number class.
 */
class Random {
	
	/**
	 * Create Random.
	 * - algorithm : "XORSHIFT" / "MLS" / "FAST"
	 * @param {number|KRandomSettings} [init_data] - Seed number for random number generation. If not specified, create from time.
	 */
	constructor(init_data) {
		let seed_number = undefined;
		let algorithm = "fast";

		/**
		 * Random Number Generator.
		 * @private
		 * @type {Xorshift|MaximumLengthSequence}
		 */
		this.rand = null;
		
		/**
		 * have `NextNextGaussian`
		 * @private
		 * @type {boolean}
		 */
		this.haveNextNextGaussian = false;

		/**
		 * Normally distributed random numbers.
		 * @private
		 * @type {number}
		 */
		this.nextNextGaussian = 0.0;

		if(typeof init_data === "number") {
			seed_number = init_data;
		}
		else if(typeof init_data === "object") {
			if(init_data.seed !== undefined) {
				seed_number = init_data.seed;
			}
			if(init_data.algorithm !== undefined) {
				algorithm = init_data.algorithm;
			}
		}
		if(/fast|xorshift/i.test(algorithm)) {
			// XORSHIFT
			this.rand = new Xorshift(seed_number);
		}
		else {
			// MLS
			this.rand = new MaximumLengthSequence(seed_number);
		}
	}

	/**
	 * Create Random.
	 * - algorithm : "XORSHIFT" / "MLS" / "FAST"
	 * @param {number|KRandomSettings} [init_data] - Seed number for random number generation. If not specified, create from time.
	 */
	static create(init_data) {
		return new Random(init_data);
	}

	/**
	 * Initialize random seed.
	 * @param {number} seed
	 */
	setSeed(seed) {
		this.rand.setSeed(seed);
	}

	/**
	 * 32-bit random number.
	 * @returns {number} - 32-bit random number
	 */
	genrand_int32() {
		return this.rand.genrand_int32();
	}

	/**
	 * Random number of specified bit length.
	 * @param {number} bits - Required number of bits (up to 64 possible).
	 * @returns {number}
	 */
	next(bits) {
		if(bits === 0) {
			return 0;
		}
		else if(bits === 32) {
			return this.genrand_int32();
		}
		else if(bits < 32) {
			// 線形合同法ではないため

			// 上位のビットを使用しなくてもいいがJavaっぽく。
			return (this.genrand_int32() >>> (32 - bits));
		}
		// double型のため、52ビットまでは、整数として出力可能
		else if(bits === 63) {
			// 正の値を出力するように調節
			return (this.genrand_int32() * 0x80000000 + this.genrand_int32());
		}
		else if(bits === 64) {
			return (this.genrand_int32() * 0x100000000 + this.genrand_int32());
		}
		else if(bits < 63) {
			return (this.genrand_int32() * (1 << (bits - 32)) + (this.genrand_int32()  >>> (64 - bits)));
		}
	}

	/**
	 * 8-bit random number array of specified length.
	 * @param {number} size - 必要な長さ
	 * @returns {Array<number>}
	 */
	nextBytes(size) {
		const y = new Array(size);
		// 配列yに乱数を入れる
		// 8ビットのために、32ビット乱数を1回回すのはもったいない
		for(let i = 0;i < y.length; i++) {
			y[i] = this.next(8);
		}
		return y;
	}

	/**
	 * 16-bit random number.
	 * @returns {number}
	 */
	nextShort() {
		return (this.next(16));
	}

	/**
	 * 32-bit random number.
	 * @param {number} [x] - 指定した値未満の数値を作る
	 * @returns {number}
	 */
	nextInt(x) {
		if((x !== undefined) && (typeof x === "number")) {
			let r, y;
			do {
				r = this.genrand_int32() >>> 0;
				y = r % x;
			} while((r - y + x) > 0x100000000 );
			return y;
		}
		return (this.next(32) & 0xFFFFFFFF);
	}

	/**
	 * 64-bit random number.
	 * @returns {number}
	 */
	nextLong() {
		return this.next(64);
	}

	/**
	 * Random boolean.
	 * @returns {boolean}
	 */
	nextBoolean() {
		// 1ビットのために、32ビット乱数を1回回すのはもったいない
		return (this.next(1) !== 0);
	}

	/**
	 * Float type random number in the range of [0, 1).
	 * @returns {number}
	 */
	nextFloat() {
		return (this.next(24) / 0x1000000);
	}

	/**
	 * Double type random number in the range of [0, 1).
	 * @returns {number}
	 */
	nextDouble() {
		const a1 = this.next(26) * 0x8000000 + this.next(27);
		const a2 = 0x8000000 * 0x4000000;
		return (a1 / a2);
	}

	/**
	 * Random numbers from a Gaussian distribution.
	 * This random number is a distribution with an average value of 0 and a standard deviation of 1.
	 * @returns {number}
	 */
	nextGaussian() {
		if(this.haveNextNextGaussian) {
			this.haveNextNextGaussian = false;
			return this.nextNextGaussian;
		}
		// Box-Muller法
		const a = Math.sqrt( -2 * Math.log( this.nextDouble() ) );
		const b = 2 * Math.PI * this.nextDouble();
		const y = a * Math.sin(b);
		this.nextNextGaussian = a * Math.cos(b);
		this.haveNextNextGaussian = true;
		return y;
	}
}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Base class for rounding mode for BigDecimal.
 */
class RoundingModeEntity {
	
	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "NONE";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		return 0;
	}

}

/**
 * Directed rounding to an integer.
 * Round towards positive infinity if positive, negative infinity if negative.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_UP extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "UP";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		if(y === 0) {
			return 0;
		}
		else if(y > 0) {
			return 10 - y;
		}
		else {
			return (-(10 + y));
		}
	}

}

/**
 * Directed rounding to an integer.
 * Round towards 0.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_DOWN extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "DOWN";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		return -(x % 10);
	}

}

/**
 * Directed rounding to an integer.
 * Round up to positive infinity.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_CEILING extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "CEILING";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		if(y === 0) {
			return 0;
		}
		else if(y > 0) {
			return 10 - y;
		}
		else {
			return -y;
		}
	}

}

/**
 * Directed rounding to an integer.
 * Round down to negative infinity.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_FLOOR extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "FLOOR";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		if(y === 0) {
			return 0;
		}
		else if(y > 0) {
			return -y;
		}
		else {
			return(-(10 + y));
		}
	}

}

/**
 * Rounding to the nearest integer.
 * Round half towards positive infinity.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_UP extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "HALF_UP";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		const sign = y >= 0 ? 1 : -1;
		if(Math.abs(y) < 5) {
			return (y * -1);
		}
		else {
			return (sign * (10 - Math.abs(y)));
		}
	}

}

/**
 * Rounding to the nearest integer.
 * Round half towards negative infinity.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_DOWN extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "HALF_DOWN";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		const sign = y >= 0 ? 1 : -1;
		if(Math.abs(y) < 6) {
			return (y * -1);
		}
		else {
			return (sign * (10 - Math.abs(y)));
		}
	}

}

/**
 * Rounding to the nearest integer
 * Round to the nearest side. If the median, round to the even side.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_EVEN extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "HALF_EVEN";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		let y = x % 100;
		let sign, even;
		if(y < 0) {
			sign = -1;
			even = Math.ceil(y / 10) & 1;
		}
		else {
			sign = 1;
			even = Math.floor(y / 10) & 1;
		}
		let center;
		if(even === 1) {
			center = 5;
		}
		else {
			center = 6;
		}
		y = y % 10;
		if(Math.abs(y) < center) {
			return (y * -1);
		}
		else {
			return (sign * (10 - Math.abs(y)));
		}
	}

}

/**
 * Do not round.
 * Error if you need to round it.
 * @implements {RoundingModeEntity}
 */
class RoundingMode_UNNECESSARY extends RoundingModeEntity {

	/**
	 * Get rounding mode name in upper case English.
	 * @returns {string} Rounding method name.
	 */
	static toString() {
		return "UNNECESSARY";
	}

	/**
	 * Numeric value to add.
	 * It is rounded when this value is added.
	 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
	 * @returns {number} Numeric value to add.
	 */
	static getAddNumber(x) {
		const y = x % 10;
		if(y === 0) {
			return 0;
		}
		else {
			throw "ArithmeticException";
		}
	}

}

/**
 * Rounding mode class for BigDecimal.
 */
class RoundingMode {

	/**
	 * Get rounding class represented by specified string.
	 * @param {string|RoundingModeEntity|Object} name - Mode name.
	 * @returns {typeof RoundingModeEntity}
	 */
	static valueOf(name) {
		let check_string;
		if(typeof name === "string") {
			check_string = name;
		}
		else if(name instanceof Object) {
			check_string = name.toString();
		}
		else {
			throw "Unsupported argument " + name;
		}
		const modetype = [
			RoundingMode_UP,
			RoundingMode_DOWN,
			RoundingMode_FLOOR,
			RoundingMode_CEILING,
			RoundingMode_HALF_UP,
			RoundingMode_HALF_DOWN,
			RoundingMode_HALF_EVEN,
			RoundingMode_UNNECESSARY
		];
		const upper_name = check_string.toUpperCase();
		for(let i = 0; i < modetype.length; i++) {
			if(modetype[i].toString() === upper_name) {
				return modetype[i];
			}
		}
		throw "IllegalArgumentException : " + check_string;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * Directed rounding to an integer.
	 * Round towards positive infinity if positive, negative infinity if negative.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get UP() {
		return RoundingMode_UP;
	}

	/**
	 * Directed rounding to an integer.
	 * Round towards 0.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get DOWN() {
		return RoundingMode_DOWN;
	}

	/**
	 * Directed rounding to an integer.
	 * Round up to positive infinity.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get CEILING() {
		return RoundingMode_CEILING;
	}

	/**
	 * Directed rounding to an integer.
	 * Round down to negative infinity.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get FLOOR() {
		return RoundingMode_FLOOR;
	}

	/**
	 * Rounding to the nearest integer.
	 * Round half towards positive infinity.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get HALF_UP() {
		return RoundingMode_HALF_UP;
	}

	/**
	 * Rounding to the nearest integer.
	 * Round half towards negative infinity.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get HALF_DOWN() {
		return RoundingMode_HALF_DOWN;
	}

	/**
	 * Rounding to the nearest integer
	 * Round to the nearest side. If the median, round to the even side.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get HALF_EVEN() {
		return RoundingMode_HALF_EVEN;
	}

	/**
	 * Do not round.
	 * Error if you need to round it.
	 * @returns {typeof RoundingModeEntity}
	 */
	static get UNNECESSARY() {
		return RoundingMode_UNNECESSARY;
	}

}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Configuration class for BigDecimal (immutable).
 */
class MathContext {

	/**
	 * Create BigDecimal configuration.
	 * @param {string|number|MathContext} precision_or_name - Precision. Or String output by MathContext.toString.
	 * @param {RoundingModeEntity} [roundingMode=RoundingMode.HALF_UP] - RoundingMode.
	 */
	constructor(precision_or_name, roundingMode) {

		/**
		 * The precision of this BigDecimal.
		 * @type {number}
		 * @private
		 */
		this.precision = 0;
		
		/**
		 * Method of rounding.
		 * @type {RoundingModeEntity}
		 * @private
		 */
		this.roundingMode = roundingMode === undefined ? RoundingMode.HALF_UP : roundingMode;

		if(typeof precision_or_name === "number") {
			this.precision = precision_or_name;
		}
		else if(precision_or_name instanceof MathContext) {
			this.roundingMode = roundingMode === undefined ? precision_or_name.roundingMode : roundingMode;
			this.precision = precision_or_name.precision;
		}
		else if(typeof precision_or_name === "string") {
			let buff;
			buff = precision_or_name.match(/precision=\d+/);
			if(buff !== null) {
				buff = buff[0].substring("precision=".length, buff[0].length);
				this.precision = parseInt(buff, 10);
			}
			buff = precision_or_name.match(/roundingMode=\w+/);
			if(buff !== null) {
				buff = buff[0].substring("roundingMode=".length, buff[0].length);
				this.roundingMode = RoundingMode.valueOf(buff);
			}	
		}
		if(this.precision < 0) {
			throw "IllegalArgumentException";
		}
	}
	
	/**
	 * Create BigDecimal configuration.
	 * @param {string|number|MathContext} precision_or_name - Precision. Or String output by MathContext.toString.
	 * @param {RoundingModeEntity} [roundingMode=RoundingMode.HALF_UP] - RoundingMode.
	 * @returns {MathContext}
	 */
	static create(precision_or_name, roundingMode) {
		if(precision_or_name instanceof MathContext) {
			return precision_or_name;
		}
		return new MathContext(precision_or_name, roundingMode);
	}

	/**
	 * The precision of this BigDecimal.
	 * @returns {number}
	 */
	getPrecision() {
		return this.precision;
	}

	/**
	 * Method of rounding.
	 * @returns {RoundingModeEntity}
	 */
	getRoundingMode() {
		return this.roundingMode;
	}

	/**
	 * Equals.
	 * @param {MathContext} x - Number to compare.
	 * @returns {boolean}
	 */
	equals(x) {
		if(x instanceof MathContext) {
			if(x.toString() === this.toString()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Convert to string.
	 * @returns {string}
	 */
	toString() {
		return ("precision=" + this.precision + " roundingMode=" + this.roundingMode.toString());
	}

	/**
	 * Increase in the precision of x.
	 * - If the setting has no precision limit, do not change.
	 * @param {number} [x=1]
	 * @returns {MathContext}
	 */
	increasePrecision(x) {
		if(this.precision === 0) {
			return this;
		}
		const new_precision = this.precision + (x === undefined ? 1 : x);
		return new MathContext(Math.max(1, new_precision), this.roundingMode);
	}
	
	/**
	 * Decrease in the precision of x.
	 * - If the setting has no precision limit, do not change.
	 * @param {number} [x=1]
	 * @returns {MathContext}
	 */
	decreasePrecision(x) {
		if(this.precision === 0) {
			return this;
		}
		const new_precision = this.precision - (x === undefined ? 1 : x);
		return new MathContext(Math.max(1, new_precision), this.roundingMode);
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * No decimal point limit.
	 * However, an error occurs in the case of cyclic fraction in division.
	 * @returns {MathContext}
	 */
	static get UNLIMITED() {
		return DEFINE.UNLIMITED;
	}

	/**
	 * 32-bit floating point.
	 * - Significand precision: 23 bits
	 * - Equivalent of the C language float.
	 * @returns {MathContext}
	 */
	static get DECIMAL32() {
		return DEFINE.DECIMAL32;
	}


	/**
	 * 64-bit floating point.
	 * - Significand precision: 52 bits
	 * - Equivalent of the C language double.
	 * @returns {MathContext}
	 */
	static get DECIMAL64() {
		return DEFINE.DECIMAL64;
	}

	/**
	 * 128-bit floating point.
	 * - Significand precision: 112 bits
	 * - Equivalent of the C language long double.
	 * @returns {MathContext}
	 */
	static get DECIMAL128() {
		return DEFINE.DECIMAL128;
	}

	/**
	 * 256-bit floating point.
	 * - Significand precision: 237 bits
	 * @type {MathContext}
	 */
	static get DECIMAL256() {
		return DEFINE.DECIMAL256;
	}

}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE = {

	/**
	 * No decimal point limit.
	 * However, an error occurs in the case of cyclic fraction in division.
	 * @type {MathContext}
	 */
	UNLIMITED	: new MathContext(0,	RoundingMode.HALF_UP),

	/**
	 * 32-bit floating point.
	 * - Significand precision: 23 bits
	 * - Equivalent of the C language float.
	 * @type {MathContext}
	 */
	DECIMAL32	: new MathContext(7,	RoundingMode.HALF_EVEN),

	/**
	 * 64-bit floating point.
	 * - Significand precision: 52 bits
	 * - Equivalent of the C language double.
	 * @type {MathContext}
	 */
	DECIMAL64	: new MathContext(16,	RoundingMode.HALF_EVEN),

	/**
	 * 128-bit floating point.
	 * - Significand precision: 112 bits
	 * - Equivalent of the C language long double.
	 * @type {MathContext}
	 */
	DECIMAL128	: new MathContext(34,	RoundingMode.HALF_EVEN),

	/**
	 * 256-bit floating point.
	 * - Significand precision: 237 bits
	 * @type {MathContext}
	 */
	DECIMAL256	: new MathContext(72,	RoundingMode.HALF_EVEN)
};

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Return true if the value is integer.
 * @param {number} x
 * @returns {boolean}
 * @ignore
 */
const isInteger = function(x) {
	return (x - Math.trunc(x) !== 0.0);
};

/**
 * Collection for calculating probability using real numbers.
 * - These methods can be used in the `Matrix`, `Complex` method chain.
 * - This class cannot be called directly.
 */
class Probability {

	/**
	 * Log-gamma function.
	 * @param {number} x
	 * @returns {number}
	 */
	static gammaln(x) {
		if(!isFinite(x)) {
			if(isNaN(x)) {
				return NaN;
			}
			else {
				return Infinity;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		const LOG_2PI = Math.log(2.0 * Math.PI);
		//ベルヌーイ数
		//http://fr.wikipedia.org/wiki/Nombre_de_Bernoulli
		const K2 = ( 1.0 / 6.0)					/ (2 * 1);
		const K4 = (-1.0 / 30.0)				/ (4 * 3);
		const K6 = ( 1.0 / 42.0)				/ (6 * 5);
		const K8 = (-1.0 / 30.0)				/ (8 * 7);
		const K10 = ( 5.0 / 66.0)				/ (10 * 9);
		const K12 = (-691.0 / 2730.0)			/ (12 * 11);
		const K14 = ( 7.0 / 6.0)				/ (14 * 13);
		const K16 = (-3617.0 / 510.0)			/ (16 * 15);
		const K18 = (43867.0 / 798.0)			/ (18 * 17);
		const K20 = (-174611.0 / 330.0)			/ (20 * 19);
		const K22 = (854513.0 / 138.0)			/ (22 * 21);
		const K24 = (-236364091.0 / 2730.0)		/ (24 * 23);
		const K26 = (8553103.0 / 6.0)			/ (26 * 25);
		const K28 = (-23749461029.0 / 870.0)	/ (28 * 27);
		const K30 = (8615841276005.0 / 14322.0)	/ (30 * 29);
		const K32 = (-7709321041217.0 / 510.0)	/ (32 * 31);
		const LIST = [
			K32, K30, K28, K26, K24, K22, K20, K18,
			K16, K14, K12, K10, K8, K6, K4, K2
		];
		let v = 1;
		let lx = x;
		while(lx < LIST.length) {
			v *= lx;
			lx++;
		}
		const w = 1 / (lx * lx);
		let y = LIST[0];
		for(let i = 1; i < LIST.length; i++) {
			y *= w;
			y += LIST[i];
		}
		y /= lx;
		y += 0.5 * LOG_2PI;
		y += - Math.log(v) - lx + (lx - 0.5) * Math.log(lx);
		return(y);
	}

	/**
	 * Incomplete gamma function upper side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} gammaln_a
	 * @returns {number}
	 */
	static q_gamma(x, a, gammaln_a) {
		if(!isFinite(x)) {
			if(x === Infinity) {
				return 0.0;
			}
			else {
				return NaN;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, w, temp, previous;
		// Laguerreの多項式
		let la = 1.0, lb = 1.0 + x - a;
		if(x < 1.0 + a) {
			return (1 - Probability.p_gamma(x, a, gammaln_a));
		}
		w = Math.exp(a * Math.log(x) - x - gammaln_a);
		result = w / lb;
		for(k = 2; k < 1000; k++) {
			temp = ((k - 1.0 - a) * (lb - la) + (k + x) * lb) / k;
			la = lb;
			lb = temp;
			w *= (k - 1.0 - a) / k;
			temp = w / (la * lb);
			previous = result;
			result += temp;
			if(result == previous) {
				return(result);
			}
		}
		return Number.NaN;
	}

	/**
	 * Incomplete gamma function lower side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} gammaln_a
	 * @returns {number}
	 */
	static p_gamma(x, a, gammaln_a) {
		if(!isFinite(x)) {
			if(x === Infinity) {
				return 1.0;
			}
			else {
				return NaN;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, term, previous;
		if(x >= 1.0 + a) {
			return (1.0 - Probability.q_gamma(x, a, gammaln_a));
		}
		if(x === 0.0) {
			return 0.0;
		}
		result = term = Math.exp(a * Math.log(x) - x - gammaln_a) / a;
		for(k = 1; k < 1000; k++) {
			term *= x / (a + k);
			previous = result;
			result += term;
			if(result == previous) {
				return result;
			}
		}
		return Number.NaN;
	}

	/**
	 * Gamma function.
	 * @param {number} z
	 * @returns {number}
	 */
	static gamma(z) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		if(z < 0) {
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(Probability.gammaln(1.0 - z))));
		}
		return Math.exp(Probability.gammaln(z));
	}

	/**
	 * Incomplete gamma function.
	 * @param {number} x
	 * @param {number} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static gammainc(x, a, tail) {
		if(tail === "lower") {
			return Probability.p_gamma(x, a, Probability.gammaln(a));
		}
		else if(tail === "upper") {
			return Probability.q_gamma(x, a, Probability.gammaln(a));
		}
		else if(tail === undefined) {
			// 引数を省略した場合
			return Probability.gammainc(x, a, "lower");
		}
		else {
			throw "gammainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * @param {number} x
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gampdf(x, k, s) {
		if(x === -Infinity) {
			return 0.0;
		}
		let y = 1.0 / (Probability.gamma(k) * Math.pow(s, k));
		y *= Math.pow( x, k - 1);
		y *= Math.exp( - x / s );
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * @param {number} x
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gamcdf(x, k, s) {
		if(x < 0) {
			return 0.0;
		}
		return Probability.gammainc(x / s, k);
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * @param {number} p
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gaminv(p, k, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		const eps = 1.0e-12;
		// 初期値を決める
		let y = k * s;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		let delta, y2;
		for(let i = 0; i < 100; i++) {
			y2 = y - ((Probability.gamcdf(y, k, s) - p) / Probability.gampdf(y, k, s));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
			if(y < 0.0) {
				y = eps;
			}
		}
		return y;
	}

	/**
	 * Beta function.
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	static beta(x, y) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		return (Math.exp(Probability.gammaln(x) + Probability.gammaln(y) - Probability.gammaln(x + y)));
	}
	
	/**
	 * Incomplete beta function lower side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static p_beta(x, a, b) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p231,技術評論社,1991
		let k;
		let result, term, previous;
		if(a <= 0.0) {
			return Number.POSITIVE_INFINITY;
		}
		if(b <= 0.0) {
			if(x < 1.0) {
				return 0.0;
			}
			else if(x === 1.0) {
				return 1.0;
			}
			else {
				return Number.POSITIVE_INFINITY;
			}
		}
		if(x > (a + 1.0) / (a + b + 2.0)) {
			return (1.0 - Probability.p_beta(1.0 - x, b, a));
		}
		if(x <= 0.0) {
			return 0.0;
		}
		term = a * Math.log(x);
		term += b * Math.log(1.0 - x);
		term += Probability.gammaln(a + b);
		term -= Probability.gammaln(a) + Probability.gammaln(b);
		term = Math.exp(term);
		term /= a;
		result = term;
		for(k = 1; k < 1000; k++) {
			term *= a + b + k - 1.0;
			term *= x;
			term /= a + k;
			previous = result;
			result += term;
			if(result === previous) {
				return result;
			}
		}
		return Number.NaN;
	}

	/**
	 * Incomplete beta function upper side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static q_beta(x, a, b) {
		return (1.0 - Probability.p_beta(x, a, b));
	}

	/**
	 * Incomplete beta function.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static betainc(x, a, b, tail) {
		if(tail === "lower") {
			return Probability.p_beta(x, a, b);
		}
		else if(tail === "upper") {
			return Probability.q_beta(x, a, b);
		}
		else if(tail === undefined) {
			// 引数を省略した場合
			return Probability.betainc(x, a, b, "lower");
		}
		else {
			throw "betainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * Probability density function (PDF) of beta distribution.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betapdf(x, a, b) {
		// powの計算結果が複素数になる場合は計算を行わない
		if	(
			((x < 0) && isInteger(b - 1)) ||
			((1 - x < 0) && isInteger(b - 1))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / Probability.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / Probability.beta(a,  b));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betacdf(x, a, b) {
		return Probability.betainc(x, a, b);
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * @param {number} p
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betainv(p, a, b) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if((p == 0.0) && (a > 0.0) && (b > 0.0)) {
			return 0.0;
		}
		else if((p == 1.0) && (a > 0.0) && (b > 0.0)) {
			return 1.0;
		}
		const eps = 1.0e-14;
		// 初期値を決める
		let y;
		if(b == 0) {
			y = 1.0 - eps;
		}
		else if(a == 0) {
			y = eps;
		}
		else {
			y = a / (a + b);
		}
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		let delta, y2;
		for(let i = 0; i < 100; i++) {
			y2 = y - ((Probability.betacdf(y, a, b) - p) / Probability.betapdf(y, a, b));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
			if(y > 1.0) {
				y = 1.0 - eps;
			}
			else if(y < 0.0) {
				y = eps;
			}
		}
		return y;
	}

	/**
	 * Factorial function, x!.
	 * @param {number} n
	 * @returns {number}
	 */
	static factorial(n) {
		const y = Probability.gamma(n + 1.0);
		if(Math.trunc(n) === n) {
			return Math.round(y);
		}
		else {
			return y;
		}
	}

	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * @param {number} n
	 * @param {number} k
	 * @returns {number} nCk
	 */
	static nchoosek(n, k) {
		// 少ない数字なら以下の計算でよい
		// return Math.round(Probability.factorial(n) / (Probability.factorial(n - k) * Probability.factorial(k)));
		let x = 1;
		const new_k = Math.min(k, n - k);
		for(let i = 1; i <= new_k; i++) {
			x *= (n + 1 - i) / i;
			if(x >= Number.MAX_SAFE_INTEGER) {
				return Infinity;
			}
		}
		return x;
	}

	/**
	 * Error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erf(x) {
		return (Probability.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	}

	/**
	 * Complementary error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erfc(x) {
		return 1.0 - Probability.erf(x);
	}

	/**
	 * Inverse function of error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfinv(p) {
		return Probability.erfcinv(1.0 - p);
	}

	/**
	 * Inverse function of complementary error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfcinv(p) {
		return - Probability.norminv(p * 0.5) / Math.sqrt(2);
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * @param {number} x
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static normpdf(x, u, s) {
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		let y = 1.0 / Math.sqrt( 2.0 * Math.PI * s_ * s_ );
		y *= Math.exp( - (x - u_) * (x - u_) / (2.0 * s_ * s_));
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * @param {number} x
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static normcdf(x, u, s) {
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		return (1.0 + Probability.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * @param {number} p - Probability.
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static norminv(p, u, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		const eps = 1.0e-12;
		// 初期値を決める
		let y = u_;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		let delta, y2;
		for(let i = 0; i < 200; i++) {
			y2 = y - ((Probability.normcdf(y, u_, s_) - p) / Probability.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * Probability density function (PDF) of binomial distribution.
	 * @param {number} x
	 * @param {number} n
	 * @param {number} p
	 * @returns {number}
	 */
	static binopdf(x, n, p) {
		if(!isFinite(p)) {
			if(isNaN(p)) {
				return NaN;
			}
			else {
				return 0.0;
			}
		}
		return Probability.nchoosek(n, x) * Math.pow(p, x) * Math.pow(1.0 - p, n - x);
	}
	
	/**
	 * Cumulative distribution function (CDF) of binomial distribution.
	 * @param {number} x
	 * @param {number} n
	 * @param {number} p
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static binocdf(x, n, p, tail) {
		return Probability.betainc(1.0 - p, n - Math.floor(x), 1 + Math.floor(x), tail);
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of binomial distribution.
	 * @param {number} y
	 * @param {number} n
	 * @param {number} p
	 * @returns {number}
	 */
	static binoinv(y, n, p) {
		if((y < 0.0) || (1.0 < y) || (p < 0.0) || (1.0 < p)) {
			return Number.NaN;
		}
		else if((y == 0.0) || (p == 0.0)) {
			return 0.0;
		}
		else if(p == 1.0) {
			return n;
		}
		// 初期値を決める
		let min = 1;
		let max = n;
		let middle = 0, old_middle = 0; 
		// ニュートンラフソン法だと安定しないので
		// 挟み込み法（二分法）で求める
		for(let i = 0; i < 200; i++) {
			middle = Math.round((min + max) / 2);
			const Y = Probability.binocdf(middle, n, p);
			if(middle === old_middle) {
				break;
			}
			if(Y > y) {
				max = middle;
			}
			else {
				min = middle;
			}
			old_middle = middle;
		}
		return middle;
	}

	/**
	 * Probability density function (PDF) of Poisson distribution.
	 * @param {number} k
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poisspdf(k, lambda) {
		if(!isFinite(k)) {
			if(isNaN(k)) {
				return Number.NaN;
			}
			else {
				return 0.0;
			}
		}
		// k が大きいとInfになってしまうので以下の処理はだめ
		// Math.pow(lambda, k) * Math.exp( - lambda ) / Probability.factorial(k);
		// あふれないように調整しながら、地道に計算する。
		const inv_e = 1.0 / Math.E;
		let x = 1.0;
		let lambda_i = 0;
		for(let i = 1; i <= k; i++) {
			x = x * lambda / i;
			if(lambda_i < lambda) {
				x *= inv_e;
				lambda_i++;
			}
		}
		for(; lambda_i < lambda; lambda_i++) {
			x *= inv_e;
		}
		return x;
	}
	
	/**
	 * Cumulative distribution function (CDF) of Poisson distribution.
	 * @param {number} k
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poisscdf(k, lambda) {
		if(k < 0) {
			return 0;
		}
		return 1.0 - Probability.gammainc(lambda, Math.floor(k + 1));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of Poisson distribution.
	 * @param {number} p
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poissinv(p, lambda) {
		if((p < 0.0) || (1.0 < p)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		// 初期値を決める
		let min = 1;
		let max = lambda * 20;
		let middle = 0, old_middle = 0; 
		// ニュートンラフソン法だと安定しないので
		// 挟み込み法（二分法）で求める
		for(let i = 0; i < 200; i++) {
			middle = Math.round((min + max) / 2);
			const P = Probability.poisscdf(middle, lambda);
			if(middle === old_middle) {
				break;
			}
			if(P > p) {
				max = middle;
			}
			else {
				min = middle;
			}
			old_middle = middle;
			// console.log(i + " " + min + " " + P + " " + max);
		}
		return middle;
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tpdf(t, v) {
		let y = 1.0 / (Math.sqrt(v) * Probability.beta(0.5, v * 0.5));
		y *= Math.pow( 1 + t * t / v, - (v + 1) * 0.5);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tcdf(t, v) {
		const y = (t * t) / (v + t * t) ;
		const p = Probability.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
		return 0.5 * (1 + p);
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {number} p - Probability.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tinv(p, v) {
		if((p < 0) || (p > 1)) {
			return Number.NaN;
		}
		if(p == 0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1) {
			return Number.POSITIVE_INFINITY;
		}
		else if(p < 0.5) {
			const y = Probability.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			const y = Probability.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
			return Math.sqrt(v / y - v);
		}
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @param {number} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {number}
	 */
	static tdist(t, v, tails) {
		return (1.0 - Probability.tcdf(Math.abs(t), v)) * tails;
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * @param {number} p - Probability.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tinv2(p, v) {
		return - Probability.tinv( p * 0.5, v);
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * @param {number} x 
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2pdf(x, k) {
		if(x < 0.0) {
			return 0;
		}
		else if(x === 0.0) {
			return 0.5;
		}
		let y = Math.pow(x, k / 2.0 - 1.0) * Math.exp( - x / 2.0 );
		y /= Math.pow(2, k / 2.0) * Probability.gamma( k / 2.0);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} x 
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2cdf(x, k) {
		return Probability.gammainc(x / 2.0, k / 2.0);
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} p - Probability.
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2inv(p, k) {
		return Probability.gaminv(p, k / 2.0, 2);
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * @param {number} x
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static fpdf(x, d1, d2) {
		if((d1 < 0) || (d2 < 0)) {
			return Number.NaN;
		}
		else if(x <= 0) {
			return 0.0;
		}
		let y = 1.0;
		y *= Math.pow( (d1 * x) / (d1 * x + d2) , d1 / 2.0);
		y *= Math.pow( 1.0 - ((d1 * x) / (d1 * x + d2)), d2 / 2.0);
		y /= x * Probability.beta(d1 / 2.0, d2 / 2.0);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * @param {number} x
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static fcdf(x, d1, d2) {
		return Probability.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * @param {number} p - Probability.
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static finv(p, d1, d2) {
		return (1.0 / Probability.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	}

}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Collection of functions for linear algebra.
 * @ignore
 */
class LinearAlgebraTool {

	/**
	 * Tridiagonalization of symmetric matrix.
	 * - Don't support complex numbers.
	 * - P*H*P'=A
	 * - P is orthonormal matrix.
	 * - H is tridiagonal matrix.
	 * - The eigenvalues of H match the eigenvalues of A.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @returns {{P: Matrix, H: Matrix}}
	 */
	static tridiagonalize(mat) {

		const A = Matrix._toMatrix(mat);
		const a = A.getNumberMatrixArray();
		const tolerance_ = 1.0e-10;

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 3重対角化の成分を取得する
		
		/**
		 * Inner product of vector x1 and vector x2.
		 * @param {Array<number>} x1
		 * @param {Array<number>} x2
		 * @param {number} [index_offset=0] - Offset of the position of the vector to be calculated.
		 * @param {number} [index_max=x1.length] - Maximum value of position of vector to be calculated (do not include this value).
		 * @returns {number} 
		 */
		const innerproduct = function(x1, x2, index_offset, index_max) {
			let y = 0;
			const ioffset = index_offset ? index_offset : 0;
			const imax = index_max ? index_max : x1.length;
			for(let i = ioffset; i < imax; i++) {
				y += x1[i] * x2[i];
			}
			return y;
		};

		/**
		 * Householder transformation.
		 * @param {Array<number>} x
		 * @param {number} [index_offset=0] - Offset of the position of the vector to be calculated.
		 * @param {number} [index_max=x.length] - Maximum value of position of vector to be calculated (do not include this value).
		 * @returns {{y1: number, v: Array<number>}} 
		 */
		const house = function(x, index_offset, index_max) {
			const ioffset = index_offset ? index_offset : 0;
			const imax = index_max ? index_max : x.length;
			// xの内積の平方根（ノルム）を計算
			let y1 = Math.sqrt(innerproduct(x, x, ioffset, imax));
			const v = [];
			if(Math.abs(y1) >= tolerance_) {
				if(x[ioffset] < 0) {
					y1 = - y1;
				}
				let t;
				for(let i = ioffset, j = 0; i < imax; i++, j++) {
					if(i === ioffset) {
						v[j] = x[i] + y1;
						t = 1.0 / Math.sqrt(v[j] * y1);
						v[j] = v[j] * t;
					}
					else {
						v[j] = x[i] * t;
					}
				}
			}
			return {
				y1: - y1,	// 鏡像の1番目の要素(y2,y3,...は0)
				v : v		// 直行する単位ベクトル vT*v = 2
			};
		};

		const n = a.length;

		/**
		 * @type {Array<number>}
		 */
		const d = []; // 対角成分
		
		/**
		 * @type {Array<number>}
		 */
		const e = []; // 隣の成分
		{
			for(let k = 0; k < n - 2; k++) {
				const v = a[k];
				d[k] = v[k];
				{
					const H = house(v, k + 1, n);
					e[k] = H.y1;
					for(let i = 0; i < H.v.length; i++) {
						v[k + 1 + i] = H.v[i];
					}
				}
				if(Math.abs(e[k]) < tolerance_) {
					continue;
				}
				for(let i = k + 1; i < n; i++) {
					let s = 0;
					for(let j = k + 1; j < i; j++) {
						s += a[j][i] * v[j];
					}
					for(let j = i; j < n; j++) {
						s += a[i][j] * v[j];
					}
					d[i] = s;
				}
				const t = innerproduct(v, d, k + 1, n) / 2.0;
				for(let i = n - 1; i > k; i--) {
					const p = v[i];
					const q = d[i] - (t * p);
					d[i] = q;
					for(let j = i; j < n; j++) {
						const r = p * d[j] + q * v[j];
						a[i][j] = a[i][j] - r;
					}
				}
			}
			if(n >= 2) {
				d[n - 2] = a[n - 2][n - 2];
				e[n - 2] = a[n - 2][n - 1];
			}
			if(n >= 1) {
				d[n - 1] = a[n - 1][n - 1];
			}
		}

		//変換P行列を求める
		for(let k = n - 1; k >= 0; k--) {
			const v = a[k];
			if(k < n - 2) {
				for(let i = k + 1; i < n; i++) {
					const w = a[i];
					const t = innerproduct(v, w, k + 1, n);
					for(let j = k + 1; j < n; j++) {
						w[j] -= t * v[j];
					}
				}
			}
			for(let i = 0; i < n; i++) {
				v[i] = 0.0;
			}
			v[k] = 1.0;
		}

		// d と e の配列を使って、三重対角行列を作成する
		const H = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				return new Complex(d[row]);
			}
			else if(Math.abs(row - col) === 1) {
				return new Complex(e[Math.trunc((row + col) * 0.5)]);
			}
			else {
				return Complex.ZERO;
			}
		}, n, n);

		return {
			P : (new Matrix(a)).T(),
			H : H
		};
	}

	/**
	 * Eigendecomposition of symmetric matrix.
	 * - Don't support complex numbers.
	 * - V*D*V'=A.
	 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
	 * - D is a matrix containing the eigenvalues on the diagonal component.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - Symmetric matrix.
	 * @returns {{V: Matrix, D: Matrix}}
	 */
	static eig(mat) {
		const A = Matrix._toMatrix(mat);
		
		// QR法により固有値を求める
		let is_error = false;
		const tolerance_ = 1.0e-10;
		const PH = LinearAlgebraTool.tridiagonalize(A);
		const a = PH.P.getNumberMatrixArray();
		const h = PH.H.getNumberMatrixArray();
		const n = A.row_length;

		// 成分の抽出
		const d = []; // 対角成分
		const e = []; // 隣の成分
		for(let i = 0; i < n; i++) {
			d[i] = h[i][i];
			e[i] = (i === 0) ? 0.0 : h[i][i - 1];
		}

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		const MAX_ITER = 100;
		for(let h = n - 1; h > 0; h--) {
			let j = h;
			for(j = h;j >= 1; j--) {
				if(Math.abs(e[j]) <= (tolerance_ * (Math.abs(d[j - 1]) + Math.abs(d[j])))) {
					break;
				}
			}
			if(j == h) {
				continue;
			}
			let iter = 0;
			while(true) {
				iter++;
				if(iter > MAX_ITER) {
					is_error = true;
					break;
				}
				let w = (d[h - 1] - d[h]) / 2.0;

				/**
				 * @type {number}
				 */
				let t = e[h] * e[h];
				let s = Math.sqrt(w * w + t);
				if(w < 0) {
					s = - s;
				}
				let x = d[j] - d[h] + (t / (w + s));
				
				/**
				 * @type {number}
				 */
				let y = e[j + 1];
				for(let k = j; k < h; k++) {
					let c, s;
					if(Math.abs(x) >= Math.abs(y)) {
						t = - y / x;
						c = 1.0 / Math.sqrt(t * t + 1);
						s = t * c;
					}
					else {
						t = - x / y;
						s = 1.0 / Math.sqrt(t * t + 1);
						c = t * s;
					}
					w = d[k] - d[k + 1];
					t = (w * s + 2.0 * c * e[k + 1]) * s;
					d[k] -= t;
					d[k + 1] += t;
					if(k > j) {
						e[k] = c * e[k] - s * y;
					}
					e[k + 1] += s * (c * w - 2.0 * s * e[k + 1]);
					for(let i = 0; i < n; i++) {
						x = a[i][k];
						y = a[i][k + 1];
						a[i][k    ] = c * x - s * y;
						a[i][k + 1] = s * x + c * y;
					}
					if(k < h - 1) {
						x = e[k + 1];
						y = -s * e[k + 2];
						e[k + 2] *= c;
					}
				}
				if(Math.abs(e[h]) <= tolerance_ * (Math.abs(d[h - 1]) + Math.abs(d[h]))) {
					break;
				}
			}
			if(is_error) {
				break;
			}
		}

		// 固有値が大きいものから並べるソート
		/**
		 * @param {Matrix} V 
		 * @param {Array<number>} d 
		 */
		const vd_sort = function(V, d) {
			const len = d.length;
			const sortdata = [];
			for(let i = 0; i < len; i++) {
				sortdata[i] = {
					sigma : d[i],
					index : i
				};
			}
			/**
			 * @param {{sigma : number}} a 
			 * @param {{sigma : number}} b 
			 */
			const compare = function(a, b){
				if(a.sigma === b.sigma) {
					return 0;
				}
				return (a.sigma < b.sigma ? 1 : -1);
			};
			sortdata.sort(compare);
			const MOVE = Matrix.zeros(len);
			const ND = Matrix.zeros(len);
			for(let i = 0; i < len; i++) {
				ND.matrix_array[i][i] = new Complex(sortdata[i].sigma);
				MOVE.matrix_array[i][sortdata[i].index] = Complex.ONE;
			}
			return {
				V : V.mul(MOVE),
				D : ND
			};
		};
		const VD = vd_sort(new Matrix(a), d);
		return VD;
	}

	/**
	 * Treat matrices as vectors, make them orthonormal, and make matrices of Q and R.
	 * The method of Gram-Schmidt orthonormalization is used.
	 * @param {Matrix} mat - Square matrix.
	 * @returns {{Q: Matrix, R: Matrix, non_orthogonalized : Array<number>}}
	 */
	static doGramSchmidtOrthonormalization(mat) {
		// グラム・シュミットの正規直交化法を使用する
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.

		const M = Matrix._toMatrix(mat);
		const len = M.column_length;
		const A = M.matrix_array;
		const Q_Matrix = Matrix.zeros(len);
		const R_Matrix = Matrix.zeros(len);
		const Q = Q_Matrix.matrix_array;
		const R = R_Matrix.matrix_array;
		const non_orthogonalized = [];
		const a = new Array(len);
		
		for(let col = 0; col < len; col++) {
			// i列目を抽出
			for(let row = 0; row < len; row++) {
				a[row] = A[row][col];
			}
			// 直行ベクトルを作成
			if(col > 0) {
				// Rのi列目を内積で計算する
				for(let j = 0; j < col; j++) {
					for(let k = 0; k < len; k++) {
						R[j][col] = R[j][col].add(A[k][col].dot(Q[k][j]));
					}
				}
				for(let j = 0; j < col; j++) {
					for(let k = 0; k < len; k++) {
						a[k] = a[k].sub(R[j][col].mul(Q[k][j]));
					}
				}
			}
			{
				// 正規化と距離を1にする
				for(let j = 0; j < len; j++) {
					R[col][col] = R[col][col].add(a[j].square());
				}
				R[col][col] = R[col][col].sqrt();
				if(R[col][col].isZero(1e-10)) {
					// 直行化が不可能だった列の番号をメモして、その列はゼロで埋める
					non_orthogonalized.push(col);
					for(let j = 0;j < len;j++) {
						Q[j][col] = Complex.ZERO;
					}
				}
				else {
					// ここで R[i][i] === 0 の場合、直行させたベクトルaは0であり、
					// ランク落ちしており、計算不可能である。
					// 0割りした値を、j列目のQに記録していくがInfとなる。
					for(let j = 0;j < len;j++) {
						Q[j][col] = a[j].div(R[col][col]);
					}
				}
			}
		}
		return {
			Q : Q_Matrix,
			R : R_Matrix,
			non_orthogonalized : non_orthogonalized
		};
	}
	
	/**
	 * Create orthogonal vectors for all row vectors of the matrix.
	 * - If the vector can not be found, it returns NULL.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {number} [tolerance=1.0e-10] - Calculation tolerance of calculation.
	 * @returns {Matrix|null} An orthogonal vector.
	 */
	static createOrthogonalVector(mat, tolerance) {
		const M = new Matrix(mat);
		const column_length = M.column_length;
		const m = M.matrix_array;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		// 正則行列をなす場合に問題となる行番号を取得
		const not_regular_rows = LinearAlgebraTool.getLinearDependenceVector(M, tolerance_);
		// 不要な行を削除する
		{
			// not_regular_rowsは昇順リストなので、後ろから消していく
			for(let i = not_regular_rows.length - 1; i >= 0; i--) {
				m.splice(not_regular_rows[i], 1);
				M.row_length--;
			}
		}
		// 追加できるベクトルの数
		const add_vectors = column_length - m.length;
		if(add_vectors <= 0) {
			return null;
		}
		// ランダムベクトル（seed値は毎回同一とする）
		const noise = new Random(0);
		let orthogonal_matrix = null;
		for(let i = 0; i < 100; i++) {
			// 直行ベクトルを作るために、いったん行と列を交換する
			// これは、グラム・シュミットの正規直交化法が列ごとに行う手法のため。
			const M2 = M.T();
			// ランダム行列を作成する
			const R = Matrix.createMatrixDoEachCalculation(function() {
				return new Complex(noise.nextGaussian());
			}, M2.row_length, add_vectors);
			// 列に追加する
			M2._concatRight(R);
			// 正規直行行列を作成する
			orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M2);
			// 正しく作成できていたら完了
			if(orthogonal_matrix.non_orthogonalized.length === 0) {
				break;
			}
		}
		if(orthogonal_matrix.non_orthogonalized.length !== 0) {
			// 普通は作成できないことはないが・・・
			console.log("miss");
			return null;
		}
		// 作成した列を切り出す
		const y = new Array(add_vectors);
		const q = orthogonal_matrix.Q.matrix_array;
		for(let row = 0; row < add_vectors; row++) {
			y[row] = new Array(column_length);
			for(let col = 0; col < column_length; col++) {
				y[row][col] = q[col][column_length - add_vectors + row];
			}
		}
		return new Matrix(y);
	}

	/**
	 * Row number with the largest norm value in the specified column of the matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {number} column_index - Number of column of matrix.
	 * @param {number} [row_index_offset=0] - Offset of the position of the vector to be calculated.
	 * @param {number} [row_index_max] - Maximum value of position of vector to be calculated (do not include this value).
	 * @returns {{index: number, max: number}} Matrix row number.
	 * @private
	 */
	static getMaxRowNumber(mat, column_index, row_index_offset, row_index_max) {
		const M = Matrix._toMatrix(mat);
		let row_index = 0;
		let row_max = 0;
		let row = row_index_offset ? row_index_offset : 0;
		const row_imax = row_index_max ? row_index_max : M.row_length;
		// n列目で最も大きな行を取得
		for(; row < row_imax; row++) {
			const norm = M.matrix_array[row][column_index].norm;
			if(norm > row_max) {
				row_max = norm;
				row_index = row;
			}
		}
		return {
			index : row_index,
			max : row_max
		};
	}

	/**
	 * Extract linearly dependent rows when each row of matrix is a vector.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {number} [tolerance=1.0e-10] - Calculation tolerance of calculation.
	 * @returns {Array<number>} Array of matrix row numbers in ascending order.
	 * @private
	 */
	static getLinearDependenceVector(mat, tolerance) {
		const M = new Matrix(mat);
		const m = M.matrix_array;
		const tolerance_ = tolerance ? Matrix._toDouble(tolerance) : 1.0e-10;
		// 確認する行番号（ここから終わった行は削除していく）
		const row_index_array = new Array(M.row_length);
		for(let i = 0; i < M.row_length; i++) {
			row_index_array[i] = i;
		}
		// ガウスの消去法を使用して、行ベクトルを抽出していく
		for(let col_target = 0; col_target < M.column_length; col_target++) {
			let row_max_index = 0;
			{
				let row_max = 0;
				let row_max_key = 0;
				// n列目で絶対値が最も大きな行を取得
				for(const row_key in row_index_array) {
					const row = row_index_array[row_key];
					const norm = m[row][col_target].norm;
					if(norm > row_max) {
						row_max = norm;
						row_max_key = parseInt(row_key, 10);
						row_max_index = row;
					}
				}
				// 大きいのが0である＝その列は全て0である
				if(row_max <= tolerance_) {
					continue;
				}
				// 大きな値があった行は、リストから除去する
				row_index_array.splice(row_max_key, 1);
				if(col_target === M.column_length - 1) {
					break;
				}
			}
			// 次の列から、大きな値があった行の成分を削除
			for(const row_key in row_index_array) {
				const row = row_index_array[row_key];
				const inv = m[row][col_target].div(m[row_max_index][col_target]);
				for(let col = col_target; col < M.column_length; col++) {
					m[row][col] = m[row][col].sub(m[row_max_index][col].mul(inv));
				}
			}
		}
		return row_index_array;
	}

}

/**
 * Class for linear algebra for `Matrix` class.
 * - These methods can be used in the `Matrix` method chain.
 * - This class cannot be called directly.
 */
class LinearAlgebra {

	/**
	 * Inner product/Dot product.
	 * @param {import("../Matrix.js").KMatrixInputData} A
	 * @param {import("../Matrix.js").KMatrixInputData} B
	 * @param {import("../Matrix.js").KMatrixInputData} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
	 * @returns {Matrix} A・B
	 */
	static inner(A, B, dimension) {
		const M1 = Matrix._toMatrix(A);
		const M2 = Matrix._toMatrix(B);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const dim = dimension ? Matrix._toInteger(dimension) : 1;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.dot(M2.scalar));
		}
		if(M1.isVector() && M2.isVector()) {
			let sum = Complex.ZERO;
			for(let i = 0; i < M1.length; i++) {
				sum = sum.add(M1.getComplex(i).dot(M2.getComplex(i)));
			}
			return new Matrix(sum);
		}
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		if(dim === 1) {
			const y = new Array(1);
			y[0] = new Array(M1.column_length);
			for(let col = 0; col < M1.column_length; col++) {
				let sum = Complex.ZERO;
				for(let row = 0; row < M1.row_length; row++) {
					sum = sum.add(x1[row][col].dot(x2[row][col]));
				}
				y[0][col] = sum;
			}
			return new Matrix(y);
		}
		else if(dim === 2) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				let sum = Complex.ZERO;
				for(let col = 0; col < M1.column_length; col++) {
					sum = sum.add(x1[row][col].dot(x2[row][col]));
				}
				y[row] = [sum];
			}
			return new Matrix(y);
		}
		else {
			throw "dim";
		}
	}

	/**
	 * p-norm.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {import("../Matrix.js").KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	static norm(mat, p) {
		const M = Matrix._toMatrix(mat);
		const p_number = (p === undefined) ? 2 : Matrix._toDouble(p);
		if(p_number === 1) {
			// 行列の1ノルム
			const y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[0][col].norm;
				}
				return sum;
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				let sum = 0.0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][0].norm;
				}
				return sum;
			}
			// 列の和の最大値
			let max = 0;
			// 列を固定して行の和を計算
			for(let col = 0; col < M.column_length; col++) {
				let sum = 0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][col].norm;
				}
				if(max < sum) {
					max = sum;
				}
			}
			return max;
		}
		else if(p_number === 2) {
			// 行列の2ノルム
			const y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[0][col].square().real;
				}
				return Math.sqrt(sum);
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				let sum = 0.0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][0].square().real;
				}
				return Math.sqrt(sum);
			}
			return M.svd().S.diag().max().scalar.real;
		}
		else if((p_number === Number.POSITIVE_INFINITY) || (p_number === Number.NEGATIVE_INFINITY)) {
			const y = M.matrix_array;
			let compare_number = p_number === Number.POSITIVE_INFINITY ? 0 : Number.POSITIVE_INFINITY;
			const compare_func = p_number === Number.POSITIVE_INFINITY ? Math.max : Math.min;
			// 行ノルムを計算する
			if(M.isRow()) {
				for(let col = 0; col < M.column_length; col++) {
					compare_number = compare_func(compare_number, y[0][col].norm);
				}
				return compare_number;
			}
			// 列ノルムを計算する
			if(M.isColumn()) {
				for(let row = 0; row < M.row_length; row++) {
					compare_number = compare_func(compare_number, y[row][0].norm);
				}
				return compare_number;
			}
			// 行列の場合は、列の和の最大値
			compare_number = 0;
			for(let row = 0; row < M.row_length; row++) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[row][col].norm;
				}
				compare_number = Math.max(compare_number, sum);
			}
			return compare_number;
		}
		else if(M.isVector()) {
			// 一般化ベクトルpノルム
			let sum = 0.0;
			for(let i = 0; i < M.length; i++) {
				sum += Math.pow(M.getComplex(i).norm, p_number);
			}
			return Math.pow(sum, 1.0 / p_number);
		}
		// 未実装
		throw "norm";
	}
	
	/**
	 * Condition number of the matrix
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {import("../Matrix.js").KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	static cond(mat, p) {
		const M = Matrix._toMatrix(mat);
		const p_number = (p === undefined) ? 2 : Matrix._toInteger(p);
		if(p_number === 2) {
			// 零行列は Inf
			if(M.isZeros()) {
				return Number.POSITIVE_INFINITY;
			}
			// ベクトルは1
			if(M.isVector()) {
				return 1;
			}
			// ユニタリは1
			if(M.isUnitary()) {
				return 1;
			}
			const s = M.svd().S.diag();
			return s.max().scalar.real / s.min().scalar.real;
		}
		return M.norm(p) * M.pinv().norm(p);
	}

	/**
	 * Inverse condition number.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @returns {number}
	 */
	static rcond(mat) {
		return 1.0 / LinearAlgebra.cond(Matrix._toMatrix(mat), 1);
	}

	/**
	 * Rank.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @param {import("../Matrix.js").KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {number} rank(A)
	 */
	static rank(mat, tolerance) {
		const M = Matrix._toMatrix(mat);
		const t = tolerance !== undefined ? Matrix._toDouble(tolerance) : undefined;
		// 横が長い行列の場合
		if(M.row_length <= M.column_length) {
			return Math.min(M.row_length, M.column_length) - (LinearAlgebraTool.getLinearDependenceVector(M, t)).length;
		}
		else {
			return M.row_length - (LinearAlgebraTool.getLinearDependenceVector(M, t)).length;
		}
	}

	/**
	 * Trace of a matrix.
	 * Sum of diagonal elements.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @returns {Complex}
	 */
	static trace(mat) {
		const M = Matrix._toMatrix(mat);
		const len = Math.min(M.row_length, M.column_length);
		let sum = Complex.ZERO;
		for(let i = 0; i < len; i++) {
			sum = sum.add(M.matrix_array[i][i]);
		}
		return sum;
	}

	/**
	 * Determinant.
	 * @param {import("../Matrix.js").KMatrixInputData} mat
	 * @returns {Matrix} |A|
	 */
	static det(mat) {
		const M = Matrix._toMatrix(mat);
		if(!M.isSquare()) {
			throw "not square";
		}
		const len = M.length;
		if(len < 5) {
			/**
			 * @param {Array<Array<Complex>>} x 
			 */
			const calcDet = function(x) {
				if(x.length === 2) {
					// 2次元の行列式になったら、たすき掛け計算する
					return x[0][0].mul(x[1][1]).sub(x[0][1].mul(x[1][0]));
				}
				let y = Complex.ZERO;
				for(let i = 0; i < x.length; i++) {
					// N次元の行列式を、N-1次元の行列式に分解していく

					/**
					 * @type {Array<Array<Complex>>}
					 */
					const D = [];
					const a = x[i][0];
					for(let row = 0, D_low = 0; row < x.length; row++) {
						if(i === row) {
							continue;
						}
						D[D_low] = [];
						for(let col = 1, D_col = 0; col < x.length; col++, D_col++) {
							D[D_low][D_col] = x[row][col];
						}
						D_low++;
					}
					if((i % 2) === 0) {
						y = y.add(a.mul(calcDet(D)));
					}
					else {
						y = y.sub(a.mul(calcDet(D)));
					}
				}
				return y;
			};
			return new Matrix(calcDet(M.matrix_array));
		}
		else {
			// サイズが大きい場合は、lu分解を利用する
			const lup = LinearAlgebra.lup(M);
			const exchange_count = (len - lup.P.diag().sum().scalar.real) / 2;
			// 上行列の対角線上の値を掛け算する
			let y = lup.U.diag().prod();
			if((exchange_count % 2) === 1) {
				y = y.negate();
			}
			return new Matrix(y);
		}
	}

	/**
	 * LUP decomposition.
	 * - P'*L*U=A
	 * - P is permutation matrix.
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
	 */
	static lup(mat) {
		const A = new Matrix(mat);
		const L = Matrix.zeros(A.row_length);
		const U = A;
		const P = Matrix.eye(A.row_length);
		const l = L.matrix_array;
		const u = U.matrix_array;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(let k = 0; k < A.column_length; k++) {
			// ピポットの選択
			let pivot;
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const max_row_number = LinearAlgebraTool.getMaxRowNumber(U, k, k);
				pivot = max_row_number.index;
				if(max_row_number.max === 0.0) {
					continue;
				}
				//交換を行う
				if(k !== pivot) {
					L._exchangeRow(k, pivot);
					U._exchangeRow(k, pivot);
					P._exchangeRow(k, pivot);
				}
			}
			// 消去
			for(let row = k + 1;row < A.row_length; row++) {
				const temp = u[row][k].div(u[k][k]);
				l[row][k] = temp;
				//lの値だけ行交換が必要？
				for(let col = k; col < A.column_length; col++) {
					u[row][col] = u[row][col].sub(u[k][col].mul(temp));
				}
			}
		}
		L._resize(A.row_length, Math.min(A.row_length, A.column_length));
		U._resize(Math.min(A.row_length, A.column_length), A.column_length);
		// L の対角線に1を代入
		L._each(function(num, row, col) {
			return row === col ? Complex.ONE : num;
		});
		return {
			L : L,
			U : U,
			P : P
		};
	}

	/**
	 * LU decomposition.
	 * - L*U=A
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{L: Matrix, U: Matrix}} {L, U}
	 */
	static lu(mat) {
		const lup = LinearAlgebra.lup(mat);
		const L = lup.P.T().mul(lup.L);
		return {
			L : L,
			U : lup.U
		};
	}

	/**
	 * Solving a system of linear equations to be Ax = B
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @param {import("../Matrix.js").KMatrixInputData} number - B
	 * @returns {Matrix} x
	 * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
	 */
	static linsolve(mat, number) {
		const A = Matrix._toMatrix(mat);
		const B = Matrix._toMatrix(number);
		if(!A.isSquare()) {
			throw "Matrix size does not match";
		}
		// 連立一次方程式を解く
		const arg = B;
		if((B.row_length !== A.row_length) || (B.column_length > 1)) {
			throw "Matrix size does not match";
		}
		// 行列を準備する
		const M = new Matrix(A);
		M._concatRight(arg);
		const long_matrix_array = M.matrix_array;
		const long_length = M.column_length;
		const len = A.column_length;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(let k = 0; k < (len - 1); k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				const normalize_value = long_matrix_array[k][k].inv();
				for(let row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(let row = k + 1;row < len; row++) {
				const temp = long_matrix_array[row][k];
				for(let col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].sub(long_matrix_array[k][col].mul(temp));
				}
			}
		}
		//後退代入
		const y = new Array(len);
		y[len - 1] = long_matrix_array[len - 1][len].div(long_matrix_array[len - 1][len - 1]);
		for(let row = len - 2; row >= 0; row--) {
			y[row] = long_matrix_array[row][long_length - 1];
			for(let j = row + 1; j < len; j++) {
				y[row] = y[row].sub(long_matrix_array[row][j].mul(y[j]));
			}
			y[row] = y[row].div(long_matrix_array[row][row]);
		}
		const y2 = new Array(A.row_length);
		for(let row = 0; row < A.row_length; row++) {
			y2[row] = [y[row]];
		}

		return new Matrix(y2);
	}

	/**
	 * QR decomposition.
	 * - Q*R=A
	 * - Q is orthonormal matrix.
	 * - R is upper triangular matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{Q: Matrix, R: Matrix}} {Q, R}
	 */
	static qr(mat) {
		// 行列を準備する
		const M = new Matrix(mat);
		// 作成後のQとRのサイズ
		const Q_row_length = M.row_length;
		const Q_column_length = M.row_length;
		const R_row_length = M.row_length;
		const R_column_length = M.column_length;
		// 計算時の行と列のサイズ
		const dummy_size = Math.max(M.row_length, M.column_length);
		// 正方行列にする
		M._resize(dummy_size, dummy_size);
		// 正規直行化
		const orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M);
		// 計算したデータを取得
		let Q_Matrix = orthogonal_matrix.Q;
		const R_Matrix = orthogonal_matrix.R;
		const non_orthogonalized = orthogonal_matrix.non_orthogonalized;

		// Qのサイズを成型する
		if(non_orthogonalized.length === M.row_length) {
			// 零行列の場合の特別処理
			Q_Matrix = Matrix.eye(M.row_length);
		}
		else if(non_orthogonalized.length !== 0) {
			// 一部、直行化できていない列があるため直行化できてない列以外を抽出
			/**
			 * @type {any}
			 */
			const map = {};
			for(let i = 0; i < non_orthogonalized.length; i++) {
				map[non_orthogonalized[i]] = 1;
			}
			const orthogonalized = [];
			for(let i = 0; i < dummy_size; i++) {
				if(map[i]) {
					continue;
				}
				const array = [];
				for(let j = 0; j < dummy_size; j++) {
					array[j] = Q_Matrix.matrix_array[j][i];
				}
				orthogonalized.push(array);
			}
			// 直行ベクトルを作成する
			const orthogonal_vector = LinearAlgebraTool.createOrthogonalVector(orthogonalized);
			// 直行化できていない列を差し替える
			for(let i = 0; i < non_orthogonalized.length; i++) {
				const q_col = non_orthogonalized[i];
				for(let j = 0; j < dummy_size; j++) {
					Q_Matrix.matrix_array[j][q_col] = orthogonal_vector.matrix_array[i][j];
				}
			}
		}
		Q_Matrix._resize(Q_row_length, Q_column_length);
		// Rのサイズを成形する
		R_Matrix._resize(R_row_length, R_column_length);
		return {
			Q : Q_Matrix,
			R : R_Matrix
		};
	}

	/**
	 * Tridiagonalization of symmetric matrix.
	 * - Don't support complex numbers.
	 * - P*H*P'=A
	 * - P is orthonormal matrix.
	 * - H is tridiagonal matrix.
	 * - The eigenvalues of H match the eigenvalues of A.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{P: Matrix, H: Matrix}} {P, H}
	 */
	static tridiagonalize(mat) {
		const M = new Matrix(mat);
		if(!M.isSquare()) {
			throw "not square matrix";
		}
		if(!M.isSymmetric()) {
			throw "not Symmetric";
		}
		if(M.isComplex()) {
			throw "not Real Matrix";
		}
		return LinearAlgebraTool.tridiagonalize(M);
	}

	/**
	 * Eigendecomposition of symmetric matrix.
	 * - Don't support complex numbers.
	 * - V*D*V'=A.
	 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
	 * - D is a matrix containing the eigenvalues on the diagonal component.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{V: Matrix, D: Matrix}} {D, V}
	 * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
	 */
	static eig(mat) {
		const M = new Matrix(mat);
		if(!M.isSquare()) {
			throw "not square matrix";
		}
		if(!M.isSymmetric()) {
			throw "not Symmetric";
		}
		if(M.isComplex()) {
			throw "not Real Matrix";
		}
		return LinearAlgebraTool.eig(M);
	}

	/**
	 * Singular Value Decomposition (SVD).
	 * - U*S*V'=A
	 * - U and V are orthonormal matrices.
	 * - S is a matrix with singular values in the diagonal.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
	 */
	static svd(mat) {
		const M = new Matrix(mat);
		if(M.isComplex()) {
			// 複素数が入っている場合は、eig関数が使用できないので非対応
			throw "Unimplemented";
		}
		const rank = LinearAlgebra.rank(M);
		// SVD分解
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.
		const VD = LinearAlgebra.eig(M.T().mul(M));
		const sigma = Matrix.zeros(M.row_length, M.column_length);
		sigma._each(function(num, row, col) {
			if((row === col) && (row < rank)) {
				return VD.D.getComplex(row, row).sqrt();
			}
		});
		const s_size = Math.min(M.row_length, M.column_length);
		const sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				const x = sigma.matrix_array[row][row];
				if(x.isZero()) {
					return Complex.ZERO;
				}
				else {
					return x.inv();
				}
			}
			else {
				return Complex.ZERO;
			}
		}, s_size);
		const V_rank = VD.V.resize(VD.V.row_length, s_size);
		const u = M.mul(V_rank).mul(sing);
		const QR = LinearAlgebra.qr(u);
		return {
			U : QR.Q,
			S : sigma,
			V : VD.V
		};
	}

	/**
	 * Inverse matrix of this matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {Matrix} A^-1
	 */
	static inv(mat) {
		const X = new Matrix(mat);
		if(X.isScalar()) {
			return new Matrix(Complex.ONE.div(X.scalar));
		}
		if(!X.isSquare()) {
			throw "not square";
		}
		if(X.isDiagonal()) {
			// 対角行列の場合は、対角成分のみ逆数をとる
			const y = X.T();
			const size = Math.min(y.row_length, y.column_length);
			for(let i = 0; i < size; i++) {
				y.matrix_array[i][i] = y.matrix_array[i][i].inv();
			}
			return y;
		}
		// (ここで正規直交行列の場合なら、転置させるなど入れてもいい？判定はできないけども)
		const len = X.column_length;
		// ガウス・ジョルダン法
		// 初期値の設定
		const M = new Matrix(X);
		M._concatRight(Matrix.eye(len));
		const long_matrix_array = M.matrix_array;
		const long_length = M.column_length;

		//前進消去
		for(let k = 0; k < len; k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				const normalize_value = long_matrix_array[k][k].inv();
				for(let row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(let row = 0;row < len; row++) {
				if(row === k) {
					continue;
				}
				const temp = long_matrix_array[row][k];
				for(let col = k; col < long_length; col++)
				{
					long_matrix_array[row][col] = long_matrix_array[row][col].sub(long_matrix_array[k][col].mul(temp));
				}
			}
		}

		const y = new Array(len);
		//右の列を抜き取る
		for(let row = 0; row < len; row++) {
			y[row] = new Array(len);
			for(let col = 0; col < len; col++) {
				y[row][col] = long_matrix_array[row][len + col];
			}
		}

		return new Matrix(y);
	}

	/**
	 * Pseudo-inverse matrix.
	 * @param {import("../Matrix.js").KMatrixInputData} mat - A
	 * @returns {Matrix} A^+
	 */
	static pinv(mat) {
		const M = new Matrix(mat);
		const USV = LinearAlgebra.svd(M);
		const U = USV.U;
		const S = USV.S;
		const V = USV.V;
		const sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				const x = S.matrix_array[row][row];
				if(x.isZero()) {
					return Complex.ZERO;
				}
				else {
					return x.inv();
				}
			}
			else {
				return Complex.ZERO;
			}
		}, M.column_length, M.row_length);
		return V.mul(sing).mul(U.T());
	}



}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KStatisticsSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */

/**
 * Class for statistical processing for `Matrix` class.
 * - These methods can be used in the `Matrix` method chain.
 * - This class cannot be called directly.
 */
class Statistics {

	/**
	 * Maximum number.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix} max([A, B])
	 */
	static max(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) < 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}
	
	/**
	 * Minimum number.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix} min([A, B])
	 */
	static min(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) > 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Sum.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static sum(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			// カハンの加算アルゴリズム
			let sum = Complex.ZERO;
			let delta = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				const new_number = data[i].add(delta);
				const new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Arithmetic average.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			// カハンの加算アルゴリズム
			let sum = Complex.ZERO;
			let delta = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				const new_number = data[i].add(delta);
				const new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum.div(data.length)];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Product of array elements.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static prod(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = Complex.ONE;
			for(let i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Geometric mean.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static geomean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = Complex.ONE;
			for(let i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x.pow(Complex.create(data.length).inv())];
		};
		return X.eachVector(main, dim);
	}
	
	/**
	 * Median.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static median(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Complex} a
		 * @param {Complex} b
		 * @returns {number}
		 */
		const compare = function(a, b){
			return a.compareTo(b);
		};
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			let y;
			if((data.length % 2) === 1) {
				y = data[Math.floor(data.length / 2)];
			}
			else {
				const x1 = data[Math.floor(data.length / 2) - 1];
				const x2 = data[Math.floor(data.length / 2)];
				y = x1.add(x2).div(Complex.TWO);
			}
			return [y];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Mode.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mode(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Complex} a
		 * @param {Complex} b
		 * @returns {number}
		 */
		const compare = function(a, b){
			return a.compareTo(b);
		};
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			/**
			 * @type {any}
			 */
			const map = {};
			for(let i = 0; i < data.length; i++) {
				const str = data[i].real + " " + data[i].imag;
				if(!map[str]) {
					map[str] = {
						complex : data[i],
						value : 1
					};
				}
				else {
					map[str].value++;
				}
			}
			let max_complex = Complex.ZERO;
			let max_number = Number.NEGATIVE_INFINITY;
			for(const key in map) {
				const tgt = map[key];
				if(tgt.value > max_number) {
					max_number	= tgt.value;
					max_complex	= tgt.complex;
				}
			}
			return [max_complex];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Moment.
	 * - Moment of order n. Equivalent to the definition of variance at 2.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {number} nth_order
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static moment(x, nth_order, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、標本分散とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Matrix._toComplex(nth_order);
		let col = 0;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let mean;
			if(M.isScalar()) {
				mean = M.scalar;
			}
			else {
				mean = M.getComplex(col++);
			}
			let x = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				// 計算方法について
				// ・複素数は、ノルムをとらずに複素数用のpowを使用したほうがいいのか
				// ・分散と同様にnormで計算したほうがいいのか
				// 複素数でのモーメントの定義がないため不明であるが、
				// 分散を拡張した考えであれば、normをとった累乗のほうが良いと思われる。
				const a = data[i].sub(mean);
				x = x.add(a.pow(order));
			}
			if(data.length === 1) {
				return [x.div(data.length)];
			}
			else {
				return [x.div(data.length - 1 + cor)];
			}
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Variance.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static var(x, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		let col = 0;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			if(data.length === 1) {
				// 要素が1であれば、分散は0固定
				return [Complex.ZERO];
			}
			const mean = M.getComplex(col++);
			// 分散は、ノルムの2乗で計算するため必ず実数になる。
			let x = 0;
			for(let i = 0; i < data.length; i++) {
				const a = data[i].sub(mean).norm;
				x += a * a;
			}
			return [Complex.create(x / (data.length - 1 + cor))];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Standard deviation.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static std(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Statistics.var(X, { correction : cor, dimension : dim });
		M._each(function(num) {
			return num.sqrt();
		});
		return M;
	}

	/**
	 * Mean absolute deviation.
	 * - The "algorithm" can choose "0/mean"(default) and "1/median".
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {?string|?number} [algorithm]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mad(x, algorithm, type) {
		const X = Matrix._toMatrix(x);
		const alg = !algorithm ? "mean" : (typeof algorithm === "string" ? algorithm : Matrix._toInteger(algorithm));
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		if((alg === "mean") || (alg === 0)) {
			return Statistics.mean(X.sub(Statistics.mean(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else if((alg === "median") || (alg === 1)) {
			return Statistics.median(X.sub(Statistics.median(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else {
			throw "mad unsupported argument " + alg;
		}
	}

	/**
	 * Skewness.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static skewness(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏), 1(標本)。規定値は、標本とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Statistics.moment(X, 3, { correction : cor, dimension : dim });
		const std = Statistics.std(X, { correction : cor, dimension : dim });
		if(cor === 1) {
			return order.dotdiv(std.dotpow(3));
		}
		else {
			return order.dotdiv(std.dotpow(3)).dotmul(2);
		}
	}

	/**
	 * Covariance matrix or Covariance value.
	 * - Get a variance-covariance matrix from 1 matrix.
	 * - Get a covariance from 2 vectors.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings|import("../Matrix.js").KMatrixInputData} [y_or_type]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static cov(x, y_or_type, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		let cor = 0;
		let Y = null;
		if(y_or_type !== undefined) {
			if(type !== undefined) {
				cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
				Y = Matrix._toMatrix(y_or_type);
			}
			else {
				if(typeof y_or_type === "object" && ("correction" in y_or_type)){
					cor = Matrix._toDouble(y_or_type.correction);
				}
				else {
					Y = Matrix._toMatrix(y_or_type);
				}
			}
		}
		// 1つの行列から分散共分散行列を作成する
		if(Y === null) {
			if(X.isVector()) {
				return Statistics.var(X, {correction : cor});
			}
			const correction = X.row_length === 1 ? 1 : cor;
			const arr = X.matrix_array;
			const mean = Statistics.mean(X).matrix_array[0];
			// 上三角行列、対角行列
			const y = new Array(X.column_length);
			for(let a = 0; a < X.column_length; a++) {
				const a_mean = mean[a];
				y[a] = new Array(X.column_length);
				for(let b = a; b < X.column_length; b++) {
					const b_mean = mean[b];
					let sum = Complex.ZERO;
					for(let row = 0; row < X.row_length; row++) {
						sum = sum.add((arr[row][a].sub(a_mean)).dot(arr[row][b].sub(b_mean)));
					}
					y[a][b] = sum.div(X.row_length - 1 + correction);
				}
			}
			// 下三角行列を作る
			for(let row = 1; row < y[0].length; row++) {
				for(let col = 0; col < row; col++) {
					y[row][col] = y[col][row];
				}
			}
			return new Matrix(y);
		}
		// 2つのベクトルから共分散を求める
		else {
			if(!X.isVector() && !Y.isVector()) {
				throw "vector not specified";
			}
			if(X.length !== Y.length) {
				throw "X.length !== Y.length";
			}
			const x_mean = Statistics.mean(X).scalar;
			const y_mean = Statistics.mean(Y).scalar;
			const length = X.length;
			const correction = length === 1 ? 1 : cor;
			let sum = Complex.ZERO;
			for(let i = 0; i < length; i++) {
				sum = sum.add((X.getComplex(i).sub(x_mean)).dot(Y.getComplex(i).sub(y_mean)));
			}
			return new Matrix(sum.div(length - 1 + correction));
		}
	}

	/**
	 * The samples are standardize to a mean value of 0, standard deviation of 1.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static standardization(x, type) {
		const X = Matrix._toMatrix(x);
		const mean_zero = X.sub(Statistics.mean(X, type));
		const std_one = mean_zero.dotdiv(Statistics.std(mean_zero, type));
		return std_one;
	}

	/**
	 * Correlation matrix or Correlation coefficient.
	 * - Get a correlation matrix from 1 matrix.
	 * - Get a correlation coefficient from 2 vectors.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings|import("../Matrix.js").KMatrixInputData} [y_or_type]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static corrcoef(x, y_or_type, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		let Y = null;
		if(y_or_type !== undefined) {
			if(type !== undefined) {
				Y = Matrix._toMatrix(y_or_type);
			}
			else {
				if(!(typeof y_or_type === "object" && ("correction" in y_or_type))){
					Y = Matrix._toMatrix(y_or_type);
				}
			}
		}
		// 1つの行列から相関行列を作成する
		if(Y === null) {
			return Statistics.cov(Statistics.standardization(X, type), type);
		}
		// 2つのベクトルから相関係数を求める
		else {
			if(!X.isVector() && !Y.isVector()) {
				throw "vector not specified";
			}
			if(X.length !== Y.length) {
				throw "X.length[" + X.length + "] !== Y.length[" + Y.length + "]";
			}
			const covariance = Statistics.cov(X, Y, type);
			const Xsd = X.std(type);
			const Ysd = Y.std(type);
			return covariance.div(Xsd.mul(Ysd));
		}
	}

	/**
	 * Sort.
	 * - The "order" can choose "ascend"(default) and "descend".
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {string} [order]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static sort(x, order, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		const order_type = !order ? "ascend" : order;
		/**
		 * @type {function(Complex, Complex): number }
		 */
		let compare;
		if(order_type === "ascend") {
			compare = function(a, b){
				return a.compareTo(b);
			};
		}
		else {
			compare = function(a, b){
				return b.compareTo(a);
			};
		}
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			return data;
		};
		return X.eachVector(main, dim);
	}


}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KSignalSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 */

/**
 * Fast Fourier Transform (FFT) Class.
 * @ignore
 */
class FFT {

	/**
	 * Return the number with reversed bits.
	 * @param {number} x - Bit-reversed value. (32-bit integer)
	 * @returns {number} ビット反転した値
	 */
	static bit_reverse_32(x) {
		let y = x & 0xffffffff;
		// 1,2,4,8,16ビット単位で交換
		y = ((y & 0x55555555) << 1) | ((y >> 1) & 0x55555555);
		y = ((y & 0x33333333) << 2) | ((y >> 2) & 0x33333333);
		y = ((y & 0x0f0f0f0f) << 4) | ((y >> 4) & 0x0f0f0f0f);
		y = ((y & 0x00ff00ff) << 8) | ((y >> 8) & 0x00ff00ff);
		y = ((y & 0x0000ffff) << 16) | ((y >> 16) & 0x0000ffff);
		return y;
	}
	
	/**
	 * Create a bit reversal lookup table.
	 * @param {number} bit - ビット数
	 * @returns {Array<number>} ビット反転した値の配列
	 */
	static create_bit_reverse_table(bit) {
		const size = 1 << bit;
		const bitrv = [];
		for(let i = 0; i < size; i++) {
			bitrv[i] = FFT.bit_reverse_32(i) >>> (32 - bit);
		}
		return bitrv;
	}

	/**
	 * Create FFT.
	 * @param {number} size - Signal length.
	 */
	constructor(size) {
		
		/**
		 * Signal length.
		 */
		this.size = size;

		/**
		 * Inverse of signal length.
		 */
		this.inv_size = 1.0 / this.size;

		/**
		 * Number of bits when the signal length is expressed in binary number.
		 */
		this.bit_size = Math.round(Math.log(this.size)/Math.log(2));

		/**
		 * FFT algorithm available.
		 */
		this.is_fast = (1 << this.bit_size) === this.size;

		/**
		 * Bit reverse table for butterfly operation.
		 */
		this.bitrv = null;

		/**
		 * Real part table used for multiplication of complex numbers.
		 */
		this.fft_re = new Array(this.size);
		
		/**
		 * Imaginary table used for multiplication of complex numbers.
		 */
		this.fft_im = new Array(this.size);
		{
			const delta = - 2.0 * Math.PI / this.size;
			let err = 0.0;
			for(let n = 0, x = 0; n < this.size; n++) {
				this.fft_re[n] = Math.cos(x);
				this.fft_im[n] = Math.sin(x);
				// カハンの加算アルゴリズム
				const y = delta + err;
				const t = x + y;
				err = t - x - y;
				x = t;
			}
		}
		if(this.is_fast) {
			this.bitrv = FFT.create_bit_reverse_table(this.bit_size);
		}
	}

	/**
	 * Frees the memory reserved.
	 */
	delete() {
		delete this.size;
		delete this.inv_size;
		delete this.bit_size;
		delete this.is_fast;
		delete this.bitrv;
		delete this.fft_re;
		delete this.fft_im;
	}
	
	/**
	 * Discrete Fourier transform (DFT).
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @param {Array<number>} imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	fft(real, imag) {
		const f_re = new Array(this.size);
		const f_im = new Array(this.size);
		if(this.is_fast) {
			for(let i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				let center = 1;
				let blocklength = this.size / 2;
				let pointlength = 2;
				for(let delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(let blocks = 0; blocks < blocklength; blocks++) {
						let i = blocks * pointlength;
						for(let point = 0, n = 0; point < center; point++, i++, n += delta) {
							const re = f_re[i + center] * this.fft_re[n] - f_im[i + center] * this.fft_im[n];
							const im = f_im[i + center] * this.fft_re[n] + f_re[i + center] * this.fft_im[n];
							f_re[i + center] = f_re[i] - re;
							f_im[i + center] = f_im[i] - im;
							f_re[i] += re;
							f_im[i] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみのフーリエ変換
				for(let t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(let x = 0, n = 0; x < this.size; x++, n = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n];
						f_im[t] += real[x] * this.fft_im[n];
					}
				}
			}
			else {
				// 実数部分と複素数部分のフーリエ変換
				for(let t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(let x = 0, n = 0; x < this.size; x++, n = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n] - imag[x] * this.fft_im[n];
						f_im[t] += real[x] * this.fft_im[n] + imag[x] * this.fft_re[n];
					}
				}
			}
		}
		return {
			real : f_re,
			imag : f_im
		};
	}

	/**
	 * Inverse discrete Fourier transform (IDFT),
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @param {Array<number>} imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	ifft(real, imag) {
		const f_re = new Array(this.size);
		const f_im = new Array(this.size);
		if(this.is_fast) {
			for(let i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Inverse Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				let center = 1;
				let blocklength = this.size / 2;
				let pointlength = 2;
				let re, im;
				for(let delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(let blocks = 0; blocks < blocklength; blocks++) {
						let i = blocks * pointlength;
						for(let point = 0, n = 0; point < center; point++, i++, n += delta) {
							re = f_re[i + center] * this.fft_re[n] + f_im[i + center] * this.fft_im[n];
							im = f_im[i + center] * this.fft_re[n] - f_re[i + center] * this.fft_im[n];
							f_re[i + center] = f_re[i] - re;
							f_im[i + center] = f_im[i] - im;
							f_re[i] += re;
							f_im[i] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみの逆フーリエ変換
				for(let x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(let t = 0, n = 0; t < this.size; t++, n = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n];
						f_im[x] += - real[t] * this.fft_im[n];
					}
				}
			}
			else {
				// 実数部分と複素数部分の逆フーリエ変換
				for(let x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(let t = 0, n = 0; t < this.size; t++, n = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n] + imag[t] * this.fft_im[n];
						f_im[x] += - real[t] * this.fft_im[n] + imag[t] * this.fft_re[n];
					}
				}
			}
		}
		for(let i = 0; i < this.size; i++) {
			f_re[i] *= this.inv_size;
			f_im[i] *= this.inv_size;
		}
		return {
			real : f_re,
			imag : f_im
		};
	}
}

/**
 * Simple cache class.
 * Cache tables used in FFT.
 * @ignore
 */
class FFTCache {
	
	/**
	 * Create Cache.
	 * @param {*} object - Target class you want to build a cache.
	 * @param {number} cache_size - Maximum number of caches.
	 */
	constructor(object, cache_size) {

		/**
		 * Class for cache.
		 */
		this.object = object;

		/**
		 * Cache table.
		 * @type {Array<*>}
		 */
		this.table = [];

		/**
		 * Maximum number of caches.
		 */
		this.table_max = cache_size;

	}

	/**
	 * Create a class initialized with the specified data length.
	 * Use from cache if it exists in cache.
	 * @param {number} size - Data length.
	 * @returns {*}
	 */
	get(size) {
		for(let index = 0; index < this.table.length; index++) {
			if(this.table[index].size === size) {
				// 先頭にもってくる
				const object = this.table.splice(index, 1)[0];
				this.table.unshift(object);
				return object;
			}
		}
		const new_object = new this.object(size);
		if(this.table.length === this.table_max) {
			// 後ろのデータを消去
			const delete_object = this.table.pop();
			delete_object.delete();
		}
		// 前方に追加
		this.table.unshift(new_object);
		return new_object;
	}

}

/**
 * Cache for FFT.
 * @type {FFTCache}
 * @ignore
 */
const fft_cache = new FFTCache(FFT, 4);

/**
 * Discrete cosine transform (DCT) class.
 * @ignore
 */
class DCT {
	
	/**
	 * Create DCT.
	 * @param {number} size - Signal length.
	 */
	constructor(size) {

		/**
		 * Signal length.
		 */
		this.size = size;

		/**
		 * Twice the signal length.
		 * In the DCT conversion, an actual signal is zero-filled with a doubled signal length, and an FFT is performed on it.
		 */
		this.dct_size = size * 2;

		/**
		 * Calculation table used for DCT conversion.
		 */
		this.dct_re = new Array(this.size);

		/**
		 * Calculation table used for DCT conversion.
		 */
		this.dct_im = new Array(this.size);
		{
			const x_0 = 1.0 / Math.sqrt(this.size);
			const x_n = x_0 * Math.sqrt(2);
			for(let i = 0; i < this.size; i++) {
				const x = - Math.PI * i / this.dct_size;
				this.dct_re[i] = Math.cos(x) * (i === 0 ? x_0 : x_n);
				this.dct_im[i] = Math.sin(x) * (i === 0 ? x_0 : x_n);
			}
		}
	}
	
	/**
	 * Frees the memory reserved.
	 */
	delete() {
		delete this.size;
		delete this.dct_size;
		delete this.dct_re;
		delete this.dct_im;
	}

	/**
	 * Discrete cosine transform (DCT-II, DCT).
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @returns {Array<number>}
	 */
	dct(real) {
		const re = new Array(this.dct_size);
		const im = new Array(this.dct_size);
		for(let i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? real[i] : 0.0;
			im[i] = 0.0;
		}
		const fft = fft_cache.get(this.dct_size).fft(re, im);
		for(let i = 0; i < this.size; i++) {
			re[i] = fft.real[i] * this.dct_re[i] - fft.imag[i] * this.dct_im[i];
		}
		re.splice(this.size);
		return re;
	}

	/**
	 * Inverse discrete cosine transform (DCT-III, IDCT),
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @returns {Array<number>}
	 */
	idct(real) {
		const re = new Array(this.dct_size);
		const im = new Array(this.dct_size);
		const denormlize = this.size * 2.0;
		for(let i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? (denormlize * real[i] *    this.dct_re[i])  : 0.0;
			im[i] = i < this.size ? (denormlize * real[i] * (- this.dct_im[i])) : 0.0;
		}
		const ifft = fft_cache.get(this.dct_size).ifft(re, im);
		ifft.real.splice(this.size);
		return ifft.real;
	}
	
}

/**
 * Cache for discrete cosine transform.
 * @ignore
 */
const dct_cache = new FFTCache(DCT, 4);

/**
 * Collection of functions used inside Signal class.
 * @ignore
 */
class SignalTool {
	
	/**
	 * Returns true if the array contains 0.
	 * @param {Array<number>} x - 調べたい配列
	 * @returns {boolean}
	 */
	static isContainsZero(x) {
		for(let i = 0; i < x.length; i++) {
			if(x[i] !== 0) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Discrete Fourier transform (DFT).
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @param {Array<number>} imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	static fft(real, imag) {
		const obj = fft_cache.get(real.length);
		return obj.fft(real, imag);
	}

	/**
	 * Inverse discrete Fourier transform (IDFT),
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @param {Array<number>} imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	static ifft(real, imag) {
		const obj = fft_cache.get(real.length);
		return obj.ifft(real, imag);
	}

	/**
	 * Discrete cosine transform (DCT-II, DCT).
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @returns {Array<number>}
	 */
	static dct(real) {
		const obj = dct_cache.get(real.length);
		return obj.dct(real);
	}

	/**
	 * Inverse discrete cosine transform (DCT-III, IDCT),
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @returns {Array<number>}
	 */
	static idct(real) {
		const obj = dct_cache.get(real.length);
		return obj.idct(real);
	}

	/**
	 * Power spectral density.
	 * @param {Array<number>} real - Array of real parts of vector.
	 * @param {Array<number>} imag - Array of imaginary parts of vector.
	 * @returns {Array<number>}
	 */
	static powerfft(real, imag) {
		const size = real.length;
		const X = SignalTool.fft(real, imag);
		const power = new Array(size);
		for(let i = 0; i < size; i++) {
			power[i] = X.real[i] * X.real[i] + X.imag[i] * X.imag[i];
		}
		return power;
	}

	/**
	 * Convolution integral, Polynomial multiplication.
	 * @param {Array<number>} x1_real - Array of real parts of vector.
	 * @param {Array<number>} x1_imag - Array of imaginary parts of vector.
	 * @param {Array<number>} x2_real - Array of real parts of vector.
	 * @param {Array<number>} x2_imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	static conv(x1_real, x1_imag, x2_real, x2_imag) {
		let is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(let i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		const size = x1_real.length;
		const N2 = size * 2;
		const bit_size = Math.round(Math.log(size)/Math.log(2));
		const is_fast = (1 << bit_size) === size;
		if(is_fast) {
			// FFTを用いた手法へ切り替え
			// 周波数空間上では掛け算になる
			if(is_self) {
				const size = x1_real.length;
				const real = new Array(N2);
				const imag = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real[i] = i < size ? x1_real[i] : 0.0;
					imag[i] = i < size ? x1_imag[i] : 0.0;
				}
				const X = SignalTool.fft(real, imag);
				for(let i = 0; i < N2; i++) {
					real[i] = X.real[i] * X.real[i] - X.imag[i] * X.imag[i];
					imag[i] = X.real[i] * X.imag[i] + X.imag[i] * X.real[i];
				}
				const x = SignalTool.ifft(real, imag);
				x.real.splice(N2 - 1);
				x.imag.splice(N2 - 1);
				return x;
			}
			else if(x1_real.length === x2_real.length) {
				const size = x1_real.length;
				const real1 = new Array(N2);
				const imag1 = new Array(N2);
				const real2 = new Array(N2);
				const imag2 = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real1[i] = i < size ? x1_real[i] : 0.0;
					imag1[i] = i < size ? x1_imag[i] : 0.0;
					real2[i] = i < size ? x2_real[i] : 0.0;
					imag2[i] = i < size ? x2_imag[i] : 0.0;
				}
				const F = SignalTool.fft(real1, imag1);
				const G = SignalTool.fft(real2, imag2);
				const real = new Array(N2);
				const imag = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real[i] = F.real[i] * G.real[i] - F.imag[i] * G.imag[i];
					imag[i] = F.real[i] * G.imag[i] + F.imag[i] * G.real[i];
				}
				const fg = SignalTool.ifft(real, imag);
				fg.real.splice(N2 - 1);
				fg.imag.splice(N2 - 1);
				return fg;
			}
		}
		let is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		{
			// まじめに計算する
			const real = new Array(x1_real.length + x2_real.length - 1);
			const imag = new Array(x1_real.length + x2_real.length - 1);
			for(let i = 0; i < real.length; i++) {
				real[i] = 0;
				imag[i] = 0;
			}
			if(is_real_number) {
				// 実数部分のみの畳み込み積分
				// スライドさせていく
				// AAAA
				//  BBBB
				//   CCCC
				for(let y = 0; y < x2_real.length; y++) {
					for(let x = 0; x < x1_real.length; x++) {
						real[y + x] += x1_real[x] * x2_real[y];
					}
				}
			}
			else {
				// 実数部分と複素数部分の畳み込み積分
				for(let y = 0; y < x2_real.length; y++) {
					for(let x = 0; x < x1_real.length; x++) {
						real[y + x] += x1_real[x] * x2_real[y] - x1_imag[x] * x2_imag[y];
						imag[y + x] += x1_real[x] * x2_imag[y] + x1_imag[x] * x2_real[y];
					}
				}
			}
			return {
				real : real,
				imag : imag
			};
		}
	}

	/**
	 * ACF(Autocorrelation function), Cros-correlation function.
	 * @param {Array<number>} x1_real - Array of real parts of vector.
	 * @param {Array<number>} x1_imag - Array of imaginary parts of vector.
	 * @param {Array<number>} x2_real - Array of real parts of vector.
	 * @param {Array<number>} x2_imag - Array of imaginary parts of vector.
	 * @returns {Object<string, Array<number>>}
	 */
	static xcorr(x1_real, x1_imag, x2_real, x2_imag) {
		let is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(let i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		if(x1_real.length === x2_real.length) {
			const size = x1_real.length;
			const N2 = size * 2;
			const bit_size = Math.round(Math.log(size)/Math.log(2));
			const is_fast = (1 << bit_size) === size;
			if(is_fast) {
				let fg = null;
				if(is_self) {
					const real = new Array(N2);
					const imag = new Array(N2);
					for(let i = 0; i < N2; i++) {
						real[i] = i < size ? x1_real[i] : 0.0;
						imag[i] = i < size ? x1_imag[i] : 0.0;
					}
					// パワースペクトル密度は、自己相関のフーリエ変換のため、
					// パワースペクトル密度の逆変換で求められる。
					const power = SignalTool.powerfft(real, imag);
					fg = SignalTool.ifft(power, imag);
					// シフト
					real.pop();
					imag.pop();
					for(let i = 0, j = size + 1 ; i < real.length; i++, j++) {
						if(N2 <= j) {
							j = 0;
						}
						real[i] = fg.real[j];
						imag[i] = fg.imag[j];
					}
					return {
						real : real,
						imag : imag
					};
				}
				else {
					const f_real = new Array(N2);
					const f_imag = new Array(N2);
					const g_real = new Array(N2);
					const g_imag = new Array(N2);
					// gの順序を反転かつ共役複素数にする
					for(let i = 0; i < N2; i++) {
						f_real[i] = i < size ?   x1_real[i] : 0.0;
						f_imag[i] = i < size ?   x1_imag[i] : 0.0;
						g_real[i] = i < size ?   x2_real[size - i - 1] : 0.0;
						g_imag[i] = i < size ? - x2_imag[size - i - 1] : 0.0;
					}
					// 畳み込み掛け算
					const F = SignalTool.fft(f_real, f_imag);
					const G = SignalTool.fft(g_real, g_imag);
					const real = new Array(N2);
					const imag = new Array(N2);
					for(let i = 0; i < N2; i++) {
						real[i] = F.real[i] * G.real[i] - F.imag[i] * G.imag[i];
						imag[i] = F.real[i] * G.imag[i] + F.imag[i] * G.real[i];
					}
					fg = SignalTool.ifft(real, imag);
					fg.real.splice(N2 - 1);
					fg.imag.splice(N2 - 1);
					return fg;
				}
			}
		}
		let is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		if(is_self) {
			const size = x1_real.length;
			const N2 = size * 2;
			// 実数の自己相関関数
			if(is_real_number) {
				const fg = new Array(size);
				for(let m = 0; m < size; m++) {
					fg[m] = 0;
					const tmax = size - m;
					for(let t = 0; t < tmax; t++) {
						fg[m] += x1_real[t] * x2_real[t + m];
					}
				}
				// 半分の値は同一なので折り返して計算を省く
				const real = new Array(N2 - 1);
				const imag = new Array(N2 - 1);
				for(let i = 0, j = size - 1 ; i < size; i++, j--) {
					real[i] = fg[j];
					real[size + i - 1] = fg[i];
				}
				for(let i = 0; i < imag.length; i++) {
					imag[i] = 0.0;
				}
				return {
					real : real,
					imag : imag
				};
			}
		}
		// 2つの信号の長さが違う、又は2の累乗の長さではない別のデータの場合は通常計算
		{
			const g_real = new Array(x2_real.length);
			const g_imag = new Array(x2_real.length);
			// gの順序を反転かつ共役複素数にする
			for(let i = 0; i < x2_real.length; i++) {
				g_real[i] =   x2_real[x2_real.length - i - 1];
				g_imag[i] = - x2_imag[x2_real.length - i - 1];
			}
			const y = SignalTool.conv(x1_real, x1_imag, g_real, g_imag);
			if(x1_real.length === x2_real.length) {
				return y;
			}
			const delta = Math.abs(x1_real.length - x2_real.length);
			const zeros = new Array(delta);
			for(let i = 0; i < delta; i++) {
				zeros[i] = 0;
			}
			if(x1_real.length > x2_real.length) {
				// データの最初に「0」を加える
				return {
					real : zeros.concat(y.real),
					imag : zeros.concat(y.imag)
				};
			}
			else {
				// データの最後に「0」を加える
				return {
					real : y.real.concat(zeros),
					imag : y.imag.concat(zeros)
				};
			}
		}
	}

	/**
	 * Create window function for signal processing.
	 * The following window functions are available.
	 * - "rectangle": Rectangular window
	 * - "hann": Hann/Hanning window.
	 * - "hamming": Hamming window.
	 * - "blackman": Blackman window.
	 * - "blackmanharris": Blackman-Harris window.
	 * - "blackmannuttall": Blackman-Nuttall window.
	 * - "flattop": Flat top window.
	 * - "sin", Half cycle sine window.
	 * - "vorbis", Vorbis window.
	 * @param {string} name - Window function name.
	 * @param {number} size - Window length.
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Array<number>}
	 */
	static window(name, size, periodic) {
		const periodic_ = periodic !== undefined ? periodic : "symmetric";
		const name_ = name.toLocaleLowerCase();
		const size_ = size;
		const window = new Array(size_);
		
		/**
		 * @type {function(number): number }
		 */
		let normalzie;
		if((periodic_ === "symmetric") || (periodic_ === 0)) {
			normalzie = function(y) {
				return (y / (size_ - 1) * (Math.PI * 2.0));
			};
		}
		else if((periodic_ === "periodic") || (periodic_ !== 0)) {
			normalzie = function(y) {
				return (y / size_ * (Math.PI * 2.0));
			};
		}

		/**
		 * 
		 * @param {number} alpha0 
		 * @param {number} alpha1 
		 * @param {number} alpha2 
		 * @param {number} alpha3 
		 * @param {number} alpha4 
		 */
		const setBlackmanWindow = function( alpha0, alpha1, alpha2, alpha3, alpha4) {
			for(let i = 0; i < size_; i++) {
				window[i]  = alpha0;
				window[i] -= alpha1 * Math.cos(1.0 * normalzie(i));
				window[i] += alpha2 * Math.cos(2.0 * normalzie(i));
				window[i] -= alpha3 * Math.cos(3.0 * normalzie(i));
				window[i] += alpha4 * Math.cos(4.0 * normalzie(i));
			}
		};

		switch(name_) {
			// rect 矩形窓(rectangular window)
			case "rectangle":
				setBlackmanWindow(1.0, 0.0, 0.0, 0.0, 0.0);
				break;

			// hann ハン窓・ハニング窓(hann/hanning window)
			case "hann":
				setBlackmanWindow(0.5, 0.5, 0.0, 0.0, 0.0);
				break;

			// hamming ハミング窓(hamming window)
			case "hamming":
				setBlackmanWindow(0.54, 0.46, 0.0, 0.0, 0.0);
				break;

			// blackman ブラックマン窓(Blackman window)
			case "blackman":
				setBlackmanWindow(0.42, 0.50, 0.08, 0.0, 0.0);
				break;

			// blackmanharris Blackman-Harris window
			case "blackmanharris":
				setBlackmanWindow(0.35875, 0.48829, 0.14128, 0.01168, 0);
				break;

			// blackmannuttall Blackman-Nuttall window
			case "blackmannuttall":
				setBlackmanWindow(0.3635819, 0.4891775, 0.1365995, 0.0106411, 0.0);
				break;

			// flattop Flat top window
			case "flattop":
				setBlackmanWindow(1.0, 1.93, 1.29, 0.388, 0.032);
				break;

			// Half cycle sine window(MDCT窓)
			case "sin":
				for(let i = 0; i < size_; i++) {
					window[i]  = Math.sin(normalzie(i) * 0.5);
				}
				break;

			// Vorbis window(MDCT窓)
			case "vorbis":
				for(let i = 0; i < size_; i++) {
					const x = Math.sin(normalzie(i) * 0.5);
					window[i]  = Math.sin(Math.PI * 0.5 * x * x);
				}
				break;
		}

		return window;
	}

	/**
	 * Hann (Hanning) window.
	 * @param {number} size - Window length.
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Array<number>}
	 */
	static hann(size, periodic) {
		return SignalTool.window("hann", size, periodic);
	}
	
	/**
	 * Hamming window.
	 * @param {number} size - Window length.
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Array<number>}
	 */
	static hamming(size, periodic) {
		return SignalTool.window("hamming", size, periodic);
	}
	
}

/**
 * Signal processing class for `Matrix` class.
 * - These methods can be used in the `Matrix` method chain.
 * - This class cannot be called directly.
 */
class Signal {
	
	/**
	 * Discrete Fourier transform (DFT).
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix} fft(x)
	 */
	static fft(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.fft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex([result.real[i], result.imag[i]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * Inverse discrete Fourier transform (IDFT),
	 * @param {import("../Matrix.js").KMatrixInputData} X
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix} ifft(X)
	 */
	static ifft(X, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(X);
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.ifft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex([result.real[i], result.imag[i]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * Power spectral density.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix} abs(fft(x)).^2
	 */
	static powerfft(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.powerfft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * Discrete cosine transform (DCT-II, DCT).
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix} dct(x)
	 */
	static dct(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		if(M.isComplex()) {
			throw "dct don't support complex numbers.";
		}
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const real = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			const result = SignalTool.dct(real);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * Inverse discrete cosine transform (DCT-III, IDCT),
	 * @param {import("../Matrix.js").KMatrixInputData} X
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix} idct(x)
	 */
	static idct(X, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(X);
		if(M.isComplex()) {
			throw "idct don't support complex numbers.";
		}
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const real = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			const result = SignalTool.idct(real);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * Discrete two-dimensional Fourier transform (2D DFT).
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static fft2(x) {
		return Signal.fft(x, {dimension : "both"});
	}

	/**
	 * Inverse discrete two-dimensional Fourier transform (2D IDFT),
	 * @param {import("../Matrix.js").KMatrixInputData} X
	 * @returns {Matrix}
	 */
	static ifft2(X) {
		return Signal.ifft(X, {dimension : "both"});
	}

	/**
	 * Discrete two-dimensional cosine transform (2D DCT).
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static dct2(x) {
		return Signal.dct(x, {dimension : "both"});
	}

	/**
	 * Inverse discrete two-dimensional cosine transform (2D IDCT),
	 * @param {import("../Matrix.js").KMatrixInputData} X
	 * @returns {Matrix}
	 */
	static idct2(X) {
		return Signal.idct(X, {dimension : "both"});
	}

	/**
	 * Convolution integral, Polynomial multiplication.
	 * @param {import("../Matrix.js").KMatrixInputData} x1
	 * @param {import("../Matrix.js").KMatrixInputData} x2
	 * @returns {Matrix}
	 */
	static conv(x1, x2) {
		const M1 = Matrix._toMatrix(x1);
		const M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		const M1_real = new Array(M1.length);
		const M1_imag = new Array(M1.length);
		const M2_real = new Array(M2.length);
		const M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(let i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M1.row_length; i++) {
				M1_real[i] = M1.matrix_array[i][0].real;
				M1_imag[i] = M1.matrix_array[i][0].imag;
			}
		}
		if(M2.isRow()) {
			for(let i = 0; i < M2.column_length; i++) {
				M2_real[i] = M2.matrix_array[0][i].real;
				M2_imag[i] = M2.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M2.row_length; i++) {
				M2_real[i] = M2.matrix_array[i][0].real;
				M2_imag[i] = M2.matrix_array[i][0].imag;
			}
		}
		const y = SignalTool.conv(M1_real, M1_imag, M2_real, M2_imag);
		const m = new Array(y.real.length);
		for(let i = 0; i < y.real.length; i++) {
			m[i] = new Complex([y.real[i], y.imag[i]]);
		}
		const M = new Matrix([m]);
		return M2.isRow() ? M : M.transpose();
	}

	/**
	 * ACF(Autocorrelation function), cros-correlation function.
	 * - If the argument is omitted, it is calculated by the autocorrelation function.
	 * @param {import("../Matrix.js").KMatrixInputData} x1
	 * @param {import("../Matrix.js").KMatrixInputData} [x2] - Matrix to calculate the correlation.
	 * @returns {Matrix}
	 */
	static xcorr(x1, x2) {
		const M1 = Matrix._toMatrix(x1);
		if(!x2) {
			return M1.xcorr(M1);
		}
		const M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		const M1_real = new Array(M1.length);
		const M1_imag = new Array(M1.length);
		const M2_real = new Array(M2.length);
		const M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(let i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M1.row_length; i++) {
				M1_real[i] = M1.matrix_array[i][0].real;
				M1_imag[i] = M1.matrix_array[i][0].imag;
			}
		}
		if(M2.isRow()) {
			for(let i = 0; i < M2.column_length; i++) {
				M2_real[i] = M2.matrix_array[0][i].real;
				M2_imag[i] = M2.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M2.row_length; i++) {
				M2_real[i] = M2.matrix_array[i][0].real;
				M2_imag[i] = M2.matrix_array[i][0].imag;
			}
		}
		const y = SignalTool.xcorr(M1_real, M1_imag, M2_real, M2_imag);
		const m = new Array(y.real.length);
		for(let i = 0; i < y.real.length; i++) {
			m[i] = new Complex([y.real[i], y.imag[i]]);
		}
		const M = new Matrix([m]);
		return M1.isRow() ? M : M.transpose();
	}

	/**
	 * Create window function for signal processing.
	 * The following window functions are available.
	 * - "rectangle": Rectangular window
	 * - "hann": Hann/Hanning window.
	 * - "hamming": Hamming window.
	 * - "blackman": Blackman window.
	 * - "blackmanharris": Blackman-Harris window.
	 * - "blackmannuttall": Blackman-Nuttall window.
	 * - "flattop": Flat top window.
	 * - "sin", Half cycle sine window.
	 * - "vorbis", Vorbis window.
	 * @param {string} name - Window function name.
	 * @param {import("../Matrix.js").KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static window(name, size, periodic) {
		const size_ = Matrix._toInteger(size);
		const y = SignalTool.window(name, size_, periodic);
		return (new Matrix(y)).transpose();
	}

	/**
	 * Hann (Hanning) window.
	 * @param {import("../Matrix.js").KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hann(size, periodic) {
		return Signal.window("hann", size, periodic);
	}
	
	/**
	 * Hamming window.
	 * @param {import("../Matrix.js").KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hamming(size, periodic) {
		return Signal.window("hamming", size, periodic);
	}
	
	/**
	 * FFT shift.
	 * Circular shift beginning at the center of the signal.
	 * @param {import("../Matrix.js").KMatrixInputData} x 
	 * @param {KSignalSettings} [type]
	 * @returns {Matrix}
	 */
	static fftshift(x, type) {
		const X = Matrix._toMatrix(x);
		if(X.isVector()) {
			const shift_size = Math.floor(X.length / 2);
			return X.circshift(shift_size, type);
		}
		const shift_size_col = Math.floor(X.column_length / 2);
		const shift_size_row = Math.floor(X.row_length / 2);
		if(type !== undefined) {
			const target = type.dimension;
			if((target === "row") || (target === 1)) {
				return X.circshift(shift_size_col, type);
			}
			else if((target === "column") || (target === 2)) {
				return X.circshift(shift_size_row, type);
			}
		}
		const Y = X.circshift(shift_size_col, {dimension : "row"});
		return Y.circshift(shift_size_row, {dimension : "column"});
	}
	
}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Base class for numbers (immutable).
 */
class KonpeitoInteger {

	/**
	 * Create an number.
	 * @param {any} [number] - Numeric data. See how to use the function.
	 */
	constructor(number) {
	}

	/**
	 * Create an entity object of this class.
	 * @param {any} number 
	 * @returns {KonpeitoInteger}
	 */
	static create(number) {
		return null;
	}

	/**
	 * Create number.
	 * @param {any} number 
	 * @returns {KonpeitoInteger}
	 */
	static valueOf(number) {
		return null;
	}

	/**
	 * Convert to string.
	 * @returns {string}
	 */
	toString() {
		return "no";
	}

	/**
	 * Deep copy.
	 * @returns {KonpeitoInteger}
	 */
	clone() {
		return null;
	}

	/**
	 * Absolute value.
	 * @returns {KonpeitoInteger} abs(A)
	 */
	abs() {
		return null;
	}

	/**
	 * this * -1
	 * @returns {KonpeitoInteger} -A
	 */
	negate() {
		return null;
	}

	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {any}
	 */
	sign() {
		return null;
	}

	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A + B
	 */
	add(number) {
		return null;
	}

	/**
	 * Subtract.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A - B
	 */
	sub(number) {
		return null;
	}

	/**
	 * Multiply.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A * B
	 */
	mul(number) {
		return null;
	}

	/**
	 * Divide.
	 * @param {any} number
	 * @returns {KonpeitoInteger} fix(A / B)
	 */
	div(number) {
		return null;
	}

	/**
	 * Inverse number of this value.
	 * @returns {KonpeitoInteger} 1 / A
	 */
	inv() {
		return null;
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A % B
	 */
	rem(number) {
		return null;
	}

	/**
	 * Modulo, positive rem of division.
	 * - Result has same sign as the Divisor.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A mod B
	 */
	mod(number) {
		return null;
	}

	/**
	 * Modular exponentiation.
	 * @param {any} exponent
	 * @param {any} m 
	 * @returns {KonpeitoInteger} A^B mod m
	 */
	modPow(exponent, m) {
		return null;
	}

	/**
	 * Modular multiplicative inverse.
	 * @param {any} m
	 * @returns {KonpeitoInteger} A^(-1) mod m
	 */
	modInverse(m) {
		return null;
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * @returns {KonpeitoInteger} n!
	 */
	factorial() {
		return null;
	}

	/**
	 * Multiply a multiple of ten.
	 * @param {any} n
	 * @returns {KonpeitoInteger} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		return null;
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * @param {any} exponent
	 * @returns {KonpeitoInteger} pow(A, B)
	 */
	pow(exponent) {
		return null;
	}

	/**
	 * Square.
	 * @returns {KonpeitoInteger} pow(A, 2)
	 */
	square() {
		return null;
	}

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return null;
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		return null;
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		return null;
	}
	
	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return null;
	}

	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		return null;
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return null;
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return null;
	}
	
	/**
	 * return Matrix.
	 * @returns {Matrix}
	 */
	toMatrix() {
		return null;
	}

	// ----------------------
	// 比較
	// ----------------------
	
	/**
	 * Equals.
	 * @param {any} number
	 * @returns {boolean} A === B
	 */
	equals(number) {
		return null;
	}

	/**
	 * Compare values.
	 * @param {any} number 
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number) {
		return null;
	}

	// max, min, clip などは行列だと意味が違うため外す

	// ----------------------
	// 丸め
	// ----------------------
	
	/**
	 * Floor.
	 * @returns {KonpeitoInteger} floor(A)
	 */
	floor() {
		return null;
	}

	/**
	 * Ceil.
	 * @returns {KonpeitoInteger} ceil(A)
	 */
	ceil() {
		return null;
	}
	
	/**
	 * Rounding to the nearest integer.
	 * @returns {KonpeitoInteger} round(A)
	 */
	round() {
		return null;
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {KonpeitoInteger} fix(A), trunc(A)
	 */
	fix() {
		return null;
	}

	/**
	 * Fraction.
	 * @returns {KonpeitoInteger} fract(A)
	 */
	fract() {
		return BigInteger.ZERO;
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} gcd(x, y)
	 */
	gcd(number) {
		return null;
	}

	/**
	 * Extended Euclidean algorithm.
	 * @param {any} number 
	 * @returns {Array<KonpeitoInteger>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		return null;
	}

	/**
	 * Least common multiple.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} lcm(x, y)
	 */
	lcm(number) {
		return null;
	}

	// ----------------------
	// 素数系
	// ----------------------
	
	/**
	 * Return true if the value is prime number.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		return null;
	}

	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * @param {any} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		return null;
	}

	/**
	 * Next prime.
	 * @param {any} [certainty=100] - Repeat count (prime precision).
	 * @param {any} [search_max=100000] - Search range of next prime.
	 * @returns {KonpeitoInteger}
	 */
	nextProbablePrime(certainty, search_max) {
		return null;
	}

	// ----------------------
	// シフト演算系
	// ----------------------
	
	/**
	 * this << n
	 * @param {any} n
	 * @returns {KonpeitoInteger} A << n
	 */
	shift(n) {
		return null;
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A & B
	 */
	and(number) {
		return null;
	}

	/**
	 * Logical OR.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A | B
	 */
	or(number) {
		return null;
	}

	/**
	 * Logical Exclusive-OR.
	 * @param {any} number 
	 * @returns {KonpeitoInteger} A ^ B
	 */
	xor(number) {
		return null;
	}

	/**
	 * Logical Not. (mutable)
	 * @returns {KonpeitoInteger} !A
	 */
	not() {
		return null;
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * this === 0
	 * @returns {boolean}
	 */
	isZero() {
		return null;
	}
	
	/**
	 * this === 1
	 * @returns {boolean}
	 */
	isOne() {
		return null;
	}
	
	/**
	 * this > 0
	 * @returns {boolean}
	 */
	isPositive() {
		return null;
	}

	/**
	 * this < 0
	 * @returns {boolean}
	 */
	isNegative() {
		return null;
	}

	/**
	 * this >= 0
	 * @returns {boolean}
	 */
	isNotNegative() {
		return null;
	}
	
	/**
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return null;
	}
	
	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return null;
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return null;
	}

	/**
	 * this === Infinity or -Infinity
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return null;
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return null;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * -1
	 * @returns {KonpeitoInteger} -1
	 */
	static get MINUS_ONE() {
		return null;
	}
	
	/**
	 * 0
	 * @returns {KonpeitoInteger} 0
	 */
	static get ZERO() {
		return null;
	}

	/**
	 * 1
	 * @returns {KonpeitoInteger} 1
	 */
	static get ONE() {
		return null;
	}
	
	/**
	 * 2
	 * @returns {KonpeitoInteger} 2
	 */
	static get TWO() {
		return null;
	}
	
	/**
	 * 10
	 * @returns {KonpeitoInteger} 10
	 */
	static get TEN() {
		return null;
	}

	/**
	 * Positive infinity.
	 * @returns {KonpeitoInteger} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return null;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {KonpeitoInteger} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return null;
	}

	/**
	 * Not a Number.
	 * @returns {KonpeitoInteger} NaN
	 */
	static get NaN() {
		return null;
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {any}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {any} number
	 * @returns {KonpeitoInteger} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {any} number
	 * @returns {KonpeitoInteger} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Base class for numbers (immutable).
 */
class KonpeitoFloat extends KonpeitoInteger {

	/**
	 * Create an number.
	 * @param {any} [number] - Numeric data. See how to use the function.
	 */
	constructor(number) {
		super();
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Square root.
	 * @returns {KonpeitoFloat} sqrt(A)
	 */
	sqrt() {
		return null;
	}

	/**
	 * Cube root.
	 * @returns {KonpeitoFloat} cbrt(A)
	 */
	cbrt() {
		return null;
	}

	/**
	 * Reciprocal square root.
	 * @returns {KonpeitoFloat} rsqrt(A)
	 */
	rsqrt() {
		return null;
	}

	/**
	 * Logarithmic function.
	 * @returns {KonpeitoFloat} log(A)
	 */
	log() {
		return null;
	}

	/**
	 * Exponential function.
	 * @returns {KonpeitoFloat} exp(A)
	 */
	exp() {
		return null;
	}

	/**
	 * e^x - 1
	 * @returns {KonpeitoFloat} expm1(A)
	 */
	expm1() {
		return null;
	}

	/**
	 * ln(1 + x)
	 * @returns {KonpeitoFloat} log1p(A)
	 */
	log1p() {
		return null;
	}
	
	/**
	 * log_2(x)
	 * @returns {KonpeitoFloat} log2(A)
	 */
	log2() {
		return null;
	}

	/**
	 * log_10(x)
	 * @returns {KonpeitoFloat} log10(A)
	 */
	log10() {
		return null;
	}

	// ----------------------
	// 三角関数
	// ----------------------
	
	/**
	 * Sine function.
	 * @returns {KonpeitoFloat} sin(A)
	 */
	sin() {
		return null;
	}

	/**
	 * Cosine function.
	 * @returns {KonpeitoFloat} cos(A)
	 */
	cos() {
		return null;
	}

	/**
	 * Tangent function.
	 * @returns {KonpeitoFloat} tan(A)
	 */
	tan() {
		return null;
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {KonpeitoFloat} atan(A)
	 */
	atan() {
		return null;
	}

	/**
	 * Atan (arc tangent) function.
	 * Return the values of [-PI, PI] .
	 * Supports only real numbers.
	 * @param {any} [number] - X
	 * @returns {KonpeitoFloat} atan2(Y, X)
	 */
	atan2(number) {
		return null;
	}
	
	// ----------------------
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {KonpeitoFloat} asin(A)
	 */
	asin() {
		return null;
	}

	/**
	 * Arc cosine function.
	 * @returns {KonpeitoFloat} acos(A)
	 */
	acos() {
		return null;
	}
	

	/**
	 * Hyperbolic sine function.
	 * @returns {KonpeitoFloat} sinh(A)
	 */
	sinh() {
		return null;
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {KonpeitoFloat} asinh(A)
	 */
	asinh() {
		return null;
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {KonpeitoFloat} cosh(A)
	 */
	cosh() {
		return null;
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {KonpeitoFloat} acosh(A)
	 */
	acosh() {
		return null;
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {KonpeitoFloat} tanh(A)
	 */
	tanh() {
		return null;
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {KonpeitoFloat} atanh(A)
	 */
	atanh() {
		return null;
	}

	/**
	 * Secant function.
	 * @returns {KonpeitoFloat} sec(A)
	 */
	sec() {
		return null;
	}

	/**
	 * Reverse secant function.
	 * @returns {KonpeitoFloat} asec(A)
	 */
	asec() {
		return null;
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {KonpeitoFloat} sech(A)
	 */
	sech() {
		return null;
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {KonpeitoFloat} asech(A)
	 */
	asech() {
		return null;
	}

	/**
	 * Cotangent function.
	 * @returns {KonpeitoFloat} cot(A)
	 */
	cot() {
		return null;
	}

	/**
	 * Inverse cotangent function.
	 * @returns {KonpeitoFloat} acot(A)
	 */
	acot() {
		return null;
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {KonpeitoFloat} coth(A)
	 */
	coth() {
		return null;
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {KonpeitoFloat} acoth(A)
	 */
	acoth() {
		return null;
	}

	/**
	 * Cosecant function.
	 * @returns {KonpeitoFloat} csc(A)
	 */
	csc() {
		return null;
	}

	/**
	 * Inverse cosecant function.
	 * @returns {KonpeitoFloat} acsc(A)
	 */
	acsc() {
		return null;
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {KonpeitoFloat} csch(A)
	 */
	csch() {
		return null;
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {KonpeitoFloat} acsch(A)
	 */
	acsch() {
		return null;
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {KonpeitoFloat} sinc(A)
	 */
	sinc() {
		return null;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * PI.
	 * @returns {KonpeitoFloat} 3.14...
	 */
	static get PI() {
		return null;
	}

	/**
	 * 0.25 * PI.
	 * @returns {KonpeitoFloat} 0.78...
	 */
	static get QUARTER_PI() {
		return null;
	}

	/**
	 * 0.5 * PI.
	 * @returns {KonpeitoFloat} 1.57...
	 */
	static get HALF_PI() {
		return null;
	}

	/**
	 * 2 * PI.
	 * @returns {KonpeitoFloat} 6.28...
	 */
	static get TWO_PI() {
		return null;
	}

	/**
	 * E, Napier's constant.
	 * @returns {KonpeitoFloat} 2.71...
	 */
	static get E() {
		return null;
	}

	/**
	 * log_e(2)
	 * @returns {KonpeitoFloat} ln(2)
	 */
	static get LN2() {
		return null;
	}

	/**
	 * log_e(10)
	 * @returns {KonpeitoFloat} ln(10)
	 */
	static get LN10() {
		return null;
	}

	/**
	 * log_2(e)
	 * @returns {KonpeitoFloat} log_2(e)
	 */
	static get LOG2E() {
		return null;
	}
	
	/**
	 * log_10(e)
	 * @returns {KonpeitoFloat} log_10(e)
	 */
	static get LOG10E() {
		return null;
	}
	
	/**
	 * sqrt(2)
	 * @returns {KonpeitoFloat} sqrt(2)
	 */
	static get SQRT2() {
		return null;
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {KonpeitoFloat} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return null;
	}
	
	/**
	 * 0.5
	 * @returns {KonpeitoFloat} 0.5
	 */
	static get HALF() {
		return null;
	}



}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Matrix type argument.
 * - Matrix
 * - Complex
 * - number
 * - string
 * - Array<string|number|Complex|Matrix>
 * - Array<Array<string|number|Complex|Matrix>>
 * - {doubleValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
 * @typedef {Matrix|Complex|number|string|Array<string|number|Complex|Matrix>|Array<Array<string|number|Complex|Matrix>>|{doubleValue:number}|{toString:function}} KMatrixInputData
 */

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KMatrixSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */

/**
 * Collection of functions used in Matrix.
 * @ignore
 */
class MatrixTool {

	/**
	 * Create actual values from data specifying matrix position.
	 * @param {any} data - A value indicating the position in a matrix.
	 * @param {number} max - Length to initialize. (Used when ":" is specified at matrix creation.)
	 * @param {number} geta - Offset at initialization. (Used when ":" is specified at matrix creation.)
	 * @returns {Array<number>}
	 */
	static toPositionArrayFromObject(data, max, geta) {
		if(typeof data === "string") {
			const array_or_string = MatrixTool.toArrayFromString(data);
			if(array_or_string === ":") {
				// : が指定された場合
				const y = new Array(max);
				for(let i = 0; i < max; i++) {
					y[i] =  i + geta;
				}
				return y;
			}
			else if(array_or_string instanceof Array) {
				// 複素数の配列から中身を取り出す
				const y = array_or_string;
				const num_y = new Array(y.length);
				for(let i = 0; i < y.length; i++) {
					num_y[i] = Math.trunc(y[i].real);
				}
				return num_y;
			}
			else {
				throw "toArrayFromString[" + data + "][" + array_or_string + "]";
			}
		}
		let t_data = data;
		if(!(t_data instanceof Matrix) && !(t_data instanceof Complex) && !((typeof t_data === "number"))) {
			// @ts-ignore
			t_data = Matrix._toMatrix(t_data);
		}
		if(t_data instanceof Matrix) {
			if(!t_data.isVector()) {
				throw "getMatrix argument " + t_data;
			}
			const len = t_data.length;
			const y = new Array(t_data.length);
			if(t_data.isRow()) {
				for(let i = 0; i < len; i++) {
					// @ts-ignore
					y[i] = Math.trunc(t_data.matrix_array[0][i].real);
				}
			}
			else if(t_data.isColumn()) {
				for(let i = 0; i < len; i++) {
					// @ts-ignore
					y[i] = Math.trunc(t_data.matrix_array[i][0].real);
				}
			}
			return y;
		}
		// @ts-ignore
		return [ Matrix._toInteger(t_data) ];
	}

	/**
	 * A match function that can also extract strings excluding matched strings.
	 * @param {string} text - Search target.
	 * @param {RegExp} regexp - Regular expression.
	 * @returns {Array<Object<boolean, string>>}
	 */
	static match2(text, regexp) {
		// 対象ではないregexpの情報以外も抽出match
		// つまり "1a2b" で \d を抽出すると、次のように抽出される
		// [false "1"]
		// [true "a"]
		// [false "2"]
		// [true "b"]
		// 0 ... 一致したかどうか
		// 1 ... 一致した文字列、あるいは一致していない文字列
		const output = [];
		let search_target = text;
		for(let x = 0; x < 1000; x++) {
			const match = search_target.match(regexp);
			if(match === null) {
				if(search_target.length) {
					output.push([ false, search_target ]);
				}
				break;
			}
			if(match.index > 0) {
				output.push([ false, search_target.substr(0, match.index) ]);
			}
			output.push([ true, match[0] ]);
			search_target = search_target.substr(match.index + match[0].length);
		}
		return output;
	}
	
	/**
	 * Removed front and back brackets when enclosed by brackets.
	 * - Return null if the string has no brackets.
	 * @param {string} text - String to be processed.
	 * @returns {{text : string, is_transpose : boolean}|null} String after brackets removal or null.
	 */
	static trimBracket(text) {
		let input_text = text;
		let is_transpose = false;
		// 後ろに'が付いているかどうか検知(転置行列用)
		if(/'$/.test(input_text)) {
			const dash_text = input_text.match(/(\s*')*$/g)[0];
			const dash_count = (dash_text.split("'").length - 1);
			is_transpose = (dash_count % 2) === 1;
			input_text = input_text.substring(0, input_text.length - dash_text.length);
		}
		// 前後に[]があるか確認
		if( !(/^\[/).test(input_text) || !(/\]$/).test(input_text)) {
			return null;
		}
		// 前後の[]を除去
		return {
			text : input_text.substring(1, input_text.length - 1),
			is_transpose : is_transpose
		};
	}

	/**
	 * Create Matrix type data from string data defined in JSON.
	 * - For example, "[xx,xx,xx], [xx,xx,xx]"
	 * @param {string} text - String to be processed.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringForArrayJSON(text) {
		const matrix_array = [];
		// さらにブランケット内を抽出
		let rows = text.match(/\[[^\]]+\]/g);
		if(rows === null) {
			// ブランケットがない場合は、1行行列である
			rows = [text];
		}
		// 各ブランケット内を列ごとに調査
		for(let row_count = 0; row_count < rows.length; row_count++) {
			const row = rows[row_count];
			const column_array = row.substring(1, row.length - 1).split(",");
			const rows_array = [];
			for(let col_count = 0; col_count < column_array.length; col_count++) {
				const column = column_array[col_count];
				rows_array[col_count] = new Complex(column);
			}
			matrix_array[row_count] = rows_array;
		}
		return matrix_array;
	}

	/**
	 * Create a numeric array from initial values, difference values, and final values.
	 * @param {Complex} from - Start value.
	 * @param {Complex} delta - Delta.
	 * @param {Complex} to - End value.
	 * @param {boolean} [is_include_last_number=true] - Whether to include the last value.
	 * @returns {Array<Complex>}
	 */
	static InterpolationCalculation(from, delta, to, is_include_last_number) {
		const FromIsGreaterThanTo = from.compareTo(to);
		const is_include_last_number_ = is_include_last_number !== undefined ? is_include_last_number : true;
		if(FromIsGreaterThanTo === 0) {
			return [from];
		}
		if(delta.isZero()) {
			throw "IllegalArgumentException";
		}
		// delta が負のため、どれだけたしても to にならない。
		if(delta.isNegative() && (FromIsGreaterThanTo === -1)) {
			throw "IllegalArgumentException";
		}
		// FromIsGreaterThanTo
		// +1 from の方が大きい。下に減算タイプ
		// -1 to の方が大きい。上に加算タイプ
		const rows_array = [];
		let num = from;
		rows_array[0] = num;
		for(let i = 1; i < 0x10000; i++) {
			num = num.add(delta);
			if(is_include_last_number_) {
				if(to.compareTo(num) === FromIsGreaterThanTo) {
					break;
				}
			}
			else {
				if((to.compareTo(num) * FromIsGreaterThanTo) >= 0) {
					break;
				}
			}
			rows_array[i] = num;
		}
		return rows_array;
	}

	/**
	 * Create an array of numbers from data separated by match2.
	 * @param {Array<Object<boolean, string>>} match2_string - Data separated by "toArrayFromString".
	 * @returns {Array<Complex>}
	 */
	static toArrayFromMatch2String(match2_string) {
		const xs = match2_string;
		const rows_array = [];
		for(let i = 0; i < xs.length; i++) {
			const xx = xs[i];
			if(!xx[0]) {
				// 一致していないデータであれば次へ
				continue;
			}
			// 「:記法」 1:3 なら 1,2,3。 1:2:9 なら 1:3:5:7:9
			if((i < xs.length - 2) && !xs[i + 1][0] && /:/.test(xs[i + 1][1])) {
				let from, delta, to;
				if((i < xs.length - 4) && !xs[i + 3][0] && /:/.test(xs[i + 3][1])) {
					from = new Complex(xx[1]);
					delta = new Complex(xs[i + 2][1]);
					to = new Complex(xs[i + 4][1]);
					i += 4;
				}
				else {
					from = new Complex(xx[1]);
					delta = Complex.ONE;
					to = new Complex(xs[i + 2][1]);
					i += 2;
				}
				const ip_array = MatrixTool.InterpolationCalculation(from, delta, to, true);
				for(let j = 0; j < ip_array.length; j++) {
					rows_array.push(ip_array[j]);
				}
			}
			else {
				rows_array.push(new Complex(xx[1]));
			}
		}

		return rows_array;
	}

	/**
	 * Convert string to row part of matrix type matrix data.
	 * Estimate the matrix by extracting parts like numbers.
	 * @param {string} row_text - A string describing one row of the matrix.
	 * @returns {Array<Complex>|string}
	 */
	static toArrayFromString(row_text) {
		// 「:」のみ記載されていないかの確認
		if(row_text.trim() === ":") {
			return ":";
		}
		const str = row_text.toLowerCase().replace(/infinity|inf/g, "1e100000");
		// 左が実数（強制）で右が複素数（任意）タイプ
		const reg1 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))( *[+-] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij])?/;
		// 左が複素数（強制）で右が実数（任意）タイプ
		const reg2 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]( *[+] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan)))?/;
		// reg2優先で検索
		const reg3 = new RegExp("(" + reg2.source + ")|(" + reg1.source + ")", "i");
		// 問題として 1 - -jが通る
		return MatrixTool.toArrayFromMatch2String(MatrixTool.match2(str, reg3));
	}

	/**
	 * Create Matrix type data from string data defined by character string with space separation etc.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringForArraySPACE(text) {
		// 行ごとを抽出して
		const rows = text.split(";");
		const matrix_array = new Array(rows.length);
		for(let row_count = 0; row_count < rows.length; row_count++) {
			// 各行の文字を解析
			matrix_array[row_count] = MatrixTool.toArrayFromString(rows[row_count]);
		}
		return matrix_array;
	}

	/**
	 * Create Matrix type data composed of string data for matrix.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringInBracket(text) {
		// ブラケットの中にブラケットがある＝JSON形式
		if(/[[\]]/.test(text)) {
			return MatrixTool.toMatrixArrayFromStringForArrayJSON(text);
		}
		// それ以外(MATLAB, Octave, Scilab)
		else {
			return MatrixTool.toMatrixArrayFromStringForArraySPACE(text);
		}
	}

	/**
	 * Create Matrix type data from string data.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromString(text) {
		// 前後のスペースを除去
		const trimtext = text.replace(/^\s*|\s*$/g, "");
		// ブランケットを外す
		const withoutBracket = MatrixTool.trimBracket(trimtext);
		if(withoutBracket) {
			// 配列用の初期化
			let array_data = MatrixTool.toMatrixArrayFromStringInBracket(withoutBracket.text);
			// 転置が必要なら転置させる
			if(withoutBracket.is_transpose) {
				// @ts-ignore
				array_data = (new Matrix(array_data)).T().matrix_array;
			}
			return array_data;
		}
		else {
			// スカラー用の初期化
			return [[new Complex(text)]];
		}
	}

	/**
	 * Returns true if Matrix type internal data is correct as matrix data.
	 * @param {Array<Array<Complex>>} m_array
	 * @returns {boolean} 
	 */
	static isCorrectMatrixArray(m_array) {
		if(m_array.length === 0) {
			return false;
		}
		const num = m_array[0].length;
		if(num === 0) {
			return false;
		}
		for(let i = 1; i < m_array.length; i++) {
			if(m_array[i].length !== num) {
				return false;
			}
		}
		return true;
	}
}

/**
 * Complex matrix class. (immutable)
 */
class Matrix extends KonpeitoFloat {
	
	/**
	 * Create a complex matrix.
	 * Initialization can be performed as follows.
	 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
	 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
	 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
	 * @param {KMatrixInputData} number - Complex matrix. See how to use the function.
	 */
	constructor(number) {
		super();

		let matrix_array = null;
		let is_check_string = false;
		if(arguments.length === 1) {
			const obj = number;
			// 行列型なら中身をディープコピーする
			if(obj instanceof Matrix) {
				matrix_array = new Array(obj.row_length);
				for(let i = 0; i < obj.row_length; i++) {
					matrix_array[i] = new Array(obj.column_length);
					for(let j = 0; j < obj.column_length; j++) {
						matrix_array[i][j] = obj.matrix_array[i][j];
					}
				}
			}
			// 複素数型なら1要素の行列
			else if(obj instanceof Complex) {
				matrix_array = [[obj]];
			}
			// 行列の場合は中身を解析していく
			else if(obj instanceof Array) {
				matrix_array = [];
				for(let row_count = 0; row_count < obj.length; row_count++) {
					// 毎行ごと調査
					const row = obj[row_count];
					// 各行の要素が配列の場合は、配列内配列のため再度for文で調べていく
					if(row instanceof Array) {
						const rows_array = new Array(row.length);
						// 1行を調査する
						for(let col_count = 0; col_count < row.length; col_count++) {
							const column = row[col_count];
							// 1要素が複素数ならそのまま代入
							if(column instanceof Complex) {
								rows_array[col_count] = column;
							}
							// 1要素が行列なら、中身を抽出して代入
							else if(column instanceof Matrix) {
								if(!column.isScalar()) {
									throw "Matrix in matrix";
								}
								rows_array[col_count] = column.scalar;
							}
							// それ以外の場合は、複素数クラスのコンストラクタに判断させる
							else {
								rows_array[col_count] = new Complex(column);
							}
						}
						matrix_array[row_count] = rows_array;
					}
					// 1つの値のみ宣言の場合は、中の配列を行ベクトルとして定義する
					else {
						// 行ベクトルの初期化
						if(row_count === 0) {
							matrix_array[0] = new Array(obj.length);
						}
						// 1要素が複素数ならそのまま代入
						if(row instanceof Complex) {
							matrix_array[0][row_count] = row;
						}
						// 1要素が行列なら、中身を抽出して代入
						else if(row instanceof Matrix) {
							if(!row.isScalar()) {
								throw "Matrix in matrix";
							}
							matrix_array[0][row_count] = row.scalar;
						}
						// それ以外の場合は、複素数クラスのコンストラクタに判断させる
						else {
							matrix_array[0][row_count] = new Complex(row);
						}
					}
				}
			}
			// 文字列の場合は、文字列解析を行う
			else if(typeof obj === "string") {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(obj);
			}
			// 数値化できる場合
			else if((obj instanceof Object) && ("doubleValue" in obj)) {
				matrix_array = [[new Complex(obj.doubleValue)]];
			}
			// 文字列変換できる場合は返還後に、文字列解析を行う
			else if(obj instanceof Object) {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(obj.toString());
			}
			// 単純なビルトインの数値など
			else {
				matrix_array = [[new Complex(obj)]];
			}
		}
		else {
			throw "Matrix : Many arguments [" + arguments.length + "]";
		}
		if(is_check_string) {
			// 文字列データの解析の場合、":" データが紛れていないかを確認する。
			// 紛れていたらその行は削除する。
			for(let row = 0; row < matrix_array.length; row++) {
				if(matrix_array[row] === ":") {
					matrix_array.splice(row--, 1);
				}
			}
		}
		if(!MatrixTool.isCorrectMatrixArray(matrix_array)) {
			console.log(matrix_array);
			throw "new Matrix IllegalArgumentException";
		}
		
		/**
		 * An array of elements in the matrix.
		 * @private
		 * @type {Array<Array<Complex>>}
		 */
		this.matrix_array = matrix_array;

		/**
		 * The number of rows in a matrix.
		 * @private
		 * @type {number}
		 */
		this.row_length = this.matrix_array.length;
		
		/**
		 * The number of columns in a matrix.
		 * @private
		 * @type {number}
		 */
		this.column_length = this.matrix_array[0].length;

		/**
		 * A cache that records data converted to a string.
		 * @private
		 * @type {string}
		 */
		this.string_cash = null;
	}

	/**
	 * Create an entity object of this class.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	static create(number) {
		if((arguments.length === 1) && (number instanceof Matrix)) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	}
	
	/**
	 * Convert number to Matrix type.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	static valueOf(number) {
		return Matrix.create(number);
	}

	/**
	 * Convert to Matrix.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix}
	 * @private
	 */
	static _toMatrix(number) {
		if(number instanceof Matrix) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	}

	/**
	 * Convert to Complex.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KMatrixInputData} number 
	 * @returns {Complex}
	 * @private
	 */
	static _toComplex(number) {
		if(number instanceof Complex) {
			return number;
		}
		const M = Matrix._toMatrix(number);
		if(M.isScalar()) {
			return M.scalar;
		}
		else {
			throw "not scalar. [" + number + "]";
		}
	}

	/**
	 * Convert to real number.
	 * @param {KMatrixInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toDouble(number) {
		if(typeof number === "number") {
			return number;
		}
		const x = Matrix._toComplex(number);
		if(x.isReal()) {
			return x.real;
		}
		else {
			throw "not support complex numbers.";
		}
	}

	/**
	 * Convert to integer.
	 * @param {KMatrixInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		return Math.trunc(Matrix._toDouble(number));
	}

	/**
	 * Delete cache.
	 */
	_clearCash() {
		if(this.string_cash) {
			delete this.string_cash;
		}
	}

	/**
	 * Deep copy.
	 * @returns {Matrix}
	 */
	clone() {
		return new Matrix(this.matrix_array);
	}

	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		if(this.string_cash) {
			return this.string_cash;
		}
		const exp_turn_point = 9;
		const exp_turn_num = Math.pow(10, exp_turn_point);
		const exp_point = 4;
		let isDrawImag = false;
		let isDrawExp = false;
		let draw_decimal_position = 0;

		// 行列を確認して表示するための表示方法の確認する
		this._each(
			function(num, row, col) {
				if(!num.isReal()) {
					isDrawImag = true;
				}
				if(Number.isFinite(num.real)) {
					if(Math.abs(num.real) >= exp_turn_num) {
						isDrawExp = true;
					}
				}
				if(Number.isFinite(num.imag)) {
					if(Math.abs(num.imag) >= exp_turn_num) {
						isDrawExp = true;
					}
				}
				draw_decimal_position = Math.max(draw_decimal_position, num.getDecimalPosition());
			}
		);

		if(draw_decimal_position > 0) {
			draw_decimal_position = exp_point;
		}

		// 文字列データを作成とともに、最大の長さを記録する
		let str_max = 0;

		/**
		 * @type {Array<{re_sign : string, re_str : string, im_sign : string, im_str : string}>}
		 */
		const draw_buff = [];

		// 数値データを文字列にする関数（eの桁がある場合は中身は3桁にする）
		/**
		 * @type {function(number): string }
		 */
		const toStrFromFloat = function(number) {
			const str = !isDrawExp ? number.toFixed(draw_decimal_position) : number.toExponential(exp_point);
			if(/inf/i.test(str)) {
				if(number === Number.POSITIVE_INFINITY) {
					return "Inf";
				}
				else {
					return "-Inf";
				}
			}
			else if(/nan/i.test(str)) {
				return "NaN";
			}
			else if(!isDrawExp) {
				return str;
			}
			const split = str.split("e");
			let exp_text = split[1];
			if(exp_text.length === 2) {
				exp_text = exp_text.substr(0, 1) + "00" + exp_text.substr(1);
			}
			else if(exp_text.length === 3) {
				exp_text = exp_text.substr(0, 1) + "0" + exp_text.substr(1);
			}
			return split[0] + "e" + exp_text;
		};
		this._each(
			function(num) {
				const data = {};
				let real = num.real;
				data.re_sign = real < 0 ? "-" : " ";
				real = Math.abs(real);
				data.re_str = toStrFromFloat(real);
				str_max = Math.max(str_max, data.re_str.length + 1);
				if(isDrawImag) {
					let imag = num.imag;
					data.im_sign = imag < 0 ? "-" : "+";
					imag = Math.abs(imag);
					data.im_str = toStrFromFloat(imag);
					str_max = Math.max(str_max, data.im_str.length + 1);
				}
				draw_buff.push(data);
			}
		);

		// 右寄せ用関数
		/**
		 * @type {function(string, number): string }
		 */
		const right = function(text, length) {
			const space = "                                        ";
			return space.substr(0, length - text.length) + text;
		};

		// 出力用文字列を作成する
		/**
		 * @type {Array<string>}
		 */
		const output = [];
		const that = this;
		this._each(
			function(num, row, col) {
				const data = draw_buff.shift();
				let text = right(data.re_sign + data.re_str, str_max);
				if(isDrawImag) {
					text += " " + data.im_sign + right(data.im_str, str_max) + "i";
				}
				output.push(text);
				output.push((col < that.column_length - 1) ? " " : "\n");
			}
		);

		this.string_cash = output.join("");

		return this.string_cash;
	}

	/**
	 * Convert to string in one line.
	 * @returns {string} 
	 */
	toOneLineString() {
		if(this.isScalar()) {
			return this.scalar.toString();
		}
		let output = "[ ";
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				output += this.matrix_array[row][col].toString();
				if(col < this.column_length - 1) {
					output += ", ";
				}
				else {
					if(row < this.row_length - 1) {
						output += "; ";
					}
				}
			}
		}
		output += " ]";
		return output;
	}

	/**
	 * Equals.
	 * @param {KMatrixInputData} number
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			return false;
		}
		if((M1.row_length === 1) && (M1.column_length ===1)) {
			return M1.scalar.equals(M2.scalar, tolerance);
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				if(!x1[row][col].equals(x2[row][col], tolerance)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Array of real parts of elements in matrix.
	 * @returns {Array<Array<number>>}
	 */
	getNumberMatrixArray() {
		const y = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j].real;
			}
		}
		return y;
	}
	
	/**
	 * Complex array of complex numbers of each element of the matrix.
	 * @returns {Array<Array<Complex>>}
	 */
	getComplexMatrixArray() {
		const y = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j];
			}
		}
		return y;
	}
	
	/**
	 * Perform the same process on all elements in the matrix. (mutable)
	 * @param {function(Complex, number, number): any } eachfunc - Function(num, row, col)
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_each(eachfunc) {
		let isclearcash = false;
		// 行優先ですべての値に対して指定した関数を実行する。内容を書き換える可能性もある
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				const ret = eachfunc(this.matrix_array[row][col], row, col);
				if(ret === undefined) {
					continue;
				}
				else if(ret instanceof Complex) {
					this.matrix_array[row][col] = ret;
				}
				else if(ret instanceof Matrix) {
					this.matrix_array[row][col] = ret.scalar;
				}
				else {
					this.matrix_array[row][col] = new Complex(ret);
				}
				isclearcash = true;
			}
		}
		if(isclearcash) {
			this._clearCash();
		}
		return this;
	}

	/**
	 * Perform the same process on all elements in the matrix.
	 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
	 * @returns {Matrix} Matrix after function processing.
	 */
	cloneMatrixDoEachCalculation(eachfunc) {
		return this.clone()._each(eachfunc);
	}

	/**
	 * Create Matrix with specified initialization for each element in matrix.
	 * @param {function(number, number): ?Object } eachfunc - Function(row, col)
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length=dimension] - Number of columns.
	 * @returns {Matrix} Matrix after function processing.
	 */
	static createMatrixDoEachCalculation(eachfunc, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		const y_row_length = Matrix._toInteger(dimension);
		const y_column_length = column_length ? Matrix._toInteger(column_length) : y_row_length;
		const y = new Array(y_row_length);
		for(let row = 0; row < y_row_length; row++) {
			y[row] = new Array(y_column_length);
			for(let col = 0; col < y_column_length; col++) {
				const ret = eachfunc(row, col);
				if(ret === undefined) {
					y[row][col] = Complex.ZERO;
				}
				else {
					y[row][col] = Matrix._toComplex(ret);
				}
			}
		}
		return new Matrix(y);
	}

	/**
	 * Treat the columns of the matrix as vectors and execute the same process.
	 * - If the matrix is a row vector, it performs the same processing for the row vector.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorAuto(array_function) {
		if(this.isRow()) {
			// 1行であれば、その1行に対して処理を行う
			const row_array = new Array(this.row_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[0][col];
			}
			return new Matrix(array_function(row_array));
		}
		else {
			const y = Matrix.ZERO;
			y._resize(1, this.column_length);
			// 1列、行列であれば、列ごとに処理を行う
			for(let col = 0; col < this.column_length; col++) {
				const col_array = new Array(this.row_length);
				for(let row = 0; row < this.row_length; row++) {
					col_array[row] = this.matrix_array[row][col];
				}
				const col_output = array_function(col_array);
				y._resize(Math.max(y.row_length, col_output.length), y.column_length);
				for(let row = 0; row < col_output.length; row++) {
					y.matrix_array[row][col] = col_output[row];
				}
			}
			return y;
		}
	}

	/**
	 * Treat the rows and columns of the matrix as vectors and perform the same processing.
	 * 1. First run the same process for the row.
	 * 2. Finally perform the same processing for the column.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorBoth(array_function) {
		const y1 = Matrix.ZERO;
		// 行ごとに処理を行う
		y1._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			const row_output = array_function(row_array);
			y1._resize(y1.row_length, Math.max(y1.column_length, row_output.length));
			for(let col = 0; col < row_output.length; col++) {
				y1.matrix_array[row][col] = row_output[col];
			}
		}
		const y2 = Matrix.ZERO;
		// 列ごとに処理を行う
		y2._resize(1, y1.column_length);
		for(let col = 0; col < y1.column_length; col++) {
			const col_array = new Array(y1.row_length);
			for(let row = 0; row < y1.row_length; row++) {
				col_array[row] = y1.matrix_array[row][col];
			}
			const col_output = array_function(col_array);
			y2._resize(Math.max(y2.row_length, col_output.length), y2.column_length);
			for(let row = 0; row < col_output.length; row++) {
				y2.matrix_array[row][col] = col_output[row];
			}
		}
		return y2;
	}

	/**
	 * Treat the rows of the matrix as vectors and execute the same process.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorRow(array_function) {
		const y = Matrix.ZERO;
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			const row_output = array_function(row_array);
			y._resize(y.row_length, Math.max(y.column_length, row_output.length));
			for(let col = 0; col < row_output.length; col++) {
				y.matrix_array[row][col] = row_output[col];
			}
		}
		return y;
	}

	/**
	 * Treat the columns of the matrix as vectors and execute the same process.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorColumn(array_function) {
		const y = Matrix.ZERO;
		// 列ごとに処理を行う
		y._resize(1, this.column_length);
		for(let col = 0; col < this.column_length; col++) {
			const col_array = new Array(this.row_length);
			for(let row = 0; row < this.row_length; row++) {
				col_array[row] = this.matrix_array[row][col];
			}
			const col_output = array_function(col_array);
			y._resize(Math.max(y.row_length, col_output.length), y.column_length);
			for(let row = 0; row < col_output.length; row++) {
				y.matrix_array[row][col] = col_output[row];
			}
		}
		return y;
	}

	/**
	 * Treat the rows and columns of the matrix as vectors and perform the same processing.
	 * The arguments of the method can switch the direction of the matrix to be executed.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @param {string|number} [dimension="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVector(array_function, dimension) {
		let target = dimension !== undefined ? dimension : "auto";
		if(typeof target === "string") {
			target = target.toLocaleLowerCase();
		}
		else if(typeof target !== "number") {
			target = Matrix._toInteger(target);
		}
		if((target === "auto") || (target === 0)) {
			return this.eachVectorAuto(array_function);
		}
		else if((target === "row") || (target === 1)) {
			return this.eachVectorRow(array_function);
		}
		else if((target === "column") || (target === 2)) {
			return this.eachVectorColumn(array_function);
		}
		else if((target === "both") || (target === 3)) {
			return this.eachVectorBoth(array_function);
		}
		else {
			throw "eachVector argument " + dimension;
		}
	}

	/**
	 * Extract the specified part of the matrix.
	 * @param {KMatrixInputData} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
	 * @param {KMatrixInputData} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
	 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
	 * @returns {Matrix} 
	 */
	getMatrix(row, col, isUpOffset=false) {
		const geta = isUpOffset ? 1 : 0 ;
		const row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		const col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		const x = this.matrix_array;
		const y = new Array(row_array.length);
		for(let row = 0; row < row_array.length; row++) {
			const y_row = new Array(col_array.length);
			for(let col = 0; col < col_array.length; col++) {
				y_row[col] = x[row_array[row] - geta][col_array[col] - geta];
			}
			y[row] = y_row;
		}
		return new Matrix(y);
	}

	/**
	 * Change specified element in matrix.
	 * @param {KMatrixInputData} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
	 * @param {KMatrixInputData} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
	 * @param {KMatrixInputData} replace - Matrix to be replaced.
	 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
	 * @returns {Matrix} 
	 */
	setMatrix(row, col, replace, isUpOffset=false) {
		const geta = isUpOffset ? 1 : 0 ;
		const row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		const col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		const Y = new Matrix(this);
		const y = Y.matrix_array;
		const X = Matrix._toMatrix(replace);
		const x = X.matrix_array;
		for(let row = 0; row < row_array.length; row++) {
			for(let col = 0; col < col_array.length; col++) {
				y[row_array[row] - geta][col_array[col] - geta] = x[row % X.row_length][col % X.column_length];
			}
		}
		return new Matrix(y);
	}

	/**
	 * Returns the specified element in the matrix.
	 * Each element of the matrix is composed of complex numbers.
	 * @param {KMatrixInputData} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
	 * @param {KMatrixInputData} [col] - If this is a matrix, the column number.
	 * @returns {Complex} 
	 */
	getComplex(row_or_pos, col) {
		let row_or_pos_scalar = null;
		let col_scalar = null;
		if(arguments.length === 1) {
			row_or_pos_scalar = Matrix._toInteger(row_or_pos);
		}
		else if(arguments.length === 2) {
			row_or_pos_scalar = Matrix._toInteger(row_or_pos);
			col_scalar = Matrix._toInteger(col);
		}
		if(this.isRow()) {
			return this.matrix_array[0][row_or_pos_scalar];
		}
		else if(this.isColumn()) {
			return this.matrix_array[row_or_pos_scalar][0];
		}
		else {
			return this.matrix_array[row_or_pos_scalar][col_scalar];
		}
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 他の型に変換用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Boolean value of the first element of the matrix.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return this.matrix_array[0][0].booleanValue;
	}

	/**
	 * Integer value of the first element of the matrix.
	 * @returns {number}
	 */
	get intValue() {
		return this.matrix_array[0][0].intValue;
	}

	/**
	 * Real value of first element of the matrix.
	 * @returns {number}
	 */
	get doubleValue() {
		return this.matrix_array[0][0].doubleValue;
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// konpeito で扱う数値型へ変換
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return new BigInteger(this.intValue);
	}
	
	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(mc) {
			return new BigDecimal([this.doubleValue, mc]);
		}
		else {
			return new BigDecimal(this.doubleValue);
		}
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return new Fraction(this.doubleValue);
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return this.scalar;
	}
	
	/**
	 * return Matrix.
	 * @returns {Matrix}
	 */
	toMatrix() {
		return this;
	}
	
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の基本操作、基本情報の取得
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * First element of this matrix.
	 * @returns {Complex}
	 */
	get scalar() {
		return this.matrix_array[0][0];
	}

	/**
	 * Maximum size of rows or columns in the matrix.
	 * @returns {number}
	 */
	get length() {
		return this.row_length > this.column_length ? this.row_length : this.column_length;
	}

	/**
	 * Number of columns in the matrix.
	 * @returns {number}
	 */
	get width() {
		return this.column_length;
	}

	/**
	 * Number of rows in matrix.
	 * @returns {number}
	 */
	get height() {
		return this.row_length;
	}

	/**
	 * 1-norm.
	 * @returns {number}
	 */
	get norm1() {
		return LinearAlgebra.norm(this, 1);
	}
	
	/**
	 * 2-norm.
	 * @returns {number}
	 */
	get norm2() {
		return LinearAlgebra.norm(this, 2);
	}

	/**
	 * p-norm.
	 * @param {KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	norm(p) {
		return LinearAlgebra.norm(this, p);
	}

	/**
	 * Condition number of the matrix
	 * @param {KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	cond(p) {
		return LinearAlgebra.cond(this, p);
	}

	/**
	 * Inverse condition number.
	 * @returns {number}
	 */
	rcond() {
		return LinearAlgebra.rcond(this);
	}

	/**
	 * Rank.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {number} rank(A)
	 */
	rank(tolerance) {
		return LinearAlgebra.rank(this, tolerance);
	}

	/**
	 * Trace of a matrix.
	 * Sum of diagonal elements.
	 * @returns {Complex} trace(A)
	 */
	trace() {
		return LinearAlgebra.trace(this);
	}

	/**
	 * Determinant.
	 * @returns {Matrix} |A|
	 */
	det() {
		return LinearAlgebra.det(this);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の作成関係
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Creates a matrix composed of the specified number.
	 * @param {KMatrixInputData} number - Value after initialization.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static memset(number, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		const M = Matrix._toMatrix(number);
		if(!M.isScalar()) {
			const x = M.matrix_array;
			const x_row_length = M.row_length;
			const x_column_length = M.column_length;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				return x[row % x_row_length][col % x_column_length];
			}, dimension, column_length);
		}
		else {
			const x = M.scalar;
			return Matrix.createMatrixDoEachCalculation(function() {
				return x;
			}, dimension, column_length);
		}
	}

	/**
	 * Return identity matrix.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static eye(dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return row === col ? Complex.ONE : Complex.ZERO;
		}, dimension, column_length);
	}
	
	/**
	 * Create zero matrix.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static zeros(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ZERO, dimension, column_length);
	}

	/**
	 * Create a matrix of all ones.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static ones(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ONE, dimension, column_length);
	}

	/**
	 * If matrix, generate diagonal column vector.
	 * If vector, generate a matrix with diagonal elements.
	 * @returns {Matrix} Matrix or vector created. See how to use the function.
	 */
	diag() {
		if(this.isVector()) {
			// 行列を作成
			const M = this;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				if(row === col) {
					return M.getComplex(row);
				}
				else {
					return Complex.ZERO;
				}
			}, this.length);
		}
		else {
			// 列ベクトルを作成
			const len = Math.min(this.row_length, this.column_length);
			const y = new Array(len);
			for(let i = 0; i < len; i++) {
				y[i] = new Array(1);
				y[i][0] = this.matrix_array[i][i];
			}
			return new Matrix(y);
		}
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 比較や判定
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Return true if the matrix is scalar.
	 * @returns {boolean}
	 */
	isScalar() {
		return this.row_length === 1 && this.column_length == 1;
	}
	
	/**
	 * Return true if the matrix is row vector.
	 * @returns {boolean}
	 */
	isRow() {
		return this.row_length === 1;
	}
	
	/**
	 * Return true if the matrix is column vector.
	 * @returns {boolean}
	 */
	isColumn() {
		return this.column_length === 1;
	}

	/**
	 * Return true if the matrix is vector.
	 * @returns {boolean}
	 */
	isVector() {
		return this.row_length === 1 || this.column_length === 1;
	}

	/**
	 * Return true if the value is not scalar.
	 * @returns {boolean}
	 */
	isMatrix() {
		return this.row_length !== 1 && this.column_length !== 1;
	}

	/**
	 * Return true if the matrix is square matrix.
	 * @returns {boolean}
	 */
	isSquare() {
		return this.row_length === this.column_length;
	}

	/**
	 * Return true if the matrix is real matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isReal(tolerance) {
		let is_real = true;
		this._each(function(num){
			if(is_real && (num.isComplex(tolerance))) {
				is_real = false;
			}
		});
		return is_real;
	}

	/**
	 * Return true if the matrix is complex matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isComplex(tolerance) {
		return !this.isReal(tolerance);
	}

	/**
	 * Return true if the matrix is zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZeros(tolerance) {
		let is_zeros = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num){
			if(is_zeros && (!num.isZero(tolerance_))) {
				is_zeros = false;
			}
		});
		return is_zeros;
	}

	/**
	 * Return true if the matrix is identity matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isIdentity(tolerance) {
		let is_identity = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_identity) {
				if(row === col) {
					if(!num.isOne(tolerance_)) {
						is_identity = false;
					}
				}
				else {
					if(!num.isZero(tolerance_)) {
						is_identity = false;
					}
				}
			}
		});
		return is_identity;
	}

	/**
	 * Return true if the matrix is diagonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isDiagonal(tolerance) {
		let is_diagonal = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_diagonal && (row !== col) && (!num.isZero(tolerance_))) {
				is_diagonal = false;
			}
		});
		return is_diagonal;
	}
	
	/**
	 * Return true if the matrix is tridiagonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTridiagonal(tolerance) {
		let is_tridiagonal = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_tridiagonal && (Math.abs(row - col) > 1) && (!num.isZero(tolerance_))) {
				is_tridiagonal = false;
			}
		});
		return is_tridiagonal;
	}

	/**
	 * Return true if the matrix is regular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isRegular(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		// ランクが行列の次元と等しいかどうかで判定
		// det(M) != 0 でもよいが、時間がかかる可能性があるので
		// 誤差は自動で計算など本当はもうすこし良い方法を考える必要がある
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.rank(tolerance_) === this.row_length);
	}

	/**
	 * Return true if the matrix is orthogonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOrthogonal(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.transpose()).isIdentity(tolerance_));
	}

	/**
	 * Return true if the matrix is unitary matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isUnitary(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.ctranspose()).isIdentity(tolerance_));
	}

	/**
	 * Return true if the matrix is symmetric matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isSymmetric(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row + 1; col < this.column_length; col++) {
				if(!this.matrix_array[row][col].equals(this.matrix_array[col][row], tolerance_)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Return true if the matrix is hermitian matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isHermitian(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row; col < this.column_length; col++) {
				if(row === col) {
					if(!this.matrix_array[row][col].isReal(tolerance_)) {
						return false;
					}
				}
				else if(!this.matrix_array[row][col].equals(this.matrix_array[col][row].conj(), tolerance_)) {
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * Return true if the matrix is upper triangular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTriangleUpper(tolerance) {
		let is_upper = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_upper && (row > col) && (!num.isZero(tolerance_))) {
				is_upper = false;
			}
		});
		return is_upper;
	}

	/**
	 * Return true if the matrix is  lower triangular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTriangleLower(tolerance) {
		let is_lower = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_lower && (row < col) && (!num.isZero(tolerance_))) {
				is_lower = false;
			}
		});
		return is_lower;
	}

	/**
	 * Return true if the matrix is permutation matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isPermutation(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		const is_row = new Array(this.row_length);
		const is_col = new Array(this.column_length);
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				const target = this.matrix_array[row][col];
				if(target.isOne(tolerance_)) {
					if(!is_row[row] && !is_col[col]) {
						is_row[row] = 1;
						is_col[col] = 1;
					}
					else {
						return false;
					}
				}
				else if(!target.isZero(tolerance_)) {
					return false;
				}
			}
		}
		for(let i = 0;i < this.row_length; i++) {
			if(is_row[i] === undefined || is_col[i] === undefined) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Number of rows and columns of matrix.
	 * @param {?string|?number} [dimension] direction. 1/"row", 2/"column"
	 * @returns {Matrix} [row_length, column_length]
	 */
	size(dimension) {
		if(dimension !== undefined) {
			let target = dimension;
			if(typeof target === "string") {
				target = target.toLocaleLowerCase();
			}
			else if(typeof target !== "number") {
				target = Matrix._toInteger(target);
			}
			if((target === "row") || (target === 1)) {
				return new Matrix(this.row_length);
			}
			else if((target === "column") || (target === 2)) {
				return new Matrix(this.column_length);
			}
		}
		// 行列のサイズを取得
		return new Matrix([[this.row_length, this.column_length]]);
	}

	/**
	 * Compare values.
	 * - Use `compareToMatrix` if you want to compare matrices.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		// ※スカラー同士の場合は、実数を返す
		if(M1.isScalar() && M2.isScalar()) {
			return M1.scalar.compareTo(M2.scalar, tolerance);
		}
		throw "IllegalArgumentException";
	}

	/**
	 * Compare values.
	 * - Use `compareTo` if you want to compare scalar values.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareToMatrix(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].compareTo(x2[row % M2.row_length][col % M2.column_length], tolerance);
		}, y_row_length, y_column_length);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 四則演算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Add.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A + B
	 */
	add(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].add(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Subtract.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A - B
	 */
	sub(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].sub(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Multiply.
	 * - Use `dotmul` if you want to use `mul` for each element.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A * B
	 */
	mul(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.mul(M2.scalar));
		}
		if(M1.isScalar()) {
			const y = new Array(M2.row_length);
			for(let row = 0; row < M2.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(let col = 0; col < M2.column_length; col++) {
					y[row][col] = M1.scalar.mul(x2[row][col]);
				}
			}
			return new Matrix(y);
		}
		else if(M2.isScalar()) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(let col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].mul(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M1.column_length !== M2.row_length) {
			throw "Matrix size does not match";
		}
		{
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(let col = 0; col < M2.column_length; col++) {
					let sum = Complex.ZERO;
					for(let i = 0; i < M1.column_length; i++) {
						sum = sum.add(x1[row][i].mul(x2[i][col]));
					}
					y[row][col] = sum;
				}
			}
			return new Matrix(y);
		}
	}

	/**
	 * Divide.
	 * - Use `dotdiv` if you want to use `div` for each element.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A / B
	 */
	div(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.div(M2.scalar));
		}
		if(M2.isScalar()) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(let col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].div(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M2.row_length === M2.column_length) {
			const tolerance = 1.0e-10;
			const det = M2.det().scalar.norm;
			if(det > tolerance) {
				// ランク落ちしていないので通常の逆行列を使用する
				return this.mul(M2.inv());
			}
			else {
				// ランク落ちしているので疑似逆行列を使用する
				return this.mul(M2.pinv());
			}
		}
		if(M1.column_length !== M2.column_length) {
			throw "Matrix size does not match";
		}
		throw "warning";
	}

	/**
	 * Inverse matrix of this matrix.
	 * - Use `dotinv` if you want to use `inv` for each element.
	 * @returns {Matrix} A^-1
	 */
	inv() {
		return LinearAlgebra.inv(this);
	}

	/**
	 * Multiplication for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .* B
	 */
	dotmul(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mul(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Division for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ./ B
	 */
	dotdiv(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].div(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Inverse of each element of matrix.
	 * @returns {Matrix} 1 ./ A
	 */
	dotinv() {
		const M1 = this;
		const x1 = M1.matrix_array;
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row][col].inv();
		}, M1.row_length, M1.column_length);
	}

	/**
	 * Multiplication for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .* B
	 * @deprecated use the dotmul.
	 */
	nmul(number) {
		return this.dotmul(number);
	}

	/**
	 * Division for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ./ B
	 * @deprecated use the dotdiv.
	 */
	ndiv(number) {
		return this.dotdiv(number);
	}

	/**
	 * Inverse of each element of matrix.
	 * @returns {Matrix} 1 ./ A
	 * @deprecated use the dotinv.
	 */
	ninv() {
		return this.dotinv();
	}

	/**
	 * Power function for each element of the matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .^ B
	 * @deprecated use the dotpow.
	 */
	npow(number) {
		return this.dotpow(number);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 余り
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Modulo, positive remainder of division for each element of matrix.
	 * - Result has same sign as the Dividend.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .rem B
	 */
	rem(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].rem(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Modulo, positive remainder of division for each element of matrix.
	 * - Result has same sign as the Divisor.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .mod B
	 */
	mod(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mod(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}
	
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// Complexのメソッドにある機能
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Real part of each element.
	 * @returns {Matrix} real(A)
	 */
	real() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.real);
		});
	}
	
	/**
	 * Imaginary part of each element of the matrix.
	 * @returns {Matrix} imag(A)
	 */
	imag() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.imag);
		});
	}

	/**
	 * The argument of each element of matrix.
	 * @returns {Matrix} arg(A)
	 */
	arg() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.arg);
		});
	}

	/**
	 * The positive or negative signs of each element of the matrix.
	 * - +1 if positive, -1 if negative, 0 if 0, norm if complex number.
	 * @returns {Matrix}
	 */
	sign() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.sign());
		});
	}

	/**
	 * Floor.
	 * @returns {Matrix} floor(A)
	 */
	floor() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.floor();
		});
	}

	/**
	 * Ceil.
	 * @returns {Matrix} ceil(A)
	 */
	ceil() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.ceil();
		});
	}

	/**
	 * Rounding to the nearest integer.
	 * @returns {Matrix} round(A)
	 */
	round() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.round();
		});
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {Matrix} fix(A), trunc(A)
	 */
	fix() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fix();
		});
	}

	/**
	 * Fraction.
	 * @returns {Matrix} fract(A)
	 */
	fract() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fract();
		});
	}

	/**
	 * Absolute value.
	 * @returns {Matrix} abs(A)
	 */
	abs() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.abs();
		});
	}

	/**
	 * Complex conjugate matrix.
	 * @returns {Matrix} real(A) - imag(A)j
	 */
	conj() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.conj();
		});
	}

	/**
	 * this * -1
	 * @returns {Matrix} -A
	 */
	negate() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.negate();
		});
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * - Unless the matrix is a scalar value, only integers are supported.
	 * - Use `dotpow` if you want to use `pow` for each element. A real number can be specified.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} pow(A, B)
	 */
	pow(number) {
		if(this.isScalar()) {
			return new Matrix(this.scalar.pow(Matrix._toDouble(number)));
		}
		else {
			if(!this.isSquare()) {
				throw "not square " + this;
			}
			let n = Matrix._toInteger(number);
			if(n < 0) {
				throw "error negative number " + n;
			}
			let x, y;
			x = this.clone();
			y = Matrix.eye(this.length);
			while(n !== 0) {
				if((n & 1) !== 0) {
					y = y.mul(x);
				}
				x = x.mul(x);
				n >>>= 1;
			}
			return y;
		}
	}

	/**
	 * Power function for each element of the matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .^ B
	 */
	dotpow(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].pow(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Square.
	 * - Unless the matrix is a scalar value, only integers are supported.
	 * @returns {Matrix} pow(A, 2)
	 */
	square() {
		return this.pow(2);
	}

	/**
	 * Square root.
	 * @returns {Matrix} sqrt(A)
	 */
	sqrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sqrt();
		});
	}

	/**
	 * Cube root.
	 * @returns {Matrix} sqrt(A)
	 */
	cbrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cbrt();
		});
	}

	/**
	 * Reciprocal square root.
	 * @returns {Matrix} rsqrt(A)
	 */
	rsqrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.rsqrt();
		});
	}

	/**
	 * Logarithmic function.
	 * @returns {Matrix} log(A)
	 */
	log() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log();
		});
	}

	/**
	 * Exponential function.
	 * @returns {Matrix} exp(A)
	 */
	exp() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.exp();
		});
	}

	/**
	 * e^x - 1
	 * @returns {Matrix} expm1(A)
	 */
	expm1() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.expm1();
		});
	}

	/**
	 * ln(1 + x)
	 * @returns {Matrix} log1p(A)
	 */
	log1p() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log1p();
		});
	}
	
	/**
	 * log_2(x)
	 * @returns {Matrix} log2(A)
	 */
	log2() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log2();
		});
	}

	/**
	 * log_10(x)
	 * @returns {Matrix} log10(A)
	 */
	log10() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log10();
		});
	}

	// ----------------------
	// 三角関数
	// ----------------------
	
	/**
	 * Sine function.
	 * @returns {Matrix} sin(A)
	 */
	sin() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sin();
		});
	}

	/**
	 * Cosine function.
	 * @returns {Matrix} cos(A)
	 */
	cos() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cos();
		});
	}

	/**
	 * Tangent function.
	 * @returns {Matrix} tan(A)
	 */
	tan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tan();
		});
	}
	
	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {Matrix} atan(A)
	 */
	atan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan();
		});
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI, PI].
	 * - Supports only real numbers.
	 * @param {KMatrixInputData} number - X
	 * @returns {Matrix} atan2(Y, X)
	 */
	atan2(number) {
		const X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan2(X);
		});
	}

	// ----------------------
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {Matrix} asin(A)
	 */
	asin() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asin();
		});
	}

	/**
	 * Arc cosine function.
	 * @returns {Matrix} acos(A)
	 */
	acos() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acos();
		});
	}
	
	/**
	 * Hyperbolic sine function.
	 * @returns {Matrix} sinh(A)
	 */
	sinh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinh();
		});
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {Matrix} asinh(A)
	 */
	asinh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asinh();
		});
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {Matrix} cosh(A)
	 */
	cosh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cosh();
		});
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {Matrix} acosh(A)
	 */
	acosh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acosh();
		});
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {Matrix} tanh(A)
	 */
	tanh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tanh();
		});
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {Matrix} atanh(A)
	 */
	atanh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atanh();
		});
	}

	/**
	 * Secant function.
	 * @returns {Matrix} sec(A)
	 */
	sec() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sec();
		});
	}

	/**
	 * Reverse secant function.
	 * @returns {Matrix} asec(A)
	 */
	asec() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asec();
		});
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {Matrix} sech(A)
	 */
	sech() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sech();
		});
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {Matrix} asech(A)
	 */
	asech() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asech();
		});
	}

	/**
	 * Cotangent function.
	 * @returns {Matrix} cot(A)
	 */
	cot() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cot();
		});
	}

	/**
	 * Inverse cotangent function.
	 * @returns {Matrix} acot(A)
	 */
	acot() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acot();
		});
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {Matrix} coth(A)
	 */
	coth() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.coth();
		});
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {Matrix} acoth(A)
	 */
	acoth() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acoth();
		});
	}

	/**
	 * Cosecant function.
	 * @returns {Matrix} csc(A)
	 */
	csc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.csc();
		});
	}

	/**
	 * Inverse cosecant function.
	 * @returns {Matrix} acsc(A)
	 */
	acsc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acsc();
		});
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {Matrix} csch(A)
	 */
	csch() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.csch();
		});
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {Matrix} acsch(A)
	 */
	acsch() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acsch();
		});
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {Matrix} sinc(A)
	 */
	sinc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinc();
		});
	}
	
	// ----------------------
	// 乱数
	// ----------------------
	
	/**
	 * Generate a matrix composed of random values with uniform random numbers.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Matrix}
	 */
	static rand(dimension, column_length, random) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.rand(random);
		}, dimension, column_length);
	}

	/**
	 * Generate a matrix composed of random values with normal distribution.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Matrix}
	 */
	static randn(dimension, column_length, random) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.randn(random);
		}, dimension, column_length);
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Test if each element of the matrix is integer.
	 * - 1 if true, 0 if false.
	 * - Use `isInteger` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testInteger(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is complex integer.
	 * - 1 if true, 0 if false.
	 * - Use `isComplexInteger` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testComplexInteger(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplexInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) === 0
	 * - 1 if true, 0 if false.
	 * - Use `isZero` if you want to test first element.
	 * - Use `isZeros` to check for a zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testZero(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isZero(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) === 1
	 * - 1 if true, 0 if false.
	 * - Use `isOne` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testOne(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isOne(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is complex.
	 * - 1 if true, 0 if false.
	 * - Use `isComplex` to test whether a matrix contains complex numbers.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testComplex(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplex(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is real.
	 * - 1 if true, 0 if false.
	 * - Use `isReal` to test for complex numbers in matrices.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testReal(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isReal(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is NaN.
	 * - 1 if true, 0 if false.
	 * - Use `isNaN` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNaN() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNaN() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) > 0
	 * - 1 if true, 0 if false.
	 * - Use `isPositive` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPositive() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositive() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) < 0
	 * - 1 if true, 0 if false.
	 * - Use `isNegative` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) >= 0
	 * - 1 if true, 0 if false.
	 * - Use `isNotNegative` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNotNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNotNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is positive infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isPositiveInfinity` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPositiveInfinity() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositiveInfinity() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is negative infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isNegativeInfinity` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNegativeInfinity() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegativeInfinity() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isInfinite` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testInfinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInfinite() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is finite.
	 * - 1 if true, 0 if false.
	 * - Use `isFinite` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testFinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isFinite() ? Complex.ONE : Complex.ZERO;
		});
	}


	// ----------------------
	// 1要素のみのテスト
	// ----------------------
	
	/**
	 * this === 0
	 * - Use only the first element.
	 * - Use `testZero` if you want to test the elements of a matrix.
	 * - Use `isZeros` to check for a zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZero(tolerance) {
		return this.scalar.isZero(tolerance);
	}
	
	/**
	 * this === 1
	 * - Use only the first element.
	 * - Use `testOne` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOne(tolerance) {
		return this.scalar.isOne(tolerance);
	}
	
	/**
	 * this > 0
	 * - Use only the first element.
	 * - Use `testPositive` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isPositive() {
		return this.scalar.isPositive();
	}

	/**
	 * this < 0
	 * - Use only the first element.
	 * - Use `testNegative` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isNegative() {
		return this.scalar.isNegative();
	}

	/**
	 * this >= 0
	 * - Use only the first element.
	 * - Use `testNotNegative` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this.scalar.isNotNegative();
	}
	
	/**
	 * this === NaN
	 * - Use only the first element.
	 * - Use `testNaN` if you want to test the elements of a matrix.
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return this.scalar.isNaN();
	}
	
	/**
	 * this === Infinity
	 * - Use only the first element.
	 * - Use `testPositiveInfinity` if you want to test the elements of a matrix.
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this.scalar.isPositiveInfinity();
	}

	/**
	 * this === -Infinity
	 * - Use only the first element.
	 * - Use `testNegativeInfinity` if you want to test the elements of a matrix.
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this.scalar.isNegativeInfinity();
	}

	/**
	 * this === Infinity or -Infinity
	 * - Use only the first element.
	 * - Use `testInfinite` if you want to test the elements of a matrix.
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return this.scalar.isInfinite();
	}
	
	/**
	 * Return true if the value is finite number.
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return this.scalar.isFinite();
	}

	/**
	 * Return true if the value is integer.
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		return this.scalar.isInteger(tolerance);
	}

	/**
	 * Returns true if the vallue is complex integer (including normal integer).
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} real(A) === integer && imag(A) === integer
	 */
	isComplexInteger(tolerance) {
		return this.scalar.isComplexInteger(tolerance);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の計算でよく使用する処理。
	// メソッド内部の処理を記述する際に使用している。
	// 他から使用する場合は注意が必要である。
	// 前提条件があるメソッド、ミュータブルとなっている。
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Rotate matrix 90 degrees clockwise. (mutable)
	 * @param {KMatrixInputData} rot_90_count - Number of times rotated by 90 degrees.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_rot90(rot_90_count) {
		const count = Matrix._toInteger(rot_90_count);
		let rot_type = 1;
		if(arguments.length === 1) {
			rot_type = ((count % 4) + 4) % 4;
		}
		if(rot_type === 0) {
			return this;
		}
		// バックアップ
		const x = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			x[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				x[i][j] = this.matrix_array[i][j];
			}
		}
		const y = this.matrix_array;
		if(rot_type === 1) {
			// 90度回転
			y.splice(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(let row = 0; row < this.row_length; row++) {
					y[col][row] = x[this.row_length - row - 1][col];
				}
			}
		}
		else if(rot_type === 2) {
			// 180度回転
			for(let row = 0; row < this.row_length; row++) {
				for(let col = 0; col < this.column_length; col++) {
					y[row][col] = x[this.row_length - row - 1][this.column_length - col - 1];
				}
			}
		}
		else if(rot_type === 3) {
			// 270度回転
			y.splice(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(let row = 0; row < this.row_length; row++) {
					y[col][row] = x[row][this.column_length - col - 1];
				}
			}
		}
		this.row_length = y.length;
		this.column_length = y[0].length;
		this._clearCash();
		return this;
	}

	/**
	 * Rotate matrix 90 degrees clockwise.
	 * @param {KMatrixInputData} rot_90_count - Number of times rotated by 90 degrees.
	 * @returns {Matrix} Matrix after function processing.
	 */
	rot90(rot_90_count) {
		return this.clone()._rot90(rot_90_count);
	}

	/**
	 * Change the size of the matrix. (mutable)
	 * Initialized with 0 when expanding.
	 * @param {KMatrixInputData} new_row_length - Number of rows of matrix to resize.
	 * @param {KMatrixInputData} new_column_length - Number of columns of matrix to resize.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_resize(new_row_length, new_column_length) {
		const row_length	= Matrix._toInteger(new_row_length);
		const column_length	= Matrix._toInteger(new_column_length);
		if((row_length === this.row_length) && (column_length === this.column_length)) {
			return this;
		}
		if((row_length <= 0) || (column_length <= 0)) {
			throw "_resize";
		}
		const row_max = Math.max(this.row_length, row_length);
		const col_max = Math.max(this.column_length, column_length);
		const y = this.matrix_array;
		// 大きくなった行と列に対してゼロで埋める
		for(let row = 0; row < row_max; row++) {
			if(row >= this.row_length) {
				y[row] = new Array(col_max);
			}
			for(let col = 0; col < col_max; col++) {
				if((row >= this.row_length) || (col >= this.column_length)) {
					y[row][col] = Complex.ZERO;
				}
			}
		}
		// 小さくなった行と列を削除する
		if(this.row_length > row_length) {
			y.splice(row_length);
		}
		if(this.column_length > column_length) {
			for(let row = 0; row < y.length; row++) {
				y[row].splice(column_length);
			}
		}
		this.row_length = row_length;
		this.column_length = column_length;
		this._clearCash();
		return this;
	}

	/**
	 * Change the size of the matrix.
	 * Initialized with 0 when expanding.
	 * @param {KMatrixInputData} row_length - Number of rows of matrix to resize.
	 * @param {KMatrixInputData} column_length - Number of columns of matrix to resize.
	 * @returns {Matrix} Matrix after function processing.
	 */
	resize(row_length, column_length) {
		return this.clone()._resize(row_length, column_length);
	}

	/**
	 * Remove the row in this matrix. (mutable)
	 * @param {KMatrixInputData} delete_row_index - Number of row of matrix to delete.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_deleteRow(delete_row_index) {
		const row_index	= Matrix._toInteger(delete_row_index);
		if((this.row_length === 1) || (this.row_length <= row_index)) {
			throw "_deleteRow";
		}
		this.matrix_array.splice(row_index, 1);
		this.row_length--;
		this._clearCash();
		return this;
	}
	
	/**
	 * Remove the column in this matrix. (mutable)
	 * @param {KMatrixInputData} delete_column_index - Number of column of matrix to delete.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_deleteColumn(delete_column_index) {
		const column_index	= Matrix._toInteger(delete_column_index);
		if((this.column_length === 1) || (this.column_length <= column_index)) {
			throw "_deleteColumn";
		}
		for(let row = 0; row < this.row_length; row++) {
			this.matrix_array[row].splice(column_index, 1);
		}
		this.column_length--;
		this._clearCash();
		return this;
	}

	/**
	 * Remove the row in this matrix.
	 * @param {KMatrixInputData} delete_row_index - Number of row of matrix to delete.
	 * @returns {Matrix} Matrix after function processing.
	 */
	deleteRow(delete_row_index) {
		return this.clone()._deleteRow(delete_row_index);
	}

	/**
	 * Remove the column in this matrix.
	 * @param {KMatrixInputData} delete_column_index - Number of column of matrix to delete.
	 * @returns {Matrix} Matrix after function processing.
	 */
	deleteColumn(delete_column_index) {
		return this.clone()._deleteColumn(delete_column_index);
	}

	/**
	 * Swap rows in the matrix. (mutable)
	 * @param {KMatrixInputData} exchange_row_index1 - Number 1 of row of matrix to exchange.
	 * @param {KMatrixInputData} exchange_row_index2 - Number 2 of row of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_exchangeRow(exchange_row_index1, exchange_row_index2) {
		const row_index1	= Matrix._toInteger(exchange_row_index1);
		const row_index2	= Matrix._toInteger(exchange_row_index2);
		if((this.row_length === 1) || (this.row_length <= row_index1) || (this.row_length <= row_index2)) {
			throw "_exchangeRow";
		}
		if(row_index1 === row_index2) {
			return this;
		}
		const swap = this.matrix_array[row_index1];
		this.matrix_array[row_index1] = this.matrix_array[row_index2];
		this.matrix_array[row_index2] = swap;
		this._clearCash();
		return this;
	}

	/**
	 * Swap columns in the matrix. (mutable)
	 * @param {KMatrixInputData} exchange_column_index1 - Number 1 of column of matrix to exchange.
	 * @param {KMatrixInputData} exchange_column_index2 - Number 2 of column of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_exchangeColumn(exchange_column_index1, exchange_column_index2) {
		const column_index1	= Matrix._toInteger(exchange_column_index1);
		const column_index2	= Matrix._toInteger(exchange_column_index2);
		if((this.column_length === 1) || (this.column_length <= column_index1) || (this.column_length <= column_index2)) {
			throw "_exchangeColumn";
		}
		if(column_index1 === column_index2) {
			return this;
		}
		for(let row = 0; row < this.row_length; row++) {
			const swap = this.matrix_array[row][column_index1];
			this.matrix_array[row][column_index1] = this.matrix_array[row][column_index2];
			this.matrix_array[row][column_index2] = swap;
		}
		this._clearCash();
		return this;
	}

	/**
	 * Swap rows in the matrix.
	 * @param {KMatrixInputData} exchange_row_index1 - Number 1 of row of matrix to exchange.
	 * @param {KMatrixInputData} exchange_row_index2 - Number 2 of row of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing.
	 */
	exchangeRow(exchange_row_index1, exchange_row_index2) {
		return this.clone()._exchangeRow(exchange_row_index1, exchange_row_index2);
	}

	/**
	 * Swap columns in the matrix.
	 * @param {KMatrixInputData} exchange_column_index1 - Number 1 of column of matrix to exchange.
	 * @param {KMatrixInputData} exchange_column_index2 - Number 2 of column of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing.
	 */
	exchangeColumn(exchange_column_index1, exchange_column_index2) {
		return this.clone()._exchangeColumn(exchange_column_index1, exchange_column_index2);
	}

	/**
	 * Combine matrix to the right of this matrix. (mutable)
	 * @param {KMatrixInputData} left_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_concatRight(left_matrix) {
		const M = Matrix._toMatrix(left_matrix);
		if(this.row_length != M.row_length) {
			throw "_concatRight";
		}
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < M.column_length; col++) {
				this.matrix_array[row].push(M.matrix_array[row][col]);
			}
		}
		this.column_length += M.column_length;
		this._clearCash();
		return this;
	}

	/**
	 * Combine matrix to the bottom of this matrix. (mutable)
	 * @param {KMatrixInputData} bottom_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_concatBottom(bottom_matrix) {
		const M = Matrix._toMatrix(bottom_matrix);
		if(this.column_length != M.column_length) {
			throw "_concatBottom";
		}
		for(let row = 0; row < M.row_length; row++) {
			this.matrix_array.push(M.matrix_array[row]);
		}
		this.row_length += M.row_length;
		this._clearCash();
		return this;
	}

	/**
	 * Combine matrix to the right of this matrix.
	 * @param {KMatrixInputData} left_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing.
	 */
	concatRight(left_matrix) {
		return this.clone()._concatRight(left_matrix);
	}

	/**
	 * Combine matrix to the bottom of this matrix.
	 * @param {KMatrixInputData} bottom_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing.
	 */
	concatBottom(bottom_matrix) {
		return this.clone()._concatBottom(bottom_matrix);
	}

	/**
	 * Clip each element of matrix to specified range.
	 * @param {KMatrixInputData} min 
	 * @param {KMatrixInputData} max 
	 * @returns {Matrix} min(max(x, min), max)
	 */
	clip(min, max) {
		const MIN = Matrix._toMatrix(min);
		const MAX = Matrix._toMatrix(max);
		const x_min = MIN.matrix_array;
		const x_max = MAX.matrix_array;
		return this.cloneMatrixDoEachCalculation(
			function(num, row, col) {
				const d_min = x_min[row % MIN.row_length][col % MIN.column_length];
				const d_max = x_max[row % MAX.row_length][col % MAX.column_length];
				return num.clip(d_min, d_max);
			}
		);
	}

	/**
	 * Create row vector with specified initial value, step value, end condition.
	 * @param {KMatrixInputData} start_or_stop 
	 * @param {KMatrixInputData} [stop]
	 * @param {KMatrixInputData} [step=1] 
	 * @returns {Matrix}
	 */
	static arange(start_or_stop, stop, step) {
		const from  = stop !== undefined ? Matrix._toComplex(start_or_stop) : Complex.ZERO;
		const to    = stop !== undefined ? Matrix._toComplex(stop) : Matrix._toComplex(start_or_stop);
		const delta = step !== undefined ? Matrix._toComplex(step) : Complex.ONE;
		return new Matrix(MatrixTool.InterpolationCalculation(from, delta, to, false));
	}

	/**
	 * Circular shift.
	 * @param {KMatrixInputData} shift_size 
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	circshift(shift_size, type) {
		const shift = Matrix._toInteger(shift_size);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const y = new Array(data.length);
			let from = ((- shift % data.length) + data.length) % data.length;
			for(let i = 0; i < data.length; i++) {
				y[i] = data[from++];
				if(from === data.length) {
					from = 0;
				}
			}
			return y;
		};
		return this.eachVector(main, dim);
	}

	/**
	 * Circular shift.
	 * @param {KMatrixInputData} shift_size 
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	roll(shift_size, type) {
		return this.circshift(shift_size, type);
	}

	/**
	 * Change the shape of the matrix.
	 * The number of elements in the matrix doesn't increase or decrease.
	 * @param {KMatrixInputData} row_length - Number of rows of matrix to reshape.
	 * @param {KMatrixInputData} column_length - Number of columns of matrix to reshape.
	 * @returns {Matrix} Matrix after function processing.
	 */
	reshape(row_length, column_length) {
		const new_row_length = Matrix._toInteger(row_length);
		const new_column_length = Matrix._toInteger(column_length);
		const this_size = this.row_length * this.column_length;
		const new_size = new_row_length * new_column_length;
		if(this_size !== new_size) {
			throw "reshape error. (this_size !== new_size)->(" + this_size + " !== " + new_size + ")";
		}
		const m = this.matrix_array;
		let m_col = 0;
		let m_row = 0;
		const y = new Array(new_row_length);
		for(let row = 0; row < new_row_length; row++) {
			y[row] = new Array(new_column_length);
			for(let col = 0; col < new_column_length; col++) {
				y[row][col] = m[m_row][m_col];
				m_col++;
				if(m_col === this.column_length) {
					m_col = 0;
					m_row++;
				}
			}
		}
		return new Matrix(y);
	}

	/**
	 * Flip this matrix left and right.
	 * @returns {Matrix} Matrix after function processing.
	 */
	fliplr() {
		return this.flip({dimension : "row"});
	}

	/**
	 * Flip this matrix up and down.
	 * @returns {Matrix} Matrix after function processing.
	 */
	flipud() {
		return this.flip({dimension : "column"});
	}

	/**
	 * Flip this matrix.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	flip(type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const y = new Array(data.length);
			for(let i = 0, j = data.length - 1; i < data.length; i++, j--) {
				y[i] = data[j];
			}
			return y;
		};
		return this.eachVector(main, dim);
	}

	/**
	 * Index sort.
	 * - Sorts by row when setting index by row vector to the argument.
	 * - Sorts by column when setting index by column vector to the argument.
	 * @param {KMatrixInputData} v - Vector with index. (See the description of this function)
	 * @returns {Matrix} Matrix after function processing.
	 */
	indexsort(v) {
		const V = Matrix._toMatrix(v);
		if(V.isMatrix()) {
			throw "argsort error. argsort is not vector. (" + V.toOneLineString + ")";
		}
		let is_transpose = false;
		let target_array = null;
		let index_array = null;
		if(V.isRow()) {
			if(this.column_length !== V.column_length) {
				throw "argsort error. (this_size !== new_size)->(" + this.column_length + " !== " + V.column_length + ")";
			}
			// 列をインデックスソートする
			is_transpose = true;
			target_array = this.transpose().matrix_array;
			index_array = V.matrix_array[0];
		}
		if(V.isColumn()) {
			if(this.row_length !== V.row_length) {
				throw "argsort error. (this_size !== new_size)->(" + this.row_length + " !== " + V.row_length + ")";
			}
			// 行をインデックスソートする
			target_array = this.matrix_array;
			index_array = V.transpose().matrix_array[0];
		}
		// データを付け替える
		const sort_data = new Array(index_array.length);
		for(let i = 0; i < index_array.length; i++) {
			sort_data[i] = {
				index : index_array[i],
				data : target_array[i]
			};
		}
		/**
		 * 比較関数を作成
		 * @type {function({index : Complex}, {index : Complex}): number }
		 */
		const compare = function(a, b) {
			return a.index.compareTo(b.index);
		};
		{
			/**
			 * @type {Array<{index : Complex}>}
			 */
			const temp = [];
			/**
			 * ソート関数（安定マージソート）
			 * @param {Array<{index : Complex}>} elements 
			 * @param {number} first 
			 * @param {number} last 
			 * @param {function({index : Complex}, {index : Complex}): number} cmp_function 
			 * @returns {boolean}
			 */
			const sort = function(elements, first, last, cmp_function) { 
				if(first < last) {
					const middle = Math.floor((first + last) / 2);
					sort(elements, first, middle, cmp_function);
					sort(elements, middle + 1, last, cmp_function);
					let p = 0, i, j, k;
					for(i = first; i <= middle; i++) {
						temp[p++] = elements[i];
					}
					i = middle + 1;
					j = 0;
					k = first;
					while((i <= last) && (j < p)) {
						if(cmp_function(elements[i], temp[j]) >= 0) {
							elements[k++] = temp[j++];
						}
						else {
							elements[k++] = elements[i++];
						}
					}
					while(j < p) {
						elements[k++] = temp[j++];
					}
				}
				return true;
			};
			sort(sort_data, 0, sort_data.length - 1, compare);
		}
		// 行列を組み立てなおす
		const y = new Array(index_array.length);
		for(let i = 0; i < index_array.length; i++) {
			y[i] = sort_data[i].data;
		}
		// 行列を作成する
		const Y = new Matrix(y);
		if(!is_transpose) {
			return Y;
		}
		else {
			return Y.transpose();
		}
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の一般計算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Transpose a matrix.
	 * @returns {Matrix} A^T
	 */
	transpose() {
		const y = new Array(this.column_length);
		for(let col = 0; col < this.column_length; col++) {
			y[col] = new Array(this.row_length);
			for(let row = 0; row < this.row_length; row++) {
				y[col][row] = this.matrix_array[row][col];
			}
		}
		return new Matrix(y);
	}

	/**
	 * Hermitian transpose.
	 * @returns {Matrix} A^T
	 */
	ctranspose() {
		return this.transpose().conj();
	}

	/**
	 * Hermitian transpose.
	 * @returns {Matrix} A^T
	 */
	T() {
		return this.ctranspose();
	}

	/**
	 * Inner product/Dot product.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
	 * @returns {Matrix} A・B
	 */
	inner(number, dimension=1) {
		return LinearAlgebra.inner(this, number, dimension);
	}
	
	/**
	 * LUP decomposition.
	 * - P'*L*U=A
	 * - P is permutation matrix.
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
	 */
	lup() {
		return LinearAlgebra.lup(this);
	}

	/**
	 * LU decomposition.
	 * - L*U=A
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @returns {{L: Matrix, U: Matrix}} {L, U}
	 */
	lu() {
		return LinearAlgebra.lu(this);
	}

	/**
	 * Solving a system of linear equations to be Ax = B
	 * @param {KMatrixInputData} number - B
	 * @returns {Matrix} x
	 */
	linsolve(number) {
		return LinearAlgebra.linsolve(this, number);
	}

	/**
	 * QR decomposition.
	 * - Q*R=A
	 * - Q is orthonormal matrix.
	 * - R is upper triangular matrix.
	 * @returns {{Q: Matrix, R: Matrix}} {Q, R}
	 */
	qr() {
		return LinearAlgebra.qr(this);
	}

	/**
	 * Tridiagonalization of symmetric matrix.
	 * - Don't support complex numbers.
	 * - P*H*P'=A
	 * - P is orthonormal matrix.
	 * - H is tridiagonal matrix.
	 * - The eigenvalues of H match the eigenvalues of A.
	 * @returns {{P: Matrix, H: Matrix}} {P, H}
	 */
	tridiagonalize() {
		return LinearAlgebra.tridiagonalize(this);
	}

	/**
	 * Eigendecomposition of symmetric matrix.
	 * - Don't support complex numbers.
	 * - V*D*V'=A.
	 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
	 * - D is a matrix containing the eigenvalues on the diagonal component.
	 * @returns {{V: Matrix, D: Matrix}} {D, V}
	 */
	eig() {
		return LinearAlgebra.eig(this);
	}

	/**
	 * Singular Value Decomposition (SVD).
	 * - U*S*V'=A
	 * - U and V are orthonormal matrices.
	 * - S is a matrix with singular values in the diagonal.
	 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
	 */
	svd() {
		return LinearAlgebra.svd(this);
	}

	/**
	 * Pseudo-inverse matrix.
	 * @returns {Matrix} A^+
	 */
	pinv() {
		return LinearAlgebra.pinv(this);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// probability 確率計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Log-gamma function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	gammaln() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gammaln();
		});
	}

	/**
	 * Gamma function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	gamma() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gamma();
		});
	}

	/**
	 * Incomplete gamma function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	gammainc(a, tail) {
		const a_ = Matrix._toDouble(a);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gammainc(a_, tail);
		});
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gampdf(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gampdf(k_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gamcdf(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gamcdf(k_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gaminv(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gaminv(k_, s_);
		});
	}

	/**
	 * Beta function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} y
	 * @returns {Matrix}
	 */
	beta(y) {
		const y_ = Matrix._toDouble(y);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.beta(y_);
		});
	}
	
	/**
	 * Incomplete beta function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	betainc(a, b, tail) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betainc(a_, b_, tail);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betacdf(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betacdf(a_, b_);
		});
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betapdf(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betapdf(a_, b_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betainv(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betainv(a_, b_);
		});
	}

	/**
	 * Factorial function, x!.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	factorial() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.factorial();
		});
	}
	
	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k
	 * @returns {Matrix}
	 */
	nchoosek(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.nchoosek(k_);
		});
	}
	
	/**
	 * Error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erf() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erf();
		});
	}

	/**
	 * Complementary error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfc();
		});
	}
	
	/**
	 * Inverse function of Error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfinv() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfinv();
		});
	}
	
	/**
	 * Inverse function of Complementary error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfcinv() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfcinv();
		});
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	normpdf(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.normpdf(u_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	normcdf(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.normcdf(u_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	norminv(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.norminv(u_, s_);
		});
	}

	/**
	 * Probability density function (PDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @returns {Matrix}
	 */
	binopdf(n, p) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binopdf(n_, p_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	binocdf(n, p, tail) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binocdf(n_, p_, tail);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @returns {Matrix}
	 */
	binoinv(n, p) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binoinv(n_, p_);
		});
	}

	/**
	 * Probability density function (PDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poisspdf(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poisspdf(lambda_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poisscdf(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poisscdf(lambda_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poissinv(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poissinv(lambda_);
		});
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tpdf(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tpdf(v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tcdf(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tcdf(v_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tinv(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tinv(v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @param {KMatrixInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Matrix}
	 */
	tdist(v, tails) {
		const v_ = Matrix._toDouble(v);
		const tails_ = Matrix._toDouble(tails);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tdist(v_, tails_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tinv2(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tinv2(v_);
		});
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2pdf(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2pdf(k_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2cdf(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2cdf(k_);
		});
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2inv(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2inv(k_);
		});
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	fpdf(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fpdf(d1_, d2_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	fcdf(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fcdf(d1_, d2_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	finv(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.finv(d1_, d2_);
		});
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A & B
	 */
	and(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.and(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A | B
	 */
	or(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.or(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ^ B
	 */
	xor(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.xor(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {Matrix} !A
	 */
	not() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.not();
		});
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} n
	 * @returns {Matrix} A << n
	 */
	shift(n) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.shift(Matrix._toDouble(n));
		});
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} gcd(x, y)
	 */
	gcd(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gcd(Matrix._toDouble(number));
		});
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Array<Matrix>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		if(!this.isScalar()) {
			throw "IllegalArgumentException";
		}
		const x = this.scalar;
		const y = Matrix._toDouble(number);
		const result =x.extgcd(y);
		return [new Matrix(result[0]), new Matrix(result[1]), new Matrix(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} lcm(x, y)
	 */
	lcm(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.lcm(Matrix._toDouble(number));
		});
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} exponent
	 * @param {KMatrixInputData} m 
	 * @returns {Matrix} A^B mod m
	 */
	modPow(exponent, m) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.modPow(Matrix._toDouble(exponent), Matrix._toDouble(m));
		});
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} m
	 * @returns {Matrix} A^(-1) mod m
	 */
	modInverse(m) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.modInverse(Matrix._toDouble(m));
		});
	}
	
	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Multiply a multiple of ten.
	 * @param {KMatrixInputData} n
	 * @returns {Matrix} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.scaleByPowerOfTen(Matrix._toComplex(n));
		});
	}

	// ----------------------
	// 素数
	// ----------------------
	
	/**
	 * Test if each element of the matrix is prime number.
	 * - 1 if true, 0 if false.
	 * - Calculated as an integer.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * - Use `isPrime` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPrime() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPrime() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is prime number by Miller-Labin prime number determination method.
	 * - 1 if true, 0 if false.
	 * - Use `isProbablePrime` if you want to test first element.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testProbablePrime(certainty) {
		const p1 = certainty !== undefined ? Math.round(Matrix._toDouble(certainty)) : undefined;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isProbablePrime(p1) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Next prime.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KMatrixInputData} [search_max=100000] - Search range of next prime.
	 * @returns {Matrix}
	 */
	nextProbablePrime(certainty, search_max) {
		const p1 = certainty !== undefined ? Math.round(Matrix._toDouble(certainty)) : undefined;
		const p2 = search_max !== undefined ? Math.round(Matrix._toDouble(search_max)) : undefined;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.nextProbablePrime(p1, p2);
		});
	}
	
	/**
	 * Return true if the value is prime number.
	 * - Calculated as an integer.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * - Use only the first element.
	 * - Use `testPrime` if you want to test the elements of a matrix.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		return this.scalar.isPrime();
	}
	
	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * - Use only the first element.
	 * - Use `testProbablePrime` if you want to test the elements of a matrix.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		return this.scalar.isProbablePrime(certainty);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// statistics 統計計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Maximum number.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} max([A, B])
	 */
	max(type) {
		return Statistics.max(this, type);
	}
	
	/**
	 * Minimum number.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} min([A, B])
	 */
	min(type) {
		return Statistics.min(this, type);
	}
	
	/**
	 * Sum.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	sum(type) {
		return Statistics.sum(this, type);
	}

	/**
	 * Arithmetic average.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mean(type) {
		return Statistics.mean(this, type);
	}

	/**
	 * Product of array elements.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	prod(type) {
		return Statistics.prod(this, type);
	}

	/**
	 * Geometric mean.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	geomean(type) {
		return Statistics.geomean(this, type);
	}

	/**
	 * Median.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	median(type) {
		return Statistics.median(this, type);
	}

	/**
	 * Mode.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mode(type) {
		return Statistics.mode(this, type);
	}

	/**
	 * Moment.
	 * - Moment of order n. Equivalent to the definition of variance at 2.
	 * @param {number} nth_order
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	moment(nth_order, type) {
		return Statistics.moment(this, nth_order, type);
	}

	/**
	 * Variance.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	var(type) {
		return Statistics.var(this, type);
	}

	/**
	 * Standard deviation.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	std(type) {
		return Statistics.std(this, type);
	}

	/**
	 * Mean absolute deviation.
	 * - The "algorithm" can choose "0/mean"(default) and "1/median".
	 * @param {?string|?number} [algorithm]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mad(algorithm, type) {
		return Statistics.mad(this, algorithm, type);
	}

	/**
	 * Skewness.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	skewness(type) {
		return Statistics.skewness(this, type);
	}

	/**
	 * Covariance matrix or Covariance value.
	 * - Get a variance-covariance matrix from 1 matrix.
	 * - Get a covariance from 2 vectors.
	 * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	cov(y_or_type, type) {
		return Statistics.cov(this, y_or_type, type);
	}

	/**
	 * The samples are standardize to a mean value of 0, standard deviation of 1.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	standardization(type) {
		return Statistics.standardization(this, type);
	}

	/**
	 * Correlation matrix or Correlation coefficient.
	 * - Get a correlation matrix from 1 matrix.
	 * - Get a correlation coefficient from 2 vectors.
	 * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	corrcoef(y_or_type, type) {
		return Statistics.corrcoef(this, y_or_type, type);
	}

	/**
	 * Sort.
	 * - The "order" can choose "ascend"(default) and "descend".
	 * @param {string} [order]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	sort(order, type) {
		return Statistics.sort(this, order, type);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// signal 信号処理用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Discrete Fourier transform (DFT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} fft(x)
	 */
	fft(type) {
		return Signal.fft(this, type);
	}

	/**
	 * Inverse discrete Fourier transform (IDFT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} ifft(x)
	 */
	ifft(type) {
		return Signal.ifft(this, type);
	}

	/**
	 * Power spectral density.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} abs(fft(x)).^2
	 */
	powerfft(type) {
		return Signal.powerfft(this, type);
	}

	/**
	 * Discrete cosine transform (DCT-II, DCT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} dct(x)
	 */
	dct(type) {
		return Signal.dct(this, type);
	}

	/**
	 * Inverse discrete cosine transform (DCT-III, IDCT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} idct(x)
	 */
	idct(type) {
		return Signal.idct(this, type);
	}

	/**
	 * Discrete two-dimensional Fourier transform (2D DFT).
	 * @returns {Matrix}
	 */
	fft2() {
		return Signal.fft2(this);
	}

	/**
	 * Inverse discrete two-dimensional Fourier transform (2D IDFT).
	 * @returns {Matrix}
	 */
	ifft2() {
		return Signal.ifft2(this);
	}

	/**
	 * Discrete two-dimensional cosine transform (2D DCT).
	 * @returns {Matrix}
	 */
	dct2() {
		return Signal.dct2(this);
	}

	/**
	 * Inverse discrete two-dimensional cosine transform (2D IDCT).
	 * @returns {Matrix}
	 */
	idct2() {
		return Signal.idct2(this);
	}

	/**
	 * Convolution integral, Polynomial multiplication.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	conv(number) {
		return Signal.conv(this, number);
	}

	/**
	 * ACF(Autocorrelation function), cros-correlation function.
	 * - If the argument is omitted, it is calculated by the autocorrelation function.
	 * @param {KMatrixInputData} [number] - Matrix to calculate the correlation.
	 * @returns {Matrix}
	 */
	xcorr(number) {
		return Signal.xcorr(this, number);
	}

	/**
	 * Create window function for signal processing.
	 * The following window functions are available.
	 * - "rectangle": Rectangular window
	 * - "hann": Hann/Hanning window.
	 * - "hamming": Hamming window.
	 * - "blackman": Blackman window.
	 * - "blackmanharris": Blackman-Harris window.
	 * - "blackmannuttall": Blackman-Nuttall window.
	 * - "flattop": Flat top window.
	 * - "sin", Half cycle sine window.
	 * - "vorbis", Vorbis window.
	 * @param {string} name - Window function name.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static window(name, size, periodic) {
		return Signal.window(name, size, periodic);
	}

	/**
	 * Hann (Hanning) window.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hann(size, periodic) {
		return Signal.hann(size, periodic);
	}
	
	/**
	 * Hamming window.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hamming(size, periodic) {
		return Signal.hamming(size, periodic);
	}
	
	/**
	 * FFT shift.
	 * Circular shift beginning at the center of the signal.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	fftshift(type) {
		return Signal.fftshift(this, type);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 定数
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * 1
	 * @returns {Matrix} 1
	 */
	static get ONE() {
		return new Matrix(1);
	}
	
	/**
	 * 2
	 * @returns {Matrix} 2
	 */
	static get TWO() {
		return new Matrix(2);
	}
	
	/**
	 * 10
	 * @returns {Matrix} 10
	 */
	static get TEN() {
		return new Matrix(10);
	}
	
	/**
	 * 0
	 * @returns {Matrix} 0
	 */
	static get ZERO() {
		return new Matrix(0);
	}

	/**
	 * -1
	 * @returns {Matrix} -1
	 */
	static get MINUS_ONE() {
		return new Matrix(-1);
	}

	/**
	 * i, j
	 * @returns {Matrix} i
	 */
	static get I() {
		return new Matrix(Complex.I);
	}

	/**
	 * PI.
	 * @returns {Matrix} 3.14...
	 */
	static get PI() {
		return new Matrix(Math.PI);
	}

	/**
	 * 0.25 * PI.
	 * @returns {Matrix} 0.78...
	 */
	static get QUARTER_PI() {
		return new Matrix(0.25 * Math.PI);
	}

	/**
	 * 0.5 * PI.
	 * @returns {Matrix} 1.57...
	 */
	static get HALF_PI() {
		return new Matrix(0.5 * Math.PI);
	}

	/**
	 * 2 * PI.
	 * @returns {Matrix} 6.28...
	 */
	static get TWO_PI() {
		return new Matrix(2.0 * Math.PI);
	}

	/**
	 * E, Napier's constant.
	 * @returns {Matrix} 2.71...
	 */
	static get E() {
		return new Matrix(Math.E);
	}

	/**
	 * log_e(2)
	 * @returns {Matrix} ln(2)
	 */
	static get LN2() {
		return new Matrix(Math.LN2);
	}

	/**
	 * log_e(10)
	 * @returns {Matrix} ln(10)
	 */
	static get LN10() {
		return new Matrix(Math.LN10);
	}

	/**
	 * log_2(e)
	 * @returns {Matrix} log_2(e)
	 */
	static get LOG2E() {
		return new Matrix(Math.LOG2E);
	}
	
	/**
	 * log_10(e)
	 * @returns {Matrix} log_10(e)
	 */
	static get LOG10E() {
		return new Matrix(Math.LOG10E);
	}
	
	/**
	 * sqrt(2)
	 * @returns {Matrix} sqrt(2)
	 */
	static get SQRT2() {
		return new Matrix(Math.SQRT2);
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {Matrix} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return new Matrix(Math.SQRT1_2);
	}
	
	/**
	 * 0.5
	 * @returns {Matrix} 0.5
	 */
	static get HALF() {
		return new Matrix(0.5);
	}

	/**
	 * Positive infinity.
	 * @returns {Matrix} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return new Matrix(Number.POSITIVE_INFINITY);
	}
	
	/**
	 * Negative Infinity.
	 * @returns {Matrix} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return new Matrix(Number.NEGATIVE_INFINITY);
	}

	/**
	 * Not a Number.
	 * @returns {Matrix} NaN
	 */
	static get NaN() {
		return new Matrix(Number.NaN);
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Matrix}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {Matrix} fix(A), trunc(A)
	 */
	trunc() {
		return this.fix();
	}

}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Complex type argument.
 * - Complex
 * - number
 * - boolean
 * - string
 * - Array<number>
 * - {_re:number,_im:number}
 * - {doubleValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @typedef {Complex|number|boolean|string|Array<number>|{_re:number,_im:number}|{doubleValue:number}|{toString:function}} KComplexInputData
 */

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
class Complex extends KonpeitoFloat {

	/**
	 * Create a complex number.
	 * 
	 * Initialization can be performed as follows.
	 * - 1200, "1200", "12e2", "1.2e3"
	 * - "3 + 4i", "4j + 3", [3, 4].
	 * @param {KComplexInputData} number - Complex number. See how to use the function.
	 */
	constructor(number) {
		super();
		
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
			else if(typeof obj === "string") {
				const x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
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
			else if(typeof obj === "boolean") {
				this._re = obj ? 1 : 0;
				this._im = 0.0;
			}
			else if("doubleValue" in obj) {
				this._re = obj.doubleValue;
				this._im = 0.0;
			}
			else if(("_re" in obj) && ("_im" in obj)) {
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
	 * @param {KComplexInputData} number
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
	 * @param {KComplexInputData} number
	 * @returns {Complex}
	 */
	static valueOf(number) {
		return Complex.create(number);
	}
	
	/**
	 * Convert to Complex.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KComplexInputData} number 
	 * @returns {Complex}
	 * @private
	 */
	static _toComplex(number) {
		if(number instanceof Complex) {
			return number;
		}
		else if(number instanceof Matrix) {
			// @ts-ignore
			return Matrix._toComplex(number);
		}
		else {
			return new Complex(number);
		}
	}

	/**
	 * Convert to real number.
	 * @param {KComplexInputData} number 
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
	 * @param {KComplexInputData} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		return Math.trunc(Complex._toDouble(number));
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
		/**
		 * @type {function(number): string }
		 */
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
		/**
		 * @type {function(number): number }
		 */
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
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Complex} 
	 */
	sign() {
		if(!this.isFinite()) {
			if(this.isNaN() || this._im === Infinity || this._im === -Infinity) {
				return Complex.NaN;
			}
			if(this._re === Infinity) {
				return Complex.ONE;
			}
			else {
				return Complex.MINUS_ONE;
			}
		}
		if(this._im === 0) {
			if(this._re === 0) {
				return Complex.ZERO;
			}
			else {
				return new Complex(this._re > 0 ? 1 : -1);
			}
		}
		return this.div(this.norm);
	}
	
	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A + B
	 */
	add(number) {
		const A = this;
		const B = new Complex(number);
		B._re = A._re + B._re;
		B._im = A._im + B._im;
		return B;
	}

	/**
	 * Subtract.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A - B
	 */
	sub(number) {
		const A = this;
		const B = new Complex(number);
		B._re = A._re - B._re;
		B._im = A._im - B._im;
		return B;
	}

	/**
	 * Multiply.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * B
	 */
	mul(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re * B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = - A._im * B._im;
			B._im = 0;
			return B;
		}
		else {
			const re = A._re * B._re - A._im * B._im;
			const im = A._im * B._re + A._re * B._im;
			B._re = re;
			B._im = im;
			return B;
		}
	}
	
	/**
	 * Inner product/Dot product.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * conj(B)
	 */
	dot(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re * B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = A._im * B._im;
			B._im = 0;
			return B;
		}
		else {
			const re =   A._re * B._re + A._im * B._im;
			const im = - A._im * B._re + A._re * B._im;
			B._re = re;
			B._im = im;
			return B;
		}
	}
	
	/**
	 * Divide.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A / B
	 */
	div(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im === 0) && (B._im === 0)) {
			B._re = A._re / B._re;
			return B;
		}
		else if((A._re === 0) && (B._re === 0)) {
			B._re = A._im / B._im;
			B._im = 0;
			return B;
		}
		else {
			const re = A._re * B._re + A._im * B._im;
			const im = A._im * B._re - A._re * B._im;
			const denominator = 1.0 / (B._re * B._re + B._im * B._im);
			B._re = re * denominator;
			B._im = im * denominator;
			return B;
		}
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KComplexInputData} number - Divided value (real number only).
	 * @returns {Complex} A rem B
	 */
	rem(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im !== 0) || (B._im !== 0)) {
			throw "calculation method is undefined.";
		}
		if(!A.isFinite() || !B.isFinite() || B.isZero()) {
			return Complex.NaN;
		}
		B._re = A._re - B._re * (Math.trunc(A._re / B._re));
		return B;
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Divisor.
	 * @param {KComplexInputData} number - Divided value (real number only).
	 * @returns {Complex} A mod B
	 */
	mod(number) {
		const A = this;
		const B = new Complex(number);
		if((A._im !== 0) || (B._im !== 0)) {
			throw "calculation method is undefined.";
		}
		if(B.isZero()) {
			return A;
		}
		const ret = A.rem(B);
		if(!A.equalsState(B)) {
			return ret.add(B);
		}
		else {
			return ret;
		}
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

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return !this.isZero() && !this.isNaN();
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		const value = this._re;
		const delta = Math.abs(value - Math.trunc(value));
		if(delta < Number.EPSILON) {
			return Math.round(value);
		}
		else {
			return Math.trunc(value);
		}
	}

	/**
	 * floating point.
	 * @returns {number}
	 */
	get doubleValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		const value = this._re;
		const delta = Math.abs(value - Math.trunc(value));
		if(delta < Number.EPSILON) {
			return Math.round(value);
		}
		else {
			return value;
		}
	}

	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return new BigInteger(this.intValue);
	}
	
	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(mc) {
			return new BigDecimal([this.doubleValue, mc]);
		}
		else {
			return new BigDecimal(this.doubleValue);
		}
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return new Fraction(this.doubleValue);
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return this;
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
	 * @param {KComplexInputData} number
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		const A = this;
		const B = Complex._toComplex(number);
		// 無限大、非数の値も含めて一度確認
		if(A.isNaN() || B.isNaN()) {
			return false;
		}
		if((A._re === B._re) && (A._im === B._im)) {
			return true;
		}
		// 誤差を含んだ値の比較
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(A._re - B._re) <  tolerance_) && (Math.abs(A._im - B._im) < tolerance_);
	}

	/**
	 * Numeric type match.
	 * @param {KComplexInputData} number 
	 * @returns {boolean}
	 */
	equalsState(number) {
		const A = this;
		const B = Complex._toComplex(number);
		/**
		 * @param {Complex} num
		 * @returns {number}
		 */
		const getState = function(num) {
			if(num.isZero()) {
				return 0;
			}
			if(!num.isFinite()) {
				if(num.isPositiveInfinity()) {
					return 4;
				}
				else if(num.isNegativeInfinity()) {
					return 5;
				}
				else {
					return 3;
				}
			}
			return num.isPositive() ? 1 : 2;
		};
		const A_type = getState(A);
		const B_type = getState(B);
		return A_type === B_type;
	}

	/**
	 * Compare values.
	 * @param {KComplexInputData} number
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const A = this;
		const B = Complex._toComplex(number);
		if(!A.isFinite() || !B.isFinite()) {
			if(A.equals(B)) {
				return 0;
			}
			else if(
				A.isNaN() || B.isNaN() ||
				(A.real ===  Infinity && A.imag === -Infinity) ||
				(A.real === -Infinity && A.imag ===  Infinity) ||
				(B.real ===  Infinity && B.imag === -Infinity) ||
				(B.real === -Infinity && B.imag ===  Infinity) ) {
				return NaN;
			}
			else if(A.isFinite()) {
				return B.real + B.imag < 0 ? 1 : -1;
			}
			else if(B.isFinite()) {
				return A.real + A.imag > 0 ? 1 : -1;
			}
			else {
				return NaN;
			}
		}
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		const a = A.real + A.imag;
		const b = B.real + B.imag;
		if((Math.abs(a - b) <= tolerance_)) {
			return 0;
		}
		return a > b ? 1 : -1;
	}
	
	/**
	 * Maximum number.
	 * @param {KComplexInputData} number
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
	 * @param {KComplexInputData} number
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
	 * @param {KComplexInputData} min 
	 * @param {KComplexInputData} max
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
	 * @returns {Complex} fix(A), trunc(A)
	 */
	fix() {
		return new Complex([Math.trunc(this._re), Math.trunc(this._im)]);
	}

	/**
	 * Fraction.
	 * @returns {Complex} fract(A)
	 */
	fract() {
		return new Complex([this._re - Math.floor(this._re), this._im - Math.floor(this._im)]);
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
	 * @param {KComplexInputData} number
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
	 * Cube root.
	 * @param {KComplexInputData} [n=0] - Value type(0,1,2)
	 * @returns {Complex} cbrt(A)
	 */
	cbrt(n) {
		const type = Complex._toInteger(n !== undefined ? n : 0);
		const x = this.log().div(3).exp();
		if(type === 0) {
			return x;
		}
		else if(type === 1) {
			return x.mul([-0.5, Math.sqrt(3) * 0.5]);
		}
		else {
			return x.mul([-0.5, - Math.sqrt(3) * 0.5]);
		}
	}

	/**
	 * Reciprocal square root.
	 * @returns {Complex} rsqrt(A)
	 */
	rsqrt() {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(1.0 / Math.sqrt(this._re));
			}
			else {
				return new Complex([0, - 1.0 / Math.sqrt(-this._re)]);
			}
		}
		return this.sqrt().inv();
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

	/**
	 * e^x - 1
	 * @returns {Complex} expm1(A)
	 */
	expm1() {
		return this.exp().sub(1);
	}

	/**
	 * ln(1 + x)
	 * @returns {Complex} log1p(A)
	 */
	log1p() {
		return this.add(1).log();
	}
	
	/**
	 * log_2(x)
	 * @returns {Complex} log2(A)
	 */
	log2() {
		return this.log().div(Complex.LN2);
		
	}

	/**
	 * log_10(x)
	 * @returns {Complex} log10(A)
	 */
	log10() {
		return this.log().div(Complex.LN10);
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
	 * @param {KComplexInputData} [number] - X
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
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {Complex} asin(A)
	 */
	asin() {
		// 逆正弦
		return this.mul(Complex.I).add(Complex.ONE.sub(this.square()).sqrt()).log().mul(Complex.MINUS_I);
	}

	/**
	 * Arc cosine function.
	 * @returns {Complex} acos(A)
	 */
	acos() {
		// 逆余弦
		return this.add(Complex.I.mul(Complex.ONE.sub(this.square()).sqrt())).log().mul(Complex.MINUS_I);
	}
	

	/**
	 * Hyperbolic sine function.
	 * @returns {Complex} sinh(A)
	 */
	sinh() {
		// 双曲線正弦
		const y = this.exp();
		return y.sub(y.inv()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {Complex} asinh(A)
	 */
	asinh() {
		// 逆双曲線正弦 Math.log(x + Math.sqrt(x * x + 1));
		if(this.isInfinite()) {
			return this;
		}
		return this.add(this.mul(this).add(1).sqrt()).log();
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {Complex} cosh(A)
	 */
	cosh() {
		// 双曲線余弦
		return this.exp().add(this.negate().exp()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {Complex} acosh(A)
	 */
	acosh() {
		// 逆双曲線余弦 Math.log(x + Math.sqrt(x * x - 1));
		// Octave だと log(0.5+(0.5*0.5-1)^0.5) !== acosh(0.5) になる。
		// おそらく log(0.5-(0.5*0.5-1)^0.5) の式に切り替わるようになっている
		// これは2つの値を持っているためだと思われるので合わせてみる
		if(this.isZero()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		if(this.compareTo(Complex.ONE) >= 1) {
			return this.add(this.square().sub(1).sqrt()).log();
		}
		else {
			return this.sub(this.square().sub(1).sqrt()).log();
		}
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {Complex} tanh(A)
	 */
	tanh() {
		// 双曲線正接
		if(this.isNaN()) {
			return Complex.NaN;
		}
		const y =  this.mul(2).exp();
		if(y.isZero()) {
			return Complex.MINUS_ONE;
		}
		else if(y.isPositiveInfinity()) {
			return Complex.ONE;
		}
		return y.sub(1).div(y.add(1));
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {Complex} atanh(A)
	 */
	atanh() {
		// 逆双曲線正接
		if(this.isInfinite() && this.isReal()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		return this.add(1).div(this.negate().add(1)).log().mul(0.5);
	}

	/**
	 * Secant function.
	 * @returns {Complex} sec(A)
	 */
	sec() {
		// 正割
		return this.cos().inv();
	}

	/**
	 * Reverse secant function.
	 * @returns {Complex} asec(A)
	 */
	asec() {
		// 逆正割
		return this.inv().acos();
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {Complex} sech(A)
	 */
	sech() {
		// 双曲線正割
		return this.exp().add(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {Complex} asech(A)
	 */
	asech() {
		// 逆双曲線正割
		if(this.isInfinite() && this.isReal()) {
			return new Complex([0, Math.PI * 0.5]);
		}
		if(this.isPositive() || (this.compareTo(Complex.MINUS_ONE) == -1)) {
			return this.inv().add(this.square().inv().sub(1).sqrt()).log();
		}
		else {
			return this.inv().sub(this.square().inv().sub(1).sqrt()).log();
		}
	}

	/**
	 * Cotangent function.
	 * @returns {Complex} cot(A)
	 */
	cot() {
		// 余接
		return this.tan().inv();
	}

	/**
	 * Inverse cotangent function.
	 * @returns {Complex} acot(A)
	 */
	acot() {
		// 逆余接
		return this.inv().atan();
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {Complex} coth(A)
	 */
	coth() {
		// 双曲線余接
		if(this.isZero()) {
			return Complex.POSITIVE_INFINITY;
		}
		return this.tanh().inv();
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {Complex} acoth(A)
	 */
	acoth() {
		// 逆双曲線余接
		if(this.isInfinite()) {
			return Complex.ZERO;
		}
		return this.add(1).div(this.sub(1)).log().mul(0.5);
	}

	/**
	 * Cosecant function.
	 * @returns {Complex} csc(A)
	 */
	csc() {
		// 余割
		return this.sin().inv();
	}

	/**
	 * Inverse cosecant function.
	 * @returns {Complex} acsc(A)
	 */
	acsc() {
		// 逆余割
		return this.inv().asin();
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {Complex} csch(A)
	 */
	csch() {
		// 双曲線余割
		return this.exp().sub(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {Complex} acsch(A)
	 */
	acsch() {
		// 逆双曲線余割
		return this.inv().add(this.square().inv().add(1).sqrt()).log();
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
	// 乱数
	// ----------------------
	
	/**
	 * Create random values with uniform random numbers.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Complex}
	 */
	static rand(random) {
		const rand = (random !== undefined && random instanceof Random) ? random : random_class;
		return new Complex(rand.nextDouble());
	}

	/**
	 * Create random values with normal distribution.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Complex}
	 */
	static randn(random) {
		const rand = (random !== undefined && random instanceof Random) ? random : random_class;
		return new Complex(rand.nextGaussian());
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - Math.trunc(this._re)) < tolerance_);
	}

	/**
	 * Returns true if the vallue is complex integer (including normal integer).
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} real(A) === integer && imag(A) === integer
	 */
	isComplexInteger(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - Math.trunc(this._re)) < tolerance_) &&
				(Math.abs(this._im - Math.trunc(this._im)) < tolerance_);
	}

	/**
	 * this === 0
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 0
	 */
	isZero(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance_) && (Math.abs(this._im) < tolerance_);
	}

	/**
	 * this === 1
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} A === 1
	 */
	isOne(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance_) && (Math.abs(this._im) < tolerance_);
	}

	/**
	 * Returns true if the vallue is complex number (imaginary part is not 0).
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) !== 0
	 */
	isComplex(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance_);
	}
	
	/**
	 * Return true if the value is real number.
	 * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
	 * @returns {boolean} imag(A) === 0
	 */
	isReal(tolerance) {
		const tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance_);
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
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this._re === Number.POSITIVE_INFINITY || this._im === Number.POSITIVE_INFINITY;
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this._re === Number.NEGATIVE_INFINITY || this._im === Number.NEGATIVE_INFINITY;
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
	// 確率
	// ----------------------
	
	/**
	 * Log-gamma function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	gammaln() {
		return new Complex(Probability.gammaln(this._re));
	}
	
	/**
	 * Gamma function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	gamma() {
		return new Complex(Probability.gamma(this._re));
	}
	
	/**
	 * Incomplete gamma function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	gammainc(a, tail) {
		const a_ = Complex._toDouble(a);
		return new Complex(Probability.gammainc(this._re, a_, tail));
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gampdf(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gampdf(this._re, k_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gamcdf(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gamcdf(this._re, k_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - Shape parameter.
	 * @param {KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	gaminv(k, s) {
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(Probability.gaminv(this._re, k_, s_));
	}

	/**
	 * Beta function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} y
	 * @returns {Complex}
	 */
	beta(y) {
		const y_ = Complex._toDouble(y);
		return new Complex(Probability.beta(this._re, y_));
	}

	/**
	 * Incomplete beta function.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	betainc(a, b, tail) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betainc(this._re, a_, b_, tail));
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betapdf(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betapdf(this._re, a_, b_));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betacdf(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betacdf(this._re, a_, b_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} a
	 * @param {KComplexInputData} b
	 * @returns {Complex}
	 */
	betainv(a, b) {
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(Probability.betainv(this._re, a_, b_));
	}

	/**
	 * Factorial function, x!.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	factorial() {
		return new Complex(Probability.factorial(this._re));
	}

	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k
	 * @returns {Complex}
	 */
	nchoosek(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.nchoosek(this._re, k_));
	}
	
	/**
	 * Error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erf() {
		return new Complex(Probability.erf(this._re));
	}

	/**
	 * Complementary error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfc() {
		return new Complex(Probability.erfc(this._re));
	}

	/**
	 * Inverse function of Error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfinv() {
		return new Complex(Probability.erfinv(this._re));
	}

	/**
	 * Inverse function of Complementary error function.
	 * - Calculate from real values.
	 * @returns {Complex}
	 */
	erfcinv() {
		return new Complex(Probability.erfcinv(this._re));
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	normpdf(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.normpdf(this._re, u_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	normcdf(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.normcdf(this._re, u_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} [u=0.0] - Average value.
	 * @param {KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	norminv(u, s) {
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(Probability.norminv(this._re, u_, s_));
	}
	
	/**
	 * Probability density function (PDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} n
	 * @param {KComplexInputData} p
	 * @returns {Complex}
	 */
	binopdf(n, p) {
		const n_ = Complex._toDouble(n);
		const p_ = Complex._toDouble(p);
		return new Complex(Probability.binopdf(this._re, n_, p_));
	}

	/**
	 * Cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} n
	 * @param {KComplexInputData} p
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	binocdf(n, p, tail) {
		const n_ = Complex._toDouble(n);
		const p_ = Complex._toDouble(p);
		return new Complex(Probability.binocdf(this._re, n_, p_, tail));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} n
	 * @param {KComplexInputData} p
	 * @returns {Complex}
	 */
	binoinv(n, p) {
		const n_ = Complex._toDouble(n);
		const p_ = Complex._toDouble(p);
		return new Complex(Probability.binoinv(this._re, n_, p_));
	}

	/**
	 * Probability density function (PDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} lambda
	 * @returns {Complex}
	 */
	poisspdf(lambda) {
		const lambda_ = Complex._toDouble(lambda);
		return new Complex(Probability.poisspdf(this._re, lambda_));
	}

	/**
	 * Cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} lambda
	 * @returns {Complex}
	 */
	poisscdf(lambda) {
		const lambda_ = Complex._toDouble(lambda);
		return new Complex(Probability.poisscdf(this._re, lambda_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} lambda
	 * @returns {Complex}
	 */
	poissinv(lambda) {
		const lambda_ = Complex._toDouble(lambda);
		return new Complex(Probability.poissinv(this._re, lambda_));
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tpdf(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tpdf(this._re, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tcdf(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tcdf(this._re, v_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tinv(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tinv(this._re, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @param {KComplexInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Complex}
	 */
	tdist(v, tails) {
		const v_ = Complex._toDouble(v);
		const tails_ = Complex._toInteger(tails);
		return new Complex(Probability.tdist(this._re, v_, tails_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * - Calculate from real values.
	 * @param {KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	tinv2(v) {
		const v_ = Complex._toDouble(v);
		return new Complex(Probability.tinv2(this._re, v_));
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2pdf(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2pdf(this._re, k_));
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2cdf(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2cdf(this._re, k_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	chi2inv(k) {
		const k_ = Complex._toDouble(k);
		return new Complex(Probability.chi2inv(this._re, k_));
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	fpdf(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.fpdf(this._re, d1_, d2_));
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	fcdf(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.fcdf(this._re, d1_, d2_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	finv(d1, d2) {
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(Probability.finv(this._re, d1_, d2_));
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A & B
	 */
	and(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src & n_tgt);
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A | B
	 */
	or(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src | n_tgt);
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} A ^ B
	 */
	xor(number) {
		const n_src = Math.round(this.real);
		const n_tgt = Math.round(Complex._toDouble(number));
		return new Complex(n_src ^ n_tgt);
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {Complex} !A
	 */
	not() {
		const n_src = Math.round(this.real);
		return new Complex(!n_src);
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KComplexInputData} n
	 * @returns {Complex} A << n
	 */
	shift(n) {
		const src = Math.round(this.real);
		const number = Math.round(Complex._toDouble(n));
		return new Complex(src << number);
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} gcd(x, y)
	 */
	gcd(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).gcd(y);
		return new Complex(result);
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Array<Complex>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).extgcd(y);
		return [new Complex(result[0]), new Complex(result[1]), new Complex(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} number 
	 * @returns {Complex} lcm(x, y)
	 */
	lcm(number) {
		const x = Math.round(this.real);
		const y = Math.round(Complex._toDouble(number));
		const result = new BigInteger(x).lcm(y);
		return new Complex(result);
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} exponent
	 * @param {KComplexInputData} m 
	 * @returns {Complex} A^B mod m
	 */
	modPow(exponent, m) {
		const A = Math.round(this.real);
		const B = Math.round(Complex._toDouble(exponent));
		const m_ = Math.round(Complex._toDouble(m));
		const result = new BigInteger(A).modPow(B, m_);
		return new Complex(result);
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} m
	 * @returns {Complex} A^(-1) mod m
	 */
	modInverse(m) {
		const A = Math.round(this.real);
		const m_ = Math.round(Complex._toDouble(m));
		const result = new BigInteger(A).modInverse(m_);
		return new Complex(result);
	}
	
	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Multiply a multiple of ten.
	 * @param {KComplexInputData} n
	 * @returns {Complex} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		return this.mul(Complex.TEN.pow(n));
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
		const src = new BigInteger(Math.round(this.real));
		return src.isPrime();
	}
	
	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KComplexInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const src = new BigInteger(Math.round(this.real));
		return src.isProbablePrime(certainty !== undefined ? Math.round(Complex._toDouble(certainty)) : undefined);
	}

	/**
	 * Next prime.
	 * @param {KComplexInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KComplexInputData} [search_max=100000] - Search range of next prime.
	 * @returns {Complex}
	 */
	nextProbablePrime(certainty, search_max) {
		const src = new BigInteger(Math.round(this.real));
		const p1 = certainty !== undefined ? Math.round(Complex._toDouble(certainty)) : undefined;
		const p2 = search_max !== undefined ? Math.round(Complex._toDouble(search_max)) : undefined;
		return new Complex(src.nextProbablePrime(p1, p2));
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 1
	 * @returns {Complex} 1
	 */
	static get ONE() {
		return DEFINE$1.ONE;
	}
	
	/**
	 * 2
	 * @returns {Complex} 2
	 */
	static get TWO() {
		return DEFINE$1.TWO;
	}
	
	/**
	 * 10
	 * @returns {Complex} 10
	 */
	static get TEN() {
		return DEFINE$1.TEN;
	}
	
	/**
	 * 0
	 * @returns {Complex} 0
	 */
	static get ZERO() {
		return DEFINE$1.ZERO;
	}

	/**
	 * -1
	 * @returns {Complex} -1
	 */
	static get MINUS_ONE() {
		return DEFINE$1.MINUS_ONE;
	}

	/**
	 * i, j
	 * @returns {Complex} i
	 */
	static get I() {
		return DEFINE$1.I;
	}

	/**
	 * - i, - j
	 * @returns {Complex} - i
	 */
	static get MINUS_I() {
		return DEFINE$1.MINUS_I;
	}

	/**
	 * PI.
	 * @returns {Complex} 3.14...
	 */
	static get PI() {
		return DEFINE$1.PI;
	}

	/**
	 * 0.25 * PI.
	 * @returns {Complex} 0.78...
	 */
	static get QUARTER_PI() {
		return DEFINE$1.QUARTER_PI;
	}

	/**
	 * 0.5 * PI.
	 * @returns {Complex} 1.57...
	 */
	static get HALF_PI() {
		return DEFINE$1.HALF_PI;
	}

	/**
	 * 2 * PI.
	 * @returns {Complex} 6.28...
	 */
	static get TWO_PI() {
		return DEFINE$1.TWO_PI;
	}

	/**
	 * E, Napier's constant.
	 * @returns {Complex} 2.71...
	 */
	static get E() {
		return DEFINE$1.E;
	}

	/**
	 * log_e(2)
	 * @returns {Complex} ln(2)
	 */
	static get LN2() {
		return DEFINE$1.LN2;
	}

	/**
	 * log_e(10)
	 * @returns {Complex} ln(10)
	 */
	static get LN10() {
		return DEFINE$1.LN10;
	}

	/**
	 * log_2(e)
	 * @returns {Complex} log_2(e)
	 */
	static get LOG2E() {
		return DEFINE$1.LOG2E;
	}
	
	/**
	 * log_10(e)
	 * @returns {Complex} log_10(e)
	 */
	static get LOG10E() {
		return DEFINE$1.LOG10E;
	}
	
	/**
	 * sqrt(2)
	 * @returns {Complex} sqrt(2)
	 */
	static get SQRT2() {
		return DEFINE$1.SQRT2;
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {Complex} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return DEFINE$1.SQRT1_2;
	}
	
	/**
	 * 0.5
	 * @returns {Complex} 0.5
	 */
	static get HALF() {
		return DEFINE$1.HALF;
	}

	/**
	 * Positive infinity.
	 * @returns {Complex} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE$1.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {Complex} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE$1.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {Complex} NaN
	 */
	static get NaN() {
		return DEFINE$1.NaN;
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Complex}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KComplexInputData} number
	 * @returns {Complex} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KComplexInputData} number
	 * @returns {Complex} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {Complex} fix(A), trunc(A)
	 */
	trunc() {
		return this.fix();
	}
	
}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE$1 = {

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
	 * - i, - j
	 */
	MINUS_I : new Complex([0, -1]),

	/**
	 * PI.
	 */
	PI : new Complex(Math.PI),

	/**
	 * 0.25 * PI.
	 */
	QUARTER_PI : new Complex(0.25 * Math.PI),

	/**
	 * 0.5 * PI.
	 */
	HALF_PI : new Complex(0.5 * Math.PI),

	/**
	 * 2 * PI.
	 */
	TWO_PI : new Complex(2.0 * Math.PI),

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

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Fraction type argument.
 * - Fraction
 * - BigInteger
 * - BigDecimal
 * - number
 * - boolean
 * - string
 * - Array<KBigIntegerInputData>
 * - {numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}
 * - {doubleValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 10, "10", "10/1", "10.0/1.0", ["10", "1"], [10, 1]
 * - 0.01, "0.01", "0.1e-1", "1/100", [1, 100], [2, 200], ["2", "200"]
 * - "1/3", "0.[3]", "0.(3)", "0.'3'", "0."3"", [1, 3], [2, 6]
 * - "3.555(123)" = 3.555123123123..., "147982 / 41625"
 * @typedef {Fraction|BigInteger|BigDecimal|number|boolean|string|Array<import("./BigInteger.js").KBigIntegerInputData>|{numerator:import("./BigInteger.js").KBigIntegerInputData,denominator:import("./BigInteger.js").KBigIntegerInputData}|{doubleValue:number}|{toString:function}} KFractionInputData
 */

/**
 * Collection of functions used in Fraction.
 * @ignore
 */
class FractionTool {

	/**
	 * Create data for Fraction from strings.
	 * @param ntext {string}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_number_string(ntext) {
		let scale = 0;
		let buff;
		let is_negate = false;
		// 正規化
		let text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		const number_text = [];
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				is_negate = true;
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
			if(!is_negate) {
				f = f.add(cyclic_decimal);
			}
			else {
				f = f.sub(cyclic_decimal);
			}
		}
		return f;
	}

	/**
	 * Create data for Fraction from fractional string.
	 * @param ntext {string}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_fraction_string(ntext) {
		// 特殊な状態
		if(/nan|inf/i.test(ntext)) {
			const ret = new Fraction();
			ret.denominator = BigInteger.ONE;
			if(/nan/i.test(ntext)) {
				ret.numerator = BigInteger.NaN;
			}
			else if(!/-/.test(ntext)) {
				ret.numerator = BigInteger.POSITIVE_INFINITY;
			}
			else {
				ret.numerator = BigInteger.NEGATIVE_INFINITY;
			}
			return ret;
		}
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
	 * Create data for Fraction from number.
	 * @param number {number|boolean}
	 * @return {Fraction}
	 */
	static to_fraction_data_from_number(number) {
		const value = typeof number !== "boolean" ? number : (number ? 1 : 0);
		let numerator = null;
		let denominator = null;
		if(!isFinite(value)) {
			const ret = new Fraction();
			ret.denominator = BigInteger.ONE;
			if(value === Infinity) {
				ret.numerator = BigInteger.POSITIVE_INFINITY;
			}
			else if(value === - Infinity) {
				ret.numerator = BigInteger.NEGATIVE_INFINITY;
			}
			else {
				ret.numerator = BigInteger.NaN;
			}
			return ret;
		}
		// 0.0
		else if(value === 0.0) {
			const ret = new Fraction();
			ret.denominator = BigInteger.ONE;
			ret.numerator = BigInteger.ZERO;
			return ret;
		}
		// 整数
		else if( Math.abs(value - Math.round(value)) <= Number.EPSILON) {
			numerator = new BigInteger(Math.round(value));
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
			// 最も下の桁は四捨五入する
			x = Math.round(x * 1e14) / 1e14;
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
	 * Normalization.
	 * - Reduce fraction using gcd.
	 * - Add the sign to the numerator.
	 * - If the number is zero, the denominator is one.
	 * @param value {Fraction}
	 * @returns {void}
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
class Fraction extends KonpeitoInteger {

	/**
	 * Create an fraction.
	 * 
	 * Initialization can be performed as follows.
	 * - 10, "10", "10/1", "10.0/1.0", ["10", "1"], [10, 1]
	 * - 0.01, "0.01", "0.1e-1", "1/100", [1, 100], [2, 200], ["2", "200"]
	 * - "1/3", "0.[3]", "0.(3)", "0.'3'", "0."3"", [1, 3], [2, 6]
	 * - "3.555(123)" = 3.555123123123..., "147982 / 41625"
	 * @param {KFractionInputData} [number] - Fraction data. See how to use the function.
	 */
	constructor(number) {
		super();
		
		// 分子
		/**
		 * numerator
		 * @type {BigInteger}
		 */
		this.numerator = null;

		// 分母
		/**
		 * denominator
		 * @type {BigInteger}
		 */
		this.denominator = null;

		if(arguments.length === 0) {
			this.numerator = BigInteger.ZERO;
			this.denominator = BigInteger.ONE;
		}
		else if(arguments.length === 1) {
			let is_normalization = false;
			if((typeof number === "number") || (typeof number === "boolean")) {
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
			else if(number instanceof BigDecimal) {
				const bigint = number.unscaledValue();
				if(!bigint.isFinite()) {
					this.numerator = bigint;
					this.denominator = BigInteger.ONE;
				}
				else {
					const value = new Fraction(number.unscaledValue());
					const x = value.scaleByPowerOfTen(-number.scale());
					this.numerator = x.numerator;
					this.denominator = x.denominator;
				}
			}
			else if(typeof number === "object") {
				if("doubleValue" in number) {
					const x = FractionTool.to_fraction_data_from_number(number.doubleValue);
					this.numerator = x.numerator;
					this.denominator = x.denominator;
				}
				else if(("numerator" in number) && ("denominator" in number)) {
					this.numerator = (number.numerator instanceof BigInteger) ? number.numerator : new BigInteger(number.numerator);
					this.denominator = (number.denominator instanceof BigInteger) ? number.denominator : new BigInteger(number.denominator);
					is_normalization = true;
				}
				else {
					const x1 = FractionTool.to_fraction_data_from_fraction_string(number.toString());
					this.numerator = x1.numerator;
					this.denominator = x1.denominator;
				}
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
	 * @param {KFractionInputData} number 
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
	 * @param {KFractionInputData} number 
	 * @returns {Fraction}
	 */
	static valueOf(number) {
		return Fraction.create(number);
	}

	/**
	 * Convert to Fraction.
	 * @param {KFractionInputData} number 
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
	 * @param {KFractionInputData} number 
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
	 * @param {KFractionInputData} number 
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
	 * Absolute value.
	 * @returns {Fraction} abs(A)
	 */
	abs() {
		if(!this.isFinite()) {
			return this.isNegativeInfinity() ? Fraction.POSITIVE_INFINITY : this;
		}
		if(this.sign() >= 0) {
			return this;
		}
		return this.negate();
	}

	/**
	 * this * -1
	 * @returns {Fraction} -A
	 */
	negate() {
		if(!this.isFinite()) {
			if(this.isPositiveInfinity()) {
				return Fraction.NEGATIVE_INFINITY;
			}
			else if(this.isNegativeInfinity()) {
				return Fraction.POSITIVE_INFINITY;
			}
			else {
				return this;
			}
		}
		return new Fraction([this.numerator.negate(), this.denominator]);
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
		return this.numerator.sign();
	}
	
	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		if(!this.isFinite()) {
			return this.isNaN() ? "NaN" : (this.isPositiveInfinity() ? "Infinity" : "-Infinity");
		}
		return this.numerator.toString() + " / " + this.denominator.toString();
	}

	// ----------------------
	// 四則演算
	// ----------------------
	
	/**
	 * Add.
	 * @param {KFractionInputData} num
	 * @return {Fraction} A + B
	 */
	add(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN() || (x.isInfinite() && y.isInfinite() && !x.equalsState(y))) {
				return Fraction.NaN;
			}
			else if(x.isPositiveInfinity() || y.isPositiveInfinity()) {
				return Fraction.POSITIVE_INFINITY;
			}
			else {
				return Fraction.NEGATIVE_INFINITY;
			}
		}
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
	 * @param {KFractionInputData} num
	 * @return {Fraction} A - B
	 */
	sub(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN() || x.equalsState(y)) {
				return Fraction.NaN;
			}
			else if(x.isNegativeInfinity() || y.isPositiveInfinity()) {
				return Fraction.NEGATIVE_INFINITY;
			}
			else {
				return Fraction.POSITIVE_INFINITY;
			}
		}
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
	 * @param {KFractionInputData} num
	 * @return {Fraction} A * B
	 */
	mul(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN() || (x.isZero() || y.isZero())) {
				return Fraction.NaN;
			}
			else if(x.sign() * y.sign() > 0) {
				return Fraction.POSITIVE_INFINITY;
			}
			else {
				return Fraction.NEGATIVE_INFINITY;
			}
		}
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
	 * @param {KFractionInputData} num
	 * @return {Fraction} A / B
	 */
	div(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN() || (x.isInfinite() && y.isInfinite())) {
				return Fraction.NaN;
			}
			else if(x.isInfinite()) {
				if(x.sign() * y.sign() >= 0) {
					return Fraction.POSITIVE_INFINITY;
				}
				else {
					return Fraction.NEGATIVE_INFINITY;
				}
			}
			else {
				return Fraction.ZERO;
			}
		}
		else if(y.isZero()) {
			if(x.isZero()) {
				return Fraction.NaN;
			}
			else {
				return x.sign() >= 0 ? Fraction.POSITIVE_INFINITY : Fraction.NEGATIVE_INFINITY;
			}
		}
		let f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator, y.numerator]);
		}
		else {
			f = new Fraction([ x.numerator.mul(y.denominator), y.numerator.mul(x.denominator)]);
		}
		return f;
	}

	/**
	 * Inverse number of this value.
	 * @return {Fraction} 1 / A
	 */
	inv() {
		{
			if(!this.isFinite()) {
				return this.isNaN() ? Fraction.NaN : Fraction.ZERO;
			}
			if(this.isZero()) {
				return Fraction.NaN;
			}
		}
		return new Fraction([ this.denominator, this.numerator]);
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KFractionInputData} num
	 * @return {Fraction} A rem B
	 */
	rem(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite() || y.isZero()) {
			return Fraction.NaN;
		}
		// x - y * fix(x/y)
		return x.sub(y.mul(x.div(y).fix()));
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Divisor.
	 * @param {KFractionInputData} num
	 * @returns {Fraction} A mod B
	 */
	mod(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(y.isZero()) {
			return x;
		}
		const ret = x.rem(y);
		if(!x.equalsState(y)) {
			return ret.add(y);
		}
		else {
			return ret;
		}
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * - Supports only integers.
	 * @param {KFractionInputData} num
	 * @returns {Fraction} pow(A, B)
	 */
	pow(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		{
			if(x.isNaN() || y.isNaN()) {
				return Fraction.NaN;
			}
			if(y.isZero()) {
				return Fraction.ONE;
			}
			else if(x.isZero()) {
				return Fraction.ZERO;
			}
			else if(x.isOne()) {
				return Fraction.ONE;
			}
			else if(x.isInfinite()) {
				if(x.isPositiveInfinity()) {
					return Fraction.POSITIVE_INFINITY;
				}
				else {
					if(y.isPositiveInfinity()) {
						return Fraction.NaN;
					}
					else {
						return new Fraction(Infinity * Math.pow(-1, Math.round(y.doubleValue)));
					}
				}
			}
			else if(y.isInfinite()) {
				if(x.isNegative()) {
					// 複素数
					return Fraction.NaN;
				}
				if(x.compareTo(Fraction.ONE) < 0) {
					if(y.isPositiveInfinity()) {
						return Fraction.ZERO;
					}
					else if(y.isNegativeInfinity()) {
						return Fraction.POSITIVE_INFINITY;
					}
				}
				else {
					if(y.isPositiveInfinity()) {
						return Fraction.POSITIVE_INFINITY;
					}
					else if(y.isNegativeInfinity()) {
						return Fraction.ZERO;
					}
				}
			}
		}
		const numerator = x.numerator.pow(y.intValue);
		const denominator = x.denominator.pow(y.intValue);
		return new Fraction([ numerator, denominator ]);
	}

	/**
	 * Square.
	 * @returns {Fraction} pow(A, 2)
	 */
	square() {
		return this.mul(this);
	}

	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Factorial function, x!.
	 * - Supports only integers.
	 * @returns {Fraction} n!
	 */
	factorial() {
		if(!this.isFinite()) {
			return this;
		}
		return new Fraction([this.toBigInteger().factorial(), Fraction.ONE]);
	}

	/**
	 * Multiply a multiple of ten.
	 * - Supports only integers.
	 * @param {KFractionInputData} n
	 * @returns {Fraction}
	 */
	scaleByPowerOfTen(n) {
		if(!this.isFinite()) {
			return this;
		}
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

	// ----------------------
	// 他の型に変換用
	// ----------------------
	
	/**
	 * boolean value.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return this.numerator.booleanValue;
	}

	/**
	 * integer value.
	 * @returns {number}
	 */
	get intValue() {
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
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
		if(!this.isFinite()) {
			return this.isNaN() ? NaN : (this.isPositiveInfinity() ? Infinity : -Infinity);
		}
		if(this.isInteger()) {
			return this.numerator.doubleValue;
		}
		const x = new BigDecimal([this.numerator, MathContext.UNLIMITED]);
		const y = new BigDecimal([this.denominator, MathContext.UNLIMITED]);
		return x.div(y, {context : MathContext.DECIMAL64}).doubleValue;
	}

	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return new BigInteger(this.fix().numerator);
	}
	
	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(!this.isFinite()) {
			return new BigDecimal(this.doubleValue);
		}
		if(this.isInteger()) {
			return new BigDecimal(this.numerator);
		}
		const x = new BigDecimal([this.numerator, MathContext.UNLIMITED]);
		const y = new BigDecimal([this.denominator, MathContext.UNLIMITED]);
		if(mc) {
			return x.div(y, {context: mc});
		}
		else {
			return x.div(y, {context: BigDecimal.getDefaultContext()});
		}
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return this;
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
	 * @param {KFractionInputData} num
	 * @returns {boolean} A === B
	 */
	equals(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			if(x.isNaN() || y.isNaN()) {
				return false;
			}
			else if(x.equalsState(y)) {
				return true;
			}
			else {
				return false;
			}
		}
		return x.numerator.equals(y.numerator) && x.denominator.equals(y.denominator);
	}

	/**
	 * Numeric type match.
	 * @param {KFractionInputData} number 
	 * @returns {boolean}
	 */
	equalsState(number) {
		const x = this;
		const y = Fraction._toFraction(number);
		return x.numerator.equalsState(y.numerator);
	}

	/**
	 * Compare values.
	 * @param {KFractionInputData} num
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(num) {
		const x = this;
		const y = Fraction._toFraction(num);
		if(!x.isFinite() || !y.isFinite()) {
			return x.numerator.compareTo(y.numerator);
		}
		return x.sub(y).sign();
	}

	/**
	 * Maximum number.
	 * @param {KFractionInputData} number
	 * @returns {Fraction} max([A, B])
	 */
	max(number) {
		const val = Fraction._toFraction(number);
		if(this.isNaN() || val.isNaN()) {
			return Fraction.NaN;
		}
		if(this.compareTo(val) >= 0) {
			return this;
		}
		else {
			return val;
		}
	}

	/**
	 * Minimum number.
	 * @param {KFractionInputData} number
	 * @returns {Fraction} min([A, B])
	 */
	min(number) {
		const val = Fraction._toFraction(number);
		if(this.isNaN() || val.isNaN()) {
			return Fraction.NaN;
		}
		if(this.compareTo(val) >= 0) {
			return val;
		}
		else {
			return this;
		}
	}

	/**
	 * Clip number within range.
	 * @param {KFractionInputData} min 
	 * @param {KFractionInputData} max
	 * @returns {Fraction} min(max(x, min), max)
	 */
	clip(min, max) {
		const min_ = Fraction._toFraction(min);
		const max_ = Fraction._toFraction(max);
		if(this.isNaN() || min_.isNaN() || max_.isNaN()) {
			return Fraction.NaN;
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
	// 丸め
	// ----------------------
	
	/**
	 * Floor.
	 * @returns {Fraction} floor(A)
	 */
	floor() {
		if(this.isInteger() || !this.isFinite()) {
			return this;
		}
		const x = this.fix();
		if(this.sign() > 0) {
			return x;
		}
		else {
			return new Fraction([x.numerator.sub(BigInteger.ONE), Fraction.ONE]);
		}
	}

	/**
	 * Ceil.
	 * @returns {Fraction} ceil(A)
	 */
	ceil() {
		if(this.isInteger() || !this.isFinite()) {
			return this;
		}
		const x = this.fix();
		if(this.sign() > 0) {
			return new Fraction([x.numerator.add(BigInteger.ONE), Fraction.ONE]);
		}
		else {
			return x;
		}
	}
	
	/**
	 * Rounding to the nearest integer.
	 * @returns {Fraction} round(A)
	 */
	round() {
		if(this.isInteger() || !this.isFinite()) {
			return this;
		}
		const x = this.floor();
		const fract = this.sub(x);
		if(fract.compareTo(Fraction.HALF) >= 0) {
			return new Fraction([x.numerator.add(BigInteger.ONE), Fraction.ONE]);
		}
		else {
			return x;
		}
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {Fraction} fix(A), trunc(A)
	 */
	fix() {
		if(this.isInteger() || !this.isFinite()) {
			return this;
		}
		return new Fraction([this.numerator.div(this.denominator), Fraction.ONE]);
	}

	/**
	 * Fraction.
	 * @returns {Fraction} fract(A)
	 */
	fract() {
		if(!this.isFinite()) {
			return Fraction.NaN;
		}
		if(this.isInteger()) {
			return Fraction.ZERO;
		}
		return this.sub(this.floor());
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Return true if the value is integer.
	 * @return {boolean}
	 */
	isInteger() {
		if(!this.isFinite()) {
			return false;
		}
		return this.denominator.equals(BigInteger.ONE);
	}

	/**
	 * this === 0
	 * @return {boolean} A === 0
	 */
	isZero() {
		if(!this.isFinite()) {
			return false;
		}
		return this.numerator.isZero();
	}

	/**
	 * this === 1
	 * @return {boolean} A === 1
	 */
	isOne() {
		if(!this.isFinite()) {
			return false;
		}
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
	 * this === NaN
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return this.numerator.isNaN();
	}
	
	/**
	 * this === Infinity
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this.numerator.isPositiveInfinity();
	}

	/**
	 * this === -Infinity
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this.numerator.isNegativeInfinity();
	}

	/**
	 * this === Infinity or -Infinity
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return this.numerator.isInfinite();
	}
	
	/**
	 * Return true if the value is finite number.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return this.numerator.isFinite();
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Fraction} A & B
	 */
	and(number) {
		const n_src = this;
		const n_tgt = Fraction._toFraction(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new Fraction(src.and(tgt));
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Fraction} A | B
	 */
	or(number) {
		const n_src = this;
		const n_tgt = Fraction._toFraction(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new Fraction(src.or(tgt));
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Fraction} A ^ B
	 */
	xor(number) {
		const n_src = this;
		const n_tgt = Fraction._toFraction(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new Fraction(src.xor(tgt));
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {Fraction} !A
	 */
	not() {
		const n_src = this;
		const src	= n_src.round().toBigInteger();
		return new Fraction(src.not());
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KFractionInputData} n
	 * @returns {Fraction} A << n
	 */
	shift(n) {
		const src		= this.round().toBigInteger();
		const number	= Fraction._toInteger(n);
		return new Fraction(src.shift(number));
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Fraction} gcd(x, y)
	 */
	gcd(number) {
		const x = this.round().toBigInteger();
		const y = Fraction._toFraction(number).toBigInteger();
		const result = x.gcd(y);
		return new Fraction(result);
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Array<Fraction>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		const x = this.round().toBigInteger();
		const y = Fraction._toFraction(number).toBigInteger();
		const result = x.extgcd(y);
		return [new Fraction(result[0]), new Fraction(result[1]), new Fraction(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} number 
	 * @returns {Fraction} lcm(x, y)
	 */
	lcm(number) {
		const x = this.round().toBigInteger();
		const y = Fraction._toFraction(number).toBigInteger();
		const result = x.lcm(y);
		return new Fraction(result);
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} exponent
	 * @param {KFractionInputData} m 
	 * @returns {Fraction} A^B mod m
	 */
	modPow(exponent, m) {
		const A = this.round().toBigInteger();
		const B = Fraction._toFraction(exponent).toBigInteger();
		const m_ = Fraction._toFraction(m).toBigInteger();
		const result = A.modPow(B, m_);
		return new Fraction(result);
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KFractionInputData} m
	 * @returns {Fraction} A^(-1) mod m
	 */
	modInverse(m) {
		const A = this.round().toBigInteger();
		const m_ = Fraction._toFraction(m).toBigInteger();
		const result = A.modInverse(m_);
		return new Fraction(result);
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
	 * @param {KFractionInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		const src = this.round().toBigInteger();
		return src.isProbablePrime(certainty !== undefined ? Fraction._toInteger(certainty) : undefined);
	}

	/**
	 * Next prime.
	 * @param {KFractionInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KFractionInputData} [search_max=100000] - Search range of next prime.
	 * @returns {Fraction}
	 */
	nextProbablePrime(certainty, search_max) {
		const src = this.round().toBigInteger();
		const p1 = certainty !== undefined ? Fraction._toInteger(certainty) : undefined;
		const p2 = search_max !== undefined ? Fraction._toInteger(search_max) : undefined;
		return new Fraction(src.nextProbablePrime(p1, p2));
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * -1
	 * @returns {Fraction} -1
	 */
	static get MINUS_ONE() {
		if(DEFINE$2.MINUS_ONE === null) {
			DEFINE$2.MINUS_ONE = new Fraction([BigInteger.MINUS_ONE, BigInteger.ONE]);
		}
		return DEFINE$2.MINUS_ONE;
	}

	/**
	 * 0
	 * @returns {Fraction} 0
	 */
	static get ZERO() {
		if(DEFINE$2.ZERO === null) {
			DEFINE$2.ZERO = new Fraction([BigInteger.ZERO, BigInteger.ONE]);
		}
		return DEFINE$2.ZERO;
	}

	/**
	 * 0.5
	 * @returns {Fraction} 0.5
	 */
	static get HALF() {
		if(DEFINE$2.HALF === null) {
			DEFINE$2.HALF = new Fraction([BigInteger.ONE, BigInteger.TWO]);
		}
		return DEFINE$2.HALF;
	}
	
	/**
	 * 1
	 * @returns {Fraction} 1
	 */
	static get ONE() {
		if(DEFINE$2.ONE === null) {
			DEFINE$2.ONE = new Fraction([BigInteger.ONE, BigInteger.ONE]);
		}
		return DEFINE$2.ONE;
	}
	
	/**
	 * 2
	 * @returns {Fraction} 2
	 */
	static get TWO() {
		if(DEFINE$2.TWO === null) {
			DEFINE$2.TWO = new Fraction([BigInteger.TWO, BigInteger.ONE]);
		}
		return DEFINE$2.TWO;
	}
	
	/**
	 * 10
	 * @returns {Fraction} 10
	 */
	static get TEN() {
		if(DEFINE$2.TEN === null) {
			DEFINE$2.TEN = new Fraction([BigInteger.TEN, BigInteger.ONE]);
		}
		return DEFINE$2.TEN;
	}

	/**
	 * Positive infinity.
	 * @returns {Fraction} Infinity
	 */
	static get POSITIVE_INFINITY() {
		if(DEFINE$2.POSITIVE_INFINITY === null) {
			DEFINE$2.POSITIVE_INFINITY = new Fraction(Number.POSITIVE_INFINITY);
		}
		return DEFINE$2.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {Fraction} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		if(DEFINE$2.NEGATIVE_INFINITY === null) {
			DEFINE$2.NEGATIVE_INFINITY = new Fraction(Number.NEGATIVE_INFINITY);
		}
		return DEFINE$2.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {Fraction} NaN
	 */
	static get NaN() {
		if(DEFINE$2.NaN === null) {
			DEFINE$2.NaN = new Fraction(Number.NaN);
		}
		return DEFINE$2.NaN;
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
	 * @param {KFractionInputData} number
	 * @returns {Fraction} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KFractionInputData} number
	 * @returns {Fraction} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KFractionInputData} number
	 * @returns {Fraction} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KFractionInputData} number
	 * @returns {Fraction} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}

}

/**
 * Collection of constant values used in the class.
 * @ignore
 */
const DEFINE$2 = {

	/**
	 * -1
	 * @type {any}
	 */
	MINUS_ONE : null,

	/**
	 * 0
	 * @type {any}
	 */
	ZERO : null,
	
	/**
	 * 1
	 * @type {any}
	 */
	ONE : null,

	/**
	 * 0.5
	 * @type {any}
	 */
	HALF : null,

	/**
	 * 2
	 * @type {any}
	 */
	TWO : null,

	/**
	 * 10
	 * @type {any}
	 */
	TEN : null,
	
	/**
	 * Positive infinity.
	 * @type {any}
	 */
	POSITIVE_INFINITY : null,

	/**
	 * Negative Infinity.
	 * @type {any}
	 */
	NEGATIVE_INFINITY : null,

	/**
	 * Not a Number.
	 * @type {any}
	 */
	NaN : null,

};

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

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
	 * @param {number|boolean} number - Target number.
	 * @returns {{element : Array<number>, state : number}} Data for BigInteger.
	 */
	static toBigIntegerFromNumber(number) {
		const value = typeof number !== "boolean" ? number : (number ? 1 : 0);
		if(!isFinite(value)) {
			if(value === Number.POSITIVE_INFINITY) {
				return {
					state : BIGINTEGER_NUMBER_STATE.POSITIVE_INFINITY,
					element : []
				};
			}
			if(value === Number.NEGATIVE_INFINITY) {
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
		if(Math.abs(value) < 1.0 - Number.EPSILON) {
			return {
				element : [],
				state : BIGINTEGER_NUMBER_STATE.ZERO
			};
		}
		else if(value > 0) {
			state = BIGINTEGER_NUMBER_STATE.POSITIVE_NUMBER;
			x = value;
		}
		else {
			state = BIGINTEGER_NUMBER_STATE.NEGATIVE_NUMBER;
			x = -value;
		}
		if(x > 0xFFFFFFFF) {
			return {
				element : BigIntegerTool.toHexadecimalArrayFromPlainString(BigIntegerTool.toPlainStringFromString(x.toFixed()), 10),
				state : state
			};
		}
		else {
			if( Math.abs(value - Math.round(value)) <= Number.EPSILON) {
				x = Math.round(x);
			}
			else {
				x = Math.trunc(x);
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
class BigInteger extends KonpeitoInteger {

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
		super();
		
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
				const x = BigIntegerTool.toBigIntegerFromNumber(number);
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
	 * Inverse number of this value.
	 * @returns {BigInteger} 1 / A
	 */
	inv() {
		{
			if(!this.isFinite()) {
				return this.isNaN() ? BigInteger.NaN : BigInteger.ZERO;
			}
			if(this.isZero()) {
				return BigInteger.NaN;
			}
		}
		return BigInteger.ZERO;
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
	// 丸め
	// ----------------------
	
	/**
	 * Floor.
	 * @returns {BigInteger} floor(A)
	 */
	floor() {
		return this;
	}

	/**
	 * Ceil.
	 * @returns {BigInteger} ceil(A)
	 */
	ceil() {
		return this;
	}
	
	/**
	 * Rounding to the nearest integer.
	 * @returns {BigInteger} round(A)
	 */
	round() {
		return this;
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {BigInteger} fix(A), trunc(A)
	 */
	fix() {
		return this;
	}

	/**
	 * Fraction.
	 * @returns {BigInteger} fract(A)
	 */
	fract() {
		return BigInteger.ZERO;
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
		if(this.state !== BIGINTEGER_NUMBER_STATE.ZERO && ((s1 === 1)||(s2 === 1))) {
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
		return DEFINE$3.MINUS_ONE;
	}
	
	/**
	 * 0
	 * @returns {BigInteger} 0
	 */
	static get ZERO() {
		return DEFINE$3.ZERO;
	}

	/**
	 * 1
	 * @returns {BigInteger} 1
	 */
	static get ONE() {
		return DEFINE$3.ONE;
	}
	
	/**
	 * 2
	 * @returns {BigInteger} 2
	 */
	static get TWO() {
		return DEFINE$3.TWO;
	}
	
	/**
	 * 10
	 * @returns {BigInteger} 10
	 */
	static get TEN() {
		return DEFINE$3.TEN;
	}

	/**
	 * Positive infinity.
	 * @returns {BigInteger} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return DEFINE$3.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {BigInteger} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return DEFINE$3.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {BigInteger} NaN
	 */
	static get NaN() {
		return DEFINE$3.NaN;
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
const DEFINE$3 = {

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

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */


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
 * @type {MathContext[]}
 * @ignore
 */
const DEFAULT_CONTEXT_ = [];
DEFAULT_CONTEXT_[0] = MathContext.DECIMAL128;

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
		// 0.0
		else if(value === 0) {
			return {
				scale : 0,
				integer : BigInteger.ZERO
			};
		}
		// 整数
		else if((Math.abs(value) >= 1.0 - Number.EPSILON) && ((Math.abs(value - Math.round(value)) <= Number.EPSILON))) {
			// 1以上の場合は誤差が計算範囲外なら無視して整数扱いする
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
class BigDecimal extends KonpeitoFloat {
	
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
		super();

		/**
		 * The scale of this BigDecimal.
		 * @private
		 * @ignore
		 * @type {number}
		 */
		this._scale	= 0;
		
		/**
		 * Context used during initialization.
		 * @private
		 * @ignore
		 * @type {MathContext}
		 */
		this.context = BigDecimal.getDefaultContext();

		// この値がtrueの場合は最後に正規化を実行する
		let is_set_context = false;

		if(arguments.length > 1) {
			throw "BigDecimal Unsupported argument[" + arguments.length + "]";
		}
		if(number instanceof BigDecimal) {

			/**
			 * Integer part.
			 * @private
			 * @ignore
			 * @type {BigInteger}
			 */
			this.integer			= number.integer.clone();

			/**
			 * Integer part of string (for cache).
			 * @private
			 * @ignore
			 * @type {string}
			 */
			this.int_string			= number.int_string;

			this._scale				= number._scale;
			this.context			= number.context;

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
						this.context = ((number[2] !== undefined) && (number[2] instanceof MathContext)) ? number[2] : BigDecimal.getDefaultContext();
						is_set_context = true;
					}
				}
				else {
					if(number.length >= 2) {
						this.context = ((number[1] !== undefined) && (number[1] instanceof MathContext)) ? number[1] : BigDecimal.getDefaultContext();
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
				const data		= number.toBigDecimal();
				this.integer	= data.integer;
				this._scale		= data._scale;
				this.context	= data.context;
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
					this.context = number.context;
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
			const newbigdecimal = this.round(this.context);
			this.integer	= newbigdecimal.integer;
			this._scale		= newbigdecimal._scale;
			delete this.int_string;
		}
		// データが正しいかチェックする
		if((!(this.integer instanceof BigInteger)) || (!(this.context instanceof MathContext))) {
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
	 * @returns {BigDecimal} abs(A)
	 */
	abs() {
		const output = this.clone();
		output.integer = output.integer.abs();
		return output;
	}

	/**
	 * this * 1
	 * @returns {BigDecimal} +A
	 */
	plus() {
		return this;
	}

	/**
	 * this * -1
	 * @returns {BigDecimal} -A
	 */
	negate() {
		const output = this.clone();
		output.integer = output.integer.negate();
		return output;
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
		return this.movePointLeft(-n);
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
	 * @returns {BigDecimal} A + B
	 */
	add(number) {
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
		const mc = BigDecimal.getDefaultContext();
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
	 * @returns {BigDecimal} A - B
	 */
	sub(number) {
		const subtrahend = BigDecimal._toBigDecimal(number);
		return this.add(subtrahend.negate());
	}

	/**
	 * Multiply.
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} A * B
	 */
	mul(number) {
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
		const mc = BigDecimal.getDefaultContext();
		const newinteger	= src.integer.mul(tgt.integer);
		// 0.1 * 0.01 = 0.001
		const newscale	= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	}

	/**
	 * Divide not calculated to the decimal point.
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} (int)(A / B)
	 */
	divideToIntegralValue(number) {
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
		const mc = BigDecimal.getDefaultContext();
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
		output.context = mc;
		return output;
	}

	/**
	 * Divide and remainder.
	 * @param {KBigDecimalInputData} number
	 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
	 */
	divideAndRemainder(number) {
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

		const result_divide	= this.divideToIntegralValue(divisor);
		const result_remaind	= this.sub(result_divide.mul(divisor));

		const output = [result_divide, result_remaind];
		return output;
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} A % B
	 */
	rem(number) {
		return this.divideAndRemainder(number)[1];
	}

	/**
	 * Modulo, positive remainder of division.
	 * - Result has same sign as the Divisor.
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} A mod B
	 */
	mod(number) {
		const src = this;
		const tgt = BigDecimal._toBigDecimal(number);
		if(tgt.isZero()) {
			return src;
		}
		const x = src.rem(tgt);
		if(!src.equalsState(tgt)) {
			return x.add(tgt);
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
	 * - When null is specified for the argument, it is calculated on the scale of "divisor.context".
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
			mc = BigDecimal.getDefaultContext();
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
				mc = this.context;
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
			BigDecimal.pushDefaultContext(MathContext.UNLIMITED);
			let is_error = false;
			let error_message;
			for(let i = 0; i < check_max; i++) {
				result = newsrc.divideAndRemainder(tgt);
				result_divide	= result[0];
				result_remaind	= result[1];
				all_result = all_result.add(result_divide.scaleByPowerOfTen(-i));
				if(result_remaind.compareTo(BigDecimal.ZERO) !== 0) {
					if(precision === 0) {	// 精度無限大の場合は、循環小数のチェックが必要
						if(result_map[result_remaind._getUnsignedIntegerString()]) {
							is_error = true;
							error_message = "ArithmeticException " + all_result + "[" + result_remaind._getUnsignedIntegerString() + "]";
							break;
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
			BigDecimal.popDefaultContext();
			if(is_error) {
				throw error_message;
			}
		}
		else {
			// 巨大な値は繰り返しで求める
			BigDecimal.pushDefaultContext(new MathContext(precision + 4, RoundingMode.HALF_UP));
			all_result = this.mul(tgt.inv());
			BigDecimal.popDefaultContext();
		}
	
		all_result.context = mc;
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
		all_result = all_result.round(BigDecimal.getDefaultContext());
		return all_result;
	}

	/**
	 * Inverse number of this value.
	 * @returns {BigDecimal} 1 / A
	 */
	inv() {
		if(BigDecimal.getDefaultContext().equals(MathContext.UNLIMITED)) {
			return BigDecimal.ONE.div(this);
		}
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
		// const mc = context ? context : this.context;
		// const b1 = this.createUsingThisSettings(1, mc);
		// return b1.div(this, mc);
		// 計算は絶対値を用いて行う
		const is_negative = this.isNegative();
		const A = !is_negative ? this: this.negate();
		// 3次のニュートン・ラフソン法で求める
		const B1 = BigDecimal.create(1);
		// 初期値は、指数部の情報を使用する
		const scale = - A.scale() + (A.precision() - 1);
		const x0 = new BigDecimal([1, scale + 1]);
		if(x0.isZero()) {
			return null;
		}
		let xn = x0;
		for(let i = 0; i < 20; i++) {
			const h = B1.sub(A.mul(xn));
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h).add(h.square()));
		}
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
	 * @returns {BigDecimal} n!
	 */
	factorial() {
		if(!this.isFinite()) {
			return this;
		}
		const output = new BigDecimal((new BigInteger(this)).factorial());
		return output;
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
	 * - This is used if you do not specify MathContext when creating a new object.
	 * @param {MathContext} [context=MathContext.DECIMAL128]
	 */
	static setDefaultContext(context) {
		DEFAULT_CONTEXT_[DEFAULT_CONTEXT_.length - 1] = context ? context : MathContext.DECIMAL128;
	}

	/**
	 * Return default MathContext class.
	 * - Used when MathContext not specified explicitly.
	 * @returns {MathContext}
	 */
	static getDefaultContext() {
		return DEFAULT_CONTEXT_[DEFAULT_CONTEXT_.length - 1];
	}

	/**
	 * Push default the MathContext.
	 * - Use with `popDefaultContext` when you want to switch settings temporarily.
	 * @param {MathContext} [context]
	 */
	static pushDefaultContext(context) {
		DEFAULT_CONTEXT_.push(context);
	}

	/**
	 * Pop default the MathContext.
	 * - Use with `pushDefaultContext` when you want to switch settings temporarily.
	 */
	static popDefaultContext() {
		DEFAULT_CONTEXT_.pop();
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

	// ----------------------
	// konpeito で扱う数値型へ変換
	// ----------------------
	
	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return this.integer.scaleByPowerOfTen(-this.scale());
	}

	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(mc) {
			return this.round(mc);
		}
		else {
			return this;
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
			BigDecimal.pushDefaultContext(MathContext.UNLIMITED);
			const delta = src.sub(tgt);
			BigDecimal.popDefaultContext();
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
	 * - This method is not a method round the decimal point.
	 * - This method converts numbers in the specified Context and rounds unconvertible digits.
	 * 
	 * Use `this.setScale(0, RoundingMode.HALF_UP)` if you want to round the decimal point.
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
	 * @returns {BigDecimal} pow(A, B)
	 */
	pow(number) {
		const num = BigDecimal._toBigDecimal(number);
		const src = this;
		const tgt = num;
		{
			if(src.isNaN() || tgt.isNaN()) {
				return BigDecimal.NaN;
			}
			if(tgt.isZero()) {
				return BigDecimal.ONE;
			}
			else if(src.isZero()) {
				return BigDecimal.ZERO;
			}
			else if(src.isOne()) {
				return src;
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
		const mc = BigDecimal.getDefaultContext();
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
			BigDecimal.pushDefaultContext(MathContext.UNLIMITED);
			while(n !== 0) {
				if((n & 1) !== 0) {
					y = y.mul(x);
				}
				x = x.square();
				n >>>= 1;
			}
			BigDecimal.popDefaultContext();
			// コンテキストの状態が変わっているので元に戻す
			y.context = mc;
			if(is_negative) {
				y = y.inv();
			}
			y = y.round(mc);
			return y;
		}
		else {
			const mc = BigDecimal.getDefaultContext();
			BigDecimal.pushDefaultContext(BigDecimal.getDefaultContext().increasePrecision());
			const ret = this.log().mul(number).exp().round(mc);
			BigDecimal.popDefaultContext();
			return ret;
		}
	}
	
	/**
	 * Square.
	 * @returns {BigDecimal} A^2
	 */
	square() {
		return this.mul(this);
	}

	/**
	 * Square root.
	 * @returns {BigDecimal} sqrt(A)
	 */
	sqrt() {
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
		if(this.isZero()) {
			return BigDecimal.ZERO;
		}
		// ニュートンラフソン法は割り算があり速度が遅いので、以下の計算で求める。
		{
			const mc = BigDecimal.getDefaultContext();
			BigDecimal.pushDefaultContext(BigDecimal.getDefaultContext().increasePrecision());
			const ret = this.rsqrt().inv().round(mc);
			BigDecimal.popDefaultContext();
			return ret;
		}
	}

	/**
	 * Cube root.
	 * @returns {BigDecimal} cbrt(A)
	 */
	cbrt() {
		{
			if(this.isZero()) {
				return BigDecimal.ZERO;
			}
			else if(this.isNaN()) {
				return BigDecimal.NaN;
			}
			else if(this.isInfinite()) {
				return this;
			}
		}
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const sign = this.sign();
		const abs = this.abs();
		let ret;
		// 小さい数値はpowを使ったほうが早く計算できる
		if(scale < 30) {
			const mc = BigDecimal.getDefaultContext();
			BigDecimal.pushDefaultContext(BigDecimal.getDefaultContext().increasePrecision());
			ret = abs.log().div(3).exp().round(mc);
			BigDecimal.popDefaultContext();
		}
		else {
			// ニュートン法によって求める
			// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
			const x0 = abs.compareTo(BigDecimal.ONE) === 1 ? abs : BigDecimal.ONE;
			let xn = x0;
			for(let i = 0; i < 1000; i++) {
				const xn_2 = xn.mul(xn);
				const xn1 = xn.mul(2).add(abs.div(xn_2)).div(3);
				const delta = xn1.sub(xn);
				if(delta.isZero()) {
					break;
				}
				xn = xn1;
			}
			ret = xn;
		}
		return sign === 1 ? ret : ret.negate();
	}
	
	/**
	 * Reciprocal square root.
	 * @returns {BigDecimal} rsqrt(A)
	 */
	rsqrt() {
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
		/**
		 * @type {BigDecimal}
		 */
		const A = this;
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
			throw "ArithmeticException";
		}
		let xn = x0;
		for(let i = 0; i < 50; i++) {
			const h = B1.sub(A.mul(xn.square()));
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h.mul(B8.add(h.mul(B6.add(B5.mul(h))))).mul(B16r)));
		}
		// 参考
		// Lyuka - 逆数と平方根を求める高次収束アルゴリズム
		// http://www.finetune.co.jp/~lyuka/technote/fract/sqrt.html
		return xn;
	}
	
	/**
	 * Logarithmic function.
	 * @returns {BigDecimal} log(A)
	 */
	log() {
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
		if(this.isOne()) {
			return BigDecimal.ZERO;
		}
		const mc = BigDecimal.getDefaultContext();
		// log(x)
		// -> x = a * E -> log(a * E) = log(a) + log(E)
		// -> x = a / E -> log(a / E) = log(E) - log(a)
		// 上記の式を使用して、適切な値の範囲で計算できるように調整する
		const scale = - this.scale() + (this.precision() - 1) + 1;
		BigDecimal.pushDefaultContext(new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP));
		/**
		 * @type {BigDecimal}
		 */
		let a = this;
		let b = 0;
		{
			// 範囲を 1 < x <= e の間に収める
			const e = BigDecimal.E;
			const compare_to_e = a.compareTo(e);
			if(compare_to_e === 0) {
				BigDecimal.popDefaultContext();
				return BigDecimal.ONE;
			}
			// 内部の値が大きすぎるので小さくする
			else if(compare_to_e > 0) {
				for(; b < 300; b++) {
					if(a.compareTo(e) <= 0) {
						break;
					}
					a = a.div(e);
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
						a = a.mul(e);
					}
				}
			}
		}
		BigDecimal.popDefaultContext();
		a = a.round(BigDecimal.getDefaultContext());
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
		return y;
	}

	/**
	 * Exponential function.
	 * @returns {BigDecimal} exp(A)
	 */
	exp() {
		{
			if(this.isZero()) {
				return BigDecimal.ONE;
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
		const mc = BigDecimal.getDefaultContext();
		BigDecimal.pushDefaultContext(new MathContext(mc.getPrecision() + scale, RoundingMode.HALF_UP));
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
		BigDecimal.popDefaultContext();
		y = y.round(BigDecimal.getDefaultContext());
		// 負の値だったら 1/(x^2) にして戻す
		if(is_negative) {
			return y.inv();
		}
		else {
			return y;
		}
	}

	/**
	 * e^x - 1
	 * @returns {BigDecimal} expm1(A)
	 */
	expm1() {
		return this.exp().sub(1);
	}

	/**
	 * ln(1 + x)
	 * @returns {BigDecimal} log1p(A)
	 */
	log1p() {
		return this.add(1).log();
	}
	
	/**
	 * log_2(x)
	 * @returns {BigDecimal} log2(A)
	 */
	log2() {
		return this.log().div(BigDecimal.LN2);
		
	}

	/**
	 * log_10(x)
	 * @returns {BigDecimal} log10(A)
	 */
	log10() {
		return this.log().div(BigDecimal.LN10);
	}
	
	// ----------------------
	// 三角関数
	// ----------------------

	/**
	 * Sine function.
	 * @returns {BigDecimal} sin(A)
	 */
	sin() {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
		// 2PIの余りを実際の計算で使用する。
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const new_mc = new MathContext(BigDecimal.getDefaultContext().getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.pushDefaultContext(new_mc);
		const target = this.mod(BigDecimal.TWO_PI);
		BigDecimal.popDefaultContext();
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
		return n0;
	}

	/**
	 * Cosine function.
	 * @returns {BigDecimal} cos(A)
	 */
	cos() {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
		const scale = - this.scale() + (this.precision() - 1) + 1;
		const new_mc = new MathContext(BigDecimal.getDefaultContext().getPrecision() + scale, RoundingMode.HALF_UP);
		BigDecimal.pushDefaultContext(new_mc);
		const target = this.mod(BigDecimal.TWO_PI);
		BigDecimal.popDefaultContext();
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
		return n0;
	}

	/**
	 * Tangent function.
	 * @returns {BigDecimal} tan(A)
	 */
	tan() {
		if(!this.isFinite()) {
			return BigDecimal.NaN;
		}
		return this.sin().div(this.cos());
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {BigDecimal} atan(A)
	 */
	atan() {
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
		if(this.isZero()) {
			const y = BigDecimal.ZERO;
			return y;
		}
		else if(this.compareTo(BigDecimal.ONE) === 0) {
			const y = BigDecimal.QUARTER_PI;
			return y;
		}
		else if(this.compareTo(BigDecimal.MINUS_ONE) === 0) {
			const y = BigDecimal.QUARTER_PI.negate();
			return y;
		}
		// x を 0 <= x <= 0.5 に収める
		const target_sign = this.sign();
		let target = this.abs();
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
	 * @returns {BigDecimal} asin(A)
	 */
	asin() {
		// 逆正弦
		// 複素数
		const re_1 = this.square().negate().add(1).sqrt();
		const im_1 = this;
		// 複素数のログ
		const norm = re_1.square().add(im_1.square()).sqrt();
		const arg  = im_1.atan2(re_1);
		const re_2 = norm.log();
		const im_2 = arg;
		// -i を掛け算する
		return re_2.add(im_2);
	}

	/**
	 * Arc cosine function.
	 * @returns {BigDecimal} acos(A)
	 */
	acos() {
		// 逆余弦
		// 複素数
		const re_1 = this;
		const im_1 = this.square().negate().add(1).sqrt();
		// 複素数のログ
		const norm = re_1.square().add(im_1.square()).sqrt();
		const arg  = im_1.atan2(re_1);
		const re_2 = norm.log();
		const im_2 = arg;
		// -i を掛け算する
		return re_2.add(im_2);
	}
	

	/**
	 * Hyperbolic sine function.
	 * @returns {BigDecimal} sinh(A)
	 */
	sinh() {
		// 双曲線正弦
		if(this.isInfinite()) {
			return this;
		}
		const y = this.exp();
		return y.sub(y.inv()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {BigDecimal} asinh(A)
	 */
	asinh() {
		if(this.isInfinite()) {
			return this;
		}
		return this.add(this.mul(this).add(1).sqrt()).log();
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {BigDecimal} cosh(A)
	 */
	cosh() {
		// 双曲線余弦
		if(this.isInfinite()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		return this.exp().add(this.negate().exp()).mul(0.5);
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {BigDecimal} acosh(A)
	 */
	acosh() {
		// 逆双曲線余弦 Math.log(x + Math.sqrt(x * x - 1));
		if(this.isInfinite()) {
			return BigDecimal.NaN;
		}
		return this.add(this.mul(this).sub(1).sqrt()).log();
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {BigDecimal} tanh(A)
	 */
	tanh() {
		// 双曲線正接
		if(this.isInfinite()) {
			return BigDecimal.create(this.sign());
		}
		const y =  this.mul(2).exp();
		return y.sub(1).div(y.add(1));
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {BigDecimal} atanh(A)
	 */
	atanh() {
		// 逆双曲線正接
		return this.add(1).div(this.negate().add(1)).log().mul(0.5);
	}

	/**
	 * Secant function.
	 * @returns {BigDecimal} sec(A)
	 */
	sec() {
		// 正割
		return this.cos().inv();
	}

	/**
	 * Reverse secant function.
	 * @returns {BigDecimal} asec(A)
	 */
	asec() {
		// 逆正割
		return this.inv().acos();
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {BigDecimal} sech(A)
	 */
	sech() {
		// 双曲線正割
		if(this.isNegativeInfinity()) {
			return BigDecimal.ZERO;
		}
		return this.exp().add(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {BigDecimal} asech(A)
	 */
	asech() {
		// 逆双曲線正割
		return this.inv().add(this.square().inv().sub(1).sqrt()).log();
	}

	/**
	 * Cotangent function.
	 * @returns {BigDecimal} cot(A)
	 */
	cot() {
		// 余接
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		return this.tan().inv();
	}

	/**
	 * Inverse cotangent function.
	 * @returns {BigDecimal} acot(A)
	 */
	acot() {
		// 逆余接
		if(this.isZero()) {
			return BigDecimal.HALF_PI;
		}
		return this.inv().atan();
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {BigDecimal} coth(A)
	 */
	coth() {
		// 双曲線余接
		if(this.isInfinite()) {
			return BigDecimal.create(this.sign());
		}
		const y =  this.mul(2).exp();
		return y.add(1).div(y.sub(1));
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {BigDecimal} acoth(A)
	 */
	acoth() {
		// 逆双曲線余接
		if(this.isInfinite()) {
			return BigDecimal.ZERO;
		}
		return this.add(1).div(this.sub(1)).log().mul(0.5);
	}

	/**
	 * Cosecant function.
	 * @returns {BigDecimal} csc(A)
	 */
	csc() {
		// 余割
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		return this.sin().inv();
	}

	/**
	 * Inverse cosecant function.
	 * @returns {BigDecimal} acsc(A)
	 */
	acsc() {
		// 逆余割
		return this.inv().asin();
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {BigDecimal} csch(A)
	 */
	csch() {
		if(this.isInfinite()) {
			return BigDecimal.ZERO;
		}
		else if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		// 双曲線余割
		return this.exp().sub(this.negate().exp()).inv().mul(2);
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {BigDecimal} acsch(A)
	 */
	acsch() {
		if(this.isZero()) {
			return BigDecimal.POSITIVE_INFINITY;
		}
		// 逆双曲線余割
		return this.inv().add(this.square().inv().add(1).sqrt()).log();
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {BigDecimal} sinc(A)
	 */
	sinc() {
		if(this.isZero()) {
			return(BigDecimal.ONE);
		}
		const x = BigDecimal.PI.mul(this);
		return x.sin().div(x);
	}

	// ----------------------
	// 乱数
	// ----------------------
	
	/**
	 * Create random values with uniform random numbers.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {BigDecimal}
	 */
	static rand(random) {
		let precision = BigDecimal.getDefaultContext().getPrecision();
		if(precision <= 0) {
			precision = 100;
		}
		const keta = Math.ceil(precision * Math.log(10) / Math.log(2));
		const a = BigInteger.ONE.shiftLeft(keta);
		const b = BigInteger.createRandomBigInteger(keta, random);
		return (new BigDecimal(b)).div(a);
	}

	/**
	 * Create random values with normal distribution.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {BigDecimal}
	 */
	static randn(random) {
		// Box-Muller法
		const a = BigDecimal.rand(random).log().mul(-2).sqrt();
		const b = BigDecimal.rand(random).mul(2).mul(BigDecimal.PI);
		const y = a.mul(b.sin());
		return y;
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
	 * @returns {BigDecimal} A & B
	 */
	and(number) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal(src.and(tgt));
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @returns {BigDecimal} A | B
	 */
	or(number) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal(src.or(tgt));
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @returns {BigDecimal} A ^ B
	 */
	xor(number) {
		const n_src = this;
		const n_tgt = BigDecimal._toBigDecimal(number);
		const src	= n_src.round().toBigInteger();
		const tgt	= n_tgt.round().toBigInteger();
		return new BigDecimal(src.xor(tgt));
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {BigDecimal} !A
	 */
	not() {
		const n_src = this;
		const src	= n_src.round().toBigInteger();
		return new BigDecimal(src.not());
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} n
	 * @returns {BigDecimal} A << n
	 */
	shift(n) {
		const src		= this.round().toBigInteger();
		const number	= BigDecimal._toInteger(n);
		return new BigDecimal(src.shift(number));
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @returns {BigDecimal} gcd(x, y)
	 */
	gcd(number) {
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.gcd(y);
		return new BigDecimal(result);
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @returns {Array<BigDecimal>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.extgcd(y);
		return [new BigDecimal(result[0]), new BigDecimal(result[1]), new BigDecimal(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} number 
	 * @returns {BigDecimal} lcm(x, y)
	 */
	lcm(number) {
		const x = this.round().toBigInteger();
		const y = BigDecimal._toBigDecimal(number).toBigInteger();
		const result = x.lcm(y);
		return new BigDecimal(result);
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} exponent
	 * @param {KBigDecimalInputData} m 
	 * @returns {BigDecimal} A^B mod m
	 */
	modPow(exponent, m) {
		const A = this.round().toBigInteger();
		const B = BigDecimal._toBigDecimal(exponent).toBigInteger();
		const m_ = BigDecimal._toBigDecimal(m).toBigInteger();
		const result = A.modPow(B, m_);
		return new BigDecimal(result);
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KBigDecimalInputData} m
	 * @returns {BigDecimal} A^(-1) mod m
	 */
	modInverse(m) {
		const A = this.round().toBigInteger();
		const m_ = BigDecimal._toBigDecimal(m).toBigInteger();
		const result = A.modInverse(m_);
		return new BigDecimal(result);
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
		if(DEFINE$4.POSITIVE_INFINITY === null) {
			DEFINE$4.POSITIVE_INFINITY = new BigDecimal(Number.POSITIVE_INFINITY);
		}
		return DEFINE$4.POSITIVE_INFINITY;
	}
	
	/**
	 * Negative Infinity.
	 * @returns {BigDecimal} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		if(DEFINE$4.NEGATIVE_INFINITY === null) {
			DEFINE$4.NEGATIVE_INFINITY = new BigDecimal(Number.NEGATIVE_INFINITY);
		}
		return DEFINE$4.NEGATIVE_INFINITY;
	}

	/**
	 * Not a Number.
	 * @returns {BigDecimal} NaN
	 */
	static get NaN() {
		if(DEFINE$4.NaN === null) {
			DEFINE$4.NaN = new BigDecimal(Number.NaN);
		}
		return DEFINE$4.NaN;
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
	 * @returns {BigDecimal} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KBigDecimalInputData} number
	 * @returns {BigDecimal} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * - The argument can specify the scale after calculation.
	 * - In the case of precision infinity, it may generate an error by a repeating decimal.
	 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
	 * - When null is specified for the argument, it is calculated on the scale of "divisor.context".
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
	 * @returns {BigDecimal} A % B
	 */
	remainder(number) {
		return this.rem(number);
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
const DEFINE$4 = {

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
		// DECIMAL256 でも精度は72桁ほどである。
		// 従って、79桁のPIをすでにデータとして持っておく。
		const PI79 = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862";
		const context = BigDecimal.getDefaultContext();
		if(context.getPrecision() <= 78) {
			return new BigDecimal(PI79).round(context);
		}
		else {
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
			for(let i = 0; i < 10; i++) {
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
		}
	},

	/**
	 * 0.25 * PI.
	 * @returns {BigDecimal} 0.78...
	 */
	QUARTER_PI : function() {
		return DEFINE$4.PI().div(4);
	},

	/**
	 * 0.5 * PI.
	 * @returns {BigDecimal} 1.57...
	 */
	HALF_PI : function() {
		return DEFINE$4.PI().div(2);
	},

	/**
	 * 2 * PI.
	 * @returns {BigDecimal} 6.28...
	 */
	TWO_PI : function() {
		return DEFINE$4.PI().mul(2);
	},
	
	/**
	 * E, Napier's constant.
	 * @returns {BigDecimal} E
	 */
	E : function() {
		// DECIMAL256 でも精度は72桁ほどである。
		// 従って、84桁のEをすでにデータとして持っておく。
		const E84 = "2.71828182845904523536028747135266249775724709369995957496696762772407663035354759";
		const context = BigDecimal.getDefaultContext();
		if(context.getPrecision() <= 83) {
			return new BigDecimal(E84).round(context);
		}
		else {
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
		}
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
	 * @type {any}
	 */
	POSITIVE_INFINITY : null,

	/**
	 * Negative Infinity.
	 * @type {any}
	 */
	NEGATIVE_INFINITY : null,

	/**
	 * Not a Number.
	 * @type {any}
	 */
	NaN : null
	
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
		const new_number = DEFINE$4[this.method_name]();
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

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Settings for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisSettings
 * @property {import("../../core/Matrix.js").KMatrixInputData} samples explanatory variable. (Each column is a parameters and each row is a samples.)
 * @property {import("../../core/Matrix.js").KMatrixInputData} target response variable. / actual values. (column vector)
 * @property {boolean} [is_standardised=false] Use standardized partial regression coefficients.
 */

/**
 * Vector state
 * @typedef {Object} KMultipleRegressionAnalysisVectorState
 * @property {number} df degree of freedom
 * @property {number} SS sum of squares
 * @property {number} MS unbiased_variance
 */

/**
 * Analysis of variance. ANOVA.
 * @typedef {Object} KMultipleRegressionAnalysisAnova
 * @property {KMultipleRegressionAnalysisVectorState} regression regression.
 * @property {KMultipleRegressionAnalysisVectorState} residual residual error.
 * @property {KMultipleRegressionAnalysisVectorState} total total.
 * @property {number} F F value. Dispersion ratio (F0)
 * @property {number} significance_F Significance F. Test with F distribution with q, n-q-1 degrees of freedom.(Probability of error.)
 */

/**
 * Regression table data.
 * @typedef {Object} KMultipleRegressionAnalysisPartialRegressionData
 * @property {number} coefficient Coefficient.
 * @property {number} standard_error Standard error.
 * @property {number} t_stat t-statistic.
 * @property {number} p_value P-value. Risk factor.
 * @property {number} lower_95 Lower limit of a 95% confidence interval.
 * @property {number} upper_95 Upper limit of a 95% confidence interval.
 */

/**
 * Regression table.
 * @typedef {Object} KMultipleRegressionAnalysisPartialRegression
 * @property {KMultipleRegressionAnalysisPartialRegressionData} intercept Intercept.
 * @property {KMultipleRegressionAnalysisPartialRegressionData[]} parameters Parameters.
 */

/**
 * Output for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisOutput
 * @property {number} q number of explanatory variables.
 * @property {number} n number of samples.
 * @property {number[][]} predicted_values predicted values. (column vector)
 * @property {number} sY Variance of predicted values of target variable.
 * @property {number} sy Variance of measured values of target variable.
 * @property {number} multiple_R Multiple R. Multiple correlation coefficient.
 * @property {number} R_square R Square. Coefficient of determination.
 * @property {number} adjusted_R_square Adjusted R Square. Adjusted coefficient of determination.
 * @property {KMultipleRegressionAnalysisAnova} ANOVA analysis of variance.
 * @property {number} Ve Unbiased variance of residuals. (Ve)
 * @property {number} standard_error Standard error. (SE)
 * @property {number} AIC Akaike's Information Criterion. (AIC)
 * @property {KMultipleRegressionAnalysisPartialRegression} regression_table Regression table.
 */

/**
 * Multiple regression analysis.
 */
class MultipleRegressionAnalysis {

	/**
	 * Multiple regression analysis
	 * @param {KMultipleRegressionAnalysisSettings} settings - input data
	 * @returns {KMultipleRegressionAnalysisOutput} analyzed data
	 */
	static runMultipleRegressionAnalysis(settings) {
		//最小二乗法により重回帰分析する。
		//参考文献
		//[1] 図解でわかる多変量解析―データの山から本質を見抜く科学的分析ツール
		//    涌井 良幸, 涌井 貞美, 日本実業出版社 (2001/01)
		//[2] これならわかる Excelで楽に学ぶ多変量解析
		//    長谷川 勝也, 技術評論社 (2002/07)
		//[3] ど素人の「Excel 回帰分析」表の見方 (単回帰分析)
		//   http://atiboh.sub.jp/t07kaikibunseki.html
		//[4] 赤池の情報量基準（AIC）の計算方法
		//   http://software.ssri.co.jp/statweb2/tips/tips_10.html

		// samples 説明変量。行がサンプル。列が各値。
		// target  目的変量・実測値。縦ベクトル。
		// is_standardised trueで標準化偏回帰係数
		let samples = Matrix.create(settings.samples);
		let target = Matrix.create(settings.target);
		const set_unbiased = {correction : 1};

		// 標準化偏回帰係数を調べるために平均0 分散1に正規化する
		if(settings.is_standardised) {
			samples = samples.standardization();
			target = target.standardization();
		}

		// 説明変量・説明変数の数 q
		const number_of_explanatory_variables = Matrix.create(samples.width);
		// 標本数(観測数) n
		const number_of_samples = Matrix.create(samples.height);

		// 共分散行列
		const S = samples.cov(set_unbiased);
		const S_rcond = S.rcond();
		// どこかの値に相関が非常に高いものがあり計算できない。
		if(S_rcond <= 1e-10) {
			console.log("Analysis failed due to highly correlated explanatory variables.(rcond : " + S_rcond + ")");
			return null;
		}

		// 目的変量との共分散(縦ベクトル)
		const y_array = [];
		const max_var = number_of_explanatory_variables.intValue;
		for(let i = 0; i < max_var; i++) {
			y_array[i] = [ samples.getMatrix(":", i).cov(target, set_unbiased) ];
		}
		const Y = Matrix.create(y_array);

		// 偏回帰係数(縦ベクトル) partial regression coefficient. (column vector)
		const partial_regression_coefficient =  S.inv().mul(Y);
		// バイアス・定数項・切片 bias
		const bias = target.mean().sub(samples.mean().mul(partial_regression_coefficient));
		// 予測値(縦ベクトル) predicted values. (column vector)
		const predicted_values = samples.mul(partial_regression_coefficient).add(bias);
		// 目的変量の予測値の分散
		const sY = predicted_values.var(set_unbiased);
		// 目的変量の実測値の分散
		const sy = target.var(set_unbiased);
		// 重相関係数
		const multiple_R = predicted_values.corrcoef(target, set_unbiased);
		// 決定係数・寄与率
		const R_square = sY.div(sy);

		// 回帰
		const regression_df = number_of_explanatory_variables;					// 自由度
		const regression_SS = predicted_values.sub(target.mean()).dotpow(2).sum();	// 平方和(変動)・MSr
		const regression_MS = regression_SS.div(regression_df);	// 不偏分散(分散)
		
		// 残差 residual error
		const residual_df = number_of_samples.sub(number_of_explanatory_variables).sub(1);	// 自由度
		const residual_SS = predicted_values.sub(target).dotpow(2).sum();	// 平方和(変動)・MSe
		const residual_MS = residual_SS.div(residual_df);	// 不偏分散(分散)

		// 全体
		const total_df = number_of_samples.sub(1);	// 自由度
		const total_SS = target.sub(target.mean()).dotpow(2).sum();	// 平方和(変動)・MSt・VE
		const total_MS = total_SS.div(total_df);	// 不偏分散(分散)

		// Ve(残差の不偏分散)
		const Ve = residual_MS;
		
		// SE(標準誤差, SE, standard error)
		const standard_error = Ve.sqrt();

		// 回帰の分散比(F値)(観測された分散比)・F0
		const regression_F = regression_MS.div(residual_MS);

		// 回帰の有意 F significance F
		// 自由度 q, n-q-1 のF分布による検定
		// 誤りが発生する確率(1 - cdf('F',X,A,B))
		// F分布を用いて、誤りが発生する確率を調べる (有意 F)
		const regression_significance_F = Matrix.ONE.sub(regression_F.fcdf(regression_df, residual_df));
		
		// 自由度修正済決定係数・補正R2 adjusted R2, 自由度修正済決定係数 / 自由度調整済寄与率
		// 1 - (残差による変動 / 残差の自由度) / (全変動 / 全体の自由度)
		const adjusted_R_square = Matrix.ONE.sub(residual_MS.div(total_MS));
		
		// 赤池情報量規準(Akaike's Information Criterion, AIC)
		// 回帰式に定数項を含む場合の式
		// out.n * (log(2 * pi * (table(2, 2)/out.n)) + 1) + 2 * (out.q + 2);
		const AIC = number_of_samples.mul(
			residual_SS.div(number_of_samples).mul(2.0 * Math.PI).log().add(1)
		).add(number_of_explanatory_variables.add(2).mul(2));

		// ここからは偏回帰の値を計算していく

		// 偏差平方和・積和行列の逆行列を作る
		// つまり、共分散行列の各共分散で(サンプル数N)を割らない値を求めればいい。
		// 不偏の場合は、 偏差平方和 * ( N * (N-1) ) を求めれば良い。
		const IS = S.dotmul(number_of_samples).inv();

		// 初期化
		const intercept = {
			coefficient : Matrix.ZERO,
			standard_error : Matrix.ZERO,
			t_stat : Matrix.ZERO,
			p_value : Matrix.ZERO,
			lower_95 : Matrix.ZERO,
			upper_95 : Matrix.ZERO
		};
		const parameters = [];
		for(let i = 0; i < max_var; i++) {
			parameters[i] = {
				coefficient : Matrix.ZERO,
				standard_error : Matrix.ZERO,
				t_stat : Matrix.ZERO,
				p_value : Matrix.ZERO,
				lower_95 : Matrix.ZERO,
				upper_95 : Matrix.ZERO
			};
		}
		// 係数
		{
			// 切片の係数
			intercept.coefficient = bias;
			// 偏回帰の係数
			for(let i = 0; i < max_var; i++) {
				parameters[i].coefficient = new Matrix(partial_regression_coefficient.getComplex(i));
			}
		}
		// 標準誤差
		{
			// 切片の標準誤差
			const q = number_of_explanatory_variables.intValue;
			let s = number_of_samples.inv();
			for(let j = 0; j < q; j++) {
				for(let k = 0; k < q; k++) {
					s = s.add(samples.getMatrix(":", j).mean().mul(samples.getMatrix(":", k).mean()).mul(IS.getMatrix(j, k)));
				}
			}
			intercept.standard_error = s.mul(Ve).sqrt();
			// 偏回帰の標準誤差
			for(let i = 0; i < max_var; i++) {
				parameters[i].standard_error = IS.getMatrix(i, i).mul(Ve).sqrt();
			}
		}
		{
			/**
			 * t*値, P値, 信頼区間
			 * @param {any} data 
			 * @ignore
			 */
			const calcTPI = function(data) {

				// t*値, 影響度, 統計量t, t-statistic.
				// 大きいほど目的変数との関連性が強い
				/**
				 * @type {Matrix}
				 */
				data.t_stat = data.coefficient.div(data.standard_error);
				
				// P値, 危険率, P-value. Risk factor.
				// 切片と偏回帰係数が誤っている確率
				// スチューデントの t 分布の確率密度関数を利用
				/**
				 * @type {Matrix}
				 */
				data.p_value = data.t_stat.tdist(residual_df, 2);
				
				// 信頼区間の計算
				// 下限 95%, 上限 95%
				const percent = new Matrix(1.0 - 0.95);
				data.lower_95 = data.coefficient.sub(percent.tinv2(residual_df).mul(data.standard_error));
				data.upper_95 = data.coefficient.add(percent.tinv2(residual_df).mul(data.standard_error));
			};
			calcTPI(intercept);
			for(let i = 0; i < max_var; i++) {
				calcTPI(parameters[i]);
			}
		}

		/**
		 * @type {KMultipleRegressionAnalysisPartialRegression}
		 */
		let regression_table = null;
		{
			/**
			 * @type {KMultipleRegressionAnalysisPartialRegressionData}
			 */
			const intercept_data = {
				coefficient : intercept.coefficient.doubleValue,
				standard_error : intercept.standard_error.doubleValue,
				t_stat : intercept.t_stat.doubleValue,
				p_value : intercept.p_value.doubleValue,
				lower_95 : intercept.lower_95.doubleValue,
				upper_95 : intercept.upper_95.doubleValue
			};
			
			/**
			 * @type {KMultipleRegressionAnalysisPartialRegressionData[]}
			 */
			const parameters_data = [];
			for(let i = 0; i < max_var; i++) {
				parameters_data.push({
					coefficient : parameters[i].coefficient.doubleValue,
					standard_error : parameters[i].standard_error.doubleValue,
					t_stat : parameters[i].t_stat.doubleValue,
					p_value : parameters[i].p_value.doubleValue,
					lower_95 : parameters[i].lower_95.doubleValue,
					upper_95 : parameters[i].upper_95.doubleValue
				});
			}

			regression_table = {
				intercept : intercept_data,
				parameters : parameters_data
			};
		}

		/**
		 * @type {KMultipleRegressionAnalysisOutput}
		 */
		const output = {
			q : number_of_explanatory_variables.doubleValue,
			n : number_of_samples.doubleValue,
			predicted_values : predicted_values.getNumberMatrixArray(),
			sY : sY.doubleValue,
			sy : sy.doubleValue,
			multiple_R : multiple_R.doubleValue,
			R_square : R_square.doubleValue,
			adjusted_R_square : adjusted_R_square.doubleValue,
			ANOVA : {
				regression : {
					df : regression_df.doubleValue,
					SS : regression_SS.doubleValue,
					MS : regression_MS.doubleValue
				},
				residual : {
					df : residual_df.doubleValue,
					SS : residual_SS.doubleValue,
					MS : residual_MS.doubleValue
				},
				total : {
					df : total_df.doubleValue,
					SS : total_SS.doubleValue,
					MS : total_MS.doubleValue
				},
				F : regression_F.doubleValue,
				significance_F : regression_significance_F.doubleValue,
			},
			Ve : Ve.doubleValue,
			standard_error : standard_error.doubleValue,
			AIC : AIC.doubleValue,
			regression_table : regression_table
		};

		return output;
	}

}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Tools for analyzing data.
 */
class DataAnalysis {

	/**
	 * Multiple regression analysis
	 * @param {import("./DataAnalysis/MultipleRegressionAnalysis.js").KMultipleRegressionAnalysisSettings} settings - input data
	 * @returns {import("./DataAnalysis/MultipleRegressionAnalysis.js").KMultipleRegressionAnalysisOutput} analyzed data
	 */
	static runMultipleRegressionAnalysis(settings) {
		return MultipleRegressionAnalysis.runMultipleRegressionAnalysis(settings);
	}

}

/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

/**
 * Class collection of numerical calculation processing.
 * These classes are classified into a BigInteger, BigDecimal, Fraction, Matrix.
 * - BigInteger is a calculation class for arbitrary-precision integer arithmetic.
 * - BigDecimal is a calculation class for arbitrary-precision floating point arithmetic.
 * - Fraction is a calculation class for fractions with infinite precision.
 * - Matrix is a general-purpose calculation class with signal processing and statistical processing.
 */
class konpeito {

	/**
	 * Return typedef BigInteger for arbitrary-precision integer calculation.
	 * @returns {typeof BigInteger}
	 */
	static get BigInteger() {
		return BigInteger;
	}

	/**
	 * Return typedef BigDecimal for arbitrary-precision floating-point number.
	 * @returns {typeof BigDecimal}
	 */
	static get BigDecimal() {
		return BigDecimal;
	}

	/**
	 * Return Rounding class for BigDecimal.
	 * @returns {typeof RoundingMode}
	 */
	static get RoundingMode() {
		return RoundingMode;
	}

	/**
	 * Return Configuration class for BigDecimal.
	 * @returns {typeof MathContext}
	 */
	static get MathContext() {
		return MathContext;
	}

	/**
	 * Return typedef Fraction for infinite precision arithmetic.
	 * @returns {typeof Fraction}
	 */
	static get Fraction() {
		return Fraction;
	}

	/**
	 * Return typedef Complex for complex number calculation.
	 * @returns {typeof Complex}
	 */
	static get Complex() {
		return Complex;
	}

	/**
	 * Return typedef Matrix for complex matrix calculation.
	 * @returns {typeof Matrix}
	 */
	static get Matrix() {
		return Matrix;
	}

	/**
	 * Return typedef Random.
	 * @returns {typeof Random}
	 */
	static get Random() {
		return Random;
	}
	
	/**
	 * Return typedef DataAnalysis.
	 * @returns {typeof DataAnalysis}
	 */
	static get DataAnalysis() {
		return DataAnalysis;
	}
	
	/**
	 * Return typedef Probability.
	 * @returns {typeof Probability}
	 */
	static get Probability() {
		return Probability;
	}

}

export default konpeito;
