/*!
 * konpeito.js
 * https://github.com/natade-jp/konpeito
 * Copyright 2013-2019 natade < https://github.com/natade-jp >
 *
 * The MIT license.
 * https://opensource.org/licenses/MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.konpeito = factory());
}(this, function () { 'use strict';

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

	/**
	 * Collection of tools used in the Random.
	 * @ignore
	 */
	var RandomTool = function RandomTool () {};

	RandomTool.unsigned32 = function unsigned32 (x) {
		return ((x < 0) ? ((x & 0x7FFFFFFF) + 0x80000000) : x);
	};

	/**
		 * Multiply two 32-bit integers and output a 32-bit integer.
		 * @param {number} x1 
		 * @param {number} x2 
		 * @returns {number}
		 */
	RandomTool.multiplication32 = function multiplication32 (x1, x2) {
		var b = (x1 & 0xFFFF) * (x2 & 0xFFFF);
		var y = RandomTool.unsigned32(b);
		b = (x1 & 0xFFFF) * (x2 >>> 16);
		y = RandomTool.unsigned32(y + ((b & 0xFFFF) << 16));
		b = (x1 >>> 16) * (x2 & 0xFFFF);
		y = RandomTool.unsigned32(y + ((b & 0xFFFF) << 16));
		return (y & 0xFFFFFFFF);
	};

	/**
	 * Random number class.
	 */
	var Random = function Random(seed) {
		// 「M系列乱数」で乱数を作成します。
		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 比較的長い 2^521 - 1通りを出力します。
		// 乱数はCでの動作と同じ値が出ることを確認。(seed = 1として1000番目の値が等しいことを確認)

		/**
			 * Random number array.
			 * @private
			 * @type {Array<number>}
			 */
		this.x = [];
		for(var i = 0;i < 521;i++) {
			this.x[i] = 0;
		}
		if(arguments.length >= 1) {
			this.setSeed(seed);
		}
		else {
			// 線形合同法で適当に乱数を作成する
			var seed$1 = ((new Date()).getTime() + Random.seedUniquifier) & 0xFFFFFFFF;
			Random.seedUniquifier = (Random.seedUniquifier + 1) & 0xFFFFFFFF;
			this.setSeed(seed$1);
		}
	};

	/**
		 * 内部データをシャッフル
		 */
	Random.prototype._rnd521 = function _rnd521 () {
		var x = this.x;
		for(var i = 0; i < 32; i++) {
			x[i] ^= x[i + 489];
		}
		for(var i$1 = 32; i$1 < 521; i$1++) {
			x[i$1] ^= x[i$1 - 32];
		}
	};

	/**
		 * Initialize random seed.
		 * @param {number} seed
		 */
	Random.prototype.setSeed = function setSeed (seed) {
		// 伏見「乱数」東京大学出版会,1989 の方法により初期値を設定
		var u = 0;
		var x = this.x;
		// seedを使用して線形合同法でx[0-16]まで初期値を設定
		var random_seed = seed;
		for(var i = 0; i <= 16; i++) {
			for(var j = 0; j < 32; j++) {
				random_seed = RandomTool.multiplication32(random_seed, 0x5D588B65) + 1;
				u = (u >>> 1) + ((random_seed < 0) ? 0x80000000 : 0);
			}
			x[i] = u;
		}
		// 残りのビットはx[i] = x[i-32] ^ x[i-521]で生成
		for(var i$1 = 16; i$1 < 521; i$1++) {
			u = (i$1 === 16) ? i$1 : (i$1 - 17);
			x[i$1] = ((x[u] << 23) & 0xFFFFFFFF) ^ (x[i$1 - 16] >>> 9) ^ x[i$1 - 1];
		}
		// ビットをシャッフル
		for(var i$2 = 0; i$2 < 4; i$2++) {
			this._rnd521();
		}
			
		/**
			 * Number of random number array to use.
			 * @private
			 * @type {number}
			 */
		this.xi = 0;
			
		/**
			 * Is keep random numbers based on Gaussian distribution.
			 * @private
			 * @type {boolean}
			 */
		this.haveNextNextGaussian = false;
			
		/**
			 * Next random number based on Gaussian distribution.
			 * @private
			 * @type {number}
			 */
		this.nextNextGaussian = 0;
	};

	/**
		 * 32-bit random number.
		 * @returns {number} - 32ビットの乱数
		 */
	Random.prototype.genrand_int32 = function genrand_int32 () {
		// 全て使用したら、再び混ぜる
		if(this.xi === 521) {
			this._rnd521();
			this.xi = 0;
		}
		var y = RandomTool.unsigned32(this.x[this.xi]);
		this.xi = this.xi + 1;
		return y;
	};

	/**
		 * Random number of specified bit length.
		 * @param {number} bits - Required number of bits (up to 64 possible).
		 * @returns {number}
		 */
	Random.prototype.next = function next (bits) {
		if(bits === 0) {
			return 0;
		}
		else if(bits === 32) {
			return this.genrand_int32();
		}
		else if(bits < 32) {
			// 線形合同法ではないため

			// 上位のビットを使用しなくてもいいがJavaっぽく。
			return (this.genrand_int32() >>> (32 - bits));
		}
		// double型のため、52ビットまでは、整数として出力可能
		else if(bits === 63) {
			// 正の値を出力するように調節
			return (this.next(32) * 0x80000000 + this.next(32));
		}
		else if(bits === 64) {
			return (this.next(32) * 0x100000000 + this.next(32));
		}
		else if(bits < 64) {
			return (this.genrand_int32() * (1 << (bits - 32)) + (this.genrand_int32()  >>> (64 - bits)));
		}
	};

	/**
		 * 8-bit random number array of specified length.
		 * @param {number} size - 必要な長さ
		 * @returns {Array<number>}
		 */
	Random.prototype.nextBytes = function nextBytes (size) {
		var y = new Array(size);
		// 配列yに乱数を入れる
		// 8ビットのために、32ビット乱数を1回回すのはもったいない
		for(var i = 0;i < y.length; i++) {
			y[i] = this.next(8);
		}
		return y;
	};

	/**
		 * 16-bit random number.
		 * @returns {number}
		 */
	Random.prototype.nextShort = function nextShort () {
		return (this.next(16));
	};

	/**
		 * 32-bit random number.
		 * @param {number} [x] - 指定した値未満の数値を作る
		 * @returns {number}
		 */
	Random.prototype.nextInt = function nextInt (x) {
		if((x !== undefined) && (typeof x === "number")) {
			var r, y;
			do {
				r = RandomTool.unsigned32(this.genrand_int32());
				y = r % x;
			} while((r - y + x) > 0x100000000 );
			return y;
		}
		return (this.next(32) & 0xFFFFFFFF);
	};

	/**
		 * 64-bit random number.
		 * @returns {number}
		 */
	Random.prototype.nextLong = function nextLong () {
		return this.next(64);
	};

	/**
		 * Random boolean.
		 * @returns {boolean}
		 */
	Random.prototype.nextBoolean = function nextBoolean () {
		// 1ビットのために、32ビット乱数を1回回すのはもったいない
		return (this.next(1) !== 0);
	};

	/**
		 * Float type random number in the range of [0, 1).
		 * @returns {number}
		 */
	Random.prototype.nextFloat = function nextFloat () {
		return (this.next(24) / 0x1000000);
	};

	/**
		 * Double type random number in the range of [0, 1).
		 * @returns {number}
		 */
	Random.prototype.nextDouble = function nextDouble () {
		var a1 = this.next(26) * 0x8000000 + this.next(27);
		var a2 = 0x8000000 * 0x4000000;
		return (a1 / a2);
	};

	/**
		 * Random numbers from a Gaussian distribution.
		 * This random number is a distribution with an average value of 0 and a standard deviation of 1.
		 * @returns {number}
		 */
	Random.prototype.nextGaussian = function nextGaussian () {
		if(this.haveNextNextGaussian) {
			this.haveNextNextGaussian = false;
			return this.nextNextGaussian;
		}
		// Box-Muller法
		var a = Math.sqrt( -2 * Math.log( this.nextDouble() ) );
		var b = 2 * Math.PI * this.nextDouble();
		var y = a * Math.sin(b);
		this.nextNextGaussian = a * Math.cos(b);
		this.haveNextNextGaussian = true;
		return y;
	};

	/**
	 * Random number creation integer when no seed is set.
	 * @type {number}
	 * @ignore
	 */
	Random.seedUniquifier = 0x87654321;

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

	/**
	 * Base class for rounding mode for BigDecimal.
	 */
	var RoundingModeEntity = function RoundingModeEntity () {};

	RoundingModeEntity.toString = function toString () {
		return "NONE";
	};

	/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
	RoundingModeEntity.getAddNumber = function getAddNumber (x) {
		return 0;
	};

	/**
	 * Directed rounding to an integer.
	 * Round towards positive infinity if positive, negative infinity if negative.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_UP = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_UP () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_UP.__proto__ = RoundingModeEntity;
		RoundingMode_UP.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_UP.prototype.constructor = RoundingMode_UP;

		RoundingMode_UP.toString = function toString () {
			return "UP";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_UP.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return 10 - y;
			}
			else {
				return (-(10 + y));
			}
		};

		return RoundingMode_UP;
	}(RoundingModeEntity));

	/**
	 * Directed rounding to an integer.
	 * Round towards 0.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_DOWN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_DOWN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_DOWN.__proto__ = RoundingModeEntity;
		RoundingMode_DOWN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_DOWN.prototype.constructor = RoundingMode_DOWN;

		RoundingMode_DOWN.toString = function toString () {
			return "DOWN";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_DOWN.getAddNumber = function getAddNumber (x) {
			return -(x % 10);
		};

		return RoundingMode_DOWN;
	}(RoundingModeEntity));

	/**
	 * Directed rounding to an integer.
	 * Round up to positive infinity.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_CEILING = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_CEILING () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_CEILING.__proto__ = RoundingModeEntity;
		RoundingMode_CEILING.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_CEILING.prototype.constructor = RoundingMode_CEILING;

		RoundingMode_CEILING.toString = function toString () {
			return "CEILING";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_CEILING.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return 10 - y;
			}
			else {
				return -y;
			}
		};

		return RoundingMode_CEILING;
	}(RoundingModeEntity));

	/**
	 * Directed rounding to an integer.
	 * Round down to negative infinity.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_FLOOR = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_FLOOR () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_FLOOR.__proto__ = RoundingModeEntity;
		RoundingMode_FLOOR.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_FLOOR.prototype.constructor = RoundingMode_FLOOR;

		RoundingMode_FLOOR.toString = function toString () {
			return "FLOOR";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_FLOOR.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else if(y > 0) {
				return -y;
			}
			else {
				return(-(10 + y));
			}
		};

		return RoundingMode_FLOOR;
	}(RoundingModeEntity));

	/**
	 * Rounding to the nearest integer.
	 * Round half towards positive infinity.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_UP = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_UP () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_UP.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_UP.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_UP.prototype.constructor = RoundingMode_HALF_UP;

		RoundingMode_HALF_UP.toString = function toString () {
			return "HALF_UP";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_HALF_UP.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			var sign = y >= 0 ? 1 : -1;
			if(Math.abs(y) < 5) {
				return (y * -1);
			}
			else {
				return (sign * (10 - Math.abs(y)));
			}
		};

		return RoundingMode_HALF_UP;
	}(RoundingModeEntity));

	/**
	 * Rounding to the nearest integer.
	 * Round half towards negative infinity.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_DOWN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_DOWN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_DOWN.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_DOWN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_DOWN.prototype.constructor = RoundingMode_HALF_DOWN;

		RoundingMode_HALF_DOWN.toString = function toString () {
			return "HALF_DOWN";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_HALF_DOWN.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			var sign = y >= 0 ? 1 : -1;
			if(Math.abs(y) < 6) {
				return (y * -1);
			}
			else {
				return (sign * (10 - Math.abs(y)));
			}
		};

		return RoundingMode_HALF_DOWN;
	}(RoundingModeEntity));

	/**
	 * Rounding to the nearest integer
	 * Round to the nearest side. If the median, round to the even side.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_HALF_EVEN = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_HALF_EVEN () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_HALF_EVEN.__proto__ = RoundingModeEntity;
		RoundingMode_HALF_EVEN.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_HALF_EVEN.prototype.constructor = RoundingMode_HALF_EVEN;

		RoundingMode_HALF_EVEN.toString = function toString () {
			return "HALF_EVEN";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_HALF_EVEN.getAddNumber = function getAddNumber (x) {
			var y = x % 100;
			var sign, even;
			if(y < 0) {
				sign = -1;
				even = Math.ceil(y / 10) & 1;
			}
			else {
				sign = 1;
				even = Math.floor(y / 10) & 1;
			}
			var center;
			if(even === 1) {
				center = 5;
			}
			else {
				center = 6;
			}
			y = y % 10;
			if(Math.abs(y) < center) {
				return (y * -1);
			}
			else {
				return (sign * (10 - Math.abs(y)));
			}
		};

		return RoundingMode_HALF_EVEN;
	}(RoundingModeEntity));

	/**
	 * Do not round.
	 * Error if you need to round it.
	 * @implements {RoundingModeEntity}
	 */
	var RoundingMode_UNNECESSARY = /*@__PURE__*/(function (RoundingModeEntity) {
		function RoundingMode_UNNECESSARY () {
			RoundingModeEntity.apply(this, arguments);
		}

		if ( RoundingModeEntity ) RoundingMode_UNNECESSARY.__proto__ = RoundingModeEntity;
		RoundingMode_UNNECESSARY.prototype = Object.create( RoundingModeEntity && RoundingModeEntity.prototype );
		RoundingMode_UNNECESSARY.prototype.constructor = RoundingMode_UNNECESSARY;

		RoundingMode_UNNECESSARY.toString = function toString () {
			return "UNNECESSARY";
		};

		/**
		 * Numeric value to add.
		 * It is rounded when this value is added.
		 * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
		 * @returns {number} Numeric value to add.
		 */
		RoundingMode_UNNECESSARY.getAddNumber = function getAddNumber (x) {
			var y = x % 10;
			if(y === 0) {
				return 0;
			}
			else {
				throw "ArithmeticException";
			}
		};

		return RoundingMode_UNNECESSARY;
	}(RoundingModeEntity));

	/**
	 * Rounding mode class for BigDecimal.
	 */
	var RoundingMode = function RoundingMode () {};

	var staticAccessors = { UP: { configurable: true },DOWN: { configurable: true },CEILING: { configurable: true },FLOOR: { configurable: true },HALF_UP: { configurable: true },HALF_DOWN: { configurable: true },HALF_EVEN: { configurable: true },UNNECESSARY: { configurable: true } };

	RoundingMode.valueOf = function valueOf (name) {
		var check_string;
		if(typeof name === "string") {
			check_string = name;
		}
		else if(name instanceof Object) {
			check_string = name.toString();
		}
		else {
			throw "Unsupported argument " + name;
		}
		var modetype = [
			RoundingMode_UP,
			RoundingMode_DOWN,
			RoundingMode_FLOOR,
			RoundingMode_CEILING,
			RoundingMode_HALF_UP,
			RoundingMode_HALF_DOWN,
			RoundingMode_HALF_EVEN,
			RoundingMode_UNNECESSARY
		];
		var upper_name = check_string.toUpperCase();
		for(var i = 0; i < modetype.length; i++) {
			if(modetype[i].toString() === upper_name) {
				return modetype[i];
			}
		}
		throw "IllegalArgumentException : " + check_string;
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * Directed rounding to an integer.
		 * Round towards positive infinity if positive, negative infinity if negative.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.UP.get = function () {
		return RoundingMode_UP;
	};

	/**
		 * Directed rounding to an integer.
		 * Round towards 0.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.DOWN.get = function () {
		return RoundingMode_DOWN;
	};

	/**
		 * Directed rounding to an integer.
		 * Round up to positive infinity.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.CEILING.get = function () {
		return RoundingMode_CEILING;
	};

	/**
		 * Directed rounding to an integer.
		 * Round down to negative infinity.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.FLOOR.get = function () {
		return RoundingMode_FLOOR;
	};

	/**
		 * Rounding to the nearest integer.
		 * Round half towards positive infinity.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_UP.get = function () {
		return RoundingMode_HALF_UP;
	};

	/**
		 * Rounding to the nearest integer.
		 * Round half towards negative infinity.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_DOWN.get = function () {
		return RoundingMode_HALF_DOWN;
	};

	/**
		 * Rounding to the nearest integer
		 * Round to the nearest side. If the median, round to the even side.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.HALF_EVEN.get = function () {
		return RoundingMode_HALF_EVEN;
	};

	/**
		 * Do not round.
		 * Error if you need to round it.
		 * @returns {typeof RoundingModeEntity}
		 */
	staticAccessors.UNNECESSARY.get = function () {
		return RoundingMode_UNNECESSARY;
	};

	Object.defineProperties( RoundingMode, staticAccessors );

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Configuration class for BigDecimal.
	 */
	var MathContext = function MathContext(precision_or_name, roundingMode) {

		/**
			 * The precision of this BigDecimal.
			 * @type {number}
			 * @private
			 */
		this.precision = 0;
			
		/**
			 * Method of rounding.
			 * @type {RoundingModeEntity}
			 * @private
			 */
		this.roundingMode = roundingMode === undefined ? RoundingMode.HALF_UP : roundingMode;

		if(typeof precision_or_name === "number") {
			this.precision = precision_or_name;
		}
		if(typeof precision_or_name === "string") {
			var buff;
			buff = precision_or_name.match(/precision=\d+/);
			if(buff !== null) {
				buff = buff[0].substring("precision=".length, buff[0].length);
				this.precision = parseInt(buff, 10);
			}
			buff = precision_or_name.match(/roundingMode=\w+/);
			if(buff !== null) {
				buff = buff[0].substring("roundingMode=".length, buff[0].length);
				this.roundingMode = RoundingMode.valueOf(buff);
			}	
		}
		if(this.precision < 0) {
			throw "IllegalArgumentException";
		}
	};

	var staticAccessors$1 = { UNLIMITED: { configurable: true },DECIMAL32: { configurable: true },DECIMAL64: { configurable: true },DECIMAL128: { configurable: true },DECIMAL256: { configurable: true } };

	/**
		 * The precision of this BigDecimal.
		 * @returns {number}
		 */
	MathContext.prototype.getPrecision = function getPrecision () {
		return this.precision;
	};

	/**
		 * Method of rounding.
		 * @returns {RoundingModeEntity}
		 */
	MathContext.prototype.getRoundingMode = function getRoundingMode () {
		return this.roundingMode;
	};

	/**
		 * Equals.
		 * @param {MathContext} x - Number to compare.
		 * @returns {boolean}
		 */
	MathContext.prototype.equals = function equals (x) {
		if(x instanceof MathContext) {
			if(x.toString() === this.toString()) {
				return true;
			}
		}
		return false;
	};

	/**
		 * Convert to string.
		 * @returns {string}
		 */
	MathContext.prototype.toString = function toString () {
		return ("precision=" + this.precision + " roundingMode=" + this.roundingMode.toString());
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * No decimal point limit.
		 * However, an error occurs in the case of cyclic fraction in division.
		 * @returns {MathContext}
		 */
	staticAccessors$1.UNLIMITED.get = function () {
		return DEFINE.UNLIMITED;
	};

	/**
		 * 32-bit floating point.
		 * - Significand precision: 23 bits
		 * - Equivalent of the C language float.
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL32.get = function () {
		return DEFINE.DECIMAL32;
	};


	/**
		 * 64-bit floating point.
		 * - Significand precision: 52 bits
		 * - Equivalent of the C language double.
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL64.get = function () {
		return DEFINE.DECIMAL64;
	};

	/**
		 * 128-bit floating point.
		 * - Significand precision: 112 bits
		 * - Equivalent of the C language long double.
		 * @returns {MathContext}
		 */
	staticAccessors$1.DECIMAL128.get = function () {
		return DEFINE.DECIMAL128;
	};

	/**
		 * 256-bit floating point.
		 * - Significand precision: 237 bits
		 * @type {MathContext}
		 */
	staticAccessors$1.DECIMAL256.get = function () {
		return DEFINE.DECIMAL256;
	};

	Object.defineProperties( MathContext, staticAccessors$1 );

	/**
	 * Collection of constant values used in the class.
	 * @ignore
	 */
	var DEFINE = {

		/**
		 * No decimal point limit.
		 * However, an error occurs in the case of cyclic fraction in division.
		 * @type {MathContext}
		 */
		UNLIMITED	: new MathContext(0,	RoundingMode.HALF_UP),

		/**
		 * 32-bit floating point.
		 * - Significand precision: 23 bits
		 * - Equivalent of the C language float.
		 * @type {MathContext}
		 */
		DECIMAL32	: new MathContext(7,	RoundingMode.HALF_EVEN),

		/**
		 * 64-bit floating point.
		 * - Significand precision: 52 bits
		 * - Equivalent of the C language double.
		 * @type {MathContext}
		 */
		DECIMAL64	: new MathContext(16,	RoundingMode.HALF_EVEN),

		/**
		 * 128-bit floating point.
		 * - Significand precision: 112 bits
		 * - Equivalent of the C language long double.
		 * @type {MathContext}
		 */
		DECIMAL128	: new MathContext(34,	RoundingMode.HALF_EVEN),

		/**
		 * 256-bit floating point.
		 * - Significand precision: 237 bits
		 * @type {MathContext}
		 */
		DECIMAL256	: new MathContext(72,	RoundingMode.HALF_EVEN)
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	// @ts-ignore
	//import BigDecimal from "./BigDecimal.mjs";

	/**
	 * Random number class to be used when the random number class is not set.
	 * @type {Random}
	 * @ignore
	 */
	var DEFAULT_RANDOM = new Random();

	/**
	 * Collection of functions used in BigInteger.
	 * @ignore
	 */
	var BigIntegerTool = function BigIntegerTool () {};

	BigIntegerTool.toHexadecimalArrayFromPlainString = function toHexadecimalArrayFromPlainString (text, radix) {
		// 下の変換をすることで、2進数での変換時に内部のforの繰り返す回数が減る
		// v0.03 出来る限りまとめてn進数変換する
		var max_num = 0x3FFFFFFF;
		var keta = Math.floor( Math.log(max_num) / Math.log(radix) );
		var x = [];
		var y = [];
		var len = Math.ceil(text.length / keta);
		var offset = text.length;
		for(var i = 0; i < len; i++ ) {
			offset -= keta;
			if(offset >= 0) {
				x[i] = parseInt(text.substring(offset, offset + keta), radix);
			}
			else {
				x[i] = parseInt(text.substring(0, offset + keta), radix);
			}
		}
		var calcradix = Math.round(Math.pow(radix, keta));
		// v0.03ここまで
		// 2で割っていくアルゴリズムで2進数に変換する
		while(x.length !==  0) {
			// 2で割っていく
			// 隣の桁でたcarryはradix進数をかけて桁上げしてる
			var carry = 0;
			for(var i$1 = x.length - 1; i$1 >= 0; i$1--) {
				var a = x[i$1] + carry * calcradix;
				x[i$1]  = a >>> 1;
				carry = a & 1;
			}
			// 1余るかどうかをテストする
			y[y.length] = carry;
			// xが0になっている部分は削除していく
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		// メモリ節約のため1つの変数（16ビット）に収めるだけ収めていく
		x = [];
		for(var i$2 = 0; i$2 < y.length; i$2++) {
			x[i$2 >>> 4] |= y[i$2] << (i$2 & 0xF);
		}
		return x;
	};

	/**
		 * Remove exponent notation in strings representing unsigned numbers.
		 * @param {string} ntext 
		 * @returns {string}
		 */
	BigIntegerTool.toPlainStringFromString = function toPlainStringFromString (ntext) {
		var scale = 0;
		var buff;
		// 正規化
		var text = ntext.replace(/\s/g, "").toLowerCase();
		var number_text = [];
		// 整数部を抽出
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text.push(buff);
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text.push(buff);
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale -= parseInt(buff, 10);
		}
		// 出力用の文字を作成
		var output_string;
		if(scale === 0) {
			output_string = number_text.join("");
		}
		if(scale < 0) {
			for(var i = 0; i < -scale; i++) {
				number_text.push("0");
			}
			output_string = number_text.join("");
		}
		else if(scale > 0) {
			output_string = number_text.join("");
			output_string = output_string.substring(0, output_string.length - scale);
			output_string = output_string.length !== 0 ? output_string : "0";
		}
		return output_string;
	};

	/**
		 * Return a hexadecimal array from the number.
		 * @param {number} num - Target number.
		 * @returns {{element : Array<number>, _sign : number}} Data for BigInteger.
		 */
	BigIntegerTool.toBigIntegerFromNumber = function toBigIntegerFromNumber (num) {
		var x;
		var sign;
		if(num === 0) {
			sign = 0;
			x = 0;
		}
		else if(num > 0) {
			sign = 1;
			x = num;
		}
		else {
			sign = -1;
			x = -num;
		}
		if(x > 0xFFFFFFFF) {
			return {
				element : BigIntegerTool.toHexadecimalArrayFromPlainString(BigIntegerTool.toPlainStringFromString(x.toFixed()), 10),
				_sign : sign
			};
		}
		var y = [];
		while(x !==  0) {
			y[y.length] = x & 1;
			x >>>= 1;
		}
		var z = [];
		for(var i = 0; i < y.length; i++) {
			z[i >>> 4] |= y[i] << (i & 0xF);
		}
			
		return {
			element : z,
			_sign : sign
		};
	};

	/**
		 * Return string of number from a hexadecimal array.
		 * @param {Array<number>} binary - Hex array.
		 * @param {number} radix - Base number.
		 * @returns {Array<number>} Numeric array for each digit in the specified base number.
		 */
	BigIntegerTool.toPlainStringFromHexadecimalArray = function toPlainStringFromHexadecimalArray (binary, radix) {
		var add = function(x1, x2, y) {
			var size = x1.length;
			var carry = 0;
			for(var i = 0; i < size; i++) {
				y[i] = x1[i] + ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(y[i] >= radix) {
					carry = 1;
					y[i] -= radix;
				}
				else {
					carry = 0;
				}
			}
			if(carry === 1) {
				y[size] = 1;
			}
		};
		var y = [0];
		var t = [1];
		for(var i = 0;i < binary.length;i++) {
			for(var j = 0; j < 16; j++) {
				if((binary[i] >>> j) & 1) {
					add(t, y, y);
				}
				add(t, t, t);
			}
		}
		return y;
	};

	/**
		 * Return data to represent multi-precision numbers from strings.
		 * @param {string} text - String containing a number.
		 * @param {number} [radix=10] - Base number.
		 * @returns {{element : Array<number>, _sign : number}} Data for BigInteger.
		 */
	BigIntegerTool.toBigIntegerFromString = function toBigIntegerFromString (text, radix) {
		var x = text.replace(/\s/g, "").toLowerCase();
		var sign_text = x.match(/^[-+]+/);

		var element     = [];
		var _sign        = 1;

		if(sign_text !== null) {
			var hit_text = sign_text[0];
			x = x.substring(hit_text.length, x.length);
			if(hit_text.indexOf("-") !== -1) {
				_sign = -1;
			}
		}

		if(radix) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x, radix);
		}
		else if(/^0x/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 16);
		}
		else if(/^0b/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 2);
		}
		else if(/^0o/.test(x)) {
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x.substring(2, x.length), 8);
		}
		else {
			x = BigIntegerTool.toPlainStringFromString(x);
			element = BigIntegerTool.toHexadecimalArrayFromPlainString(x, 10);
		}
		// "0"の場合がある為
		if((element.length === 1)&&(element[0] === 0)) {
			element = [];
			_sign = 0;
		}

		return {
			element : element,
			_sign : _sign
		};
	};

	// 内部では1変数内の中の16ビットごとに管理
	// 2変数で16ビット*16ビットで32ビットを表す
	// this.element	...	16ビットごとに管理
	// this._sign	...	負なら-1、正なら1、ゼロなら0
	//
	// 本クラスはイミュータブルです。
	// 内部の「_」から始まるメソッドは内部計算用で非公開です。またミュータブルです。

	/**
	 * Arbitrary-precision integer class (immutable).
	 */
	var BigInteger = function BigInteger(number) {
			
		if(arguments.length === 0) {

			/**
				 * An integer consisting of 16 bits per element of the array.
				 * @private
				 * @type {Array<number>}
				 */
			this.element     = [];

			/**
				 * Positive or negative signs of number.
				 * - +1 if positive, -1 if negative, 0 if 0.
				 * - This value may not be correct ?
				 * @private
				 * @type {number}
				 */
			this._sign        = 0;
		}
		else if(arguments.length === 1) {
			this._sign = 1;
			if(number instanceof BigInteger) {
				this.element = number.element.slice(0);
				this._sign = number._sign;
			}
			else if(typeof number === "number") {
				var x = BigIntegerTool.toBigIntegerFromNumber(number);
				this.element = x.element;
				this._sign = x._sign;
			}
			else if(typeof number === "string") {
				var x$1 = BigIntegerTool.toBigIntegerFromString(number);
				this.element = x$1.element;
				this._sign = x$1._sign;
			}
			else if(number instanceof Array) {
				if((number.length === 2) && (typeof number[0] === "string")) {
					var x$2 = BigIntegerTool.toBigIntegerFromString(number[0], number[1]);
					this.element = x$2.element;
					this._sign = x$2._sign;
				}
				else {
					throw "BigInteger Unsupported argument " + arguments;
				}
			}
			else if((number instanceof Object) && (number.toBigInteger)) {
				var x$3 = number.toBigInteger();
				this.element = x$3.element;
				this._sign = x$3._sign;
			}
			else if((number instanceof Object) && (number.intValue)) {
				var x$4 = BigIntegerTool.toBigIntegerFromNumber(number.intValue);
				this.element = x$4.element;
				this._sign = x$4._sign;
			}
			else if(number instanceof Object) {
				var x$5 = BigIntegerTool.toBigIntegerFromString(number.toString());
				this.element = x$5.element;
				this._sign = x$5._sign;
			}
			else {
				throw "BigInteger Unsupported argument " + number;
			}
		}
		else {
			throw "BigInteger Unsupported argument " + number;
		}
	};

	var prototypeAccessors = { intValue: { configurable: true },longValue: { configurable: true },doubleValue: { configurable: true } };
	var staticAccessors$2 = { MINUS_ONE: { configurable: true },ZERO: { configurable: true },ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true } };

	/**
		 * Create an entity object of this class.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 */
	BigInteger.create = function create (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * Create an arbitrary-precision integer.
		 * - Does not support strings using exponential notation.
		 * - If you want to initialize with the specified base number, please set up with an array ["ff", 16].
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 */
	BigInteger.valueOf = function valueOf (number) {
		return BigInteger.create(number);
	};

	/**
		 * Convert to BigInteger.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger._toBigInteger = function _toBigInteger (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * Convert to real number.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigInteger._toFloat = function _toFloat (number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigInteger) {
			return number.doubleValue;
		}
		else {
			return (new BigInteger(number)).doubleValue;
		}
	};

	/**
		 * Convert to integer.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigInteger._toInteger = function _toInteger (number) {
		if(typeof number === "number") {
			return Math.trunc(number);
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	};

	/**
		 * Random number of specified bit length.
		 * @param {BigInteger|number|string|Array<string|number>|Object} bitsize - Bit length.
		 * @param {Random} [random] - Class for creating random numbers.
		 * @returns {BigInteger}
		 */
	BigInteger.createRandomBigInteger = function createRandomBigInteger (bitsize, random) {
		var rand = (random && (random instanceof Random)) ? random : DEFAULT_RANDOM;
		var x = new BigInteger();
		x._sign = 1;
		var bits = BigInteger._toInteger(bitsize);
		var size = ((bits - 1) >> 4) + 1;
		if(bits === 0) {
			return BigInteger.ZERO;
		}
		var r;
		for(var i = 0, j = 0; i < size; i++) {
			if(j === 0) {
				r = rand.nextInt(); // 32ビットずつ作成する
				x.element[i] = r & 0xFFFF;
				j = 1;
			}
			else {
				x.element[i] = (r >>> 16) & 0xFFFF;
				j = 0;
			}
		}
		// 1～15ビット余る場合は、16ビットずつ作成しているので削る
		if((bits % 16) !== 0) {
			x.element[x.element.length - 1] &= (1 << (bits % 16)) - 1;
		}
		// 最後のビットに 0 をたくさん作成していると、
		// 0のみのデータになる可能性があるためメモリを修正
		x._memory_reduction();
		return x;
	};

	/**
		 * Convert to string.
		 * @param {BigInteger|number|string|Array<string|number>|Object} [radix=10] - Base number.
		 * @returns {string}
		 */
	BigInteger.prototype.toString = function toString (radix) {
		var radix_ = radix ? BigInteger._toInteger(radix) : 10;

		// int型で扱える数値で toString が可能なので、
		// せっかくだからより大きな進数で計算していけば、あとでtoStringする回数が減るテクニック
		// 2進数であれば、2^n乗で計算しても問題がない 4進数や8進数で計算して、2進数に戻せば巡回少数なし
		// v0.03 出来る限りまとめてn進数変換する
		var max_num = 0x3FFFFFFF;
		//                        max_num > radix^x
		// floor(log max_num / log radix) = x
		var keta = Math.floor( Math.log(max_num) / Math.log(radix_) );
		var calcradix = Math.round(Math.pow(radix_, keta));
		// zeros = "00000000...."
		var zeros_array = [];
		for(var i = 0; i < keta; i++) {
			zeros_array[i] = "0";
		}
		var zeros_string = zeros_array.join("");
		// v0.03ここまで
		var x = BigIntegerTool.toPlainStringFromHexadecimalArray(this.element, calcradix);
		var y = [];
		var z = "";
		if(this.signum() < 0) {
			y[y.length] = "-";
		}
		for(var i$1 = x.length - 1; i$1 >= 0; i$1--) {
			z = x[i$1].toString(radix_);
			if(i$1 < (x.length - 1)) {
				y[y.length] = zeros_string.substring(0, keta - z.length);
			}
			y[y.length] = z;
		}
		return y.join("");
	};

	/**
		 * Deep copy.
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.clone = function clone () {
		return new BigInteger(this);
	};

	/**
		 * Create a numerical value for addition. If negative, two's complement.
		 * @param {number} [bit_length] - Bit length. If not set, it will be calculated automatically.
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype.getTwosComplement = function getTwosComplement (bit_length) {
		var y = this.clone();
		if(y._sign >= 0) {
			return y;
		}
		else {
			// 正にする
			y._sign = 1;
			// ビットの数が存在しない場合は数える
			var len = (bit_length !== undefined) ? bit_length : y.bitLength();
			var e = y.element;
			// ビット反転後
			for(var i = 0; i < e.length; i++) {
				e[i] ^= 0xFFFF;
			}
			// 1～15ビット余る場合は、16ビットずつ作成しているので削る
			// nビットのマスク（なお負の値を表す最上位ビットは削除する）
			if((len % 16) !== 0) {
				e[e.length - 1] &= (1 << (len % 16)) - 1;
			}
			// 1を加算
			y._add(new BigInteger(1));
			return y;
		}
	};

	/**
		 * Expand memory to specified bit length. (mutable)
		 * @param {number} bit_length - Bit length.
		 * @private
		 */
	BigInteger.prototype._memory_allocation = function _memory_allocation (bit_length) {
		var n = BigInteger._toInteger(bit_length);
		var elementsize = this.element.length << 4;
		if(elementsize < n) {
			var addsize = (((n - elementsize - 1) & 0xFFFFFFF0) >>> 4) + 1;
			for(var i = 0;i < addsize;i++) {
				this.element[this.element.length] = 0;
			}
		}
	};

	/**
		 * Normalization of the internal data. (mutable)
		 * @private
		 */
	BigInteger.prototype._memory_reduction = function _memory_reduction () {
		for(var i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !==  0) {
				if(i < this.element.length - 1) {
					this.element.splice(i + 1, this.element.length - i - 1);
				}
				return;
			}
		}
		this._sign = 0;
		this.element = [];
	};

	/**
		 * Absolute value. (mutable)
		 * @returns {BigInteger} A = abs(A)
		 * @private
		 */
	BigInteger.prototype._abs = function _abs () {
		// -1 -> 1, 0 -> 0, 1 -> 1
		this._sign *= this._sign;
		return this;
	};

	/**
		 * Absolute value.
		 * @returns {BigInteger} abs(A)
		 */
	BigInteger.prototype.abs = function abs () {
		return this.clone()._abs();
	};

	/**
		 * this *= -1
		 * @returns {BigInteger} A = -A
		 * @private
		 */
	BigInteger.prototype._negate = function _negate () {
		this._sign *= -1;
		return this;
	};

	/**
		 * this * -1
		 * @returns {BigInteger} -A
		 */
	BigInteger.prototype.negate = function negate () {
		return this.clone()._negate();
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {number}
		 */
	BigInteger.prototype.signum = function signum () {
		if(this.element.length === 0) {
			return 0;
		}
		return this._sign;
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {number}
		 */
	BigInteger.prototype.sign = function sign () {
		return this.signum();
	};

	// ----------------------
	// 四則演算
	// ----------------------
		
	/**
		 * Add. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A += B
		 * @private
		 */
	BigInteger.prototype._add = function _add (number) {
		var val = BigInteger._toBigInteger(number);
		var o1 = this;
		var o2 = val;
		var x1 = o1.element;
		var x2 = o2.element;
		if(o1._sign === o2._sign) {
			//足し算
			this._memory_allocation(x2.length << 4);
			var carry = 0;
			for(var i = 0; i < x1.length; i++) {
				x1[i] += ((x2.length >= (i + 1)) ? x2[i] : 0) + carry;
				if(x1[i] > 0xFFFF) {
					carry = 1;
					x1[i] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x1[x1.length] = carry;
			}
		}
		else {
			// 引き算
			var compare = o1.compareToAbs(o2);
			if(compare === 0) {
				this.element = [];
				this._sign = 1;
				return this;
			}
			else if(compare === -1) {
				this._sign = o2._sign;
				var swap = x1;
				x1 = x2.slice(0);
				x2 = swap;
			}
			var carry$1 = 0;
			for(var i$1 = 0; i$1 < x1.length; i$1++) {
				x1[i$1] -= ((x2.length >= (i$1 + 1)) ? x2[i$1] : 0) + carry$1;
				if(x1[i$1] < 0) {
					x1[i$1] += 0x10000;
					carry$1  = 1;
				}
				else {
					carry$1  = 0;
				}
			}
			this.element = x1;
			this._memory_reduction();
		}
		return this;
	};

	/**
		 * Add.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A + B
		 */
	BigInteger.prototype.add = function add (number) {
		return this.clone()._add(number);
	};

	/**
		 * Subtract. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A -= B
		 * @private
		 */
	BigInteger.prototype._subtract = function _subtract (number) {
		var val = BigInteger._toBigInteger(number);
		var _sign = val._sign;
		var out  = this._add(val._negate());
		val._sign = _sign;
		return out;
	};

	/**
		 * Subtract.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A - B
		 */
	BigInteger.prototype.subtract = function subtract (number) {
		return this.clone()._subtract(number);
	};

	/**
		 * Subtract.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A - B
		 */
	BigInteger.prototype.sub = function sub (number) {
		return this.subtract(number);
	};

	/**
		 * Multiply. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A *= B
		 * @private
		 */
	BigInteger.prototype._multiply = function _multiply (number) {
		var x = this.multiply(number);
		this.element = x.element;
		this._sign    = x._sign;
		return this;
	};

	/**
		 * Multiply.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A * B
		 */
	BigInteger.prototype.multiply = function multiply (number) {
		var val = BigInteger._toBigInteger(number);
		var out  = new BigInteger();
		var buff = new BigInteger();
		var o1 = this;
		var o2 = val;
		var x1 = o1.element;
		var x2 = o2.element;
		var y  = out.element;
		for(var i = 0; i < x1.length; i++) {
			buff.element = [];
			// x3 = x1[i] * x2
			var x3 = buff.element;
			var carry = 0;
			for(var j = 0; j < x2.length; j++) {
				x3[j] = x1[i] * x2[j] + carry;
				if(x3[j] > 0xFFFF) {
					carry = x3[j] >>> 16;
					x3[j] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				x3[x3.length] = carry;
			}
			// x3 = x3 << (i * 16)
			//buff._shift(i << 4);
			for(var j$1 = x3.length - 1; j$1 >= 0; j$1--) {
				x3[j$1 + i] = x3[j$1];
			}
			for(var j$2 = i - 1; j$2 >= 0; j$2--) {
				x3[j$2] = 0;
			}
			// y = y + x3 (out._add(buff))
			//out._add(buff);
			carry = 0;
			out._memory_allocation(x3.length << 4);
			for(var j$3 = i; j$3 < y.length; j$3++) {
				y[j$3] += ((x3.length >= (j$3 + 1)) ? x3[j$3] : 0) + carry;
				if(y[j$3] > 0xFFFF) {
					carry = 1;
					y[j$3] &= 0xFFFF;
				}
				else {
					carry = 0;
				}
			}
			if(carry !== 0) {
				y[y.length] = carry;
			}
		}
		out._sign = this._sign * val._sign;
		return out;
	};

	/**
		 * Multiply.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A * B
		 */
	BigInteger.prototype.mul = function mul (number) {
		return this.multiply(number);
	};

	/**
		 * Divide and remainder. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
		 * @private
		 */
	BigInteger.prototype._divideAndRemainder = function _divideAndRemainder (number) {
		var val = BigInteger._toBigInteger(number);
		var out = [];
		if(val.signum() === 0) {
			throw "BigInteger divideAndRemainder [" + val.toString() +"]";
		}
		var compare = this.compareToAbs(val);
		if(compare < 0) {
			out[0] = new BigInteger(0);
			out[1] = this.clone();
			return out;
		}
		else if(compare === 0) {
			out[0] = new BigInteger(1);
			out[0]._sign = this._sign * val._sign;
			out[1] = new BigInteger(0);
			return out;
		}
		var ONE = new BigInteger(1);
		var size = this.bitLength() - val.bitLength();
		var x1 = this.clone()._abs();
		var x2 = val.shift(size)._abs();
		var y  = new BigInteger();
		for(var i = 0; i <= size; i++) {
			if(x1.compareToAbs(x2) >= 0) {
				x1._subtract(x2);
				y._add(ONE);
			}
			if(i === size) {
				break;
			}
			x2._shift(-1);
			y._shift(1);
		}
		out[0] = y;
		out[0]._sign = this._sign * val._sign;
		out[1] = x1;
		out[1]._sign = this._sign;
		return out;
	};

	/**
		 * Divide and remainder.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
		 */
	BigInteger.prototype.divideAndRemainder = function divideAndRemainder (number) {
		return this.clone()._divideAndRemainder(number);
	};

	/**
		 * Divide. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} fix(A / B)
		 * @private
		 */
	BigInteger.prototype._divide = function _divide (number) {
		return this._divideAndRemainder(number)[0];
	};

	/**
		 * Divide.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} fix(A / B)
		 */
	BigInteger.prototype.divide = function divide (number) {
		return this.clone()._divide(number);
	};

	/**
		 * Divide.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} fix(A / B)
		 */
	BigInteger.prototype.div = function div (number) {
		return this.divide(number);
	};

	/**
		 * Remainder of division. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A %= B
		 * @private
		 */
	BigInteger.prototype._remainder = function _remainder (number) {
		return this._divideAndRemainder(number)[1];
	};

	/**
		 * Remainder of division.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A % B
		 */
	BigInteger.prototype.remainder = function remainder (number) {
		return this.clone()._remainder(number);
	};

	/**
		 * Remainder of division.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A % B
		 */
	BigInteger.prototype.rem = function rem (number) {
		return this.remainder(number);
	};

	/**
		 * Modulo, positive remainder of division. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A = A mod B
		 * @private
		 */
	BigInteger.prototype._mod = function _mod (number) {
		var val = BigInteger._toBigInteger(number);
		if(val.signum() < 0) {
			return null;
		}
		var y = this._divideAndRemainder(val);
		if(y[1] instanceof BigInteger) {
			if(y[1].signum() >= 0) {
				return y[1];
			}
			else {
				return y[1]._add(val);
			}
		}
		return null;
	};

	/**
		 * Modulo, positive remainder of division.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} A mod B
		 */
	BigInteger.prototype.mod = function mod (number) {
		return this.clone()._mod(number);
	};

	/**
		 * Modular exponentiation.
		 * @param {BigInteger|number|string|Array<string|number>|Object} exponent
		 * @param {BigInteger|number|string|Array<string|number>|Object} m 
		 * @returns {BigInteger} A^B mod m
		 */
	BigInteger.prototype.modPow = function modPow (exponent, m) {
		var m_ = BigInteger._toBigInteger(m);
		var x = new BigInteger(this);
		var y = new BigInteger(1);
		var e = new BigInteger(exponent);
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x).mod(m_);
			}
			x = x.multiply(x).mod(m_);
			e._shift(-1);
		}
		return y;
	};

	/**
		 * Modular multiplicative inverse.
		 * @param {BigInteger|number|string|Array<string|number>|Object} m
		 * @returns {BigInteger} A^(-1) mod m
		 */
	BigInteger.prototype.modInverse = function modInverse (m) {
		var m_ = BigInteger._toBigInteger(m);
		var y = this.extgcd(m);
		var ONE  = new BigInteger(1);
		if(y[2].compareTo(ONE) !== 0) {
			return null;
		}
		// 正にするため remainder ではなく mod を使用する
		return y[0]._add(m_)._mod(m_);
	};

	// ----------------------
	// その他の演算
	// ----------------------
		
	/**
		 * Factorial function, x!.
		 * @returns {BigInteger} n!
		 */
	BigInteger.prototype.factorial = function factorial () {
		var loop_max = BigInteger._toInteger(this);
		var x = BigInteger.ONE;
		for(var i = 2; i <= loop_max; i++) {
			x = x.multiply(i);
		}
		return x;
	};

	/**
		 * Multiply a multiple of ten.
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} x * 10^n
		 */
	BigInteger.prototype.scaleByPowerOfTen = function scaleByPowerOfTen (n) {
		var x = BigInteger._toInteger(n);
		if(x === 0) {
			return this;
		}
		if(x > 0) {
			return this.mul(BigInteger.TEN.pow(x));
		}
		else {
			return this.div(BigInteger.TEN.pow(x));
		}
	};

	// ----------------------
	// 指数
	// ----------------------
		
	/**
		 * Power function.
		 * @param {BigInteger|number|string|Array<string|number>|Object} exponent
		 * @returns {BigInteger} pow(A, B)
		 */
	BigInteger.prototype.pow = function pow (exponent) {
		var e = new BigInteger(exponent);
		var x = BigInteger._toBigInteger(this);
		var y = BigInteger._toBigInteger(1);
		while(e.element.length !== 0) {
			if((e.element[0] & 1) !== 0) {
				y = y.multiply(x);
			}
			x = x.multiply(x);
			e._shift(-1);
		}
		return y;
	};

	/**
		 * Square.
		 * @returns {BigInteger} A^2
		 */
	BigInteger.prototype.square = function square () {
		return this.mul(this);
	};

	/**
		 * Square root.
		 * @returns {BigInteger} floor(sqrt(A))
		 */
	BigInteger.prototype.sqrt = function sqrt () {
		if(this.sign() <= 0) {
			throw "ArithmeticException";
		}
		var precision = this.toString(10).replace(/^-/, "").length;
		var x0 = BigInteger.ONE.scaleByPowerOfTen(precision);
		var xn = x0;
		for(var i = 0; i < 300; i++) {
			var xn1 = xn.add(this.div(xn)).shiftRight(1);
			var delta = xn1.sub(xn);
			if(delta.isZero()) {
				break;
			}
			xn = xn1;
		}
		return xn;
	};

	// ----------------------
	// 環境設定用
	// ----------------------
		
	/**
		 * Set default class of random.
		 * This is used if you do not specify a random number.
		 * @param {Random} random
		 */
	BigInteger.setDefaultRandom = function setDefaultRandom (random) {
		DEFAULT_RANDOM = random;
	};

	/**
		 * Return default Random class.
		 * Used when Random not specified explicitly.
		 * @returns {Random}
		 */
	BigInteger.getDefaultRandom = function getDefaultRandom () {
		return DEFAULT_RANDOM;
	};

	// ----------------------
	// 他の型に変換用
	// ----------------------
		
	/**
		 * Value at the specified position of the internally used array that composed of hexadecimal numbers.
		 * @param {BigInteger|number|string|Array<string|number>|Object} point - Array address.
		 * @returns {number}
		 */
	BigInteger.prototype.getShort = function getShort (point) {
		var n = BigInteger._toInteger(point);
		if((n < 0) || (this.element.length <= n)) {
			return 0;
		}
		return this.element[n];
	};

	/**
		 * 32-bit integer value.
		 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
		 * @returns {number}
		 */
	prototypeAccessors.intValue.get = function () {
		var x = this.getShort(0) + (this.getShort(1) << 16);
		x &= 0xFFFFFFFF;
		if((x > 0)&&(this._sign < 0)) {
			x = -x;
		}
		return x;
	};

	/**
		 * 64-bit integer value.
		 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
		 * @returns {number}
		 */
	prototypeAccessors.longValue.get = function () {
		var x = 0;
		for(var i = 3; i >= 0; i--) {
			x *= 65536;
			x += this.getShort(i);
		}
		if(this._sign < 0) {
			x = -x;
		}
		return x;
	};

	/**
		 * 64-bit floating point.
		 * - If it is outside the range of JavaScript Number, it will not be an accurate number.
		 * @returns {number}
		 */
	prototypeAccessors.doubleValue.get = function () {
		return parseFloat(this.toString());
	};
		
	// ----------------------
	// gcd, lcm
	// ----------------------
		
	/**
		 * Euclidean algorithm.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} gcd(x, y)
		 */
	BigInteger.prototype.gcd = function gcd (number) {
		var val = BigInteger._toBigInteger(number);
		/**
			 * @type {any}
			 */
		var x = this, y = val, z;
		while(y.signum() !== 0) {
			z = x.remainder(y);
			x = y;
			y = z;
		}
		return x;
	};

	/**
		 * Extended Euclidean algorithm.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {Array<BigInteger>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
		 */
	BigInteger.prototype.extgcd = function extgcd (number) {
		var val = BigInteger._toBigInteger(number);
		// 非再帰
		var ONE  = new BigInteger(1);
		var ZERO = new BigInteger(0);
		/**
			 * @type {any}
			 */
		var r0 = this, r1 = val, r2, q1;
		var a0 = ONE,  a1 = ZERO, a2;
		var b0 = ZERO, b1 = ONE,  b2;
		while(r1.signum() !== 0) {
			var y = r0.divideAndRemainder(r1);
			q1 = y[0];
			r2 = y[1];
			a2 = a0.subtract(q1.multiply(a1));
			b2 = b0.subtract(q1.multiply(b1));
			a0 = a1;
			a1 = a2;
			b0 = b1;
			b1 = b2;
			r0 = r1;
			r1 = r2;
		}
		return [a0, b0, r0];
	};

	/**
		 * Least common multiple.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} lcm(x, y)
		 */
	BigInteger.prototype.lcm = function lcm (number) {
		var val = BigInteger._toBigInteger(number);
		return this.mul(val).div(this.gcd(val));
	};

	// ----------------------
	// 比較
	// ----------------------
		
	/**
		 * Equals.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {boolean} A === B
		 */
	BigInteger.prototype.equals = function equals (number) {
		var x = BigInteger._toBigInteger(number);
		if(this.signum() !== x.signum()) {
			return false;
		}
		if(this.element.length !== x.element.length) {
			return false;
		}
		for(var i = 0; i < x.element.length; i++) {
			if(this.element[i] !==  x.element[i]) {
				return false;
			}
		}
		return true;
	};

	/**
		 * Compare values without sign.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
		 */
	BigInteger.prototype.compareToAbs = function compareToAbs (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.element.length < val.element.length) {
			return -1;
		}
		else if(this.element.length > val.element.length) {
			return 1;
		}
		for(var i = this.element.length - 1;i >= 0;i--) {
			if(this.element[i] !== val.element[i]) {
				var x = this.element[i] - val.element[i];
				return ( (x === 0) ? 0 : ((x > 0) ? 1 : -1) );
			}
		}
		return 0;
	};

	/**
		 * Compare values.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	BigInteger.prototype.compareTo = function compareTo (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.signum() !== val.signum()) {
			if(this._sign > val._sign) {
				return 1;
			}
			else {
				return -1;
			}
		}
		else if(this.signum() === 0) {
			return 0;
		}
		return this.compareToAbs(val) * this._sign;
	};

	/**
		 * Maximum number.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} max([A, B])
		 */
	BigInteger.prototype.max = function max (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * Minimum number.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number
		 * @returns {BigInteger} min([A, B])
		 */
	BigInteger.prototype.min = function min (number) {
		var val = BigInteger._toBigInteger(number);
		if(this.compareTo(val) >= 0) {
			return val.clone();
		}
		else {
			return this.clone();
		}
	};

	/**
		 * Clip number within range.
		 * @param {BigInteger|number|string|Array<string|number>|Object} min 
		 * @param {BigInteger|number|string|Array<string|number>|Object} max
		 * @returns {BigInteger} min(max(x, min), max)
		 */
	BigInteger.prototype.clip = function clip (min, max) {
		var min_ = BigInteger._toBigInteger(min);
		var max_ = BigInteger._toBigInteger(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	// ----------------------
	// 素数系
	// ----------------------
		
	/**
		 * Prime represented within the specified bit length.
		 * @param {BigInteger|number|string|Array<string|number>|Object} bits - Bit length.
		 * @param {Random} [random] - Class for creating random numbers.
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
		 * @param {BigInteger|number|string|Array<string|number>|Object} [create_count=500] - Number of times to retry if prime generation fails.
		 * @returns {BigInteger}
		 */
	BigInteger.probablePrime = function probablePrime (bits, random, certainty, create_count ) {
		var certainty_ = certainty ? BigInteger._toInteger(certainty) : 100;
		var create_count_ = create_count ? BigInteger._toInteger(create_count) : 500;
		for(var i = 0; i < create_count_; i++) {
			var x = BigInteger.createRandomBigInteger(bits, random);
			if(x.isProbablePrime(certainty_)) {
				return x;
			}
		}
		throw "probablePrime " + create_count;
	};

	/**
		 * Return true if the value is prime number by Miller-Labin prime number determination method.
		 * Attention : it takes a very long time to process.
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
		 * @returns {boolean}
		 */
	BigInteger.prototype.isProbablePrime = function isProbablePrime (certainty) {
		var e = this.element;
		//0, 1, 2 -> true
		if( (e.length === 0) || ((e.length === 1)&&(e[0] <= 2)) ) {
			return true;
		}
		//even number -> false
		else if((e[0] & 1) === 0) {
			return false;
		}
		// ミラーラビン素数判定法
		// かなり処理が重たいです。まあお遊び程度に使用という感じで。
		var loop= certainty !== undefined ? BigInteger._toInteger(certainty) : 100;
		var ZERO= new BigInteger(0);
		var ONE= new BigInteger(1);
		var n	= this;
		var LEN= n.bitLength();
		var n_1= n.subtract(ONE);
		var s = n_1.getLowestSetBit();
		var d = n_1.shift(-s);

		if(loop <= 0) {
			return false;
		}

		for(var i = 0; i < loop; i++ ) {
			//[ 1, n - 1] の範囲から a を選択
			var a = (void 0);
			do {
				a = BigInteger.createRandomBigInteger(LEN);
			} while(( a.compareTo(ZERO) === 0 )||( a.compareTo(n) !== -1 ));

			var t = d;
			// a^t != 1 mod n
			var y = a.modPow(t, n);
				
			while(true) {
				if((t.equals(n_1)) || (y.equals(ONE)) || (y.equals(n_1))) {
					break;
				}
				y = y.mul(y)._mod(n);
				t = t.shiftLeft(1);
			}

			if((!y.equals(n_1)) && ((t.element[0] & 1) === 0)) {
				return false;
			}
		}
		return true;
	};

	/**
		 * Next prime.
		 * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
		 * @param {BigInteger|number|string|Array<string|number>|Object} [search_max=100000] - Search range of next prime.
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.nextProbablePrime = function nextProbablePrime (certainty, search_max) {
		var loop= certainty !== undefined ? (BigInteger._toInteger(certainty) >> 1) : 100 / 2;
		var search_max_ = search_max !== undefined ? BigInteger._toInteger(search_max) : 100000;
		var x = this.clone();
		for(var i = 0; i < search_max_; i++) {
			x._add(BigInteger.ONE);
			if(x.isProbablePrime(loop)) {
				return x;
			}
		}
		throw "nextProbablePrime [" + search_max_ +"]";
	};

	// ----------------------
	// シフト演算系
	// ----------------------
		
	/**
		 * this <<= n
		 * @param {BigInteger|number|string|Array<string|number>|Object} shift_length - Bit shift size.
		 * @returns {BigInteger} A <<= n
		 * @private
		 */
	BigInteger.prototype._shift = function _shift (shift_length) {
		var n = BigInteger._toInteger(shift_length);
		if(n === 0) {
			return this;
		}
		var x = this.element;
		// 1ビットなら専用コードで高速計算
		if(n === 1) {
			var i = x.length - 1;
			if((x[i] & 0x8000) !==  0) {
				x[x.length] = 1;
			}
			for(;i >= 0;i--) {
				x[i] <<= 1;
				x[i]  &= 0xFFFF;
				if((i > 0) && ((x[i - 1] & 0x8000) !==  0)) {
					x[i] += 1;
				}
			}
		}
		else if(n === -1) {
			for(var i$1 = 0;i$1 < x.length;i$1++) {
				x[i$1] >>>= 1;
				if((i$1 < x.length - 1) && ((x[i$1 + 1] & 1) !==  0)) {
					x[i$1] |= 0x8000;
				}
			}
			if(x[x.length - 1] === 0) {
				x.pop();
			}
		}
		else {
			// 16ビット単位なら配列を追加削除する高速計算
			if(n >= 16) {
				var m = n >>> 4;
				for(var i$2 = x.length - 1; i$2 >= 0; i$2--) {
					x[i$2 + m] = x[i$2];
				}
				for(var i$3 = m - 1; i$3 >= 0; i$3--) {
					x[i$3] = 0;
				}
				n &= 0xF;
			}
			else if(n <= -16){
				var m$1 = (-n) >>> 4;
				x.splice(0, m$1);
				n += m$1 << 4;
			}
			if(n !== 0) {
				// 15ビット以内ならビット演算でまとめて操作
				if(0 < n) {
					var carry = 0;
					for(var i$4 = 0; i$4 < x.length; i$4++) {
						x[i$4] = (x[i$4] << n) + carry;
						if(x[i$4] > 0xFFFF) {
							carry = x[i$4] >>> 16;
							x[i$4] &= 0xFFFF;
						}
						else {
							carry = 0;
						}
					}
					if(carry !== 0) {
						x[x.length] = carry;
					}
				}
				else {
					n = -n;
					for(var i$5 = 0; i$5 < x.length; i$5++) {
						if(i$5 !== x.length - 1) {
							x[i$5] += x[i$5 + 1] << 16;
							x[i$5] >>>= n;
							x[i$5] &= 0xFFFF;
						}
						else {
							x[i$5] >>>= n;
						}
					}
					if(x[x.length - 1] === 0) {
						x.pop();
					}
				}
			}
		}
		return this;
	};

	/**
		 * this << n
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A << n
		 */
	BigInteger.prototype.shift = function shift (n) {
		return this.clone()._shift(n);
	};

	/**
		 * this << n
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A << n
		 */
	BigInteger.prototype.shiftLeft = function shiftLeft (n) {
		return this.shift(n);
	};

	/**
		 * this >> n
		 * @param {BigInteger|number|string|Array<string|number>|Object} n
		 * @returns {BigInteger} A >> n
		 */
	BigInteger.prototype.shiftRight = function shiftRight (n) {
		return this.shift(-n);
	};

	// ----------------------
	// ビット演算系
	// ----------------------
		
	/**
		 * Number of digits in which the number "1" appears first when expressed in binary.
		 * - Return -1 If 1 is not found it.
		 * @returns {number}
		 */
	BigInteger.prototype.getLowestSetBit = function getLowestSetBit () {
		for(var i = 0; i < this.element.length; i++) {
			if(this.element[i] !==  0) {
				var x = this.element[i];
				for(var j = 0; j < 16; j++) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j;
					}
				}
			}
		}
		return -1;
	};

	/**
		 * Length when the number is binary.
		 * @returns {number}
		 */
	BigInteger.prototype.bitLength = function bitLength () {
		for(var i = this.element.length - 1; i >= 0; i--) {
			if(this.element[i] !==  0) {
				var x = this.element[i];
				for(var j = 15; j >= 0; j--) {
					if(((x >>> j) & 1) !==  0) {
						return i * 16 + j + 1;
					}
				}
			}
		}
		return 0;
	};

	/**
		 * Sum that the bit is 1 when represented in the two's complement.
		 * @returns {number}
		 */
	BigInteger.prototype.bitCount = function bitCount () {
		var target;
		if(this._sign >= 0) {
			target = this;
		}
		else {
			target = this.add(new BigInteger(1));
		}
		var len = target.bitLength();
		var bit = 0;
		var count = 0;
		for(var i = 0;bit < len;i++) {
			var x = target.element[i];
			for(var j = 0;((j < 16) && (bit < len));j++, bit++) {
				if(((x >>> j) & 1) !==  0) {
					count = count + 1;
				}
			}
		}
		return count;
	};

	/**
		 * Logical AND. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= B
		 * @private
		 */
	BigInteger.prototype._and = function _and (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			var x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 & x2;
		}
		// 配列の上位が空になる可能性があるためノーマライズが必要
		this._memory_reduction();
		// 符号を計算
		if((s1 === 1)||(s2 === 1)) {
			this._sign = 1;
		}
		// 出力が負の場合は、2の補数
		else if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
			// 反転させたことで配列の上位が空になる可能性があるためノーマライズが必要
			this._memory_reduction();
		}
		return this;
	};

	/**
		 * Logical AND.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & B
		 */
	BigInteger.prototype.and = function and (number) {
		return this.clone()._and(number);
	};

	/**
		 * Logical OR. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A |= B
		 * @private
		 */
	BigInteger.prototype._or = function _or (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			var x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 | x2;
		}
		// 符号を計算
		this._sign = ((s1 === -1)||(s2 === -1)) ? -1 : Math.max(s1, s2);
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
			// 反転させたことで配列の上位が空になる可能性があるためノーマライズが必要
			this._memory_reduction();
		}
		return this;
	};

	/**
		 * Logical OR.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A | B
		 */
	BigInteger.prototype.or = function or (number) {
		return this.clone()._or(number);
	};

	/**
		 * Logical Exclusive-OR. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A ^= B
		 * @private
		 */
	BigInteger.prototype._xor = function _xor (number) {
		var val = BigInteger._toBigInteger(number);
		var e1 = this;
		var e2 = val;
		var s1  = e1.signum(), s2 = e2.signum();
		var len = Math.max(e1.bitLength(), e2.bitLength());
		// 引数が負の場合は、2の補数
		var e1_array = e1.getTwosComplement(len).element;
		var e2_array = e2.getTwosComplement(len).element;
		var size = Math.max(e1_array.length, e2_array.length);
		this.element = [];
		for(var i = 0;i < size;i++) {
			var x1 = (i >= e1_array.length) ? 0 : e1_array[i];
			var x2 = (i >= e2_array.length) ? 0 : e2_array[i];
			this.element[i] = x1 ^ x2;
		}
		// 配列の上位が空になる可能性があるためノーマライズが必要
		this._memory_reduction();
		// 符号を計算
		this._sign = ((s1 !== 0)&&(s1 !== s2)) ? -1 : 1;
		// 出力が負の場合は、2の補数
		if(this._sign === -1) {
			this.element = this.getTwosComplement(len).element;
			// 反転したことでさらに空になる可能性がある
			this._memory_reduction();
		}
		return this;
	};

	/**
		 * Logical Exclusive-OR.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A ^ B
		 */
	BigInteger.prototype.xor = function xor (number) {
		return(this.clone()._xor(number));
	};

	/**
		 * Logical Not.
		 * @returns {BigInteger} A = !A
		 * @private
		 */
	BigInteger.prototype._not = function _not () {
		return(this._add(new BigInteger(1))._negate());
	};

	/**
		 * Logical Not. (mutable)
		 * @returns {BigInteger} !A
		 */
	BigInteger.prototype.not = function not () {
		return(this.clone()._not());
	};

	/**
		 * Logical Not-AND. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= (!B)
		 * @private
		 */
	BigInteger.prototype._andNot = function _andNot (number) {
		var val = BigInteger._toBigInteger(number);
		return(this._and(val.not()));
	};

	/**
		 * Logical Not-AND.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & (!B)
		 */
	BigInteger.prototype.andNot = function andNot (number) {
		return(this.clone()._andNot(number));
	};

	/**
		 * Logical Not-AND. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A &= (!B)
		 * @private
		 */
	BigInteger.prototype._nand = function _nand (number) {
		return(this._andNot(number));
	};

	/**
		 * Logical Not-AND.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A & (!B)
		 */
	BigInteger.prototype.nand = function nand (number) {
		return(this.andNot(number));
	};

	/**
		 * Logical Not-OR. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A = !(A | B)
		 * @private
		 */
	BigInteger.prototype._orNot = function _orNot (number) {
		var val = BigInteger._toBigInteger(number);
		return(this._or(val)._not());
	};

	/**
		 * Logical Not-OR.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} !(A | B)
		 */
	BigInteger.prototype.orNot = function orNot (number) {
		return(this.clone()._orNot(number));
	};

	/**
		 * Logical Not-OR. (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} A = !(A | B)
		 * @private
		 */
	BigInteger.prototype._nor = function _nor (number) {
		return(this._orNot(number));
	};

	/**
		 * Logical Not-OR.
		 * @param {BigInteger|number|string|Array<string|number>|Object} number 
		 * @returns {BigInteger} !(A | B)
		 */
	BigInteger.prototype.nor = function nor (number) {
		return(this.orNot(number));
	};

	/**
		 * this | (1 << n) (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype._setBit = function _setBit (bit) {
		var n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] |= 1 << (n & 0xF);
		return this;
	};

	/**
		 * this | (1 << n)
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.setBit = function setBit (bit) {
		var n = BigInteger._toInteger(bit);
		return this.clone()._setBit(n);
	};

	/**
		 * Invert a specific bit.) (mutable)
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 * @private
		 */
	BigInteger.prototype._flipBit = function _flipBit (bit) {
		var n = BigInteger._toInteger(bit);
		this._memory_allocation(n + 1);
		this.element[n >>> 4] ^= 1 << (n & 0xF);
		this._memory_reduction();
		return this;
	};

	/**
		 * Invert a specific bit.
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.flipBit = function flipBit (bit) {
		var n = BigInteger._toInteger(bit);
		return this.clone()._flipBit(n);
	};

	/**
		 * Lower a specific bit.
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit 
		 * @returns {BigInteger}
		 */
	BigInteger.prototype.clearBit = function clearBit (bit) {
		var n = BigInteger._toInteger(bit);
		var y = this.clone();
		y.element[n >>> 4] &= ~(1 << (n & 0xF));
		y._memory_reduction();
		return y;
	};

	/**
		 * Test if a particular bit is on.
		 * @param {BigInteger|number|string|Array<string|number>|Object} bit
		 * @returns {boolean}
		 */
	BigInteger.prototype.testBit = function testBit (bit) {
		var n = BigInteger._toInteger(bit);
		return ((this.element[n >>> 4] >>> (n & 0xF)) & 1) !== 0;
	};

	// ----------------------
	// テスト系
	// ----------------------
		
	/**
		 * this === 0
		 * @returns {boolean}
		 */
	BigInteger.prototype.isZero = function isZero () {
		this._memory_reduction();
		return this._sign === 0;
	};
		
	/**
		 * this === 1
		 * @returns {boolean}
		 */
	BigInteger.prototype.isOne = function isOne () {
		return this._sign === 1 && this.element.length === 1 && this.element[0] === 1;
	};
		
	/**
		 * this > 0
		 * @returns {boolean}
		 */
	BigInteger.prototype.isPositive = function isPositive () {
		this._memory_reduction();
		return this._sign > 0;
	};

	/**
		 * this < 0
		 * @returns {boolean}
		 */
	BigInteger.prototype.isNegative = function isNegative () {
		return this._sign < 0;
	};

	/**
		 * this >= 0
		 * @returns {boolean}
		 */
	BigInteger.prototype.isNotNegative = function isNotNegative () {
		return this._sign >= 0;
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * -1
		 * @returns {BigInteger} -1
		 */
	staticAccessors$2.MINUS_ONE.get = function () {
		return DEFINE$1.MINUS_ONE;
	};
		
	/**
		 * 0
		 * @returns {BigInteger} 0
		 */
	staticAccessors$2.ZERO.get = function () {
		return DEFINE$1.ZERO;
	};

	/**
		 * 1
		 * @returns {BigInteger} 1
		 */
	staticAccessors$2.ONE.get = function () {
		return DEFINE$1.ONE;
	};
		
	/**
		 * 2
		 * @returns {BigInteger} 2
		 */
	staticAccessors$2.TWO.get = function () {
		return DEFINE$1.TWO;
	};
		
	/**
		 * 10
		 * @returns {BigInteger} 10
		 */
	staticAccessors$2.TEN.get = function () {
		return DEFINE$1.TEN;
	};

	Object.defineProperties( BigInteger.prototype, prototypeAccessors );
	Object.defineProperties( BigInteger, staticAccessors$2 );

	/**
	 * Collection of constant values used in the class.
	 * @ignore
	 */
	var DEFINE$1 = {

		/**
		 * -1
		 */
		MINUS_ONE : new BigInteger(-1),

		/**
		 * 0
		 */
		ZERO : new BigInteger(0),
		
		/**
		 * 1
		 */
		ONE : new BigInteger(1),

		/**
		 * 2
		 */
		TWO : new BigInteger(2),

		/**
		 * 10
		 */
		TEN : new BigInteger(10)

	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Setting of calculation result of division.
	 * @typedef {Object} BigDecimalDivideType
	 * @property {number} [scale] Scale of rounding.
	 * @property {RoundingModeEntity} [roundingMode] Rounding mode.
	 * @property {MathContext} [context] Configuration.(scale and roundingMode are unnecessary.)
	 */

	/**
	 * Default MathContext class.
	 * Used when MathContext not specified explicitly.
	 * @type {MathContext}
	 * @ignore
	 */
	var DEFAULT_CONTEXT = MathContext.DECIMAL128;

	/**
	 * Collection of functions used in BigDecimal.
	 * @ignore
	 */
	var BigDecimalTool = function BigDecimalTool () {};

	BigDecimalTool.ToBigDecimalFromString = function ToBigDecimalFromString (ntext) {
		var scale = 0;
		var buff;
		// 正規化
		var text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		var number_text = "";
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				number_text += "-";
			}
		}
		// 整数部があるか
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text += buff;
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text += buff;
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale   = scale - parseInt(buff, 10);
		}
		return {
			scale : scale,
			integer : new BigInteger([number_text, 10])
		};
	};

	/**
		 * Create data for BigDecimal from number.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} value 
		 * @returns {{scale : number, integer : BigInteger}}
		 */
	BigDecimalTool.ToBigDecimalFromNumber = function ToBigDecimalFromNumber (value) {
		// 整数
		if(value === Math.floor(value)) {
			return {
				scale : 0,
				integer : new BigInteger(Math.round(value))
			};
		}
		// 浮動小数
		else {
			var scale = Math.trunc(Math.log(Math.abs(value)) / Math.log(10));
			var x = value / Math.pow(10, scale);
			// スケールを逆にする
			scale = - scale;
			for(var i = 0; i < 14; i++) {
				x = x * 10;
				scale = scale + 1;
				if(Math.abs(x - Math.round(x)) <= Number.EPSILON) {
					break;
				}
			}
			// 最も下の桁は四捨五入する
			x = Math.round(x * 1e14) / 1e14;
			return {
				scale : scale,
				integer : new BigInteger(x)
			};
			// 64ビットの実数型は15桁程度まで正しい
			// 余裕をもって12桁程度までを抜き出すのが良いかと思われる。
		}
	};

	/**
	 * Arbitrary-precision floating-point number class (immutable).
	 */
	var BigDecimal = function BigDecimal(number) {

		/**
			 * The scale of this BigDecimal.
			 * @private
			 * @type {number}
			 */
		this._scale= 0;
			
		/**
			 * Context used during initialization.
			 * @private
			 * @type {MathContext}
			 */
		this.default_context = DEFAULT_CONTEXT;

		// この値がtrueの場合は最後に正規化を実行する
		var is_set_context = false;

		if(arguments.length > 1) {
			throw "BigDecimal Unsupported argument[" + arguments.length + "]";
		}
		if(number instanceof BigDecimal) {

			/**
				 * Integer part.
				 * @private
				 * @type {BigInteger}
				 */
			this.integer		= number.integer.clone();

			this._scale			= number._scale;
				
			/**
				 * Integer part of string (for cache).
				 * @private
				 * @type {string}
				 */
			this.int_string		= number.int_string;

			this.default_context= number.default_context;

		}
		else if(typeof number === "number") {
			var data = BigDecimalTool.ToBigDecimalFromNumber(number);
			this.integer= data.integer;
			this._scale	= data.scale;
		}
		else if(number instanceof Array) {
			if(number.length >= 1) {
				var prm1 = number[0];
				if(typeof prm1 === "number") {
					var data$1 = BigDecimalTool.ToBigDecimalFromNumber(prm1);
					this.integer= data$1.integer;
					this._scale	= data$1.scale;
				}
				else if(prm1 instanceof BigDecimal) {
					this.integer		= prm1.integer.clone();
					this._scale			= prm1._scale;
				}
				else if(prm1 instanceof BigInteger) {
					this.integer		= prm1.clone();
				}
				else if((prm1 instanceof Object) && (prm1.toBigDecimal)) {
					var data$2			= prm1.toBigDecimal();
					this.integer		= data$2.integer;
					this._scale			= data$2._scale;
				}
				else if((prm1 instanceof Object) && (prm1.doubleValue)) {
					var data$3 = BigDecimalTool.ToBigDecimalFromNumber(prm1.doubleValue);
					this.integer= data$3.integer;
					this._scale	= data$3.scale;
				}
				else {
					var data$4 = BigDecimalTool.ToBigDecimalFromString(prm1.toString());
					this.integer= data$4.integer;
					this._scale	= data$4.scale;
				}
			}
			if(number.length >= 2) {
				// スケール値を省略しているかどうかを、数値かどうかで判定している。
				if(typeof number[1] === "number" || number[1] instanceof Number) {
					// 2つめが数値の場合は、2つ目をスケール値として使用する
					this._scale= number[1];
					if(number.length >= 3) {
						this.default_context = number[2];
						is_set_context = true;
					}
				}
				else {
					if(number.length >= 2) {
						this.default_context = number[1];
						is_set_context = true;
					}
				}
			}
		}
		else if(typeof number === "string") {
			var data$5 = BigDecimalTool.ToBigDecimalFromString(number);
			this.integer= data$5.integer;
			this._scale	= data$5.scale;
		}
		else if(number instanceof BigInteger) {
			this.integer= number.clone();
		}
		else if((number instanceof Object) && (number.toBigDecimal)) {
			var data$6			= number.toBigDecimal();
			this.integer		= data$6.integer;
			this._scale			= data$6._scale;
			this.default_context= data$6.default_context;
		}
		else if((number instanceof Object) && (number.scale !== undefined && number.default_context !== undefined)) {
			this.integer= new BigInteger(number.integer);
			if(number.scale) {
				this._scale = number.scale;
			}
			if(number.context) {
				this.default_context = number.context;
				is_set_context = true;
			}
		}
		else if((number instanceof Object) && (number.doubleValue)) {
			var data$7 = BigDecimalTool.ToBigDecimalFromNumber(number.doubleValue);
			this.integer= data$7.integer;
			this._scale	= data$7.scale;
		}
		else if(number instanceof Object) {
			var data$8 = BigDecimalTool.ToBigDecimalFromString(number.toString());
			this.integer= data$8.integer;
			this._scale	= data$8.scale;
		}
		else {
			throw "BigDecimal Unsupported argument " + arguments;
		}
		// データを正規化
		if(is_set_context) {
			var newbigdecimal = this.round(this.default_context);
			this.integer= newbigdecimal.integer;
			this._scale	= newbigdecimal._scale;
			delete this.int_string;
		}
		// データが正しいかチェックする
		if((!(this.integer instanceof BigInteger)) || (!(this.default_context instanceof MathContext))) {
			throw "BigDecimal Unsupported argument " + arguments;
		}
	};

	var prototypeAccessors$1 = { intValue: { configurable: true },intValueExact: { configurable: true },floatValue: { configurable: true },doubleValue: { configurable: true } };
	var staticAccessors$3 = { MINUS_ONE: { configurable: true },ZERO: { configurable: true },HALF: { configurable: true },ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true },PI: { configurable: true },E: { configurable: true } };

	/**
		 * Create an arbitrary-precision floating-point number.
		 * 
		 * Initialization can be performed as follows.
		 * - 1200, "1200", "12e2", "1.2e3"
		 * - When initializing with array. [ integer, [scale = 0], [context=default]].
		 * - When initializing with object. { integer, [scale = 0], [context=default]}.
		 * 
		 * Description of the settings are as follows, you can also omitted.
		 * - The "scale" is an integer scale factor.
		 * - The "context" is used to normalize the created floating point.
		 * 
		 * If "context" is not specified, the "default_context" set for the class is used.
		 * The "context" is the used when no environment settings are specified during calculation.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
		 * @returns {BigDecimal}
		 */
	BigDecimal.create = function create (number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	};

	/**
		 * Create a number using settings of this number.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
		 * @param {MathContext} [mc] - Setting preferences when creating objects.
		 * @returns {BigDecimal}
		 */
	BigDecimal.prototype.createUsingThisSettings = function createUsingThisSettings (number, mc) {
		if(mc) {
			return new BigDecimal([number, mc]);
		}
		else {
			return new BigDecimal([number, this.default_context]);
		}
	};

	/**
		 * Convert number to BigDecimal type.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} x 
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [scale] 
		 * @returns {BigDecimal}
		 */
	BigDecimal.valueOf = function valueOf (x, scale) {
		if(arguments.length === 1) {
			return new BigDecimal(x);
		}
		else {
			return new BigDecimal([x, scale]);
		}
	};

	/**
		 * Convert to BigDecimal.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigDecimal}
		 * @private
		 */
	BigDecimal._toBigDecimal = function _toBigDecimal (number) {
		if(number instanceof BigDecimal) {
			return number;
		}
		else {
			return new BigDecimal(number);
		}
	};

	/**
		 * Convert to BigInteger.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigInteger}
		 * @private
		 */
	BigDecimal._toBigInteger = function _toBigInteger (number) {
		if(number instanceof BigInteger) {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.toBigInteger();
		}
		else {
			return new BigInteger(number);
		}
	};

	/**
		 * Convert to real number.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigDecimal._toFloat = function _toFloat (number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof BigDecimal) {
			return number.doubleValue;
		}
		else {
			return (new BigDecimal(number)).doubleValue;
		}
	};

	/**
		 * Convert to integer.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {number}
		 * @private
		 */
	BigDecimal._toInteger = function _toInteger (number) {
		if(typeof number === "number") {
			return Math.trunc(number);
		}
		else if(number instanceof BigInteger) {
			return number.intValue;
		}
		else {
			return (new BigInteger(number)).intValue;
		}
	};

	/**
		 * Return string of this number without sign.
		 * If cache is already created, return cache.
		 * @returns {string} 
		 */
	BigDecimal.prototype._getUnsignedIntegerString = function _getUnsignedIntegerString () {
		// キャッシュする
		if(typeof this.int_string === "undefined") {
			this.int_string = this.integer.toString(10).replace(/^-/, "");
		}
		return this.int_string;
	};

	/**
		 * Deep copy.
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.clone = function clone () {
		return new BigDecimal(this);
	};
		
	/**
		 * The scale of this BigDecimal.
		 * @returns {number} 
		 */
	BigDecimal.prototype.scale = function scale () {
		return this._scale;
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {number}
		 */
	BigDecimal.prototype.signum = function signum () {
		return this.integer.signum();
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {number}
		 */
	BigDecimal.prototype.sign = function sign () {
		return this.signum();
	};

	/**
		 * Precision.
		 * @returns {number} 
		 */
	BigDecimal.prototype.precision = function precision () {
		return this._getUnsignedIntegerString().length;
	};

	/**
		 * An integer with the exponent part removed.
		 * @returns {BigInteger} 
		 */
	BigDecimal.prototype.unscaledValue = function unscaledValue () {
		return new BigInteger(this.integer);
	};

	/**
		 * The smallest value that can be represented with the set precision.
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.ulp = function ulp () {
		return new BigDecimal([BigInteger.ONE, this.scale()]);
	};

	/**
		 * Absolute value.
		 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
		 * @returns {BigDecimal} abs(A)
		 */
	BigDecimal.prototype.abs = function abs (mc) {
		var output = this.clone();
		output.integer = output.integer.abs();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * this * 1
		 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
		 * @returns {BigDecimal} +A
		 */
	BigDecimal.prototype.plus = function plus (mc) {
		var output = this.clone();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * this * -1
		 * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
		 * @returns {BigDecimal} -A
		 */
	BigDecimal.prototype.negate = function negate (mc) {
		var output = this.clone();
		output.integer = output.integer.negate();
		return (mc === undefined) ? output : output.round(mc);
	};

	/**
		 * Move the decimal point to the left.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.movePointLeft = function movePointLeft (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.scaleByPowerOfTen( -x );
		output = output.setScale(Math.max(this.scale() + x, 0));
		return output;
	};

	/**
		 * Move the decimal point to the right.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.movePointRight = function movePointRight (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.scaleByPowerOfTen( x );
		output = output.setScale(Math.max(this.scale() - x, 0));
		return output;
	};

	/**
		 * Remove the 0 to the right of the numbers and normalize the scale.
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.stripTrailingZeros = function stripTrailingZeros () {
		// 0をできる限り取り除く
		var sign	= this.signum();
		var sign_text= sign >= 0 ? "" : "-";
		var text	= this.integer.toString(10).replace(/^-/, "");
		var zeros	= text.match(/0+$/);
		var zero_length= (zeros !== null) ? zeros[0].length : 0;
		if(zero_length === text.length) {
			// 全て 0 なら 1 ケタ残す
			zero_length = text.length - 1;
		}
		var newScale= this.scale() - zero_length;
		return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), newScale]);
	};

	// ----------------------
	// 四則演算
	// ----------------------
		
	/**
		 * Add.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A + B
		 */
	BigDecimal.prototype.add = function add (number, context) {
		var augend = BigDecimal._toBigDecimal(number);
		var mc = context ? context : augend.default_context;
		var src		= this;
		var tgt		= augend;
		var newscale= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			// 1 e1 + 1 e1 = 1
			return new BigDecimal([src.integer.add(tgt.integer), newscale, mc]);
		}
		else if(src._scale > tgt._scale) {
			// 1 e-2 + 1 e-1
			var newdst = tgt.setScale(src._scale);
			// 0.01 + 0.10 = 0.11 = 11 e-2
			return new BigDecimal([src.integer.add(newdst.integer), newscale, mc]);
		}
		else {
			// 1 e-1 + 1 e-2
			var newsrc = src.setScale(tgt._scale);
			// 0.1 + 0.01 = 0.11 = 11 e-2
			return new BigDecimal([newsrc.integer.add(tgt.integer), newscale, mc]);
		}
	};

	/**
		 * Subtract.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A - B
		 */
	BigDecimal.prototype.subtract = function subtract (number, context) {
		var subtrahend = BigDecimal._toBigDecimal(number);
		var mc = context ? context : subtrahend.default_context;
		var src		= this;
		var tgt		= subtrahend;
		var newscale= Math.max(src._scale, tgt._scale);
		if(src._scale === tgt._scale) {
			return new BigDecimal([src.integer.subtract(tgt.integer), newscale, mc]);
		}
		else if(src._scale > tgt._scale) {
			var newdst = tgt.setScale(src._scale);
			return new BigDecimal([src.integer.subtract(newdst.integer), newscale, mc]);
		}
		else {
			var newsrc = src.setScale(tgt._scale);
			return new BigDecimal([newsrc.integer.subtract(tgt.integer), newscale, mc]);
		}
	};

	/**
		 * Subtract.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A - B
		 */
	BigDecimal.prototype.sub = function sub (number, context) {
		return this.subtract(number, context);
	};

	/**
		 * Multiply.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A * B
		 */
	BigDecimal.prototype.multiply = function multiply (number, context) {
		var multiplicand = BigDecimal._toBigDecimal(number);
		var mc = context ? context : multiplicand.default_context;
		var src		= this;
		var tgt		= multiplicand;
		var newinteger= src.integer.multiply(tgt.integer);
		// 0.1 * 0.01 = 0.001
		var newscale= src._scale + tgt._scale;
		return new BigDecimal([newinteger, newscale, mc]);
	};

	/**
		 * Multiply.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A * B
		 */
	BigDecimal.prototype.mul = function mul (number, context) {
		return this.multiply(number, context);
	};

	/**
		 * Divide not calculated to the decimal point.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} (int)(A / B)
		 */
	BigDecimal.prototype.divideToIntegralValue = function divideToIntegralValue (number, context) {
		var divisor = BigDecimal._toBigDecimal(number);
		var mc = context ? context : divisor.default_context;
		var getDigit  = function( num ) {
			var i;
			var text = "1";
			for(i = 0; i < num; i++) {
				text = text + "0";
			}
			return new BigInteger(text);
		};
		if(divisor.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		// 1000e0	/1e2			=1000e-2
		// 1000e0	/10e1		=100e-1
		// 1000e0	/100e0		=10e0
		// 1000e0	/1000e-1		=1e1
		// 1000e0	/10000e-2	=1e1
		// 1000e0	/100000e-3	=1e1

		// 10e2		/100e0		=1e1
		// 100e1	/100e0		=1e1
		// 1000e0	/100e0		=10e0
		// 10000e-1	/100e0		=100e-1	
		// 100000e-2/100e0		=1000e-2

		var src	= this;
		var tgt	= divisor;
		var src_integer= src.integer;
		var tgt_integer= tgt.integer;
		var newScale= src._scale - tgt._scale;

		// 100e-2 / 3e-1 = 1 / 0.3 -> 100 / 30
		if(src._scale > tgt._scale) {
			// src._scale に合わせる
			tgt_integer = tgt_integer.multiply(getDigit(  newScale ));
		}
		// 1e-1 / 3e-2 = 0.1 / 0.03 -> 10 / 3
		else if(src._scale < tgt._scale) {
			// tgt._scale に合わせる
			src_integer = src_integer.multiply(getDigit( -newScale ));
		}

		// とりあえず計算結果だけ作ってしまう
		var new_integer= src_integer.divide(tgt_integer);
		var sign		= new_integer.signum();
		if(sign !== 0) {
			var text= new_integer.toString(10).replace(/^-/, "");
			// 指定した桁では表すことができない
			if((mc.getPrecision() !== 0) && (text.length > mc.getPrecision())) {
				throw "ArithmeticException";
			}
			// 結果の優先スケール に合わせる (this.scale() - divisor.scale())
			if(text.length <= (-newScale)) {
				// 合わせることができないので、0をできる限り削る = stripTrailingZerosメソッド
				var zeros		= text.match(/0+$/);
				var zero_length= (zeros !== null) ? zeros[0].length : 0;
				var sign_text	= sign >= 0 ? "" : "-";
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, text.length - zero_length)), -zero_length, mc]);
			}
		}

		var output = new BigDecimal(new_integer);
		output = output.setScale(newScale, RoundingMode.UP);
		output = output.round(mc);
		output.default_context = mc;
		return output;
	};

	/**
		 * Divide and remainder.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
		 */
	BigDecimal.prototype.divideAndRemainder = function divideAndRemainder (number, context) {
		var divisor = BigDecimal._toBigDecimal(number);
		var mc = context ? context : divisor.default_context;

		// 1000e0	/1e2			=1000e-2... 0e0
		// 1000e0	/10e1		=100e-1... 0e0
		// 1000e0	/100e0		=10e0... 0e0
		// 1000e0	/1000e-1		=1e1	... 0e0
		// 1000e0	/10000e-2	=1e1	... 0e-1
		// 1000e0	/100000e-3	=1e1	... 0e-2

		// 10e2		/100e0		=1e1	... 0e1
		// 100e1	/100e0		=1e1	... 0e1
		// 1000e0	/100e0		=10e0... 0e0
		// 10000e-1	/100e0		=100e-1... 0e-1
		// 100000e-2/100e0		=1000e-2... 0e-2

		var result_divide= this.divideToIntegralValue(divisor, mc);
		var result_remaind= this.subtract(result_divide.multiply(divisor, mc), mc);

		var output = [result_divide, result_remaind];
		return output;
	};

	/**
		 * Remainder of division.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A % B
		 */
	BigDecimal.prototype.rem = function rem (number, context) {
		return this.divideAndRemainder(number, context)[1];
	};

	/**
		 * Modulo, positive remainder of division.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} A mod B
		 */
	BigDecimal.prototype.mod = function mod (number, context) {
		var x = this.rem(number, context);
		if(x.compareTo(BigDecimal.ZERO) < 0) {
			return x.add(number, context);
		}
	};

	/**
		 * Divide.
		 * - The argument can specify the scale after calculation.
		 * - In the case of precision infinity, it may generate an error by a repeating decimal.
		 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
		 * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext|BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
		 * @returns {BigDecimal}
		 */
	BigDecimal.prototype.divide = function divide (number, type) {
		var divisor = BigDecimal._toBigDecimal(number);
		var src		= this;
		var tgt		= divisor;
		var roundingMode= null;
		var mc			= null;
		var newScale	= 0;
		var isPriorityScale= false;

		// 設定をロードする
		if(!type) {
			mc = tgt.default_context;
			roundingMode = mc.getRoundingMode();
			newScale = mc.getPrecision();
		}
		else if(type instanceof MathContext) {
			mc = type;
			roundingMode = mc.getRoundingMode();
			newScale = mc.getPrecision();
		}
		else {
			if(type && type.scale) {
				newScale = type.scale;
			}
			else {
				isPriorityScale= true;
				if(type && (type.roundingMode || type.context)) {
					newScale = src.scale();
				}
				else {
					newScale = src.scale() - tgt.scale();
				}
			}
			if(type && type.context) {
				mc = type.context;
				roundingMode = mc.getRoundingMode();
				newScale = mc.getPrecision();
			}
			else {
				mc = this.default_context;
			}
			if(type && type.roundingMode) {
				roundingMode = type.roundingMode;
			}
			else {
				roundingMode = mc.getRoundingMode();
			}
		}
			
		if(tgt.compareTo(BigDecimal.ZERO) === 0) {
			throw "ArithmeticException";
		}

		var precision = mc.getPrecision();

		var all_result;
		// 無限精度か、精度が小さい場合は厳密に求める
		if((precision === 0) || (precision <= 100)) {
			var newsrc;
			var result_map = [];
			var result, result_divide, result_remaind;
			all_result = BigDecimal.ZERO;
			var check_max = precision !== 0 ? (precision + 8) : 0x3FFFF;
			newsrc = src;
			for(var i = 0; i < check_max; i++) {
				result = newsrc.divideAndRemainder(tgt, MathContext.UNLIMITED);
				result_divide= result[0];
				result_remaind= result[1];
				// ここで default_context が MathContext.UNLIMITED に書き換わる
				all_result = all_result.add(result_divide.scaleByPowerOfTen(-i), MathContext.UNLIMITED);
				if(result_remaind.compareTo(BigDecimal.ZERO) !== 0) {
					if(precision === 0) {// 精度無限大の場合は、循環小数のチェックが必要
						if(result_map[result_remaind._getUnsignedIntegerString()]) {
							throw "ArithmeticException " + all_result + "[" + result_remaind._getUnsignedIntegerString() + "]";
						}
						else {
							result_map[result_remaind._getUnsignedIntegerString()] = true;
						}
					}
					newsrc = result_remaind.scaleByPowerOfTen(1);
				}
				else {
					break;
				}
			}
			// default_context の設定を元に戻す
		}
		else {
			// 巨大な値は繰り返しで求める
			var new_mc = new MathContext(precision + 4,RoundingMode.HALF_UP);
			all_result = this.mul(tgt.inv(new_mc), new_mc);
		}
		
		all_result.default_context = mc;
		if(isPriorityScale) {
			// 優先スケールの場合は、スケールの変更に失敗する可能性あり
			try {
				all_result = all_result.setScale(newScale, roundingMode);
			}
			catch(e) {
				// falls through
			}
		}
		else {
			all_result = all_result.setScale(newScale, roundingMode);
		}
		all_result = all_result.round(mc);
		return all_result;
	};

	/**
		 * Divide.
		 * - The argument can specify the scale after calculation.
		 * - In the case of precision infinity, it may generate an error by a repeating decimal.
		 * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
		 * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {MathContext|BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
		 * @returns {BigDecimal} A / B
		 */
	BigDecimal.prototype.div = function div (number, type) {
		return this.divide(number, type);
	};

	/**
		 * Inverse number of this value.
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} 1 / A
		 */
	BigDecimal.prototype.inv = function inv (context) {
		// 通常の割り算を行うと、「1」÷巨大な数を計算したときに、
		// 1 の仮数部の精度によってしまい、結果が0になってしまう場合がある
		// const mc = context ? context : this.default_context;
		// const b1 = this.createUsingThisSettings(1, mc);
		// return b1.div(this, mc);
		var mc = context ? context : this.default_context;
		var default_context = BigDecimal.getDefaultContext();
		var A = this.round(mc);
		BigDecimal.setDefaultContext(mc);
		// 3次のニュートン・ラフソン法で求める
		var B1 = BigDecimal.create(1);
		// 初期値は、指数部の情報を使用する
		var scale = - this.scale() + (this.precision() - 1);
		var x0 = new BigDecimal([1, scale + 1]);
		if(x0.isZero()) {
			BigDecimal.setDefaultContext(default_context);
			return null;
		}
		var xn = x0;
		for(var i = 0; i < 20; i++) {
			var h = B1.sub(A.mul(xn));
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h).add(h.square()));
		}
		BigDecimal.setDefaultContext(default_context);
		// 参考
		// Lyuka - 逆数と平方根を求める高次収束アルゴリズム
		// http://www.finetune.co.jp/~lyuka/technote/fract/sqrt.html
		return xn;
	};

	/**
		 * Power function.
		 * - Supports only integers.
		 * - An exception occurs when doing a huge multiplication.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} pow(A, B)
		 */
	BigDecimal.prototype.pow = function pow (number, context) {
		var n = BigDecimal._toInteger(number);
		var mc = context ? context : this.default_context;
		if(Math.abs(n) > 999999999) {
			throw "ArithmeticException";
		}
		if((mc.getPrecision() === 0) && (n < 0)) {
			throw "ArithmeticException";
		}
		var x, y;
		x = this.clone();
		y = BigDecimal.ONE;
		while(n !== 0) {
			if((n & 1) !== 0) {
				y = y.multiply(x, MathContext.UNLIMITED);
			}
			x = x.multiply(x, MathContext.UNLIMITED);
			n >>>= 1;
		}
		return y.round(mc);
	};
		
	// ----------------------
	// その他の演算
	// ----------------------
		
	/**
		 * Factorial function, x!.
		 * - Supports only integers.
		 * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
		 * @returns {BigDecimal} n!
		 */
	BigDecimal.prototype.factorial = function factorial (context) {
		var mc = context ? context : this.default_context;
		var y = new BigDecimal((new BigInteger(this)).factorial());
		return y.round(mc);
	};

	/**
		 * Multiply a multiple of ten.
		 * - Supports only integers.
		 * - Only the scale is changed without changing the precision.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n 
		 * @returns {BigDecimal} A * 10^floor(n)
		 */
	BigDecimal.prototype.scaleByPowerOfTen = function scaleByPowerOfTen (n) {
		var x = BigDecimal._toInteger(n);
		var output = this.clone();
		output._scale = this.scale() - x;
		return output;
	};

	// ----------------------
	// 環境設定用
	// ----------------------
		
	/**
		 * Set default the MathContext.
		 * This is used if you do not specify MathContext when creating a new object.
		 * @param {MathContext} [context=MathContext.DECIMAL128]
		 */
	BigDecimal.setDefaultContext = function setDefaultContext (context) {
		DEFAULT_CONTEXT = context ? context : MathContext.DECIMAL128;
	};

	/**
		 * Return default MathContext class.
		 * Used when MathContext not specified explicitly.
		 * @returns {MathContext}
		 */
	BigDecimal.getDefaultContext = function getDefaultContext () {
		return DEFAULT_CONTEXT;
	};

	// ----------------------
	// 他の型に変換用
	// ----------------------
		
	/**
		 * 32-bit integer value.
		 * @returns {number}
		 */
	prototypeAccessors$1.intValue.get = function () {
		var bigintdata = this.toBigInteger();
		var x = bigintdata.intValue;
		return x & 0xFFFFFFFF;
	};

	/**
		 * 32-bit integer value.
		 * An error occurs if conversion fails.
		 * @returns {number}
		 */
	prototypeAccessors$1.intValueExact.get = function () {
		var bigintdata = this.toBigInteger();
		var x = bigintdata.intValue;
		if((x < -2147483648) || (2147483647 < x)) {
			throw "ArithmeticException";
		}
		return x;
	};

	/**
		 * 32-bit floating point.
		 * @returns {number}
		 */
	prototypeAccessors$1.floatValue.get = function () {
		var p = this.precision();
		if(MathContext.DECIMAL32.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	};

	/**
		 * 64-bit floating point.
		 * @returns {number}
		 */
	prototypeAccessors$1.doubleValue.get = function () {
		var p = this.precision();
		if(MathContext.DECIMAL64.getPrecision() < p) {
			return(this.signum() >= 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
		}
		return parseFloat(this.toEngineeringString());
	};

	/**
		 * Get as a BigInteger.
		 * @returns {BigInteger}
		 */
	BigDecimal.prototype.toBigInteger = function toBigInteger () {
		return this.integer.scaleByPowerOfTen(-this.scale());
	};

	// ----------------------
	// 比較
	// ----------------------
		
	/**
		 * Equals.
		 * - Attention : Test for equality, including the precision and the scale. 
		 * - Use the "compareTo" if you only want to find out whether they are also mathematically equal.
		 * - If you specify a "tolerance", it is calculated by ignoring the test of the precision and the scale.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean} A === B
		 */
	BigDecimal.prototype.equals = function equals (number, tolerance) {
		// 誤差を指定しない場合は、厳密に調査
		if(!tolerance) {
			if(number instanceof BigDecimal) {
				return ((this._scale === number._scale) && (this.integer.equals(number.integer)));
			}
			else if((typeof number === "string") || (number instanceof String)) {
				var val = BigDecimal._toBigDecimal(number);
				return ((this._scale === val._scale) && (this.integer.equals(val.integer)));
			}
			else {
				return this.compareTo(number) === 0;
			}
		}
		else {
			return this.compareTo(number, tolerance) === 0;
		}
	};

	/**
		 * Compare values.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	BigDecimal.prototype.compareTo = function compareTo (number, tolerance) {
		var src = this;
		var tgt = BigDecimal._toBigDecimal(number);
		if(!tolerance) {
			// 誤差の指定がない場合
			// 簡易計算
			{
				var src_sign= src.signum();
				var tgt_sign= tgt.signum();
				if((src_sign === 0) && (src_sign === tgt_sign)) {
					return 0;
				}
				else if(src_sign === 0) {
					return - tgt_sign;
				}
				else if(tgt_sign === 0) {
					return src_sign;
				}
			}
			// 実際に計算する
			if(src._scale === tgt._scale) {
				return src.integer.compareTo(tgt.integer);
			}
			else if(src._scale > tgt._scale) {
				var newdst = tgt.setScale(src._scale);
				return src.integer.compareTo(newdst.integer);
			}
			else {
				var newsrc = src.setScale(tgt._scale);
				return newsrc.integer.compareTo(tgt.integer);
			}
		}
		else {
			var tolerance_ = BigDecimal._toBigDecimal(tolerance);
			var delta = src.sub(tgt, MathContext.UNLIMITED);
			var delta_abs = delta.abs();
			if(delta_abs.compareTo(tolerance_) <= 0) {
				return 0;
			}
			else {
				return delta.sign();
			}
		}
	};

	/**
		 * Maximum number.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
		 * @returns {BigDecimal} max([A, B])
		 */
	BigDecimal.prototype.max = function max (number) {
		var val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) >= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * Minimum number.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number 
		 * @returns {BigDecimal} min([A, B])
		 */
	BigDecimal.prototype.min = function min (number) {
		var val = BigDecimal._toBigDecimal(number);
		if(this.compareTo(val) <= 0) {
			return this.clone();
		}
		else {
			return val.clone();
		}
	};

	/**
		 * Clip number within range.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} min
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} max
		 * @returns {BigDecimal} min(max(x, min), max)
		 */
	BigDecimal.prototype.clip = function clip (min, max) {
		var min_ = BigDecimal._toBigDecimal(min);
		var max_ = BigDecimal._toBigDecimal(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	// ----------------------
	// 文字列化
	// ----------------------
		
	/**
		 * Convert to string.
		 * @returns {string} 
		 */
	BigDecimal.prototype.toString = function toString () {
		// 「調整された指数」
		var x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			return this.toScientificNotation(x);
		}
	};

	/**
		 * Convert to string using scientific notation.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} e_len - Number of digits in exponent part.
		 * @returns {string} 
		 */
	BigDecimal.prototype.toScientificNotation = function toScientificNotation (e_len) {
		var e	= BigDecimal._toInteger(e_len);
		var text= this._getUnsignedIntegerString();
		var s	= this.scale();
		var x	= [];
		var i, k;
		// -
		if(this.signum() === -1) {
			x[x.length] = "-";
		}
		// 表示上の桁数
		s = - e - s;
		// 小数点が付かない
		if(s >= 0) {
			x[x.length] = text;
			for(i = 0; i < s; i++) {
				x[x.length] = "0";
			}
		}
		// 小数点が付く
		else {
			k = this.precision() + s;
			if(0 < k) {
				x[x.length] = text.substring(0, k);
				x[x.length] = ".";
				x[x.length] = text.substring(k, text.length);
			}
			else {
				k = - k;
				x[x.length] = "0.";
				for(i = 0; i < k; i++) {
					x[x.length] = "0";
				}
				x[x.length] = text;
			}
		}
		x[x.length] = "E";
		if(e >= 0) {
			x[x.length] = "+";
		}
		x[x.length] = e;
		return x.join("");
	};

	/**
		 * Convert to string usding technical notation.
		 * @returns {string} 
		 */
	BigDecimal.prototype.toEngineeringString = function toEngineeringString () {
		// 「調整された指数」
		var x = - this.scale() + (this.precision() - 1);
		// スケールが 0 以上で、「調整された指数」が -6 以上
		if((this.scale() >= 0) && (x >= -6)) {
			return this.toPlainString();
		}
		else {
			// 0 でない値の整数部が 1 〜 999 の範囲に収まるように調整
			return this.toScientificNotation(Math.floor(x / 3) * 3);
		}
	};

	/**
		 * Convert to string without exponential notation.
		 * @returns {string} 
		 */
	BigDecimal.prototype.toPlainString = function toPlainString () {
		// スケールの変換なし
		if(this.scale() === 0) {
			if(this.signum() < 0) {
				return "-" + this._getUnsignedIntegerString();
			}
			else {
				return this._getUnsignedIntegerString();
			}
		}
		// 指数0で文字列を作成後、Eの後ろの部分をとっぱらう
		var text = this.toScientificNotation(0);
		return text.match(/^[^E]*/)[0];
	};

	// ----------------------
	// 丸め
	// ----------------------
		
	/**
		 * Change the scale.
		 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} new_scale - New scale.
		 * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - Rounding method when converting precision.
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.setScale = function setScale (new_scale, rounding_mode) {
		var newScale = BigDecimal._toInteger(new_scale);
		if(this.scale() === newScale) {
			// scaleが同一なので処理の必要なし
			return(this.clone());
		}
		var roundingMode = (rounding_mode !== undefined) ? RoundingMode.valueOf(rounding_mode) : RoundingMode.UNNECESSARY;
		// 文字列を扱ううえで、符号があるとやりにくいので外しておく
		var text	= this._getUnsignedIntegerString();
		var sign	= this.signum();
		var sign_text= sign >= 0 ? "" : "-";
		// scale の誤差
		// 0 以上なら 0 を加えればいい。0未満なら0を削るか、四捨五入など丸めを行う
		var delta	= newScale - this.scale();// この桁分増やすといい
		if(0 <= delta) {
			// 0を加える
			var i;
			for(i = 0; i < delta; i++) {
				text = text + "0";
			}
			return new BigDecimal([new BigInteger(sign_text + text), newScale]);
		}
		var keta = text.length + delta;	// 最終的な桁数
		var keta_marume = keta + 1;
		if(keta <= 0) {
			// 指定した scale では設定できない場合
			// 例えば "0.1".setScale(-2), "10".setScale(-3) としても表すことは不可能であるため、
			// sign（-1, 0, +1）のどれかの数値を使用して丸める
			var outdata = (sign + roundingMode.getAddNumber(sign)) / 10;
			// 上記の式は、CEILINGなら必ず1、正でCEILINGなら1、負でFLOORなら1、それ以外は0となり、
			// さらに元々の数値が 0 なら 0、切り捨て不能なら例外が返る計算式である。
			// これは Java の動作をまねています。
			return new BigDecimal([new BigInteger(outdata), newScale]);
		}
		{
			// 0を削るだけで解決する場合
			// 単純な切捨て(0を削るのみ)
			var zeros		= text.match(/0+$/);
			var zero_length	= (zeros !== null) ? zeros[0].length : 0;
			if(( (zero_length + delta) >= 0 ) || (roundingMode === RoundingMode.DOWN)) {
				return new BigDecimal([new BigInteger(sign_text + text.substring(0, keta)), newScale]);
			}
		}
		{
			// 丸め計算で解決する場合
			// 12345 -> '123'45
			text = text.substring(0, keta_marume);
			// 丸め計算に必要な切り取る桁数(後ろの1～2桁を取得)
			var cutsize = text.length > 1 ? 2 : 1;
			// '123'45 -> 1'23'4
			var number = parseInt(text.substring(text.length - cutsize, text.length)) * sign;
			// 「元の数」と「丸めに必要な数」を足す
			var x1 = new BigInteger(sign_text + text);
			var x2 = new BigInteger(roundingMode.getAddNumber(number));
			text = x1.add(x2).toString();
			// 丸め後の桁数に戻して
			return new BigDecimal([new BigInteger(text.substring(0, text.length - 1)), newScale]);
		}
	};

	/**
		 * Round with specified settings.
		 * 
		 * This method is not a method round the decimal point.
		 * This method converts numbers in the specified Context and rounds unconvertible digits.
		 * 
		 * Use this.setScale(0, RoundingMode.HALF_UP) if you want to round the decimal point.
		 * When the argument is omitted, such decimal point rounding operation is performed.
		 * @param {MathContext} [mc] - New setting.
		 * @returns {BigDecimal} 
		 */
	BigDecimal.prototype.round = function round (mc) {
		if(mc) {
			// MathContext を設定した場合
			if(!(mc instanceof MathContext)) {
				throw "not MathContext";
			}
			var newPrecision= mc.getPrecision();
			var delta		= newPrecision - this.precision();
			if((delta === 0)||(newPrecision === 0)) {
				return this.clone();
			}
			var newBigDecimal = this.setScale( this.scale() + delta, mc.getRoundingMode());
			/* 精度を上げる必要があるため、0を加えた場合 */
			if(delta > 0) {
				return newBigDecimal;
			}
			/* 精度を下げる必要があるため、丸めた場合は、桁の数が正しいか調べる */
			if(newBigDecimal.precision() === mc.getPrecision()) {
				return newBigDecimal;
			}
			/* 切り上げなどで桁数が１つ増えた場合 */
			var sign_text= newBigDecimal.integer.signum() >= 0 ? "" : "-";
			var abs_text= newBigDecimal._getUnsignedIntegerString();
			var inte_text= sign_text + abs_text.substring(0, abs_text.length - 1);
			return new BigDecimal([new BigInteger(inte_text), newBigDecimal.scale() - 1]);
		}
		else {
			// 小数点以下を四捨五入する
			return this.setScale(0, RoundingMode.HALF_UP);
		}
	};

	/**
		 * Floor.
		 * @returns {BigDecimal} floor(A)
		 */
	BigDecimal.prototype.floor = function floor () {
		return this.setScale(0, RoundingMode.FLOOR);
	};

	/**
		 * Ceil.
		 * @returns {BigDecimal} ceil(A)
		 */
	BigDecimal.prototype.ceil = function ceil () {
		return this.setScale(0, RoundingMode.CEILING);
	};
		
	/**
		 * To integer rounded down to the nearest.
		 * @returns {BigDecimal} fix(A), trunc(A)
		 */
	BigDecimal.prototype.fix = function fix () {
		return this.setScale(0, RoundingMode.DOWN);
	};

	/**
		 * Fraction.
		 * @returns {BigDecimal} fract(A)
		 */
	BigDecimal.prototype.fract = function fract () {
		return this.sub(this.floor());
	};

	// ----------------------
	// 指数
	// ----------------------
		
	/**
		 * Square.
		 * param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
		 * @returns {BigDecimal} A^2
		 */
	BigDecimal.prototype.square = function square (mc) {
		return this.mul(this, mc);
	};

	/**
		 * Square root.
		 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
		 * @returns {BigDecimal} sqrt(A)
		 */
	BigDecimal.prototype.sqrt = function sqrt (context) {
		/*
		// 【以下は直接求める方法】
		// ニュートンラフソン法
		// A^0.5  = x
		//     A  = x^2
		//     0  = x^2 - A
		//   f(x) = x^2 - A
		// ここで f(x) = 0 となるような x を知りたい
		// なお f(x) は単調増加関数なのでニュートンラフソン法で求められる
		// x_(n+1) = x_n - f(x_n)/f'(x_n)
		// ここで f'(x) = 2x なので以下を求めればよい
		// x_(n+1) = x_n - (x_n^2 - A) / (2 * x_n)
		// 初期値の決め方は近い値のほうがよい
		// 使用する固定値を列挙
		const B1 = this.createUsingThisSettings(1, context);
		const B2 = this.createUsingThisSettings(2, context);
		// 初期値
		const scale = - this.scale() + (this.precision() - 1);
		const x0 = B1.scaleByPowerOfTen(scale);
		let xn = x0;
		for(let i = 0; i < 300; i++) {
			const xn1 = xn.sub( (xn.mul(xn).sub(this)).div(xn.mul(B2)) );
			const delta = xn1.sub(xn);
			if(delta.isZero()) {
				break;
			}
			xn = xn1;
		}
		*/
		//return xn;
		// 上記は割り算があり速度が遅いので、以下の計算で求める。
		return this.rsqrt(context).inv(context);
	};

	/**
		 * Reciprocal square root.
		 * param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of this object.
		 * @returns {BigDecimal} rsqrt(A)
		 */
	BigDecimal.prototype.rsqrt = function rsqrt (context) {
		var mc = context ? context : this.default_context;
		var default_context = BigDecimal.getDefaultContext();
		/**
			 * @type {BigDecimal}
			 */
		var A = this.round(mc);
		BigDecimal.setDefaultContext(mc);
		// 4次収束のニュートン・ラフソン法で求める
		// 使用する固定値を列挙
		var B1 = BigDecimal.create(1);
		var B5 = BigDecimal.create(5);
		var B6 = BigDecimal.create(6);
		var B8 = BigDecimal.create(8);
		var B16 = BigDecimal.create(16);
		var B16r = B16.inv();
		// 初期値
		var x0 = A.inv();
		if(x0.isZero()) {
			BigDecimal.setDefaultContext(default_context);
			return null;
		}
		var xn = x0;
		for(var i = 0; i < 50; i++) {
			var h = B1.sub(A.mul(xn.square())).round(mc);
			if(h.isZero()) {
				break;
			}
			xn = xn.mul(B1.add(h.mul(B8.add(h.mul(B6.add(B5.mul(h))))).mul(B16r)));
		}
		BigDecimal.setDefaultContext(default_context);
		// 参考
		// Lyuka - 逆数と平方根を求める高次収束アルゴリズム
		// http://www.finetune.co.jp/~lyuka/technote/fract/sqrt.html
		return xn;
	};

	// ----------------------
	// 三角関数
	// ----------------------

	// ----------------------
	// テスト系
	// ----------------------
		
	/**
		 * this === 0
		 * @returns {boolean}
		 */
	BigDecimal.prototype.isZero = function isZero () {
		return this.integer.isZero();
	};
		
	/**
		 * this === 1
		 * @returns {boolean}
		 */
	BigDecimal.prototype.isOne = function isOne () {
		return this.compareTo(BigDecimal.ONE) === 0;
	};
		
	/**
		 * this > 0
		 * @returns {boolean}
		 */
	BigDecimal.prototype.isPositive = function isPositive () {
		return this.integer.isPositive();
	};

	/**
		 * this < 0
		 * @returns {boolean}
		 */
	BigDecimal.prototype.isNegative = function isNegative () {
		return this.integer.isNegative();
	};

	/**
		 * this >= 0
		 * @returns {boolean}
		 */
	BigDecimal.prototype.isNotNegative = function isNotNegative () {
		return this.integer.isNotNegative();
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * -1
		 * @returns {BigDecimal} -1
		 */
	staticAccessors$3.MINUS_ONE.get = function () {
		return CACHED_DATA.MINUS_ONE.get();
	};

	/**
		 * 0
		 * @returns {BigDecimal} 0
		 */
	staticAccessors$3.ZERO.get = function () {
		return CACHED_DATA.ZERO.get();
	};
		
	/**
		 * 0.5
		 * @returns {BigDecimal} 0.5
		 */
	staticAccessors$3.HALF.get = function () {
		return CACHED_DATA.HALF.get();
	};
		
	/**
		 * 1
		 * @returns {BigDecimal} 1
		 */
	staticAccessors$3.ONE.get = function () {
		return CACHED_DATA.ONE.get();
	};
		
	/**
		 * 2
		 * @returns {BigDecimal} 2
		 */
	staticAccessors$3.TWO.get = function () {
		return CACHED_DATA.TWO.get();
	};
		
	/**
		 * 10
		 * @returns {BigDecimal} 10
		 */
	staticAccessors$3.TEN.get = function () {
		return CACHED_DATA.TEN.get();
	};

	/**
		 * PI
		 * @returns {BigDecimal} PI
		 */
	staticAccessors$3.PI.get = function () {
		return CACHED_DATA.PI.get();
	};

	/**
		 * E, Napier's constant.
		 * @returns {BigDecimal} E
		 */
	staticAccessors$3.E.get = function () {
		return CACHED_DATA.E.get();
	};

	Object.defineProperties( BigDecimal.prototype, prototypeAccessors$1 );
	Object.defineProperties( BigDecimal, staticAccessors$3 );

	BigDecimal.RoundingMode = RoundingMode;
	BigDecimal.MathContext = MathContext;

	/**
	 * Collection of constant values used in the class.
	 * @ignore
	 */
	var DEFINE$2 = {

		/**
		 * -1
		 * @returns {BigDecimal} -1
		 */
		MINUS_ONE : function() {
			var x = new BigDecimal(-1);
			return x;
		},

		/**
		 * 0
		 * @returns {BigDecimal} 0
		 */
		ZERO : function() {
			var x = new BigDecimal(0);
			return x;
		},
		
		/**
		 * 0.5
		 * @returns {BigDecimal} 0.5
		 */
		HALF : function() {
			var x = new BigDecimal(0.5);
			return x;
		},
		
		/**
		 * 1
		 * @returns {BigDecimal} 1
		 */
		ONE : function() {
			var x = new BigDecimal(1);
			return x;
		},
		
		/**
		 * 2
		 * @returns {BigDecimal} 2
		 */
		TWO : function() {
			var x = new BigDecimal(2);
			return x;
		},
		
		/**
		 * 10
		 * @returns {BigDecimal} 10
		 */
		TEN : function() {
			var x = new BigDecimal(10);
			return x;
		},

		/**
		 * PI
		 * @returns {BigDecimal} pi()
		 */
		PI : function() {
			// ガウス＝ルジャンドルのアルゴリズム
			// 使用する固定値を列挙
			var B1		= BigDecimal.create(1);
			var B2		= BigDecimal.create(2);
			var B4		= BigDecimal.create(4);
			// 初期値
			var a = B1;
			var b = B2.sqrt().inv();
			var t = B4.inv();
			var p = B1;
			var pi = B1;
			// 繰り返し求める
			for(var i = 0; i < 300; i++) {
				var a1 = a.add(b).div(B2);
				var b1 = a.mul(b).sqrt();
				var t1 = t.sub(p.mul(a.sub(a1).square()));
				var p1 = p.mul(B2);
				var pi1 = a1.add(b1).square().div(t1.mul(B4));
				var delta = pi1.sub(pi);
				pi = pi1;
				if(delta.isZero()) {
					break;
				}
				a = a1;
				b = b1;
				t = t1;
				p = p1;
			}
			return pi;
		},
		
		/**
		 * E, Napier's constant.
		 * @returns {BigDecimal} E
		 */
		E : function() {
			// 初期値
			var n0 = BigDecimal.create(2);
			var k = BigDecimal.create(1);
			// 繰り返し求める
			for(var i = 2; i < 300; i++) {
				k = k.mul(i);
				var n1 = n0.add(k.inv());
				var delta = n1.sub(n0);
				n0 = n1;
				if(delta.isZero()) {
					break;
				}
			}
			return n0;
		}

	};

	/**
	 * Simple cache class.
	 * @ignore
	 */
	var BigDecimalCache = function BigDecimalCache(method_name, cache_size) {

		/**
			 * Method name in the DEFINE.
			 */
		this.method_name = method_name;
			
		/**
			 * @type {Array<{name:string, number:BigDecimal}>}
			 */
		this.table = [];

		/**
			 * Maximum number of caches.
			 */
		this.table_max = cache_size;

	};

	/**
		 * Use from cache if it exists in cache.
		 * @returns {BigDecimal}
		 */
	BigDecimalCache.prototype.get = function get () {
		var name = BigDecimal.getDefaultContext().toString();

		for(var index = 0; index < this.table.length; index++) {
			if(this.table[index].name === name) {
				// 先頭にもってくる
				var object = this.table.splice(index, 1)[0];
				this.table.unshift(object);
				return object.number;
			}
		}
		var new_number = DEFINE$2[this.method_name]();
		if(this.table.length === this.table_max) {
			// 後ろのデータを消去
			this.table.pop();
		}
		// 前方に追加
		this.table.unshift({
			name : name,
			number : new_number
		});
		return new_number;
	};

	/**
	 * Simple cache class.
	 * @ignore
	 */
	var BigDecimalConst = function BigDecimalConst() {
		/**
			 * -1
			 */
		this.MINUS_ONE = new BigDecimalCache("MINUS_ONE", 10);

		/**
			 * 0
			 */
		this.ZERO = new BigDecimalCache("ZERO", 10);

		/**
			 * 0.5
			 */
		this.HALF = new BigDecimalCache("HALF", 10);

		/**
			 * 1
			 */
		this.ONE = new BigDecimalCache("ONE", 10);

		/**
			 * 2
			 */
		this.TWO = new BigDecimalCache("TWO", 10);

		/**
			 * 10
			 */
		this.TEN = new BigDecimalCache("TEN", 10);

		/**
			 * PI
			 */
		this.PI = new BigDecimalCache("PI", 10);

		/**
			 * E
			 */
		this.E = new BigDecimalCache("E", 10);
	};

	/**
	 * Cache of the constant.
	 * @ignore
	 */
	var CACHED_DATA = new BigDecimalConst();

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection of functions used in Fraction.
	 * @ignore
	 */
	var FractionTool = function FractionTool () {};

	FractionTool.to_fraction_data_from_number_string = function to_fraction_data_from_number_string (ntext) {
		var scale = 0;
		var buff;
		var is_negate = false;
		// 正規化
		var text = ntext.replace(/\s/g, "").toLowerCase();
		// +-の符号があるか
		var number_text = [];
		buff = text.match(/^[+-]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			if(buff.indexOf("-") !== -1) {
				is_negate = true;
				number_text.push("-");
			}
		}
		// 整数部があるか
		buff = text.match(/^[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			number_text.push(buff);
		}
		// 浮動小数点の計算がない場合はここで完了
		if(text.length === 0) {
			return new Fraction([new BigInteger([number_text.join(""), 10]), BigInteger.ONE]);
		}
		// 巡回小数点指定があるか
		var cyclic_decimal = null;
		if(/[()'"[\]]/.test(text)) {
			var match_data = text.match(/([^.]*)\.(\d*)[(['"](\d+)[)\]'"](.*)/);
			if(match_data === null) {
				throw "Fraction Unsupported argument " + text;
			}
			// 巡回少数の場所
			var cyclic_decimal_scale = match_data[2].length;
			var cyclic_decimal_text = match_data[3];
			// 巡回少数以外を抽出
			if(cyclic_decimal_scale === 0) {
				text = match_data[1] + match_data[4];
			}
			else {
				text = match_data[1] + "." + match_data[2] + match_data[4];
			}

			var numerator = new BigInteger([cyclic_decimal_text, 10]);
			var denominator_string = [];
			for(var i = 0; i < cyclic_decimal_text.length; i++) {
				denominator_string.push("9");
			}
			var denominator = new BigInteger([denominator_string.join(""), 10]);
			cyclic_decimal = new Fraction([numerator, denominator]);
			cyclic_decimal = cyclic_decimal.scaleByPowerOfTen(-cyclic_decimal_scale);
		}
		// 小数部があるか
		buff = text.match(/^\.[0-9]+/);
		if(buff !== null) {
			buff = buff[0];
			text = text.substr(buff.length);
			buff = buff.substr(1);
			scale = scale + buff.length;
			number_text.push(buff);
		}
		// 指数表記があるか
		buff = text.match(/^e[+-]?[0-9]+/);
		if(buff !== null) {
			buff = buff[0].substr(1);
			scale = scale - parseInt(buff, 10);
		}

		var f = null;
		{
			var numerator$1 = null;
			var denominator$1 = null;
			// 出力用の文字を作成
			if(scale === 0) {
				numerator$1 = new BigInteger([number_text.join(""), 10]);
				denominator$1 = BigInteger.ONE;
			}
			if(scale < 0) {
				for(var i$1 = 0; i$1 < -scale; i$1++) {
					number_text.push("0");
				}
				numerator$1 = new BigInteger([number_text.join(""), 10]);
				denominator$1 = BigInteger.ONE;
			}
			else if(scale > 0) {
				numerator$1 = new BigInteger([number_text.join(""), 10]);
				var denominator_string$1 = ["1"];
				for(var i$2 = 0; i$2 < scale; i$2++) {
					denominator_string$1.push("0");
				}
				denominator$1 = new BigInteger([denominator_string$1.join(""), 10]);
			}
			f = new Fraction([numerator$1, denominator$1]);
		}
		if(cyclic_decimal) {
			if(!is_negate) {
				f = f.add(cyclic_decimal);
			}
			else {
				f = f.sub(cyclic_decimal);
			}
		}
		return f;
	};

	/**
		 * Create data for Fraction from fractional string.
		 * @param ntext {string}
		 * @return {Fraction}
		 */
	FractionTool.to_fraction_data_from_fraction_string = function to_fraction_data_from_fraction_string (ntext) {
		if(ntext.indexOf("/") === -1) {
			return FractionTool.to_fraction_data_from_number_string(ntext);
		}
		else {
			var fraction_value = ntext.split("/");
			var numerator_value = FractionTool.to_fraction_data_from_number_string(fraction_value[0]);
			var denominator_value = FractionTool.to_fraction_data_from_number_string(fraction_value[1]);
			return numerator_value.div(denominator_value);
		}
	};

	/**
		 * Create data for Fraction from number.
		 * @param value {number}
		 * @return {Fraction}
		 */
	FractionTool.to_fraction_data_from_number = function to_fraction_data_from_number (value) {
		var numerator = null;
		var denominator = null;
		// 整数
		if(value === Math.floor(value)) {
			numerator = new BigInteger(value);
			denominator = BigInteger.ONE;
		}
		// 浮動小数
		else {
			var scale = Math.trunc(Math.log(Math.abs(value)) / Math.log(10));
			var x = value / Math.pow(10, scale);
			// スケールを逆にする
			scale = - scale;
			for(var i = 0; i < 14; i++) {
				x = x * 10;
				scale = scale + 1;
				if(Math.abs(x - Math.round(x)) <= Number.EPSILON) {
					break;
				}
			}
			// 最も下の桁は四捨五入する
			x = Math.round(x * 1e14) / 1e14;
			if(scale <= 0) {
				numerator = new BigInteger(value);
				denominator = BigInteger.ONE;
			}
			else {
				numerator = new BigInteger(x);
				var denominator_string = ["1"];
				for(var i$1 = 0; i$1 < scale; i$1++) {
					denominator_string.push("0");
				}
				denominator = new BigInteger([denominator_string.join(""), 10]);
			}
		}
		return new Fraction([numerator, denominator]);
	};

	/**
		 * Normalization.
		 * - Reduce fraction using gcd.
		 * - Add the sign to the numerator.
		 * - If the number is zero, the denominator is one.
		 * @param value {Fraction}
		 */
	FractionTool.normalization = function normalization (value) {
		if(value.denominator.equals(BigInteger.ONE)) {
			return;
		}
		if(value.denominator.equals(BigInteger.MINUS_ONE)) {
			value.numerator = value.numerator.negate();
			value.denominator = BigInteger.ONE;
			return;
		}
		if(value.numerator.equals(BigInteger.ZERO)) {
			value.denominator = BigInteger.ONE;
			return;
		}
		var gcd = value.numerator.gcd(value.denominator);
		var numerator = value.numerator.div(gcd);
		var denominator = value.denominator.div(gcd);
		if(denominator.sign() < 0) {
			numerator = numerator.negate();
			denominator = denominator.negate();
		}
		value.numerator = numerator;
		value.denominator = denominator;
	};

	/**
	 * Fraction class (immutable).
	 */
	var Fraction = function Fraction(number) {
			
		// 分子
		/**
			 * @type {BigInteger}
			 */
		this.numerator = null;

		// 分母
		/**
			 * @type {BigInteger}
			 */
		this.denominator = null;

		if(arguments.length === 0) {
			this.numerator = BigInteger.ZERO;
			this.denominator = BigInteger.ONE;
		}
		else if(arguments.length === 1) {
			var is_normalization = false;
			if(typeof number === "number") {
				var x = FractionTool.to_fraction_data_from_number(number);
				this.numerator = x.numerator;
				this.denominator = x.denominator;
			}
			else if(typeof number === "string") {
				var x$1 = FractionTool.to_fraction_data_from_fraction_string(number);
				this.numerator = x$1.numerator;
				this.denominator = x$1.denominator;
			}
			else if(number instanceof BigInteger) {
				this.numerator = number;
				this.denominator = BigInteger.ONE;
			}
			else if(number instanceof Fraction) {
				this.numerator = number.numerator;
				this.denominator = number.denominator;
			}
			else if((number instanceof Array) && (number.length === 2)) {
				this.numerator = (number[0] instanceof BigInteger) ? number[0] : new BigInteger(number[0]);
				this.denominator = (number[1] instanceof BigInteger) ? number[1] : new BigInteger(number[1]);
				is_normalization = true;
			}
			else if((number instanceof Object) && number.numerator && number.denominator) {
				this.numerator = (number.numerator instanceof BigInteger) ? number.numerator : new BigInteger(number.numerator);
				this.denominator = (number.denominator instanceof BigInteger) ? number.denominator : new BigInteger(number.denominator);
				is_normalization = true;
			}
			else if(number instanceof BigDecimal) {
				var value = new Fraction(number.unscaledValue());
				var x$2 = value.scaleByPowerOfTen(-number.scale());
				this.numerator = x$2.numerator;
				this.denominator = x$2.denominator;
			}
			else if((number instanceof Object) && (number.doubleValue)) {
				var x$3 = FractionTool.to_fraction_data_from_number(number.doubleValue);
				this.numerator = x$3.numerator;
				this.denominator = x$3.denominator;
			}
			else if(number instanceof Object) {
				var x1 = FractionTool.to_fraction_data_from_fraction_string(number.toString());
				this.numerator = x1.numerator;
				this.denominator = x1.denominator;
			}
			else {
				throw "Fraction Unsupported argument " + number;
			}
			if(is_normalization) {
				FractionTool.normalization(this);
			}
		}
		else {
			throw "Fraction Unsupported argument " + number;
		}
	};

	var prototypeAccessors$2 = { intValue: { configurable: true },doubleValue: { configurable: true } };
	var staticAccessors$4 = { MINUS_ONE: { configurable: true },ZERO: { configurable: true },HALF: { configurable: true },ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true } };

	/**
		 * Create an entity object of this class.
		 * @returns {Fraction}
		 */
	Fraction.create = function create (number) {
		if(number instanceof Fraction) {
			return number;
		}
		else {
			return new Fraction(number);
		}
	};

	/**
		 * Convert number to Fraction type.
		 * @returns {Fraction}
		 */
	Fraction.valueOf = function valueOf (number) {
		return Fraction.create(number);
	};

	/**
		 * Convert to Fraction.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
		 * @returns {Fraction}
		 * @private
		 */
	Fraction._toFraction = function _toFraction (number) {
		if(number instanceof Fraction) {
			return number;
		}
		else {
			return new Fraction(number);
		}
	};

	/**
		 * Convert to real number.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Fraction._toFloat = function _toFloat (number) {
		if(typeof number === "number") {
			return number;
		}
		else if(number instanceof Fraction) {
			return number.doubleValue;
		}
		else {
			return (new Fraction(number)).doubleValue;
		}
	};

	/**
		 * Convert to integer.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Fraction._toInteger = function _toInteger (number) {
		if(typeof number === "number") {
			return Math.trunc(number);
		}
		else if(number instanceof Fraction) {
			return number.intValue;
		}
		else {
			return (new Fraction(number)).intValue;
		}
	};

	/**
		 * Deep copy.
		 * @returns {Fraction} 
		 */
	Fraction.prototype.clone = function clone () {
		return new Fraction(this);
	};

	/**
		 * Absolute value.
		 * @returns {Fraction} abs(A)
		 */
	Fraction.prototype.abs = function abs () {
		if(this.sign() >= 0) {
			return this;
		}
		return this.negate();
	};

	/**
		 * this * -1
		 * @returns {Fraction} -A
		 */
	Fraction.prototype.negate = function negate () {
		return new Fraction([this.numerator.negate(), this.denominator]);
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {number}
		 */
	Fraction.prototype.sign = function sign () {
		return this.numerator.sign();
	};
		
	/**
		 * Convert to string.
		 * @returns {string} 
		 */
	Fraction.prototype.toString = function toString () {
		return this.numerator.toString() + " / " + this.denominator.toString();
	};

	// ----------------------
	// 四則演算
	// ----------------------
		
	/**
		 * Add.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @return {Fraction}
		 */
	Fraction.prototype.add = function add (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		var f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.add(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([
				x.numerator.mul(y.denominator).add(y.numerator.mul(x.denominator)),
				x.denominator.mul(y.denominator)
			]);
		}
		return f;
	};

	/**
		 * Subtract.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @return {Fraction}
		 */
	Fraction.prototype.sub = function sub (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		var f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.sub(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([
				x.numerator.mul(y.denominator).sub(y.numerator.mul(x.denominator)),
				x.denominator.mul(y.denominator)
			]);
		}
		return f;
	};

	/**
		 * Multiply.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @return {Fraction}
		 */
	Fraction.prototype.mul = function mul (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		var f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator.mul(y.numerator), BigInteger.ONE]);
		}
		else {
			f = new Fraction([ x.numerator.mul(y.numerator), x.denominator.mul(y.denominator) ]);
		}
		return f;
	};

	/**
		 * Divide.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @return {Fraction}
		 */
	Fraction.prototype.div = function div (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		var f;
		if(x.isInteger() && y.isInteger()) {
			f = new Fraction([ x.numerator, y.numerator]);
		}
		else {
			f = new Fraction([ x.numerator.mul(y.denominator), y.numerator.mul(x.denominator)]);
		}
		return f;
	};

	/**
		 * Inverse number of this value.
		 * @return {Fraction}
		 */
	Fraction.prototype.inv = function inv () {
		return new Fraction([ this.denominator, this.numerator]);
	};

	/**
		 * Modulo, positive remainder of division.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @return {Fraction}
		 */
	Fraction.prototype.mod = function mod (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		// x - y * floor(x/y)
		return x.sub(y.mul(x.div(y).floor()));
	};

	/**
		 * Power function.
		 * - Supports only integers.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @returns {Fraction} pow(A, B)
		 */
	Fraction.prototype.pow = function pow (num) {
		var x = this;
		var y = Fraction._toInteger(num);
		var numerator = x.numerator.pow(y);
		var denominator = x.denominator.pow(y);
		return new Fraction([ numerator, denominator ]);
	};

	// ----------------------
	// その他の演算
	// ----------------------
		
	/**
		 * Factorial function, x!.
		 * - Supports only integers.
		 * @returns {Fraction} n!
		 */
	Fraction.prototype.factorial = function factorial () {
		return new Fraction([this.toBigInteger().factorial(), Fraction.ONE]);
	};

	/**
		 * Multiply a multiple of ten.
		 * - Supports only integers.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} n
		 * @returns {Fraction}
		 */
	Fraction.prototype.scaleByPowerOfTen = function scaleByPowerOfTen (n) {
		var scale = Fraction._toInteger(n);
		if(scale === 0) {
			return this;
		}
		var f;
		if(scale > 0) {
			f = new Fraction([ this.numerator.scaleByPowerOfTen(scale), this.denominator]);
		}
		else if(scale < 0) {
			f = new Fraction([ this.numerator, this.denominator.scaleByPowerOfTen(-scale)]);
		}
		return f;
	};

	// ----------------------
	// 他の型に変換用
	// ----------------------
		
	/**
		 * integer value.
		 * @returns {number}
		 */
	prototypeAccessors$2.intValue.get = function () {
		if(this.isInteger()) {
			return Math.trunc(this.numerator.doubleValue);
		}
		return Math.trunc(this.doubleValue);
	};

	/**
		 * floating point.
		 * @returns {number}
		 */
	prototypeAccessors$2.doubleValue.get = function () {
		if(this.isInteger()) {
			return this.numerator.doubleValue;
		}
		var x = new BigDecimal([this.numerator, MathContext.UNLIMITED]);
		var y = new BigDecimal([this.denominator, MathContext.UNLIMITED]);
		return x.div(y, {context : MathContext.DECIMAL64}).doubleValue;
	};

	/**
		 * return BigInteger.
		 * @returns {BigInteger}
		 */
	Fraction.prototype.toBigInteger = function toBigInteger () {
		return new BigInteger(this.fix().numerator);
	};
		
	/**
		 * return BigDecimal.
		 * @param {MathContext} [mc] - MathContext setting after calculation. 
		 * @returns {BigDecimal}
		 */
	Fraction.prototype.toBigDecimal = function toBigDecimal (mc) {
		if(this.isInteger()) {
			return new BigDecimal(this.numerator);
		}
		var x = new BigDecimal([this.numerator, MathContext.UNLIMITED]);
		var y = new BigDecimal([this.denominator, MathContext.UNLIMITED]);
		if(mc) {
			return x.div(y, {context: mc});
		}
		else {
			return x.div(y, {context: BigDecimal.getDefaultContext()});
		}
	};

	// ----------------------
	// 比較
	// ----------------------
		
	/**
		 * Equals.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @returns {boolean} A === B
		 */
	Fraction.prototype.equals = function equals (num) {
		var x = this;
		var y = Fraction._toFraction(num);
		return x.numerator.equals(y.numerator) && x.denominator.equals(y.denominator);
	};

	/**
		 * Compare values.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	Fraction.prototype.compareTo = function compareTo (num) {
		return this.sub(num).sign();
	};

	/**
		 * Maximum number.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
		 * @returns {Fraction} max([A, B])
		 */
	Fraction.prototype.max = function max (number) {
		var val = Fraction._toFraction(number);
		if(this.compareTo(val) >= 0) {
			return this;
		}
		else {
			return val;
		}
	};

	/**
		 * Minimum number.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
		 * @returns {Fraction} min([A, B])
		 */
	Fraction.prototype.min = function min (number) {
		var val = Fraction._toFraction(number);
		if(this.compareTo(val) >= 0) {
			return val;
		}
		else {
			return this;
		}
	};

	/**
		 * Clip number within range.
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} min 
		 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} max
		 * @returns {Fraction} min(max(x, min), max)
		 */
	Fraction.prototype.clip = function clip (min, max) {
		var min_ = Fraction._toFraction(min);
		var max_ = Fraction._toFraction(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	// ----------------------
	// 丸め
	// ----------------------
		
	/**
		 * Floor.
		 * @returns {Fraction} floor(A)
		 */
	Fraction.prototype.floor = function floor () {
		if(this.isInteger()) {
			return this;
		}
		var x = this.fix();
		if(this.sign() > 0) {
			return x;
		}
		else {
			return new Fraction([x.numerator.sub(BigInteger.ONE), Fraction.ONE]);
		}
	};

	/**
		 * Ceil.
		 * @returns {Fraction} ceil(A)
		 */
	Fraction.prototype.ceil = function ceil () {
		if(this.isInteger()) {
			return this;
		}
		var x = this.fix();
		if(this.sign() > 0) {
			return new Fraction([x.numerator.add(BigInteger.ONE), Fraction.ONE]);
		}
		else {
			return x;
		}
	};
		
	/**
		 * Rounding to the nearest integer.
		 * @returns {Fraction} round(A)
		 */
	Fraction.prototype.round = function round () {
		if(this.isInteger()) {
			return this;
		}
		var x = this.floor();
		var fract = this.sub(x);
		if(fract.compareTo(Fraction.HALF) >= 0) {
			return new Fraction([x.numerator.add(BigInteger.ONE), Fraction.ONE]);
		}
		else {
			return x;
		}
	};

	/**
		 * To integer rounded down to the nearest.
		 * @returns {Fraction} fix(A), trunc(A)
		 */
	Fraction.prototype.fix = function fix () {
		if(this.isInteger()) {
			return this;
		}
		return new Fraction([this.numerator.div(this.denominator), Fraction.ONE]);
	};

	/**
		 * Fraction.
		 * @returns {Fraction} fract(A)
		 */
	Fraction.prototype.fract = function fract () {
		if(this.isInteger()) {
			return Fraction.ZERO;
		}
		return this.sub(this.floor());
	};

	// ----------------------
	// テスト系
	// ----------------------
		
	/**
		 * Return true if the value is integer.
		 * @return {boolean}
		 */
	Fraction.prototype.isInteger = function isInteger () {
		return this.denominator.equals(BigInteger.ONE);
	};

	/**
		 * this === 0
		 * @return {boolean} A === 0
		 */
	Fraction.prototype.isZero = function isZero () {
		return this.numerator.equals(BigInteger.ZERO) && this.denominator.equals(BigInteger.ONE);
	};

	/**
		 * this === 1
		 * @return {boolean} A === 1
		 */
	Fraction.prototype.isOne = function isOne () {
		return this.numerator.equals(BigInteger.ONE) && this.denominator.equals(BigInteger.ONE);
	};

	/**
		 * this > 0
		 * @returns {boolean}
		 */
	Fraction.prototype.isPositive = function isPositive () {
		return this.numerator.isPositive();
	};

	/**
		 * this < 0
		 * @returns {boolean}
		 */
	Fraction.prototype.isNegative = function isNegative () {
		return this.numerator.isNegative();
	};

	/**
		 * this >= 0
		 * @returns {boolean}
		 */
	Fraction.prototype.isNotNegative = function isNotNegative () {
		return this.numerator.isNotNegative();
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * -1
		 * @returns {Fraction} -1
		 */
	staticAccessors$4.MINUS_ONE.get = function () {
		return DEFINE$3.MINUS_ONE;
	};

	/**
		 * 0
		 * @returns {Fraction} 0
		 */
	staticAccessors$4.ZERO.get = function () {
		return DEFINE$3.ZERO;
	};

	/**
		 * 0.5
		 * @returns {Fraction} 0.5
		 */
	staticAccessors$4.HALF.get = function () {
		return DEFINE$3.HALF;
	};
		
	/**
		 * 1
		 * @returns {Fraction} 1
		 */
	staticAccessors$4.ONE.get = function () {
		return DEFINE$3.ONE;
	};
		
	/**
		 * 2
		 * @returns {Fraction} 2
		 */
	staticAccessors$4.TWO.get = function () {
		return DEFINE$3.TWO;
	};
		
	/**
		 * 10
		 * @returns {Fraction} 10
		 */
	staticAccessors$4.TEN.get = function () {
		return DEFINE$3.TEN;
	};

	Object.defineProperties( Fraction.prototype, prototypeAccessors$2 );
	Object.defineProperties( Fraction, staticAccessors$4 );

	/**
	 * Collection of constant values used in the class.
	 * @ignore
	 */
	var DEFINE$3 = {

		/**
		 * -1
		 */
		MINUS_ONE : new Fraction([BigInteger.MINUS_ONE, BigInteger.ONE]),

		/**
		 * 0
		 */
		ZERO : new Fraction([BigInteger.ZERO, BigInteger.ONE]),
		
		/**
		 * 1
		 */
		ONE : new Fraction([BigInteger.ONE, BigInteger.ONE]),

		/**
		 * 0.5
		 */
		HALF : new Fraction([BigInteger.ONE, BigInteger.TWO]),

		/**
		 * 2
		 */
		TWO : new Fraction([BigInteger.TWO, BigInteger.ONE]),

		/**
		 * 10
		 */
		TEN : new Fraction([BigInteger.TEN, BigInteger.ONE])

	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection of functions for linear algebra.
	 * @ignore
	 */
	var LinearAlgebraTool = function LinearAlgebraTool () {};

	LinearAlgebraTool.tridiagonalize = function tridiagonalize (mat) {

		var A = Matrix._toMatrix(mat);
		var a = A.getNumberMatrixArray();
		var tolerance_ = 1.0e-10;

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		// 3重対角化の成分を取得する
			
		/**
			 * Inner product of vector x1 and vector x2.
			 * @param {Array<number>} x1
			 * @param {Array<number>} x2
			 * @param {number} [index_offset=0] - Offset of the position of the vector to be calculated.
			 * @param {number} [index_max=x1.length] - Maximum value of position of vector to be calculated (do not include this value).
			 * @returns {number} 
			 */
		var innerproduct = function(x1, x2, index_offset, index_max) {
			var y = 0;
			var ioffset = index_offset ? index_offset : 0;
			var imax = index_max ? index_max : x1.length;
			for(var i = ioffset; i < imax; i++) {
				y += x1[i] * x2[i];
			}
			return y;
		};

		/**
			 * Householder transformation.
			 * @param {Array<number>} x
			 * @param {number} [index_offset=0] - Offset of the position of the vector to be calculated.
			 * @param {number} [index_max=x.length] - Maximum value of position of vector to be calculated (do not include this value).
			 * @returns {{y1: number, v: Array<number>}} 
			 */
		var house = function(x, index_offset, index_max) {
			var ioffset = index_offset ? index_offset : 0;
			var imax = index_max ? index_max : x.length;
			// xの内積の平方根（ノルム）を計算
			var y1 = Math.sqrt(innerproduct(x, x, ioffset, imax));
			var v = [];
			if(Math.abs(y1) >= tolerance_) {
				if(x[ioffset] < 0) {
					y1 = - y1;
				}
				var t;
				for(var i = ioffset, j = 0; i < imax; i++, j++) {
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
				y1: - y1,// 鏡像の1番目の要素(y2,y3,...は0)
				v : v	// 直行する単位ベクトル vT*v = 2
			};
		};

		var n = a.length;
		var d = []; // 対角成分
		var e = []; // 隣の成分
		{
			for(var k = 0; k < n - 2; k++) {
				var v = a[k];
				d[k] = v[k];
				{
					var H$1 = house(v, k + 1, n);
					e[k] = H$1.y1;
					for(var i = 0; i < H$1.v.length; i++) {
						v[k + 1 + i] = H$1.v[i];
					}
				}
				if(Math.abs(e[k]) < tolerance_) {
					continue;
				}
				for(var i$1 = k + 1; i$1 < n; i$1++) {
					var s = 0;
					for(var j = k + 1; j < i$1; j++) {
						s += a[j][i$1] * v[j];
					}
					for(var j$1 = i$1; j$1 < n; j$1++) {
						s += a[i$1][j$1] * v[j$1];
					}
					d[i$1] = s;
				}
				var t = innerproduct(v, d, k + 1, n) / 2.0;
				for(var i$2 = n - 1; i$2 > k; i$2--) {
					var p = v[i$2];
					var q = d[i$2] - (t * p);
					d[i$2] = q;
					for(var j$2 = i$2; j$2 < n; j$2++) {
						var r = p * d[j$2] + q * v[j$2];
						a[i$2][j$2] = a[i$2][j$2] - r;
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
		for(var k$1 = n - 1; k$1 >= 0; k$1--) {
			var v$1 = a[k$1];
			if(k$1 < n - 2) {
				for(var i$3 = k$1 + 1; i$3 < n; i$3++) {
					var w = a[i$3];
					var t$1 = innerproduct(v$1, w, k$1 + 1, n);
					for(var j$3 = k$1 + 1; j$3 < n; j$3++) {
						w[j$3] -= t$1 * v$1[j$3];
					}
				}
			}
			for(var i$4 = 0; i$4 < n; i$4++) {
				v$1[i$4] = 0.0;
			}
			v$1[k$1] = 1.0;
		}

		// d と e の配列を使って、三重対角行列を作成する
		var H = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				return new Complex(d[row]);
			}
			else if(Math.abs(row - col) === 1) {
				return new Complex(e[Math.trunc((row + col) * 0.5)]);
			}
			else {
				return Complex.ZERO;
			}
		}, n, n);

		return {
			P : (new Matrix(a)).T(),
			H : H
		};
	};

	/**
		 * Eigendecomposition of symmetric matrix.
		 * - Don't support complex numbers.
		 * - V*D*V'=A.
		 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
		 * - D is a matrix containing the eigenvalues on the diagonal component.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - Symmetric matrix.
		 * @returns {{V: Matrix, D: Matrix}}
		 */
	LinearAlgebraTool.eig = function eig (mat) {
		var A = Matrix._toMatrix(mat);
			
		// QR法により固有値を求める
		var is_error = false;
		var tolerance_ = 1.0e-10;
		var PH = LinearAlgebraTool.tridiagonalize(A);
		var a = PH.P.getNumberMatrixArray();
		var h = PH.H.getNumberMatrixArray();
		var n = A.row_length;

		// 成分の抽出
		var d = []; // 対角成分
		var e = []; // 隣の成分
		for(var i = 0; i < n; i++) {
			d[i] = h[i][i];
			e[i] = (i === 0) ? 0.0 : h[i][i - 1];
		}

		// 参考：奥村晴彦 (1991). C言語による最新アルゴリズム事典.
		var MAX_ITER = 100;
		for(var h$1 = n - 1; h$1 > 0; h$1--) {
			var j = h$1;
			for(j = h$1;j >= 1; j--) {
				if(Math.abs(e[j]) <= (tolerance_ * (Math.abs(d[j - 1]) + Math.abs(d[j])))) {
					break;
				}
			}
			if(j == h$1) {
				continue;
			}
			var iter = 0;
			while(true) {
				iter++;
				if(iter > MAX_ITER) {
					is_error = true;
					break;
				}
				var w = (d[h$1 - 1] - d[h$1]) / 2.0;
				var t = e[h$1] * e[h$1];
				var s = Math.sqrt(w * w + t);
				if(w < 0) {
					s = - s;
				}
				var x = d[j] - d[h$1] + (t / (w + s));
				var y = e[j + 1];
				for(var k = j; k < h$1; k++) {
					var c = (void 0), s$1 = (void 0);
					if(Math.abs(x) >= Math.abs(y)) {
						t = - y / x;
						c = 1.0 / Math.sqrt(t * t + 1);
						s$1 = t * c;
					}
					else {
						t = - x / y;
						s$1 = 1.0 / Math.sqrt(t * t + 1);
						c = t * s$1;
					}
					w = d[k] - d[k + 1];
					t = (w * s$1 + 2.0 * c * e[k + 1]) * s$1;
					d[k] -= t;
					d[k + 1] += t;
					if(k > j) {
						e[k] = c * e[k] - s$1 * y;
					}
					e[k + 1] += s$1 * (c * w - 2.0 * s$1 * e[k + 1]);
					for(var i$1 = 0; i$1 < n; i$1++) {
						x = a[i$1][k];
						y = a[i$1][k + 1];
						a[i$1][k    ] = c * x - s$1 * y;
						a[i$1][k + 1] = s$1 * x + c * y;
					}
					if(k < h$1 - 1) {
						x = e[k + 1];
						y = -s$1 * e[k + 2];
						e[k + 2] *= c;
					}
				}
				if(Math.abs(e[h$1]) <= tolerance_ * (Math.abs(d[h$1 - 1]) + Math.abs(d[h$1]))) {
					break;
				}
			}
			if(is_error) {
				break;
			}
		}

		// 固有値が大きいものから並べるソート
		var vd_sort = function(V, d) {
			var len = d.length;
			var sortdata = [];
			for(var i = 0; i < len; i++) {
				sortdata[i] = {
					sigma : d[i],
					index : i
				};
			}
			var compare = function(a, b){
				if(a.sigma === b.sigma) {
					return 0;
				}
				return (a.sigma < b.sigma ? 1 : -1);
			};
			sortdata.sort(compare);
			var MOVE = Matrix.zeros(len);
			var ND = Matrix.zeros(len);
			for(var i$1 = 0; i$1 < len; i$1++) {
				ND.matrix_array[i$1][i$1] = new Complex(sortdata[i$1].sigma);
				MOVE.matrix_array[i$1][sortdata[i$1].index] = Complex.ONE;
			}
			return {
				V : V.mul(MOVE),
				D : ND
			};
		};
		var VD = vd_sort(new Matrix(a), d);
		return VD;
	};

	/**
		 * Treat matrices as vectors, make them orthonormal, and make matrices of Q and R.
		 * The method of Gram-Schmidt orthonormalization is used.
		 * @param {Matrix} mat - Square matrix.
		 * @returns {{Q: Matrix, R: Matrix, non_orthogonalized : Array<number>}}
		 */
	LinearAlgebraTool.doGramSchmidtOrthonormalization = function doGramSchmidtOrthonormalization (mat) {
		// グラム・シュミットの正規直交化法を使用する
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.

		var M = Matrix._toMatrix(mat);
		var len = M.column_length;
		var A = M.matrix_array;
		var Q_Matrix = Matrix.zeros(len);
		var R_Matrix = Matrix.zeros(len);
		var Q = Q_Matrix.matrix_array;
		var R = R_Matrix.matrix_array;
		var non_orthogonalized = [];
		var a = new Array(len);
			
		for(var col = 0; col < len; col++) {
			// i列目を抽出
			for(var row = 0; row < len; row++) {
				a[row] = A[row][col];
			}
			// 直行ベクトルを作成
			if(col > 0) {
				// Rのi列目を内積で計算する
				for(var j = 0; j < col; j++) {
					for(var k = 0; k < len; k++) {
						R[j][col] = R[j][col].add(A[k][col].dot(Q[k][j]));
					}
				}
				for(var j$1 = 0; j$1 < col; j$1++) {
					for(var k$1 = 0; k$1 < len; k$1++) {
						a[k$1] = a[k$1].sub(R[j$1][col].mul(Q[k$1][j$1]));
					}
				}
			}
			{
				// 正規化と距離を1にする
				for(var j$2 = 0; j$2 < len; j$2++) {
					R[col][col] = R[col][col].add(a[j$2].square());
				}
				R[col][col] = R[col][col].sqrt();
				if(R[col][col].isZero(1e-10)) {
					// 直行化が不可能だった列の番号をメモして、その列はゼロで埋める
					non_orthogonalized.push(col);
					for(var j$3 = 0;j$3 < len;j$3++) {
						Q[j$3][col] = Complex.ZERO;
					}
				}
				else {
					// ここで R[i][i] === 0 の場合、直行させたベクトルaは0であり、
					// ランク落ちしており、計算不可能である。
					// 0割りした値を、j列目のQに記録していくがInfとなる。
					for(var j$4 = 0;j$4 < len;j$4++) {
						Q[j$4][col] = a[j$4].div(R[col][col]);
					}
				}
			}
		}
		return {
			Q : Q_Matrix,
			R : R_Matrix,
			non_orthogonalized : non_orthogonalized
		};
	};
		
	/**
		 * Create orthogonal vectors for all row vectors of the matrix.
		 * - If the vector can not be found, it returns NULL.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} [tolerance=1.0e-10] - Calculation tolerance of calculation.
		 * @returns {Matrix|null} An orthogonal vector.
		 */
	LinearAlgebraTool.createOrthogonalVector = function createOrthogonalVector (mat, tolerance) {
		var M = new Matrix(mat);
		var column_length = M.column_length;
		var m = M.matrix_array;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		// 正則行列をなす場合に問題となる行番号を取得
		var not_regular_rows = LinearAlgebraTool.getLinearDependenceVector(M, tolerance_);
		// 不要な行を削除する
		{
			// not_regular_rowsは昇順リストなので、後ろから消していく
			for(var i = not_regular_rows.length - 1; i >= 0; i--) {
				m.splice(not_regular_rows[i], 1);
				M.row_length--;
			}
		}
		// 追加できるベクトルの数
		var add_vectors = column_length - m.length;
		if(add_vectors <= 0) {
			return null;
		}
		// ランダムベクトル（seed値は毎回同一とする）
		var noise = new Random(0);
		var orthogonal_matrix = null;
		for(var i$1 = 0; i$1 < 100; i$1++) {
			// 直行ベクトルを作るために、いったん行と列を交換する
			// これは、グラム・シュミットの正規直交化法が列ごとに行う手法のため。
			var M2 = M.T();
			// ランダム行列を作成する
			var R = Matrix.createMatrixDoEachCalculation(function() {
				return new Complex(noise.nextGaussian());
			}, M2.row_length, add_vectors);
			// 列に追加する
			M2._concatRight(R);
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
		var y = new Array(add_vectors);
		var q = orthogonal_matrix.Q.matrix_array;
		for(var row = 0; row < add_vectors; row++) {
			y[row] = new Array(column_length);
			for(var col = 0; col < column_length; col++) {
				y[row][col] = q[col][column_length - add_vectors + row];
			}
		}
		return new Matrix(y);
	};

	/**
		 * Row number with the largest norm value in the specified column of the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} column_index - Number of column of matrix.
		 * @param {number} [row_index_offset=0] - Offset of the position of the vector to be calculated.
		 * @param {number} [row_index_max] - Maximum value of position of vector to be calculated (do not include this value).
		 * @returns {{index: number, max: number}} Matrix row number.
		 * @private
		 */
	LinearAlgebraTool.getMaxRowNumber = function getMaxRowNumber (mat, column_index, row_index_offset, row_index_max) {
		var M = Matrix._toMatrix(mat);
		var row_index = 0;
		var row_max = 0;
		var row = row_index_offset ? row_index_offset : 0;
		var row_imax = row_index_max ? row_index_max : M.row_length;
		// n列目で最も大きな行を取得
		for(; row < row_imax; row++) {
			var norm = M.matrix_array[row][column_index].norm;
			if(norm > row_max) {
				row_max = norm;
				row_index = row;
			}
		}
		return {
			index : row_index,
			max : row_max
		};
	};

	/**
		 * Extract linearly dependent rows when each row of matrix is a vector.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {number} [tolerance=1.0e-10] - Calculation tolerance of calculation.
		 * @returns {Array} Array of matrix row numbers in ascending order.
		 * @private
		 */
	LinearAlgebraTool.getLinearDependenceVector = function getLinearDependenceVector (mat, tolerance) {
		var M = new Matrix(mat);
		var m = M.matrix_array;
		var tolerance_ = tolerance ? Matrix._toDouble(tolerance) : 1.0e-10;
		// 確認する行番号（ここから終わった行は削除していく）
		var row_index_array = new Array(mat.row_length);
		for(var i = 0; i < mat.row_length; i++) {
			row_index_array[i] = i;
		}
		// ガウスの消去法を使用して、行ベクトルを抽出していく
		for(var col_target = 0; col_target < M.column_length; col_target++) {
			var row_max_index = 0;
			{
				var row_max = 0;
				var row_max_key = 0;
				// n列目で絶対値が最も大きな行を取得
				for(var row_key in row_index_array) {
					var row = row_index_array[row_key];
					var norm = m[row][col_target].norm;
					if(norm > row_max) {
						row_max = norm;
						row_max_key = parseInt(row_key, 10);
						row_max_index = row;
					}
				}
				// 大きいのが0である＝その列は全て0である
				if(row_max <= tolerance_) {
					continue;
				}
				// 大きな値があった行は、リストから除去する
				row_index_array.splice(row_max_key, 1);
				if(col_target === M.column_length - 1) {
					break;
				}
			}
			// 次の列から、大きな値があった行の成分を削除
			for(var row_key$1 in row_index_array) {
				var row$1 = row_index_array[row_key$1];
				var inv = m[row$1][col_target].div(m[row_max_index][col_target]);
				for(var col = col_target; col < M.column_length; col++) {
					m[row$1][col] = m[row$1][col].sub(m[row_max_index][col].mul(inv));
				}
			}
		}
		return row_index_array;
	};

	/**
	 * Class for linear algebra for Matrix class.
	 */
	var LinearAlgebra = function LinearAlgebra () {};

	LinearAlgebra.inner = function inner (A, B, dimension) {
		var M1 = Matrix._toMatrix(A);
		var M2 = Matrix._toMatrix(B);
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var dim = dimension ? Matrix._toInteger(dimension) : 1;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.dot(M2.scalar));
		}
		if(M1.isVector() && M2.isVector()) {
			var sum = Complex.ZERO;
			for(var i = 0; i < M1.length; i++) {
				sum = sum.add(M1.getComplex(i).dot(M2.getComplex(i)));
			}
			return new Matrix(sum);
		}
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		if(dim === 1) {
			var y = new Array(1);
			y[0] = new Array(M1.column_length);
			for(var col = 0; col < M1.column_length; col++) {
				var sum$1 = Complex.ZERO;
				for(var row = 0; row < M1.row_length; row++) {
					sum$1 = sum$1.add(x1[row][col].dot(x2[row][col]));
				}
				y[0][col] = sum$1;
			}
			return new Matrix(y);
		}
		else if(dim === 2) {
			var y$1 = new Array(M1.row_length);
			for(var row$1 = 0; row$1 < M1.row_length; row$1++) {
				var sum$2 = Complex.ZERO;
				for(var col$1 = 0; col$1 < M1.column_length; col$1++) {
					sum$2 = sum$2.add(x1[row$1][col$1].dot(x2[row$1][col$1]));
				}
				y$1[row$1] = [sum$2];
			}
			return new Matrix(y$1);
		}
		else {
			throw "dim";
		}
	};

	/**
		 * p-norm.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	LinearAlgebra.norm = function norm (mat, p) {
		var M = Matrix._toMatrix(mat);
		var p_number = (p === undefined) ? 2 : Matrix._toDouble(p);
		if(p_number === 1) {
			// 行列の1ノルム
			var y = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				var sum = 0.0;
				for(var col = 0; col < M.column_length; col++) {
					sum += y[0][col].norm;
				}
				return sum;
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				var sum$1 = 0.0;
				for(var row = 0; row < M.row_length; row++) {
					sum$1 += y[row][0].norm;
				}
				return sum$1;
			}
			// 列の和の最大値
			var max = 0;
			// 列を固定して行の和を計算
			for(var col$1 = 0; col$1 < M.column_length; col$1++) {
				var sum$2 = 0;
				for(var row$1 = 0; row$1 < M.row_length; row$1++) {
					sum$2 += y[row$1][col$1].norm;
				}
				if(max < sum$2) {
					max = sum$2;
				}
			}
			return max;
		}
		else if(p_number === 2) {
			// 行列の2ノルム
			var y$1 = M.matrix_array;
			// 行ノルムを計算する
			if(M.isRow()) {
				var sum$3 = 0.0;
				for(var col$2 = 0; col$2 < M.column_length; col$2++) {
					sum$3 += y$1[0][col$2].square().real;
				}
				return Math.sqrt(sum$3);
			}
			// 列ノルムを計算する
			else if(M.isColumn()) {
				var sum$4 = 0.0;
				for(var row$2 = 0; row$2 < M.row_length; row$2++) {
					sum$4 += y$1[row$2][0].square().real;
				}
				return Math.sqrt(sum$4);
			}
			return M.svd().S.diag().max().scalar.real;
		}
		else if((p_number === Number.POSITIVE_INFINITY) || (p_number === Number.NEGATIVE_INFINITY)) {
			var y$2 = M.matrix_array;
			var compare_number = p_number === Number.POSITIVE_INFINITY ? 0 : Number.POSITIVE_INFINITY;
			var compare_func = p_number === Number.POSITIVE_INFINITY ? Math.max : Math.min;
			// 行ノルムを計算する
			if(M.isRow()) {
				for(var col$3 = 0; col$3 < M.column_length; col$3++) {
					compare_number = compare_func(compare_number, y$2[0][col$3].norm);
				}
				return compare_number;
			}
			// 列ノルムを計算する
			if(M.isColumn()) {
				for(var row$3 = 0; row$3 < M.row_length; row$3++) {
					compare_number = compare_func(compare_number, y$2[row$3][0].norm);
				}
				return compare_number;
			}
			// 行列の場合は、列の和の最大値
			compare_number = 0;
			for(var row$4 = 0; row$4 < M.row_length; row$4++) {
				var sum$5 = 0.0;
				for(var col$4 = 0; col$4 < M.column_length; col$4++) {
					sum$5 += y$2[row$4][col$4].norm;
				}
				compare_number = Math.max(compare_number, sum$5);
			}
			return compare_number;
		}
		else if(M.isVector()) {
			// 一般化ベクトルpノルム
			var sum$6 = 0.0;
			for(var i = 0; i < M.length; i++) {
				sum$6 += Math.pow(M.getComplex(i).norm, p_number);
			}
			return Math.pow(sum$6, 1.0 / p_number);
		}
		// 未実装
		throw "norm";
	};
		
	/**
		 * Condition number of the matrix
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	LinearAlgebra.cond = function cond (mat, p) {
		var M = Matrix._toMatrix(mat);
		var p_number = (p === undefined) ? 2 : Matrix._toInteger(p);
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
			var s = M.svd().S.diag();
			return s.max().scalar.real / s.min().scalar.real;
		}
		return M.norm(p) * M.pinv().norm(p);
	};

	/**
		 * Inverse condition number.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {number}
		 */
	LinearAlgebra.rcond = function rcond (mat) {
		return 1.0 / LinearAlgebra.cond(Matrix._toMatrix(mat), 1);
	};

	/**
		 * Rank.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {number} rank(A)
		 */
	LinearAlgebra.rank = function rank (mat, tolerance) {
		var M = Matrix._toMatrix(mat);
		// 横が長い行列の場合
		if(M.row_length <= M.column_length) {
			return Math.min(M.row_length, M.column_length) - (LinearAlgebraTool.getLinearDependenceVector(M, tolerance)).length;
		}
		else {
			return M.row_length - (LinearAlgebraTool.getLinearDependenceVector(M, tolerance)).length;
		}
	};

	/**
		 * Trace of a matrix.
		 * Sum of diagonal elements.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {Complex}
		 */
	LinearAlgebra.trace = function trace (mat) {
		var M = Matrix._toMatrix(mat);
		var len = Math.min(M.row_length, M.column_length);
		var sum = Complex.ZERO;
		for(var i = 0; i < len; i++) {
			sum = sum.add(M.matrix_array[i][i]);
		}
		return sum;
	};

	/**
		 * Determinant.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
		 * @returns {Matrix} |A|
		 */
	LinearAlgebra.det = function det (mat) {
		var M = Matrix._toMatrix(mat);
		if(!M.isSquare()) {
			throw "not square";
		}
		var len = M.length;
		if(len < 5) {
			var calcDet = function(x) {
				if(x.length === 2) {
					// 2次元の行列式になったら、たすき掛け計算する
					return x[0][0].mul(x[1][1]).sub(x[0][1].mul(x[1][0]));
				}
				var y = Complex.ZERO;
				for(var i = 0; i < x.length; i++) {
					// N次元の行列式を、N-1次元の行列式に分解していく
					var D = [];
					var a = x[i][0];
					for(var row = 0, D_low = 0; row < x.length; row++) {
						if(i === row) {
							continue;
						}
						D[D_low] = [];
						for(var col = 1, D_col = 0; col < x.length; col++, D_col++) {
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
			var lup = LinearAlgebra.lup(M);
			var exchange_count = (len - lup.P.diag().sum().scalar.real) / 2;
			// 上行列の対角線上の値を掛け算する
			var y = lup.U.diag().prod();
			if((exchange_count % 2) === 1) {
				y = y.negate();
			}
			return new Matrix(y);
		}
	};

	/**
		 * LUP decomposition.
		 * - P'*L*U=A
		 * - P is permutation matrix.
		 * - L is lower triangular matrix.
		 * - U is upper triangular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
		 */
	LinearAlgebra.lup = function lup (mat) {
		var A = new Matrix(mat);
		var L = Matrix.zeros(A.row_length);
		var U = A;
		var P = Matrix.eye(A.row_length);
		var l = L.matrix_array;
		var u = U.matrix_array;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(var k = 0; k < A.column_length; k++) {
			// ピポットの選択
			var pivot = (void 0);
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var max_row_number = LinearAlgebraTool.getMaxRowNumber(U, k, k);
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
			for(var row = k + 1;row < A.row_length; row++) {
				var temp = u[row][k].div(u[k][k]);
				l[row][k] = temp;
				//lの値だけ行交換が必要？
				for(var col = k; col < A.column_length; col++) {
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
	};

	/**
		 * LU decomposition.
		 * - L*U=A
		 * - L is lower triangular matrix.
		 * - U is upper triangular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{L: Matrix, U: Matrix}} {L, U}
		 */
	LinearAlgebra.lu = function lu (mat) {
		var lup = LinearAlgebra.lup(mat);
		var L = lup.P.T().mul(lup.L);
		return {
			L : L,
			U : lup.U
		};
	};

	/**
		 * Solving a system of linear equations to be Ax = B
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
		 * @returns {Matrix} x
		 * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
		 */
	LinearAlgebra.linsolve = function linsolve (mat, number) {
		var A = Matrix._toMatrix(mat);
		var B = Matrix._toMatrix(number);
		if(!A.isSquare()) {
			throw "Matrix size does not match";
		}
		// 連立一次方程式を解く
		var arg = B;
		if((B.row_length !== A.row_length) || (B.column_length > 1)) {
			throw "Matrix size does not match";
		}
		// 行列を準備する
		var M = new Matrix(A);
		M._concatRight(arg);
		var long_matrix_array = M.matrix_array;
		var long_length = M.column_length;
		var len = A.column_length;
		// ガウスの消去法で連立1次方程式の未知数を求める
		//前進消去
		for(var k = 0; k < (len - 1); k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				var normalize_value = long_matrix_array[k][k].inv();
				for(var row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(var row$1 = k + 1;row$1 < len; row$1++) {
				var temp = long_matrix_array[row$1][k];
				for(var col$1 = k; col$1 < long_length; col$1++) {
					long_matrix_array[row$1][col$1] = long_matrix_array[row$1][col$1].sub(long_matrix_array[k][col$1].mul(temp));
				}
			}
		}
		//後退代入
		var y = new Array(len);
		y[len - 1] = long_matrix_array[len - 1][len].div(long_matrix_array[len - 1][len - 1]);
		for(var row$2 = len - 2; row$2 >= 0; row$2--) {
			y[row$2] = long_matrix_array[row$2][long_length - 1];
			for(var j = row$2 + 1; j < len; j++) {
				y[row$2] = y[row$2].sub(long_matrix_array[row$2][j].mul(y[j]));
			}
			y[row$2] = y[row$2].div(long_matrix_array[row$2][row$2]);
		}
		var y2 = new Array(A.row_length);
		for(var row$3 = 0; row$3 < A.row_length; row$3++) {
			y2[row$3] = [y[row$3]];
		}

		return new Matrix(y2);
	};

	/**
		 * QR decomposition.
		 * - Q*R=A
		 * - Q is orthonormal matrix.
		 * - R is upper triangular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{Q: Matrix, R: Matrix}} {Q, R}
		 */
	LinearAlgebra.qr = function qr (mat) {
		// 行列を準備する
		var M = new Matrix(mat);
		// 作成後のQとRのサイズ
		var Q_row_length = M.row_length;
		var Q_column_length = M.row_length;
		var R_row_length = M.row_length;
		var R_column_length = M.column_length;
		// 計算時の行と列のサイズ
		var dummy_size = Math.max(M.row_length, M.column_length);
		// 正方行列にする
		M._resize(dummy_size, dummy_size);
		// 正規直行化
		var orthogonal_matrix = LinearAlgebraTool.doGramSchmidtOrthonormalization(M);
		// 計算したデータを取得
		var Q_Matrix = orthogonal_matrix.Q;
		var R_Matrix = orthogonal_matrix.R;
		var non_orthogonalized = orthogonal_matrix.non_orthogonalized;

		// Qのサイズを成型する
		if(non_orthogonalized.length === M.row_length) {
			// 零行列の場合の特別処理
			Q_Matrix = Matrix.eye(M.row_length);
		}
		else if(non_orthogonalized.length !== 0) {
			// 一部、直行化できていない列があるため直行化できてない列以外を抽出
			var map = {};
			for(var i = 0; i < non_orthogonalized.length; i++) {
				map[non_orthogonalized[i]] = 1;
			}
			var orthogonalized = [];
			for(var i$1 = 0; i$1 < dummy_size; i$1++) {
				if(map[i$1]) {
					continue;
				}
				var array = [];
				for(var j = 0; j < dummy_size; j++) {
					array[j] = Q_Matrix.matrix_array[j][i$1];
				}
				orthogonalized.push(array);
			}
			// 直行ベクトルを作成する
			var orthogonal_vector = LinearAlgebraTool.createOrthogonalVector(orthogonalized);
			// 直行化できていない列を差し替える
			for(var i$2 = 0; i$2 < non_orthogonalized.length; i$2++) {
				var q_col = non_orthogonalized[i$2];
				for(var j$1 = 0; j$1 < dummy_size; j$1++) {
					Q_Matrix.matrix_array[j$1][q_col] = orthogonal_vector.matrix_array[i$2][j$1];
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
	};

	/**
		 * Tridiagonalization of symmetric matrix.
		 * - Don't support complex numbers.
		 * - P*H*P'=A
		 * - P is orthonormal matrix.
		 * - H is tridiagonal matrix.
		 * - The eigenvalues of H match the eigenvalues of A.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{P: Matrix, H: Matrix}} {P, H}
		 */
	LinearAlgebra.tridiagonalize = function tridiagonalize (mat) {
		var M = new Matrix(mat);
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
	};

	/**
		 * Eigendecomposition of symmetric matrix.
		 * - Don't support complex numbers.
		 * - V*D*V'=A.
		 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
		 * - D is a matrix containing the eigenvalues on the diagonal component.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{V: Matrix, D: Matrix}} {D, V}
		 * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
		 */
	LinearAlgebra.eig = function eig (mat) {
		var M = new Matrix(mat);
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
	};

	/**
		 * Singular Value Decomposition (SVD).
		 * - U*S*V'=A
		 * - U and V are orthonormal matrices.
		 * - S is a matrix with singular values in the diagonal.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
		 */
	LinearAlgebra.svd = function svd (mat) {
		var M = new Matrix(mat);
		if(M.isComplex()) {
			// 複素数が入っている場合は、eig関数が使用できないので非対応
			throw "Unimplemented";
		}
		var rank = LinearAlgebra.rank(M);
		// SVD分解
		// 参考：Gilbert Strang (2007). Computational Science and Engineering.
		var VD = LinearAlgebra.eig(M.T().mul(M));
		var sigma = Matrix.zeros(M.row_length, M.column_length);
		sigma._each(function(num, row, col) {
			if((row === col) && (row < rank)) {
				return VD.D.getComplex(row, row).sqrt();
			}
		});
		var s_size = Math.min(M.row_length, M.column_length);
		var sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				var x = sigma.matrix_array[row][row];
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
		var V_rank = VD.V.resize(VD.V.row_length, s_size);
		var u = M.mul(V_rank).mul(sing);
		var QR = LinearAlgebra.qr(u);
		return {
			U : QR.Q,
			S : sigma,
			V : VD.V
		};
	};

	/**
		 * Inverse matrix of this matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {Matrix} A^-1
		 */
	LinearAlgebra.inv = function inv (mat) {
		var X = new Matrix(mat);
		if(X.isScalar()) {
			return new Matrix(Complex.ONE.div(X.scalar));
		}
		if(!X.isSquare()) {
			throw "not square";
		}
		if(X.isDiagonal()) {
			// 対角行列の場合は、対角成分のみ逆数をとる
			var y$1 = X.T();
			var size = Math.min(y$1.row_length, y$1.column_length);
			for(var i = 0; i < size; i++) {
				y$1.matrix_array[i][i] = y$1.matrix_array[i][i].inv();
			}
			return y$1;
		}
		// (ここで正規直交行列の場合なら、転置させるなど入れてもいい？判定はできないけども)
		var len = X.column_length;
		// ガウス・ジョルダン法
		// 初期値の設定
		var M = new Matrix(X);
		M._concatRight(Matrix.eye(len));
		var long_matrix_array = M.matrix_array;
		var long_length = M.column_length;

		//前進消去
		for(var k = 0; k < len; k++) {
			//ピポットの選択
			{
				// k列目で最も大きな行を取得(k列目から調べる)
				var row_num = LinearAlgebraTool.getMaxRowNumber(M, k, k).index;
				//交換を行う
				M._exchangeRow(k, row_num);
			}
			//ピポットの正規化
			{
				var normalize_value = long_matrix_array[k][k].inv();
				for(var row = k, col = k; col < long_length; col++) {
					long_matrix_array[row][col] = long_matrix_array[row][col].mul(normalize_value);
				}
			}
			//消去
			for(var row$1 = 0;row$1 < len; row$1++) {
				if(row$1 === k) {
					continue;
				}
				var temp = long_matrix_array[row$1][k];
				for(var col$1 = k; col$1 < long_length; col$1++)
				{
					long_matrix_array[row$1][col$1] = long_matrix_array[row$1][col$1].sub(long_matrix_array[k][col$1].mul(temp));
				}
			}
		}

		var y = new Array(len);
		//右の列を抜き取る
		for(var row$2 = 0; row$2 < len; row$2++) {
			y[row$2] = new Array(len);
			for(var col$2 = 0; col$2 < len; col$2++) {
				y[row$2][col$2] = long_matrix_array[row$2][len + col$2];
			}
		}

		return new Matrix(y);
	};

	/**
		 * Pseudo-inverse matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
		 * @returns {Matrix} A^+
		 */
	LinearAlgebra.pinv = function pinv (mat) {
		var M = new Matrix(mat);
		var USV = LinearAlgebra.svd(M);
		var U = USV.U;
		var S = USV.S;
		var V = USV.V;
		var sing = Matrix.createMatrixDoEachCalculation(function(row, col) {
			if(row === col) {
				var x = S.matrix_array[row][row];
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
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection of calculation settings for matrix.
	 * - Available options vary depending on the method.
	 * @typedef {Object} StatisticsSettings
	 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
	 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
	 */

	/**
	 * Class for statistical processing for Matrix class.
	 */
	var Statistics = function Statistics () {};

	Statistics.max = function max (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = data[0];
			for(var i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) < 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};
		
	/**
		 * Minimum number.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix} min([A, B])
		 */
	Statistics.min = function min (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = data[0];
			for(var i = 1; i < data.length; i++) {
				if(x.compareTo(data[i]) > 0) {
					x = data[i];
				}
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Sum.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.sum = function sum (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			// カハンの加算アルゴリズム
			var sum = Complex.ZERO;
			var delta = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				var new_number = data[i].add(delta);
				var new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Arithmetic average.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.mean = function mean (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			// カハンの加算アルゴリズム
			var sum = Complex.ZERO;
			var delta = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				var new_number = data[i].add(delta);
				var new_sum = sum.add(new_number);
				delta = new_sum.sub(sum).sub(new_number);
				sum = new_sum;
			}
			return [sum.div(data.length)];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Product of array elements.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.prod = function prod (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = Complex.ONE;
			for(var i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Geometric mean.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.geomean = function geomean (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var x = Complex.ONE;
			for(var i = 0; i < data.length; i++) {
				x = x.mul(data[i]);
			}
			return [x.pow(Complex.create(data.length).inv())];
		};
		return X.eachVector(main, dim);
	};
		
	/**
		 * Median.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.median = function median (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var compare = function(a, b){
			return a.compareTo(b);
		};
		var main = function(data) {
			data.sort(compare);
			var y;
			if((data.length % 2) === 1) {
				y = data[Math.floor(data.length / 2)];
			}
			else {
				var x1 = data[Math.floor(data.length / 2) - 1];
				var x2 = data[Math.floor(data.length / 2)];
				y = x1.add(x2).div(Complex.TWO);
			}
			return [y];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Mode.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.mode = function mode (x, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var compare = function(a, b){
			return a.compareTo(b);
		};
		var main = function(data) {
			data.sort(compare);
			var map = {};
			for(var i = 0; i < data.length; i++) {
				var str = data[i].real + " " + data[i].imag;
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
			var max_complex = Complex.ZERO;
			var max_number = Number.NEGATIVE_INFINITY;
			for(var key in map) {
				var tgt = map[key];
				if(tgt.value > max_number) {
					max_number= tgt.value;
					max_complex= tgt.complex;
				}
			}
			return [max_complex];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Moment.
		 * - Moment of order n. Equivalent to the definition of variance at 2.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {number} nth_order
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.moment = function moment (x, nth_order, type) {
		var X = Matrix._toMatrix(x);
		var M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、標本分散とする
		var cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var order = Matrix._toComplex(nth_order);
		var col = 0;
		var main = function(data) {
			var mean;
			if(M.isScalar()) {
				mean = M.scalar;
			}
			else {
				mean = M.getComplex(col++);
			}
			var x = Complex.ZERO;
			for(var i = 0; i < data.length; i++) {
				// 計算方法について
				// ・複素数は、ノルムをとらずに複素数用のpowを使用したほうがいいのか
				// ・分散と同様にnormで計算したほうがいいのか
				// 複素数でのモーメントの定義がないため不明であるが、
				// 分散を拡張した考えであれば、normをとった累乗のほうが良いと思われる。
				var a = data[i].sub(mean);
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
	};

	/**
		 * Variance.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.var = function var$1 (x, type) {
		var X = Matrix._toMatrix(x);
		var M = Statistics.mean(X);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var col = 0;
		var main = function(data) {
			if(data.length === 1) {
				// 要素が1であれば、分散は0固定
				return [Complex.ZERO];
			}
			var mean = M.getComplex(col++);
			// 分散は、ノルムの2乗で計算するため必ず実数になる。
			var x = 0;
			for(var i = 0; i < data.length; i++) {
				var a = data[i].sub(mean).norm;
				x += a * a;
			}
			return [Complex.create(x / (data.length - 1 + cor))];
		};
		return X.eachVector(main, dim);
	};

	/**
		 * Standard deviation.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.std = function std (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Statistics.var(X, { correction : cor, dimension : dim });
		M._each(function(num) {
			return num.sqrt();
		});
		return M;
	};

	/**
		 * Mean absolute deviation.
		 * - The "algorithm" can choose "0/mean"(default) and "1/median".
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {?string|?number} [algorithm]
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.mad = function mad (x, algorithm, type) {
		var X = Matrix._toMatrix(x);
		var alg = !algorithm ? "mean" : (typeof algorithm === "string" ? algorithm : Matrix._toInteger(algorithm));
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		if((alg === "mean") || (alg === 0)) {
			return Statistics.mean(X.sub(Statistics.mean(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else if((alg === "median") || (alg === 1)) {
			return Statistics.median(X.sub(Statistics.median(X, {dimension : dim} )).abs(), {dimension : dim});
		}
		else {
			throw "mad unsupported argument " + alg;
		}
	};

	/**
		 * Skewness.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.skewness = function skewness (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏), 1(標本)。規定値は、標本とする
		var cor = !(type && typeof type.correction === "number") ? 1: Matrix._toDouble(type.correction);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var order = Statistics.moment(X, 3, { correction : cor, dimension : dim });
		var std = Statistics.std(X, { correction : cor, dimension : dim });
		if(cor === 1) {
			return order.dotdiv(std.dotpow(3));
		}
		else {
			return order.dotdiv(std.dotpow(3)).dotmul(2);
		}
	};

	/**
		 * Covariance matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.cov = function cov (x, type) {
		var X = Matrix._toMatrix(x);
		// 補正値 0(不偏分散), 1(標本分散)。規定値は、不偏分散とする
		var cor = !(type && typeof type.correction === "number") ? 0: Matrix._toDouble(type.correction);
		if(X.isVector()) {
			return Statistics.var(X, type);
		}
		var correction = X.row_length === 1 ? 1 : cor;
		var arr = X.matrix_array;
		var mean = Statistics.mean(X).matrix_array[0];
		// 上三角行列、対角行列
		var y = new Array(X.column_length);
		for(var a = 0; a < X.column_length; a++) {
			var a_mean = mean[a];
			y[a] = new Array(X.column_length);
			for(var b = a; b < X.column_length; b++) {
				var b_mean = mean[b];
				var sum = Complex.ZERO;
				for(var row = 0; row < X.row_length; row++) {
					sum = sum.add((arr[row][a].sub(a_mean)).dot(arr[row][b].sub(b_mean)));
				}
				y[a][b] = sum.div(X.row_length - 1 + correction);
			}
		}
		// 下三角行列を作る
		for(var row$1 = 1; row$1 < y[0].length; row$1++) {
			for(var col = 0; col < row$1; col++) {
				y[row$1][col] = y[col][row$1];
			}
		}
		return new Matrix(y);
	};

	/**
		 * The samples are normalized to a mean value of 0, standard deviation of 1.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.normalize = function normalize (x, type) {
		var X = Matrix._toMatrix(x);
		var mean_zero = X.sub(Statistics.mean(X, type));
		var std_one = mean_zero.dotdiv(Statistics.std(mean_zero, type));
		return std_one;
	};

	/**
		 * Correlation matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.corrcoef = function corrcoef (x, type) {
		var X = Matrix._toMatrix(x);
		return Statistics.cov(Statistics.normalize(X, type), type);
	};

	/**
		 * Sort.
		 * - The "order" can choose "ascend"(default) and "descend".
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {string} [order]
		 * @param {StatisticsSettings} [type]
		 * @returns {Matrix}
		 */
	Statistics.sort = function sort (x, order, type) {
		var X = Matrix._toMatrix(x);
		var dim   = !(type && type.dimension) ? "auto" : type.dimension;
		var order_type = !order ? "ascend" : order;
		var compare;
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
		var main = function(data) {
			data.sort(compare);
			return data;
		};
		return X.eachVector(main, dim);
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection for calculating probability using real numbers.
	 * @ignore
	 */
	var ProbabilityTool = function ProbabilityTool () {};

	ProbabilityTool.gammaln = function gammaln (x) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		var LOG_2PI = Math.log(2.0 * Math.PI);
		//ベルヌーイ数
		//http://fr.wikipedia.org/wiki/Nombre_de_Bernoulli
		var K2 = ( 1.0 / 6.0)				/ (2 * 1);
		var K4 = (-1.0 / 30.0)			/ (4 * 3);
		var K6 = ( 1.0 / 42.0)			/ (6 * 5);
		var K8 = (-1.0 / 30.0)			/ (8 * 7);
		var K10 = ( 5.0 / 66.0)			/ (10 * 9);
		var K12 = (-691.0 / 2730.0)		/ (12 * 11);
		var K14 = ( 7.0 / 6.0)			/ (14 * 13);
		var K16 = (-3617.0 / 510.0)		/ (16 * 15);
		var K18 = (43867.0 / 798.0)		/ (18 * 17);
		var K20 = (-174611.0 / 330.0)		/ (20 * 19);
		var K22 = (854513.0 / 138.0)		/ (22 * 21);
		var K24 = (-236364091.0 / 2730.0)	/ (24 * 23);
		var K26 = (8553103.0 / 6.0)		/ (26 * 25);
		var K28 = (-23749461029.0 / 870.0)/ (28 * 27);
		var K30 = (8615841276005.0 / 14322.0)/ (30 * 29);
		var K32 = (-7709321041217.0 / 510.0)/ (32 * 31);
		var LIST = [
			K32, K30, K28, K26, K24, K22, K20, K18,
			K16, K14, K12, K10, K8, K6, K4, K2
		];
		var v = 1;
		var lx = x;
		while(lx < LIST.length) {
			v *= lx;
			lx++;
		}
		var w = 1 / (lx * lx);
		var y = LIST[0];
		for(var i = 1; i < LIST.length; i++) {
			y *= w;
			y += LIST[i];
		}
		y /= lx;
		y += 0.5 * LOG_2PI;
		y += - Math.log(v) - lx + (lx - 0.5) * Math.log(lx);
		return(y);
	};

	/**
		 * Incomplete gamma function upper side.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} gammaln_a
		 * @returns {number}
		 */
	ProbabilityTool.q_gamma = function q_gamma (x, a, gammaln_a) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		var k;
		var result, w, temp, previous;
		// Laguerreの多項式
		var la = 1.0, lb = 1.0 + x - a;
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
	};

	/**
		 * Incomplete gamma function lower side.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} gammaln_a
		 * @returns {number}
		 */
	ProbabilityTool.p_gamma = function p_gamma (x, a, gammaln_a) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p227,技術評論社,1991
		var k;
		var result, term, previous;
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
	};

	/**
		 * Gamma function.
		 * @param {number} z
		 * @returns {number}
		 */
	ProbabilityTool.gamma = function gamma (z) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		if(z < 0) {
			return (Math.PI / (Math.sin(Math.PI * z) * Math.exp(ProbabilityTool.gammaln(1.0 - z))));
		}
		return Math.exp(ProbabilityTool.gammaln(z));
	};

	/**
		 * Incomplete gamma function.
		 * @param {number} x
		 * @param {number} a
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {number}
		 */
	ProbabilityTool.gammainc = function gammainc (x, a, tail) {
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
	};
		
	/**
		 * Probability density function (PDF) of the gamma distribution.
		 * @param {number} x
		 * @param {number} k - Shape parameter.
		 * @param {number} s - Scale parameter.
		 * @returns {number}
		 */
	ProbabilityTool.gampdf = function gampdf (x, k, s) {
		var y = 1.0 / (ProbabilityTool.gamma(k) * Math.pow(s, k));
		y *= Math.pow( x, k - 1);
		y *= Math.exp( - x / s );
		return y;
	};

	/**
		 * Cumulative distribution function (CDF) of gamma distribution.
		 * @param {number} x
		 * @param {number} k - Shape parameter.
		 * @param {number} s - Scale parameter.
		 * @returns {number}
		 */
	ProbabilityTool.gamcdf = function gamcdf (x, k, s) {
		return ProbabilityTool.gammainc(x / s, k);
	};
		
	/**
		 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
		 * @param {number} p
		 * @param {number} k - Shape parameter.
		 * @param {number} s - Scale parameter.
		 * @returns {number}
		 */
	ProbabilityTool.gaminv = function gaminv (p, k, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return 0.0;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		var eps = 1.0e-12;
		// 初期値を決める
		var y = k * s;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		var delta, y2;
		for(var i = 0; i < 100; i++) {
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
	};

	/**
		 * Beta function.
		 * @param {number} x
		 * @param {number} y
		 * @returns {number}
		 */
	ProbabilityTool.beta = function beta (x, y) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p30,技術評論社,1991
		return (Math.exp(ProbabilityTool.gammaln(x) + ProbabilityTool.gammaln(y) - ProbabilityTool.gammaln(x + y)));
	};
		
	/**
		 * Incomplete beta function lower side.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	ProbabilityTool.p_beta = function p_beta (x, a, b) {
		// 参考：奥村,"C言語による最新アルゴリズム事典",p231,技術評論社,1991
		var k;
		var result, term, previous;
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
	};

	/**
		 * Incomplete beta function upper side.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	ProbabilityTool.q_beta = function q_beta (x, a, b) {
		return (1.0 - ProbabilityTool.p_beta(x, a, b));
	};

	/**
		 * Incomplete beta function.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {number}
		 */
	ProbabilityTool.betainc = function betainc (x, a, b, tail) {
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
	};
		
	/**
		 * Return true if the value is integer.
		 * @param {number} x
		 * @returns {boolean}
		 */
	ProbabilityTool.isInteger = function isInteger (x) {
		return (x - Math.trunc(x) !== 0.0);
	};
		
	/**
		 * Probability density function (PDF) of beta distribution.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	ProbabilityTool.betapdf = function betapdf (x, a, b) {
		// powの計算結果が複素数になる場合は計算を行わない
		if(
			((x < 0) && (ProbabilityTool.isInteger(b - 1))) ||
			((1 - x < 0) && (ProbabilityTool.isInteger(b - 1)))
		) {
			return 0.0;
		}
		// 以下の式でも求められるが betapdf(0, 1, 1)で、Log(0)の計算が発生しNaNを返してしまう。実際は1を返すべき。
		//return(Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)) / ProbabilityTool.beta(a,  b));
		return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / ProbabilityTool.beta(a,  b));
	};

	/**
		 * Cumulative distribution function (CDF) of beta distribution.
		 * @param {number} x
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	ProbabilityTool.betacdf = function betacdf (x, a, b) {
		return ProbabilityTool.betainc(x, a, b);
	};
		
	/**
		 * Inverse function of cumulative distribution function (CDF) of beta distribution.
		 * @param {number} p
		 * @param {number} a
		 * @param {number} b
		 * @returns {number}
		 */
	ProbabilityTool.betainv = function betainv (p, a, b) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if((p == 0.0) && (a > 0.0) && (b > 0.0)) {
			return 0.0;
		}
		else if((p == 1.0) && (a > 0.0) && (b > 0.0)) {
			return 1.0;
		}
		var eps = 1.0e-14;
		// 初期値を決める
		var y;
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
		var delta, y2;
		for(var i = 0; i < 100; i++) {
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
	};

	/**
		 * Factorial function, x!.
		 * @param {number} n
		 * @returns {number}
		 */
	ProbabilityTool.factorial = function factorial (n) {
		var y = ProbabilityTool.gamma(n + 1.0);
		if(Math.trunc(n) === n) {
			return Math.round(y);
		}
		else {
			return y;
		}
	};

	/**
		 * Binomial coefficient, number of all combinations, nCk.
		 * @param {number} n
		 * @param {number} k
		 * @returns {number} nCk
		 */
	ProbabilityTool.nchoosek = function nchoosek (n, k) {
		return (Math.round(ProbabilityTool.factorial(n) / (ProbabilityTool.factorial(n - k) * ProbabilityTool.factorial(k))));
	};

	/**
		 * Error function.
		 * @param {number} x
		 * @returns {number}
		 */
	ProbabilityTool.erf = function erf (x) {
		return (ProbabilityTool.p_gamma(x * x, 0.5, Math.log(Math.PI) * 0.5) * (x >= 0 ? 1.0 : -1.0));
	};

	/**
		 * Complementary error function.
		 * @param {number} x
		 * @returns {number}
		 */
	ProbabilityTool.erfc = function erfc (x) {
		return 1.0 - ProbabilityTool.erf(x);
	};

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
		 * Probability density function (PDF) of normal distribution.
		 * @param {number} x
		 * @param {number} [u=0.0] - Average value.
		 * @param {number} [s=1.0] - Variance value.
		 * @returns {number}
		 */
	ProbabilityTool.normpdf = function normpdf (x, u, s) {
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		var y = 1.0 / Math.sqrt( 2.0 * Math.PI * s_ * s_ );
		y *= Math.exp( - (x - u_) * (x - u_) / (2.0 * s_ * s_));
		return y;
	};

	/**
		 * Cumulative distribution function (CDF) of normal distribution.
		 * @param {number} x
		 * @param {number} [u=0.0] - Average value.
		 * @param {number} [s=1.0] - Variance value.
		 * @returns {number}
		 */
	ProbabilityTool.normcdf = function normcdf (x, u, s) {
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		return (1.0 + ProbabilityTool.erf( (x - u_) / (s_ * Math.sqrt(2.0)) )) / 2.0;
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of normal distribution.
		 * @param {number} p - Probability.
		 * @param {number} [u=0.0] - Average value.
		 * @param {number} [s=1.0] - Variance value.
		 * @returns {number}
		 */
	ProbabilityTool.norminv = function norminv (p, u, s) {
		if((p < 0.0) || (p > 1.0)) {
			return Number.NaN;
		}
		else if(p == 0.0) {
			return Number.NEGATIVE_INFINITY;
		}
		else if(p == 1.0) {
			return Number.POSITIVE_INFINITY;
		}
		var u_ = typeof u === "number" ? u : 0.0;
		var s_ = typeof s === "number" ? s : 1.0;
		var eps = 1.0e-12;
		// 初期値を決める
		var y = u_;
		// 単調増加関数なのでニュートン・ラフソン法で解く
		// x_n+1 = x_n - f(x) / f'(x)
		// ここで f(x) は累積分布関数、f'(x) は確率密度関数
		// a = 累積分関数 → f(x)  = 累積分関数 - a と置く。
		// aの微分は0なので無関係
		var delta, y2;
		for(var i = 0; i < 200; i++) {
			y2 = y - ((ProbabilityTool.normcdf(y, u_, s_) - p) / ProbabilityTool.normpdf(y, u_, s_));
			delta = y2 - y;
			if(Math.abs(delta) <= eps) {
				break;
			}
			y = y2;
		}
		return y;
	};

	/**
		 * Probability density function (PDF) of Student's t-distribution.
		 * @param {number} t - T-value.
		 * @param {number} v - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.tpdf = function tpdf (t, v) {
		var y = 1.0 / (Math.sqrt(v) * ProbabilityTool.beta(0.5, v * 0.5));
		y *= Math.pow( 1 + t * t / v, - (v + 1) * 0.5);
		return y;
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {number} t - T-value.
		 * @param {number} v - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.tcdf = function tcdf (t, v) {
		var y = (t * t) / (v + t * t) ;
		var p = ProbabilityTool.betainc( y, 0.5, v * 0.5 ) * (t < 0 ? -1 : 1);
		return 0.5 * (1 + p);
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {number} p - Probability.
		 * @param {number} v - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.tinv = function tinv (p, v) {
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
			var y = ProbabilityTool.betainv(2.0 * p, 0.5 * v, 0.5);
			return - Math.sqrt(v / y - v);
		}
		else {
			var y$1 = ProbabilityTool.betainv(2.0 * (1.0 - p), 0.5 * v, 0.5);
			return Math.sqrt(v / y$1 - v);
		}
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
		 * @param {number} t - T-value.
		 * @param {number} v - The degrees of freedom. (DF)
		 * @param {number} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
		 * @returns {number}
		 */
	ProbabilityTool.tdist = function tdist (t, v, tails) {
		return (1.0 - ProbabilityTool.tcdf(t, v)) * tails;
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
		 * @param {number} p - Probability.
		 * @param {number} v - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.tinv2 = function tinv2 (p, v) {
		return - ProbabilityTool.tinv( p * 0.5, v);
	};

	/**
		 * Probability density function (PDF) of chi-square distribution.
		 * @param {number} x 
		 * @param {number} k - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.chi2pdf = function chi2pdf (x, k) {
		if(x < 0.0) {
			return 0;
		}
		else if(x === 0.0) {
			return 0.5;
		}
		var y = Math.pow(x, k / 2.0 - 1.0) * Math.exp( - x / 2.0 );
		y /= Math.pow(2, k / 2.0) * ProbabilityTool.gamma( k / 2.0);
		return y;
	};

	/**
		 * Cumulative distribution function (CDF) of chi-square distribution.
		 * @param {number} x 
		 * @param {number} k - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.chi2cdf = function chi2cdf (x, k) {
		return ProbabilityTool.gammainc(x / 2.0, k / 2.0);
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
		 * @param {number} p - Probability.
		 * @param {number} k - The degrees of freedom. (DF)
		 * @returns {number}
		 */
	ProbabilityTool.chi2inv = function chi2inv (p, k) {
		return ProbabilityTool.gaminv(p, k / 2.0, 2);
	};

	/**
		 * Probability density function (PDF) of F-distribution.
		 * @param {number} x
		 * @param {number} d1 - The degree of freedom of the molecules.
		 * @param {number} d2 - The degree of freedom of the denominator
		 * @returns {number}
		 */
	ProbabilityTool.fpdf = function fpdf (x, d1, d2) {
		if((d1 < 0) || (d2 < 0)) {
			return Number.NaN;
		}
		else if(x <= 0) {
			return 0.0;
		}
		var y = 1.0;
		y *= Math.pow( (d1 * x) / (d1 * x + d2) , d1 / 2.0);
		y *= Math.pow( 1.0 - ((d1 * x) / (d1 * x + d2)), d2 / 2.0);
		y /= x * ProbabilityTool.beta(d1 / 2.0, d2 / 2.0);
		return y;
	};

	/**
		 * Cumulative distribution function (CDF) of F-distribution.
		 * @param {number} x
		 * @param {number} d1 - The degree of freedom of the molecules.
		 * @param {number} d2 - The degree of freedom of the denominator
		 * @returns {number}
		 */
	ProbabilityTool.fcdf = function fcdf (x, d1, d2) {
		return ProbabilityTool.betacdf( d1 * x / (d1 * x + d2), d1 / 2.0, d2 / 2.0 );
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of F-distribution.
		 * @param {number} p - Probability.
		 * @param {number} d1 - The degree of freedom of the molecules.
		 * @param {number} d2 - The degree of freedom of the denominator
		 * @returns {number}
		 */
	ProbabilityTool.finv = function finv (p, d1, d2) {
		return (1.0 / ProbabilityTool.betainv( 1.0 - p, d2 / 2.0, d1 / 2.0 ) - 1.0) * d2 / d1;
	};

	/**
	 * typeof this === string
	 * @param text 
	 * @ignore
	 */
	var isStr = function(text) {
		return (text && (typeof text === "string" || text instanceof String));
	};

	/**
	 * Collection for calculating probability used from the Complex class.
	 * @ignore
	 */
	var ProbabilityComplex = function ProbabilityComplex () {};

	ProbabilityComplex.gammaln = function gammaln (x) {
		return new Complex(ProbabilityTool.gammaln(Complex._toDouble(x)));
	};
		
	/**
		 * Gamma function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} z
		 * @returns {Complex}
		 */
	ProbabilityComplex.gamma = function gamma (z) {
		return new Complex(ProbabilityTool.gamma(Complex._toDouble(z)));
	};
		
	/**
		 * Incomplete gamma function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Complex}
		 */
	ProbabilityComplex.gammainc = function gammainc (x, a, tail) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var tail_ = isStr(tail) ? tail : "lower";
		return new Complex(ProbabilityTool.gammainc(X, a_, tail_));
	};

	/**
		 * Probability density function (PDF) of the gamma distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - Shape parameter.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - Scale parameter.
		 * @returns {Complex}
		 */
	ProbabilityComplex.gampdf = function gampdf (x, k, s) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gampdf(X, k_, s_));
	};

	/**
		 * Cumulative distribution function (CDF) of gamma distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - Shape parameter.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - Scale parameter.
		 * @returns {Complex}
		 */
	ProbabilityComplex.gamcdf = function gamcdf (x, k, s) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gamcdf(X, k_, s_));
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - Shape parameter.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} s - Scale parameter.
		 * @returns {Complex}
		 */
	ProbabilityComplex.gaminv = function gaminv (p, k, s) {
		var p_ = Complex._toDouble(p);
		var k_ = Complex._toDouble(k);
		var s_ = Complex._toDouble(s);
		return new Complex(ProbabilityTool.gaminv(p_, k_, s_));
	};

	/**
		 * Beta function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} y
		 * @returns {Complex}
		 */
	ProbabilityComplex.beta = function beta (x, y) {
		var X = Complex._toDouble(x);
		var y_ = Complex._toDouble(y);
		return new Complex(ProbabilityTool.beta(X, y_));
	};

	/**
		 * Incomplete beta function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Complex}
		 */
	ProbabilityComplex.betainc = function betainc (x, a, b, tail) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		var tail_ = isStr(tail) ? tail : "lower";
		return new Complex(ProbabilityTool.betainc(X, a_, b_, tail_));
	};

	/**
		 * Probability density function (PDF) of beta distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	ProbabilityComplex.betapdf = function betapdf (x, a, b) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betapdf(X, a_, b_));
	};

	/**
		 * Cumulative distribution function (CDF) of beta distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	ProbabilityComplex.betacdf = function betacdf (x, a, b) {
		var X = Complex._toDouble(x);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betacdf(X, a_, b_));
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of beta distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} a
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} b
		 * @returns {Complex}
		 */
	ProbabilityComplex.betainv = function betainv (p, a, b) {
		var p_ = Complex._toDouble(p);
		var a_ = Complex._toDouble(a);
		var b_ = Complex._toDouble(b);
		return new Complex(ProbabilityTool.betainv(p_, a_, b_));
	};

	/**
		 * Factorial function, x!.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} n
		 * @returns {Complex}
		 */
	ProbabilityComplex.factorial = function factorial (n) {
		return new Complex(ProbabilityTool.factorial(Complex._toDouble(n)));
	};

	/**
		 * Binomial coefficient, number of all combinations, nCk.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} n
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k
		 * @returns {Complex}
		 */
	ProbabilityComplex.nchoosek = function nchoosek (n, k) {
		var n_ = Complex._toDouble(n);
		var k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.nchoosek(n_, k_));
	};
		
	/**
		 * Error function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @returns {Complex}
		 */
	ProbabilityComplex.erf = function erf (x) {
		var X = Complex._toDouble(x);
		return new Complex(ProbabilityTool.erf(X));
	};

	/**
		 * Complementary error function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @returns {Complex}
		 */
	ProbabilityComplex.erfc = function erfc (x) {
		var X = Complex._toDouble(x);
		return new Complex(ProbabilityTool.erfc(X));
	};

	/**
		 * Probability density function (PDF) of normal distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - Average value.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - Variance value.
		 * @returns {Complex}
		 */
	ProbabilityComplex.normpdf = function normpdf (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.normpdf(X, u_, s_));
	};

	/**
		 * Cumulative distribution function (CDF) of normal distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - Average value.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - Variance value.
		 * @returns {Complex}
		 */
	ProbabilityComplex.normcdf = function normcdf (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.normcdf(X, u_, s_));
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of normal distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [u=0.0] - Average value.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [s=1.0] - Variance value.
		 * @returns {Complex}
		 */
	ProbabilityComplex.norminv = function norminv (x, u, s) {
		var X = Complex._toDouble(x);
		var u_ = u !== undefined ? Complex._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Complex._toDouble(s) : 1.0;
		return new Complex(ProbabilityTool.norminv(X, u_, s_));
	};
		
	/**
		 * Probability density function (PDF) of Student's t-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.tpdf = function tpdf (x, v) {
		var X = Complex._toDouble(x);
		var v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tpdf(X, v_));
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} t
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.tcdf = function tcdf (t, v) {
		var t_ = Complex._toDouble(t);
		var v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tcdf(t_, v_));
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.tinv = function tinv (p, v) {
		var p_ = Complex._toDouble(p);
		var v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tinv(p_, v_));
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} t
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - The degrees of freedom. (DF)
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
		 * @returns {Complex}
		 */
	ProbabilityComplex.tdist = function tdist (t, v, tails) {
		var t_ = Complex._toDouble(t);
		var v_ = Complex._toDouble(v);
		var tails_ = Complex._toInteger(tails);
		return new Complex(ProbabilityTool.tdist(t_, v_, tails_));
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} v - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.tinv2 = function tinv2 (p, v) {
		var p_ = Complex._toDouble(p);
		var v_ = Complex._toDouble(v);
		return new Complex(ProbabilityTool.tinv2(p_, v_));
	};

	/**
		 * Probability density function (PDF) of chi-square distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.chi2pdf = function chi2pdf (x, k) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2pdf(X, k_));
	};

	/**
		 * Cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.chi2cdf = function chi2cdf (x, k) {
		var X = Complex._toDouble(x);
		var k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2cdf(X, k_));
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} k - The degrees of freedom. (DF)
		 * @returns {Complex}
		 */
	ProbabilityComplex.chi2inv = function chi2inv (p, k) {
		var p_ = Complex._toDouble(p);
		var k_ = Complex._toDouble(k);
		return new Complex(ProbabilityTool.chi2inv(p_, k_));
	};

	/**
		 * Probability density function (PDF) of F-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - The degree of freedom of the molecules.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - The degree of freedom of the denominator
		 * @returns {Complex}
		 */
	ProbabilityComplex.fpdf = function fpdf (x, d1, d2) {
		var X = Complex._toDouble(x);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.fpdf(X, d1_, d2_));
	};

	/**
		 * Cumulative distribution function (CDF) of F-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} x
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - The degree of freedom of the molecules.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - The degree of freedom of the denominator
		 * @returns {Complex}
		 */
	ProbabilityComplex.fcdf = function fcdf (x, d1, d2) {
		var X = Complex._toDouble(x);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.fcdf(X, d1_, d2_));
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of F-distribution.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} p
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d1 - The degree of freedom of the molecules.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} d2 - The degree of freedom of the denominator
		 * @returns {Complex}
		 */
	ProbabilityComplex.finv = function finv (p, d1, d2) {
		var p_ = Complex._toDouble(p);
		var d1_ = Complex._toDouble(d1);
		var d2_ = Complex._toDouble(d2);
		return new Complex(ProbabilityTool.finv(p_, d1_, d2_));
	};

	/**
	 * Calculating probability class for Matrix class.
	 */
	var Probability = function Probability () {};

	Probability.gammaln = function gammaln (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gammaln(num);
		});
	};

	/**
		 * Gamma function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Probability.gamma = function gamma (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gamma(num);
		});
	};

	/**
		 * Incomplete gamma function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Matrix}
		 */
	Probability.gammainc = function gammainc (x, a, tail) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gammainc(num, a_, tail_);
		});
	};

	/**
		 * Probability density function (PDF) of the gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Probability.gampdf = function gampdf (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gampdf(num, k_, s_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Probability.gamcdf = function gamcdf (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gamcdf(num, k_, s_);
		});
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Probability.gaminv = function gaminv (x, k, s) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		var s_ = Matrix._toDouble(s);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.gaminv(num, k_, s_);
		});
	};

	/**
		 * Beta function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
		 * @returns {Matrix}
		 */
	Probability.beta = function beta (x, y) {
		var X = Matrix._toMatrix(x);
		var y_ = Matrix._toDouble(y);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.beta(num, y_);
		});
	};
		
	/**
		 * Incomplete beta function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Matrix}
		 */
	Probability.betainc = function betainc (x, a, b, tail) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		var tail_ = isStr(tail) ? tail : "lower";
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betainc(num, a_, b_, tail_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Probability.betacdf = function betacdf (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betacdf(num, a_, b_);
		});
	};

	/**
		 * Probability density function (PDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Probability.betapdf = function betapdf (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betapdf(num, a_, b_);
		});
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Probability.betainv = function betainv (x, a, b) {
		var X = Matrix._toMatrix(x);
		var a_ = Matrix._toDouble(a);
		var b_ = Matrix._toDouble(b);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.betainv(num, a_, b_);
		});
	};

	/**
		 * Factorial function, x!.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Probability.factorial = function factorial (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.factorial(num);
		});
	};
		
	/**
		 * Binomial coefficient, number of all combinations, nCk.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
		 * @returns {Matrix}
		 */
	Probability.nchoosek = function nchoosek (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.nchoosek(num, k_);
		});
	};
		
	/**
		 * Error function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Probability.erf = function erf (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erf(num);
		});
	};

	/**
		 * Complementary error function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Probability.erfc = function erfc (x) {
		var X = Matrix._toMatrix(x);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.erfc(num);
		});
	};
		
	/**
		 * Probability density function (PDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Probability.normpdf = function normpdf (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.normpdf(num, u_, s_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Probability.normcdf = function normcdf (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.normcdf(num, u_, s_);
		});
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Probability.norminv = function norminv (x, u, s) {
		var X = Matrix._toMatrix(x);
		var u_ = u !== undefined ? Matrix._toDouble(u) : 0.0;
		var s_ = s !== undefined ? Matrix._toDouble(s) : 1.0;
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.norminv(num, u_, s_);
		});
	};

	/**
		 * Probability density function (PDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.tpdf = function tpdf (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tpdf(num, v_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.tcdf = function tcdf (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tcdf(num, v_);
		});
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.tinv = function tinv (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tinv(num, v_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
		 * @returns {Matrix}
		 */
	Probability.tdist = function tdist (x, v, tails) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		var tails_ = Matrix._toDouble(tails);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tdist(num, v_, tails_);
		});
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.tinv2 = function tinv2 (x, v) {
		var X = Matrix._toMatrix(x);
		var v_ = Matrix._toDouble(v);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.tinv2(num, v_);
		});
	};

	/**
		 * Probability density function (PDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.chi2pdf = function chi2pdf (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2pdf(num, k_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.chi2cdf = function chi2cdf (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2cdf(num, k_);
		});
	};
		
	/**
		 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Probability.chi2inv = function chi2inv (x, k) {
		var X = Matrix._toMatrix(x);
		var k_ = Matrix._toDouble(k);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.chi2inv(num, k_);
		});
	};

	/**
		 * Probability density function (PDF) of F-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Probability.fpdf = function fpdf (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.fpdf(num, d1_, d2_);
		});
	};

	/**
		 * Cumulative distribution function (CDF) of F-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Probability.fcdf = function fcdf (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.fcdf(num, d1_, d2_);
		});
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of F-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Probability.finv = function finv (x, d1, d2) {
		var X = Matrix._toMatrix(x);
		var d1_ = Matrix._toDouble(d1);
		var d2_ = Matrix._toDouble(d2);
		return X.cloneMatrixDoEachCalculation(function(num) {
			return ProbabilityComplex.finv(num, d1_, d2_);
		});
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection of calculation settings for matrix.
	 * - Available options vary depending on the method.
	 * @typedef {Object} SignalSettings
	 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
	 */

	/**
	 * Fast Fourier Transform (FFT) Class.
	 * @ignore
	 */
	var FFT = function FFT(size) {
			
		/**
			 * Signal length.
			 */
		this.size = size;

		/**
			 * Inverse of signal length.
			 */
		this.inv_size = 1.0 / this.size;

		/**
			 * Number of bits when the signal length is expressed in binary number.
			 */
		this.bit_size = Math.round(Math.log(this.size)/Math.log(2));

		/**
			 * FFT algorithm available.
			 */
		this.is_fast = (1 << this.bit_size) === this.size;

		/**
			 * Bit reverse table for butterfly operation.
			 */
		this.bitrv = null;

		/**
			 * Real part table used for multiplication of complex numbers.
			 */
		this.fft_re = new Array(this.size);
			
		/**
			 * Imaginary table used for multiplication of complex numbers.
			 */
		this.fft_im = new Array(this.size);
		{
			var delta = - 2.0 * Math.PI / this.size;
			var err = 0.0;
			for(var n = 0, x = 0; n < this.size; n++) {
				this.fft_re[n] = Math.cos(x);
				this.fft_im[n] = Math.sin(x);
				// カハンの加算アルゴリズム
				var y = delta + err;
				var t = x + y;
				err = t - x - y;
				x = t;
			}
		}
		if(this.is_fast) {
			this.bitrv = FFT.create_bit_reverse_table(this.bit_size);
		}
	};

	/**
		 * Frees the memory reserved.
		 */
	FFT.bit_reverse_32 = function bit_reverse_32 (x) {
		var y = x & 0xffffffff;
		// 1,2,4,8,16ビット単位で交換
		y = ((y & 0x55555555) << 1) | ((y >> 1) & 0x55555555);
		y = ((y & 0x33333333) << 2) | ((y >> 2) & 0x33333333);
		y = ((y & 0x0f0f0f0f) << 4) | ((y >> 4) & 0x0f0f0f0f);
		y = ((y & 0x00ff00ff) << 8) | ((y >> 8) & 0x00ff00ff);
		y = ((y & 0x0000ffff) << 16) | ((y >> 16) & 0x0000ffff);
		return y;
	};
		
	/**
		 * Create a bit reversal lookup table.
		 * @param {number} bit - ビット数
		 * @returns {Array<number>} ビット反転した値の配列
		 */
	FFT.create_bit_reverse_table = function create_bit_reverse_table (bit) {
		var size = 1 << bit;
		var bitrv = [];
		for(var i = 0; i < size; i++) {
			bitrv[i] = FFT.bit_reverse_32(i) >>> (32 - bit);
		}
		return bitrv;
	};

	FFT.prototype.delete = function delete$1 () {
		delete this.size;
		delete this.inv_size;
		delete this.bit_size;
		delete this.is_fast;
		delete this.bitrv;
		delete this.fft_re;
		delete this.fft_im;
	};
		
	/**
		 * Discrete Fourier transform (DFT).
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @param {Array<number>} imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	FFT.prototype.fft = function fft (real, imag) {
		var f_re = new Array(this.size);
		var f_im = new Array(this.size);
		if(this.is_fast) {
			for(var i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				var center = 1;
				var blocklength = this.size / 2;
				var pointlength = 2;
				for(var delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(var blocks = 0; blocks < blocklength; blocks++) {
						var i$1 = blocks * pointlength;
						for(var point = 0, n = 0; point < center; point++, i$1++, n += delta) {
							var re = f_re[i$1 + center] * this.fft_re[n] - f_im[i$1 + center] * this.fft_im[n];
							var im = f_im[i$1 + center] * this.fft_re[n] + f_re[i$1 + center] * this.fft_im[n];
							f_re[i$1 + center] = f_re[i$1] - re;
							f_im[i$1 + center] = f_im[i$1] - im;
							f_re[i$1] += re;
							f_im[i$1] += im;
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
				for(var t = 0; t < this.size; t++) {
					f_re[t] = 0.0;
					f_im[t] = 0.0;
					for(var x = 0, n$1 = 0; x < this.size; x++, n$1 = (x * t) % this.size) {
						f_re[t] += real[x] * this.fft_re[n$1];
						f_im[t] += real[x] * this.fft_im[n$1];
					}
				}
			}
			else {
				// 実数部分と複素数部分のフーリエ変換
				for(var t$1 = 0; t$1 < this.size; t$1++) {
					f_re[t$1] = 0.0;
					f_im[t$1] = 0.0;
					for(var x$1 = 0, n$2 = 0; x$1 < this.size; x$1++, n$2 = (x$1 * t$1) % this.size) {
						f_re[t$1] += real[x$1] * this.fft_re[n$2] - imag[x$1] * this.fft_im[n$2];
						f_im[t$1] += real[x$1] * this.fft_im[n$2] + imag[x$1] * this.fft_re[n$2];
					}
				}
			}
		}
		return {
			real : f_re,
			imag : f_im
		};
	};

	/**
		 * Inverse discrete Fourier transform (IDFT),
		 * @param {Array} real - Array of real parts of vector.
		 * @param {Array} imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	FFT.prototype.ifft = function ifft (real, imag) {
		var f_re = new Array(this.size);
		var f_im = new Array(this.size);
		if(this.is_fast) {
			for(var i = 0; i < this.size; i++) {
				f_re[i] = real[this.bitrv[i]];
				f_im[i] = imag[this.bitrv[i]];
			}
			{
				// Inverse Fast Fourier Transform 時間間引き(前処理にビットリバース)
				// 段々ブロックが大きくなっていくタイプ。
				var center = 1;
				var blocklength = this.size / 2;
				var pointlength = 2;
				var re, im;
				for(var delta = 1 << (this.bit_size - 1); delta > 0; delta >>= 1) {
					for(var blocks = 0; blocks < blocklength; blocks++) {
						var i$1 = blocks * pointlength;
						for(var point = 0, n = 0; point < center; point++, i$1++, n += delta) {
							re = f_re[i$1 + center] * this.fft_re[n] + f_im[i$1 + center] * this.fft_im[n];
							im = f_im[i$1 + center] * this.fft_re[n] - f_re[i$1 + center] * this.fft_im[n];
							f_re[i$1 + center] = f_re[i$1] - re;
							f_im[i$1 + center] = f_im[i$1] - im;
							f_re[i$1] += re;
							f_im[i$1] += im;
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
				for(var x = 0; x < this.size; x++) {
					f_re[x] = 0.0;
					f_im[x] = 0.0;
					for(var t = 0, n$1 = 0; t < this.size; t++, n$1 = (x * t) % this.size) {
						f_re[x] +=   real[t] * this.fft_re[n$1];
						f_im[x] += - real[t] * this.fft_im[n$1];
					}
				}
			}
			else {
				// 実数部分と複素数部分の逆フーリエ変換
				for(var x$1 = 0; x$1 < this.size; x$1++) {
					f_re[x$1] = 0.0;
					f_im[x$1] = 0.0;
					for(var t$1 = 0, n$2 = 0; t$1 < this.size; t$1++, n$2 = (x$1 * t$1) % this.size) {
						f_re[x$1] +=   real[t$1] * this.fft_re[n$2] + imag[t$1] * this.fft_im[n$2];
						f_im[x$1] += - real[t$1] * this.fft_im[n$2] + imag[t$1] * this.fft_re[n$2];
					}
				}
			}
		}
		for(var i$2 = 0; i$2 < this.size; i$2++) {
			f_re[i$2] *= this.inv_size;
			f_im[i$2] *= this.inv_size;
		}
		return {
			real : f_re,
			imag : f_im
		};
	};

	/**
	 * Simple cache class.
	 * Cache tables used in FFT.
	 * @ignore
	 */
	var FFTCache = function FFTCache(object, cache_size) {

		/**
			 * Class for cache.
			 */
		this.object = object;

		/**
			 * Cache table.
			 * @type {Array<*>}
			 */
		this.table = [];

		/**
			 * Maximum number of caches.
			 */
		this.table_max = cache_size;

	};

	/**
		 * Create a class initialized with the specified data length.
		 * Use from cache if it exists in cache.
		 * @param {number} size - Data length.
		 * @returns {*}
		 */
	FFTCache.prototype.get = function get (size) {
		for(var index = 0; index < this.table.length; index++) {
			if(this.table[index].size === size) {
				// 先頭にもってくる
				var object = this.table.splice(index, 1)[0];
				this.table.unshift(object);
				return object;
			}
		}
		var new_object = new this.object(size);
		if(this.table.length === this.table_max) {
			// 後ろのデータを消去
			var delete_object = this.table.pop();
			delete_object.delete();
		}
		// 前方に追加
		this.table.unshift(new_object);
		return new_object;
	};

	/**
	 * Cache for FFT.
	 * @type {FFTCache}
	 * @ignore
	 */
	var fft_cache = new FFTCache(FFT, 4);

	/**
	 * Discrete cosine transform (DCT) class.
	 * @ignore
	 */
	var DCT = function DCT(size) {

		/**
			 * Signal length.
			 */
		this.size = size;

		/**
			 * Twice the signal length.
			 * In the DCT conversion, an actual signal is zero-filled with a doubled signal length, and an FFT is performed on it.
			 */
		this.dct_size = size * 2;

		/**
			 * Calculation table used for DCT conversion.
			 */
		this.dct_re = new Array(this.size);

		/**
			 * Calculation table used for DCT conversion.
			 */
		this.dct_im = new Array(this.size);
		{
			var x_0 = 1.0 / Math.sqrt(this.size);
			var x_n = x_0 * Math.sqrt(2);
			for(var i = 0; i < this.size; i++) {
				var x = - Math.PI * i / this.dct_size;
				this.dct_re[i] = Math.cos(x) * (i === 0 ? x_0 : x_n);
				this.dct_im[i] = Math.sin(x) * (i === 0 ? x_0 : x_n);
			}
		}
	};
		
	/**
		 * Frees the memory reserved.
		 */
	DCT.prototype.delete = function delete$2 () {
		delete this.size;
		delete this.dct_size;
		delete this.dct_re;
		delete this.dct_im;
	};

	/**
		 * Discrete cosine transform (DCT-II, DCT).
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @returns {Array<number>}
		 */
	DCT.prototype.dct = function dct (real) {
		var re = new Array(this.dct_size);
		var im = new Array(this.dct_size);
		for(var i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? real[i] : 0.0;
			im[i] = 0.0;
		}
		var fft = fft_cache.get(this.dct_size).fft(re, im);
		for(var i$1 = 0; i$1 < this.size; i$1++) {
			re[i$1] = fft.real[i$1] * this.dct_re[i$1] - fft.imag[i$1] * this.dct_im[i$1];
		}
		re.splice(this.size);
		return re;
	};

	/**
		 * Inverse discrete cosine transform (DCT-III, IDCT),
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @returns {Array<number>}
		 */
	DCT.prototype.idct = function idct (real) {
		var re = new Array(this.dct_size);
		var im = new Array(this.dct_size);
		var denormlize = this.size * 2.0;
		for(var i = 0; i < this.dct_size; i++) {
			re[i] = i < this.size ? (denormlize * real[i] *    this.dct_re[i])  : 0.0;
			im[i] = i < this.size ? (denormlize * real[i] * (- this.dct_im[i])) : 0.0;
		}
		var ifft = fft_cache.get(this.dct_size).ifft(re, im);
		ifft.real.splice(this.size);
		return ifft.real;
	};

	/**
	 * Cache for discrete cosine transform.
	 * @ignore
	 */
	var dct_cache = new FFTCache(DCT, 4);

	/**
	 * Collection of functions used inside Signal class.
	 * @ignore
	 */
	var SignalTool = function SignalTool () {};

	SignalTool.isContainsZero = function isContainsZero (x) {
		for(var i = 0; i < x.length; i++) {
			if(x[i] !== 0) {
				return true;
			}
		}
		return false;
	};

	/**
		 * Discrete Fourier transform (DFT).
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @param {Array<number>} imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.fft = function fft (real, imag) {
		var obj = fft_cache.get(real.length);
		return obj.fft(real, imag);
	};

	/**
		 * Inverse discrete Fourier transform (IDFT),
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @param {Array<number>} imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.ifft = function ifft (real, imag) {
		var obj = fft_cache.get(real.length);
		return obj.ifft(real, imag);
	};

	/**
		 * Discrete cosine transform (DCT-II, DCT).
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @returns {Array<number>}
		 */
	SignalTool.dct = function dct (real) {
		var obj = dct_cache.get(real.length);
		return obj.dct(real);
	};

	/**
		 * Inverse discrete cosine transform (DCT-III, IDCT),
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @returns {Array<number>}
		 */
	SignalTool.idct = function idct (real) {
		var obj = dct_cache.get(real.length);
		return obj.idct(real);
	};

	/**
		 * Power spectral density.
		 * @param {Array<number>} real - Array of real parts of vector.
		 * @param {Array<number>} imag - Array of imaginary parts of vector.
		 * @returns {Array<number>}
		 */
	SignalTool.powerfft = function powerfft (real, imag) {
		var size = real.length;
		var X = SignalTool.fft(real, imag);
		var power = new Array(size);
		for(var i = 0; i < size; i++) {
			power[i] = X.real[i] * X.real[i] + X.imag[i] * X.imag[i];
		}
		return power;
	};

	/**
		 * Convolution integral, Polynomial multiplication.
		 * @param {Array} x1_real - Array of real parts of vector.
		 * @param {Array} x1_imag - Array of imaginary parts of vector.
		 * @param {Array} x2_real - Array of real parts of vector.
		 * @param {Array} x2_imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.conv = function conv (x1_real, x1_imag, x2_real, x2_imag) {
		var is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(var i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		var size = x1_real.length;
		var N2 = size * 2;
		var bit_size = Math.round(Math.log(size)/Math.log(2));
		var is_fast = (1 << bit_size) === size;
		if(is_fast) {
			// FFTを用いた手法へ切り替え
			// 周波数空間上では掛け算になる
			if(is_self) {
				var size$1 = x1_real.length;
				var real = new Array(N2);
				var imag = new Array(N2);
				for(var i$1 = 0; i$1 < N2; i$1++) {
					real[i$1] = i$1 < size$1 ? x1_real[i$1] : 0.0;
					imag[i$1] = i$1 < size$1 ? x1_imag[i$1] : 0.0;
				}
				var X = SignalTool.fft(real, imag);
				for(var i$2 = 0; i$2 < N2; i$2++) {
					real[i$2] = X.real[i$2] * X.real[i$2] - X.imag[i$2] * X.imag[i$2];
					imag[i$2] = X.real[i$2] * X.imag[i$2] + X.imag[i$2] * X.real[i$2];
				}
				var x = SignalTool.ifft(real, imag);
				x.real.splice(N2 - 1);
				x.imag.splice(N2 - 1);
				return x;
			}
			else if(x1_real.length === x2_real.length) {
				var size$2 = x1_real.length;
				var real1 = new Array(N2);
				var imag1 = new Array(N2);
				var real2 = new Array(N2);
				var imag2 = new Array(N2);
				for(var i$3 = 0; i$3 < N2; i$3++) {
					real1[i$3] = i$3 < size$2 ? x1_real[i$3] : 0.0;
					imag1[i$3] = i$3 < size$2 ? x1_imag[i$3] : 0.0;
					real2[i$3] = i$3 < size$2 ? x2_real[i$3] : 0.0;
					imag2[i$3] = i$3 < size$2 ? x2_imag[i$3] : 0.0;
				}
				var F = SignalTool.fft(real1, imag1);
				var G = SignalTool.fft(real2, imag2);
				var real$1 = new Array(N2);
				var imag$1 = new Array(N2);
				for(var i$4 = 0; i$4 < N2; i$4++) {
					real$1[i$4] = F.real[i$4] * G.real[i$4] - F.imag[i$4] * G.imag[i$4];
					imag$1[i$4] = F.real[i$4] * G.imag[i$4] + F.imag[i$4] * G.real[i$4];
				}
				var fg = SignalTool.ifft(real$1, imag$1);
				fg.real.splice(N2 - 1);
				fg.imag.splice(N2 - 1);
				return fg;
			}
		}
		var is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		{
			// まじめに計算する
			var real$2 = new Array(x1_real.length + x2_real.length - 1);
			var imag$2 = new Array(x1_real.length + x2_real.length - 1);
			for(var i$5 = 0; i$5 < real$2.length; i$5++) {
				real$2[i$5] = 0;
				imag$2[i$5] = 0;
			}
			if(is_real_number) {
				// 実数部分のみの畳み込み積分
				// スライドさせていく
				// AAAA
				//  BBBB
				//   CCCC
				for(var y = 0; y < x2_real.length; y++) {
					for(var x$1 = 0; x$1 < x1_real.length; x$1++) {
						real$2[y + x$1] += x1_real[x$1] * x2_real[y];
					}
				}
			}
			else {
				// 実数部分と複素数部分の畳み込み積分
				for(var y$1 = 0; y$1 < x2_real.length; y$1++) {
					for(var x$2 = 0; x$2 < x1_real.length; x$2++) {
						real$2[y$1 + x$2] += x1_real[x$2] * x2_real[y$1] - x1_imag[x$2] * x2_imag[y$1];
						imag$2[y$1 + x$2] += x1_real[x$2] * x2_imag[y$1] + x1_imag[x$2] * x2_real[y$1];
					}
				}
			}
			return {
				real : real$2,
				imag : imag$2
			};
		}
	};

	/**
		 * ACF(Autocorrelation function), Cros-correlation function.
		 * @param {Array} x1_real - Array of real parts of vector.
		 * @param {Array} x1_imag - Array of imaginary parts of vector.
		 * @param {Array} x2_real - Array of real parts of vector.
		 * @param {Array} x2_imag - Array of imaginary parts of vector.
		 * @returns {Object<string, Array<number>>}
		 */
	SignalTool.xcorr = function xcorr (x1_real, x1_imag, x2_real, x2_imag) {
		var is_self = false;
		if(x1_real.length === x2_real.length) {
			is_self = true;
			for(var i = 0; i < x1_real.length;i++) {
				if((x1_real[i] !== x2_real[i]) || (x1_imag[i] !== x2_imag[i])) {
					is_self = false;
					break;
				}
			}
		}
		if(x1_real.length === x2_real.length) {
			var size = x1_real.length;
			var N2 = size * 2;
			var bit_size = Math.round(Math.log(size)/Math.log(2));
			var is_fast = (1 << bit_size) === size;
			if(is_fast) {
				var fg = null;
				if(is_self) {
					var real = new Array(N2);
					var imag = new Array(N2);
					for(var i$1 = 0; i$1 < N2; i$1++) {
						real[i$1] = i$1 < size ? x1_real[i$1] : 0.0;
						imag[i$1] = i$1 < size ? x1_imag[i$1] : 0.0;
					}
					// パワースペクトル密度は、自己相関のフーリエ変換のため、
					// パワースペクトル密度の逆変換で求められる。
					var power = SignalTool.powerfft(real, imag);
					fg = SignalTool.ifft(power, imag);
					// シフト
					real.pop();
					imag.pop();
					for(var i$2 = 0, j = size + 1 ; i$2 < real.length; i$2++, j++) {
						if(N2 <= j) {
							j = 0;
						}
						real[i$2] = fg.real[j];
						imag[i$2] = fg.imag[j];
					}
					return {
						real : real,
						imag : imag
					};
				}
				else {
					var f_real = new Array(N2);
					var f_imag = new Array(N2);
					var g_real = new Array(N2);
					var g_imag = new Array(N2);
					// gの順序を反転かつ共役複素数にする
					for(var i$3 = 0; i$3 < N2; i$3++) {
						f_real[i$3] = i$3 < size ?   x1_real[i$3] : 0.0;
						f_imag[i$3] = i$3 < size ?   x1_imag[i$3] : 0.0;
						g_real[i$3] = i$3 < size ?   x2_real[size - i$3 - 1] : 0.0;
						g_imag[i$3] = i$3 < size ? - x2_imag[size - i$3 - 1] : 0.0;
					}
					// 畳み込み掛け算
					var F = SignalTool.fft(f_real, f_imag);
					var G = SignalTool.fft(g_real, g_imag);
					var real$1 = new Array(N2);
					var imag$1 = new Array(N2);
					for(var i$4 = 0; i$4 < N2; i$4++) {
						real$1[i$4] = F.real[i$4] * G.real[i$4] - F.imag[i$4] * G.imag[i$4];
						imag$1[i$4] = F.real[i$4] * G.imag[i$4] + F.imag[i$4] * G.real[i$4];
					}
					fg = SignalTool.ifft(real$1, imag$1);
					fg.real.splice(N2 - 1);
					fg.imag.splice(N2 - 1);
					return fg;
				}
			}
		}
		var is_real_number = !SignalTool.isContainsZero(x1_imag);
		if(is_real_number) {
			is_real_number = !SignalTool.isContainsZero(x2_imag);
		}
		if(is_self) {
			var size$1 = x1_real.length;
			var N2$1 = size$1 * 2;
			// 実数の自己相関関数
			if(is_real_number) {
				var fg$1 = new Array(size$1);
				for(var m = 0; m < size$1; m++) {
					fg$1[m] = 0;
					var tmax = size$1 - m;
					for(var t = 0; t < tmax; t++) {
						fg$1[m] += x1_real[t] * x2_real[t + m];
					}
				}
				// 半分の値は同一なので折り返して計算を省く
				var real$2 = new Array(N2$1 - 1);
				var imag$2 = new Array(N2$1 - 1);
				for(var i$5 = 0, j$1 = size$1 - 1 ; i$5 < size$1; i$5++, j$1--) {
					real$2[i$5] = fg$1[j$1];
					real$2[size$1 + i$5 - 1] = fg$1[i$5];
				}
				for(var i$6 = 0; i$6 < imag$2.length; i$6++) {
					imag$2[i$6] = 0.0;
				}
				return {
					real : real$2,
					imag : imag$2
				};
			}
		}
		// 2つの信号の長さが違う、又は2の累乗の長さではない別のデータの場合は通常計算
		{
			var g_real$1 = new Array(x2_real.length);
			var g_imag$1 = new Array(x2_real.length);
			// gの順序を反転かつ共役複素数にする
			for(var i$7 = 0; i$7 < x2_real.length; i$7++) {
				g_real$1[i$7] =   x2_real[x2_real.length - i$7 - 1];
				g_imag$1[i$7] = - x2_imag[x2_real.length - i$7 - 1];
			}
			var y = SignalTool.conv(x1_real, x1_imag, g_real$1, g_imag$1);
			if(x1_real.length === x2_real.length) {
				return y;
			}
			var delta = Math.abs(x1_real.length - x2_real.length);
			var zeros = new Array(delta);
			for(var i$8 = 0; i$8 < delta; i$8++) {
				zeros[i$8] = 0;
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
	};

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
		 * @param {number} size - Window length.
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.window = function window (name, size, periodic) {
		var periodic_ = periodic !== undefined ? periodic : "symmetric";
		var name_ = name.toLocaleLowerCase();
		var size_ = size;
		var window = new Array(size_);
			
		var normalzie;
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

		var setBlackmanWindow = function( alpha0, alpha1, alpha2, alpha3, alpha4) {
			for(var i = 0; i < size_; i++) {
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
				for(var i = 0; i < size_; i++) {
					window[i]  = Math.sin(normalzie(i) * 0.5);
				}
				break;

			// Vorbis window(MDCT窓)
			case "vorbis":
				for(var i$1 = 0; i$1 < size_; i$1++) {
					var x = Math.sin(normalzie(i$1) * 0.5);
					window[i$1]  = Math.sin(Math.PI * 0.5 * x * x);
				}
				break;
		}

		return window;
	};

	/**
		 * Hann (Hanning) window.
		 * @param {number} size - Window length.
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.hann = function hann (size, periodic) {
		return SignalTool.window("hann", size, periodic);
	};
		
	/**
		 * Hamming window.
		 * @param {number} size - Window length.
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Array<number>}
		 */
	SignalTool.hamming = function hamming (size, periodic) {
		return SignalTool.window("hamming", size, periodic);
	};

	/**
	 * Signal processing class for Matrix class.
	 */
	var Signal = function Signal () {};

	Signal.fft = function fft (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.fft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex([result.real[i$1], result.imag[i$1]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * Inverse discrete Fourier transform (IDFT),
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @param {SignalSettings} [type]
		 * @returns {Matrix} ifft(X)
		 */
	Signal.ifft = function ifft (X, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(X);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.ifft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex([result.real[i$1], result.imag[i$1]]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * Power spectral density.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {SignalSettings} [type]
		 * @returns {Matrix} abs(fft(x)).^2
		 */
	Signal.powerfft = function powerfft (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		var main = function(data) {
			var real = new Array(data.length);
			var imag = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
				imag[i] = data[i].imag;
			}
			var result = SignalTool.powerfft(real, imag);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * Discrete cosine transform (DCT-II, DCT).
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @param {SignalSettings} [type]
		 * @returns {Matrix} dct(x)
		 */
	Signal.dct = function dct (x, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(x);
		if(M.isComplex()) {
			throw "dct don't support complex numbers.";
		}
		var main = function(data) {
			var real = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			var result = SignalTool.dct(real);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * Inverse discrete cosine transform (DCT-III, IDCT),
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @param {SignalSettings} [type]
		 * @returns {Matrix} idct(x)
		 */
	Signal.idct = function idct (X, type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var M = Matrix._toMatrix(X);
		if(M.isComplex()) {
			throw "idct don't support complex numbers.";
		}
		var main = function(data) {
			var real = new Array(data.length);
			for(var i = 0; i < data.length; i++) {
				real[i] = data[i].real;
			}
			var result = SignalTool.idct(real);
			var y = new Array(data.length);
			for(var i$1 = 0; i$1 < data.length; i$1++) {
				y[i$1] = new Complex(result[i$1]);
			}
			return y;
		};
		return M.eachVector(main, dim);
	};

	/**
		 * Discrete two-dimensional Fourier transform (2D DFT).
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Signal.fft2 = function fft2 (x) {
		return Signal.fft(x, {dimension : "both"});
	};

	/**
		 * Inverse discrete two-dimensional Fourier transform (2D IDFT),
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @returns {Matrix}
		 */
	Signal.ifft2 = function ifft2 (X) {
		return Signal.ifft(X, {dimension : "both"});
	};

	/**
		 * Discrete two-dimensional cosine transform (2D DCT).
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
		 * @returns {Matrix}
		 */
	Signal.dct2 = function dct2 (x) {
		return Signal.dct(x, {dimension : "both"});
	};

	/**
		 * Inverse discrete two-dimensional cosine transform (2D IDCT),
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
		 * @returns {Matrix}
		 */
	Signal.idct2 = function idct2 (X) {
		return Signal.idct(X, {dimension : "both"});
	};

	/**
		 * Convolution integral, Polynomial multiplication.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x2
		 * @returns {Matrix}
		 */
	Signal.conv = function conv (x1, x2) {
		var M1 = Matrix._toMatrix(x1);
		var M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		var M1_real = new Array(M1.length);
		var M1_imag = new Array(M1.length);
		var M2_real = new Array(M2.length);
		var M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(var i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(var i$1 = 0; i$1 < M1.row_length; i$1++) {
				M1_real[i$1] = M1.matrix_array[i$1][0].real;
				M1_imag[i$1] = M1.matrix_array[i$1][0].imag;
			}
		}
		if(M2.isRow()) {
			for(var i$2 = 0; i$2 < M2.column_length; i$2++) {
				M2_real[i$2] = M2.matrix_array[0][i$2].real;
				M2_imag[i$2] = M2.matrix_array[0][i$2].imag;
			}
		}
		else {
			for(var i$3 = 0; i$3 < M2.row_length; i$3++) {
				M2_real[i$3] = M2.matrix_array[i$3][0].real;
				M2_imag[i$3] = M2.matrix_array[i$3][0].imag;
			}
		}
		var y = SignalTool.conv(M1_real, M1_imag, M2_real, M2_imag);
		var m = new Array(y.real.length);
		for(var i$4 = 0; i$4 < y.real.length; i$4++) {
			m[i$4] = new Complex([y.real[i$4], y.imag[i$4]]);
		}
		var M = new Matrix([m]);
		return M2.isRow() ? M : M.transpose();
	};

	/**
		 * ACF(Autocorrelation function), cros-correlation function.
		 * - If the argument is omitted, it is calculated by the autocorrelation function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [x2] - Matrix to calculate the correlation.
		 * @returns {Matrix}
		 */
	Signal.xcorr = function xcorr (x1, x2) {
		var M1 = Matrix._toMatrix(x1);
		if(!x2) {
			return M1.xcorr(M1);
		}
		var M2 = Matrix._toMatrix(x2);
		if(M1.isMatrix() || M2.isMatrix()) {
			throw "conv don't support matrix numbers.";
		}
		var M1_real = new Array(M1.length);
		var M1_imag = new Array(M1.length);
		var M2_real = new Array(M2.length);
		var M2_imag = new Array(M2.length);
		if(M1.isRow()) {
			for(var i = 0; i < M1.column_length; i++) {
				M1_real[i] = M1.matrix_array[0][i].real;
				M1_imag[i] = M1.matrix_array[0][i].imag;
			}
		}
		else {
			for(var i$1 = 0; i$1 < M1.row_length; i$1++) {
				M1_real[i$1] = M1.matrix_array[i$1][0].real;
				M1_imag[i$1] = M1.matrix_array[i$1][0].imag;
			}
		}
		if(M2.isRow()) {
			for(var i$2 = 0; i$2 < M2.column_length; i$2++) {
				M2_real[i$2] = M2.matrix_array[0][i$2].real;
				M2_imag[i$2] = M2.matrix_array[0][i$2].imag;
			}
		}
		else {
			for(var i$3 = 0; i$3 < M2.row_length; i$3++) {
				M2_real[i$3] = M2.matrix_array[i$3][0].real;
				M2_imag[i$3] = M2.matrix_array[i$3][0].imag;
			}
		}
		var y = SignalTool.xcorr(M1_real, M1_imag, M2_real, M2_imag);
		var m = new Array(y.real.length);
		for(var i$4 = 0; i$4 < y.real.length; i$4++) {
			m[i$4] = new Complex([y.real[i$4], y.imag[i$4]]);
		}
		var M = new Matrix([m]);
		return M1.isRow() ? M : M.transpose();
	};

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
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Signal.window = function window (name, size, periodic) {
		var size_ = Matrix._toInteger(size);
		var y = SignalTool.window(name, size_, periodic);
		return (new Matrix(y)).transpose();
	};

	/**
		 * Hann (Hanning) window.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Signal.hann = function hann (size, periodic) {
		return Signal.window("hann", size, periodic);
	};
		
	/**
		 * Hamming window.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Signal.hamming = function hamming (size, periodic) {
		return Signal.window("hamming", size, periodic);
	};
		
	/**
		 * FFT shift.
		 * Circular shift beginning at the center of the signal.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x 
		 * @param {SignalSettings} [type]
		 * @returns {Matrix}
		 */
	Signal.fftshift = function fftshift (x, type) {
		var X = Matrix._toMatrix(x);
		if(X.isVector()) {
			var shift_size = Math.floor(X.length / 2);
			return X.circshift(shift_size, type);
		}
		var shift_size_col = Math.floor(X.column_length / 2);
		var shift_size_row = Math.floor(X.row_length / 2);
		if(type !== undefined) {
			var target = type.dimension;
			if((target === "row") || (target === 1)) {
				return X.circshift(shift_size_col, type);
			}
			else if((target === "column") || (target === 2)) {
				return X.circshift(shift_size_row, type);
			}
		}
		var Y = X.circshift(shift_size_col, {dimension : "row"});
		return Y.circshift(shift_size_row, {dimension : "column"});
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Collection of calculation settings for matrix.
	 * - Available options vary depending on the method.
	 * @typedef {Object} MatrixSettings
	 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
	 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
	 */

	/**
	 * Collection of functions used in Matrix.
	 * @ignore
	 */
	var MatrixTool = function MatrixTool () {};

	MatrixTool.toPositionArrayFromObject = function toPositionArrayFromObject (data, max, geta) {
		if(typeof data === "string") {
			var array_or_string = MatrixTool.toArrayFromString(data);
			if(array_or_string === ":") {
				// : が指定された場合
				var y = new Array(max);
				for(var i = 0; i < max; i++) {
					y[i] =  i + geta;
				}
				return y;
			}
			else if(array_or_string instanceof Array) {
				// 複素数の配列から中身を取り出す
				var y$1 = array_or_string;
				var num_y = new Array(y$1.length);
				for(var i$1 = 0; i$1 < y$1.length; i$1++) {
					num_y[i$1] = Math.trunc(y$1[i$1].real);
				}
				return num_y;
			}
			else {
				throw "toArrayFromString[" + data + "][" + array_or_string + "]";
			}
		}
		var t_data = data;
		if(!(t_data instanceof Matrix) && !(t_data instanceof Complex) && !((typeof t_data === "number"))) {
			t_data = Matrix._toMatrix(t_data);
		}
		if(t_data instanceof Matrix) {
			if(!t_data.isVector()) {
				throw "getMatrix argument " + t_data;
			}
			var len = t_data.length;
			var y$2 = new Array(t_data.length);
			if(t_data.isRow()) {
				for(var i$2 = 0; i$2 < len; i$2++) {
					y$2[i$2] = Math.trunc(t_data.matrix_array[0][i$2].real);
				}
			}
			else if(t_data.isColumn()) {
				for(var i$3 = 0; i$3 < len; i$3++) {
					y$2[i$3] = Math.trunc(t_data.matrix_array[i$3][0].real);
				}
			}
			return y$2;
		}
		return [ Matrix._toInteger(t_data) ];
	};

	/**
		 * A match function that can also extract strings excluding matched strings.
		 * @param {string} text - Search target.
		 * @param {RegExp} regexp - Regular expression.
		 * @returns {Array<Object<boolean, string>>}
		 */
	MatrixTool.match2 = function match2 (text, regexp) {
		// 対象ではないregexpの情報以外も抽出match
		// つまり "1a2b" で \d を抽出すると、次のように抽出される
		// [false "1"]
		// [true "a"]
		// [false "2"]
		// [true "b"]
		// 0 ... 一致したかどうか
		// 1 ... 一致した文字列、あるいは一致していない文字列
		var output = [];
		var search_target = text;
		for(var x = 0; x < 1000; x++) {
			var match = search_target.match(regexp);
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
	};
		
	/**
		 * Removed front and back brackets when enclosed by brackets.
		 * - Return null if the string has no brackets.
		 * @param {string} text - String to be processed.
		 * @returns {string|null} String after brackets removal or null.
		 */
	MatrixTool.trimBracket = function trimBracket (text) {
		// 前後に[]があるか確認
		if( !(/^\[/).test(text) || !(/\]$/).test(text)) {
			return null;
		}
		// 前後の[]を除去
		return text.substring(1, text.length - 1);
	};

	/**
		 * Create Matrix type data from string data defined in JSON.
		 * - For example, "[xx,xx,xx], [xx,xx,xx]"
		 * @param {string} text - String to be processed.
		 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
		 */
	MatrixTool.toMatrixArrayFromStringForArrayJSON = function toMatrixArrayFromStringForArrayJSON (text) {
		var matrix_array = [];
		// さらにブランケット内を抽出
		var rows = text.match(/\[[^\]]+\]/g);
		if(rows === null) {
			// ブランケットがない場合は、1行行列である
			rows = [text];
		}
		// 各ブランケット内を列ごとに調査
		for(var row_count = 0; row_count < rows.length; row_count++) {
			var row = rows[row_count];
			var column_array = row.substring(1, row.length - 1).split(",");
			var rows_array = [];
			for(var col_count = 0; col_count < column_array.length; col_count++) {
				var column = column_array[col_count];
				rows_array[col_count] = new Complex(column);
			}
			matrix_array[row_count] = rows_array;
		}
		return matrix_array;
	};

	/**
		 * Create a numeric array from initial values, difference values, and final values.
		 * @param {Complex} from - Start value.
		 * @param {Complex} delta - Delta.
		 * @param {Complex} to - End value.
		 * @param {boolean} [is_include_last_number=true] - Whether to include the last value.
		 * @returns {Array<Complex>}
		 */
	MatrixTool.InterpolationCalculation = function InterpolationCalculation (from, delta, to, is_include_last_number) {
		var FromIsGreaterThanTo = from.compareTo(to);
		var is_include_last_number_ = is_include_last_number !== undefined ? is_include_last_number : true;
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
		var rows_array = [];
		var num = from;
		rows_array[0] = num;
		for(var i = 1; i < 0x10000; i++) {
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
	};

	/**
		 * Create an array of numbers from data separated by match2.
		 * @param {Array<Object<boolean, string>>} match2_string - Data separated by "toArrayFromString".
		 * @returns {Array<Complex>}
		 */
	MatrixTool.toArrayFromMatch2String = function toArrayFromMatch2String (match2_string) {
		var xs = match2_string;
		var rows_array = [];
		for(var i = 0; i < xs.length; i++) {
			var xx = xs[i];
			if(!xx[0]) {
				// 一致していないデータであれば次へ
				continue;
			}
			// 「:記法」 1:3 なら 1,2,3。 1:2:9 なら 1:3:5:7:9
			if((i < xs.length - 2) && !xs[i + 1][0] && /:/.test(xs[i + 1][1])) {
				var from = (void 0), delta = (void 0), to = (void 0);
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
				var ip_array = MatrixTool.InterpolationCalculation(from, delta, to, true);
				for(var j = 0; j < ip_array.length; j++) {
					rows_array.push(ip_array[j]);
				}
			}
			else {
				rows_array.push(new Complex(xx[1]));
			}
		}

		return rows_array;
	};

	/**
		 * Convert string to row part of matrix type matrix data.
		 * Estimate the matrix by extracting parts like numbers.
		 * @param {string} row_text - A string describing one row of the matrix.
		 * @returns {Array<Complex>|string}
		 */
	MatrixTool.toArrayFromString = function toArrayFromString (row_text) {
		// 「:」のみ記載されていないかの確認
		if(row_text.trim() === ":") {
			return ":";
		}
		var str = row_text.toLowerCase().replace(/infinity|inf/g, "1e100000");
		// 左が実数（強制）で右が複素数（任意）タイプ
		var reg1 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))( *[+-] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij])?/;
		// 左が複素数（強制）で右が実数（任意）タイプ
		var reg2 = /[+-]? *(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]( *[+] *[- ]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan)))?/;
		// reg2優先で検索
		var reg3 = new RegExp("(" + reg2.source + ")|(" + reg1.source + ")", "i");
		// 問題として 1 - -jが通る
		return MatrixTool.toArrayFromMatch2String(MatrixTool.match2(str, reg3));
	};

	/**
		 * Create Matrix type data from string data defined by character string with space separation etc.
		 * @param {string} text - Strings to analyze.
		 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
		 */
	MatrixTool.toMatrixArrayFromStringForArraySPACE = function toMatrixArrayFromStringForArraySPACE (text) {
		// 行ごとを抽出して
		var rows = text.split(";");
		var matrix_array = new Array(rows.length);
		for(var row_count = 0; row_count < rows.length; row_count++) {
			// 各行の文字を解析
			matrix_array[row_count] = MatrixTool.toArrayFromString(rows[row_count]);
		}
		return matrix_array;
	};

	/**
		 * Create Matrix type data composed of string data for matrix.
		 * @param {string} text - Strings to analyze.
		 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
		 */
	MatrixTool.toMatrixArrayFromStringInBracket = function toMatrixArrayFromStringInBracket (text) {
		// ブラケットの中にブラケットがある＝JSON形式
		if(/[[\]]/.test(text)) {
			return MatrixTool.toMatrixArrayFromStringForArrayJSON(text);
		}
		// それ以外(MATLAB, Octave, Scilab)
		else {
			return MatrixTool.toMatrixArrayFromStringForArraySPACE(text);
		}
	};

	/**
		 * Create Matrix type data from string data.
		 * @param {string} text - Strings to analyze.
		 * @returns {Array<Array<Complex>>} Internal array used by Matrix type.
		 */
	MatrixTool.toMatrixArrayFromString = function toMatrixArrayFromString (text) {
		// 前後のスペースを除去
		var trimtext = text.replace(/^\s*|\s*$/g, "");
		// ブランケットを外す
		var withoutBracket = MatrixTool.trimBracket(trimtext);
		if(withoutBracket) {
			// 配列用の初期化
			return MatrixTool.toMatrixArrayFromStringInBracket(withoutBracket);
		}
		else {
			// スカラー用の初期化
			return [[new Complex(text)]];
		}
	};

	/**
		 * Returns true if Matrix type internal data is correct as matrix data.
		 * @param {Array<Array<Complex>>} m_array
		 * @returns {boolean} 
		 */
	MatrixTool.isCorrectMatrixArray = function isCorrectMatrixArray (m_array) {
		if(m_array.length === 0) {
			return false;
		}
		var num = m_array[0].length;
		if(num === 0) {
			return false;
		}
		for(var i = 1; i < m_array.length; i++) {
			if(m_array[i].length !== num) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Complex matrix class. (immutable)
	 */
	var Matrix = function Matrix(number) {
		var matrix_array = null;
		var is_check_string = false;
		if(arguments.length === 1) {
			var obj = number;
			// 行列型なら中身をディープコピーする
			if(obj instanceof Matrix) {
				matrix_array = new Array(obj.row_length);
				for(var i = 0; i < obj.row_length; i++) {
					matrix_array[i] = new Array(obj.column_length);
					for(var j = 0; j < obj.column_length; j++) {
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
				for(var row_count = 0; row_count < obj.length; row_count++) {
					// 毎行ごと調査
					var row = obj[row_count];
					// 各行の要素が配列の場合は、配列内配列のため再度for文で調べていく
					if(row instanceof Array) {
						var rows_array = new Array(row.length);
						// 1行を調査する
						for(var col_count = 0; col_count < row.length; col_count++) {
							var column = row[col_count];
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
			else if((obj instanceof Object) && (obj.doubleValue)) {
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
			for(var row$1 = 0; row$1 < matrix_array.length; row$1++) {
				if(matrix_array[row$1] === ":") {
					matrix_array.splice(row$1--, 1);
				}
			}
		}
		if(!MatrixTool.isCorrectMatrixArray(matrix_array)) {
			console.log(matrix_array);
			throw "new Matrix IllegalArgumentException";
		}
			
		/**
			 * An array of elements in the matrix.
			 * @private
			 * @type {Array<Array<Complex>>}
			 */
		this.matrix_array = matrix_array;

		/**
			 * The number of rows in a matrix.
			 * @private
			 * @type {number}
			 */
		this.row_length = this.matrix_array.length;
			
		/**
			 * The number of columns in a matrix.
			 * @private
			 * @type {number}
			 */
		this.column_length = this.matrix_array[0].length;

		/**
			 * A cache that records data converted to a string.
			 * @private
			 * @type {string}
			 */
		this.string_cash = null;
	};

	var prototypeAccessors$3 = { intValue: { configurable: true },doubleValue: { configurable: true },scalar: { configurable: true },length: { configurable: true },norm1: { configurable: true },norm2: { configurable: true } };

	/**
		 * Create an entity object of this class.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.create = function create (number) {
		if((arguments.length === 1) && (number instanceof Matrix)) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	};
		
	/**
		 * Convert number to Matrix type.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.valueOf = function valueOf (number) {
		return Matrix.create(number);
	};

	/**
		 * Convert to Matrix.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix}
		 * @private
		 */
	Matrix._toMatrix = function _toMatrix (number) {
		if(number instanceof Matrix) {
			return number;
		}
		else {
			return new Matrix(number);
		}
	};

	/**
		 * Convert to Complex.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Complex}
		 * @private
		 */
	Matrix._toComplex = function _toComplex (number) {
		if(number instanceof Complex) {
			return number;
		}
		var M = Matrix._toMatrix(number);
		if(M.isScalar()) {
			return M.scalar;
		}
		else {
			throw "not scalar. [" + number + "]";
		}
	};

	/**
		 * Convert to real number.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {number}
		 * @private
		 */
	Matrix._toDouble = function _toDouble (number) {
		if(typeof number === "number") {
			return number;
		}
		var x = Matrix._toComplex(number);
		if(x.isReal()) {
			return x.real;
		}
		else {
			throw "not support complex numbers.";
		}
	};

	/**
		 * Convert to integer.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {number}
		 * @private
		 */
	Matrix._toInteger = function _toInteger (number) {
		return Math.trunc(Matrix._toDouble(number));
	};

	/**
		 * Delete cache.
		 */
	Matrix.prototype._clearCash = function _clearCash () {
		if(this.string_cash) {
			delete this.string_cash;
		}
	};

	/**
		 * Deep copy.
		 * @returns {Matrix}
		 */
	Matrix.prototype.clone = function clone () {
		return new Matrix(this.matrix_array);
	};

	/**
		 * Convert to string.
		 * @returns {string} 
		 */
	Matrix.prototype.toString = function toString () {
		if(this.string_cash) {
			return this.string_cash;
		}
		var exp_turn_point = 9;
		var exp_turn_num = Math.pow(10, exp_turn_point);
		var exp_point = 4;
		var isDrawImag = false;
		var isDrawExp = false;
		var draw_decimal_position = 0;

		// 行列を確認して表示するための表示方法の確認する
		this._each(
			function(num) {
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
		var str_max = 0;
		var draw_buff = [];
		// 数値データを文字列にする関数（eの桁がある場合は中身は3桁にする）
		var toStrFromFloat = function(number) {
			var str = !isDrawExp ? number.toFixed(draw_decimal_position) : number.toExponential(exp_point);
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
			var split = str.split("e");
			var exp_text = split[1];
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
				var data = {};
				var real = num.real;
				data.re_sign = real < 0 ? "-" : " ";
				real = Math.abs(real);
				data.re_str = toStrFromFloat(real);
				str_max = Math.max(str_max, data.re_str.length + 1);
				if(isDrawImag) {
					var imag = num.imag;
					data.im_sign = imag < 0 ? "-" : "+";
					imag = Math.abs(imag);
					data.im_str = toStrFromFloat(imag);
					str_max = Math.max(str_max, data.im_str.length + 1);
				}
				draw_buff.push(data);
			}
		);

		// 右寄せ用関数
		var right = function(text, length) {
			var space = "                                        ";
			return space.substr(0, length - text.length) + text;
		};
		// 出力用文字列を作成する
		var output = [];
		var that = this;
		this._each(
			function(num, row, col) {
				var data = draw_buff.shift();
				var text = right(data.re_sign + data.re_str, str_max);
				if(isDrawImag) {
					text += " " + data.im_sign + right(data.im_str, str_max) + "i";
				}
				output.push(text);
				output.push((col < that.column_length - 1) ? " " : "\n");
			}
		);

		this.string_cash = output.join("");

		return this.string_cash;
	};

	/**
		 * Convert to string in one line.
		 * @returns {string} 
		 */
	Matrix.prototype.toOneLineString = function toOneLineString () {
		if(this.isScalar()) {
			return this.scalar.toString();
		}
		var output = "[ ";
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
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
	};

	/**
		 * Equals.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean} A === B
		 */
	Matrix.prototype.equals = function equals (number, tolerance) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) || (M1.column_length !== M2.column_length)) {
			return false;
		}
		if((M1.row_length === 1) && (M1.column_length ===1)) {
			return M1.scalar.equals(M2.scalar, tolerance);
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				if(!x1[row][col].equals(x2[row][col], tolerance)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
		 * Array of real parts of elements in matrix.
		 * @returns {Array<Array<number>>}
		 */
	Matrix.prototype.getNumberMatrixArray = function getNumberMatrixArray () {
		var y = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j].real;
			}
		}
		return y;
	};
		
	/**
		 * Complex array of complex numbers of each element of the matrix.
		 * @returns {Array<Array<Complex>>}
		 */
	Matrix.prototype.getComplexMatrixArray = function getComplexMatrixArray () {
		var y = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			y[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				y[i][j] = this.matrix_array[i][j];
			}
		}
		return y;
	};
		
	/**
		 * Perform the same process on all elements in the matrix. (mutable)
		 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._each = function _each (eachfunc) {
		var isclearcash = false;
		// 行優先ですべての値に対して指定した関数を実行する。内容を書き換える可能性もある
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				var ret = eachfunc(this.matrix_array[row][col], row, col);
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
	};

	/**
		 * Perform the same process on all elements in the matrix.
		 * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.cloneMatrixDoEachCalculation = function cloneMatrixDoEachCalculation (eachfunc) {
		return this.clone()._each(eachfunc);
	};

	/**
		 * Create Matrix with specified initialization for each element in matrix.
		 * @param {function(number, number): ?Object } eachfunc - Function(row, col)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length=dimension] - Number of columns.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.createMatrixDoEachCalculation = function createMatrixDoEachCalculation (eachfunc, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		var y_row_length = Matrix._toInteger(dimension);
		var y_column_length = column_length ? Matrix._toInteger(column_length) : y_row_length;
		var y = new Array(y_row_length);
		for(var row = 0; row < y_row_length; row++) {
			y[row] = new Array(y_column_length);
			for(var col = 0; col < y_column_length; col++) {
				var ret = eachfunc(row, col);
				if(ret === undefined) {
					y[row][col] = Complex.ZERO;
				}
				else {
					y[row][col] = Matrix._toComplex(ret);
				}
			}
		}
		return new Matrix(y);
	};

	/**
		 * Treat the columns of the matrix as vectors and execute the same process.
		 * - If the matrix is a row vector, it performs the same processing for the row vector.
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.eachVectorAuto = function eachVectorAuto (array_function) {
		if(this.isRow()) {
			// 1行であれば、その1行に対して処理を行う
			var row_array = new Array(this.row_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[0][col];
			}
			return new Matrix(array_function(row_array));
		}
		else {
			var y = new Matrix(0);
			y._resize(1, this.column_length);
			// 1列、行列であれば、列ごとに処理を行う
			for(var col$1 = 0; col$1 < this.column_length; col$1++) {
				var col_array = new Array(this.row_length);
				for(var row = 0; row < this.row_length; row++) {
					col_array[row] = this.matrix_array[row][col$1];
				}
				var col_output = array_function(col_array);
				y._resize(Math.max(y.row_length, col_output.length), y.column_length);
				for(var row$1 = 0; row$1 < col_output.length; row$1++) {
					y.matrix_array[row$1][col$1] = col_output[row$1];
				}
			}
			return y;
		}
	};

	/**
		 * Treat the rows and columns of the matrix as vectors and perform the same processing.
		 * 1. First run the same process for the row.
		 * 2. Finally perform the same processing for the column.
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.eachVectorBoth = function eachVectorBoth (array_function) {
		var y1 = new Matrix(0);
		// 行ごとに処理を行う
		y1._resize(this.row_length, 1);
		for(var row = 0; row < this.row_length; row++) {
			var row_array = new Array(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			var row_output = array_function(row_array);
			y1._resize(y1.row_length, Math.max(y1.column_length, row_output.length));
			for(var col$1 = 0; col$1 < row_output.length; col$1++) {
				y1.matrix_array[row][col$1] = row_output[col$1];
			}
		}
		var y2 = new Matrix(0);
		// 列ごとに処理を行う
		y2._resize(1, y1.column_length);
		for(var col$2 = 0; col$2 < y1.column_length; col$2++) {
			var col_array = new Array(y1.row_length);
			for(var row$1 = 0; row$1 < y1.row_length; row$1++) {
				col_array[row$1] = y1.matrix_array[row$1][col$2];
			}
			var col_output = array_function(col_array);
			y2._resize(Math.max(y2.row_length, col_output.length), y2.column_length);
			for(var row$2 = 0; row$2 < col_output.length; row$2++) {
				y2.matrix_array[row$2][col$2] = col_output[row$2];
			}
		}
		return y2;
	};

	/**
		 * Treat the rows of the matrix as vectors and execute the same process.
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.eachVectorRow = function eachVectorRow (array_function) {
		var y = new Matrix(0);
		// 行ごとに処理を行う
		y._resize(this.row_length, 1);
		for(var row = 0; row < this.row_length; row++) {
			var row_array = new Array(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				row_array[col] = this.matrix_array[row][col];
			}
			var row_output = array_function(row_array);
			y._resize(y.row_length, Math.max(y.column_length, row_output.length));
			for(var col$1 = 0; col$1 < row_output.length; col$1++) {
				y.matrix_array[row][col$1] = row_output[col$1];
			}
		}
		return y;
	};

	/**
		 * Treat the columns of the matrix as vectors and execute the same process.
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.eachVectorColumn = function eachVectorColumn (array_function) {
		var y = new Matrix(0);
		// 列ごとに処理を行う
		y._resize(1, this.column_length);
		for(var col = 0; col < this.column_length; col++) {
			var col_array = new Array(this.row_length);
			for(var row = 0; row < this.row_length; row++) {
				col_array[row] = this.matrix_array[row][col];
			}
			var col_output = array_function(col_array);
			y._resize(Math.max(y.row_length, col_output.length), y.column_length);
			for(var row$1 = 0; row$1 < col_output.length; row$1++) {
				y.matrix_array[row$1][col] = col_output[row$1];
			}
		}
		return y;
	};

	/**
		 * Treat the rows and columns of the matrix as vectors and perform the same processing.
		 * The arguments of the method can switch the direction of the matrix to be executed.
		 * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
		 * @param {string|number} [dimension="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.eachVector = function eachVector (array_function, dimension) {
		var target = dimension !== undefined ? dimension : "auto";
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
	};

	/**
		 * Extract the specified part of the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
		 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
		 * @returns {Matrix} 
		 */
	Matrix.prototype.getMatrix = function getMatrix (row, col, isUpOffset) {
			if ( isUpOffset === void 0 ) isUpOffset=false;

		var geta = isUpOffset ? 1 : 0 ;
		var row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		var col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		var x = this.matrix_array;
		var y = new Array(row_array.length);
		for(var row$1 = 0; row$1 < row_array.length; row$1++) {
			var y_row = new Array(col_array.length);
			for(var col$1 = 0; col$1 < col_array.length; col$1++) {
				y_row[col$1] = x[row_array[row$1] - geta][col_array[col$1] - geta];
			}
			y[row$1] = y_row;
		}
		return new Matrix(y);
	};

	/**
		 * Change specified element in matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} replace - Matrix to be replaced.
		 * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
		 * @returns {Matrix} 
		 */
	Matrix.prototype.setMatrix = function setMatrix (row, col, replace, isUpOffset) {
			if ( isUpOffset === void 0 ) isUpOffset=false;

		var geta = isUpOffset ? 1 : 0 ;
		var row_array = MatrixTool.toPositionArrayFromObject(row, this.row_length, geta);
		var col_array = MatrixTool.toPositionArrayFromObject(col, this.column_length, geta);
		var Y = new Matrix(this);
		var y = Y.matrix_array;
		var X = Matrix._toMatrix(replace);
		var x = X.matrix_array;
		for(var row$1 = 0; row$1 < row_array.length; row$1++) {
			for(var col$1 = 0; col$1 < col_array.length; col$1++) {
				y[row_array[row$1] - geta][col_array[col$1] - geta] = x[row$1 % X.row_length][col$1 % X.column_length];
			}
		}
		return new Matrix(y);
	};

	/**
		 * Returns the specified element in the matrix.
		 * Each element of the matrix is composed of complex numbers.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [col] - If this is a matrix, the column number.
		 * @returns {Complex} 
		 */
	Matrix.prototype.getComplex = function getComplex (row_or_pos, col) {
		var row_or_pos_scalar = null;
		var col_scalar = null;
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
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の基本操作、基本情報の取得
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * Integer value of the first element of the matrix.
		 * @returns {number}
		 */
	prototypeAccessors$3.intValue.get = function () {
		return Math.trunc(this.matrix_array[0][0].real);
	};

	/**
		 * Real value of first element of the matrix.
		 * @returns {number}
		 */
	prototypeAccessors$3.doubleValue.get = function () {
		return this.matrix_array[0][0].real;
	};

	/**
		 * First element of this matrix.
		 * @returns {Complex}
		 */
	prototypeAccessors$3.scalar.get = function () {
		return this.matrix_array[0][0];
	};

	/**
		 * Maximum size of rows or columns in the matrix.
		 * @returns {number}
		 */
	prototypeAccessors$3.length.get = function () {
		return this.row_length > this.column_length ? this.row_length : this.column_length;
	};

	/**
		 * 1-norm.
		 * @returns {number}
		 */
	prototypeAccessors$3.norm1.get = function () {
		return LinearAlgebra.norm(this, 1);
	};
		
	/**
		 * 2-norm.
		 * @returns {number}
		 */
	prototypeAccessors$3.norm2.get = function () {
		return LinearAlgebra.norm(this, 2);
	};

	/**
		 * p-norm.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	Matrix.prototype.norm = function norm (p) {
		return LinearAlgebra.norm(this, p);
	};

	/**
		 * Condition number of the matrix
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
		 * @returns {number}
		 */
	Matrix.prototype.cond = function cond (p) {
		return LinearAlgebra.cond(this, p);
	};

	/**
		 * Inverse condition number.
		 * @returns {number}
		 */
	Matrix.prototype.rcond = function rcond () {
		return LinearAlgebra.rcond(this);
	};

	/**
		 * Rank.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {number} rank(A)
		 */
	Matrix.prototype.rank = function rank (tolerance) {
		return LinearAlgebra.rank(this, tolerance);
	};

	/**
		 * Trace of a matrix.
		 * Sum of diagonal elements.
		 * @returns {Complex} trace(A)
		 */
	Matrix.prototype.trace = function trace () {
		return LinearAlgebra.trace(this);
	};

	/**
		 * Determinant.
		 * @returns {Matrix} |A|
		 */
	Matrix.prototype.det = function det () {
		return LinearAlgebra.det(this);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の作成関係
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * Creates a matrix composed of the specified number.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - Value after initialization.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.memset = function memset (number, dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 3)) {
			throw "IllegalArgumentException";
		}
		var M = Matrix._toMatrix(number);
		if(!M.isScalar()) {
			var x = M.matrix_array;
			var x_row_length = M.row_length;
			var x_column_length = M.column_length;
			return Matrix.createMatrixDoEachCalculation(function(row, col) {
				return x[row % x_row_length][col % x_column_length];
			}, dimension, column_length);
		}
		else {
			var x$1 = M.scalar;
			return Matrix.createMatrixDoEachCalculation(function() {
				return x$1;
			}, dimension, column_length);
		}
	};

	/**
		 * Return identity matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.eye = function eye (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return row === col ? Complex.ONE : Complex.ZERO;
		}, dimension, column_length);
	};
		
	/**
		 * Create zero matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.zeros = function zeros (dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ZERO, dimension, column_length);
	};

	/**
		 * Create a matrix of all ones.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.ones = function ones (dimension, column_length) {
		if((arguments.length === 0) || (arguments.length > 2)) {
			throw "IllegalArgumentException";
		}
		return Matrix.memset(Complex.ONE, dimension, column_length);
	};

	/**
		 * Generate a matrix composed of random values with uniform random numbers.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.rand = function rand (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.rand();
		}, dimension, column_length);
	};

	/**
		 * Generate a matrix composed of random values with normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
		 * @returns {Matrix}
		 */
	Matrix.randn = function randn (dimension, column_length) {
		return Matrix.createMatrixDoEachCalculation(function() {
			return Complex.randn();
		}, dimension, column_length);
	};

	/**
		 * If matrix, generate diagonal column vector.
		 * If vector, generate a matrix with diagonal elements.
		 * @returns {Matrix} Matrix or vector created. See how to use the function.
		 */
	Matrix.prototype.diag = function diag () {
		if(this.isVector()) {
			// 行列を作成
			var M = this;
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
			var len = Math.min(this.row_length, this.column_length);
			var y = new Array(len);
			for(var i = 0; i < len; i++) {
				y[i] = new Array(1);
				y[i][0] = this.matrix_array[i][i];
			}
			return new Matrix(y);
		}
	};

	// TODO 行列の結合がほしい

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 比較や判定
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Return true if the matrix is scalar.
		 * @returns {boolean}
		 */
	Matrix.prototype.isScalar = function isScalar () {
		return this.row_length === 1 && this.column_length == 1;
	};
		
	/**
		 * Return true if the matrix is row vector.
		 * @returns {boolean}
		 */
	Matrix.prototype.isRow = function isRow () {
		return this.row_length === 1;
	};
		
	/**
		 * Return true if the matrix is column vector.
		 * @returns {boolean}
		 */
	Matrix.prototype.isColumn = function isColumn () {
		return this.column_length === 1;
	};

	/**
		 * Return true if the matrix is vector.
		 * @returns {boolean}
		 */
	Matrix.prototype.isVector = function isVector () {
		return this.row_length === 1 || this.column_length === 1;
	};

	/**
		 * Return true if the value is not scalar.
		 * @returns {boolean}
		 */
	Matrix.prototype.isMatrix = function isMatrix () {
		return this.row_length !== 1 && this.column_length !== 1;
	};

	/**
		 * Return true if the matrix is square matrix.
		 * @returns {boolean}
		 */
	Matrix.prototype.isSquare = function isSquare () {
		return this.row_length === this.column_length;
	};

	/**
		 * Return true if the matrix is real matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isReal = function isReal (tolerance) {
		var is_real = true;
		this._each(function(num){
			if(is_real && (num.isComplex(tolerance))) {
				is_real = false;
			}
		});
		return is_real;
	};

	/**
		 * Return true if the matrix is complex matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isComplex = function isComplex (tolerance) {
		return !this.isReal(tolerance);
	};

	/**
		 * Return true if the matrix is zero matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isZeros = function isZeros (tolerance) {
		var is_zeros = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num){
			if(is_zeros && (!num.isZero(tolerance_))) {
				is_zeros = false;
			}
		});
		return is_zeros;
	};

	/**
		 * Return true if the matrix is identity matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isIdentity = function isIdentity (tolerance) {
		var is_identity = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
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
	};

	/**
		 * Return true if the matrix is diagonal matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isDiagonal = function isDiagonal (tolerance) {
		var is_diagonal = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_diagonal && (row !== col) && (!num.isZero(tolerance_))) {
				is_diagonal = false;
			}
		});
		return is_diagonal;
	};
		
	/**
		 * Return true if the matrix is tridiagonal matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isTridiagonal = function isTridiagonal (tolerance) {
		var is_tridiagonal = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_tridiagonal && (Math.abs(row - col) > 1) && (!num.isZero(tolerance_))) {
				is_tridiagonal = false;
			}
		});
		return is_tridiagonal;
	};

	/**
		 * Return true if the matrix is regular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isRegular = function isRegular (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		// ランクが行列の次元と等しいかどうかで判定
		// det(M) != 0 でもよいが、時間がかかる可能性があるので
		// 誤差は自動で計算など本当はもうすこし良い方法を考える必要がある
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.rank(tolerance_) === this.row_length);
	};

	/**
		 * Return true if the matrix is orthogonal matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isOrthogonal = function isOrthogonal (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.transpose()).isIdentity(tolerance_));
	};

	/**
		 * Return true if the matrix is unitary matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isUnitary = function isUnitary (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		return (this.mul(this.ctranspose()).isIdentity(tolerance_));
	};

	/**
		 * Return true if the matrix is symmetric matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isSymmetric = function isSymmetric (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = row + 1; col < this.column_length; col++) {
				if(!this.matrix_array[row][col].equals(this.matrix_array[col][row], tolerance_)) {
					return false;
				}
			}
		}
		return true;
	};

	/**
		 * Return true if the matrix is hermitian matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isHermitian = function isHermitian (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		for(var row = 0; row < this.row_length; row++) {
			for(var col = row; col < this.column_length; col++) {
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
	};
		
	/**
		 * Return true if the matrix is upper triangular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isTriangleUpper = function isTriangleUpper (tolerance) {
		var is_upper = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_upper && (row > col) && (!num.isZero(tolerance_))) {
				is_upper = false;
			}
		});
		return is_upper;
	};

	/**
		 * Return true if the matrix is  lower triangular matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isTriangleLower = function isTriangleLower (tolerance) {
		var is_lower = true;
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		this._each(function(num, row, col){
			if(is_lower && (row < col) && (!num.isZero(tolerance_))) {
				is_lower = false;
			}
		});
		return is_lower;
	};

	/**
		 * Return true if the matrix is permutation matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Matrix.prototype.isPermutation = function isPermutation (tolerance) {
		if(!this.isSquare()) {
			return false;
		}
		var tolerance_ = tolerance ? tolerance : 1.0e-10;
		var is_row = new Array(this.row_length);
		var is_col = new Array(this.column_length);
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < this.column_length; col++) {
				var target = this.matrix_array[row][col];
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
		for(var i = 0;i < this.row_length; i++) {
			if(is_row[i] === undefined || is_col[i] === undefined) {
				return false;
			}
		}
		return true;
	};

	/**
		 * Number of rows and columns of matrix.
		 * @returns {Matrix} [row_length, column_length]
		 */
	Matrix.prototype.size = function size () {
		// 行列のサイズを取得
		return new Matrix([[this.row_length, this.column_length]]);
	};

	/**
		 * Compare values.
		 * - Return value between scalars is of type Number.
		 * - Return value between matrices is type Matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {number|Matrix} A > B ? 1 : (A === B ? 0 : -1)
		 */
	Matrix.prototype.compareTo = function compareTo (number, tolerance) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		// ※スカラー同士の場合は、実数を返す
		if(M1.isScalar() && M2.isScalar()) {
			return M1.scalar.compareTo(M2.scalar, tolerance);
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].compareTo(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 四則演算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
		
	/**
		 * Add.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A + B
		 */
	Matrix.prototype.add = function add (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].add(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * Subtract.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A - B
		 */
	Matrix.prototype.sub = function sub (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if((M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].sub(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * Multiply.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A * B
		 */
	Matrix.prototype.mul = function mul (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.mul(M2.scalar));
		}
		if(M1.isScalar()) {
			var y = new Array(M2.row_length);
			for(var row = 0; row < M2.row_length; row++) {
				y[row] = new Array(M2.column_length);
				for(var col = 0; col < M2.column_length; col++) {
					y[row][col] = M1.scalar.mul(x2[row][col]);
				}
			}
			return new Matrix(y);
		}
		else if(M2.isScalar()) {
			var y$1 = new Array(M1.row_length);
			for(var row$1 = 0; row$1 < M1.row_length; row$1++) {
				y$1[row$1] = new Array(M1.column_length);
				for(var col$1 = 0; col$1 < M1.column_length; col$1++) {
					y$1[row$1][col$1] = x1[row$1][col$1].mul(M2.scalar);
				}
			}
			return new Matrix(y$1);
		}
		if(M1.column_length !== M2.row_length) {
			throw "Matrix size does not match";
		}
		{
			var y$2 = new Array(M1.row_length);
			for(var row$2 = 0; row$2 < M1.row_length; row$2++) {
				y$2[row$2] = new Array(M2.column_length);
				for(var col$2 = 0; col$2 < M2.column_length; col$2++) {
					var sum = Complex.ZERO;
					for(var i = 0; i < M1.column_length; i++) {
						sum = sum.add(x1[row$2][i].mul(x2[i][col$2]));
					}
					y$2[row$2][col$2] = sum;
				}
			}
			return new Matrix(y$2);
		}
	};

	/**
		 * Divide.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A / B
		 */
	Matrix.prototype.div = function div (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		var x1 = M1.matrix_array;
		if(M1.isScalar() && M2.isScalar()) {
			return new Matrix(M1.scalar.div(M2.scalar));
		}
		if(M2.isScalar()) {
			var y = new Array(M1.row_length);
			for(var row = 0; row < M1.row_length; row++) {
				y[row] = new Array(M1.column_length);
				for(var col = 0; col < M1.column_length; col++) {
					y[row][col] = x1[row][col].div(M2.scalar);
				}
			}
			return new Matrix(y);
		}
		if(M2.row_length === M2.column_length) {
			var tolerance = 1.0e-10;
			var det = M2.det().scalar.norm;
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
	};

	/**
		 * Power function.
		 * - Supports only integers.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 整数
		 * @returns {Matrix} pow(A, B)
		 */
	Matrix.prototype.pow = function pow (number) {
		if(!this.isSquare()) {
			throw "not square " + this;
		}
		var n = Matrix._toInteger(number);
		if(n < 0) {
			throw "error negative number " + n;
		}
		var x, y;
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
	};

	/**
		 * Multiplication for each element of matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .* B
		 */
	Matrix.prototype.dotmul = function dotmul (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].mul(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * Division for each element of matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A ./ B
		 */
	Matrix.prototype.dotdiv = function dotdiv (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].div(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * Inverse of each element of matrix.
		 * @returns {Matrix} 1 ./ A
		 */
	Matrix.prototype.dotinv = function dotinv () {
		var M1 = this;
		var x1 = M1.matrix_array;
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row][col].inv();
		}, M1.row_length, M1.column_length);
	};

	/**
		 * Power function for each element of the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .^ B
		 */
	Matrix.prototype.dotpow = function dotpow (number) {
		var M1 = this;
		var M2 = Matrix._toMatrix(number);
		if(!M1.isScalar() && !M2.isScalar() && (M1.row_length !== M2.row_length) && (M1.column_length !== M2.column_length)) {
			throw "Matrix size does not match";
		}
		var x1 = M1.matrix_array;
		var x2 = M2.matrix_array;
		var y_row_length = Math.max(M1.row_length, M2.row_length);
		var y_column_length = Math.max(M1.column_length, M2.column_length);
		return Matrix.createMatrixDoEachCalculation(function(row, col) {
			return x1[row % M1.row_length][col % M1.column_length].pow(x2[row % M2.row_length][col % M2.column_length]);
		}, y_row_length, y_column_length);
	};

	/**
		 * Multiplication for each element of matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .* B
		 * @deprecated use the dotmul.
		 */
	Matrix.prototype.nmul = function nmul (number) {
		return this.dotmul(number);
	};

	/**
		 * Division for each element of matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A ./ B
		 * @deprecated use the dotdiv.
		 */
	Matrix.prototype.ndiv = function ndiv (number) {
		return this.dotdiv(number);
	};

	/**
		 * Inverse of each element of matrix.
		 * @returns {Matrix} 1 ./ A
		 * @deprecated use the dotinv.
		 */
	Matrix.prototype.ninv = function ninv () {
		return this.dotinv();
	};

	/**
		 * Power function for each element of the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @returns {Matrix} A .^ B
		 * @deprecated use the dotpow.
		 */
	Matrix.prototype.npow = function npow (number) {
		return this.dotpow(number);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// Complexのメソッドにある機能
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Real part of each element.
		 * @returns {Matrix} real(A)
		 */
	Matrix.prototype.real = function real () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.real);
		});
	};
		
	/**
		 * Imaginary part of each element of the matrix.
		 * @returns {Matrix} imag(A)
		 */
	Matrix.prototype.imag = function imag () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.imag);
		});
	};

	/**
		 * The argument of each element of matrix.
		 * @returns {Matrix} arg(A)
		 */
	Matrix.prototype.arg = function arg () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.arg);
		});
	};

	/**
		 * The positive or negative signs of each element of the matrix.
		 * - +1 if positive, -1 if negative, 0 if 0, norm if complex number.
		 * @returns {Matrix}
		 */
	Matrix.prototype.sign = function sign () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return new Complex(num.sign());
		});
	};

	/**
		 * Test if each element of the matrix is integer.
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testInteger = function testInteger (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * Test if each element of the matrix is complex integer.
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testComplexInteger = function testComplexInteger (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplexInteger(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(this) === 0
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testZero = function testZero (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isZero(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(this) === 1
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testOne = function testOne (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isOne(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};
		
	/**
		 * Test if each element of the matrix is complex.
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testComplex = function testComplex (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isComplex(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * Test if each element of the matrix is real.
		 * - 1 if true, 0 if false.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testReal = function testReal (tolerance) {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isReal(tolerance) ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * Test if each element of the matrix is NaN.
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testNaN = function testNaN () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNaN() ? Complex.ONE : Complex.ZERO;
		});
	};


	/**
		 * real(this) > 0
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testPositive = function testPositive () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isPositive() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(this) < 0
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testNegative = function testNegative () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNegative() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * real(this) >= 0
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testNotNegative = function testNotNegative () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isNotNegative() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * Test if each element of the matrix is infinite.
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testInfinite = function testInfinite () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isInfinite() ? Complex.ONE : Complex.ZERO;
		});
	};
		
	/**
		 * Test if each element of the matrix is finite.
		 * - 1 if true, 0 if false.
		 * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
		 */
	Matrix.prototype.testFinite = function testFinite () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.isFinite() ? Complex.ONE : Complex.ZERO;
		});
	};

	/**
		 * Absolute value.
		 * @returns {Matrix} abs(A)
		 */
	Matrix.prototype.abs = function abs () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.abs();
		});
	};

	/**
		 * Complex conjugate matrix.
		 * @returns {Matrix} real(A) - imag(A)j
		 */
	Matrix.prototype.conj = function conj () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.conj();
		});
	};

	/**
		 * this * -1
		 * @returns {Matrix} -A
		 */
	Matrix.prototype.negate = function negate () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.negate();
		});
	};

	/**
		 * Square root.
		 * @returns {Matrix} sqrt(A)
		 */
	Matrix.prototype.sqrt = function sqrt () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sqrt();
		});
	};

	/**
		 * Logarithmic function.
		 * @returns {Matrix} log(A)
		 */
	Matrix.prototype.log = function log () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.log();
		});
	};

	/**
		 * Exponential function.
		 * @returns {Matrix} exp(A)
		 */
	Matrix.prototype.exp = function exp () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.exp();
		});
	};

	/**
		 * Sine function.
		 * @returns {Matrix} sin(A)
		 */
	Matrix.prototype.sin = function sin () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sin();
		});
	};

	/**
		 * Cosine function.
		 * @returns {Matrix} cos(A)
		 */
	Matrix.prototype.cos = function cos () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.cos();
		});
	};

	/**
		 * Tangent function.
		 * @returns {Matrix} tan(A)
		 */
	Matrix.prototype.tan = function tan () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.tan();
		});
	};
		
	/**
		 * Atan (arc tangent) function.
		 * - Return the values of [-PI/2, PI/2].
		 * @returns {Matrix} atan(A)
		 */
	Matrix.prototype.atan = function atan () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan();
		});
	};

	/**
		 * Atan (arc tangent) function.
		 * - Return the values of [-PI, PI].
		 * - Supports only real numbers.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - X
		 * @returns {Matrix} atan2(Y, X)
		 */
	Matrix.prototype.atan2 = function atan2 (number) {
		var X = Matrix._toComplex(number);
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.atan2(X);
		});
	};

	/**
		 * Floor.
		 * @returns {Matrix} floor(A)
		 */
	Matrix.prototype.floor = function floor () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.floor();
		});
	};

	/**
		 * Ceil.
		 * @returns {Matrix} ceil(A)
		 */
	Matrix.prototype.ceil = function ceil () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.ceil();
		});
	};

	/**
		 * Rounding to the nearest integer.
		 * @returns {Matrix} round(A)
		 */
	Matrix.prototype.round = function round () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.round();
		});
	};

	/**
		 * To integer rounded down to the nearest.
		 * @returns {Matrix} fix(A), trunc(A)
		 */
	Matrix.prototype.fix = function fix () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fix();
		});
	};

	/**
		 * Fraction.
		 * @returns {Matrix} fract(A)
		 */
	Matrix.prototype.fract = function fract () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.fract();
		});
	};

	/**
		 * Normalized sinc function.
		 * @returns {Matrix} sinc(A)
		 */
	Matrix.prototype.sinc = function sinc () {
		return this.cloneMatrixDoEachCalculation(function(num) {
			return num.sinc();
		});
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の計算でよく使用する処理。
	// メソッド内部の処理を記述する際に使用している。
	// 他から使用する場合は注意が必要である。
	// 前提条件があるメソッド、ミュータブルとなっている。
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Rotate matrix 90 degrees clockwise. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - Number of times rotated by 90 degrees.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._rot90 = function _rot90 (rot_90_count) {
		var count = Matrix._toInteger(rot_90_count);
		var rot_type = 1;
		if(arguments.length === 1) {
			rot_type = ((count % 4) + 4) % 4;
		}
		if(rot_type === 0) {
			return this;
		}
		// バックアップ
		var x = new Array(this.row_length);
		for(var i = 0; i < this.row_length; i++) {
			x[i] = new Array(this.column_length);
			for(var j = 0; j < this.column_length; j++) {
				x[i][j] = this.matrix_array[i][j];
			}
		}
		var y = this.matrix_array;
		if(rot_type === 1) {
			// 90度回転
			y.splice(this.column_length);
			for(var col = 0; col < this.column_length; col++) {
				if(col < this.row_length) {
					y[col].splice(this.row_length);
				}
				else {
					y[col] = new Array(this.row_length);
				}
				for(var row = 0; row < this.row_length; row++) {
					y[col][row] = x[this.row_length - row - 1][col];
				}
			}
		}
		else if(rot_type === 2) {
			// 180度回転
			for(var row$1 = 0; row$1 < this.row_length; row$1++) {
				for(var col$1 = 0; col$1 < this.column_length; col$1++) {
					y[row$1][col$1] = x[this.row_length - row$1 - 1][this.column_length - col$1 - 1];
				}
			}
		}
		else if(rot_type === 3) {
			// 270度回転
			y.splice(this.column_length);
			for(var col$2 = 0; col$2 < this.column_length; col$2++) {
				if(col$2 < this.row_length) {
					y[col$2].splice(this.row_length);
				}
				else {
					y[col$2] = new Array(this.row_length);
				}
				for(var row$2 = 0; row$2 < this.row_length; row$2++) {
					y[col$2][row$2] = x[row$2][this.column_length - col$2 - 1];
				}
			}
		}
		this.row_length = y.length;
		this.column_length = y[0].length;
		this._clearCash();
		return this;
	};

	/**
		 * Rotate matrix 90 degrees clockwise.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - Number of times rotated by 90 degrees.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.rot90 = function rot90 (rot_90_count) {
		return this.clone()._rot90(rot_90_count);
	};

	/**
		 * Change the size of the matrix. (mutable)
		 * Initialized with 0 when expanding.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_row_length - Number of rows of matrix to resize.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} new_column_length - Number of columns of matrix to resize.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._resize = function _resize (new_row_length, new_column_length) {
		var row_length= Matrix._toInteger(new_row_length);
		var column_length= Matrix._toInteger(new_column_length);
		if((row_length === this.row_length) && (column_length === this.column_length)) {
			return this;
		}
		if((row_length <= 0) || (column_length <= 0)) {
			throw "_resize";
		}
		var row_max = Math.max(this.row_length, row_length);
		var col_max = Math.max(this.column_length, column_length);
		var y = this.matrix_array;
		// 大きくなった行と列に対してゼロで埋める
		for(var row = 0; row < row_max; row++) {
			if(row >= this.row_length) {
				y[row] = new Array(col_max);
			}
			for(var col = 0; col < col_max; col++) {
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
			for(var row$1 = 0; row$1 < y.length; row$1++) {
				y[row$1].splice(column_length);
			}
		}
		this.row_length = row_length;
		this.column_length = column_length;
		this._clearCash();
		return this;
	};

	/**
		 * Change the size of the matrix.
		 * Initialized with 0 when expanding.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - Number of rows of matrix to resize.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - Number of columns of matrix to resize.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.resize = function resize (row_length, column_length) {
		return this.clone()._resize(row_length, column_length);
	};

	/**
		 * Remove the row in this matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - Number of row of matrix to delete.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._deleteRow = function _deleteRow (delete_row_index) {
		var row_index= Matrix._toInteger(delete_row_index);
		if((this.row_length === 1) || (this.row_length <= row_index)) {
			throw "_deleteRow";
		}
		this.matrix_array.splice(row_index, 1);
		this.row_length--;
		this._clearCash();
		return this;
	};
		
	/**
		 * Remove the column in this matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - Number of column of matrix to delete.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._deleteColumn = function _deleteColumn (delete_column_index) {
		var column_index= Matrix._toInteger(delete_column_index);
		if((this.column_length === 1) || (this.column_length <= column_index)) {
			throw "_deleteColumn";
		}
		for(var row = 0; row < this.row_length; row++) {
			this.matrix_array[row].splice(column_index, 1);
		}
		this.column_length--;
		this._clearCash();
		return this;
	};

	/**
		 * Remove the row in this matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - Number of row of matrix to delete.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.deleteRow = function deleteRow (delete_row_index) {
		return this.clone()._deleteRow(delete_row_index);
	};

	/**
		 * Remove the column in this matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - Number of column of matrix to delete.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.deleteColumn = function deleteColumn (delete_column_index) {
		return this.clone()._deleteColumn(delete_column_index);
	};

	/**
		 * Swap rows in the matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - Number 1 of row of matrix to exchange.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - Number 2 of row of matrix to exchange.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._exchangeRow = function _exchangeRow (exchange_row_index1, exchange_row_index2) {
		var row_index1= Matrix._toInteger(exchange_row_index1);
		var row_index2= Matrix._toInteger(exchange_row_index2);
		if((this.row_length === 1) || (this.row_length <= row_index1) || (this.row_length <= row_index2)) {
			throw "_exchangeRow";
		}
		if(row_index1 === row_index2) {
			return this;
		}
		var swap = this.matrix_array[row_index1];
		this.matrix_array[row_index1] = this.matrix_array[row_index2];
		this.matrix_array[row_index2] = swap;
		this._clearCash();
		return this;
	};

	/**
		 * Swap columns in the matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - Number 1 of column of matrix to exchange.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - Number 2 of column of matrix to exchange.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._exchangeColumn = function _exchangeColumn (exchange_column_index1, exchange_column_index2) {
		var column_index1= Matrix._toInteger(exchange_column_index1);
		var column_index2= Matrix._toInteger(exchange_column_index2);
		if((this.column_length === 1) || (this.column_length <= column_index1) || (this.column_length <= column_index2)) {
			throw "_exchangeColumn";
		}
		if(column_index1 === column_index2) {
			return this;
		}
		for(var row = 0; row < this.row_length; row++) {
			var swap = this.matrix_array[row][column_index1];
			this.matrix_array[row][column_index1] = this.matrix_array[row][column_index2];
			this.matrix_array[row][column_index2] = swap;
		}
		this._clearCash();
		return this;
	};

	/**
		 * Swap rows in the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - Number 1 of row of matrix to exchange.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - Number 2 of row of matrix to exchange.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.exchangeRow = function exchangeRow (exchange_row_index1, exchange_row_index2) {
		return this.clone()._exchangeRow(exchange_row_index1, exchange_row_index2);
	};

	/**
		 * Swap columns in the matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - Number 1 of column of matrix to exchange.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - Number 2 of column of matrix to exchange.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.exchangeColumn = function exchangeColumn (exchange_column_index1, exchange_column_index2) {
		return this.clone()._exchangeColumn(exchange_column_index1, exchange_column_index2);
	};

	/**
		 * Combine matrix to the right of this matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - Matrix to combine.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._concatRight = function _concatRight (left_matrix) {
		var M = Matrix._toMatrix(left_matrix);
		if(this.row_length != M.row_length) {
			throw "_concatRight";
		}
		for(var row = 0; row < this.row_length; row++) {
			for(var col = 0; col < M.column_length; col++) {
				this.matrix_array[row].push(M.matrix_array[row][col]);
			}
		}
		this.column_length += M.column_length;
		this._clearCash();
		return this;
	};

	/**
		 * Combine matrix to the bottom of this matrix. (mutable)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - Matrix to combine.
		 * @returns {Matrix} Matrix after function processing. (this)
		 * @private
		 */
	Matrix.prototype._concatBottom = function _concatBottom (bottom_matrix) {
		var M = Matrix._toMatrix(bottom_matrix);
		if(this.column_length != M.column_length) {
			throw "_concatBottom";
		}
		for(var row = 0; row < M.row_length; row++) {
			this.matrix_array.push(M.matrix_array[row]);
		}
		this.row_length += M.row_length;
		this._clearCash();
		return this;
	};

	/**
		 * Combine matrix to the right of this matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - Matrix to combine.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.concatRight = function concatRight (left_matrix) {
		return this.clone()._concatRight(left_matrix);
	};

	/**
		 * Combine matrix to the bottom of this matrix.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - Matrix to combine.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.concatBottom = function concatBottom (bottom_matrix) {
		return this.clone()._concatBottom(bottom_matrix);
	};

	/**
		 * Clip each element of matrix to specified range.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} min 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} max 
		 * @returns {Matrix} min(max(x, min), max)
		 */
	Matrix.prototype.clip = function clip (min, max) {
		var MIN = Matrix._toMatrix(min);
		var MAX = Matrix._toMatrix(max);
		var x_min = MIN.matrix_array;
		var x_max = MAX.matrix_array;
		return this.cloneMatrixDoEachCalculation(
			function(num, row, col) {
				var d_min = x_min[row % MIN.row_length][col % MIN.column_length];
				var d_max = x_max[row % MAX.row_length][col % MAX.column_length];
				return num.clip(d_min, d_max);
			}
		);
	};

	/**
		 * Create row vector with specified initial value, step value, end condition.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} start_or_stop 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [stop]
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [step=1] 
		 * @returns {Matrix}
		 */
	Matrix.arange = function arange (start_or_stop, stop, step) {
		var from  = stop !== undefined ? Matrix._toComplex(start_or_stop) : Complex.ZERO;
		var to    = stop !== undefined ? Matrix._toComplex(stop) : Matrix._toComplex(start_or_stop);
		var delta = step !== undefined ? Matrix._toComplex(step) : Complex.ONE;
		return new Matrix(MatrixTool.InterpolationCalculation(from, delta, to, false));
	};

	/**
		 * Circular shift.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size 
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.circshift = function circshift (shift_size, type) {
		var shift = Matrix._toInteger(shift_size);
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var y = new Array(data.length);
			var from = ((- shift % data.length) + data.length) % data.length;
			for(var i = 0; i < data.length; i++) {
				y[i] = data[from++];
				if(from === data.length) {
					from = 0;
				}
			}
			return y;
		};
		return this.eachVector(main, dim);
	};

	/**
		 * Circular shift.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size 
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.roll = function roll (shift_size, type) {
		return this.circshift(shift_size, type);
	};

	/**
		 * Change the shape of the matrix.
		 * The number of elements in the matrix doesn't increase or decrease.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - Number of rows of matrix to reshape.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - Number of columns of matrix to reshape.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.reshape = function reshape (row_length, column_length) {
		var new_row_length = Matrix._toInteger(row_length);
		var new_column_length = Matrix._toInteger(column_length);
		var this_size = this.row_length * this.column_length;
		var new_size = new_row_length * new_column_length;
		if(this_size !== new_size) {
			throw "reshape error. (this_size !== new_size)->(" + this_size + " !== " + new_size + ")";
		}
		var m = this.matrix_array;
		var m_col = 0;
		var m_row = 0;
		var y = new Array(new_row_length);
		for(var row = 0; row < new_row_length; row++) {
			y[row] = new Array(new_column_length);
			for(var col = 0; col < new_column_length; col++) {
				y[row][col] = m[m_row][m_col];
				m_col++;
				if(m_col === this.column_length) {
					m_col = 0;
					m_row++;
				}
			}
		}
		return new Matrix(y);
	};

	/**
		 * Flip this matrix left and right.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.fliplr = function fliplr () {
		return this.flip({dimension : "row"});
	};

	/**
		 * Flip this matrix up and down.
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.flipud = function flipud () {
		return this.flip({dimension : "column"});
	};

	/**
		 * Flip this matrix.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.flip = function flip (type) {
		var dim = !(type && type.dimension) ? "auto" : type.dimension;
		var main = function(data) {
			var y = new Array(data.length);
			for(var i = 0, j = data.length - 1; i < data.length; i++, j--) {
				y[i] = data[j];
			}
			return y;
		};
		return this.eachVector(main, dim);
	};

	/**
		 * Index sort.
		 * - Sorts by row when setting index by row vector to the argument.
		 * - Sorts by column when setting index by column vector to the argument.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - Vector with index. (See the description of this function)
		 * @returns {Matrix} Matrix after function processing.
		 */
	Matrix.prototype.indexsort = function indexsort (v) {
		var V = Matrix._toMatrix(v);
		if(V.isMatrix()) {
			throw "argsort error. argsort is not vector. (" + V.toOneLineString + ")";
		}
		var is_transpose = false;
		var target_array = null;
		var index_array = null;
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
		var sort_data = new Array(index_array.length);
		for(var i = 0; i < index_array.length; i++) {
			sort_data[i] = {
				index : index_array[i],
				data : target_array[i]
			};
		}
		// 比較関数を作成
		var compare = function(a, b) {
			return a.index.compareTo(b.index);
		};
		{
			var temp = [];
			// ソート関数（安定マージソート）
			var sort = function(elements, first, last, cmp_function) { 
				if(first < last) {
					var middle = Math.floor((first + last) / 2);
					sort(elements, first, middle, cmp_function);
					sort(elements, middle + 1, last, cmp_function);
					var p = 0, i, j, k;
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
		var y = new Array(index_array.length);
		for(var i$1 = 0; i$1 < index_array.length; i$1++) {
			y[i$1] = sort_data[i$1].data;
		}
		// 行列を作成する
		var Y = new Matrix(y);
		if(!is_transpose) {
			return Y;
		}
		else {
			return Y.transpose();
		}
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// 行列の一般計算
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Transpose a matrix.
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.transpose = function transpose () {
		var y = new Array(this.column_length);
		for(var col = 0; col < this.column_length; col++) {
			y[col] = new Array(this.row_length);
			for(var row = 0; row < this.row_length; row++) {
				y[col][row] = this.matrix_array[row][col];
			}
		}
		return new Matrix(y);
	};

	/**
		 * Hermitian transpose.
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.ctranspose = function ctranspose () {
		return this.transpose().conj();
	};

	/**
		 * Hermitian transpose.
		 * @returns {Matrix} A^T
		 */
	Matrix.prototype.T = function T () {
		return this.ctranspose();
	};

	/**
		 * Inner product/Dot product.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number 
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
		 * @returns {Matrix} A・B
		 */
	Matrix.prototype.inner = function inner (number, dimension) {
			if ( dimension === void 0 ) dimension=1;

		return LinearAlgebra.inner(this, number, dimension);
	};
		
	/**
		 * LUP decomposition.
		 * - P'*L*U=A
		 * - P is permutation matrix.
		 * - L is lower triangular matrix.
		 * - U is upper triangular matrix.
		 * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
		 */
	Matrix.prototype.lup = function lup () {
		return LinearAlgebra.lup(this);
	};

	/**
		 * LU decomposition.
		 * - L*U=A
		 * - L is lower triangular matrix.
		 * - U is upper triangular matrix.
		 * @returns {{L: Matrix, U: Matrix}} {L, U}
		 */
	Matrix.prototype.lu = function lu () {
		return LinearAlgebra.lu(this);
	};

	/**
		 * Solving a system of linear equations to be Ax = B
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
		 * @returns {Matrix} x
		 */
	Matrix.prototype.linsolve = function linsolve (number) {
		return LinearAlgebra.linsolve(this, number);
	};

	/**
		 * QR decomposition.
		 * - Q*R=A
		 * - Q is orthonormal matrix.
		 * - R is upper triangular matrix.
		 * @returns {{Q: Matrix, R: Matrix}} {Q, R}
		 */
	Matrix.prototype.qr = function qr () {
		return LinearAlgebra.qr(this);
	};

	/**
		 * Tridiagonalization of symmetric matrix.
		 * - Don't support complex numbers.
		 * - P*H*P'=A
		 * - P is orthonormal matrix.
		 * - H is tridiagonal matrix.
		 * - The eigenvalues of H match the eigenvalues of A.
		 * @returns {{P: Matrix, H: Matrix}} {P, H}
		 */
	Matrix.prototype.tridiagonalize = function tridiagonalize () {
		return LinearAlgebra.tridiagonalize(this);
	};

	/**
		 * Eigendecomposition of symmetric matrix.
		 * - Don't support complex numbers.
		 * - V*D*V'=A.
		 * - V is orthonormal matrix. and columns of V are the right eigenvectors.
		 * - D is a matrix containing the eigenvalues on the diagonal component.
		 * @returns {{V: Matrix, D: Matrix}} {D, V}
		 */
	Matrix.prototype.eig = function eig () {
		return LinearAlgebra.eig(this);
	};

	/**
		 * Singular Value Decomposition (SVD).
		 * - U*S*V'=A
		 * - U and V are orthonormal matrices.
		 * - S is a matrix with singular values in the diagonal.
		 * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
		 */
	Matrix.prototype.svd = function svd () {
		return LinearAlgebra.svd(this);
	};

	/**
		 * Inverse matrix of this matrix.
		 * @returns {Matrix} A^-1
		 */
	Matrix.prototype.inv = function inv () {
		return LinearAlgebra.inv(this);
	};

	/**
		 * Pseudo-inverse matrix.
		 * @returns {Matrix} A^+
		 */
	Matrix.prototype.pinv = function pinv () {
		return LinearAlgebra.pinv(this);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// probability 確率計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Log-gamma function.
		 * @returns {Matrix}
		 */
	Matrix.prototype.gammaln = function gammaln () {
		return Probability.gammaln(this);
	};

	/**
		 * Gamma function.
		 * @returns {Matrix}
		 */
	Matrix.prototype.gamma = function gamma () {
		return Probability.gamma(this);
	};

	/**
		 * Incomplete gamma function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Matrix}
		 */
	Matrix.prototype.gammainc = function gammainc (a, tail) {
		return Probability.gammainc(this, a, tail);
	};

	/**
		 * Probability density function (PDF) of the gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Matrix.prototype.gampdf = function gampdf (k, s) {
		return Probability.gampdf(this, k, s);
	};

	/**
		 * Cumulative distribution function (CDF) of gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Matrix.prototype.gamcdf = function gamcdf (k, s) {
		return Probability.gampdf(this, k, s);
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of gamma distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
		 * @returns {Matrix}
		 */
	Matrix.prototype.gaminv = function gaminv (k, s) {
		return Probability.gaminv(this, k, s);
	};

	/**
		 * Beta function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
		 * @returns {Matrix}
		 */
	Matrix.prototype.beta = function beta (y) {
		return Probability.beta(this, y);
	};
		
	/**
		 * Incomplete beta function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @param {string} [tail="lower"] - lower (default) , "upper"
		 * @returns {Matrix}
		 */
	Matrix.prototype.betainc = function betainc (a, b, tail) {
		return Probability.betainc(this, a, b, tail);
	};

	/**
		 * Cumulative distribution function (CDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betacdf = function betacdf (a, b) {
		return Probability.betacdf(this, a, b);
	};

	/**
		 * Probability density function (PDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betapdf = function betapdf (a, b) {
		return Probability.betapdf(this, a, b);
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of beta distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
		 * @returns {Matrix}
		 */
	Matrix.prototype.betainv = function betainv (a, b) {
		return Probability.betainv(this, a, b);
	};

	/**
		 * Factorial function, x!.
		 * @returns {Matrix}
		 */
	Matrix.prototype.factorial = function factorial () {
		return Probability.factorial(this);
	};
		
	/**
		 * Binomial coefficient, number of all combinations, nCk.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
		 * @returns {Matrix}
		 */
	Matrix.prototype.nchoosek = function nchoosek (k) {
		return Probability.nchoosek(this, k);
	};
		
	/**
		 * Error function.
		 * @returns {Matrix}
		 */
	Matrix.prototype.erf = function erf () {
		return Probability.erf(this);
	};

	/**
		 * Complementary error function.
		 * @returns {Matrix}
		 */
	Matrix.prototype.erfc = function erfc () {
		return Probability.erfc(this);
	};
		
	/**
		 * Probability density function (PDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Matrix.prototype.normpdf = function normpdf (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Probability.normpdf(this, u, s);
	};

	/**
		 * Cumulative distribution function (CDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Matrix.prototype.normcdf = function normcdf (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Probability.normcdf(this, u, s);
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of normal distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
		 * @returns {Matrix}
		 */
	Matrix.prototype.norminv = function norminv (u, s) {
			if ( u === void 0 ) u=0.0;
			if ( s === void 0 ) s=1.0;

		return Probability.norminv(this, u, s);
	};

	/**
		 * Probability density function (PDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tpdf = function tpdf (v) {
		return Probability.tpdf(this, v);
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tcdf = function tcdf (v) {
		return Probability.tcdf(this, v);
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tinv = function tinv (v) {
		return Probability.tinv(this, v);
	};

	/**
		 * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
		 * - If tails = 1, TDIST returns the one-tailed distribution.
		 * - If tails = 2, TDIST returns the two-tailed distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tdist = function tdist (v, tails) {
		return Probability.tdist(this, v, tails);
	};

	/**
		 * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.tinv2 = function tinv2 (v) {
		return Probability.tinv2(this, v);
	};

	/**
		 * Probability density function (PDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2pdf = function chi2pdf (k) {
		return Probability.chi2pdf(this, k);
	};

	/**
		 * Cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2cdf = function chi2cdf (k) {
		return Probability.chi2cdf(this, k);
	};
		
	/**
		 * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
		 * @returns {Matrix}
		 */
	Matrix.prototype.chi2inv = function chi2inv (k) {
		return Probability.chi2inv(this, k);
	};

	/**
		 * Probability density function (PDF) of F-distribution.
		 * - In the argument, specify the degree of freedom of ratio of two variables according to chi-square distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Matrix.prototype.fpdf = function fpdf (d1, d2) {
		return Probability.fpdf(this, d1, d2);
	};

	/**
		 * Cumulative distribution function (CDF) of F-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Matrix.prototype.fcdf = function fcdf (d1, d2) {
		return Probability.fcdf(this, d1, d2);
	};

	/**
		 * Inverse function of cumulative distribution function (CDF) of F-distribution.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
		 * @returns {Matrix}
		 */
	Matrix.prototype.finv = function finv (d1, d2) {
		return Probability.finv(this, d1, d2);
	};
		
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// statistics 統計計算用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Maximum number.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} max([A, B])
		 */
	Matrix.prototype.max = function max (type) {
		return Statistics.max(this, type);
	};
		
	/**
		 * Minimum number.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} min([A, B])
		 */
	Matrix.prototype.min = function min (type) {
		return Statistics.min(this, type);
	};
		
	/**
		 * Sum.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.sum = function sum (type) {
		return Statistics.sum(this, type);
	};

	/**
		 * Arithmetic average.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mean = function mean (type) {
		return Statistics.mean(this, type);
	};

	/**
		 * Product of array elements.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.prod = function prod (type) {
		return Statistics.prod(this, type);
	};

	/**
		 * Geometric mean.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.geomean = function geomean (type) {
		return Statistics.geomean(this, type);
	};

	/**
		 * Median.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.median = function median (type) {
		return Statistics.median(this, type);
	};

	/**
		 * Mode.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mode = function mode (type) {
		return Statistics.mode(this, type);
	};

	/**
		 * Moment.
		 * - Moment of order n. Equivalent to the definition of variance at 2.
		 * @param {number} nth_order
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.moment = function moment (nth_order, type) {
		return Statistics.moment(this, nth_order, type);
	};

	/**
		 * Variance.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.var = function var$1 (type) {
		return Statistics.var(this, type);
	};

	/**
		 * Standard deviation.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.std = function std (type) {
		return Statistics.std(this, type);
	};

	/**
		 * Mean absolute deviation.
		 * - The "algorithm" can choose "0/mean"(default) and "1/median".
		 * @param {?string|?number} [algorithm]
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.mad = function mad (algorithm, type) {
		return Statistics.mad(this, algorithm, type);
	};

	/**
		 * Skewness.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.skewness = function skewness (type) {
		return Statistics.skewness(this, type);
	};

	/**
		 * Covariance matrix.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.cov = function cov (type) {
		return Statistics.cov(this, type);
	};

	/**
		 * The samples are normalized to a mean value of 0, standard deviation of 1.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.normalize = function normalize (type) {
		return Statistics.normalize(this, type);
	};

	/**
		 * Correlation matrix.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.corrcoef = function corrcoef (type) {
		return Statistics.corrcoef(this, type);
	};

	/**
		 * Sort.
		 * - The "order" can choose "ascend"(default) and "descend".
		 * @param {string} [order]
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.sort = function sort (order, type) {
		return Statistics.sort(this, order, type);
	};

	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆
	// signal 信号処理用
	// ◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆

	/**
		 * Discrete Fourier transform (DFT).
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} fft(x)
		 */
	Matrix.prototype.fft = function fft (type) {
		return Signal.fft(this, type);
	};

	/**
		 * Inverse discrete Fourier transform (IDFT).
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} ifft(x)
		 */
	Matrix.prototype.ifft = function ifft (type) {
		return Signal.ifft(this, type);
	};

	/**
		 * Power spectral density.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} abs(fft(x)).^2
		 */
	Matrix.prototype.powerfft = function powerfft (type) {
		return Signal.powerfft(this, type);
	};

	/**
		 * Discrete cosine transform (DCT-II, DCT).
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} dct(x)
		 */
	Matrix.prototype.dct = function dct (type) {
		return Signal.dct(this, type);
	};

	/**
		 * Inverse discrete cosine transform (DCT-III, IDCT).
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix} idct(x)
		 */
	Matrix.prototype.idct = function idct (type) {
		return Signal.idct(this, type);
	};

	/**
		 * Discrete two-dimensional Fourier transform (2D DFT).
		 * @returns {Matrix}
		 */
	Matrix.prototype.fft2 = function fft2 () {
		return Signal.fft2(this);
	};

	/**
		 * Inverse discrete two-dimensional Fourier transform (2D IDFT).
		 * @returns {Matrix}
		 */
	Matrix.prototype.ifft2 = function ifft2 () {
		return Signal.ifft2(this);
	};

	/**
		 * Discrete two-dimensional cosine transform (2D DCT).
		 * @returns {Matrix}
		 */
	Matrix.prototype.dct2 = function dct2 () {
		return Signal.dct2(this);
	};

	/**
		 * Inverse discrete two-dimensional cosine transform (2D IDCT).
		 * @returns {Matrix}
		 */
	Matrix.prototype.idct2 = function idct2 () {
		return Signal.idct2(this);
	};

	/**
		 * Convolution integral, Polynomial multiplication.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
		 * @returns {Matrix}
		 */
	Matrix.prototype.conv = function conv (number) {
		return Signal.conv(this, number);
	};

	/**
		 * ACF(Autocorrelation function), cros-correlation function.
		 * - If the argument is omitted, it is calculated by the autocorrelation function.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [number] - Matrix to calculate the correlation.
		 * @returns {Matrix}
		 */
	Matrix.prototype.xcorr = function xcorr (number) {
		return Signal.xcorr(this, number);
	};

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
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Matrix.window = function window (name, size, periodic) {
		return Signal.window(name, size, periodic);
	};

	/**
		 * Hann (Hanning) window.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Matrix.hann = function hann (size, periodic) {
		return Signal.hann(size, periodic);
	};
		
	/**
		 * Hamming window.
		 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
		 * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
		 * @returns {Matrix} Column vector.
		 */
	Matrix.hamming = function hamming (size, periodic) {
		return Signal.hamming(size, periodic);
	};
		
	/**
		 * FFT shift.
		 * Circular shift beginning at the center of the signal.
		 * @param {MatrixSettings} [type]
		 * @returns {Matrix}
		 */
	Matrix.prototype.fftshift = function fftshift (type) {
		return Signal.fftshift(this, type);
	};

	Object.defineProperties( Matrix.prototype, prototypeAccessors$3 );

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Random number generation class used within Complex.
	 * @type {Random}
	 * @ignore
	 */
	var random_class = new Random();

	/**
	 * Collection of functions used in Complex.
	 * @ignore
	 */
	var ComplexTool = function ComplexTool () {};

	ComplexTool.ToComplexFromString = function ToComplexFromString (text) {
		var str = text.replace(/\s/g, "").toLowerCase();
		str = str.replace(/infinity|inf/g, "1e100000");
		// 複素数の宣言がない場合
		if(!(/[ij]/.test(str))) {
			return {
				real : parseFloat(str),
				imag : 0.0
			};
		}
		// この時点で複素数である。
		// 以下真面目に調査
		var re = 0;
		var im = 0;
		var buff;
		// 最後が$なら右側が実数、最後が[+-]なら左側が実数
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))($|[+-])/);
		if(buff) {
			re = parseFloat(buff[0]);
		}
		// 複素数は数値が省略される場合がある
		buff = str.match(/[+-]?(([0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)?)|(nan))?[ij]/);
		if(buff) {
			buff = buff[0].substring(0, buff[0].length - 1);
			// i, +i, -j のように実数部がなく、数値もない場合
			if((/^[-+]$/.test(buff)) || buff.length === 0) {
				im = buff === "-" ? -1 : 1;
			}
			else {
				im = parseFloat(buff);
			}
		}
		return {
			real : re,
			imag : im
		};
	};

	/**
	 * Complex number class. (immutable)
	 */
	var Complex = function Complex(number) {
		// 行列で使うためイミュータブルは必ず守ること。
		if(arguments.length === 1) {
			var obj = number;
			if(obj instanceof Complex) {
					
				/**
					 * The real part of this Comlex.
					 * @private
					 * @type {number}
					 */
				this._re = obj._re;
					
				/**
					 * The imaginary part of this Comlex.
					 * @private
					 * @type {number}
					 */
				this._im = obj._im;
			}
			else if(typeof obj === "number") {
				this._re = obj;
				this._im = 0.0;
			}
			else if(obj instanceof Array) {
				if(obj.length === 2) {
					this._re = obj[0];
					this._im = obj[1];
				}
				else {
					throw "Complex Unsupported argument " + arguments;
				}
			}
			else if(typeof obj === "string") {
				var x = ComplexTool.ToComplexFromString(obj);
				this._re = x.real;
				this._im = x.imag;
			}
			else if((obj instanceof Object) && (typeof obj._re === "number") && (typeof obj._im === "number")) {
				this._re = obj._re;
				this._im = obj._im;
			}
			else if((number instanceof Object) && (number.doubleValue)) {
				this._re = number.doubleValue;
				this._im = 0.0;
			}
			else if(obj instanceof Object) {
				var x$1 = ComplexTool.ToComplexFromString(obj.toString());
				this._re = x$1.real;
				this._im = x$1.imag;
			}
			else {
				throw "Complex Unsupported argument " + arguments;
			}
		}
		else {
			throw "Complex Many arguments : " + arguments.length;
		}
	};

	var prototypeAccessors$4 = { intValue: { configurable: true },doubleValue: { configurable: true },real: { configurable: true },imag: { configurable: true },norm: { configurable: true },arg: { configurable: true } };
	var staticAccessors$5 = { ONE: { configurable: true },TWO: { configurable: true },TEN: { configurable: true },ZERO: { configurable: true },MINUS_ONE: { configurable: true },I: { configurable: true },PI: { configurable: true },E: { configurable: true },LN2: { configurable: true },LN10: { configurable: true },LOG2E: { configurable: true },LOG10E: { configurable: true },SQRT2: { configurable: true },SQRT1_2: { configurable: true },HALF: { configurable: true },POSITIVE_INFINITY: { configurable: true },NEGATIVE_INFINITY: { configurable: true },NaN: { configurable: true } };

	/**
		 * Create an entity object of this class.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex}
		 */
	Complex.create = function create (number) {
		if(number instanceof Complex) {
			return number;
		}
		else {
			return new Complex(number);
		}
	};
		
	/**
		 * Convert number to Complex type.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex}
		 */
	Complex.valueOf = function valueOf (number) {
		return Complex.create(number);
	};
		
	/**
		 * Convert to Complex.
		 * If type conversion is unnecessary, return the value as it is.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {Complex}
		 * @private
		 */
	Complex._toComplex = function _toComplex (number) {
		if(number instanceof Complex) {
			return number;
		}
		else if(number instanceof Matrix) {
			return Matrix._toComplex(number);
		}
		else {
			return new Complex(number);
		}
	};

	/**
		 * Convert to real number.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Complex._toDouble = function _toDouble (number) {
		if(typeof number === "number") {
			return number;
		}
		var complex_number = Complex._toComplex(number);
		if(complex_number.isReal()) {
			return complex_number.real;
		}
		else {
			throw "not support complex numbers.[" + number + "]";
		}
	};

	/**
		 * Convert to integer.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {number}
		 * @private
		 */
	Complex._toInteger = function _toInteger (number) {
		return Math.trunc(Complex._toDouble(number));
	};

	/**
		 * integer value.
		 * @returns {number}
		 */
	prototypeAccessors$4.intValue.get = function () {
		return Math.trunc(this.real);
	};

	/**
		 * floating point.
		 * @returns {number}
		 */
	prototypeAccessors$4.doubleValue.get = function () {
		return this.real;
	};

	/**
		 * Deep copy.
		 * @returns {Complex} 
		 */
	Complex.prototype.clone = function clone () {
		return this;
	};

	/**
		 * Convert to string.
		 * @returns {string} 
		 */
	Complex.prototype.toString = function toString () {
		var formatG = function(x) {
			var numstr = x.toPrecision(6);
			if(numstr.indexOf(".") !== -1) {
				numstr = numstr.replace(/\.?0+$/, "");  // 1.00 , 1.10
				numstr = numstr.replace(/\.?0+e/, "e"); // 1.0e , 1.10e
			}
			else if(/inf/i.test(numstr)) {
				if(x === Number.POSITIVE_INFINITY) {
					return "Inf";
				}
				else {
					return "-Inf";
				}
			}
			else if(/nan/i.test(numstr)) {
				return "NaN";
			}
			return numstr;
		};
		if(!this.isReal()) {
			if(this._re === 0) {
				return formatG(this._im) + "i";
			}
			else if((this._im >= 0) || (Number.isNaN(this._im))) {
				return formatG(this._re) + " + " + formatG(this._im) + "i";
			}
			else {
				return formatG(this._re) + " - " + formatG(-this._im) + "i";
			}
		}
		else {
			return formatG(this._re);
		}
	};
		
	/**
		 * Create random values with uniform random numbers.
		 * @returns {Complex}
		 */
	Complex.rand = function rand () {
		return new Complex(random_class.nextDouble());
	};

	/**
		 * Create random values with normal distribution.
		 * @returns {Complex}
		 */
	Complex.randn = function randn () {
		return new Complex(random_class.nextGaussian());
	};

	/**
		 * The real part of this Comlex.
		 * @returns {number} real(A)
		 */
	prototypeAccessors$4.real.get = function () {
		return this._re;
	};
		
	/**
		 * The imaginary part of this Comlex.
		 * @returns {number} imag(A)
		 */
	prototypeAccessors$4.imag.get = function () {
		return this._im;
	};

	/**
		 * norm.
		 * @returns {number} |A|
		 */
	prototypeAccessors$4.norm.get = function () {
		if(this._im === 0) {
			return Math.abs(this._re);
		}
		else if(this._re === 0) {
			return Math.abs(this._im);
		}
		else {
			return Math.sqrt(this._re * this._re + this._im * this._im);
		}
	};

	/**
		 * The argument of this complex number.
		 * @returns {number} arg(A)
		 */
	prototypeAccessors$4.arg.get = function () {
		if(this._im === 0) {
			return this._re >= 0 ? 0 : Math.PI;
		}
		else if(this._re === 0) {
			return Math.PI * (this._im >= 0.0 ? 0.5 : -0.5);
		}
		else {
			return Math.atan2(this._im, this._re);
		}
	};

	/**
		 * Return number of decimal places for real and imaginary parts.
		 * - Used to make a string.
		 * @returns {number} Number of decimal places.
		 */
	Complex.prototype.getDecimalPosition = function getDecimalPosition () {
		var getDecimal = function(x) {
			if(!Number.isFinite(x)) {
				return 0;
			}
			var a = x;
			var point = 0;
			for(var i = 0; i < 20; i++) {
				if(Math.abs(a - Math.round(a)) <= Number.EPSILON) {
					break;
				}
				a *= 10;
				point++;
			}
			return point;
		};
		return Math.max( getDecimal(this.real), getDecimal(this.imag) );
	};

	/**
		 * The positive or negative sign of this number.
		 * - +1 if positive, -1 if negative, 0 if 0.
		 * @returns {Complex} 
		 */
	Complex.prototype.sign = function sign () {
		if(this._im === 0) {
			if(this._re === 0) {
				return new Complex(0);
			}
			else {
				return new Complex(this._re > 0 ? 1 : -1);
			}
		}
		return this.div(this.norm);
	};
		
	// ----------------------
	// 四則演算
	// ----------------------
		
	/**
		 * Add.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number 
		 * @returns {Complex} A + B
		 */
	Complex.prototype.add = function add (number) {
		var x = new Complex(number);
		x._re = this._re + x._re;
		x._im = this._im + x._im;
		return x;
	};

	/**
		 * Subtract.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A - B
		 */
	Complex.prototype.sub = function sub (number) {
		var x = new Complex(number);
		x._re = this._re - x._re;
		x._im = this._im - x._im;
		return x;
	};

	/**
		 * Multiply.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A * B
		 */
	Complex.prototype.mul = function mul (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = - this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re - this._im * x._im;
			var im = this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	};
		
	/**
		 * Inner product/Dot product.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A * conj(B)
		 */
	Complex.prototype.dot = function dot (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re * x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im * x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re + this._im * x._im;
			var im = - this._im * x._re + this._re * x._im;
			x._re = re;
			x._im = im;
			return x;
		}
	};
		
	/**
		 * Divide.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} A / B
		 */
	Complex.prototype.div = function div (number) {
		var x = new Complex(number);
		if((this._im === 0) && (x._im === 0)) {
			x._re = this._re / x._re;
			return x;
		}
		else if((this._re === 0) && (x._re === 0)) {
			x._re = this._im / x._im;
			x._im = 0;
			return x;
		}
		else {
			var re = this._re * x._re + this._im * x._im;
			var im = this._im * x._re - this._re * x._im;
			var denominator = 1.0 / (x._re * x._re + x._im * x._im);
			x._re = re * denominator;
			x._im = im * denominator;
			return x;
		}
	};

	/**
		 * Modulo, positive remainder of division.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - Divided value (real number only).
		 * @returns {Complex} A mod B
		 */
	Complex.prototype.mod = function mod (number) {
		var x = new Complex(number);
		if((this._im !== 0) || (x._im !== 0)) {
			throw "calculation method is undefined.";
		}
		var _re = this._re - x._re * (0 | (this._re / x._re));
		if(_re < 0) {
			_re += x._re;
		}
		x._re = _re;
		return x;
	};

	/**
		 * Inverse number of this value.
		 * @returns {Complex} 1 / A
		 */
	Complex.prototype.inv = function inv () {
		if(this._im === 0) {
			return new Complex(1.0 / this._re);
		}
		else if(this._re === 0) {
			return new Complex([0, - 1.0 / this._im]);
		}
		return Complex.ONE.div(this);
	};

	// ----------------------
	// 比較
	// ----------------------
		
	/**
		 * Equals.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} A === B
		 */
	Complex.prototype.equals = function equals (number, tolerance) {
		var x = Complex._toComplex(number);
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		// 無限大、非数の値も含めて一度確認
		if((this._re === x._re) && (this._im === x._im)) {
			return true;
		}
		// 誤差を含んだ値の比較
		return (Math.abs(this._re - x._re) <  tolerance_) && (Math.abs(this._im - x._im) < tolerance_);
	};

	/**
		 * Compare values.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
		 */
	Complex.prototype.compareTo = function compareTo (number, tolerance) {
		var x1 = this;
		var x2 = Complex._toComplex(number);
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		var a = x1.real + x1.imag;
		var b = x2.real + x2.imag;
		if((Math.abs(a - b) <= tolerance_)) {
			return 0;
		}
		return a > b ? 1 : -1;
	};
		
	/**
		 * Maximum number.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} max([A, B])
		 */
	Complex.prototype.max = function max (number) {
		var x = Complex._toComplex(number);
		if(this.compareTo(x) >= 0) {
			return this;
		}
		else {
			return x;
		}
	};

	/**
		 * Minimum number.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} min([A, B])
		 */
	Complex.prototype.min = function min (number) {
		var x = Complex._toComplex(number);
		if(this.compareTo(x) <= 0) {
			return this;
		}
		else {
			return x;
		}
	};

	/**
		 * Clip number within range.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} min 
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} max
		 * @returns {Complex} min(max(x, min), max)
		 */
	Complex.prototype.clip = function clip (min, max) {
		var min_ = Complex._toComplex(min);
		var max_ = Complex._toComplex(max);
		var arg_check = min_.compareTo(max_);
		if(arg_check === 1) {
			throw "clip(min, max) error. (min > max)->(" + min_ + " > " + max_ + ")";
		}
		else if(arg_check === 0) {
			return min_;
		}
		if(this.compareTo(max_) === 1) {
			return max_;
		}
		else if(this.compareTo(min_) === -1) {
			return min_;
		}
		return this;
	};

	// ----------------------
	// テスト系
	// ----------------------
		
	/**
		 * Return true if the value is integer.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean}
		 */
	Complex.prototype.isInteger = function isInteger (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return this.isReal() && (Math.abs(this._re - Math.trunc(this._re)) < tolerance_);
	};

	/**
		 * Returns true if the vallue is complex integer (including normal integer).
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} real(A) === integer && imag(A) === integer
		 */
	Complex.prototype.isComplexInteger = function isComplexInteger (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		// 複素整数
		return (Math.abs(this._re - Math.trunc(this._re)) < tolerance_) &&
				(Math.abs(this._im - Math.trunc(this._im)) < tolerance_);
	};

	/**
		 * this === 0
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} A === 0
		 */
	Complex.prototype.isZero = function isZero (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re) < tolerance_) && (Math.abs(this._im) < tolerance_);
	};

	/**
		 * this === 1
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} A === 1
		 */
	Complex.prototype.isOne = function isOne (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._re - 1.0) < tolerance_) && (Math.abs(this._im) < tolerance_);
	};

	/**
		 * Returns true if the vallue is complex number (imaginary part is not 0).
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} imag(A) !== 0
		 */
	Complex.prototype.isComplex = function isComplex (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) >= tolerance_);
	};
		
	/**
		 * Return true if the value is real number.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
		 * @returns {boolean} imag(A) === 0
		 */
	Complex.prototype.isReal = function isReal (tolerance) {
		var tolerance_ = tolerance ? Complex._toDouble(tolerance) : Number.EPSILON;
		return (Math.abs(this._im) < tolerance_);
	};

	/**
		 * this === NaN
		 * @returns {boolean} isNaN(A)
		 */
	Complex.prototype.isNaN = function isNaN$1 () {
		return isNaN(this._re) || isNaN(this._im);
	};

	/**
		 * Return true if this real part of the complex positive.
		 * @returns {boolean} real(x) > 0
		 */
	Complex.prototype.isPositive = function isPositive () {
		// Number.EPSILONは使用しない。どちらにぶれるか不明な点及び
		// わずかな負の数だった場合に、sqrtでエラーが発生するため
		return 0.0 < this._re;
	};

	/**
		 * real(this) < 0
		 * @returns {boolean} real(x) < 0
		 */
	Complex.prototype.isNegative = function isNegative () {
		return 0.0 > this._re;
	};

	/**
		 * real(this) >= 0
		 * @returns {boolean} real(x) >= 0
		 */
	Complex.prototype.isNotNegative = function isNotNegative () {
		return 0.0 <= this._re;
	};

	/**
		 * this === Infinity
		 * @returns {boolean} isInfinite(A)
		 */
	Complex.prototype.isInfinite = function isInfinite () {
		return (this._re === Number.POSITIVE_INFINITY) ||
				(this._im === Number.POSITIVE_INFINITY) ||
				(this._re === Number.NEGATIVE_INFINITY) ||
				(this._im === Number.NEGATIVE_INFINITY);
	};
		
	/**
		 * Return true if the value is finite number.
		 * @returns {boolean} !isNaN(A) && !isInfinite(A)
		 */
	Complex.prototype.isFinite = function isFinite () {
		return !this.isNaN() && !this.isInfinite();
	};

	// ----------------------
	// 複素数
	// ----------------------
		
	/**
		 * Absolute value.
		 * @returns {Complex} abs(A)
		 */
	Complex.prototype.abs = function abs () {
		return new Complex(this.norm);
	};

	/**
		 * Complex conjugate.
		 * @returns {Complex} real(A) - imag(A)j
		 */
	Complex.prototype.conj = function conj () {
		if(this._im === 0) {
			return this;
		}
		// 共役複素数
		return new Complex([this._re, -this._im]);
	};

	/**
		 * this * -1
		 * @returns {Complex} -A
		 */
	Complex.prototype.negate = function negate () {
		return new Complex([-this._re, -this._im]);
	};

	// ----------------------
	// 指数
	// ----------------------
		
	/**
		 * Power function.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
		 * @returns {Complex} pow(A, B)
		 */
	Complex.prototype.pow = function pow (number) {
		var A = this;
		var B = new Complex(number);
		// -2 ^ 0.5 ... 複素数
		// -2 ^ 1   ... 実数
		//  2 ^ 0.5 ... 実数
		if(B.isReal()) {
			if(A.isReal() && (A.isNotNegative() || B.isInteger())) {
				B._re = Math.pow(A._re, B._re);
				return B;
			}
			else {
				var r = Math.pow(A.norm, B._re);
				var s = A.arg * B._re;
				B._re = r * Math.cos(s);
				B._im = r * Math.sin(s);
				return B;
			}
		}
		else {
			return B.mul(A.log()).exp();
		}
	};

	/**
		 * Square.
		 * @returns {Complex} pow(A, 2)
		 */
	Complex.prototype.square = function square () {
		if(this._im === 0.0) {
			return new Complex(this._re * this._re);
		}
		return this.mul(this);
	};

	/**
		 * Square root.
		 * @returns {Complex} sqrt(A)
		 */
	Complex.prototype.sqrt = function sqrt () {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(Math.sqrt(this._re));
			}
			else {
				return new Complex([0, Math.sqrt(-this._re)]);
			}
		}
		var r = Math.sqrt(this.norm);
		var s = this.arg * 0.5;
		return new Complex([r * Math.cos(s), r * Math.sin(s)]);
	};

	/**
		 * Reciprocal square root.
		 * @returns {Complex} rsqrt(A)
		 */
	Complex.prototype.rsqrt = function rsqrt () {
		if(this.isReal()) {
			if(this.isNotNegative()) {
				return new Complex(1.0 / Math.sqrt(this._re));
			}
			else {
				return new Complex([0, - 1.0 / Math.sqrt(-this._re)]);
			}
		}
		return this.sqrt().inv();
	};

	/**
		 * Logarithmic function.
		 * @returns {Complex} log(A)
		 */
	Complex.prototype.log = function log () {
		if(this.isReal() && this.isNotNegative()) {
			return new Complex(Math.log(this._re));
		}
		// 負の値が入っているか、もともと複素数が入っている場合は、複素対数関数
		return new Complex([Math.log(this.norm), this.arg]);
	};

	/**
		 * Exponential function.
		 * @returns {Complex} exp(A)
		 */
	Complex.prototype.exp = function exp () {
		if(this.isReal()) {
			return new Complex(Math.exp(this._re));
		}
		// 複素指数関数
		var r = Math.exp(this._re);
		return new Complex([r * Math.cos(this._im), r * Math.sin(this._im)]);
	};

	// ----------------------
	// 三角関数
	// ----------------------
		
	/**
		 * Sine function.
		 * @returns {Complex} sin(A)
		 */
	Complex.prototype.sin = function sin () {
		if(this.isReal()) {
			return new Complex(Math.sin(this._re));
		}
		// オイラーの公式より
		// sin x = (e^ix - e^-ex) / 2i
		var a = this.mul(Complex.I).exp();
		var b = this.mul(Complex.I.negate()).exp();
		return a.sub(b).div([0, 2]);
	};

	/**
		 * Cosine function.
		 * @returns {Complex} cos(A)
		 */
	Complex.prototype.cos = function cos () {
		if(this.isReal()) {
			return new Complex(Math.cos(this._re));
		}
		// オイラーの公式より
		// cos x = (e^ix + e^-ex) / 2
		var a = this.mul(Complex.I).exp();
		var b = this.mul(Complex.I.negate()).exp();
		return a.add(b).div(2);
	};

	/**
		 * Tangent function.
		 * @returns {Complex} tan(A)
		 */
	Complex.prototype.tan = function tan () {
		if(this.isReal()) {
			return new Complex(Math.tan(this._re));
		}
		// 三角関数の相互関係 tan x = sin x / cos x
		return this.sin().div(this.cos());
	};

	/**
		 * Atan (arc tangent) function.
		 * - Return the values of [-PI/2, PI/2].
		 * @returns {Complex} atan(A)
		 */
	Complex.prototype.atan = function atan () {
		if(this.isReal()) {
			return new Complex(Math.atan(this._re));
		}
		// 逆正接 tan-1 x = i/2 log( i+x / i-x )
		return Complex.I.div(Complex.TWO).mul(Complex.I.add(this).div(Complex.I.sub(this)).log());
	};

	/**
		 * Atan (arc tangent) function.
		 * Return the values of [-PI, PI] .
		 * Supports only real numbers.
		 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - X
		 * @returns {Complex} atan2(Y, X)
		 */
	Complex.prototype.atan2 = function atan2 (number) {
		if(arguments.length === 0) {
			return new Complex(this.arg);
		}
		// y.atan2(x) とする。
		var y = this;
		var x = Complex._toComplex(number);
		if(y.isReal() && x.isReal()) {
			return new Complex(Math.atan2(y._re, x._re));
		}
		// 複素数のatan2は未定義である（実装不可能）
		throw "calculation method is undefined.";
	};
		
	// ----------------------
	// 信号処理系
	// ----------------------
		
	/**
		 * Normalized sinc function.
		 * @returns {Complex} sinc(A)
		 */
	Complex.prototype.sinc = function sinc () {
		if(this.isReal()) {
			if(this._re === 0) {
				return(Complex.ONE);
			}
			var x$1 = Math.PI * this._re;
			return new Complex(Math.sin(x$1) / x$1);
		}
		var x = this.mul(Complex.PI);
		return new Complex( x.sin().div(x) );
	};

	// ----------------------
	// 丸め
	// ----------------------
		
	/**
		 * Floor.
		 * @returns {Complex} floor(A)
		 */
	Complex.prototype.floor = function floor () {
		return new Complex([Math.floor(this._re), Math.floor(this._im)]);
	};

	/**
		 * Ceil.
		 * @returns {Complex} ceil(A)
		 */
	Complex.prototype.ceil = function ceil () {
		return new Complex([Math.ceil(this._re), Math.ceil(this._im)]);
	};
		
	/**
		 * Rounding to the nearest integer.
		 * @returns {Complex} round(A)
		 */
	Complex.prototype.round = function round () {
		return new Complex([Math.round(this._re), Math.round(this._im)]);
	};

	/**
		 * To integer rounded down to the nearest.
		 * @returns {Complex} fix(A), trunc(A)
		 */
	Complex.prototype.fix = function fix () {
		return new Complex([Math.trunc(this._re), Math.trunc(this._im)]);
	};

	/**
		 * Fraction.
		 * @returns {Complex} fract(A)
		 */
	Complex.prototype.fract = function fract () {
		return new Complex([this._re - Math.floor(this._re), this._im - Math.floor(this._im)]);
	};

	// ----------------------
	// 定数
	// ----------------------
		
	/**
		 * 1
		 * @returns {Complex} 1
		 */
	staticAccessors$5.ONE.get = function () {
		return DEFINE$4.ONE;
	};
		
	/**
		 * 2
		 * @returns {Complex} 2
		 */
	staticAccessors$5.TWO.get = function () {
		return DEFINE$4.TWO;
	};
		
	/**
		 * 10
		 * @returns {Complex} 10
		 */
	staticAccessors$5.TEN.get = function () {
		return DEFINE$4.TEN;
	};
		
	/**
		 * 0
		 * @returns {Complex} 0
		 */
	staticAccessors$5.ZERO.get = function () {
		return DEFINE$4.ZERO;
	};

	/**
		 * -1
		 * @returns {Complex} -1
		 */
	staticAccessors$5.MINUS_ONE.get = function () {
		return DEFINE$4.MINUS_ONE;
	};

	/**
		 * i, j
		 * @returns {Complex} i
		 */
	staticAccessors$5.I.get = function () {
		return DEFINE$4.I;
	};

	/**
		 * Pi.
		 * @returns {Complex} 3.14...
		 */
	staticAccessors$5.PI.get = function () {
		return DEFINE$4.PI;
	};

	/**
		 * E, Napier's constant.
		 * @returns {Complex} 2.71...
		 */
	staticAccessors$5.E.get = function () {
		return DEFINE$4.E;
	};

	/**
		 * log_e(2)
		 * @returns {Complex} ln(2)
		 */
	staticAccessors$5.LN2.get = function () {
		return DEFINE$4.LN2;
	};

	/**
		 * log_e(10)
		 * @returns {Complex} ln(10)
		 */
	staticAccessors$5.LN10.get = function () {
		return DEFINE$4.LN10;
	};

	/**
		 * log_2(e)
		 * @returns {Complex} log_2(e)
		 */
	staticAccessors$5.LOG2E.get = function () {
		return DEFINE$4.LOG2E;
	};
		
	/**
		 * log_10(e)
		 * @returns {Complex} log_10(e)
		 */
	staticAccessors$5.LOG10E.get = function () {
		return DEFINE$4.LOG10E;
	};
		
	/**
		 * sqrt(2)
		 * @returns {Complex} sqrt(2)
		 */
	staticAccessors$5.SQRT2.get = function () {
		return DEFINE$4.SQRT2;
	};
		
	/**
		 * sqrt(0.5)
		 * @returns {Complex} sqrt(0.5)
		 */
	staticAccessors$5.SQRT1_2.get = function () {
		return DEFINE$4.SQRT1_2;
	};
		
	/**
		 * 0.5
		 * @returns {Complex} 0.5
		 */
	staticAccessors$5.HALF.get = function () {
		return DEFINE$4.HALF;
	};

	/**
		 * Positive infinity.
		 * @returns {Complex} Infinity
		 */
	staticAccessors$5.POSITIVE_INFINITY.get = function () {
		return DEFINE$4.POSITIVE_INFINITY;
	};
		
	/**
		 * Negative Infinity.
		 * @returns {Complex} -Infinity
		 */
	staticAccessors$5.NEGATIVE_INFINITY.get = function () {
		return DEFINE$4.NEGATIVE_INFINITY;
	};

	/**
		 * Not a Number.
		 * @returns {Complex} NaN
		 */
	staticAccessors$5.NaN.get = function () {
		return DEFINE$4.NaN;
	};

	Object.defineProperties( Complex.prototype, prototypeAccessors$4 );
	Object.defineProperties( Complex, staticAccessors$5 );

	/**
	 * Collection of constant values used in the class.
	 * @ignore
	 */
	var DEFINE$4 = {

		/**
		 * 0
		 */
		ZERO : new Complex(0),

		/**
		 * 1
		 */
		ONE : new Complex(1),

		/**
		 * 2
		 */
		TWO : new Complex(2),

		/**
		 * 10
		 */
		TEN : new Complex(10),

		/**
		 * -1
		 */
		MINUS_ONE : new Complex(-1),

		/**
		 * i, j
		 */
		I : new Complex([0, 1]),

		/**
		 * Pi.
		 */
		PI : new Complex(Math.PI),

		/**
		 * E, Napier's constant.
		 */
		E : new Complex(Math.E),

		/**
		 * log_e(2)
		 */
		LN2 : new Complex(Math.LN2),

		/**
		 * log_e(10)
		 */
		LN10 : new Complex(Math.LN10),

		/**
		 * log_2(e)
		 */
		LOG2E : new Complex(Math.LOG2E),

		/**
		 * log_10(e)
		 */
		LOG10E : new Complex(Math.LOG10E),

		/**
		 * sqrt(2)
		 */
		SQRT2 : new Complex(Math.SQRT2),

		/**
		 * sqrt(0.5)
		 */
		SQRT1_2 : new Complex(Math.SQRT1_2),

		/**
		 * 0.5
		 */
		HALF : new Complex(0.5),

		/**
		 * Positive infinity.
		 */
		POSITIVE_INFINITY : new Complex(Number.POSITIVE_INFINITY),

		/**
		 * Negative Infinity.
		 */
		NEGATIVE_INFINITY : new Complex(Number.NEGATIVE_INFINITY),

		/**
		 * Not a Number.
		 */
		NaN : new Complex(Number.NaN)
	};

	/**
	 * The script is part of konpeito.
	 * 
	 * AUTHOR:
	 *  natade (http://twitter.com/natadea)
	 * 
	 * LICENSE:
	 *  The MIT license https://opensource.org/licenses/MIT
	 */

	/**
	 * Class collection of numerical calculation processing.
	 * These classes are classified into a BigInteger, BigDecimal, Fraction, Matrix.
	 * - BigInteger is a calculation class for arbitrary-precision integer arithmetic.
	 * - BigDecimal is a calculation class for arbitrary-precision floating point arithmetic.
	 * - Fraction is a calculation class for fractions with infinite precision.
	 * - Matrix is a general-purpose calculation class with signal processing and statistical processing.
	 */
	var konpeito = function konpeito () {};

	var staticAccessors$6 = { BigInteger: { configurable: true },BigDecimal: { configurable: true },RoundingMode: { configurable: true },MathContext: { configurable: true },Fraction: { configurable: true },Complex: { configurable: true },Matrix: { configurable: true },Random: { configurable: true } };

	staticAccessors$6.BigInteger.get = function () {
		return BigInteger;
	};

	/**
		 * Return typedef BigDecimal for arbitrary-precision floating-point number.
		 * @returns {typeof BigDecimal}
		 */
	staticAccessors$6.BigDecimal.get = function () {
		return BigDecimal;
	};

	/**
		 * Return Rounding class for BigDecimal.
		 * @returns {typeof RoundingMode}
		 */
	staticAccessors$6.RoundingMode.get = function () {
		return RoundingMode;
	};

	/**
		 * Return Configuration class for BigDecimal.
		 * @returns {typeof MathContext}
		 */
	staticAccessors$6.MathContext.get = function () {
		return MathContext;
	};

	/**
		 * Return typedef Fraction for infinite precision arithmetic.
		 * @returns {typeof Fraction}
		 */
	staticAccessors$6.Fraction.get = function () {
		return Fraction;
	};

	/**
		 * Return typedef Complex for complex number calculation.
		 * @returns {typeof Complex}
		 */
	staticAccessors$6.Complex.get = function () {
		return Complex;
	};

	/**
		 * Return typedef Matrix for complex matrix calculation.
		 * @returns {typeof Matrix}
		 */
	staticAccessors$6.Matrix.get = function () {
		return Matrix;
	};

	/**
		 * Return typedef Random.
		 * @returns {typeof Random}
		 */
	staticAccessors$6.Random.get = function () {
		return Random;
	};

	Object.defineProperties( konpeito, staticAccessors$6 );

	return konpeito;

}));
