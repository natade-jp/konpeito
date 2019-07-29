// @ts-nocheck

import LinearAlgebra from "./LinearAlgebra.js";
import Matrix from "../Matrix.js";
const $ = Matrix.create;

let test_count = 0;

const testOperator1  = function(operator, x1, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const cy = LinearAlgebra[operator](x1);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, x1, x2, y, tolerance) {
	test_count++;
	const tolerance_ = tolerance ? tolerance : 0.1;
	const cy = LinearAlgebra[operator](x1, x2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + test_count + " " + operator + "(" + x1 + "," + x2 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance_);
	test(testname, () => { expect(out).toBe(true); });
};

{
	test_count = 0;
	testOperator2("inner", "3 + j", "2 + j", "7 + j");
	testOperator2("inner", "[1 2 3]", "[4 5 6]", "32");
}

{
	test_count = 0;
	testOperator1("rank", "3", "1");
	testOperator1("rank", "[1 1; 1 0]", "2");
	testOperator1("rank", "[1 1; 2 2]", "1");
	testOperator1("rank", "[1 2; 2 4]", "1");
	testOperator1("rank", "[1 2 3; 4 -2 3; 2 4 5]", "3");
	testOperator1("rank", "[1 2 3; 0 0 0; 2 4 5]", "2");
	testOperator1("rank", "[0 2 3; 0 -2 3; 0 4 5]", "2");
	testOperator1("rank", "[0 2 3; 0 -2 3]", "2");
	testOperator1("rank", "[4; 2; 1]", "1");
	testOperator1("rank", "[4 4; 2 2; 1 1]", "1");
	testOperator1("rank", "[0 0; 2 -2; 3 3]", "2");
}

