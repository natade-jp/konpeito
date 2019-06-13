﻿/**
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
import Complex from "../Complex.mjs";

// @ts-ignore
import Matrix from "../Matrix.mjs";

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
			if(y < 0.0) {
				y = eps;
			}
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
	 * isInteger(x) xが整数かどうか
	 * @param {number} x
	 * @returns {boolean}
	 */
	static isInteger(x) {
		return (x - (x | 0) !== 0.0);
	}
	
	/**
	 * betapdf(x, a, b) ベータ分布の確率密度関数
	 * @param {number} x
	 * @param {number} a
	 * @param {number} b
	 * @returns {number}
	 */
	static betapdf(x, a, b) {
		// powの計算結果が複素数になる場合は計算を行わない
		if	(
			((x < 0) && (StatisticsTool.isInteger(b - 1))) ||
			((1 - x < 0) && (StatisticsTool.isInteger(b - 1)))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / StatisticsTool.beta(a,  b));
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
			y2 = y - ((StatisticsTool.betacdf(y, a, b) - p) / StatisticsTool.betapdf(y, a, b));
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
		 erfinv(p) 誤差逆関数
		 @param_ {number} p
		 @returns_ {number}
		
		static erfinv(p) {
			if((p < 0.0) || (p > 1.0)) {
				return Number.NaN;
			}
			else if(p == 0.0) {
				return Number.NEGATIVE_INFINITY;
			}
			else if(p == 1.0) {
				return Number.POSITIVE_INFINITY;
			}
			let y = 0;
			const c = [];
			for(let k = 0; k < 100; k++) {
				let ck = 0;
				if(0 === k) {
					ck = 1;
				}
				else {
					for(let m = 0; m < k; m++) {
						ck += c[m] * c[k - 1 - m] / ((m + 1) * (2 * m + 1));
					}
				}
				c.push(ck);
				console.log(y + "\t" + ck / (2 * k + 1) + "\t" + Math.pow(Math.sqrt(Math.PI) * 0.5 * p, 2 * k + 1))
				y += ck / (2 * k + 1) * Math.pow(Math.sqrt(Math.PI) * 0.5 * p, 2 * k + 1);
			}
			return y;
			// 0.5 * Math.sqrt(Math.PI) = 0.8862269254527579
			// Math.PI / 12 = 0.2617993877991494
			// 7 * Math.pow(Math.PI, 2) / 480 = 0.14393173084921979
			// 127 * Math.pow(Math.PI, 3) / 40320 = 0.09766361950392055
			// 4369 * Math.pow(Math.PI, 4) / 5806080 = 0.07329907936638086
			// 34807 * Math.pow(Math.PI, 5) / 182476800 = 0.05837250087858452
			return (p
				+ 0.2617993877991494 * Math.pow(p, 3)
				+ 0.14393173084921979 * Math.pow(p, 5)
				+ 0.09766361950392055 * Math.pow(p, 7)
				+ 0.07329907936638086 * Math.pow(p, 9)
				+ 0.05837250087858452 * Math.pow(p, 11)
			) * 0.8862269254527579;
		}
	*/

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
	 * tinv2(p, v) 両側検定時のt分布の累積分布関数
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
		if(x < 0.0) {
			return 0;
		}
		else if(x === 0.0) {
			return 0.5;
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
		if((d1 < 0) || (d2 < 0)) {
			return Number.NaN;
		}
		else if(x <= 0) {
			return 0.0;
		}
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
		return new Complex(StatisticsTool.gammaln(Complex._toDouble(x)));
	}
	
	/**
	 * gamma(z) ガンマ関数 
	 * @param {Complex} z
	 * @returns {Complex}
	 */
	static gamma(z) {
		return new Complex(StatisticsTool.gamma(Complex._toDouble(z)));
	}
	
	/**
	 * gammainc(x, a, tail) 不完全ガンマ関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Complex}
	 */
	static gammainc(x, a, tail) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.gammainc(X, a_, tail_));
	}

	/**
	 * gampdf(x, k, s) ガンマ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gampdf(x, k, s) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gampdf(X, k_, s_));
	}

	/**
	 * gamcdf(x, k, s) ガンマ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gamcdf(x, k, s) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gamcdf(X, k_, s_));
	}

	/**
	 * gaminv(p, k, s) ガンマ分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} k - 形状母数
	 * @param {Complex} s - 尺度母数
	 * @returns {Complex}
	 */
	static gaminv(p, k, s) {
		const p_ = Complex._toDouble(p);
		const k_ = Complex._toDouble(k);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.gaminv(p_, k_, s_));
	}

	/**
	 * beta(x, y) ベータ関数
	 * @param {Complex} x
	 * @param {Complex} y
	 * @returns {Complex}
	 */
	static beta(x, y) {
		const X = Complex._toDouble(x);
		const y_ = Complex._toDouble(y);
		return new Complex(StatisticsTool.beta(X, y_));
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
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return new Complex(StatisticsTool.betainc(X, a_, b_, tail_));
	}

	/**
	 * betapdf(x, a, b) ベータ分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betapdf(x, a, b) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betapdf(X, a_, b_));
	}

	/**
	 * betacdf(x, a, b) ベータ分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betacdf(x, a, b) {
		const X = Complex._toDouble(x);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betacdf(X, a_, b_));
	}

	/**
	 * betainv(p, a, b) ベータ分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} a
	 * @param {Complex} b
	 * @returns {Complex}
	 */
	static betainv(p, a, b) {
		const p_ = Complex._toDouble(p);
		const a_ = Complex._toDouble(a);
		const b_ = Complex._toDouble(b);
		return new Complex(StatisticsTool.betainv(p_, a_, b_));
	}

	/**
	 * factorial(n), n! 階乗関数
	 * @param {Complex} n
	 * @returns {Complex}
	 */
	static factorial(n) {
		return new Complex(StatisticsTool.factorial(Complex._toDouble(n)));
	}

	/**
	 * nchoosek(n, k), nCk 二項係数またはすべての組合わせ
	 * @param {Complex} n
	 * @param {Complex} k
	 * @returns {Complex}
	 */
	static nchoosek(n, k) {
		const n_ = Complex._toDouble(n);
		const k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.nchoosek(n_, k_));
	}
	
	/**
	 * erf(x) 誤差関数
	 * @param {Complex} x
	 * @returns {Complex}
	 */
	static erf(x) {
		const X = Complex._toDouble(x);
		return new Complex(StatisticsTool.erf(X));
	}

	/**
	 * erfc(x) 相補誤差関数
	 * @param {Complex} x
	 * @returns {Complex}
	 */
	static erfc(x) {
		const X = Complex._toDouble(x);
		return new Complex(StatisticsTool.erfc(X));
	}

	/**
	 * normpdf(x, u, s) 正規分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static normpdf(x, u=0.0, s=1.0) {
		const X = Complex._toDouble(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.normpdf(X, u_, s_));
	}

	/**
	 * normcdf(x, u, s) 正規分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static normcdf(x, u=0.0, s=1.0) {
		const X = Complex._toDouble(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.normcdf(X, u_, s_));
	}

	/**
	 * norminv(x, u, s) 正規分布の累積分布関数の逆関数
	 * @param {Complex} x
	 * @param {Complex} [u=0.0] - 平均値
	 * @param {Complex} [s=1.0] - 分散
	 * @returns {Complex}
	 */
	static norminv(x, u=0.0, s=1.0) {
		const X = Complex._toDouble(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return new Complex(StatisticsTool.norminv(X, u_, s_));
	}
	
	/**
	 * tpdf(x, v) t分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tpdf(x, v) {
		const X = Complex._toDouble(x);
		const v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tpdf(X, v_));
	}

	/**
	 * tcdf(t, v) t分布の累積分布関数
	 * @param {Complex} t
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tcdf(t, v) {
		const t_ = Complex._toDouble(t);
		const v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tcdf(t_, v_));
	}

	/**
	 * tinv(p, v) t分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} v - 自由度
	 * @returns {Complex}
	 */
	static tinv(p, v) {
		const p_ = Complex._toDouble(p);
		const v_ = Complex._toDouble(v);
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
		const t_ = Complex._toDouble(t);
		const v_ = Complex._toDouble(v);
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
		const p_ = Complex._toDouble(p);
		const v_ = Complex._toDouble(v);
		return new Complex(StatisticsTool.tinv2(p_, v_));
	}

	/**
	 * chi2pdf(x, k) カイ二乗分布の確率密度関数
	 * @param {Complex} x
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2pdf(x, k) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.chi2pdf(X, k_));
	}

	/**
	 * chi2cdf(x, k) カイ二乗分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2cdf(x, k) {
		const X = Complex._toDouble(x);
		const k_ = Complex._toDouble(k);
		return new Complex(StatisticsTool.chi2cdf(X, k_));
	}

	/**
	 * chi2inv(p, k) カイ二乗分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} k - 自由度
	 * @returns {Complex}
	 */
	static chi2inv(p, k) {
		const p_ = Complex._toDouble(p);
		const k_ = Complex._toDouble(k);
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
		const X = Complex._toDouble(x);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.fpdf(X, d1_, d2_));
	}

	/**
	 * fcdf(x, d1, d2) F分布の累積分布関数
	 * @param {Complex} x
	 * @param {Complex} d1 - 分子の自由度
	 * @param {Complex} d2 - 分母の自由度
	 * @returns {Complex}
	 */
	static fcdf(x, d1, d2) {
		const X = Complex._toDouble(x);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.fcdf(X, d1_, d2_));
	}

	/**
	 * finv(p, d1, d2) F分布の累積分布関数の逆関数
	 * @param {Complex} p
	 * @param {Complex} d1 - 分子の自由度
	 * @param {Complex} d2 - 分母の自由度
	 * @returns {Complex}
	 */
	static finv(p, d1, d2) {
		const p_ = Complex._toDouble(p);
		const d1_ = Complex._toDouble(d1);
		const d2_ = Complex._toDouble(d2);
		return new Complex(StatisticsTool.finv(p_, d1_, d2_));
	}

}

