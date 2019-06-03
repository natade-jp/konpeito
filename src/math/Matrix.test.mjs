/* global test, expect */

import Complex from "./Complex.mjs";
import Matrix from "./Matrix.mjs";
const $ = Matrix.create;

test("Statistics test", () => {
	expect(true).toBe(true);
});

let test_count = 0;

const testGet  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator];
	const testname = operator + " " + test_count + " " + x + "." + operator + "= " + Y;
	const out = $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1  = function(operator, x, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.1;
	const X = $(x);
	const Y = X[operator]();
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " " + x + "." + operator + "() = " + Y_str;
	const out = $(Y).equals(y, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x, p, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.1;
	const X = $(x);
	const Y = X[operator](p);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " " + x + "." + operator + "(" + p + ") = " + Y_str;
	const out = $(Y).equals(y, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator3  = function(operator, x, p1, p2, y, epsilon) {
	test_count++;
	const tolerance = epsilon ? epsilon : 0.1;
	const X = $(x);
	const Y = X[operator](p1, p2);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " " + x + "." + operator + "(" + p1 + "," + p2 + ") = " + Y_str;
	const out = $(Y).equals(y, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1Bool  = function(operator, x, y) {
	test_count++;
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + test_count + " " + x + "." + operator + "() = " + Y;
	const out = y === Y;
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize1  = function(operator, p1, y) {
	test_count++;
	const Y = Matrix[operator](p1);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " Matrix." + operator + "(" + p1 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize2  = function(operator, p1, p2, y) {
	test_count++;
	const Y = Matrix[operator](p1, p2);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " Matrix." + operator + "(" + p1 + ", " + p2 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize3  = function(operator, p1, p2, p3, y) {
	test_count++;
	const Y = Matrix[operator](p1, p2, p3);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + test_count + " Matrix." + operator + "(" + p1 + ", " + p2 + ", " + p3 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	const testEquals = function(x, p, y) {
		test_count++;
		const X = $(x);
		const P = $(p);
		const Y = X.equals(P);
		const testname = "equals " + test_count + " " + x + ".equals(" + p + ") = " + Y;
		test(testname, () => { expect(Y).toBe(y); });
	};
	testEquals("3", "1", false);
	testEquals("3", "3", true);
	testEquals("[1 2 3]", "[4 5 6]", false);
	testEquals("[1 2 3]", "[1 2]", false);
	testEquals("[1 2 3]", "[1 2 3]", true);
	testEquals("[1 2 3]", "[1 2 3 4]", false);
	testEquals("[1;2;3]", "[4;5;6]", false);
	testEquals("[1;2;3]", "[1;2]", false);
	testEquals("[1;2;3]", "[1;2;3]", true);
	testEquals("[1;2;3]", "[1;2;3;4]", false);
	testEquals("[1;2;3]", "[1 2 3]", false);
	testEquals("[1 2 3]", "[1;2;3]", false);
}

{
	test_count = 0;
	const testGetMatrix  = function(x, p1, p2, y, epsilon) {
		test_count++;
		const tolerance = epsilon ? epsilon : 0.1;
		const cx = $(x);
		const cy = cx.getMatrix(p1, p2);
		const cy_str = cy.toOneLineString();
		const testname = "getMatrix " + test_count + " " + x + ".getMatrix(" + p1 + ", " + p2 + ") = " + cy_str;
		const out = $(y).equals(cy, tolerance);
		test(testname, () => { expect(out).toBe(true); });
	};
	testGetMatrix("[1 2]", "0", "0", "1");
	testGetMatrix("[1 2]", "0", "1", "2");
	testGetMatrix("[1 2;3 4]", "1", "0", "3");
	testGetMatrix("[1 2;3 4]", "1", "1", "4");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", ":", "0", "[1;4;7]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", ":", "1", "[2;5;8]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", ":", "2", "[3;6;9]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", "0", ":", "[1 2 3]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", "1", ":", "[4 5 6]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", "2", ":", "[7 8 9]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", "0, 2", ":", "[1 2 3;7 8 9]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", ":", "0, 2", "[1 3;4 6;7 9]");
	testGetMatrix("[1 2 3;4 5 6;7 8 9]", "2:-1:0", "2:-1:0", "[9 8 7;6 5 4;3 2 1]");
	testGetMatrix("[1 2 3 4;5 6 7 8;9 10 11 12;13 14 15 16]", "1, 2", "1, 2", "[6 7;10 11]");
}

{
	test_count = 0;
	const testSetMatrix  = function(x, p1, p2, p3, y, epsilon) {
		test_count++;
		const tolerance = epsilon ? epsilon : 0.1;
		const cx = $(x);
		const cy = cx.setMatrix(p1, p2, p3);
		const cy_str = cy.toOneLineString();
		const testname = "setMatrix " + test_count + " " + x + ".setMatrix(" + p1 + ", " + p2 + ", " + p3 + ") = " + cy_str;
		const out = $(y).equals(cy, tolerance);
		test(testname, () => { expect(out).toBe(true); });
	};
	testSetMatrix("[5]", "0", "0", "6", "[6]");
	testSetMatrix("[1 2]", "0", "0", "7", "[7 2]");
	testSetMatrix("[1 2]", "0", "1", "8", "[1 8]");
	testSetMatrix("[1 2;3 4]", "1", "0", "9", "[1 2;9 4]");
	testSetMatrix("[1 2;3 4]", "1", "1", "10", "[1 2;3 10]");
	testSetMatrix("[1 2 3;4 5 6;7 8 9]", ":", "0", "[20;10;0]", "[20 2 3;10 5 6;0 8 9]");
	testSetMatrix("[1 2 3;4 5 6;7 8 9]", "2", ":", "[20 10 0]", "[1 2 3;4 5 6;20 10 0]");
	testSetMatrix("[1 2 3 4;5 6 7 8;9 10 11 12;13 14 15 16]", "1, 2", "1, 2", "50", "[1 2 3 4;5 50 50 8;9 50 50 12;13 14 15 16]");
}

{
	test_count = 0;
	testGet("intValue", "[4.4 + 2j 2.2]", 4);
	testGet("intValue", "[12.3 + 3j; 1.9]", 12);
}

{
	test_count = 0;
	testGet("doubleValue", "[4.4 + 2j, 2.2]", 4.4);
	testGet("doubleValue", "[12.3 + 3j; 1.9]", 12.3);
}

{
	test_count = 0;
	testGet("scalar", "[4.4 + 2j, 2.2]", "4.4 + 2j");
	testGet("scalar", "[12.3 + 3j; 1.9]", "12.3 + 3j");
}

{
	test_count = 0;
	testGet("length", "[3]", 1);
	testGet("length", "[1 2]", 2);
	testGet("length", "[1;2]", 2);
	testGet("length", "[1 2;3 4;5 6]", 3);
	testGet("length", "[1 2 3;4 5 6]", 3);
	testGet("length", "[1 2 3;54 5 6;7 8 9]", 3);
}

{
	test_count = 0;
	testInitialize3("memset", "5", "2", "2", "[5 5;5 5]");
	testInitialize3("memset", "[1 2]", "2", "2", "[1 2;1 2]");
	testInitialize3("memset", "[1;2]", "3", "3", "[1 1 1;2 2 2;1 1 1]");
}

{
	test_count = 0;
	testInitialize1("eye", "3", "[1 0 0;0 1 0;0 0 1]");
	testInitialize2("eye", "3", "2", "[1 0;0 1;0 0]");
}

{
	test_count = 0;
	testInitialize1("zeros", "3", "[0 0 0;0 0 0;0 0 0]");
	testInitialize2("zeros", "3", "2", "[0 0;0 0;0 0]");
}

{
	test_count = 0;
	testInitialize1("ones", "3", "[1 1 1;1 1 1;1 1 1]");
	testInitialize2("ones", "3", "2", "[1 1;1 1;1 1]");
}

{
	test_count = 0;
	testOperator1("diag", "4", "4");
	testOperator1("diag", "[1 2 3]", "[1 0 0;0 2 0;0 0 3]");
	testOperator1("diag", "[1;2;3]", "[1 0 0;0 2 0;0 0 3]");
	testOperator1("diag", "[1 0 0;0 2 0;0 0 3]", "[1;2;3]");
}

{
	test_count = 0;
	testOperator1Bool("isScalar", "4", true);
	testOperator1Bool("isScalar", "[1 2 3]", false);
	testOperator1Bool("isScalar", "[1;2;3]", false);
	testOperator1Bool("isScalar", "[1 2 3;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isRow", "4", true);
	testOperator1Bool("isRow", "[1 2 3]", true);
	testOperator1Bool("isRow", "[1;2;3]", false);
	testOperator1Bool("isRow", "[1 2 3;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isColumn", "4", true);
	testOperator1Bool("isColumn", "[1 2 3]", false);
	testOperator1Bool("isColumn", "[1;2;3]", true);
	testOperator1Bool("isColumn", "[1 2 3;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isVector", "4", true);
	testOperator1Bool("isVector", "[1 2 3]", true);
	testOperator1Bool("isVector", "[1;2;3]", true);
	testOperator1Bool("isVector", "[1 2 3;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isMatrix", "4", false);
	testOperator1Bool("isMatrix", "[1 2 3]", false);
	testOperator1Bool("isMatrix", "[1;2;3]", false);
	testOperator1Bool("isMatrix", "[1 2 3;4 5 6;7 8 9]", true);
}

{
	test_count = 0;
	testOperator1Bool("isSquare", "4", true);
	testOperator1Bool("isSquare", "[1 2 3]", false);
	testOperator1Bool("isSquare", "[1;2;3]", false);
	testOperator1Bool("isSquare", "[1 2 3;4 5 6;7 8 9]", true);
}

{
	test_count = 0;
	testOperator1Bool("isZeros", "4", false);
	testOperator1Bool("isZeros", "0", true);
	testOperator1Bool("isZeros", "[0 0 0;0 0 0;0 0 0]", true);
	testOperator1Bool("isZeros", "[0 0 0;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isIdentity", "1", true);
	testOperator1Bool("isIdentity", "0", false);
	testOperator1Bool("isIdentity", "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isIdentity", "[0 0 0;4 5 6;7 8 9]", false);
	testOperator1Bool("isIdentity", "[1 0;0 1;0 0]", true);
	testOperator1Bool("isIdentity", "[1 0;0 1;0 1]", false);
	testOperator1Bool("isIdentity", "[1 0 0;0 1 0]", true);
	testOperator1Bool("isIdentity", "[1 0 0;0 1 1]", false);
}

{
	test_count = 0;
	testOperator1Bool("isDiagonal", "1", true);
	testOperator1Bool("isDiagonal", "0", true);
	testOperator1Bool("isDiagonal", "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isDiagonal", "[0 0 0;4 5 6;7 8 9]", false);
	testOperator1Bool("isDiagonal", "[0 0 0;0 5 0;0 0 9]", true);
	testOperator1Bool("isDiagonal", "[1 0;0 1;0 0]", true);
	testOperator1Bool("isDiagonal", "[1 0;0 1;0 1]", false);
	testOperator1Bool("isDiagonal", "[1 0 0;0 1 0]", true);
	testOperator1Bool("isDiagonal", "[1 0 0;0 1 1]", false);
}

{
	test_count = 0;
	testOperator1Bool("isTridiagonal", "[1 1 1;0 1 0]", false);
	testOperator1Bool("isTridiagonal", "[1 1 0;0 1 1]", true);
	testOperator1Bool("isTridiagonal", "[1 1;1 1;0 1]", true);
	testOperator1Bool("isTridiagonal", "[1 1;1 1;1 1]", false);
	testOperator1Bool("isTridiagonal", "[1 1 0;1 1 1;0 1 1]", true);
}

{
	test_count = 0;
	testOperator1Bool("isRegular", "[1 1 1;0 1 0]", false);
	testOperator1Bool("isRegular", "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isRegular", "[1 2 3;4 5 6;7 8 9]", false);
}

{
	test_count = 0;
	testOperator1Bool("isOrthogonal", "[0 1;-1 0]", true);
	testOperator1Bool("isOrthogonal", "[1 1;0 1]", false);
	testOperator1Bool("isOrthogonal", "[0 j;-j 0]", false);
	testOperator1Bool("isOrthogonal", "[0 j;j 0]", false);
}

{
	test_count = 0;
	testOperator1Bool("isUnitary", "[0 1;-1 0]", true);
	testOperator1Bool("isUnitary", "[1 1;0 1]", false);
	testOperator1Bool("isUnitary", "[0 j;-j 0]", true);
	testOperator1Bool("isUnitary", "[0 j;j 0]", true);
}

{
	test_count = 0;
	testOperator1Bool("isSymmetric", "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isSymmetric", "[1 2 3;4 5 6;7 8 9]", false);
	testOperator1Bool("isSymmetric", "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isSymmetric", "[1 1 1;1 2 2 + j;1 2 + j 3]", true);
	testOperator1Bool("isSymmetric", "[1 1 1;1 2 2 + j;1 2 - j 3]", false);
}

{
	test_count = 0;
	testOperator1Bool("isHermitian", "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isHermitian", "[1 2 3;4 5 6;7 8 9]", false);
	testOperator1Bool("isHermitian", "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isHermitian", "[1 1 1;1 2 2 + j;1 2 + j 3]", false);
	testOperator1Bool("isHermitian", "[1 1 1;1 2 2 + j;1 2 - j 3]", true);
}

{
	test_count = 0;
	testOperator1Bool("isTriangleUpper", "[1 1 1;0 1 1;0 0 1]", true);
	testOperator1Bool("isTriangleUpper", "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isTriangleUpper", "[1 0 0;1 1 0;1 1 1]", false);
}

{
	test_count = 0;
	testOperator1Bool("isTriangleLower", "[1 1 1;0 1 1;0 0 1]", false);
	testOperator1Bool("isTriangleLower", "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isTriangleLower", "[1 0 0;1 1 0;1 1 1]", true);
}

{
	test_count = 0;
	testOperator1Bool("isPermutation", "[1 1 1;0 1 1;0 0 1]", false);
	testOperator1Bool("isPermutation", "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isPermutation", "[1 0 0;1 1 0;1 1 1]", false);
	testOperator1Bool("isPermutation", "[0 0 1;1 0 0;0 1 0]", true);
	testOperator1Bool("isPermutation", "[0 0 1;1 0 0;0 1 1]", false);
	testOperator1Bool("isPermutation", "[0 0 1;1 0 0;0 0 0]", false);
}

{
	test_count = 0;
	testOperator2("add", "1", "2", "3");
	testOperator2("add", "[1 2]", "1", "[2 3]");
	testOperator2("add", "[1 2]", "[3 4]", "[4 6]");
	testOperator2("add", "[1;2]", "3", "[4;5]");
	testOperator2("add", "[1;2]", "[3;4]", "[4;6]");
	testOperator2("add", "[1 2;3 4]", "[1 2]", "[2 4;4 6]");
	testOperator2("add", "[1 2;3 4]", "[1;2]", "[2 3;5 6]");
	testOperator2("add", "[1 2;3 4]", "[1 2;4 8]", "[2 4;7 12]");
}

{
	test_count = 0;
	testOperator2("sub", "1", "2", "-1");
	testOperator2("sub", "[1 2]", "1", "[0 1]");
	testOperator2("sub", "[1 2]", "[3 4]", "[-2 -2]");
	testOperator2("sub", "[1;2]", "3", "[-2;-1]");
	testOperator2("sub", "[1;2]", "[3;4]", "[-2;-2]");
	testOperator2("sub", "[1 2;3 4]", "[1 2]", "[0 0;2 2]");
	testOperator2("sub", "[1 2;3 4]", "[1;2]", "[0 1;1 2]");
	testOperator2("sub", "[1 2;3 4]", "[1 2;4 8]", "[0 0;-1 -4]");
}

{
	test_count = 0;
	testOperator2("mul", "1", "2", "2");
	testOperator2("mul", "[1 2]", "3", "[3 6]");
	testOperator2("mul", "[1 2]", "[3;4]", "[11]");
	testOperator2("mul", "[1;2]", "3", "[3;6]");
	testOperator2("mul", "[1;2]", "[3 4]", "[3 4;6 8]");
	testOperator2("nmul", "[1 2;3 4]", "[1 2]", "[1 4;3 8]");
	testOperator2("nmul", "[1 2;3 4]", "[1;2]", "[1 2;6 8]");
	testOperator2("mul", "[1 2;3 4]", "[1 2;4 8]", "[9 18;19 38]");
}

{
	test_count = 0;
	testOperator2("ndiv", "[1 2;3 4]", "[1 2]", "[1 1;3 2]");
	testOperator2("ndiv", "[1 2;3 4]", "[1;2]", "[1 2;1.5 2]");
}


{
	test_count = 0;
	const testEachVector  = function(x, p1, p2, y, epsilon) {
		test_count++;
		const tolerance = epsilon ? epsilon : 0.1;
		const cx = $(x);
		const cy = cx.eachVector(p1, p2);
		const cy_str = cy.toOneLineString();
		const testname = "eachVector " + test_count + " " + x + ".eachVector(sum, " + p2 + ") = " + cy_str;
		const out = $(y).equals(cy, tolerance);
		test(testname, () => { expect(out).toBe(true); });
	};

	const sum = function(data) {
		let sum = Complex.ZERO;
		for(let i = 0; i < data.length; i++) {
			sum = sum.add(data[i]);
		}
		return [sum];
	};

	testEachVector("[10]", sum, 0, "[10]");
	testEachVector("[1 2]", sum, 0, "[3]");
	testEachVector("[1;2]", sum, 0, "[3]");
	testEachVector("[1 2;3 4]", sum, 0, "[4 6]");
	testEachVector("[10]", sum, "auto", "[10]");
	testEachVector("[1 2]", sum, "auto", "[3]");
	testEachVector("[1;2]", sum, "auto", "[3]");
	testEachVector("[1 2;3 4]", sum, "auto", "[4 6]");
	
	testEachVector("[10]", sum, 1, "[10]");
	testEachVector("[1 2]", sum, 1, "[3]");
	testEachVector("[1;2]", sum, 1, "[1;2]");
	testEachVector("[1 2;3 4]", sum, 1, "[3;7]");
	testEachVector("[10]", sum, "row", "[10]");
	testEachVector("[1 2]", sum, "row", "[3]");
	testEachVector("[1;2]", sum, "row", "[1;2]");
	testEachVector("[1 2;3 4]", sum, "row", "[3;7]");
	
	testEachVector("[10]", sum, 2, "[10]");
	testEachVector("[1 2]", sum, 2, "[1 2]");
	testEachVector("[1;2]", sum, 2, "[3]");
	testEachVector("[1 2;3 4]", sum, 2, "[4 6]");
	testEachVector("[10]", sum, "column", "[10]");
	testEachVector("[1 2]", sum, "column", "[1 2]");
	testEachVector("[1;2]", sum, "column", "[3]");
	testEachVector("[1 2;3 4]", sum, "column", "[4 6]");
	testEachVector("[10]", sum, 3, "[10]");
	testEachVector("[1 2]", sum, 3, "[3]");
	testEachVector("[1;2]", sum, 3, "[3]");
	testEachVector("[1 2;3 4]", sum, 3, "[10]");
	testEachVector("[10]", sum, "both", "[10]");
	testEachVector("[1 2]", sum, "both", "[3]");
	testEachVector("[1;2]", sum, "both", "[3]");
	testEachVector("[1 2;3 4]", sum, "both", "[10]");

}

{
	test_count = 0;
	testOperator2("rot90", "1", 0, "1");
	testOperator2("rot90", "[1 2]", 1, "[1;2]");
	testOperator2("rot90", "[1 2]", 2, "[2 1]");
	testOperator2("rot90", "[1 2]", 3, "[2;1]");
	testOperator2("rot90", "[1 2]", 4, "[1 2]");
	testOperator2("rot90", "[1;2]", 1, "[2 1]");
	testOperator2("rot90", "[1;2]", 2, "[2;1]");
	testOperator2("rot90", "[1;2]", 3, "[1 2]");
	testOperator2("rot90", "[1;2]", 4, "[1;2]");
	testOperator2("rot90", "[1 2;3 4]", 0, "[1 2;3 4]");
	testOperator2("rot90", "[1 2;3 4]", 1, "[3 1;4 2]");
	testOperator2("rot90", "[1 2;3 4]", 2, "[4 3;2 1]");
	testOperator2("rot90", "[1 2;3 4]", 3, "[2 4;1 3]");
	testOperator2("rot90", "[1 2;3 4]", 4, "[1 2;3 4]");
}

{
	test_count = 0;
	testOperator3("resize", "1", 1, 2, "[1 0]");
	testOperator3("resize", "1", 2, 1, "[1;0]");
	testOperator3("resize", "[1 2;3 4]", 2, 4, "[1 2 0 0;3 4 0 0]");
	testOperator3("resize", "[1 2;3 4]", 4, 2, "[1 2;3 4;0 0;0 0]");
	testOperator3("resize", "[1 2;3 4]", 4, 4, "[1 2 0 0;3 4 0 0;0 0 0 0;0 0 0 0]");
	testOperator3("resize", "[1 2 3 4;5 6 7 8;9 10 11 12;13 14 15 16]", 2, 4, "[1 2 3 4;5 6 7 8]");
	testOperator3("resize", "[1 2 3 4;5 6 7 8;9 10 11 12;13 14 15 16]", 4, 2, "[1 2;5 6;9 10;13 14]");
	testOperator3("resize", "[1 2 3 4;5 6 7 8;9 10 11 12;13 14 15 16]", 2, 2, "[1 2;5 6]");
}

{
	test_count = 0;
	testOperator2("deleteRow", "[1;2]", 0, "[2]");
	testOperator2("deleteRow", "[1;2]", 1, "[1]");
	testOperator2("deleteRow", "[1 2;3 4]", 0, "[3 4]");
	testOperator2("deleteRow", "[1 2;3 4]", 1, "[1 2]");
}

{
	test_count = 0;
	testOperator2("deleteColumn", "[1 2]", 0, "[2]");
	testOperator2("deleteColumn", "[1 2]", 1, "[1]");
	testOperator2("deleteColumn", "[1 2;3 4]", 0, "[2;4]");
	testOperator2("deleteColumn", "[1 2;3 4]", 1, "[1;3]");
}

{
	test_count = 0;
	testOperator3("exchangeRow", "[1;2]", 0, 1, "[2;1]");
	testOperator3("exchangeRow", "[1;2]", 1, 0, "[2;1]");
	testOperator3("exchangeRow", "[1 2;3 4]", 0, 1, "[3 4;1 2]");
	testOperator3("exchangeRow", "[1 2;3 4]", 1, 0, "[3 4;1 2]");
}

{
	test_count = 0;
	testOperator2("concatLeft", "[1]", "[2]", "[1 2]");
	testOperator2("concatLeft", "[1 2]", "[3 4]", "[1 2 3 4]");
	testOperator2("concatLeft", "[1 2;3 4]", "[10;11]", "[1 2 10;3 4 11]");
	testOperator2("concatLeft", "[1 2;3 4]", "[5 6;7 8]", "[1 2 5 6;3 4 7 8]");
}

{
	test_count = 0;
	testOperator2("concatBottom", "[1]", "[2]", "[1;2]");
	testOperator2("concatBottom", "[1;2]", "[3;4]", "[1;2;3;4]");
	testOperator2("concatBottom", "[1 2;3 4]", "[10 11]", "[1 2;3 4;10 11]");
	testOperator2("concatBottom", "[1 2;3 4]", "[5 6;7 8]", "[1 2;3 4;5 6;7 8]");
}

{
	test_count = 0;
	testOperator1("max", "4", "4");
	testOperator1("max", "[1 2 3]", "[3]");
	testOperator1("max", "[1;2;3]", "[3]");
	testOperator1("max", "[1 0 0;0 2 0;0 0 3]", "[1 2 3]");
}

{
	test_count = 0;
	testOperator1("min", "4", "4");
	testOperator1("min", "[1 2 3]", "[1]");
	testOperator1("min", "[1;2;3]", "[1]");
	testOperator1("min", "[1 0 0;0 2 0;0 0 3]", "[0 0 0]");
}





