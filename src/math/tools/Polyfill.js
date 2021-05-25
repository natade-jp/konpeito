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
export default class Polyfill {

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
				// @ts-ignore
				return isFinite(x) && Math.trunc(x) === x;
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
		if(!Number.MAX_SAFE_INTEGER === undefined) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.MAX_SAFE_INTEGER = 9007199254740991;
		}
		if(!Number.parseFloat === undefined) {
			Number.parseFloat = parseFloat;
		}
		if(!Number.parseInt === undefined) {
			Number.parseInt = parseInt;
		}
		if(!Number.isSafeInteger === undefined) {
			// @ts-ignore
			Number.isSafeInteger = function(x) {
				// @ts-ignore
				return Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
			};
		}
	}
}

// @ts-ignore
Polyfill.run();

