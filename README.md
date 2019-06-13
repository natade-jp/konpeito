# konpeito
[![Build Status](https://travis-ci.org/natade-jp/konpeito.svg?branch=master)](https://travis-ci.org/natade-jp/konpeito)
[![ESDoc coverage badge](https://doc.esdoc.org/github.com/natade-jp/konpeito/badge.svg)](https://doc.esdoc.org/github.com/natade-jp/konpeito/)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)

"konpeito" is a library to "compute". :)

## What
- The library for math calculations.
- When calculating, use method chain.
- Coding in ES6, and published ES6 modules and UMD.
- [API reference is complete](https://doc.esdoc.org/github.com/natade-jp/konpeito/).

## Features
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
- [BigDecimal](https://natade-jp.github.io/konpeito/html/examples/demos/BigDecimal/)
- [BigInteger](https://natade-jp.github.io/konpeito/html/examples/demos/BigInteger/)
- [Matrix](https://natade-jp.github.io/konpeito/html/examples/demos/Matrix/)
- [Random](https://natade-jp.github.io/konpeito/html/examples/demos/Random/)
- [UMD](https://natade-jp.github.io/konpeito/html/examples/demos/UMD/)

## Install for node.js

1. This library can be installed using [npm](https://www.npmjs.com/package/konpeito).
```
npm install konpeito
```

2. Then you can include it in your code:
```
var konpeito = require("konpeito");
```

If you want to use in the ES6 module, please execute with the following command.
```
node --experimental-modules main.mjs
```

## Install for browser

1. Download the [zip](https://github.com/natade-jp/konpeito/archive/master.zip) by [GitHub](https://github.com/natade-jp/konpeito).

2. Please use mjs file when using ES6 modules. And use js file when using UMD.
- `./build/konpeito.module.mjs`
- `./build/konpeito.umd.js`

### with ES6 module.
```
<script type="module" src="./main.mjs" charset="utf-8"></script>
```

### with UMD
```
<script src="./konpeito.umd.js" charset="utf-8"></script>
<script src="./main.js" charset="utf-8"></script>
```

## Repository
- https://github.com/natade-jp/konpeito.git

## Sample

### BigInteger
arbitrary-precision integer class.

```
import konpeito from "konpeito.module.mjs";
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
import konpeito from "konpeito.module.mjs";
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
import konpeito from "konpeito.module.mjs";
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
import konpeito from "konpeito.module.mjs";
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
 0.2298 -0.8835  0.4082
 0.5247 -0.2408 -0.8165
 0.8196  0.4019  0.4082
> 
 9.5255  0.0000
 0.0000  0.5143
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
