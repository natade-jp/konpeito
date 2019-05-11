﻿/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import BigInteger from "./BigInteger.mjs";
import RoundingMode from "./context/RoundingMode.mjs";
import MathContext from "./context/MathContext.mjs";

/**
 * 初期化するときにcontextを設定しなかった場合のデフォルト値
 */
let DEFAULT_CONTEXT = MathContext.DECIMAL128;

/**
 * BigDecimal 内で使用する関数群
 */
class DecimalTool {

	/**
	 * 文字列から BigDecimal で使用するデータに変換
	 * @param ntext 
	 * @returns {{scale : number, integer : BigInteger}}
	 */
	static ToBigDecimalFromString(ntext) {
		let scale = 0;
		let buff;
		// 正規化
		let text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		let number_text = "";
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				number_text += "-";
			}
		}
		// 整数部があるか
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text += buff;
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text += buff;
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale   = scale - parseInt(buff, 10);
		}
		return {
			scale : scale,
			integer : new BigInteger([number_text, 10])
		};
	}

}

/**
 * 任意精度浮動小数点演算クラス (immutable)
 */
export default class BigDecimal {
	
	/**
	 * 任意精度浮動小数点を作成
	 * 配列で設定する場合は、 BigInteger, [スケール値=0], [環境=default], [精度設定=default]
	 * オブジェクトで設定する場合は、 integer, [scale=0], [default_context=default], [context=default]
	 * @param {BigDecimal|BigInteger|number|string} number - 任意精度実数データ
	 */
	constructor(number) {

		/**
		 * スケール
		 * @private
		 * @type {number}
		 */
		this._scale	= 0;
		
		/**
		 * 初期化時に使用したcontext
		 * @private
		 * @type {MathContext}
		 */
		this.default_context = DEFAULT_CONTEXT;

		let context = null;

		if(arguments.length > 1) {
			throw "BigDecimal Unsupported argument[" + arguments.length + "]";
		}
		if(number instanceof BigDecimal) {

			/**
			 * 整数部分
			 * @private
			 * @type {BigInteger}
			 */
			this.integer			= number.integer.clone();

			this._scale				= number._scale;
			
			/**
			 * 文字列化した整数部分（キャッシュ用）
			 * @private
			 * @type {string}
			 */
			this.int_string			= number.int_string;

			this.default_context	= number.default_context;

		}
		else if(number instanceof BigInteger) {
			this.integer	= number.clone();
		}
		else if(typeof number === "number" || number instanceof Number) {
			// 整数か
			if(number === Math.floor(number)) {
				this.integer = new BigInteger(number);
			}
			// 実数か
			else {
				let scale = 0;
				let x = number;
				for(let i = 0; i < 10; i++) {
					x = x * 10;
					scale = scale + 1;
					if(x === Math.floor(x)) {
						break;
					}
				}
				this._scale = scale;
				this.integer = new BigInteger(x);
				// 今後改善するならば
				// 64ビットの実数型は15桁程度まで正しい
				// 余裕をもって10桁程度までを抜き出すのが良いかと思われる。
				// スケールは右の式から求めて Math.log(x) / Math.log(10)
			}
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				if(!(typeof number[0] === "string" || number[0] instanceof String)) {
					this.integer = new BigInteger(number[0]);
				}
				else {
					// 1番目が文字列の場合は、文字列用の設定初期化を行う
					const data = DecimalTool.ToBigDecimalFromString(number[0]);
					this.integer	= data.integer;
					this._scale		= data.scale;
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number" || number[1] instanceof Number) {
					this._scale	= number[1];
					if(number.length >= 3) {
						this.default_context = number[2];
					}
					if(number.length >= 4) {
						context = number[3];
					}
				}
				else {
					if(number.length >= 2) {
						this.default_context = number[1];
					}
					if(number.length >= 3) {
						context = number[2];
					}
				}
			}
		}
		else if(typeof number === "string" || number instanceof String) {
			const data = DecimalTool.ToBigDecimalFromString(number);
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else if((number instanceof Object) && (number.scale !== undefined && number.default_context !== undefined)) {
			this.integer	= new BigInteger(number.integer);
			if(number.scale) {
				this._scale = number.scale;
			}
			if(number.default_context) {
				this.default_context = number.default_context;
			}
			if(number.context) {
				context = number.context;
			}
		}
		else if((number instanceof Object) && (number.toString !== undefined)) {
			const data = DecimalTool.ToBigDecimalFromString(number.toString());
			this.integer	= data.integer;
			this._scale		= data.scale;
		}
		else {
			throw "BigDecimal Unsupported argument " + arguments;
		}
		// データを正規化
		if(context) {
			const newbigdecimal = this.round(context);
			this.integer	= newbigdecimal.integer;
			this._scale		= newbigdecimal._scale;
			delete this.int_string;
		}
		
		// データが正しいかチェックする
		if((!(this.integer instanceof BigInteger)) || (!(this.default_context instanceof MathContext))) {
			throw "BigDecimal Unsupported argument " + arguments;
		}
	}

