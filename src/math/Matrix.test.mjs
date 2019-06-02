/* global test, expect */

import Matrix from "./Matrix.mjs";
const $ = Matrix.create;

test("Statistics test", () => {
	expect(true).toBe(true);
});


const testGet  = function(operator, number, x, y) {
	const X = $(x);
	const Y = X[operator];
	const testname = operator + " " + number + " " + x + "." + operator + "= " + Y;
	const out = $(Y).equals(y, 0.001);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1  = function(operator, number, x, y, epsilon) {
	const tolerance = epsilon ? epsilon : 0.1;
	const X = $(x);
	const Y = X[operator]();
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + number + " " + x + "." + operator + "() = " + Y_str;
	const out = $(Y).equals(y, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, number, x, p, y, epsilon) {
	const tolerance = epsilon ? epsilon : 0.1;
	const X = $(x);
	const Y = X[operator](p);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + number + " " + x + "." + operator + "(" + p + ") = " + Y_str;
	const out = $(Y).equals(y, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator1Bool  = function(operator, number, x, y) {
	const X = $(x);
	const Y = X[operator]();
	const testname = operator + " " + number + " " + x + "." + operator + "() = " + Y;
	const out = y === Y;
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize1  = function(operator, number, p1, y) {
	const Y = Matrix[operator](p1);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + number + " Matrix." + operator + "(" + p1 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize2  = function(operator, number, p1, p2, y) {
	const Y = Matrix[operator](p1, p2);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + number + " Matrix." + operator + "(" + p1 + ", " + p2 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

const testInitialize3  = function(operator, number, p1, p2, p3, y) {
	const Y = Matrix[operator](p1, p2, p3);
	const Y_str = Y.toOneLineString();
	const testname = operator + " " + number + " Matrix." + operator + "(" + p1 + ", " + p2 + ", " + p3 + ") = " + Y_str;
	const out = $(y).equals(Y);
	test(testname, () => { expect(out).toBe(true); });
};

{
	let test_number = 0;
	const testEquals = function(x, p, y) {
		test_number++;
		const X = $(x);
		const P = $(p);
		const Y = X.equals(P);
		const testname = "equals " + test_number + " " + x + ".equals(" + p + ") = " + Y;
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
	let test_number = 0;
	const testGetMatrix  = function(x, p1, p2, y, epsilon) {
		test_number++;
		const tolerance = epsilon ? epsilon : 0.1;
		const cx = $(x);
		const cy = cx.getMatrix(p1, p2);
		const cy_str = cy.toOneLineString();
		const testname = "getMatrix " + test_number + " " + x + ".getMatrix(" + p1 + ", " + p2 + ") = " + cy_str;
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
	let test_number = 0;
	const testSetMatrix  = function(x, p1, p2, p3, y, epsilon) {
		test_number++;
		const tolerance = epsilon ? epsilon : 0.1;
		const cx = $(x);
		const cy = cx.setMatrix(p1, p2, p3);
		const cy_str = cy.toOneLineString();
		const testname = "setMatrix " + test_number + " " + x + ".setMatrix(" + p1 + ", " + p2 + ", " + p3 + ") = " + cy_str;
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
	testGet("intValue", 1, "[4.4 + 2j 2.2]", 4);
	testGet("intValue", 2, "[12.3 + 3j; 1.9]", 12);
	testGet("doubleValue", 1, "[4.4 + 2j, 2.2]", 4.4);
	testGet("doubleValue", 2, "[12.3 + 3j; 1.9]", 12.3);
	testGet("scalar", 1, "[4.4 + 2j, 2.2]", "4.4 + 2j");
	testGet("scalar", 2, "[12.3 + 3j; 1.9]", "12.3 + 3j");
	testGet("length", 1, "[3]", 1);
	testGet("length", 2, "[1 2]", 2);
	testGet("length", 3, "[1;2]", 2);
	testGet("length", 4, "[1 2;3 4;5 6]", 3);
	testGet("length", 5, "[1 2 3;4 5 6]", 3);
	testGet("length", 6, "[1 2 3;54 5 6;7 8 9]", 3);
}

{
	testInitialize3("memset", 1, "5", "2", "2", "[5 5;5 5]");
	testInitialize3("memset", 2, "[1 2]", "2", "2", "[1 2;1 2]");
	testInitialize3("memset", 3, "[1;2]", "3", "3", "[1 1 1;2 2 2;1 1 1]");
}

{
	testInitialize1("eye", 1, "3", "[1 0 0;0 1 0;0 0 1]");
	testInitialize2("eye", 1, "3", "2", "[1 0;0 1;0 0]");
}

{
	testInitialize1("zeros", 1, "3", "[0 0 0;0 0 0;0 0 0]");
	testInitialize2("zeros", 1, "3", "2", "[0 0;0 0;0 0]");
}

{
	testInitialize1("ones", 1, "3", "[1 1 1;1 1 1;1 1 1]");
	testInitialize2("ones", 1, "3", "2", "[1 1;1 1;1 1]");
}

{
	testOperator1("diag", 1, "4", "4");
	testOperator1("diag", 2, "[1 2 3]", "[1 0 0;0 2 0;0 0 3]");
	testOperator1("diag", 3, "[1;2;3]", "[1 0 0;0 2 0;0 0 3]");
	testOperator1("diag", 4, "[1 0 0;0 2 0;0 0 3]", "[1;2;3]");
}

{
	testOperator1Bool("isScalar", 1, "4", true);
	testOperator1Bool("isScalar", 2, "[1 2 3]", false);
	testOperator1Bool("isScalar", 3, "[1;2;3]", false);
	testOperator1Bool("isScalar", 4, "[1 2 3;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isRow", 1, "4", true);
	testOperator1Bool("isRow", 2, "[1 2 3]", true);
	testOperator1Bool("isRow", 3, "[1;2;3]", false);
	testOperator1Bool("isRow", 4, "[1 2 3;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isColumn", 1, "4", true);
	testOperator1Bool("isColumn", 2, "[1 2 3]", false);
	testOperator1Bool("isColumn", 3, "[1;2;3]", true);
	testOperator1Bool("isColumn", 4, "[1 2 3;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isVector", 1, "4", true);
	testOperator1Bool("isVector", 2, "[1 2 3]", true);
	testOperator1Bool("isVector", 3, "[1;2;3]", true);
	testOperator1Bool("isVector", 4, "[1 2 3;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isMatrix", 1, "4", false);
	testOperator1Bool("isMatrix", 2, "[1 2 3]", false);
	testOperator1Bool("isMatrix", 3, "[1;2;3]", false);
	testOperator1Bool("isMatrix", 4, "[1 2 3;4 5 6;7 8 9]", true);
}

{
	testOperator1Bool("isSquare", 1, "4", true);
	testOperator1Bool("isSquare", 2, "[1 2 3]", false);
	testOperator1Bool("isSquare", 3, "[1;2;3]", false);
	testOperator1Bool("isSquare", 4, "[1 2 3;4 5 6;7 8 9]", true);
}

{
	testOperator1Bool("isZeros", 1, "4", false);
	testOperator1Bool("isZeros", 2, "0", true);
	testOperator1Bool("isZeros", 3, "[0 0 0;0 0 0;0 0 0]", true);
	testOperator1Bool("isZeros", 4, "[0 0 0;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isIdentity", 1, "1", true);
	testOperator1Bool("isIdentity", 2, "0", false);
	testOperator1Bool("isIdentity", 3, "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isIdentity", 4, "[0 0 0;4 5 6;7 8 9]", false);
	testOperator1Bool("isIdentity", 5, "[1 0;0 1;0 0]", true);
	testOperator1Bool("isIdentity", 6, "[1 0;0 1;0 1]", false);
	testOperator1Bool("isIdentity", 7, "[1 0 0;0 1 0]", true);
	testOperator1Bool("isIdentity", 8, "[1 0 0;0 1 1]", false);
}

{
	testOperator1Bool("isDiagonal", 1, "1", true);
	testOperator1Bool("isDiagonal", 2, "0", true);
	testOperator1Bool("isDiagonal", 3, "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isDiagonal", 4, "[0 0 0;4 5 6;7 8 9]", false);
	testOperator1Bool("isDiagonal", 5, "[0 0 0;0 5 0;0 0 9]", true);
	testOperator1Bool("isDiagonal", 6, "[1 0;0 1;0 0]", true);
	testOperator1Bool("isDiagonal", 7, "[1 0;0 1;0 1]", false);
	testOperator1Bool("isDiagonal", 8, "[1 0 0;0 1 0]", true);
	testOperator1Bool("isDiagonal", 9, "[1 0 0;0 1 1]", false);
}

{
	testOperator1Bool("isTridiagonal", 1, "[1 1 1;0 1 0]", false);
	testOperator1Bool("isTridiagonal", 2, "[1 1 0;0 1 1]", true);
	testOperator1Bool("isTridiagonal", 3, "[1 1;1 1;0 1]", true);
	testOperator1Bool("isTridiagonal", 4, "[1 1;1 1;1 1]", false);
	testOperator1Bool("isTridiagonal", 5, "[1 1 0;1 1 1;0 1 1]", true);
}

{
	testOperator1Bool("isRegular", 1, "[1 1 1;0 1 0]", false);
	testOperator1Bool("isRegular", 2, "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isRegular", 3, "[1 2 3;4 5 6;7 8 9]", false);
}

{
	testOperator1Bool("isOrthogonal", 1, "[0 1;-1 0]", true);
	testOperator1Bool("isOrthogonal", 2, "[1 1;0 1]", false);
	testOperator1Bool("isOrthogonal", 3, "[0 j;-j 0]", false);
	testOperator1Bool("isOrthogonal", 4, "[0 j;j 0]", false);
}

{
	testOperator1Bool("isUnitary", 1, "[0 1;-1 0]", true);
	testOperator1Bool("isUnitary", 2, "[1 1;0 1]", false);
	testOperator1Bool("isUnitary", 3, "[0 j;-j 0]", true);
	testOperator1Bool("isUnitary", 4, "[0 j;j 0]", true);
}

{
	testOperator1Bool("isSymmetric", 1, "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isSymmetric", 2, "[1 2 3;4 5 6;7 8 9]", false);
	testOperator1Bool("isSymmetric", 3, "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isSymmetric", 4, "[1 1 1;1 2 2 + j;1 2 + j 3]", true);
	testOperator1Bool("isSymmetric", 5, "[1 1 1;1 2 2 + j;1 2 - j 3]", false);
}

{
	testOperator1Bool("isHermitian", 1, "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isHermitian", 2, "[1 2 3;4 5 6;7 8 9]", false);
	testOperator1Bool("isHermitian", 3, "[1 1 1;1 2 2;1 2 3]", true);
	testOperator1Bool("isHermitian", 4, "[1 1 1;1 2 2 + j;1 2 + j 3]", false);
	testOperator1Bool("isHermitian", 5, "[1 1 1;1 2 2 + j;1 2 - j 3]", true);
}

{
	testOperator1Bool("isTriangleUpper", 1, "[1 1 1;0 1 1;0 0 1]", true);
	testOperator1Bool("isTriangleUpper", 2, "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isTriangleUpper", 3, "[1 0 0;1 1 0;1 1 1]", false);
}

{
	testOperator1Bool("isTriangleLower", 1, "[1 1 1;0 1 1;0 0 1]", false);
	testOperator1Bool("isTriangleLower", 2, "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isTriangleLower", 3, "[1 0 0;1 1 0;1 1 1]", true);
}

{
	testOperator1Bool("isPermutation", 1, "[1 1 1;0 1 1;0 0 1]", false);
	testOperator1Bool("isPermutation", 2, "[1 0 0;0 1 0;0 0 1]", true);
	testOperator1Bool("isPermutation", 3, "[1 0 0;1 1 0;1 1 1]", false);
	testOperator1Bool("isPermutation", 4, "[0 0 1;1 0 0;0 1 0]", true);
	testOperator1Bool("isPermutation", 5, "[0 0 1;1 0 0;0 1 1]", false);
	testOperator1Bool("isPermutation", 6, "[0 0 1;1 0 0;0 0 0]", false);
}











