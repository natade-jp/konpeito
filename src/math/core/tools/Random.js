/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import MaximumLengthSequence from "./random/MaximumLengthSequence.js";
import Xorshift from "./random/Xorshift.js";

/**
 * Setting random numbers
 * @typedef {Object} KRandomSettings
 * @property {number} [seed] Seed number for random number generation. If not specified, create from time.
 * @property {string} [algorithm="FAST"] Algorithm type : "XORSHIFT" / "MLS" / "FAST"
 */

/**
 * Random number class.
 */
export default class Random {
	
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
	create(init_data) {
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
