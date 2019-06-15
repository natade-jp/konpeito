/* global test, expect */

import Signal from "./Signal.mjs";
import Matrix from "../Matrix.mjs";
const $ = Matrix.create;

let test_count = 0;

const testOperator1  = function(operator, x1, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const cy = Signal[operator](x1);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const x2_str = (typeof x2 === "object") ? JSON.stringify(x2) : x2.toString();
	const cy = Signal[operator](x1, x2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2_str + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x1, x2, x3, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const cy = Signal[operator](x1, x2, x3);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2 + "," + x3 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};


{
	test_count = 0;
	testOperator1("fft", "[1]", "[1]");
	testOperator1("fft", "[1 2]", "[3 -1]");
	testOperator1("fft", "[1 2 3]", "[6 -1.5 + 0.8660i -1.5 - 0.8660i]");
	testOperator1("fft", "[4 3 2 1]", "[10 +  0i    2 -  2i    2 +  0i    2 +  2i]");
}

{
	test_count = 0;
	testOperator1("fft", "[2 + j]", "[2 + j]");
	testOperator1("fft", "[1 + j 4 - 2j]", "[5 - j -3 + 3j]");
	testOperator1("fft", "[1 + j 4 - 2j 2 + 3j]", "[7.0000 + 2.0000i  -6.3301 - 1.2321i   2.3301 + 2.2321i]");
	testOperator1("fft", "[1 + j 4 - 2j 2 + 3j 2j]", "[7 + 4i  -5 - 6i  -1 + 4i   3 + 2i]");
}

{
	test_count = 0;
	const testIFFT = function(x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const Y = X.fft().ifft();
		const Y_str = Y.toOneLineString();
		const name = "ifft " + test_count++ + " " + x + ".fft().iff()=" + Y_str;
		test(name, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testIFFT("[1]");
	testIFFT("[1 2]");
	testIFFT("[1 2 3]");
	testIFFT("[4 3 2 1]");
	testIFFT("[2 + j]");
	testIFFT("[1 + j 4 - 2j]");
	testIFFT("[1 + j 4 - 2j 2 + 3j]");
	testIFFT("[1 + j 4 - 2j 2 + 3j 2j]");
}

{
	test_count = 0;
	testOperator1("powerfft", "[1 + j 4 - 2j 2 + 3j]", "[53.000 41.588 10.412]");
}

{
	test_count = 0;
	testOperator1("dct", "[1]", "[1]");
	testOperator1("dct", "[1 2]", "[2.12132  -0.70711]");
	testOperator1("dct", "[1 2 3]", "[3.46410  -1.41421   0.00000]");
	testOperator1("dct", "[4 3 2 1]", "[5.00000   2.23044   0.00000   0.15851]");
}

{
	test_count = 0;
	const testIDCT = function(x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const Y = X.dct().idct();
		const Y_str = Y.toOneLineString();
		const name = "idct " + test_count++ + " " + x + ".dct().idct()=" + Y_str;
		test(name, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testIDCT("[1]");
	testIDCT("[1 2]");
	testIDCT("[1 2 3]");
	testIDCT("[4 3 2 1]");
}

{
	test_count = 0;
	testOperator2("conv", "[1 2 3 4]", "[1 2 3 4]", "[1 4 10 20 25 24 16]");
	testOperator2("conv", "[1 2 3 4]", "[1 2 3 5]", "[1 4 10 21 27 27 20]");
	testOperator2("conv", "[1 2 3 4]", "[5 4 3 2 1]", "[5 14 26 40 30 20 11 4]");
	testOperator2("conv", "[1 2 3+3j 4 5]", "[1 2 3+3j 4 5]", "[1, 4, 10 + 6i, 20 + 12i, 26 + 18i, 44 + 24i, 46 + 30i, 40, 25]");
	testOperator2("conv", "[1 2 3+3j 4 5]", "[5 6 7+3j 8 9]", "[5, 16, 34 + 18i, 60 + 24i, 86 + 30i, 100 + 36i, 94 + 42i, 76, 45]");
}

{
	test_count = 0;
	testOperator2("xcorr", "[1 2 3 4]", "[1 2 3 4]", "[4 11 20 30 20 11 4]");
	testOperator2("xcorr", "[1 2 3 4]", "[1 2 3 5]", "[5 13 23 34 20 11 4]");
	testOperator2("xcorr", "[1 2 3 4]", "[5 4 3 2 1]", "[1 4 10 20 30 34 31 20 0]");
	testOperator2("xcorr", "[1 2]", "[5 4 3 2 1]", "[1 4 7 10 13 10 0 0 0]");
	testOperator2("xcorr", "[5 4 3 2]", "[6 7]", "[0 0 35 58 45 32 12]");
	testOperator2("xcorr", "[1 2 3+3j 4 5]", "[1 2 3+3j 4 5]", "[5, 14, 26 + 12i, 40 + 6i, 64, 40 - 6i, 26 - 12i, 14, 5]");
	testOperator2("xcorr", "[1 2 3+3j 4 5]", "[5 6 7+3j 8 9]", "[9, 26, 50 + 24i, 80 + 18i, 124 + 12i, 96 + 6i, 74, 50, 25]");
}

{
	test_count = 0;
	testOperator3("window", "hann", "4", "symmetric", "[0; 0.75; 0.75; 0]");
	testOperator3("window", "hann", "4", "periodic", "[0; 0.5; 1.0; 0.5]");
	testOperator3("window", "hann", "5", "symmetric", "[0; 0.5; 1.0; 0.5; 0.0]");
	testOperator3("window", "hann", "5", "periodic", "[0; 0.3455; 0.9045; 0.9045; 0.3455]");
	testOperator2("window", "rectangle", "5", "[1; 1; 1; 1; 1]");
	testOperator2("window", "hann", "5", "[0; 0.5; 1.0; 0.5; 0.0]");
	testOperator2("window", "hamming", "5", "[0.08; 0.54; 1.00; 0.54; 0.08]");
	testOperator2("window", "blackman", "5", "[0; 0.34; 1.00; 0.34; 0]");
	testOperator2("window", "blackmanharris", "5", "[0; 0.21747; 1.00; 0.21747; 0]");
	testOperator2("window", "blackmannuttall", "5", "[0.00036; 0.22698; 1.00; 0.22698; 0.00036]");
	testOperator2("window", "flattop", "5", "[0.004; -0.258; 4.64; -0.258; 0.004]");
	testOperator2("window", "sin", "10", "[ 0; 0.34202; 0.642788; 0.866025; 0.984808; 0.984808; 0.866025; 0.642788; 0.34202; 0 ]");
	testOperator2("window", "vorbis", "10", "[ 0; 0.182716; 0.604402; 0.92388; 0.998878; 0.998878; 0.92388; 0.604402; 0.182716; 0 ]");
}

{
	test_count = 0;
	testOperator1("hann", "5", "[0; 0.5; 1.0; 0.5; 0.0]");
}

{
	test_count = 0;
	testOperator1("hamming", "5", "[0.08; 0.54; 1.00; 0.54; 0.08]");
}



