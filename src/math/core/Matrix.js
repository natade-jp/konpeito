/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Polyfill from "../tools/Polyfill.js";
import LinearAlgebra from "./tools/LinearAlgebra.js";
import Statistics from "./tools/Statistics.js";
import Signal from "./tools/Signal.js";
import Complex from "./Complex.js";
import Random from "./tools/Random.js";
import BigInteger from "./BigInteger.js";
import BigDecimal from "./BigDecimal.js";
import Fraction from "./Fraction.js";
import MathContext from "./context/MathContext.js";
import KonpeitoFloat from "./base/KonpeitoFloat.js";

/**
 * Matrix type argument.
 * - Matrix
 * - Complex
 * - number
 * - string
 * - Array<string|number|Complex|Matrix>
 * - Array<Array<string|number|Complex|Matrix>>
 * - {doubleValue:number}
 * - {toString:function}
 * 
 * Initialization can be performed as follows.
 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
 * @typedef {Matrix|Complex|number|string|Array<string|number|Complex|Matrix>|Array<Array<string|number|Complex|Matrix>>|{doubleValue:number}|{toString:function}} KMatrixInputData
 */

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KMatrixSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */

/**
 * Collection of functions used in Matrix.
 * @ignore
 */
class MatrixTool {

	/**
	 * Create actual values from data specifying matrix position.
	 * @param {any} data - A value indicating the position in a matrix.
	 * @param {number} max - Length to initialize. (Used when ":" is specified at matrix creation.)
	 * @param {number} geta - Offset at initialization. (Used when ":" is specified at matrix creation.)
	 * @returns {Array<number>}
	 */
	static toPositionArrayFromObject(data, max, geta) {
		if(typeof data === "string") {
			const array_or_string = MatrixTool.toArrayFromString(data);
			if(array_or_string === ":") {
				// : が指定された場合
				const y = new Array(max);
				for(let i = 0; i < max; i++) {
					y[i] =  i + geta;
				}
				return y;
			}
			else if(array_or_string instanceof Array) {
				// 複素数の配列から中身を取り出す
				const y = array_or_string;
				const num_y = new Array(y.length);
				for(let i = 0; i < y.length; i++) {
					num_y[i] = Math.trunc(y[i].real);
				}
				return num_y;
			}
			else {
				throw "toArrayFromString[" + data + "][" + array_or_string + "]";
			}
		}
		let t_data = data;
		if(!(t_data instanceof Matrix) && !(t_data instanceof Complex) && !((typeof t_data === "number"))) {
			t_data = Matrix._toMatrix(t_data);
		}
		if(t_data instanceof Matrix) {
			if(!t_data.isVector()) {
				throw "getMatrix argument " + t_data;
			}
			const len = t_data.length;
			const y = new Array(t_data.length);
			if(t_data.isRow()) {
				for(let i = 0; i < len; i++) {
					y[i] = Math.trunc(t_data.matrix_array[0][i].real);
				}
			}
			else if(t_data.isColumn()) {
				for(let i = 0; i < len; i++) {
					y[i] = Math.trunc(t_data.matrix_array[i][0].real);
				}
			}
			return y;
		}
		return [ Matrix._toInteger(t_data) ];
	}

	/**
	 * A match function that can also extract strings excluding matched strings.
	 * @param {string} text - Search target.
	 * @param {RegExp} regexp - Regular expression.
	 * @returns {Array<Object<boolean, string>>}
	 */
	static match2(text, regexp) {
		// 対象ではないregexpの情報以外も抽出match
		// つまり "1a2b" で \d を抽出すると、次のように抽出される
		// [false "1"]
		// [true "a"]
		// [false "2"]
		// [true "b"]
		// 0 ... 一致したかどうか
		// 1 ... 一致した文字列、あるいは一致していない文字列
		const output = [];
		let search_target = text;
		for(let x = 0; x < 1000; x++) {
			const match = search_target.match(regexp);
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
	}
	
	/**
	 * Removed front and back brackets when enclosed by brackets.
	 * - Return null if the string has no brackets.
	 * @param {string} text - String to be processed.
	 * @returns {{text : string, is_transpose : boolean}|null} String after brackets removal or null.
	 */
	static trimBracket(text) {
		let input_text = text;
		let is_transpose = false;
		// 後ろに'が付いているかどうか検知(転置行列用)
		if(/'$/.test(input_text)) {
			const dash_text = input_text.match(/(\s*')*$/g)[0];
			const dash_count = (dash_text.split("'").length - 1);
			is_transpose = (dash_count % 2) === 1;
			input_text = input_text.substring(0, input_text.length - dash_text.length);
		}
		// 前後に[]があるか確認
		if( !(/^\[/).test(input_text) || !(/\]$/).test(input_text)) {
			return null;
		}
		// 前後の[]を除去
		return {
			text : input_text.substring(1, input_text.length - 1),
			is_transpose : is_transpose
		};
	}

	/**
	 * Create Matrix type data from string data defined in JSON.
	 * - For example, "[xx,xx,xx], [xx,xx,xx]"
	 * @param {string} text - String to be processed.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringForArrayJSON(text) {
		const matrix_array = [];
		// さらにブランケット内を抽出
		let rows = text.match(/\[[^\]]+\]/g);
		if(rows === null) {
			// ブランケットがない場合は、1行行列である
			rows = [text];
		}
		// 各ブランケット内を列ごとに調査
		for(let row_count = 0; row_count < rows.length; row_count++) {
			const row = rows[row_count];
			const column_array = row.substring(1, row.length - 1).split(",");
			const rows_array = [];
			for(let col_count = 0; col_count < column_array.length; col_count++) {
				const column = column_array[col_count];
				rows_array[col_count] = new Complex(column);
			}
			matrix_array[row_count] = rows_array;
		}
		return matrix_array;
	}

	/**
	 * Create a numeric array from initial values, difference values, and final values.
	 * @param {Complex} from - Start value.
	 * @param {Complex} delta - Delta.
	 * @param {Complex} to - End value.
	 * @param {boolean} [is_include_last_number=true] - Whether to include the last value.
	 * @returns {Array<Complex>}
	 */
	static InterpolationCalculation(from, delta, to, is_include_last_number) {
		const FromIsGreaterThanTo = from.compareTo(to);
		const is_include_last_number_ = is_include_last_number !== undefined ? is_include_last_number : true;
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
		const rows_array = [];
		let num = from;
		rows_array[0] = num;
		for(let i = 1; i < 0x10000; i++) {
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
	}

	/**
	 * Create an array of numbers from data separated by match2.
	 * @param {Array<Object<boolean, string>>} match2_string - Data separated by "toArrayFromString".
	 * @returns {Array<Complex>}
	 */
	static toArrayFromMatch2String(match2_string) {
		const xs = match2_string;
		const rows_array = [];
		for(let i = 0; i < xs.length; i++) {
			const xx = xs[i];
			if(!xx[0]) {
				// 一致していないデータであれば次へ
				continue;
			}
			// 「:記法」 1:3 なら 1,2,3。 1:2:9 なら 1:3:5:7:9
			if((i < xs.length - 2) && !xs[i + 1][0] && /:/.test(xs[i + 1][1])) {
				let from, delta, to;
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
				const ip_array = MatrixTool.InterpolationCalculation(from, delta, to, true);
				for(let j = 0; j < ip_array.length; j++) {
					rows_array.push(ip_array[j]);
				}
			}
			else {
				rows_array.push(new Complex(xx[1]));
			}
		}

		return rows_array;
	}

	/**
	 * Convert string to row part of matrix type matrix data.
	 * Estimate the matrix by extracting parts like numbers.
	 * @param {string} row_text - A string describing one row of the matrix.
	 * @returns {Array<Complex>|string}
	 */
	static toArrayFromString(row_text) {
		// 「:」のみ記載されていないかの確認
		if(row_text.trim() === ":") {
			return ":";
		}
		const str = row_text.toLowerCase().replace(/infinity|inf/g, "1e100000");
		// 左が実数（強制）で右が複素数（任意）タイプ
		const reg1 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))( *[+-] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij])?/;
		// 左が複素数（強制）で右が実数（任意）タイプ
		const reg2 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]( *[+] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan)))?/;
		// reg2優先で検索
		const reg3 = new RegExp("(" + reg2.source + ")|(" + reg1.source + ")", "i");
		// 問題として 1 - -jが通る
		return MatrixTool.toArrayFromMatch2String(MatrixTool.match2(str, reg3));
	}

	/**
	 * Create Matrix type data from string data defined by character string with space separation etc.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringForArraySPACE(text) {
		// 行ごとを抽出して
		const rows = text.split(";");
		const matrix_array = new Array(rows.length);
		for(let row_count = 0; row_count < rows.length; row_count++) {
			// 各行の文字を解析
			matrix_array[row_count] = MatrixTool.toArrayFromString(rows[row_count]);
		}
		return matrix_array;
	}

	/**
	 * Create Matrix type data composed of string data for matrix.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromStringInBracket(text) {
		// ブラケットの中にブラケットがある＝JSON形式
		if(/[[\]]/.test(text)) {
			return MatrixTool.toMatrixArrayFromStringForArrayJSON(text);
		}
		// それ以外(MATLAB, Octave, Scilab)
		else {
			return MatrixTool.toMatrixArrayFromStringForArraySPACE(text);
		}
	}

	/**
	 * Create Matrix type data from string data.
	 * @param {string} text - Strings to analyze.
	 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
	 */
	static toMatrixArrayFromString(text) {
		// 前後のスペースを除去
		const trimtext = text.replace(/^\s*|\s*$/g, "");
		// ブランケットを外す
		const withoutBracket = MatrixTool.trimBracket(trimtext);
		if(withoutBracket) {
			// 配列用の初期化
			let array_data = MatrixTool.toMatrixArrayFromStringInBracket(withoutBracket.text);
			// 転置が必要なら転置させる
			if(withoutBracket.is_transpose) {
				array_data = (new Matrix(array_data)).T().matrix_array;
			}
			return array_data;
		}
		else {
			// スカラー用の初期化
			return [[new Complex(text)]];
		}
	}

	/**
	 * Returns true if Matrix type internal data is correct as matrix data.
	 * @param {Array<Array<Complex>>} m_array
	 * @returns {boolean} 
	 */
	static isCorrectMatrixArray(m_array) {
		if(m_array.length === 0) {
			return false;
		}
		const num = m_array[0].length;
		if(num === 0) {
			return false;
		}
		for(let i = 1; i < m_array.length; i++) {
			if(m_array[i].length !== num) {
				return false;
			}
		}
		return true;
	}
}

/**
 * Complex matrix class. (immutable)
 */
export default class Matrix extends KonpeitoFloat {
	