/**
 * Matrix用の統計処理用の計算クラス
 */
export default class Statistics {

	/**
	 * 対数ガンマ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static gammaln(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammaln(num);
		});
	}

	/**
	 * ガンマ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static gamma(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamma(num);
		});
	}

	/**
	 * 不完全ガンマ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	static gammainc(x, a, tail) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gammainc(num, a_, tail_);
		});
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gampdf(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gampdf(num, k_, s_);
		});
	}

	/**
	 * ガンマ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gamcdf(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gamcdf(num, k_, s_);
		});
	}

	/**
	 * ガンマ分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
	 * @returns {Matrix}
	 */
	static gaminv(x, k, s) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		const s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.gaminv(num, k_, s_);
		});
	}

	/**
	 * ベータ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
	 * @returns {Matrix}
	 */
	static beta(x, y) {
		const X = Matrix._toMatrix(x);
		const y_ = Matrix._toDouble(y);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.beta(num, y_);
		});
	}
	
	/**
	 * 不完全ベータ関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @param {string} [tail="lower"] - lower/upper
	 * @returns {Matrix}
	 */
	static betainc(x, a, b, tail) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		const tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainc(num, a_, b_, tail_);
		});
	}

	/**
	 * ベータ分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	static betacdf(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betacdf(num, a_, b_);
		});
	}

	/**
	 * ベータ分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	static betapdf(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betapdf(num, a_, b_);
		});
	}

	/**
	 * ベータ分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
	 * @returns {Matrix}
	 */
	static betainv(x, a, b) {
		const X = Matrix._toMatrix(x);
		const a_ = Matrix._toDouble(a);
		const b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.betainv(num, a_, b_);
		});
	}

	/**
	 * x! 階乗関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static factorial(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.factorial(num);
		});
	}
	
	/**
	 * nCk 二項係数またはすべての組合わせ
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
	 * @returns {Matrix}
	 */
	static nchoosek(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.nchoosek(num, k_);
		});
	}
	
	/**
	 * 誤差関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static erf(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erf(num);
		});
	}

	/**
	 * 相補誤差関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static erfc(x) {
		const X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.erfc(num);
		});
	}
	
	/**
	 * 正規分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static normpdf(x, u=0.0, s=1.0) {
		const X = Matrix._toMatrix(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normpdf(num, u_, s_);
		});
	}

	/**
	 * 正規分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static normcdf(x, u=0.0, s=1.0) {
		const X = Matrix._toMatrix(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.normcdf(num, u_, s_);
		});
	}

	/**
	 * 正規分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
	 * @returns {Matrix}
	 */
	static norminv(x, u=0.0, s=1.0) {
		const X = Matrix._toMatrix(x);
		const u_ = Complex._toDouble(u);
		const s_ = Complex._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.norminv(num, u_, s_);
		});
	}

	/**
	 * t分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	static tpdf(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tpdf(num, v_);
		});
	}

	/**
	 * t分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	static tcdf(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tcdf(num, v_);
		});
	}

	/**
	 * t分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	static tinv(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv(num, v_);
		});
	}

	/**
	 * 尾部が指定可能なt分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
	 * @returns {Matrix}
	 */
	static tdist(x, v, tails) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		const tails_ = Matrix._toDouble(tails);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tdist(num, v_, tails_);
		});
	}

	/**
	 * 両側検定時のt分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
	 * @returns {Matrix}
	 */
	static tinv2(x, v) {
		const X = Matrix._toMatrix(x);
		const v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.tinv2(num, v_);
		});
	}

	/**
	 * カイ二乗分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2pdf(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2pdf(num, k_);
		});
	}

	/**
	 * カイ二乗分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2cdf(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2cdf(num, k_);
		});
	}
	
	/**
	 * カイ二乗分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
	 * @returns {Matrix}
	 */
	static chi2inv(x, k) {
		const X = Matrix._toMatrix(x);
		const k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.chi2inv(num, k_);
		});
	}

	/**
	 * F分布の確率密度関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static fpdf(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fpdf(num, d1_, d2_);
		});
	}

	/**
	 * F分布の累積分布関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static fcdf(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.fcdf(num, d1_, d2_);
		});
	}

	/**
	 * F分布の累積分布関数の逆関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
	 * @returns {Matrix}
	 */
	static finv(x, d1, d2) {
		const X = Matrix._toMatrix(x);
		const d1_ = Matrix._toDouble(d1);
		const d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return StatisticsComplex.finv(num, d1_, d2_);
		});
	}
	
	/**
	 * 最大値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} max([A, B])
	 */
	static max(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 最小値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} min([A, B])
	 */
	static min(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 合計
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static sum(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 相加平均
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static mean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 配列の積
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static prod(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 相乗平均／幾何平均
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static geomean(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
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
	 * 中央値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static median(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		const compare = function(a, b){
			return a.compareTo(b);
		};
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
	 * 最頻値
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static mode(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		const compare = function(a, b){
			return a.compareTo(b);
		};
		const main = function(data) {
			data.sort(compare);
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
	 * 中心積率
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
	 * @returns {Matrix} n次のモーメント、2で分散の定義と同等。
	 */
	static moment(x, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、標本分散とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Matrix._toComplex(type.nth_order);
		let col = 0;
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
	 * 分散
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	static var(x, type) {
		const X = Matrix._toMatrix(x);
		const M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		let col = 0;
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
	 * 標準偏差
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
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
	 * 絶対偏差
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), algorithm : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static mad(x, type) {
		const X = Matrix._toMatrix(x);
		const alg = !(type && type.algorithm) ? "mean" : type.algorithm;
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
	 * 歪度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	static skewness(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏), 1(標本)。規定値は、標本とする
		const cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const order = Statistics.moment(X, { correction : cor, dimension : dim, nth_order : 3  });
		const std = Statistics.std(X, { correction : cor, dimension : dim });
		if(cor === 1) {
			return order.ndiv(std.npow(3));
		}
		else {
			return order.ndiv(std.npow(3)).nmul(2);
		}
	}

	/**
	 * 共分散行列
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	static cov(x, type) {
		const X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		const cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		if(X.isVector()) {
			return Statistics.var(X, type);
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

	/**
	 * 標本の標準化
	 * 平均値0、標準偏差1に変更する
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	static normalize(x, type) {
		const X = Matrix._toMatrix(x);
		const mean_zero = X.sub(Statistics.mean(X, type));
		const std_one = mean_zero.ndiv(Statistics.std(mean_zero, type));
		return std_one;
	}

	/**
	 * 相関行列
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), correction : ?number}} [type]
	 * @returns {Matrix}
	 */
	static corrcoef(x, type) {
		const X = Matrix._toMatrix(x);
		return Statistics.cov(Statistics.normalize(X, type), type);
	}

	/**
	 * ソート
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number), order : ?string}} [type]
	 * @returns {Matrix}
	 */
	static sort(x, type) {
		const X = Matrix._toMatrix(x);
		const dim   = !(type && type.dimension) ? "auto" : type.dimension;
		const order = !(type && type.order) ? "ascend" : type.order;
		let compare;
		if(order === "ascend") {
			compare = function(a, b){
				return a.compareTo(b);
			};
		}
		else {
			compare = function(a, b){
				return b.compareTo(a);
			};
		}
		const main = function(data) {
			data.sort(compare);
			return data;
		};
		return X.eachVector(main, dim);
	}


}
