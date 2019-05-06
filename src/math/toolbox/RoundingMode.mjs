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
 * BigDecimal用の丸めモードの基底クラス
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
		x = x % 10;
		if(x === 0) {
			return 0;
		}
		else if(x > 0) {
			return 10 - x;
		}
		else {
			return (-(10 + x));
		}
	}

}

/**
 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
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
		x = x % 10;
		return -x;
	}

}

/**
 * 正の無限大に近づく
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
		x = x % 10;
		if(x === 0) {
			return 0;
		}
		else if(x > 0) {
			return 10 - x;
		}
		else {
			return -x;
		}
	}

}

/**
 * 負の無限大に近づく
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
		x = x % 10;
		if(x === 0) {
			return 0;
		}
		else if(x > 0) {
			return -x;
		}
		else {
			return(-(10 + x));
		}
	}

}

/**
 * 四捨五入
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
		x = x % 10;
		const sign = x >= 0 ? 1 : -1;
		if(Math.abs(x) < 5) {
			return (x * -1);
		}
		else {
			return (sign * (10 - Math.abs(x)));
		}
	}

}

/**
 * 五捨六入
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
		x = x % 10;
		const sign = x >= 0 ? 1 : -1;
		if(Math.abs(x) < 6) {
			return (x * -1);
		}
		else {
			return (sign * (10 - Math.abs(x)));
		}
	}

}

/**
 * 等間隔なら偶数側へ丸める
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
		x = x % 100;
		let sign, even;
		if(x < 0) {
			sign = -1;
			even = Math.ceil(x / 10) & 1;
		}
		else {
			sign = 1;
			even = Math.floor(x / 10) & 1;
		}
		let center;
		if(even === 1) {
			center = 5;
		}
		else {
			center = 6;
		}
		x = x % 10;
		if(Math.abs(x) < center) {
			return (x * -1);
		}
		else {
			return (sign * (10 - Math.abs(x)));
		}
	}

}

/**
 * 丸めない（丸める必要が出る場合はエラー）
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
		x = x % 10;
		if(x === 0) {
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
	 * @param {string} name - モードの英数名
	 * @returns {RoundingModeEntity}
	 */
	static valueOf(name) {
		if(name === null) {
			throw "NullPointerException";
		}
		if(name instanceof RoundingModeEntity) {
			return name;
		}
		const modetype = {
			RoundingMode_UP,
			RoundingMode_DOWN,
			RoundingMode_FLOOR,
			RoundingMode_CEILING,
			RoundingMode_HALF_UP,
			RoundingMode_HALF_DOWN,
			RoundingMode_HALF_EVEN,
			RoundingMode_UNNECESSARY
		};
		const upper_name = name.toUpperCase();
		for(let i = 0; i < modetype.length; i++) {
			if(modetype[i].toString() === upper_name) {
				return modetype[i];
			}
		}
		throw "IllegalArgumentException : " + name;
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