	/**
	 * BigDecimal を作成
	 * @param {BigDecimal|BigInteger|number|string} number - 任意精度実数データ
	 * @returns {BigDecimal}
	 */
	static create(number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	}

	/**
	 * 指定した数値から BigDecimal 型に変換
	 * @param {BigDecimal} x 
	 * @param {number} [scale] 
	 * @returns {BigDecimal}
	 */
	static valueOf(x, scale) {
		if(arguments.length === 1) {
			return new BigDecimal(x);
		}
		else {
			return new BigDecimal([x, scale]);
		}
	}

	/**
	 * BigDecimal を作成する
	 * @param {BigDecimal} number 
	 * @returns {BigDecimal}
	 * @private
	 */
	static _toBigDecimal(number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	}

	/**
	 * BigInteger を作成
	 * @param {BigDecimal} number 
	 * @returns {BigInteger}
	 * @private
	 */
	static _toBigInteger(number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.toBigInteger();
		}
		else {
			return new BigInteger(number);
		}
	}

	/**
	 * 実数を作成
	 * @param {BigDecimal} number 
	 * @returns {number}
	 * @private
	 */
	static _toFloat(number) {
		if((typeof number === "number") || (number instanceof Number)) {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.doubleValue;
		}
		else {
			return (new BigDecimal(number)).doubleValue;
		}
	}

	/**
	 * 整数を作成
	 * @param {BigDecimal} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		if((typeof number === "number") || (number instanceof Number)) {
			return number | 0;
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	}

	/**
	 * 符号を除いた文字列を作成
	 * キャッシュがなければ作成し、キャッシュがあればそれを返す
	 * @returns {string}
	 */
	_getUnsignedIntegerString() {
		// キャッシュする
		if(typeof this.int_string === "undefined") {
			this.int_string = this.integer.toString(10).replace(/^-/, "");
		}
		return this.int_string;
	}

	/**
	 * ディープコピー
	 * @returns {BigDecimal} 
	 */
	clone() {
		return new BigDecimal(this);
	}

	/**
	 * 倍率
	 * @returns {number} 
	 */
	scale() {
		return this._scale;
	}

	/**
	 * 符号値
	 * 1, -1, 0の場合は0を返す
	 * @returns {number}
	 */
	signum() {
		return this.integer.signum();
	}

	/**
	 * 符号値
	 * 1, -1, 0の場合は0を返す
	 * @returns {number}
	 */
	sign() {
		return this.signum();
	}

	/**
	 * 精度
	 * @returns {number} 
	 */
	precision() {
		return this._getUnsignedIntegerString().length;
	}

	/**
	 * 指数表記部分を取り除いた整数
	 * @returns {BigInteger} 
	 */
	unscaledValue() {
		return new BigInteger(this.integer);
	}

	/**
	 * 科学的表記法による文字列化
	 * @param {number} e_len - 指数部の桁数
	 * @returns {string} 
	 */
	toScientificNotation(e_len) {
		const e		= BigDecimal._toInteger(e_len);
		const text	= this._getUnsignedIntegerString();
		let s		= this.scale();
		const x		= [];
		let i, k;
		// -
		if(this.signum() === -1) {
			x[x.length] = "-";
		}
		// 表示上の桁数
		s = - e - s;
		// 小数点が付かない
		if(s >= 0) {
			x[x.length] = text;
			for(i = 0; i < s; i++) {
				x[x.length] = "0";
			}
		}
		// 小数点が付く
		else {
			k = this.precision() + s;
			if(0 < k) {
				x[x.length] = text.substring(0, k);
				x[x.length] = ".";
				x[x.length] = text.substring(k, text.length);
			}
			else {
				k = - k;
				x[x.length] = "0.";
				for(i = 0; i < k; i++) {
					x[x.length] = "0";
				}
				x[x.length] = text;
			}
		}
		x[x.length] = "E";
		if(e >= 0) {
			x[x.length] = "+";
		}
		x[x.length] = e;
		return x.join("");
	}

	/**
	 * 文字列化
	 * 指数が不要の場合は指数表記なし
	 * @returns {string} 
	 */
	toString() {
		// 「調整された指数」
		const x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			return this.toScientificNotation(x);
		}
	}

	/**
	 * 技術表記法による文字列化
	 * 指数が不要の場合は指数表記なし
	 * @returns {string} 
	 */
	toEngineeringString() {
		// 「調整された指数」
		const x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			// 0 でない値の整数部が 1 〜 999 の範囲に収まるように調整
			return this.toScientificNotation(Math.floor(x / 3) * 3);
		}
	}

	/**
	 * 指数表記なしの文字列化
	 * @returns {string} 
	 */
	toPlainString() {
		// スケールの変換なし
		if(this.scale() === 0) {
			if(this.signum() < 0) {
				return "-" + this._getUnsignedIntegerString();
			}
			else {
				return this._getUnsignedIntegerString();
			}
		}
		// 指数0で文字列を作成後、Eの後ろの部分をとっぱらう
		const text = this.toScientificNotation(0);
		return text.match(/^[^E]*/)[0];
	}

	/**
	 * 設定された精度で表すことができる最も小さな値
	 * @returns {BigDecimal} 
	 */
	ulp() {
		return new BigDecimal([BigInteger.ONE, this.scale(), this.default_context]);
	}

	/**
	 * スケールの再設定
	 * @param {number} new_scale - 新しいスケール
	 * @param {RoundingModeEntity} [roundingMode=RoundingMode.UNNECESSARY] - 精度を変換する際の丸め方
	 * @param {MathContext} [mc] - 切り替え先の設定（これのみ変更する場合は、roundを使用すること）
	 * @returns {BigDecimal} 
	 */
	setScale(new_scale, roundingMode=RoundingMode.UNNECESSARY, mc) {
		const newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		const context = (mc !== undefined) ? mc : this.default_context;
		// 文字列を扱ううえで、符号があるとやりにくいので外しておく
		let text		= this._getUnsignedIntegerString();
		const sign		= this.signum();
		const sign_text	= sign >= 0 ? "" : "-";
		// scale の誤差
		// 0 以上なら 0 を加えればいい。0未満なら0を削るか、四捨五入など丸めを行う
		const delta		= newScale - this.scale();	// この桁分増やすといい
		if(0 <= delta) {
			// 0を加える
			let i;
			for(i = 0; i < delta; i++) {
				text = text + "0";
			}
			return new BigDecimal([new BigInteger(sign_text + text), newScale, context]);
		}
		const keta = text.length + delta;		// 最終的な桁数
		const keta_marume = keta + 1;
		if(keta <= 0) {
			// 指定した scale では設定できない場合
			// 例えば "0.1".setScale(-2), "10".setScale(-3) としても表すことは不可能であるため、
			// sign（-1, 0, +1）のどれかの数値を使用して丸める
			const outdata = (sign + roundingMode.getAddNumber(sign)) / 10;
			// 上記の式は、CEILINGなら必ず1、正でCEILINGなら1、負でFLOORなら1、それ以外は0となり、
			// さらに元々の数値が 0 なら 0、切り捨て不能なら例外が返る計算式である。
			// これは Java の動作をまねています。
			return new BigDecimal([new BigInteger(outdata), newScale, context]);
		}
		{
			// 0を削るだけで解決する場合
			// 単純な切捨て(0を削るのみ)
			const zeros			= text.match(/0+$/);
			const zero_length		= (zeros !== null) ? zeros[0].length : 0;
			if(( (zero_length + delta) >= 0 ) || (roundingMode === RoundingMode.DOWN)) {
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, keta)), newScale, context]);
			}
		}
		{
			// 丸め計算で解決する場合
			// 12345 -> '123'45
			text = text.substring(0, keta_marume);
			// 丸め計算に必要な切り取る桁数(後ろの1～2桁を取得)
			const cutsize = text.length > 1 ? 2 : 1;
			// '123'45 -> 1'23'4
			const number = parseInt(text.substring(text.length - cutsize, text.length)) * sign;
			// 「元の数」と「丸めに必要な数」を足す
			const x1 = new BigInteger(sign_text + text);
			const x2 = new BigInteger(roundingMode.getAddNumber(number));
			text = x1.add(x2).toString();
			// 丸め後の桁数に戻して
			return new BigDecimal([new BigInteger(text.substring(0, text.length - 1)), newScale, context]);
		}
	}

	/**
	 * 環境設定を切り替える
	 * @param {MathContext} mc - 切り替え先の設定
	 * @returns {BigDecimal} 
	 */
	round(mc) {
		if(!(mc instanceof MathContext)) {
			throw "not MathContext";
		}
		const newPrecision	= mc.getPrecision();
		const delta			= newPrecision - this.precision();
		if((delta === 0)||(newPrecision === 0)) {
			return this.clone();
		}
		const newBigDecimal = this.setScale( this.scale() + delta, mc.getRoundingMode(), mc);
		/* 精度を上げる必要があるため、0を加えた場合 */
		if(delta > 0) {
			return newBigDecimal;
		}
		/* 精度を下げる必要があるため、丸めた場合は、桁の数が正しいか調べる */
		if(newBigDecimal.precision() === mc.getPrecision()) {
			return newBigDecimal;
		}
		/* 切り上げなどで桁数が１つ増えた場合 */
		const sign_text	= newBigDecimal.integer.signum() >= 0 ? "" : "-";
		const abs_text	= newBigDecimal._getUnsignedIntegerString();
		const inte_text	= sign_text + abs_text.substring(0, abs_text.length - 1);
		return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1, mc]);
	}

	/**
	 * abs(A)
	 * @param {MathContext} [mc] - 計算に使用する設定
	 * @returns {BigDecimal} 
	 */
	abs(mc) {
		const output = this.clone();
		output.integer = output.integer.abs();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * +A
	 * @param {MathContext} [mc] - 計算に使用する設定
	 * @returns {BigDecimal} 
	 */
	plus(mc) {
		const output = this.clone();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * -A
	 * @param {MathContext} [mc] - 計算に使用する設定
	 * @returns {BigDecimal} 
	 */
	negate(mc) {
		const output = this.clone();
		output.integer = output.integer.negate();
		return (mc === undefined) ? output : output.round(mc);
	}

	/**
	 * 値同士を比較
	 * 戻り値は、number 型
	 * @param {BigDecimal} number 
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number) {
		const src = this;
		const tgt = BigDecimal._toBigDecimal(number);
		// 簡易計算
		{
			const src_sign	= src.signum();
			const tgt_sign	= tgt.signum();
			if((src_sign === 0) && (src_sign === tgt_sign)) {
				return 0;
			}
			else if(src_sign === 0) {
				return - tgt_sign;
			}
			else if(tgt_sign === 0) {
				return src_sign;
			}
		}
		// 実際に計算する
		if(src._scale === tgt._scale) {
			return src.integer.compareTo(tgt.integer);
		}
		else if(src._scale > tgt._scale) {
			const newdst = tgt.setScale(src._scale);
			return src.integer.compareTo(newdst.integer);
		}
		else {
			const newsrc = src.setScale(tgt._scale);
			return newsrc.integer.compareTo(tgt.integer);
		}
	}

	/**
	 * A === B
	 * 精度やスケール含めて等しいかをテストする
	 * @param {BigDecimal} number 
	 * @returns {boolean} A === B
	 */
	equals(number) {
		if(number instanceof BigDecimal) {
			return ((this._scale === number._scale) && (this.integer.equals(number.integer)));
		}
		else if((typeof number === "string") || (number instanceof String)) {
			const val = BigDecimal._toBigDecimal(number);
			return ((this._scale === val._scale) && (this.integer.equals(val.integer)));
		}
		else {
			return this.compareTo(number) === 0;
		}
	}

	/**
	 * min([A, B])
	 * @param {BigDecimal} number 
	 * @returns {BigDecimal} 
	 */
	min(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) <= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * max([A, B])
	 * @param {BigDecimal} number
	 * @returns {BigDecimal} 
	 */
	max(number) {
		const val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	}

	/**
	 * A * 10^floor(n)
	 * @param {number} n 
	 * @returns {BigDecimal} 
	 */
	scaleByPowerOfTen(n) {
		const x = BigDecimal._toBigInteger(n);
		const output = this.clone();
		output._scale = this.scale() - x;
		return output;
	}

	/**
	 * 小数点の位置を左へ移動
	 * @param {number} n 
	 * @returns {BigDecimal} 
	 */
	movePointLeft(n) {
		const x = BigDecimal._toBigInteger(n);
		let output = this.scaleByPowerOfTen( -x );
		output = output.setScale(Math.max(this.scale() + x, 0));
		return output;
	}

	/**
	 * 小数点の位置を右へ移動
	 * @param {number} n 
	 * @returns {BigDecimal} 
	 */
	movePointRight(n) {
		const x = BigDecimal._toBigInteger(n);
		let output = this.scaleByPowerOfTen( x );
		output = output.setScale(Math.max(this.scale() - x, 0));
		return output;
	}

	/**
	 * 数字の右側にある0を取り除き、スケールを正規化
	 * @returns {BigDecimal} 
	 */
	stripTrailingZeros() {
		// 0をできる限り取り除く
		const sign		= this.signum();
		const sign_text	= sign >= 0 ? "" : "-";
		const text		= this.integer.toString(10).replace(/^-/, "");
		const zeros		= text.match(/0+$/);
		let zero_length	= (zeros !== null) ? zeros[0].length : 0;
		if(zero_length === text.length) {
			// 全て 0 なら 1 ケタ残す
			zero_length = text.length - 1;
		}
		const newScale	= this.scale() - zero_length;
		return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), newScale, this.default_context]);
	}

	/**
	 * A + B
	 * @param {BigDecimal} number 
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	add(number, context) {
		const augend = BigDecimal._toBigDecimal(number);
		const mc = context ? context : augend.default_context;
		const src			= this;
		const tgt			= augend;
		const newscale	= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			// 1 e1 + 1 e1 = 1
			return new BigDecimal([src.integer.add(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			// 1 e-2 + 1 e-1
			const newdst = tgt.setScale(src._scale);
			// 0.01 + 0.10 = 0.11 = 11 e-2
			return new BigDecimal([src.integer.add(newdst.integer), newscale, mc, mc]);
		}
		else {
			// 1 e-1 + 1 e-2
			const newsrc = src.setScale(tgt._scale);
			// 0.1 + 0.01 = 0.11 = 11 e-2
			return new BigDecimal([newsrc.integer.add(tgt.integer), newscale, mc, mc]);
		}
	}

	/**
	 * A - B
	 * @param {BigDecimal} number 
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	subtract(number, context) {
		const subtrahend = BigDecimal._toBigDecimal(number);
		const mc = context ? context : subtrahend.default_context;
		const src			= this;
		const tgt			= subtrahend;
		const newscale	= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			return new BigDecimal([src.integer.subtract(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			const newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.subtract(newdst.integer), newscale, mc, mc]);
		}
		else {
			const newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.subtract(tgt.integer), newscale, mc, mc]);
		}
	}

	/**
	 * A - B
	 * @param {BigDecimal} number 
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	sub(number, context) {
		return this.subtract(number, context);
	}

	/**
	 * A * B
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	multiply(number, context) {
		const multiplicand = BigDecimal._toBigDecimal(number);
		const mc = context ? context : multiplicand.default_context;
		const src			= this;
		const tgt			= multiplicand;
		const newinteger	= src.integer.multiply(tgt.integer);
		// 0.1 * 0.01 = 0.001
		const newscale	= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	}

	/**
	 * A * B
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	mul(number, context) {
		return this.multiply(number, context);
	}

	/**
	 * (int)(A / B)
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal} 
	 */
	divideToIntegralValue(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		const mc = context ? context : divisor.default_context;
		const getDigit  = function( num ) {
			let i;
			let text = "1";
			for(i = 0; i < num; i++) {
				text = text + "0";
			}
			return new BigInteger(text);
		};
		if(divisor.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		// 1000e0		/	1e2				=	1000e-2
		// 1000e0		/	10e1			=	100e-1
		// 1000e0		/	100e0			=	10e0
		// 1000e0		/	1000e-1			=	1e1
		// 1000e0		/	10000e-2		=	1e1
		// 1000e0		/	100000e-3		=	1e1

		// 10e2			/	100e0			=	1e1
		// 100e1		/	100e0			=	1e1
		// 1000e0		/	100e0			=	10e0
		// 10000e-1		/	100e0			=	100e-1	
		// 100000e-2	/	100e0			=	1000e-2

		const src		= this;
		const tgt		= divisor;
		let src_integer	= src.integer;
		let tgt_integer	= tgt.integer;
		const newScale	= src._scale - tgt._scale;

		// 100e-2 / 3e-1 = 1 / 0.3 -> 100 / 30
		if(src._scale > tgt._scale) {
			// src._scale に合わせる
			tgt_integer = tgt_integer.multiply(getDigit(  newScale ));
		}
		// 1e-1 / 3e-2 = 0.1 / 0.03 -> 10 / 3
		else if(src._scale < tgt._scale) {
			// tgt._scale に合わせる
			src_integer = src_integer.multiply(getDigit( -newScale ));
		}

		// とりあえず計算結果だけ作ってしまう
		const new_integer	= src_integer.divide(tgt_integer);
		const sign			= new_integer.signum();
		if(sign !== 0) {
			const text	= new_integer.toString(10).replace(/^-/, "");
			// 指定した桁では表すことができない
			if((mc.getPrecision() !== 0) && (text.length > mc.getPrecision())) {
				throw "ArithmeticException";
			}
			// 結果の優先スケール に合わせる (this.scale() - divisor.scale())
			if(text.length <= (-newScale)) {
				// 合わせることができないので、0をできる限り削る = stripTrailingZerosメソッド
				const zeros			= text.match(/0+$/);
				const zero_length	= (zeros !== null) ? zeros[0].length : 0;
				const sign_text		= sign >= 0 ? "" : "-";
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), -zero_length, mc]);
			}
		}

		let output = new BigDecimal(new_integer);
		output = output.setScale(newScale, RoundingMode.UP);
		output = output.round(mc);
		output.default_context = mc;
		return output;
	}

	/**
	 *  (int)(A / B) と割り算の余り
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
	 */
	divideAndRemainder(number, context) {
		const divisor = BigDecimal._toBigDecimal(number);
		const mc = context ? context : divisor.default_context;

		// 1000e0		/	1e2				=	1000e-2	... 0e0
		// 1000e0		/	10e1			=	100e-1	... 0e0
		// 1000e0		/	100e0			=	10e0	... 0e0
		// 1000e0		/	1000e-1			=	1e1		... 0e0
		// 1000e0		/	10000e-2		=	1e1		... 0e-1
		// 1000e0		/	100000e-3		=	1e1		... 0e-2

		// 10e2			/	100e0			=	1e1		... 0e1
		// 100e1		/	100e0			=	1e1		... 0e1
		// 1000e0		/	100e0			=	10e0	... 0e0
		// 10000e-1		/	100e0			=	100e-1	... 0e-1
		// 100000e-2	/	100e0			=	1000e-2	... 0e-2

		const result_divide	= this.divideToIntegralValue(divisor, mc);
		const result_remaind	= this.subtract(result_divide.multiply(divisor, mc), mc);

		const output = [result_divide, result_remaind];
		return output;
	}

	/**
	 * A rem B
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal}
	 */
	rem(number, context) {
		return this.divideAndRemainder(number, context)[1];
	}

	/**
	 * A mod B
	 * @param {BigDecimal} number
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal}
	 */
	mod(number, context) {
		const x = this.rem(number, context);
		if(x.compareTo(BigDecimal.ZERO) < 0) {
			return x.add(number, context);
		}
	}

	/**
	 * A / B
	 * @param {BigDecimal} number
	 * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
	 * @returns {BigDecimal}
	 */
	divide(number, type) {
		const divisor = BigDecimal._toBigDecimal(number);
		const src			= this;
		const tgt			= divisor;
		let roundingMode	= null;
		let mc				= null;
		let newScale		= 0;
		let isPriorityScale	= false;
		if(type && type.scale) {
			isPriorityScale	= false;
			newScale = type.scale;
		}
		else {
			isPriorityScale	= true;
			if(type && (type.roundingMode || type.context)) {
				newScale = src.scale();
			}
			else {
				newScale = src.scale() - tgt.scale();
			}
		}
		if(type && type.context) {
			roundingMode = type.context.getRoundingMode();
			newScale = type.context.getPrecision();
			mc = type.context;
		}
		else {
			mc = this.default_context;
		}
		if(type && type.roundingMode) {
			roundingMode = type.roundingMode;
		}
		else {
			roundingMode = mc.getRoundingMode();
		}
		
		if(tgt.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}
		let i;
		let newsrc = src;
		const result_map = [];
		let result, result_divide, result_remaind, all_result;
		all_result = BigDecimal.ZERO;
		const precision = mc.getPrecision();
		const check_max = precision !== 0 ? (precision + 8) : 0x3FFFF;
		for(i = 0; i < check_max; i++) {
			result = newsrc.divideAndRemainder(tgt, MathContext.UNLIMITED);
			result_divide	= result[0];
			result_remaind	= result[1];
			all_result = all_result.add(result_divide.scaleByPowerOfTen(-i), MathContext.UNLIMITED);
			if(result_remaind.compareTo(BigDecimal.ZERO) !== 0) {
				if(precision === 0) {	// 精度無限大の場合は、循環小数のチェックが必要
					if(result_map[result_remaind._getUnsignedIntegerString()]) {
						throw "ArithmeticException " + all_result + "[" + result_remaind._getUnsignedIntegerString() + "]";
					}
					else {
						result_map[result_remaind._getUnsignedIntegerString()] = true;
					}
				}
				newsrc = result_remaind.scaleByPowerOfTen(1);
			}
			else {
				break;
			}
		}
		if(isPriorityScale) {
			// 優先スケールの場合は、スケールの変更に失敗する可能性あり
			try {
				all_result = all_result.setScale(newScale, roundingMode);
			}
			catch(e) {
				// falls through
			}
		}
		else {
			all_result = all_result.setScale(newScale, roundingMode);
		}
		all_result = all_result.round(mc);
		return all_result;
	}

	/**
	 * A / B
	 * @param {BigDecimal} number
	 * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
	 * @returns {BigDecimal}
	 */
	div(number, type) {
		return this.divide(number, type);
	}

	/**
	 * BigInteger に変換
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		const x = this.toPlainString().replace(/\.\d*$/, "");
		return new BigInteger(x);
	}

	/**
	 * BigInteger に変換
	 * 変換に失敗した場合は例外
	 * @returns {BigInteger}
	 */
	toBigIntegerExact() {
		const x = this.setScale(0, RoundingMode.UNNECESSARY);
		return new BigInteger(x.toPlainString());
	}

	/**
	 * 32ビット整数に変換
	 * @returns {number}
	 */
	get intValue() {
		let x = this.toBigInteger();
		x = x.intValue;
		return x & 0xFFFFFFFF;
	}

	/**
	 * 32ビット整数に変換
	 * 変換に失敗した場合は例外
	 * @returns {number}
	 */
	get intValueExact() {
		let x = this.toBigIntegerExact();
		x = x.intValue;
		if((x < -2147483648) || (2147483647 < x)) {
			throw "ArithmeticException";
		}
		return x;
	}

	/**
	 * 32ビット実数に変換
	 * @returns {number}
	 */
	get floatValue() {
		const p = this.precision();
		if(MathContext.DECIMAL32.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(p.toEngineeringString());
	}

	/**
	 * 64ビット実数に変換
	 * @returns {number}
	 */
	get doubleValue() {
		const p = this.precision();
		if(MathContext.DECIMAL64.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(p.toEngineeringString());
	}

	/**
	 * pow(A, B)
	 * 巨大な乗算をする場合は例外を発生させる
	 * @param {number} number 
	 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、本オブジェクトの設定デフォルト値を使用する
	 * @returns {BigDecimal}
	 */
	pow(number, context) {
		let n = BigDecimal._toInteger(number);
		const mc = context ? context : n.default_context;
		if(Math.abs(n) > 999999999) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() === 0) && (n < 0)) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() > 0) && (n > mc.getPrecision())) {
			throw "ArithmeticException";
		}
		let x, y;
		x = this.clone();
		y = BigDecimal.ONE;
		while(n !== 0) {
			if((n & 1) !== 0) {
				y = y.multiply(x, MathContext.UNLIMITED);
			}
			x = x.multiply(x, MathContext.UNLIMITED);
			n >>>= 1;
		}
		return y.round(mc);
	}
	
	/**
	 * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定
	 * @param {MathContext} [context=MathContext.DECIMAL128]
	 */
	static setDefaultContext(context) {
		DEFAULT_CONTEXT = context ? context : MathContext.DECIMAL128;
	}

	/**
	 * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定を取得
	 * @returns {MathContext}
	 */
	static getDefaultContext() {
		return DEFAULT_CONTEXT;
	}

	// ----------------------
	// 定数
	// ----------------------
	
	/**
	 * 0
	 * @returns {BigDecimal}
	 */
	static get ZERO() {
		const x = new BigDecimal(DEFINE.ZERO);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	}

	/**
	 * 1
	 * @returns {BigDecimal}
	 */
	static get ONE() {
		const x = new BigDecimal(DEFINE.ONE);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	}
	
	/**
	 * 2
	 * @returns {BigDecimal}
	 */
	static get TWO() {
		const x = new BigDecimal(DEFINE.TWO);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	}
	
	/**
	 * 10
	 * @returns {BigDecimal}
	 */
	static get TEN() {
		const x = new BigDecimal(DEFINE.TEN);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	}

}

/**
 * 内部で使用する定数値
 */
const DEFINE = {
	ZERO : new BigDecimal(0),
	ONE : new BigDecimal(1),
	TWO : new BigDecimal(2),
	TEN : new BigDecimal(10)
};

BigDecimal.RoundingMode = RoundingMode;
BigDecimal.MathContext = MathContext;