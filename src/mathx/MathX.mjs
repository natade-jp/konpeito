/**
 * The script is part of SenkoJS.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Random from "./toolbox/Random.mjs";
import BigDecimal from "./BigDecimal.mjs";
import BigInteger from "./BigInteger.mjs";
import Complex from "./Complex.mjs";
import Matrix from "./Matrix.mjs";

const MathX = {
	
	BigInteger : BigInteger,
	BigDecimal : BigDecimal,
	RoundingMode : BigDecimal.RoundingMode,
	MathContext : BigDecimal.MathContext,
	Complex : Complex,
	Matrix : Matrix,
	Random : Random

};

export default MathX;