	/**
	 * Create a complex matrix.
	 * Initialization can be performed as follows.
	 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
	 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
	 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
	 * @param {KMatrixInputData} number - Complex matrix. See how to use the function.
	 */
	constructor(number) {
		super();

		let matrix_array = null;
		let is_check_string = false;
		if(arguments.length === 1) {
			const obj = number;
			// 行列型なら中身をディープコピーする
			if(obj instanceof Matrix) {
				matrix_array = new Array(obj.row_length);
				for(let i = 0; i < obj.row_length; i++) {
					matrix_array[i] = new Array(obj.column_length);
					for(let j = 0; j < obj.column_length; j++) {
						matrix_array[i][j] = obj.matrix_array[i][j];
					}
				}
			}
			// 複素数型なら1要素の行列
			else if(obj instanceof Complex) {
				matrix_array = [[obj]];
			}
			// 行列の場合は中身を解析していく
			else if(obj instanceof Array) {
				matrix_array = [];
				for(let row_count = 0; row_count < obj.length; row_count++) {
					// 毎行ごと調査
					const row = obj[row_count];
					// 各行の要素が配列の場合は、配列内配列のため再度for文で調べていく
					if(row instanceof Array) {
						const rows_array = new Array(row.length);
						// 1行を調査する
						for(let col_count = 0; col_count < row.length; col_count++) {
							const column = row[col_count];
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
							matrix_array[0] = new Array(obj.length);
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
			else if(typeof obj === "string") {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(obj);
			}
			// 数値化できる場合
			else if((obj instanceof Object) && ("doubleValue" in obj)) {
				matrix_array = [[new Complex(obj.doubleValue)]];
			}
			// 文字列変換できる場合は返還後に、文字列解析を行う
			else if(obj instanceof Object) {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixArrayFromString(obj.toString());
			}
			// 単純なビルトインの数値など
			else {
				matrix_array = [[new Complex(obj)]];
			}
		}
		else {
			throw "Matrix : Many arguments [" + arguments.length + "]";
		}
		if(is_check_string) {
			// 文字列データの解析の場合、":" データが紛れていないかを確認する。
			// 紛れていたらその行は削除する。
			for(let row = 0; row < matrix_array.length; row++) {
				if(matrix_array[row] === ":") {
					matrix_array.splice(row--, 1);
				}
			}
		}
		if(!MatrixTool.isCorrectMatrixArray(matrix_array)) {
			console.log(matrix_array);
			throw "new Matrix IllegalArgumentException";
		}
		
		/**
		 * An array of elements in the matrix.
		 * @ignore
		 * @type {Array<Array<Complex>>}
		 */
		this.matrix_array = matrix_array;

		/**
		 * The number of rows in a matrix.
		 * @ignore
		 * @type {number}
		 */
		this.row_length = this.matrix_array.length;
		
		/**
		 * The number of columns in a matrix.
		 * @ignore
		 * @type {number}
		 */
		this.column_length = this.matrix_array[0].length;

		/**
		 * A cache that records data converted to a string.
		 * @private
		 * @ignore
		 * @type {string}
		 */
		this.string_cash = null;
	}

	/**
	 * Create an entity object of this class.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	static create(number) {
		if((arguments.length === 1) && (number instanceof Matrix)) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	}
	
	/**
	 * Convert number to Matrix type.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	static valueOf(number) {
		return Matrix.create(number);
	}

	/**
	 * Convert to Matrix.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix}
	 * @ignore
	 */
	static _toMatrix(number) {
		if(number instanceof Matrix) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	}

	/**
	 * Convert to Complex.
	 * If type conversion is unnecessary, return the value as it is.
	 * @param {KMatrixInputData} number 
	 * @returns {Complex}
	 * @ignore
	 */
	static _toComplex(number) {
		if(number instanceof Complex) {
			return number;
		}
		const M = Matrix._toMatrix(number);
		if(M.isScalar()) {
			return M.scalar;
		}
		else {
			throw "not scalar. [" + number + "]";
		}
	}

	/**
	 * Convert to real number.
	 * @param {KMatrixInputData} number 
	 * @returns {number}
	 * @ignore
	 */
	static _toDouble(number) {
		if(typeof number === "number") {
			return number;
		}
		const x = Matrix._toComplex(number);
		if(x.isReal()) {
			return x.real;
		}
		else {
			throw "not support complex numbers.";
		}
	}

	/**
	 * Convert to integer.
	 * @param {KMatrixInputData} number 
	 * @returns {number}
	 * @ignore
	 */
	static _toInteger(number) {
		return Math.trunc(Matrix._toDouble(number));
	}

	/**
	 * Delete cache.
	 */
	_clearCash() {
		if(this.string_cash) {
			delete this.string_cash;
		}
	}

	/**
	 * Deep copy.
	 * @returns {Matrix}
	 */
	clone() {
		return new Matrix(this.matrix_array);
	}

	/**
	 * Convert to string.
	 * @returns {string} 
	 */
	toString() {
		if(this.string_cash) {
			return this.string_cash;
		}
		const exp_turn_point = 9;
		const exp_turn_num = Math.pow(10, exp_turn_point);
		const exp_point = 4;
		let isDrawImag = false;
		let isDrawExp = false;
		let draw_decimal_position = 0;

		// 行列を確認して表示するための表示方法の確認する
		this._each(
			function(num, row, col) {
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
		let str_max = 0;

		/**
		 * @type {Array<{re_sign : string, re_str : string, im_sign : string, im_str : string}>}
		 */
		const draw_buff = [];

		// 数値データを文字列にする関数（eの桁がある場合は中身は3桁にする）
		/**
		 * @type {function(number): string }
		 */
		const toStrFromFloat = function(number) {
			const str = !isDrawExp ? number.toFixed(draw_decimal_position) : number.toExponential(exp_point);
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
			const split = str.split("e");
			let exp_text = split[1];
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
				const data = {};
				let real = num.real;
				data.re_sign = real < 0 ? "-" : " ";
				real = Math.abs(real);
				data.re_str = toStrFromFloat(real);
				str_max = Math.max(str_max, data.re_str.length + 1);
				if(isDrawImag) {
					let imag = num.imag;
					data.im_sign = imag < 0 ? "-" : "+";
					imag = Math.abs(imag);
					data.im_str = toStrFromFloat(imag);
					str_max = Math.max(str_max, data.im_str.length + 1);
				}
				draw_buff.push(data);
			}
		);

		// 右寄せ用関数
		/**
		 * @type {function(string, number): string }
		 */
		const right = function(text, length) {
			const space = "                                        ";
			return space.substr(0, length - text.length) + text;
		};

		// 出力用文字列を作成する
		/**
		 * @type {Array<string>}
		 */
		const output = [];
		const that = this;
		this._each(
			function(num, row, col) {
				const data = draw_buff.shift();
				let text = right(data.re_sign + data.re_str, str_max);
				if(isDrawImag) {
					text += " " + data.im_sign + right(data.im_str, str_max) + "i";
				}
				output.push(text);
				output.push((col < that.column_length - 1) ? " " : "\n");
			}
		);

		this.string_cash = output.join("");

		return this.string_cash;
	}

	/**
	 * Convert to string in one line.
	 * @returns {string} 
	 */
	toOneLineString() {
		if(this.isScalar()) {
			return this.scalar.toString();
		}
		let output = "[ ";
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
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
	}

	/**
	 * Equals.
	 * @param {KMatrixInputData} number
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} A === B
	 */
	equals(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			return false;
		}
		if((M1.row_length === 1) && (M1.column_length ===1)) {
			return M1.scalar.equals(M2.scalar, tolerance);
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				if(!x1[row][col].equals(x2[row][col], tolerance)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Array of real parts of elements in matrix.
	 * @returns {Array<Array<number>>}
	 */
	getNumberMatrixArray() {
		const y = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j].real;
			}
		}
		return y;
	}
	
	/**
	 * Complex array of complex numbers of each element of the matrix.
	 * @returns {Array<Array<Complex>>}
	 */
	getComplexMatrixArray() {
		const y = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j];
			}
		}
		return y;
	}
	
	/**
	 * Perform the same process on all elements in the matrix. (mutable)
	 * @param {function(Complex, number, number): any } eachfunc - Function(num, row, col)
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @ignore
	 */
	_each(eachfunc) {
		let isclearcash = false;
		// 行優先ですべての値に対して指定した関数を実行する。内容を書き換える可能性もある
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				const ret = eachfunc(this.matrix_array[row][col], row, col);
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
	}

	/**
	 * Perform the same process on all elements in the matrix.
	 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
	 * @returns {Matrix} Matrix after function processing.
	 */
	cloneMatrixDoEachCalculation(eachfunc) {
		return this.clone()._each(eachfunc);
	}

	/**
	 * Create Matrix with specified initialization for each element in matrix.
	 * @param {function(number, number): ?Object } eachfunc - Function(row, col)
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length=dimension] - Number of columns.
	 * @returns {Matrix} Matrix after function processing.
	 */
	static createMatrixDoEachCalculation(eachfunc, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		const y_row_length = Matrix._toInteger(dimension);
		const y_column_length = column_length ? Matrix._toInteger(column_length) : y_row_length;
		const y = new Array(y_row_length);
		for(let row = 0; row < y_row_length; row++) {
			y[row] = new Array(y_column_length);
			for(let col = 0; col < y_column_length; col++) {
				const ret = eachfunc(row, col);
				if(ret === undefined) {
					y[row][col] = Complex.ZERO;
				}
				else {
					y[row][col] = Matrix._toComplex(ret);
				}
			}
		}
		return new Matrix(y);
	}

	/**
	 * Treat the columns of the matrix as vectors and execute the same process.
	 * - If the matrix is a row vector, it performs the same processing for the row vector.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorAuto(array_function) {
		if(this.isRow()) {
			// 1行であれば、その1行に対して処理を行う
			const row_array = new Array(this.row_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[0][col];
			}
			return new Matrix(array_function(row_array));
		}
		else {
			const y = Matrix.ZERO;
			y._resize(1, this.column_length);
			// 1列、行列であれば、列ごとに処理を行う
			for(let col = 0; col < this.column_length; col++) {
				const col_array = new Array(this.row_length);
				for(let row = 0; row < this.row_length; row++) {
					col_array[row] = this.matrix_array[row][col];
				}
				const col_output = array_function(col_array);
				y._resize(Math.max(y.row_length, col_output.length), y.column_length);
				for(let row = 0; row < col_output.length; row++) {
					y.matrix_array[row][col] = col_output[row];
				}
			}
			return y;
		}
	}

	/**
	 * Treat the rows and columns of the matrix as vectors and perform the same processing.
	 * 1. First run the same process for the row.
	 * 2. Finally perform the same processing for the column.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorBoth(array_function) {
		const y1 = Matrix.ZERO;
		// 行ごとに処理を行う
		y1._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			const row_output = array_function(row_array);
			y1._resize(y1.row_length, Math.max(y1.column_length, row_output.length));
			for(let col = 0; col < row_output.length; col++) {
				y1.matrix_array[row][col] = row_output[col];
			}
		}
		const y2 = Matrix.ZERO;
		// 列ごとに処理を行う
		y2._resize(1, y1.column_length);
		for(let col = 0; col < y1.column_length; col++) {
			const col_array = new Array(y1.row_length);
			for(let row = 0; row < y1.row_length; row++) {
				col_array[row] = y1.matrix_array[row][col];
			}
			const col_output = array_function(col_array);
			y2._resize(Math.max(y2.row_length, col_output.length), y2.column_length);
			for(let row = 0; row < col_output.length; row++) {
				y2.matrix_array[row][col] = col_output[row];
			}
		}
		return y2;
	}

	/**
	 * Treat the rows of the matrix as vectors and execute the same process.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorRow(array_function) {
		const y = Matrix.ZERO;
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			const row_output = array_function(row_array);
			y._resize(y.row_length, Math.max(y.column_length, row_output.length));
			for(let col = 0; col < row_output.length; col++) {
				y.matrix_array[row][col] = row_output[col];
			}
		}
		return y;
	}

	/**
	 * Treat the columns of the matrix as vectors and execute the same process.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVectorColumn(array_function) {
		const y = Matrix.ZERO;
		// 列ごとに処理を行う
		y._resize(1, this.column_length);
		for(let col = 0; col < this.column_length; col++) {
			const col_array = new Array(this.row_length);
			for(let row = 0; row < this.row_length; row++) {
				col_array[row] = this.matrix_array[row][col];
			}
			const col_output = array_function(col_array);
			y._resize(Math.max(y.row_length, col_output.length), y.column_length);
			for(let row = 0; row < col_output.length; row++) {
				y.matrix_array[row][col] = col_output[row];
			}
		}
		return y;
	}

	/**
	 * Treat the rows and columns of the matrix as vectors and perform the same processing.
	 * The arguments of the method can switch the direction of the matrix to be executed.
	 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @param {string|number} [dimension="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
	 * @returns {Matrix} Matrix after function processing.
	 */
	eachVector(array_function, dimension) {
		let target = dimension !== undefined ? dimension : "auto";
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
			throw "eachVector argument " + dimension;
		}
	}

