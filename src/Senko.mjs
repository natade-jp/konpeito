/**
 * The script is part of konpeito.
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

export default class Senko {

	static get File() {
		return File;
	}

	static get format() {
		return Format.format;
	}

	static get Log() {
		return Log;
	}

	static get BigInteger() {
		return BigInteger;
	}

	static get BigDecimal() {
		return BigDecimal;
	}

	static get RoundingMode() {
		return RoundingMode;
	}

	static get MathContext() {
		return MathContext;
	}

	static get Complex() {
		return Complex;
	}

	static get Matrix() {
		return Matrix;
	}

	static get Random() {
		return Random;
	}
	
}
