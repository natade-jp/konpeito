/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Polyfill from "../../tools/Polyfill.js";
import Complex from "../Complex.js";
import Matrix from "../Matrix.js";

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KStatisticsSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */

/**
 * Class for statistical processing for `Matrix` class.
 * - These methods can be used in the `Matrix` method chain.
 * - This class cannot be called directly.
 */
export default class Statistics {

	/**
	 * Maximum number.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix} max([A, B])
	 */
	static max(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) < 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}
	
	/**
	 * Minimum number.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix} min([A, B])
	 */
	static min(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = data[0];
			for(let i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) > 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Sum.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static sum(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			// カハンの加算アルゴリズム
			let sum = Complex.ZERO;
			let delta = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				const new_number = data[i].add(delta);
				const new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Arithmetic average.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			// カハンの加算アルゴリズム
			let sum = Complex.ZERO;
			let delta = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				const new_number = data[i].add(delta);
				const new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum.div(data.length)];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Product of array elements.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static prod(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = Complex.ONE;
			for(let i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Geometric mean.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static geomean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let x = Complex.ONE;
			for(let i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x.pow(Complex.create(data.length).inv())];
		};
		return X.eachVector(main, dim);
	}
	
	/**
	 * Median.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static median(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Complex} a
		 * @param {Complex} b
		 * @returns {number}
		 */
		const compare = function(a, b){
			return a.compareTo(b);
		};
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			let y;
			if((data.length % 2) === 1) {
				y = data[Math.floor(data.length / 2)];
			}
			else {
				const x1 = data[Math.floor(data.length / 2) - 1];
				const x2 = data[Math.floor(data.length / 2)];
				y = x1.add(x2).div(Complex.TWO);
			}
			return [y];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Mode.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mode(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		/**
		 * @param {Complex} a
		 * @param {Complex} b
		 * @returns {number}
		 */
		const compare = function(a, b){
			return a.compareTo(b);
		};
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			/**
			 * @type {any}
			 */
			const map = {};
			for(let i = 0; i < data.length; i++) {
				const str = data[i].real + " " + data[i].imag;
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
			let max_complex = Complex.ZERO;
			let max_number = Number.NEGATIVE_INFINITY;
			for(const key in map) {
				const tgt = map[key];
				if(tgt.value > max_number) {
					max_number	= tgt.value;
					max_complex	= tgt.complex;
				}
			}
			return [max_complex];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Moment.
	 * - Moment of order n. Equivalent to the definition of variance at 2.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {number} nth_order
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static moment(x, nth_order, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、標本分散とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Matrix._toComplex(nth_order);
		let col = 0;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			let mean;
			if(M.isScalar()) {
				mean = M.scalar;
			}
			else {
				mean = M.getComplex(col++);
			}
			let x = Complex.ZERO;
			for(let i = 0; i < data.length; i++) {
				// 計算方法について
				// ・複素数は、ノルムをとらずに複素数用のpowを使用したほうがいいのか
				// ・分散と同様にnormで計算したほうがいいのか
				// 複素数でのモーメントの定義がないため不明であるが、
				// 分散を拡張した考えであれば、normをとった累乗のほうが良いと思われる。
				const a = data[i].sub(mean);
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
	}

	/**
	 * Variance.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static var(x, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		let col = 0;
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			if(data.length === 1) {
				// 要素が1であれば、分散は0固定
				return [Complex.ZERO];
			}
			const mean = M.getComplex(col++);
			// 分散は、ノルムの2乗で計算するため必ず実数になる。
			let x = 0;
			for(let i = 0; i < data.length; i++) {
				const a = data[i].sub(mean).norm;
				x += a * a;
			}
			return [Complex.create(x / (data.length - 1 + cor))];
		};
		return X.eachVector(main, dim);
	}

	/**
	 * Standard deviation.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static std(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Statistics.var(X, { correction : cor, dimension : dim });
		M._each(function(num) {
			return num.sqrt();
		});
		return M;
	}

	/**
	 * Mean absolute deviation.
	 * - The "algorithm" can choose "0/mean"(default) and "1/median".
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {?string|?number} [algorithm]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static mad(x, algorithm, type) {
		const X = Matrix._toMatrix(x);
		const alg = !algorithm ? "mean" : (typeof algorithm === "string" ? algorithm : Matrix._toInteger(algorithm));
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		if((alg === "mean") || (alg === 0)) {
			return Statistics.mean(X.sub(Statistics.mean(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else if((alg === "median") || (alg === 1)) {
			return Statistics.median(X.sub(Statistics.median(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else {
			throw "mad unsupported argument " + alg;
		}
	}

	/**
	 * Skewness.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static skewness(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏), 1(標本)。規定値は、標本とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Statistics.moment(X, 3, { correction : cor, dimension : dim });
		const std = Statistics.std(X, { correction : cor, dimension : dim });
		if(cor === 1) {
			return order.dotdiv(std.dotpow(3));
		}
		else {
			return order.dotdiv(std.dotpow(3)).dotmul(2);
		}
	}

	/**
	 * Covariance matrix or Covariance value.
	 * - Get a variance-covariance matrix from 1 matrix.
	 * - Get a covariance from 2 vectors.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings|import("../Matrix.js").KMatrixInputData} [y_or_type]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static cov(x, y_or_type, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		let cor = 0;
		let Y = null;
		if(y_or_type !== undefined) {
			if(type !== undefined) {
				cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
				Y = Matrix._toMatrix(y_or_type);
			}
			else {
				if(typeof y_or_type === "object" && ("correction" in y_or_type)){
					cor = Matrix._toDouble(y_or_type.correction);
				}
				else {
					Y = Matrix._toMatrix(y_or_type);
				}
			}
		}
		// 1つの行列から分散共分散行列を作成する
		if(Y === null) {
			if(X.isVector()) {
				return Statistics.var(X, {correction : cor});
			}
			const correction = X.row_length === 1 ? 1 : cor;
			const arr = X.matrix_array;
			const mean = Statistics.mean(X).matrix_array[0];
			// 上三角行列、対角行列
			const y = new Array(X.column_length);
			for(let a = 0; a < X.column_length; a++) {
				const a_mean = mean[a];
				y[a] = new Array(X.column_length);
				for(let b = a; b < X.column_length; b++) {
					const b_mean = mean[b];
					let sum = Complex.ZERO;
					for(let row = 0; row < X.row_length; row++) {
						sum = sum.add((arr[row][a].sub(a_mean)).dot(arr[row][b].sub(b_mean)));
					}
					y[a][b] = sum.div(X.row_length - 1 + correction);
				}
			}
			// 下三角行列を作る
			for(let row = 1; row < y[0].length; row++) {
				for(let col = 0; col < row; col++) {
					y[row][col] = y[col][row];
				}
			}
			return new Matrix(y);
		}
		// 2つのベクトルから共分散を求める
		else {
			if(!X.isVector() && !Y.isVector()) {
				throw "vector not specified";
			}
			if(X.length !== Y.length) {
				throw "X.length !== Y.length";
			}
			const x_mean = Statistics.mean(X).scalar;
			const y_mean = Statistics.mean(Y).scalar;
			const length = X.length;
			const correction = length === 1 ? 1 : cor;
			let sum = Complex.ZERO;
			for(let i = 0; i < length; i++) {
				sum = sum.add((X.getComplex(i).sub(x_mean)).dot(Y.getComplex(i).sub(y_mean)));
			}
			return new Matrix(sum.div(length - 1 + correction));
		}
	}

	/**
	 * The samples are standardize to a mean value of 0, standard deviation of 1.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static standardization(x, type) {
		const X = Matrix._toMatrix(x);
		const mean_zero = X.sub(Statistics.mean(X, type));
		const std_one = mean_zero.dotdiv(Statistics.std(mean_zero, type));
		return std_one;
	}

	/**
	 * Correlation matrix or Correlation coefficient.
	 * - Get a correlation matrix from 1 matrix.
	 * - Get a correlation coefficient from 2 vectors.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {KStatisticsSettings|import("../Matrix.js").KMatrixInputData} [y_or_type]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static corrcoef(x, y_or_type, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		let Y = null;
		if(y_or_type !== undefined) {
			if(type !== undefined) {
				Y = Matrix._toMatrix(y_or_type);
			}
			else {
				if(!(typeof y_or_type === "object" && ("correction" in y_or_type))){
					Y = Matrix._toMatrix(y_or_type);
				}
			}
		}
		// 1つの行列から相関行列を作成する
		if(Y === null) {
			return Statistics.cov(Statistics.standardization(X, type), type);
		}
		// 2つのベクトルから相関係数を求める
		else {
			if(!X.isVector() && !Y.isVector()) {
				throw "vector not specified";
			}
			if(X.length !== Y.length) {
				throw "X.length[" + X.length + "] !== Y.length[" + Y.length + "]";
			}
			const covariance = Statistics.cov(X, Y, type);
			const Xsd = X.std(type);
			const Ysd = Y.std(type);
			return covariance.div(Xsd.mul(Ysd));
		}
	}

	/**
	 * Sort.
	 * - The "order" can choose "ascend"(default) and "descend".
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {string} [order]
	 * @param {KStatisticsSettings} [type]
	 * @returns {Matrix}
	 */
	static sort(x, order, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		const order_type = !order ? "ascend" : order;
		/**
		 * @type {function(Complex, Complex): number }
		 */
		let compare;
		if(order_type === "ascend") {
			compare = function(a, b){
				return a.compareTo(b);
			};
		}
		else {
			compare = function(a, b){
				return b.compareTo(a);
			};
		}
		/**
		 * @param {Array<Complex>} data 
		 * @returns {Array<Complex>}
		 */
		const main = function(data) {
			data.sort(compare);
			return data;
		};
		return X.eachVector(main, dim);
	}


}
