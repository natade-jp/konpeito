/**
 * The script is part of SenkoJS.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import RoundingMode from "./RoundingMode.mjs";

/**
 * BigDecimal用の環境設定
 */
export default  class MathContext {

	/**
	 * 任意精度の環境設定データ
	 * @param {string|number} precision_or_name - 精度を数値で指定するか、設定自体を文字列で指定する
	 * @param {RoundingModeEntity} [roundingMode=RoundingMode.HALF_UP] - 丸めモード
	 */
	constructor(precision_or_name, roundingMode) {
		this.precision = precision_or_name;
		this.roundingMode = roundingMode === undefined ? RoundingMode.HALF_UP : roundingMode;
		if((typeof precision_or_name === "string") || (precision_or_name instanceof String)) {
			let buff = precision_or_name.match(/precision=\d+/);
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
	 * 精度
	 * @returns {number}
	 */
	getPrecision() {
		return this.precision;
	}

	/**
	 * 丸め方
	 * @returns {RoundingModeEntity}
	 */
	getRoundingMode() {
		return this.roundingMode;
	}

	/**
	 * 環境が等しいか
	 * @param {MathContext} x - 比較対象
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
	 * 文字列化
	 * @returns {string}
	 */
	toString() {
		return ("precision=" + this.precision + " roundingMode=" + this.roundingMode.toString());
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 制限を設けない（ただし、割り算で循環小数の場合にエラーが出ます。）
	 * @returns {MathContext}
	 */
	static get UNLIMITED() {
		return DEFINE.UNLIMITED;
	}

	/**
	 * 32ビットの実数型 ( float ) と同等
	 * @returns {MathContext}
	 */
	static get DECIMAL32() {
		return DEFINE.DECIMAL32;
	}


	/**
	 * 64ビットの実数型 ( double ) と同等
	 * @returns {MathContext}
	 */
	static get DECIMAL64() {
		return DEFINE.DECIMAL64;
	}


	/**
	 * 128ビットの実数型 ( long double ) と同等
	 * @returns {MathContext}
	 */
	static get DECIMAL128() {
		return DEFINE.DECIMAL128;
	}

}

const DEFINE = {
	UNLIMITED	: new MathContext(0,	RoundingMode.HALF_UP),
	DECIMAL32	: new MathContext(7,	RoundingMode.HALF_EVEN),
	DECIMAL64	: new MathContext(16,	RoundingMode.HALF_EVEN),
	DECIMAL128	: new MathContext(34,	RoundingMode.HALF_EVEN)
};
