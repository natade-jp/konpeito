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
 * Random number base class.
 * @private
 * @ignore
 */
export default class RandomBase {
	
	/**
	 * Create Random.
	 * @param {number} [seed] - Seed number for random number generation. If not specified, create from time.
	 */
	constructor(seed) {
	}

	/**
	 * Initialize random seed.
	 * @param {number} seed
	 */
	setSeed(seed) {
	}

	/**
	 * 32-bit random number.
	 * @returns {number} - 32-bit random number
	 */
	genrand_int32() {
		return 0;
	}

}