{
	test_count = 0;
	testOperator1("trace", "3", "3");
	testOperator1("trace", "[1 1; 1 5]", "6");
	testOperator1("trace", "[3 2 3; 1 -2 3]", "1");
	testOperator1("trace", "[4; 2; 1]", "4");
	testOperator1("trace", "[4 4; 2 2; 1 1]", "6");
}
{
	test_count = 0;
	const testLUP = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const LUP = X.lup();
		const Y = LUP.P.T().mul(LUP.L).mul(LUP.U);
		const L_str = LUP.L.toOneLineString();
		const U_str = LUP.U.toOneLineString();
		const P_str = LUP.P.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "lup " + test_count + " lup(" + x + ")->";
		test(name + "L=" + L_str, () => { expect(LUP.L.isTriangleLower(tolerance)).toBe(true); });
		test(name + "U=" + U_str, () => { expect(LUP.U.isTriangleUpper(tolerance)).toBe(true); });
		test(name + "P=" + P_str, () => { expect(LUP.P.isPermutation(tolerance)).toBe(true); });
		test(name + "P^T*L*U=" + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testLUP("[1 2 3 3;4 5 6 6;7 8 9 2]");
	testLUP("[1 4 2;3 5 1;2 4 2;1 0 9]");
	testLUP("[1 4 2;3 5 1;0 0 0;1 0 9]");
	testLUP("[1 2 3;4 5 6;7 8 9]");
	testLUP("[1 2;3 4;5 6]");
	testLUP("[1 1;1 1;1 1]");
	testLUP("[0 0 0;0 0 0]");
}

{
	test_count = 0;
	testOperator2("linsolve", "[2 1 3 4;3 2 5 2; 3 4 1 -1; -1 -3 1 3]", "[2; 12; 4; -1]", "[1; -1; 3; -2]");
}

{
	test_count = 0;
	const testQR = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const QR = X.qr();
		const Y = QR.Q.mul(QR.R);
		const Q_str = QR.Q.toOneLineString();
		const R_str = QR.R.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "qr " + test_count + " qr(" + x + ")->";
		test(name + "Q=" + Q_str, () => { expect(QR.Q.isUnitary(tolerance)).toBe(true); });
		test(name + "R=" + R_str, () => { expect(QR.R.isTriangleUpper(tolerance)).toBe(true); });
		test(name + "Q*R=" + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testQR("[1 2 3;4 5 6;7 8 9]");
	testQR("[0 0 0;1 2 3;4 5 6]");
	testQR("[1 2 3;4 5 6;0 0 0]");
	testQR("[1 2; 3 4; 5 6]");
	testQR("[1 2 3;4 5 6]");
	testQR("[1 1;1 1;1 1]");
	testQR("[0 0 0;0 0 0]");
}

{
	test_count = 0;
	const testTRI = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const PH = X.tridiagonalize();
		const Y = PH.P.mul(PH.H).mul(PH.P.T());
		const P_str = PH.P.toOneLineString();
		const H_str = PH.H.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "tridiagonalize " + test_count + " tridiagonalize(" + x + ")->";
		test(name + "P=" + P_str, () => { expect(PH.P.isUnitary(tolerance)).toBe(true); });
		test(name + "H=" + H_str, () => { expect(PH.H.isTridiagonal(tolerance)).toBe(true); });
		test(name + "P*H*P'=" + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testTRI("[1 2;2 1]");
	testTRI("[1.0 0.5 0.3;0.5 1.0 0.6;0.3 0.6 1.0]");
	testTRI("[1 1 1 1;1 2 2 2;1 2 3 3;1 2 3 4]");
	testTRI("[0 0 0;0 0 0;0 0 0]");
}

{
	test_count = 0;
	const testEIG = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const VD = X.eig();
		const Y = VD.V.mul(VD.D).mul(VD.V.T());
		const V_str = VD.V.toOneLineString();
		const D_str = VD.D.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "eig " + test_count + " eig(" + x + ")->";
		test(name + "V=" + V_str, () => { expect(VD.V.isUnitary(tolerance)).toBe(true); });
		test(name + "D=" + D_str, () => { expect(VD.D.isDiagonal(tolerance)).toBe(true); });
		test(name + "V*D*V'=" + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testEIG("[1 2;2 1]");
	testEIG("[1.0 0.5 0.3;0.5 1.0 0.6;0.3 0.6 1.0]");
	testEIG("[1 1 1 1;1 2 2 2;1 2 3 3;1 2 3 4]");
	testEIG("[0 0 0;0 0 0;0 0 0]");
}

{
	test_count = 0;
	const testSVD = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const USV = X.svd();
		const Y = USV.U.mul(USV.S).mul(USV.V.T());
		const U_str = USV.U.toOneLineString();
		const S_str = USV.S.toOneLineString();
		const V_str = USV.V.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "svd " + test_count + " svd(" + x + ")->";
		test(name + "U=" + U_str, () => { expect(USV.U.isUnitary(tolerance)).toBe(true); });
		test(name + "S=" + S_str, () => { expect(USV.S.isDiagonal(tolerance)).toBe(true); });
		test(name + "V=" + V_str, () => { expect(USV.V.isUnitary(tolerance)).toBe(true); });
		test(name + "U*S*V'=" + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testSVD("[2 1 3 4;3 2 5 2; 3 4 1 -1; -1 -3 1 3]");
	testSVD("[1 2 3;4 5 6;7 8 9]");
	testSVD("[1 2 3;4 5 6]");
	testSVD("[1 2;3 4;5 6]");
	testSVD("[0 0 0;0 0 0]");
	testSVD("[0 0;0 0;0 0]");
}

{
	test_count = 0;
	const testINV = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const invX = X.inv();
		const Y = invX.mul(X);
		const Y_str = Y.toOneLineString();
		const name = "inv " + test_count + " inv(" + x + ")->";
		test(name + "X*(X^-1)=" + Y_str, () => { expect(Y.isIdentity(tolerance_)).toBe(true); });
	};
	testINV("[1 1 -1; -2 0 1; 0 2 1]");
}

{
	test_count = 0;
	const testPINV = function(x, tolerance) {
		test_count++;
		const tolerance_ = tolerance ? tolerance : 0.1;
		const X = $(x);
		const Y = X.pinv().pinv();
		const Y_str = Y.toOneLineString();
		const name = "pinv " + test_count + " pinv(" + x + ")->";
		test(name + "pinv(pinv(X)) = " + Y_str, () => { expect(X.equals(Y, tolerance_)).toBe(true); });
	};
	testPINV("[1 2;3 4;5 6]");
	testPINV("[1 2 3;4 5 6;7 8 9]");
	testPINV("[1 2 3 4;5 6 7 8]");
}

{
	test_count = 0;
	testOperator1("det", "[6 2;1 4]", "22");
	testOperator1("det", "[1 2 3;0 -1 5;-2 3 4]", "-45");
	testOperator1("det", "[3 2 1 0;1 2 3 4;2 1 0 1;2 0 2 1]", "-32");
	testOperator1("det", "[2 3 1 4 5;2 3 0 3 4;1 4 0 8 3;1 1 4 5 0;1 5 3 4 5]", "-284");
}

{
	test_count = 0;
	testOperator2("norm", "3 + j", "1", "3.1623");
	testOperator2("norm", "[1 -2 7 3]", "1", "13");
	testOperator2("norm", "[1; -2; 7; 3]", "1", "13");
	testOperator2("norm", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "1", "7.5");
}

{
	testOperator2("norm", "3", "2", "3");
	testOperator2("norm", "[1 -2 7 3]", "2", "7.9373");
	testOperator2("norm", "[1; -2; 7; 3]", "2", "7.9373");
	testOperator2("norm", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "2", "5.1347");
}

{
	testOperator2("norm", "3", Number.POSITIVE_INFINITY, "3");
	testOperator2("norm", "[1 -2 7 3]", Number.POSITIVE_INFINITY, "7");
	testOperator2("norm", "[1; -2; 7; 3]", Number.POSITIVE_INFINITY, "7");
	testOperator2("norm", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", Number.POSITIVE_INFINITY, "7.5000");
}

{
	testOperator2("norm", "3", Number.NEGATIVE_INFINITY, "3");
	testOperator2("norm", "[1 -2 7 3]", Number.NEGATIVE_INFINITY, "1");
	testOperator2("norm", "[1; -2; 7; 3]", Number.NEGATIVE_INFINITY, "1");
	testOperator2("norm", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", Number.NEGATIVE_INFINITY, "7.5000");
}

{
	testOperator2("norm", "3", "2.5", "3");
	testOperator2("norm", "[1 -2 7 3]", "2.5", "7.4578");
	testOperator2("norm", "[1; -2; 7; 3]", "2.5", "7.4578");
}

{
	test_count = 0;
	testOperator2("cond", "3", 2, "1");
	testOperator2("cond", "[1 -2 7 3]", 2, "1");
	testOperator2("cond", "[1; -2; 7; 3]", 2, "1");
	testOperator2("cond", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", 2, "2.7830");
}

{
	test_count = 0;
	testOperator1("rcond", "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "0.16533");
}
