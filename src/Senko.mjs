/**
 * The script is part of SenkoJS.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import File from "./basic/File.mjs";
import Format from "./basic/Format.mjs";
import Log from "./basic/Log.mjs";

import Random from "./math/toolbox/Random.mjs";
import RoundingMode from "./math/toolbox/RoundingMode.mjs";
import MathContext from "./math/toolbox/MathContext.mjs";
import BigDecimal from "./math/BigDecimal.mjs";
import BigInteger from "./math/BigInteger.mjs";
import Complex from "./math/Complex.mjs";
import Matrix from "./math/Matrix.mjs";

const Senko = {};

Senko._printbuffer = "";
Senko.File = File;
Senko.format = Format.format;
Senko.Log = Log;
Senko.BigInteger = BigInteger;
Senko.BigDecimal = BigDecimal;
Senko.RoundingMode = RoundingMode;
Senko.MathContext = MathContext;
Senko.Complex = Complex;
Senko.Matrix = Matrix;
Senko.Random = Random;

export default Senko;
