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
		if(!Math.imul) {
			Math.imul = function(x1, x2) {
				let y = ((x1 & 0xFFFF) * (x2 & 0xFFFF)) >>> 0;
				let b = (x1 & 0xFFFF) * (x2 >>> 16);
				y = (y + ((b & 0xFFFF) << 16)) >>> 0;
				b = (x1 >>> 16) * (x2 & 0xFFFF);
				y = (y + ((b & 0xFFFF) << 16));
				return (y & 0xFFFFFFFF);
			};
		}
		if(!Math.trunc) {
			Math.trunc = function(x) {
				return x > 0 ? Math.floor(x) : Math.ceil(x);
			};
		}
		if(!Number.isFinite) {
			Number.isFinite = isFinite;
		}
		if(!Number.isInteger) {
			Number.isInteger = function(x) {
				// @ts-ignore
				return isFinite(x) && Math.trunc(x) === x;
			};
		}
		if(!Number.isNaN) {
			Number.isNaN = isNaN;
		}
		if(!Number.NaN) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.NaN = NaN;
		}
		if(!Number.EPSILON) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.EPSILON = 2.220446049250313e-16;
		}
		if(!Number.MIN_SAFE_INTEGER) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.MIN_SAFE_INTEGER = -9007199254740991;
		}
		if(!Number.MAX_SAFE_INTEGER) {
			// @ts-ignore
			// eslint-disable-next-line no-global-assign
			Number.MAX_SAFE_INTEGER = 9007199254740991;
		}
		if(!Number.parseFloat) {
			Number.parseFloat = parseFloat;
		}
		if(!Number.parseInt) {
			Number.parseInt = parseInt;
		}
		if(!Number.isSafeInteger) {
			// @ts-ignore
			Number.isSafeInteger = function(x) {
				// @ts-ignore
				return Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
			};
		}
	}
}

Polyfill.run();

