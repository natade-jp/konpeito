/* global test, expect */

import LinearAlgebra from "./LinearAlgebra.mjs";
import Matrix from "../Matrix.mjs";
const $ = Matrix.create;

const testOperator1  = function(operator, number, x1, y, epsilon) {
	const tolerance = epsilon ? epsilon : 0.1;
	const cx1 = $(x1);
	const cy = LinearAlgebra[operator](cx1);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + number + " " + operator + "(" + x1 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

const testOperator2  = function(operator, number, x1, x2, y, epsilon) {
	const tolerance = epsilon ? epsilon : 0.1;
	const cx1 = $(x1);
	const cx2 = $(x2);
	const cy = LinearAlgebra[operator](cx1, cx2);
	const cy_str = cy instanceof Matrix ? cy.toOneLineString() : cy.toString();
	const testname = operator + " " + number + " " + operator + "(" + x1 + "," + x2 + ") = " + cy_str;
	const out = $(y).equals(cy, tolerance);
	test(testname, () => { expect(out).toBe(true); });
};

{
	testOperator2("inner", 1, "3 + j", "2 + j", "7 + j");
	testOperator2("inner", 2, "[1 2 3]", "[4 5 6]", "32");
}
{
	testOperator1("rank", 1, "3", "1");
	testOperator1("rank", 2, "[1 1; 1 0]", "2");
	testOperator1("rank", 3, "[1 1; 2 2]", "1");
	testOperator1("rank", 4, "[1 2; 2 4]", "1");
	testOperator1("rank", 5, "[1 2 3; 4 -2 3; 2 4 5]", "3");
	testOperator1("rank", 6, "[1 2 3; 0 0 0; 2 4 5]", "2");
	testOperator1("rank", 7, "[0 2 3; 0 -2 3; 0 4 5]", "2");
	testOperator1("rank", 8, "[0 2 3; 0 -2 3]", "2");
	testOperator1("rank", 9, "[4; 2; 1]", "1");
	testOperator1("rank", 10, "[4 4; 2 2; 1 1]", "1");
	testOperator1("rank", 11, "[0 0; 2 -2; 3 3]", "2");
}
{
	testOperator1("trace", 1, "3", "3");
	testOperator1("trace", 2, "[1 1; 1 5]", "6");
	testOperator1("trace", 3, "[3 2 3; 1 -2 3]", "1");
	testOperator1("trace", 4, "[4; 2; 1]", "4");
	testOperator1("trace", 5, "[4 4; 2 2; 1 1]", "6");
}
{
	const testLUP = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const LUP = X.lup();
		const Y = LUP.P.T().mul(LUP.L).mul(LUP.U);
		const L_str = LUP.L.toOneLineString();
		const U_str = LUP.U.toOneLineString();
		const P_str = LUP.P.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "lup " + number + " lup(" + x + ")->";
		test(name + "L=" + L_str, () => { expect(LUP.L.isTriangleLower(epsilon)).toBe(true); });
		test(name + "U=" + U_str, () => { expect(LUP.U.isTriangleUpper(epsilon)).toBe(true); });
		test(name + "P=" + P_str, () => { expect(LUP.P.isPermutation(epsilon)).toBe(true); });
		test(name + "P^T*L*U=" + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testLUP(1, "[1 2 3 3;4 5 6 6;7 8 9 2]");
	testLUP(2, "[1 4 2;3 5 1;2 4 2;1 0 9]");
	testLUP(3, "[1 4 2;3 5 1;0 0 0;1 0 9]");
	testLUP(4, "[1 2 3;4 5 6;7 8 9]");
	testLUP(5, "[1 2;3 4;5 6]");
	testLUP(6, "[1 1;1 1;1 1]");
	testLUP(7, "[0 0 0;0 0 0]");
}

{
	testOperator2("linsolve", 1, "[2 1 3 4;3 2 5 2; 3 4 1 -1; -1 -3 1 3]", "[2; 12; 4; -1]", "[1; -1; 3; -2]");
}

{
	const testQR = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const QR = X.qr();
		const Y = QR.Q.mul(QR.R);
		const Q_str = QR.Q.toOneLineString();
		const R_str = QR.R.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "qr " + number + " qr(" + x + ")->";
		test(name + "Q=" + Q_str, () => { expect(QR.Q.isUnitary(epsilon)).toBe(true); });
		test(name + "R=" + R_str, () => { expect(QR.R.isTriangleUpper(epsilon)).toBe(true); });
		test(name + "Q*R=" + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testQR(1, "[1 2 3;4 5 6;7 8 9]");
	testQR(2, "[0 0 0;1 2 3;4 5 6]");
	testQR(3, "[1 2 3;4 5 6;0 0 0]");
	testQR(4, "[1 2; 3 4; 5 6]");
	testQR(5, "[1 2 3;4 5 6]");
	testQR(6, "[1 1;1 1;1 1]");
	testQR(7, "[0 0 0;0 0 0]");
}

{
	const testTRI = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const PH = X.tridiagonalize();
		const Y = PH.P.mul(PH.H).mul(PH.P.T());
		const P_str = PH.P.toOneLineString();
		const H_str = PH.H.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "tridiagonalize " + number + " tridiagonalize(" + x + ")->";
		test(name + "P=" + P_str, () => { expect(PH.P.isUnitary(epsilon)).toBe(true); });
		test(name + "H=" + H_str, () => { expect(PH.H.isTridiagonal(epsilon)).toBe(true); });
		test(name + "P*H*P'=" + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testTRI(1, "[1 2;2 1]");
	testTRI(2, "[1.0 0.5 0.3;0.5 1.0 0.6;0.3 0.6 1.0]");
	testTRI(3, "[1 1 1 1;1 2 2 2;1 2 3 3;1 2 3 4]");
	testTRI(4, "[0 0 0;0 0 0;0 0 0]");
}

{
	const testEIG = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const VD = X.eig();
		const Y = VD.V.mul(VD.D).mul(VD.V.T());
		const V_str = VD.V.toOneLineString();
		const D_str = VD.D.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "eig " + number + " eig(" + x + ")->";
		test(name + "V=" + V_str, () => { expect(VD.V.isUnitary(epsilon)).toBe(true); });
		test(name + "D=" + D_str, () => { expect(VD.D.isDiagonal(epsilon)).toBe(true); });
		test(name + "V*D*V'=" + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testEIG(1, "[1 2;2 1]");
	testEIG(2, "[1.0 0.5 0.3;0.5 1.0 0.6;0.3 0.6 1.0]");
	testEIG(3, "[1 1 1 1;1 2 2 2;1 2 3 3;1 2 3 4]");
	testEIG(4, "[0 0 0;0 0 0;0 0 0]");
}

{
	const testSVD = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const USV = X.svd();
		const Y = USV.U.mul(USV.S).mul(USV.V.T());
		const U_str = USV.U.toOneLineString();
		const S_str = USV.S.toOneLineString();
		const V_str = USV.V.toOneLineString();
		const Y_str = Y.toOneLineString();
		const name = "svd " + number + " svd(" + x + ")->";
		test(name + "U=" + U_str, () => { expect(USV.U.isUnitary(epsilon)).toBe(true); });
		test(name + "S=" + S_str, () => { expect(USV.S.isDiagonal(epsilon)).toBe(true); });
		test(name + "V=" + V_str, () => { expect(USV.V.isUnitary(epsilon)).toBe(true); });
		test(name + "U*S*V'=" + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testSVD(1, "[2 1 3 4;3 2 5 2; 3 4 1 -1; -1 -3 1 3]");
	testSVD(2, "[1 2 3;4 5 6;7 8 9]");
	testSVD(3, "[1 2 3;4 5 6]");
	testSVD(4, "[1 2;3 4;5 6]");
	testSVD(5, "[0 0 0;0 0 0]");
	testSVD(6, "[0 0;0 0;0 0]");
}

{
	const testINV = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const invX = X.inv();
		const Y = invX.mul(X);
		const Y_str = Y.toOneLineString();
		const name = "inv " + number + " inv(" + x + ")->";
		test(name + "X*(X^-1)=" + Y_str, () => { expect(Y.isIdentity(tolerance)).toBe(true); });
	};
	testINV(1, "[1 1 -1; -2 0 1; 0 2 1]");
}

{
	const testPINV = function(number, x, epsilon) {
		const tolerance = epsilon ? epsilon : 0.1;
		const X = $(x);
		const Y = X.pinv().pinv();
		const Y_str = Y.toOneLineString();
		const name = "pinv " + number + " pinv(" + x + ")->";
		test(name + "pinv(pinv(X)) = " + Y_str, () => { expect(X.equals(Y, tolerance)).toBe(true); });
	};
	testPINV(1, "[1 2;3 4;5 6]");
	testPINV(2, "[1 2 3;4 5 6;7 8 9]");
	testPINV(3, "[1 2 3 4;5 6 7 8]");
}

{
	testOperator1("det", 1, "[6 2;1 4]", "22");
	testOperator1("det", 2, "[1 2 3;0 -1 5;-2 3 4]", "-45");
	testOperator1("det", 3, "[3 2 1 0;1 2 3 4;2 1 0 1;2 0 2 1]", "-32");
}

{
	testOperator2("norm", 1, "3 + j", "1", "3.1623");
	testOperator2("norm", 2, "[1 -2 7 3]", "1", "13");
	testOperator2("norm", 3, "[1; -2; 7; 3]", "1", "13");
	testOperator2("norm", 4, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "1", "7.5");
}
{
	testOperator2("norm", 1, "3", "2", "3");
	testOperator2("norm", 2, "[1 -2 7 3]", "2", "7.9373");
	testOperator2("norm", 3, "[1; -2; 7; 3]", "2", "7.9373");
	testOperator2("norm", 4, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "2", "5.1347");
}
{
	testOperator2("norm", 1, "3", Number.POSITIVE_INFINITY, "3");
	testOperator2("norm", 2, "[1 -2 7 3]", Number.POSITIVE_INFINITY, "7");
	testOperator2("norm", 3, "[1; -2; 7; 3]", Number.POSITIVE_INFINITY, "7");
	testOperator2("norm", 4, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", Number.POSITIVE_INFINITY, "7.5000");
}
{
	testOperator2("norm", 1, "3", Number.NEGATIVE_INFINITY, "3");
	testOperator2("norm", 2, "[1 -2 7 3]", Number.NEGATIVE_INFINITY, "1");
	testOperator2("norm", 3, "[1; -2; 7; 3]", Number.NEGATIVE_INFINITY, "1");
	testOperator2("norm", 4, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", Number.NEGATIVE_INFINITY, "7.5000");
}
{
	testOperator2("norm", 1, "3", "2.5", "3");
	testOperator2("norm", 2, "[1 -2 7 3]", "2.5", "7.4578");
	testOperator2("norm", 3, "[1; -2; 7; 3]", "2.5", "7.4578");
}
{
	testOperator2("cond", 1, "3", 2, "1");
	testOperator2("cond", 2, "[1 -2 7 3]", 2, "1");
	testOperator2("cond", 3, "[1; -2; 7; 3]", 2, "1");
	testOperator2("cond", 4, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", 2, "2.7830");
}
{
	testOperator1("rcond", 1, "[-1 -2 1; 3 1.5 2; -3 4 0.5]", "0.16533");
}