	/**
	 * Extract the specified part of the matrix.
	 * @param {KMatrixInputData} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
	 * @param {KMatrixInputData} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
	 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
	 * @returns {Matrix} 
	 */
	getMatrix(row, col, isUpOffset=false) {
		const geta = isUpOffset ? 1 : 0 ;
		const row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		const col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		const x = this.matrix_array;
		const y = new Array(row_array.length);
		for(let row = 0; row < row_array.length; row++) {
			const y_row = new Array(col_array.length);
			for(let col = 0; col < col_array.length; col++) {
				y_row[col] = x[row_array[row] - geta][col_array[col] - geta];
			}
			y[row] = y_row;
		}
		return new Matrix(y);
	}

	/**
	 * Change specified element in matrix.
	 * @param {KMatrixInputData} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
	 * @param {KMatrixInputData} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
	 * @param {KMatrixInputData} replace - Matrix to be replaced.
	 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
	 * @returns {Matrix} 
	 */
	setMatrix(row, col, replace, isUpOffset=false) {
		const geta = isUpOffset ? 1 : 0 ;
		const row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		const col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		const Y = new Matrix(this);
		const y = Y.matrix_array;
		const X = Matrix._toMatrix(replace);
		const x = X.matrix_array;
		for(let row = 0; row < row_array.length; row++) {
			for(let col = 0; col < col_array.length; col++) {
				y[row_array[row] - geta][col_array[col] - geta] = x[row % X.row_length][col % X.column_length];
			}
		}
		return new Matrix(y);
	}

	/**
	 * Returns the specified element in the matrix.
	 * Each element of the matrix is composed of complex numbers.
	 * @param {KMatrixInputData} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
	 * @param {KMatrixInputData} [col] - If this is a matrix, the column number.
	 * @returns {Complex} 
	 */
	getComplex(row_or_pos, col) {
		let row_or_pos_scalar = null;
		let col_scalar = null;
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
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 他の型に変換用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Boolean value of the first element of the matrix.
	 * @returns {boolean}
	 */
	get booleanValue() {
		return this.matrix_array[0][0].booleanValue;
	}

	/**
	 * Integer value of the first element of the matrix.
	 * @returns {number}
	 */
	get intValue() {
		return this.matrix_array[0][0].intValue;
	}

	/**
	 * Real value of first element of the matrix.
	 * @returns {number}
	 */
	get doubleValue() {
		return this.matrix_array[0][0].doubleValue;
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// konpeito で扱う数値型へ変換
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * return BigInteger.
	 * @returns {BigInteger}
	 */
	toBigInteger() {
		return new BigInteger(this.intValue);
	}
	
	/**
	 * return BigDecimal.
	 * @param {MathContext} [mc] - MathContext setting after calculation. 
	 * @returns {BigDecimal}
	 */
	toBigDecimal(mc) {
		if(mc) {
			return new BigDecimal([this.doubleValue, mc]);
		}
		else {
			return new BigDecimal(this.doubleValue);
		}
	}
	
	/**
	 * return Fraction.
	 * @returns {Fraction}
	 */
	toFraction() {
		return new Fraction(this.doubleValue);
	}
	
	/**
	 * return Complex.
	 * @returns {Complex}
	 */
	toComplex() {
		return this.scalar;
	}
	
	/**
	 * return Matrix.
	 * @returns {Matrix}
	 */
	toMatrix() {
		return this;
	}
	
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の基本操作、基本情報の取得
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * First element of this matrix.
	 * @returns {Complex}
	 */
	get scalar() {
		return this.matrix_array[0][0];
	}

	/**
	 * Maximum size of rows or columns in the matrix.
	 * @returns {number}
	 */
	get length() {
		return this.row_length > this.column_length ? this.row_length : this.column_length;
	}

	/**
	 * Number of columns in the matrix.
	 * @returns {number}
	 */
	get width() {
		return this.column_length;
	}

	/**
	 * Number of rows in matrix.
	 * @returns {number}
	 */
	get height() {
		return this.row_length;
	}

	/**
	 * 1-norm.
	 * @returns {number}
	 */
	get norm1() {
		return LinearAlgebra.norm(this, 1);
	}
	
	/**
	 * 2-norm.
	 * @returns {number}
	 */
	get norm2() {
		return LinearAlgebra.norm(this, 2);
	}

	/**
	 * p-norm.
	 * @param {KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	norm(p) {
		return LinearAlgebra.norm(this, p);
	}

	/**
	 * Condition number of the matrix
	 * @param {KMatrixInputData} [p=2]
	 * @returns {number}
	 */
	cond(p) {
		return LinearAlgebra.cond(this, p);
	}

	/**
	 * Inverse condition number.
	 * @returns {number}
	 */
	rcond() {
		return LinearAlgebra.rcond(this);
	}

	/**
	 * Rank.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {number} rank(A)
	 */
	rank(tolerance) {
		return LinearAlgebra.rank(this, tolerance);
	}

	/**
	 * Trace of a matrix.
	 * Sum of diagonal elements.
	 * @returns {Complex} trace(A)
	 */
	trace() {
		return LinearAlgebra.trace(this);
	}

	/**
	 * Determinant.
	 * @returns {Matrix} |A|
	 */
	det() {
		return LinearAlgebra.det(this);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の作成関係
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Creates a matrix composed of the specified number.
	 * @param {KMatrixInputData} number - Value after initialization.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static memset(number, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		const M = Matrix._toMatrix(number);
		if(!M.isScalar()) {
			const x = M.matrix_array;
			const x_row_length = M.row_length;
			const x_column_length = M.column_length;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				return x[row % x_row_length][col % x_column_length];
			}, dimension, column_length);
		}
		else {
			const x = M.scalar;
			return Matrix.createMatrixDoEachCalculation(function() {
				return x;
			}, dimension, column_length);
		}
	}

	/**
	 * Return identity matrix.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static eye(dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return row === col ? Complex.ONE : Complex.ZERO;
		}, dimension, column_length);
	}
	
	/**
	 * Create zero matrix.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static zeros(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ZERO, dimension, column_length);
	}

	/**
	 * Create a matrix of all ones.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @returns {Matrix}
	 */
	static ones(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ONE, dimension, column_length);
	}

