/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */
// @ts-check

/**
 * Base class for rounding mode for BigDecimal.
 */
export class RoundingModeEntity {
	
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
export default class RoundingMode {

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


