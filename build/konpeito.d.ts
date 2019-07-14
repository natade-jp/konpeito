/**
 * Class collection of numerical calculation processing.
 * These classes are classified into a BigInteger and BigDecimal and Matrix.
 * - BigInteger is the calculation class for arbitrary-precision integer arithmetic.
 * - BigDecimal is a calculation class for arbitrary-precision floating point arithmetic.
 * - Matrix is a general-purpose calculation class with signal processing and statistical processing.
 */
declare class konpeito {
    /**
     * Return typedef BigInteger for arbitrary-precision integer calculation.
     * @returns {typeof BigInteger}
     */
    static BigInteger: typeof BigInteger;
    /**
     * Return typedef BigDecimal for arbitrary-precision floating-point number.
     * @returns {typeof BigDecimal}
     */
    static BigDecimal: typeof BigDecimal;
    /**
     * Return Rounding class for BigDecimal.
     * @returns {typeof RoundingMode}
     */
    static RoundingMode: typeof RoundingMode;
    /**
     * Return Configuration class for BigDecimal.
     * @returns {typeof MathContext}
     */
    static MathContext: typeof MathContext;
    /**
     * Return typedef Fraction for infinite precision arithmetic.
     * @returns {typeof Fraction}
     */
    static Fraction: typeof Fraction;
    /**
     * Return typedef Complex for complex number calculation.
     * @returns {typeof Complex}
     */
    static Complex: typeof Complex;
    /**
     * Return typedef Matrix for complex matrix calculation.
     * @returns {typeof Matrix}
     */
    static Matrix: typeof Matrix;
    /**
     * Return typedef Random.
     * @returns {typeof Random}
     */
    static Random: typeof Random;
}

/**
 * Setting of calculation result of division.
 * @typedef {Object} BigDecimalDivideType
 * @property {number} [scale] Scale of rounding.
 * @property {RoundingModeEntity} [roundingMode] Rounding mode.
 * @property {MathContext} [context] Configuration.(scale and roundingMode are unnecessary.)
 */
declare type BigDecimalDivideType = {
    scale?: number;
    roundingMode?: RoundingModeEntity;
    context?: MathContext;
};

/**
 * Create an arbitrary-precision floating-point number.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - When initializing with array. [ integer, [scale = 0], [default_context=default], [context=default] ].
 * - When initializing with object. { integer, [scale = 0], [default_context=default], [context=default] }.
 *
 * Description of the settings are as follows, you can also omitted.
 * - The "scale" is an integer scale factor.
 * - The "default_context" is the used when no environment settings are specified during calculation.
 * - The "context" is used to normalize the created floating point.
 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
 */
