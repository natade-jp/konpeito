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

// @ts-ignore
import Format from "./Format.mjs";

/**
 * ログのバッファ
 * @ignore
 */
let printbuffer = "";

/**
 * ログを記録するクラス
 * @ignore
 */
class Log {

	/**
	 * 文字列へ変換する
	 * @param text_obj {*}
	 * @returns {string}
	 */
	static _toStringFromObj(text_obj) {
		let text;
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
	}
	
	/**
	 * データを文字列化して記録
	 * @param {*} text_obj 
	 */
	static println(text_obj) {
		const text = printbuffer + Log._toStringFromObj(text_obj);
		printbuffer = "";
		console.log(text);
	}
	
	/**
	 * データを文字列化して記録（折り返し禁止）
	 * @param {*} text_obj 
	 */
	static print(text_obj) {
		printbuffer += Log._toStringFromObj(text_obj);
	}
	
	/**
	 * ログを記録する
	 * C言語のprintfのようなフォーマットが指定可能
	 * @param {string} text 
	 * @param {string} parmeter パラメータは可変引数
	 */
	static printf(text, parmeter) {
		const x = [];
		for(let i = 0 ; i < arguments.length ; i++) {
			x.push(arguments[i]);
		}
		Log.print(Format.format.apply(this, x));
	}

}

export default Log;