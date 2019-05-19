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
 * BigDecimal用の丸めモードの基底クラス
 * @interface
 */
export class RoundingModeEntity {
	
	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "NONE";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
	 */
	static getAddNumber(x) {
		return 0;
	}

}

/**
 * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
 * @implements {RoundingModeEntity}
 */
class RoundingMode_UP extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "UP";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
 * @implements {RoundingModeEntity}
 */
class RoundingMode_DOWN extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "DOWN";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
	 */
	static getAddNumber(x) {
		return -(x % 10);
	}

}

/**
 * 正の無限大に近づく
 * @implements {RoundingModeEntity}
 */
class RoundingMode_CEILING extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "CEILING";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 負の無限大に近づく
 * @implements {RoundingModeEntity}
 */
class RoundingMode_FLOOR extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "FLOOR";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 四捨五入
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_UP extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "HALF_UP";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 五捨六入
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_DOWN extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "HALF_DOWN";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 等間隔なら偶数側へ丸める
 * @implements {RoundingModeEntity}
 */
class RoundingMode_HALF_EVEN extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "HALF_EVEN";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * 丸めない（丸める必要が出る場合はエラー）
 * @implements {RoundingModeEntity}
 */
class RoundingMode_UNNECESSARY extends RoundingModeEntity {

	/**
	 * 丸めモードの名前を英語の大文字で取得する
	 * @returns {string} 丸めモード名
	 */
	static toString() {
		return "UNNECESSARY";
	}

	/**
	 * 丸めに必要な加算値
	 * @param {number} x - 1ケタ目の値
	 * @returns {number} いくつ足すと丸められるか
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
 * BigDecimal用の丸めモードクラス
 */
export default class RoundingMode {

	/**
	 * 指定した文字列で表される丸めクラスを取得する
	 * @param {string|RoundingModeEntity|Object} name - モードの英数名
	 * @returns {RoundingModeEntity}
	 */
	static valueOf(name) {
		let check_string;
		if(name instanceof RoundingModeEntity) {
			return name;
		}
		else if(typeof name === "string") {
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
	 * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
	 * @returns {RoundingModeEntity}
	 */
	static get UP() {
		return RoundingMode_UP;
	}

	/**
	 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
	 * @returns {RoundingModeEntity}
	 */
	static get DOWN() {
		return RoundingMode_DOWN;
	}

	/**
	 * 正の無限大に近づく
	 * @returns {RoundingModeEntity}
	 */
	static get CEILING() {
		return RoundingMode_CEILING;
	}

	/**
	 * 負の無限大に近づく
	 * @returns {RoundingModeEntity}
	 */
	static get FLOOR() {
		return RoundingMode_FLOOR;
	}

	/**
	 * 四捨五入
	 * @returns {RoundingModeEntity}
	 */
	static get HALF_UP() {
		return RoundingMode_HALF_UP;
	}

	/**
	 * 五捨六入
	 * @returns {RoundingModeEntity}
	 */
	static get HALF_DOWN() {
		return RoundingMode_HALF_DOWN;
	}

	/**
	 * 等間隔なら偶数側へ丸める
	 * @returns {RoundingModeEntity}
	 */
	static get HALF_EVEN() {
		return RoundingMode_HALF_EVEN;
	}

	/**
	 * 丸めない（丸める必要が出る場合はエラー）
	 * @returns {RoundingModeEntity}
	 */
	static get UNNECESSARY() {
		return RoundingMode_UNNECESSARY;
	}

}


