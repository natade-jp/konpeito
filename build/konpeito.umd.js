/*!
 * konpeito.js
 * https://github.com/natade-jp/konpeito
 * Copyright 2013-2019 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.konpeito = factory());
}(this, function () { 'use strict';

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
	  * 
	  * @ignore
	  */
	var Format = function Format () {};

	Format.format = function format (text, parmeter) {
		var parm_number = 1;
		var parm = arguments;
		var toUnsign  = function(num) {
			var x = num;
			if(x >= 0) {
				return(x);
			}
			else {
				x = -x;
				//16ビットごとに分けてビット反転
				var high = ((~x) >> 16) & 0xFFFF;
				high *= 0x00010000;
				var low  =  (~x) & 0xFFFF;
				return(high + low + 1);
			}
		};
		var func = function(text) {
			var str = text;
			// 1文字目の%を除去
			str = str.substring(1, str.length);
			var buff;
			// [6] 変換指定子(最後の1文字を取得)
			buff = str.match(/.$/);
			var type = buff[0];
			if(type === "%") {
				return("%");
			}
			// ここからパラメータの解析開始
			// [1] 引数順
			buff = str.match(/^[0-9]+\$/);
			if(buff !== null) {
				buff = buff[0];
				// 残りの文字列を取得
				str = str.substring(buff.length, str.length);
				// 数字だけ切り出す
				buff = buff.substring(0, buff.length - 1);
				// 整数へ
				parm_number = parseInt(buff , 10);
			}
			// 引数を取得
			var parameter = parm[parm_number];
			parm_number = parm_number + 1;
			// [2] フラグ
			buff = str.match(/^[-+ #0]+/);
			var isFlagSharp = false;
			var isFlagTextAlignLeft = false;
			var isFlagFillZero = false;
			var sSignCharacter = "";
			if(buff !== null) {
				buff = buff[0];
				// 残りの文字列を取得
				str = str.substring(buff.length, str.length);
				if(buff.indexOf("#") !== -1) {
					isFlagSharp = true;
				}
				if(buff.indexOf("-") !== -1) {
					isFlagTextAlignLeft = true;
				}
				if(buff.indexOf(" ") !== -1) {
					sSignCharacter = " ";
				}
				if(buff.indexOf("+") !== -1) {
					sSignCharacter = "+";
				}
				if(buff.indexOf("0") !== -1) {
					isFlagFillZero = true;
				}
			}
			// [3] 最小フィールド幅
			var width = 0;
			buff = str.match(/^([0-9]+|\*)/);
			if(buff !== null) {
				buff = buff[0];
				// 残りの文字列を取得
				str = str.substring(buff.length, str.length);
				if(buff.indexOf("*") !== -1) { // 引数で最小フィールド幅を指定
					width = parameter;
					parameter = parm[parm_number];
					parm_number = parm_number + 1;
				}
				else { // 数字で指定
					width = parseInt(buff , 10);
				}
			}
			// [4] 精度の指定
			var isPrecision = false;
			var precision = 0;
			buff = str.match(/^(\.((-?[0-9]+)|\*)|\.)/); //.-3, .* , .
			if(buff !== null) {
				buff = buff[0];
				// 残りの文字列を取得
				str = str.substring(buff.length, str.length);
				isPrecision = true;
				if(buff.indexOf("*") !== -1) { // 引数で精度を指定
					precision = parameter;
					parameter = parm[parm_number];
					parm_number = parm_number + 1;
				}
				else if(buff.length === 1) { // 小数点だけの指定
					precision = 0;
				}
				else { // 数字で指定
					buff = buff.substring(1, buff.length);
					precision = parseInt(buff , 10);
				}
			}
			// 長さ修飾子(非サポート)
			buff = str.match(/^hh|h|ll|l|L|z|j|t/);
			if(buff !== null) {
				str = str.substring(buff.length, str.length);
			}
			// 文字列を作成する
			var output = "";
			var isInteger = false;
			switch(type.toLowerCase()) {
				// 数字関連
				case "d":
				case "i":
				case "u":
				case "b":
				case "o":
				case "x":
					isInteger = true;
					// falls through
				case "e":
				case "f":
				case "g":
				{
					var sharpdata = "";
					var textlength = 0; // 現在の文字を構成するために必要な長さ
					var spacesize;  // 追加する横幅
					// 整数
					if(isInteger) {
						// 数字に変換
						if(isNaN(parameter)) {
							parameter = parseInt(parameter, 10);
						}
						// 正負判定
						if((type === "d") || (type === "i")) {
							if(parameter < 0) {
								sSignCharacter = "-";
								parameter  = -parameter;
							}
							parameter  = Math.floor(parameter);
						}
						else {
							if(parameter >= 0) {
								parameter  = Math.floor(parameter);
							}
							else {
								parameter  = Math.ceil(parameter);
							}
						}
					}
					// 実数
					else {
						// 数字に変換
						if(isNaN(parameter)) {
							parameter = parseFloat(parameter);
						}
						// 正負判定
						if(parameter < 0) {
							sSignCharacter = "-";
							parameter  = -parameter;
						}
						if(!isPrecision) {
							precision = 6;
						}
					}
					// 文字列を作成していく
					switch(type.toLowerCase()) {
						case "d":
						case "i":
							output += parameter.toString(10);
							break;
						case "u":
							output += toUnsign(parameter).toString(10);
							break;
						case "b":
							output += toUnsign(parameter).toString(2);
							if(isFlagSharp) {
								sharpdata = "0b";
							}
							break;
						case "o":
							output  += toUnsign(parameter).toString(8);
							if(isFlagSharp) {
								sharpdata = "0";
							}
							break;
						case "x":
						case "X":
							output  += toUnsign(parameter).toString(16);
							if(isFlagSharp) {
								sharpdata = "0x";
							}
							break;
						case "e":
							output += parameter.toExponential(precision);
							break;
						case "f":
							output += parameter.toFixed(precision);
							break;
						case "g":
							if(precision === 0) { // 0は1とする
								precision = 1;
							}
							output += parameter.toPrecision(precision);
							// 小数点以下の語尾の0の削除
							if((!isFlagSharp) && (output.indexOf(".") !== -1)) {
								output = output.replace(/\.?0+$/, "");  // 1.00 , 1.10
								output = output.replace(/\.?0+e/, "e"); // 1.0e , 1.10e
							}
							break;
						default:
							// 上でチェックしているため、ありえない
							break;
					}
					// 整数での後処理
					if(isInteger) {
						if(isPrecision) { // 精度の付け足し
							spacesize  = precision - output.length;
							for(var i = 0; i < spacesize; i++) {
								output = "0" + output;
							}
						}
					}
					// 実数での後処理
					else {
						if(isFlagSharp) { 
							// sharp指定の時は小数点を必ず残す
							if(output.indexOf(".") === -1) {
								if(output.indexOf("e") !== -1) {
									output = output.replace("e", ".e");
								}
								else {
									output += ".";
								}
							}
						}
					}
					// 指数表記は、3桁表示(double型のため)
					if(output.indexOf("e") !== -1) {
						var buff$1 = function(str) {
							var l   = str.length;
							if(str.length === 3) { // e+1 -> e+001
								return(str.substring(0, l - 1) + "00" + str.substring(l - 1, l));
							}
							else { // e+10 -> e+010
								return(str.substring(0, l - 2) + "0" + str.substring(l - 2, l));
							}
						};
						output = output.replace(/e[+-][0-9]{1,2}$/, buff$1);
					}
					textlength = output.length + sharpdata.length + sSignCharacter.length;
					spacesize  = width - textlength;
					// 左よせ
					if(isFlagTextAlignLeft) {
						for(var i$1 = 0; i$1 < spacesize; i$1++) {
							output = output + " ";
						}
					}
					// 0を埋める場合
					if(isFlagFillZero) {
						for(var i$2 = 0; i$2 < spacesize; i$2++) {
							output = "0" + output;
						}
					}
					// マイナスや、「0x」などを接続
					output = sharpdata + output;
					output = sSignCharacter + output;
					// 0 で埋めない場合
					if((!isFlagFillZero) && (!isFlagTextAlignLeft)) {
						for(var i$3 = 0; i$3 < spacesize; i$3++) {
							output = " " + output;
						}
					}
					// 大文字化
					if(type.toUpperCase() === type) {
						output = output.toUpperCase();
					}
					break;
				}
				// 文字列の場合
				case "c":
					if(!isNaN(parameter)) {
						parameter = String.fromCharCode(parameter);
					}
					// falls through
				case "s":
				{
					if(!isNaN(parameter)) {
						parameter = parameter.toString(10);
					}
					output = parameter;
					if(isPrecision) { // 最大表示文字数
						if(output.length > precision) {
							output = output.substring(0, precision);
						}
					}
					var s_textlength = output.length; // 現在の文字を構成するために必要な長さ
					var s_spacesize  = width - s_textlength;  // 追加する横幅
					// 左よせ / 右よせ
					if(isFlagTextAlignLeft) {
						for(var i$4 = 0; i$4 < s_spacesize; i$4++) {
							output = output + " ";
						}
					}
					else {
						// 拡張
						var s = isFlagFillZero ? "0" : " ";
						for(var i$5 = 0; i$5 < s_spacesize; i$5++) {
							output = s + output;
						}
					}
					break;
				}
				// パーセント
				case "%":
					output = "%";
					break;
				// 未サポート
				case "p":
				case "n":
					output = "(変換できません)";
					break;
				default:
					// 正規表現でチェックしているため、ありえない
					break;
			}
			return (output);	
		};
		return (parm[0].replace(/%[^diubBoxXeEfFgGaAcspn%]*[diubBoxXeEfFgGaAcspn%]/g, func));
	};

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
	 * ログのバッファ
	 * @ignore
	 */
	var printbuffer = "";

	/**
	 * ログを記録するクラス
	 * @ignore
	 */
	var Log = function Log () {};

	Log._toStringFromObj = function _toStringFromObj (text_obj) {
		var text;
		if((typeof text_obj === "string")||(text_obj instanceof String)) {
			if(text_obj.length === 0) {
				// Edge だと console.log("") でエラー表示になるため
				text = " ";
			}
			else {
				text = text_obj;
			}
		}
		else if(typeof text_obj === "undefined") {
			text = typeof text_obj;
		}
		else if(text_obj === null) {
			text = "null";
		}
		else if(typeof text_obj.toString === "function") {
			text = text_obj.toString();
		}
		else if(text_obj instanceof Object) {
			text = "Object";
		}
		else {
			text = "null";
		}
		return text;
	};
		
	/**
		 * データを文字列化して記録
		 * @param {*} text_obj 
		 */
	Log.println = function println (text_obj) {
		var text = printbuffer + Log._toStringFromObj(text_obj);
		printbuffer = "";
		console.log(text);
	};
		
	/**
		 * データを文字列化して記録（折り返し禁止）
		 * @param {*} text_obj 
		 */
	Log.print = function print (text_obj) {
		printbuffer += Log._toStringFromObj(text_obj);
	};
		
	/**
		 * ログを記録する
		 * C言語のprintfのようなフォーマットが指定可能
		 * @param {string} text 
		 * @param {string} parmeter パラメータは可変引数
		 */
	Log.printf = function printf (text, parmeter) {
			var arguments$1 = arguments;

		var x = [];
		for(var i = 0 ; i < arguments.length ; i++) {
			x.push(arguments$1[i]);
		}
		Log.print(Format.format.apply(this, x));
	};

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
	 * 乱数クラス内で使用するツール集
	 * @ignore
	 */
	var RandomTool = function RandomTool () {};

	RandomTool.unsigned32 = function unsigned32 (x) {
		return ((x < 0) ? ((x & 0x7FFFFFFF) + 0x80000000) : x);
	};

	/**
		 * 2つの32ビット整数を掛け算して、32ビットの整数を出力する
		 * @param {number} x1 
		 * @param {number} x2 
		 * @returns {number}
		 */
	RandomTool.multiplication32 = function multiplication32 (x1, x2) {
		var b = (x1 & 0xFFFF) * (x2 & 0xFFFF);
		var y = RandomTool.unsigned32(b);
		b = (x1 & 0xFFFF) * (x2 >>> 16);
		y = RandomTool.unsigned32(y + ((b & 0xFFFF) << 16));
		b = (x1 >>> 16) * (x2 & 0xFFFF);
		y = RandomTool.unsigned32(y + ((b & 0xFFFF) << 16));
		return (y & 0xFFFFFFFF);
	};

	/**
	 * 乱数クラス
	 */
	var Random = function Random(seed) {
		// 「M系列乱数」で乱数を作成します。
		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 比較的長い 2^521 - 1通りを出力します。
		// 乱数はCでの動作と同じ値が出ることを確認。(seed = 1として1000番目の値が等しいことを確認)

		/**
			 * 乱数配列
			 * @private
			 * @type {Array<number>}
			 */
		this.x = [];
		for(var i = 0;i < 521;i++) {
			this.x[i] = 0;
		}
		if(arguments.length >= 1) {
			this.setSeed(seed);
		}
		else {
			// 線形合同法で適当に乱数を作成する
			var seed$1 = ((new Date()).getTime() + Random.seedUniquifier) & 0xFFFFFFFF;
			Random.seedUniquifier = (Random.seedUniquifier + 1) & 0xFFFFFFFF;
			this.setSeed(seed$1);
		}
	};

	/**
		 * 内部データをシャッフル
		 */
	Random.prototype._rnd521 = function _rnd521 () {
		var x = this.x;
		for(var i = 0; i < 32; i++) {
			x[i] ^= x[i + 489];
		}
		for(var i$1 = 32; i$1 < 521; i$1++) {
			x[i$1] ^= x[i$1 - 32];
		}
	};

	/**
		 * 乱数を初期化する
		 * @param {number} seed
		 */
	Random.prototype.setSeed = function setSeed (seed) {
		// 伏見「乱数」東京大学出版会,1989 の方法により初期値を設定
		var u = 0;
		var x = this.x;
		// seedを使用して線形合同法でx[0-16]まで初期値を設定
		var random_seed = seed;
		for(var i = 0; i <= 16; i++) {
			for(var j = 0; j < 32; j++) {
				random_seed = RandomTool.multiplication32(random_seed, 0x5D588B65) + 1;
				u = (u >>> 1) + ((random_seed < 0) ? 0x80000000 : 0);
			}
			x[i] = u;
		}
		// 残りのビットはx[i] = x[i-32] ^ x[i-521]で生成
		for(var i$1 = 16; i$1 < 521; i$1++) {
			u = (i$1 === 16) ? i$1 : (i$1 - 17);
			x[i$1] = ((x[u] << 23) & 0xFFFFFFFF) ^ (x[i$1 - 16] >>> 9) ^ x[i$1 - 1];
		}
		// ビットをシャッフル
		for(var i$2 = 0; i$2 < 4; i$2++) {
			this._rnd521();
		}
			
		/**
			 * 乱数配列の何番目を使用しているか
			 * @private
			 * @type {number}
			 */
		this.xi = 0;
			
		/**
			 * ガウシアン分布に基づく乱数を保持しているか
			 * @private
			 * @type {boolean}
			 */
		this.haveNextNextGaussian = false;
			
		/**
			 * 保持したガウシアン分布に基づく乱数
			 * @private
			 * @type {number}
			 */
		this.nextNextGaussian = 0;
	};

	/**
		 * 32ビットの乱数
		 * @returns {number} - 32ビットの乱数
		 */
	Random.prototype.genrand_int32 = function genrand_int32 () {
		// 全て使用したら、再び混ぜる
		if(this.xi === 521) {
			this._rnd521();
			this.xi = 0;
		}
		var y = RandomTool.unsigned32(this.x[this.xi]);
		this.xi = this.xi + 1;
		return y;
	};

	/**
		 * 指定したビット数の乱数
		 * @param {number} bits - 必要なビット数（64まで可能）
		 * @returns {number}
		 */
	Random.prototype.next = function next (bits) {
		if(bits === 0) {
			return 0;
		}
		else if(bits === 32) {
			return this.genrand_int32();
		}
		else if(bits < 32) {
			// 線形合同法ではないため

			// 上位のビットを使用しなくてもいいがJavaっぽく。
			return (this.genrand_int32() >>> (32 - bits));
		}
		// double型のため、52ビットまでは、整数として出力可能
		else if(bits === 63) {
			// 正の値を出力するように調節
			return (this.next(32) * 0x80000000 + this.next(32));
		}
		else if(bits === 64) {
			return (this.next(32) * 0x100000000 + this.next(32));
		}
		else if(bits < 64) {
			return (this.genrand_int32() * (1 << (bits - 32)) + (this.genrand_int32()  >>> (64 - bits)));
		}
	};

	/**
		 * 指定したサイズの8ビットの乱数
		 * @param {number} size - 必要な長さ
		 * @returns {Array<number>}
		 */
	Random.prototype.nextBytes = function nextBytes (size) {
		var y = new Array(size);
		// 配列yに乱数を入れる
		// 8ビットのために、32ビット乱数を1回回すのはもったいない
		for(var i = 0;i < y.length; i++) {
			y[i] = this.next(8);
		}
		return y;
	};

	/**
		 * 16ビットの乱数
		 * @returns {number}
		 */
	Random.prototype.nextShort = function nextShort () {
		return (this.next(16));
	};

	/**
		 * 32ビットの乱数
		 * @param {number} [x] - 指定した値未満の数値を作る
		 * @returns {number}
		 */
	Random.prototype.nextInt = function nextInt (x) {
		if((x !== undefined) && (typeof x === "number")) {
			var r, y;
			do {
				r = RandomTool.unsigned32(this.genrand_int32());
				y = r % x;
			} while((r - y + x) > 0x100000000 );
			return y;
		}
		return (this.next(32) & 0xFFFFFFFF);
	};

	/**
		 * 64ビットの乱数
		 * @returns {number}
		 */
	Random.prototype.nextLong = function nextLong () {
		return this.next(64);
	};

	/**
		 * 正負の乱数
		 * @returns {boolean}
		 */
	Random.prototype.nextBoolean = function nextBoolean () {
		// 1ビットのために、32ビット乱数を1回回すのはもったいない
		return (this.next(1) !== 0);
	};

	/**
		 * 0 <= x < 1 のFloat(23ビット)乱数
		 * @returns {number}
		 */
	Random.prototype.nextFloat = function nextFloat () {
		return (this.next(24) / 0x1000000);
	};

	/**
		 * 0 <= x < 1 のDouble(52ビット)乱数
		 * @returns {number}
		 */
	Random.prototype.nextDouble = function nextDouble () {
		var a1 = this.next(26) * 0x8000000 + this.next(27);
		var a2 = 0x8000000 * 0x4000000;
		return (a1 / a2);
	};

	/**
		 * 平均値0、標準偏差1のガウシアン分布に基づく乱数
		 * @returns {number}
		 */
	Random.prototype.nextGaussian = function nextGaussian () {
		if(this.haveNextNextGaussian) {
			this.haveNextNextGaussian = false;
			return this.nextNextGaussian;
		}
		// Box-Muller法
		var a = Math.sqrt( -2 * Math.log( this.nextDouble() ) );
		var b = 2 * Math.PI * this.nextDouble();
		var y = a * Math.sin(b);
		this.nextNextGaussian = a * Math.cos(b);
		this.haveNextNextGaussian = true;
		return y;
	};

	/**
	 * シードを設定しない場合の乱数作成用整数
	 * @type {number}
	 * @ignore
	 */
	Random.seedUniquifier = 0x87654321;

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
	var RoundingModeEntity = function RoundingModeEntity () {};

	RoundingModeEntity.toString = function toString () {
		return "NONE";
	};

	/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
	RoundingModeEntity.getAddNumber = function getAddNumber (x) {
		return 0;
	};

	/**
	 * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_UP = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_UP () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_UP.__proto__ = RoundingModeEntity;
		RoundingMode_UP.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_UP.prototype.constructor = RoundingMode_UP;

		RoundingMode_UP.toString = function toString () {
			return "UP";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_UP.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return 10 - y;
			}
			else {
				return (-(10 + y));
			}
		};

		return RoundingMode_UP;
	}(RoundingModeEntity));

	/**
	 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_DOWN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_DOWN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_DOWN.__proto__ = RoundingModeEntity;
		RoundingMode_DOWN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_DOWN.prototype.constructor = RoundingMode_DOWN;

		RoundingMode_DOWN.toString = function toString () {
			return "DOWN";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_DOWN.getAddNumber = function getAddNumber (x) {
			return -(x % 10);
		};

		return RoundingMode_DOWN;
	}(RoundingModeEntity));

	/**
	 * 正の無限大に近づく
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_CEILING = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_CEILING () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_CEILING.__proto__ = RoundingModeEntity;
		RoundingMode_CEILING.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_CEILING.prototype.constructor = RoundingMode_CEILING;

		RoundingMode_CEILING.toString = function toString () {
			return "CEILING";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_CEILING.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return 10 - y;
			}
			else {
				return -y;
			}
		};

		return RoundingMode_CEILING;
	}(RoundingModeEntity));

	/**
	 * 負の無限大に近づく
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_FLOOR = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_FLOOR () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_FLOOR.__proto__ = RoundingModeEntity;
		RoundingMode_FLOOR.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_FLOOR.prototype.constructor = RoundingMode_FLOOR;

		RoundingMode_FLOOR.toString = function toString () {
			return "FLOOR";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_FLOOR.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return -y;
			}
			else {
				return(-(10 + y));
			}
		};

		return RoundingMode_FLOOR;
	}(RoundingModeEntity));

	/**
	 * 四捨五入
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_UP = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_UP () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_UP.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_UP.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_UP.prototype.constructor = RoundingMode_HALF_UP;

		RoundingMode_HALF_UP.toString = function toString () {
			return "HALF_UP";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_HALF_UP.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			var sign = y >= 0 ? 1 : -1;
			if(Math.abs(y) < 5) {
				return (y * -1);
			}
			else {
				return (sign * (10 - Math.abs(y)));
			}
		};

		return RoundingMode_HALF_UP;
	}(RoundingModeEntity));

	/**
	 * 五捨六入
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_DOWN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_DOWN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_DOWN.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_DOWN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_DOWN.prototype.constructor = RoundingMode_HALF_DOWN;

		RoundingMode_HALF_DOWN.toString = function toString () {
			return "HALF_DOWN";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_HALF_DOWN.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			var sign = y >= 0 ? 1 : -1;
			if(Math.abs(y) < 6) {
				return (y * -1);
			}
			else {
				return (sign * (10 - Math.abs(y)));
			}
		};

		return RoundingMode_HALF_DOWN;
	}(RoundingModeEntity));

	/**
	 * 等間隔なら偶数側へ丸める
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_EVEN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_EVEN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_EVEN.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_EVEN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_EVEN.prototype.constructor = RoundingMode_HALF_EVEN;

		RoundingMode_HALF_EVEN.toString = function toString () {
			return "HALF_EVEN";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_HALF_EVEN.getAddNumber = function getAddNumber (x) {
			var y = x % 100;
			var sign, even;
			if(y < 0) {
				sign = -1;
				even = Math.ceil(y / 10) & 1;
			}
			else {
				sign = 1;
				even = Math.floor(y / 10) & 1;
			}
			var center;
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
		};

		return RoundingMode_HALF_EVEN;
	}(RoundingModeEntity));

	/**
	 * 丸めない（丸める必要が出る場合はエラー）
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_UNNECESSARY = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_UNNECESSARY () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_UNNECESSARY.__proto__ = RoundingModeEntity;
		RoundingMode_UNNECESSARY.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_UNNECESSARY.prototype.constructor = RoundingMode_UNNECESSARY;

		RoundingMode_UNNECESSARY.toString = function toString () {
			return "UNNECESSARY";
		};

		/**
		 * 丸めに必要な加算値
		 * @param {number} x - 1ケタ目の値
		 * @returns {number} いくつ足すと丸められるか
		 */
		RoundingMode_UNNECESSARY.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else {
				throw "ArithmeticException";
			}
		};

		return RoundingMode_UNNECESSARY;
	}(RoundingModeEntity));

	/**
	 * BigDecimal用の丸めモードクラス
	 */
	var RoundingMode = function RoundingMode () {};

	var staticAccessors = { UP: { configurable: true },DOWN: { configurable: true },CEILING: { configurable: true },FLOOR: { configurable: true },HALF_UP: { configurable: true },HALF_DOWN: { configurable: true },HALF_EVEN: { configurable: true },UNNECESSARY: { configurable: true } };

	RoundingMode.valueOf = function valueOf (name) {
		var check_string;
		if(typeof name === "string") {
			check_string = name;
		}
		else if(name instanceof Object) {
			check_string = name.toString();
		}
		else {
			throw "Unsupported argument " + name;
		}
		var modetype = [
			RoundingMode_UP,
			RoundingMode_DOWN,
			RoundingMode_FLOOR,
			RoundingMode_CEILING,
			RoundingMode_HALF_UP,
			RoundingMode_HALF_DOWN,
			RoundingMode_HALF_EVEN,
			RoundingMode_UNNECESSARY
		];
		var upper_name = check_string.toUpperCase();
		for(var i = 0; i < modetype.length; i++) {
			if(modetype[i].toString() === upper_name) {
				return modetype[i];
			}
		}
		throw "IllegalArgumentException : " + check_string;
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.UP.get = function () {
		return RoundingMode_UP;
	};

	/**
		 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.DOWN.get = function () {
		return RoundingMode_DOWN;
	};

	/**
		 * 正の無限大に近づく
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.CEILING.get = function () {
		return RoundingMode_CEILING;
	};

	/**
		 * 負の無限大に近づく
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.FLOOR.get = function () {
		return RoundingMode_FLOOR;
	};

	/**
		 * 四捨五入
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_UP.get = function () {
		return RoundingMode_HALF_UP;
	};

	/**
		 * 五捨六入
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_DOWN.get = function () {
		return RoundingMode_HALF_DOWN;
	};

	/**
		 * 等間隔なら偶数側へ丸める
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_EVEN.get = function () {
		return RoundingMode_HALF_EVEN;
	};

	/**
		 * 丸めない（丸める必要が出る場合はエラー）
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.UNNECESSARY.get = function () {
		return RoundingMode_UNNECESSARY;
	};

	Object.defineProperties( RoundingMode, staticAccessors );

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
	 * BigDecimal用の環境設定
	 */
	var MathContext = function MathContext(precision_or_name, roundingMode) {

		/**
			 * 精度
			 * @type {number}
			 * @private
			 */
		this.precision = 0;
			
		/**
			 * 丸めモード
			 * @type {RoundingModeEntity}
			 * @private
			 */
		this.roundingMode = roundingMode === undefined ? RoundingMode.HALF_UP : roundingMode;

		if(typeof precision_or_name === "number") {
			this.precision = precision_or_name;
		}
		if(typeof precision_or_name === "string") {
			var buff;
			buff = precision_or_name.match(/precision=\d+/);
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
	};

	var staticAccessors$1 = { UNLIMITED: { configurable: true },DECIMAL32: { configurable: true },DECIMAL64: { configurable: true },DECIMAL128: { configurable: true } };

	/**
		 * 精度
		 * @returns {number}
		 */
	MathContext.prototype.getPrecision = function getPrecision () {
		return this.precision;
	};

	/**
		 * 丸め方
		 * @returns {RoundingModeEntity}
		 */
	MathContext.prototype.getRoundingMode = function getRoundingMode () {
		return this.roundingMode;
	};

	/**
		 * 環境が等しいか
		 * @param {MathContext} x - 比較対象
		 * @returns {boolean}
		 */
	MathContext.prototype.equals = function equals (x) {
		if(x instanceof MathContext) {
			if(x.toString() === this.toString()) {
				return true;
			}
		}
		return false;
	};

	/**
		 * 文字列化
		 * @returns {string}
		 */
	MathContext.prototype.toString = function toString () {
		return ("precision=" + this.precision + " roundingMode=" + this.roundingMode.toString());
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 制限を設けない（ただし、割り算で循環小数の場合にエラーが出ます。）
		 * @returns {MathContext}
		 */
	staticAccessors$1.UNLIMITED.get = function () {
		return DEFINE.UNLIMITED;
	};

	/**
		 * 32ビットの実数型 ( float ) と同等
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL32.get = function () {
		return DEFINE.DECIMAL32;
	};


	/**
		 * 64ビットの実数型 ( double ) と同等
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL64.get = function () {
		return DEFINE.DECIMAL64;
	};

	/**
		 * 128ビットの実数型 ( long double ) と同等
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL128.get = function () {
		return DEFINE.DECIMAL128;
	};

	Object.defineProperties( MathContext, staticAccessors$1 );

	/**
	 * 内部で使用する定数値
	 * @ignore
	 */
	var DEFINE = {

		/**
		 * 制限なし
		 * @type {MathContext}
		 */
		UNLIMITED	: new MathContext(0,	RoundingMode.HALF_UP),

		/**
		 * 32ビットの実数型
		 * @type {MathContext}
		 */
		DECIMAL32	: new MathContext(7,	RoundingMode.HALF_EVEN),

		/**
		 * 64ビットの実数型
		 * @type {MathContext}
		 */
		DECIMAL64	: new MathContext(16,	RoundingMode.HALF_EVEN),

		/**
		 * 128ビットの実数型
		 * @type {MathContext}
		 */
		DECIMAL128	: new MathContext(34,	RoundingMode.HALF_EVEN)
	};

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
	 * 乱数用クラスを指定しなかった場合に使用するデフォルト乱数クラス
	 * @type {Random}
	 * @ignore
	 */
	var DEFAULT_RANDOM = new Random();

	/**
	 * BigInteger 内で使用する関数群
	 * @ignore
	 */
	var IntegerTool = function IntegerTool () {};

	IntegerTool.string_to_binary_number = function string_to_binary_number (text, radix) {
		// 下の変換をすることで、2進数での変換時に内部のforの繰り返す回数が減る
		// v0.03 出来る限りまとめてn進数変換する
		var max_num = 0x3FFFFFFF;
		var keta = Math.floor( Math.log(max_num) / Math.log(radix) );
		var x = [];
		var y = [];
		var len = Math.ceil(text.length / keta);
		var offset = text.length;
		for(var i = 0; i < len; i++ ) {
			offset -= keta;
			if(offset >= 0) {
				x[i] = parseInt(text.substring(offset, offset + keta), radix);
			}
			else {
				x[i] = parseInt(text.substring(0, offset + keta), radix);
			}
		}
		var calcradix = Math.round(Math.pow(radix, keta));
		// v0.03ここまで
		// 2で割っていくアルゴリズムで2進数に変換する
		while(x.length !==  0) {
			// 2で割っていく
			// 隣の桁でたcarryはradix進数をかけて桁上げしてる
			var carry = 0;
			for(var i$1 = x.length - 1; i$1 >= 0; i$1--) {
				var a = x[i$1] + carry * calcradix;
				x[i$1]  = a >>> 1;
				carry = a & 1;
			}
			// 1余るかどうかをテストする
			y[y.length] = carry;
			// xが0になっている部分は削除していく
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		// メモリ節約のため1つの変数（16ビット）に収めるだけ収めていく
		x = [];
		for(var i$2 = 0; i$2 < y.length; i$2++) {
			x[i$2 >>> 4] |= y[i$2] << (i$2 & 0xF);
		}
		return x;
	};

	/**
		 * 数値から16進数ごとの配列へ変換する
		 * @param {number} x - 変換したい数値 
		 * @returns {Array<number>} _16進数ごとに代入された配列 
		 */
	IntegerTool.number_to_binary_number = function number_to_binary_number (x) {
		if(x > 0xFFFFFFFF) {
			return IntegerTool.string_to_binary_number(x.toFixed(), 10);
		}
		var num = x;
		var y = [];
		while(num !==  0) {
			y[y.length] = num & 1;
			num >>>= 1;
		}
		var z = [];
		for(var i = 0; i < y.length; i++) {
			z[i >>> 4] |= y[i] << (i & 0xF);
		}
		return z;
	};

	/**
		 * 16進数の配列データから数列が入った文字列を作成
		 * @param {Array<number>} binary - 16進数ごとに代入された配列 
		 * @param {number} radix - 変換後の進数
		 * @returns {Array<number>} 指定した進数で桁ごとに代入された数値配列 
		 */
	IntegerTool.binary_number_to_string = function binary_number_to_string (binary, radix) {
		var add = function(x1, x2, y) {
			var size = x1.length;
			var carry = 0;
			for(var i = 0; i < size; i++) {
				y[i] = x1[i] + ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(y[i] >= radix) {
					carry = 1;
					y[i] -= radix;
				}
				else {
					carry = 0;
				}
			}
			if(carry === 1) {
				y[size] = 1;
			}
		};
		var y = [0];
		var t = [1];
		for(var i = 0;i < binary.length;i++) {
			for(var j = 0; j < 16; j++) {
				if((binary[i] >>> j) & 1) {
					add(t, y, y);
				}
				add(t, t, t);
			}
		}
		return y;
	};

	/**
		 * 数値が入った文字列から多倍長数値を表すためのデータを作成する
		 * @param {string} text - 数値が入ったテキストデータ
		 * @param {number} [radix=10] - テキストデータの進数
		 * @returns {Object} 多倍長数値を表すためのデータ 
		 */
	IntegerTool.ToBigIntegerFromString = function ToBigIntegerFromString (text, radix) {
		var x = text.replace(/\s/g, "").toLowerCase();
		var sign_text = x.match(/^[-+]+/);

		var element     = [];
		var _sign        = 1;

		if(sign_text !== null) {
			var hit_text = sign_text[0];
			x = x.substring(hit_text.length, x.length);
			if(hit_text.indexOf("-") !== -1) {
				_sign = -1;
			}
		}
		if(radix) {
			element = IntegerTool.string_to_binary_number(x, radix);
		}
		else if(/^0x/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(2, x.length), 16);
		}
		else if(/^0b/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(2, x.length), 2);
		}
		else if(/^0/.test(x)) {
			element = IntegerTool.string_to_binary_number(x.substring(1, x.length), 8);
		}
		else {
			element = IntegerTool.string_to_binary_number(x, 10);
		}
		// "0"の場合がある為
		if((element.length === 1)&&(element[0] === 0)) {
			element = [];
			_sign = 0;
		}

		return {
			element : element,
			_sign : _sign
		};
	};

	// 内部では1変数内の中の16ビットごとに管理
	// 2変数で16ビット*16ビットで32ビットを表す
	// this.element	...	16ビットごとに管理
	// this._sign	...	負なら-1、正なら1、ゼロなら0
	//
	// 本クラスはイミュータブルです。
	// 内部の「_」から始まるメソッドは内部計算用で非公開です。またミュータブルです。

	/**
	 * 多倍長整数演算クラス (immutable)
	 */
	var BigInteger = function BigInteger(number) {
			
		if(arguments.length === 0) {

			/**
				 * 1要素、16ビット整数の配列
				 * @private
				 * @type {Array<number>}
				 */
			this.element     = [];

			/**
				 * 正負（プラスなら+1、マイナスなら-1、0なら0）
				 * ※計算によってはここの値の再設定をしていない箇所があるので、ここを見る時は注意
				 * @private
				 * @type {number}
				 */
			this._sign        = 0;
		}
		else if(arguments.length === 1) {
			this._sign = 1;
			if(number instanceof BigInteger) {
				this.element = number.element.slice(0);
				this._sign = number._sign;
			}
			else if(typeof number === "number") {
				var x = number;
				if(x < 0) {
					this._sign = -1;
					x = -x;
				}
				this.element = IntegerTool.number_to_binary_number(x);
			}
			else if(typeof number === "string") {
				var x$1 = IntegerTool.ToBigIntegerFromString(number);
				this.element = x$1.element;
				this._sign = x$1._sign;
			}
			else if(number instanceof Array) {
				if((number.length >= 1) && (typeof number[0] === "string")) {
					var x$2 = IntegerTool.ToBigIntegerFromString(number[0], number[1]);
					this.element = x$2.element;
					this._sign = x$2._sign;
				}
				else {
					throw "BigInteger Unsupported argument " + arguments;
				}
			}
			else if(number instanceof Object) {
				var x$3 = IntegerTool.ToBigIntegerFromString(number.toString());
				this.element = x$3.element;
				this._sign = x$3._sign;
			}
			else {
				throw "BigInteger Unsupported argument " + number;
			}
		}
		else {
			throw "BigInteger Unsupported argument " + number;
		}
	};

	var prototypeAccessors = { intValue: { configurable: true },longValue: { configurable: true },doubleValue: { configurable: true } };
	var staticAccessors$2 = { ZERO: { configurable: true },ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true } };

	/**
		 * BigIntegerを作成する
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 */
	BigInteger.create = function create (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * BigInteger を作成
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 */
	BigInteger.valueOf = function valueOf (number) {
		return BigInteger.create(number);
	};

	/**
		 * BigInteger を作成
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger._toBigInteger = function _toBigInteger (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * 実数を作成
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigInteger._toFloat = function _toFloat (number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigInteger) {
			return number.doubleValue;
		}
		else {
			return (new BigInteger(number)).doubleValue;
		}
	};

	/**
		 * 整数を作成
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigInteger._toInteger = function _toInteger (number) {
		if(typeof number === "number") {
			return number | 0;
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	};

	/**
		 * 指定したビット数以内の乱数
		 * @param {BigInteger|number|string|Array<string|number>|Object} bitsize - 作成する乱数のビット数
		 * @param {Random} [random] - 作成に使用するRandom
		 * @returns {BigInteger}
		 */
	BigInteger.createRandomBigInteger = function createRandomBigInteger (bitsize, random) {
		var rand = (random && (random instanceof Random)) ? random : DEFAULT_RANDOM;
		var x = new BigInteger();
		x._sign = 1;
		var bits = BigInteger._toInteger(bitsize);
		var size = ((bits - 1) >> 4) + 1;
		if(bits === 0) {
			return BigInteger.ZERO;
		}
		var r;
		for(var i = 0, j = 0; i < size; i++) {
			if(j === 0) {
				r = rand.nextInt(); // 32ビットずつ作成する
				x.element[i] = r & 0xFFFF;
				j = 1;
			}
			else {
				x.element[i] = (r >>> 16) & 0xFFFF;
				j = 0;
			}
		}
		// 1～15ビット余る場合は、16ビットずつ作成しているので削る
		if((bits % 16) !== 0) {
			x.element[x.element.length - 1] &= (1 << (bits % 16)) - 1;
		}
		// 最後のビットに 0 をたくさん作成していると、
		// 0のみのデータになる可能性があるためメモリを修正
		x._memory_reduction();
		return x;
	};

	/**
		 * 指定したビット数以内の素数
		 * @param {BigInteger|number|string|Array<string|number>|Object} bits - 作成する素数の乱数のビット数
		 * @param {Random} [random] - 作成に使用するRandom
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - ミラーラビン素数判定法に使用する繰り返し回数
		 * @param {BigInteger|number|string|Array<string|number>|Object} [create_count=500] - 乱数生成回数
		 * @returns {BigInteger}
		 */
	BigInteger.probablePrime = function probablePrime (bits, random, certainty, create_count ) {
		var certainty_ = certainty ? BigInteger._toInteger(certainty) : 100;
		var create_count_ = create_count ? BigInteger._toInteger(create_count) : 500;
		for(var i = 0; i < create_count_; i++) {
			var x = BigInteger.createRandomBigInteger(bits, random);
			if(x.isProbablePrime(certainty_)) {
				return x;
			}
		}
		throw "probablePrime " + create_count;
	};

	/**
		 * 等式
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {boolean} A === B
		 */
	BigInteger.prototype.equals = function equals (number) {
		var x = BigInteger._toBigInteger(number);
		if(this.signum() !== x.signum()) {
			return false;
		}
		if(this.element.length !== x.element.length) {
			return false;
		}
		for(var i = 0; i < x.element.length; i++) {
			if(this.element[i] !==  x.element[i]) {
				return false;
			}
		}
		return true;
	};

	/**
		 * 文字列化
		 * @param {BigInteger|number|string|Array<string|number>|Object} [radix=10] - 文字列変換後の進数
		 * @returns {string}
		 */
	BigInteger.prototype.toString = function toString (radix) {
		var radix_ = radix ? BigInteger._toInteger(radix) : 10;

		// int型で扱える数値で toString が可能なので、
		// せっかくだからより大きな進数で計算していけば、あとでtoStringする回数が減るテクニック
		// 2進数であれば、2^n乗で計算しても問題がない 4進数や8進数で計算して、2進数に戻せば巡回少数なし
		// v0.03 出来る限りまとめてn進数変換する
		var max_num = 0x3FFFFFFF;
		//                        max_num > radix^x
		// floor(log max_num / log radix) = x
		var keta = Math.floor( Math.log(max_num) / Math.log(radix_) );
		var calcradix = Math.round(Math.pow(radix_, keta));
		// zeros = "00000000...."
		var zeros_array = [];
		for(var i = 0; i < keta; i++) {
			zeros_array[i] = "0";
		}
		var zeros_string = zeros_array.join("");
		// v0.03ここまで
		var x = IntegerTool.binary_number_to_string(this.element, calcradix);
		var y = [];
		var z = "";
		if(this.signum() < 0) {
			y[y.length] = "-";
		}
		for(var i$1 = x.length - 1; i$1 >= 0; i$1--) {
			z = x[i$1].toString(radix_);
			if(i$1 < (x.length - 1)) {
				y[y.length] = zeros_string.substring(0, keta - z.length);
			}
			y[y.length] = z;
		}
		return y.join("");
	};

	/**
		 * 16進数ごとの配列で構成される内部値の指定した位置の値
		 * @param {BigInteger|number|string|Array<string|number>|Object} point - 内部配列の位置
		 * @returns {number}
		 */
	BigInteger.prototype.getShort = function getShort (point) {
		var n = BigInteger._toInteger(point);
		if((n < 0) || (this.element.length <= n)) {
			return 0;
		}
		return this.element[n];
	};

	/**
		 * 32ビット整数値
		 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
		 * @returns {number}
		 */
	prototypeAccessors.intValue.get = function () {
		var x = this.getShort(0) + (this.getShort(1) << 16);
		x &= 0xFFFFFFFF;
		if((x > 0)&&(this._sign < 0)) {
			x = -x;
		}
		return x;
	};

	/**
		 * 64ビット整数値
		 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
		 * @returns {number}
		 */
	prototypeAccessors.longValue.get = function () {
		var x = 0;
		for(var i = 3; i >= 0; i--) {
			x *= 65536;
			x += this.getShort(i);
		}
		if(this._sign < 0) {
			x = -x;
		}
		return x;
	};

	/**
		 * 64ビット実数値
		 * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
		 * @returns {number}
		 */
	prototypeAccessors.doubleValue.get = function () {
		return parseFloat(this.toString());
	};

	/**
		 * ディープコピー
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.clone = function clone () {
		return new BigInteger(this);
	};

	/**
		 * 実部の負数を判定
		 * @returns {boolean} real(x) < 0
		 */
	BigInteger.prototype.isNegative = function isNegative () {
		return this._sign < 0;
	};

	/**
		 * 0 を判定
		 * @returns {boolean} A === 0
		 */
	BigInteger.prototype.isZero = function isZero () {
		this._memory_reduction();
		return this._sign === 0;
	};
		
	/**
		 * 正数を判定
		 * @returns {boolean} real(x) > 0
		 */
	BigInteger.prototype.isPositive = function isPositive () {
		return this._sign > 0;
	};

	/**
		 * 2進数で表した場合に最も右側に現れる1の桁数
		 * @returns {number} 存在しない場合は -1
		 */
	BigInteger.prototype.getLowestSetBit = function getLowestSetBit () {
		for(var i = 0; i < this.element.length; i++) {
			if(this.element[i] !==  0) {
				var x = this.element[i];
				for(var j = 0; j < 16; j++) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j;
					}
				}
			}
		}
		return -1;
	};

	/**
		 * 2進数で表した場合の長さ
		 * @returns {number}
		 */
	BigInteger.prototype.bitLength = function bitLength () {
		for(var i = this.element.length - 1; i >= 0; i--) {
			if(this.element[i] !==  0) {
				var x = this.element[i];
				for(var j = 15; j >= 0; j--) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j + 1;
					}
				}
			}
		}
		return 0;
	};

	/**
		 * 2の補数表現で表した場合に立つビットの数
		 * @returns {number}
		 */
	BigInteger.prototype.bitCount = function bitCount () {
		var target;
		if(this._sign >= 0) {
			target = this;
		}
		else {
			target = this.add(new BigInteger(1));
		}
		var len = target.bitLength();
		var bit = 0;
		var count = 0;
		for(var i = 0;bit < len;i++) {
			var x = target.element[i];
			for(var j = 0;((j < 16) && (bit < len));j++, bit++) {
				if(((x >>> j) & 1) !==  0) {
					count = count + 1;
				}
			}
		}
		return count;
	};

	/**
		 * 加算に適用できる数値（負の場合は、2の補数表現）
		 * @param {number} [bit_length] - ビット長（省略時は自動計算）
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype.getTwosComplement = function getTwosComplement (bit_length) {
		var y = this.clone();
		if(y._sign >= 0) {
			return y;
		}
		else {
			// 正にする
			y._sign = 1;
			// ビットの数が存在しない場合は数える
			var len = (bit_length !== undefined) ? bit_length : y.bitLength();
			var e = y.element;
			// ビット反転後
			for(var i = 0; i < e.length; i++) {
				e[i] ^= 0xFFFF;
			}
			// 1～15ビット余る場合は、16ビットずつ作成しているので削る
			// nビットのマスク（なお負の値を表す最上位ビットは削除する）
			if((len % 16) !== 0) {
				e[e.length - 1] &= (1 << (len % 16)) - 1;
			}
			// 1を加算
			y._add(new BigInteger(1));
			return y;
		}
	};

	/**
		 * 論理積（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= B
		 * @private
		 */
	BigInteger.prototype._and = function _and (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			var x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 & x2;
		}
		if(this.bitLength() === 0) {
			this.element = [];
			this._sign = 0;
		}
		if((s1 === 1)||(s2 === 1)) {
			this._sign = 1;
		}
		// 出力が負の場合は、2の補数
		else if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	};

	/**
		 * 論理積
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & B
		 */
	BigInteger.prototype.and = function and (number) {
		return this.clone()._and(number);
	};

	/**
		 * 論理和（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A |= B
		 * @private
		 */
	BigInteger.prototype._or = function _or (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			var x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 | x2;
		}
		this._sign = ((s1 === -1)||(s2 === -1)) ? -1 : Math.max(s1, s2);
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	};

	/**
		 * 論理和
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A | B
		 */
	BigInteger.prototype.or = function or (number) {
		return this.clone()._or(number);
	};

	/**
		 * 排他的論理和（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A ^= B
		 * @private
		 */
	BigInteger.prototype._xor = function _xor (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1[i];
			var x2 = (i >= e2_array.length) ? 0 : e2[i];
			this.element[i] = x1 ^ x2;
		}
		this._sign = ((s1 !== 0)&&(s1 !== s2)) ? -1 : 1;
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
		}
		return this;
	};

	/**
		 * 排他的論理和
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A ^ B
		 */
	BigInteger.prototype.xor = function xor (number) {
		return(this.clone()._xor(number));
	};

	/**
		 * ビット反転
		 * @returns {BigInteger} A = !A
		 * @private
		 */
	BigInteger.prototype._not = function _not () {
		return(this._add(new BigInteger(1))._negate());
	};

	/**
		 * ビット反転（ミュータブル）
		 * @returns {BigInteger} !A
		 */
	BigInteger.prototype.not = function not () {
		return(this.clone()._not());
	};

	/**
		 * 否定論理積（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= (!B)
		 * @private
		 */
	BigInteger.prototype._andNot = function _andNot (number) {
		var val = BigInteger._toBigInteger(number);
		return(this._and(val.not()));
	};

	/**
		 * 否定論理積
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & (!B)
		 */
	BigInteger.prototype.andNot = function andNot (number) {
		return(this.clone()._andNot(number));
	};

	/**
		 * 否定論理積（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= (!B)
		 * @private
		 */
	BigInteger.prototype._nand = function _nand (number) {
		return(this._andNot(number));
	};

	/**
		 * 否定論理積
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & (!B)
		 */
	BigInteger.prototype.nand = function nand (number) {
		return(this.andNot(number));
	};

	/**
		 * 否定論理和（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A = !(A | B)
		 * @private
		 */
	BigInteger.prototype._orNot = function _orNot (number) {
		var val = BigInteger._toBigInteger(number);
		return(this._or(val)._not());
	};

	/**
		 * 否定論理和
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} !(A | B)
		 */
	BigInteger.prototype.orNot = function orNot (number) {
		return(this.clone()._orNot(number));
	};

	/**
		 * 否定論理和（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A = !(A | B)
		 * @private
		 */
	BigInteger.prototype._nor = function _nor (number) {
		return(this._orNot(number));
	};

	/**
		 * 否定論理和
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} !(A | B)
		 */
	BigInteger.prototype.nor = function nor (number) {
		return(this.orNot(number));
	};

	/**
		 * 指定したビット長まで配列を拡張（ミュータブル）
		 * @param {number} bit_length - ビット数
		 * @private
		 */
	BigInteger.prototype._memory_allocation = function _memory_allocation (bit_length) {
		var n = BigInteger._toInteger(bit_length);
		var elementsize = this.element.length << 4;
		if(elementsize < n) {
			var addsize = (((n - elementsize - 1) & 0xFFFFFFF0) >>> 4) + 1;
			for(var i = 0;i < addsize;i++) {
				this.element[this.element.length] = 0;
			}
		}
	};

	/**
		 * 内部データの正規化（ミュータブル）
		 * @private
		 */
	BigInteger.prototype._memory_reduction = function _memory_reduction () {
		for(var i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !==  0) {
				if(i < this.element.length - 1) {
					this.element.splice(i + 1, this.element.length - i - 1);
				}
				return;
			}
		}
		this._sign = 0;
		this.element = [];
	};

	/**
		 * ユークリッド互除法
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} gcd(x, y)
		 */
	BigInteger.prototype.gcd = function gcd (number) {
		var val = BigInteger._toBigInteger(number);
		/**
			 * @type {any}
			 */
		var x = this, y = val, z;
		while(y.signum() !== 0) {
			z = x.remainder(y);
			x = y;
			y = z;
		}
		return x;
	};

	/**
		 * 拡張ユークリッド互除法
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {Array<BigInteger>} a*x + b*y = c = gcd(x, y) となる [a, b, c]
		 */
	BigInteger.prototype.extgcd = function extgcd (number) {
		var val = BigInteger._toBigInteger(number);
		// 非再帰
		var ONE  = new BigInteger(1);
		var ZERO = new BigInteger(0);
		/**
			 * @type {any}
			 */
		var r0 = this, r1 = val, r2, q1;
		var a0 = ONE,  a1 = ZERO, a2;
		var b0 = ZERO, b1 = ONE,  b2;
		while(r1.signum() !== 0) {
			var y = r0.divideAndRemainder(r1);
			q1 = y[0];
			r2 = y[1];
			a2 = a0.subtract(q1.multiply(a1));
			b2 = b0.subtract(q1.multiply(b1));
			a0 = a1;
			a1 = a2;
			b0 = b1;
			b1 = b2;
			r0 = r1;
			r1 = r2;
		}
		return [a0, b0, r0];
	};

	/**
		 * 絶対値（ミュータブル）
		 * @returns {BigInteger} A = abs(A)
		 * @private
		 */
	BigInteger.prototype._abs = function _abs () {
		// -1 -> 1, 0 -> 0, 1 -> 1
		this._sign *= this._sign;
		return this;
	};

	/**
		 * 絶対値
		 * @returns {BigInteger} abs(A)
		 */
	BigInteger.prototype.abs = function abs () {
		return this.clone()._abs();
	};

	/**
		 * 負数（ミュータブル）
		 * @returns {BigInteger} A = -A
		 * @private
		 */
	BigInteger.prototype._negate = function _negate () {
		this._sign *= -1;
		return this;
	};

	/**
		 * 負数
		 * @returns {BigInteger} -A
		 */
	BigInteger.prototype.negate = function negate () {
		return this.clone()._negate();
	};

	/**
		 * 符号値
		 * @returns {number} 1, -1, 0の場合は0を返す
		 */
	BigInteger.prototype.signum = function signum () {
		if(this.element.length === 0) {
			return 0;
		}
		return this._sign;
	};

	/**
		 * 符号値
		 * @returns {number} 1, -1, 0の場合は0を返す
		 */
	BigInteger.prototype.sign = function sign () {
		return this.signum();
	};

	/**
		 * 符号を除いた値同士を比較
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
		 */
	BigInteger.prototype.compareToAbs = function compareToAbs (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.element.length < val.element.length) {
			return -1;
		}
		else if(this.element.length > val.element.length) {
			return 1;
		}
		for(var i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !== val.element[i]) {
				var x = this.element[i] - val.element[i];
				return ( (x === 0) ? 0 : ((x > 0) ? 1 : -1) );
			}
		}
		return 0;
	};

	/**
		 * 値同士を比較
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	BigInteger.prototype.compareTo = function compareTo (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.signum() !== val.signum()) {
			if(this._sign > val._sign) {
				return 1;
			}
			else {
				return -1;
			}
		}
		else if(this.signum() === 0) {
			return 0;
		}
		return this.compareToAbs(val) * this._sign;
	};

	/**
		 * 最大値
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} max([A, B])
		 */
	BigInteger.prototype.max = function max (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * 最小値
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} min([A, B])
		 */
	BigInteger.prototype.min = function min (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return val.clone();
		}
		else {
			return this.clone();
		}
	};

	/**
		 * 数値を範囲に収める
		 * @param {BigInteger|number|string|Array<string|number>|Object} min 
		 * @param {BigInteger|number|string|Array<string|number>|Object} max
		 * @returns {BigInteger} min(max(x, min), max)
		 */
	BigInteger.prototype.clip = function clip (min, max) {
		var min_ = BigInteger._toBigInteger(min);
		var max_ = BigInteger._toBigInteger(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	/**
		 * ビットシフト（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} shift_length - 上位へのビットシフト数
		 * @returns {BigInteger} A <<= n
		 * @private
		 */
	BigInteger.prototype._shift = function _shift (shift_length) {
		var n = BigInteger._toInteger(shift_length);
		if(n === 0) {
			return this;
		}
		var x = this.element;
		// 1ビットなら専用コードで高速計算
		if(n === 1) {
			var i = x.length - 1;
			if((x[i] & 0x8000) !==  0) {
				x[x.length] = 1;
			}
			for(;i >= 0;i--) {
				x[i] <<= 1;
				x[i]  &= 0xFFFF;
				if((i > 0) && ((x[i - 1] & 0x8000) !==  0)) {
					x[i] += 1;
				}
			}
		}
		else if(n === -1) {
			for(var i$1 = 0;i$1 < x.length;i$1++) {
				x[i$1] >>>= 1;
				if((i$1 < x.length - 1) && ((x[i$1 + 1] & 1) !==  0)) {
					x[i$1] |= 0x8000;
				}
			}
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		else {
			// 16ビット単位なら配列を追加削除する高速計算
			if(n >= 16) {
				var m = n >>> 4;
				for(var i$2 = x.length - 1; i$2 >= 0; i$2--) {
					x[i$2 + m] = x[i$2];
				}
				for(var i$3 = m - 1; i$3 >= 0; i$3--) {
					x[i$3] = 0;
				}
				n &= 0xF;
			}
			else if(n <= -16){
				var m$1 = (-n) >>> 4;
				x.splice(0, m$1);
				n += m$1 << 4;
			}
			if(n !== 0) {
				// 15ビット以内ならビット演算でまとめて操作
				if(0 < n) {
					var carry = 0;
					for(var i$4 = 0; i$4 < x.length; i$4++) {
						x[i$4] = (x[i$4] << n) + carry;
						if(x[i$4] > 0xFFFF) {
							carry = x[i$4] >>> 16;
							x[i$4] &= 0xFFFF;
						}
						else {
							carry = 0;
						}
					}
					if(carry !== 0) {
						x[x.length] = carry;
					}
				}
				else {
					n = -n;
					for(var i$5 = 0; i$5 < x.length; i$5++) {
						if(i$5 !== x.length - 1) {
							x[i$5] += x[i$5 + 1] << 16;
							x[i$5] >>>= n;
							x[i$5] &= 0xFFFF;
						}
						else {
							x[i$5] >>>= n;
						}
					}
					if(x[x.length - 1] === 0) {
						x.pop();
					}
				}
			}
		}
		return this;
	};

	/**
		 * ビットシフト
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A << n
		 */
	BigInteger.prototype.shift = function shift (n) {
		return this.clone()._shift(n);
	};

	/**
		 * 左へビットシフト
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A << n
		 */
	BigInteger.prototype.shiftLeft = function shiftLeft (n) {
		return this.shift(n);
	};

	/**
		 * 右へビットシフト
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A >> n
		 */
	BigInteger.prototype.shiftRight = function shiftRight (n) {
		return this.shift(-n);
	};

	/**
		 * 加算（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A += B
		 * @private
		 */
	BigInteger.prototype._add = function _add (number) {
		var val = BigInteger._toBigInteger(number);
		var o1 = this;
		var o2 = val;
		var x1 = o1.element;
		var x2 = o2.element;
		if(o1._sign === o2._sign) {
			//足し算
			this._memory_allocation(x2.length << 4);
			var carry = 0;
			for(var i = 0; i < x1.length; i++) {
				x1[i] += ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(x1[i] > 0xFFFF) {
					carry = 1;
					x1[i] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x1[x1.length] = carry;
			}
		}
		else {
			// 引き算
			var compare = o1.compareToAbs(o2);
			if(compare === 0) {
				this.element = [];
				this._sign = 1;
				return this;
			}
			else if(compare === -1) {
				this._sign = o2._sign;
				var swap = x1;
				x1 = x2.slice(0);
				x2 = swap;
			}
			var carry$1 = 0;
			for(var i$1 = 0; i$1 < x1.length; i$1++) {
				x1[i$1] -= ((x2.length >= (i$1 + 1)) ? x2[i$1] : 0) + carry$1;
				if(x1[i$1] < 0) {
					x1[i$1] += 0x10000;
					carry$1  = 1;
				}
				else {
					carry$1  = 0;
				}
			}
			this.element = x1;
			this._memory_reduction();
		}
		return this;
	};

	/**
		 * 加算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A + B
		 */
	BigInteger.prototype.add = function add (number) {
		return this.clone()._add(number);
	};

	/**
		 * 減算（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A -= B
		 * @private
		 */
	BigInteger.prototype._subtract = function _subtract (number) {
		var val = BigInteger._toBigInteger(number);
		var _sign = val._sign;
		var out  = this._add(val._negate());
		val._sign = _sign;
		return out;
	};

	/**
		 * 減算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A - B
		 */
	BigInteger.prototype.subtract = function subtract (number) {
		return this.clone()._subtract(number);
	};

	/**
		 * 減算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A - B
		 */
	BigInteger.prototype.sub = function sub (number) {
		return this.subtract(number);
	};

	/**
		 * 乗算（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A *= B
		 * @private
		 */
	BigInteger.prototype._multiply = function _multiply (number) {
		var x = this.multiply(number);
		this.element = x.element;
		this._sign    = x._sign;
		return this;
	};

	/**
		 * 乗算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A * B
		 */
	BigInteger.prototype.multiply = function multiply (number) {
		var val = BigInteger._toBigInteger(number);
		var out  = new BigInteger();
		var buff = new BigInteger();
		var o1 = this;
		var o2 = val;
		var x1 = o1.element;
		var x2 = o2.element;
		var y  = out.element;
		for(var i = 0; i < x1.length; i++) {
			buff.element = [];
			// x3 = x1[i] * x2
			var x3 = buff.element;
			var carry = 0;
			for(var j = 0; j < x2.length; j++) {
				x3[j] = x1[i] * x2[j] + carry;
				if(x3[j] > 0xFFFF) {
					carry = x3[j] >>> 16;
					x3[j] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x3[x3.length] = carry;
			}
			// x3 = x3 << (i * 16)
			//buff._shift(i << 4);
			for(var j$1 = x3.length - 1; j$1 >= 0; j$1--) {
				x3[j$1 + i] = x3[j$1];
			}
			for(var j$2 = i - 1; j$2 >= 0; j$2--) {
				x3[j$2] = 0;
			}
			// y = y + x3 (out._add(buff))
			//out._add(buff);
			carry = 0;
			out._memory_allocation(x3.length << 4);
			for(var j$3 = i; j$3 < y.length; j$3++) {
				y[j$3] += ((x3.length >= (j$3 + 1)) ? x3[j$3] : 0) + carry;
				if(y[j$3] > 0xFFFF) {
					carry = 1;
					y[j$3] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				y[y.length] = carry;
			}
		}
		out._sign = this._sign * val._sign;
		return out;
	};

	/**
		 * 乗算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A * B
		 */
	BigInteger.prototype.mul = function mul (number) {
		return this.multiply(number);
	};

	/**
		 * 割り算と余り（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {Array<BigInteger>} [C = floor(A / B), A - C * B]
		 * @private
		 */
	BigInteger.prototype._divideAndRemainder = function _divideAndRemainder (number) {
		var val = BigInteger._toBigInteger(number);
		var out = [];
		if(val.signum() === 0) {
			throw "BigInteger divideAndRemainder [" + val.toString() +"]";
		}
		var compare = this.compareToAbs(val);
		if(compare < 0) {
			out[0] = new BigInteger(0);
			out[1] = this.clone();
			return out;
		}
		else if(compare === 0) {
			out[0] = new BigInteger(1);
			out[0]._sign = this._sign * val._sign;
			out[1] = new BigInteger(0);
			return out;
		}
		var ONE = new BigInteger(1);
		var size = this.bitLength() - val.bitLength();
		var x1 = this.clone()._abs();
		var x2 = val.shift(size)._abs();
		var y  = new BigInteger();
		for(var i = 0; i <= size; i++) {
			if(x1.compareToAbs(x2) >= 0) {
				x1._subtract(x2);
				y._add(ONE);
			}
			if(i === size) {
				break;
			}
			x2._shift(-1);
			y._shift(1);
		}
		out[0] = y;
		out[0]._sign = this._sign * val._sign;
		out[1] = x1;
		out[1]._sign = this._sign;
		return out;
	};

	/**
		 * 割り算と余り
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {Array<BigInteger>} [C = floor(A / B), A - C * B]
		 */
	BigInteger.prototype.divideAndRemainder = function divideAndRemainder (number) {
		return this.clone()._divideAndRemainder(number);
	};

	/**
		 * 割り算（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} floor(A / B)
		 * @private
		 */
	BigInteger.prototype._divide = function _divide (number) {
		return this._divideAndRemainder(number)[0];
	};

	/**
		 * 割り算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} floor(A / B)
		 */
	BigInteger.prototype.divide = function divide (number) {
		return this.clone()._divide(number);
	};

	/**
		 * 割り算
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} floor(A / B)
		 */
	BigInteger.prototype.div = function div (number) {
		return this.divide(number);
	};

	/**
		 * 割り算の余り（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A %= B
		 * @private
		 */
	BigInteger.prototype._remainder = function _remainder (number) {
		return this._divideAndRemainder(number)[1];
	};

	/**
		 * 割り算の余り
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A % B
		 */
	BigInteger.prototype.remainder = function remainder (number) {
		return this.clone()._remainder(number);
	};

	/**
		 * 割り算の余り
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A % B
		 */
	BigInteger.prototype.rem = function rem (number) {
		return this.remainder(number);
	};

	/**
		 * 割り算の正の余り（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A = A mod B
		 * @private
		 */
	BigInteger.prototype._mod = function _mod (number) {
		var val = BigInteger._toBigInteger(number);
		if(val.signum() < 0) {
			return null;
		}
		var y = this._divideAndRemainder(val);
		if(y[1] instanceof BigInteger) {
			if(y[1].signum() >= 0) {
				return y[1];
			}
			else {
				return y[1]._add(val);
			}
		}
		return null;
	};

	/**
		 * 割り算の正の余り
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A mod B
		 */
	BigInteger.prototype.mod = function mod (number) {
		return this.clone()._mod(number);
	};

	/**
		 * 特定のビットを立てる（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype._setBit = function _setBit (bit) {
		var n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] |= 1 << (n & 0xF);
		return this;
	};

	/**
		 * 特定のビットを立てる
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.setBit = function setBit (bit) {
		var n = BigInteger._toInteger(bit);
		return this.clone()._setBit(n);
	};

	/**
		 * 特定のビットを反転させる（ミュータブル）
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype._flipBit = function _flipBit (bit) {
		var n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] ^= 1 << (n & 0xF);
		return this;
	};

	/**
		 * 特定のビットを反転させる
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.flipBit = function flipBit (bit) {
		var n = BigInteger._toInteger(bit);
		return this.clone()._flipBit(n);
	};

	/**
		 * 特定のビットを下げる
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit 
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.clearBit = function clearBit (bit) {
		var n = BigInteger._toInteger(bit);
		var y = this.clone();
		y.element[n >>> 4] &= ~(1 << (n & 0xF));
		y._memory_reduction();
		return y;
	};

	/**
		 * 指定のビットの判定
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {boolean}
		 */
	BigInteger.prototype.testBit = function testBit (bit) {
		var n = BigInteger._toInteger(bit);
		return ((this.element[n >>> 4] >>> (n & 0xF)) & 1) !== 0;
	};

	/**
		 * 累乗
		 * @param {BigInteger|number|string|Array<string|number>|Object} exponent
		 * @returns {BigInteger} pow(A, B)
		 */
	BigInteger.prototype.pow = function pow (exponent) {
		var e = new BigInteger(exponent);
		var x = new BigInteger(this);
		var y = new BigInteger(1);
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x);
			}
			x = x.multiply(x);
			e._shift(-1);
		}
		return y;
	};

	/**
		 * 冪剰余
		 * @param {BigInteger|number|string|Array<string|number>|Object} exponent
		 * @param {BigInteger|number|string|Array<string|number>|Object} m 
		 * @returns {BigInteger} A^B mod m
		 */
	BigInteger.prototype.modPow = function modPow (exponent, m) {
		var m_ = BigInteger._toBigInteger(m);
		var x = new BigInteger(this);
		var y = new BigInteger(1);
		var e = new BigInteger(exponent);
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x).mod(m_);
			}
			x = x.multiply(x).mod(m_);
			e._shift(-1);
		}
		return y;
	};

	/**
		 * モジュラ逆数
		 * @param {BigInteger|number|string|Array<string|number>|Object} m
		 * @returns {BigInteger} A^(-1) mod m
		 */
	BigInteger.prototype.modInverse = function modInverse (m) {
		var m_ = BigInteger._toBigInteger(m);
		var y = this.extgcd(m);
		var ONE  = new BigInteger(1);
		if(y[2].compareTo(ONE) !== 0) {
			return null;
		}
		// 正にするため remainder ではなく mod を使用する
		return y[0]._add(m_)._mod(m_);
	};

	/**
		 * ミラーラビン素数判定法による複素判定
		 * （非常に重たいので注意）
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - 素数判定法の繰り返し回数
		 * @returns {boolean}
		 */
	BigInteger.prototype.isProbablePrime = function isProbablePrime (certainty) {
		var e = this.element;
		//0, 1, 2 -> true
		if( (e.length === 0) || ((e.length === 1)&&(e[0] <= 2)) ) {
			return true;
		}
		//even number -> false
		else if((e[0] & 1) === 0) {
			return false;
		}
		// ミラーラビン素数判定法
		// かなり処理が重たいです。まあお遊び程度に使用という感じで。
		var loop= certainty !== undefined ? BigInteger._toInteger(certainty) : 100;
		var ZERO= new BigInteger(0);
		var ONE= new BigInteger(1);
		var n	= this;
		var LEN= n.bitLength();
		var n_1= n.subtract(ONE);
		var s = n_1.getLowestSetBit();
		var d = n_1.shift(-s);

		if(loop <= 0) {
			return false;
		}

		for(var i = 0; i < loop; i++ ) {
			//[ 1, n - 1] の範囲から a を選択
			var a = (void 0);
			do {
				a = BigInteger.createRandomBigInteger(LEN);
			} while(( a.compareTo(ZERO) === 0 )||( a.compareTo(n) !== -1 ));

			var t = d;
			// a^t != 1 mod n
			var y = a.modPow(t, n);
				
			while(true) {
				if((t.equals(n_1)) || (y.equals(ONE)) || (y.equals(n_1))) {
					break;
				}
				y = y.mul(y)._mod(n);
				t = t.shiftLeft(1);
			}

			if((!y.equals(n_1)) && ((t.element[0] & 1) === 0)) {
				return false;
			}
		}
		return true;
	};

	/**
		 * 次の素数
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - 素数判定法の繰り返し回数
		 * @param {BigInteger|number|string|Array<string|number>|Object} [search_max=100000] - 次の素数を見つけるまでの回数
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.nextProbablePrime = function nextProbablePrime (certainty, search_max) {
		var loop= certainty !== undefined ? (BigInteger._toInteger(certainty) >> 1) : 100 / 2;
		var search_max_ = search_max !== undefined ? BigInteger._toInteger(search_max) : 100000;
		var x = this.clone();
		for(var i = 0; i < search_max_; i++) {
			x._add(BigInteger.ONE);
			if(x.isProbablePrime(loop)) {
				return x;
			}
		}
		throw "nextProbablePrime [" + search_max_ +"]";
	};

	/**
		 * 階乗関数
		 * @returns {BigInteger} n!
		 */
	BigInteger.prototype.factorial = function factorial () {
		var loop_max = BigInteger._toInteger(this);
		var x = BigInteger.ONE;
		for(var i = 2; i <= loop_max; i++) {
			x = x.multiply(i);
		}
		return x;
	};

	/**
		 * 乱数を指定しなかった場合のデフォルト乱数を設定する
		 * @param {Random} random
		 */
	BigInteger.setDefaultRandom = function setDefaultRandom (random) {
		DEFAULT_RANDOM = random;
	};

	/**
		 * 乱数を指定しなかった場合のデフォルト乱数を取得する
		 * @returns {Random}
		 */
	BigInteger.getDefaultRandom = function getDefaultRandom () {
		return DEFAULT_RANDOM;
	};




	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 0
		 * @returns {BigInteger} 0
		 */
	staticAccessors$2.ZERO.get = function () {
		return DEFINE$1.ZERO;
	};

	/**
		 * 1
		 * @returns {BigInteger} 1
		 */
	staticAccessors$2.ONE.get = function () {
		return DEFINE$1.ONE;
	};
		
	/**
		 * 2
		 * @returns {BigInteger} 2
		 */
	staticAccessors$2.TWO.get = function () {
		return DEFINE$1.TWO;
	};
		
	/**
		 * 10
		 * @returns {BigInteger} 10
		 */
	staticAccessors$2.TEN.get = function () {
		return DEFINE$1.TEN;
	};

	Object.defineProperties( BigInteger.prototype, prototypeAccessors );
	Object.defineProperties( BigInteger, staticAccessors$2 );

	/**
	 * 内部で使用する定数値
	 * @ignore
	 */
	var DEFINE$1 = {

		/**
		 * 1
		 */
		ONE : new BigInteger(1),

		/**
		 * 2
		 */
		TWO : new BigInteger(2),

		/**
		 * 10
		 */
		TEN : new BigInteger(10),

		/**
		 * 0
		 */
		ZERO : new BigInteger(0)
	};

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
	 * 初期化するときにcontextを設定しなかった場合のデフォルト値
	 * @type {MathContext}
	 * @ignore
	 */
	var DEFAULT_CONTEXT = MathContext.DECIMAL128;

	/**
	 * BigDecimal 内で使用する関数群
	 * @ignore
	 */
	var DecimalTool = function DecimalTool () {};

	DecimalTool.ToBigDecimalFromString = function ToBigDecimalFromString (ntext) {
		var scale = 0;
		var buff;
		// 正規化
		var text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		var number_text = "";
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
	};

	/**
		 * 数値から BigDecimal で使用するデータに変換
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} value 
		 * @returns {{scale : number, integer : BigInteger}}
		 */
	DecimalTool.ToBigDecimalFromNumber = function ToBigDecimalFromNumber (value) {
		// 整数か
		if(value === Math.floor(value)) {
			return {
				scale : 0,
				integer : new BigInteger(value)
			};
		}
		// 実数か
		else {
			var scale = 0;
			var x = value;
			for(var i = 0; i < 10; i++) {
				x = x * 10;
				scale = scale + 1;
				if(x === Math.floor(x)) {
					break;
				}
			}
			return {
				scale : scale,
				integer : new BigInteger(x)
			};
			// 今後改善するならば
			// 64ビットの実数型は15桁程度まで正しい
			// 余裕をもって10桁程度までを抜き出すのが良いかと思われる。
			// スケールは右の式から求めて Math.log(x) / Math.log(10)
		}
	};

	/**
	 * 任意精度浮動小数点演算クラス (immutable)
	 */
	var BigDecimal = function BigDecimal(number) {

		/**
			 * スケール
			 * @private
			 * @type {number}
			 */
		this._scale= 0;
			
		/**
			 * 初期化時に使用したcontext
			 * @private
			 * @type {MathContext}
			 */
		this.default_context = DEFAULT_CONTEXT;

		var context = null;

		if(arguments.length > 1) {
			throw "BigDecimal Unsupported argument[" + arguments.length + "]";
		}
		if(number instanceof BigDecimal) {

			/**
				 * 整数部分
				 * @private
				 * @type {BigInteger}
				 */
			this.integer		= number.integer.clone();

			this._scale			= number._scale;
				
			/**
				 * 文字列化した整数部分（キャッシュ用）
				 * @private
				 * @type {string}
				 */
			this.int_string		= number.int_string;

			this.default_context= number.default_context;

		}
		else if(number instanceof BigInteger) {
			this.integer= number.clone();
		}
		else if(typeof number === "number") {
			var data = DecimalTool.ToBigDecimalFromNumber(number);
			this.integer= data.integer;
			this._scale	= data.scale;
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				if(!(typeof number[0] === "string" || number[0] instanceof String)) {
					this.integer = new BigInteger(number[0]);
				}
				else {
					// 1番目が文字列の場合は、文字列用の設定初期化を行う
					var data$1 = DecimalTool.ToBigDecimalFromString(number[0]);
					this.integer= data$1.integer;
					this._scale	= data$1.scale;
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number" || number[1] instanceof Number) {
					this._scale= number[1];
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
		else if(typeof number === "string") {
			var data$2 = DecimalTool.ToBigDecimalFromString(number);
			this.integer= data$2.integer;
			this._scale	= data$2.scale;
		}
		else if((number instanceof Object) && (number.scale !== undefined && number.default_context !== undefined)) {
			this.integer= new BigInteger(number.integer);
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
		else if(number instanceof Object) {
			var data$3 = DecimalTool.ToBigDecimalFromString(number.toString());
			this.integer= data$3.integer;
			this._scale	= data$3.scale;
		}
		else {
			throw "BigDecimal Unsupported argument " + arguments;
		}
		// データを正規化
		if(context) {
			var newbigdecimal = this.round(context);
			this.integer= newbigdecimal.integer;
			this._scale	= newbigdecimal._scale;
			delete this.int_string;
		}
			
		// データが正しいかチェックする
		if((!(this.integer instanceof BigInteger)) || (!(this.default_context instanceof MathContext))) {
			throw "BigDecimal Unsupported argument " + arguments;
		}
	};

	var prototypeAccessors$1 = { intValue: { configurable: true },intValueExact: { configurable: true },floatValue: { configurable: true },doubleValue: { configurable: true } };
	var staticAccessors$3 = { ZERO: { configurable: true },ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true } };

	/**
		 * BigDecimal を作成
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - 任意精度実数データ
		 * @returns {BigDecimal}
		 */
	BigDecimal.create = function create (number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	};

	/**
		 * 指定した数値から BigDecimal 型に変換
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} x 
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [scale] 
		 * @returns {BigDecimal}
		 */
	BigDecimal.valueOf = function valueOf (x, scale) {
		if(arguments.length === 1) {
			return new BigDecimal(x);
		}
		else {
			return new BigDecimal([x, scale]);
		}
	};

	/**
		 * BigDecimal を作成
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigDecimal}
		 * @private
		 */
	BigDecimal._toBigDecimal = function _toBigDecimal (number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	};

	/**
		 * BigInteger を作成
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigInteger}
		 * @private
		 */
	BigDecimal._toBigInteger = function _toBigInteger (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.toBigInteger();
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * 実数を作成
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigDecimal._toFloat = function _toFloat (number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.doubleValue;
		}
		else {
			return (new BigDecimal(number)).doubleValue;
		}
	};

	/**
		 * 整数を作成
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigDecimal._toInteger = function _toInteger (number) {
		if(typeof number === "number") {
			return number | 0;
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	};

	/**
		 * 符号を除いた文字列を作成
		 * キャッシュがなければ作成し、キャッシュがあればそれを返す
		 * @returns {string} 
		 */
	BigDecimal.prototype._getUnsignedIntegerString = function _getUnsignedIntegerString () {
		// キャッシュする
		if(typeof this.int_string === "undefined") {
			this.int_string = this.integer.toString(10).replace(/^-/, "");
		}
		return this.int_string;
	};

	/**
		 * ディープコピー
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.clone = function clone () {
		return new BigDecimal(this);
	};
		
	/**
		 * 倍率
		 * @returns {number} 
		 */
	BigDecimal.prototype.scale = function scale () {
		return this._scale;
	};

	/**
		 * 符号値
		 * 1, -1, 0の場合は0を返す
		 * @returns {number}
		 */
	BigDecimal.prototype.signum = function signum () {
		return this.integer.signum();
	};

	/**
		 * 符号値
		 * 1, -1, 0の場合は0を返す
		 * @returns {number}
		 */
	BigDecimal.prototype.sign = function sign () {
		return this.signum();
	};

	/**
		 * 精度
		 * @returns {number} 
		 */
	BigDecimal.prototype.precision = function precision () {
		return this._getUnsignedIntegerString().length;
	};

	/**
		 * 指数表記部分を取り除いた整数
		 * @returns {BigInteger} 
		 */
	BigDecimal.prototype.unscaledValue = function unscaledValue () {
		return new BigInteger(this.integer);
	};

	/**
		 * 科学的表記法による文字列化
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} e_len - 指数部の桁数
		 * @returns {string} 
		 */
	BigDecimal.prototype.toScientificNotation = function toScientificNotation (e_len) {
		var e	= BigDecimal._toInteger(e_len);
		var text= this._getUnsignedIntegerString();
		var s	= this.scale();
		var x	= [];
		var i, k;
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
	};

	/**
		 * 文字列化
		 * 指数が不要の場合は指数表記なし
		 * @returns {string} 
		 */
	BigDecimal.prototype.toString = function toString () {
		// 「調整された指数」
		var x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			return this.toScientificNotation(x);
		}
	};

	/**
		 * 技術表記法による文字列化
		 * 指数が不要の場合は指数表記なし
		 * @returns {string} 
		 */
	BigDecimal.prototype.toEngineeringString = function toEngineeringString () {
		// 「調整された指数」
		var x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			// 0 でない値の整数部が 1 〜 999 の範囲に収まるように調整
			return this.toScientificNotation(Math.floor(x / 3) * 3);
		}
	};

	/**
		 * 指数表記なしの文字列化
		 * @returns {string} 
		 */
	BigDecimal.prototype.toPlainString = function toPlainString () {
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
		var text = this.toScientificNotation(0);
		return text.match(/^[^E]*/)[0];
	};

	/**
		 * 設定された精度で表すことができる最も小さな値
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.ulp = function ulp () {
		return new BigDecimal([BigInteger.ONE, this.scale(), this.default_context]);
	};

	/**
		 * スケールの再設定
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} new_scale - 新しいスケール
		 * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - 精度を変換する際の丸め方
		 * @param {MathContext} [mc] - 切り替え先の設定（これのみ変更する場合は、roundを使用すること）
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.setScale = function setScale (new_scale, rounding_mode, mc) {
		var newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		var roundingMode = (rounding_mode !== undefined) ? RoundingMode.valueOf(rounding_mode) : RoundingMode.UNNECESSARY;
		var context = (mc !== undefined) ? mc : this.default_context;
		// 文字列を扱ううえで、符号があるとやりにくいので外しておく
		var text	= this._getUnsignedIntegerString();
		var sign	= this.signum();
		var sign_text= sign >= 0 ? "" : "-";
		// scale の誤差
		// 0 以上なら 0 を加えればいい。0未満なら0を削るか、四捨五入など丸めを行う
		var delta	= newScale - this.scale();// この桁分増やすといい
		if(0 <= delta) {
			// 0を加える
			var i;
			for(i = 0; i < delta; i++) {
				text = text + "0";
			}
			return new BigDecimal([new BigInteger(sign_text + text), newScale, context]);
		}
		var keta = text.length + delta;	// 最終的な桁数
		var keta_marume = keta + 1;
		if(keta <= 0) {
			// 指定した scale では設定できない場合
			// 例えば "0.1".setScale(-2), "10".setScale(-3) としても表すことは不可能であるため、
			// sign（-1, 0, +1）のどれかの数値を使用して丸める
			var outdata = (sign + roundingMode.getAddNumber(sign)) / 10;
			// 上記の式は、CEILINGなら必ず1、正でCEILINGなら1、負でFLOORなら1、それ以外は0となり、
			// さらに元々の数値が 0 なら 0、切り捨て不能なら例外が返る計算式である。
			// これは Java の動作をまねています。
			return new BigDecimal([new BigInteger(outdata), newScale, context]);
		}
		{
			// 0を削るだけで解決する場合
			// 単純な切捨て(0を削るのみ)
			var zeros		= text.match(/0+$/);
			var zero_length	= (zeros !== null) ? zeros[0].length : 0;
			if(( (zero_length + delta) >= 0 ) || (roundingMode === RoundingMode.DOWN)) {
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, keta)), newScale, context]);
			}
		}
		{
			// 丸め計算で解決する場合
			// 12345 -> '123'45
			text = text.substring(0, keta_marume);
			// 丸め計算に必要な切り取る桁数(後ろの1～2桁を取得)
			var cutsize = text.length > 1 ? 2 : 1;
			// '123'45 -> 1'23'4
			var number = parseInt(text.substring(text.length - cutsize, text.length)) * sign;
			// 「元の数」と「丸めに必要な数」を足す
			var x1 = new BigInteger(sign_text + text);
			var x2 = new BigInteger(roundingMode.getAddNumber(number));
			text = x1.add(x2).toString();
			// 丸め後の桁数に戻して
			return new BigDecimal([new BigInteger(text.substring(0, text.length - 1)), newScale, context]);
		}
	};

	/**
		 * 環境設定を切り替える
		 * @param {MathContext} mc - 切り替え先の設定
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.round = function round (mc) {
		if(!(mc instanceof MathContext)) {
			throw "not MathContext";
		}
		var newPrecision= mc.getPrecision();
		var delta		= newPrecision - this.precision();
		if((delta === 0)||(newPrecision === 0)) {
			return this.clone();
		}
		var newBigDecimal = this.setScale( this.scale() + delta, mc.getRoundingMode(), mc);
		/* 精度を上げる必要があるため、0を加えた場合 */
		if(delta > 0) {
			return newBigDecimal;
		}
		/* 精度を下げる必要があるため、丸めた場合は、桁の数が正しいか調べる */
		if(newBigDecimal.precision() === mc.getPrecision()) {
			return newBigDecimal;
		}
		/* 切り上げなどで桁数が１つ増えた場合 */
		var sign_text= newBigDecimal.integer.signum() >= 0 ? "" : "-";
		var abs_text= newBigDecimal._getUnsignedIntegerString();
		var inte_text= sign_text + abs_text.substring(0, abs_text.length - 1);
		return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1, mc]);
	};

	/**
		 * 絶対値
		 * @param {MathContext} [mc] - 計算に使用する設定
		 * @returns {BigDecimal} abs(A)
		 */
	BigDecimal.prototype.abs = function abs (mc) {
		var output = this.clone();
		output.integer = output.integer.abs();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * 正数
		 * @param {MathContext} [mc] - 計算に使用する設定
		 * @returns {BigDecimal} +A
		 */
	BigDecimal.prototype.plus = function plus (mc) {
		var output = this.clone();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * 負数
		 * @param {MathContext} [mc] - 計算に使用する設定
		 * @returns {BigDecimal} -A
		 */
	BigDecimal.prototype.negate = function negate (mc) {
		var output = this.clone();
		output.integer = output.integer.negate();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * 値同士を比較
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	BigDecimal.prototype.compareTo = function compareTo (number) {
		var src = this;
		var tgt = BigDecimal._toBigDecimal(number);
		// 簡易計算
		{
			var src_sign= src.signum();
			var tgt_sign= tgt.signum();
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
			var newdst = tgt.setScale(src._scale);
			return src.integer.compareTo(newdst.integer);
		}
		else {
			var newsrc = src.setScale(tgt._scale);
			return newsrc.integer.compareTo(tgt.integer);
		}
	};

	/**
		 * 等式
		 * 精度やスケール含めて等しいかをテストする
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {boolean} A === B
		 */
	BigDecimal.prototype.equals = function equals (number) {
		if(number instanceof BigDecimal) {
			return ((this._scale === number._scale) && (this.integer.equals(number.integer)));
		}
		else if((typeof number === "string") || (number instanceof String)) {
			var val = BigDecimal._toBigDecimal(number);
			return ((this._scale === val._scale) && (this.integer.equals(val.integer)));
		}
		else {
			return this.compareTo(number) === 0;
		}
	};

	/**
		 * 最大値
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @returns {BigDecimal} max([A, B])
		 */
	BigDecimal.prototype.max = function max (number) {
		var val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * 最小値
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigDecimal} min([A, B])
		 */
	BigDecimal.prototype.min = function min (number) {
		var val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) <= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * 数値を範囲に収める
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} min
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} max
		 * @returns {BigInteger} min(max(x, min), max)
		 */
	BigDecimal.prototype.clip = function clip (min, max) {
		var min_ = BigDecimal._toBigDecimal(min);
		var max_ = BigDecimal._toBigDecimal(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	/**
		 * 精度は変更させずスケールのみを変更させ10の倍数を乗算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} A * 10^floor(n)
		 */
	BigDecimal.prototype.scaleByPowerOfTen = function scaleByPowerOfTen (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.clone();
		output._scale = this.scale() - x;
		return output;
	};

	/**
		 * 小数点の位置を左へ移動
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.movePointLeft = function movePointLeft (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.scaleByPowerOfTen( -x );
		output = output.setScale(Math.max(this.scale() + x, 0));
		return output;
	};

	/**
		 * 小数点の位置を右へ移動
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.movePointRight = function movePointRight (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.scaleByPowerOfTen( x );
		output = output.setScale(Math.max(this.scale() - x, 0));
		return output;
	};

	/**
		 * 数字の右側にある0を取り除き、スケールを正規化
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.stripTrailingZeros = function stripTrailingZeros () {
		// 0をできる限り取り除く
		var sign	= this.signum();
		var sign_text= sign >= 0 ? "" : "-";
		var text	= this.integer.toString(10).replace(/^-/, "");
		var zeros	= text.match(/0+$/);
		var zero_length= (zeros !== null) ? zeros[0].length : 0;
		if(zero_length === text.length) {
			// 全て 0 なら 1 ケタ残す
			zero_length = text.length - 1;
		}
		var newScale= this.scale() - zero_length;
		return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), newScale, this.default_context]);
	};

	/**
		 * 加算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、加算先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A + B
		 */
	BigDecimal.prototype.add = function add (number, context) {
		var augend = BigDecimal._toBigDecimal(number);
		var mc = context ? context : augend.default_context;
		var src		= this;
		var tgt		= augend;
		var newscale= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			// 1 e1 + 1 e1 = 1
			return new BigDecimal([src.integer.add(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			// 1 e-2 + 1 e-1
			var newdst = tgt.setScale(src._scale);
			// 0.01 + 0.10 = 0.11 = 11 e-2
			return new BigDecimal([src.integer.add(newdst.integer), newscale, mc, mc]);
		}
		else {
			// 1 e-1 + 1 e-2
			var newsrc = src.setScale(tgt._scale);
			// 0.1 + 0.01 = 0.11 = 11 e-2
			return new BigDecimal([newsrc.integer.add(tgt.integer), newscale, mc, mc]);
		}
	};

	/**
		 * 減算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、減算先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A - B
		 */
	BigDecimal.prototype.subtract = function subtract (number, context) {
		var subtrahend = BigDecimal._toBigDecimal(number);
		var mc = context ? context : subtrahend.default_context;
		var src		= this;
		var tgt		= subtrahend;
		var newscale= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			return new BigDecimal([src.integer.subtract(tgt.integer), newscale, mc, mc]);
		}
		else if(src._scale > tgt._scale) {
			var newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.subtract(newdst.integer), newscale, mc, mc]);
		}
		else {
			var newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.subtract(tgt.integer), newscale, mc, mc]);
		}
	};

	/**
		 * 減算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、減算先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A - B
		 */
	BigDecimal.prototype.sub = function sub (number, context) {
		return this.subtract(number, context);
	};

	/**
		 * 乗算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、乗算先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A * B
		 */
	BigDecimal.prototype.multiply = function multiply (number, context) {
		var multiplicand = BigDecimal._toBigDecimal(number);
		var mc = context ? context : multiplicand.default_context;
		var src		= this;
		var tgt		= multiplicand;
		var newinteger= src.integer.multiply(tgt.integer);
		// 0.1 * 0.01 = 0.001
		var newscale= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	};

	/**
		 * 乗算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、乗算先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A * B
		 */
	BigDecimal.prototype.mul = function mul (number, context) {
		return this.multiply(number, context);
	};

	/**
		 * 小数点まで求めない割り算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
		 * @returns {BigDecimal} (int)(A / B)
		 */
	BigDecimal.prototype.divideToIntegralValue = function divideToIntegralValue (number, context) {
		var divisor = BigDecimal._toBigDecimal(number);
		var mc = context ? context : divisor.default_context;
		var getDigit  = function( num ) {
			var i;
			var text = "1";
			for(i = 0; i < num; i++) {
				text = text + "0";
			}
			return new BigInteger(text);
		};
		if(divisor.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		// 1000e0	/1e2			=1000e-2
		// 1000e0	/10e1		=100e-1
		// 1000e0	/100e0		=10e0
		// 1000e0	/1000e-1		=1e1
		// 1000e0	/10000e-2	=1e1
		// 1000e0	/100000e-3	=1e1

		// 10e2		/100e0		=1e1
		// 100e1	/100e0		=1e1
		// 1000e0	/100e0		=10e0
		// 10000e-1	/100e0		=100e-1	
		// 100000e-2/100e0		=1000e-2

		var src	= this;
		var tgt	= divisor;
		var src_integer= src.integer;
		var tgt_integer= tgt.integer;
		var newScale= src._scale - tgt._scale;

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
		var new_integer= src_integer.divide(tgt_integer);
		var sign		= new_integer.signum();
		if(sign !== 0) {
			var text= new_integer.toString(10).replace(/^-/, "");
			// 指定した桁では表すことができない
			if((mc.getPrecision() !== 0) && (text.length > mc.getPrecision())) {
				throw "ArithmeticException";
			}
			// 結果の優先スケール に合わせる (this.scale() - divisor.scale())
			if(text.length <= (-newScale)) {
				// 合わせることができないので、0をできる限り削る = stripTrailingZerosメソッド
				var zeros		= text.match(/0+$/);
				var zero_length= (zeros !== null) ? zeros[0].length : 0;
				var sign_text	= sign >= 0 ? "" : "-";
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), -zero_length, mc]);
			}
		}

		var output = new BigDecimal(new_integer);
		output = output.setScale(newScale, RoundingMode.UP);
		output = output.round(mc);
		output.default_context = mc;
		return output;
	};

	/**
		 * 割り算と余り
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
		 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
		 */
	BigDecimal.prototype.divideAndRemainder = function divideAndRemainder (number, context) {
		var divisor = BigDecimal._toBigDecimal(number);
		var mc = context ? context : divisor.default_context;

		// 1000e0	/1e2			=1000e-2... 0e0
		// 1000e0	/10e1		=100e-1... 0e0
		// 1000e0	/100e0		=10e0... 0e0
		// 1000e0	/1000e-1		=1e1	... 0e0
		// 1000e0	/10000e-2	=1e1	... 0e-1
		// 1000e0	/100000e-3	=1e1	... 0e-2

		// 10e2		/100e0		=1e1	... 0e1
		// 100e1	/100e0		=1e1	... 0e1
		// 1000e0	/100e0		=10e0... 0e0
		// 10000e-1	/100e0		=100e-1... 0e-1
		// 100000e-2/100e0		=1000e-2... 0e-2

		var result_divide= this.divideToIntegralValue(divisor, mc);
		var result_remaind= this.subtract(result_divide.multiply(divisor, mc), mc);

		var output = [result_divide, result_remaind];
		return output;
	};

	/**
		 * 割り算の余り
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A % B
		 */
	BigDecimal.prototype.rem = function rem (number, context) {
		return this.divideAndRemainder(number, context)[1];
	};

	/**
		 * 割り算の正の余り
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
		 * @returns {BigDecimal} A mod B
		 */
	BigDecimal.prototype.mod = function mod (number, context) {
		var x = this.rem(number, context);
		if(x.compareTo(BigDecimal.ZERO) < 0) {
			return x.add(number, context);
		}
	};

	/**
		 * 割り算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
		 * @returns {BigDecimal}
		 */
	BigDecimal.prototype.divide = function divide (number, type) {
		var divisor = BigDecimal._toBigDecimal(number);
		var src		= this;
		var tgt		= divisor;
		var roundingMode= null;
		var mc			= null;
		var newScale	= 0;
		var isPriorityScale= false;
		if(type && type.scale) {
			isPriorityScale= false;
			newScale = type.scale;
		}
		else {
			isPriorityScale= true;
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
		var newsrc;
		var result_map = [];
		var result, result_divide, result_remaind, all_result;
		all_result = BigDecimal.ZERO;
		var precision = mc.getPrecision();
		var check_max = precision !== 0 ? (precision + 8) : 0x3FFFF;
		newsrc = src;
		for(var i = 0; i < check_max; i++) {
			result = newsrc.divideAndRemainder(tgt, MathContext.UNLIMITED);
			result_divide= result[0];
			result_remaind= result[1];
			all_result = all_result.add(result_divide.scaleByPowerOfTen(-i), MathContext.UNLIMITED);
			if(result_remaind.compareTo(BigDecimal.ZERO) !== 0) {
				if(precision === 0) {// 精度無限大の場合は、循環小数のチェックが必要
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
	};

	/**
		 * 割り算
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
		 * @returns {BigDecimal} A / B
		 */
	BigDecimal.prototype.div = function div (number, type) {
		return this.divide(number, type);
	};

	/**
		 * BigInteger に変換
		 * @returns {BigInteger}
		 */
	BigDecimal.prototype.toBigInteger = function toBigInteger () {
		var x = this.toPlainString().replace(/\.\d*$/, "");
		return new BigInteger(x);
	};

	/**
		 * BigInteger に変換
		 * 変換に失敗した場合は例外
		 * @returns {BigInteger}
		 */
	BigDecimal.prototype.toBigIntegerExact = function toBigIntegerExact () {
		var x = this.setScale(0, RoundingMode.UNNECESSARY);
		return new BigInteger(x.toPlainString());
	};

	/**
		 * 32ビット整数に変換
		 * @returns {number}
		 */
	prototypeAccessors$1.intValue.get = function () {
		var bigintdata = this.toBigInteger();
		var x = bigintdata.intValue;
		return x & 0xFFFFFFFF;
	};

	/**
		 * 32ビット整数に変換
		 * 変換に失敗した場合は例外
		 * @returns {number}
		 */
	prototypeAccessors$1.intValueExact.get = function () {
		var bigintdata = this.toBigIntegerExact();
		var x = bigintdata.intValue;
		if((x < -2147483648) || (2147483647 < x)) {
			throw "ArithmeticException";
		}
		return x;
	};

	/**
		 * 32ビット実数に変換
		 * @returns {number}
		 */
	prototypeAccessors$1.floatValue.get = function () {
		var p = this.precision();
		if(MathContext.DECIMAL32.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	};

	/**
		 * 64ビット実数に変換
		 * @returns {number}
		 */
	prototypeAccessors$1.doubleValue.get = function () {
		var p = this.precision();
		if(MathContext.DECIMAL64.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	};

	/**
		 * 累乗
		 * 巨大な乗算をする場合は例外を発生させる
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、累乗先の設定デフォルト値を使用する
		 * @returns {BigDecimal} pow(A, B)
		 */
	BigDecimal.prototype.pow = function pow (number, context) {
		var n = BigDecimal._toInteger(number);
		var mc = context ? context : this.default_context;
		if(Math.abs(n) > 999999999) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() === 0) && (n < 0)) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() > 0) && (n > mc.getPrecision())) {
			throw "ArithmeticException";
		}
		var x, y;
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
	};
		
	/**
		 * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定
		 * @param {MathContext} [context=MathContext.DECIMAL128]
		 */
	BigDecimal.setDefaultContext = function setDefaultContext (context) {
		DEFAULT_CONTEXT = context ? context : MathContext.DECIMAL128;
	};

	/**
		 * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定を取得
		 * @returns {MathContext}
		 */
	BigDecimal.getDefaultContext = function getDefaultContext () {
		return DEFAULT_CONTEXT;
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 0
		 * @returns {BigDecimal} 0
		 */
	staticAccessors$3.ZERO.get = function () {
		var x = new BigDecimal(DEFINE$2.ZERO);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	};

	/**
		 * 1
		 * @returns {BigDecimal} 1
		 */
	staticAccessors$3.ONE.get = function () {
		var x = new BigDecimal(DEFINE$2.ONE);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	};
		
	/**
		 * 2
		 * @returns {BigDecimal} 2
		 */
	staticAccessors$3.TWO.get = function () {
		var x = new BigDecimal(DEFINE$2.TWO);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	};
		
	/**
		 * 10
		 * @returns {BigDecimal} 10
		 */
	staticAccessors$3.TEN.get = function () {
		var x = new BigDecimal(DEFINE$2.TEN);
		x.default_context = DEFAULT_CONTEXT;
		return x;
	};

	Object.defineProperties( BigDecimal.prototype, prototypeAccessors$1 );
	Object.defineProperties( BigDecimal, staticAccessors$3 );

	/**
	 * 内部で使用する定数値
	 * @ignore
	 */
	var DEFINE$2 = {

		/**
		 * 0
		 */
		ZERO : new BigDecimal(0),

		/**
		 * 1
		 */
		ONE : new BigDecimal(1),

		/**
		 * 2
		 */
		TWO : new BigDecimal(2),

		/**
		 * 10
		 */
		TEN : new BigDecimal(10)
	};

	BigDecimal.RoundingMode = RoundingMode;
	BigDecimal.MathContext = MathContext;

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
	 * 線形代数用の関数集
	 * @ignore
	 */
	var LinearAlgebraTool = function LinearAlgebraTool () {};

	LinearAlgebraTool.tridiagonalize = function tridiagonalize (mat) {

		var A = Matrix._toMatrix(mat);
		var a = A.getNumberMatrixArray();
		var tolerance = 1.0e-10;

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 3重対角化の成分を取得する
			
		/**
			 * ベクトルx1とベクトルx2の内積をとる
			 * @param {Array<number>} x1
			 * @param {Array<number>} x2
			 * @param {number} [index_offset=0] - オフセット(この値から行う)
			 * @param {number} [index_max=x1.length] - 最大(この値は含めない)
			 * @returns {number} 
			 */
		var innerproduct = function(x1, x2, index_offset, index_max) {
			var y = 0;
			var ioffset = index_offset ? index_offset : 0;
			var imax = index_max ? index_max : x1.length;
			for(var i = ioffset; i < imax; i++) {
				y += x1[i] * x2[i];
			}
			return y;
		};

		/**
			 * ハウスホルダー変換
			 * @param {Array<number>} x - ハウスホルダー変換したいベクトル
			 * @param {number} [index_offset=0] - オフセット(この値から行う)
			 * @param {number} [index_max=x.length] - 最大(この値は含めない)
			 * @returns {{y1: number, v: Array<number>}} 
			 */
		var house = function(x, index_offset, index_max) {
			var ioffset = index_offset ? index_offset : 0;
			var imax = index_max ? index_max : x.length;
			// xの内積の平方根（ノルム）を計算
			var y1 = Math.sqrt(innerproduct(x, x, ioffset, imax));
			var v = [];
			if(Math.abs(y1) >= tolerance) {
				if(x[ioffset] < 0) {
					y1 = - y1;
				}
				var t;
				for(var i = ioffset, j = 0; i < imax; i++, j++) {
					if(i === ioffset) {
						v[j] = x[i] + y1;
						t = 1.0 / Math.sqrt(v[j] * y1);
						v[j] = v[j] * t;
					}
					else {
						v[j] = x[i] * t;
					}
				}
			}
			return {
				y1: - y1,// 鏡像の1番目の要素(y2,y3,...は0)
				v : v	// 直行する単位ベクトル vT*v = 2
			};
		};

		var n = a.length;
		var d = []; // 対角成分
		var e = []; // 隣の成分
		{
			for(var k = 0; k < n - 2; k++) {
				var v = a[k];
				d[k] = v[k];
				{
					var H$1 = house(v, k + 1, n);
					e[k] = H$1.y1;
					for(var i = 0; i < H$1.v.length; i++) {
						v[k + 1 + i] = H$1.v[i];
					}
				}
				if(Math.abs(e[k]) < tolerance) {
					continue;
				}
				for(var i$1 = k + 1; i$1 < n; i$1++) {
					var s = 0;
					for(var j = k + 1; j < i$1; j++) {
						s += a[j][i$1] * v[j];
					}
					for(var j$1 = i$1; j$1 < n; j$1++) {
						s += a[i$1][j$1] * v[j$1];
					}
					d[i$1] = s;
				}
				var t = innerproduct(v, d, k + 1, n) / 2.0;
				for(var i$2 = n - 1; i$2 > k; i$2--) {
					var p = v[i$2];
					var q = d[i$2] - (t * p);
					d[i$2] = q;
					for(var j$2 = i$2; j$2 < n; j$2++) {
						var r = p * d[j$2] + q * v[j$2];
						a[i$2][j$2] = a[i$2][j$2] - r;
					}
				}
			}
			if(n >= 2) {
				d[n - 2] = a[n - 2][n - 2];
				e[n - 2] = a[n - 2][n - 1];
			}
			if(n >= 1) {
				d[n - 1] = a[n - 1][n - 1];
			}
		}

		//変換P行列を求める
		for(var k$1 = n - 1; k$1 >= 0; k$1--) {
			var v$1 = a[k$1];
			if(k$1 < n - 2) {
				for(var i$3 = k$1 + 1; i$3 < n; i$3++) {
					var w = a[i$3];
					var t$1 = innerproduct(v$1, w, k$1 + 1, n);
					for(var j$3 = k$1 + 1; j$3 < n; j$3++) {
						w[j$3] -= t$1 * v$1[j$3];
					}
				}
			}
			for(var i$4 = 0; i$4 < n; i$4++) {
				v$1[i$4] = 0.0;
			}
			v$1[k$1] = 1.0;
		}

		// d と e の配列を使って、三重対角行列を作成する
		var H = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				return new Complex(d[row]);
			}
			else if(Math.abs(row - col) === 1) {
				return new Complex(e[((row + col) * 0.5) | 0]);
			}
			else {
				return Complex.ZERO;
			}
		}, n, n);

		return {
			P : (new Matrix(a)).T(),
			H : H
		};
	};

	/**
		 * 対称行列の固有値分解
		 * 実数での計算のみ対応
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - 対称行列
		 * @returns {{V: Matrix, D: Matrix}}
		 */
	LinearAlgebraTool.eig = function eig (mat) {
		var A = Matrix._toMatrix(mat);
			
		// QR法により固有値を求める
		var is_error = false;
		var tolerance = 1.0e-10;
		var PH = LinearAlgebraTool.tridiagonalize(A);
		var a = PH.P.getNumberMatrixArray();
		var h = PH.H.getNumberMatrixArray();
		var n = A.row_length;

		// 成分の抽出
		var d = []; // 対角成分
		var e = []; // 隣の成分
		for(var i = 0; i < n; i++) {
			d[i] = h[i][i];
			e[i] = (i === 0) ? 0.0 : h[i][i - 1];
		}

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		var MAX_ITER = 100;
		for(var h$1 = n - 1; h$1 > 0; h$1--) {
			var j = h$1;
			for(j = h$1;j >= 1; j--) {
				if(Math.abs(e[j]) <= (tolerance * (Math.abs(d[j - 1]) + Math.abs(d[j])))) {
					break;
				}
			}
			if(j == h$1) {
				continue;
			}
			var iter = 0;
			while(true) {
				iter++;
				if(iter > MAX_ITER) {
					is_error = true;
					break;
				}
				var w = (d[h$1 - 1] - d[h$1]) / 2.0;
				var t = e[h$1] * e[h$1];
				var s = Math.sqrt(w * w + t);
				if(w < 0) {
					s = - s;
				}
				var x = d[j] - d[h$1] + (t / (w + s));
				var y = e[j + 1];
				for(var k = j; k < h$1; k++) {
					var c = (void 0), s$1 = (void 0);
					if(Math.abs(x) >= Math.abs(y)) {
						t = - y / x;
						c = 1.0 / Math.sqrt(t * t + 1);
						s$1 = t * c;
					}
					else {
						t = - x / y;
						s$1 = 1.0 / Math.sqrt(t * t + 1);
						c = t * s$1;
					}
					w = d[k] - d[k + 1];
					t = (w * s$1 + 2.0 * c * e[k + 1]) * s$1;
					d[k] -= t;
					d[k + 1] += t;
					if(k > j) {
						e[k] = c * e[k] - s$1 * y;
					}
					e[k + 1] += s$1 * (c * w - 2.0 * s$1 * e[k + 1]);
					for(var i$1 = 0; i$1 < n; i$1++) {
						x = a[i$1][k];
						y = a[i$1][k + 1];
						a[i$1][k    ] = c * x - s$1 * y;
						a[i$1][k + 1] = s$1 * x + c * y;
					}
					if(k < h$1 - 1) {
						x = e[k + 1];
						y = -s$1 * e[k + 2];
						e[k + 2] *= c;
					}
				}
				if(Math.abs(e[h$1]) <= tolerance * (Math.abs(d[h$1 - 1]) + Math.abs(d[h$1]))) {
					break;
				}
			}
			if(is_error) {
				break;
			}
		}

		// 固有値が大きいものから並べるソート
		var vd_sort = function(V, d) {
			var len = d.length;
			var sortdata = [];
			for(var i = 0; i < len; i++) {
				sortdata[i] = {
					sigma : d[i],
					index : i
				};
			}
			var compare = function(a, b){
				if(a.sigma === b.sigma) {
					return 0;
				}
				return (a.sigma < b.sigma ? 1 : -1);
			};
			sortdata.sort(compare);
			var MOVE = Matrix.zeros(len);
			var ND = Matrix.zeros(len);
			for(var i$1 = 0; i$1 < len; i$1++) {
				ND.matrix_array[i$1][i$1] = new Complex(sortdata[i$1].sigma);
				MOVE.matrix_array[i$1][sortdata[i$1].index] = Complex.ONE;
			}
			return {
				V : V.mul(MOVE),
				D : ND
			};
		};
		var VD = vd_sort(new Matrix(a), d);
		return VD;
	};

	/**
		 * 行列をベクトルと見立て、正規直行化し、QとRの行列を作る
		 * @param {Matrix} mat - 正方行列
		 * @returns {{Q: Matrix, R: Matrix, non_orthogonalized : Array<number>}}
		 */
	LinearAlgebraTool.doGramSchmidtOrthonormalization = function doGramSchmidtOrthonormalization (mat) {
		// グラム・シュミットの正規直交化法を使用する
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.

		var M = Matrix._toMatrix(mat);
		var len = M.column_length;
		var A = M.matrix_array;
		var Q_Matrix = Matrix.zeros(len);
		var R_Matrix = Matrix.zeros(len);
		var Q = Q_Matrix.matrix_array;
		var R = R_Matrix.matrix_array;
		var non_orthogonalized = [];
		var a = new Array(len);
			
		for(var col = 0; col < len; col++) {
			// i列目を抽出
			for(var row = 0; row < len; row++) {
				a[row] = A[row][col];
			}
			// 直行ベクトルを作成
			if(col > 0) {
				// Rのi列目を内積で計算する
				for(var j = 0; j < col; j++) {
					for(var k = 0; k < len; k++) {
						R[j][col] = R[j][col].add(A[k][col].dot(Q[k][j]));
					}
				}
				for(var j$1 = 0; j$1 < col; j$1++) {
					for(var k$1 = 0; k$1 < len; k$1++) {
						a[k$1] = a[k$1].sub(R[j$1][col].mul(Q[k$1][j$1]));
					}
				}
			}
			{
				// 正規化と距離を1にする
				for(var j$2 = 0; j$2 < len; j$2++) {
					R[col][col] = R[col][col].add(a[j$2].square());
				}
				R[col][col] = R[col][col].sqrt();
				if(R[col][col].isZero(1e-10)) {
					// 直行化が不可能だった列の番号をメモして、その列はゼロで埋める
					non_orthogonalized.push(col);
					for(var j$3 = 0;j$3 < len;j$3++) {
						Q[j$3][col] = Complex.ZERO;
					}
				}
				else {
					// ここで R[i][i] === 0 の場合、直行させたベクトルaは0であり、
					// ランク落ちしており、計算不可能である。
					// 0割りした値を、j列目のQに記録していくがInfとなる。
					for(var j$4 = 0;j$4 < len;j$4++) {
						Q[j$4][col] = a[j$4].div(R[col][col]);
					}
				}
			}
		}
		return {
			Q : Q_Matrix,
			R : R_Matrix,
			non_orthogonalized : non_orthogonalized
		};
	};
		
	/**
		 * 行列の全行ベクトルに対して、直行したベクトルを作成する
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} [epsilon=1.0e-10] - 誤差
		 * @returns {Matrix|null} 直行したベクトルがなければNULLを返す
		 */
	LinearAlgebraTool.createOrthogonalVector = function createOrthogonalVector (mat, epsilon) {
		var M = new Matrix(mat);
		var column_length = M.column_length;
		var m = M.matrix_array;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		// 正則行列をなす場合に問題となる行番号を取得
		var not_regular_rows = LinearAlgebraTool.getLinearDependenceVector(M, tolerance);
		// 不要な行を削除する
		{
			// not_regular_rowsは昇順リストなので、後ろから消していく
			for(var i = not_regular_rows.length - 1; i >= 0; i--) {
				m.splice(not_regular_rows[i], 1);
				M.row_length--;
			}
		}
		// 追加できるベクトルの数
		var add_vectors = column_length - m.length;
		if(add_vectors <= 0) {
			return null;
		}
		// ランダムベクトル（seed値は毎回同一とする）
		var noise = new Random(0);
		var orthogonal_matrix = null;
		for(var i$1 = 0; i$1 < 100; i$1++) {
			// 直行ベクトルを作るために、いったん行と列を交換する
			// これは、グラム・シュミットの正規直交化法が列ごとに行う手法のため。
			var M2 = M.T();
			// ランダム行列を作成する
			var R = Matrix.createMatrixDoEachCalculation(function() {
				return new Complex(noise.nextGaussian());
			}, M2.row_length, add_vectors);
			// 列に追加する
			M2._concatRight(R);
			// 正規直行行列を作成する
			orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M2);
			// 正しく作成できていたら完了
			if(orthogonal_matrix.non_orthogonalized.length === 0) {
				break;
			}
		}
		if(orthogonal_matrix.non_orthogonalized.length !== 0) {
			// 普通は作成できないことはないが・・・
			console.log("miss");
			return null;
		}
		// 作成した列を切り出す
		var y = new Array(add_vectors);
		var q = orthogonal_matrix.Q.matrix_array;
		for(var row = 0; row < add_vectors; row++) {
			y[row] = new Array(column_length);
			for(var col = 0; col < column_length; col++) {
				y[row][col] = q[col][column_length - add_vectors + row];
			}
		}
		return new Matrix(y);
	};

	/**
		 * 列の中で最もノルムが最大の値がある行番号
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} column_index - 列番号
		 * @param {number} [row_index_offset=0] - 行のオフセット(この値から行う)
		 * @param {number} [row_index_max] - 行の最大(この値は含めない)
		 * @returns {{index: number, max: number}} 行番号
		 * @private
		 */
	LinearAlgebraTool.getMaxRowNumber = function getMaxRowNumber (mat, column_index, row_index_offset, row_index_max) {
		var M = Matrix._toMatrix(mat);
		var row_index = 0;
		var row_max = 0;
		var row = row_index_offset ? row_index_offset : 0;
		var row_imax = row_index_max ? row_index_max : M.row_length;
		// n列目で最も大きな行を取得
		for(; row < row_imax; row++) {
			var norm = M.matrix_array[row][column_index].norm;
			if(norm > row_max) {
				row_max = norm;
				row_index = row;
			}
		}
		return {
			index : row_index,
			max : row_max
		};
	};

	/**
		 * 行列の各行をベクトルと見立て、線型従属している行を抽出
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} [epsilon=1.0e-10] - 誤差
		 * @returns {Array} 行番号の行列(昇順)
		 * @private
		 */
	LinearAlgebraTool.getLinearDependenceVector = function getLinearDependenceVector (mat, epsilon) {
		var M = new Matrix(mat);
		var m = M.matrix_array;
		var tolerance = epsilon ? Matrix._toDouble(epsilon) : 1.0e-10;
		// 確認する行番号（ここから終わった行は削除していく）
		var row_index_array = new Array(mat.row_length);
		for(var i = 0; i < mat.row_length; i++) {
			row_index_array[i] = i;
		}
		// ガウスの消去法を使用して、行ベクトルを抽出していく
		for(var col_target = 0; col_target < M.column_length; col_target++) {
			var row_max_index = 0;
			{
				var row_max = 0;
				var row_max_key = 0;
				// n列目で絶対値が最も大きな行を取得
				for(var row_key in row_index_array) {
					var row = row_index_array[row_key];
					var norm = m[row][col_target].norm;
					if(norm > row_max) {
						row_max = norm;
						row_max_key = parseInt(row_key, 10);
						row_max_index = row;
					}
				}
				// 大きいのが0である＝その列は全て0である
				if(row_max <= tolerance) {
					continue;
				}
				// 大きな値があった行は、リストから除去する
				row_index_array.splice(row_max_key, 1);
				if(col_target === M.column_length - 1) {
					break;
				}
			}
			// 次の列から、大きな値があった行の成分を削除
			for(var row_key$1 in row_index_array) {
				var row$1 = row_index_array[row_key$1];
				var inv = m[row$1][col_target].div(m[row_max_index][col_target]);
				for(var col = col_target; col < M.column_length; col++) {
					m[row$1][col] = m[row$1][col].sub(m[row_max_index][col].mul(inv));
				}
			}
		}
		return row_index_array;
	};

	/**
	 * Matrix用の線形代数用の計算クラス
	 */
	var LinearAlgebra = function LinearAlgebra () {};

	LinearAlgebra.inner = function inner (A, B, dimension) {
		var M1 = Matrix._toMatrix(A);
		var M2 = Matrix._toMatrix(B);
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var dim = dimension ? Matrix._toInteger(dimension) : 1;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.dot(M2.scalar));
		}
		if(M1.isVector() && M2.isVector()) {
			var sum = Complex.ZERO;
			for(var i = 0; i < M1.length; i++) {
				sum = sum.add(M1.getComplex(i).dot(M2.getComplex(i)));
			}
			return new Matrix(sum);
		}
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		if(dim === 1) {
			var y = new Array(1);
			y[0] = new Array(M1.column_length);
			for(var col = 0; col < M1.column_length; col++) {
				var sum$1 = Complex.ZERO;
				for(var row = 0; row < M1.row_length; row++) {
					sum$1 = sum$1.add(x1[row][col].dot(x2[row][col]));
				}
				y[0][col] = sum$1;
			}
			return new Matrix(y);
		}
		else if(dim === 2) {
			var y$1 = new Array(M1.row_length);
			for(var row$1 = 0; row$1 < M1.row_length; row$1++) {
				var sum$2 = Complex.ZERO;
				for(var col$1 = 0; col$1 < M1.column_length; col$1++) {
					sum$2 = sum$2.add(x1[row$1][col$1].dot(x2[row$1][col$1]));
				}
				y$1[row$1] = [sum$2];
			}
			return new Matrix(y$1);
		}
		else {
			throw "dim";
		}
	};

	/**
		 * pノルム
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	LinearAlgebra.norm = function norm (mat, p) {
		var M = Matrix._toMatrix(mat);
		var p_number = (p === undefined) ? 2 : Matrix._toDouble(p);
		if(p_number === 1) {
			// 行列の1ノルム
			var y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				var sum = 0.0;
				for(var col = 0; col < M.column_length; col++) {
					sum += y[0][col].norm;
				}
				return sum;
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				var sum$1 = 0.0;
				for(var row = 0; row < M.row_length; row++) {
					sum$1 += y[row][0].norm;
				}
				return sum$1;
			}
			// 列の和の最大値
			var max = 0;
			// 列を固定して行の和を計算
			for(var col$1 = 0; col$1 < M.column_length; col$1++) {
				var sum$2 = 0;
				for(var row$1 = 0; row$1 < M.row_length; row$1++) {
					sum$2 += y[row$1][col$1].norm;
				}
				if(max < sum$2) {
					max = sum$2;
				}
			}
			return max;
		}
		else if(p_number === 2) {
			// 行列の2ノルム
			var y$1 = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				var sum$3 = 0.0;
				for(var col$2 = 0; col$2 < M.column_length; col$2++) {
					sum$3 += y$1[0][col$2].square().real;
				}
				return Math.sqrt(sum$3);
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				var sum$4 = 0.0;
				for(var row$2 = 0; row$2 < M.row_length; row$2++) {
					sum$4 += y$1[row$2][0].square().real;
				}
				return Math.sqrt(sum$4);
			}
			return M.svd().S.diag().max().scalar.real;
		}
		else if((p_number === Number.POSITIVE_INFINITY) || (p_number === Number.NEGATIVE_INFINITY)) {
			var y$2 = M.matrix_array;
			var compare_number = p_number === Number.POSITIVE_INFINITY ? 0 : Number.POSITIVE_INFINITY;
			var compare_func = p_number === Number.POSITIVE_INFINITY ? Math.max : Math.min;
			// 行ノルムを計算する
			if(M.isRow()) {
				for(var col$3 = 0; col$3 < M.column_length; col$3++) {
					compare_number = compare_func(compare_number, y$2[0][col$3].norm);
				}
				return compare_number;
			}
			// 列ノルムを計算する
			if(M.isColumn()) {
				for(var row$3 = 0; row$3 < M.row_length; row$3++) {
					compare_number = compare_func(compare_number, y$2[row$3][0].norm);
				}
				return compare_number;
			}
			// 行列の場合は、列の和の最大値
			compare_number = 0;
			for(var row$4 = 0; row$4 < M.row_length; row$4++) {
				var sum$5 = 0.0;
				for(var col$4 = 0; col$4 < M.column_length; col$4++) {
					sum$5 += y$2[row$4][col$4].norm;
				}
				compare_number = Math.max(compare_number, sum$5);
			}
			return compare_number;
		}
		else if(M.isVector()) {
			// 一般化ベクトルpノルム
			var sum$6 = 0.0;
			for(var i = 0; i < M.length; i++) {
				sum$6 += Math.pow(M.getComplex(i).norm, p_number);
			}
			return Math.pow(sum$6, 1.0 / p_number);
		}
		// 未実装
		throw "norm";
	};
		
	/**
		 * 条件数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	LinearAlgebra.cond = function cond (mat, p) {
		var M = Matrix._toMatrix(mat);
		var p_number = (p === undefined) ? 2 : Matrix._toInteger(p);
		if(p_number === 2) {
			// 零行列は Inf
			if(M.isZeros()) {
				return Number.POSITIVE_INFINITY;
			}
			// ベクトルは1
			if(M.isVector()) {
				return 1;
			}
			// ユニタリは1
			if(M.isUnitary()) {
				return 1;
			}
			var s = M.svd().S.diag();
			return s.max().scalar.real / s.min().scalar.real;
		}
		return M.norm(p) * M.pinv().norm(p);
	};

	/**
		 * 1ノルムの条件数の逆数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {number}
		 */
	LinearAlgebra.rcond = function rcond (mat) {
		return 1.0 / LinearAlgebra.cond(Matrix._toMatrix(mat), 1);
	};

	/**
		 * ランク
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {number} rank(A)
		 */
	LinearAlgebra.rank = function rank (mat, epsilon) {
		var M = Matrix._toMatrix(mat);
		// 横が長い行列の場合
		if(M.row_length <= M.column_length) {
			return Math.min(M.row_length, M.column_length) - (LinearAlgebraTool.getLinearDependenceVector(M, epsilon)).length;
		}
		else {
			return M.row_length - (LinearAlgebraTool.getLinearDependenceVector(M, epsilon)).length;
		}
	};

	/**
		 * トレース
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {Complex}
		 */
	LinearAlgebra.trace = function trace (mat) {
		var M = Matrix._toMatrix(mat);
		var len = Math.min(M.row_length, M.column_length);
		var sum = Complex.ZERO;
		for(var i = 0; i < len; i++) {
			sum = sum.add(M.matrix_array[i][i]);
		}
		return sum;
	};

	/**
		 * 行列式
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {Matrix} |A|
		 */
	LinearAlgebra.det = function det (mat) {
		var M = Matrix._toMatrix(mat);
		if(!M.isSquare()) {
			throw "not square";
		}
		var len = M.length;
		if(len < 5) {
			var calcDet = function(x) {
				if(x.length === 2) {
					// 2次元の行列式になったら、たすき掛け計算する
					return x[0][0].mul(x[1][1]).sub(x[0][1].mul(x[1][0]));
				}
				var y = Complex.ZERO;
				for(var i = 0; i < x.length; i++) {
					// N次元の行列式を、N-1次元の行列式に分解していく
					var D = [];
					var a = x[i][0];
					for(var row = 0, D_low = 0; row < x.length; row++) {
						if(i === row) {
							continue;
						}
						D[D_low] = [];
						for(var col = 1, D_col = 0; col < x.length; col++, D_col++) {
							D[D_low][D_col] = x[row][col];
						}
						D_low++;
					}
					if((i % 2) === 0) {
						y = y.add(a.mul(calcDet(D)));
					}
					else {
						y = y.sub(a.mul(calcDet(D)));
					}
				}
				return y;
			};
			return new Matrix(calcDet(M.matrix_array));
		}
		else {
			// サイズが大きい場合は、lu分解を利用する
			var lup = LinearAlgebra.lup(M);
			var exchange_count = (len - lup.P.diag().sum().scalar.real) / 2;
			// 上行列の対角線上の値を掛け算する
			var y = lup.U.diag().prod();
			if((exchange_count % 2) === 1) {
				y = y.negate();
			}
			return new Matrix(y);
		}
	};

	/**
		 * LUP分解
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
		 */
	LinearAlgebra.lup = function lup (mat) {
		var A = new Matrix(mat);
		var L = Matrix.zeros(A.row_length);
		var U = A;
		var P = Matrix.eye(A.row_length);
		var l = L.matrix_array;
		var u = U.matrix_array;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(var k = 0; k < A.column_length; k++) {
			// ピポットの選択
			var pivot = (void 0);
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var max_row_number = LinearAlgebraTool.getMaxRowNumber(U, k, k);
				pivot = max_row_number.index;
				if(max_row_number.max === 0.0) {
					continue;
				}
				//交換を行う
				if(k !== pivot) {
					L._exchangeRow(k, pivot);
					U._exchangeRow(k, pivot);
					P._exchangeRow(k, pivot);
				}
			}
			// 消去
			for(var row = k + 1;row < A.row_length; row++) {
				var temp = u[row][k].div(u[k][k]);
				l[row][k] = temp;
				//lの値だけ行交換が必要？
				for(var col = k; col < A.column_length; col++) {
					u[row][col] = u[row][col].sub(u[k][col].mul(temp));
				}
			}
		}
		L._resize(A.row_length, Math.min(A.row_length, A.column_length));
		U._resize(Math.min(A.row_length, A.column_length), A.column_length);
		// L の対角線に1を代入
		L._each(function(num, row, col) {
			return row === col ? Complex.ONE : num;
		});
		return {
			L : L,
			U : U,
			P : P
		};
	};

	/**
		 * LU分解
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{L: Matrix, U: Matrix}} L*U=A
		 */
	LinearAlgebra.lu = function lu (mat) {
		var lup = LinearAlgebra.lup(mat);
		var L = lup.P.T().mul(lup.L);
		return {
			L : L,
			U : lup.U
		};
	};

	/**
		 * 連立一次方程式を解く
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
		 * @returns {Matrix} Ax=B となる x
		 * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
		 */
	LinearAlgebra.linsolve = function linsolve (mat, number) {
		var A = Matrix._toMatrix(mat);
		var B = Matrix._toMatrix(number);
		if(!A.isSquare()) {
			throw "Matrix size does not match";
		}
		// 連立一次方程式を解く
		var arg = B;
		if((B.row_length !== A.row_length) || (B.column_length > 1)) {
			throw "Matrix size does not match";
		}
		// 行列を準備する
		var M = new Matrix(A);
		M._concatRight(arg);
		var long_matrix_array = M.matrix_array;
		var long_length = M.column_length;
		var len = A.column_length;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(var k = 0; k < (len - 1); k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				var normalize_value = long_matrix_array[k][k].inv();
				for(var row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(var row$1 = k + 1;row$1 < len; row$1++) {
				var temp = long_matrix_array[row$1][k];
				for(var col$1 = k; col$1 < long_length; col$1++) {
					long_matrix_array[row$1][col$1] = long_matrix_array[row$1][col$1].sub(long_matrix_array[k][col$1].mul(temp));
				}
			}
		}
		//後退代入
		var y = new Array(len);
		y[len - 1] = long_matrix_array[len - 1][len].div(long_matrix_array[len - 1][len - 1]);
		for(var row$2 = len - 2; row$2 >= 0; row$2--) {
			y[row$2] = long_matrix_array[row$2][long_length - 1];
			for(var j = row$2 + 1; j < len; j++) {
				y[row$2] = y[row$2].sub(long_matrix_array[row$2][j].mul(y[j]));
			}
			y[row$2] = y[row$2].div(long_matrix_array[row$2][row$2]);
		}
		var y2 = new Array(A.row_length);
		for(var row$3 = 0; row$3 < A.row_length; row$3++) {
			y2[row$3] = [y[row$3]];
		}

		return new Matrix(y2);
	};

	/**
		 * QR分解
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{Q: Matrix, R: Matrix}}  Q*R=A, Qは正規直行行列、Rは上三角行列
		 */
	LinearAlgebra.qr = function qr (mat) {
		// 行列を準備する
		var M = new Matrix(mat);
		// 作成後のQとRのサイズ
		var Q_row_length = M.row_length;
		var Q_column_length = M.row_length;
		var R_row_length = M.row_length;
		var R_column_length = M.column_length;
		// 計算時の行と列のサイズ
		var dummy_size = Math.max(M.row_length, M.column_length);
		// 正方行列にする
		M._resize(dummy_size, dummy_size);
		// 正規直行化
		var orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M);
		// 計算したデータを取得
		var Q_Matrix = orthogonal_matrix.Q;
		var R_Matrix = orthogonal_matrix.R;
		var non_orthogonalized = orthogonal_matrix.non_orthogonalized;

		// Qのサイズを成型する
		if(non_orthogonalized.length === M.row_length) {
			// 零行列の場合の特別処理
			Q_Matrix = Matrix.eye(M.row_length);
		}
		else if(non_orthogonalized.length !== 0) {
			// 一部、直行化できていない列があるため直行化できてない列以外を抽出
			var map = {};
			for(var i = 0; i < non_orthogonalized.length; i++) {
				map[non_orthogonalized[i]] = 1;
			}
			var orthogonalized = [];
			for(var i$1 = 0; i$1 < dummy_size; i$1++) {
				if(map[i$1]) {
					continue;
				}
				var array = [];
				for(var j = 0; j < dummy_size; j++) {
					array[j] = Q_Matrix.matrix_array[j][i$1];
				}
				orthogonalized.push(array);
			}
			// 直行ベクトルを作成する
			var orthogonal_vector = LinearAlgebraTool.createOrthogonalVector(orthogonalized);
			// 直行化できていない列を差し替える
			for(var i$2 = 0; i$2 < non_orthogonalized.length; i$2++) {
				var q_col = non_orthogonalized[i$2];
				for(var j$1 = 0; j$1 < dummy_size; j$1++) {
					Q_Matrix.matrix_array[j$1][q_col] = orthogonal_vector.matrix_array[i$2][j$1];
				}
			}
		}
		Q_Matrix._resize(Q_row_length, Q_column_length);
		// Rのサイズを成形する
		R_Matrix._resize(R_row_length, R_column_length);
		return {
			Q : Q_Matrix,
			R : R_Matrix
		};
	};

	/**
		 * 対称行列の三重対角化
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
		 */
	LinearAlgebra.tridiagonalize = function tridiagonalize (mat) {
		var M = new Matrix(mat);
		if(!M.isSquare()) {
			throw "not square matrix";
		}
		if(!M.isSymmetric()) {
			throw "not Symmetric";
		}
		if(M.isComplex()) {
			throw "not Real Matrix";
		}
		return LinearAlgebraTool.tridiagonalize(M);
	};

	/**
		 * 対称行列の固有値分解
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
		 * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
		 */
	LinearAlgebra.eig = function eig (mat) {
		var M = new Matrix(mat);
		if(!M.isSquare()) {
			throw "not square matrix";
		}
		if(!M.isSymmetric()) {
			throw "not Symmetric";
		}
		if(M.isComplex()) {
			throw "not Real Matrix";
		}
		return LinearAlgebraTool.eig(M);
	};

	/**
		 * 特異値分解
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
		 */
	LinearAlgebra.svd = function svd (mat) {
		var M = new Matrix(mat);
		if(M.isComplex()) {
			// 複素数が入っている場合は、eig関数が使用できないので非対応
			throw "Unimplemented";
		}
		var rank = LinearAlgebra.rank(M);
		// SVD分解
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.
		var VD = LinearAlgebra.eig(M.T().mul(M));
		var sigma = Matrix.zeros(M.row_length, M.column_length);
		sigma._each(function(num, row, col) {
			if((row === col) && (row < rank)) {
				return VD.D.getComplex(row, row).sqrt();
			}
		});
		var s_size = Math.min(M.row_length, M.column_length);
		var sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				var x = sigma.matrix_array[row][row];
				if(x.isZero()) {
					return Complex.ZERO;
				}
				else {
					return x.inv();
				}
			}
			else {
				return Complex.ZERO;
			}
		}, s_size);
		var V_rank = VD.V.resize(VD.V.row_length, s_size);
		var u = M.mul(V_rank).mul(sing);
		var QR = LinearAlgebra.qr(u);
		return {
			U : QR.Q,
			S : sigma,
			V : VD.V
		};
	};

	/**
		 * 逆行列
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {Matrix} A^-1
		 */
	LinearAlgebra.inv = function inv (mat) {
		var X = new Matrix(mat);
		if(X.isScalar()) {
			return new Matrix(Complex.ONE.div(X.scalar));
		}
		if(!X.isSquare()) {
			throw "not square";
		}
		if(X.isDiagonal()) {
			// 対角行列の場合は、対角成分のみ逆数をとる
			var y$1 = X.T();
			var size = Math.min(y$1.row_length, y$1.column_length);
			for(var i = 0; i < size; i++) {
				y$1.matrix_array[i][i] = y$1.matrix_array[i][i].inv();
			}
			return y$1;
		}
		// (ここで正規直交行列の場合なら、転置させるなど入れてもいい？判定はできないけども)
		var len = X.column_length;
		// ガウス・ジョルダン法
		// 初期値の設定
		var M = new Matrix(X);
		M._concatRight(Matrix.eye(len));
		var long_matrix_array = M.matrix_array;
		var long_length = M.column_length;

		//前進消去
		for(var k = 0; k < len; k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				var normalize_value = long_matrix_array[k][k].inv();
				for(var row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(var row$1 = 0;row$1 < len; row$1++) {
				if(row$1 === k) {
					continue;
				}
				var temp = long_matrix_array[row$1][k];
				for(var col$1 = k; col$1 < long_length; col$1++)
				{
					long_matrix_array[row$1][col$1] = long_matrix_array[row$1][col$1].sub(long_matrix_array[k][col$1].mul(temp));
				}
			}
		}

		var y = new Array(len);
		//右の列を抜き取る
		for(var row$2 = 0; row$2 < len; row$2++) {
			y[row$2] = new Array(len);
			for(var col$2 = 0; col$2 < len; col$2++) {
				y[row$2][col$2] = long_matrix_array[row$2][len + col$2];
			}
		}

		return new Matrix(y);
	};

	/**
		 * 疑似逆行列
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {Matrix} A^+
		 */
	LinearAlgebra.pinv = function pinv (mat) {
		var M = new Matrix(mat);
		var USV = LinearAlgebra.svd(M);
		var U = USV.U;
		var S = USV.S;
		var V = USV.V;
		var sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				var x = S.matrix_array[row][row];
				if(x.isZero()) {
					return Complex.ZERO;
				}
				else {
					return x.inv();
				}
			}
			else {
				return Complex.ZERO;
			}
		}, M.column_length, M.row_length);
		return V.mul(sing).mul(U.T());
	};

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
	 * 実数専用の統計処理用の関数集
	 * @ignore
	 */
	var StatisticsTool = function StatisticsTool () {};

	StatisticsTool.gammaln = function gammaln (x) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		var LOG_2PI = Math.log(2.0 * Math.PI);
		//ベルヌーイ数
		//http://fr.wikipedia.org/wiki/Nombre_de_Bernoulli
		var K2 = ( 1.0 / 6.0)				/ (2 * 1);
		var K4 = (-1.0 / 30.0)			/ (4 * 3);
		var K6 = ( 1.0 / 42.0)			/ (6 * 5);
		var K8 = (-1.0 / 30.0)			/ (8 * 7);
		var K10 = ( 5.0 / 66.0)			/ (10 * 9);
		var K12 = (-691.0 / 2730.0)		/ (12 * 11);
		var K14 = ( 7.0 / 6.0)			/ (14 * 13);
		var K16 = (-3617.0 / 510.0)		/ (16 * 15);
		var K18 = (43867.0 / 798.0)		/ (18 * 17);
		var K20 = (-174611.0 / 330.0)		/ (20 * 19);
		var K22 = (854513.0 / 138.0)		/ (22 * 21);
		var K24 = (-236364091.0 / 2730.0)	/ (24 * 23);
		var K26 = (8553103.0 / 6.0)		/ (26 * 25);
		var K28 = (-23749461029.0 / 870.0)/ (28 * 27);
		var K30 = (8615841276005.0 / 14322.0)/ (30 * 29);
		var K32 = (-7709321041217.0 / 510.0)/ (32 * 31);
		var LIST = [
			K32, K30, K28, K26, K24, K22, K20, K18,
			K16, K14, K12, K10, K8, K6, K4, K2
		];
		var v = 1;
		var lx = x;
		while(lx < LIST.length) {
			v *= lx;
			lx++;
		}
		var w = 1 / (lx * lx);
		var y = LIST[0];
		for(var i = 1; i < LIST.length; i++) {
			y *= w;
			y += LIST[i];
		}
		y /= lx;
		y += 0.5 * LOG_2PI;
		y += - Math.log(v) - lx + (lx - 0.5) * Math.log(lx);
		return(y);
	};

	/**
		 * q_gamma(x, a, gammaln_a) 不完全ガンマ関数 上側
		 * @param {number} x
		 * @param {number} a
		 * @param {number} gammaln_a
		 * @returns {number}
		 */
	StatisticsTool.q_gamma = function q_gamma (x, a, gammaln_a) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		var k;
		var result, w, temp, previous;
		// Laguerreの多項式
		var la = 1.0, lb = 1.0 + x - a;
		if(x < 1.0 + a) {
			return (1 - StatisticsTool.p_gamma(x, a, gammaln_a));
		}
		w = Math.exp(a * Math.log(x) - x - gammaln_a);
		result = w / lb;
		for(k = 2; k < 1000; k++) {
			temp = ((k - 1.0 - a) * (lb - la) + (k + x) * lb) / k;
			la = lb;
			lb = temp;
			w *= (k - 1.0 - a) / k;
			temp = w / (la * lb);
			previous = result;
			result += temp;
			if(result == previous) {
				return(result);
			}
		}
		return Number.NaN;
	};

	/**
		 * p_gamma(x, a, gammaln_a) 不完全ガンマ関数 下側
		 * @param {number} x
		 * @param {number} a
		 * @param {number} gammaln_a
		 * @returns {number}
		 */
	StatisticsTool.p_gamma = function p_gamma (x, a, gammaln_a) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		var k;
		var result, term, previous;
		if(x >= 1.0 + a) {
			return (1.0 - StatisticsTool.q_gamma(x, a, gammaln_a));
		}
		if(x === 0.0) {
			return 0.0;
		}
		result = term = Math.exp(a * Math.log(x) - x - gammaln_a) / a;
		for(k = 1; k < 1000; k++) {
			term *= x / (a + k);
			previous = result;
			result += term;
			if(result == previous) {
				return result;
			}
		}
		return Number.NaN;
	};

	/**
		 * gamma(z) ガンマ関数
		 * @param {number} z
		 * @returns {number}
		 */
	StatisticsTool.gamma = function gamma (z) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		if(z < 0) {
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(StatisticsTool.gammaln(1.0 - z))));
		}
		return Math.exp(StatisticsTool.gammaln(z));
	};

	/**
		 * gammainc(x, a, tail) 不完全ガンマ関数
		 * @param {number} x
		 * @param {number} a
		 * @param {string} [tail="lower"] lower(デフォルト)/upper
		 * @returns {number}
		 */
	StatisticsTool.gammainc = function gammainc (x, a, tail) {
		if(tail === "lower") {
			return StatisticsTool.p_gamma(x, a, StatisticsTool.gammaln(a));
		}
		else if(tail === "upper") {
			return StatisticsTool.q_gamma(x, a, StatisticsTool.gammaln(a));
		}
		else if(arguments.length === 2) {
			// 引数を省略した場合
			return StatisticsTool.gammainc(x, a, "lower");
		}
		else {
			throw "gammainc unsupported argument [" + tail + "]";
		}
	};
		
	/**
		 * gampdf(x, k, s) ガンマ分布の確率密度関数
		 * @param {number} x
		 * @param {number} k - 形状母数
		 * @param {number} s - 尺度母数
		 * @returns {number}
		 */
	StatisticsTool.gampdf = function gampdf (x, k, s) {
		var y = 1.0 / (StatisticsTool.gamma(k) * Math.pow(s, k));
		y *= Math.pow( x, k - 1);
		y *= Math.exp( - x / s );
		return y;
	};

	/**
		 * gamcdf(x, k, s) ガンマ分布の累積分布関数
		 * @param {number} x
		 * @param {number} k - 形状母数
		 * @param {number} s - 尺度母数
		 * @returns {number}
		 */
	StatisticsTool.gamcdf = function gamcdf (x, k, s) {
		return StatisticsTool.gammainc(x / s, k);
	};
		
	/**
		 * gaminv(p, k, s) ガンマ分布の累積分布関数の逆関数
		 * @param {number} p
		 * @param {number} k - 形状母数
		 * @param {number} s - 尺度母数
		 * @returns {number}
		 */
	StatisticsTool.gaminv = function gaminv (p, k, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		var eps = 1.0e-12;
		// 初期値を決める
		var y = k * s;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		var delta, y2;
		for(var i = 0; i < 100; i++) {
			y2 = y - ((StatisticsTool.gamcdf(y, k, s) - p) / StatisticsTool.gampdf(y, k, s));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
			if(y < 0.0) {
				y = eps;
			}
		}
		return y;
	};

	/**
		 * beta(x, y) ベータ関数
		 * @param {number} x
		 * @param {number} y
		 * @returns {number}
		 */
	StatisticsTool.beta = function beta (x, y) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		return (Math.exp(StatisticsTool.gammaln(x) + StatisticsTool.gammaln(y) - StatisticsTool.gammaln(x + y)));
	};
		
	/**
		 * p_beta(x, a, b) 不完全ベータ関数 下側
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	StatisticsTool.p_beta = function p_beta (x, a, b) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p231,技術評論社,1991
		var k;
		var result, term, previous;
		if(a <= 0.0) {
			return Number.POSITIVE_INFINITY;
		}
		if(b <= 0.0) {
			if(x < 1.0) {
				return 0.0;
			}
			else if(x === 1.0) {
				return 1.0;
			}
			else {
				return Number.POSITIVE_INFINITY;
			}
		}
		if(x > (a + 1.0) / (a + b + 2.0)) {
			return (1.0 - StatisticsTool.p_beta(1.0 - x, b, a));
		}
		if(x <= 0.0) {
			return 0.0;
		}
		term = a * Math.log(x);
		term += b * Math.log(1.0 - x);
		term += StatisticsTool.gammaln(a + b);
		term -= StatisticsTool.gammaln(a) + StatisticsTool.gammaln(b);
		term = Math.exp(term);
		term /= a;
		result = term;
		for(k = 1; k < 1000; k++) {
			term *= a + b + k - 1.0;
			term *= x;
			term /= a + k;
			previous = result;
			result += term;
			if(result === previous) {
				return result;
			}
		}
		return Number.NaN;
	};

	/**
		 * q_beta(x, a, b) 不完全ベータ関数 上側
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	StatisticsTool.q_beta = function q_beta (x, a, b) {
		return (1.0 - StatisticsTool.p_beta(x, a, b));
	};

	/**
		 * betainc(x, a, b, tail) 不完全ベータ関数
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @param {string} [tail="lower"] {string} lower(デフォルト)/upper
		 * @returns {number}
		 */
	StatisticsTool.betainc = function betainc (x, a, b, tail) {
		if(tail === "lower") {
			return StatisticsTool.p_beta(x, a, b);
		}
		else if(tail === "upper") {
			return StatisticsTool.q_beta(x, a, b);
		}
		else if(arguments.length === 3) {
			// 引数を省略した場合
			return StatisticsTool.betainc(x, a, b, "lower");
		}
		else {
			throw "betainc unsupported argument [" + tail + "]";
		}
	};
		
	/**
		 * isInteger(x) xが整数かどうか
		 * @param {number} x
		 * @returns {boolean}
		 */
	StatisticsTool.isInteger = function isInteger (x) {
		return (x - (x | 0) !== 0.0);
	};
		
	/**
		 * betapdf(x, a, b) ベータ分布の確率密度関数
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	StatisticsTool.betapdf = function betapdf (x, a, b) {
		// powの計算結果が複素数になる場合は計算を行わない
		if(
			((x < 0) && (StatisticsTool.isInteger(b - 1))) ||
			((1 - x < 0) && (StatisticsTool.isInteger(b - 1)))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / StatisticsTool.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / StatisticsTool.beta(a,  b));
	};

	/**
		 * betacdf(x, a, b) ベータ分布の累積分布関数
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	StatisticsTool.betacdf = function betacdf (x, a, b) {
		return StatisticsTool.betainc(x, a, b);
	};
		
	/**
		 * betainv(p, a, b) ベータ分布の累積分布関数の逆関数
		 * @param {number} p
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	StatisticsTool.betainv = function betainv (p, a, b) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if((p == 0.0) && (a > 0.0) && (b > 0.0)) {
			return 0.0;
		}
		else if((p == 1.0) && (a > 0.0) && (b > 0.0)) {
			return 1.0;
		}
		var eps = 1.0e-14;
		// 初期値を決める
		var y;
		if(b == 0) {
			y = 1.0 - eps;
		}
		else if(a == 0) {
			y = eps;
		}
		else {
			y = a / (a + b);
		}
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		var delta, y2;
		for(var i = 0; i < 100; i++) {
			y2 = y - ((StatisticsTool.betacdf(y, a, b) - p) / StatisticsTool.betapdf(y, a, b));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
			if(y > 1.0) {
				y = 1.0 - eps;
			}
			else if(y < 0.0) {
				y = eps;
			}
		}
		return y;
	};

	/**
		 * factorial(n) = n! 階乗関数
		 * @param {number} n
		 * @returns {number}
		 */
	StatisticsTool.factorial = function factorial (n) {
		var y = StatisticsTool.gamma(n + 1.0);
		if((n | 0) === n) {
			return Math.round(y);
		}
		else {
			return y;
		}
	};

	/**
		 * nchoosek(n, k) = nCk 二項係数またはすべての組合わせ
		 * @param {number} n
		 * @param {number} k
		 * @returns {number} nCk
		 */
	StatisticsTool.nchoosek = function nchoosek (n, k) {
		return (Math.round(StatisticsTool.factorial(n) / (StatisticsTool.factorial(n - k) * StatisticsTool.factorial(k))));
	};

	/**
		 * erf(x) 誤差関数
		 * @param {number} x
		 * @returns {number}
		 */
	StatisticsTool.erf = function erf (x) {
		return (StatisticsTool.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	};

	/**
		 * erfc(x) 相補誤差関数
		 * @param {number} x
		 * @returns {number}
		 */
	StatisticsTool.erfc = function erfc (x) {
		return 1.0 - StatisticsTool.erf(x);
	};

	/**
			 erfinv(p) 誤差逆関数
			 @param_ {number} p
			 @returns_ {number}
			
		static erfinv(p) {
			if((p < 0.0) || (p > 1.0)) {
				return Number.NaN;
			}
			else if(p == 0.0) {
				return Number.NEGATIVE_INFINITY;
			}
			else if(p == 1.0) {
				return Number.POSITIVE_INFINITY;
			}
			let y = 0;
			const c = [];
			for(let k = 0; k < 100; k++) {
				let ck = 0;
				if(0 === k) {
					ck = 1;
				}
				else {
					for(let m = 0; m < k; m++) {
						ck += c[m] * c[k - 1 - m] / ((m + 1) * (2 * m + 1));
					}
				}
				c.push(ck);
				console.log(y + "\t" + ck / (2 * k + 1) + "\t" + Math.pow(Math.sqrt(Math.PI) * 0.5 * p, 2 * k + 1))
				y += ck / (2 * k + 1) * Math.pow(Math.sqrt(Math.PI) * 0.5 * p, 2 * k + 1);
			}
			return y;
			// 0.5 * Math.sqrt(Math.PI) = 0.8862269254527579
			// Math.PI / 12 = 0.2617993877991494
			// 7 * Math.pow(Math.PI, 2) / 480 = 0.14393173084921979
			// 127 * Math.pow(Math.PI, 3) / 40320 = 0.09766361950392055
			// 4369 * Math.pow(Math.PI, 4) / 5806080 = 0.07329907936638086
			// 34807 * Math.pow(Math.PI, 5) / 182476800 = 0.05837250087858452
			return (p
				+ 0.2617993877991494 * Math.pow(p, 3)
				+ 0.14393173084921979 * Math.pow(p, 5)
				+ 0.09766361950392055 * Math.pow(p, 7)
				+ 0.07329907936638086 * Math.pow(p, 9)
				+ 0.05837250087858452 * Math.pow(p, 11)
			) * 0.8862269254527579;
		}
	*/

	/**
		 * normpdf(x, u, s) 正規分布の確率密度関数
		 * @param {number} x
		 * @param {number} [u=0.0] - 平均値
		 * @param {number} [s=1.0] - 分散
		 * @returns {number}
		 */
	StatisticsTool.normpdf = function normpdf (x, u, s) {
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		var y = 1.0 / Math.sqrt( 2.0 * Math.PI * s_ * s_ );
		y *= Math.exp( - (x - u_) * (x - u_) / (2.0 * s_ * s_));
		return y;
	};

	/**
		 * normcdf(x, u, s) 正規分布の累積分布関数
		 * @param {number} x
		 * @param {number} [u=0.0] - 平均値
		 * @param {number} [s=1.0] - 分散
		 * @returns {number}
		 */
	StatisticsTool.normcdf = function normcdf (x, u, s) {
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		return (1.0 + StatisticsTool.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
	};

	/**
		 * norminv(p, u, s) 正規分布の累積分布関数の逆関数
		 * @param {number} p - 確率
		 * @param {number} [u=0.0] - 平均値
		 * @param {number} [s=1.0] - 分散
		 * @returns {number}
		 */
	StatisticsTool.norminv = function norminv (p, u, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		var eps = 1.0e-12;
		// 初期値を決める
		var y = u_;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		var delta, y2;
		for(var i = 0; i < 200; i++) {
			y2 = y - ((StatisticsTool.normcdf(y, u_, s_) - p) / StatisticsTool.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	};

	/**
		 * tpdf(t, k) t分布の確率密度関数
		 * @param {number} t - t値
		 * @param {number} v - 自由度
		 * @returns {number}
		 */
	StatisticsTool.tpdf = function tpdf (t, v) {
		var y = 1.0 / (Math.sqrt(v) * StatisticsTool.beta(0.5, v * 0.5));
		y *= Math.pow( 1 + t * t / v, - (v + 1) * 0.5);
		return y;
	};

	/**
		 * tcdf(t) t分布の累積分布関数
		 * @param {number} t - t値
		 * @param {number} v - 自由度
		 * @returns {number}
		 */
	StatisticsTool.tcdf = function tcdf (t, v) {
		var y = (t * t) / (v + t * t) ;
		var p = StatisticsTool.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
		return 0.5 * (1 + p);
	};

	/**
		 * tinv(p, v) t分布の累積分布関数の逆関数
		 * @param {number} p - 確率
		 * @param {number} v - 自由度
		 * @returns {number}
		 */
	StatisticsTool.tinv = function tinv (p, v) {
		if((p < 0) || (p > 1)) {
			return Number.NaN;
		}
		if(p == 0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1) {
			return Number.POSITIVE_INFINITY;
		}
		else if(p < 0.5) {
			var y = StatisticsTool.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			var y$1 = StatisticsTool.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
			return Math.sqrt(v / y$1 - v);
		}
	};

	/**
		 * tdist(t, v, tails) 尾部が指定可能なt分布の累積分布関数
		 * @param {number} t - t値
		 * @param {number} v - 自由度
		 * @param {number} tails - 尾部(1...片側、2...両側)
		 * @returns {number}
		 */
	StatisticsTool.tdist = function tdist (t, v, tails) {
		return (1.0 - StatisticsTool.tcdf(t, v)) * tails;
	};

	/**
		 * tinv2(p, v) 両側検定時のt分布の累積分布関数
		 * @param {number} p - 確率
		 * @param {number} v - 自由度
		 * @returns {number}
		 */
	StatisticsTool.tinv2 = function tinv2 (p, v) {
		return - StatisticsTool.tinv( p * 0.5, v);
	};

	/**
		 * chi2pdf(x, v) カイ二乗分布の確率密度関数
		 * @param {number} x 
		 * @param {number} k - 自由度
		 * @returns {number}
		 */
	StatisticsTool.chi2pdf = function chi2pdf (x, k) {
		if(x < 0.0) {
			return 0;
		}
		else if(x === 0.0) {
			return 0.5;
		}
		var y = Math.pow(x, k / 2.0 - 1.0) * Math.exp( - x / 2.0 );
		y /= Math.pow(2, k / 2.0) * StatisticsTool.gamma( k / 2.0);
		return y;
	};

	/**
		 * chi2cdf(x, v) カイ二乗分布の累積分布関数
		 * @param {number} x 
		 * @param {number} k - 自由度
		 * @returns {number}
		 */
	StatisticsTool.chi2cdf = function chi2cdf (x, k) {
		return StatisticsTool.gammainc(x / 2.0, k / 2.0);
	};

	/**
		 * chi2inv(p, v) カイ二乗分布の逆累積分布関数
		 * @param {number} p - 確率
		 * @param {number} k - 自由度
		 * @returns {number}
		 */
	StatisticsTool.chi2inv = function chi2inv (p, k) {
		return StatisticsTool.gaminv(p, k / 2.0, 2);
	};

	/**
		 * fpdf(x, d1, d2) F分布の確率密度関数
		 * @param {number} x
		 * @param {number} d1 - 分子の自由度
		 * @param {number} d2 - 分母の自由度
		 * @returns {number}
		 */
	StatisticsTool.fpdf = function fpdf (x, d1, d2) {
		if((d1 < 0) || (d2 < 0)) {
			return Number.NaN;
		}
		else if(x <= 0) {
			return 0.0;
		}
		var y = 1.0;
		y *= Math.pow( (d1 * x) / (d1 * x + d2) , d1 / 2.0);
		y *= Math.pow( 1.0 - ((d1 * x) / (d1 * x + d2)), d2 / 2.0);
		y /= x * StatisticsTool.beta(d1 / 2.0, d2 / 2.0);
		return y;
	};

	/**
		 * fcdf(x, d1, d2) F分布の累積分布関数
		 * @param {number} x
		 * @param {number} d1 - 分子の自由度
		 * @param {number} d2 - 分母の自由度
		 * @returns {number}
		 */
	StatisticsTool.fcdf = function fcdf (x, d1, d2) {
		return StatisticsTool.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	};

	/**
		 * finv(p, d1, d2) F分布の累積分布関数の逆関数
		 * @param {number} p - 確率
		 * @param {number} d1 - 分子の自由度
		 * @param {number} d2 - 分母の自由度
		 * @returns {number}
		 */
	StatisticsTool.finv = function finv (p, d1, d2) {
		return (1.0 / StatisticsTool.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	};

	/**
	 * 文字列か判定
	 * @param text 
	 * @ignore
	 */
	var isStr = function(text) {
		return (text && (typeof text === "string" || text instanceof String));
	};

	/**
	 * Complexクラスから利用する統計処理関数集
	 * @ignore
	 */
	var StatisticsComplex = function StatisticsComplex () {};

	StatisticsComplex.gammaln = function gammaln (x) {
		return new Complex(StatisticsTool.gammaln(Complex._toDouble(x)));
	};
		
	/**
		 * gamma(z) ガンマ関数 
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} z
		 * @returns {Complex}
		 */
	StatisticsComplex.gamma = function gamma (z) {
		return new Complex(StatisticsTool.gamma(Complex._toDouble(z)));
	};
		
	/**
		 * gammainc(x, a, tail) 不完全ガンマ関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {string} [tail="lower"] - lower/upper
		 * @returns {Complex}
		 */
	StatisticsComplex.gammainc = function gammainc (x, a, tail) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.gammainc(X, a_, tail_));
	};

	/**
		 * gampdf(x, k, s) ガンマ分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 形状母数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - 尺度母数
		 * @returns {Complex}
		 */
	StatisticsComplex.gampdf = function gampdf (x, k, s) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gampdf(X, k_, s_));
	};

	/**
		 * gamcdf(x, k, s) ガンマ分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 形状母数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - 尺度母数
		 * @returns {Complex}
		 */
	StatisticsComplex.gamcdf = function gamcdf (x, k, s) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gamcdf(X, k_, s_));
	};

	/**
		 * gaminv(p, k, s) ガンマ分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 形状母数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - 尺度母数
		 * @returns {Complex}
		 */
	StatisticsComplex.gaminv = function gaminv (p, k, s) {
		var p_ = Complex._toDouble(p);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gaminv(p_, k_, s_));
	};

	/**
		 * beta(x, y) ベータ関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} y
		 * @returns {Complex}
		 */
	StatisticsComplex.beta = function beta (x, y) {
		var X = Complex._toDouble(x);
		var y_ = Complex._toDouble(y);
		return new Complex(StatisticsTool.beta(X, y_));
	};

	/**
		 * betainc(x, a, b, tail) 不完全ベータ関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @param {string} [tail="lower"] lower/upper
		 * @returns {Complex}
		 */
	StatisticsComplex.betainc = function betainc (x, a, b, tail) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		var tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.betainc(X, a_, b_, tail_));
	};

	/**
		 * betapdf(x, a, b) ベータ分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	StatisticsComplex.betapdf = function betapdf (x, a, b) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betapdf(X, a_, b_));
	};

	/**
		 * betacdf(x, a, b) ベータ分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	StatisticsComplex.betacdf = function betacdf (x, a, b) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betacdf(X, a_, b_));
	};

	/**
		 * betainv(p, a, b) ベータ分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	StatisticsComplex.betainv = function betainv (p, a, b) {
		var p_ = Complex._toDouble(p);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betainv(p_, a_, b_));
	};

	/**
		 * factorial(n), n! 階乗関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} n
		 * @returns {Complex}
		 */
	StatisticsComplex.factorial = function factorial (n) {
		return new Complex(StatisticsTool.factorial(Complex._toDouble(n)));
	};

	/**
		 * nchoosek(n, k), nCk 二項係数またはすべての組合わせ
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} n
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k
		 * @returns {Complex}
		 */
	StatisticsComplex.nchoosek = function nchoosek (n, k) {
		var n_ = Complex._toDouble(n);
		var k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.nchoosek(n_, k_));
	};
		
	/**
		 * erf(x) 誤差関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @returns {Complex}
		 */
	StatisticsComplex.erf = function erf (x) {
		var X = Complex._toDouble(x);
		return new Complex(StatisticsTool.erf(X));
	};

	/**
		 * erfc(x) 相補誤差関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @returns {Complex}
		 */
	StatisticsComplex.erfc = function erfc (x) {
		var X = Complex._toDouble(x);
		return new Complex(StatisticsTool.erfc(X));
	};

	/**
		 * normpdf(x, u, s) 正規分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - 平均値
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - 分散
		 * @returns {Complex}
		 */
	StatisticsComplex.normpdf = function normpdf (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(StatisticsTool.normpdf(X, u_, s_));
	};

	/**
		 * normcdf(x, u, s) 正規分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - 平均値
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - 分散
		 * @returns {Complex}
		 */
	StatisticsComplex.normcdf = function normcdf (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(StatisticsTool.normcdf(X, u_, s_));
	};

	/**
		 * norminv(x, u, s) 正規分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - 平均値
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - 分散
		 * @returns {Complex}
		 */
	StatisticsComplex.norminv = function norminv (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(StatisticsTool.norminv(X, u_, s_));
	};
		
	/**
		 * tpdf(x, v) t分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.tpdf = function tpdf (x, v) {
		var X = Complex._toDouble(x);
		var v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tpdf(X, v_));
	};

	/**
		 * tcdf(t, v) t分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} t
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.tcdf = function tcdf (t, v) {
		var t_ = Complex._toDouble(t);
		var v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tcdf(t_, v_));
	};

	/**
		 * tinv(p, v) t分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.tinv = function tinv (p, v) {
		var p_ = Complex._toDouble(p);
		var v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tinv(p_, v_));
	};

	/**
		 * tdist(t, v, tails) 尾部が指定可能なt分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} t
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - 自由度
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} tails - 尾部(1...片側、2...両側)
		 * @returns {Complex}
		 */
	StatisticsComplex.tdist = function tdist (t, v, tails) {
		var t_ = Complex._toDouble(t);
		var v_ = Complex._toDouble(v);
		var tails_ = Complex._toInteger(tails);
		return new Complex(StatisticsTool.tdist(t_, v_, tails_));
	};

	/**
		 * tinv2(p, v) 両側検定時のt分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.tinv2 = function tinv2 (p, v) {
		var p_ = Complex._toDouble(p);
		var v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tinv2(p_, v_));
	};

	/**
		 * chi2pdf(x, k) カイ二乗分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.chi2pdf = function chi2pdf (x, k) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.chi2pdf(X, k_));
	};

	/**
		 * chi2cdf(x, k) カイ二乗分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.chi2cdf = function chi2cdf (x, k) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.chi2cdf(X, k_));
	};

	/**
		 * chi2inv(p, k) カイ二乗分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - 自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.chi2inv = function chi2inv (p, k) {
		var p_ = Complex._toDouble(p);
		var k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.chi2inv(p_, k_));
	};

	/**
		 * fpdf(x, d1, d2) F分布の確率密度関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - 分子の自由度
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - 分母の自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.fpdf = function fpdf (x, d1, d2) {
		var X = Complex._toDouble(x);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.fpdf(X, d1_, d2_));
	};

	/**
		 * fcdf(x, d1, d2) F分布の累積分布関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - 分子の自由度
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - 分母の自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.fcdf = function fcdf (x, d1, d2) {
		var X = Complex._toDouble(x);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.fcdf(X, d1_, d2_));
	};

	/**
		 * finv(p, d1, d2) F分布の累積分布関数の逆関数
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - 分子の自由度
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - 分母の自由度
		 * @returns {Complex}
		 */
	StatisticsComplex.finv = function finv (p, d1, d2) {
		var p_ = Complex._toDouble(p);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.finv(p_, d1_, d2_));
	};

	/**
	 * Matrix用の統計処理用の計算クラス
	 */
	var Statistics = function Statistics () {};

	Statistics.gammaln = function gammaln (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammaln(num);
		});
	};

	/**
		 * ガンマ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Statistics.gamma = function gamma (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamma(num);
		});
	};

	/**
		 * 不完全ガンマ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {string} [tail="lower"] - lower/upper
		 * @returns {Matrix}
		 */
	Statistics.gammainc = function gammainc (x, a, tail) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammainc(num, a_, tail_);
		});
	};

	/**
		 * ガンマ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Statistics.gampdf = function gampdf (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gampdf(num, k_, s_);
		});
	};

	/**
		 * ガンマ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Statistics.gamcdf = function gamcdf (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamcdf(num, k_, s_);
		});
	};

	/**
		 * ガンマ分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Statistics.gaminv = function gaminv (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gaminv(num, k_, s_);
		});
	};

	/**
		 * ベータ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
		 * @returns {Matrix}
		 */
	Statistics.beta = function beta (x, y) {
		var X = Matrix._toMatrix(x);
		var y_ = Matrix._toDouble(y);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.beta(num, y_);
		});
	};
		
	/**
		 * 不完全ベータ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @param {string} [tail="lower"] - lower/upper
		 * @returns {Matrix}
		 */
	Statistics.betainc = function betainc (x, a, b, tail) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		var tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainc(num, a_, b_, tail_);
		});
	};

	/**
		 * ベータ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Statistics.betacdf = function betacdf (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betacdf(num, a_, b_);
		});
	};

	/**
		 * ベータ分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Statistics.betapdf = function betapdf (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betapdf(num, a_, b_);
		});
	};

	/**
		 * ベータ分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Statistics.betainv = function betainv (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainv(num, a_, b_);
		});
	};

	/**
		 * x! 階乗関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Statistics.factorial = function factorial (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.factorial(num);
		});
	};
		
	/**
		 * nCk 二項係数またはすべての組合わせ
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
		 * @returns {Matrix}
		 */
	Statistics.nchoosek = function nchoosek (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.nchoosek(num, k_);
		});
	};
		
	/**
		 * 誤差関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Statistics.erf = function erf (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erf(num);
		});
	};

	/**
		 * 相補誤差関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Statistics.erfc = function erfc (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erfc(num);
		});
	};
		
	/**
		 * 正規分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Statistics.normpdf = function normpdf (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normpdf(num, u_, s_);
		});
	};

	/**
		 * 正規分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Statistics.normcdf = function normcdf (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normcdf(num, u_, s_);
		});
	};

	/**
		 * 正規分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Statistics.norminv = function norminv (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.norminv(num, u_, s_);
		});
	};

	/**
		 * t分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Statistics.tpdf = function tpdf (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tpdf(num, v_);
		});
	};

	/**
		 * t分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Statistics.tcdf = function tcdf (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tcdf(num, v_);
		});
	};

	/**
		 * t分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Statistics.tinv = function tinv (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv(num, v_);
		});
	};

	/**
		 * 尾部が指定可能なt分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
		 * @returns {Matrix}
		 */
	Statistics.tdist = function tdist (x, v, tails) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		var tails_ = Matrix._toDouble(tails);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tdist(num, v_, tails_);
		});
	};

	/**
		 * 両側検定時のt分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Statistics.tinv2 = function tinv2 (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv2(num, v_);
		});
	};

	/**
		 * カイ二乗分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Statistics.chi2pdf = function chi2pdf (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2pdf(num, k_);
		});
	};

	/**
		 * カイ二乗分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Statistics.chi2cdf = function chi2cdf (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2cdf(num, k_);
		});
	};
		
	/**
		 * カイ二乗分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Statistics.chi2inv = function chi2inv (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2inv(num, k_);
		});
	};

	/**
		 * F分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Statistics.fpdf = function fpdf (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fpdf(num, d1_, d2_);
		});
	};

	/**
		 * F分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Statistics.fcdf = function fcdf (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fcdf(num, d1_, d2_);
		});
	};

	/**
		 * F分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Statistics.finv = function finv (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.finv(num, d1_, d2_);
		});
	};
		
	/**
		 * 最大値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} max([A, B])
		 */
	Statistics.max = function max (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = data[0];
			for(var i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) < 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};
		
	/**
		 * 最小値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} min([A, B])
		 */
	Statistics.min = function min (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = data[0];
			for(var i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) > 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 合計
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.sum = function sum (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			// カハンの加算アルゴリズム
			var sum = Complex.ZERO;
			var delta = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				var new_number = data[i].add(delta);
				var new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 相加平均
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.mean = function mean (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			// カハンの加算アルゴリズム
			var sum = Complex.ZERO;
			var delta = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				var new_number = data[i].add(delta);
				var new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum.div(data.length)];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 配列の積
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.prod = function prod (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = Complex.ONE;
			for(var i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 相乗平均／幾何平均
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.geomean = function geomean (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = Complex.ONE;
			for(var i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x.pow(Complex.create(data.length).inv())];
		};
		return X.eachVector(main, dim);
	};
		
	/**
		 * 中央値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.median = function median (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var compare = function(a, b){
			return a.compareTo(b);
		};
		var main = function(data) {
			data.sort(compare);
			var y;
			if((data.length % 2) === 1) {
				y = data[Math.floor(data.length / 2)];
			}
			else {
				var x1 = data[Math.floor(data.length / 2) - 1];
				var x2 = data[Math.floor(data.length / 2)];
				y = x1.add(x2).div(Complex.TWO);
			}
			return [y];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 最頻値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.mode = function mode (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var compare = function(a, b){
			return a.compareTo(b);
		};
		var main = function(data) {
			data.sort(compare);
			var map = {};
			for(var i = 0; i < data.length; i++) {
				var str = data[i].real + " " + data[i].imag;
				if(!map[str]) {
					map[str] = {
						complex : data[i],
						value : 1
					};
				}
				else {
					map[str].value++;
				}
			}
			var max_complex = Complex.ZERO;
			var max_number = Number.NEGATIVE_INFINITY;
			for(var key in map) {
				var tgt = map[key];
				if(tgt.value > max_number) {
					max_number= tgt.value;
					max_complex= tgt.complex;
				}
			}
			return [max_complex];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 中心積率
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
		 * @returns {Matrix} n次のモーメント、2で分散の定義と同等。
		 */
	Statistics.moment = function moment (x, type) {
		var X = Matrix._toMatrix(x);
		var M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、標本分散とする
		var cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var order = Matrix._toComplex(type.nth_order);
		var col = 0;
		var main = function(data) {
			var mean;
			if(M.isScalar()) {
				mean = M.scalar;
			}
			else {
				mean = M.getComplex(col++);
			}
			var x = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				// 計算方法について
				// ・複素数は、ノルムをとらずに複素数用のpowを使用したほうがいいのか
				// ・分散と同様にnormで計算したほうがいいのか
				// 複素数でのモーメントの定義がないため不明であるが、
				// 分散を拡張した考えであれば、normをとった累乗のほうが良いと思われる。
				var a = data[i].sub(mean);
				x = x.add(a.pow(order));
			}
			if(data.length === 1) {
				return [x.div(data.length)];
			}
			else {
				return [x.div(data.length - 1 + cor)];
			}
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 分散
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.var = function var$1 (x, type) {
		var X = Matrix._toMatrix(x);
		var M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var col = 0;
		var main = function(data) {
			if(data.length === 1) {
				// 要素が1であれば、分散は0固定
				return [Complex.ZERO];
			}
			var mean = M.getComplex(col++);
			// 分散は、ノルムの2乗で計算するため必ず実数になる。
			var x = 0;
			for(var i = 0; i < data.length; i++) {
				var a = data[i].sub(mean).norm;
				x += a * a;
			}
			return [Complex.create(x / (data.length - 1 + cor))];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * 標準偏差
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.std = function std (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Statistics.var(X, { correction : cor, dimension : dim });
		M._each(function(num) {
			return num.sqrt();
		});
		return M;
	};

	/**
		 * 絶対偏差
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), algorithm : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Statistics.mad = function mad (x, type) {
		var X = Matrix._toMatrix(x);
		var alg = !(type && type.algorithm) ? "mean" : type.algorithm;
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		if((alg === "mean") || (alg === 0)) {
			return Statistics.mean(X.sub(Statistics.mean(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else if((alg === "median") || (alg === 1)) {
			return Statistics.median(X.sub(Statistics.median(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else {
			throw "mad unsupported argument " + alg;
		}
	};

	/**
		 * 歪度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.skewness = function skewness (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏), 1(標本)。規定値は、標本とする
		var cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var order = Statistics.moment(X, { correction : cor, dimension : dim, nth_order : 3  });
		var std = Statistics.std(X, { correction : cor, dimension : dim });
		if(cor === 1) {
			return order.ndiv(std.npow(3));
		}
		else {
			return order.ndiv(std.npow(3)).nmul(2);
		}
	};

	/**
		 * 共分散行列
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.cov = function cov (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		if(X.isVector()) {
			return Statistics.var(X, type);
		}
		var correction = X.row_length === 1 ? 1 : cor;
		var arr = X.matrix_array;
		var mean = Statistics.mean(X).matrix_array[0];
		// 上三角行列、対角行列
		var y = new Array(X.column_length);
		for(var a = 0; a < X.column_length; a++) {
			var a_mean = mean[a];
			y[a] = new Array(X.column_length);
			for(var b = a; b < X.column_length; b++) {
				var b_mean = mean[b];
				var sum = Complex.ZERO;
				for(var row = 0; row < X.row_length; row++) {
					sum = sum.add((arr[row][a].sub(a_mean)).dot(arr[row][b].sub(b_mean)));
				}
				y[a][b] = sum.div(X.row_length - 1 + correction);
			}
		}
		// 下三角行列を作る
		for(var row$1 = 1; row$1 < y[0].length; row$1++) {
			for(var col = 0; col < row$1; col++) {
				y[row$1][col] = y[col][row$1];
			}
		}
		return new Matrix(y);
	};

	/**
		 * 標本の標準化
		 * 平均値0、標準偏差1に変更する
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.normalize = function normalize (x, type) {
		var X = Matrix._toMatrix(x);
		var mean_zero = X.sub(Statistics.mean(X, type));
		var std_one = mean_zero.ndiv(Statistics.std(mean_zero, type));
		return std_one;
	};

	/**
		 * 相関行列
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Statistics.corrcoef = function corrcoef (x, type) {
		var X = Matrix._toMatrix(x);
		return Statistics.cov(Statistics.normalize(X, type), type);
	};

	/**
		 * ソート
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number), order : ?string}} [type]
		 * @returns {Matrix}
		 */
	Statistics.sort = function sort (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var order = !(type && type.order) ? "ascend" : type.order;
		var compare;
		if(order === "ascend") {
			compare = function(a, b){
				return a.compareTo(b);
			};
		}
		else {
			compare = function(a, b){
				return b.compareTo(a);
			};
		}
		var main = function(data) {
			data.sort(compare);
			return data;
		};
		return X.eachVector(main, dim);
	};

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
	 * 高速フーリエ変換用クラス
	 * @ignore
	 */
	var FFT = function FFT(size) {
			
		/**
			 * 信号の長さ
			 */
		this.size = size;

		/**
			 * 信号の長さの逆数
			 */
		this.inv_size = 1.0 / this.size;

		/**
			 * 信号の長さをビット数で表した場合の値
			 */
		this.bit_size = Math.round(Math.log(this.size)/Math.log(2));

		/**
			 * FFTのアルゴリズムが使用できるか
			 */
		this.is_fast = (1 << this.bit_size) === this.size;

		/**
			 * バタフライ演算用のビットリバーステーブル
			 */
		this.bitrv = null;

		/**
			 * 複素数同士の掛け算に使用する実部テーブル
			 */
		this.fft_re = new Array(this.size);
			
		/**
			 * 複素数同士の掛け算に使用する虚部テーブル
			 */
		this.fft_im = new Array(this.size);
		{
			var delta = - 2.0 * Math.PI / this.size;
			var err = 0.0;
			for(var n = 0, x = 0; n < this.size; n++) {
				this.fft_re[n] = Math.cos(x);
				this.fft_im[n] = Math.sin(x);
				// カハンの加算アルゴリズム
				var y = delta + err;
				var t = x + y;
				err = t - x - y;
				x = t;
			}
		}
		if(this.is_fast) {
			this.bitrv = FFT.create_bit_reverse_table(this.bit_size);
		}
	};

	/**
		 * 中のデータを消去する
		 */
	FFT.bit_reverse_32 = function bit_reverse_32 (x) {
		var y = x & 0xffffffff;
		// 1,2,4,8,16ビット単位で交換
		y = ((y & 0x55555555) << 1) | ((y >> 1) & 0x55555555);
		y = ((y & 0x33333333) << 2) | ((y >> 2) & 0x33333333);
		y = ((y & 0x0f0f0f0f) << 4) | ((y >> 4) & 0x0f0f0f0f);
		y = ((y & 0x00ff00ff) << 8) | ((y >> 8) & 0x00ff00ff);
		y = ((y & 0x0000ffff) << 16) | ((y >> 16) & 0x0000ffff);
		return y;
	};
		
	/**
		 * 指定したビット分の数値データをビット反転した配列を返す
		 * @param {number} bit - ビット数
		 * @returns {Array<number>} ビット反転した値の配列
		 */
	FFT.create_bit_reverse_table = function create_bit_reverse_table (bit) {
		var size = 1 << bit;
		var bitrv = [];
		for(var i = 0; i < size; i++) {
			bitrv[i] = FFT.bit_reverse_32(i) >>> (32 - bit);
		}
		return bitrv;
	};

	FFT.prototype.delete = function delete$1 () {
		delete this.size;
		delete this.inv_size;
		delete this.bit_size;
		delete this.is_fast;
		delete this.bitrv;
		delete this.fft_re;
		delete this.fft_im;
	};
		
	/**
		 * 離散フーリエ変換
		 * @param {Array<number>} real - 実数部
		 * @param {Array<number>} imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	FFT.prototype.fft = function fft (real, imag) {
		var f_re = new Array(this.size);
		var f_im = new Array(this.size);
		if(this.is_fast) {
			for(var i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				var center = 1;
				var blocklength = this.size / 2;
				var pointlength = 2;
				for(var delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(var blocks = 0; blocks < blocklength; blocks++) {
						var i$1 = blocks * pointlength;
						for(var point = 0, n = 0; point < center; point++, i$1++, n += delta) {
							var re = f_re[i$1 + center] * this.fft_re[n] - f_im[i$1 + center] * this.fft_im[n];
							var im = f_im[i$1 + center] * this.fft_re[n] + f_re[i$1 + center] * this.fft_im[n];
							f_re[i$1 + center] = f_re[i$1] - re;
							f_im[i$1 + center] = f_im[i$1] - im;
							f_re[i$1] += re;
							f_im[i$1] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみのフーリエ変換
				for(var t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(var x = 0, n$1 = 0; x < this.size; x++, n$1 = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n$1];
						f_im[t] += real[x] * this.fft_im[n$1];
					}
				}
			}
			else {
				// 実数部分と複素数部分のフーリエ変換
				for(var t$1 = 0; t$1 < this.size; t$1++) {
					f_re[t$1] = 0.0;
					f_im[t$1] = 0.0;
					for(var x$1 = 0, n$2 = 0; x$1 < this.size; x$1++, n$2 = (x$1 * t$1) % this.size) {
						f_re[t$1] += real[x$1] * this.fft_re[n$2] - imag[x$1] * this.fft_im[n$2];
						f_im[t$1] += real[x$1] * this.fft_im[n$2] + imag[x$1] * this.fft_re[n$2];
					}
				}
			}
		}
		return {
			real : f_re,
			imag : f_im
		};
	};

	/**
		 * 逆離散フーリエ変換
		 * @param {Array} real - 実数部
		 * @param {Array} imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	FFT.prototype.ifft = function ifft (real, imag) {
		var f_re = new Array(this.size);
		var f_im = new Array(this.size);
		if(this.is_fast) {
			for(var i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Inverse Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				var center = 1;
				var blocklength = this.size / 2;
				var pointlength = 2;
				var re, im;
				for(var delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(var blocks = 0; blocks < blocklength; blocks++) {
						var i$1 = blocks * pointlength;
						for(var point = 0, n = 0; point < center; point++, i$1++, n += delta) {
							re = f_re[i$1 + center] * this.fft_re[n] + f_im[i$1 + center] * this.fft_im[n];
							im = f_im[i$1 + center] * this.fft_re[n] - f_re[i$1 + center] * this.fft_im[n];
							f_re[i$1 + center] = f_re[i$1] - re;
							f_im[i$1 + center] = f_im[i$1] - im;
							f_re[i$1] += re;
							f_im[i$1] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみの逆フーリエ変換
				for(var x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(var t = 0, n$1 = 0; t < this.size; t++, n$1 = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n$1];
						f_im[x] += - real[t] * this.fft_im[n$1];
					}
				}
			}
			else {
				// 実数部分と複素数部分の逆フーリエ変換
				for(var x$1 = 0; x$1 < this.size; x$1++) {
					f_re[x$1] = 0.0;
					f_im[x$1] = 0.0;
					for(var t$1 = 0, n$2 = 0; t$1 < this.size; t$1++, n$2 = (x$1 * t$1) % this.size) {
						f_re[x$1] +=   real[t$1] * this.fft_re[n$2] + imag[t$1] * this.fft_im[n$2];
						f_im[x$1] += - real[t$1] * this.fft_im[n$2] + imag[t$1] * this.fft_re[n$2];
					}
				}
			}
		}
		for(var i$2 = 0; i$2 < this.size; i$2++) {
			f_re[i$2] *= this.inv_size;
			f_im[i$2] *= this.inv_size;
		}
		return {
			real : f_re,
			imag : f_im
		};
	};

	/**
	 * 簡易キャッシュクラス
	 * FFTで用いるテーブルなどをキャッシュ
	 * @ignore
	 */
	var Chash = function Chash(chash_size, object) {

		/**
			 * キャッシュするクラス
			 */
		this.object = object;

		/**
			 * キャッシュする最大数
			 */
		this.table_max = chash_size;

		/**
			 * 現在キャッシュしている数
			 */
		this.table_size = 0;

		/**
			 * キャッシュテーブル
			 */
		this.table = [];
	};

	/**
		 * 指定した長さのデータを作成する。キャッシュに存在すればキャッシュから使用する。
		 * @param {number} size - 作成するオブジェクトのサイズ
		 * @returns {*}
		 */
	Chash.prototype.get = function get (size) {
		for(var index = 0; index < this.table_size; index++) {
			if(this.table[index].size === size) {
				// 先頭にもってくる
				var object = this.table.splice(index, 1);
				this.table.unshift(object);
				return object;
			}
		}
		var new_object = new this.object(size);
		if(this.table_size === this.table_max) {
			// 後ろのデータを消去
			var delete_object = this.table.pop();
			delete_object.delete();
		}
		// 前方に追加
		this.table.unshift(new_object);
		return new_object;
	};

	/**
	 * FFT用のキャッシュ
	 * @type {Chash}
	 * @ignore
	 */
	var fft_chash = new Chash(4, FFT);

	/**
	 * 離散コサイン変換のクラス
	 * @ignore
	 */
	var DCT = function DCT(size) {

		/**
			 * 信号長
			 */
		this.size = size;

		/**
			 * 信号長の2倍
			 * DCT変換では、実際の信号にゼロ詰めした2倍の信号長を用意しそれに対してFFTを行う。
			 */
		this.dct_size = size * 2;

		/**
			 * DCT変換に使用する計算用テーブル
			 */
		this.dct_re = new Array(this.size);

		/**
			 * DCT変換に使用する計算用テーブル
			 */
		this.dct_im = new Array(this.size);
		{
			var x_0 = 1.0 / Math.sqrt(this.size);
			var x_n = x_0 * Math.sqrt(2);
			for(var i = 0; i < this.size; i++) {
				var x = - Math.PI * i / this.dct_size;
				this.dct_re[i] = Math.cos(x) * (i === 0 ? x_0 : x_n);
				this.dct_im[i] = Math.sin(x) * (i === 0 ? x_0 : x_n);
			}
		}
	};
		
	/**
		 * 中のデータを消去する
		 */
	DCT.prototype.delete = function delete$2 () {
		delete this.size;
		delete this.dct_size;
		delete this.dct_re;
		delete this.dct_im;
	};

	/**
		 * DCT-II
		 * @param {Array<number>} real - 実数部
		 * @returns {Array<number>}
		 */
	DCT.prototype.dct = function dct (real) {
		var re = new Array(this.dct_size);
		var im = new Array(this.dct_size);
		for(var i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? real[i] : 0.0;
			im[i] = 0.0;
		}
		var fft = fft_chash.get(this.dct_size).fft(re, im);
		for(var i$1 = 0; i$1 < this.size; i$1++) {
			re[i$1] = fft.real[i$1] * this.dct_re[i$1] - fft.imag[i$1] * this.dct_im[i$1];
		}
		re.splice(this.size);
		return re;
	};

	/**
		 * DCT-III (IDCT)
		 * @param {Array<number>} real - 実数部
		 * @returns {Array<number>}
		 */
	DCT.prototype.idct = function idct (real) {
		var re = new Array(this.dct_size);
		var im = new Array(this.dct_size);
		var denormlize = this.size * 2.0;
		for(var i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? (denormlize * real[i] *    this.dct_re[i])  : 0.0;
			im[i] = i < this.size ? (denormlize * real[i] * (- this.dct_im[i])) : 0.0;
		}
		var ifft = fft_chash.get(this.dct_size).ifft(re, im);
		ifft.real.splice(this.size);
		return ifft.real;
	};

	/**
	 * 離散コサイン変換用のキャッシュ
	 * @ignore
	 */
	var dct_chash = new Chash(4, DCT);

	/**
	 * Signalクラスの内部で使用する関数集
	 * @ignore
	 */
	var SignalTool = function SignalTool () {};

	SignalTool.isContainsZero = function isContainsZero (x) {
		for(var i = 0; i < x.length; i++) {
			if(x[i] !== 0) {
				return true;
			}
		}
		return false;
	};

	/**
		 * 離散フーリエ変換
		 * @param {Array<number>} real - 実数部
		 * @param {Array<number>} imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.fft = function fft (real, imag) {
		var obj = fft_chash.get(real.length);
		return obj.fft(real, imag);
	};

	/**
		 * 逆離散フーリエ変換
		 * @param {Array<number>} real - 実数部
		 * @param {Array<number>} imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.ifft = function ifft (real, imag) {
		var obj = fft_chash.get(real.length);
		return obj.ifft(real, imag);
	};

	/**
		 * DCT-II (DCT)
		 * @param {Array<number>} real - 実数部
		 * @returns {Array<number>}
		 */
	SignalTool.dct = function dct (real) {
		var obj = dct_chash.get(real.length);
		return obj.dct(real);
	};

	/**
		 * DCT-III (IDCT)
		 * @param {Array<number>} real - 実数部
		 * @returns {Array<number>}
		 */
	SignalTool.idct = function idct (real) {
		var obj = dct_chash.get(real.length);
		return obj.idct(real);
	};

	/**
		 * パワースペクトル密度
		 * @param {Array<number>} real - 実数部
		 * @param {Array<number>} imag - 虚数部
		 * @returns {Array<number>}
		 */
	SignalTool.powerfft = function powerfft (real, imag) {
		var size = real.length;
		var X = SignalTool.fft(real, imag);
		var power = new Array(size);
		for(var i = 0; i < size; i++) {
			power[i] = X.real[i] * X.real[i] + X.imag[i] * X.imag[i];
		}
		return power;
	};

	/**
		 * 畳み込み積分、多項式乗算
		 * @param {Array} x1_real - 実数部
		 * @param {Array} x1_imag - 虚数部
		 * @param {Array} x2_real - 実数部
		 * @param {Array} x2_imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.conv = function conv (x1_real, x1_imag, x2_real, x2_imag) {
		var is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(var i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		var size = x1_real.length;
		var N2 = size * 2;
		var bit_size = Math.round(Math.log(size)/Math.log(2));
		var is_fast = (1 << bit_size) === size;
		if(is_fast) {
			// FFTを用いた手法へ切り替え
			// 周波数空間上では掛け算になる
			if(is_self) {
				var size$1 = x1_real.length;
				var real = new Array(N2);
				var imag = new Array(N2);
				for(var i$1 = 0; i$1 < N2; i$1++) {
					real[i$1] = i$1 < size$1 ? x1_real[i$1] : 0.0;
					imag[i$1] = i$1 < size$1 ? x1_imag[i$1] : 0.0;
				}
				var X = SignalTool.fft(real, imag);
				for(var i$2 = 0; i$2 < N2; i$2++) {
					real[i$2] = X.real[i$2] * X.real[i$2] - X.imag[i$2] * X.imag[i$2];
					imag[i$2] = X.real[i$2] * X.imag[i$2] + X.imag[i$2] * X.real[i$2];
				}
				var x = SignalTool.ifft(real, imag);
				x.real.splice(N2 - 1);
				x.imag.splice(N2 - 1);
				return x;
			}
			else if(x1_real.length === x2_real.length) {
				var size$2 = x1_real.length;
				var real1 = new Array(N2);
				var imag1 = new Array(N2);
				var real2 = new Array(N2);
				var imag2 = new Array(N2);
				for(var i$3 = 0; i$3 < N2; i$3++) {
					real1[i$3] = i$3 < size$2 ? x1_real[i$3] : 0.0;
					imag1[i$3] = i$3 < size$2 ? x1_imag[i$3] : 0.0;
					real2[i$3] = i$3 < size$2 ? x2_real[i$3] : 0.0;
					imag2[i$3] = i$3 < size$2 ? x2_imag[i$3] : 0.0;
				}
				var F = SignalTool.fft(real1, imag1);
				var G = SignalTool.fft(real2, imag2);
				var real$1 = new Array(N2);
				var imag$1 = new Array(N2);
				for(var i$4 = 0; i$4 < N2; i$4++) {
					real$1[i$4] = F.real[i$4] * G.real[i$4] - F.imag[i$4] * G.imag[i$4];
					imag$1[i$4] = F.real[i$4] * G.imag[i$4] + F.imag[i$4] * G.real[i$4];
				}
				var fg = SignalTool.ifft(real$1, imag$1);
				fg.real.splice(N2 - 1);
				fg.imag.splice(N2 - 1);
				return fg;
			}
		}
		var is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		{
			// まじめに計算する
			var real$2 = new Array(x1_real.length + x2_real.length - 1);
			var imag$2 = new Array(x1_real.length + x2_real.length - 1);
			for(var i$5 = 0; i$5 < real$2.length; i$5++) {
				real$2[i$5] = 0;
				imag$2[i$5] = 0;
			}
			if(is_real_number) {
				// 実数部分のみの畳み込み積分
				// スライドさせていく
				// AAAA
				//  BBBB
				//   CCCC
				for(var y = 0; y < x2_real.length; y++) {
					for(var x$1 = 0; x$1 < x1_real.length; x$1++) {
						real$2[y + x$1] += x1_real[x$1] * x2_real[y];
					}
				}
			}
			else {
				// 実数部分と複素数部分の畳み込み積分
				for(var y$1 = 0; y$1 < x2_real.length; y$1++) {
					for(var x$2 = 0; x$2 < x1_real.length; x$2++) {
						real$2[y$1 + x$2] += x1_real[x$2] * x2_real[y$1] - x1_imag[x$2] * x2_imag[y$1];
						imag$2[y$1 + x$2] += x1_real[x$2] * x2_imag[y$1] + x1_imag[x$2] * x2_real[y$1];
					}
				}
			}
			return {
				real : real$2,
				imag : imag$2
			};
		}
	};

	/**
		 * 自己相関関数、相互相関関数
		 * @param {Array} x1_real - 実数部
		 * @param {Array} x1_imag - 虚数部
		 * @param {Array} x2_real - 実数部
		 * @param {Array} x2_imag - 虚数部
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.xcorr = function xcorr (x1_real, x1_imag, x2_real, x2_imag) {
		var is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(var i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		if(x1_real.length === x2_real.length) {
			var size = x1_real.length;
			var N2 = size * 2;
			var bit_size = Math.round(Math.log(size)/Math.log(2));
			var is_fast = (1 << bit_size) === size;
			if(is_fast) {
				var fg = null;
				if(is_self) {
					var real = new Array(N2);
					var imag = new Array(N2);
					for(var i$1 = 0; i$1 < N2; i$1++) {
						real[i$1] = i$1 < size ? x1_real[i$1] : 0.0;
						imag[i$1] = i$1 < size ? x1_imag[i$1] : 0.0;
					}
					// パワースペクトル密度は、自己相関のフーリエ変換のため、
					// パワースペクトル密度の逆変換で求められる。
					var power = SignalTool.powerfft(real, imag);
					fg = SignalTool.ifft(power, imag);
					// シフト
					real.pop();
					imag.pop();
					for(var i$2 = 0, j = size + 1 ; i$2 < real.length; i$2++, j++) {
						if(N2 <= j) {
							j = 0;
						}
						real[i$2] = fg.real[j];
						imag[i$2] = fg.imag[j];
					}
					return {
						real : real,
						imag : imag
					};
				}
				else {
					var f_real = new Array(N2);
					var f_imag = new Array(N2);
					var g_real = new Array(N2);
					var g_imag = new Array(N2);
					// gの順序を反転かつ共役複素数にする
					for(var i$3 = 0; i$3 < N2; i$3++) {
						f_real[i$3] = i$3 < size ?   x1_real[i$3] : 0.0;
						f_imag[i$3] = i$3 < size ?   x1_imag[i$3] : 0.0;
						g_real[i$3] = i$3 < size ?   x2_real[size - i$3 - 1] : 0.0;
						g_imag[i$3] = i$3 < size ? - x2_imag[size - i$3 - 1] : 0.0;
					}
					// 畳み込み掛け算
					var F = SignalTool.fft(f_real, f_imag);
					var G = SignalTool.fft(g_real, g_imag);
					var real$1 = new Array(N2);
					var imag$1 = new Array(N2);
					for(var i$4 = 0; i$4 < N2; i$4++) {
						real$1[i$4] = F.real[i$4] * G.real[i$4] - F.imag[i$4] * G.imag[i$4];
						imag$1[i$4] = F.real[i$4] * G.imag[i$4] + F.imag[i$4] * G.real[i$4];
					}
					fg = SignalTool.ifft(real$1, imag$1);
					fg.real.splice(N2 - 1);
					fg.imag.splice(N2 - 1);
					return fg;
				}
			}
		}
		var is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		if(is_self) {
			var size$1 = x1_real.length;
			var N2$1 = size$1 * 2;
			// 実数の自己相関関数
			if(is_real_number) {
				var fg$1 = new Array(size$1);
				for(var m = 0; m < size$1; m++) {
					fg$1[m] = 0;
					var tmax = size$1 - m;
					for(var t = 0; t < tmax; t++) {
						fg$1[m] += x1_real[t] * x2_real[t + m];
					}
				}
				// 半分の値は同一なので折り返して計算を省く
				var real$2 = new Array(N2$1 - 1);
				var imag$2 = new Array(N2$1 - 1);
				for(var i$5 = 0, j$1 = size$1 - 1 ; i$5 < size$1; i$5++, j$1--) {
					real$2[i$5] = fg$1[j$1];
					real$2[size$1 + i$5 - 1] = fg$1[i$5];
				}
				for(var i$6 = 0; i$6 < imag$2.length; i$6++) {
					imag$2[i$6] = 0.0;
				}
				return {
					real : real$2,
					imag : imag$2
				};
			}
		}
		// 2つの信号の長さが違う、又は2の累乗の長さではない別のデータの場合は通常計算
		{
			var g_real$1 = new Array(x2_real.length);
			var g_imag$1 = new Array(x2_real.length);
			// gの順序を反転かつ共役複素数にする
			for(var i$7 = 0; i$7 < x2_real.length; i$7++) {
				g_real$1[i$7] =   x2_real[x2_real.length - i$7 - 1];
				g_imag$1[i$7] = - x2_imag[x2_real.length - i$7 - 1];
			}
			var y = SignalTool.conv(x1_real, x1_imag, g_real$1, g_imag$1);
			if(x1_real.length === x2_real.length) {
				return y;
			}
			var delta = Math.abs(x1_real.length - x2_real.length);
			var zeros = new Array(delta);
			for(var i$8 = 0; i$8 < delta; i$8++) {
				zeros[i$8] = 0;
			}
			if(x1_real.length > x2_real.length) {
				// データの最初に「0」を加える
				return {
					real : zeros.concat(y.real),
					imag : zeros.concat(y.imag)
				};
			}
			else {
				// データの最後に「0」を加える
				return {
					real : y.real.concat(zeros),
					imag : y.imag.concat(zeros)
				};
			}
		}
	};

	/**
		 * 窓を作成する
		 * @param {string} name - 窓関数の名前
		 * @param {number} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.window = function window (name, size, periodic) {
		var periodic_ = periodic !== undefined ? periodic : "symmetric";
		var name_ = name.toLocaleLowerCase();
		var size_ = size;
		var window = new Array(size_);
			
		var normalzie;
		if((periodic_ === "symmetric") || (periodic_ === 0)) {
			normalzie = function(y) {
				return (y / (size_ - 1) * (Math.PI * 2.0));
			};
		}
		else if((periodic_ === "periodic") || (periodic_ !== 0)) {
			normalzie = function(y) {
				return (y / size_ * (Math.PI * 2.0));
			};
		}

		var setBlackmanWindow = function( alpha0, alpha1, alpha2, alpha3, alpha4) {
			for(var i = 0; i < size_; i++) {
				window[i]  = alpha0;
				window[i] -= alpha1 * Math.cos(1.0 * normalzie(i));
				window[i] += alpha2 * Math.cos(2.0 * normalzie(i));
				window[i] -= alpha3 * Math.cos(3.0 * normalzie(i));
				window[i] += alpha4 * Math.cos(4.0 * normalzie(i));
			}
		};

		switch(name_) {
			// rect 矩形窓(rectangular window)
			case "rectangle":
				setBlackmanWindow(1.0, 0.0, 0.0, 0.0, 0.0);
				break;

			// hann ハン窓・ハニング窓(hann/hanning window)
			case "hann":
				setBlackmanWindow(0.5, 0.5, 0.0, 0.0, 0.0);
				break;

			// hamming ハミング窓(hamming window)
			case "hamming":
				setBlackmanWindow(0.54, 0.46, 0.0, 0.0, 0.0);
				break;

			// blackman ブラックマン窓(Blackman window)
			case "blackman":
				setBlackmanWindow(0.42, 0.50, 0.08, 0.0, 0.0);
				break;

			// blackmanharris Blackman-Harris window
			case "blackmanharris":
				setBlackmanWindow(0.35875, 0.48829, 0.14128, 0.01168, 0);
				break;

			// blackmannuttall Blackman-Nuttall window
			case "blackmannuttall":
				setBlackmanWindow(0.3635819, 0.4891775, 0.1365995, 0.0106411, 0.0);
				break;

			// flattop Flat top window
			case "flattop":
				setBlackmanWindow(1.0, 1.93, 1.29, 0.388, 0.032);
				break;

			// Half cycle sine window(MDCT窓)
			case "sin":
				for(var i = 0; i < size_; i++) {
					window[i]  = Math.sin(normalzie(i) * 0.5);
				}
				break;

			// Vorbis window(MDCT窓)
			case "vorbis":
				for(var i$1 = 0; i$1 < size_; i$1++) {
					var x = Math.sin(normalzie(i$1) * 0.5);
					window[i$1]  = Math.sin(Math.PI * 0.5 * x * x);
				}
				break;
		}

		return window;
	};

	/**
		 * ハニング窓
		 * @param {number} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.hann = function hann (size, periodic) {
		return SignalTool.window("hann", size, periodic);
	};
		
	/**
		 * ハミング窓を作成
		 * @param {number} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.hamming = function hamming (size, periodic) {
		return SignalTool.window("hamming", size, periodic);
	};

	/**
	 * Matrix用の信号処理用の計算クラス
	 */
	var Signal = function Signal () {};

	Signal.fft = function fft (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.fft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex([result.real[i$1], result.imag[i$1]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * 逆離散フーリエ変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} ifft(X)
		 */
	Signal.ifft = function ifft (X, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(X);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.ifft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex([result.real[i$1], result.imag[i$1]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * パワースペクトル密度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} abs(fft(x)).^2
		 */
	Signal.powerfft = function powerfft (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.powerfft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * 離散コサイン変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} dct(x)
		 */
	Signal.dct = function dct (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		if(M.isComplex()) {
			throw "dct don't support complex numbers.";
		}
		var main = function(data) {
			var real = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			var result = SignalTool.dct(real);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * 逆離散コサイン変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} idct(x)
		 */
	Signal.idct = function idct (X, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(X);
		if(M.isComplex()) {
			throw "idct don't support complex numbers.";
		}
		var main = function(data) {
			var real = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			var result = SignalTool.idct(real);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * 2次元の離散フーリエ変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Signal.fft2 = function fft2 (x) {
		return Signal.fft(x, {dimension : "both"});
	};

	/**
		 * 2次元の逆離散フーリエ変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @returns {Matrix}
		 */
	Signal.ifft2 = function ifft2 (X) {
		return Signal.ifft(X, {dimension : "both"});
	};

	/**
		 * 2次元のDCT変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Signal.dct2 = function dct2 (x) {
		return Signal.dct(x, {dimension : "both"});
	};

	/**
		 * 2次元の逆DCT変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @returns {Matrix}
		 */
	Signal.idct2 = function idct2 (X) {
		return Signal.idct(X, {dimension : "both"});
	};

	/**
		 * 畳み込み積分、多項式乗算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x2
		 * @returns {Matrix}
		 */
	Signal.conv = function conv (x1, x2) {
		var M1 = Matrix._toMatrix(x1);
		var M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		var M1_real = new Array(M1.length);
		var M1_imag = new Array(M1.length);
		var M2_real = new Array(M2.length);
		var M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(var i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(var i$1 = 0; i$1 < M1.row_length; i$1++) {
				M1_real[i$1] = M1.matrix_array[i$1][0].real;
				M1_imag[i$1] = M1.matrix_array[i$1][0].imag;
			}
		}
		if(M2.isRow()) {
			for(var i$2 = 0; i$2 < M2.column_length; i$2++) {
				M2_real[i$2] = M2.matrix_array[0][i$2].real;
				M2_imag[i$2] = M2.matrix_array[0][i$2].imag;
			}
		}
		else {
			for(var i$3 = 0; i$3 < M2.row_length; i$3++) {
				M2_real[i$3] = M2.matrix_array[i$3][0].real;
				M2_imag[i$3] = M2.matrix_array[i$3][0].imag;
			}
		}
		var y = SignalTool.conv(M1_real, M1_imag, M2_real, M2_imag);
		var m = new Array(y.real.length);
		for(var i$4 = 0; i$4 < y.real.length; i$4++) {
			m[i$4] = new Complex([y.real[i$4], y.imag[i$4]]);
		}
		var M = new Matrix([m]);
		return M2.isRow() ? M : M.transpose();
	};

	/**
		 * 自己相関関数、相互相関関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [x2] - 省略した場合は自己相関関数
		 * @returns {Matrix}
		 */
	Signal.xcorr = function xcorr (x1, x2) {
		var M1 = Matrix._toMatrix(x1);
		if(!x2) {
			return M1.xcorr(M1);
		}
		var M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		var M1_real = new Array(M1.length);
		var M1_imag = new Array(M1.length);
		var M2_real = new Array(M2.length);
		var M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(var i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(var i$1 = 0; i$1 < M1.row_length; i$1++) {
				M1_real[i$1] = M1.matrix_array[i$1][0].real;
				M1_imag[i$1] = M1.matrix_array[i$1][0].imag;
			}
		}
		if(M2.isRow()) {
			for(var i$2 = 0; i$2 < M2.column_length; i$2++) {
				M2_real[i$2] = M2.matrix_array[0][i$2].real;
				M2_imag[i$2] = M2.matrix_array[0][i$2].imag;
			}
		}
		else {
			for(var i$3 = 0; i$3 < M2.row_length; i$3++) {
				M2_real[i$3] = M2.matrix_array[i$3][0].real;
				M2_imag[i$3] = M2.matrix_array[i$3][0].imag;
			}
		}
		var y = SignalTool.xcorr(M1_real, M1_imag, M2_real, M2_imag);
		var m = new Array(y.real.length);
		for(var i$4 = 0; i$4 < y.real.length; i$4++) {
			m[i$4] = new Complex([y.real[i$4], y.imag[i$4]]);
		}
		var M = new Matrix([m]);
		return M1.isRow() ? M : M.transpose();
	};

	/**
		 * 窓関数
		 * @param {string} name - 窓関数の名前
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Signal.window = function window (name, size, periodic) {
		var size_ = Matrix._toInteger(size);
		var y = SignalTool.window(name, size_, periodic);
		return (new Matrix(y)).transpose();
	};

	/**
		 * ハニング窓
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Signal.hann = function hann (size, periodic) {
		return Signal.window("hann", size, periodic);
	};
		
	/**
		 * ハミング窓
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Signal.hamming = function hamming (size, periodic) {
		return Signal.window("hamming", size, periodic);
	};
		
	/**
		 * FFTシフト
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x 
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Signal.fftshift = function fftshift (x, type) {
		var X = Matrix._toMatrix(x);
		if(X.isVector()) {
			var shift_size = Math.floor(X.length / 2);
			return X.circshift(shift_size, type);
		}
		var shift_size_col = Math.floor(X.column_length / 2);
		var shift_size_row = Math.floor(X.row_length / 2);
		if(type !== undefined) {
			var target = type.dimension;
			if((target === "row") || (target === 1)) {
				return X.circshift(shift_size_col, type);
			}
			else if((target === "column") || (target === 2)) {
				return X.circshift(shift_size_row, type);
			}
		}
		var Y = X.circshift(shift_size_col, {dimension : "row"});
		return Y.circshift(shift_size_row, {dimension : "column"});
	};

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
	 * Matrix 内で使用する関数群
	 * @ignore
	 */
	var MatrixTool = function MatrixTool () {};

	MatrixTool.toPositionArrayFromObject = function toPositionArrayFromObject (data, max, geta) {
		if(typeof data === "string") {
			var array_or_string = MatrixTool.toArrayFromString(data);
			if(array_or_string === ":") {
				// : が指定された場合
				var y = new Array(max);
				for(var i = 0; i < max; i++) {
					y[i] =  i + geta;
				}
				return y;
			}
			else if(array_or_string instanceof Array) {
				// 複素数の配列から中身を取り出す
				var y$1 = array_or_string;
				var num_y = new Array(y$1.length);
				for(var i$1 = 0; i$1 < y$1.length; i$1++) {
					num_y[i$1] = y$1[i$1].real | 0;
				}
				return num_y;
			}
			else {
				throw "toArrayFromString[" + data + "][" + array_or_string + "]";
			}
		}
		var t_data = data;
		if(!(t_data instanceof Matrix) && !(t_data instanceof Complex) && !((typeof t_data === "number"))) {
			t_data = Matrix._toMatrix(t_data);
		}
		if(t_data instanceof Matrix) {
			if(!t_data.isVector()) {
				throw "getMatrix argument " + t_data;
			}
			var len = t_data.length;
			var y$2 = new Array(t_data.length);
			if(t_data.isRow()) {
				for(var i$2 = 0; i$2 < len; i$2++) {
					y$2[i$2] = t_data.matrix_array[0][i$2].real | 0;
				}
			}
			else if(t_data.isColumn()) {
				for(var i$3 = 0; i$3 < len; i$3++) {
					y$2[i$3] = t_data.matrix_array[i$3][0].real | 0;
				}
			}
			return y$2;
		}
		return [ Matrix._toInteger(t_data) ];
	};

	/**
		 * 対象ではないregexpの情報以外も抽出match
		 * @param {string} text - 検索対象
		 * @param {RegExp} regexp - 検索したい正規表現
		 * @returns {Array<Object<boolean, string>>}
		 */
	MatrixTool.match2 = function match2 (text, regexp) {
		// 対象ではないregexpの情報以外も抽出match
		// つまり "1a2b" で \d を抽出すると、次のように抽出される
		// [false "1"]
		// [true "a"]
		// [false "2"]
		// [true "b"]
		// 0 ... 一致したかどうか
		// 1 ... 一致した文字列、あるいは一致していない文字列
		var output = [];
		var search_target = text;
		for(var x = 0; x < 1000; x++) {
			var match = search_target.match(regexp);
			if(match === null) {
				if(search_target.length) {
					output.push([ false, search_target ]);
				}
				break;
			}
			if(match.index > 0) {
				output.push([ false, search_target.substr(0, match.index) ]);
			}
			output.push([ true, match[0] ]);
			search_target = search_target.substr(match.index + match[0].length);
		}
		return output;
	};
		
	/**
		 * ブラケットに囲まれていたら、前後のブラケットを除去
		 * @param {string} text - ブラケットを除去したい文字
		 * @returns {string|null} 除去した文字列（ブラケットがない場合は、null）
		 */
	MatrixTool.trimBracket = function trimBracket (text) {
		// 前後に[]があるか確認
		if( !(/^\[/).test(text) || !(/\]$/).test(text)) {
			return null;
		}
		// 前後の[]を除去
		return text.substring(1, text.length - 1);
	};

	/**
		 * JSONで定義された文字列データからMatrix型のデータを作成する
		 * @param {string} text - 調査したい文字列([xx,xx,xx],[xx,xx,xx])
		 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
		 */
	MatrixTool.toMatrixArrayFromStringForArrayJSON = function toMatrixArrayFromStringForArrayJSON (text) {
		var matrix_array = [];
		// さらにブランケット内を抽出
		var rows = text.match(/\[[^\]]+\]/g);
		if(rows === null) {
			// ブランケットがない場合は、1行行列である
			rows = [text];
		}
		// 各ブランケット内を列ごとに調査
		for(var row_count = 0; row_count < rows.length; row_count++) {
			var row = rows[row_count];
			var column_array = row.substring(1, row.length - 1).split(",");
			var rows_array = [];
			for(var col_count = 0; col_count < column_array.length; col_count++) {
				var column = column_array[col_count];
				rows_array[col_count] = new Complex(column);
			}
			matrix_array[row_count] = rows_array;
		}
		return matrix_array;
	};

	/**
		 * 初期値と差分値と最終値から、その値が入った配列を作成する
		 * @param {Complex} from - 最初の値
		 * @param {Complex} delta - 差分
		 * @param {Complex} to - 繰り返す先の値
		 * @param {boolean} [is_include_last_number=true] - 最後の値を含めるか否か
		 * @returns {Array<Complex>}
		 */
	MatrixTool.InterpolationCalculation = function InterpolationCalculation (from, delta, to, is_include_last_number) {
		var FromIsGreaterThanTo = from.compareTo(to);
		var is_include_last_number_ = is_include_last_number !== undefined ? is_include_last_number : true;
		if(FromIsGreaterThanTo === 0) {
			return [from];
		}
		if(delta.isZero()) {
			throw "IllegalArgumentException";
		}
		// delta が負のため、どれだけたしても to にならない。
		if(delta.isNegative() && (FromIsGreaterThanTo === -1)) {
			throw "IllegalArgumentException";
		}
		// FromIsGreaterThanTo
		// +1 from の方が大きい。下に減算タイプ
		// -1 to の方が大きい。上に加算タイプ
		var rows_array = [];
		var num = from;
		rows_array[0] = num;
		for(var i = 1; i < 0x10000; i++) {
			num = num.add(delta);
			if(is_include_last_number_) {
				if(to.compareTo(num) === FromIsGreaterThanTo) {
					break;
				}
			}
			else {
				if((to.compareTo(num) * FromIsGreaterThanTo) >= 0) {
					break;
				}
			}
			rows_array[i] = num;
		}
		return rows_array;
	};

	/**
		 * match2で文字列を切り分けたデータから数値の配列を作成する
		 * @param {Array<Object<boolean, string>>} match2_string - 文字列を切り分けたデータ
		 * @returns {Array<Complex>}
		 */
	MatrixTool.toArrayFromMatch2String = function toArrayFromMatch2String (match2_string) {
		var xs = match2_string;
		var rows_array = [];
		for(var i = 0; i < xs.length; i++) {
			var xx = xs[i];
			if(!xx[0]) {
				// 一致していないデータであれば次へ
				continue;
			}
			// 「:記法」 1:3 なら 1,2,3。 1:2:9 なら 1:3:5:7:9
			if((i < xs.length - 2) && !xs[i + 1][0] && /:/.test(xs[i + 1][1])) {
				var from = (void 0), delta = (void 0), to = (void 0);
				if((i < xs.length - 4) && !xs[i + 3][0] && /:/.test(xs[i + 3][1])) {
					from = new Complex(xx[1]);
					delta = new Complex(xs[i + 2][1]);
					to = new Complex(xs[i + 4][1]);
					i += 4;
				}
				else {
					from = new Complex(xx[1]);
					delta = Complex.ONE;
					to = new Complex(xs[i + 2][1]);
					i += 2;
				}
				var ip_array = MatrixTool.InterpolationCalculation(from, delta, to, true);
				for(var j = 0; j < ip_array.length; j++) {
					rows_array.push(ip_array[j]);
				}
			}
			else {
				rows_array.push(new Complex(xx[1]));
			}
		}

		return rows_array;
	};

	/**
		 * 文字列からMatrix型の行列データの行部分に変換
		 * 数字のような部分を抽出することで、行列を推定する
		 * @param {string} row_text - 行列の1行を表す文字列
		 * @returns {Array<Complex>|string}
		 */
	MatrixTool.toArrayFromString = function toArrayFromString (row_text) {
		// 「:」のみ記載されていないかの確認
		if(row_text.trim() === ":") {
			return ":";
		}
		var str = row_text.toLowerCase().replace(/infinity|inf/g, "1e100000");
		// 左が実数（強制）で右が複素数（任意）タイプ
		var reg1 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))( *[+-] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij])?/;
		// 左が複素数（強制）で右が実数（任意）タイプ
		var reg2 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]( *[+] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan)))?/;
		// reg2優先で検索
		var reg3 = new RegExp("(" + reg2.source + ")|(" + reg1.source + ")", "i");
		// 問題として 1 - -jが通る
		return MatrixTool.toArrayFromMatch2String(MatrixTool.match2(str, reg3));
	};

	/**
		 * スペース区切りなどで文字列で定義された文字列データからMatrix型のデータを作成する
		 * @param {string} text - 調査したい文字列
		 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
		 */
	MatrixTool.toMatrixArrayFromStringForArraySPACE = function toMatrixArrayFromStringForArraySPACE (text) {
		// 行ごとを抽出して
		var rows = text.split(";");
		var matrix_array = new Array(rows.length);
		for(var row_count = 0; row_count < rows.length; row_count++) {
			// 各行の文字を解析
			matrix_array[row_count] = MatrixTool.toArrayFromString(rows[row_count]);
		}
		return matrix_array;
	};

	/**
		 * 行列用の文字列データから構成されるMatrix型のデータを作成する
		 * @param {string} text - 調査したい文字列
		 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
		 */
	MatrixTool.toMatrixArrayFromStringInBracket = function toMatrixArrayFromStringInBracket (text) {
		// ブラケットの中にブラケットがある＝JSON形式
		if(/[[\]]/.test(text)) {
			return MatrixTool.toMatrixArrayFromStringForArrayJSON(text);
		}
		// それ以外(MATLAB, Octave, Scilab)
		else {
			return MatrixTool.toMatrixArrayFromStringForArraySPACE(text);
		}
	};

	/**
		 * 文字列データからMatrix型のデータを作成する
		 * @param {string} text - 調査したい文字列
		 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
		 */
	MatrixTool.toMatrixArrayFromString = function toMatrixArrayFromString (text) {
		// 前後のスペースを除去
		var trimtext = text.replace(/^\s*|\s*$/g, "");
		// ブランケットを外す
		var withoutBracket = MatrixTool.trimBracket(trimtext);
		if(withoutBracket) {
			// 配列用の初期化
			return MatrixTool.toMatrixArrayFromStringInBracket(withoutBracket);
		}
		else {
			// スカラー用の初期化
			return [[new Complex(text)]];
		}
	};

	/**
		 * Matrix型内部データが行列データとして正しいかを調べる
		 * @param {Array<Array<Complex>>} m_array
		 * @returns {boolean} 
		 */
	MatrixTool.isCorrectMatrixArray = function isCorrectMatrixArray (m_array) {
		if(m_array.length === 0) {
			return false;
		}
		var num = m_array[0].length;
		if(num === 0) {
			return false;
		}
		for(var i = 1; i < m_array.length; i++) {
			if(m_array[i].length !== num) {
				return false;
			}
		}
		return true;
	};

	/**
	 * 複素行列クラス (immutable)
	 */
	var Matrix = function Matrix(number) {
		var matrix_array = null;
		var is_check_string = false;
		if(arguments.length === 1) {
			var y = number;
			// 行列型なら中身をディープコピーする
			if(y instanceof Matrix) {
				matrix_array = new Array(y.row_length);
				for(var i = 0; i < y.row_length; i++) {
					matrix_array[i] = new Array(y.column_length);
					for(var j = 0; j < y.column_length; j++) {
						matrix_array[i][j] = y.matrix_array[i][j];
					}
				}
			}
			// 複素数型なら1要素の行列
			else if(y instanceof Complex) {
				matrix_array = [[y]];
			}
			// 行列の場合は中身を解析していく
			else if(y instanceof Array) {
				matrix_array = [];
				for(var row_count = 0; row_count < y.length; row_count++) {
					// 毎行ごと調査
					var row = y[row_count];
					// 各行の要素が配列の場合は、配列内配列のため再度for文で調べていく
					if(row instanceof Array) {
						var rows_array = new Array(row.length);
						// 1行を調査する
						for(var col_count = 0; col_count < row.length; col_count++) {
							var column = row[col_count];
							// 1要素が複素数ならそのまま代入
							if(column instanceof Complex) {
								rows_array[col_count] = column;
							}
							// 1要素が行列なら、中身を抽出して代入
							else if(column instanceof Matrix) {
								if(!column.isScalar()) {
									throw "Matrix in matrix";
								}
								rows_array[col_count] = column.scalar;
							}
							// それ以外の場合は、複素数クラスのコンストラクタに判断させる
							else {
								rows_array[col_count] = new Complex(column);
							}
						}
						matrix_array[row_count] = rows_array;
					}
					// 1つの値のみ宣言の場合は、中の配列を行ベクトルとして定義する
					else {
						// 行ベクトルの初期化
						if(row_count === 0) {
							matrix_array[0] = new Array(y.length);
						}
						// 1要素が複素数ならそのまま代入
						if(row instanceof Complex) {
							matrix_array[0][row_count] = row;
						}
						// 1要素が行列なら、中身を抽出して代入
						else if(row instanceof Matrix) {
							if(!row.isScalar()) {
								throw "Matrix in matrix";
							}
							matrix_array[0][row_count] = row.scalar;
						}
						// それ以外の場合は、複素数クラスのコンストラクタに判断させる
						else {
							matrix_array[0][row_count] = new Complex(row);
						}
					}
				}
			}
			// 文字列の場合は、文字列解析を行う
			else if(typeof y === "string") {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(y);
			}
			// 文字列変換できる場合は返還後に、文字列解析を行う
			else if(y instanceof Object) {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(y.toString());
			}
			// 単純なビルトインの数値など
			else {
				matrix_array = [[new Complex(y)]];
			}
		}
		else {
			throw "Matrix : Many arguments [" + arguments.length + "]";
		}
		if(is_check_string) {
			// 文字列データの解析の場合、":" データが紛れていないかを確認する。
			// 紛れていたらその行は削除する。
			for(var row$1 = 0; row$1 < matrix_array.length; row$1++) {
				if(matrix_array[row$1] === ":") {
					matrix_array.splice(row$1--, 1);
				}
			}
		}
		if(!MatrixTool.isCorrectMatrixArray(matrix_array)) {
			console.log(matrix_array);
			throw "new Matrix IllegalArgumentException";
		}
			
		/**
			 * 行列を構成する配列
			 * @private
			 * @type {Array<Array<Complex>>}
			 */
		this.matrix_array = matrix_array;

		/**
			 * 行数
			 * @private
			 * @type {number}
			 */
		this.row_length = this.matrix_array.length;
			
		/**
			 * 列数
			 * @private
			 * @type {number}
			 */
		this.column_length = this.matrix_array[0].length;

		/**
			 * 文字列化に使用するキャッシュ
			 * @private
			 * @type {string}
			 */
		this.string_cash = null;
	};

	var prototypeAccessors$2 = { intValue: { configurable: true },doubleValue: { configurable: true },scalar: { configurable: true },length: { configurable: true },norm1: { configurable: true },norm2: { configurable: true } };

	/**
		 * Matrix を作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.create = function create (number) {
		if((arguments.length === 1) && (number instanceof Matrix)) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	};
		
	/**
		 * 指定した数値から Matrix 型に変換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.valueOf = function valueOf (number) {
		return Matrix.valueOf(number);
	};

	/**
		 * 行列を作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix}
		 * @private
		 */
	Matrix._toMatrix = function _toMatrix (number) {
		if(number instanceof Matrix) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	};

	/**
		 * 複素数を作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Complex}
		 * @private
		 */
	Matrix._toComplex = function _toComplex (number) {
		if(number instanceof Complex) {
			return number;
		}
		var M = Matrix._toMatrix(number);
		if(M.isScalar()) {
			return M.scalar;
		}
		else {
			throw "not scalar. [" + number + "]";
		}
	};

	/**
		 * 実数を作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {number}
		 * @private
		 */
	Matrix._toDouble = function _toDouble (number) {
		if(typeof number === "number") {
			return number;
		}
		var x = Matrix._toComplex(number);
		if(x.isReal()) {
			return x.real;
		}
		else {
			throw "not support complex numbers.";
		}
	};

	/**
		 * 整数を作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {number}
		 * @private
		 */
	Matrix._toInteger = function _toInteger (number) {
		return Matrix._toDouble(number) | 0;
	};

	/**
		 * キャッシュを削除
		 */
	Matrix.prototype._clearCash = function _clearCash () {
		if(this.string_cash) {
			delete this.string_cash;
		}
	};

	/**
		 * ディープコピー
		 * @returns {Matrix}
		 */
	Matrix.prototype.clone = function clone () {
		return new Matrix(this.matrix_array);
	};

	/**
		 * 文字列化
		 * @returns {string} 
		 */
	Matrix.prototype.toString = function toString () {
		if(this.string_cash) {
			return this.string_cash;
		}
		var exp_turn_point = 9;
		var exp_turn_num = Math.pow(10, exp_turn_point);
		var exp_point = 4;
		var isDrawImag = false;
		var isDrawExp = false;
		var draw_decimal_position = 0;

		// 行列を確認して表示するための表示方法の確認する
		this._each(
			function(num) {
				if(!num.isReal()) {
					isDrawImag = true;
				}
				if(Number.isFinite(num.real)) {
					if(Math.abs(num.real) >= exp_turn_num) {
						isDrawExp = true;
					}
				}
				if(Number.isFinite(num.imag)) {
					if(Math.abs(num.imag) >= exp_turn_num) {
						isDrawExp = true;
					}
				}
				draw_decimal_position = Math.max(draw_decimal_position, num.getDecimalPosition());
			}
		);

		if(draw_decimal_position > 0) {
			draw_decimal_position = exp_point;
		}

		// 文字列データを作成とともに、最大の長さを記録する
		var str_max = 0;
		var draw_buff = [];
		// 数値データを文字列にする関数（eの桁がある場合は中身は3桁にする）
		var toStrFromFloat = function(number) {
			var str = !isDrawExp ? number.toFixed(draw_decimal_position) : number.toExponential(exp_point);
			if(/inf/i.test(str)) {
				if(number === Number.POSITIVE_INFINITY) {
					return "Inf";
				}
				else {
					return "-Inf";
				}
			}
			else if(/nan/i.test(str)) {
				return "NaN";
			}
			else if(!isDrawExp) {
				return str;
			}
			var split = str.split("e");
			var exp_text = split[1];
			if(exp_text.length === 2) {
				exp_text = exp_text.substr(0, 1) + "00" + exp_text.substr(1);
			}
			else if(exp_text.length === 3) {
				exp_text = exp_text.substr(0, 1) + "0" + exp_text.substr(1);
			}
			return split[0] + "e" + exp_text;
		};
		this._each(
			function(num) {
				var data = {};
				var real = num.real;
				data.re_sign = real < 0 ? "-" : " ";
				real = Math.abs(real);
				data.re_str = toStrFromFloat(real);
				str_max = Math.max(str_max, data.re_str.length + 1);
				if(isDrawImag) {
					var imag = num.imag;
					data.im_sign = imag < 0 ? "-" : "+";
					imag = Math.abs(imag);
					data.im_str = toStrFromFloat(imag);
					str_max = Math.max(str_max, data.im_str.length + 1);
				}
				draw_buff.push(data);
			}
		);

		// 右寄せ用関数
		var right = function(text, length) {
			var space = "                                        ";
			return space.substr(0, length - text.length) + text;
		};
		// 出力用文字列を作成する
		var output = [];
		var that = this;
		this._each(
			function(num, row, col) {
				var data = draw_buff.shift();
				var text = right(data.re_sign + data.re_str, str_max);
				if(isDrawImag) {
					text += " " + data.im_sign + right(data.im_str, str_max) + "i";
				}
				output.push(text);
				output.push((col < that.column_length - 1) ? " " : "\n");
			}
		);

		this.string_cash = output.join("");

		return this.string_cash;
	};

	/**
		 * 文字列化（1行で表す）
		 * @returns {string} 
		 */
	Matrix.prototype.toOneLineString = function toOneLineString () {
		if(this.isScalar()) {
			return this.scalar.toString();
		}
		var output = "[ ";
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				output += this.matrix_array[row][col].toString();
				if(col < this.column_length - 1) {
					output += ", ";
				}
				else {
					if(row < this.row_length - 1) {
						output += "; ";
					}
				}
			}
		}
		output += " ]";
		return output;
	};

	/**
		 * 等式
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean} A === B
		 */
	Matrix.prototype.equals = function equals (number, epsilon) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			return false;
		}
		if((M1.row_length === 1) && (M1.column_length ===1)) {
			return M1.scalar.equals(M2.scalar, epsilon);
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				if(!x1[row][col].equals(x2[row][col], epsilon)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
		 * 行列を構成する複素数の実部の配列
		 * @returns {Array<Array<number>>}
		 */
	Matrix.prototype.getNumberMatrixArray = function getNumberMatrixArray () {
		var y = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j].real;
			}
		}
		return y;
	};
		
	/**
		 * 行列を構成する複素数のComplex型の配列
		 * @returns {Array<Array<Complex>>}
		 */
	Matrix.prototype.getComplexMatrixArray = function getComplexMatrixArray () {
		var y = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j];
			}
		}
		return y;
	};
		
	/**
		 * 本オブジェクト内の全要素に同一処理を実行
		 * ミュータブル
		 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._each = function _each (eachfunc) {
		var isclearcash = false;
		// 行優先ですべての値に対して指定した関数を実行する。内容を書き換える可能性もある
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				var ret = eachfunc(this.matrix_array[row][col], row, col);
				if(ret === undefined) {
					continue;
				}
				else if(ret instanceof Complex) {
					this.matrix_array[row][col] = ret;
				}
				else if(ret instanceof Matrix) {
					this.matrix_array[row][col] = ret.scalar;
				}
				else {
					this.matrix_array[row][col] = new Complex(ret);
				}
				isclearcash = true;
			}
		}
		if(isclearcash) {
			this._clearCash();
		}
		return this;
	};

	/**
		 * 本オブジェクト内の全要素に同一処理を実行
		 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.cloneMatrixDoEachCalculation = function cloneMatrixDoEachCalculation (eachfunc) {
		return this.clone()._each(eachfunc);
	};

	/**
		 * 行列内の各値に対して指定した初期化を行ったMatrixを作成
		 * @param {function(number, number): ?Object } eachfunc - Function(row, col)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length=dimension] - 列数
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.createMatrixDoEachCalculation = function createMatrixDoEachCalculation (eachfunc, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		var y_row_length = Matrix._toInteger(dimension);
		var y_column_length = column_length ? Matrix._toInteger(column_length) : y_row_length;
		var y = new Array(y_row_length);
		for(var row = 0; row < y_row_length; row++) {
			y[row] = new Array(y_column_length);
			for(var col = 0; col < y_column_length; col++) {
				var ret = eachfunc(row, col);
				if(ret === undefined) {
					y[row][col] = Complex.ZERO;
				}
				else {
					y[row][col] = Matrix._toComplex(ret);
				}
			}
		}
		return new Matrix(y);
	};

	/**
		 * 行列の列をベクトルとみなし同一処理を実行、行ベクトルであれば行ベクトルに対し同一処理を実行
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.eachVectorAuto = function eachVectorAuto (array_function) {
		if(this.isRow()) {
			// 1行であれば、その1行に対して処理を行う
			var row_array = new Array(this.row_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[0][col];
			}
			return new Matrix(array_function(row_array));
		}
		else {
			var y = new Matrix(0);
			y._resize(1, this.column_length);
			// 1列、行列であれば、列ごとに処理を行う
			for(var col$1 = 0; col$1 < this.column_length; col$1++) {
				var col_array = new Array(this.row_length);
				for(var row = 0; row < this.row_length; row++) {
					col_array[row] = this.matrix_array[row][col$1];
				}
				var col_output = array_function(col_array);
				y._resize(Math.max(y.row_length, col_output.length), y.column_length);
				for(var row$1 = 0; row$1 < col_output.length; row$1++) {
					y.matrix_array[row$1][col$1] = col_output[row$1];
				}
			}
			return y;
		}
	};

	/**
		 * 行列の行と列をベクトルとみなし同一処理を実行
		 * 先に行に対して同一処理を実行後の行列に対し、列ごとにさらに同一処理を実行する
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.eachVectorBoth = function eachVectorBoth (array_function) {
		var y1 = new Matrix(0);
		// 行ごとに処理を行う
		y1._resize(this.row_length, 1);
		for(var row = 0; row < this.row_length; row++) {
			var row_array = new Array(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			var row_output = array_function(row_array);
			y1._resize(y1.row_length, Math.max(y1.column_length, row_output.length));
			for(var col$1 = 0; col$1 < row_output.length; col$1++) {
				y1.matrix_array[row][col$1] = row_output[col$1];
			}
		}
		var y2 = new Matrix(0);
		// 列ごとに処理を行う
		y2._resize(1, y1.column_length);
		for(var col$2 = 0; col$2 < y1.column_length; col$2++) {
			var col_array = new Array(y1.row_length);
			for(var row$1 = 0; row$1 < y1.row_length; row$1++) {
				col_array[row$1] = y1.matrix_array[row$1][col$2];
			}
			var col_output = array_function(col_array);
			y2._resize(Math.max(y2.row_length, col_output.length), y2.column_length);
			for(var row$2 = 0; row$2 < col_output.length; row$2++) {
				y2.matrix_array[row$2][col$2] = col_output[row$2];
			}
		}
		return y2;
	};

	/**
		 * 行列の行をベクトルとみなし同一処理を実行
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.eachVectorRow = function eachVectorRow (array_function) {
		var y = new Matrix(0);
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(var row = 0; row < this.row_length; row++) {
			var row_array = new Array(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			var row_output = array_function(row_array);
			y._resize(y.row_length, Math.max(y.column_length, row_output.length));
			for(var col$1 = 0; col$1 < row_output.length; col$1++) {
				y.matrix_array[row][col$1] = row_output[col$1];
			}
		}
		return y;
	};

	/**
		 * 行列の列をベクトルとみなし同一処理を実行
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.eachVectorColumn = function eachVectorColumn (array_function) {
		var y = new Matrix(0);
		// 列ごとに処理を行う
		y._resize(1, this.column_length);
		for(var col = 0; col < this.column_length; col++) {
			var col_array = new Array(this.row_length);
			for(var row = 0; row < this.row_length; row++) {
				col_array[row] = this.matrix_array[row][col];
			}
			var col_output = array_function(col_array);
			y._resize(Math.max(y.row_length, col_output.length), y.column_length);
			for(var row$1 = 0; row$1 < col_output.length; row$1++) {
				y.matrix_array[row$1][col] = col_output[row$1];
			}
		}
		return y;
	};

	/**
		 * 引数に設定された行／列をベクトルとみなし同一処理を実行
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @param {string|number} [dimtype="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.eachVector = function eachVector (array_function, dimtype) {
		var target = dimtype !== undefined ? dimtype : "auto";
		if(typeof target === "string") {
			target = target.toLocaleLowerCase();
		}
		else if(typeof target !== "number") {
			target = Matrix._toInteger(target);
		}
		if((target === "auto") || (target === 0)) {
			return this.eachVectorAuto(array_function);
		}
		else if((target === "row") || (target === 1)) {
			return this.eachVectorRow(array_function);
		}
		else if((target === "column") || (target === 2)) {
			return this.eachVectorColumn(array_function);
		}
		else if((target === "both") || (target === 3)) {
			return this.eachVectorBoth(array_function);
		}
		else {
			throw "eachVector argument " + dimtype;
		}
	};

	/**
		 * 行列内の指定した箇所の行列
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 抽出する行番号が入ったベクトル,":"で全ての行抽出
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 抽出する列番号が入ったベクトル,":"で全ての列抽出
		 * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
		 * @returns {Matrix} 
		 */
	Matrix.prototype.getMatrix = function getMatrix (row, col, isUpOffset) {
			if ( isUpOffset === void 0 ) isUpOffset=false;

		var geta = isUpOffset ? 1 : 0 ;
		var row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		var col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		var x = this.matrix_array;
		var y = new Array(row_array.length);
		for(var row$1 = 0; row$1 < row_array.length; row$1++) {
			var y_row = new Array(col_array.length);
			for(var col$1 = 0; col$1 < col_array.length; col$1++) {
				y_row[col$1] = x[row_array[row$1] - geta][col_array[col$1] - geta];
			}
			y[row$1] = y_row;
		}
		return new Matrix(y);
	};

	/**
		 * 行列内の指定した箇所の値を変更する
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 変更する行番号が入ったベクトル,":"で全ての行抽出
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 変更する列番号が入ったベクトル,":"で全ての列抽出
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} replace - 変更内容の行列
		 * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
		 * @returns {Matrix} 
		 */
	Matrix.prototype.setMatrix = function setMatrix (row, col, replace, isUpOffset) {
			if ( isUpOffset === void 0 ) isUpOffset=false;

		var geta = isUpOffset ? 1 : 0 ;
		var row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		var col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		var Y = new Matrix(this);
		var y = Y.matrix_array;
		var X = Matrix._toMatrix(replace);
		var x = X.matrix_array;
		for(var row$1 = 0; row$1 < row_array.length; row$1++) {
			for(var col$1 = 0; col$1 < col_array.length; col$1++) {
				y[row_array[row$1] - geta][col_array[col$1] - geta] = x[row$1 % X.row_length][col$1 % X.column_length];
			}
		}
		return new Matrix(y);
	};

	/**
		 * 行列内の指定した箇所の値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_or_pos - 行列なら行番号, ベクトルの場合は値の位置番号
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [col] - 列番号（行列の場合は指定する）
		 * @returns {Complex} 
		 */
	Matrix.prototype.getComplex = function getComplex (row_or_pos, col) {
		var row_or_pos_scalar = null;
		var col_scalar = null;
		if(arguments.length === 1) {
			row_or_pos_scalar = Matrix._toInteger(row_or_pos);
		}
		else if(arguments.length === 2) {
			row_or_pos_scalar = Matrix._toInteger(row_or_pos);
			col_scalar = Matrix._toInteger(col);
		}
		if(this.isRow()) {
			return this.matrix_array[0][row_or_pos_scalar];
		}
		else if(this.isColumn()) {
			return this.matrix_array[row_or_pos_scalar][0];
		}
		else {
			return this.matrix_array[row_or_pos_scalar][col_scalar];
		}
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の基本操作、基本情報の取得
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * 行列の最初の要素の整数値
		 * @returns {number}
		 */
	prototypeAccessors$2.intValue.get = function () {
		return (this.matrix_array[0][0].real) | 0;
	};

	/**
		 * 行列の最初の要素の実数値
		 * @returns {number}
		 */
	prototypeAccessors$2.doubleValue.get = function () {
		return this.matrix_array[0][0].real;
	};

	/**
		 * 行列の最初の要素
		 * @returns {Complex}
		 */
	prototypeAccessors$2.scalar.get = function () {
		return this.matrix_array[0][0];
	};

	/**
		 * 行数及び列数の最大値
		 * @returns {number}
		 */
	prototypeAccessors$2.length.get = function () {
		return this.row_length > this.column_length ? this.row_length : this.column_length;
	};

	/**
		 * 1ノルム
		 * @returns {number}
		 */
	prototypeAccessors$2.norm1.get = function () {
		return LinearAlgebra.norm(this, 1);
	};
		
	/**
		 * 2ノルム
		 * @returns {number}
		 */
	prototypeAccessors$2.norm2.get = function () {
		return LinearAlgebra.norm(this, 2);
	};

	/**
		 * pノルム
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	Matrix.prototype.norm = function norm (p) {
		return LinearAlgebra.norm(this, p);
	};

	/**
		 * 条件数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	Matrix.prototype.cond = function cond (p) {
		return LinearAlgebra.cond(this, p);
	};

	/**
		 * 1ノルムの条件数の逆数
		 * @returns {number}
		 */
	Matrix.prototype.rcond = function rcond () {
		return LinearAlgebra.rcond(this);
	};

	/**
		 * ランク
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {number} rank(A)
		 */
	Matrix.prototype.rank = function rank (epsilon) {
		return LinearAlgebra.rank(this, epsilon);
	};

	/**
		 * トレース
		 * @returns {Complex} trace(A)
		 */
	Matrix.prototype.trace = function trace () {
		return LinearAlgebra.trace(this);
	};

	/**
		 * 行列式
		 * @returns {Matrix} |A|
		 */
	Matrix.prototype.det = function det () {
		return LinearAlgebra.det(this);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の作成関係
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * 指定した数値で初期化
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 初期値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.memset = function memset (number, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		var M = Matrix._toMatrix(number);
		if(!M.isScalar()) {
			var x = M.matrix_array;
			var x_row_length = M.row_length;
			var x_column_length = M.column_length;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				return x[row % x_row_length][col % x_column_length];
			}, dimension, column_length);
		}
		else {
			var x$1 = M.scalar;
			return Matrix.createMatrixDoEachCalculation(function() {
				return x$1;
			}, dimension, column_length);
		}
	};

	/**
		 * 単位行列を生成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.eye = function eye (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return row === col ? Complex.ONE : Complex.ZERO;
		}, dimension, column_length);
	};
		
	/**
		 * 零行列を生成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.zeros = function zeros (dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ZERO, dimension, column_length);
	};

	/**
		 * 1で構成した行列を生成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.ones = function ones (dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ONE, dimension, column_length);
	};

	/**
		 * 乱数で構成した行列を生成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.rand = function rand (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.rand();
		}, dimension, column_length);
	};

	/**
		 * 正規分布に従う乱数で構成した行列を生成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
		 * @returns {Matrix}
		 */
	Matrix.randn = function randn (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.randn();
		}, dimension, column_length);
	};

	/**
		 * 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
		 * @returns {Matrix} 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
		 */
	Matrix.prototype.diag = function diag () {
		if(this.isVector()) {
			// 行列を作成
			var M = this;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				if(row === col) {
					return M.getComplex(row);
				}
				else {
					return Complex.ZERO;
				}
			}, this.length);
		}
		else {
			// 列ベクトルを作成
			var len = Math.min(this.row_length, this.column_length);
			var y = new Array(len);
			for(var i = 0; i < len; i++) {
				y[i] = new Array(1);
				y[i][0] = this.matrix_array[i][i];
			}
			return new Matrix(y);
		}
	};

	// TODO 行列の結合がほしい

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 比較や判定
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * スカラー値の判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isScalar = function isScalar () {
		return this.row_length === 1 && this.column_length == 1;
	};
		
	/**
		 * 行ベクトル／横ベクトルの判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isRow = function isRow () {
		return this.row_length === 1;
	};
		
	/**
		 * 列ベクトル／縦ベクトルの判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isColumn = function isColumn () {
		return this.column_length === 1;
	};

	/**
		 * ベクトルの判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isVector = function isVector () {
		return this.row_length === 1 || this.column_length === 1;
	};

	/**
		 * 行列の判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isMatrix = function isMatrix () {
		return this.row_length !== 1 && this.column_length !== 1;
	};

	/**
		 * 正方行列の判定
		 * @returns {boolean}
		 */
	Matrix.prototype.isSquare = function isSquare () {
		return this.row_length === this.column_length;
	};

	/**
		 * 実行列の判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isReal = function isReal (epsilon) {
		var is_real = true;
		this._each(function(num){
			if(is_real && (num.isComplex(epsilon))) {
				is_real = false;
			}
		});
		return is_real;
	};

	/**
		 * 複素行列の判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isComplex = function isComplex (epsilon) {
		return !this.isReal(epsilon);
	};

	/**
		 * 零行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isZeros = function isZeros (epsilon) {
		var is_zeros = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num){
			if(is_zeros && (!num.isZero(tolerance))) {
				is_zeros = false;
			}
		});
		return is_zeros;
	};

	/**
		 * 単位行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isIdentity = function isIdentity (epsilon) {
		var is_identity = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_identity) {
				if(row === col) {
					if(!num.isOne(tolerance)) {
						is_identity = false;
					}
				}
				else {
					if(!num.isZero(tolerance)) {
						is_identity = false;
					}
				}
			}
		});
		return is_identity;
	};

	/**
		 * 対角行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isDiagonal = function isDiagonal (epsilon) {
		var is_diagonal = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_diagonal && (row !== col) && (!num.isZero(tolerance))) {
				is_diagonal = false;
			}
		});
		return is_diagonal;
	};
		
	/**
		 * 三重対角行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isTridiagonal = function isTridiagonal (epsilon) {
		var is_tridiagonal = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_tridiagonal && (Math.abs(row - col) > 1) && (!num.isZero(tolerance))) {
				is_tridiagonal = false;
			}
		});
		return is_tridiagonal;
	};

	/**
		 * 正則行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isRegular = function isRegular (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		// ランクが行列の次元と等しいかどうかで判定
		// det(M) != 0 でもよいが、時間がかかる可能性があるので
		// 誤差は自動で計算など本当はもうすこし良い方法を考える必要がある
		var tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.rank(tolerance) === this.row_length);
	};

	/**
		 * 直行行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isOrthogonal = function isOrthogonal (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.mul(this.transpose()).isIdentity(tolerance));
	};

	/**
		 * ユニタリ行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isUnitary = function isUnitary (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.mul(this.ctranspose()).isIdentity(tolerance));
	};

	/**
		 * 対称行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isSymmetric = function isSymmetric (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance = epsilon ? epsilon : 1.0e-10;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = row + 1; col < this.column_length; col++) {
				if(!this.matrix_array[row][col].equals(this.matrix_array[col][row], tolerance)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
		 * エルミート行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isHermitian = function isHermitian (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance = epsilon ? epsilon : 1.0e-10;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = row; col < this.column_length; col++) {
				if(row === col) {
					if(!this.matrix_array[row][col].isReal(tolerance)) {
						return false;
					}
				}
				else if(!this.matrix_array[row][col].equals(this.matrix_array[col][row].conj(), tolerance)) {
					return false;
				}
			}
		}
		return true;
	};
		
	/**
		 * 上三角行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isTriangleUpper = function isTriangleUpper (epsilon) {
		var is_upper = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_upper && (row > col) && (!num.isZero(tolerance))) {
				is_upper = false;
			}
		});
		return is_upper;
	};

	/**
		 * 下三角行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isTriangleLower = function isTriangleLower (epsilon) {
		var is_lower = true;
		var tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_lower && (row < col) && (!num.isZero(tolerance))) {
				is_lower = false;
			}
		});
		return is_lower;
	};

	/**
		 * 置換行列を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {boolean}
		 */
	Matrix.prototype.isPermutation = function isPermutation (epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance = epsilon ? epsilon : 1.0e-10;
		var is_row = new Array(this.row_length);
		var is_col = new Array(this.column_length);
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				var target = this.matrix_array[row][col];
				if(target.isOne(tolerance)) {
					if(!is_row[row] && !is_col[col]) {
						is_row[row] = 1;
						is_col[col] = 1;
					}
					else {
						return false;
					}
				}
				else if(!target.isZero(tolerance)) {
					return false;
				}
			}
		}
		for(var i = 0;i < this.row_length; i++) {
			if(is_row[i] === undefined || is_col[i] === undefined) {
				return false;
			}
		}
		return true;
	};

	/**
		 * 行列の行数と列数
		 * @returns {Matrix} [row_length column_length]
		 */
	Matrix.prototype.size = function size () {
		// 行列のサイズを取得
		return new Matrix([[this.row_length, this.column_length]]);
	};

	/**
		 * 値同士を比較
		 * スカラー同士の場合の戻り値は、number型。
		 * 行列同士の場合は、各項の比較結果が入った、Matrix型。
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {number|Matrix} A > B ? 1 : (A === B ? 0 : -1)
		 */
	Matrix.prototype.compareTo = function compareTo (number, epsilon) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		// ※スカラー同士の場合は、実数を返す
		if(M1.isScalar() && M2.isScalar()) {
			return M1.scalar.compareTo(M2.scalar, epsilon);
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].compareTo(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 四則演算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * 加算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A + B
		 */
	Matrix.prototype.add = function add (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].add(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * 減算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A - B
		 */
	Matrix.prototype.sub = function sub (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].sub(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * 乗算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A * B
		 */
	Matrix.prototype.mul = function mul (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.mul(M2.scalar));
		}
		if(M1.isScalar()) {
			var y = new Array(M2.row_length);
			for(var row = 0; row < M2.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(var col = 0; col < M2.column_length; col++) {
					y[row][col] = M1.scalar.mul(x2[row][col]);
				}
			}
			return new Matrix(y);
		}
		else if(M2.isScalar()) {
			var y$1 = new Array(M1.row_length);
			for(var row$1 = 0; row$1 < M1.row_length; row$1++) {
				y$1[row$1] = new Array(M1.column_length);
				for(var col$1 = 0; col$1 < M1.column_length; col$1++) {
					y$1[row$1][col$1] = x1[row$1][col$1].mul(M2.scalar);
				}
			}
			return new Matrix(y$1);
		}
		if(M1.column_length !== M2.row_length) {
			throw "Matrix size does not match";
		}
		{
			var y$2 = new Array(M1.row_length);
			for(var row$2 = 0; row$2 < M1.row_length; row$2++) {
				y$2[row$2] = new Array(M2.column_length);
				for(var col$2 = 0; col$2 < M2.column_length; col$2++) {
					var sum = Complex.ZERO;
					for(var i = 0; i < M1.column_length; i++) {
						sum = sum.add(x1[row$2][i].mul(x2[i][col$2]));
					}
					y$2[row$2][col$2] = sum;
				}
			}
			return new Matrix(y$2);
		}
	};

	/**
		 * 割り算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A / B
		 */
	Matrix.prototype.div = function div (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		var x1 = M1.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.div(M2.scalar));
		}
		if(M2.isScalar()) {
			var y = new Array(M1.row_length);
			for(var row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(var col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].div(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M2.row_length === M2.column_length) {
			var epsilon = 1.0e-10;
			var det = M2.det().scalar.norm;
			if(det > epsilon) {
				// ランク落ちしていないので通常の逆行列を使用する
				return this.mul(M2.inv());
			}
			else {
				// ランク落ちしているので疑似逆行列を使用する
				return this.mul(M2.pinv());
			}
		}
		if(M1.column_length !== M2.column_length) {
			throw "Matrix size does not match";
		}
		throw "warning";
	};

	/**
		 * 整数での累乗
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 整数
		 * @returns {Matrix} pow(A, B)
		 */
	Matrix.prototype.pow = function pow (number) {
		if(!this.isSquare()) {
			throw "not square " + this;
		}
		var n = Matrix._toInteger(number);
		if(n < 0) {
			throw "error negative number " + n;
		}
		var x, y;
		x = this.clone();
		y = Matrix.eye(this.length);
		while(n !== 0) {
			if((n & 1) !== 0) {
				y = y.mul(x);
			}
			x = x.mul(x);
			n >>>= 1;
		}
		return y;
	};

	/**
		 * 行列の各項ごとの掛け算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .* B
		 */
	Matrix.prototype.nmul = function nmul (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mul(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * 行列の各項ごとの割り算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A ./ B
		 */
	Matrix.prototype.ndiv = function ndiv (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].div(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * 行列の各項ごとの逆数
		 * @returns {Matrix} 1 ./ A
		 */
	Matrix.prototype.ninv = function ninv () {
		var M1 = this;
		var x1 = M1.matrix_array;
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row][col].inv();
		}, M1.row_length, M1.column_length);
	};

	/**
		 * 行列の各項ごとの累乗
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .^ B
		 */
	Matrix.prototype.npow = function npow (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].pow(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// Complexのメソッドにある機能
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * 各項の実部
		 * @returns {Matrix} real(A)
		 */
	Matrix.prototype.real = function real () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.real);
		});
	};
		
	/**
		 * 各項の虚部
		 * @returns {Matrix} imag(A)
		 */
	Matrix.prototype.imag = function imag () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.imag);
		});
	};

	/**
		 * 各項の偏角
		 * @returns {Matrix} arg(A)
		 */
	Matrix.prototype.arg = function arg () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.arg);
		});
	};

	/**
		 * 各項の符号値
		 * @returns {Matrix} [-1,1] 複素数の場合はノルムを1にした値。
		 */
	Matrix.prototype.sign = function sign () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.sign());
		});
	};

	/**
		 * 各項の整数を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testInteger = function testInteger (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInteger(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の複素整数を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testComplexInteger = function testComplexInteger (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplexInteger(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の 0 を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testZero = function testZero (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isZero(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の 1 を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testOne = function testOne (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isOne(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};
		
	/**
		 * 各項の複素数を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testComplex = function testComplex (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplex(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の実数を判定
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testReal = function testReal (epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isReal(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の非数を判定
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testNaN = function testNaN () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNaN() ? Complex.ONE : Complex.ZERO;
		});
	};


	/**
		 * real(x) > 0
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testPositive = function testPositive () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositive() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(x) < 0
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testNegative = function testNegative () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegative() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(x) >= 0
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testNotNegative = function testNotNegative () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNotNegative() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 各項の無限を判定
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testInfinite = function testInfinite () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInfinite() ? Complex.ONE : Complex.ZERO;
		});
	};
		
	/**
		 * 各項の有限数を判定
		 * @returns {Matrix} 1 or 0 で構成された行列
		 */
	Matrix.prototype.testFinite = function testFinite () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isFinite() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * 絶対値
		 * @returns {Matrix} abs(A)
		 */
	Matrix.prototype.abs = function abs () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.abs();
		});
	};

	/**
		 * 複素共役行列
		 * @returns {Matrix} real(A) - imag(A)j
		 */
	Matrix.prototype.conj = function conj () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.conj();
		});
	};

	/**
		 * 負数
		 * @returns {Matrix} -A
		 */
	Matrix.prototype.negate = function negate () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.negate();
		});
	};

	/**
		 * 平方根
		 * @returns {Matrix} sqrt(A)
		 */
	Matrix.prototype.sqrt = function sqrt () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sqrt();
		});
	};

	/**
		 * 対数
		 * @returns {Matrix} log(A)
		 */
	Matrix.prototype.log = function log () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log();
		});
	};

	/**
		 * 指数
		 * @returns {Matrix} exp(A)
		 */
	Matrix.prototype.exp = function exp () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.exp();
		});
	};

	/**
		 * sin
		 * @returns {Matrix} sin(A)
		 */
	Matrix.prototype.sin = function sin () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sin();
		});
	};

	/**
		 * cos
		 * @returns {Matrix} cos(A)
		 */
	Matrix.prototype.cos = function cos () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cos();
		});
	};

	/**
		 * tan
		 * @returns {Matrix} tan(A)
		 */
	Matrix.prototype.tan = function tan () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tan();
		});
	};
		
	/**
		 * atan
		 * @returns {Matrix} atan(A)
		 */
	Matrix.prototype.atan = function atan () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan();
		});
	};

	/**
		 * atan2
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - スカラー
		 * @returns {Matrix} atan2(Y, X)
		 */
	Matrix.prototype.atan2 = function atan2 (number) {
		var X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan2(X);
		});
	};

	/**
		 * floor
		 * @returns {Matrix} floor(A)
		 */
	Matrix.prototype.floor = function floor () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.floor();
		});
	};

	/**
		 * ceil
		 * @returns {Matrix} ceil(A)
		 */
	Matrix.prototype.ceil = function ceil () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.ceil();
		});
	};

	/**
		 * 四捨五入
		 * @returns {Matrix} round(A)
		 */
	Matrix.prototype.round = function round () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.round();
		});
	};

	/**
		 * 整数化
		 * @returns {Matrix} fix(A)
		 */
	Matrix.prototype.fix = function fix () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fix();
		});
	};

	/**
		 * 小数部の抽出
		 * @returns {Matrix} fract(A)
		 */
	Matrix.prototype.fract = function fract () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fract();
		});
	};

	/**
		 * sinc
		 * @returns {Matrix} sinc(A)
		 */
	Matrix.prototype.sinc = function sinc () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinc();
		});
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の計算でよく使用する処理。
	// メソッド内部の処理を記述する際に使用している。
	// 他から使用する場合は注意が必要である。
	// 前提条件があるメソッド、ミュータブルとなっている。
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * 行列を時計回りに回転
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - 回転する回数
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._rot90 = function _rot90 (rot_90_count) {
		var count = Matrix._toInteger(rot_90_count);
		var rot_type = 1;
		if(arguments.length === 1) {
			rot_type = ((count % 4) + 4) % 4;
		}
		if(rot_type === 0) {
			return this;
		}
		// バックアップ
		var x = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			x[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				x[i][j] = this.matrix_array[i][j];
			}
		}
		var y = this.matrix_array;
		if(rot_type === 1) {
			// 90度回転
			y.splice(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(var row = 0; row < this.row_length; row++) {
					y[col][row] = x[this.row_length - row - 1][col];
				}
			}
		}
		else if(rot_type === 2) {
			// 180度回転
			for(var row$1 = 0; row$1 < this.row_length; row$1++) {
				for(var col$1 = 0; col$1 < this.column_length; col$1++) {
					y[row$1][col$1] = x[this.row_length - row$1 - 1][this.column_length - col$1 - 1];
				}
			}
		}
		else if(rot_type === 3) {
			// 270度回転
			y.splice(this.column_length);
			for(var col$2 = 0; col$2 < this.column_length; col$2++) {
				if(col$2 < this.row_length) {
					y[col$2].splice(this.row_length);
				}
				else {
					y[col$2] = new Array(this.row_length);
				}
				for(var row$2 = 0; row$2 < this.row_length; row$2++) {
					y[col$2][row$2] = x[row$2][this.column_length - col$2 - 1];
				}
			}
		}
		this.row_length = y.length;
		this.column_length = y[0].length;
		this._clearCash();
		return this;
	};

	/**
		 * 行列を時計回りに回転
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - 回転する回数
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.rot90 = function rot90 (rot_90_count) {
		return this.clone()._rot90(rot_90_count);
	};

	/**
		 * 行列を拡張、拡張した項は、0で初期化。
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_row_length - 新しい行の長さ
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_column_length - 新しい列の長さ
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._resize = function _resize (new_row_length, new_column_length) {
		var row_length= Matrix._toInteger(new_row_length);
		var column_length= Matrix._toInteger(new_column_length);
		if((row_length === this.row_length) && (column_length === this.column_length)) {
			return this;
		}
		if((row_length <= 0) || (column_length <= 0)) {
			throw "_resize";
		}
		var row_max = Math.max(this.row_length, row_length);
		var col_max = Math.max(this.column_length, column_length);
		var y = this.matrix_array;
		// 大きくなった行と列に対してゼロで埋める
		for(var row = 0; row < row_max; row++) {
			if(row >= this.row_length) {
				y[row] = new Array(col_max);
			}
			for(var col = 0; col < col_max; col++) {
				if((row >= this.row_length) || (col >= this.column_length)) {
					y[row][col] = Complex.ZERO;
				}
			}
		}
		// 小さくなった行と列を削除する
		if(this.row_length > row_length) {
			y.splice(row_length);
		}
		if(this.column_length > column_length) {
			for(var row$1 = 0; row$1 < y.length; row$1++) {
				y[row$1].splice(column_length);
			}
		}
		this.row_length = row_length;
		this.column_length = column_length;
		this._clearCash();
		return this;
	};

	/**
		 * 行列を拡張、拡張した項は、0で初期化
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - 新しい行の長さ
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - 新しい列の長さ
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.resize = function resize (row_length, column_length) {
		return this.clone()._resize(row_length, column_length);
	};

	/**
		 * 行列内の行を消去
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - 行番号
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._deleteRow = function _deleteRow (delete_row_index) {
		var row_index= Matrix._toInteger(delete_row_index);
		if((this.row_length === 1) || (this.row_length <= row_index)) {
			throw "_deleteRow";
		}
		this.matrix_array.splice(row_index, 1);
		this.row_length--;
		this._clearCash();
		return this;
	};
		
	/**
		 * 行列内の列を消去
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - 列番号
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._deleteColumn = function _deleteColumn (delete_column_index) {
		var column_index= Matrix._toInteger(delete_column_index);
		if((this.column_length === 1) || (this.column_length <= column_index)) {
			throw "_deleteColumn";
		}
		for(var row = 0; row < this.row_length; row++) {
			this.matrix_array[row].splice(column_index, 1);
		}
		this.column_length--;
		this._clearCash();
		return this;
	};

	/**
		 * 行列内の行を消去
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - 行番号
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.deleteRow = function deleteRow (delete_row_index) {
		return this.clone()._deleteRow(delete_row_index);
	};

	/**
		 * 行列内の列を消去
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - 列番号
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.deleteColumn = function deleteColumn (delete_column_index) {
		return this.clone()._deleteColumn(delete_column_index);
	};

	/**
		 * 行列内の行を交換
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - 行番号1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - 行番号2
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._exchangeRow = function _exchangeRow (exchange_row_index1, exchange_row_index2) {
		var row_index1= Matrix._toInteger(exchange_row_index1);
		var row_index2= Matrix._toInteger(exchange_row_index2);
		if((this.row_length === 1) || (this.row_length <= row_index1) || (this.row_length <= row_index2)) {
			throw "_exchangeRow";
		}
		if(row_index1 === row_index2) {
			return this;
		}
		var swap = this.matrix_array[row_index1];
		this.matrix_array[row_index1] = this.matrix_array[row_index2];
		this.matrix_array[row_index2] = swap;
		this._clearCash();
		return this;
	};

	/**
		 * 行列内の列を交換
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - 行番号1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - 行番号2
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._exchangeColumn = function _exchangeColumn (exchange_column_index1, exchange_column_index2) {
		var column_index1= Matrix._toInteger(exchange_column_index1);
		var column_index2= Matrix._toInteger(exchange_column_index2);
		if((this.column_length === 1) || (this.column_length <= column_index1) || (this.column_length <= column_index2)) {
			throw "_exchangeColumn";
		}
		if(column_index1 === column_index2) {
			return this;
		}
		for(var row = 0; row < this.row_length; row++) {
			var swap = this.matrix_array[row][column_index1];
			this.matrix_array[row][column_index1] = this.matrix_array[row][column_index2];
			this.matrix_array[row][column_index2] = swap;
		}
		this._clearCash();
		return this;
	};

	/**
		 * 行列内の行を交換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - 行番号1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - 行番号2
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.exchangeRow = function exchangeRow (exchange_row_index1, exchange_row_index2) {
		return this.clone()._exchangeRow(exchange_row_index1, exchange_row_index2);
	};

	/**
		 * 行列内の列を交換
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - 行番号1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - 行番号2
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.exchangeColumn = function exchangeColumn (exchange_column_index1, exchange_column_index2) {
		return this.clone()._exchangeColumn(exchange_column_index1, exchange_column_index2);
	};

	/**
		 * 行列の右に行列を結合
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - 結合したい行列
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._concatRight = function _concatRight (left_matrix) {
		var M = Matrix._toMatrix(left_matrix);
		if(this.row_length != M.row_length) {
			throw "_concatRight";
		}
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < M.column_length; col++) {
				this.matrix_array[row].push(M.matrix_array[row][col]);
			}
		}
		this.column_length += M.column_length;
		this._clearCash();
		return this;
	};

	/**
		 * 行列の下に行列を結合
		 * ミュータブル
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - 結合したい行列
		 * @returns {Matrix} 処理実行後の行列
		 * @private
		 */
	Matrix.prototype._concatBottom = function _concatBottom (bottom_matrix) {
		var M = Matrix._toMatrix(bottom_matrix);
		if(this.column_length != M.column_length) {
			throw "_concatBottom";
		}
		for(var row = 0; row < M.row_length; row++) {
			this.matrix_array.push(M.matrix_array[row]);
		}
		this.row_length += M.row_length;
		this._clearCash();
		return this;
	};

	/**
		 * 行列の右に行列を結合
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - 結合したい行列
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.concatRight = function concatRight (left_matrix) {
		return this.clone()._concatRight(left_matrix);
	};

	/**
		 * 行列の下に行列を結合
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - 結合したい行列
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.concatBottom = function concatBottom (bottom_matrix) {
		return this.clone()._concatBottom(bottom_matrix);
	};

	/**
		 * 行列の各項を指定した範囲に収める
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} min 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} max 
		 * @returns {Matrix} min(max(x, min), max)
		 */
	Matrix.prototype.clip = function clip (min, max) {
		var MIN = Matrix._toMatrix(min);
		var MAX = Matrix._toMatrix(max);
		var x_min = MIN.matrix_array;
		var x_max = MAX.matrix_array;
		return this.cloneMatrixDoEachCalculation(
			function(num, row, col) {
				var d_min = x_min[row % MIN.row_length][col % MIN.column_length];
				var d_max = x_max[row % MAX.row_length][col % MAX.column_length];
				return num.clip(d_min, d_max);
			}
		);
	};

	/**
		 * 指定した初期値、ステップ値、終了条件で行ベクトルを作成
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} start_or_stop 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [stop]
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [step=1] 
		 * @returns {Matrix}
		 */
	Matrix.arange = function arange (start_or_stop, stop, step) {
		var from  = stop !== undefined ? Matrix._toComplex(start_or_stop) : Complex.ZERO;
		var to    = stop !== undefined ? Matrix._toComplex(stop) : Matrix._toComplex(start_or_stop);
		var delta = step !== undefined ? Matrix._toComplex(step) : Complex.ONE;
		return new Matrix(MatrixTool.InterpolationCalculation(from, delta, to, false));
	};

	/**
		 * 循環シフト
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size 
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.circshift = function circshift (shift_size, type) {
		var shift = Matrix._toInteger(shift_size);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var y = new Array(data.length);
			var from = ((- shift % data.length) + data.length) % data.length;
			for(var i = 0; i < data.length; i++) {
				y[i] = data[from++];
				if(from === data.length) {
					from = 0;
				}
			}
			return y;
		};
		return this.eachVector(main, dim);
	};

	/**
		 * 循環シフト
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size 
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.roll = function roll (shift_size, type) {
		return this.circshift(shift_size, type);
	};

	/**
		 * 行列の形状を変更
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - 新しい行の長さ
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - 新しい列の長さ
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.reshape = function reshape (row_length, column_length) {
		var new_row_length = Matrix._toInteger(row_length);
		var new_column_length = Matrix._toInteger(column_length);
		var this_size = this.row_length * this.column_length;
		var new_size = new_row_length * new_column_length;
		if(this_size !== new_size) {
			throw "reshape error. (this_size !== new_size)->(" + this_size + " !== " + new_size + ")";
		}
		var m = this.matrix_array;
		var m_col = 0;
		var m_row = 0;
		var y = new Array(new_row_length);
		for(var row = 0; row < new_row_length; row++) {
			y[row] = new Array(new_column_length);
			for(var col = 0; col < new_column_length; col++) {
				y[row][col] = m[m_row][m_col];
				m_col++;
				if(m_col === this.column_length) {
					m_col = 0;
					m_row++;
				}
			}
		}
		return new Matrix(y);
	};

	/**
		 * 行列を左右反転
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.fliplr = function fliplr () {
		return this.flip({dimension : "row"});
	};

	/**
		 * 行列を上下反転
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.flipud = function flipud () {
		return this.flip({dimension : "column"});
	};

	/**
		 * 行列を反転
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.flip = function flip (type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var y = new Array(data.length);
			for(var i = 0, j = data.length - 1; i < data.length; i++, j--) {
				y[i] = data[j];
			}
			return y;
		};
		return this.eachVector(main, dim);
	};

	/**
		 * インデックスソート
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - インデックス（列 or 行）ベクトル
		 * @returns {Matrix} 処理実行後の行列
		 */
	Matrix.prototype.indexsort = function indexsort (v) {
		var V = Matrix._toMatrix(v);
		if(V.isMatrix()) {
			throw "argsort error. argsort is not vector. (" + V.toOneLineString + ")";
		}
		var is_transpose = false;
		var target_array = null;
		var index_array = null;
		if(V.isRow()) {
			if(this.column_length !== V.column_length) {
				throw "argsort error. (this_size !== new_size)->(" + this.column_length + " !== " + V.column_length + ")";
			}
			// 列をインデックスソートする
			is_transpose = true;
			target_array = this.transpose().matrix_array;
			index_array = V.matrix_array[0];
		}
		if(V.isColumn()) {
			if(this.row_length !== V.row_length) {
				throw "argsort error. (this_size !== new_size)->(" + this.row_length + " !== " + V.row_length + ")";
			}
			// 行をインデックスソートする
			target_array = this.matrix_array;
			index_array = V.transpose().matrix_array[0];
		}
		// データを付け替える
		var sort_data = new Array(index_array.length);
		for(var i = 0; i < index_array.length; i++) {
			sort_data[i] = {
				index : index_array[i],
				data : target_array[i]
			};
		}
		// 比較関数を作成
		var compare = function(a, b) {
			return a.index.compareTo(b.index);
		};
		{
			var temp = [];
			// ソート関数（安定マージソート）
			var sort = function(elements, first, last, cmp_function) { 
				if(first < last) {
					var middle = Math.floor((first + last) / 2);
					sort(elements, first, middle, cmp_function);
					sort(elements, middle + 1, last, cmp_function);
					var p = 0, i, j, k;
					for(i = first; i <= middle; i++) {
						temp[p++] = elements[i];
					}
					i = middle + 1;
					j = 0;
					k = first;
					while((i <= last) && (j < p)) {
						if(cmp_function(elements[i], temp[j]) >= 0) {
							elements[k++] = temp[j++];
						}
						else {
							elements[k++] = elements[i++];
						}
					}
					while(j < p) {
						elements[k++] = temp[j++];
					}
				}
				return true;
			};
			sort(sort_data, 0, sort_data.length - 1, compare);
		}
		// 行列を組み立てなおす
		var y = new Array(index_array.length);
		for(var i$1 = 0; i$1 < index_array.length; i$1++) {
			y[i$1] = sort_data[i$1].data;
		}
		// 行列を作成する
		var Y = new Matrix(y);
		if(!is_transpose) {
			return Y;
		}
		else {
			return Y.transpose();
		}
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の一般計算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * 転置行列
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.transpose = function transpose () {
		var y = new Array(this.column_length);
		for(var col = 0; col < this.column_length; col++) {
			y[col] = new Array(this.row_length);
			for(var row = 0; row < this.row_length; row++) {
				y[col][row] = this.matrix_array[row][col];
			}
		}
		return new Matrix(y);
	};

	/**
		 * エルミート転置行列
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.ctranspose = function ctranspose () {
		return this.transpose().conj();
	};

	/**
		 * エルミート転置行列
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.T = function T () {
		return this.ctranspose();
	};

	/**
		 * ドット積
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] 計算するときに使用する次元（1 or 2）
		 * @returns {Matrix} A・B
		 */
	Matrix.prototype.inner = function inner (number, dimension) {
			if ( dimension === void 0 ) dimension=1;

		return LinearAlgebra.inner(this, number, dimension);
	};
		
	/**
		 * LUP分解
		 * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
		 */
	Matrix.prototype.lup = function lup () {
		return LinearAlgebra.lup(this);
	};

	/**
		 * LU分解
		 * @returns {{L: Matrix, U: Matrix}} L*U=A
		 */
	Matrix.prototype.lu = function lu () {
		return LinearAlgebra.lu(this);
	};

	/**
		 * 一次方程式を解く
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
		 * @returns {Matrix} Ax=B となる x
		 */
	Matrix.prototype.linsolve = function linsolve (number) {
		return LinearAlgebra.linsolve(this, number);
	};

	/**
		 * QR分解
		 * @returns {{Q: Matrix, R: Matrix}} Q*R=A, Qは正規直行行列、Rは上三角行列
		 */
	Matrix.prototype.qr = function qr () {
		return LinearAlgebra.qr(this);
	};

	/**
		 * 対称行列の三重対角化
		 * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
		 */
	Matrix.prototype.tridiagonalize = function tridiagonalize () {
		return LinearAlgebra.tridiagonalize(this);
	};

	/**
		 * 対称行列の固有値分解
		 * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
		 */
	Matrix.prototype.eig = function eig () {
		return LinearAlgebra.eig(this);
	};

	/**
		 * 特異値分解
		 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
		 */
	Matrix.prototype.svd = function svd () {
		return LinearAlgebra.svd(this);
	};

	/**
		 * 逆行列
		 * @returns {Matrix} A^-1
		 */
	Matrix.prototype.inv = function inv () {
		return LinearAlgebra.inv(this);
	};

	/**
		 * 疑似逆行列
		 * @returns {Matrix} A^+
		 */
	Matrix.prototype.pinv = function pinv () {
		return LinearAlgebra.pinv(this);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// statistics 統計計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * 対数ガンマ関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.gammaln = function gammaln () {
		return Statistics.gammaln(this);
	};

	/**
		 * ガンマ関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.gamma = function gamma () {
		return Statistics.gamma(this);
	};

	/**
		 * 不完全ガンマ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {string} [tail="lower"] - lower/upper
		 * @returns {Matrix}
		 */
	Matrix.prototype.gammainc = function gammainc (a, tail) {
		return Statistics.gammainc(this, a, tail);
	};

	/**
		 * ガンマ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Matrix.prototype.gampdf = function gampdf (k, s) {
		return Statistics.gampdf(this, k, s);
	};

	/**
		 * ガンマ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Matrix.prototype.gamcdf = function gamcdf (k, s) {
		return Statistics.gampdf(this, k, s);
	};

	/**
		 * ガンマ分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
		 * @returns {Matrix}
		 */
	Matrix.prototype.gaminv = function gaminv (k, s) {
		return Statistics.gaminv(this, k, s);
	};

	/**
		 * ベータ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
		 * @returns {Matrix}
		 */
	Matrix.prototype.beta = function beta (y) {
		return Statistics.beta(this, y);
	};
		
	/**
		 * 不完全ベータ関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @param {string} [tail="lower"] - lower/upper
		 * @returns {Matrix}
		 */
	Matrix.prototype.betainc = function betainc (a, b, tail) {
		return Statistics.betainc(this, a, b, tail);
	};

	/**
		 * ベータ分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betacdf = function betacdf (a, b) {
		return Statistics.betacdf(this, a, b);
	};

	/**
		 * ベータ分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betapdf = function betapdf (a, b) {
		return Statistics.betapdf(this, a, b);
	};

	/**
		 * ベータ分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betainv = function betainv (a, b) {
		return Statistics.betainv(this, a, b);
	};

	/**
		 * x! 階乗関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.factorial = function factorial () {
		return Statistics.factorial(this);
	};
		
	/**
		 * nCk 二項係数またはすべての組合わせ
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
		 * @returns {Matrix}
		 */
	Matrix.prototype.nchoosek = function nchoosek (k) {
		return Statistics.nchoosek(this, k);
	};
		
	/**
		 * 誤差関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.erf = function erf () {
		return Statistics.erf(this);
	};

	/**
		 * 相補誤差関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.erfc = function erfc () {
		return Statistics.erfc(this);
	};
		
	/**
		 * 正規分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Matrix.prototype.normpdf = function normpdf (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Statistics.normpdf(this, u, s);
	};

	/**
		 * 正規分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Matrix.prototype.normcdf = function normcdf (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Statistics.normcdf(this, u, s);
	};

	/**
		 * 正規分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
		 * @returns {Matrix}
		 */
	Matrix.prototype.norminv = function norminv (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Statistics.norminv(this, u, s);
	};

	/**
		 * t分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.tpdf = function tpdf (v) {
		return Statistics.tpdf(this, v);
	};

	/**
		 * t分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.tcdf = function tcdf (v) {
		return Statistics.tcdf(this, v);
	};

	/**
		 * t分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.tinv = function tinv (v) {
		return Statistics.tinv(this, v);
	};

	/**
		 * 尾部が指定可能なt分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tdist = function tdist (v, tails) {
		return Statistics.tdist(this, v, tails);
	};

	/**
		 * 両側検定時のt分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.tinv2 = function tinv2 (v) {
		return Statistics.tinv2(this, v);
	};

	/**
		 * カイ二乗分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2pdf = function chi2pdf (k) {
		return Statistics.chi2pdf(this, k);
	};

	/**
		 * カイ二乗分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2cdf = function chi2cdf (k) {
		return Statistics.chi2cdf(this, k);
	};
		
	/**
		 * カイ二乗分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2inv = function chi2inv (k) {
		return Statistics.chi2inv(this, k);
	};

	/**
		 * F分布の確率密度関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.fpdf = function fpdf (d1, d2) {
		return Statistics.fpdf(this, d1, d2);
	};

	/**
		 * F分布の累積分布関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.fcdf = function fcdf (d1, d2) {
		return Statistics.fcdf(this, d1, d2);
	};

	/**
		 * F分布の累積分布関数の逆関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
		 * @returns {Matrix}
		 */
	Matrix.prototype.finv = function finv (d1, d2) {
		return Statistics.finv(this, d1, d2);
	};
		
	/**
		 * 最大値
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} max([A, B])
		 */
	Matrix.prototype.max = function max (type) {
		return Statistics.max(this, type);
	};
		
	/**
		 * 最小値
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} min([A, B])
		 */
	Matrix.prototype.min = function min (type) {
		return Statistics.min(this, type);
	};
		
	/**
		 * 合計
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.sum = function sum (type) {
		return Statistics.sum(this, type);
	};

	/**
		 * 相加平均
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mean = function mean (type) {
		return Statistics.mean(this, type);
	};

	/**
		 * 配列の積
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.prod = function prod (type) {
		return Statistics.prod(this, type);
	};

	/**
		 * 相乗平均／幾何平均
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.geomean = function geomean (type) {
		return Statistics.geomean(this, type);
	};

	/**
		 * 中央値
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.median = function median (type) {
		return Statistics.median(this, type);
	};

	/**
		 * 最頻値
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mode = function mode (type) {
		return Statistics.mode(this, type);
	};

	/**
		 * 中心積率
		 * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.moment = function moment (type) {
		return Statistics.moment(this, type);
	};

	/**
		 * 分散
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.var = function var$1 (type) {
		return Statistics.var(this, type);
	};

	/**
		 * 標準偏差
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.std = function std (type) {
		return Statistics.std(this, type);
	};

	/**
		 * 標準偏差
		 * @param {{dimension : (?string|?number), algorithm : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mad = function mad (type) {
		return Statistics.mad(this, type);
	};

	/**
		 * 歪度
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.skewness = function skewness (type) {
		return Statistics.skewness(this, type);
	};

	/**
		 * 共分散行列
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.cov = function cov (type) {
		return Statistics.cov(this, type);
	};

	/**
		 * 標本の標準化
		 * 平均値0、標準偏差1に変更する
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.normalize = function normalize (type) {
		return Statistics.normalize(this, type);
	};

	/**
		 * 相関行列
		 * @param {{dimension : (?string|?number), correction : ?number}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.corrcoef = function corrcoef (type) {
		return Statistics.corrcoef(this, type);
	};

	/**
		 * ソート
		 * @param {{dimension : (?string|?number), order : ?string}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.sort = function sort (type) {
		return Statistics.sort(this, type);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// signal 信号処理用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * 離散フーリエ変換
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} fft(x)
		 */
	Matrix.prototype.fft = function fft (type) {
		return Signal.fft(this, type);
	};

	/**
		 * 逆離散フーリエ変換
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} ifft(x)
		 */
	Matrix.prototype.ifft = function ifft (type) {
		return Signal.ifft(this, type);
	};

	/**
		 * パワースペクトル密度
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} abs(fft(x)).^2
		 */
	Matrix.prototype.powerfft = function powerfft (type) {
		return Signal.powerfft(this, type);
	};

	/**
		 * 離散コサイン変換
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} dct(x)
		 */
	Matrix.prototype.dct = function dct (type) {
		return Signal.dct(this, type);
	};

	/**
		 * 逆離散コサイン変換
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix} idct(x)
		 */
	Matrix.prototype.idct = function idct (type) {
		return Signal.idct(this, type);
	};

	/**
		 * 2次元の離散フーリエ変換
		 * @returns {Matrix}
		 */
	Matrix.prototype.fft2 = function fft2 () {
		return Signal.fft2(this);
	};

	/**
		 * 2次元の逆離散フーリエ変換
		 * @returns {Matrix}
		 */
	Matrix.prototype.ifft2 = function ifft2 () {
		return Signal.ifft2(this);
	};

	/**
		 * 2次元の離散コサイン変換
		 * @returns {Matrix}
		 */
	Matrix.prototype.dct2 = function dct2 () {
		return Signal.dct2(this);
	};

	/**
		 * 2次元の逆離散コサイン変換
		 * @returns {Matrix}
		 */
	Matrix.prototype.idct2 = function idct2 () {
		return Signal.idct2(this);
	};

	/**
		 * 畳み込み積分、多項式乗算
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.prototype.conv = function conv (number) {
		return Signal.conv(this, number);
	};

	/**
		 * 自己相関関数、相互相関関数
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [number] - 省略した場合は自己相関関数
		 * @returns {Matrix}
		 */
	Matrix.prototype.xcorr = function xcorr (number) {
		return Signal.xcorr(this, number);
	};

	/**
		 * 窓関数
		 * @param {string} name - 窓関数の名前
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Matrix.window = function window (name, size, periodic) {
		return Signal.window(name, size, periodic);
	};

	/**
		 * ハニング窓
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Matrix.hann = function hann (size, periodic) {
		return Signal.hann(size, periodic);
	};
		
	/**
		 * ハミング窓
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
		 * @returns {Matrix} 列ベクトル
		 */
	Matrix.hamming = function hamming (size, periodic) {
		return Signal.hamming(size, periodic);
	};
		
	/**
		 * FFTシフト
		 * @param {{dimension : (?string|?number)}} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.fftshift = function fftshift (type) {
		return Signal.fftshift(this, type);
	};

	Object.defineProperties( Matrix.prototype, prototypeAccessors$2 );

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
	 * Complex 内で使用する乱数生成クラス
	 * @type {Random}
	 * @ignore
	 */
	var random_class = new Random();

	/**
	 * Complex 内で使用する関数群
	 * @ignore
	 */
	var ComplexTool = function ComplexTool () {};

	ComplexTool.ToComplexFromString = function ToComplexFromString (text) {
		var str = text.replace(/\s/g, "").toLowerCase();
		str = str.replace(/infinity|inf/g, "1e100000");
		// 複素数の宣言がない場合
		if(!(/[ij]/.test(str))) {
			return {
				real : parseFloat(str),
				imag : 0.0
			};
		}
		// この時点で複素数である。
		// 以下真面目に調査
		var re = 0;
		var im = 0;
		var buff;
		// 最後が$なら右側が実数、最後が[+-]なら左側が実数
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))($|[+-])/);
		if(buff) {
			re = parseFloat(buff[0]);
		}
		// 複素数は数値が省略される場合がある
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]/);
		if(buff) {
			buff = buff[0].substring(0, buff[0].length - 1);
			// i, +i, -j のように実数部がなく、数値もない場合
			if((/^[-+]$/.test(buff)) || buff.length === 0) {
				im = buff === "-" ? -1 : 1;
			}
			else {
				im = parseFloat(buff);
			}
		}
		return {
			real : re,
			imag : im
		};
	};

	/**
	 * 複素数クラス (immutable)
	 */
	var Complex = function Complex(number) {
		// 行列で使うためイミュータブルは必ず守ること。
		if(arguments.length === 1) {
			var obj = number;
			if(obj instanceof Complex) {
					
				/**
					 * 実部
					 * @private
					 * @type {number}
					 */
				this._re = obj._re;
					
				/**
					 * 虚部
					 * @private
					 * @type {number}
					 */
				this._im = obj._im;
			}
			else if(typeof obj === "number") {
				this._re = obj;
				this._im = 0.0;
			}
			else if(obj instanceof Array) {
				if(obj.length === 2) {
					this._re = obj[0];
					this._im = obj[1];
				}
				else {
					throw "Complex Unsupported argument " + arguments;
				}
			}
			else if(typeof obj === "string") {
				var x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
			}
			else if((obj instanceof Object) && (typeof obj._re === "number") && (typeof obj._im === "number")) {
				this._re = obj._re;
				this._im = obj._im;
			}
			else if(obj instanceof Object) {
				var x$1 = ComplexTool.ToComplexFromString(obj.toString());
				this._re = x$1.real;
				this._im = x$1.imag;
			}
			else {
				throw "Complex Unsupported argument " + arguments;
			}
		}
		else {
			throw "Complex Many arguments : " + arguments.length;
		}
	};

	var prototypeAccessors$3 = { intValue: { configurable: true },doubleValue: { configurable: true },real: { configurable: true },imag: { configurable: true },norm: { configurable: true },arg: { configurable: true } };
	var staticAccessors$4 = { ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true },ZERO: { configurable: true },MINUS_ONE: { configurable: true },I: { configurable: true },PI: { configurable: true },E: { configurable: true },LN2: { configurable: true },LN10: { configurable: true },LOG2E: { configurable: true },LOG10E: { configurable: true },SQRT2: { configurable: true },SQRT1_2: { configurable: true },HALF: { configurable: true },POSITIVE_INFINITY: { configurable: true },NEGATIVE_INFINITY: { configurable: true },NaN: { configurable: true } };

	/**
		 * Complex を作成
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex}
		 */
	Complex.create = function create (number) {
		if(number instanceof Complex) {
			return number;
		}
		else {
			return new Complex(number);
		}
	};
		
	/**
		 * 指定した数値から Complex 型に変換
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex}
		 */
	Complex.valueOf = function valueOf (number) {
		return Complex.valueOf(number);
	};
		
	/**
		 * 複素数を作成
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {Complex}
		 * @private
		 */
	Complex._toComplex = function _toComplex (number) {
		if(number instanceof Complex) {
			return number;
		}
		else if(number instanceof Matrix) {
			return Matrix._toComplex(number);
		}
		else {
			return new Complex(number);
		}
	};

	/**
		 * 実数を作成
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Complex._toDouble = function _toDouble (number) {
		if(typeof number === "number") {
			return number;
		}
		var complex_number = Complex._toComplex(number);
		if(complex_number.isReal()) {
			return complex_number.real;
		}
		else {
			throw "not support complex numbers.[" + number + "]";
		}
	};

	/**
		 * 整数を作成
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Complex._toInteger = function _toInteger (number) {
		return Complex._toDouble(number) | 0;
	};

	/**
		 * 32ビット整数に変換
		 * @returns {number}
		 */
	prototypeAccessors$3.intValue.get = function () {
		return this.real | 0;
	};

	/**
		 * 64ビット実数に変換
		 * @returns {number}
		 */
	prototypeAccessors$3.doubleValue.get = function () {
		return this.real;
	};

	/**
		 * ディープコピー
		 * @returns {Complex} 
		 */
	Complex.prototype.clone = function clone () {
		return this;
	};

	/**
		 * 文字列データ
		 * @returns {string} 
		 */
	Complex.prototype.toString = function toString () {
		var formatG = function(x) {
			var numstr = x.toPrecision(6);
			if(numstr.indexOf(".") !== -1) {
				numstr = numstr.replace(/\.?0+$/, "");  // 1.00 , 1.10
				numstr = numstr.replace(/\.?0+e/, "e"); // 1.0e , 1.10e
			}
			else if(/inf/i.test(numstr)) {
				if(x === Number.POSITIVE_INFINITY) {
					return "Inf";
				}
				else {
					return "-Inf";
				}
			}
			else if(/nan/i.test(numstr)) {
				return "NaN";
			}
			return numstr;
		};
		if(!this.isReal()) {
			if(this._re === 0) {
				return formatG(this._im) + "i";
			}
			else if((this._im >= 0) || (Number.isNaN(this._im))) {
				return formatG(this._re) + " + " + formatG(this._im) + "i";
			}
			else {
				return formatG(this._re) + " - " + formatG(-this._im) + "i";
			}
		}
		else {
			return formatG(this._re);
		}
	};
		
	/**
		 * ランダムな値を作成
		 * @returns {Complex}
		 */
	Complex.rand = function rand () {
		return new Complex(random_class.nextDouble());
	};

	/**
		 * 正規分布に従うランダムな値を作成
		 * @returns {Complex}
		 */
	Complex.randn = function randn () {
		return new Complex(random_class.nextGaussian());
	};

	/**
		 * 等式
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} A === B
		 */
	Complex.prototype.equals = function equals (number, epsilon) {
		var x = Complex._toComplex(number);
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		// 無限大、非数の値も含めて一度確認
		if((this._re === x._re) && (this._im === x._im)) {
			return true;
		}
		// 誤差を含んだ値の比較
		return (Math.abs(this._re - x._re) <  tolerance) && (Math.abs(this._im - x._im) < tolerance);
	};

	/**
		 * 実部
		 * @returns {number} real(A)
		 */
	prototypeAccessors$3.real.get = function () {
		return this._re;
	};
		
	/**
		 * 虚部
		 * @returns {number} imag(A)
		 */
	prototypeAccessors$3.imag.get = function () {
		return this._im;
	};

	/**
		 * ノルム
		 * @returns {number} |A|
		 */
	prototypeAccessors$3.norm.get = function () {
		if(this._im === 0) {
			return Math.abs(this._re);
		}
		else if(this._re === 0) {
			return Math.abs(this._im);
		}
		else {
			return Math.sqrt(this._re * this._re + this._im * this._im);
		}
	};

	/**
		 * 偏角
		 * @returns {number} arg(A)
		 */
	prototypeAccessors$3.arg.get = function () {
		if(this._im === 0) {
			return this._re >= 0 ? 0 : Math.PI;
		}
		else if(this._re === 0) {
			return Math.PI * (this._im >= 0.0 ? 0.5 : -0.5);
		}
		else {
			return Math.atan2(this._im, this._re);
		}
	};

	/**
		 * 実部、虚部を表す際の小数点以下の桁数
		 * @returns {number} 小数点の桁数
		 */
	Complex.prototype.getDecimalPosition = function getDecimalPosition () {
		var ep = Number.EPSILON;
		var getDecimal = function(x) {
			if(!Number.isFinite(x)) {
				return 0;
			}
			var a = x;
			var point = 0;
			for(var i = 0; i < 20; i++) {
				if(Math.abs(a - (a | 0)) <= ep) {
					break;
				}
				a *= 10;
				point++;
			}
			return point;
		};
		return Math.max( getDecimal(this.real), getDecimal(this.imag) );
	};

	/**
		 * 加算
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {Complex} A + B
		 */
	Complex.prototype.add = function add (number) {
		var x = new Complex(number);
		x._re = this._re + x._re;
		x._im = this._im + x._im;
		return x;
	};

	/**
		 * 減算
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A - B
		 */
	Complex.prototype.sub = function sub (number) {
		var x = new Complex(number);
		x._re = this._re - x._re;
		x._im = this._im - x._im;
		return x;
	};

	/**
		 * 乗算
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A * B
		 */
	Complex.prototype.mul = function mul (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = - this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re - this._im * x._im;
			var im = this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	};
		
	/**
		 * ドット積
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A * conj(B)
		 */
	Complex.prototype.dot = function dot (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re + this._im * x._im;
			var im = - this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	};
		
	/**
		 * 割り算
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A / B
		 */
	Complex.prototype.div = function div (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re / x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im / x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re + this._im * x._im;
			var im = this._im * x._re - this._re * x._im;
			var denominator = 1.0 / (x._re * x._re + x._im * x._im);
			x._re = re * denominator;
			x._im = im * denominator;
			return x;
		}
	};

	/**
		 * 割り算の正の余り
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - 複素数を含まない数値 
		 * @returns {Complex} A mod B
		 */
	Complex.prototype.mod = function mod (number) {
		var x = new Complex(number);
		if((this._im !== 0) || (x._im !== 0)) {
			throw "calculation method is undefined.";
		}
		var _re = this._re - x._re * (0 | (this._re / x._re));
		if(_re < 0) {
			_re += x._re;
		}
		x._re = _re;
		return x;
	};

	/**
		 * 逆数
		 * @returns {Complex} 1 / A
		 */
	Complex.prototype.inv = function inv () {
		if(this._im === 0) {
			return new Complex(1.0 / this._re);
		}
		else if(this._re === 0) {
			return new Complex([0, - 1.0 / this._im]);
		}
		return Complex.ONE.div(this);
	};

	/**
		 * 符号値
		 * @returns {Complex} [-1,1] 複素数の場合はノルムを1にした値。
		 */
	Complex.prototype.sign = function sign () {
		if(this._im === 0) {
			if(this._re === 0) {
				return new Complex(0);
			}
			else {
				return new Complex(this._re > 0 ? 1 : -1);
			}
		}
		return this.div(this.norm);
	};
		
	/**
		 * 値同士を比較
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	Complex.prototype.compareTo = function compareTo (number, epsilon) {
		var x1 = this;
		var x2 = Complex._toComplex(number);
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		var a = x1.real + x1.imag;
		var b = x2.real + x2.imag;
		if((Math.abs(a - b) < tolerance)) {
			return 0;
		}
		return a > b ? 1 : -1;
	};
		
	/**
		 * 最大値
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} max([A, B])
		 */
	Complex.prototype.max = function max (number) {
		var x = Complex._toComplex(number);
		if(this.compareTo(x) >= 0) {
			return this;
		}
		else {
			return x;
		}
	};

	/**
		 * 最小値
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} min([A, B])
		 */
	Complex.prototype.min = function min (number) {
		var x = Complex._toComplex(number);
		if(this.compareTo(x) <= 0) {
			return this;
		}
		else {
			return x;
		}
	};

	/**
		 * 数値を範囲に収める
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} min 
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} max
		 * @returns {Complex} min(max(x, min), max)
		 */
	Complex.prototype.clip = function clip (min, max) {
		var min_ = Complex._toComplex(min);
		var max_ = Complex._toComplex(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	// ----------------------
	// テスト系
	// ----------------------
		
	/**
		 * 整数を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean}
		 */
	Complex.prototype.isInteger = function isInteger (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - (this._re | 0)) < tolerance);
	};

	/**
		 * 複素整数（整数も含む）を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} real(A) === 整数 && imag(A) === 整数
		 */
	Complex.prototype.isComplexInteger = function isComplexInteger (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - (this._re | 0)) < tolerance) &&
				(Math.abs(this._im - (this._im | 0)) < tolerance);
	};

	/**
		 * 0 を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} A === 0
		 */
	Complex.prototype.isZero = function isZero (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance) && (Math.abs(this._im) < tolerance);
	};

	/**
		 * 1 を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} A === 1
		 */
	Complex.prototype.isOne = function isOne (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance) && (Math.abs(this._im) < tolerance);
	};

	/**
		 * 複素数（虚部が0以外）を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} imag(A) !== 0
		 */
	Complex.prototype.isComplex = function isComplex (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance);
	};
		
	/**
		 * 実数を判定
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
		 * @returns {boolean} imag(A) === 0
		 */
	Complex.prototype.isReal = function isReal (epsilon) {
		var tolerance = epsilon ? Complex._toDouble(epsilon) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance);
	};

	/**
		 * 非数を判定
		 * @returns {boolean} isNaN(A)
		 */
	Complex.prototype.isNaN = function isNaN$1 () {
		return isNaN(this._re) || isNaN(this._im);
	};

	/**
		 * 実部の正数を判定
		 * @returns {boolean} real(x) > 0
		 */
	Complex.prototype.isPositive = function isPositive () {
		// Number.EPSILONは使用しない。どちらにぶれるか不明な点及び
		// わずかな負の数だった場合に、sqrtでエラーが発生するため
		return 0.0 < this._re;
	};

	/**
		 * 実部の負数を判定
		 * @returns {boolean} real(x) < 0
		 */
	Complex.prototype.isNegative = function isNegative () {
		return 0.0 > this._re;
	};

	/**
		 * 実部の非負値を判定
		 * @returns {boolean} real(x) >= 0
		 */
	Complex.prototype.isNotNegative = function isNotNegative () {
		return 0.0 <= this._re;
	};

	/**
		 * 無限を判定
		 * @returns {boolean} isInfinite(A)
		 */
	Complex.prototype.isInfinite = function isInfinite () {
		return (this._re === Number.POSITIVE_INFINITY) ||
				(this._im === Number.POSITIVE_INFINITY) ||
				(this._re === Number.NEGATIVE_INFINITY) ||
				(this._im === Number.NEGATIVE_INFINITY);
	};
		
	/**
		 * 有限数を判定
		 * @returns {boolean} !isNaN(A) && !isInfinite(A)
		 */
	Complex.prototype.isFinite = function isFinite () {
		return !this.isNaN() && !this.isInfinite();
	};

	// ----------------------
	// 複素数
	// ----------------------
		
	/**
		 * 絶対値
		 * @returns {Complex} abs(A)
		 */
	Complex.prototype.abs = function abs () {
		return new Complex(this.norm);
	};

	/**
		 * 共役複素数
		 * @returns {Complex} real(A) - imag(A)j
		 */
	Complex.prototype.conj = function conj () {
		if(this._im === 0) {
			return this;
		}
		// 共役複素数
		return new Complex([this._re, -this._im]);
	};

	/**
		 * 負数
		 * @returns {Complex} -A
		 */
	Complex.prototype.negate = function negate () {
		return new Complex([-this._re, -this._im]);
	};

	// ----------------------
	// 指数
	// ----------------------
		
	/**
		 * 累乗
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} pow(A, B)
		 */
	Complex.prototype.pow = function pow (number) {
		var A = this;
		var B = new Complex(number);
		// -2 ^ 0.5 ... 複素数
		// -2 ^ 1   ... 実数
		//  2 ^ 0.5 ... 実数
		if(B.isReal()) {
			if(A.isReal() && (A.isNotNegative() || B.isInteger())) {
				B._re = Math.pow(A._re, B._re);
				return B;
			}
			else {
				var r = Math.pow(A.norm, B._re);
				var s = A.arg * B._re;
				B._re = r * Math.cos(s);
				B._im = r * Math.sin(s);
				return B;
			}
		}
		else {
			return B.mul(A.log()).exp();
		}
	};

	/**
		 * 2乗
		 * @returns {Complex} pow(A, 2)
		 */
	Complex.prototype.square = function square () {
		if(this._im === 0.0) {
			return new Complex(this._re * this._re);
		}
		return this.mul(this);
	};

	/**
		 * 平方根
		 * @returns {Complex} sqrt(A)
		 */
	Complex.prototype.sqrt = function sqrt () {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(Math.sqrt(this._re));
			}
			else {
				return new Complex([0, Math.sqrt(-this._re)]);
			}
		}
		var r = Math.sqrt(this.norm);
		var s = this.arg * 0.5;
		return new Complex([r * Math.cos(s), r * Math.sin(s)]);
	};

	/**
		 * 対数
		 * @returns {Complex} log(A)
		 */
	Complex.prototype.log = function log () {
		if(this.isReal() && this.isNotNegative()) {
			return new Complex(Math.log(this._re));
		}
		// 負の値が入っているか、もともと複素数が入っている場合は、複素対数関数
		return new Complex([Math.log(this.norm), this.arg]);
	};

	/**
		 * 指数
		 * @returns {Complex} exp(A)
		 */
	Complex.prototype.exp = function exp () {
		if(this.isReal()) {
			return new Complex(Math.exp(this._re));
		}
		// 複素指数関数
		var r = Math.exp(this._re);
		return new Complex([r * Math.cos(this._im), r * Math.sin(this._im)]);
	};

	// ----------------------
	// 三角関数
	// ----------------------
		
	/**
		 * sin
		 * @returns {Complex} sin(A)
		 */
	Complex.prototype.sin = function sin () {
		if(this.isReal()) {
			return new Complex(Math.sin(this._re));
		}
		// オイラーの公式より
		// sin x = (e^ix - e^-ex) / 2i
		var a = this.mul(Complex.I).exp();
		var b = this.mul(Complex.I.negate()).exp();
		return a.sub(b).div([0, 2]);
	};

	/**
		 * cos
		 * @returns {Complex} cos(A)
		 */
	Complex.prototype.cos = function cos () {
		if(this.isReal()) {
			return new Complex(Math.cos(this._re));
		}
		// オイラーの公式より
		// cos x = (e^ix + e^-ex) / 2
		var a = this.mul(Complex.I).exp();
		var b = this.mul(Complex.I.negate()).exp();
		return a.add(b).div(2);
	};

	/**
		 * tan
		 * @returns {Complex} tan(A)
		 */
	Complex.prototype.tan = function tan () {
		if(this.isReal()) {
			return new Complex(Math.tan(this._re));
		}
		// 三角関数の相互関係 tan x = sin x / cos x
		return this.sin().div(this.cos());
	};

	/**
		 * atan
		 * @returns {Complex} atan(A)
		 */
	Complex.prototype.atan = function atan () {
		if(this.isReal()) {
			return new Complex(Math.atan(this._re));
		}
		// 逆正接 tan-1 x = i/2 log( i+x / i-x )
		return Complex.I.div(Complex.TWO).mul(Complex.I.add(this).div(Complex.I.sub(this)).log());
	};

	/**
		 * atan2
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - 実数で指定。省略時は、本オブジェクトの偏角を返す。
		 * @returns {Complex} atan2(Y, X)
		 */
	Complex.prototype.atan2 = function atan2 (number) {
		if(arguments.length === 0) {
			return new Complex(this.arg);
		}
		// y.atan2(x) とする。
		var y = this;
		var x = Complex._toComplex(number);
		if(y.isReal() && x.isReal()) {
			return new Complex(Math.atan2(y._re, x._re));
		}
		// 複素数のatan2は未定義である（実装不可能）
		throw "calculation method is undefined.";
	};
		
	// ----------------------
	// 信号処理系
	// ----------------------
		
	/**
		 * 正規化 sinc
		 * @returns {Complex} sinc(A)
		 */
	Complex.prototype.sinc = function sinc () {
		if(this.isReal()) {
			if(this._re === 0) {
				return(Complex.ONE);
			}
			var x$1 = Math.PI * this._re;
			return new Complex(Math.sin(x$1) / x$1);
		}
		var x = this.mul(Complex.PI);
		return new Complex( x.sin().div(x) );
	};

	// ----------------------
	// 丸め
	// ----------------------
		
	/**
		 * floor
		 * @returns {Complex} floor(A)
		 */
	Complex.prototype.floor = function floor () {
		return new Complex([Math.floor(this._re), Math.floor(this._im)]);
	};

	/**
		 * ceil
		 * @returns {Complex} ceil(A)
		 */
	Complex.prototype.ceil = function ceil () {
		return new Complex([Math.ceil(this._re), Math.ceil(this._im)]);
	};
		
	/**
		 * 四捨五入
		 * @returns {Complex} round(A)
		 */
	Complex.prototype.round = function round () {
		return new Complex([Math.round(this._re), Math.round(this._im)]);
	};

	/**
		 * 整数化
		 * @returns {Complex} fix(A)
		 */
	Complex.prototype.fix = function fix () {
		return new Complex([this._re | 0, this._im | 0]);
	};

	/**
		 * 小数部の抽出
		 * @returns {Complex} fract(A) 
		 */
	Complex.prototype.fract = function fract () {
		return new Complex([this._re - (this._re | 0), this._im - (this._im | 0)]);
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 1
		 * @returns {Complex} 1
		 */
	staticAccessors$4.ONE.get = function () {
		return DEFINE$3.ONE;
	};
		
	/**
		 * 2
		 * @returns {Complex} 2
		 */
	staticAccessors$4.TWO.get = function () {
		return DEFINE$3.TWO;
	};
		
	/**
		 * 10
		 * @returns {Complex} 10
		 */
	staticAccessors$4.TEN.get = function () {
		return DEFINE$3.TEN;
	};
		
	/**
		 * 0
		 * @returns {Complex} 0
		 */
	staticAccessors$4.ZERO.get = function () {
		return DEFINE$3.ZERO;
	};

	/**
		 * -1
		 * @returns {Complex} -1
		 */
	staticAccessors$4.MINUS_ONE.get = function () {
		return DEFINE$3.MINUS_ONE;
	};

	/**
		 * i, j
		 * @returns {Complex} i
		 */
	staticAccessors$4.I.get = function () {
		return DEFINE$3.I;
	};

	/**
		 * PI
		 * @returns {Complex} 3.14...
		 */
	staticAccessors$4.PI.get = function () {
		return DEFINE$3.PI;
	};

	/**
		 * E
		 * @returns {Complex} 2.71...
		 */
	staticAccessors$4.E.get = function () {
		return DEFINE$3.E;
	};

	/**
		 * LN2
		 * @returns {Complex} ln(2)
		 */
	staticAccessors$4.LN2.get = function () {
		return DEFINE$3.LN2;
	};

	/**
		 * LN10
		 * @returns {Complex} ln(10)
		 */
	staticAccessors$4.LN10.get = function () {
		return DEFINE$3.LN10;
	};

	/**
		 * LOG2E
		 * @returns {Complex} log_2(e)
		 */
	staticAccessors$4.LOG2E.get = function () {
		return DEFINE$3.LOG2E;
	};
		
	/**
		 * LOG10E
		 * @returns {Complex} log_10(e)
		 */
	staticAccessors$4.LOG10E.get = function () {
		return DEFINE$3.LOG10E;
	};
		
	/**
		 * SQRT2
		 * @returns {Complex} sqrt(2)
		 */
	staticAccessors$4.SQRT2.get = function () {
		return DEFINE$3.SQRT2;
	};
		
	/**
		 * SQRT1_2
		 * @returns {Complex} sqrt(0.5)
		 */
	staticAccessors$4.SQRT1_2.get = function () {
		return DEFINE$3.SQRT1_2;
	};
		
	/**
		 * 0.5
		 * @returns {Complex} 0.5
		 */
	staticAccessors$4.HALF.get = function () {
		return DEFINE$3.HALF;
	};

	/**
		 * 正の無限大
		 * @returns {Complex} Infinity
		 */
	staticAccessors$4.POSITIVE_INFINITY.get = function () {
		return DEFINE$3.POSITIVE_INFINITY;
	};
		
	/**
		 * 負の無限大
		 * @returns {Complex} -Infinity
		 */
	staticAccessors$4.NEGATIVE_INFINITY.get = function () {
		return DEFINE$3.NEGATIVE_INFINITY;
	};

	/**
		 * 非数
		 * @returns {Complex} NaN
		 */
	staticAccessors$4.NaN.get = function () {
		return DEFINE$3.NaN;
	};

	Object.defineProperties( Complex.prototype, prototypeAccessors$3 );
	Object.defineProperties( Complex, staticAccessors$4 );

	/**
	 * 内部で使用する定数値
	 * @ignore
	 */
	var DEFINE$3 = {

		/**
		 * 0
		 */
		ZERO : new Complex(0),

		/**
		 * 1
		 */
		ONE : new Complex(1),

		/**
		 * 2
		 */
		TWO : new Complex(2),

		/**
		 * 10
		 */
		TEN : new Complex(10),

		/**
		 * -1
		 */
		MINUS_ONE : new Complex(-1),

		/**
		 * i
		 */
		I : new Complex([0, 1]),

		/**
		 * PI
		 */
		PI : new Complex(Math.PI),

		/**
		 * E
		 */
		E : new Complex(Math.E),

		/**
		 * ln2
		 */
		LN2 : new Complex(Math.LN2),

		/**
		 * ln10
		 */
		LN10 : new Complex(Math.LN10),

		/**
		 * log_2(e)
		 */
		LOG2E : new Complex(Math.LOG2E),

		/**
		 * log_10(e)
		 */
		LOG10E : new Complex(Math.LOG10E),

		/**
		 * sqrt(2)
		 */
		SQRT2 : new Complex(Math.SQRT2),

		/**
		 * sqrt(0.5)
		 */
		SQRT1_2 : new Complex(Math.SQRT1_2),

		/**
		 * 0.5
		 */
		HALF : new Complex(0.5),

		/**
		 * Infinity
		 */
		POSITIVE_INFINITY : new Complex(Number.POSITIVE_INFINITY),

		/**
		 * -Infinity
		 */
		NEGATIVE_INFINITY : new Complex(Number.NEGATIVE_INFINITY),

		/**
		 * NaN
		 */
		NaN : new Complex(Number.NaN)
	};

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
	 * 計算に利用できるデータを提供するクラス
	 * 大まかに、 BigInteger, BigDecimal, Matrix の3つに分かれる。
	 * Matrix は、 Complex を包括している。
	 * 多倍長整数演算を特化した計算クラスは、 BigInteger 。
	 * 任意精度浮動小数点演算を特化した計算クラスは、 BigDecimal 。
	 * 信号処理や統計処理等を備えた汎用的な計算クラスは、 Matrix 。
	 */
	var konpeito = function konpeito () {};

	var staticAccessors$5 = { Log: { configurable: true },BigInteger: { configurable: true },BigDecimal: { configurable: true },RoundingMode: { configurable: true },MathContext: { configurable: true },Complex: { configurable: true },Matrix: { configurable: true },Random: { configurable: true } };

	staticAccessors$5.Log.get = function () {
		return Log;
	};

	/**
		 * 多倍長整数クラス
		 * @returns {typeof BigInteger}
		 */
	staticAccessors$5.BigInteger.get = function () {
		return BigInteger;
	};

	/**
		 * 任意精度浮動小数点クラス
		 * @returns {typeof BigDecimal}
		 */
	staticAccessors$5.BigDecimal.get = function () {
		return BigDecimal;
	};

	/**
		 * BigDecimal用の丸め設定クラス
		 * @returns {typeof RoundingMode}
		 */
	staticAccessors$5.RoundingMode.get = function () {
		return RoundingMode;
	};

	/**
		 * BigDecimal用の環境設定クラス
		 * @returns {typeof MathContext}
		 */
	staticAccessors$5.MathContext.get = function () {
		return MathContext;
	};

	/**
		 * 複素数クラス
		 * @returns {typeof Complex}
		 */
	staticAccessors$5.Complex.get = function () {
		return Complex;
	};

	/**
		 * 複素行列クラス
		 * @returns {typeof Matrix}
		 */
	staticAccessors$5.Matrix.get = function () {
		return Matrix;
	};

	/**
		 * 乱数クラス
		 * @returns {typeof Random}
		 */
	staticAccessors$5.Random.get = function () {
		return Random;
	};

	Object.defineProperties( konpeito, staticAccessors$5 );

	return konpeito;

}));
