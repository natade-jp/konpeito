/**
 * The script is part of SenkoJS.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import MathX from "./mathx/MathX.mjs";
import File from "./basic/File.mjs";
import Format from "./basic/Format.mjs";
import Log from "./basic/Log.mjs";

const Senko = {};

Senko._printbuffer = "";
Senko.File = File;
Senko.format = Format.format;
Senko.Log = Log;
Senko.MathX = MathX;
Senko.BigInteger = MathX.BigInteger;
Senko.BigDecimal = MathX.BigDecimal;
Senko.RoundingMode = MathX.RoundingMode;
Senko.MathContext = MathX.MathContext;
Senko.Complex = MathX.Complex;
Senko.Matrix = MathX.Matrix;
Senko.Random = MathX.Random;

export default Senko;
