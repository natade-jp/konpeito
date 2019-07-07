/*!
 * JSDocTranslater.js
 * https://github.com/natade-jp/konpeito
 * Copyright 2013-2019 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */

/**
 * ディープコピー
 * @param {Object<any, string>} x 
 * @return {Object<any, string>}
 */
const copy = function(x) {
	/**
	 * @type {Object<any, string>}
	 */
	const y = {};
	for(const key in x) {
		y[key] = x[key];
	}
	return y;
};

class JSDocTranslater {

	/**
	 * JSDocのコメントを抽出
	 * @param {string} source_code 
	 * @return {Array<{name: string; modifier: string; class: string; type: string; text: string; prm_name: string; }>}
	 */
	static exportTypeList(source_code) {

		/** @type {{ name: string; modifier: string; class: string; type: string; text: string; prm_name: string; }[]} */
		const type_list = [];
		let class_name = "";
		/**
		 * @param {string} match_text 
		 */
		const func = function(match_text) {
			const lines = match_text.split("\n");
			const type_data = {
				name : "",
				modifier : "",
				class : "",
				type : "",
				text : "",
				prm_name : "",
			};
			{
				// 最後の関数名などを取り出す
				const define_line = lines[lines.length - 1].match(/(((static|get|set|class|let|const|export|default)([ \t]+))*)?([\w\.\$]+)/)[0];
				const define_lines = define_line.split(/[ \t]+/);
				type_data.name = define_lines.pop();
				type_data.modifier = define_lines.join(" ");
			}
			{
				if(/class/.test(type_data.modifier)) {
					class_name = type_data.name;
				}
				type_data.class = class_name;
			}
			// 左のタブのみを抽出
			const comment_lines = [];
			{
				// コメントの部分のみ取り除く
				for(let i = 0; i < lines.length; i++) {
					if(/^[\t ]+\*[^/]/.test(lines[i])) {
						comment_lines.push(lines[i].replace(/^[\t *]+/, ""));
					}
				}
			}
			{
				// 説明を抽出
				const desc = [];
				for(let i = 0; i < comment_lines.length; i++) {
					if(/^[^@]/.test(comment_lines[i])) {
						desc.push(comment_lines[i].trim());
					}
				}
				type_data.type = "desc";
				type_data.text = desc.join("\n");
				type_list.push(copy(type_data));
			}
			{
				for(let i = 0; i < comment_lines.length; i++) {
					if(/^[^@]/.test(comment_lines[i])) {
						continue;
					}
					if(/^@param/.test(comment_lines[i])) {
						type_data.type = "param";
						// パラメータの変数名と説明を抽出
						let right_str = "";
						let match;
						{
							match = comment_lines[i].match(/^([^{]+)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})?/);
							if((!match) || (match.length === 0)) {
								console.log("error");
								console.log(type_data);
								continue;
							}
							right_str = comment_lines[i].substr(match[0].length).trim();
						}
						// パラメータの説明を抽出
						{
							let desc = "";
							if(/^(\s*)(([\w$]+)|(\[[^\]]+\]))(\s*)-/.test(right_str)) {
								match = right_str.match(/^(\s*)(([\w$]+)|(\[[^\]]+\]))(\s*)-/);
								if((!match) || (match.length === 0)) {
									console.log("error");
									console.log(type_data);
									continue;
								}
								desc = right_str.substr(match[0].length).trim();
								right_str = match[0].substr(0, match[0].length - 1).trim();
							}
							type_data.text = desc;
						}
						// パラメータの変数名を抽出
						{
							if(/^[^[]/.test(right_str)) {
								type_data.prm_name = right_str;
							}
							else {
								type_data.prm_name = right_str.replace(/^\[([\w\$]+).*/, "$1");
							}
						}
						type_list.push(copy(type_data));
					}
					if(/^@returns/.test(comment_lines[i])) {
						type_data.type = "returns";
						let right_str = "";
						let match;
						{
							match = comment_lines[i].match(/^([^{]+)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})/);
							if(!match) {
								continue;
							}
							right_str = comment_lines[i].substr(match[0].length);
						}
						type_data.prm_name = "";
						type_data.text = right_str.trim();
						type_list.push(copy(type_data));
					}
				}
			}
			return match_text;
		};
		source_code.replace(/([ \t]*\/\*{2}[ \t]*\n)(([ \t]*\*[^\\][^\n]+\n)*)([ \t]*\*\/[ \t]*\n)([^\n]+)/g, func);
		return type_list;
	}

	/**
	 * JSDocのコメントを抽出
	 * @param {string} source_code 
	 * @param {Array<{name: string; modifier: string; class: string; type: string; text: string; prm_name: string; }>} dictionary 
	 */
	static importTypeList(source_code, dictionary) {

		/**
		 * @param {{name: string; modifier: string; class: string; type: string; text: string; prm_name: string; }} dic_json 
		 * @returns {string}
		 */
		const toHash = function(dic_json) {
			return dic_json.class + "." + dic_json.modifier + "." + dic_json.name + "." + dic_json.type + "." + dic_json.prm_name;
		};

		/**
		 * @type {Object}
		 */
		const hashmap = [];
		for(let i = 0; i < dictionary.length; i++) {
			hashmap[toHash(dictionary[i])] = dictionary[i].text;
		}

		let class_name = "";

		/**
		 * @param {string} match_text 
		 */
		const func = function(match_text) {
			const lines = match_text.split("\n");
			const type_data = {
				name : "",
				modifier : "",
				class : "",
				type : "",
				text : "",
				prm_name : "",
			};
			{
				// 最後の関数名などを取り出す
				const define_line = lines[lines.length - 1].match(/(((static|get|set|class|let|const|export|default)([ \t]+))*)?([\w\.\$]+)/)[0];
				const define_lines = define_line.split(/[ \t]+/);
				type_data.name = define_lines.pop();
				type_data.modifier = define_lines.join(" ");
			}
			{
				if(/class/.test(type_data.modifier)) {
					class_name = type_data.name;
				}
				type_data.class = class_name;
			}
			const comment_lines = [];
			{
				// コメントの部分のみ取り除く
				for(let i = 0; i < lines.length; i++) {
					if(/^[\t ]+\*[^/]/.test(lines[i])) {
						comment_lines.push(lines[i].replace(/^[\t *]+/, ""));
					}
				}
			}
			{
				// 説明部分を抽出して
				let start = -1;
				let delete_line = 0;
				for(let i = 0; i < comment_lines.length; i++) {
					if(/^[^@]/.test(comment_lines[i])) {
						if(start === -1) {
							start = i;
							delete_line = 1;
						}
					}
					else if(start !== -1) {
						delete_line = i - start;
						break;
					}
				}

				// ★説明部分を翻訳
				type_data.type = "desc";
				
				const text = hashmap[toHash(type_data)];
				if(text) {
					const text_array = text.split("\n");
					// 改行が必要な場合は、4つの半角スペース
					for(let i = 1; i < text_array.length; i++) {
						text_array[i] = "    " + text_array[i];
					}
					// 今ある文章と入れ替える
					comment_lines.splice(start, delete_line);
					for(let i = 0; i < text_array.length; i++) {
						comment_lines.splice(start + i, 0, text_array[i]);
					}
				}
			}
			{
				for(let i = 0; i < comment_lines.length; i++) {
					if(/^[^@]/.test(comment_lines[i])) {
						continue;
					}
					if(/^@param/.test(comment_lines[i])) {
						type_data.type = "param";
						// パラメータの変数名と説明を抽出
						let right_str = "";
						let match;
						{
							match = comment_lines[i].match(/^([^{]+)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})?/);
							if((!match) || (match.length === 0)) {
								console.log("error");
								console.log(type_data);
								continue;
							}
							right_str = comment_lines[i].substr(match[0].length).trim();
						}
						// パラメータの説明を抽出
						{
							let desc = "";
							if(/^(\s*)(([\w$]+)|(\[[^\]]+\]))(\s*)-/.test(right_str)) {
								match = right_str.match(/^(\s*)(([\w$]+)|(\[[^\]]+\]))(\s*)-/);
								if((!match) || (match.length === 0)) {
									console.log("error");
									console.log(type_data);
									continue;
								}
								desc = right_str.substr(match[0].length).trim();
								right_str = match[0].substr(0, match[0].length - 1).trim();
							}
							type_data.text = desc;
						}
						// パラメータの変数名を抽出
						{
							if(/^[^[]/.test(right_str)) {
								type_data.prm_name = right_str;
							}
							else {
								type_data.prm_name = right_str.replace(/^\[([\w\$]+).*/, "$1");
							}
						}

						// ★ parm を翻訳
						const text = hashmap[toHash(type_data)];
						if(text && text.length !== "") {
							match = comment_lines[i].match(/^([^{]+)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})?(\s*)(([\w$]+)|(\[[^\]]+\]))/);
							comment_lines.splice(i, 1, match[0] + " - " + text);
						}
					}
					if(/^@returns/.test(comment_lines[i])) {
						type_data.type = "returns";
						let right_str = "";
						let match;
						{
							match = comment_lines[i].match(/^([^{]+)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})/);
							if(!match) {
								continue;
							}
							right_str = comment_lines[i].substr(match[0].length);
						}
						type_data.prm_name = "";
						type_data.text = right_str.trim();
						
						// ★ returns を翻訳
						const text = hashmap[toHash(type_data)];
						if(text && text.length !== "") {
							comment_lines.splice(i, 1, match[0] + " " + text);
						}
					}
				}
			}
			// "comment_lines" からコメントラインを再作成
			{
				const output_comments = [];
				// 左のタブのみを抽出
				const tab = lines[1].match(/^[\t ]+/)[0];
				// コメントを作成
				output_comments.push(tab + "/**");
				for(let i = 0; i < comment_lines.length; i++) {
					output_comments.push(tab + "/* " + comment_lines[i]);
				}
				output_comments.push(tab + " */");
				// 最後の関数名を結合
				output_comments.push(lines[lines.length - 1]);
				return output_comments.join("\n");
			}
		};
		return source_code.replace(/([ \t]*\/\*{2}[ \t]*\n)(([ \t]*\*[^\\][^\n]+\n)*)([ \t]*\*\/[ \t]*\n)([^\n]+)/g, func);
	}

}

module.exports = JSDocTranslater;
