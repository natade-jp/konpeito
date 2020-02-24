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

/**
 * Return true if the value is integer.
 * @param {number} x
 * @returns {boolean}
 * @ignore
 */
const isInteger = function(x) {
	return (x - Math.trunc(x) !== 0.0);
};

/**
 * Collection for calculating probability using real numbers.
 * - These methods can be used in the `Matrix`, `Complex` method chain.
 * - This class cannot be called directly.
 */
export default class Probability {

	/**
	 * Log-gamma function.
	 * @param {number} x
	 * @returns {number}
	 */
	static gammaln(x) {
		if(!isFinite(x)) {
			if(isNaN(x)) {
				return NaN;
			}
			else {
				return Infinity;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		const LOG_2PI = Math.log(2.0 * Math.PI);
		//ベルヌーイ数
		//http://fr.wikipedia.org/wiki/Nombre_de_Bernoulli
		const K2 = ( 1.0 / 6.0)					/ (2 * 1);
		const K4 = (-1.0 / 30.0)				/ (4 * 3);
		const K6 = ( 1.0 / 42.0)				/ (6 * 5);
		const K8 = (-1.0 / 30.0)				/ (8 * 7);
		const K10 = ( 5.0 / 66.0)				/ (10 * 9);
		const K12 = (-691.0 / 2730.0)			/ (12 * 11);
		const K14 = ( 7.0 / 6.0)				/ (14 * 13);
		const K16 = (-3617.0 / 510.0)			/ (16 * 15);
		const K18 = (43867.0 / 798.0)			/ (18 * 17);
		const K20 = (-174611.0 / 330.0)			/ (20 * 19);
		const K22 = (854513.0 / 138.0)			/ (22 * 21);
		const K24 = (-236364091.0 / 2730.0)		/ (24 * 23);
		const K26 = (8553103.0 / 6.0)			/ (26 * 25);
		const K28 = (-23749461029.0 / 870.0)	/ (28 * 27);
		const K30 = (8615841276005.0 / 14322.0)	/ (30 * 29);
		const K32 = (-7709321041217.0 / 510.0)	/ (32 * 31);
		const LIST = [
			K32, K30, K28, K26, K24, K22, K20, K18,
			K16, K14, K12, K10, K8, K6, K4, K2
		];
		let v = 1;
		let lx = x;
		while(lx < LIST.length) {
			v *= lx;
			lx++;
		}
		const w = 1 / (lx * lx);
		let y = LIST[0];
		for(let i = 1; i < LIST.length; i++) {
			y *= w;
			y += LIST[i];
		}
		y /= lx;
		y += 0.5 * LOG_2PI;
		y += - Math.log(v) - lx + (lx - 0.5) * Math.log(lx);
		return(y);
	}

	/**
	 * Incomplete gamma function upper side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} gammaln_a
	 * @returns {number}
	 */
	static q_gamma(x, a, gammaln_a) {
		if(!isFinite(x)) {
			if(x === Infinity) {
				return 0.0;
			}
			else {
				return NaN;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, w, temp, previous;
		// Laguerreの多項式
		let la = 1.0, lb = 1.0 + x - a;
		if(x < 1.0 + a) {
			return (1 - Probability.p_gamma(x, a, gammaln_a));
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
	}

	/**
	 * Incomplete gamma function lower side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} gammaln_a
	 * @returns {number}
	 */
	static p_gamma(x, a, gammaln_a) {
		if(!isFinite(x)) {
			if(x === Infinity) {
				return 1.0;
			}
			else {
				return NaN;
			}
		}
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, term, previous;
		if(x >= 1.0 + a) {
			return (1.0 - Probability.q_gamma(x, a, gammaln_a));
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
	}

	/**
	 * Gamma function.
	 * @param {number} z
	 * @returns {number}
	 */
	static gamma(z) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		if(z < 0) {
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(Probability.gammaln(1.0 - z))));
		}
		return Math.exp(Probability.gammaln(z));
	}

	/**
	 * Incomplete gamma function.
	 * @param {number} x
	 * @param {number} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static gammainc(x, a, tail) {
		if(tail === "lower") {
			return Probability.p_gamma(x, a, Probability.gammaln(a));
		}
		else if(tail === "upper") {
			return Probability.q_gamma(x, a, Probability.gammaln(a));
		}
		else if(tail === undefined) {
			// 引数を省略した場合
			return Probability.gammainc(x, a, "lower");
		}
		else {
			throw "gammainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * @param {number} x
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gampdf(x, k, s) {
		if(x === -Infinity) {
			return 0.0;
		}
		let y = 1.0 / (Probability.gamma(k) * Math.pow(s, k));
		y *= Math.pow( x, k - 1);
		y *= Math.exp( - x / s );
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * @param {number} x
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gamcdf(x, k, s) {
		if(x < 0) {
			return 0.0;
		}
		return Probability.gammainc(x / s, k);
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * @param {number} p
	 * @param {number} k - Shape parameter.
	 * @param {number} s - Scale parameter.
	 * @returns {number}
	 */
	static gaminv(p, k, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		const eps = 1.0e-12;
		// 初期値を決める
		let y = k * s;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		let delta, y2;
		for(let i = 0; i < 100; i++) {
			y2 = y - ((Probability.gamcdf(y, k, s) - p) / Probability.gampdf(y, k, s));
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
	}

	/**
	 * Beta function.
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	static beta(x, y) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		return (Math.exp(Probability.gammaln(x) + Probability.gammaln(y) - Probability.gammaln(x + y)));
	}
	
	/**
	 * Incomplete beta function lower side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static p_beta(x, a, b) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p231,技術評論社,1991
		let k;
		let result, term, previous;
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
			return (1.0 - Probability.p_beta(1.0 - x, b, a));
		}
		if(x <= 0.0) {
			return 0.0;
		}
		term = a * Math.log(x);
		term += b * Math.log(1.0 - x);
		term += Probability.gammaln(a + b);
		term -= Probability.gammaln(a) + Probability.gammaln(b);
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
	}

	/**
	 * Incomplete beta function upper side.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static q_beta(x, a, b) {
		return (1.0 - Probability.p_beta(x, a, b));
	}

	/**
	 * Incomplete beta function.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static betainc(x, a, b, tail) {
		if(tail === "lower") {
			return Probability.p_beta(x, a, b);
		}
		else if(tail === "upper") {
			return Probability.q_beta(x, a, b);
		}
		else if(tail === undefined) {
			// 引数を省略した場合
			return Probability.betainc(x, a, b, "lower");
		}
		else {
			throw "betainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * Probability density function (PDF) of beta distribution.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betapdf(x, a, b) {
		// powの計算結果が複素数になる場合は計算を行わない
		if	(
			((x < 0) && isInteger(b - 1)) ||
			((1 - x < 0) && isInteger(b - 1))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / Probability.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / Probability.beta(a,  b));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betacdf(x, a, b) {
		return Probability.betainc(x, a, b);
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * @param {number} p
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betainv(p, a, b) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if((p == 0.0) && (a > 0.0) && (b > 0.0)) {
			return 0.0;
		}
		else if((p == 1.0) && (a > 0.0) && (b > 0.0)) {
			return 1.0;
		}
		const eps = 1.0e-14;
		// 初期値を決める
		let y;
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
		let delta, y2;
		for(let i = 0; i < 100; i++) {
			y2 = y - ((Probability.betacdf(y, a, b) - p) / Probability.betapdf(y, a, b));
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
	}

	/**
	 * Factorial function, x!.
	 * @param {number} n
	 * @returns {number}
	 */
	static factorial(n) {
		const y = Probability.gamma(n + 1.0);
		if(Math.trunc(n) === n) {
			return Math.round(y);
		}
		else {
			return y;
		}
	}

	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * @param {number} n
	 * @param {number} k
	 * @returns {number} nCk
	 */
	static nchoosek(n, k) {
		// 少ない数字なら以下の計算でよい
		// return Math.round(Probability.factorial(n) / (Probability.factorial(n - k) * Probability.factorial(k)));
		let x = 1;
		const new_k = Math.min(k, n - k);
		for(let i = 1; i <= new_k; i++) {
			x *= (n + 1 - i) / i;
			if(x >= Number.MAX_SAFE_INTEGER) {
				return Infinity;
			}
		}
		return x;
	}

	/**
	 * Error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erf(x) {
		return (Probability.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	}

	/**
	 * Complementary error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erfc(x) {
		return 1.0 - Probability.erf(x);
	}

	/**
	 * Inverse function of error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfinv(p) {
		return Probability.erfcinv(1.0 - p);
	}

	/**
	 * Inverse function of complementary error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfcinv(p) {
		return - Probability.norminv(p * 0.5) / Math.sqrt(2);
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * @param {number} x
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static normpdf(x, u, s) {
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		let y = 1.0 / Math.sqrt( 2.0 * Math.PI * s_ * s_ );
		y *= Math.exp( - (x - u_) * (x - u_) / (2.0 * s_ * s_));
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * @param {number} x
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static normcdf(x, u, s) {
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		return (1.0 + Probability.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * @param {number} p - Probability.
	 * @param {number} [u=0.0] - Average value.
	 * @param {number} [s=1.0] - Variance value.
	 * @returns {number}
	 */
	static norminv(p, u, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		const eps = 1.0e-12;
		// 初期値を決める
		let y = u_;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		let delta, y2;
		for(let i = 0; i < 200; i++) {
			y2 = y - ((Probability.normcdf(y, u_, s_) - p) / Probability.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * Probability density function (PDF) of binomial distribution.
	 * @param {number} x
	 * @param {number} n
	 * @param {number} p
	 * @returns {number}
	 */
	static binopdf(x, n, p) {
		if(!isFinite(p)) {
			if(isNaN(p)) {
				return NaN;
			}
			else {
				return 0.0;
			}
		}
		return Probability.nchoosek(n, x) * Math.pow(p, x) * Math.pow(1.0 - p, n - x);
	}
	
	/**
	 * Cumulative distribution function (CDF) of binomial distribution.
	 * @param {number} x
	 * @param {number} n
	 * @param {number} p
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {number}
	 */
	static binocdf(x, n, p, tail) {
		return Probability.betainc(1.0 - p, n - Math.floor(x), 1 + Math.floor(x), tail);
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of binomial distribution.
	 * @param {number} y
	 * @param {number} n
	 * @param {number} p
	 * @returns {number}
	 */
	static binoinv(y, n, p) {
		if((y < 0.0) || (1.0 < y) || (p < 0.0) || (1.0 < p)) {
			return Number.NaN;
		}
		else if((y == 0.0) || (p == 0.0)) {
			return 0.0;
		}
		else if(p == 1.0) {
			return n;
		}
		// 初期値を決める
		let min = 1;
		let max = n;
		let middle = 0, old_middle = 0; 
		// ニュートンラフソン法だと安定しないので
		// 挟み込み法（二分法）で求める
		for(let i = 0; i < 200; i++) {
			middle = Math.round((min + max) / 2);
			const Y = Probability.binocdf(middle, n, p);
			if(middle === old_middle) {
				break;
			}
			if(Y > y) {
				max = middle;
			}
			else {
				min = middle;
			}
			old_middle = middle;
		}
		return middle;
	}

	/**
	 * Probability density function (PDF) of Poisson distribution.
	 * @param {number} k
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poisspdf(k, lambda) {
		if(!isFinite(k)) {
			if(isNaN(k)) {
				return Number.NaN;
			}
			else {
				return 0.0;
			}
		}
		// k が大きいとInfになってしまうので以下の処理はだめ
		// Math.pow(lambda, k) * Math.exp( - lambda ) / Probability.factorial(k);
		// あふれないように調整しながら、地道に計算する。
		const inv_e = 1.0 / Math.E;
		let x = 1.0;
		let lambda_i = 0;
		for(let i = 1; i <= k; i++) {
			x = x * lambda / i;
			if(lambda_i < lambda) {
				x *= inv_e;
				lambda_i++;
			}
		}
		for(; lambda_i < lambda; lambda_i++) {
			x *= inv_e;
		}
		return x;
	}
	
	/**
	 * Cumulative distribution function (CDF) of Poisson distribution.
	 * @param {number} k
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poisscdf(k, lambda) {
		if(k < 0) {
			return 0;
		}
		return 1.0 - Probability.gammainc(lambda, Math.floor(k + 1));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of Poisson distribution.
	 * @param {number} p
	 * @param {number} lambda
	 * @returns {number}
	 */
	static poissinv(p, lambda) {
		if((p < 0.0) || (1.0 < p)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		// 初期値を決める
		let min = 1;
		let max = lambda * 20;
		let middle = 0, old_middle = 0; 
		// ニュートンラフソン法だと安定しないので
		// 挟み込み法（二分法）で求める
		for(let i = 0; i < 200; i++) {
			middle = Math.round((min + max) / 2);
			const P = Probability.poisscdf(middle, lambda);
			if(middle === old_middle) {
				break;
			}
			if(P > p) {
				max = middle;
			}
			else {
				min = middle;
			}
			old_middle = middle;
			// console.log(i + " " + min + " " + P + " " + max);
		}
		return middle;
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tpdf(t, v) {
		let y = 1.0 / (Math.sqrt(v) * Probability.beta(0.5, v * 0.5));
		y *= Math.pow( 1 + t * t / v, - (v + 1) * 0.5);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tcdf(t, v) {
		const y = (t * t) / (v + t * t) ;
		const p = Probability.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
		return 0.5 * (1 + p);
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {number} p - Probability.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tinv(p, v) {
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
			const y = Probability.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			const y = Probability.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
			return Math.sqrt(v / y - v);
		}
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @param {number} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {number}
	 */
	static tdist(t, v, tails) {
		return (1.0 - Probability.tcdf(Math.abs(t), v)) * tails;
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * @param {number} p - Probability.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tinv2(p, v) {
		return - Probability.tinv( p * 0.5, v);
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * @param {number} x 
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2pdf(x, k) {
		if(x < 0.0) {
			return 0;
		}
		else if(x === 0.0) {
			return 0.5;
		}
		let y = Math.pow(x, k / 2.0 - 1.0) * Math.exp( - x / 2.0 );
		y /= Math.pow(2, k / 2.0) * Probability.gamma( k / 2.0);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} x 
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2cdf(x, k) {
		return Probability.gammainc(x / 2.0, k / 2.0);
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} p - Probability.
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2inv(p, k) {
		return Probability.gaminv(p, k / 2.0, 2);
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * @param {number} x
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static fpdf(x, d1, d2) {
		if((d1 < 0) || (d2 < 0)) {
			return Number.NaN;
		}
		else if(x <= 0) {
			return 0.0;
		}
		let y = 1.0;
		y *= Math.pow( (d1 * x) / (d1 * x + d2) , d1 / 2.0);
		y *= Math.pow( 1.0 - ((d1 * x) / (d1 * x + d2)), d2 / 2.0);
		y /= x * Probability.beta(d1 / 2.0, d2 / 2.0);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * @param {number} x
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static fcdf(x, d1, d2) {
		return Probability.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * @param {number} p - Probability.
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static finv(p, d1, d2) {
		return (1.0 / Probability.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	}

}
