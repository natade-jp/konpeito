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
import Random from "./Random.mjs";

// @ts-ignore
import Complex from "../Complex.mjs";

// @ts-ignore
import Matrix from "../Matrix.mjs";

/**
 * 線形代数用の関数集
 * @ignore
 */
class LinearAlgebraTool {

	/**
	 * 対称行列の三重対角化
	 * 実数での計算のみ対応
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @returns {{P: Matrix, H: Matrix}}
	 */
	static tridiagonalize(mat) {

		const A = Matrix._toMatrix(mat);
		const a = A.getNumberMatrixArray();
		const tolerance = 1.0e-10;

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
		const innerproduct = function(x1, x2, index_offset, index_max) {
			let y = 0;
			const ioffset = index_offset ? index_offset : 0;
			const imax = index_max ? index_max : x1.length;
			for(let i = ioffset; i < imax; i++) {
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
		const house = function(x, index_offset, index_max) {
			const ioffset = index_offset ? index_offset : 0;
			const imax = index_max ? index_max : x.length;
			// xの内積の平方根（ノルム）を計算
			let y1 = Math.sqrt(innerproduct(x, x, ioffset, imax));
			const v = [];
			if(Math.abs(y1) >= tolerance) {
				if(x[ioffset] < 0) {
					y1 = - y1;
				}
				let t;
				for(let i = ioffset, j = 0; i < imax; i++, j++) {
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
				y1: - y1,	// 鏡像の1番目の要素(y2,y3,...は0)
				v : v		// 直行する単位ベクトル vT*v = 2
			};
		};

		const n = a.length;
		const d = []; // 対角成分
		const e = []; // 隣の成分
		{
			for(let k = 0; k < n - 2; k++) {
				const v = a[k];
				d[k] = v[k];
				{
					const H = house(v, k + 1, n);
					e[k] = H.y1;
					for(let i = 0; i < H.v.length; i++) {
						v[k + 1 + i] = H.v[i];
					}
				}
				if(Math.abs(e[k]) < tolerance) {
					continue;
				}
				for(let i = k + 1; i < n; i++) {
					let s = 0;
					for(let j = k + 1; j < i; j++) {
						s += a[j][i] * v[j];
					}
					for(let j = i; j < n; j++) {
						s += a[i][j] * v[j];
					}
					d[i] = s;
				}
				const t = innerproduct(v, d, k + 1, n) / 2.0;
				for(let i = n - 1; i > k; i--) {
					const p = v[i];
					const q = d[i] - (t * p);
					d[i] = q;
					for(let j = i; j < n; j++) {
						const r = p * d[j] + q * v[j];
						a[i][j] = a[i][j] - r;
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
		for(let k = n - 1; k >= 0; k--) {
			const v = a[k];
			if(k < n - 2) {
				for(let i = k + 1; i < n; i++) {
					const w = a[i];
					const t = innerproduct(v, w, k + 1, n);
					for(let j = k + 1; j < n; j++) {
						w[j] -= t * v[j];
					}
				}
			}
			for(let i = 0; i < n; i++) {
				v[i] = 0.0;
			}
			v[k] = 1.0;
		}

		// d と e の配列を使って、三重対角行列を作成する
		const H = Matrix.createMatrixDoEachCalculation(function(row, col) {
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
	}

	/**
	 * 対称行列の固有値分解
	 * 実数での計算のみ対応
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - 対称行列
	 * @returns {{V: Matrix, D: Matrix}}
	 */
	static eig(mat) {
		const A = Matrix._toMatrix(mat);
		
		// QR法により固有値を求める
		let is_error = false;
		const tolerance = 1.0e-10;
		const PH = LinearAlgebraTool.tridiagonalize(A);
		const a = PH.P.getNumberMatrixArray();
		const h = PH.H.getNumberMatrixArray();
		const n = A.row_length;

		// 成分の抽出
		const d = []; // 対角成分
		const e = []; // 隣の成分
		for(let i = 0; i < n; i++) {
			d[i] = h[i][i];
			e[i] = (i === 0) ? 0.0 : h[i][i - 1];
		}

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		const MAX_ITER = 100;
		for(let h = n - 1; h > 0; h--) {
			let j = h;
			for(j = h;j >= 1; j--) {
				if(Math.abs(e[j]) <= (tolerance * (Math.abs(d[j - 1]) + Math.abs(d[j])))) {
					break;
				}
			}
			if(j == h) {
				continue;
			}
			let iter = 0;
			while(true) {
				iter++;
				if(iter > MAX_ITER) {
					is_error = true;
					break;
				}
				let w = (d[h - 1] - d[h]) / 2.0;
				let t = e[h] * e[h];
				let s = Math.sqrt(w * w + t);
				if(w < 0) {
					s = - s;
				}
				let x = d[j] - d[h] + (t / (w + s));
				let y = e[j + 1];
				for(let k = j; k < h; k++) {
					let c, s;
					if(Math.abs(x) >= Math.abs(y)) {
						t = - y / x;
						c = 1.0 / Math.sqrt(t * t + 1);
						s = t * c;
					}
					else {
						t = - x / y;
						s = 1.0 / Math.sqrt(t * t + 1);
						c = t * s;
					}
					w = d[k] - d[k + 1];
					t = (w * s + 2.0 * c * e[k + 1]) * s;
					d[k] -= t;
					d[k + 1] += t;
					if(k > j) {
						e[k] = c * e[k] - s * y;
					}
					e[k + 1] += s * (c * w - 2.0 * s * e[k + 1]);
					for(let i = 0; i < n; i++) {
						x = a[i][k];
						y = a[i][k + 1];
						a[i][k    ] = c * x - s * y;
						a[i][k + 1] = s * x + c * y;
					}
					if(k < h - 1) {
						x = e[k + 1];
						y = -s * e[k + 2];
						e[k + 2] *= c;
					}
				}
				if(Math.abs(e[h]) <= tolerance * (Math.abs(d[h - 1]) + Math.abs(d[h]))) {
					break;
				}
			}
			if(is_error) {
				break;
			}
		}

		// 固有値が大きいものから並べるソート
		const vd_sort = function(V, d) {
			const len = d.length;
			const sortdata = [];
			for(let i = 0; i < len; i++) {
				sortdata[i] = {
					sigma : d[i],
					index : i
				};
			}
			const compare = function(a, b){
				if(a.sigma === b.sigma) {
					return 0;
				}
				return (a.sigma < b.sigma ? 1 : -1);
			};
			sortdata.sort(compare);
			const MOVE = Matrix.zeros(len);
			const ND = Matrix.zeros(len);
			for(let i = 0; i < len; i++) {
				ND.matrix_array[i][i] = new Complex(sortdata[i].sigma);
				MOVE.matrix_array[i][sortdata[i].index] = Complex.ONE;
			}
			return {
				V : V.mul(MOVE),
				D : ND
			};
		};
		const VD = vd_sort(new Matrix(a), d);
		return VD;
	}

	/**
	 * 行列をベクトルと見立て、正規直行化し、QとRの行列を作る
	 * @param {Matrix} mat - 正方行列
	 * @returns {{Q: Matrix, R: Matrix, non_orthogonalized : Array<number>}}
	 */
	static doGramSchmidtOrthonormalization(mat) {
		// グラム・シュミットの正規直交化法を使用する
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.

		const M = Matrix._toMatrix(mat);
		const len = M.column_length;
		const A = M.matrix_array;
		const Q_Matrix = Matrix.zeros(len);
		const R_Matrix = Matrix.zeros(len);
		const Q = Q_Matrix.matrix_array;
		const R = R_Matrix.matrix_array;
		const non_orthogonalized = [];
		const a = new Array(len);
		
		for(let col = 0; col < len; col++) {
			// i列目を抽出
			for(let row = 0; row < len; row++) {
				a[row] = A[row][col];
			}
			// 直行ベクトルを作成
			if(col > 0) {
				// Rのi列目を内積で計算する
				for(let j = 0; j < col; j++) {
					for(let k = 0; k < len; k++) {
						R[j][col] = R[j][col].add(A[k][col].dot(Q[k][j]));
					}
				}
				for(let j = 0; j < col; j++) {
					for(let k = 0; k < len; k++) {
						a[k] = a[k].sub(R[j][col].mul(Q[k][j]));
					}
				}
			}
			{
				// 正規化と距離を1にする
				for(let j = 0; j < len; j++) {
					R[col][col] = R[col][col].add(a[j].square());
				}
				R[col][col] = R[col][col].sqrt();
				if(R[col][col].isZero(1e-10)) {
					// 直行化が不可能だった列の番号をメモして、その列はゼロで埋める
					non_orthogonalized.push(col);
					for(let j = 0;j < len;j++) {
						Q[j][col] = Complex.ZERO;
					}
				}
				else {
					// ここで R[i][i] === 0 の場合、直行させたベクトルaは0であり、
					// ランク落ちしており、計算不可能である。
					// 0割りした値を、j列目のQに記録していくがInfとなる。
					for(let j = 0;j < len;j++) {
						Q[j][col] = a[j].div(R[col][col]);
					}
				}
			}
		}
		return {
			Q : Q_Matrix,
			R : R_Matrix,
			non_orthogonalized : non_orthogonalized
		};
	}
	
	/**
	 * 行列の全行ベクトルに対して、直行したベクトルを作成する
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {number} [epsilon=1.0e-10] - 誤差
	 * @returns {Matrix|null} 直行したベクトルがなければNULLを返す
	 */
	static createOrthogonalVector(mat, epsilon) {
		const M = new Matrix(mat);
		const column_length = M.column_length;
		const m = M.matrix_array;
		const tolerance = epsilon ? epsilon : 1.0e-10;
		// 正則行列をなす場合に問題となる行番号を取得
		const not_regular_rows = LinearAlgebraTool.getLinearDependenceVector(M, tolerance);
		// 不要な行を削除する
		{
			// not_regular_rowsは昇順リストなので、後ろから消していく
			for(let i = not_regular_rows.length - 1; i >= 0; i--) {
				m.splice(not_regular_rows[i], 1);
				M.row_length--;
			}
		}
		// 追加できるベクトルの数
		const add_vectors = column_length - m.length;
		if(add_vectors <= 0) {
			return null;
		}
		// ランダムベクトル（seed値は毎回同一とする）
		const noise = new Random(0);
		let orthogonal_matrix = null;
		for(let i = 0; i < 100; i++) {
			// 直行ベクトルを作るために、いったん行と列を交換する
			// これは、グラム・シュミットの正規直交化法が列ごとに行う手法のため。
			const M2 = M.T();
			// ランダム行列を作成する
			const R = Matrix.createMatrixDoEachCalculation(function() {
				return new Complex(noise.nextGaussian());
			}, M2.row_length, add_vectors);
			// 列に追加する
			M2._concatLeft(R);
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
		const y = new Array(add_vectors);
		const q = orthogonal_matrix.Q.matrix_array;
		for(let row = 0; row < add_vectors; row++) {
			y[row] = new Array(column_length);
			for(let col = 0; col < column_length; col++) {
				y[row][col] = q[col][column_length - add_vectors + row];
			}
		}
		return new Matrix(y);
	}

	/**
	 * 列の中で最もノルムが最大の値がある行番号
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {number} column_index - 列番号
	 * @param {number} [row_index_offset=0] - 行のオフセット(この値から行う)
	 * @param {number} [row_index_max] - 行の最大(この値は含めない)
	 * @returns {{index: number, max: number}} 行番号
	 * @private
	 */
	static getMaxRowNumber(mat, column_index, row_index_offset, row_index_max) {
		const M = Matrix._toMatrix(mat);
		let row_index = 0;
		let row_max = 0;
		let row = row_index_offset ? row_index_offset : 0;
		const row_imax = row_index_max ? row_index_max : M.row_length;
		// n列目で最も大きな行を取得
		for(; row < row_imax; row++) {
			const norm = M.matrix_array[row][column_index].norm;
			if(norm > row_max) {
				row_max = norm;
				row_index = row;
			}
		}
		return {
			index : row_index,
			max : row_max
		};
	}

	/**
	 * 行列の各行をベクトルと見立て、線型従属している行を抽出
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {number} [epsilon=1.0e-10] - 誤差
	 * @returns {Array} 行番号の行列(昇順)
	 * @private
	 */
	static getLinearDependenceVector(mat, epsilon) {
		const M = new Matrix(mat);
		const m = M.matrix_array;
		const tolerance = epsilon ? Matrix._toDouble(epsilon) : 1.0e-10;
		// 確認する行番号（ここから終わった行は削除していく）
		const row_index_array = new Array(mat.row_length);
		for(let i = 0; i < mat.row_length; i++) {
			row_index_array[i] = i;
		}
		// ガウスの消去法を使用して、行ベクトルを抽出していく
		for(let col_target = 0; col_target < M.column_length; col_target++) {
			let row_max_index = 0;
			{
				let row_max = 0;
				let row_max_key = 0;
				// n列目で絶対値が最も大きな行を取得
				for(const row_key in row_index_array) {
					const row = row_index_array[row_key];
					const norm = m[row][col_target].norm;
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
			for(const row_key in row_index_array) {
				const row = row_index_array[row_key];
				const inv = m[row][col_target].div(m[row_max_index][col_target]);
				for(let col = col_target; col < M.column_length; col++) {
					m[row][col] = m[row][col].sub(m[row_max_index][col].mul(inv));
				}
			}
		}
		return row_index_array;
	}

}

/**
 * Matrix用の線形代数用の計算クラス
 */
export default class LinearAlgebra {

	/**
	 * ドット積
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} A
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} B
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] 計算するときに使用する次元（1 or 2）
	 * @returns {Matrix} A・B 
	 */
	static inner(A, B, dimension) {
		const M1 = Matrix._toMatrix(A);
		const M2 = Matrix._toMatrix(B);
		const x1 = M1.matrix_array;
		const x2 = M2.matrix_array;
		const dim = dimension ? Matrix._toInteger(dimension) : 1;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.dot(M2.scalar));
		}
		if(M1.isVector() && M2.isVector()) {
			let sum = Complex.ZERO;
			for(let i = 0; i < M1.length; i++) {
				sum = sum.add(M1.getComplex(i).dot(M2.getComplex(i)));
			}
			return new Matrix(sum);
		}
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		if(dim === 1) {
			const y = new Array(1);
			y[0] = new Array(M1.column_length);
			for(let col = 0; col < M1.column_length; col++) {
				let sum = Complex.ZERO;
				for(let row = 0; row < M1.row_length; row++) {
					sum = sum.add(x1[row][col].dot(x2[row][col]));
				}
				y[0][col] = sum;
			}
			return new Matrix(y);
		}
		else if(dim === 2) {
			const y = new Array(M1.row_length);
			for(let row = 0; row < M1.row_length; row++) {
				let sum = Complex.ZERO;
				for(let col = 0; col < M1.column_length; col++) {
					sum = sum.add(x1[row][col].dot(x2[row][col]));
				}
				y[row] = [sum];
			}
			return new Matrix(y);
		}
		else {
			throw "dim";
		}
	}

	/**
	 * pノルム
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
	 * @returns {number}
	 */
	static norm(mat, p) {
		const M = Matrix._toMatrix(mat);
		const p_number = (p === undefined) ? 2 : Matrix._toDouble(p);
		if(p_number === 1) {
			// 行列の1ノルム
			const y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[0][col].norm;
				}
				return sum;
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				let sum = 0.0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][0].norm;
				}
				return sum;
			}
			// 列の和の最大値
			let max = 0;
			// 列を固定して行の和を計算
			for(let col = 0; col < M.column_length; col++) {
				let sum = 0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][col].norm;
				}
				if(max < sum) {
					max = sum;
				}
			}
			return max;
		}
		else if(p_number === 2) {
			// 行列の2ノルム
			const y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[0][col].square().real;
				}
				return Math.sqrt(sum);
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				let sum = 0.0;
				for(let row = 0; row < M.row_length; row++) {
					sum += y[row][0].square().real;
				}
				return Math.sqrt(sum);
			}
			return M.svd().S.diag().max().scalar.real;
		}
		else if((p_number === Number.POSITIVE_INFINITY) || (p_number === Number.NEGATIVE_INFINITY)) {
			const y = M.matrix_array;
			let compare_number = p_number === Number.POSITIVE_INFINITY ? 0 : Number.POSITIVE_INFINITY;
			const compare_func = p_number === Number.POSITIVE_INFINITY ? Math.max : Math.min;
			// 行ノルムを計算する
			if(M.isRow()) {
				for(let col = 0; col < M.column_length; col++) {
					compare_number = compare_func(compare_number, y[0][col].norm);
				}
				return compare_number;
			}
			// 列ノルムを計算する
			if(M.isColumn()) {
				for(let row = 0; row < M.row_length; row++) {
					compare_number = compare_func(compare_number, y[row][0].norm);
				}
				return compare_number;
			}
			// 行列の場合は、列の和の最大値
			compare_number = 0;
			for(let row = 0; row < M.row_length; row++) {
				let sum = 0.0;
				for(let col = 0; col < M.column_length; col++) {
					sum += y[row][col].norm;
				}
				compare_number = Math.max(compare_number, sum);
			}
			return compare_number;
		}
		else if(M.isVector()) {
			// 一般化ベクトルpノルム
			let sum = 0.0;
			for(let i = 0; i < M.length; i++) {
				sum += Math.pow(M.getComplex(i).norm, p_number);
			}
			return Math.pow(sum, 1.0 / p_number);
		}
		// 未実装
		throw "norm";
	}
	
	/**
	 * 条件数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
	 * @returns {number}
	 */
	static cond(mat, p) {
		const M = Matrix._toMatrix(mat);
		const p_number = (p === undefined) ? 2 : Matrix._toInteger(p);
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
			const s = M.svd().S.diag();
			return s.max().scalar.real / s.min().scalar.real;
		}
		return M.norm(p) * M.pinv().norm(p);
	}

	/**
	 * 1ノルムの条件数の逆数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @returns {number}
	 */
	static rcond(mat) {
		return 1.0 / LinearAlgebra.cond(Matrix._toMatrix(mat), 1);
	}

	/**
	 * ランク
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
	 * @returns {number} rank(A)
	 */
	static rank(mat, epsilon) {
		const M = Matrix._toMatrix(mat);
		// 横が長い行列の場合
		if(M.row_length <= M.column_length) {
			return Math.min(M.row_length, M.column_length) - (LinearAlgebraTool.getLinearDependenceVector(M, epsilon)).length;
		}
		else {
			return M.row_length - (LinearAlgebraTool.getLinearDependenceVector(M, epsilon)).length;
		}
	}

	/**
	 * トレース
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @returns {Complex}
	 */
	static trace(mat) {
		const M = Matrix._toMatrix(mat);
		const len = Math.min(M.row_length, M.column_length);
		let sum = Complex.ZERO;
		for(let i = 0; i < len; i++) {
			sum = sum.add(M.matrix_array[i][i]);
		}
		return sum;
	}

	/**
	 * 行列式
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
	 * @returns {Matrix} |A|
	 */
	static det(mat) {
		const M = Matrix._toMatrix(mat);
		if(!M.isSquare()) {
			throw "not square";
		}
		const len = M.length;
		if(len < 5) {
			const calcDet = function(x) {
				if(x.length === 2) {
					// 2次元の行列式になったら、たすき掛け計算する
					return x[0][0].mul(x[1][1]).sub(x[0][1].mul(x[1][0]));
				}
				let y = Complex.ZERO;
				for(let i = 0; i < x.length; i++) {
					// N次元の行列式を、N-1次元の行列式に分解していく
					const D = [];
					const a = x[i][0];
					for(let row = 0, D_low = 0; row < x.length; row++) {
						if(i === row) {
							continue;
						}
						D[D_low] = [];
						for(let col = 1, D_col = 0; col < x.length; col++, D_col++) {
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
			const lup = LinearAlgebra.lup(M);
			const exchange_count = (len - lup.P.diag().sum().scalar.real) / 2;
			// 上行列の対角線上の値を掛け算する
			let y = lup.U.diag().prod();
			if((exchange_count % 2) === 1) {
				y = y.negate();
			}
			return new Matrix(y);
		}
	}

	/**
	 * LUP分解
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
	 */
	static lup(mat) {
		const A = new Matrix(mat);
		const L = Matrix.zeros(A.row_length);
		const U = A;
		const P = Matrix.eye(A.row_length);
		const l = L.matrix_array;
		const u = U.matrix_array;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(let k = 0; k < A.column_length; k++) {
			// ピポットの選択
			let pivot;
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const max_row_number = LinearAlgebraTool.getMaxRowNumber(U, k, k);
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
			for(let row = k + 1;row < A.row_length; row++) {
				const temp = u[row][k].div(u[k][k]);
				l[row][k] = temp;
				//lの値だけ行交換が必要？
				for(let col = k; col < A.column_length; col++) {
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
	}

	/**
	 * LU分解
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{L: Matrix, U: Matrix}} L*U=A
	 */
	static lu(mat) {
		const lup = LinearAlgebra.lup(mat);
		const L = lup.P.T().mul(lup.L);
		return {
			L : L,
			U : lup.U
		};
	}

	/**
	 * 連立一次方程式を解く
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
	 * @returns {Matrix} Ax=B となる x
	 * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
	 */
	static linsolve(mat, number) {
		const A = Matrix._toMatrix(mat);
		const B = Matrix._toMatrix(number);
		if(!A.isSquare()) {
			throw "Matrix size does not match";
		}
		// 連立一次方程式を解く
		const arg = B;
		if((B.row_length !== A.row_length) || (B.column_length > 1)) {
			throw "Matrix size does not match";
		}
		// 行列を準備する
		const M = new Matrix(A);
		M._concatLeft(arg);
		const long_matrix_array = M.matrix_array;
		const long_length = M.column_length;
		const len = A.column_length;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(let k = 0; k < (len - 1); k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				const normalize_value = long_matrix_array[k][k].inv();
				for(let row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(let row = k + 1;row < len; row++) {
				const temp = long_matrix_array[row][k];
				for(let col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].sub(long_matrix_array[k][col].mul(temp));
				}
			}
		}
		//後退代入
		const y = new Array(len);
		y[len - 1] = long_matrix_array[len - 1][len].div(long_matrix_array[len - 1][len - 1]);
		for(let row = len - 2; row >= 0; row--) {
			y[row] = long_matrix_array[row][long_length - 1];
			for(let j = row + 1; j < len; j++) {
				y[row] = y[row].sub(long_matrix_array[row][j].mul(y[j]));
			}
			y[row] = y[row].div(long_matrix_array[row][row]);
		}
		const y2 = new Array(A.row_length);
		for(let row = 0; row < A.row_length; row++) {
			y2[row] = [y[row]];
		}

		return new Matrix(y2);
	}

	/**
	 * QR分解
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{Q: Matrix, R: Matrix}}  Q*R=A, Qは正規直行行列、Rは上三角行列
	 */
	static qr(mat) {
		// 行列を準備する
		const M = new Matrix(mat);
		// 作成後のQとRのサイズ
		const Q_row_length = M.row_length;
		const Q_column_length = M.row_length;
		const R_row_length = M.row_length;
		const R_column_length = M.column_length;
		// 計算時の行と列のサイズ
		const dummy_size = Math.max(M.row_length, M.column_length);
		// 正方行列にする
		M._resize(dummy_size, dummy_size);
		// 正規直行化
		const orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M);
		// 計算したデータを取得
		let Q_Matrix = orthogonal_matrix.Q;
		const R_Matrix = orthogonal_matrix.R;
		const non_orthogonalized = orthogonal_matrix.non_orthogonalized;

		// Qのサイズを成型する
		if(non_orthogonalized.length === M.row_length) {
			// 零行列の場合の特別処理
			Q_Matrix = Matrix.eye(M.row_length);
		}
		else if(non_orthogonalized.length !== 0) {
			// 一部、直行化できていない列があるため直行化できてない列以外を抽出
			const map = {};
			for(let i = 0; i < non_orthogonalized.length; i++) {
				map[non_orthogonalized[i]] = 1;
			}
			const orthogonalized = [];
			for(let i = 0; i < dummy_size; i++) {
				if(map[i]) {
					continue;
				}
				const array = [];
				for(let j = 0; j < dummy_size; j++) {
					array[j] = Q_Matrix.matrix_array[j][i];
				}
				orthogonalized.push(array);
			}
			// 直行ベクトルを作成する
			const orthogonal_vector = LinearAlgebraTool.createOrthogonalVector(orthogonalized);
			// 直行化できていない列を差し替える
			for(let i = 0; i < non_orthogonalized.length; i++) {
				const q_col = non_orthogonalized[i];
				for(let j = 0; j < dummy_size; j++) {
					Q_Matrix.matrix_array[j][q_col] = orthogonal_vector.matrix_array[i][j];
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
	}

	/**
	 * 対称行列の三重対角化
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
	 */
	static tridiagonalize(mat) {
		const M = new Matrix(mat);
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
	}

	/**
	 * 対称行列の固有値分解
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
	 * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
	 */
	static eig(mat) {
		const M = new Matrix(mat);
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
	}

	/**
	 * 特異値分解
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
	 */
	static svd(mat) {
		const M = new Matrix(mat);
		if(M.isComplex()) {
			// 複素数が入っている場合は、eig関数が使用できないので非対応
			throw "Unimplemented";
		}
		const rank = LinearAlgebra.rank(M);
		// SVD分解
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.
		const VD = LinearAlgebra.eig(M.T().mul(M));
		const sigma = Matrix.zeros(M.row_length, M.column_length);
		sigma._each(function(num, row, col) {
			if((row === col) && (row < rank)) {
				return VD.D.getComplex(row, row).sqrt();
			}
		});
		const s_size = Math.min(M.row_length, M.column_length);
		const sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				const x = sigma.matrix_array[row][row];
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
		const V_rank = VD.V.resize(VD.V.row_length, s_size);
		const u = M.mul(V_rank).mul(sing);
		const QR = LinearAlgebra.qr(u);
		return {
			U : QR.Q,
			S : sigma,
			V : VD.V
		};
	}

	/**
	 * 逆行列
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {Matrix} A^-1
	 */
	static inv(mat) {
		const X = new Matrix(mat);
		if(X.isScalar()) {
			return new Matrix(Complex.ONE.div(X.scalar));
		}
		if(!X.isSquare()) {
			throw "not square";
		}
		if(X.isDiagonal()) {
			// 対角行列の場合は、対角成分のみ逆数をとる
			const y = X.T();
			const size = Math.min(y.row_length, y.column_length);
			for(let i = 0; i < size; i++) {
				y.matrix_array[i][i] = y.matrix_array[i][i].inv();
			}
			return y;
		}
		// (ここで正規直交行列の場合なら、転置させるなど入れてもいい？判定はできないけども)
		const len = X.column_length;
		// ガウス・ジョルダン法
		// 初期値の設定
		const M = new Matrix(X);
		M._concatLeft(Matrix.eye(len));
		const long_matrix_array = M.matrix_array;
		const long_length = M.column_length;

		//前進消去
		for(let k = 0; k < len; k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				const row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				const normalize_value = long_matrix_array[k][k].inv();
				for(let row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(let row = 0;row < len; row++) {
				if(row === k) {
					continue;
				}
				const temp = long_matrix_array[row][k];
				for(let col = k; col < long_length; col++)
				{
					long_matrix_array[row][col] = long_matrix_array[row][col].sub(long_matrix_array[k][col].mul(temp));
				}
			}
		}

		const y = new Array(len);
		//右の列を抜き取る
		for(let row = 0; row < len; row++) {
			y[row] = new Array(len);
			for(let col = 0; col < len; col++) {
				y[row][col] = long_matrix_array[row][len + col];
			}
		}

		return new Matrix(y);
	}

	/**
	 * 疑似逆行列
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
	 * @returns {Matrix} A^+
	 */
	static pinv(mat) {
		const M = new Matrix(mat);
		const USV = LinearAlgebra.svd(M);
		const U = USV.U;
		const S = USV.S;
		const V = USV.V;
		const sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				const x = S.matrix_array[row][row];
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
	}



}
