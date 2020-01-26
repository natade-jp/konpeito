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
 * Multiply two 32-bit integers and output a 32-bit integer.
 * @param {number} x1 
 * @param {number} x2 
 * @returns {number}
 * @private
 * @ignore
 */
const multiplication32 = function(x1, x2) {
	let y = ((x1 & 0xFFFF) * (x2 & 0xFFFF)) >>> 0;
	let b = (x1 & 0xFFFF) * (x2 >>> 16);
	y = (y + ((b & 0xFFFF) << 16)) >>> 0;
	b = (x1 >>> 16) * (x2 & 0xFFFF);
	y = (y + ((b & 0xFFFF) << 16));
	return (y & 0xFFFFFFFF);
};

/**
 * Random number class.
 * @private
 * @ignore
 */
export default class Xorshift {
	
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
		random_seed = (multiplication32(random_seed, 214013) + 2531011) >>> 0;
		this.z = random_seed;
		random_seed = (multiplication32(random_seed, 214013) + 2531011) >>> 0;
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

