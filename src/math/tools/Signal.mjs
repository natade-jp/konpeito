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
import Complex from "../Complex.mjs";

// @ts-ignore
import Matrix from "../Matrix.mjs";

/**
 * 高速フーリエ変換用クラス
 * @ignore
 */
class FFT {

	/**
	 * ビット反転
	 * @param {number} x - ビット反転させる値（32ビット整数）
	 * @returns {number} ビット反転した値
	 */
	static bit_reverse_32(x) {
		let y = x & 0xffffffff;
		// 1,2,4,8,16ビット単位で交換
		y = ((y & 0x55555555) << 1) | ((y >> 1) & 0x55555555);
		y = ((y & 0x33333333) << 2) | ((y >> 2) & 0x33333333);
		y = ((y & 0x0f0f0f0f) << 4) | ((y >> 4) & 0x0f0f0f0f);
		y = ((y & 0x00ff00ff) << 8) | ((y >> 8) & 0x00ff00ff);
		y = ((y & 0x0000ffff) << 16) | ((y >> 16) & 0x0000ffff);
		return y;
	}
	
	/**
	 * 指定したビット分の数値データをビット反転した配列を返す
	 * @param {number} bit - ビット数
	 * @returns {Array<number>} ビット反転した値の配列
	 */
	static create_bit_reverse_table(bit) {
		const size = 1 << bit;
		const bitrv = [];
		for(let i = 0; i < size; i++) {
			bitrv[i] = FFT.bit_reverse_32(i) >>> (32 - bit);
		}
		return bitrv;
	}

	/**
	 * FFTクラスの初期化
	 * @param {number} size - 信号の長さ
	 */
	constructor(size) {
		
		/**
		 * 信号の長さ
		 */
		this.size = size;

		/**
		 * 信号の長さの逆数
		 */
		this.inv_size = 1.0 / this.size;

		/**
		 * 信号の長さをビット数で表した場合の値
		 */
		this.bit_size = Math.round(Math.log(this.size)/Math.log(2));

		/**
		 * FFTのアルゴリズムが使用できるか
		 */
		this.is_fast = (1 << this.bit_size) === this.size;

		/**
		 * バタフライ演算用のビットリバーステーブル
		 */
		this.bitrv = null;

		/**
		 * 複素数同士の掛け算に使用する実部テーブル
		 */
		this.fft_re = new Array(this.size);
		
		/**
		 * 複素数同士の掛け算に使用する虚部テーブル
		 */
		this.fft_im = new Array(this.size);
		{
			const delta = - 2.0 * Math.PI / this.size;
			let err = 0.0;
			for(let n = 0, x = 0; n < this.size; n++) {
				this.fft_re[n] = Math.cos(x);
				this.fft_im[n] = Math.sin(x);
				// カハンの加算アルゴリズム
				const y = delta + err;
				const t = x + y;
				err = t - x - y;
				x = t;
			}
		}
		if(this.is_fast) {
			this.bitrv = FFT.create_bit_reverse_table(this.bit_size);
		}
	}

	/**
	 * 中のデータを消去する
	 */
	delete() {
		delete this.size;
		delete this.inv_size;
		delete this.bit_size;
		delete this.is_fast;
		delete this.bitrv;
		delete this.fft_re;
		delete this.fft_im;
	}
	
