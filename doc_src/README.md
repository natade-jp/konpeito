# konpeito.js

## What
- The "konpeito.js" is a library for math calculations.
- This code is a module coded by ES6.
- This library is available for ES6 modules or UMD.
- When calculating, use method chain.

### Usage
This library has 4 functions.
- BigInteger
- BigDecimal
- Complex
- Matrix

Has the following features.
- BigDecimal is constructed by BigInteger.
- Matrix is constructed by array of Complex.
- Matrix and Complex can't use huge real numbers like BigInteger or BigDecimal, but they are powerful.
- Matrix initialization can be described as Scilab, Octave, MATLAB.

Please check the console and main.mjs.
- [BigDecimal](../doc_src/examples/demos/BigDecimal/)
- [BigInteger](../doc_src/examples/demos/BigInteger/)
- [Matrix](../doc_src/examples/demos/Matrix/)
- [Random](../doc_src/examples/demos/Random/)
- [UMD](../doc_src/examples/demos/UMD/)

### Repository
- konpeito.js(https://github.com/natade-jp/konpeito)

## Sample

### start with Node.js
```
node --experimental-modules main.mjs
```

### start with browser
```
<script type="module" src="./main.mjs" charset="utf-8"></script>
```

### start with browser and UMD
```
<script src="./konpeito.umd.js" charset="utf-8"></script>
<script src="./main.js" charset="utf-8"></script>
```

### BigInteger
arbitrary-precision integer class.

```
import konpeito from "konpeito.mjs";
const BigInteger = konpeito.BigInteger;
const $ = BigInteger.create;

console.log($("-1234567890").mul("987654321098765432109876543210").toString());
console.log($("7").pow("50").toString());
```
```
> -1219326311248285321124828532111263526900
> 1798465042647412146620280340569649349251249
```

### BigDecimal
floating-point math class.

```
import konpeito from "konpeito.mjs";
const BigDecimal = konpeito.BigDecimal;
const MathContext = konpeito.MathContext;
const $ = BigDecimal.create;

BigDecimal.setDefaultContext(MathContext.UNLIMITED);
console.log($("-123456.7890").mul("987654321098765.432109876543210").toString());
```
```
> -121932631124828532112.4828532111263526900
```

### Complex
complex class.
- use the JavaScript standard number.

```
import konpeito from "konpeito.mjs";
const Complex = konpeito.Complex;
const $ = Complex.create;

console.log($("3 + 4i").pow("2 + 8j").toString());
```
```
> -0.0083837 + 0.0124424i
```

### Matrix
complex matrix class.
- use the JavaScript standard number.
- Some methods do not support complex arithmetic.

```
import konpeito from "konpeito.mjs";
const Matrix = konpeito.Matrix;
const $ = Matrix.create;

console.log($("[1 2;3 4;5 6]").toString());
const USV = $("[1 2;3 4;5 6]").svd();
console.log(USV.U.toString());
console.log(USV.S.toString());
console.log(USV.V.toString());
console.log(USV.U.mul(USV.S).mul(USV.V.T()).toString());

console.log($("[1+j 2-3j -3 -4]").fft().toString());
console.log($("[1 2 30]").dct().toString());
```
```
>
 1  2
 3  4
 5  6
> 
-0.2408  0.5247 -0.8165
 0.4019  0.8196  0.4082
> 
 0.5143  0.0000
 0.0000  9.5255
 0.0000  0.0000
> 
 0.7849  0.6196
-0.6196  0.7849
> 
 1.0000  2.0000
 3.0000  4.0000
 5.0000  6.0000
> -4.0000 - 2.0000i  1.0000 - 5.0000i  0.0000 + 4.0000i  7.0000 + 7.0000i
> 19.0526 -20.5061  11.0227
```