	/**
	 * If matrix, generate diagonal column vector.
	 * If vector, generate a matrix with diagonal elements.
	 * @returns {Matrix} Matrix or vector created. See how to use the function.
	 */
	diag() {
		if(this.isVector()) {
			// 行列を作成
			const M = this;
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
			const len = Math.min(this.row_length, this.column_length);
			const y = new Array(len);
			for(let i = 0; i < len; i++) {
				y[i] = new Array(1);
				y[i][0] = this.matrix_array[i][i];
			}
			return new Matrix(y);
		}
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 比較や判定
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Return true if the matrix is scalar.
	 * @returns {boolean}
	 */
	isScalar() {
		return this.row_length === 1 && this.column_length == 1;
	}
	
	/**
	 * Return true if the matrix is row vector.
	 * @returns {boolean}
	 */
	isRow() {
		return this.row_length === 1;
	}
	
	/**
	 * Return true if the matrix is column vector.
	 * @returns {boolean}
	 */
	isColumn() {
		return this.column_length === 1;
	}

	/**
	 * Return true if the matrix is vector.
	 * @returns {boolean}
	 */
	isVector() {
		return this.row_length === 1 || this.column_length === 1;
	}

	/**
	 * Return true if the value is not scalar.
	 * @returns {boolean}
	 */
	isMatrix() {
		return this.row_length !== 1 && this.column_length !== 1;
	}

	/**
	 * Return true if the matrix is square matrix.
	 * @returns {boolean}
	 */
	isSquare() {
		return this.row_length === this.column_length;
	}

	/**
	 * Return true if the matrix is real matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isReal(tolerance) {
		let is_real = true;
		this._each(function(num){
			if(is_real && (num.isComplex(tolerance))) {
				is_real = false;
			}
		});
		return is_real;
	}

	/**
	 * Return true if the matrix is complex matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isComplex(tolerance) {
		return !this.isReal(tolerance);
	}

	/**
	 * Return true if the matrix is zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZeros(tolerance) {
		let is_zeros = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num){
			if(is_zeros && (!num.isZero(tolerance_))) {
				is_zeros = false;
			}
		});
		return is_zeros;
	}

	/**
	 * Return true if the matrix is identity matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isIdentity(tolerance) {
		let is_identity = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_identity) {
				if(row === col) {
					if(!num.isOne(tolerance_)) {
						is_identity = false;
					}
				}
				else {
					if(!num.isZero(tolerance_)) {
						is_identity = false;
					}
				}
			}
		});
		return is_identity;
	}

	/**
	 * Return true if the matrix is diagonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isDiagonal(tolerance) {
		let is_diagonal = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_diagonal && (row !== col) && (!num.isZero(tolerance_))) {
				is_diagonal = false;
			}
		});
		return is_diagonal;
	}
	
	/**
	 * Return true if the matrix is tridiagonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTridiagonal(tolerance) {
		let is_tridiagonal = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_tridiagonal && (Math.abs(row - col) > 1) && (!num.isZero(tolerance_))) {
				is_tridiagonal = false;
			}
		});
		return is_tridiagonal;
	}

	/**
	 * Return true if the matrix is regular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isRegular(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		// ランクが行列の次元と等しいかどうかで判定
		// det(M) != 0 でもよいが、時間がかかる可能性があるので
		// 誤差は自動で計算など本当はもうすこし良い方法を考える必要がある
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.rank(tolerance_) === this.row_length);
	}

	/**
	 * Return true if the matrix is orthogonal matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOrthogonal(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.transpose()).isIdentity(tolerance_));
	}

	/**
	 * Return true if the matrix is unitary matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isUnitary(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.ctranspose()).isIdentity(tolerance_));
	}

	/**
	 * Return true if the matrix is symmetric matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isSymmetric(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row + 1; col < this.column_length; col++) {
				if(!this.matrix_array[row][col].equals(this.matrix_array[col][row], tolerance_)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Return true if the matrix is hermitian matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isHermitian(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row; col < this.column_length; col++) {
				if(row === col) {
					if(!this.matrix_array[row][col].isReal(tolerance_)) {
						return false;
					}
				}
				else if(!this.matrix_array[row][col].equals(this.matrix_array[col][row].conj(), tolerance_)) {
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * Return true if the matrix is upper triangular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTriangleUpper(tolerance) {
		let is_upper = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_upper && (row > col) && (!num.isZero(tolerance_))) {
				is_upper = false;
			}
		});
		return is_upper;
	}

	/**
	 * Return true if the matrix is  lower triangular matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isTriangleLower(tolerance) {
		let is_lower = true;
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_lower && (row < col) && (!num.isZero(tolerance_))) {
				is_lower = false;
			}
		});
		return is_lower;
	}

	/**
	 * Return true if the matrix is permutation matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isPermutation(tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance_ = tolerance ? tolerance : 1.0e-10;
		const is_row = new Array(this.row_length);
		const is_col = new Array(this.column_length);
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				const target = this.matrix_array[row][col];
				if(target.isOne(tolerance_)) {
					if(!is_row[row] && !is_col[col]) {
						is_row[row] = 1;
						is_col[col] = 1;
					}
					else {
						return false;
					}
				}
				else if(!target.isZero(tolerance_)) {
					return false;
				}
			}
		}
		for(let i = 0;i < this.row_length; i++) {
			if(is_row[i] === undefined || is_col[i] === undefined) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Number of rows and columns of matrix.
	 * @param {?string|?number} [dimension] direction. 1/"row", 2/"column"
	 * @returns {Matrix} [row_length, column_length]
	 */
	size(dimension) {
		if(dimension !== undefined) {
			let target = dimension;
			if(typeof target === "string") {
				target = target.toLocaleLowerCase();
			}
			else if(typeof target !== "number") {
				target = Matrix._toInteger(target);
			}
			if((target === "row") || (target === 1)) {
				return new Matrix(this.row_length);
			}
			else if((target === "column") || (target === 2)) {
				return new Matrix(this.column_length);
			}
		}
		// 行列のサイズを取得
		return new Matrix([[this.row_length, this.column_length]]);
	}

	/**
	 * Compare values.
	 * - Use `compareToMatrix` if you want to compare matrices.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		// ※スカラー同士の場合は、実数を返す
		if(M1.isScalar() && M2.isScalar()) {
			return M1.scalar.compareTo(M2.scalar, tolerance);
		}
		throw "IllegalArgumentException";
	}

	/**
	 * Compare values.
	 * - Use `compareTo` if you want to compare scalar values.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareToMatrix(number, tolerance) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].compareTo(x2[row % M2.row_length][col % M2.column_length], tolerance);
		}, y_row_length, y_column_length);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 四則演算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * Add.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A + B
	 */
	add(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].add(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Subtract.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A - B
	 */
	sub(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].sub(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Multiply.
	 * - Use `dotmul` if you want to use `mul` for each element.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A * B
	 */
	mul(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.mul(M2.scalar));
		}
		if(M1.isScalar()) {
			const y = new Array(M2.row_length);
			for(let row = 0; row < M2.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(let col = 0; col < M2.column_length; col++) {
					y[row][col] = M1.scalar.mul(x2[row][col]);
				}
			}
			return new Matrix(y);
		}
		else if(M2.isScalar()) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(let col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].mul(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M1.column_length !== M2.row_length) {
			throw "Matrix size does not match";
		}
		{
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(let col = 0; col < M2.column_length; col++) {
					let sum = Complex.ZERO;
					for(let i = 0; i < M1.column_length; i++) {
						sum = sum.add(x1[row][i].mul(x2[i][col]));
					}
					y[row][col] = sum;
				}
			}
			return new Matrix(y);
		}
	}