	/**
	 * 離散フーリエ変換
	 * @param {Array<number>} real - 実数部
	 * @param {Array<number>} imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	fft(real, imag) {
		const f_re = new Array(this.size);
		const f_im = new Array(this.size);
		if(this.is_fast) {
			for(let i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				let center = 1;
				let blocklength = this.size / 2;
				let pointlength = 2;
				for(let delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(let blocks = 0; blocks < blocklength; blocks++) {
						let i = blocks * pointlength;
						for(let point = 0, n = 0; point < center; point++, i++, n += delta) {
							const re = f_re[i + center] * this.fft_re[n] - f_im[i + center] * this.fft_im[n];
							const im = f_im[i + center] * this.fft_re[n] + f_re[i + center] * this.fft_im[n];
							f_re[i + center] = f_re[i] - re;
							f_im[i + center] = f_im[i] - im;
							f_re[i] += re;
							f_im[i] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみのフーリエ変換
				for(let t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(let x = 0, n = 0; x < this.size; x++, n = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n];
						f_im[t] += real[x] * this.fft_im[n];
					}
				}
			}
			else {
				// 実数部分と複素数部分のフーリエ変換
				for(let t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(let x = 0, n = 0; x < this.size; x++, n = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n] - imag[x] * this.fft_im[n];
						f_im[t] += real[x] * this.fft_im[n] + imag[x] * this.fft_re[n];
					}
				}
			}
		}
		return {
			real : f_re,
			imag : f_im
		};
	}

	/**
	 * 逆離散フーリエ変換
	 * @param {Array} real - 実数部
	 * @param {Array} imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	ifft(real, imag) {
		const f_re = new Array(this.size);
		const f_im = new Array(this.size);
		if(this.is_fast) {
			for(let i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Inverse Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				let center = 1;
				let blocklength = this.size / 2;
				let pointlength = 2;
				let re, im;
				for(let delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(let blocks = 0; blocks < blocklength; blocks++) {
						let i = blocks * pointlength;
						for(let point = 0, n = 0; point < center; point++, i++, n += delta) {
							re = f_re[i + center] * this.fft_re[n] + f_im[i + center] * this.fft_im[n];
							im = f_im[i + center] * this.fft_re[n] - f_re[i + center] * this.fft_im[n];
							f_re[i + center] = f_re[i] - re;
							f_im[i + center] = f_im[i] - im;
							f_re[i] += re;
							f_im[i] += im;
						}
					}
					blocklength /= 2;
					pointlength *= 2;
					center *= 2;
				}
			}
		}
		else {
			if(!SignalTool.isContainsZero(imag)) {
				// 実数部分のみの逆フーリエ変換
				for(let x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(let t = 0, n = 0; t < this.size; t++, n = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n];
						f_im[x] += - real[t] * this.fft_im[n];
					}
				}
			}
			else {
				// 実数部分と複素数部分の逆フーリエ変換
				for(let x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(let t = 0, n = 0; t < this.size; t++, n = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n] + imag[t] * this.fft_im[n];
						f_im[x] += - real[t] * this.fft_im[n] + imag[t] * this.fft_re[n];
					}
				}
			}
		}
		for(let i = 0; i < this.size; i++) {
			f_re[i] *= this.inv_size;
			f_im[i] *= this.inv_size;
		}
		return {
			real : f_re,
			imag : f_im
		};
	}
}

/**
 * 簡易キャッシュクラス
 * FFTで用いるテーブルなどをキャッシュ
 * @ignore
 */
class Chash {
	
	/**
	 * 簡易キャッシュ
	 * @param {number} chash_size - キャッシュの最大サイズ
	 * @param {*} object - 作成するオブジェクト
	 */
	constructor(chash_size, object) {

		/**
		 * キャッシュするクラス
		 */
		this.object = object;

		/**
		 * キャッシュする最大数
		 */
		this.table_max = chash_size;

		/**
		 * 現在キャッシュしている数
		 */
		this.table_size = 0;

		/**
		 * キャッシュテーブル
		 */
		this.table = [];
	}

	/**
	 * 指定した長さのデータを作成する。キャッシュに存在すればキャッシュから使用する。
	 * @param {number} size - 作成するオブジェクトのサイズ
	 * @returns {*}
	 */
	get(size) {
		for(let index = 0; index < this.table_size; index++) {
			if(this.table[index].size === size) {
				// 先頭にもってくる
				const object = this.table.splice(index, 1);
				this.table.unshift(object);
				return object;
			}
		}
		const new_object = new this.object(size);
		if(this.table_size === this.table_max) {
			// 後ろのデータを消去
			const delete_object = this.table.pop();
			delete_object.delete();
		}
		// 前方に追加
		this.table.unshift(new_object);
		return new_object;
	}

}

/**
 * FFT用のキャッシュ
 * @type {Chash}
 * @ignore
 */
const fft_chash = new Chash(4, FFT);

/**
 * 離散コサイン変換のクラス
 * @ignore
 */
class DCT {
	
