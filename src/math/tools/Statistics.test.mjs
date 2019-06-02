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
	const cy = Statistics[operator](x1, x2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2 + ") = " + cy_str;
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

test("Statistics test", () => {
	expect(true).toBe(true);
});

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















