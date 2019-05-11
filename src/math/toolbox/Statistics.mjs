/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Complex from "../Math/Complex.mjs";
import Matrix from "../Math/Matrix.mjs";

/**
 * 実数専用の統計処理用の関数集
 */
class StatisticsTool {

	/**
	 * gammaln(x) 対数ガンマ関数 
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
	 * q_gamma(x, a, gammaln_a) 不完全ガンマ関数 上側
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
			return (1 - StatisticsTool.p_gamma(x, a, gammaln_a));
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
	 * p_gamma(x, a, gammaln_a) 不完全ガンマ関数 下側
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
			return (1.0 - StatisticsTool.q_gamma(x, a, gammaln_a));
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
	 * gamma(z) ガンマ関数
	 * @param {number} z
	 * @returns {number}
	 */
	static gamma(z) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		if(z < 0) {
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(StatisticsTool.gammaln(1.0 - z))));
		}
		return Math.exp(StatisticsTool.gammaln(z));
	}

	/**
	 * gammainc(x, a, tail) 不完全ガンマ関数
	 * @param {number} x
	 * @param {number} a
	 * @param {string} [tail="lower"] lower(デフォルト)/upper
	 * @returns {number}
	 */
	static gammainc(x, a, tail) {
		if(tail === "lower") {
			return StatisticsTool.p_gamma(x, a, StatisticsTool.gammaln(a));
		}
		else if(tail === "upper") {
			return StatisticsTool.q_gamma(x, a, StatisticsTool.gammaln(a));
		}
		else if(arguments.length === 2) {
			// 引数を省略した場合
			return StatisticsTool.gammainc(x, a, "lower");
		}
		else {
			throw "gammainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * gampdf(x, k, s) ガンマ分布の確率密度関数
	 * @param {number} x
	 * @param {number} k - 形状母数
	 * @param {number} s - 尺度母数
	 * @returns {number}
	 */
	static gampdf(x, k, s) {
		let y = 1.0 / (StatisticsTool.gamma(k) * Math.pow(s, k));
		y *= Math.pow( x, k - 1);
		y *= Math.exp( - x / s );
		return y;
	}

	/**
	 * gamcdf(x, k, s) ガンマ分布の累積分布関数
	 * @param {number} x
	 * @param {number} k - 形状母数
	 * @param {number} s - 尺度母数
	 * @returns {number}
	 */
	static gamcdf(x, k, s) {
		return StatisticsTool.gammainc(x / s, k);
	}
	
	/**
	 * gaminv(p, k, s) ガンマ分布の累積分布関数の逆関数
	 * @param {number} p
	 * @param {number} k - 形状母数
	 * @param {number} s - 尺度母数
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
			y2 = y - ((StatisticsTool.gamcdf(y, k, s) - p) / StatisticsTool.gampdf(y, k, s));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * beta(x, y) ベータ関数
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	static beta(x, y) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		return (Math.exp(StatisticsTool.gammaln(x) + StatisticsTool.gammaln(y) - StatisticsTool.gammaln(x + y)));
	}
	
	/**
	 * p_beta(x, a, b) 不完全ベータ関数 下側
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
			return (1.0 - StatisticsTool.p_beta(1.0 - x, b, a));
		}
		if(x <= 0.0) {
			return 0.0;
		}
		term = a * Math.log(x);
		term += b * Math.log(1.0 - x);
		term += StatisticsTool.gammaln(a + b);
		term -= StatisticsTool.gammaln(a) + StatisticsTool.gammaln(b);
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
	 * q_beta(x, a, b) 不完全ベータ関数 上側
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static q_beta(x, a, b) {
		return (1.0 - StatisticsTool.p_beta(x, a, b));
	}

	/**
	 * betainc(x, a, b, tail) 不完全ベータ関数
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @param {string} [tail="lower"] {string} lower(デフォルト)/upper
	 * @returns {number}
	 */
	static betainc(x, a, b, tail) {
		if(tail === "lower") {
			return StatisticsTool.p_beta(x, a, b);
		}
		else if(tail === "upper") {
			return StatisticsTool.q_beta(x, a, b);
		}
		else if(arguments.length === 3) {
			// 引数を省略した場合
			return StatisticsTool.betainc(x, a, b, "lower");
		}
		else {
			throw "betainc unsupported argument [" + tail + "]";
		}
	}
	
	/**
	 * betapdf(x, a, b) ベータ分布の確率密度関数
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betapdf(x, a, b) {
		//	return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / StatisticsTool.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / StatisticsTool.beta(a,  b));
	}

	/**
	 * betacdf(x, a, b) ベータ分布の累積分布関数
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betacdf(x, a, b) {
		return StatisticsTool.betainc(x, a, b);
	}
	
	/**
	 * betainv(p, a, b) ベータ分布の累積分布関数の逆関数
	 * @param {number} p
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betainv(p, a, b) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
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
			y2 = y - ((StatisticsTool.betacdf(y, a, b) - p) / StatisticsTool.betapdf(y, a, b));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * factorial(n) = n! 階乗関数
	 * @param {number} n
	 * @returns {number}
	 */
	static factorial(n) {
		const y = StatisticsTool.gamma(n + 1.0);
		if((n | 0) === n) {
			return Math.round(y);
		}
		else {
			return y;
		}
	}

	/**
	 * nchoosek(n, k) = nCk 二項係数またはすべての組合わせ
	 * @param {number} n
	 * @param {number} k
	 * @returns {number} nCk
	 */
	static nchoosek(n, k) {
		return (Math.round(StatisticsTool.factorial(n) / (StatisticsTool.factorial(n - k) * StatisticsTool.factorial(k))));
	}

	/**
	 * erf(x) 誤差関数
	 * @param {number} x
	 * @returns {number}
	 */
	static erf(x) {
		return (StatisticsTool.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	}

	/**
	 * erfc(x) 相補誤差関数
	 * @param {number} x
	 * @returns {number}
	 */
	static erfc(x) {
		return 1.0 - StatisticsTool.erf(x);
	}

	/**
	 * normpdf(x, u, s) 正規分布の確率密度関数
	 * @param {number} x
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
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
	 * normcdf(x, u, s) 正規分布の累積分布関数
	 * @param {number} x
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
	 * @returns {number}
	 */
	static normcdf(x, u, s) {
		const u_ = typeof u === "number" ? u : 0.0;
		const s_ = typeof s === "number" ? s : 1.0;
		return (1.0 + StatisticsTool.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
	}

	/**
	 * norminv(p, u, s) 正規分布の累積分布関数の逆関数
	 * @param {number} p - 確率
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
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
			y2 = y - ((StatisticsTool.normcdf(y, u_, s_) - p) / StatisticsTool.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	}

	/**
	 * tpdf(t, k) t分布の確率密度関数
	 * @param {number} t - t値
	 * @param {number} v - 自由度
	 * @returns {number}
	 */
	static tpdf(t, v) {
		let y = 1.0 / (Math.sqrt(v) * StatisticsTool.beta(0.5, v * 0.5));
		y *= Math.pow( 1 + t * t / v, - (v + 1) * 0.5);
		return y;
	}

	/**
	 * tcdf(t) t分布の累積分布関数
	 * @param {number} t - t値
	 * @param {number} v - 自由度
	 * @returns {number}
	 */
	static tcdf(t, v) {
		const y = (t * t) / (v + t * t) ;
		const p = StatisticsTool.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
		return 0.5 * (1 + p);
	}

	/**
	 * tinv(p, v) t分布の累積分布関数の逆関数
	 * @param {number} p - 確率
	 * @param {number} v - 自由度
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
			const y = StatisticsTool.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			const y = StatisticsTool.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
			return Math.sqrt(v / y - v);
		}
	}

	/**
	 * tdist(t, v, tails) 尾部が指定可能なt分布の累積分布関数
	 * @param {number} t - t値
	 * @param {number} v - 自由度
	 * @param {number} tails - 尾部(1...片側、2...両側)
	 * @returns {number}
	 */
	static tdist(t, v, tails) {
		return (1.0 - StatisticsTool.tcdf(t, v)) * tails;
	}

	/**
	 * einv2(p, v) 両側検定時のt分布の累積分布関数
	 * @param {number} p - 確率
	 * @param {number} v - 自由度
	 * @returns {number}
	 */
	static tinv2(p, v) {
		return - StatisticsTool.tinv( p * 0.5, v);
	}

	/**
	 * chi2pdf(x, v) カイ二乗分布の確率密度関数
	 * @param {number} x 
	 * @param {number} k - 自由度
	 * @returns {number}
	 */
	static chi2pdf(x, k) {
		if(x <= 0.0) {
			return 0;
		}
		let y = Math.pow(x, k / 2.0 - 1.0) * Math.exp( - x / 2.0 );
		y /= Math.pow(2, k / 2.0) * StatisticsTool.gamma( k / 2.0);
		return y;
	}

	/**
	 * chi2cdf(x, v) カイ二乗分布の累積分布関数
	 * @param {number} x 
	 * @param {number} k - 自由度
	 * @returns {number}
	 */
	static chi2cdf(x, k) {
		return StatisticsTool.gammainc(x / 2.0, k / 2.0);
	}

	/**
	 * chi2inv(p, v) カイ二乗分布の逆累積分布関数
	 * @param {number} p - 確率
	 * @param {number} k - 自由度
	 * @returns {number}
	 */
	static chi2inv(p, k) {
		return StatisticsTool.gaminv(p, k / 2.0, 2);
	}

	/**
	 * fpdf(x, d1, d2) F分布の確率密度関数
	 * @param {number} x
	 * @param {number} d1 - 分子の自由度
	 * @param {number} d2 - 分母の自由度
	 * @returns {number}
	 */
	static fpdf(x, d1, d2) {
		let y = 1.0;
		y *= Math.pow( (d1 * x) / (d1 * x + d2) , d1 / 2.0);
		y *= Math.pow( 1.0 - ((d1 * x) / (d1 * x + d2)), d2 / 2.0);
		y /= x * StatisticsTool.beta(d1 / 2.0, d2 / 2.0);
		return y;
	}

	/**
	 * fcdf(x, d1, d2) F分布の累積分布関数
	 * @param {number} x
	 * @param {number} d1 - 分子の自由度
	 * @param {number} d2 - 分母の自由度
	 * @returns {number}
	 */
	static fcdf(x, d1, d2) {
		return StatisticsTool.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	}

	/**
	 * finv(p, d1, d2) F分布の累積分布関数の逆関数
	 * @param {number} p - 確率
	 * @param {number} d1 - 分子の自由度
	 * @param {number} d2 - 分母の自由度
	 * @returns {number}
	 */
	static finv(p, d1, d2) {
		return (1.0 / StatisticsTool.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	}

}

/*
//test

// -0.12078223763524543
console.log(StatisticsTool.gammaln(1.5));
// 0.8862269254527578
console.log(StatisticsTool.gamma(1.5));
// 0.034141584125708564
console.log(StatisticsTool.gammainc(0.7, 3));
// 0.02265533286799037
console.log(StatisticsTool.gampdf(10, 7, 3));
// 0.054134113294645195
console.log(StatisticsTool.gamcdf(10, 7, 3));
// 24.333147920078357
console.log(StatisticsTool.gaminv(0.7, 7, 3));

// 1.570796326794883
console.log(StatisticsTool.beta(0.5, 1.5));
// 0.9824904585216
console.log(StatisticsTool.betainc(0.6, 5, 10));
// 0.3400783626239994
console.log(StatisticsTool.betapdf(0.6, 5, 10));
// 0.9824904585216
console.log(StatisticsTool.betacdf(0.6, 5, 10));
// 0.3573724870841673
console.log(StatisticsTool.betainv(0.6, 5, 10));

// 0.3286267594591274
console.log(StatisticsTool.erf(0.3));

//0.2896915527614828
console.log(StatisticsTool.normpdf(0.8));
// 0.7881446014166031
console.log(StatisticsTool.normcdf(0.8));
// 0.8416212335729142
console.log(StatisticsTool.norminv(0.8));
// 0.2713125051165461
console.log(StatisticsTool.tpdf(0.8, 7));
// 0.7749986502650896
console.log(StatisticsTool.tcdf(0.8, 7));
// 0.8960296443137515
console.log(StatisticsTool.tinv(0.8, 7));
// 0.05534766632274616
console.log(StatisticsTool.chi2pdf(2, 7));
// 0.04015963126989858
console.log(StatisStatisticsTooltics.chi2cdf(2, 7));
// 8.383430828608336
console.log(StatisticsTool.chi2inv(0.7, 7));
// 0.17142030504271438
console.log(StatisticsTool.fpdf(0.7, 0.6, 0.8));
// 0.5005807484277708
console.log(StatisticsTool.fcdf(0.7, 0.6, 0.8));
// 3.8856206694367055
console.log(StatisticsTool.finv(0.7, 0.6, 0.8));
*/

/**
 * 文字列か判定
 * @param text 
 */
const isStr = function(text) {
	return (text && (typeof text === "string" || text instanceof String));
};

/**
 * Complexクラスから利用する統計処理関数集
 * @ignore
 */
class StatisticsComplex {

	/**
	 * gammaln(x) 対数ガンマ関数
	 * @param {Complex} x
	 * @returns {Complex}
	 */
	static gammaln(x) {
		return new Complex(StatisticsTool.gammaln(Complex._toFloat(x)));
	}
	
	/**
	 * gamma(z) ガンマ関数 
	 * @param {Complex} z
	 * @returns {Complex}
	 */
	static gamma(z) {
		return new Complex(StatisticsTool.gamma(Complex._toFloat(z)));
	}
	
	/**
	 * gammainc(x, a, tail) 不完全ガンマ関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Complex}
	 */
	static gammainc(x, a, tail) {
		const x_ = Complex._toFloat(x);
		const a_ = Complex._toFloat(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.gammainc(x_, a_, tail_));
	}

	/**
	 * gampdf(x, k, s) ガンマ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gampdf(x, k, s) {
		const x_ = Complex._toFloat(x);
		const k_ = Complex._toFloat(k);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.gampdf(x_, k_, s_));
	}

	/**
	 * gamcdf(x, k, s) ガンマ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gamcdf(x, k, s) {
		const x_ = Complex._toFloat(x);
		const k_ = Complex._toFloat(k);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.gamcdf(x_, k_, s_));
	}

	/**
	 * gaminv(p, k, s) ガンマ分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gaminv(p, k, s) {
		const p_ = Complex._toFloat(p);
		const k_ = Complex._toFloat(k);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.gaminv(p_, k_, s_));
	}

	/**
	 * beta(x, y) ベータ関数
	 * @param {Complex} x
	 * @param {Complex} y
	 * @returns {Complex}
	 */
	static beta(x, y) {
		const x_ = Complex._toFloat(x);
		const y_ = Complex._toFloat(y);
		return new Complex(StatisticsTool.beta(x_, y_));
	}

	/**
	 * betainc(x, a, b, tail) 不完全ベータ関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {Complex} b
	 * @param {string} [tail="lower"] lower/upper
	 * @returns {Complex}
	 */
	static betainc(x, a, b, tail) {
		const x_ = Complex._toFloat(x);
		const a_ = Complex._toFloat(a);
		const b_ = Complex._toFloat(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.betainc(x_, a_, b_, tail_));
	}

	/**
	 * betapdf(x, a, b) ベータ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betapdf(x, a, b) {
		const x_ = Complex._toFloat(x);
		const a_ = Complex._toFloat(a);
		const b_ = Complex._toFloat(b);
		return new Complex(StatisticsTool.betapdf(x_, a_, b_));
	}

	/**
	 * betacdf(x, a, b) ベータ分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betacdf(x, a, b) {
		const x_ = Complex._toFloat(x);
		const a_ = Complex._toFloat(a);
		const b_ = Complex._toFloat(b);
		return new Complex(StatisticsTool.betacdf(x_, a_, b_));
	}

	/**
	 * betainv(p, a, b) ベータ分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betainv(p, a, b) {
		const p_ = Complex._toFloat(p);
		const a_ = Complex._toFloat(a);
		const b_ = Complex._toFloat(b);
		return new Complex(StatisticsTool.betainv(p_, a_, b_));
	}

	/**
	 * factorial(n), n! 階乗関数
	 * @param {Complex} n
	 * @returns {Complex}
	 */
	static factorial(n) {
		return new Complex(StatisticsTool.factorial(Complex._toFloat(n)));
	}

	/**
	 * nchoosek(n, k), nCk 二項係数またはすべての組合わせ
	 * @param {Complex} n
	 * @param {Complex} k
	 * @returns {Complex}
	 */
	static nchoosek(n, k) {
		const n_ = Complex._toFloat(n);
		const k_ = Complex._toFloat(k);
		return new Complex(StatisticsTool.nchoosek(n_, k_));
	}
	
	/**
	 * erf(x) 誤差関数
	 * @param {Complex} x
	 * @returns {Complex}
	 */
	static erf(x) {
		const x_ = Complex._toFloat(x);
		return new Complex(StatisticsTool.erf(x_));
	}

	/**
	 * erfc(x) 相補誤差関数
	 * @param {Complex} x
	 * @returns {Complex}
	 */
	static erfc(x) {
		const x_ = Complex._toFloat(x);
		return new Complex(StatisticsTool.erfc(x_));
	}

	/**
	 * normpdf(x, u, s) 正規分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static normpdf(x, u=0.0, s=1.0) {
		const x_ = Complex._toFloat(x);
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.normpdf(x_, u_, s_));
	}

	/**
	 * normcdf(x, u, s) 正規分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static normcdf(x, u=0.0, s=1.0) {
		const x_ = Complex._toFloat(x);
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.normcdf(x_, u_, s_));
	}

	/**
	 * norminv(x, u, s) 正規分布の累積分布関数の逆関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static norminv(x, u=0.0, s=1.0) {
		const x_ = Complex._toFloat(x);
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return new Complex(StatisticsTool.norminv(x_, u_, s_));
	}

	/**
	 * tcdf(t, v) t分布の累積分布関数
	 * @param {Complex} t
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tcdf(t, v) {
		const t_ = Complex._toFloat(t);
		const v_ = Complex._toFloat(v);
		return new Complex(StatisticsTool.tcdf(t_, v_));
	}

	/**
	 * tinv(p, v) t分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tinv(p, v) {
		const p_ = Complex._toFloat(p);
		const v_ = Complex._toFloat(v);
		return new Complex(StatisticsTool.tinv(p_, v_));
	}

	/**
	 * tdist(t, v, tails) 尾部が指定可能なt分布の累積分布関数
	 * @param {Complex} t
	 * @param {Complex} v - 自由度
	 * @param {Complex} tails - 尾部(1...片側、2...両側)
	 * @returns {Complex}
	 */
	static tdist(t, v, tails) {
		const t_ = Complex._toFloat(t);
		const v_ = Complex._toFloat(v);
		const tails_ = Complex._toInteger(tails);
		return new Complex(StatisticsTool.tdist(t_, v_, tails_));
	}

	/**
	 * tinv2(p, v) 両側検定時のt分布の累積分布関数
	 * @param {Complex} p
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tinv2(p, v) {
		const p_ = Complex._toFloat(p);
		const v_ = Complex._toFloat(v);
		return new Complex(StatisticsTool.tinv2(p_, v_));
	}

	/**
	 * chi2pdf(x, k) カイ二乗分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2pdf(x, k) {
		const x_ = Complex._toFloat(x);
		const k_ = Complex._toFloat(k);
		return new Complex(StatisticsTool.chi2pdf(x_, k_));
	}

	/**
	 * chi2cdf(x, k) カイ二乗分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2cdf(x, k) {
		const x_ = Complex._toFloat(x);
		const k_ = Complex._toFloat(k);
		return new Complex(StatisticsTool.chi2cdf(x_, k_));
	}

	/**
	 * chi2inv(p, k) カイ二乗分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2inv(p, k) {
		const p_ = Complex._toFloat(p);
		const k_ = Complex._toFloat(k);
		return new Complex(StatisticsTool.chi2inv(p_, k_));
	}

	/**
	 * fpdf(x, d1, d2) F分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} d1 - 分子の自由度
	 * @param {Complex} d2 - 分母の自由度
	 * @returns {Complex}
	 */
	static fpdf(x, d1, d2) {
		const x_ = Complex._toFloat(x);
		const d1_ = Complex._toFloat(d1);
		const d2_ = Complex._toFloat(d2);
		return new Complex(StatisticsTool.fpdf(x_, d1_, d2_));
	}

	/**
	 * fcdf(x, d1, d2) F分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} d1 - 分子の自由度
	 * @param {Complex} d2 - 分母の自由度
	 * @returns {Complex}
	 */
	static fcdf(x, d1, d2) {
		const x_ = Complex._toFloat(x);
		const d1_ = Complex._toFloat(d1);
		const d2_ = Complex._toFloat(d2);
		return new Complex(StatisticsTool.fcdf(x_, d1_, d2_));
	}

	/**
	 * finv(p, d1, d2) F分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} d1 - 分子の自由度
	 * @param {Complex} d2 - 分母の自由度
	 * @returns {Complex}
	 */
	static finv(p, d1, d2) {
		const p_ = Complex._toFloat(p);
		const d1_ = Complex._toFloat(d1);
		const d2_ = Complex._toFloat(d2);
		return new Complex(StatisticsTool.finv(p_, d1_, d2_));
	}

}

/**
 * Matrix用の統計処理用の計算クラス
 */
export default class Statistics {

	/**
	 * 対数ガンマ関数
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static gammaln(mat) {
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammaln(num);
		});
	}

	/**
	 * ガンマ関数
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static gamma(mat) {
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamma(num);
		});
	}

	/**
	 * 不完全ガンマ関数
	 * @param {Matrix} mat
	 * @param {Matrix} a
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	static gammainc(mat, a, tail) {
		const a_ = Matrix._toFloat(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammainc(num, a_, tail_);
		});
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 形状母数
	 * @param {Matrix} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gampdf(mat, k, s) {
		const k_ = Matrix._toFloat(k);
		const s_ = Matrix._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gampdf(num, k_, s_);
		});
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 形状母数
	 * @param {Matrix} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gamcdf(mat, k, s) {
		const k_ = Matrix._toFloat(k);
		const s_ = Matrix._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamcdf(num, k_, s_);
		});
	}

	/**
	 * ガンマ分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 形状母数
	 * @param {Matrix} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gaminv(mat, k, s) {
		const k_ = Matrix._toFloat(k);
		const s_ = Matrix._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gaminv(num, k_, s_);
		});
	}

	/**
	 * ベータ関数
	 * @param {Matrix} mat
	 * @param {Matrix} y
	 * @returns {Matrix}
	 */
	static beta(mat, y) {
		const y_ = Matrix._toFloat(y);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.beta(num, y_);
		});
	}
	
	/**
	 * 不完全ベータ関数
	 * @param {Matrix} mat
	 * @param {Matrix} a
	 * @param {Matrix} b
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	static betainc(mat, a, b, tail) {
		const a_ = Matrix._toFloat(a);
		const b_ = Matrix._toFloat(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainc(num, a_, b_, tail_);
		});
	}

	/**
	 * ベータ分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} a
	 * @param {Matrix} b
	 * @returns {Matrix}
	 */
	static betacdf(mat, a, b) {
		const a_ = Matrix._toFloat(a);
		const b_ = Matrix._toFloat(b);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betacdf(num, a_, b_);
		});
	}

	/**
	 * ベータ分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} a
	 * @param {Matrix} b
	 * @returns {Matrix}
	 */
	static betapdf(mat, a, b) {
		const a_ = Matrix._toFloat(a);
		const b_ = Matrix._toFloat(b);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betapdf(num, a_, b_);
		});
	}

	/**
	 * ベータ分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {Matrix} a
	 * @param {Matrix} b
	 * @returns {Matrix}
	 */
	static betainv(mat, a, b) {
		const a_ = Matrix._toFloat(a);
		const b_ = Matrix._toFloat(b);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainv(num, a_, b_);
		});
	}

	/**
	 * x! 階乗関数
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static factorial(mat) {
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.factorial(num);
		});
	}
	
	/**
	 * nCk 二項係数またはすべての組合わせ
	 * @param {Matrix} mat
	 * @param {Matrix} k
	 * @returns {Matrix}
	 */
	static nchoosek(mat, k) {
		const k_ = Matrix._toFloat(k);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.nchoosek(num, k_);
		});
	}
	
	/**
	 * 誤差関数
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static erf(mat) {
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erf(num);
		});
	}

	/**
	 * 相補誤差関数
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static erfc(mat) {
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erfc(num);
		});
	}
	
	/**
	 * 正規分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static normpdf(mat, u=0.0, s=1.0) {
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normpdf(num, u_, s_);
		});
	}

	/**
	 * 正規分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static normcdf(mat, u=0.0, s=1.0) {
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normcdf(num, u_, s_);
		});
	}

	/**
	 * 正規分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {number} [u=0.0] - 平均値
	 * @param {number} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static norminv(mat, u=0.0, s=1.0) {
		const u_ = Complex._toFloat(u);
		const s_ = Complex._toFloat(s);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.norminv(num, u_, s_);
		});
	}

	/**
	 * t分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} v - 自由度
	 * @returns {Matrix}
	 */
	static tpdf(mat, v) {
		const v_ = Matrix._toFloat(v);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tpdf(num, v_);
		});
	}

	/**
	 * t分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} v - 自由度
	 * @returns {Matrix}
	 */
	static tcdf(mat, v) {
		const v_ = Matrix._toFloat(v);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tcdf(num, v_);
		});
	}

	/**
	 * t分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {Matrix} v - 自由度
	 * @returns {Matrix}
	 */
	static tinv(mat, v) {
		const v_ = Matrix._toFloat(v);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv(num, v_);
		});
	}

	/**
	 * 尾部が指定可能なt分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} v - 自由度
	 * @param {Matrix} tails - 尾部(1...片側、2...両側)
	 * @returns {Matrix}
	 */
	static tdist(mat, v, tails) {
		const v_ = Matrix._toFloat(v);
		const tails_ = Matrix._toFloat(tails);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tdist(num, v_, tails_);
		});
	}

	/**
	 * 両側検定時のt分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} v - 自由度
	 * @returns {Matrix}
	 */
	static tinv2(mat, v) {
		const v_ = Matrix._toFloat(v);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv2(num, v_);
		});
	}

	/**
	 * カイ二乗分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2pdf(mat, k) {
		const k_ = Matrix._toFloat(k);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2pdf(num, k_);
		});
	}

	/**
	 * カイ二乗分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2cdf(mat, k) {
		const k_ = Matrix._toFloat(k);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2cdf(num, k_);
		});
	}
	
	/**
	 * カイ二乗分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {Matrix} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2inv(mat, k) {
		const k_ = Matrix._toFloat(k);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2inv(num, k_);
		});
	}

	/**
	 * F分布の確率密度関数
	 * @param {Matrix} mat
	 * @param {Matrix} d1 - 分子の自由度
	 * @param {Matrix} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static fpdf(mat, d1, d2) {
		const d1_ = Matrix._toFloat(d1);
		const d2_ = Matrix._toFloat(d2);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fpdf(num, d1_, d2_);
		});
	}

	/**
	 * F分布の累積分布関数
	 * @param {Matrix} mat
	 * @param {Matrix} d1 - 分子の自由度
	 * @param {Matrix} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static fcdf(mat, d1, d2) {
		const d1_ = Matrix._toFloat(d1);
		const d2_ = Matrix._toFloat(d2);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fcdf(num, d1_, d2_);
		});
	}

	/**
	 * F分布の累積分布関数の逆関数
	 * @param {Matrix} mat
	 * @param {Matrix} d1 - 分子の自由度
	 * @param {Matrix} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static finv(mat, d1, d2) {
		const d1_ = Matrix._toFloat(d1);
		const d2_ = Matrix._toFloat(d2);
		return mat.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.finv(num, d1_, d2_);
		});
	}
	
	/**
	 * 合計
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static sum(mat) {
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
		return mat.__column_oriented_1_dimensional_processing(main);
	}

	/**
	 * 相加平均
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static mean(mat) {
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
		return mat.__column_oriented_1_dimensional_processing(main);
	}

	/**
	 * 相乗平均／幾何平均
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static geomean(mat) {
		const main = function(data) {
			let x = Complex.ONE;
			for(let i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x.sqrt()];
		};
		return mat.__column_oriented_1_dimensional_processing(main);
	}

	/**
	 * 分散
	 * @param {Matrix} mat
	 * @param {number} [cor=0] - 補正値 0(不偏分散), 1(標本分散)
	 * @returns {Matrix}
	 */
	static var(mat, cor) {
		const M = mat.mean();
		let col = 0;
		const correction = arguments.length === 0 ? 0 : Matrix._toFloat(cor);
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
				const a = data[i].sub(mean);
				x = x.add(a.dot(a));
			}
			if(data.length === 1) {
				return [x.div(data.length)];
			}
			else {
				return [x.div(data.length - 1 + correction)];
			}
		};
		return mat.__column_oriented_1_dimensional_processing(main);
	}

	/**
	 * 標準偏差
	 * @param {Matrix} mat
	 * @param {number} [cor=0] - 補正値 0(不偏), 1(標本)
	 * @returns {Matrix}
	 */
	static std(mat, cor) {
		const correction = arguments.length === 0 ? 0 : Matrix._toFloat(cor);
		const M = mat.var(correction);
		M._each(function(num) {
			return num.sqrt();
		});
		return M;
	}

	/**
	 * 共分散行列
	 * @param {Matrix} mat
	 * @param {number} [cor=0] - 補正値 0(不偏分散), 1(標本分散)
	 * @returns {Matrix}
	 */
	static cov(mat, cor) {
		let correction = arguments.length === 0 ? 0 : Matrix._toFloat(cor);
		if(mat.isVector()) {
			return mat.var(correction);
		}
		correction = mat.row_length === 1 ? 1 : correction;
		const x = mat.matrix_array;
		const mean = mat.mean().matrix_array[0];
		// 上三角行列、対角行列
		const y = new Array(mat.column_length);
		for(let a = 0; a < mat.column_length; a++) {
			const a_mean = mean[a];
			y[a] = new Array(mat.column_length);
			for(let b = a; b < mat.column_length; b++) {
				const b_mean = mean[b];
				let sum = Complex.ZERO;
				for(let row = 0; row < mat.row_length; row++) {
					sum = sum.add((x[row][a].sub(a_mean)).dot(x[row][b].sub(b_mean)));
				}
				y[a][b] = sum.div(mat.row_length - 1 + correction);
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

	/**
	 * 標本の標準化
	 * 平均値0、標準偏差1に変更する
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static normalize(mat) {
		const mean_zero = mat.sub(mat.mean());
		const std_one = mean_zero.ndiv(mean_zero.std());
		return std_one;
	}

	/**
	 * 相関行列
	 * @param {Matrix} mat
	 * @returns {Matrix}
	 */
	static corrcoef(mat) {
		return mat.normalize().cov();
	}


}