	/**
	 * DCTクラスの初期化
	 * @param {number} size - 信号の長さ
	 */
	constructor(size) {

		/**
		 * 信号長
		 */
		this.size = size;

		/**
		 * 信号長の2倍
		 * DCT変換では、実際の信号にゼロ詰めした2倍の信号長を用意しそれに対してFFTを行う。
		 */
		this.dct_size = size * 2;

		/**
		 * DCT変換に使用する計算用テーブル
		 */
		this.dct_re = new Array(this.size);

		/**
		 * DCT変換に使用する計算用テーブル
		 */
		this.dct_im = new Array(this.size);
		{
			const x_0 = 1.0 / Math.sqrt(this.size);
			const x_n = x_0 * Math.sqrt(2);
			for(let i = 0; i < this.size; i++) {
				const x = - Math.PI * i / this.dct_size;
				this.dct_re[i] = Math.cos(x) * (i === 0 ? x_0 : x_n);
				this.dct_im[i] = Math.sin(x) * (i === 0 ? x_0 : x_n);
			}
		}
	}
	
	/**
	 * 中のデータを消去する
	 */
	delete() {
		delete this.size;
		delete this.dct_size;
		delete this.dct_re;
		delete this.dct_im;
	}

	/**
	 * DCT-II
	 * @param {Array<number>} real - 実数部
	 * @returns {Array<number>}
	 */
	dct(real) {
		const re = new Array(this.dct_size);
		const im = new Array(this.dct_size);
		for(let i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? real[i] : 0.0;
			im[i] = 0.0;
		}
		const fft = fft_chash.get(this.dct_size).fft(re, im);
		for(let i = 0; i < this.size; i++) {
			re[i] = fft.real[i] * this.dct_re[i] - fft.imag[i] * this.dct_im[i];
		}
		re.splice(this.size);
		return re;
	}

	/**
	 * DCT-III (IDCT)
	 * @param {Array<number>} real - 実数部
	 * @returns {Array<number>}
	 */
	idct(real) {
		const re = new Array(this.dct_size);
		const im = new Array(this.dct_size);
		const denormlize = this.size * 2.0;
		for(let i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? (denormlize * real[i] *    this.dct_re[i])  : 0.0;
			im[i] = i < this.size ? (denormlize * real[i] * (- this.dct_im[i])) : 0.0;
		}
		const ifft = fft_chash.get(this.dct_size).ifft(re, im);
		ifft.real.splice(this.size);
		return ifft.real;
	}
	
}

/**
 * 離散コサイン変換用のキャッシュ
 * @ignore
 */
const dct_chash = new Chash(4, DCT);

/**
 * Signalクラスの内部で使用する関数集
 * @ignore
 */
class SignalTool {
	
