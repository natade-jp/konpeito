/*!
 * CSV.js
 * https://github.com/natade-jp/konpeito
 * Copyright 2013-2019 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */

class CSV {
	
	/**
	 * CSVテキストから配列を作成
	 * @param {String} input_text 
	 * @param {String} [separator=","]
	 * @return {Array<Array<string>>}
	 */
	static parse(input_text, separator = ",") {
		// 改行コードの正規化
		const text = input_text.replace(/\r\n?|\n/g, "\n");
		const CODE_SEPARATOR = separator.charCodeAt(0);
		const CODE_CR    = 0x0D;
		const CODE_LF    = 0x0A;
		const CODE_DOUBLEQUOTES = 0x22;
		/**
		 * @type {Array<Array<string>>}
		 */
		const csv_array = [];
		const length = text.length;
		let element = "";
		let count_rows    = 0;
		let count_columns = 0;
		let isnextelement = false;
		let isnextline    = false;
		for(let i = 0; i < length; i++) {
			let code = text.charCodeAt(i);
			// 複数行なら一気に全て読み込んでしまう(1文字目がダブルクォーテーションかどうか)
			if((code === CODE_DOUBLEQUOTES)&&(element.length === 0)) {
				i++;
				for(;i < length;i++) {
					code = text.charCodeAt(i);
					if(code === CODE_DOUBLEQUOTES) {
						// フィールドの終了か？
						// 文字としてのダブルクォーテーションなのか
						if((i + 1) !== (length - 1)) {
							if(text.charCodeAt(i + 1) === CODE_DOUBLEQUOTES) {
								i++;
								element += "\""; 
							}
							else {
								break;
							}
						}
						else {
							break;
						}
					}
					else {
						element += text.charAt(i);
					}
				}
			}
			// 複数行以外なら1文字ずつ解析
			else {
				switch(code) {
					case(CODE_SEPARATOR):
						isnextelement = true;
						break;
					case(CODE_CR):
					case(CODE_LF):
						isnextline = true;
						break;
					default:
						break;
				}
				if(isnextelement) {
					isnextelement = false;
					if(csv_array[count_rows] === undefined) {
						csv_array[count_rows] = [];
					}
					csv_array[count_rows][count_columns] = element;
					element = "";
					count_columns += 1;
				}
				else if(isnextline) {
					isnextline = false;
					//文字があったり、改行がある場合は処理
					//例えば CR+LF や 最後のフィールド で改行しているだけなどは無視できる
					if((element !== "")||(count_columns !== 0)) {
						if(csv_array[count_rows] === undefined) {
							csv_array[count_rows] = [];
						}
						csv_array[count_rows][count_columns] = element;
						element = "";
						count_rows    += 1;
						count_columns  = 0;
					}
				}
				else {
					element += text.charAt(i);
				}
			}
			// 最終行に改行がない場合
			if(i === length - 1) {
				if(count_columns !== 0) {
					csv_array[count_rows][count_columns] = element;
				}
			}
		}
		return csv_array;
	}
	
	/**
	 * 配列からCSVテキストを作成
	 * @param {Array<Array<string>>} csv_array 
	 * @param {String} [separator=","]
	 * @param {String} [newline="\r\n"]
	 * @return {String}
	 */
	static create(csv_array, separator = ",", newline = "\r\n") {
		let out = "";
		const escape = /["\r\n,\t]/;
		if(csv_array !== undefined) {
			for(let i = 0;i < csv_array.length;i++) {
				if(csv_array[i] !== undefined) {
					for(let j = 0;j < csv_array[i].length;j++) {
						let element = csv_array[i][j];
						if(escape.test(element)) {
							element = element.replace(/"/g, "\"\"");
							element = "\"" + element + "\"";
						}
						out += element;
						if(j !== csv_array[i].length - 1) {
							out += separator;
						}
					}
				}
				out += newline;
			}
		}
		return out;
	}

	/**
	 * 1行目に列名が記載しているCSVをJSON配列に変換
	 * @param {Array<Array<string>>} csv_array 
	 * @returns {Array<Object<string, string>>}
	 */
	static toJSONArrayFromCSVArray(csv_array) {
		const title_line = csv_array[0];
		const key_name = [];
		for(let i = 0; i < title_line.length; i++) {
			key_name.push(title_line[i]);
		}
		const json_array = [];
		for(let i = 1; i < csv_array.length; i++) {
			const line = csv_array[i];
			/**
			 * @type {Object<string, string>}
			 */
			const json_data = {};
			for(let j = 0; j < line.length; j++) {
				json_data[key_name[i]] = line[i];
			}
			json_array.push(json_data);
		}
		return json_array;
	}

	/**
	 * 共通の型のJSON配列をCSV配列へ変換
	 * @param {Array<Object<string, string>>} json_array 
	 * @returns {Array<Array<string>>}
	 */
	static toCSVArrayFromJSONArray(json_array) {
		const csv_array = [];
		const title_list = [];
		for(const key in json_array[0]) {
			title_list.push(key);
		}
		csv_array.push(title_list);
		for(let i = 1; i < json_array.length; i++) {
			const line = json_array[i];
			const data_list = [];
			for(let j = 0; j < title_list.length; j++) {
				data_list.push(line[title_list[j]]);
			}
			csv_array.push(data_list);
		}
		return csv_array;
	}

}

module.exports = CSV;
