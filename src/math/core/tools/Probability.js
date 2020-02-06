/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Complex from "../Complex.js";
import Matrix from "../Matrix.js";

/**
 * Collection for calculating probability using real numbers.
 * @ignore
 */
class ProbabilityTool {

	/**
	 * Log-gamma function.
	 * @param {number} x
	 * @returns {number}
	 */
	static gammaln(x) {
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
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, w, temp, previous;
		// Laguerreの多項式
		let la = 1.0, lb = 1.0 + x - a;
		if(x < 1.0 + a) {
			return (1 - ProbabilityTool.p_gamma(x, a, gammaln_a));
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
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		let k;
		let result, term, previous;
		if(x >= 1.0 + a) {
			return (1.0 - ProbabilityTool.q_gamma(x, a, gammaln_a));
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
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(ProbabilityTool.gammaln(1.0 - z))));
		}
		return Math.exp(ProbabilityTool.gammaln(z));
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
			return ProbabilityTool.p_gamma(x, a, ProbabilityTool.gammaln(a));
		}
		else if(tail === "upper") {
			return ProbabilityTool.q_gamma(x, a, ProbabilityTool.gammaln(a));
		}
		else if(arguments.length === 2) {
			// 引数を省略した場合
			return ProbabilityTool.gammainc(x, a, "lower");
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
		let y = 1.0 / (ProbabilityTool.gamma(k) * Math.pow(s, k));
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
		return ProbabilityTool.gammainc(x / s, k);
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
			y2 = y - ((ProbabilityTool.gamcdf(y, k, s) - p) / ProbabilityTool.gampdf(y, k, s));
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
		return (Math.exp(ProbabilityTool.gammaln(x) + ProbabilityTool.gammaln(y) - ProbabilityTool.gammaln(x + y)));
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
			return (1.0 - ProbabilityTool.p_beta(1.0 - x, b, a));
		}
		if(x <= 0.0) {
			return 0.0;
		}
		term = a * Math.log(x);
		term += b * Math.log(1.0 - x);
		term += ProbabilityTool.gammaln(a + b);
		term -= ProbabilityTool.gammaln(a) + ProbabilityTool.gammaln(b);
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
		return (1.0 - ProbabilityTool.p_beta(x, a, b));
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
			return ProbabilityTool.p_beta(x, a, b);
		}
		else if(tail === "upper") {
			return ProbabilityTool.q_beta(x, a, b);
		}
		else if(arguments.length === 3) {
			// 引数を省略した場合
			return ProbabilityTool.betainc(x, a, b, "lower");
		}
		else {
			throw "betainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * Return true if the value is integer.
	 * @param {number} x
	 * @returns {boolean}
	 */
	static isInteger(x) {
		return (x - Math.trunc(x) !== 0.0);
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
			((x < 0) && (ProbabilityTool.isInteger(b - 1))) ||
			((1 - x < 0) && (ProbabilityTool.isInteger(b - 1)))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / ProbabilityTool.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / ProbabilityTool.beta(a,  b));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betacdf(x, a, b) {
		return ProbabilityTool.betainc(x, a, b);
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
			y2 = y - ((ProbabilityTool.betacdf(y, a, b) - p) / ProbabilityTool.betapdf(y, a, b));
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
		const y = ProbabilityTool.gamma(n + 1.0);
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
		return (Math.round(ProbabilityTool.factorial(n) / (ProbabilityTool.factorial(n - k) * ProbabilityTool.factorial(k))));
	}

	/**
	 * Error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erf(x) {
		return (ProbabilityTool.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	}

	/**
	 * Complementary error function.
	 * @param {number} x
	 * @returns {number}
	 */
	static erfc(x) {
		return 1.0 - ProbabilityTool.erf(x);
	}

	/**
	 * Inverse function of Error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfinv(p) {
		return ProbabilityTool.erfcinv(1.0 - p);
	}

	/**
	 * Inverse function of Complementary error function.
	 * @param {number} p
	 * @returns {number}
	 */
	static erfcinv(p) {
		return - ProbabilityTool.norminv(p * 0.5) / Math.sqrt(2);
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
		return (1.0 + ProbabilityTool.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
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
			y2 = y - ((ProbabilityTool.normcdf(y, u_, s_) - p) / ProbabilityTool.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * @param {number} t - T-value.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tpdf(t, v) {
		let y = 1.0 / (Math.sqrt(v) * ProbabilityTool.beta(0.5, v * 0.5));
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
		const p = ProbabilityTool.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
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
			const y = ProbabilityTool.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			const y = ProbabilityTool.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
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
		return (1.0 - ProbabilityTool.tcdf(Math.abs(t), v)) * tails;
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * @param {number} p - Probability.
	 * @param {number} v - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static tinv2(p, v) {
		return - ProbabilityTool.tinv( p * 0.5, v);
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
		y /= Math.pow(2, k / 2.0) * ProbabilityTool.gamma( k / 2.0);
		return y;
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} x 
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2cdf(x, k) {
		return ProbabilityTool.gammainc(x / 2.0, k / 2.0);
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * @param {number} p - Probability.
	 * @param {number} k - The degrees of freedom. (DF)
	 * @returns {number}
	 */
	static chi2inv(p, k) {
		return ProbabilityTool.gaminv(p, k / 2.0, 2);
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
		y /= x * ProbabilityTool.beta(d1 / 2.0, d2 / 2.0);
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
		return ProbabilityTool.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * @param {number} p - Probability.
	 * @param {number} d1 - The degree of freedom of the molecules.
	 * @param {number} d2 - The degree of freedom of the denominator
	 * @returns {number}
	 */
	static finv(p, d1, d2) {
		return (1.0 / ProbabilityTool.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	}

}

/**
 * typeof this === string
 * @param text {any}
 * @ignore
 */
const isStr = function(text) {
	return (text && (typeof text === "string" || text instanceof String));
};

/**
 * Collection for calculating probability used from the Complex class.
 * @ignore
 */
class ProbabilityComplex {

	/**
	 * Log-gamma function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @returns {Complex}
	 */
	static gammaln(x) {
		return new Complex(ProbabilityTool.gammaln(Complex._toDouble(x)));
	}
	
	/**
	 * Gamma function.
	 * @param {import("../Complex.js").KComplexInputData} z
	 * @returns {Complex}
	 */
	static gamma(z) {
		return new Complex(ProbabilityTool.gamma(Complex._toDouble(z)));
	}
	
	/**
	 * Incomplete gamma function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	static gammainc(x, a, tail) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(ProbabilityTool.gammainc(X, a_, tail_));
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} k - Shape parameter.
	 * @param {import("../Complex.js").KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	static gampdf(x, k, s) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gampdf(X, k_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} k - Shape parameter.
	 * @param {import("../Complex.js").KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	static gamcdf(x, k, s) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gamcdf(X, k_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} k - Shape parameter.
	 * @param {import("../Complex.js").KComplexInputData} s - Scale parameter.
	 * @returns {Complex}
	 */
	static gaminv(p, k, s) {
		const p_ = Complex._toDouble(p);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gaminv(p_, k_, s_));
	}

	/**
	 * Beta function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} y
	 * @returns {Complex}
	 */
	static beta(x, y) {
		const X = Complex._toDouble(x);
		const y_ = Complex._toDouble(y);
		return new Complex(ProbabilityTool.beta(X, y_));
	}

	/**
	 * Incomplete beta function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} a
	 * @param {import("../Complex.js").KComplexInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Complex}
	 */
	static betainc(x, a, b, tail) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(ProbabilityTool.betainc(X, a_, b_, tail_));
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} a
	 * @param {import("../Complex.js").KComplexInputData} b
	 * @returns {Complex}
	 */
	static betapdf(x, a, b) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betapdf(X, a_, b_));
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} a
	 * @param {import("../Complex.js").KComplexInputData} b
	 * @returns {Complex}
	 */
	static betacdf(x, a, b) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betacdf(X, a_, b_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} a
	 * @param {import("../Complex.js").KComplexInputData} b
	 * @returns {Complex}
	 */
	static betainv(p, a, b) {
		const p_ = Complex._toDouble(p);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betainv(p_, a_, b_));
	}

	/**
	 * Factorial function, x!.
	 * @param {import("../Complex.js").KComplexInputData} n
	 * @returns {Complex}
	 */
	static factorial(n) {
		return new Complex(ProbabilityTool.factorial(Complex._toDouble(n)));
	}

	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * @param {import("../Complex.js").KComplexInputData} n
	 * @param {import("../Complex.js").KComplexInputData} k
	 * @returns {Complex}
	 */
	static nchoosek(n, k) {
		const n_ = Complex._toDouble(n);
		const k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.nchoosek(n_, k_));
	}
	
	/**
	 * Error function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @returns {Complex}
	 */
	static erf(x) {
		const X = Complex._toDouble(x);
		return new Complex(ProbabilityTool.erf(X));
	}

	/**
	 * Complementary error function.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @returns {Complex}
	 */
	static erfc(x) {
		const X = Complex._toDouble(x);
		return new Complex(ProbabilityTool.erfc(X));
	}

	/**
	 * Inverse function of Error function.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @returns {Complex}
	 */
	static erfinv(p) {
		const P = Complex._toDouble(p);
		return new Complex(ProbabilityTool.erfinv(P));
	}

	/**
	 * Inverse function of Complementary error function.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @returns {Complex}
	 */
	static erfcinv(p) {
		const P = Complex._toDouble(p);
		return new Complex(ProbabilityTool.erfcinv(P));
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} [u=0.0] - Average value.
	 * @param {import("../Complex.js").KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	static normpdf(x, u, s) {
		const X = Complex._toDouble(x);
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.normpdf(X, u_, s_));
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} [u=0.0] - Average value.
	 * @param {import("../Complex.js").KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	static normcdf(x, u, s) {
		const X = Complex._toDouble(x);
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.normcdf(X, u_, s_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} [u=0.0] - Average value.
	 * @param {import("../Complex.js").KComplexInputData} [s=1.0] - Variance value.
	 * @returns {Complex}
	 */
	static norminv(x, u, s) {
		const X = Complex._toDouble(x);
		const u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.norminv(X, u_, s_));
	}
	
	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static tpdf(x, v) {
		const X = Complex._toDouble(x);
		const v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tpdf(X, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {import("../Complex.js").KComplexInputData} t
	 * @param {import("../Complex.js").KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static tcdf(t, v) {
		const t_ = Complex._toDouble(t);
		const v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tcdf(t_, v_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static tinv(p, v) {
		const p_ = Complex._toDouble(p);
		const v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tinv(p_, v_));
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * @param {import("../Complex.js").KComplexInputData} t
	 * @param {import("../Complex.js").KComplexInputData} v - The degrees of freedom. (DF)
	 * @param {import("../Complex.js").KComplexInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Complex}
	 */
	static tdist(t, v, tails) {
		const t_ = Complex._toDouble(t);
		const v_ = Complex._toDouble(v);
		const tails_ = Complex._toInteger(tails);
		return new Complex(ProbabilityTool.tdist(t_, v_, tails_));
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} v - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static tinv2(p, v) {
		const p_ = Complex._toDouble(p);
		const v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tinv2(p_, v_));
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static chi2pdf(x, k) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2pdf(X, k_));
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static chi2cdf(x, k) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2cdf(X, k_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} k - The degrees of freedom. (DF)
	 * @returns {Complex}
	 */
	static chi2inv(p, k) {
		const p_ = Complex._toDouble(p);
		const k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2inv(p_, k_));
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Complex.js").KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	static fpdf(x, d1, d2) {
		const X = Complex._toDouble(x);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.fpdf(X, d1_, d2_));
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * @param {import("../Complex.js").KComplexInputData} x
	 * @param {import("../Complex.js").KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Complex.js").KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	static fcdf(x, d1, d2) {
		const X = Complex._toDouble(x);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.fcdf(X, d1_, d2_));
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * @param {import("../Complex.js").KComplexInputData} p
	 * @param {import("../Complex.js").KComplexInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Complex.js").KComplexInputData} d2 - The degree of freedom of the denominator
	 * @returns {Complex}
	 */
	static finv(p, d1, d2) {
		const p_ = Complex._toDouble(p);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.finv(p_, d1_, d2_));
	}

}

/**
 * Calculating probability class for `Matrix` class.
 * - These methods can be used in the `Matrix` method chain.
 * - This class cannot be called directly.
 */
export default class Probability {

	/**
	 * Log-gamma function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static gammaln(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gammaln(num);
		});
	}

	/**
	 * Gamma function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static gamma(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gamma(num);
		});
	}

	/**
	 * Incomplete gamma function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} a
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	static gammainc(x, a, tail) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gammainc(num, a_, tail_);
		});
	}

	/**
	 * Probability density function (PDF) of the gamma distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - Shape parameter.
	 * @param {import("../Matrix.js").KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	static gampdf(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gampdf(num, k_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of gamma distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - Shape parameter.
	 * @param {import("../Matrix.js").KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	static gamcdf(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gamcdf(num, k_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - Shape parameter.
	 * @param {import("../Matrix.js").KMatrixInputData} s - Scale parameter.
	 * @returns {Matrix}
	 */
	static gaminv(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gaminv(num, k_, s_);
		});
	}

	/**
	 * Beta function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} y
	 * @returns {Matrix}
	 */
	static beta(x, y) {
		const X = Matrix._toMatrix(x);
		const y_ = Matrix._toDouble(y);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.beta(num, y_);
		});
	}
	
	/**
	 * Incomplete beta function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} a
	 * @param {import("../Matrix.js").KMatrixInputData} b
	 * @param {string} [tail="lower"] - lower (default) , "upper"
	 * @returns {Matrix}
	 */
	static betainc(x, a, b, tail) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betainc(num, a_, b_, tail_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of beta distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} a
	 * @param {import("../Matrix.js").KMatrixInputData} b
	 * @returns {Matrix}
	 */
	static betacdf(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betacdf(num, a_, b_);
		});
	}

	/**
	 * Probability density function (PDF) of beta distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} a
	 * @param {import("../Matrix.js").KMatrixInputData} b
	 * @returns {Matrix}
	 */
	static betapdf(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betapdf(num, a_, b_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of beta distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} a
	 * @param {import("../Matrix.js").KMatrixInputData} b
	 * @returns {Matrix}
	 */
	static betainv(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betainv(num, a_, b_);
		});
	}

	/**
	 * Factorial function, x!.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static factorial(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.factorial(num);
		});
	}
	
	/**
	 * Binomial coefficient, number of all combinations, nCk.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k
	 * @returns {Matrix}
	 */
	static nchoosek(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.nchoosek(num, k_);
		});
	}
	
	/**
	 * Error function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static erf(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erf(num);
		});
	}

	/**
	 * Complementary error function.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @returns {Matrix}
	 */
	static erfc(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erfc(num);
		});
	}
	
	/**
	 * Inverse function of Error function.
	 * @param {import("../Matrix.js").KMatrixInputData} p
	 * @returns {Matrix}
	 */
	static erfinv(p) {
		const P = Matrix._toMatrix(p);
		return P.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erfinv(num);
		});
	}
	
	/**
	 * Inverse function of Complementary error function.
	 * @param {import("../Matrix.js").KMatrixInputData} p
	 * @returns {Matrix}
	 */
	static erfcinv(p) {
		const P = Matrix._toMatrix(p);
		return P.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erfcinv(num);
		});
	}

	/**
	 * Probability density function (PDF) of normal distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} [u=0.0] - Average value.
	 * @param {import("../Matrix.js").KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	static normpdf(x, u, s) {
		const X = Matrix._toMatrix(x);
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.normpdf(num, u_, s_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of normal distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} [u=0.0] - Average value.
	 * @param {import("../Matrix.js").KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	static normcdf(x, u, s) {
		const X = Matrix._toMatrix(x);
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.normcdf(num, u_, s_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of normal distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} [u=0.0] - Average value.
	 * @param {import("../Matrix.js").KMatrixInputData} [s=1.0] - Variance value.
	 * @returns {Matrix}
	 */
	static norminv(x, u, s) {
		const X = Matrix._toMatrix(x);
		const u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		const s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.norminv(num, u_, s_);
		});
	}

	/**
	 * Probability density function (PDF) of Student's t-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static tpdf(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tpdf(num, v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static tcdf(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tcdf(num, v_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static tinv(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tinv(num, v_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} v - The degrees of freedom. (DF)
	 * @param {import("../Matrix.js").KMatrixInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
	 * @returns {Matrix}
	 */
	static tdist(x, v, tails) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		const tails_ = Matrix._toDouble(tails);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tdist(num, v_, tails_);
		});
	}

	/**
	 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} v - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static tinv2(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tinv2(num, v_);
		});
	}

	/**
	 * Probability density function (PDF) of chi-square distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static chi2pdf(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2pdf(num, k_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of chi-square distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static chi2cdf(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2cdf(num, k_);
		});
	}
	
	/**
	 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} k - The degrees of freedom. (DF)
	 * @returns {Matrix}
	 */
	static chi2inv(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2inv(num, k_);
		});
	}

	/**
	 * Probability density function (PDF) of F-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Matrix.js").KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	static fpdf(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.fpdf(num, d1_, d2_);
		});
	}

	/**
	 * Cumulative distribution function (CDF) of F-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Matrix.js").KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	static fcdf(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.fcdf(num, d1_, d2_);
		});
	}

	/**
	 * Inverse function of cumulative distribution function (CDF) of F-distribution.
	 * @param {import("../Matrix.js").KMatrixInputData} x
	 * @param {import("../Matrix.js").KMatrixInputData} d1 - The degree of freedom of the molecules.
	 * @param {import("../Matrix.js").KMatrixInputData} d2 - The degree of freedom of the denominator
	 * @returns {Matrix}
	 */
	static finv(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.finv(num, d1_, d2_);
		});
	}
	
}
