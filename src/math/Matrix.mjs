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
import LinearAlgebra from "./tools/LinearAlgebra.mjs";

// @ts-ignore
import Statistics from "./tools/Statistics.mjs";

// @ts-ignore
import Signal from "./tools/Signal.mjs";

// @ts-ignore
import Complex from "./Complex.mjs";

/**
 * Matrix 内で使用する関数群
 */
class MatrixTool {

	/**
	 * 行列の位置を指定するデータから、実際の値を作成
	 * @param data {string|number|Matrix|Complex} - 調査する値
	 * @param max {number} - ":"が指定された時に初期化する配列の長さ
	 * @param geta {number} - ":"が指定された時に初期化する値のオフセット
	 * @returns {Array<number>}
	 */
	static toPositionArrayFromObject(data, max, geta) {
		let y;
		if(typeof data === "string") {
			const array_or_string = MatrixTool.toArrayFromString(data);
			if(array_or_string === ":") {
				// : が指定された場合
				y = new Array(max);
				for(let i = 0; i < max; i++) {
					y[i] =  i + geta;
				}
			}
			else if(array_or_string instanceof Array) {
				y = array_or_string;
				for(let i = 0; i < y.length; i++) {
					y[i] = y[i].real | 0;
				}
			}
			else {
				throw "toArrayFromString[" + data + "][" + array_or_string + "]";
			}
			return y;
		}
		let t_data = data;
		if(!(t_data instanceof Matrix) && !(t_data instanceof Complex) && !((typeof t_data === "number") || (t_data instanceof Number))) {
			t_data = Matrix._toMatrix(t_data);
		}
		if(t_data instanceof Matrix) {
			if(!t_data.isVector()) {
				throw "getMatrix argument " + t_data;
			}
			const len = t_data.length;
			y = new Array(t_data.length);
			if(t_data.isRow()) {
				for(let i = 0; i < len; i++) {
					y[i] = t_data.matrix_array[0][i].real | 0;
				}
			}
			else if(t_data.isColumn()) {
				for(let i = 0; i < len; i++) {
					y[i] = t_data.matrix_array[i][0].real | 0;
				}
			}
			return y;
		}
		return [ Matrix._toInteger(t_data) ];
	}

	/**
	 * 対象ではないregexpの情報以外も抽出match
	 * @param {string} text - 検索対象
	 * @param {RegExp} regexp - 検索したい正規表現
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
	 * ブラケットに囲まれていたら、前後のブラケットを除去
	 * @param {string} text - ブラケットを除去したい文字
	 * @returns {string|null} 除去した文字列（ブラケットがない場合は、null）
	 */
	static trimBracket(text) {
		// 前後に[]があるか確認
		if( !(/^\[/).test(text) || !(/\]$/).test(text)) {
			return null;
		}
		// 前後の[]を除去
		return text.substring(1, text.length - 1);
	}