	/**
	 * Divide.
	 * - Use `dotdiv` if you want to use `div` for each element.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A / B
	 */
	div(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		const x1 = M1.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.div(M2.scalar));
		}
		if(M2.isScalar()) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(let col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].div(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M2.row_length === M2.column_length) {
			const tolerance = 1.0e-10;
			const det = M2.det().scalar.norm;
			if(det > tolerance) {
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
	}

	/**
	 * Inverse matrix of this matrix.
	 * - Use `dotinv` if you want to use `inv` for each element.
	 * @returns {Matrix} A^-1
	 */
	inv() {
		return LinearAlgebra.inv(this);
	}

	/**
	 * Multiplication for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .* B
	 */
	dotmul(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mul(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Division for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ./ B
	 */
	dotdiv(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].div(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Inverse of each element of matrix.
	 * @returns {Matrix} 1 ./ A
	 */
	dotinv() {
		const M1 = this;
		const x1 = M1.matrix_array;
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row][col].inv();
		}, M1.row_length, M1.column_length);
	}

	/**
	 * Multiplication for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .* B
	 * @deprecated use the dotmul.
	 */
	nmul(number) {
		return this.dotmul(number);
	}

	/**
	 * Division for each element of matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ./ B
	 * @deprecated use the dotdiv.
	 */
	ndiv(number) {
		return this.dotdiv(number);
	}

	/**
	 * Inverse of each element of matrix.
	 * @returns {Matrix} 1 ./ A
	 * @deprecated use the dotinv.
	 */
	ninv() {
		return this.dotinv();
	}

	/**
	 * Power function for each element of the matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .^ B
	 * @deprecated use the dotpow.
	 */
	npow(number) {
		return this.dotpow(number);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 余り
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Modulo, positive remainder of division for each element of matrix.
	 * - Result has same sign as the Dividend.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .rem B
	 */
	rem(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].rem(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Modulo, positive remainder of division for each element of matrix.
	 * - Result has same sign as the Divisor.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .mod B
	 */
	mod(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mod(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}
	
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// Complexのメソッドにある機能
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Real part of each element.
	 * @returns {Matrix} real(A)
	 */
	real() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.real);
		});
	}
	
	/**
	 * Imaginary part of each element of the matrix.
	 * @returns {Matrix} imag(A)
	 */
	imag() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.imag);
		});
	}

	/**
	 * The argument of each element of matrix.
	 * @returns {Matrix} arg(A)
	 */
	arg() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.arg);
		});
	}

	/**
	 * The positive or negative signs of each element of the matrix.
	 * - +1 if positive, -1 if negative, 0 if 0, norm if complex number.
	 * @returns {Matrix}
	 */
	sign() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.sign());
		});
	}

	/**
	 * Floor.
	 * @returns {Matrix} floor(A)
	 */
	floor() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.floor();
		});
	}

	/**
	 * Ceil.
	 * @returns {Matrix} ceil(A)
	 */
	ceil() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.ceil();
		});
	}

	/**
	 * Rounding to the nearest integer.
	 * @returns {Matrix} round(A)
	 */
	round() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.round();
		});
	}

	/**
	 * To integer rounded down to the nearest.
	 * @returns {Matrix} fix(A), trunc(A)
	 */
	fix() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fix();
		});
	}

	/**
	 * Fraction.
	 * @returns {Matrix} fract(A)
	 */
	fract() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fract();
		});
	}

	/**
	 * Absolute value.
	 * @returns {Matrix} abs(A)
	 */
	abs() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.abs();
		});
	}

	/**
	 * Complex conjugate matrix.
	 * @returns {Matrix} real(A) - imag(A)j
	 */
	conj() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.conj();
		});
	}

	/**
	 * this * -1
	 * @returns {Matrix} -A
	 */
	negate() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.negate();
		});
	}

	// ----------------------
	// 指数
	// ----------------------
	
	/**
	 * Power function.
	 * - Unless the matrix is a scalar value, only integers are supported.
	 * - Use `dotpow` if you want to use `pow` for each element. A real number can be specified.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} pow(A, B)
	 */
	pow(number) {
		if(this.isScalar()) {
			return new Matrix(this.scalar.pow(Matrix._toDouble(number)));
		}
		else {
			if(!this.isSquare()) {
				throw "not square " + this;
			}
			let n = Matrix._toInteger(number);
			if(n < 0) {
				throw "error negative number " + n;
			}
			let x, y;
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
		}
	}

	/**
	 * Power function for each element of the matrix.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A .^ B
	 */
	dotpow(number) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].pow(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * Square.
	 * - Unless the matrix is a scalar value, only integers are supported.
	 * @returns {Matrix} pow(A, 2)
	 */
	square() {
		return this.pow(2);
	}

	/**
	 * Square root.
	 * @returns {Matrix} sqrt(A)
	 */
	sqrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sqrt();
		});
	}

	/**
	 * Cube root.
	 * @returns {Matrix} sqrt(A)
	 */
	cbrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cbrt();
		});
	}

	/**
	 * Reciprocal square root.
	 * @returns {Matrix} rsqrt(A)
	 */
	rsqrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.rsqrt();
		});
	}

	/**
	 * Logarithmic function.
	 * @returns {Matrix} log(A)
	 */
	log() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log();
		});
	}

	/**
	 * Exponential function.
	 * @returns {Matrix} exp(A)
	 */
	exp() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.exp();
		});
	}

	/**
	 * e^x - 1
	 * @returns {Matrix} expm1(A)
	 */
	expm1() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.expm1();
		});
	}

	/**
	 * ln(1 + x)
	 * @returns {Matrix} log1p(A)
	 */
	log1p() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log1p();
		});
	}
	
	/**
	 * log_2(x)
	 * @returns {Matrix} log2(A)
	 */
	log2() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log2();
		});
	}

	/**
	 * log_10(x)
	 * @returns {Matrix} log10(A)
	 */
	log10() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log10();
		});
	}

	// ----------------------
	// 三角関数
	// ----------------------
	
	/**
	 * Sine function.
	 * @returns {Matrix} sin(A)
	 */
	sin() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sin();
		});
	}

	/**
	 * Cosine function.
	 * @returns {Matrix} cos(A)
	 */
	cos() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cos();
		});
	}

	/**
	 * Tangent function.
	 * @returns {Matrix} tan(A)
	 */
	tan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tan();
		});
	}
	
	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI/2, PI/2].
	 * @returns {Matrix} atan(A)
	 */
	atan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan();
		});
	}

	/**
	 * Atan (arc tangent) function.
	 * - Return the values of [-PI, PI].
	 * - Supports only real numbers.
	 * @param {KMatrixInputData} number - X
	 * @returns {Matrix} atan2(Y, X)
	 */
	atan2(number) {
		const X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan2(X);
		});
	}

	// ----------------------
	// 双曲線関数
	// ----------------------
	
	/**
	 * Arc sine function.
	 * @returns {Matrix} asin(A)
	 */
	asin() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asin();
		});
	}

	/**
	 * Arc cosine function.
	 * @returns {Matrix} acos(A)
	 */
	acos() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acos();
		});
	}
	
	/**
	 * Hyperbolic sine function.
	 * @returns {Matrix} sinh(A)
	 */
	sinh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinh();
		});
	}

	/**
	 * Inverse hyperbolic sine function.
	 * @returns {Matrix} asinh(A)
	 */
	asinh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asinh();
		});
	}

	/**
	 * Hyperbolic cosine function.
	 * @returns {Matrix} cosh(A)
	 */
	cosh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cosh();
		});
	}

	/**
	 * Inverse hyperbolic cosine function.
	 * @returns {Matrix} acosh(A)
	 */
	acosh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acosh();
		});
	}

	/**
	 * Hyperbolic tangent function.
	 * @returns {Matrix} tanh(A)
	 */
	tanh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tanh();
		});
	}
	
	/**
	 * Inverse hyperbolic tangent function.
	 * @returns {Matrix} atanh(A)
	 */
	atanh() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atanh();
		});
	}

	/**
	 * Secant function.
	 * @returns {Matrix} sec(A)
	 */
	sec() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sec();
		});
	}

	/**
	 * Reverse secant function.
	 * @returns {Matrix} asec(A)
	 */
	asec() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asec();
		});
	}

	/**
	 * Hyperbolic secant function.
	 * @returns {Matrix} sech(A)
	 */
	sech() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sech();
		});
	}

	/**
	 * Inverse hyperbolic secant function.
	 * @returns {Matrix} asech(A)
	 */
	asech() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.asech();
		});
	}

	/**
	 * Cotangent function.
	 * @returns {Matrix} cot(A)
	 */
	cot() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cot();
		});
	}

	/**
	 * Inverse cotangent function.
	 * @returns {Matrix} acot(A)
	 */
	acot() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acot();
		});
	}

	/**
	 * Hyperbolic cotangent function.
	 * @returns {Matrix} coth(A)
	 */
	coth() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.coth();
		});
	}

	/**
	 * Inverse hyperbolic cotangent function.
	 * @returns {Matrix} acoth(A)
	 */
	acoth() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acoth();
		});
	}

	/**
	 * Cosecant function.
	 * @returns {Matrix} csc(A)
	 */
	csc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.csc();
		});
	}

	/**
	 * Inverse cosecant function.
	 * @returns {Matrix} acsc(A)
	 */
	acsc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acsc();
		});
	}

	/**
	 * Hyperbolic cosecant function.
	 * @returns {Matrix} csch(A)
	 */
	csch() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.csch();
		});
	}

	/**
	 * Inverse hyperbolic cosecant function.
	 * @returns {Matrix} acsch(A)
	 */
	acsch() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.acsch();
		});
	}

	// ----------------------
	// 信号処理系
	// ----------------------
	
	/**
	 * Normalized sinc function.
	 * @returns {Matrix} sinc(A)
	 */
	sinc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinc();
		});
	}
	
	// ----------------------
	// 乱数
	// ----------------------
	
	/**
	 * Generate a matrix composed of random values with uniform random numbers.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Matrix}
	 */
	static rand(dimension, column_length, random) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.rand(random);
		}, dimension, column_length);
	}

	/**
	 * Generate a matrix composed of random values with normal distribution.
	 * @param {KMatrixInputData} dimension - Number of dimensions or rows.
	 * @param {KMatrixInputData} [column_length] - Number of columns.
	 * @param {Random} [random] - Class for creating random numbers.
	 * @returns {Matrix}
	 */
	static randn(dimension, column_length, random) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.randn(random);
		}, dimension, column_length);
	}

	// ----------------------
	// テスト系
	// ----------------------
	
	/**
	 * Test if each element of the matrix is integer.
	 * - 1 if true, 0 if false.
	 * - Use `isInteger` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testInteger(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is complex integer.
	 * - 1 if true, 0 if false.
	 * - Use `isComplexInteger` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testComplexInteger(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplexInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) === 0
	 * - 1 if true, 0 if false.
	 * - Use `isZero` if you want to test first element.
	 * - Use `isZeros` to check for a zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testZero(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isZero(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) === 1
	 * - 1 if true, 0 if false.
	 * - Use `isOne` if you want to test first element.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testOne(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isOne(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is complex.
	 * - 1 if true, 0 if false.
	 * - Use `isComplex` to test whether a matrix contains complex numbers.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testComplex(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplex(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is real.
	 * - 1 if true, 0 if false.
	 * - Use `isReal` to test for complex numbers in matrices.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testReal(tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isReal(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is NaN.
	 * - 1 if true, 0 if false.
	 * - Use `isNaN` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNaN() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNaN() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) > 0
	 * - 1 if true, 0 if false.
	 * - Use `isPositive` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPositive() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositive() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) < 0
	 * - 1 if true, 0 if false.
	 * - Use `isNegative` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(this) >= 0
	 * - 1 if true, 0 if false.
	 * - Use `isNotNegative` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNotNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNotNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Test if each element of the matrix is positive infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isPositiveInfinity` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPositiveInfinity() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositiveInfinity() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is negative infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isNegativeInfinity` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testNegativeInfinity() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegativeInfinity() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is infinite.
	 * - 1 if true, 0 if false.
	 * - Use `isInfinite` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testInfinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInfinite() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is finite.
	 * - 1 if true, 0 if false.
	 * - Use `isFinite` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testFinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isFinite() ? Complex.ONE : Complex.ZERO;
		});
	}


	// ----------------------
	// 1要素のみのテスト
	// ----------------------
	
	/**
	 * this === 0
	 * - Use only the first element.
	 * - Use `testZero` if you want to test the elements of a matrix.
	 * - Use `isZeros` to check for a zero matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isZero(tolerance) {
		return this.scalar.isZero(tolerance);
	}
	
	/**
	 * this === 1
	 * - Use only the first element.
	 * - Use `testOne` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isOne(tolerance) {
		return this.scalar.isOne(tolerance);
	}
	
	/**
	 * this > 0
	 * - Use only the first element.
	 * - Use `testPositive` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isPositive() {
		return this.scalar.isPositive();
	}

	/**
	 * this < 0
	 * - Use only the first element.
	 * - Use `testNegative` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isNegative() {
		return this.scalar.isNegative();
	}

	/**
	 * this >= 0
	 * - Use only the first element.
	 * - Use `testNotNegative` if you want to test the elements of a matrix.
	 * @returns {boolean}
	 */
	isNotNegative() {
		return this.scalar.isNotNegative();
	}
	
	/**
	 * this === NaN
	 * - Use only the first element.
	 * - Use `testNaN` if you want to test the elements of a matrix.
	 * @returns {boolean} isNaN(A)
	 */
	isNaN() {
		return this.scalar.isNaN();
	}
	
	/**
	 * this === Infinity
	 * - Use only the first element.
	 * - Use `testPositiveInfinity` if you want to test the elements of a matrix.
	 * @returns {boolean} isPositiveInfinity(A)
	 */
	isPositiveInfinity() {
		return this.scalar.isPositiveInfinity();
	}

	/**
	 * this === -Infinity
	 * - Use only the first element.
	 * - Use `testNegativeInfinity` if you want to test the elements of a matrix.
	 * @returns {boolean} isNegativeInfinity(A)
	 */
	isNegativeInfinity() {
		return this.scalar.isNegativeInfinity();
	}

	/**
	 * this === Infinity or -Infinity
	 * - Use only the first element.
	 * - Use `testInfinite` if you want to test the elements of a matrix.
	 * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
	 */
	isInfinite() {
		return this.scalar.isInfinite();
	}
	
	/**
	 * Return true if the value is finite number.
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @returns {boolean} !isNaN(A) && !isInfinite(A)
	 */
	isFinite() {
		return this.scalar.isFinite();
	}

	/**
	 * Return true if the value is integer.
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean}
	 */
	isInteger(tolerance) {
		return this.scalar.isInteger(tolerance);
	}

	/**
	 * Returns true if the vallue is complex integer (including normal integer).
	 * - Use only the first element.
	 * - Use `testFinite` if you want to test the elements of a matrix.
	 * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
	 * @returns {boolean} real(A) === integer && imag(A) === integer
	 */
	isComplexInteger(tolerance) {
		return this.scalar.isComplexInteger(tolerance);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の計算でよく使用する処理。
	// メソッド内部の処理を記述する際に使用している。
	// 他から使用する場合は注意が必要である。
	// 前提条件があるメソッド、ミュータブルとなっている。
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Rotate matrix 90 degrees clockwise. (mutable)
	 * @param {KMatrixInputData} rot_90_count - Number of times rotated by 90 degrees.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_rot90(rot_90_count) {
		const count = Matrix._toInteger(rot_90_count);
		let rot_type = 1;
		if(arguments.length === 1) {
			rot_type = ((count % 4) + 4) % 4;
		}
		if(rot_type === 0) {
			return this;
		}
		// バックアップ
		const x = new Array(this.row_length);
		for(let i = 0; i < this.row_length; i++) {
			x[i] = new Array(this.column_length);
			for(let j = 0; j < this.column_length; j++) {
				x[i][j] = this.matrix_array[i][j];
			}
		}
		const y = this.matrix_array;
		if(rot_type === 1) {
			// 90度回転
			y.splice(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(let row = 0; row < this.row_length; row++) {
					y[col][row] = x[this.row_length - row - 1][col];
				}
			}
		}
		else if(rot_type === 2) {
			// 180度回転
			for(let row = 0; row < this.row_length; row++) {
				for(let col = 0; col < this.column_length; col++) {
					y[row][col] = x[this.row_length - row - 1][this.column_length - col - 1];
				}
			}
		}
		else if(rot_type === 3) {
			// 270度回転
			y.splice(this.column_length);
			for(let col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(let row = 0; row < this.row_length; row++) {
					y[col][row] = x[row][this.column_length - col - 1];
				}
			}
		}
		this.row_length = y.length;
		this.column_length = y[0].length;
		this._clearCash();
		return this;
	}

	/**
	 * Rotate matrix 90 degrees clockwise.
	 * @param {KMatrixInputData} rot_90_count - Number of times rotated by 90 degrees.
	 * @returns {Matrix} Matrix after function processing.
	 */
	rot90(rot_90_count) {
		return this.clone()._rot90(rot_90_count);
	}

	/**
	 * Change the size of the matrix. (mutable)
	 * Initialized with 0 when expanding.
	 * @param {KMatrixInputData} new_row_length - Number of rows of matrix to resize.
	 * @param {KMatrixInputData} new_column_length - Number of columns of matrix to resize.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @ignore
	 */
	_resize(new_row_length, new_column_length) {
		const row_length	= Matrix._toInteger(new_row_length);
		const column_length	= Matrix._toInteger(new_column_length);
		if((row_length === this.row_length) && (column_length === this.column_length)) {
			return this;
		}
		if((row_length <= 0) || (column_length <= 0)) {
			throw "_resize";
		}
		const row_max = Math.max(this.row_length, row_length);
		const col_max = Math.max(this.column_length, column_length);
		const y = this.matrix_array;
		// 大きくなった行と列に対してゼロで埋める
		for(let row = 0; row < row_max; row++) {
			if(row >= this.row_length) {
				y[row] = new Array(col_max);
			}
			for(let col = 0; col < col_max; col++) {
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
			for(let row = 0; row < y.length; row++) {
				y[row].splice(column_length);
			}
		}
		this.row_length = row_length;
		this.column_length = column_length;
		this._clearCash();
		return this;
	}

	/**
	 * Change the size of the matrix.
	 * Initialized with 0 when expanding.
	 * @param {KMatrixInputData} row_length - Number of rows of matrix to resize.
	 * @param {KMatrixInputData} column_length - Number of columns of matrix to resize.
	 * @returns {Matrix} Matrix after function processing.
	 */
	resize(row_length, column_length) {
		return this.clone()._resize(row_length, column_length);
	}

	/**
	 * Remove the row in this matrix. (mutable)
	 * @param {KMatrixInputData} delete_row_index - Number of row of matrix to delete.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_deleteRow(delete_row_index) {
		const row_index	= Matrix._toInteger(delete_row_index);
		if((this.row_length === 1) || (this.row_length <= row_index)) {
			throw "_deleteRow";
		}
		this.matrix_array.splice(row_index, 1);
		this.row_length--;
		this._clearCash();
		return this;
	}
	
	/**
	 * Remove the column in this matrix. (mutable)
	 * @param {KMatrixInputData} delete_column_index - Number of column of matrix to delete.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_deleteColumn(delete_column_index) {
		const column_index	= Matrix._toInteger(delete_column_index);
		if((this.column_length === 1) || (this.column_length <= column_index)) {
			throw "_deleteColumn";
		}
		for(let row = 0; row < this.row_length; row++) {
			this.matrix_array[row].splice(column_index, 1);
		}
		this.column_length--;
		this._clearCash();
		return this;
	}

	/**
	 * Remove the row in this matrix.
	 * @param {KMatrixInputData} delete_row_index - Number of row of matrix to delete.
	 * @returns {Matrix} Matrix after function processing.
	 */
	deleteRow(delete_row_index) {
		return this.clone()._deleteRow(delete_row_index);
	}

	/**
	 * Remove the column in this matrix.
	 * @param {KMatrixInputData} delete_column_index - Number of column of matrix to delete.
	 * @returns {Matrix} Matrix after function processing.
	 */
	deleteColumn(delete_column_index) {
		return this.clone()._deleteColumn(delete_column_index);
	}

	/**
	 * Swap rows in the matrix. (mutable)
	 * @param {KMatrixInputData} exchange_row_index1 - Number 1 of row of matrix to exchange.
	 * @param {KMatrixInputData} exchange_row_index2 - Number 2 of row of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @ignore
	 */
	_exchangeRow(exchange_row_index1, exchange_row_index2) {
		const row_index1	= Matrix._toInteger(exchange_row_index1);
		const row_index2	= Matrix._toInteger(exchange_row_index2);
		if((this.row_length === 1) || (this.row_length <= row_index1) || (this.row_length <= row_index2)) {
			throw "_exchangeRow";
		}
		if(row_index1 === row_index2) {
			return this;
		}
		const swap = this.matrix_array[row_index1];
		this.matrix_array[row_index1] = this.matrix_array[row_index2];
		this.matrix_array[row_index2] = swap;
		this._clearCash();
		return this;
	}

	/**
	 * Swap columns in the matrix. (mutable)
	 * @param {KMatrixInputData} exchange_column_index1 - Number 1 of column of matrix to exchange.
	 * @param {KMatrixInputData} exchange_column_index2 - Number 2 of column of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @ignore
	 */
	_exchangeColumn(exchange_column_index1, exchange_column_index2) {
		const column_index1	= Matrix._toInteger(exchange_column_index1);
		const column_index2	= Matrix._toInteger(exchange_column_index2);
		if((this.column_length === 1) || (this.column_length <= column_index1) || (this.column_length <= column_index2)) {
			throw "_exchangeColumn";
		}
		if(column_index1 === column_index2) {
			return this;
		}
		for(let row = 0; row < this.row_length; row++) {
			const swap = this.matrix_array[row][column_index1];
			this.matrix_array[row][column_index1] = this.matrix_array[row][column_index2];
			this.matrix_array[row][column_index2] = swap;
		}
		this._clearCash();
		return this;
	}

	/**
	 * Swap rows in the matrix.
	 * @param {KMatrixInputData} exchange_row_index1 - Number 1 of row of matrix to exchange.
	 * @param {KMatrixInputData} exchange_row_index2 - Number 2 of row of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing.
	 */
	exchangeRow(exchange_row_index1, exchange_row_index2) {
		return this.clone()._exchangeRow(exchange_row_index1, exchange_row_index2);
	}

	/**
	 * Swap columns in the matrix.
	 * @param {KMatrixInputData} exchange_column_index1 - Number 1 of column of matrix to exchange.
	 * @param {KMatrixInputData} exchange_column_index2 - Number 2 of column of matrix to exchange.
	 * @returns {Matrix} Matrix after function processing.
	 */
	exchangeColumn(exchange_column_index1, exchange_column_index2) {
		return this.clone()._exchangeColumn(exchange_column_index1, exchange_column_index2);
	}

	/**
	 * Combine matrix to the right of this matrix. (mutable)
	 * @param {KMatrixInputData} left_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @ignore
	 */
	_concatRight(left_matrix) {
		const M = Matrix._toMatrix(left_matrix);
		if(this.row_length != M.row_length) {
			throw "_concatRight";
		}
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < M.column_length; col++) {
				this.matrix_array[row].push(M.matrix_array[row][col]);
			}
		}
		this.column_length += M.column_length;
		this._clearCash();
		return this;
	}

	/**
	 * Combine matrix to the bottom of this matrix. (mutable)
	 * @param {KMatrixInputData} bottom_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing. (this)
	 * @private
	 */
	_concatBottom(bottom_matrix) {
		const M = Matrix._toMatrix(bottom_matrix);
		if(this.column_length != M.column_length) {
			throw "_concatBottom";
		}
		for(let row = 0; row < M.row_length; row++) {
			this.matrix_array.push(M.matrix_array[row]);
		}
		this.row_length += M.row_length;
		this._clearCash();
		return this;
	}

	/**
	 * Combine matrix to the right of this matrix.
	 * @param {KMatrixInputData} left_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing.
	 */
	concatRight(left_matrix) {
		return this.clone()._concatRight(left_matrix);
	}

	/**
	 * Combine matrix to the bottom of this matrix.
	 * @param {KMatrixInputData} bottom_matrix - Matrix to combine.
	 * @returns {Matrix} Matrix after function processing.
	 */
	concatBottom(bottom_matrix) {
		return this.clone()._concatBottom(bottom_matrix);
	}

	/**
	 * Clip each element of matrix to specified range.
	 * @param {KMatrixInputData} min 
	 * @param {KMatrixInputData} max 
	 * @returns {Matrix} min(max(x, min), max)
	 */
	clip(min, max) {
		const MIN = Matrix._toMatrix(min);
		const MAX = Matrix._toMatrix(max);
		const x_min = MIN.matrix_array;
		const x_max = MAX.matrix_array;
		return this.cloneMatrixDoEachCalculation(
			function(num, row, col) {
				const d_min = x_min[row % MIN.row_length][col % MIN.column_length];
				const d_max = x_max[row % MAX.row_length][col % MAX.column_length];
				return num.clip(d_min, d_max);
			}
		);
	}

	/**
	 * Create row vector with specified initial value, step value, end condition.
	 * @param {KMatrixInputData} start_or_stop 
	 * @param {KMatrixInputData} [stop]
	 * @param {KMatrixInputData} [step=1] 
	 * @returns {Matrix}
	 */
	static arange(start_or_stop, stop, step) {
		const from  = stop !== undefined ? Matrix._toComplex(start_or_stop) : Complex.ZERO;
		const to    = stop !== undefined ? Matrix._toComplex(stop) : Matrix._toComplex(start_or_stop);
		const delta = step !== undefined ? Matrix._toComplex(step) : Complex.ONE;
		return new Matrix(MatrixTool.InterpolationCalculation(from, delta, to, false));
	}

	/**
	 * Circular shift.
	 * @param {KMatrixInputData} shift_size 
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	circshift(shift_size, type) {
		const shift = Matrix._toInteger(shift_size);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const y = new Array(data.length);
			let from = ((- shift % data.length) + data.length) % data.length;
			for(let i = 0; i < data.length; i++) {
				y[i] = data[from++];
				if(from === data.length) {
					from = 0;
				}
			}
			return y;
		};
		return this.eachVector(main, dim);
	}

	/**
	 * Circular shift.
	 * @param {KMatrixInputData} shift_size 
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	roll(shift_size, type) {
		return this.circshift(shift_size, type);
	}

	/**
	 * Change the shape of the matrix.
	 * The number of elements in the matrix doesn't increase or decrease.
	 * @param {KMatrixInputData} row_length - Number of rows of matrix to reshape.
	 * @param {KMatrixInputData} column_length - Number of columns of matrix to reshape.
	 * @returns {Matrix} Matrix after function processing.
	 */
	reshape(row_length, column_length) {
		const new_row_length = Matrix._toInteger(row_length);
		const new_column_length = Matrix._toInteger(column_length);
		const this_size = this.row_length * this.column_length;
		const new_size = new_row_length * new_column_length;
		if(this_size !== new_size) {
			throw "reshape error. (this_size !== new_size)->(" + this_size + " !== " + new_size + ")";
		}
		const m = this.matrix_array;
		let m_col = 0;
		let m_row = 0;
		const y = new Array(new_row_length);
		for(let row = 0; row < new_row_length; row++) {
			y[row] = new Array(new_column_length);
			for(let col = 0; col < new_column_length; col++) {
				y[row][col] = m[m_row][m_col];
				m_col++;
				if(m_col === this.column_length) {
					m_col = 0;
					m_row++;
				}
			}
		}
		return new Matrix(y);
	}

	/**
	 * Flip this matrix left and right.
	 * @returns {Matrix} Matrix after function processing.
	 */
	fliplr() {
		return this.flip({dimension : "row"});
	}

	/**
	 * Flip this matrix up and down.
	 * @returns {Matrix} Matrix after function processing.
	 */
	flipud() {
		return this.flip({dimension : "column"});
	}

	/**
	 * Flip this matrix.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} Matrix after function processing.
	 */
	flip(type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			const y = new Array(data.length);
			for(let i = 0, j = data.length - 1; i < data.length; i++, j--) {
				y[i] = data[j];
			}
			return y;
		};
		return this.eachVector(main, dim);
	}

	/**
	 * Index sort.
	 * - Sorts by row when setting index by row vector to the argument.
	 * - Sorts by column when setting index by column vector to the argument.
	 * @param {KMatrixInputData} v - Vector with index. (See the description of this function)
	 * @returns {Matrix} Matrix after function processing.
	 */
	indexsort(v) {
		const V = Matrix._toMatrix(v);
		if(V.isMatrix()) {
			throw "argsort error. argsort is not vector. (" + V.toOneLineString + ")";
		}
		let is_transpose = false;
		let target_array = null;
		let index_array = null;
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
		const sort_data = new Array(index_array.length);
		for(let i = 0; i < index_array.length; i++) {
			sort_data[i] = {
				index : index_array[i],
				data : target_array[i]
			};
		}
		/**
		 * 比較関数を作成
		 * @type {function({index : Complex}, {index : Complex}): number }
		 */
		const compare = function(a, b) {
			return a.index.compareTo(b.index);
		};
		{
			/**
			 * @type {Array<{index : Complex}>}
			 */
			const temp = [];
			/**
			 * ソート関数（安定マージソート）
			 * @param {Array<{index : Complex}>} elements 
			 * @param {number} first 
			 * @param {number} last 
			 * @param {function({index : Complex}, {index : Complex}): number} cmp_function 
			 * @returns {boolean}
			 */
			const sort = function(elements, first, last, cmp_function) { 
				if(first < last) {
					const middle = Math.floor((first + last) / 2);
					sort(elements, first, middle, cmp_function);
					sort(elements, middle + 1, last, cmp_function);
					let p = 0, i, j, k;
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
		const y = new Array(index_array.length);
		for(let i = 0; i < index_array.length; i++) {
			y[i] = sort_data[i].data;
		}
		// 行列を作成する
		const Y = new Matrix(y);
		if(!is_transpose) {
			return Y;
		}
		else {
			return Y.transpose();
		}
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の一般計算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Transpose a matrix.
	 * @returns {Matrix} A^T
	 */
	transpose() {
		const y = new Array(this.column_length);
		for(let col = 0; col < this.column_length; col++) {
			y[col] = new Array(this.row_length);
			for(let row = 0; row < this.row_length; row++) {
				y[col][row] = this.matrix_array[row][col];
			}
		}
		return new Matrix(y);
	}

	/**
	 * Hermitian transpose.
	 * @returns {Matrix} A^T
	 */
	ctranspose() {
		return this.transpose().conj();
	}

	/**
	 * Hermitian transpose.
	 * @returns {Matrix} A^T
	 */
	T() {
		return this.ctranspose();
	}

	/**
	 * Inner product/Dot product.
	 * @param {KMatrixInputData} number 
	 * @param {KMatrixInputData} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
	 * @returns {Matrix} A・B
	 */
	inner(number, dimension=1) {
		return LinearAlgebra.inner(this, number, dimension);
	}
	
	/**
	 * LUP decomposition.
	 * - P'*L*U=A
	 * - P is permutation matrix.
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
	 */
	lup() {
		return LinearAlgebra.lup(this);
	}

	/**
	 * LU decomposition.
	 * - L*U=A
	 * - L is lower triangular matrix.
	 * - U is upper triangular matrix.
	 * @returns {{L: Matrix, U: Matrix}} {L, U}
	 */
	lu() {
		return LinearAlgebra.lu(this);
	}

	/**
	 * Solving a system of linear equations to be Ax = B
	 * @param {KMatrixInputData} number - B
	 * @returns {Matrix} x
	 */
	linsolve(number) {
		return LinearAlgebra.linsolve(this, number);
	}

	/**
	 * QR decomposition.
	 * - Q*R=A
	 * - Q is orthonormal matrix.
	 * - R is upper triangular matrix.
	 * @returns {{Q: Matrix, R: Matrix}} {Q, R}
	 */
	qr() {
		return LinearAlgebra.qr(this);
	}

	/**
	 * Tridiagonalization of symmetric matrix.
	 * - Don't support complex numbers.
	 * - P*H*P'=A
	 * - P is orthonormal matrix.
	 * - H is tridiagonal matrix.
	 * - The eigenvalues of H match the eigenvalues of A.
	 * @returns {{P: Matrix, H: Matrix}} {P, H}
	 */
	tridiagonalize() {
		return LinearAlgebra.tridiagonalize(this);
	}

	/**
	 * Eigendecomposition of symmetric matrix.
	 * - Don't support complex numbers.
	 * - V*D*V'=A.
	 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
	 * - D is a matrix containing the eigenvalues on the diagonal component.
	 * @returns {{V: Matrix, D: Matrix}} {D, V}
	 */
	eig() {
		return LinearAlgebra.eig(this);
	}

	/**
	 * Singular Value Decomposition (SVD).
	 * - U*S*V'=A
	 * - U and V are orthonormal matrices.
	 * - S is a matrix with singular values in the diagonal.
	 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
	 */
	svd() {
		return LinearAlgebra.svd(this);
	}

	/**
	 * Pseudo-inverse matrix.
	 * @returns {Matrix} A^+
	 */
	pinv() {
		return LinearAlgebra.pinv(this);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// probability 確率計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Log-gamma function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	gammaln() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gammaln();
		});
	}

	/**
	 * Gamma function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	gamma() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gamma();
		});
	}

	/**
	 * Incomplete gamma function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	gammainc(a, tail) {
		const a_ = Matrix._toDouble(a);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gammainc(a_, tail);
		});
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gampdf(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gampdf(k_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gamcdf(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gamcdf(k_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - Shape parameter.
	 * @param {KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	gaminv(k, s) {
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gaminv(k_, s_);
		});
	}

	/**
	 * Beta function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} y
	 * @returns {Matrix}
	 */
	beta(y) {
		const y_ = Matrix._toDouble(y);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.beta(y_);
		});
	}
	
	/**
	 * Incomplete beta function.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	betainc(a, b, tail) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betainc(a_, b_, tail);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betacdf(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betacdf(a_, b_);
		});
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betapdf(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betapdf(a_, b_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} a
	 * @param {KMatrixInputData} b
	 * @returns {Matrix}
	 */
	betainv(a, b) {
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.betainv(a_, b_);
		});
	}

	/**
	 * Factorial function, x!.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	factorial() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.factorial();
		});
	}
	
	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k
	 * @returns {Matrix}
	 */
	nchoosek(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.nchoosek(k_);
		});
	}
	
	/**
	 * Error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erf() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erf();
		});
	}

	/**
	 * Complementary error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfc();
		});
	}
	
	/**
	 * Inverse function of Error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfinv() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfinv();
		});
	}
	
	/**
	 * Inverse function of Complementary error function.
	 * - Calculate from real values.
	 * @returns {Matrix}
	 */
	erfcinv() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.erfcinv();
		});
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	normpdf(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.normpdf(u_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	normcdf(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.normcdf(u_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} [u=0.0] - Average value.
	 * @param {KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	norminv(u, s) {
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.norminv(u_, s_);
		});
	}

	/**
	 * Probability density function (PDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @returns {Matrix}
	 */
	binopdf(n, p) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binopdf(n_, p_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	binocdf(n, p, tail) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binocdf(n_, p_, tail);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of binomial distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} n
	 * @param {KMatrixInputData} p
	 * @returns {Matrix}
	 */
	binoinv(n, p) {
		const n_ = Matrix._toDouble(n);
		const p_ = Matrix._toDouble(p);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.binoinv(n_, p_);
		});
	}

	/**
	 * Probability density function (PDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poisspdf(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poisspdf(lambda_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poisscdf(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poisscdf(lambda_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of Poisson distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} lambda
	 * @returns {Matrix}
	 */
	poissinv(lambda) {
		const lambda_ = Matrix._toDouble(lambda);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.poissinv(lambda_);
		});
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tpdf(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tpdf(v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tcdf(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tcdf(v_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tinv(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tinv(v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @param {KMatrixInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Matrix}
	 */
	tdist(v, tails) {
		const v_ = Matrix._toDouble(v);
		const tails_ = Matrix._toDouble(tails);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tdist(v_, tails_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	tinv2(v) {
		const v_ = Matrix._toDouble(v);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tinv2(v_);
		});
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2pdf(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2pdf(k_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2cdf(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2cdf(k_);
		});
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	chi2inv(k) {
		const k_ = Matrix._toDouble(k);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.chi2inv(k_);
		});
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	fpdf(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fpdf(d1_, d2_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	fcdf(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fcdf(d1_, d2_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * - Calculate from real values.
	 * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	finv(d1, d2) {
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.finv(d1_, d2_);
		});
	}

	// ----------------------
	// ビット演算系
	// ----------------------
	
	/**
	 * Logical AND.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A & B
	 */
	and(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.and(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical OR.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A | B
	 */
	or(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.or(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical Exclusive-OR.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} A ^ B
	 */
	xor(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.xor(Matrix._toDouble(number));
		});
	}

	/**
	 * Logical Not. (mutable)
	 * - Calculated as an integer.
	 * @returns {Matrix} !A
	 */
	not() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.not();
		});
	}
	
	/**
	 * this << n
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} n
	 * @returns {Matrix} A << n
	 */
	shift(n) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.shift(Matrix._toDouble(n));
		});
	}

	// ----------------------
	// gcd, lcm
	// ----------------------
	
	/**
	 * Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} gcd(x, y)
	 */
	gcd(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.gcd(Matrix._toDouble(number));
		});
	}

	/**
	 * Extended Euclidean algorithm.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Array<Matrix>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
	 */
	extgcd(number) {
		if(!this.isScalar()) {
			throw "IllegalArgumentException";
		}
		const x = this.scalar;
		const y = Matrix._toDouble(number);
		const result =x.extgcd(y);
		return [new Matrix(result[0]), new Matrix(result[1]), new Matrix(result[2])];
	}

	/**
	 * Least common multiple.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} number 
	 * @returns {Matrix} lcm(x, y)
	 */
	lcm(number) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.lcm(Matrix._toDouble(number));
		});
	}

	// ----------------------
	// mod
	// ----------------------

	/**
	 * Modular exponentiation.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} exponent
	 * @param {KMatrixInputData} m 
	 * @returns {Matrix} A^B mod m
	 */
	modPow(exponent, m) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.modPow(Matrix._toDouble(exponent), Matrix._toDouble(m));
		});
	}

	/**
	 * Modular multiplicative inverse.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} m
	 * @returns {Matrix} A^(-1) mod m
	 */
	modInverse(m) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.modInverse(Matrix._toDouble(m));
		});
	}
	
	// ----------------------
	// その他の演算
	// ----------------------
	
	/**
	 * Multiply a multiple of ten.
	 * @param {KMatrixInputData} n
	 * @returns {Matrix} x * 10^n
	 */
	scaleByPowerOfTen(n) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.scaleByPowerOfTen(Matrix._toComplex(n));
		});
	}

	// ----------------------
	// 素数
	// ----------------------
	
	/**
	 * Test if each element of the matrix is prime number.
	 * - 1 if true, 0 if false.
	 * - Calculated as an integer.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * - Use `isPrime` if you want to test first element.
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testPrime() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPrime() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * Test if each element of the matrix is prime number by Miller-Labin prime number determination method.
	 * - 1 if true, 0 if false.
	 * - Use `isProbablePrime` if you want to test first element.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
	 */
	testProbablePrime(certainty) {
		const p1 = certainty !== undefined ? Math.round(Matrix._toDouble(certainty)) : undefined;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isProbablePrime(p1) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * Next prime.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @param {KMatrixInputData} [search_max=100000] - Search range of next prime.
	 * @returns {Matrix}
	 */
	nextProbablePrime(certainty, search_max) {
		const p1 = certainty !== undefined ? Math.round(Matrix._toDouble(certainty)) : undefined;
		const p2 = search_max !== undefined ? Math.round(Matrix._toDouble(search_max)) : undefined;
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.nextProbablePrime(p1, p2);
		});
	}
	
	/**
	 * Return true if the value is prime number.
	 * - Calculated as an integer.
	 * - Calculate up to `2251799813685248(=2^51)`.
	 * - Use only the first element.
	 * - Use `testPrime` if you want to test the elements of a matrix.
	 * @returns {boolean} - If the calculation range is exceeded, null is returned.
	 */
	isPrime() {
		return this.scalar.isPrime();
	}
	
	/**
	 * Return true if the value is prime number by Miller-Labin prime number determination method.
	 * - Use only the first element.
	 * - Use `testProbablePrime` if you want to test the elements of a matrix.
	 * 
	 * Attention : it takes a very long time to process.
	 * - Calculated as an integer.
	 * @param {KMatrixInputData} [certainty=100] - Repeat count (prime precision).
	 * @returns {boolean}
	 */
	isProbablePrime(certainty) {
		return this.scalar.isProbablePrime(certainty);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// statistics 統計計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Maximum number.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} max([A, B])
	 */
	max(type) {
		return Statistics.max(this, type);
	}
	
	/**
	 * Minimum number.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} min([A, B])
	 */
	min(type) {
		return Statistics.min(this, type);
	}
	
	/**
	 * Sum.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	sum(type) {
		return Statistics.sum(this, type);
	}

	/**
	 * Arithmetic average.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mean(type) {
		return Statistics.mean(this, type);
	}

	/**
	 * Product of array elements.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	prod(type) {
		return Statistics.prod(this, type);
	}

	/**
	 * Geometric mean.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	geomean(type) {
		return Statistics.geomean(this, type);
	}

	/**
	 * Median.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	median(type) {
		return Statistics.median(this, type);
	}

	/**
	 * Mode.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mode(type) {
		return Statistics.mode(this, type);
	}

	/**
	 * Moment.
	 * - Moment of order n. Equivalent to the definition of variance at 2.
	 * @param {number} nth_order
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	moment(nth_order, type) {
		return Statistics.moment(this, nth_order, type);
	}

	/**
	 * Variance.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	var(type) {
		return Statistics.var(this, type);
	}

	/**
	 * Standard deviation.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	std(type) {
		return Statistics.std(this, type);
	}

	/**
	 * Mean absolute deviation.
	 * - The "algorithm" can choose "0/mean"(default) and "1/median".
	 * @param {?string|?number} [algorithm]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	mad(algorithm, type) {
		return Statistics.mad(this, algorithm, type);
	}

	/**
	 * Skewness.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	skewness(type) {
		return Statistics.skewness(this, type);
	}

	/**
	 * Covariance matrix or Covariance value.
	 * - Get a variance-covariance matrix from 1 matrix.
	 * - Get a covariance from 2 vectors.
	 * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	cov(y_or_type, type) {
		return Statistics.cov(this, y_or_type, type);
	}

	/**
	 * The samples are standardize to a mean value of 0, standard deviation of 1.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	standardization(type) {
		return Statistics.standardization(this, type);
	}

	/**
	 * Correlation matrix or Correlation coefficient.
	 * - Get a correlation matrix from 1 matrix.
	 * - Get a correlation coefficient from 2 vectors.
	 * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	corrcoef(y_or_type, type) {
		return Statistics.corrcoef(this, y_or_type, type);
	}

	/**
	 * Sort.
	 * - The "order" can choose "ascend"(default) and "descend".
	 * @param {string} [order]
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	sort(order, type) {
		return Statistics.sort(this, order, type);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// signal 信号処理用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * Discrete Fourier transform (DFT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} fft(x)
	 */
	fft(type) {
		return Signal.fft(this, type);
	}

	/**
	 * Inverse discrete Fourier transform (IDFT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} ifft(x)
	 */
	ifft(type) {
		return Signal.ifft(this, type);
	}

	/**
	 * Power spectral density.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} abs(fft(x)).^2
	 */
	powerfft(type) {
		return Signal.powerfft(this, type);
	}

	/**
	 * Discrete cosine transform (DCT-II, DCT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} dct(x)
	 */
	dct(type) {
		return Signal.dct(this, type);
	}

	/**
	 * Inverse discrete cosine transform (DCT-III, IDCT).
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix} idct(x)
	 */
	idct(type) {
		return Signal.idct(this, type);
	}

	/**
	 * Discrete two-dimensional Fourier transform (2D DFT).
	 * @returns {Matrix}
	 */
	fft2() {
		return Signal.fft2(this);
	}

	/**
	 * Inverse discrete two-dimensional Fourier transform (2D IDFT).
	 * @returns {Matrix}
	 */
	ifft2() {
		return Signal.ifft2(this);
	}

	/**
	 * Discrete two-dimensional cosine transform (2D DCT).
	 * @returns {Matrix}
	 */
	dct2() {
		return Signal.dct2(this);
	}

	/**
	 * Inverse discrete two-dimensional cosine transform (2D IDCT).
	 * @returns {Matrix}
	 */
	idct2() {
		return Signal.idct2(this);
	}

	/**
	 * Convolution integral, Polynomial multiplication.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix}
	 */
	conv(number) {
		return Signal.conv(this, number);
	}

	/**
	 * ACF(Autocorrelation function), cros-correlation function.
	 * - If the argument is omitted, it is calculated by the autocorrelation function.
	 * @param {KMatrixInputData} [number] - Matrix to calculate the correlation.
	 * @returns {Matrix}
	 */
	xcorr(number) {
		return Signal.xcorr(this, number);
	}

	/**
	 * Create window function for signal processing.
	 * The following window functions are available.
	 * - "rectangle": Rectangular window
	 * - "hann": Hann/Hanning window.
	 * - "hamming": Hamming window.
	 * - "blackman": Blackman window.
	 * - "blackmanharris": Blackman-Harris window.
	 * - "blackmannuttall": Blackman-Nuttall window.
	 * - "flattop": Flat top window.
	 * - "sin", Half cycle sine window.
	 * - "vorbis", Vorbis window.
	 * @param {string} name - Window function name.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static window(name, size, periodic) {
		return Signal.window(name, size, periodic);
	}

	/**
	 * Hann (Hanning) window.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hann(size, periodic) {
		return Signal.hann(size, periodic);
	}
	
	/**
	 * Hamming window.
	 * @param {KMatrixInputData} size - Window length
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
	 * @returns {Matrix} Column vector.
	 */
	static hamming(size, periodic) {
		return Signal.hamming(size, periodic);
	}
	
	/**
	 * FFT shift.
	 * Circular shift beginning at the center of the signal.
	 * @param {KMatrixSettings} [type]
	 * @returns {Matrix}
	 */
	fftshift(type) {
		return Signal.fftshift(this, type);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 定数
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * 1
	 * @returns {Matrix} 1
	 */
	static get ONE() {
		return new Matrix(1);
	}
	
	/**
	 * 2
	 * @returns {Matrix} 2
	 */
	static get TWO() {
		return new Matrix(2);
	}
	
	/**
	 * 10
	 * @returns {Matrix} 10
	 */
	static get TEN() {
		return new Matrix(10);
	}
	
	/**
	 * 0
	 * @returns {Matrix} 0
	 */
	static get ZERO() {
		return new Matrix(0);
	}

	/**
	 * -1
	 * @returns {Matrix} -1
	 */
	static get MINUS_ONE() {
		return new Matrix(-1);
	}

	/**
	 * i, j
	 * @returns {Matrix} i
	 */
	static get I() {
		return new Matrix(Complex.I);
	}

	/**
	 * PI.
	 * @returns {Matrix} 3.14...
	 */
	static get PI() {
		return new Matrix(Math.PI);
	}

	/**
	 * 0.25 * PI.
	 * @returns {Matrix} 0.78...
	 */
	static get QUARTER_PI() {
		return new Matrix(0.25 * Math.PI);
	}

	/**
	 * 0.5 * PI.
	 * @returns {Matrix} 1.57...
	 */
	static get HALF_PI() {
		return new Matrix(0.5 * Math.PI);
	}

	/**
	 * 2 * PI.
	 * @returns {Matrix} 6.28...
	 */
	static get TWO_PI() {
		return new Matrix(2.0 * Math.PI);
	}

	/**
	 * E, Napier's constant.
	 * @returns {Matrix} 2.71...
	 */
	static get E() {
		return new Matrix(Math.E);
	}

	/**
	 * log_e(2)
	 * @returns {Matrix} ln(2)
	 */
	static get LN2() {
		return new Matrix(Math.LN2);
	}

	/**
	 * log_e(10)
	 * @returns {Matrix} ln(10)
	 */
	static get LN10() {
		return new Matrix(Math.LN10);
	}

	/**
	 * log_2(e)
	 * @returns {Matrix} log_2(e)
	 */
	static get LOG2E() {
		return new Matrix(Math.LOG2E);
	}
	
	/**
	 * log_10(e)
	 * @returns {Matrix} log_10(e)
	 */
	static get LOG10E() {
		return new Matrix(Math.LOG10E);
	}
	
	/**
	 * sqrt(2)
	 * @returns {Matrix} sqrt(2)
	 */
	static get SQRT2() {
		return new Matrix(Math.SQRT2);
	}
	
	/**
	 * sqrt(0.5)
	 * @returns {Matrix} sqrt(0.5)
	 */
	static get SQRT1_2() {
		return new Matrix(Math.SQRT1_2);
	}
	
	/**
	 * 0.5
	 * @returns {Matrix} 0.5
	 */
	static get HALF() {
		return new Matrix(0.5);
	}

	/**
	 * Positive infinity.
	 * @returns {Matrix} Infinity
	 */
	static get POSITIVE_INFINITY() {
		return new Matrix(Number.POSITIVE_INFINITY);
	}
	
	/**
	 * Negative Infinity.
	 * @returns {Matrix} -Infinity
	 */
	static get NEGATIVE_INFINITY() {
		return new Matrix(Number.NEGATIVE_INFINITY);
	}

	/**
	 * Not a Number.
	 * @returns {Matrix} NaN
	 */
	static get NaN() {
		return new Matrix(Number.NaN);
	}

	// ----------------------
	// 互換性
	// ----------------------
	
	/**
	 * The positive or negative sign of this number.
	 * - +1 if positive, -1 if negative, 0 if 0.
	 * @returns {Matrix}
	 */
	signum() {
		return this.sign();
	}

	/**
	 * Subtract.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A - B
	 */
	subtract(number) {
		return this.sub(number);
	}

	/**
	 * Multiply.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A * B
	 */
	multiply(number) {
		return this.mul(number);
	}

	/**
	 * Divide.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} fix(A / B)
	 */
	divide(number) {
		return this.div(number);
	}

	/**
	 * Remainder of division.
	 * - Result has same sign as the Dividend.
	 * @param {KMatrixInputData} number
	 * @returns {Matrix} A % B
	 */
	remainder(number) {
		return this.rem(number);
	}
	
	/**
	 * To integer rounded down to the nearest.
	 * @returns {Matrix} fix(A), trunc(A)
	 */
	trunc() {
		return this.fix();
	}

}