declare class BigDecimal {
    constructor(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any);
    /**
     * Create an arbitrary-precision floating-point number.
     * - When initializing with array. [ integer, [scale = 0], [default_context=default], [context=default] ].
     * - When initializing with object. { integer, [scale = 0], [default_context=default], [context=default] }.
     *
     * default_context
     * - The "scale" is an integer scale factor.
     * - The "default_context" is the used when no environment settings are specified during calculation.
     * - The "context" is used to normalize the created floating point.
     *
     * These 3 settings can be omitted.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - Real data.
     * @returns {BigDecimal}
     */
    static create(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Convert number to BigDecimal type.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} x
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [scale]
     * @returns {BigDecimal}
     */
    static valueOf(x: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, scale?: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Return string of this number without sign.
     * If cache is already created, return cache.
     * @returns {string}
     */
    _getUnsignedIntegerString(): string;
    /**
     * Deep copy.
     * @returns {BigDecimal}
     */
    clone(): BigDecimal;
    /**
     * The scale of this BigDecimal.
     * @returns {number}
     */
    scale(): number;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    signum(): number;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    sign(): number;
    /**
     * Precision.
     * @returns {number}
     */
    precision(): number;
    /**
     * An integer with the exponent part removed.
     * @returns {BigInteger}
     */
    unscaledValue(): BigInteger;
    /**
     * The smallest value that can be represented with the set precision.
     * @returns {BigDecimal}
     */
    ulp(): BigDecimal;
    /**
     * Absolute value.
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
     * @returns {BigDecimal} abs(A)
     */
    abs(mc?: MathContext): BigDecimal;
    /**
     * this * 1
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
     * @returns {BigDecimal} +A
     */
    plus(mc?: MathContext): BigDecimal;
    /**
     * this * -1
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object..
     * @returns {BigDecimal} -A
     */
    negate(mc?: MathContext): BigDecimal;
    /**
     * Multiply a multiple of ten.
     * Only the scale is changed without changing the precision.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal} A * 10^floor(n)
     */
    scaleByPowerOfTen(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Move the decimal point to the left.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal}
     */
    movePointLeft(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Move the decimal point to the right.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal}
     */
    movePointRight(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Remove the 0 to the right of the numbers and normalize the scale.
     * @returns {BigDecimal}
     */
    stripTrailingZeros(): BigDecimal;
    /**
     * Add.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A + B
     */
    add(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Subtract.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A - B
     */
    subtract(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Subtract.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A - B
     */
    sub(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Multiply.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A * B
     */
    multiply(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Multiply.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A * B
     */
    mul(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Divide not calculated to the decimal point.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} (int)(A / B)
     */
    divideToIntegralValue(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Divide and remainder.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
     */
    divideAndRemainder(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal[];
    /**
     * Remainder of division.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A % B
     */
    rem(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Modulo, positive remainder of division.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} A mod B
     */
    mod(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Divide.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
     * @returns {BigDecimal}
     */
    divide(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, type?: BigDecimalDivideType): BigDecimal;
    /**
     * Divide.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {BigDecimalDivideType} [type] - Scale, MathContext, RoundingMode used for the calculation.
     * @returns {BigDecimal} A / B
     */
    div(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, type?: BigDecimalDivideType): BigDecimal;
    /**
     * Get as a BigInteger.
     * @returns {BigInteger}
     */
    toBigInteger(): BigInteger;
    /**
     * Get as a BigInteger.
     * An error occurs if conversion fails.
     * @returns {BigInteger}
     */
    toBigIntegerExact(): BigInteger;
    /**
     * 32-bit integer value.
     * @returns {number}
     */
    intValue: number;
    /**
     * 32-bit integer value.
     * An error occurs if conversion fails.
     * @returns {number}
     */
    intValueExact: number;
    /**
     * 32-bit floating point.
     * @returns {number}
     */
    floatValue: number;
    /**
     * 64-bit floating point.
     * @returns {number}
     */
    doubleValue: number;
    /**
     * Power function.
     * - Supports only integers.
     * - An exception occurs when doing a huge multiplication.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - MathContext setting after calculation. If omitted, use the MathContext of the B.
     * @returns {BigDecimal} pow(A, B)
     */
    pow(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * Set default the MathContext.
     * This is used if you do not specify MathContext when creating a new object.
     * @param {MathContext} [context=MathContext.DECIMAL128]
     */
    static setDefaultContext(context?: MathContext): void;
    /**
     * Return default MathContext class.
     * Used when MathContext not specified explicitly.
     * @returns {MathContext}
     */
    static getDefaultContext(): MathContext;
    /**
     * Equals.
     * - Attention : Test for equality, including the precision and the scale.
     * - Use the "compareTo" if you only want to find out whether they are also mathematically equal.
     * - If you specify a "tolerance", it is calculated by ignoring the test of the precision and the scale.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, tolerance?: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): boolean;
    /**
     * Compare values.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, tolerance?: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): number;
    /**
     * Maximum number.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {BigDecimal} max([A, B])
     */
    max(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Minimum number.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {BigDecimal} min([A, B])
     */
    min(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Clip number within range.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} min
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} max
     * @returns {BigDecimal} min(max(x, min), max)
     */
    clip(min: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, max: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Convert to string using scientific notation.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} e_len - Number of digits in exponent part.
     * @returns {string}
     */
    toScientificNotation(e_len: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): string;
    /**
     * Convert to string usding technical notation.
     * @returns {string}
     */
    toEngineeringString(): string;
    /**
     * Convert to string without exponential notation.
     * @returns {string}
     */
    toPlainString(): string;
    /**
     * Change the scale.
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} new_scale - New scale.
     * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - Rounding method when converting precision.
     * @param {MathContext} [mc] - Rounding setting after calculation. For rounding purposes, use the round method.
     * @returns {BigDecimal}
     */
    setScale(new_scale: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, rounding_mode?: RoundingModeEntity, mc?: MathContext): BigDecimal;
    /**
     * Round with specified settings.
     *
     * This method is not a method round the decimal point.
     * This method converts numbers in the specified Context and rounds unconvertible digits.
     *
     * Use this.setScale(0, RoundingMode.HALF_UP) if you want to round the decimal point.
     * When the argument is omitted, such decimal point rounding operation is performed.
     * @param {MathContext} [mc] - New setting.
     * @returns {BigDecimal}
     */
    round(mc?: MathContext): BigDecimal;
    /**
     * Floor.
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
     * @returns {BigDecimal} floor(A)
     */
    floor(mc?: MathContext): BigDecimal;
    /**
     * Ceil.
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
     * @returns {BigDecimal} ceil(A)
     */
    ceil(mc?: MathContext): BigDecimal;
    /**
     * To integer rounded down to the nearest.
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
     * @returns {BigDecimal} fix(A), trunc(A)
     */
    fix(mc?: MathContext): BigDecimal;
    /**
     * Fraction.
     * @param {MathContext} [mc] - MathContext setting after calculation. If omitted, use the MathContext of this object.
     * @returns {BigDecimal} fract(A)
     */
    fract(mc?: MathContext): BigDecimal;
    /**
     * this === 0
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * this === 1
     * @returns {boolean}
     */
    isOne(): boolean;
    /**
     * this > 0
     * @returns {boolean}
     */
    isPositive(): boolean;
    /**
     * this < 0
     * @returns {boolean}
     */
    isNegative(): boolean;
    /**
     * this >= 0
     * @returns {boolean}
     */
    isNotNegative(): boolean;
    /**
     * -1
     * @returns {BigDecimal} -1
     */
    static MINUS_ONE: BigDecimal;
    /**
     * 0
     * @returns {BigDecimal} 0
     */
    static ZERO: BigDecimal;
    /**
     * 0.5
     * @returns {BigDecimal} 0.5
     */
    static HALF: BigDecimal;
    /**
     * 1
     * @returns {BigDecimal} 1
     */
    static ONE: BigDecimal;
    /**
     * 2
     * @returns {BigDecimal} 2
     */
    static TWO: BigDecimal;
    /**
     * 10
     * @returns {BigDecimal} 10
     */
    static TEN: BigDecimal;
}

/**
 * Create an arbitrary-precision integer.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
 * - "0xff", ["ff", 16]
 * - "0o01234567", ["01234567", 8]
 * - "0b0110101", ["0110101", 2]
 * @param {BigInteger|number|string|Array<string|number>|Object} [number] - Numeric data. See how to use the function.
 */
declare class BigInteger {
    constructor(number?: BigInteger | number | string | (string | number)[] | any);
    /**
     * Create an entity object of this class.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger}
     */
    static create(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Create an arbitrary-precision integer.
     * - Does not support strings using exponential notation.
     * - If you want to initialize with the specified base number, please set up with an array ["ff", 16].
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger}
     */
    static valueOf(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Random number of specified bit length.
     * @param {BigInteger|number|string|Array<string|number>|Object} bitsize - Bit length.
     * @param {Random} [random] - Class for creating random numbers.
     * @returns {BigInteger}
     */
    static createRandomBigInteger(bitsize: BigInteger | number | string | (string | number)[] | any, random?: Random): BigInteger;
    /**
     * Convert to string.
     * @param {BigInteger|number|string|Array<string|number>|Object} [radix=10] - Base number.
     * @returns {string}
     */
    toString(radix?: BigInteger | number | string | (string | number)[] | any): string;
    /**
     * Value at the specified position of the internally used array that composed of hexadecimal numbers.
     * @param {BigInteger|number|string|Array<string|number>|Object} point - Array address.
     * @returns {number}
     */
    getShort(point: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * 32-bit integer value.
     * - If it is outside the range of JavaScript Number, it will not be an accurate number.
     * @returns {number}
     */
    intValue: number;
    /**
     * 64-bit integer value.
     * - If it is outside the range of JavaScript Number, it will not be an accurate number.
     * @returns {number}
     */
    longValue: number;
    /**
     * 64-bit floating point.
     * - If it is outside the range of JavaScript Number, it will not be an accurate number.
     * @returns {number}
     */
    doubleValue: number;
    /**
     * Deep copy.
     * @returns {BigInteger}
     */
    clone(): BigInteger;
    /**
     * Absolute value.
     * @returns {BigInteger} abs(A)
     */
    abs(): BigInteger;
    /**
     * this * -1
     * @returns {BigInteger} -A
     */
    negate(): BigInteger;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number} 1, -1, 0の場合は0を返す
     */
    signum(): number;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number} 1, -1, 0の場合は0を返す
     */
    sign(): number;
    /**
     * Add.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A + B
     */
    add(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Subtract.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A - B
     */
    subtract(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Subtract.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A - B
     */
    sub(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Multiply.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A * B
     */
    multiply(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Multiply.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A * B
     */
    mul(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Divide and remainder.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {Array<BigInteger>} [C = fix(A / B), A - C * B]
     */
    divideAndRemainder(number: BigInteger | number | string | (string | number)[] | any): BigInteger[];
    /**
     * Divide.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} fix(A / B)
     */
    divide(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Divide.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} fix(A / B)
     */
    div(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Remainder of division.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A % B
     */
    remainder(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Remainder of division.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A % B
     */
    rem(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Modulo, positive remainder of division.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A mod B
     */
    mod(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Power function.
     * - Supports only integers.
     * @param {BigInteger|number|string|Array<string|number>|Object} exponent
     * @returns {BigInteger} pow(A, B)
     */
    pow(exponent: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Modular exponentiation.
     * @param {BigInteger|number|string|Array<string|number>|Object} exponent
     * @param {BigInteger|number|string|Array<string|number>|Object} m
     * @returns {BigInteger} A^B mod m
     */
    modPow(exponent: BigInteger | number | string | (string | number)[] | any, m: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Modular multiplicative inverse.
     * @param {BigInteger|number|string|Array<string|number>|Object} m
     * @returns {BigInteger} A^(-1) mod m
     */
    modInverse(m: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Factorial function, x!.
     * @returns {BigInteger} n!
     */
    factorial(): BigInteger;
    /**
     * Multiply a multiple of ten.
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} x * 10^n
     */
    scaleByPowerOfTen(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Set default class of random.
     * This is used if you do not specify a random number.
     * @param {Random} random
     */
    static setDefaultRandom(random: Random): void;
    /**
     * Return default Random class.
     * Used when Random not specified explicitly.
     * @returns {Random}
     */
    static getDefaultRandom(): Random;
    /**
     * Euclidean algorithm.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} gcd(x, y)
     */
    gcd(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Extended Euclidean algorithm.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {Array<BigInteger>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
     */
    extgcd(number: BigInteger | number | string | (string | number)[] | any): BigInteger[];
    /**
     * Least common multiple.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} lcm(x, y)
     */
    lcm(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Equals.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {boolean} A === B
     */
    equals(number: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * Compare values without sign.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
     */
    compareToAbs(number: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * Compare values.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * Maximum number.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} max([A, B])
     */
    max(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Minimum number.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} min([A, B])
     */
    min(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Clip number within range.
     * @param {BigInteger|number|string|Array<string|number>|Object} min
     * @param {BigInteger|number|string|Array<string|number>|Object} max
     * @returns {BigInteger} min(max(x, min), max)
     */
    clip(min: BigInteger | number | string | (string | number)[] | any, max: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Prime represented within the specified bit length.
     * @param {BigInteger|number|string|Array<string|number>|Object} bits - Bit length.
     * @param {Random} [random] - Class for creating random numbers.
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @param {BigInteger|number|string|Array<string|number>|Object} [create_count=500] - Number of times to retry if prime generation fails.
     * @returns {BigInteger}
     */
    static probablePrime(bits: BigInteger | number | string | (string | number)[] | any, random?: Random, certainty?: BigInteger | number | string | (string | number)[] | any, create_count?: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Return true if the value is prime number by Miller-Labin prime number determination method.
     * Attention : it takes a very long time to process.
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @returns {boolean}
     */
    isProbablePrime(certainty?: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * Next prime.
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @param {BigInteger|number|string|Array<string|number>|Object} [search_max=100000] - Search range of next prime.
     * @returns {BigInteger}
     */
    nextProbablePrime(certainty?: BigInteger | number | string | (string | number)[] | any, search_max?: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * this << n
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A << n
     */
    shift(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * this << n
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A << n
     */
    shiftLeft(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * this >> n
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A >> n
     */
    shiftRight(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Number of digits in which the number "1" appears first when expressed in binary.
     * - Return -1 If 1 is not found it.
     * @returns {number}
     */
    getLowestSetBit(): number;
    /**
     * Length when the number is binary.
     * @returns {number}
     */
    bitLength(): number;
    /**
     * Sum that the bit is 1 when represented in the two's complement.
     * @returns {number}
     */
    bitCount(): number;
    /**
     * Logical AND.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & B
     */
    and(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical OR.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A | B
     */
    or(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical Exclusive-OR.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A ^ B
     */
    xor(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical Not. (mutable)
     * @returns {BigInteger} !A
     */
    not(): BigInteger;
    /**
     * Logical Not-AND.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & (!B)
     */
    andNot(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical Not-AND.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & (!B)
     */
    nand(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical Not-OR.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} !(A | B)
     */
    orNot(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Logical Not-OR.
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} !(A | B)
     */
    nor(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * this | (1 << n)
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    setBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Invert a specific bit.
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    flipBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Lower a specific bit.
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    clearBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * Test if a particular bit is on.
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {boolean}
     */
    testBit(bit: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * this === 0
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * this === 1
     * @returns {boolean}
     */
    isOne(): boolean;
    /**
     * this > 0
     * @returns {boolean}
     */
    isPositive(): boolean;
    /**
     * this < 0
     * @returns {boolean}
     */
    isNegative(): boolean;
    /**
     * this >= 0
     * @returns {boolean}
     */
    isNotNegative(): boolean;
    /**
     * -1
     * @returns {BigInteger} -1
     */
    static MINUS_ONE: BigInteger;
    /**
     * 0
     * @returns {BigInteger} 0
     */
    static ZERO: BigInteger;
    /**
     * 1
     * @returns {BigInteger} 1
     */
    static ONE: BigInteger;
    /**
     * 2
     * @returns {BigInteger} 2
     */
    static TWO: BigInteger;
    /**
     * 10
     * @returns {BigInteger} 10
     */
    static TEN: BigInteger;
}

/**
 * Create a complex number.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - Complex number. See how to use the function.
 */
declare class Complex {
    constructor(number: Complex | number | string | number[] | any | any);
    /**
     * Create an entity object of this class.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex}
     */
    static create(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Convert number to Complex type.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex}
     */
    static valueOf(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * integer value.
     * @returns {number}
     */
    intValue: number;
    /**
     * floating point.
     * @returns {number}
     */
    doubleValue: number;
    /**
     * Deep copy.
     * @returns {Complex}
     */
    clone(): Complex;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Create random values with uniform random numbers.
     * @returns {Complex}
     */
    static rand(): Complex;
    /**
     * Create random values with normal distribution.
     * @returns {Complex}
     */
    static randn(): Complex;
    /**
     * The real part of this Comlex.
     * @returns {number} real(A)
     */
    real: number;
    /**
     * The imaginary part of this Comlex.
     * @returns {number} imag(A)
     */
    imag: number;
    /**
     * norm.
     * @returns {number} |A|
     */
    norm: number;
    /**
     * The argument of this complex number.
     * @returns {number} arg(A)
     */
    arg: number;
    /**
     * Return number of decimal places for real and imaginary parts.
     * - Used to make a string.
     * @returns {number} Number of decimal places.
     */
    getDecimalPosition(): number;
    /**
     * Add.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A + B
     */
    add(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Subtract.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A - B
     */
    sub(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Multiply.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A * B
     */
    mul(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Inner product/Dot product.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A * conj(B)
     */
    dot(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Divide.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A / B
     */
    div(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Modulo, positive remainder of division.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - Divided value (real number only).
     * @returns {Complex} A mod B
     */
    mod(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Inverse number of this value.
     * @returns {Complex} 1 / A
     */
    inv(): Complex;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {Complex}
     */
    sign(): Complex;
    /**
     * Equals.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: Complex | number | string | number[] | any | any, tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * Compare values.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: Complex | number | string | number[] | any | any, tolerance?: Complex | number | string | number[] | any | any): number;
    /**
     * Maximum number.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} max([A, B])
     */
    max(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Minimum number.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} min([A, B])
     */
    min(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Clip number within range.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} min
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} max
     * @returns {Complex} min(max(x, min), max)
     */
    clip(min: Complex | number | string | number[] | any | any, max: Complex | number | string | number[] | any | any): Complex;
    /**
     * Return true if the value is integer.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isInteger(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * Returns true if the vallue is complex integer (including normal integer).
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} real(A) === integer && imag(A) === integer
     */
    isComplexInteger(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * this === 0
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 0
     */
    isZero(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * this === 1
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 1
     */
    isOne(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * Returns true if the vallue is complex number (imaginary part is not 0).
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) !== 0
     */
    isComplex(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * Return true if the value is real number.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) === 0
     */
    isReal(tolerance?: Complex | number | string | number[] | any | any): boolean;
    /**
     * this === NaN
     * @returns {boolean} isNaN(A)
     */
    isNaN(): boolean;
    /**
     * Return true if this real part of the complex positive.
     * @returns {boolean} real(x) > 0
     */
    isPositive(): boolean;
    /**
     * real(this) < 0
     * @returns {boolean} real(x) < 0
     */
    isNegative(): boolean;
    /**
     * real(this) >= 0
     * @returns {boolean} real(x) >= 0
     */
    isNotNegative(): boolean;
    /**
     * this === Infinity
     * @returns {boolean} isInfinite(A)
     */
    isInfinite(): boolean;
    /**
     * Return true if the value is finite number.
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * Absolute value.
     * @returns {Complex} abs(A)
     */
    abs(): Complex;
    /**
     * Complex conjugate.
     * @returns {Complex} real(A) - imag(A)j
     */
    conj(): Complex;
    /**
     * this * -1
     * @returns {Complex} -A
     */
    negate(): Complex;
    /**
     * Power function.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} pow(A, B)
     */
    pow(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * Square.
     * @returns {Complex} pow(A, 2)
     */
    square(): Complex;
    /**
     * Square root.
     * @returns {Complex} sqrt(A)
     */
    sqrt(): Complex;
    /**
     * Logarithmic function.
     * @returns {Complex} log(A)
     */
    log(): Complex;
    /**
     * Exponential function.
     * @returns {Complex} exp(A)
     */
    exp(): Complex;
    /**
     * Sine function.
     * @returns {Complex} sin(A)
     */
    sin(): Complex;
    /**
     * Cosine function.
     * @returns {Complex} cos(A)
     */
    cos(): Complex;
    /**
     * Tangent function.
     * @returns {Complex} tan(A)
     */
    tan(): Complex;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI/2, PI/2].
     * @returns {Complex} atan(A)
     */
    atan(): Complex;
    /**
     * Atan (arc tangent) function.
     * Return the values of [-PI, PI] .
     * Supports only real numbers.
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - X
     * @returns {Complex} atan2(Y, X)
     */
    atan2(number?: Complex | number | string | number[] | any | any): Complex;
    /**
     * Normalized sinc function.
     * @returns {Complex} sinc(A)
     */
    sinc(): Complex;
    /**
     * Floor.
     * @returns {Complex} floor(A)
     */
    floor(): Complex;
    /**
     * Ceil.
     * @returns {Complex} ceil(A)
     */
    ceil(): Complex;
    /**
     * Rounding to the nearest integer.
     * @returns {Complex} round(A)
     */
    round(): Complex;
    /**
     * To integer rounded down to the nearest.
     * @returns {Complex} fix(A), trunc(A)
     */
    fix(): Complex;
    /**
     * Fraction.
     * @returns {Complex} fract(A)
     */
    fract(): Complex;
    /**
     * 1
     * @returns {Complex} 1
     */
    static ONE: Complex;
    /**
     * 2
     * @returns {Complex} 2
     */
    static TWO: Complex;
    /**
     * 10
     * @returns {Complex} 10
     */
    static TEN: Complex;
    /**
     * 0
     * @returns {Complex} 0
     */
    static ZERO: Complex;
    /**
     * -1
     * @returns {Complex} -1
     */
    static MINUS_ONE: Complex;
    /**
     * i, j
     * @returns {Complex} i
     */
    static I: Complex;
    /**
     * Pi.
     * @returns {Complex} 3.14...
     */
    static PI: Complex;
    /**
     * E, Napier's constant.
     * @returns {Complex} 2.71...
     */
    static E: Complex;
    /**
     * log_e(2)
     * @returns {Complex} ln(2)
     */
    static LN2: Complex;
    /**
     * log_e(10)
     * @returns {Complex} ln(10)
     */
    static LN10: Complex;
    /**
     * log_2(e)
     * @returns {Complex} log_2(e)
     */
    static LOG2E: Complex;
    /**
     * log_10(e)
     * @returns {Complex} log_10(e)
     */
    static LOG10E: Complex;
    /**
     * sqrt(2)
     * @returns {Complex} sqrt(2)
     */
    static SQRT2: Complex;
    /**
     * sqrt(0.5)
     * @returns {Complex} sqrt(0.5)
     */
    static SQRT1_2: Complex;
    /**
     * 0.5
     * @returns {Complex} 0.5
     */
    static HALF: Complex;
    /**
     * Positive infinity.
     * @returns {Complex} Infinity
     */
    static POSITIVE_INFINITY: Complex;
    /**
     * Negative Infinity.
     * @returns {Complex} -Infinity
     */
    static NEGATIVE_INFINITY: Complex;
    /**
     * Not a Number.
     * @returns {Complex} NaN
     */
    static NaN: Complex;
}

/**
 * Create BigDecimal configuration.
 * @param {string|number} precision_or_name - Precision. Or String output by MathContext.toString.
 * @param {RoundingModeEntity} [roundingMode=RoundingMode.HALF_UP] - RoundingMode.
 */
declare class MathContext {
    constructor(precision_or_name: string | number, roundingMode?: RoundingModeEntity);
    /**
     * The precision of this BigDecimal.
     * @returns {number}
     */
    getPrecision(): number;
    /**
     * Method of rounding.
     * @returns {RoundingModeEntity}
     */
    getRoundingMode(): RoundingModeEntity;
    /**
     * Equals.
     * @param {MathContext} x - Number to compare.
     * @returns {boolean}
     */
    equals(x: MathContext): boolean;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * No decimal point limit.
     * However, an error occurs in the case of cyclic fraction in division.
     * @returns {MathContext}
     */
    static UNLIMITED: MathContext;
    /**
     * 32-bit floating point.
     * Equivalent of the C language float.
     * @returns {MathContext}
     */
    static DECIMAL32: MathContext;
    /**
     * 64-bit floating point.
     * Equivalent of the C language double.
     * @returns {MathContext}
     */
    static DECIMAL64: MathContext;
    /**
     * 128-bit floating point.
     * Equivalent of the C language long double.
     * @returns {MathContext}
     */
    static DECIMAL128: MathContext;
}

/**
 * Base class for rounding mode for BigDecimal.
 */
declare class RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_UP extends RoundingModeEntity {
}

/**
 * Directed rounding to an integer.
 * Round towards positive infinity if positive, negative infinity if negative.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_UP implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_DOWN extends RoundingModeEntity {
}

/**
 * Directed rounding to an integer.
 * Round towards 0.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_DOWN implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_CEILING extends RoundingModeEntity {
}

/**
 * Directed rounding to an integer.
 * Round up to positive infinity.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_CEILING implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_FLOOR extends RoundingModeEntity {
}

/**
 * Directed rounding to an integer.
 * Round down to negative infinity.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_FLOOR implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_UP extends RoundingModeEntity {
}

/**
 * Rounding to the nearest integer.
 * Round half towards positive infinity.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_UP implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_DOWN extends RoundingModeEntity {
}

/**
 * Rounding to the nearest integer.
 * Round half towards negative infinity.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_DOWN implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_EVEN extends RoundingModeEntity {
}

/**
 * Rounding to the nearest integer
 * Round to the nearest side. If the median, round to the even side.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_EVEN implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_UNNECESSARY extends RoundingModeEntity {
}

/**
 * Do not round.
 * Error if you need to round it.
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_UNNECESSARY implements RoundingModeEntity {
    /**
     * Get rounding mode name in upper case English.
     * @returns {string} Rounding method name.
     */
    static toString(): string;
    /**
     * Numeric value to add.
     * It is rounded when this value is added.
     * @param {number} x - Rounding value. When specified as an integer, the first digit is rounded.
     * @returns {number} Numeric value to add.
     */
    static getAddNumber(x: number): number;
}

/**
 * Rounding mode class for BigDecimal.
 */
declare class RoundingMode {
    /**
     * Get rounding class represented by specified string.
     * @param {string|RoundingModeEntity|Object} name - Mode name.
     * @returns {typeof RoundingModeEntity}
     */
    static valueOf(name: string | RoundingModeEntity | any): typeof RoundingModeEntity;
    /**
     * Directed rounding to an integer.
     * Round towards positive infinity if positive, negative infinity if negative.
     * @returns {typeof RoundingModeEntity}
     */
    static UP: typeof RoundingModeEntity;
    /**
     * Directed rounding to an integer.
     * Round towards 0.
     * @returns {typeof RoundingModeEntity}
     */
    static DOWN: typeof RoundingModeEntity;
    /**
     * Directed rounding to an integer.
     * Round up to positive infinity.
     * @returns {typeof RoundingModeEntity}
     */
    static CEILING: typeof RoundingModeEntity;
    /**
     * Directed rounding to an integer.
     * Round down to negative infinity.
     * @returns {typeof RoundingModeEntity}
     */
    static FLOOR: typeof RoundingModeEntity;
    /**
     * Rounding to the nearest integer.
     * Round half towards positive infinity.
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_UP: typeof RoundingModeEntity;
    /**
     * Rounding to the nearest integer.
     * Round half towards negative infinity.
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_DOWN: typeof RoundingModeEntity;
    /**
     * Rounding to the nearest integer
     * Round to the nearest side. If the median, round to the even side.
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_EVEN: typeof RoundingModeEntity;
    /**
     * Do not round.
     * Error if you need to round it.
     * @returns {typeof RoundingModeEntity}
     */
    static UNNECESSARY: typeof RoundingModeEntity;
}

/**
 * Create an fraction.
 *
 * Initialization can be performed as follows.
 * - 10, "10", "10/1", "10.0/1.0", ["10", "1"], [10, 1]
 * - 0.01, "0.01", "0.1e-1", "1/100", [1, 100], [2, 200], ["2", "200"]
 * - "1/3", "0.[3]", "0.(3)", "0.'3'", "0."3"", [1, 3], [2, 6]
 * - "3.555(123)" = 3.555123123123..., "147982 / 41625"
 * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} [number] - Fraction data. See how to use the function.
 */
declare class Fraction {
    constructor(number?: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any);
    /**
     * @type {BigInteger}
     */
    numerator: BigInteger;
    /**
     * @type {BigInteger}
     */
    denominator: BigInteger;
    /**
     * Create an entity object of this class.
     * @returns {Fraction}
     */
    static create(): Fraction;
    /**
     * Convert number to Fraction type.
     * @returns {Fraction}
     */
    static valueOf(): Fraction;
    /**
     * Deep copy.
     * @returns {Fraction}
     */
    clone(): Fraction;
    /**
     * integer value.
     * @returns {number}
     */
    intValue: number;
    /**
     * floating point.
     * @returns {number}
     */
    doubleValue: number;
    /**
     * Absolute value.
     * @returns {Fraction} abs(A)
     */
    abs(): Fraction;
    /**
     * this * -1
     * @returns {Fraction} -A
     */
    negate(): Fraction;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    sign(): number;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Add.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {Fraction}
     */
    add(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Subtract.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {Fraction}
     */
    sub(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Multiply.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {Fraction}
     */
    mul(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Divide.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {Fraction}
     */
    div(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Inverse number of this value.
     * @return {Fraction}
     */
    inv(): Fraction;
    /**
     * Modulo, positive remainder of division.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {Fraction}
     */
    mod(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Multiply a multiple of ten.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} n
     * @returns {Fraction}
     */
    scaleByPowerOfTen(n: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Power function.
     * - Supports only integers.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {Fraction} pow(A, B)
     */
    pow(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Equals.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {boolean} A === B
     */
    equals(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): boolean;
    /**
     * Compare values.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(num: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): number;
    /**
     * Maximum number.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
     * @returns {Fraction} max([A, B])
     */
    max(number: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Minimum number.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
     * @returns {Fraction} min([A, B])
     */
    min(number: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Clip number within range.
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} min
     * @param {Fraction|BigInteger|BigDecimal|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} max
     * @returns {Fraction} min(max(x, min), max)
     */
    clip(min: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any, max: Fraction | BigInteger | BigDecimal | number | string | object[] | any | any): Fraction;
    /**
     * Floor.
     * @returns {Fraction} floor(A)
     */
    floor(): Fraction;
    /**
     * Ceil.
     * @returns {Fraction} ceil(A)
     */
    ceil(): Fraction;
    /**
     * Rounding to the nearest integer.
     * @returns {Fraction} round(A)
     */
    round(): Fraction;
    /**
     * To integer rounded down to the nearest.
     * @returns {Fraction} fix(A), trunc(A)
     */
    fix(): Fraction;
    /**
     * Fraction.
     * @returns {Fraction} fract(A)
     */
    fract(): Fraction;
    /**
     * Return true if the value is integer.
     * @return {boolean}
     */
    isInteger(): boolean;
    /**
     * this === 0
     * @return {boolean} A === 0
     */
    isZero(): boolean;
    /**
     * this === 1
     * @return {boolean} A === 1
     */
    isOne(): boolean;
    /**
     * this > 0
     * @returns {boolean}
     */
    isPositive(): boolean;
    /**
     * this < 0
     * @returns {boolean}
     */
    isNegative(): boolean;
    /**
     * this >= 0
     * @returns {boolean}
     */
    isNotNegative(): boolean;
    /**
     * -1
     * @returns {Fraction} -1
     */
    static MINUS_ONE: Fraction;
    /**
     * 0
     * @returns {Fraction} 0
     */
    static ZERO: Fraction;
    /**
     * 0.5
     * @returns {Fraction} 0.5
     */
    static HALF: Fraction;
    /**
     * 1
     * @returns {Fraction} 1
     */
    static ONE: Fraction;
    /**
     * 2
     * @returns {Fraction} 2
     */
    static TWO: Fraction;
    /**
     * 10
     * @returns {Fraction} 10
     */
    static TEN: Fraction;
}

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} MatrixSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */
declare type MatrixSettings = {
    dimension?: string | number;
    correction?: any;
};

/**
 * Create a complex matrix.
 * Initialization can be performed as follows.
 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - Complex matrix. See how to use the function.
 */
declare class Matrix {
    constructor(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any);
    /**
     * Create an entity object of this class.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    static create(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Convert number to Matrix type.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    static valueOf(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Delete cache.
     */
    _clearCash(): void;
    /**
     * Deep copy.
     * @returns {Matrix}
     */
    clone(): Matrix;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Convert to string in one line.
     * @returns {string}
     */
    toOneLineString(): string;
    /**
     * Equals.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Array of real parts of elements in matrix.
     * @returns {Array<Array<number>>}
     */
    getNumberMatrixArray(): number[][];
    /**
     * Complex array of complex numbers of each element of the matrix.
     * @returns {Array<Array<Complex>>}
     */
    getComplexMatrixArray(): Complex[][];
    /**
     * Perform the same process on all elements in the matrix.
     * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
     * @returns {Matrix} Matrix after function processing.
     */
    cloneMatrixDoEachCalculation(eachfunc: (...params: any[]) => any): Matrix;
    /**
     * Create Matrix with specified initialization for each element in matrix.
     * @param {function(number, number): ?Object } eachfunc - Function(row, col)
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length=dimension] - Number of columns.
     * @returns {Matrix} Matrix after function processing.
     */
    static createMatrixDoEachCalculation(eachfunc: (...params: any[]) => any, dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Treat the columns of the matrix as vectors and execute the same process.
     * - If the matrix is a row vector, it performs the same processing for the row vector.
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} Matrix after function processing.
     */
    eachVectorAuto(array_function: (...params: any[]) => any): Matrix;
    /**
     * Treat the rows and columns of the matrix as vectors and perform the same processing.
     * 1. First run the same process for the row.
     * 2. Finally perform the same processing for the column.
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} Matrix after function processing.
     */
    eachVectorBoth(array_function: (...params: any[]) => any): Matrix;
    /**
     * Treat the rows of the matrix as vectors and execute the same process.
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} Matrix after function processing.
     */
    eachVectorRow(array_function: (...params: any[]) => any): Matrix;
    /**
     * Treat the columns of the matrix as vectors and execute the same process.
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} Matrix after function processing.
     */
    eachVectorColumn(array_function: (...params: any[]) => any): Matrix;
    /**
     * Treat the rows and columns of the matrix as vectors and perform the same processing.
     * The arguments of the method can switch the direction of the matrix to be executed.
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @param {string|number} [dimension="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
     * @returns {Matrix} Matrix after function processing.
     */
    eachVector(array_function: (...params: any[]) => any, dimension?: string | number): Matrix;
    /**
     * Extract the specified part of the matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {Matrix}
     */
    getMatrix(row: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, isUpOffset?: boolean): Matrix;
    /**
     * Change specified element in matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} replace - Matrix to be replaced.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {Matrix}
     */
    setMatrix(row: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, replace: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, isUpOffset?: boolean): Matrix;
    /**
     * Returns the specified element in the matrix.
     * Each element of the matrix is composed of complex numbers.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [col] - If this is a matrix, the column number.
     * @returns {Complex}
     */
    getComplex(row_or_pos: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Complex;
    /**
     * Integer value of the first element of the matrix.
     * @returns {number}
     */
    intValue: number;
    /**
     * Real value of first element of the matrix.
     * @returns {number}
     */
    doubleValue: number;
    /**
     * First element of this matrix.
     * @returns {Complex}
     */
    scalar: Complex;
    /**
     * Maximum size of rows or columns in the matrix.
     * @returns {number}
     */
    length: number;
    /**
     * 1-norm.
     * @returns {number}
     */
    norm1: number;
    /**
     * 2-norm.
     * @returns {number}
     */
    norm2: number;
    /**
     * p-norm.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    norm(p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Condition number of the matrix
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    cond(p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Inverse condition number.
     * @returns {number}
     */
    rcond(): number;
    /**
     * Rank.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    rank(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Trace of a matrix.
     * Sum of diagonal elements.
     * @returns {Complex} trace(A)
     */
    trace(): Complex;
    /**
     * Determinant.
     * @returns {Matrix} |A|
     */
    det(): Matrix;
    /**
     * Creates a matrix composed of the specified number.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - Value after initialization.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static memset(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Return identity matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static eye(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Create zero matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static zeros(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Create a matrix of all ones.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static ones(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Generate a matrix composed of random values with uniform random numbers.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static rand(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Generate a matrix composed of random values with normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - Number of dimensions or rows.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - Number of columns.
     * @returns {Matrix}
     */
    static randn(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * If matrix, generate diagonal column vector.
     * If vector, generate a matrix with diagonal elements.
     * @returns {Matrix} Matrix or vector created. See how to use the function.
     */
    diag(): Matrix;
    /**
     * Return true if the matrix is scalar.
     * @returns {boolean}
     */
    isScalar(): boolean;
    /**
     * Return true if the matrix is row vector.
     * @returns {boolean}
     */
    isRow(): boolean;
    /**
     * Return true if the matrix is column vector.
     * @returns {boolean}
     */
    isColumn(): boolean;
    /**
     * Return true if the matrix is vector.
     * @returns {boolean}
     */
    isVector(): boolean;
    /**
     * Return true if the value is not scalar.
     * @returns {boolean}
     */
    isMatrix(): boolean;
    /**
     * Return true if the matrix is square matrix.
     * @returns {boolean}
     */
    isSquare(): boolean;
    /**
     * Return true if the matrix is real matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isReal(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is complex matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isComplex(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is zero matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isZeros(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is identity matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isIdentity(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is diagonal matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isDiagonal(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is tridiagonal matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTridiagonal(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is regular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isRegular(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is orthogonal matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isOrthogonal(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is unitary matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isUnitary(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is symmetric matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isSymmetric(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is hermitian matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isHermitian(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is upper triangular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleUpper(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is  lower triangular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleLower(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Return true if the matrix is permutation matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isPermutation(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * Number of rows and columns of matrix.
     * @returns {Matrix} [row_length, column_length]
     */
    size(): Matrix;
    /**
     * Compare values.
     * - Return value between scalars is of type Number.
     * - Return value between matrices is type Matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number|Matrix} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number | Matrix;
    /**
     * Add.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A + B
     */
    add(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Subtract.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A - B
     */
    sub(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Multiply.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A * B
     */
    mul(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Divide.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A / B
     */
    div(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Power function.
     * - Supports only integers.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 整数
     * @returns {Matrix} pow(A, B)
     */
    pow(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Multiplication for each element of matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .* B
     */
    dotmul(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Division for each element of matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A ./ B
     */
    dotdiv(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of each element of matrix.
     * @returns {Matrix} 1 ./ A
     */
    dotinv(): Matrix;
    /**
     * Power function for each element of the matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .^ B
     */
    dotpow(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Multiplication for each element of matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .* B
     * @deprecated use the dotmul.
     */
    nmul(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Division for each element of matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A ./ B
     * @deprecated use the dotdiv.
     */
    ndiv(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of each element of matrix.
     * @returns {Matrix} 1 ./ A
     * @deprecated use the dotinv.
     */
    ninv(): Matrix;
    /**
     * Power function for each element of the matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .^ B
     * @deprecated use the dotpow.
     */
    npow(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Real part of each element.
     * @returns {Matrix} real(A)
     */
    real(): Matrix;
    /**
     * Imaginary part of each element of the matrix.
     * @returns {Matrix} imag(A)
     */
    imag(): Matrix;
    /**
     * The argument of each element of matrix.
     * @returns {Matrix} arg(A)
     */
    arg(): Matrix;
    /**
     * The positive or negative signs of each element of the matrix.
     * - +1 if positive, -1 if negative, 0 if 0, norm if complex number.
     * @returns {Matrix} [-1,1] 複素数の場合はノルムを1にした値。
     */
    sign(): Matrix;
    /**
     * Test if each element of the matrix is integer.
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testInteger(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Test if each element of the matrix is complex integer.
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testComplexInteger(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * real(this) === 0
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testZero(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * real(this) === 1
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testOne(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Test if each element of the matrix is complex.
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testComplex(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Test if each element of the matrix is real.
     * - 1 if true, 0 if false.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testReal(tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Test if each element of the matrix is NaN.
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testNaN(): Matrix;
    /**
     * real(this) > 0
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testPositive(): Matrix;
    /**
     * real(this) < 0
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testNegative(): Matrix;
    /**
     * real(this) >= 0
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testNotNegative(): Matrix;
    /**
     * Test if each element of the matrix is infinite.
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testInfinite(): Matrix;
    /**
     * Test if each element of the matrix is finite.
     * - 1 if true, 0 if false.
     * @returns {Matrix} Matrix with elements of the numerical value of 1 or 0.
     */
    testFinite(): Matrix;
    /**
     * Absolute value.
     * @returns {Matrix} abs(A)
     */
    abs(): Matrix;
    /**
     * Complex conjugate matrix.
     * @returns {Matrix} real(A) - imag(A)j
     */
    conj(): Matrix;
    /**
     * this * -1
     * @returns {Matrix} -A
     */
    negate(): Matrix;
    /**
     * Square root.
     * @returns {Matrix} sqrt(A)
     */
    sqrt(): Matrix;
    /**
     * Logarithmic function.
     * @returns {Matrix} log(A)
     */
    log(): Matrix;
    /**
     * Exponential function.
     * @returns {Matrix} exp(A)
     */
    exp(): Matrix;
    /**
     * Sine function.
     * @returns {Matrix} sin(A)
     */
    sin(): Matrix;
    /**
     * Cosine function.
     * @returns {Matrix} cos(A)
     */
    cos(): Matrix;
    /**
     * Tangent function.
     * @returns {Matrix} tan(A)
     */
    tan(): Matrix;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI/2, PI/2].
     * @returns {Matrix} atan(A)
     */
    atan(): Matrix;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI, PI].
     * - Supports only real numbers.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - X
     * @returns {Matrix} atan2(Y, X)
     */
    atan2(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Floor.
     * @returns {Matrix} floor(A)
     */
    floor(): Matrix;
    /**
     * Ceil.
     * @returns {Matrix} ceil(A)
     */
    ceil(): Matrix;
    /**
     * Rounding to the nearest integer.
     * @returns {Matrix} round(A)
     */
    round(): Matrix;
    /**
     * To integer rounded down to the nearest.
     * @returns {Matrix} fix(A), trunc(A)
     */
    fix(): Matrix;
    /**
     * Fraction.
     * @returns {Matrix} fract(A)
     */
    fract(): Matrix;
    /**
     * Normalized sinc function.
     * @returns {Matrix} sinc(A)
     */
    sinc(): Matrix;
    /**
     * Rotate matrix 90 degrees clockwise.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - Number of times rotated by 90 degrees.
     * @returns {Matrix} Matrix after function processing.
     */
    rot90(rot_90_count: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Change the size of the matrix.
     * Initialized with 0 when expanding.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - Number of rows of matrix to resize.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - Number of columns of matrix to resize.
     * @returns {Matrix} Matrix after function processing.
     */
    resize(row_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Remove the row in this matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - Number of row of matrix to delete.
     * @returns {Matrix} Matrix after function processing.
     */
    deleteRow(delete_row_index: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Remove the column in this matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - Number of column of matrix to delete.
     * @returns {Matrix} Matrix after function processing.
     */
    deleteColumn(delete_column_index: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Swap rows in the matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - Number 1 of row of matrix to exchange.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - Number 2 of row of matrix to exchange.
     * @returns {Matrix} Matrix after function processing.
     */
    exchangeRow(exchange_row_index1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, exchange_row_index2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Swap columns in the matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - Number 1 of column of matrix to exchange.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - Number 2 of column of matrix to exchange.
     * @returns {Matrix} Matrix after function processing.
     */
    exchangeColumn(exchange_column_index1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, exchange_column_index2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Combine matrix to the right of this matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - Matrix to combine.
     * @returns {Matrix} Matrix after function processing.
     */
    concatRight(left_matrix: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Combine matrix to the bottom of this matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - Matrix to combine.
     * @returns {Matrix} Matrix after function processing.
     */
    concatBottom(bottom_matrix: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Clip each element of matrix to specified range.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} min
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} max
     * @returns {Matrix} min(max(x, min), max)
     */
    clip(min: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, max: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Create row vector with specified initial value, step value, end condition.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} start_or_stop
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [stop]
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [step=1]
     * @returns {Matrix}
     */
    static arange(start_or_stop: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, stop?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, step?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Circular shift.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size
     * @param {MatrixSettings} [type]
     * @returns {Matrix} Matrix after function processing.
     */
    circshift(shift_size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: MatrixSettings): Matrix;
    /**
     * Circular shift.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} shift_size
     * @param {MatrixSettings} [type]
     * @returns {Matrix} Matrix after function processing.
     */
    roll(shift_size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: MatrixSettings): Matrix;
    /**
     * Change the shape of the matrix.
     * The number of elements in the matrix doesn't increase or decrease.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - Number of rows of matrix to reshape.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - Number of columns of matrix to reshape.
     * @returns {Matrix} Matrix after function processing.
     */
    reshape(row_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Flip this matrix left and right.
     * @returns {Matrix} Matrix after function processing.
     */
    fliplr(): Matrix;
    /**
     * Flip this matrix up and down.
     * @returns {Matrix} Matrix after function processing.
     */
    flipud(): Matrix;
    /**
     * Flip this matrix.
     * @param {MatrixSettings} [type]
     * @returns {Matrix} Matrix after function processing.
     */
    flip(type?: MatrixSettings): Matrix;
    /**
     * Index sort.
     * - Sorts by row when setting index by row vector to the argument.
     * - Sorts by column when setting index by column vector to the argument.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - Vector with index. (See the description of this function)
     * @returns {Matrix} Matrix after function processing.
     */
    indexsort(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Transpose a matrix.
     * @returns {Matrix} A^T
     */
    transpose(): Matrix;
    /**
     * Hermitian transpose.
     * @returns {Matrix} A^T
     */
    ctranspose(): Matrix;
    /**
     * Hermitian transpose.
     * @returns {Matrix} A^T
     */
    T(): Matrix;
    /**
     * Inner product/Dot product.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {Matrix} A・B
     */
    inner(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * LUP decomposition.
     * - P'*L*U=A
     * - P is permutation matrix.
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
     */
    lup(): {P: Matrix, L: Matrix, U: Matrix};
    /**
     * LU decomposition.
     * - L*U=A
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @returns {{L: Matrix, U: Matrix}} {L, U}
     */
    lu(): {L: Matrix, U: Matrix};
    /**
     * Solving a system of linear equations to be Ax = B
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
     * @returns {Matrix} x
     */
    linsolve(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * QR decomposition.
     * - Q*R=A
     * - Q is orthonormal matrix.
     * - R is upper triangular matrix.
     * @returns {{Q: Matrix, R: Matrix}} {Q, R}
     */
    qr(): {Q: Matrix, R: Matrix};
    /**
     * Tridiagonalization of symmetric matrix.
     * - Don't support complex numbers.
     * - P*H*P'=A
     * - P is orthonormal matrix.
     * - H is tridiagonal matrix.
     * - The eigenvalues of H match the eigenvalues of A.
     * @returns {{P: Matrix, H: Matrix}} {P, H}
     */
    tridiagonalize(): {P: Matrix, H: Matrix};
    /**
     * Eigendecomposition of symmetric matrix.
     * - Don't support complex numbers.
     * - V*D*V'=A.
     * - V is orthonormal matrix. and columns of V are the right eigenvectors.
     * - D is a matrix containing the eigenvalues on the diagonal component.
     * @returns {{V: Matrix, D: Matrix}} {D, V}
     */
    eig(): {V: Matrix, D: Matrix};
    /**
     * Singular Value Decomposition (SVD).
     * - U*S*V'=A
     * - U and V are orthonormal matrices.
     * - S is a matrix with singular values in the diagonal.
     * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
     */
    svd(): {U: Matrix, S: Matrix, V: Matrix};
    /**
     * Inverse matrix of this matrix.
     * @returns {Matrix} A^-1
     */
    inv(): Matrix;
    /**
     * Pseudo-inverse matrix.
     * @returns {Matrix} A^+
     */
    pinv(): Matrix;
    /**
     * Log-gamma function.
     * @returns {Matrix}
     */
    gammaln(): Matrix;
    /**
     * Gamma function.
     * @returns {Matrix}
     */
    gamma(): Matrix;
    /**
     * Incomplete gamma function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {Matrix}
     */
    gammainc(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * Probability density function (PDF) of the gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    gampdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    gamcdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    gaminv(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Beta function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
     * @returns {Matrix}
     */
    beta(y: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Incomplete beta function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {Matrix}
     */
    betainc(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betacdf(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betapdf(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betainv(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Factorial function, x!.
     * @returns {Matrix}
     */
    factorial(): Matrix;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
     * @returns {Matrix}
     */
    nchoosek(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Error function.
     * @returns {Matrix}
     */
    erf(): Matrix;
    /**
     * Complementary error function.
     * @returns {Matrix}
     */
    erfc(): Matrix;
    /**
     * Probability density function (PDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    normpdf(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    normcdf(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    norminv(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    tpdf(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    tcdf(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    tinv(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * - If tails = 1, TDIST returns the one-tailed distribution.
     * - If tails = 2, TDIST returns the two-tailed distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {Matrix}
     */
    tdist(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tails: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    tinv2(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    chi2pdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    chi2cdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    chi2inv(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of F-distribution.
     * - In the argument, specify the degree of freedom of ratio of two variables according to chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    fpdf(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    fcdf(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    finv(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Maximum number.
     * @param {MatrixSettings} [type]
     * @returns {Matrix} max([A, B])
     */
    max(type?: MatrixSettings): Matrix;
    /**
     * Minimum number.
     * @param {MatrixSettings} [type]
     * @returns {Matrix} min([A, B])
     */
    min(type?: MatrixSettings): Matrix;
    /**
     * Sum.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    sum(type?: MatrixSettings): Matrix;
    /**
     * Arithmetic average.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    mean(type?: MatrixSettings): Matrix;
    /**
     * Product of array elements.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    prod(type?: MatrixSettings): Matrix;
    /**
     * Geometric mean.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    geomean(type?: MatrixSettings): Matrix;
    /**
     * Median.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    median(type?: MatrixSettings): Matrix;
    /**
     * Mode.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    mode(type?: MatrixSettings): Matrix;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {number} nth_order
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    moment(nth_order: number, type?: MatrixSettings): Matrix;
    /**
     * Variance.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    var(type?: MatrixSettings): Matrix;
    /**
     * Standard deviation.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    std(type?: MatrixSettings): Matrix;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {?string|?number} [algorithm]
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    mad(algorithm?: string | number, type?: MatrixSettings): Matrix;
    /**
     * Skewness.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    skewness(type?: MatrixSettings): Matrix;
    /**
     * Covariance matrix.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    cov(type?: MatrixSettings): Matrix;
    /**
     * The samples are normalized to a mean value of 0, standard deviation of 1.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    normalize(type?: MatrixSettings): Matrix;
    /**
     * Correlation matrix.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    corrcoef(type?: MatrixSettings): Matrix;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {string} [order]
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    sort(order?: string, type?: MatrixSettings): Matrix;
    /**
     * Discrete Fourier transform (DFT).
     * @param {MatrixSettings} [type]
     * @returns {Matrix} fft(x)
     */
    fft(type?: MatrixSettings): Matrix;
    /**
     * Inverse discrete Fourier transform (IDFT).
     * @param {MatrixSettings} [type]
     * @returns {Matrix} ifft(x)
     */
    ifft(type?: MatrixSettings): Matrix;
    /**
     * Power spectral density.
     * @param {MatrixSettings} [type]
     * @returns {Matrix} abs(fft(x)).^2
     */
    powerfft(type?: MatrixSettings): Matrix;
    /**
     * Discrete cosine transform (DCT-II, DCT).
     * @param {MatrixSettings} [type]
     * @returns {Matrix} dct(x)
     */
    dct(type?: MatrixSettings): Matrix;
    /**
     * Inverse discrete cosine transform (DCT-III, IDCT).
     * @param {MatrixSettings} [type]
     * @returns {Matrix} idct(x)
     */
    idct(type?: MatrixSettings): Matrix;
    /**
     * Discrete two-dimensional Fourier transform (2D DFT).
     * @returns {Matrix}
     */
    fft2(): Matrix;
    /**
     * Inverse discrete two-dimensional Fourier transform (2D IDFT).
     * @returns {Matrix}
     */
    ifft2(): Matrix;
    /**
     * Discrete two-dimensional cosine transform (2D DCT).
     * @returns {Matrix}
     */
    dct2(): Matrix;
    /**
     * Inverse discrete two-dimensional cosine transform (2D IDCT).
     * @returns {Matrix}
     */
    idct2(): Matrix;
    /**
     * Convolution integral, Polynomial multiplication.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    conv(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [number] - Matrix to calculate the correlation.
     * @returns {Matrix}
     */
    xcorr(number?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Create window function for signal processing.
     * The following window functions are available.
     * - "rectangle": Rectangular window
     * - "hann": Hann/Hanning window.
     * - "hamming": Hamming window.
     * - "blackman": Blackman window.
     * - "blackmanharris": Blackman-Harris window.
     * - "blackmannuttall": Blackman-Nuttall window.
     * - "flattop": Flat top window.
     * - "sin", Half cycle sine window.
     * - "vorbis", Vorbis window.
     * @param {string} name - Window function name.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static window(name: string, size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * Hann (Hanning) window.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static hann(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * Hamming window.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static hamming(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * FFT shift.
     * Circular shift beginning at the center of the signal.
     * @param {MatrixSettings} [type]
     * @returns {Matrix}
     */
    fftshift(type?: MatrixSettings): Matrix;
}

/**
 * Class for linear algebra for Matrix class.
 */
declare class LinearAlgebra {
    /**
     * Inner product/Dot product.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} A
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} B
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {Matrix} A・B
     */
    static inner(A: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, B: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * p-norm.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    static norm(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Condition number of the matrix
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    static cond(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Inverse condition number.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {number}
     */
    static rcond(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Rank.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    static rank(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tolerance?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * Trace of a matrix.
     * Sum of diagonal elements.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {Complex}
     */
    static trace(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Complex;
    /**
     * Determinant.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {Matrix} |A|
     */
    static det(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * LUP decomposition.
     * - P'*L*U=A
     * - P is permutation matrix.
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{P: Matrix, L: Matrix, U: Matrix}} {L, U, P}
     */
    static lup(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {P: Matrix, L: Matrix, U: Matrix};
    /**
     * LU decomposition.
     * - L*U=A
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{L: Matrix, U: Matrix}} {L, U}
     */
    static lu(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {L: Matrix, U: Matrix};
    /**
     * Solving a system of linear equations to be Ax = B
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
     * @returns {Matrix} x
     * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
     */
    static linsolve(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * QR decomposition.
     * - Q*R=A
     * - Q is orthonormal matrix.
     * - R is upper triangular matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{Q: Matrix, R: Matrix}} {Q, R}
     */
    static qr(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {Q: Matrix, R: Matrix};
    /**
     * Tridiagonalization of symmetric matrix.
     * - Don't support complex numbers.
     * - P*H*P'=A
     * - P is orthonormal matrix.
     * - H is tridiagonal matrix.
     * - The eigenvalues of H match the eigenvalues of A.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{P: Matrix, H: Matrix}} {P, H}
     */
    static tridiagonalize(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {P: Matrix, H: Matrix};
    /**
     * Eigendecomposition of symmetric matrix.
     * - Don't support complex numbers.
     * - V*D*V'=A.
     * - V is orthonormal matrix. and columns of V are the right eigenvectors.
     * - D is a matrix containing the eigenvalues on the diagonal component.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{V: Matrix, D: Matrix}} {D, V}
     * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
     */
    static eig(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {V: Matrix, D: Matrix};
    /**
     * Singular Value Decomposition (SVD).
     * - U*S*V'=A
     * - U and V are orthonormal matrices.
     * - S is a matrix with singular values in the diagonal.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
     */
    static svd(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): {U: Matrix, S: Matrix, V: Matrix};
    /**
     * Inverse matrix of this matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {Matrix} A^-1
     */
    static inv(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Pseudo-inverse matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {Matrix} A^+
     */
    static pinv(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
}

/**
 * Create Random.
 * @param {number} [seed] - Seed number for random number generation. If not specified, create from time.
 */
declare class Random {
    constructor(seed?: number);
    /**
     * 内部データをシャッフル
     */
    _rnd521(): void;
    /**
     * Initialize random seed.
     * @param {number} seed
     */
    setSeed(seed: number): void;
    /**
     * 32-bit random number.
     * @returns {number} - 32ビットの乱数
     */
    genrand_int32(): number;
    /**
     * Random number of specified bit length.
     * @param {number} bits - Required number of bits (up to 64 possible).
     * @returns {number}
     */
    next(bits: number): number;
    /**
     * 8-bit random number array of specified length.
     * @param {number} size - 必要な長さ
     * @returns {Array<number>}
     */
    nextBytes(size: number): number[];
    /**
     * 16-bit random number.
     * @returns {number}
     */
    nextShort(): number;
    /**
     * 32-bit random number.
     * @param {number} [x] - 指定した値未満の数値を作る
     * @returns {number}
     */
    nextInt(x?: number): number;
    /**
     * 64-bit random number.
     * @returns {number}
     */
    nextLong(): number;
    /**
     * Random boolean.
     * @returns {boolean}
     */
    nextBoolean(): boolean;
    /**
     * Float type random number in the range of [0, 1).
     * @returns {number}
     */
    nextFloat(): number;
    /**
     * Double type random number in the range of [0, 1).
     * @returns {number}
     */
    nextDouble(): number;
    /**
     * Random numbers from a Gaussian distribution.
     * This random number is a distribution with an average value of 0 and a standard deviation of 1.
     * @returns {number}
     */
    nextGaussian(): number;
}

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} SignalSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 */
declare type SignalSettings = {
    dimension?: string | number;
};

/**
 * Signal processing class for Matrix class.
 */
declare class Signal {
    /**
     * Discrete Fourier transform (DFT).
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {Matrix} fft(x)
     */
    static fft(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
    /**
     * Inverse discrete Fourier transform (IDFT),
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @param {SignalSettings} [type]
     * @returns {Matrix} ifft(X)
     */
    static ifft(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
    /**
     * Power spectral density.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {Matrix} abs(fft(x)).^2
     */
    static powerfft(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
    /**
     * Discrete cosine transform (DCT-II, DCT).
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {Matrix} dct(x)
     */
    static dct(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
    /**
     * Inverse discrete cosine transform (DCT-III, IDCT),
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @param {SignalSettings} [type]
     * @returns {Matrix} idct(x)
     */
    static idct(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
    /**
     * Discrete two-dimensional Fourier transform (2D DFT).
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static fft2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse discrete two-dimensional Fourier transform (2D IDFT),
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @returns {Matrix}
     */
    static ifft2(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Discrete two-dimensional cosine transform (2D DCT).
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static dct2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse discrete two-dimensional cosine transform (2D IDCT),
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @returns {Matrix}
     */
    static idct2(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Convolution integral, Polynomial multiplication.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x2
     * @returns {Matrix}
     */
    static conv(x1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, x2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [x2] - Matrix to calculate the correlation.
     * @returns {Matrix}
     */
    static xcorr(x1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, x2?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Create window function for signal processing.
     * The following window functions are available.
     * - "rectangle": Rectangular window
     * - "hann": Hann/Hanning window.
     * - "hamming": Hamming window.
     * - "blackman": Blackman window.
     * - "blackmanharris": Blackman-Harris window.
     * - "blackmannuttall": Blackman-Nuttall window.
     * - "flattop": Flat top window.
     * - "sin", Half cycle sine window.
     * - "vorbis", Vorbis window.
     * @param {string} name - Window function name.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static window(name: string, size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * Hann (Hanning) window.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static hann(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * Hamming window.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {Matrix} Column vector.
     */
    static hamming(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * FFT shift.
     * Circular shift beginning at the center of the signal.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {Matrix}
     */
    static fftshift(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: SignalSettings): Matrix;
}

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} StatisticsSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */
declare type StatisticsSettings = {
    dimension?: string | number;
    correction?: any;
};

/**
 * Class for statistical processing for Matrix class.
 */
declare class Statistics {
    /**
     * Log-gamma function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static gammaln(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Gamma function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static gamma(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Incomplete gamma function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {Matrix}
     */
    static gammainc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * Probability density function (PDF) of the gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    static gampdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    static gamcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - Shape parameter.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - Scale parameter.
     * @returns {Matrix}
     */
    static gaminv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Beta function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
     * @returns {Matrix}
     */
    static beta(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, y: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Incomplete beta function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {Matrix}
     */
    static betainc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betacdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betapdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betainv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Factorial function, x!.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static factorial(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
     * @returns {Matrix}
     */
    static nchoosek(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Error function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static erf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Complementary error function.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static erfc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    static normpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    static normcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - Average value.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - Variance value.
     * @returns {Matrix}
     */
    static norminv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static tpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static tcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static tinv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {Matrix}
     */
    static tdist(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tails: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static tinv2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static chi2pdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static chi2cdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - The degrees of freedom. (DF)
     * @returns {Matrix}
     */
    static chi2inv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Probability density function (PDF) of F-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    static fpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    static fcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - The degree of freedom of the molecules.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - The degree of freedom of the denominator
     * @returns {Matrix}
     */
    static finv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * Maximum number.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix} max([A, B])
     */
    static max(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Minimum number.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix} min([A, B])
     */
    static min(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Sum.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static sum(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Arithmetic average.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static mean(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Product of array elements.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static prod(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Geometric mean.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static geomean(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Median.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static median(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Mode.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static mode(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {number} nth_order
     * @param {StatisticsSettings} [type]
     * @returns {Matrix} n次のモーメント、2で分散の定義と同等。
     */
    static moment(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, nth_order: number, type?: StatisticsSettings): Matrix;
    /**
     * Variance.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static var(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Standard deviation.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static std(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {?string|?number} [algorithm]
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static mad(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, algorithm?: string | number, type?: StatisticsSettings): Matrix;
    /**
     * Skewness.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static skewness(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Covariance matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static cov(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * The samples are normalized to a mean value of 0, standard deviation of 1.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static normalize(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Correlation matrix.
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static corrcoef(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: StatisticsSettings): Matrix;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {string} [order]
     * @param {StatisticsSettings} [type]
     * @returns {Matrix}
     */
    static sort(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, order?: string, type?: StatisticsSettings): Matrix;
}

