import Random from "./Random.js";

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testNextInt = function(init_data) {
	/**
	 * @param {number} x 
	 */
	const testRandom = function(x) {
		const random = new Random(init_data);
		for(let i = 0; i < 1000; i++) {
			if(x <= random.nextInt(x)) {
				return false;
			}
		}
		return true;
	};
	let result = true;
	result = result && testRandom(10);
	result = result && testRandom(100);
	result = result && testRandom(1000);
	result = result && testRandom(10000);
	result = result && testRandom(100000);
	result = result && testRandom(658119067);
	return result;
};

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testRandom1 = function(init_data) {
	const r = new Random(init_data);
	const myfunc = function() {
		let isCheck1 = false;
		let isCheck2 = false;
		for(let i = 0; i < 1000; i++) {
			const x = r.nextDouble();
			if((x < 0) || (1 <= x)) {
				return false;
			}
			if(x < 0.5) {
				isCheck1 = true;
			}
			else {
				isCheck2 = true;
			}
		}
		return isCheck1 || isCheck2;
	};
	return myfunc();
};

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testRandom2 = function(init_data) {
	const r = new Random(init_data);
	const myfunc = function() {
		let isCheck1 = false;
		let isCheck2 = false;
		for(let i = 0; i < 1000; i++) {
			const x = r.nextInt(10);
			if((x < 0) || (10 <= x)) {
				return false;
			}
			if(x < 5) {
				isCheck1 = true;
			}
			else {
				isCheck2 = true;
			}
		}
		return isCheck1 || isCheck2;
	};
	return myfunc();
};

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testRandom3 = function(init_data) {
	const r = new Random(init_data);
	const myfunc = function() {
		const loop = 1 << 18;
		let sum = 0;
		for(let i = 0; i < loop; i++) {
			sum += r.nextDouble();
		}
		const average = sum / loop;
		return 0.49 < average && average < 0.51;
	};
	return myfunc();
};

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testRandom4 = function(init_data) {
	const r = new Random(init_data);
	const myfunc = function() {
		let min = 1;
		let max = -1;
		for(let i = 0; i < 1000; ++i){
			r.setSeed(i);
			const x = r.nextDouble();
			if(x > max) max = x;
			if(x < min) min = x;
		}
		return min < 0.01 && 0.99 < max;
	};
	return myfunc();
};

/**
 * @param {number|{seed : number, algorithm : string}} [init_data]
 */
const testGaussian = function(init_data) {
	const r = new Random(init_data);
	const myfunc = function() {
		const loop = 1 << 10;
		let sum1 = 0;
		let sum2 = 0;
		for(let i = 0; i < loop; i++) {
			const x = r.nextGaussian();
			sum1 += x;
			sum2 += x * x;
		}
		const average = sum1 / loop;
		const sigma2  = sum2 / loop;
		return (-0.1 < average && average < 0.1) && (0.9 < sigma2 && sigma2 < 1.1);
	};
	let x = true;
	for(let i = 0; i < 10; i++) {
		x = x && myfunc();
	}
	return x;
};

test("XORSHIFT nextInt", ()		=> { expect(testNextInt({seed : 0, algorithm : "xorshift"})).toBe(true); });
test("XORSHIFT Random 1", ()	=> { expect(testRandom1({seed : 0, algorithm : "xorshift"})).toBe(true); });
test("XORSHIFT Random 2", ()	=> { expect(testRandom2({seed : 0, algorithm : "xorshift"})).toBe(true); });
test("XORSHIFT Random 3", ()	=> { expect(testRandom3({seed : 0, algorithm : "xorshift"})).toBe(true); });
test("XORSHIFT Random 4", ()	=> { expect(testRandom4({seed : 0, algorithm : "xorshift"})).toBe(true); });
test("XORSHIFT Gaussian", ()	=> { expect(testGaussian({seed : 0, algorithm : "xorshift"})).toBe(true); });

test("MLS nextInt", ()		=> { expect(testNextInt({seed : 0, algorithm : "MLS"})).toBe(true); });
test("MLS Random 1", ()	=> { expect(testRandom1({seed : 0, algorithm : "MLS"})).toBe(true); });
test("MLS Random 2", ()	=> { expect(testRandom2({seed : 0, algorithm : "MLS"})).toBe(true); });
test("MLS Random 3", ()	=> { expect(testRandom3({seed : 0, algorithm : "MLS"})).toBe(true); });
test("MLS Random 4", ()	=> { expect(testRandom4({seed : 0, algorithm : "MLS"})).toBe(true); });
test("MLS Gaussian", ()	=> { expect(testGaussian({seed : 0, algorithm : "MLS"})).toBe(true); });

