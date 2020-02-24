/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Polyfill from "../../../tools/Polyfill.js";

/**
 * Random number class.
 * @private
 * @ignore
 */
export default class MaximumLengthSequence {
	
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

