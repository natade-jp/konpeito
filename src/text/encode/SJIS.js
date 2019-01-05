﻿/**
 * The script is part of SenkoJS.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The zlib/libpng License https://opensource.org/licenses/Zlib
 */

import Unicode from "./Unicode.js";

export default class SJIS {

	/**
	 * 文字列を Shift_JIS の配列へ変換します。
	 * @param {String} text 変換したいテキスト
	 * @param {Array} unicode_to_sjis Unicode から Shift_JIS への変換マップ
	 * @returns {Array} Shift_JIS のデータが入った配列
	 */
	static toSJISArray(text, unicode_to_sjis) {
		const map = unicode_to_sjis;
		const utf32 = Unicode.toUTF32Array(text);
		const sjis = [];
		const ng = "・".charCodeAt(0);
		for(let i = 0; i < utf32.length; i++) {
			const map_bin = map[utf32[i]];
			if(map_bin) {
				sjis.push(map_bin);
			}
			else {
				sjis.push(ng);
			}
		}
		return sjis;
	}

	/**
	 * 文字列を Shift_JIS のバイナリ配列へ変換します。
	 * @param {String} text 変換したいテキスト
	 * @param {Array} unicode_to_sjis Unicode から Shift_JIS への変換マップ
	 * @returns {Array} Shift_JIS のデータが入ったバイナリ配列
	 */
	static toSJISArrayBinary(text, unicode_to_sjis) {
		const sjis = SJIS.toSJISArray(text, unicode_to_sjis);
		const sjisbin = [];
		for(let i = 0; i < sjis.length; i++) {
			if(sjis[i] < 0x100) {
				sjisbin.push(sjis[i]);
			}
			else {
				sjisbin.push(sjis[i] >> 8);
				sjisbin.push(sjis[i] & 0xFF);
			}

		}
		return sjisbin;
	}

	/**
	 * SJISの配列から文字列へ戻します。
	 * @param {Array} sjis 変換したいテキスト
	 * @param {Array} sjis_to_unicode Shift_JIS から Unicode への変換マップ
	 * @returns {String} 変換後のテキスト
	 */
	static fromSJISArray(sjis, sjis_to_unicode) {
		const map = sjis_to_unicode;
		const utf16 = [];
		const ng = "・".charCodeAt(0);
		for(let i = 0; i < sjis.length; i++) {
			let x = sjis[i];
			let y = -1;
			if(x >= 0x100) {
				// すでに1つの変数にまとめられている
				y = map[x];
			}
			else {
				// 2バイト文字かのチェック
				if( ((0x81 <= x) && (x <= 0x9F)) || ((0xE0 <= x) && (x <= 0xFC)) ) {
					x <<= 8;
					i++;
					x |= sjis[i];
					y = map[x];
				}
				else {
					y = map[x];
				}
			}
			if(y) {
				// 配列なら配列を結合
				// ※ Unicodeの結合文字の可能性があるため
				if(y instanceof Array) {
					for(let j = 0; j < y.length; j++) {
						utf16.push(y[j]);
					}
				}
				// 値しかない場合は値を結合
				else {
					utf16.push(y);
				}
			}
			else {
				utf16.push(ng);
			}
		}
		return Unicode.fromUTF16Array(utf16);
	}

	/**
	 * 指定したテキストの横幅を Shift_JIS の換算で計算します。
	 * つまり半角を1、全角を2としてカウントします。
	 * なお、 Shift_JIS の範囲にない文字は2としてカウントします。
	 * @param {String} text カウントしたいテキスト
	 * @param {Array} unicode_to_sjis Unicode から Shift_JIS への変換マップ
	 * @returns {Number} 文字の横幅
	 */
	static getWidthForSJIS(text, unicode_to_sjis) {
		return SJIS.toSJISArrayBinary(text, unicode_to_sjis).length;
	}

	/**
	 * 指定したテキストの横幅を Shift_JIS の換算した場合に、
	 * 単位は見た目の位置となります。
	 * @param {String} text 切り出したいテキスト
	 * @param {Number} offset 切り出し位置
	 * @param {Number} size 切り出す長さ
	 * @param {Array} unicode_to_sjis Unicode から Shift_JIS への変換マップ
	 * @param {Array} sjis_to_unicode Shift_JIS から Unicode への変換マップ
	 * @returns {String} 切り出したテキスト
	 */
	static cutTextForSJIS(text, offset, size, unicode_to_sjis, sjis_to_unicode) {
		const sjisbin = SJIS.toSJISArrayBinary(text, unicode_to_sjis);
		const cut = [];
		const SPACE = 0x20 ; // ' '

		if(offset > 0) {
			// offset が1文字以降の場合、
			// その位置が、2バイト文字の途中かどうか判定が必要である。
			// そのため、1つ前の文字をしらべる。
			// もし2バイト文字であれば、1バイト飛ばす。
			const x = sjisbin[offset - 1];
			if( ((0x81 <= x) && (x <= 0x9F)) || ((0xE0 <= x) && (x <= 0xFC)) ) {
				cut.push(SPACE);
				offset++;
				size--;
			}
		}
		
		let is_2byte = false;

		for(let i = 0, point = offset; ((i < size) && (point < sjisbin.length)); i++, point++) {
			const x = sjisbin[point];
			if(!is_2byte && (((0x81 <= x) && (x <= 0x9F)) || ((0xE0 <= x) && (x <= 0xFC)))) {
				is_2byte = true;
			}
			else {
				is_2byte = false;
			}
			// 最後の文字が2バイト文字の1バイト目かどうかの判定
			if((i === size - 1) && is_2byte) {
				cut.push(SPACE);
			}
			else {
				cut.push(x);
			}
		}
		return SJIS.fromSJISArray(cut, sjis_to_unicode);
	}

}