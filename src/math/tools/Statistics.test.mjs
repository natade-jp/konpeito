/* global test, expect */

import Statistics from "./Statistics.mjs";
import Matrix from "../Matrix.mjs";
const $ = Matrix.create;

let test_count = 0;

const testOperator1  = function(operator, x1, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const cy = Statistics[operator](x1);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const x2_str = (typeof x2 === "object") ? JSON.stringify(x2) : x2.toString();
	const cy = Statistics[operator](x1, x2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2_str + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x1, x2, x3, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.001;
	const cy = Statistics[operator](x1, x2, x3);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2 + "," + x3 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testOperator1("gammaln", 0, Infinity);
	testOperator1("gammaln", 0.1, 2.2527);
	testOperator1("gammaln", 0.5, 0.57236);
	testOperator1("gammaln", 0.9, 0.066376);
	testOperator1("gammaln", 1, 0);
}

{
	test_count = 0;
	testOperator1("gamma", 0, Infinity);
	testOperator1("gamma", 0.1, 9.5135);
	testOperator1("gamma", 0.5, 1.7725);
	testOperator1("gamma", 0.9, 1.0686);
	testOperator1("gamma", 1, 1);
}

{
	test_count = 0;
	testOperator2("gammainc", 1, 1, 0.63212);
	testOperator2("gammainc", 1, 2, 0.26424);
	testOperator2("gammainc", 0.5, 1, 0.39347);
	testOperator2("gammainc", 0.5, 2, 0.090204);
}

{
	test_count = 0;
	testOperator3("gampdf", 1, 2, 3, 0.079615);
	testOperator3("gampdf", 2, 3, 4, 0.018954);
}

{
	test_count = 0;
	testOperator3("gamcdf", 1, 2, 3, 0.044625);
	testOperator3("gamcdf", 2, 3, 4, 0.014388);
}

{
	test_count = 0;
	testOperator3("gaminv", 0, 1, 2, 0);
	testOperator3("gaminv", 0.5, 2, 3, 5.0350);
	testOperator3("gaminv", 0.9, 3, 4, 21.289);
	testOperator3("gaminv", 1, 4, 5, Infinity);
}

{
	test_count = 0;
	testOperator2("beta", 0, 1, Infinity);
	testOperator2("beta", 1, 2, 0.50000);
	testOperator2("beta", 3, 4, 0.016667);
}

{
	test_count = 0;
	testOperator3("betainc", 0, 1, 1, 0);
	testOperator3("betainc", 0.1, 2, 3, 0.052300);
	testOperator3("betainc", 0.2, 3, 4, 0.098880);
	testOperator3("betainc", 1, 5, 5, 1);
}

{
	test_count = 0;
	testOperator3("betapdf", 0, 1, 1, 1);
	testOperator3("betapdf", 0.1, 2, 3, 0.97200);
	testOperator3("betapdf", 0.2, 3, 4, 1.2288);
	testOperator3("betapdf", 1, 5, 5, 0);
}

{
	test_count = 0;
	testOperator3("betacdf", 0, 1, 1, 0);
	testOperator3("betacdf", 0.1, 2, 3, 0.052300);
	testOperator3("betacdf", 0.2, 3, 4, 0.098880);
	testOperator3("betacdf", 1, 5, 5, 1);
}

{
	test_count = 0;
	testOperator3("betainv", 0, 1, 1, 0);
	testOperator3("betainv", 0.1, 2, 3, 0.14256);
	testOperator3("betainv", 0.2, 3, 4, 0.26865);
	testOperator3("betainv", 1, 5, 5, 1);
}

{
	test_count = 0;
	testOperator1("factorial", 0, 1);
	testOperator1("factorial", 1, 1);
	testOperator1("factorial", 2, 2);
	testOperator1("factorial", 3, 6);
}

{
	test_count = 0;
	testOperator2("nchoosek", 3, 2, 3);
	testOperator2("nchoosek", 10, 4, 210);
}

{
	test_count = 0;
	testOperator1("erf", 0.0, 0);
	testOperator1("erf", 0.5, 0.52050);
	testOperator1("erf", 1.0, 0.84270);
}

{
	test_count = 0;
	testOperator1("erfc", 0.0, 1);
	testOperator1("erfc", 0.5, 0.47950);
	testOperator1("erfc", 1.0, 0.15730);
}

{
	test_count = 0;
	testOperator3("normpdf", 1.0, 0.0, 1.0, 0.24197);
	testOperator3("normpdf", 1.5, 0.5, 1.5, 0.21297);
	testOperator3("normpdf", 0.5, 1.0, 2.0, 0.19333);
}

{
	test_count = 0;
	testOperator3("normcdf", 0.0,-1.0, 1.0, 0.84134);
	testOperator3("normcdf", 0.5, 1.0, 2.0, 0.40129);
	testOperator3("normcdf", 0.8,-0.5, 1.5, 0.80694);
}

{
	test_count = 0;
	testOperator3("norminv", 0.0,-1.0, 1.0, Number.NEGATIVE_INFINITY);
	testOperator3("norminv", 0.3, 0.2, 0.8, -0.21952);
	testOperator3("norminv", 0.8,-0.5, 1.5, 0.76243);
	testOperator3("norminv", 1.0, 0.0, 1.0, Number.POSITIVE_INFINITY);
}

{
	test_count = 0;
	testOperator2("tpdf", 0.0, 2, 0.35355);
	testOperator2("tpdf", 0.2, 4, 0.36579);
	testOperator2("tpdf", 0.8, 10, 0.27663);
	testOperator2("tpdf", 1.0, 20, 0.23605);
}

{
	test_count = 0;
	testOperator2("tcdf", 0.0, 2, 0.50000);
	testOperator2("tcdf", 0.2, 4, 0.57438);
	testOperator2("tcdf", 0.8, 10, 0.77885);
	testOperator2("tcdf", 1.0, 20, 0.83537);
}

{
	test_count = 0;
	testOperator2("tinv", 0.0, 2, Number.NEGATIVE_INFINITY);
	testOperator2("tinv", 0.2, 4, -0.94096);
	testOperator2("tinv", 0.8, 10, 0.87906);
	testOperator2("tinv", 1.0, 20, Number.POSITIVE_INFINITY);
}

{
	test_count = 0;
	testOperator3("tdist", 0.0, 2, 1, 0.500000000);
	testOperator3("tdist", 0.1, 2, 1, 0.464732719);
	testOperator3("tdist", 0.5, 4, 1, 0.321664982);
	testOperator3("tdist", 0.8, 20, 1, 0.216555439);
	testOperator3("tdist", 1.0, 40, 1, 0.161660906);
	testOperator3("tdist", 0.0, 2, 2, 1.000000000);
	testOperator3("tdist", 0.1, 2, 2, 0.929465438);
	testOperator3("tdist", 0.5, 4, 2, 0.643329963);
	testOperator3("tdist", 0.8, 20, 2, 0.433110878);
	testOperator3("tdist", 1.0, 40, 2, 0.323321812);
}

{
	test_count = 0;
	testOperator2("tinv2", 0.0, 2, Number.POSITIVE_INFINITY);
	testOperator2("tinv2", 0.1, 2,  2.91998558);
	testOperator2("tinv2", 0.5, 4,  0.740697084);
	testOperator2("tinv2", 0.8, 20, 0.256742754);
	testOperator2("tinv2", 1.0, 40, 0);
}

{
	test_count = 0;
	testOperator2("chi2pdf", 0.0, 2, 0.50000);
	testOperator2("chi2pdf", 0.1, 2,  0.47561);
	testOperator2("chi2pdf", 0.5, 4,  0.097350);
	testOperator2("chi2pdf", 0.8, 20, 2.4212e-010);
	testOperator2("chi2pdf", 40, 40, 0.044418);
}

{
	test_count = 0;
	testOperator2("chi2cdf", 0.0, 2, 0.00000);
	testOperator2("chi2cdf", 0.1, 2, 0.048771);
	testOperator2("chi2cdf", 0.5, 4, 0.026499);
	testOperator2("chi2cdf", 0.8, 3, 0.15053);
	testOperator2("chi2cdf", 1.2, 3, 0.24700);
}

{
	test_count = 0;
	testOperator2("chi2inv", 0.0, 2, 0.00000);
	testOperator2("chi2inv", 0.1, 2, 0.21072);
	testOperator2("chi2inv", 0.5, 4, 3.3567);
	testOperator2("chi2inv", 0.8, 3, 4.6416);
	testOperator2("chi2inv", 1.0, 3, Number.POSITIVE_INFINITY);
}

{
	test_count = 0;
	testOperator3("fpdf", 0.0, 2, 3, 0.0);
	testOperator3("fpdf", 0.1, 9, 20, 0.025138);
	testOperator3("fpdf", 0.5, 7, 14, 0.71071);
	testOperator3("fpdf", 0.8, 5, 17, 0.63885);
	testOperator3("fpdf", 1.0, 2, 3, 0.27885);
}

{
	test_count = 0;
	testOperator3("fcdf", 0.0, 2, 3, 0.0);
	testOperator3("fcdf", 0.1, 1, 10, 0.24167);
	testOperator3("fcdf", 0.5, 2, 12, 0.38138);
	testOperator3("fcdf", 0.8, 5, 17, 0.43517);
	testOperator3("fcdf", 1.0, 2, 3, 0.53524);
}

{
	test_count = 0;
	testOperator3("finv", 0.0, 2, 3, 0.0);
	testOperator3("finv", 0.1, 1, 10, 0.016613);
	testOperator3("finv", 0.5, 2, 12, 0.73477);
	testOperator3("finv", 0.8, 5, 17, 1.6524);
	testOperator3("finv", 1.0, 2, 3, Number.POSITIVE_INFINITY);
}

{
	test_count = 0;
	testOperator1("max", 4, 4);
	testOperator1("max", "[1 2 3]", 3);
}

{
	test_count = 0;
	testOperator1("min", 4, 4);
	testOperator1("min", "[1 2 3]", 1);
}

{
	test_count = 0;
	testOperator1("sum", 4, 4);
	testOperator1("sum", "[1 2 3]", 6);
}

{
	test_count = 0;
	testOperator1("mean", 4, 4);
	testOperator1("mean", "[1 2 6]", 3);
}

{
	test_count = 0;
	testOperator1("prod", 4, 4);
	testOperator1("prod", "[1 2 6]", 12);
}

{
	test_count = 0;
	testOperator1("geomean", 4, 4);
	testOperator1("geomean", "[1 2 6]", 2.2894);
}

{
	test_count = 0;
	testOperator1("median", 4, 4);
	testOperator1("median", "[1 2 6]", 2);
	testOperator1("median", "[1 2 6 6]", 4);
	testOperator1("median", "[6 6 1 2]", 4);
}

{
	test_count = 0;
	testOperator1("mode", 4, 4);
	testOperator1("mode", "[1 1 2 6]", 1);
	testOperator1("mode", "[6 2 2 1]", 2);
	testOperator1("mode", "[2 1 6 6]", 6);
}

{
	test_count = 0;
	testOperator2("moment", "[3 29 12 32]", 1, 0);
	testOperator2("moment", "[3 29 12 32]", 2, 143.50);
	testOperator2("moment", "[3 29 12 32]", 3, -310.50);
}

{
	test_count = 0;
	testOperator2("var", "[3]", {correction : 0}, 0);
	testOperator2("var", "[3]", {correction : 1}, 0);
	testOperator2("var", "[3 29 12 32]", {correction : 0}, 191.3333, 0.1);
	testOperator2("var", "[3 29 12 32]", {correction : 1}, 143.50, 0.1);
}

{
	test_count = 0;
	testOperator2("std", "[3]", {correction : 0}, 0);
	testOperator2("std", "[3]", {correction : 1}, 0);
	testOperator2("std", "[3 29 12 32]", {correction : 0}, 13.832, 0.1);
	testOperator2("std", "[3 29 12 32]", {correction : 1}, 11.979, 0.1);
}

{
	test_count = 0;
	testOperator1("mad", "[3]", 0);
	testOperator1("mad", "[3 29 12 32]", 11.500, 0.1);
	testOperator2("mad", "[3]", "median", 0);
	testOperator2("mad", "[3 29 12 32]", "median", 10.000, 0.1);
}

{
	test_count = 0;
	testOperator2("skewness", "[3 29 12 32]", {correction : 0}, -0.31286);
	testOperator2("skewness", "[3 29 12 32]", {correction : 1}, -0.18063);
}

{
	test_count = 0;
	testOperator2("cov", "[2 1 -1 2;0 4 -2 0;1 1 2 1]", {correction : 0}, "[1 -1.5 0.5 1;-1.50 3 -2.5 -1.5;0.50 -2.5 4.33 0.5;1 -1.5 0.5 1]", 0.1);
	testOperator2("cov", "[2 1 -1 2;0 4 -2 0;1 1 2 1]", {correction : 1}, "[0.66 -1 0.33 0.66;-1 2 -1.66 -1;0.33 -1.66 2.88 0.33;0.66 -1 0.33 0.66]", 0.1);
}

{
	test_count = 0;
	const testNormalize = function(x, type, epsilon) {
		test_count++;
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const Y = X.normalize(type).std(type);
		const Y_str = Y.toOneLineString();
		const name = "normalize " + test_count + " ";
		test(name + "std(normalize(" + x + "," + JSON.stringify(type) + ")) = " + Y_str, () => { expect(Y.equals(1.0, tolerance)).toBe(true); });
	};
	testNormalize("[1.0, 1.2, 1.3]", {correction : 0});
	testNormalize("[1.0, 1.2, 1.3]", {correction : 1});
}

{
	test_count = 0;
	testOperator2("sort", "[4 5 2 3]", "ascend", "[2 3 4 5]");
	testOperator2("sort", "[4 5 2 3]", "descend", "[5 4 3 2]");
}
