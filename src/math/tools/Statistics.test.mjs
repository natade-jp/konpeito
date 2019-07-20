/* global test, expect */

import Statistics from "./Statistics.mjs";
import Matrix from "../Matrix.mjs";
const $ = Matrix.create;

let test_count = 0;

const testOperator1  = function(operator, x1, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.001;
	const cy = Statistics[operator](x1);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.001;
	const x2_str = (typeof x2 === "object") ? JSON.stringify(x2) : x2.toString();
	const cy = Statistics[operator](x1, x2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2_str + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x1, x2, x3, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.001;
	const cy = Statistics[operator](x1, x2, x3);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2 + "," + x3 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

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
	const testNormalize = function(x, type, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const Y = X.normalize(type).std(type);
		const Y_str = Y.toOneLineString();
		const name = "normalize " + test_count + " ";
		test(name + "std(normalize(" + x + "," + JSON.stringify(type) + ")) = " + Y_str, () => { expect(Y.equals(1.0, tolerance_)).toBe(true); });
	};
	testNormalize("[1.0, 1.2, 1.3]", {correction : 0});
	testNormalize("[1.0, 1.2, 1.3]", {correction : 1});
}

{
	test_count = 0;
	testOperator2("sort", "[4 5 2 3]", "ascend", "[2 3 4 5]");
	testOperator2("sort", "[4 5 2 3]", "descend", "[5 4 3 2]");
}
