/* global test, expect */

import Random from "./Random.mjs";

test("Random 1", () => {
	expect((new Random(0)).nextInt()).toBe(658119067);
});

test("Random 2", () => {
	const r = new Random(0);
	const myfunc = function() {
		let isCheck1 = false;
		let isCheck2 = false;
		for(let i = 0; i < 100; i++) {
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
	expect(myfunc()).toBe(true);
});

test("Random 3", () => {
	const r = new Random(0);
	const myfunc = function() {
		let isCheck1 = false;
		let isCheck2 = false;
		for(let i = 0; i < 100; i++) {
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
	expect(myfunc()).toBe(true);
});

test("Random 4", () => {
	const r = new Random(0);
	const myfunc = function() {
		const loop = 1 << 18;
		let sum = 0;
		for(let i = 0; i < loop; i++) {
			sum += r.nextDouble();
		}
		const average = sum / loop;
		return 0.49 < average && average < 0.51;
	};
	expect(myfunc()).toBe(true);
});

test("Random 5", () => {
	const r = new Random(0);
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
	expect(myfunc()).toBe(true);
});

test("Random 6", () => {
	const r = new Random(0);
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
	expect(x === true).toBe(true);
});