	/**
	 * JSONで定義された文字列データからMatrix型のデータを作成する
	 * @param {string} text - 調査したい文字列
	 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
	 */
	static toMatrixFromStringForArrayJSON(text) {
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
	 * 初期値と差分値と最終値から、その値が入った配列を作成する
	 * @param {Complex} from - 最初の値
	 * @param {Complex} delta - 差分
	 * @param {Complex} to - 繰り返す先の値（この値は含めない）
	 * @returns {Array<Complex>}
	 */
	static InterpolationCalculation(from, delta, to) {
		const FromIsGreaterThanTo = from.compareTo(to);
		if(FromIsGreaterThanTo === 0) {
			return from;
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
			if(to.compareTo(num) === FromIsGreaterThanTo) {
				break;
			}
			rows_array[i] = num;
		}
		return rows_array;
	}

	/**
	 * 文字列からMatrix型の行列データの行部分に変換
	 * @param {string} row_text - 行列の1行を表す文字列
	 * @returns {Array<Complex>|string}
	 */
	static toArrayFromString(row_text) {
		// 「:」のみ記載されていないかの確認
		if(row_text.trim() === ":") {
			return ":";
		}
		// 左が実数（強制）で右が複素数（任意）タイプ
		const reg1 = /[+-]? *[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?( *[+-] *[- ]?([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)?[ij])?/;
		// 左が複素数（強制）で右が実数（任意）タイプ
		const reg2 = /[+-]? *([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)?[ij]( *[+] *[- ]?([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)?)?/;
		// reg2優先で検索
		const reg3 = new RegExp("(" + reg2.source + ")|(" + reg1.source + ")", "i");
		// 問題として 1 - -jが通る
		const xs = MatrixTool.match2(row_text, reg3);
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
				const ip_array = MatrixTool.InterpolationCalculation(from, delta, to);
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
	 * JSON以外の文字列で定義された文字列データからMatrix型のデータを作成する
	 * @param {string} text - 調査したい文字列
	 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
	 */
	static toMatrixFromStringForArrayETC(text) {
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
	 * 行列用の文字列データから構成されるMatrix型のデータを作成する
	 * @param {string} text - 調査したい文字列
	 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
	 */
	static toMatrixFromStringForArray(text) {
		// JSON形式
		if(/[[\],]/.test(text)) {
			return MatrixTool.toMatrixFromStringForArrayJSON(text);
		}
		// それ以外(MATLAB, Octave, Scilab)
		else {
			return MatrixTool.toMatrixFromStringForArrayETC(text);
		}
	}

	/**
	 * 文字列データからMatrix型のデータを作成する
	 * @param {string} text - 調査したい文字列
	 * @returns {Array<Array<Complex>>} Matrix型で使用される内部の配列
	 */
	static toMatrixFromString(text) {
		// 前後のスペースを除去
		const trimtext = text.replace(/^\s*|\s*$/g, "");
		// ブランケットを外す
		const withoutBracket = MatrixTool.trimBracket(trimtext);
		if(withoutBracket) {
			// 配列用の初期化
			return MatrixTool.toMatrixFromStringForArray(withoutBracket);
		}
		else {
			// スカラー用の初期化
			return [[new Complex(text)]];
		}
	}

	/**
	 * Matrix型内部データが行列データとして正しいかを調べる
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
 * 複素行列クラス (immutable)
 */
export default class Matrix {
	
	/**
	 * 複素行列を作成
	 * 引数は次のタイプをとれます
	 * ・4 				整数や実数
	 * ・"1 + j"		文字列で複素数をわたす
	 * ・[1,2]			1次元配列
	 * ・[[1,2],[3,4]]	行列
	 * ・["1+j", "2+j"]	複素数を含んだ行列
	 * ・"[1 1:0.5:3]"		MATLAB/Octave/Scilab互換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 行列データ( "1 + j", [1 , 1] など)
	 */
	constructor(number) {
		let matrix_array = null;
		let is_check_string = false;
		if(arguments.length === 1) {
			const y = number;
			// 行列型なら中身をディープコピーする
			if(y instanceof Matrix) {
				matrix_array = new Array(y.row_length);
				for(let i = 0; i < y.row_length; i++) {
					matrix_array[i] = new Array(y.column_length);
					for(let j = 0; j < y.column_length; j++) {
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
				for(let row_count = 0; row_count < y.length; row_count++) {
					// 毎行ごと調査
					const row = y[row_count];
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
				matrix_array = MatrixTool.toMatrixFromString(y);
			}
			// 文字列変換できる場合は返還後に、文字列解析を行う
			else if(y instanceof Object) {
				is_check_string = true;
				matrix_array = MatrixTool.toMatrixFromString(y.toString());
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
			for(let row = 0; row < matrix_array.length; row++) {
				if(matrix_array[row] === ":") {
					matrix_array.splice(row--, 1);
				}
			}
		}
		if(!MatrixTool.isCorrectMatrixArray(matrix_array)) {
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
	}

	/**
	 * Matrix を作成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
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
	 * 指定した数値から Matrix 型に変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
	 * @returns {Matrix}
	 */
	static valueOf(number) {
		return Matrix.valueOf(number);
	}

	/**
	 * 行列を作成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {Matrix}
	 * @private
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
	 * 複素数を作成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {Complex}
	 * @private
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
	 * 実数を作成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toDouble(number) {
		if(typeof number === "number") {
			return number;
		}
		const x = Matrix._toComplex(number);
		if(x.isReal()) {
			return (new Complex(number)).real;
		}
		else {
			throw "not support complex numbers.";
		}
	}

	/**
	 * 整数を作成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {number}
	 * @private
	 */
	static _toInteger(number) {
		return Matrix._toDouble(number) | 0;
	}

	/**
	 * キャッシュを削除
	 */
	_clearCash() {
		if(this.string_cash) {
			delete this.string_cash;
		}
	}

	/**
	 * ディープコピー
	 * @returns {Matrix}
	 */
	clone() {
		return new Matrix(this.matrix_array);
	}

	/**
	 * 文字列化
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
			function(num) {
				if(!num.isReal()) {
					isDrawImag = true;
				}
				if(Math.abs(num.real) >= exp_turn_num) {
					isDrawExp = true;
				}
				if(Math.abs(num.imag) >= exp_turn_num) {
					isDrawExp = true;
				}
				draw_decimal_position = Math.max(draw_decimal_position, num.getDecimalPosition());
			}
		);

		if(draw_decimal_position > 0) {
			draw_decimal_position = exp_point;
		}

		// 文字列データを作成とともに、最大の長さを記録する
		let str_max = 0;
		const draw_buff = [];
		// 数値データを文字列にする関数（eの桁がある場合は中身は3桁にする）
		const toStrFromFloat = function(number) {
			if(!isDrawExp) {
				return number.toFixed(draw_decimal_position);
			}
			const str = number.toExponential(exp_point);
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
		const right = function(text, length) {
			const space = "                                        ";
			return space.substr(0, length - text.length) + text;
		};
		// 出力用文字列を作成する
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
	 * 等式
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean} A === B
	 */
	equals(number, epsilon) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			return false;
		}
		if((M1.row_length === 1) || (M1.column_length ===1)) {
			return M1.scalar.equals(M2.scalar);
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = 0; col < this.column_length; col++) {
				if(!x1[row][col].equals(x2[row][col], epsilon)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * 行列を構成する複素数の実部の配列
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
	 * 行列を構成する複素数のComplex型の配列
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
	 * 本オブジェクト内の全要素に同一処理を実行
	 * ミュータブル
	 * @param {function(num:Complex, row:number, col:number): ?Object } eachfunc - Function(num, row, col)
	 * @returns {Matrix} 処理実行後の行列
	 * @private
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
	 * 本オブジェクト内の全要素に同一処理を実行
	 * @param {function(num:Complex, row:number, col:number): ?Object } eachfunc - Function(num, row, col)
	 * @returns {Matrix} 処理実行後の行列
	 */
	cloneMatrixDoEachCalculation(eachfunc) {
		return this.clone()._each(eachfunc);
	}

	/**
	 * 行列内の各値に対して指定した初期化を行ったMatrixを作成
	 * @param {function(num:Complex, row:number, col:number): ?Object } eachfunc - Function(num, row, col)
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length=dimension] - 列数
	 * @returns {Matrix} 処理実行後の行列
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
	 * 行列の列をベクトルとみなし同一処理を実行、行ベクトルであれば行ベクトルに対し同一処理を実行
	 * @param {function(array:Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} 処理実行後の行列
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
			const y = new Matrix(0);
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
	 * 行列の行と列をベクトルとみなし同一処理を実行
	 * 先に行に対して同一処理を実行後の行列に対し、列ごとにさらに同一処理を実行する
	 * @param {function(array:Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} 処理実行後の行列
	 */
	eachVectorBoth(array_function) {
		const y = new Matrix(0);
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.row_length);
			for(let col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			const row_output = array_function(row_array);
			y._resize(y.row_length, Math.max(y.column_length, row_output.length));
			for(let col = 0; col < row_output.length; col++) {
				y.matrix_array[row][col] = row_output[col];
			}
		}
		// 列ごとに処理を行う
		for(let col = 0; col < y.column_length; col++) {
			const col_array = new Array(y.row_length);
			for(let row = 0; row < y.row_length; row++) {
				col_array[row] = y.matrix_array[row][col];
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
	 * 行列の行をベクトルとみなし同一処理を実行
	 * @param {function(array:Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} 処理実行後の行列
	 */
	eachVectorRow(array_function) {
		const y = new Matrix(0);
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(let row = 0; row < this.row_length; row++) {
			const row_array = new Array(this.row_length);
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
	 * 行列の列をベクトルとみなし同一処理を実行
	 * @param {function(array:Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @returns {Matrix} 処理実行後の行列
	 */
	eachVectorColumn(array_function) {
		const y = new Matrix(0);
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
	 * 引数に設定された行／列をベクトルとみなし同一処理を実行
	 * @param {function(array:Array<Complex>): Array<Complex>} array_function - Function(array)
	 * @param {string|number} [dimtype="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
	 * @returns {Matrix} 処理実行後の行列
	 */
	eachVector(array_function, dimtype) {
		let target = dimtype !== undefined ? dimtype : "auto";
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
	}

	/**
	 * 行列内の指定した箇所の行列
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 抽出する行番号が入ったベクトル,":"で全ての行抽出
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 抽出する列番号が入ったベクトル,":"で全ての列抽出
	 * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
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
	 * 行列内の指定した箇所の値を変更する
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 変更する行番号が入ったベクトル,":"で全ての行抽出
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 変更する列番号が入ったベクトル,":"で全ての列抽出
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} replace - 変更内容の行列
	 * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
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
	 * 行列内の指定した箇所の値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_or_pos - 行列なら行番号, ベクトルの場合は値の位置番号
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [col] - 列番号（行列の場合は指定する）
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
	// 行列の基本操作、基本情報の取得
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * 行列の最初の要素の整数値
	 * @returns {number}
	 */
	get intValue() {
		return (this.matrix_array[0][0].real) | 0;
	}

	/**
	 * 行列の最初の要素の実数値
	 * @returns {number}
	 */
	get doubleValue() {
		return this.matrix_array[0][0].real;
	}

	/**
	 * 行列の最初の要素
	 * @returns {Complex}
	 */
	get scalar() {
		return this.matrix_array[0][0];
	}

	/**
	 * 行数及び列数の最大値
	 * @returns {number}
	 */
	get length() {
		return this.row_length > this.column_length ? this.row_length : this.column_length;
	}

	/**
	 * 1ノルム
	 * @returns {number}
	 */
	get norm1() {
		return LinearAlgebra.norm(this, 1);
	}
	
	/**
	 * 2ノルム
	 * @returns {number}
	 */
	get norm2() {
		return LinearAlgebra.norm(this, 2);
	}

	/**
	 * pノルム
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
	 * @returns {number}
	 */
	norm(p) {
		return LinearAlgebra.norm(this, p);
	}

	/**
	 * 条件数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
	 * @returns {number}
	 */
	cond(p) {
		return LinearAlgebra.cond(this, p);
	}

	/**
	 * 1ノルムの条件数の逆数
	 * @returns {number}
	 */
	rcond() {
		return LinearAlgebra.rcond(this);
	}

	/**
	 * ランク
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {number} rank(A)
	 */
	rank(epsilon) {
		return LinearAlgebra.rank(this, epsilon);
	}

	/**
	 * トレース
	 * @returns {Complex} trace(A)
	 */
	trace() {
		return LinearAlgebra.trace(this);
	}

	/**
	 * 行列式
	 * @returns {Matrix} |A|
	 */
	det() {
		return LinearAlgebra.det(this);
	}

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
	static memset(number, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		if((number instanceof Matrix) && (!number.isScalar())) {
			const x = number.matrix_array;
			const x_row_length = number.row_length;
			const x_column_length = number.column_length;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				return x[row % x_row_length][col % x_column_length];
			}, dimension, column_length);
		}
		else {
			const x = Matrix._toComplex(number);
			return Matrix.createMatrixDoEachCalculation(function() {
				return x;
			}, dimension, column_length);
		}
	}

	/**
	 * 単位行列を生成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
	 * @returns {Matrix}
	 */
	static eye(dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return row === col ? Complex.ONE : Complex.ZERO;
		}, dimension, column_length);
	}
	
	/**
	 * 零行列を生成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
	 * @returns {Matrix}
	 */
	static zeros(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ZERO, dimension, column_length);
	}

	/**
	 * 1で構成した行列を生成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
	 * @returns {Matrix}
	 */
	static ones(dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ONE, dimension, column_length);
	}

	/**
	 * 乱数で構成した行列を生成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
	 * @returns {Matrix}
	 */
	static rand(dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.rand();
		}, dimension, column_length);
	}

	/**
	 * 正規分布に従う乱数で構成した行列を生成
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
	 * @returns {Matrix}
	 */
	static randn(dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.randn();
		}, dimension, column_length);
	}

	/**
	 * 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
	 * @returns {Matrix} 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
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

	// TODO 行列の結合がほしい

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 比較や判定
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * スカラー値の判定
	 * @returns {boolean}
	 */
	isScalar() {
		return this.row_length === 1 && this.column_length == 1;
	}
	
	/**
	 * 行ベクトル／横ベクトルの判定
	 * @returns {boolean}
	 */
	isRow() {
		return this.row_length === 1;
	}
	
	/**
	 * 列ベクトル／縦ベクトルの判定
	 * @returns {boolean}
	 */
	isColumn() {
		return this.column_length === 1;
	}

	/**
	 * ベクトルの判定
	 * @returns {boolean}
	 */
	isVector() {
		return this.row_length === 1 || this.column_length === 1;
	}

	/**
	 * 行列の判定
	 * @returns {boolean}
	 */
	isMatrix() {
		return this.row_length !== 1 && this.column_length !== 1;
	}

	/**
	 * 正方行列の判定
	 * @returns {boolean}
	 */
	isSquare() {
		return this.row_length === this.column_length;
	}

	/**
	 * 実行列の判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isReal(epsilon) {
		let is_real = true;
		this._each(function(num){
			if(is_real && (num.isComplex(epsilon))) {
				is_real = false;
			}
		});
		return is_real;
	}

	/**
	 * 複素行列の判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isComplex(epsilon) {
		let is_complex = true;
		this._each(function(num){
			if(is_complex && (num.isReal(epsilon))) {
				is_complex = false;
			}
		});
		return is_complex;
	}

	/**
	 * 零行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isZeros(epsilon) {
		let is_zeros = true;
		const tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num){
			if(is_zeros && (!num.isZero(tolerance))) {
				is_zeros = false;
			}
		});
		return is_zeros;
	}

	/**
	 * 単位行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isIdentity(epsilon) {
		if(!this.isDiagonal()) {
			return false;
		}
		const tolerance = epsilon ? epsilon : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			if(!this.matrix_array[row][row].isOne(tolerance)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 対角行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isDiagonal(epsilon) {
		let is_diagonal = true;
		const tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_diagonal && (row !== col) && (!num.isZero(tolerance))) {
				is_diagonal = false;
			}
		});
		return is_diagonal;
	}
	
	/**
	 * 三重対角行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isTridiagonal(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		let is_tridiagonal = true;
		const tolerance = epsilon ? epsilon : 1.0e-10;
		this._each(function(num, row, col){
			if(is_tridiagonal && (Math.abs(row - col) > 1) && (!num.isZero(tolerance))) {
				is_tridiagonal = false;
			}
		});
		return is_tridiagonal;
	}

	/**
	 * 正則行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isRegular(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		// ランクが行列の次元と等しいかどうかで判定
		// det(M) != 0 でもよいが、時間がかかる可能性があるので
		// 誤差は自動で計算など本当はもうすこし良い方法を考える必要がある
		const tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.rank(tolerance) === this.row_length);
	}

	/**
	 * 直行行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isOrthogonal(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.mul(this.transpose()).isIdentity(tolerance));
	}

	/**
	 * ユニタリ行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isUnitary(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance = epsilon ? epsilon : 1.0e-10;
		return (this.mul(this.ctranspose()).isIdentity(tolerance));
	}

	/**
	 * 対称行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isSymmetric(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance = epsilon ? epsilon : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row + 1; col < this.column_length; col++) {
				if(!this.matrix_array[row][col].equals(this.matrix_array[col][row], tolerance)) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * エルミート行列を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {boolean}
	 */
	isHermitian(epsilon) {
		if(!this.isSquare()) {
			return false;
		}
		const tolerance = epsilon ? epsilon : 1.0e-10;
		for(let row = 0; row < this.row_length; row++) {
			for(let col = row; col < this.column_length; col++) {
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
	}

	/**
	 * 行列の行数と列数
	 * @returns {Matrix} [row_length column_length]
	 */
	size() {
		// 行列のサイズを取得
		return new Matrix([[this.row_length, this.column_length]]);
	}

	/**
	 * 値同士を比較
	 * スカラー同士の場合の戻り値は、number型。
	 * 行列同士の場合は、各項の比較結果が入った、Matrix型。
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {number|Matrix} A > B ? 1 : (A === B ? 0 : -1)
	 */
	compareTo(number, epsilon) {
		const M1 = this;
		const M2 = Matrix._toMatrix(number);
		// ※スカラー同士の場合は、実数を返す
		if(M1.isScalar() && M2.isScalar()) {
			return M1.scalar.compareTo(M2.scalar, epsilon);
		}
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const y_row_length = Math.max(M1.row_length, M2.row_length);
		const y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].compareTo(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * 最大値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} max([A, B])
	 */
	max(epsilon) {
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i], epsilon) < 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return this.eachVectorAuto(main);
	}
	
	/**
	 * 最小値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} min([A, B])
	 */
	min(epsilon) {
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i], epsilon) > 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return this.eachVectorAuto(main);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 四則演算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	
	/**
	 * 加算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
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
	 * 減算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
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
	 * 乗算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
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
	 * 割り算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
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
			const epsilon = 1.0e-10;
			const det = M2.det().scalar.norm;
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
	}

	/**
	 * 行列の各項ごとの掛け算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {Matrix} A .* B
	 */
	nmul(number) {
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
			return x1[row % M1.row_length][col % M1.column_length].mul(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * 行列の各項ごとの割り算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {Matrix} A ./ B
	 */
	ndiv(number) {
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
			return x1[row % M1.row_length][col % M1.column_length].div(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	/**
	 * 行列の各項ごとの逆数
	 * @returns {Matrix} 1 ./ A
	 */
	ninv() {
		const M1 = this;
		const x1 = M1.matrix_array;
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row][col].inv();
		}, M1.row_length, M1.column_length);
	}

	/**
	 * 行列の各項ごとの累乗
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @returns {Matrix} A .^ B
	 */
	npow(number) {
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
			return x1[row % M1.row_length][col % M1.column_length].pow(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// Complexのメソッドにある機能
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * 各項の実部
	 * @returns {Matrix} real(A)
	 */
	real() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.real);
		});
	}
	
	/**
	 * 各項の虚部
	 * @returns {Matrix} imag(A)
	 */
	imag() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.imag);
		});
	}

	/**
	 * 各項の偏角
	 * @returns {Matrix} arg(A)
	 */
	arg() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.arg);
		});
	}

	/**
	 * 各項の符号値
	 * @returns {Matrix} [-1,1] 複素数の場合はノルムを1にした値。
	 */
	sign() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.sign());
		});
	}

	/**
	 * 各項の整数を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testInteger(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInteger(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の複素整数を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testComplexInteger(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplexInteger(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の 0 を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testZero(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isZero(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の 1 を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testOne(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isOne(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * 各項の複素数を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testComplex(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplex(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の実数を判定
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testReal(epsilon) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isReal(epsilon) ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の非数を判定
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testNaN() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNaN() ? Complex.ONE : Complex.ZERO;
		});
	}


	/**
	 * real(x) > 0
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testPositive() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositive() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(x) < 0
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * real(x) >= 0
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testNotNegative() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNotNegative() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 各項の無限を判定
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testInfinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInfinite() ? Complex.ONE : Complex.ZERO;
		});
	}
	
	/**
	 * 各項の有限数を判定
	 * @returns {Matrix} 1 or 0 で構成された行列
	 */
	testFinite() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isFinite() ? Complex.ONE : Complex.ZERO;
		});
	}

	/**
	 * 絶対値
	 * @returns {Matrix} abs(A)
	 */
	abs() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.abs();
		});
	}

	/**
	 * 複素共役行列
	 * @returns {Matrix} real(A) - imag(A)j
	 */
	conj() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.conj();
		});
	}

	/**
	 * 負数
	 * @returns {Matrix} -A
	 */
	negate() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.negate();
		});
	}

	/**
	 * 平方根
	 * @returns {Matrix} sqrt(A)
	 */
	sqrt() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sqrt();
		});
	}

	/**
	 * 累乗
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - スカラー
	 * @returns {Matrix} pow(A, B)
	 * @todo 実際は行列そのものの累乗に切り替える予定。各要素の累乗は、npowを使用すること。
	 */
	pow(number) {
		const X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.pow(X);
		});
	}

	/**
	 * 対数
	 * @returns {Matrix} log(A)
	 */
	log() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log();
		});
	}

	/**
	 * 指数
	 * @returns {Matrix} exp(A)
	 */
	exp() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.exp();
		});
	}

	/**
	 * sin
	 * @returns {Matrix} sin(A)
	 */
	sin() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sin();
		});
	}

	/**
	 * cos
	 * @returns {Matrix} cos(A)
	 */
	cos() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cos();
		});
	}

	/**
	 * tan
	 * @returns {Matrix} tan(A)
	 */
	tan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tan();
		});
	}
	
	/**
	 * atan
	 * @returns {Matrix} atan(A)
	 */
	atan() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan();
		});
	}

	/**
	 * atan2
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - スカラー
	 * @returns {Matrix} atan2(Y, X)
	 */
	atan2(number) {
		const X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan2(X);
		});
	}

	/**
	 * floor
	 * @returns {Matrix} floor(A)
	 */
	floor() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.floor();
		});
	}

	/**
	 * ceil
	 * @returns {Matrix} ceil(A)
	 */
	ceil() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.ceil();
		});
	}

	/**
	 * 四捨五入
	 * @returns {Matrix} round(A)
	 */
	round() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.round();
		});
	}

	/**
	 * 整数化
	 * @returns {Matrix} fix(A)
	 */
	fix() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fix();
		});
	}

	/**
	 * 小数部の抽出
	 * @returns {Matrix} fract(A)
	 */
	fract() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fract();
		});
	}

	/**
	 * sinc
	 * @returns {Matrix} sinc(A)
	 */
	sinc() {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinc();
		});
	}

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
	 * 行列を時計回りに回転
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - 回転する回数
	 * @returns {Matrix} 処理実行後の行列
	 */
	rot90(rot_90_count) {
		return this.clone()._rot90(rot_90_count);
	}

	/**
	 * 行列を拡張、拡張した項は、0で初期化。
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_row_length - 新しい行の長さ
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_column_length - 新しい列の長さ
	 * @returns {Matrix} 処理実行後の行列
	 * @private
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
	 * 行列を拡張、拡張した項は、0で初期化
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - 新しい行の長さ
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - 新しい列の長さ
	 * @returns {Matrix} 処理実行後の行列
	 */
	resize(row_length, column_length) {
		return this.clone().resize(row_length, column_length);
	}

	/**
	 * 行列内の行を消去
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - 行番号
	 * @returns {Matrix} 処理実行後の行列
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
	 * 行列内の列を消去
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - 列番号
	 * @returns {Matrix} 処理実行後の行列
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
	 * 行列内の行を消去
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - 行番号
	 * @returns {Matrix} 処理実行後の行列
	 */
	deleteRow(delete_row_index) {
		return this.clone()._deleteRow(delete_row_index);
	}

	/**
	 * 行列内の列を消去
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - 列番号
	 * @returns {Matrix} 処理実行後の行列
	 */
	deleteColumn(delete_column_index) {
		return this.clone()._deleteColumn(delete_column_index);
	}

	/**
	 * 行列内の行を交換
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - 行番号1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - 行番号2
	 * @returns {Matrix} 処理実行後の行列
	 * @private
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
	 * 行列内の列を交換
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - 行番号1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - 行番号2
	 * @returns {Matrix} 処理実行後の行列
	 * @private
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
	 * 行列内の行を交換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - 行番号1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - 行番号2
	 * @returns {Matrix} 処理実行後の行列
	 */
	exchangeRow(exchange_row_index1, exchange_row_index2) {
		return this.clone()._exchangeRow(exchange_row_index1, exchange_row_index2);
	}

	/**
	 * 行列内の列を交換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - 行番号1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - 行番号2
	 * @returns {Matrix} 処理実行後の行列
	 */
	exchangeColumn(exchange_column_index1, exchange_column_index2) {
		return this.clone()._exchangeColumn(exchange_column_index1, exchange_column_index2);
	}

	/**
	 * 行列の右に行列を結合
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - 結合したい行列
	 * @returns {Matrix} 処理実行後の行列
	 * @private
	 */
	_concatLeft(left_matrix) {
		const M = Matrix._toMatrix(left_matrix);
		if(this.row_length != M.row_length) {
			throw "_concatLeft";
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
	 * 行列の下に行列を結合
	 * ミュータブル
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - 結合したい行列
	 * @returns {Matrix} 処理実行後の行列
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
	 * 行列の右に行列を結合
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - 結合したい行列
	 * @returns {Matrix} 処理実行後の行列
	 */
	concatLeft(left_matrix) {
		return this.clone()._concatLeft(left_matrix);
	}

	/**
	 * 行列の下に行列を結合
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - 結合したい行列
	 * @returns {Matrix} 処理実行後の行列
	 */
	concatBottom(bottom_matrix) {
		return this.clone()._concatBottom(bottom_matrix);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の一般計算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * 転置行列
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
	 * エルミート転置行列
	 * @returns {Matrix} A^T
	 */
	ctranspose() {
		return this.transpose().conj();
	}

	/**
	 * エルミート転置行列
	 * @returns {Matrix} A^T
	 */
	T() {
		return this.ctranspose();
	}

	/**
	 * ドット積
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] 計算するときに使用する次元（1 or 2）
	 * @returns {Matrix} A・B
	 */
	inner(number, dimension=1) {
		return LinearAlgebra.inner(this, number, dimension);
	}
	
	/**
	 * LUP分解
	 * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
	 */
	lup() {
		return LinearAlgebra.lup(this);
	}

	/**
	 * LU分解
	 * @returns {{L: Matrix, U: Matrix}} L*U=A
	 */
	lu() {
		return LinearAlgebra.lu(this);
	}

	/**
	 * 一次方程式を解く
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
	 * @returns {Matrix} Ax=B となる x
	 */
	linsolve(number) {
		return LinearAlgebra.linsolve(this, number);
	}

	/**
	 * QR分解
	 * @returns {{Q: Matrix, R: Matrix}} Q*R=A, Qは正規直行行列、Rは上三角行列
	 */
	qr() {
		return LinearAlgebra.qr(this);
	}

	/**
	 * 対称行列の三重対角化
	 * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
	 */
	tridiagonalize() {
		return LinearAlgebra.tridiagonalize(this);
	}

	/**
	 * 対称行列の固有値分解
	 * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
	 */
	eig() {
		return LinearAlgebra.eig(this);
	}

	/**
	 * 特異値分解
	 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
	 */
	svd() {
		return LinearAlgebra.svd(this);
	}

	/**
	 * 逆行列
	 * @returns {Matrix} A^-1
	 */
	inv() {
		return LinearAlgebra.inv(this);
	}

	/**
	 * 疑似逆行列
	 * @returns {Matrix} A^+
	 */
	pinv() {
		return LinearAlgebra.pinv(this);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// statistics 統計計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * 対数ガンマ関数
	 * @returns {Matrix}
	 */
	gammaln() {
		return Statistics.gammaln(this);
	}

	/**
	 * ガンマ関数
	 * @returns {Matrix}
	 */
	gamma() {
		return Statistics.gamma(this);
	}

	/**
	 * 不完全ガンマ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	gammainc(a, tail) {
		return Statistics.gammainc(this, a, tail);
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	gampdf(k, s) {
		return Statistics.gampdf(this, k, s);
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	gamcdf(k, s) {
		return Statistics.gampdf(this, k, s);
	}

	/**
	 * ガンマ分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	gaminv(k, s) {
		return Statistics.gaminv(this, k, s);
	}

	/**
	 * ベータ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
	 * @returns {Matrix}
	 */
	beta(y) {
		return Statistics.beta(this, y);
	}
	
	/**
	 * 不完全ベータ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	betainc(a, b, tail) {
		return Statistics.betainc(this, a, b, tail);
	}

	/**
	 * ベータ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	betacdf(a, b) {
		return Statistics.betacdf(this, a, b);
	}

	/**
	 * ベータ分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	betapdf(a, b) {
		return Statistics.betapdf(this, a, b);
	}

	/**
	 * ベータ分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	betainv(a, b) {
		return Statistics.betainv(this, a, b);
	}

	/**
	 * x! 階乗関数
	 * @returns {Matrix}
	 */
	factorial() {
		return Statistics.factorial(this);
	}
	
	/**
	 * nCk 二項係数またはすべての組合わせ
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
	 * @returns {Matrix}
	 */
	nchoosek(k) {
		return Statistics.nchoosek(this, k);
	}
	
	/**
	 * 誤差関数
	 * @returns {Matrix}
	 */
	erf() {
		return Statistics.erf(this);
	}

	/**
	 * 相補誤差関数
	 * @returns {Matrix}
	 */
	erfc() {
		return Statistics.erfc(this);
	}
	
	/**
	 * 正規分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	normpdf(u=0.0, s=1.0) {
		return Statistics.normpdf(this, u, s);
	}

	/**
	 * 正規分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	normcdf(u=0.0, s=1.0) {
		return Statistics.normcdf(this, u, s);
	}

	/**
	 * 正規分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	norminv(u=0.0, s=1.0) {
		return Statistics.norminv(this, u, s);
	}

	/**
	 * t分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	tpdf(v) {
		return Statistics.tpdf(this, v);
	}

	/**
	 * t分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	tcdf(v) {
		return Statistics.tcdf(this, v);
	}

	/**
	 * t分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	tinv(v) {
		return Statistics.tinv(this, v);
	}

	/**
	 * 尾部が指定可能なt分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
	 * @returns {Matrix}
	 */
	tdist(v, tails) {
		return Statistics.tdist(this, v, tails);
	}

	/**
	 * 両側検定時のt分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	tinv2(v) {
		return Statistics.tinv2(this, v);
	}

	/**
	 * カイ二乗分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	chi2pdf(k) {
		return Statistics.chi2pdf(this, k);
	}

	/**
	 * カイ二乗分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	chi2cdf(k) {
		return Statistics.chi2cdf(this, k);
	}
	
	/**
	 * カイ二乗分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	chi2inv(k) {
		return Statistics.chi2inv(this, k);
	}

	/**
	 * F分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	fpdf(d1, d2) {
		return Statistics.fpdf(this, d1, d2);
	}

	/**
	 * F分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	fcdf(d1, d2) {
		return Statistics.fcdf(this, d1, d2);
	}

	/**
	 * F分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	finv(d1, d2) {
		return Statistics.finv(this, d1, d2);
	}
	
	/**
	 * 合計
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	sum(type) {
		return Statistics.sum(this, type);
	}

	/**
	 * 相加平均
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	mean(type) {
		return Statistics.mean(this, type);
	}

	/**
	 * 配列の積
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	prod(type) {
		return Statistics.prod(this, type);
	}

	/**
	 * 相乗平均／幾何平均
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	geomean(type) {
		return Statistics.geomean(this, type);
	}

	/**
	 * 中央値
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	median(type) {
		return Statistics.median(this, type);
	}

	/**
	 * 最頻値
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	mode(type) {
		return Statistics.mode(this, type);
	}

	/**
	 * 中心積率
	 * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
	 * @returns {Matrix}
	 */
	moment(type) {
		return Statistics.moment(this, type);
	}

	/**
	 * 分散
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	var(type) {
		return Statistics.var(this, type);
	}

	/**
	 * 標準偏差
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	std(type) {
		return Statistics.std(this, type);
	}

	/**
	 * 標準偏差
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	mad(type) {
		return Statistics.mad(this, type);
	}

	/**
	 * 歪度
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	skewness(type) {
		return Statistics.skewness(this, type);
	}

	/**
	 * 共分散行列
	 * @param {{correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	cov(type) {
		return Statistics.cov(this, type);
	}

	/**
	 * 標本の標準化
	 * 平均値0、標準偏差1に変更する
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	normalize(type) {
		return Statistics.normalize(this, type);
	}

	/**
	 * 相関行列
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	corrcoef(type) {
		return Statistics.corrcoef(this, type);
	}

	/**
	 * ソート
	 * @param {{dimension : (?string|?number), order : ?string}} [type]
	 * @returns {Matrix}
	 */
	sort(type) {
		return Statistics.sort(this, type);
	}

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// signal 信号処理用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
	 * 離散フーリエ変換
	 * @returns {Matrix}
	 */
	fft() {
		return Signal.fft(this);
	}

	/**
	 * 逆離散フーリエ変換
	 * @returns {Matrix}
	 */
	ifft() {
		return Signal.ifft(this);
	}

	/**
	 * パワースペクトル密度
	 * @returns {Matrix}
	 */
	powerfft() {
		return Signal.powerfft(this);
	}

	/**
	 * 離散コサイン変換
	 * @returns {Matrix}
	 */
	dct() {
		return Signal.dct(this);
	}

	/**
	 * 逆離散コサイン変換
	 * @returns {Matrix}
	 */
	idct() {
		return Signal.idct(this);
	}

	/**
	 * 2次元の離散フーリエ変換
	 * @returns {Matrix}
	 */
	fft2() {
		return Signal.fft2(this);
	}

	/**
	 * 2次元の逆離散フーリエ変換
	 * @returns {Matrix}
	 */
	ifft2() {
		return Signal.ifft2(this);
	}

	/**
	 * 2次元の離散コサイン変換
	 * @returns {Matrix}
	 */
	dct2() {
		return Signal.dct2(this);
	}

	/**
	 * 2次元の逆離散コサイン変換
	 * @returns {Matrix}
	 */
	idct2() {
		return Signal.idct2(this);
	}

	/**
	 * 畳み込み積分、多項式乗算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
	 * @returns {Matrix}
	 */
	conv(number) {
		return Signal.conv(this, number);
	}

	/**
	 * 自己相関関数、相互相関関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [number] - 省略した場合は自己相関関数
	 * @returns {Matrix}
	 */
	xcorr(number) {
		return Signal.xcorr(this, number);
	}

	/**
	 * 窓関数
	 * @param {string} name - 窓関数の名前
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {boolean} [isPeriodic] - true なら periodic, false なら symmetric
	 * @returns {Matrix} 列ベクトル
	 */
	static window(name, size, isPeriodic) {
		return Signal.window(name, size, isPeriodic);
	}

	/**
	 * ハニング窓
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {boolean} [isPeriodic] - true なら periodic, false なら symmetric
	 * @returns {Matrix} 列ベクトル
	 */
	static hann(size, isPeriodic) {
		return Signal.hann(size, isPeriodic);
	}
	
	/**
	 * ハミング窓
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {boolean} [isPeriodic] - true なら periodic, false なら symmetric
	 * @returns {Matrix} 列ベクトル
	 */
	static hamming(size, isPeriodic) {
		return Signal.hamming(size, isPeriodic);
	}
	
}

