import konpeito from "../../libs/konpeito.mjs";

const BigDecimal = konpeito.BigDecimal;
const RoundingMode = konpeito.RoundingMode;
const MathContext = konpeito.MathContext;
const Log = konpeito.Log;
const $ = BigDecimal.create;

const testPlainStringAndEngineeringString = function(text) {
	const decimal = new BigDecimal(text);
	Log.println(
		text + "\t->\t"
		+ decimal.toString() + "\t" + decimal.toPlainString() + "\t" + decimal.toEngineeringString()
		+ "\t( " + decimal.unscaledValue() + " e" + -1 * decimal.scale() + " )");
};

const getDecimalData = function(x) {
	return x.toString() + " ( " + x.unscaledValue() + " e" + -1 * x.scale() + " )";
};

const testDivideAndRemainder = function(x_, y_) {
	const x = new BigDecimal([x_, MathContext.UNLIMITED]);
	const y = new BigDecimal([y_, MathContext.UNLIMITED]);
	const z = x.divideAndRemainder(y);
	Log.println( x + "\t/\t" + y + "\t\t= " + getDecimalData(z[0]) + "\t... " + getDecimalData(z[1]) );
};

const main = function() {

	Log.println("BigDecimal クラスのサンプル");

	let x, y, z;
	
	Log.println("");
	
	Log.println("test toString, toPlainString, toEngineeringString");
	testPlainStringAndEngineeringString("0");
	testPlainStringAndEngineeringString("0.00");
	testPlainStringAndEngineeringString("123");
	testPlainStringAndEngineeringString("-123");
	testPlainStringAndEngineeringString("1.23E3");
	testPlainStringAndEngineeringString("1.23E+3");
	testPlainStringAndEngineeringString("12.3E+7");
	testPlainStringAndEngineeringString("12.0");
	testPlainStringAndEngineeringString("12.3");
	testPlainStringAndEngineeringString("0.00123");
	testPlainStringAndEngineeringString("1234.5E-4");
	testPlainStringAndEngineeringString("0E+7");
	testPlainStringAndEngineeringString("-0");
	testPlainStringAndEngineeringString("123e0");
	testPlainStringAndEngineeringString("-123e0");
	testPlainStringAndEngineeringString("123e+1");
	testPlainStringAndEngineeringString("123e+3");
	testPlainStringAndEngineeringString("123e-1");
	testPlainStringAndEngineeringString("123e-5");
	testPlainStringAndEngineeringString("123e-10");
	testPlainStringAndEngineeringString("-123e-12");

	Log.println("");
	
	Log.println("test ulp");
	x = new BigDecimal("0.0000001234");
	Log.println(x + "\t" + x.ulp());
	
	Log.println("");
	
	Log.println("test scale, precision");
	x = new BigDecimal("0.0013540");
	y = x.setScale(5, RoundingMode.HALF_EVEN);
	Log.println(getDecimalData(x) + " 精度 = " + x.precision());
	Log.println(getDecimalData(y) + " 精度 = " + y.precision());
	
	Log.println("");
	
	Log.println("setScale による四捨五入のテスト");
	x = new BigDecimal("0.5925");
	Log.println(x);
	Log.println("小数第一位で四捨五入:" + x.setScale(0, RoundingMode.HALF_UP));
	Log.println("小数第二位で四捨五入:" + x.setScale(1, RoundingMode.HALF_UP));
	Log.println("小数第三位で四捨五入:" + x.setScale(2, RoundingMode.HALF_UP));
	Log.println("小数第四位で四捨五入:" + x.setScale(3, RoundingMode.HALF_UP));

	Log.println("");
	
	Log.println("round による精度の変換");
	x = new BigDecimal("999");
	const mc = new BigDecimal.MathContext(2, RoundingMode.UP);
	y = x.round(mc);
	Log.println(x + " 精度 = " + x.precision());
	Log.println(y + " 精度 = " + y.precision());
	
	Log.println("");

	Log.println("割り算を除く四則演算");
	x = new BigDecimal(["3333.3333", MathContext.UNLIMITED]);
	y = new BigDecimal(["-123.45", MathContext.UNLIMITED]);
	Log.println(x + " + " + y + " = " + x.add(y));
	Log.println(x + " - " + y + " = " + x.subtract(y));
	Log.println(x + " * " + y + " = " + x.multiply(y));
	
	Log.println("");
	
	Log.println("test max, min");
	x = new BigDecimal("100");
	y = new BigDecimal("-234434");
	Log.println("max(" + x + ", " + y + ") = " + x.max(y));
	Log.println("min(" + x + ", " + y + ") = " + y.min(x));
	
	Log.println("");
	
	Log.println("test compare");
	x = new BigDecimal("110");
	y = new BigDecimal("1.1e2");
	Log.println("x = " + x + " = " + x.toPlainString());
	Log.println("y = " + y + " = " + y.toPlainString());
	Log.println("x === y => " + x.compareTo(y));
	
	Log.println("");
	
	Log.println("divideAndRemainder の計算後の scale テスト");
	// 1000e0		/	1e2				=	1000e-2	... 0e0
	testDivideAndRemainder("1000e0", "1e2");
	// 1000e0		/	10e1			=	100e-1	... 0e0
	// 1000e0		/	100e0			=	10e0	... 0e0
	testDivideAndRemainder("1000e0", "100e0");
	// 1000e0		/	1000e-1			=	1e1		... 0e0
	// 1000e0		/	10000e-2		=	1e1		... 0e-1
	testDivideAndRemainder("1000e0", "10000e-2");
	// 1000e0		/	100000e-3		=	1e1		... 0e-2
	testDivideAndRemainder("1000e0", "100000e-3");
	// 10e2			/	100e0			=	1e1		... 0e1
	testDivideAndRemainder("10e2", "100e0");
	// 100e1		/	100e0			=	1e1		... 0e1
	// 1000e0		/	100e0			=	10e0	... 0e0
	// 10000e-1		/	100e0			=	100e-1	... 0e-1
	// 100000e-2	/	100e0			=	1000e-2	... 0e-2
	testDivideAndRemainder("100000e-2", "100e0");

	Log.println("");
	
	Log.println("test movePointRight, movePointLeft");
	x = new BigDecimal("10");
	Log.println(getDecimalData(x.movePointRight(1)));
	Log.println(getDecimalData(x.movePointLeft(1)));

	Log.println("");
	
	Log.println("割り算のテスト");
	x = new BigDecimal("4.36");
	y = new BigDecimal("3.4");
	z = x.divide(y, MathContext.DECIMAL128);
	Log.println( x + " / " + y + " = " + z);
	
	Log.println("");
	
	Log.println("割り算のテスト（循環小数）");
	x = new BigDecimal(["1", MathContext.UNLIMITED]);
	y = new BigDecimal(["7", MathContext.UNLIMITED]);
	try {
		z = x.divide(y);
		Log.println( x + " / " + y + " = " + z);
	}
	catch(e) {
		Log.println( x + " / " + y + " = " + e);
	}

	try {
		z = x.divide(y, { context : MathContext.DECIMAL128 });
		Log.println( x + " / " + y + " = " + z);
	}
	catch(e) {
		Log.println( x + " / " + y + " = " + e);
	}
	
	Log.println("");
	
	Log.println("test stripTrailingZeros, intValueExact");
	x = new BigDecimal("-1123.00000");
	Log.println(getDecimalData(x));
	Log.println("0を削除 -> " + getDecimalData(x.stripTrailingZeros()));
	Log.println("整数化 -> " + x.intValueExact);
	
	Log.println("");
	
	Log.println("乗算");
	Log.println($("123.456").pow(30, MathContext.UNLIMITED));
	
	Log.println("乗算");
	Log.println($(123.456).pow(30, MathContext.UNLIMITED));
	
	// 丸め用のクラスの試験用
	// 入力値の 1 の位に対して、丸め後の数値へ、いくつ足せばいいかがかえる
	/*
	Log.println(RoundingMode.UP(11));
	Log.println(RoundingMode.UP(-11));
	Log.println(RoundingMode.DOWN(11));
	Log.println(RoundingMode.DOWN(-11));
	Log.println(RoundingMode.CEILING(11));
	Log.println(RoundingMode.CEILING(-11));
	Log.println(RoundingMode.FLOOR(11));
	Log.println(RoundingMode.FLOOR(-11));
	Log.println(RoundingMode.HALF_UP(11));
	Log.println(RoundingMode.HALF_UP(15));
	Log.println(RoundingMode.HALF_UP(18));
	Log.println(RoundingMode.HALF_UP(-11));
	Log.println(RoundingMode.HALF_UP(-15));
	Log.println(RoundingMode.HALF_UP(-18));
	Log.println(RoundingMode.HALF_DOWN(11));
	Log.println(RoundingMode.HALF_DOWN(15));
	Log.println(RoundingMode.HALF_DOWN(18));
	Log.println(RoundingMode.HALF_DOWN(-11));
	Log.println(RoundingMode.HALF_DOWN(-15));
	Log.println(RoundingMode.HALF_DOWN(-18));
	*/

};


main();