	/**
	 * 0が含まれるか
	 * @param {Array<number>} x - 調べたい配列
	 * @returns {boolean}
	 */
	static isContainsZero(x) {
		for(let i = 0; i < x.length; i++) {
			if(x[i] !== 0) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 離散フーリエ変換
	 * @param {Array<number>} real - 実数部
	 * @param {Array<number>} imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	static fft(real, imag) {
		const obj = fft_chash.get(real.length);
		return obj.fft(real, imag);
	}

	/**
	 * 逆離散フーリエ変換
	 * @param {Array<number>} real - 実数部
	 * @param {Array<number>} imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	static ifft(real, imag) {
		const obj = fft_chash.get(real.length);
		return obj.ifft(real, imag);
	}

	/**
	 * DCT-II (DCT)
	 * @param {Array<number>} real - 実数部
	 * @returns {Array<number>}
	 */
	static dct(real) {
		const obj = dct_chash.get(real.length);
		return obj.dct(real);
	}

	/**
	 * DCT-III (IDCT)
	 * @param {Array<number>} real - 実数部
	 * @returns {Array<number>}
	 */
	static idct(real) {
		const obj = dct_chash.get(real.length);
		return obj.idct(real);
	}

	/**
	 * パワースペクトル密度
	 * @param {Array<number>} real - 実数部
	 * @param {Array<number>} imag - 虚数部
	 * @returns {Array<number>}
	 */
	static powerfft(real, imag) {
		const size = real.length;
		const X = SignalTool.fft(real, imag);
		const power = new Array(size);
		for(let i = 0; i < size; i++) {
			power[i] = X.real[i] * X.real[i] + X.imag[i] * X.imag[i];
		}
		return power;
	}

	/**
	 * 畳み込み積分、多項式乗算
	 * @param {Array} x1_real - 実数部
	 * @param {Array} x1_imag - 虚数部
	 * @param {Array} x2_real - 実数部
	 * @param {Array} x2_imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	static conv(x1_real, x1_imag, x2_real, x2_imag) {
		let is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(let i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		const size = x1_real.length;
		const N2 = size * 2;
		const bit_size = Math.round(Math.log(size)/Math.log(2));
		const is_fast = (1 << bit_size) === size;
		if(is_fast) {
			// FFTを用いた手法へ切り替え
			// 周波数空間上では掛け算になる
			if(is_self) {
				const size = x1_real.length;
				const real = new Array(N2);
				const imag = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real[i] = i < size ? x1_real[i] : 0.0;
					imag[i] = i < size ? x1_imag[i] : 0.0;
				}
				const X = SignalTool.fft(real, imag);
				for(let i = 0; i < N2; i++) {
					real[i] = X.real[i] * X.real[i] - X.imag[i] * X.imag[i];
					imag[i] = X.real[i] * X.imag[i] + X.imag[i] * X.real[i];
				}
				const x = SignalTool.ifft(real, imag);
				x.real.splice(N2 - 1);
				x.imag.splice(N2 - 1);
				return x;
			}
			else if(x1_real.length === x2_real.length) {
				const size = x1_real.length;
				const real1 = new Array(N2);
				const imag1 = new Array(N2);
				const real2 = new Array(N2);
				const imag2 = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real1[i] = i < size ? x1_real[i] : 0.0;
					imag1[i] = i < size ? x1_imag[i] : 0.0;
					real2[i] = i < size ? x2_real[i] : 0.0;
					imag2[i] = i < size ? x2_imag[i] : 0.0;
				}
				const F = SignalTool.fft(real1, imag1);
				const G = SignalTool.fft(real2, imag2);
				const real = new Array(N2);
				const imag = new Array(N2);
				for(let i = 0; i < N2; i++) {
					real[i] = F.real[i] * G.real[i] - F.imag[i] * G.imag[i];
					imag[i] = F.real[i] * G.imag[i] + F.imag[i] * G.real[i];
				}
				const fg = SignalTool.ifft(real, imag);
				fg.real.splice(N2 - 1);
				fg.imag.splice(N2 - 1);
				return fg;
			}
		}
		let is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		{
			// まじめに計算する
			const real = new Array(x1_real.length + x2_real.length - 1);
			const imag = new Array(x1_real.length + x2_real.length - 1);
			for(let i = 0; i < real.length; i++) {
				real[i] = 0;
				imag[i] = 0;
			}
			if(is_real_number) {
				// 実数部分のみの畳み込み積分
				// スライドさせていく
				// AAAA
				//  BBBB
				//   CCCC
				for(let y = 0; y < x2_real.length; y++) {
					for(let x = 0; x < x1_real.length; x++) {
						real[y + x] += x1_real[x] * x2_real[y];
					}
				}
			}
			else {
				// 実数部分と複素数部分の畳み込み積分
				for(let y = 0; y < x2_real.length; y++) {
					for(let x = 0; x < x1_real.length; x++) {
						real[y + x] += x1_real[x] * x2_real[y] - x1_imag[x] * x2_imag[y];
						imag[y + x] += x1_real[x] * x2_imag[y] + x1_imag[x] * x2_real[y];
					}
				}
			}
			return {
				real : real,
				imag : imag
			};
		}
	}

	/**
	 * 自己相関関数、相互相関関数
	 * @param {Array} x1_real - 実数部
	 * @param {Array} x1_imag - 虚数部
	 * @param {Array} x2_real - 実数部
	 * @param {Array} x2_imag - 虚数部
	 * @returns {Object<string, Array<number>>}
	 */
	static xcorr(x1_real, x1_imag, x2_real, x2_imag) {
		let is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(let i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		if(x1_real.length === x2_real.length) {
			const size = x1_real.length;
			const N2 = size * 2;
			const bit_size = Math.round(Math.log(size)/Math.log(2));
			const is_fast = (1 << bit_size) === size;
			if(is_fast) {
				let fg = null;
				if(is_self) {
					const real = new Array(N2);
					const imag = new Array(N2);
					for(let i = 0; i < N2; i++) {
						real[i] = i < size ? x1_real[i] : 0.0;
						imag[i] = i < size ? x1_imag[i] : 0.0;
					}
					// パワースペクトル密度は、自己相関のフーリエ変換のため、
					// パワースペクトル密度の逆変換で求められる。
					const power = SignalTool.powerfft(real, imag);
					fg = SignalTool.ifft(power, imag);
					// シフト
					real.pop();
					imag.pop();
					for(let i = 0, j = size + 1 ; i < real.length; i++, j++) {
						if(N2 <= j) {
							j = 0;
						}
						real[i] = fg.real[j];
						imag[i] = fg.imag[j];
					}
					return {
						real : real,
						imag : imag
					};
				}
				else {
					const f_real = new Array(N2);
					const f_imag = new Array(N2);
					const g_real = new Array(N2);
					const g_imag = new Array(N2);
					// gの順序を反転かつ共役複素数にする
					for(let i = 0; i < N2; i++) {
						f_real[i] = i < size ?   x1_real[i] : 0.0;
						f_imag[i] = i < size ?   x1_imag[i] : 0.0;
						g_real[i] = i < size ?   x2_real[size - i - 1] : 0.0;
						g_imag[i] = i < size ? - x2_imag[size - i - 1] : 0.0;
					}
					// 畳み込み掛け算
					const F = SignalTool.fft(f_real, f_imag);
					const G = SignalTool.fft(g_real, g_imag);
					const real = new Array(N2);
					const imag = new Array(N2);
					for(let i = 0; i < N2; i++) {
						real[i] = F.real[i] * G.real[i] - F.imag[i] * G.imag[i];
						imag[i] = F.real[i] * G.imag[i] + F.imag[i] * G.real[i];
					}
					fg = SignalTool.ifft(real, imag);
					fg.real.splice(N2 - 1);
					fg.imag.splice(N2 - 1);
					return fg;
				}
			}
		}
		let is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		if(is_self) {
			const size = x1_real.length;
			const N2 = size * 2;
			// 実数の自己相関関数
			if(is_real_number) {
				const fg = new Array(size);
				for(let m = 0; m < size; m++) {
					fg[m] = 0;
					const tmax = size - m;
					for(let t = 0; t < tmax; t++) {
						fg[m] += x1_real[t] * x2_real[t + m];
					}
				}
				// 半分の値は同一なので折り返して計算を省く
				const real = new Array(N2 - 1);
				const imag = new Array(N2 - 1);
				for(let i = 0, j = size - 1 ; i < size; i++, j--) {
					real[i] = fg[j];
					real[size + i - 1] = fg[i];
				}
				for(let i = 0; i < imag.length; i++) {
					imag[i] = 0.0;
				}
				return {
					real : real,
					imag : imag
				};
			}
		}
		// 2つの信号の長さが違う、又は2の累乗の長さではない別のデータの場合は通常計算
		{
			const g_real = new Array(x2_real.length);
			const g_imag = new Array(x2_real.length);
			// gの順序を反転かつ共役複素数にする
			for(let i = 0; i < x2_real.length; i++) {
				g_real[i] =   x2_real[x2_real.length - i - 1];
				g_imag[i] = - x2_imag[x2_real.length - i - 1];
			}
			const y = SignalTool.conv(x1_real, x1_imag, g_real, g_imag);
			if(x1_real.length === x2_real.length) {
				return y;
			}
			const delta = Math.abs(x1_real.length - x2_real.length);
			const zeros = new Array(delta);
			for(let i = 0; i < delta; i++) {
				zeros[i] = 0;
			}
			if(x1_real.length > x2_real.length) {
				// データの最初に「0」を加える
				return {
					real : zeros.concat(y.real),
					imag : zeros.concat(y.imag)
				};
			}
			else {
				// データの最後に「0」を加える
				return {
					real : y.real.concat(zeros),
					imag : y.imag.concat(zeros)
				};
			}
		}
	}

	/**
	 * 窓を作成する
	 * @param {string} name - 窓関数の名前
	 * @param {number} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Array<number>}
	 */
	static window(name, size, periodic) {
		const periodic_ = periodic !== undefined ? periodic : "symmetric";
		const name_ = name.toLocaleLowerCase();
		const size_ = size;
		const window = new Array(size_);
		
		let normalzie;
		if((periodic_ === "symmetric") || (periodic_ === 0)) {
			normalzie = function(y) {
				return (y / (size_ - 1) * (Math.PI * 2.0));
			};
		}
		else if((periodic_ === "periodic") || (periodic_ !== 0)) {
			normalzie = function(y) {
				return (y / size_ * (Math.PI * 2.0));
			};
		}

		const setBlackmanWindow = function( alpha0, alpha1, alpha2, alpha3, alpha4) {
			for(let i = 0; i < size_; i++) {
				window[i]  = alpha0;
				window[i] -= alpha1 * Math.cos(1.0 * normalzie(i));
				window[i] += alpha2 * Math.cos(2.0 * normalzie(i));
				window[i] -= alpha3 * Math.cos(3.0 * normalzie(i));
				window[i] += alpha4 * Math.cos(4.0 * normalzie(i));
			}
		};

		switch(name_) {
			// rect 矩形窓(rectangular window)
			case "rectangle":
				setBlackmanWindow(1.0, 0.0, 0.0, 0.0, 0.0);
				break;

			// hann ハン窓・ハニング窓(hann/hanning window)
			case "hann":
				setBlackmanWindow(0.5, 0.5, 0.0, 0.0, 0.0);
				break;

			// hamming ハミング窓(hamming window)
			case "hamming":
				setBlackmanWindow(0.54, 0.46, 0.0, 0.0, 0.0);
				break;

			// blackman ブラックマン窓(Blackman window)
			case "blackman":
				setBlackmanWindow(0.42, 0.50, 0.08, 0.0, 0.0);
				break;

			// blackmanharris Blackman-Harris window
			case "blackmanharris":
				setBlackmanWindow(0.35875, 0.48829, 0.14128, 0.01168, 0);
				break;

			// blackmannuttall Blackman-Nuttall window
			case "blackmannuttall":
				setBlackmanWindow(0.3635819, 0.4891775, 0.1365995, 0.0106411, 0.0);
				break;

			// flattop Flat top window
			case "flattop":
				setBlackmanWindow(1.0, 1.93, 1.29, 0.388, 0.032);
				break;

			// Half cycle sine window(MDCT窓)
			case "sin":
				for(let i = 0; i < size_; i++) {
					window[i]  = Math.sin(normalzie(i) * 0.5);
				}
				break;

			// Vorbis window(MDCT窓)
			case "vorbis":
				for(let i = 0; i < size_; i++) {
					const x = Math.sin(normalzie(i) * 0.5);
					window[i]  = Math.sin(Math.PI * 0.5 * x * x);
				}
				break;
		}

		return window;
	}

	/**
	 * ハニング窓
	 * @param {number} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Array<number>}
	 */
	static hann(size, periodic) {
		return SignalTool.window("hann", size, periodic);
	}
	
	/**
	 * ハミング窓を作成
	 * @param {number} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Array<number>}
	 */
	static hamming(size, periodic) {
		return SignalTool.window("hamming", size, periodic);
	}
	
}

/**
 * Matrix用の信号処理用の計算クラス
 */
export default class Signal {
	
	/**
	 * 離散フーリエ変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} fft(x)
	 */
	static fft(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.fft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex([result.real[i], result.imag[i]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * 逆離散フーリエ変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} ifft(X)
	 */
	static ifft(X, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(X);
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.ifft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex([result.real[i], result.imag[i]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * パワースペクトル密度
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} abs(fft(x)).^2
	 */
	static powerfft(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		const main = function(data) {
			const real = new Array(data.length);
			const imag = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			const result = SignalTool.powerfft(real, imag);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * 離散コサイン変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} dct(x)
	 */
	static dct(x, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(x);
		if(M.isComplex()) {
			throw "dct don't support complex numbers.";
		}
		const main = function(data) {
			const real = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			const result = SignalTool.dct(real);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * 逆離散コサイン変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix} idct(x)
	 */
	static idct(X, type) {
		const dim = !(type && type.dimension) ? "auto" : type.dimension;
		const M = Matrix._toMatrix(X);
		if(M.isComplex()) {
			throw "idct don't support complex numbers.";
		}
		const main = function(data) {
			const real = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			const result = SignalTool.idct(real);
			const y = new Array(data.length);
			for(let i = 0; i < data.length; i++) {
				y[i] = new Complex(result[i]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	}

	/**
	 * 2次元の離散フーリエ変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static fft2(x) {
		return Signal.fft(x, {dimension : "both"});
	}

	/**
	 * 2次元の逆離散フーリエ変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
	 * @returns {Matrix}
	 */
	static ifft2(X) {
		return Signal.ifft(X, {dimension : "both"});
	}

	/**
	 * 2次元のDCT変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
	 * @returns {Matrix}
	 */
	static dct2(x) {
		return Signal.dct(x, {dimension : "both"});
	}

	/**
	 * 2次元の逆DCT変換
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
	 * @returns {Matrix}
	 */
	static idct2(X) {
		return Signal.idct(X, {dimension : "both"});
	}

	/**
	 * 畳み込み積分、多項式乗算
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x2
	 * @returns {Matrix}
	 */
	static conv(x1, x2) {
		const M1 = Matrix._toMatrix(x1);
		const M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		const M1_real = new Array(M1.length);
		const M1_imag = new Array(M1.length);
		const M2_real = new Array(M2.length);
		const M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(let i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M1.row_length; i++) {
				M1_real[i] = M1.matrix_array[i][0].real;
				M1_imag[i] = M1.matrix_array[i][0].imag;
			}
		}
		if(M2.isRow()) {
			for(let i = 0; i < M2.column_length; i++) {
				M2_real[i] = M2.matrix_array[0][i].real;
				M2_imag[i] = M2.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M2.row_length; i++) {
				M2_real[i] = M2.matrix_array[i][0].real;
				M2_imag[i] = M2.matrix_array[i][0].imag;
			}
		}
		const y = SignalTool.conv(M1_real, M1_imag, M2_real, M2_imag);
		const m = new Array(y.real.length);
		for(let i = 0; i < y.real.length; i++) {
			m[i] = new Complex([y.real[i], y.imag[i]]);
		}
		const M = new Matrix([m]);
		return M2.isRow() ? M : M.transpose();
	}

	/**
	 * 自己相関関数、相互相関関数
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [x2] - 省略した場合は自己相関関数
	 * @returns {Matrix}
	 */
	static xcorr(x1, x2) {
		const M1 = Matrix._toMatrix(x1);
		if(!x2) {
			return M1.xcorr(M1);
		}
		const M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		const M1_real = new Array(M1.length);
		const M1_imag = new Array(M1.length);
		const M2_real = new Array(M2.length);
		const M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(let i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M1.row_length; i++) {
				M1_real[i] = M1.matrix_array[i][0].real;
				M1_imag[i] = M1.matrix_array[i][0].imag;
			}
		}
		if(M2.isRow()) {
			for(let i = 0; i < M2.column_length; i++) {
				M2_real[i] = M2.matrix_array[0][i].real;
				M2_imag[i] = M2.matrix_array[0][i].imag;
			}
		}
		else {
			for(let i = 0; i < M2.row_length; i++) {
				M2_real[i] = M2.matrix_array[i][0].real;
				M2_imag[i] = M2.matrix_array[i][0].imag;
			}
		}
		const y = SignalTool.xcorr(M1_real, M1_imag, M2_real, M2_imag);
		const m = new Array(y.real.length);
		for(let i = 0; i < y.real.length; i++) {
			m[i] = new Complex([y.real[i], y.imag[i]]);
		}
		const M = new Matrix([m]);
		return M1.isRow() ? M : M.transpose();
	}

	/**
	 * 窓関数
	 * @param {string} name - 窓関数の名前
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Matrix} 列ベクトル
	 */
	static window(name, size, periodic) {
		const size_ = Matrix._toInteger(size);
		const y = SignalTool.window(name, size_, periodic);
		return (new Matrix(y)).transpose();
	}

	/**
	 * ハニング窓
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Matrix} 列ベクトル
	 */
	static hann(size, periodic) {
		return Signal.window("hann", size, periodic);
	}
	
	/**
	 * ハミング窓
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
	 * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
	 * @returns {Matrix} 列ベクトル
	 */
	static hamming(size, periodic) {
		return Signal.window("hamming", size, periodic);
	}
	
	/**
	 * FFTシフト
	 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x 
	 * @param {{dimension : (?string|?number)}} [type]
	 * @returns {Matrix}
	 */
	static fftshift(x, type) {
		const X = Matrix._toMatrix(x);
		if(X.isVector()) {
			const shift_size = Math.floor(X.length / 2);
			return X.circshift(shift_size, type);
		}
		const shift_size_col = Math.floor(X.column_length / 2);
		const shift_size_row = Math.floor(X.row_length / 2);
		if(type !== undefined) {
			const target = type.dimension;
			if((target === "row") || (target === 1)) {
				return X.circshift(shift_size_col, type);
			}
			else if((target === "column") || (target === 2)) {
				return X.circshift(shift_size_row, type);
			}
		}
		const Y = X.circshift(shift_size_col, {dimension : "row"});
		return Y.circshift(shift_size_row, {dimension : "column"});
	}
	
}

