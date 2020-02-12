/**
 * Class collection of numerical calculation processing.
 * These classes are classified into a _BigInteger_, _BigDecimal_, _Fraction_, _Matrix_.
 * - _BigInteger_ is a calculation class for arbitrary-precision integer arithmetic.
 * - _BigDecimal_ is a calculation class for arbitrary-precision floating point arithmetic.
 * - _Fraction_ is a calculation class for fractions with infinite precision.
 * - _Matrix_ is a general-purpose calculation class with signal processing and statistical processing.
 */
declare class konpeito {
    /**
     * Return typedef _BigInteger_ for arbitrary-precision integer calculation.
     * @returns {typeof _BigInteger_}
     */
    static BigInteger: typeof _BigInteger_;
    /**
     * Return typedef _BigDecimal_ for arbitrary-precision floating-point number.
     * @returns {typeof _BigDecimal_}
     */
    static BigDecimal: typeof _BigDecimal_;
    /**
     * Return Rounding class for _BigDecimal_.
     * @returns {typeof _RoundingMode_}
     */
    static RoundingMode: typeof _RoundingMode_;
    /**
     * Return Configuration class for _BigDecimal_.
     * @returns {typeof _MathContext_}
     */
    static MathContext: typeof _MathContext_;
    /**
     * Return typedef _Fraction_ for infinite precision arithmetic.
     * @returns {typeof _Fraction_}
     */
    static Fraction: typeof _Fraction_;
    /**
     * Return typedef _Complex_ for complex number calculation.
     * @returns {typeof _Complex_}
     */
    static Complex: typeof _Complex_;
    /**
     * Return typedef _Matrix_ for complex matrix calculation.
     * @returns {typeof _Matrix_}
     */
    static Matrix: typeof _Matrix_;
    /**
     * Return typedef _Random_.
     * @returns {typeof _Random_}
     */
    static Random: typeof _Random_;
    /**
     * Return typedef _DataAnalysis_.
     * @returns {typeof _DataAnalysis_}
     */
    static DataAnalysis: typeof _DataAnalysis_;
}

/**
 * _BigDecimal_ type argument.(local)
 * - number
 * - boolean
 * - string
 * - _BigDecimal_
 * - _BigInteger_
 * - {toBigDecimal:function}
 * - {doubleValue:number}
 * - {toString:function}
 * @typedef {number|boolean|string|_BigDecimal_|_BigInteger_|{toBigDecimal:function}|{doubleValue:number}|{toString:function}} KBigDecimalLocalInputData
 */
declare type KBigDecimalLocalInputData = number|boolean|string|_BigDecimal_|_BigInteger_|{toBigDecimal:any}|{doubleValue:number}|{toString:any};


/**
 * ScaleData for argument of _BigDecimal_.
 * - {integer:_BigInteger_,scale:?number,context:?_MathContext_}
 * @typedef {{integer:_BigInteger_,scale:?number,context:?_MathContext_}} KBigDecimalScaleData
 */
declare type KBigDecimalScaleData = {integer:_BigInteger_,scale:number,context:_MathContext_};


/**
 * _BigDecimal_ type argument.
 * - KBigDecimalLocalInputData
 * - Array<KBigDecimalLocalInputData|_MathContext_>
 * - KBigDecimalScaleData
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - When initializing with array. [ integer, [scale = 0], [context=default]].
 * - When initializing with object. { integer, [scale = 0], [context=default]}.
 *
 * Description of the settings are as follows, you can also omitted.
 * - The "scale" is an integer scale factor.
 * - The "context" is used to normalize the created floating point.
 *
 * If "context" is not specified, the "default_context" set for the class is used.
 * The "context" is the used when no environment settings are specified during calculation.
 * @typedef {KBigDecimalLocalInputData|Array<KBigDecimalLocalInputData|_MathContext_>|KBigDecimalScaleData} KBigDecimalInputData
 */
declare type KBigDecimalInputData = KBigDecimalLocalInputData|Array<KBigDecimalLocalInputData|_MathContext_>|KBigDecimalScaleData;


/**
 * Setting of calculation result of division.
 * @typedef {Object} KBigDecimalDivideType
 * @property {number} [scale] Scale of rounding.
 * @property {_RoundingModeEntity_} [roundingMode] Rounding mode.
 * @property {_MathContext_} [context] Configuration.(scale and roundingMode are unnecessary.)
 */
declare type KBigDecimalDivideType = {
    scale?: number;
    roundingMode?: _RoundingModeEntity_;
    context?: _MathContext_;
};

/**
 * Create an arbitrary-precision floating-point number.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - When initializing with array. [ integer, [scale = 0], [context=default]].
 * - When initializing with object. { integer, [scale = 0], [context=default]}.
 *
 * Description of the settings are as follows, you can also omitted.
 * - The "scale" is an integer scale factor.
 * - The "context" is used to normalize the created floating point.
 *
 * If "context" is not specified, the "default_context" set for the class is used.
 * The "context" is the used when no environment settings are specified during calculation.
 * @param {KBigDecimalInputData} number - Real data.
 */
declare class _BigDecimal_ {
    constructor(number: KBigDecimalInputData);
    /**
     * Create an arbitrary-precision floating-point number.
     *
     * Initialization can be performed as follows.
     * - 1200, "1200", "12e2", "1.2e3"
     * - When initializing with array. [ integer, [scale = 0], [context=default]].
     * - When initializing with object. { integer, [scale = 0], [context=default]}.
     *
     * Description of the settings are as follows, you can also omitted.
     * - The "scale" is an integer scale factor.
     * - The "context" is used to normalize the created floating point.
     *
     * If "context" is not specified, the "default_context" set for the class is used.
     * The "context" is the used when no environment settings are specified during calculation.
     * @param {KBigDecimalInputData} number - Real data.
     * @returns {_BigDecimal_}
     */
    static create(number: KBigDecimalInputData): _BigDecimal_;
    /**
     * Create a number using settings of this number.
     * @param {KBigDecimalLocalInputData} number - Real data.
     * @param {_MathContext_} [mc] - Setting preferences when creating objects.
     * @returns {_BigDecimal_}
     */
    createUsingThisSettings(number: KBigDecimalLocalInputData, mc?: _MathContext_): _BigDecimal_;
    /**
     * Convert number to _BigDecimal_ type.
     * @param {KBigDecimalLocalInputData} x
     * @param {_MathContext_} [scale]
     * @returns {_BigDecimal_}
     */
    static valueOf(x: KBigDecimalLocalInputData, scale?: _MathContext_): _BigDecimal_;
    /**
     * Return string of this number without sign.
     * If cache is already created, return cache.
     * @returns {string}
     */
    _getUnsignedIntegerString(): string;
    /**
     * Deep copy.
     * @returns {_BigDecimal_}
     */
    clone(): _BigDecimal_;
    /**
     * The scale of this _BigDecimal_.
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
     * @returns {_BigInteger_}
     */
    unscaledValue(): _BigInteger_;
    /**
     * The smallest value that can be represented with the set precision.
     * @returns {_BigDecimal_}
     */
    ulp(): _BigDecimal_;
    /**
     * Absolute value.
     * @param {_MathContext_} [mc] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} abs(A)
     */
    abs(mc?: _MathContext_): _BigDecimal_;
    /**
     * this * 1
     * @param {_MathContext_} [mc] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object..
     * @returns {_BigDecimal_} +A
     */
    plus(mc?: _MathContext_): _BigDecimal_;
    /**
     * this * -1
     * @param {_MathContext_} [mc] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object..
     * @returns {_BigDecimal_} -A
     */
    negate(mc?: _MathContext_): _BigDecimal_;
    /**
     * Move the decimal point to the left.
     * @param {KBigDecimalInputData} n
     * @returns {_BigDecimal_}
     */
    movePointLeft(n: KBigDecimalInputData): _BigDecimal_;
    /**
     * Move the decimal point to the right.
     * @param {KBigDecimalInputData} n
     * @returns {_BigDecimal_}
     */
    movePointRight(n: KBigDecimalInputData): _BigDecimal_;
    /**
     * Remove the 0 to the right of the numbers and normalize the scale.
     * @returns {_BigDecimal_}
     */
    stripTrailingZeros(): _BigDecimal_;
    /**
     * Add.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A + B
     */
    add(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Subtract.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A - B
     */
    subtract(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Subtract.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A - B
     */
    sub(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Multiply.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A * B
     */
    multiply(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Multiply.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A * B
     */
    mul(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide not calculated to the decimal point.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} (int)(A / B)
     */
    divideToIntegralValue(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide and remainder.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {Array<_BigDecimal_>} [C = (int)(A / B), A - C * B]
     */
    divideAndRemainder(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_[];
    /**
     * Remainder of division.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A % B
     */
    rem(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Modulo, positive remainder of division.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A mod B
     */
    mod(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide.
     * - The argument can specify the scale after calculation.
     * - In the case of precision infinity, it may generate an error by a repeating decimal.
     * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
     * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_|KBigDecimalDivideType} [type] - Scale, _MathContext_, _RoundingMode_ used for the calculation.
     * @returns {_BigDecimal_}
     */
    divide(number: KBigDecimalInputData, type?: _MathContext_ | KBigDecimalDivideType): _BigDecimal_;
    /**
     * Divide.
     * - The argument can specify the scale after calculation.
     * - In the case of precision infinity, it may generate an error by a repeating decimal.
     * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
     * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_|KBigDecimalDivideType} [type] - Scale, _MathContext_, _RoundingMode_ used for the calculation.
     * @returns {_BigDecimal_} A / B
     */
    div(number: KBigDecimalInputData, type?: _MathContext_ | KBigDecimalDivideType): _BigDecimal_;
    /**
     * Inverse number of this value.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} 1 / A
     */
    inv(context?: _MathContext_): _BigDecimal_;
    /**
     * Factorial function, x!.
     * - Supports only integers.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} n!
     */
    factorial(context?: _MathContext_): _BigDecimal_;
    /**
     * Multiply a multiple of ten.
     * - Supports only integers.
     * - Only the scale is changed without changing the precision.
     * @param {KBigDecimalInputData} n
     * @returns {_BigDecimal_} A * 10^floor(n)
     */
    scaleByPowerOfTen(n: KBigDecimalInputData): _BigDecimal_;
    /**
     * Set default the _MathContext_.
     * This is used if you do not specify _MathContext_ when creating a new object.
     * @param {_MathContext_} [context=_MathContext_.DECIMAL128]
     */
    static setDefaultContext(context?: _MathContext_): void;
    /**
     * Return default _MathContext_ class.
     * Used when _MathContext_ not specified explicitly.
     * @returns {_MathContext_}
     */
    static getDefaultContext(): _MathContext_;
    /**
     * boolean value.
     * @returns {boolean}
     */
    booleanValue: boolean;
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
     * Get as a _BigInteger_.
     * @returns {_BigInteger_}
     */
    toBigInteger(): _BigInteger_;
    /**
     * Equals.
     * - Attention : Test for equality, including the precision and the scale.
     * - Use the "compareTo" if you only want to find out whether they are also mathematically equal.
     * - If you specify a "tolerance", it is calculated by ignoring the test of the precision and the scale.
     * @param {KBigDecimalInputData} number
     * @param {KBigDecimalInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: KBigDecimalInputData, tolerance?: KBigDecimalInputData): boolean;
    /**
     * Numeric type match.
     * @param {KBigDecimalInputData} number
     * @returns {boolean}
     */
    equalsState(number: KBigDecimalInputData): boolean;
    /**
     * Compare values.
     * @param {KBigDecimalInputData} number
     * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: KBigDecimalInputData, tolerance?: KBigDecimalInputData): number;
    /**
     * Maximum number.
     * @param {KBigDecimalInputData} number
     * @returns {_BigDecimal_} max([A, B])
     */
    max(number: KBigDecimalInputData): _BigDecimal_;
    /**
     * Minimum number.
     * @param {KBigDecimalInputData} number
     * @returns {_BigDecimal_} min([A, B])
     */
    min(number: KBigDecimalInputData): _BigDecimal_;
    /**
     * Clip number within range.
     * @param {KBigDecimalInputData} min
     * @param {KBigDecimalInputData} max
     * @returns {_BigDecimal_} min(max(x, min), max)
     */
    clip(min: KBigDecimalInputData, max: KBigDecimalInputData): _BigDecimal_;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Convert to string using scientific notation.
     * @param {KBigDecimalInputData} e_len - Number of digits in exponent part.
     * @returns {string}
     */
    toScientificNotation(e_len: KBigDecimalInputData): string;
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
     * @param {KBigDecimalInputData} new_scale - New scale.
     * @param {_RoundingModeEntity_} [rounding_mode=_RoundingMode_.UNNECESSARY] - Rounding method when converting precision.
     * @returns {_BigDecimal_}
     */
    setScale(new_scale: KBigDecimalInputData, rounding_mode?: _RoundingModeEntity_): _BigDecimal_;
    /**
     * Round with specified settings.
     *
     * This method is not a method round the decimal point.
     * This method converts numbers in the specified Context and rounds unconvertible digits.
     *
     * Use this.setScale(0, _RoundingMode_.HALF_UP) if you want to round the decimal point.
     * When the argument is omitted, such decimal point rounding operation is performed.
     * @param {_MathContext_} [mc] - New setting.
     * @returns {_BigDecimal_}
     */
    round(mc?: _MathContext_): _BigDecimal_;
    /**
     * Floor.
     * @returns {_BigDecimal_} floor(A)
     */
    floor(): _BigDecimal_;
    /**
     * Ceil.
     * @returns {_BigDecimal_} ceil(A)
     */
    ceil(): _BigDecimal_;
    /**
     * To integer rounded down to the nearest.
     * @returns {_BigDecimal_} fix(A), trunc(A)
     */
    fix(): _BigDecimal_;
    /**
     * _Fraction_.
     * @returns {_BigDecimal_} fract(A)
     */
    fract(): _BigDecimal_;
    /**
     * Power function.
     * - An exception occurs when doing a huge multiplication.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} pow(A, B)
     */
    pow(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Square.
     * @param {_MathContext_} [mc] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} A^2
     */
    square(mc?: _MathContext_): _BigDecimal_;
    /**
     * Square root.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sqrt(A)
     */
    sqrt(context?: _MathContext_): _BigDecimal_;
    /**
     * Reciprocal square root.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} rsqrt(A)
     */
    rsqrt(context?: _MathContext_): _BigDecimal_;
    /**
     * Logarithmic function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} log(A)
     */
    log(context?: _MathContext_): _BigDecimal_;
    /**
     * Exponential function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} exp(A)
     */
    exp(context?: _MathContext_): _BigDecimal_;
    /**
     * Sine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sin(A)
     */
    sin(context?: _MathContext_): _BigDecimal_;
    /**
     * Cosine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} cos(A)
     */
    cos(context?: _MathContext_): _BigDecimal_;
    /**
     * Tangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} tan(A)
     */
    tan(context?: _MathContext_): _BigDecimal_;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI/2, PI/2].
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} atan(A)
     */
    atan(context?: _MathContext_): _BigDecimal_;
    /**
     * Atan (arc tangent) function.
     * Return the values of [-PI, PI] .
     * Supports only real numbers.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} atan2(Y, X)
     */
    atan2(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Logical AND.
     * - Calculated as an integer.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A & B
     */
    and(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Logical OR.
     * - Calculated as an integer.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A | B
     */
    or(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Logical Exclusive-OR.
     * - Calculated as an integer.
     * @param {KBigDecimalInputData} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A ^ B
     */
    xor(number: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Logical Not. (mutable)
     * - Calculated as an integer.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation.
     * @returns {_BigDecimal_} !A
     */
    not(context?: _MathContext_): _BigDecimal_;
    /**
     * this << n
     * - Calculated as an integer.
     * @param {KBigDecimalInputData} n
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation.
     * @returns {_BigDecimal_} A << n
     */
    shift(n: KBigDecimalInputData, context?: _MathContext_): _BigDecimal_;
    /**
     * Arc sine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} asin(A)
     */
    asin(context?: _MathContext_): _BigDecimal_;
    /**
     * Arc cosine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acos(A)
     */
    acos(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic sine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sinh(A)
     */
    sinh(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic sine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} asinh(A)
     */
    asinh(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic cosine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} cosh(A)
     */
    cosh(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic cosine function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acosh(A)
     */
    acosh(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic tangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} tanh(A)
     */
    tanh(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic tangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} atanh(A)
     */
    atanh(context?: _MathContext_): _BigDecimal_;
    /**
     * Secant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sec(A)
     */
    sec(context?: _MathContext_): _BigDecimal_;
    /**
     * Reverse secant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} asec(A)
     */
    asec(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic secant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sech(A)
     */
    sech(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic secant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} asech(A)
     */
    asech(context?: _MathContext_): _BigDecimal_;
    /**
     * Cotangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} cot(A)
     */
    cot(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse cotangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acot(A)
     */
    acot(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic cotangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} coth(A)
     */
    coth(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic cotangent function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acoth(A)
     */
    acoth(context?: _MathContext_): _BigDecimal_;
    /**
     * Cosecant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} csc(A)
     */
    csc(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse cosecant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acsc(A)
     */
    acsc(context?: _MathContext_): _BigDecimal_;
    /**
     * Hyperbolic cosecant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} csch(A)
     */
    csch(context?: _MathContext_): _BigDecimal_;
    /**
     * Inverse hyperbolic cosecant function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} acsch(A)
     */
    acsch(context?: _MathContext_): _BigDecimal_;
    /**
     * Normalized sinc function.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sinc(A)
     */
    sinc(context?: _MathContext_): _BigDecimal_;
    /**
     * Return true if the value is integer.
     * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isInteger(tolerance?: KBigDecimalInputData): boolean;
    /**
     * this === 0
     * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isZero(tolerance?: KBigDecimalInputData): boolean;
    /**
     * this === 1
     * @param {KBigDecimalInputData} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isOne(tolerance?: KBigDecimalInputData): boolean;
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
     * this === NaN
     * @returns {boolean} isNaN(A)
     */
    isNaN(): boolean;
    /**
     * this === Infinity
     * @returns {boolean} isPositiveInfinity(A)
     */
    isPositiveInfinity(): boolean;
    /**
     * this === -Infinity
     * @returns {boolean} isNegativeInfinity(A)
     */
    isNegativeInfinity(): boolean;
    /**
     * this === Infinity or -Infinity
     * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
     */
    isInfinite(): boolean;
    /**
     * Return true if the value is finite number.
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * Return true if the value is prime number.
     * - Calculated as an integer.
     * - Calculate up to `2251799813685248(=2^51)`.
     * @returns {boolean} - If the calculation range is exceeded, null is returned.
     */
    isPrime(): boolean;
    /**
     * Return true if the value is prime number by Miller-Labin prime number determination method.
     *
     * Attention : it takes a very long time to process.
     * - Calculated as an integer.
     * @param {KBigDecimalInputData} [certainty=100] - Repeat count (prime precision).
     * @returns {boolean}
     */
    isProbablePrime(certainty?: KBigDecimalInputData): boolean;
    /**
     * Next prime.
     * @param {KBigDecimalInputData} [certainty=100] - Repeat count (prime precision).
     * @param {KBigDecimalInputData} [search_max=100000] - Search range of next prime.
     * @returns {_BigDecimal_}
     */
    nextProbablePrime(certainty?: KBigDecimalInputData, search_max?: KBigDecimalInputData): _BigDecimal_;
    /**
     * -1
     * @returns {_BigDecimal_} -1
     */
    static MINUS_ONE: _BigDecimal_;
    /**
     * 0
     * @returns {_BigDecimal_} 0
     */
    static ZERO: _BigDecimal_;
    /**
     * 0.5
     * @returns {_BigDecimal_} 0.5
     */
    static HALF: _BigDecimal_;
    /**
     * 1
     * @returns {_BigDecimal_} 1
     */
    static ONE: _BigDecimal_;
    /**
     * 2
     * @returns {_BigDecimal_} 2
     */
    static TWO: _BigDecimal_;
    /**
     * 10
     * @returns {_BigDecimal_} 10
     */
    static TEN: _BigDecimal_;
    /**
     * PI
     * @returns {_BigDecimal_} 3.14...
     */
    static PI: _BigDecimal_;
    /**
     * 0.25 * PI.
     * @returns {_BigDecimal_} 0.78...
     */
    static QUARTER_PI: _BigDecimal_;
    /**
     * 0.5 * PI.
     * @returns {_BigDecimal_} 1.57...
     */
    static HALF_PI: _BigDecimal_;
    /**
     * 2 * PI.
     * @returns {_BigDecimal_} 6.28...
     */
    static TWO_PI: _BigDecimal_;
    /**
     * E, Napier's constant.
     * @returns {_BigDecimal_} E
     */
    static E: _BigDecimal_;
    /**
     * log_e(2)
     * @returns {_BigDecimal_} ln(2)
     */
    static LN2: _BigDecimal_;
    /**
     * log_e(10)
     * @returns {_BigDecimal_} ln(10)
     */
    static LN10: _BigDecimal_;
    /**
     * log_2(e)
     * @returns {_BigDecimal_} log_2(e)
     */
    static LOG2E: _BigDecimal_;
    /**
     * log_10(e)
     * @returns {_BigDecimal_} log_10(e)
     */
    static LOG10E: _BigDecimal_;
    /**
     * sqrt(2)
     * @returns {_BigDecimal_} sqrt(2)
     */
    static SQRT2: _BigDecimal_;
    /**
     * sqrt(0.5)
     * @returns {_BigDecimal_} sqrt(0.5)
     */
    static SQRT1_2: _BigDecimal_;
    /**
     * Positive infinity.
     * @returns {_BigDecimal_} Infinity
     */
    static POSITIVE_INFINITY: _BigDecimal_;
    /**
     * Negative Infinity.
     * @returns {_BigDecimal_} -Infinity
     */
    static NEGATIVE_INFINITY: _BigDecimal_;
    /**
     * Not a Number.
     * @returns {_BigDecimal_} NaN
     */
    static NaN: _BigDecimal_;
}

/**
 * _BigInteger_ type argument.
 * - _BigInteger_
 * - number
 * - string
 * - Array<string|number>
 * - {toBigInteger:function}
 * - {intValue:number}
 * - {toString:function}
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
 * - "0xff", ["ff", 16]
 * - "0o01234567", ["01234567", 8]
 * - "0b0110101", ["0110101", 2]
 * @typedef {_BigInteger_|number|boolean|string|Array<string|number>|{toBigInteger:function}|{intValue:number}|{toString:function}} KBigIntegerInputData
 */
declare type KBigIntegerInputData = _BigInteger_|number|boolean|string|Array<string|number>|{toBigInteger:any}|{intValue:number}|{toString:any};


/**
 * Create an arbitrary-precision integer.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
 * - "0xff", ["ff", 16]
 * - "0o01234567", ["01234567", 8]
 * - "0b0110101", ["0110101", 2]
 * @param {KBigIntegerInputData} [number] - Numeric data. See how to use the function.
 */
declare class _BigInteger_ {
    constructor(number?: KBigIntegerInputData);
    /**
     * Create an entity object of this class.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_}
     */
    static create(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Create an arbitrary-precision integer.
     * - Does not support strings using exponential notation.
     * - If you want to initialize with the specified base number, please set up with an array ["ff", 16].
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_}
     */
    static valueOf(number: KBigIntegerInputData): _BigInteger_;
    /**
     * _Random_ number of specified bit length.
     * @param {KBigIntegerInputData} bitsize - Bit length.
     * @param {_Random_} [random] - Class for creating random numbers.
     * @returns {_BigInteger_}
     */
    static createRandomBigInteger(bitsize: KBigIntegerInputData, random?: _Random_): _BigInteger_;
    /**
     * Convert to string.
     * @param {KBigIntegerInputData} [radix=10] - Base number.
     * @returns {string}
     */
    toString(radix?: KBigIntegerInputData): string;
    /**
     * Deep copy.
     * @returns {_BigInteger_}
     */
    clone(): _BigInteger_;
    /**
     * Absolute value.
     * @returns {_BigInteger_} abs(A)
     */
    abs(): _BigInteger_;
    /**
     * this * -1
     * @returns {_BigInteger_} -A
     */
    negate(): _BigInteger_;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    sign(): number;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    signum(): number;
    /**
     * Add.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A + B
     */
    add(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Subtract.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A - B
     */
    subtract(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Subtract.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A - B
     */
    sub(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Multiply.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A * B
     */
    multiply(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Multiply.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A * B
     */
    mul(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Divide and remainder.
     * @param {KBigIntegerInputData} number
     * @returns {Array<_BigInteger_>} [C = fix(A / B), A - C * B]
     */
    divideAndRemainder(number: KBigIntegerInputData): _BigInteger_[];
    /**
     * Divide.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} fix(A / B)
     */
    divide(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Divide.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} fix(A / B)
     */
    div(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Remainder of division.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A % B
     */
    remainder(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Remainder of division.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A % B
     */
    rem(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Modulo, positive remainder of division.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A mod B
     */
    mod(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Modular exponentiation.
     * @param {KBigIntegerInputData} exponent
     * @param {KBigIntegerInputData} m
     * @returns {_BigInteger_} A^B mod m
     */
    modPow(exponent: KBigIntegerInputData, m: KBigIntegerInputData): _BigInteger_;
    /**
     * Modular multiplicative inverse.
     * @param {KBigIntegerInputData} m
     * @returns {_BigInteger_} A^(-1) mod m
     */
    modInverse(m: KBigIntegerInputData): _BigInteger_;
    /**
     * Factorial function, x!.
     * @returns {_BigInteger_} n!
     */
    factorial(): _BigInteger_;
    /**
     * Multiply a multiple of ten.
     * @param {KBigIntegerInputData} n
     * @returns {_BigInteger_} x * 10^n
     */
    scaleByPowerOfTen(n: KBigIntegerInputData): _BigInteger_;
    /**
     * Power function.
     * @param {KBigIntegerInputData} exponent
     * @returns {_BigInteger_} pow(A, B)
     */
    pow(exponent: KBigIntegerInputData): _BigInteger_;
    /**
     * Square.
     * @returns {_BigInteger_} A^2
     */
    square(): _BigInteger_;
    /**
     * Square root.
     * @returns {_BigInteger_} floor(sqrt(A))
     */
    sqrt(): _BigInteger_;
    /**
     * Set default class of random.
     * This is used if you do not specify a random number.
     * @param {_Random_} random
     */
    static setDefaultRandom(random: _Random_): void;
    /**
     * Return default _Random_ class.
     * Used when _Random_ not specified explicitly.
     * @returns {_Random_}
     */
    static getDefaultRandom(): _Random_;
    /**
     * Value at the specified position of the internally used array that composed of hexadecimal numbers.
     * @param {KBigIntegerInputData} point - Array address.
     * @returns {number}
     */
    getShort(point: KBigIntegerInputData): number;
    /**
     * boolean value.
     * @returns {boolean}
     */
    booleanValue: boolean;
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
     * Euclidean algorithm.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} gcd(x, y)
     */
    gcd(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Extended Euclidean algorithm.
     * @param {KBigIntegerInputData} number
     * @returns {Array<_BigInteger_>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
     */
    extgcd(number: KBigIntegerInputData): _BigInteger_[];
    /**
     * Least common multiple.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} lcm(x, y)
     */
    lcm(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Equals.
     * @param {KBigIntegerInputData} number
     * @returns {boolean} A === B
     */
    equals(number: KBigIntegerInputData): boolean;
    /**
     * Compare values without sign.
     * @param {KBigIntegerInputData} number
     * @returns {number} abs(A) > abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
     */
    compareToAbs(number: KBigIntegerInputData): number;
    /**
     * Compare values.
     * @param {KBigIntegerInputData} number
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: KBigIntegerInputData): number;
    /**
     * Numeric type match.
     * @param {KBigIntegerInputData} number
     * @returns {boolean}
     */
    equalsState(number: KBigIntegerInputData): boolean;
    /**
     * Maximum number.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} max([A, B])
     */
    max(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Minimum number.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} min([A, B])
     */
    min(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Clip number within range.
     * @param {KBigIntegerInputData} min
     * @param {KBigIntegerInputData} max
     * @returns {_BigInteger_} min(max(x, min), max)
     */
    clip(min: KBigIntegerInputData, max: KBigIntegerInputData): _BigInteger_;
    /**
     * Prime represented within the specified bit length.
     * @param {KBigIntegerInputData} bits - Bit length.
     * @param {_Random_} [random] - Class for creating random numbers.
     * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
     * @param {KBigIntegerInputData} [create_count=500] - Number of times to retry if prime generation fails.
     * @returns {_BigInteger_}
     */
    static probablePrime(bits: KBigIntegerInputData, random?: _Random_, certainty?: KBigIntegerInputData, create_count?: KBigIntegerInputData): _BigInteger_;
    /**
     * Return true if the value is prime number.
     * - Calculate up to `2251799813685248(=2^51)`.
     * @returns {boolean} - If the calculation range is exceeded, null is returned.
     */
    isPrime(): boolean;
    /**
     * Return true if the value is prime number by Miller-Labin prime number determination method.
     *
     * Attention : it takes a very long time to process.
     * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
     * @returns {boolean}
     */
    isProbablePrime(certainty?: KBigIntegerInputData): boolean;
    /**
     * Next prime.
     * @param {KBigIntegerInputData} [certainty=100] - Repeat count (prime precision).
     * @param {KBigIntegerInputData} [search_max=100000] - Search range of next prime.
     * @returns {_BigInteger_}
     */
    nextProbablePrime(certainty?: KBigIntegerInputData, search_max?: KBigIntegerInputData): _BigInteger_;
    /**
     * this << n
     * @param {KBigIntegerInputData} n
     * @returns {_BigInteger_} A << n
     */
    shift(n: KBigIntegerInputData): _BigInteger_;
    /**
     * this << n
     * @param {KBigIntegerInputData} n
     * @returns {_BigInteger_} A << n
     */
    shiftLeft(n: KBigIntegerInputData): _BigInteger_;
    /**
     * this >> n
     * @param {KBigIntegerInputData} n
     * @returns {_BigInteger_} A >> n
     */
    shiftRight(n: KBigIntegerInputData): _BigInteger_;
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
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A & B
     */
    and(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Logical OR.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A | B
     */
    or(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Logical Exclusive-OR.
     * @param {KBigIntegerInputData} number
     * @returns {_BigInteger_} A ^ B
     */
    xor(number: KBigIntegerInputData): _BigInteger_;
    /**
     * Logical Not. (mutable)
     * @returns {_BigInteger_} !A
     */
    not(): _BigInteger_;
    /**
     * this | (1 << n)
     * @param {KBigIntegerInputData} bit
     * @returns {_BigInteger_}
     */
    setBit(bit: KBigIntegerInputData): _BigInteger_;
    /**
     * Invert a specific bit.
     * @param {KBigIntegerInputData} bit
     * @returns {_BigInteger_}
     */
    flipBit(bit: KBigIntegerInputData): _BigInteger_;
    /**
     * Lower a specific bit.
     * @param {KBigIntegerInputData} bit
     * @returns {_BigInteger_}
     */
    clearBit(bit: KBigIntegerInputData): _BigInteger_;
    /**
     * Test if a particular bit is on.
     * @param {KBigIntegerInputData} bit
     * @returns {boolean}
     */
    testBit(bit: KBigIntegerInputData): boolean;
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
     * this === NaN
     * @returns {boolean} isNaN(A)
     */
    isNaN(): boolean;
    /**
     * this === Infinity
     * @returns {boolean} isPositiveInfinity(A)
     */
    isPositiveInfinity(): boolean;
    /**
     * this === -Infinity
     * @returns {boolean} isNegativeInfinity(A)
     */
    isNegativeInfinity(): boolean;
    /**
     * this === Infinity or -Infinity
     * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
     */
    isInfinite(): boolean;
    /**
     * Return true if the value is finite number.
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * -1
     * @returns {_BigInteger_} -1
     */
    static MINUS_ONE: _BigInteger_;
    /**
     * 0
     * @returns {_BigInteger_} 0
     */
    static ZERO: _BigInteger_;
    /**
     * 1
     * @returns {_BigInteger_} 1
     */
    static ONE: _BigInteger_;
    /**
     * 2
     * @returns {_BigInteger_} 2
     */
    static TWO: _BigInteger_;
    /**
     * 10
     * @returns {_BigInteger_} 10
     */
    static TEN: _BigInteger_;
    /**
     * Positive infinity.
     * @returns {_BigInteger_} Infinity
     */
    static POSITIVE_INFINITY: _BigInteger_;
    /**
     * Negative Infinity.
     * @returns {_BigInteger_} -Infinity
     */
    static NEGATIVE_INFINITY: _BigInteger_;
    /**
     * Not a Number.
     * @returns {_BigInteger_} NaN
     */
    static NaN: _BigInteger_;
}

/**
 * _Complex_ type argument.
 * - _Complex_
 * - number
 * - boolean
 * - string
 * - Array<number>
 * - {_re:number,_im:number}
 * - {doubleValue:number}
 * - {toString:function}
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @typedef {_Complex_|number|boolean|string|Array<number>|{_re:number,_im:number}|{doubleValue:number}|{toString:function}} KComplexInputData
 */
declare type KComplexInputData = _Complex_|number|boolean|string|Array<number>|{_re:number,_im:number}|{doubleValue:number}|{toString:any};


/**
 * Create a complex number.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @param {KComplexInputData} number - _Complex_ number. See how to use the function.
 */
declare class _Complex_ {
    constructor(number: KComplexInputData);
    /**
     * Create an entity object of this class.
     * @param {KComplexInputData} number
     * @returns {_Complex_}
     */
    static create(number: KComplexInputData): _Complex_;
    /**
     * Convert number to _Complex_ type.
     * @param {KComplexInputData} number
     * @returns {_Complex_}
     */
    static valueOf(number: KComplexInputData): _Complex_;
    /**
     * boolean value.
     * @returns {boolean}
     */
    booleanValue: boolean;
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
     * @returns {_Complex_}
     */
    clone(): _Complex_;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Create random values with uniform random numbers.
     * @returns {_Complex_}
     */
    static rand(): _Complex_;
    /**
     * Create random values with normal distribution.
     * @returns {_Complex_}
     */
    static randn(): _Complex_;
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
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {_Complex_}
     */
    sign(): _Complex_;
    /**
     * Add.
     * @param {KComplexInputData} number
     * @returns {_Complex_} A + B
     */
    add(number: KComplexInputData): _Complex_;
    /**
     * Subtract.
     * @param {KComplexInputData} number
     * @returns {_Complex_} A - B
     */
    sub(number: KComplexInputData): _Complex_;
    /**
     * Multiply.
     * @param {KComplexInputData} number
     * @returns {_Complex_} A * B
     */
    mul(number: KComplexInputData): _Complex_;
    /**
     * Inner product/Dot product.
     * @param {KComplexInputData} number
     * @returns {_Complex_} A * conj(B)
     */
    dot(number: KComplexInputData): _Complex_;
    /**
     * Divide.
     * @param {KComplexInputData} number
     * @returns {_Complex_} A / B
     */
    div(number: KComplexInputData): _Complex_;
    /**
     * Modulo, positive remainder of division.
     * @param {KComplexInputData} number - Divided value (real number only).
     * @returns {_Complex_} A mod B
     */
    mod(number: KComplexInputData): _Complex_;
    /**
     * Inverse number of this value.
     * @returns {_Complex_} 1 / A
     */
    inv(): _Complex_;
    /**
     * Equals.
     * @param {KComplexInputData} number
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: KComplexInputData, tolerance?: KComplexInputData): boolean;
    /**
     * Compare values.
     * @param {KComplexInputData} number
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: KComplexInputData, tolerance?: KComplexInputData): number;
    /**
     * Maximum number.
     * @param {KComplexInputData} number
     * @returns {_Complex_} max([A, B])
     */
    max(number: KComplexInputData): _Complex_;
    /**
     * Minimum number.
     * @param {KComplexInputData} number
     * @returns {_Complex_} min([A, B])
     */
    min(number: KComplexInputData): _Complex_;
    /**
     * Clip number within range.
     * @param {KComplexInputData} min
     * @param {KComplexInputData} max
     * @returns {_Complex_} min(max(x, min), max)
     */
    clip(min: KComplexInputData, max: KComplexInputData): _Complex_;
    /**
     * Return true if the value is integer.
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isInteger(tolerance?: KComplexInputData): boolean;
    /**
     * Returns true if the vallue is complex integer (including normal integer).
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} real(A) === integer && imag(A) === integer
     */
    isComplexInteger(tolerance?: KComplexInputData): boolean;
    /**
     * this === 0
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 0
     */
    isZero(tolerance?: KComplexInputData): boolean;
    /**
     * this === 1
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 1
     */
    isOne(tolerance?: KComplexInputData): boolean;
    /**
     * Returns true if the vallue is complex number (imaginary part is not 0).
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) !== 0
     */
    isComplex(tolerance?: KComplexInputData): boolean;
    /**
     * Return true if the value is real number.
     * @param {KComplexInputData} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) === 0
     */
    isReal(tolerance?: KComplexInputData): boolean;
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
     * @returns {boolean} isPositiveInfinity(A)
     */
    isPositiveInfinity(): boolean;
    /**
     * this === -Infinity
     * @returns {boolean} isNegativeInfinity(A)
     */
    isNegativeInfinity(): boolean;
    /**
     * this === Infinity or -Infinity
     * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
     */
    isInfinite(): boolean;
    /**
     * Return true if the value is finite number.
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * Absolute value.
     * @returns {_Complex_} abs(A)
     */
    abs(): _Complex_;
    /**
     * _Complex_ conjugate.
     * @returns {_Complex_} real(A) - imag(A)j
     */
    conj(): _Complex_;
    /**
     * this * -1
     * @returns {_Complex_} -A
     */
    negate(): _Complex_;
    /**
     * Power function.
     * @param {KComplexInputData} number
     * @returns {_Complex_} pow(A, B)
     */
    pow(number: KComplexInputData): _Complex_;
    /**
     * Square.
     * @returns {_Complex_} pow(A, 2)
     */
    square(): _Complex_;
    /**
     * Square root.
     * @returns {_Complex_} sqrt(A)
     */
    sqrt(): _Complex_;
    /**
     * Reciprocal square root.
     * @returns {_Complex_} rsqrt(A)
     */
    rsqrt(): _Complex_;
    /**
     * Logarithmic function.
     * @returns {_Complex_} log(A)
     */
    log(): _Complex_;
    /**
     * Exponential function.
     * @returns {_Complex_} exp(A)
     */
    exp(): _Complex_;
    /**
     * Sine function.
     * @returns {_Complex_} sin(A)
     */
    sin(): _Complex_;
    /**
     * Cosine function.
     * @returns {_Complex_} cos(A)
     */
    cos(): _Complex_;
    /**
     * Tangent function.
     * @returns {_Complex_} tan(A)
     */
    tan(): _Complex_;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI/2, PI/2].
     * @returns {_Complex_} atan(A)
     */
    atan(): _Complex_;
    /**
     * Atan (arc tangent) function.
     * Return the values of [-PI, PI] .
     * Supports only real numbers.
     * @param {KComplexInputData} [number] - X
     * @returns {_Complex_} atan2(Y, X)
     */
    atan2(number?: KComplexInputData): _Complex_;
    /**
     * Normalized sinc function.
     * @returns {_Complex_} sinc(A)
     */
    sinc(): _Complex_;
    /**
     * Floor.
     * @returns {_Complex_} floor(A)
     */
    floor(): _Complex_;
    /**
     * Ceil.
     * @returns {_Complex_} ceil(A)
     */
    ceil(): _Complex_;
    /**
     * Rounding to the nearest integer.
     * @returns {_Complex_} round(A)
     */
    round(): _Complex_;
    /**
     * To integer rounded down to the nearest.
     * @returns {_Complex_} fix(A), trunc(A)
     */
    fix(): _Complex_;
    /**
     * _Fraction_.
     * @returns {_Complex_} fract(A)
     */
    fract(): _Complex_;
    /**
     * 1
     * @returns {_Complex_} 1
     */
    static ONE: _Complex_;
    /**
     * 2
     * @returns {_Complex_} 2
     */
    static TWO: _Complex_;
    /**
     * 10
     * @returns {_Complex_} 10
     */
    static TEN: _Complex_;
    /**
     * 0
     * @returns {_Complex_} 0
     */
    static ZERO: _Complex_;
    /**
     * -1
     * @returns {_Complex_} -1
     */
    static MINUS_ONE: _Complex_;
    /**
     * i, j
     * @returns {_Complex_} i
     */
    static I: _Complex_;
    /**
     * PI.
     * @returns {_Complex_} 3.14...
     */
    static PI: _Complex_;
    /**
     * 0.25 * PI.
     * @returns {_Complex_} 0.78...
     */
    static QUARTER_PI: _Complex_;
    /**
     * 0.5 * PI.
     * @returns {_Complex_} 1.57...
     */
    static HALF_PI: _Complex_;
    /**
     * 2 * PI.
     * @returns {_Complex_} 6.28...
     */
    static TWO_PI: _Complex_;
    /**
     * E, Napier's constant.
     * @returns {_Complex_} 2.71...
     */
    static E: _Complex_;
    /**
     * log_e(2)
     * @returns {_Complex_} ln(2)
     */
    static LN2: _Complex_;
    /**
     * log_e(10)
     * @returns {_Complex_} ln(10)
     */
    static LN10: _Complex_;
    /**
     * log_2(e)
     * @returns {_Complex_} log_2(e)
     */
    static LOG2E: _Complex_;
    /**
     * log_10(e)
     * @returns {_Complex_} log_10(e)
     */
    static LOG10E: _Complex_;
    /**
     * sqrt(2)
     * @returns {_Complex_} sqrt(2)
     */
    static SQRT2: _Complex_;
    /**
     * sqrt(0.5)
     * @returns {_Complex_} sqrt(0.5)
     */
    static SQRT1_2: _Complex_;
    /**
     * 0.5
     * @returns {_Complex_} 0.5
     */
    static HALF: _Complex_;
    /**
     * Positive infinity.
     * @returns {_Complex_} Infinity
     */
    static POSITIVE_INFINITY: _Complex_;
    /**
     * Negative Infinity.
     * @returns {_Complex_} -Infinity
     */
    static NEGATIVE_INFINITY: _Complex_;
    /**
     * Not a Number.
     * @returns {_Complex_} NaN
     */
    static NaN: _Complex_;
}

/**
 * Create _BigDecimal_ configuration.
 * @param {string|number} precision_or_name - Precision. Or String output by _MathContext_.toString.
 * @param {_RoundingModeEntity_} [roundingMode=_RoundingMode_.HALF_UP] - _RoundingMode_.
 */
declare class _MathContext_ {
    constructor(precision_or_name: string | number, roundingMode?: _RoundingModeEntity_);
    /**
     * The precision of this _BigDecimal_.
     * @returns {number}
     */
    getPrecision(): number;
    /**
     * Method of rounding.
     * @returns {_RoundingModeEntity_}
     */
    getRoundingMode(): _RoundingModeEntity_;
    /**
     * Equals.
     * @param {_MathContext_} x - Number to compare.
     * @returns {boolean}
     */
    equals(x: _MathContext_): boolean;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * No decimal point limit.
     * However, an error occurs in the case of cyclic fraction in division.
     * @returns {_MathContext_}
     */
    static UNLIMITED: _MathContext_;
    /**
     * 32-bit floating point.
     * - Significand precision: 23 bits
     * - Equivalent of the C language float.
     * @returns {_MathContext_}
     */
    static DECIMAL32: _MathContext_;
    /**
     * 64-bit floating point.
     * - Significand precision: 52 bits
     * - Equivalent of the C language double.
     * @returns {_MathContext_}
     */
    static DECIMAL64: _MathContext_;
    /**
     * 128-bit floating point.
     * - Significand precision: 112 bits
     * - Equivalent of the C language long double.
     * @returns {_MathContext_}
     */
    static DECIMAL128: _MathContext_;
    /**
     * 256-bit floating point.
     * - Significand precision: 237 bits
     * @type {_MathContext_}
     */
    static DECIMAL256: _MathContext_;
}

/**
 * Base class for rounding mode for _BigDecimal_.
 */
declare class _RoundingModeEntity_ {
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

declare interface _RoundingMode_UP_ extends _RoundingModeEntity_ {
}

/**
 * Directed rounding to an integer.
 * Round towards positive infinity if positive, negative infinity if negative.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_UP_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_DOWN_ extends _RoundingModeEntity_ {
}

/**
 * Directed rounding to an integer.
 * Round towards 0.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_DOWN_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_CEILING_ extends _RoundingModeEntity_ {
}

/**
 * Directed rounding to an integer.
 * Round up to positive infinity.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_CEILING_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_FLOOR_ extends _RoundingModeEntity_ {
}

/**
 * Directed rounding to an integer.
 * Round down to negative infinity.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_FLOOR_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_HALF_UP_ extends _RoundingModeEntity_ {
}

/**
 * Rounding to the nearest integer.
 * Round half towards positive infinity.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_HALF_UP_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_HALF_DOWN_ extends _RoundingModeEntity_ {
}

/**
 * Rounding to the nearest integer.
 * Round half towards negative infinity.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_HALF_DOWN_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_HALF_EVEN_ extends _RoundingModeEntity_ {
}

/**
 * Rounding to the nearest integer
 * Round to the nearest side. If the median, round to the even side.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_HALF_EVEN_ implements _RoundingModeEntity_ {
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

declare interface _RoundingMode_UNNECESSARY_ extends _RoundingModeEntity_ {
}

/**
 * Do not round.
 * Error if you need to round it.
 * @implements {_RoundingModeEntity_}
 */
declare class _RoundingMode_UNNECESSARY_ implements _RoundingModeEntity_ {
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
 * Rounding mode class for _BigDecimal_.
 */
declare class _RoundingMode_ {
    /**
     * Get rounding class represented by specified string.
     * @param {string|_RoundingModeEntity_|Object} name - Mode name.
     * @returns {typeof _RoundingModeEntity_}
     */
    static valueOf(name: string | _RoundingModeEntity_ | any): typeof _RoundingModeEntity_;
    /**
     * Directed rounding to an integer.
     * Round towards positive infinity if positive, negative infinity if negative.
     * @returns {typeof _RoundingModeEntity_}
     */
    static UP: typeof _RoundingModeEntity_;
    /**
     * Directed rounding to an integer.
     * Round towards 0.
     * @returns {typeof _RoundingModeEntity_}
     */
    static DOWN: typeof _RoundingModeEntity_;
    /**
     * Directed rounding to an integer.
     * Round up to positive infinity.
     * @returns {typeof _RoundingModeEntity_}
     */
    static CEILING: typeof _RoundingModeEntity_;
    /**
     * Directed rounding to an integer.
     * Round down to negative infinity.
     * @returns {typeof _RoundingModeEntity_}
     */
    static FLOOR: typeof _RoundingModeEntity_;
    /**
     * Rounding to the nearest integer.
     * Round half towards positive infinity.
     * @returns {typeof _RoundingModeEntity_}
     */
    static HALF_UP: typeof _RoundingModeEntity_;
    /**
     * Rounding to the nearest integer.
     * Round half towards negative infinity.
     * @returns {typeof _RoundingModeEntity_}
     */
    static HALF_DOWN: typeof _RoundingModeEntity_;
    /**
     * Rounding to the nearest integer
     * Round to the nearest side. If the median, round to the even side.
     * @returns {typeof _RoundingModeEntity_}
     */
    static HALF_EVEN: typeof _RoundingModeEntity_;
    /**
     * Do not round.
     * Error if you need to round it.
     * @returns {typeof _RoundingModeEntity_}
     */
    static UNNECESSARY: typeof _RoundingModeEntity_;
}

/**
 * Create an fraction.
 *
 * Initialization can be performed as follows.
 * - 10, "10", "10/1", "10.0/1.0", ["10", "1"], [10, 1]
 * - 0.01, "0.01", "0.1e-1", "1/100", [1, 100], [2, 200], ["2", "200"]
 * - "1/3", "0.[3]", "0.(3)", "0.'3'", "0."3"", [1, 3], [2, 6]
 * - "3.555(123)" = 3.555123123123..., "147982 / 41625"
 * @param {KFractionInputData} [number] - _Fraction_ data. See how to use the function.
 */
declare class _Fraction_ {
    constructor(number?: KFractionInputData);
    /**
     * numerator
     * @type {_BigInteger_}
     */
    numerator: _BigInteger_;
    /**
     * denominator
     * @type {_BigInteger_}
     */
    denominator: _BigInteger_;
    /**
     * Create an entity object of this class.
     * @param {KFractionInputData} number
     * @returns {_Fraction_}
     */
    static create(number: KFractionInputData): _Fraction_;
    /**
     * Convert number to _Fraction_ type.
     * @param {KFractionInputData} number
     * @returns {_Fraction_}
     */
    static valueOf(number: KFractionInputData): _Fraction_;
    /**
     * Deep copy.
     * @returns {_Fraction_}
     */
    clone(): _Fraction_;
    /**
     * Absolute value.
     * @returns {_Fraction_} abs(A)
     */
    abs(): _Fraction_;
    /**
     * this * -1
     * @returns {_Fraction_} -A
     */
    negate(): _Fraction_;
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
     * @param {KFractionInputData} num
     * @return {_Fraction_}
     */
    add(num: KFractionInputData): _Fraction_;
    /**
     * Subtract.
     * @param {KFractionInputData} num
     * @return {_Fraction_}
     */
    sub(num: KFractionInputData): _Fraction_;
    /**
     * Multiply.
     * @param {KFractionInputData} num
     * @return {_Fraction_}
     */
    mul(num: KFractionInputData): _Fraction_;
    /**
     * Divide.
     * @param {KFractionInputData} num
     * @return {_Fraction_}
     */
    div(num: KFractionInputData): _Fraction_;
    /**
     * Inverse number of this value.
     * @return {_Fraction_}
     */
    inv(): _Fraction_;
    /**
     * Modulo, positive remainder of division.
     * @param {KFractionInputData} num
     * @return {_Fraction_}
     */
    mod(num: KFractionInputData): _Fraction_;
    /**
     * Power function.
     * - Supports only integers.
     * @param {KFractionInputData} num
     * @returns {_Fraction_} pow(A, B)
     */
    pow(num: KFractionInputData): _Fraction_;
    /**
     * Factorial function, x!.
     * - Supports only integers.
     * @returns {_Fraction_} n!
     */
    factorial(): _Fraction_;
    /**
     * Multiply a multiple of ten.
     * - Supports only integers.
     * @param {KFractionInputData} n
     * @returns {_Fraction_}
     */
    scaleByPowerOfTen(n: KFractionInputData): _Fraction_;
    /**
     * boolean value.
     * @returns {boolean}
     */
    booleanValue: boolean;
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
     * return _BigInteger_.
     * @returns {_BigInteger_}
     */
    toBigInteger(): _BigInteger_;
    /**
     * return _BigDecimal_.
     * @param {_MathContext_} [mc] - _MathContext_ setting after calculation.
     * @returns {_BigDecimal_}
     */
    toBigDecimal(mc?: _MathContext_): _BigDecimal_;
    /**
     * Equals.
     * @param {KFractionInputData} num
     * @returns {boolean} A === B
     */
    equals(num: KFractionInputData): boolean;
    /**
     * Numeric type match.
     * @param {KFractionInputData} number
     * @returns {boolean}
     */
    equalsState(number: KFractionInputData): boolean;
    /**
     * Compare values.
     * @param {KFractionInputData} num
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(num: KFractionInputData): number;
    /**
     * Maximum number.
     * @param {KFractionInputData} number
     * @returns {_Fraction_} max([A, B])
     */
    max(number: KFractionInputData): _Fraction_;
    /**
     * Minimum number.
     * @param {KFractionInputData} number
     * @returns {_Fraction_} min([A, B])
     */
    min(number: KFractionInputData): _Fraction_;
    /**
     * Clip number within range.
     * @param {KFractionInputData} min
     * @param {KFractionInputData} max
     * @returns {_Fraction_} min(max(x, min), max)
     */
    clip(min: KFractionInputData, max: KFractionInputData): _Fraction_;
    /**
     * Floor.
     * @returns {_Fraction_} floor(A)
     */
    floor(): _Fraction_;
    /**
     * Ceil.
     * @returns {_Fraction_} ceil(A)
     */
    ceil(): _Fraction_;
    /**
     * Rounding to the nearest integer.
     * @returns {_Fraction_} round(A)
     */
    round(): _Fraction_;
    /**
     * To integer rounded down to the nearest.
     * @returns {_Fraction_} fix(A), trunc(A)
     */
    fix(): _Fraction_;
    /**
     * _Fraction_.
     * @returns {_Fraction_} fract(A)
     */
    fract(): _Fraction_;
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
     * this === NaN
     * @returns {boolean} isNaN(A)
     */
    isNaN(): boolean;
    /**
     * this === Infinity
     * @returns {boolean} isPositiveInfinity(A)
     */
    isPositiveInfinity(): boolean;
    /**
     * this === -Infinity
     * @returns {boolean} isNegativeInfinity(A)
     */
    isNegativeInfinity(): boolean;
    /**
     * this === Infinity or -Infinity
     * @returns {boolean} isPositiveInfinity(A) || isNegativeInfinity(A)
     */
    isInfinite(): boolean;
    /**
     * Return true if the value is finite number.
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * -1
     * @returns {_Fraction_} -1
     */
    static MINUS_ONE: _Fraction_;
    /**
     * 0
     * @returns {_Fraction_} 0
     */
    static ZERO: _Fraction_;
    /**
     * 0.5
     * @returns {_Fraction_} 0.5
     */
    static HALF: _Fraction_;
    /**
     * 1
     * @returns {_Fraction_} 1
     */
    static ONE: _Fraction_;
    /**
     * 2
     * @returns {_Fraction_} 2
     */
    static TWO: _Fraction_;
    /**
     * 10
     * @returns {_Fraction_} 10
     */
    static TEN: _Fraction_;
    /**
     * Positive infinity.
     * @returns {_Fraction_} Infinity
     */
    static POSITIVE_INFINITY: _Fraction_;
    /**
     * Negative Infinity.
     * @returns {_Fraction_} -Infinity
     */
    static NEGATIVE_INFINITY: _Fraction_;
    /**
     * Not a Number.
     * @returns {_Fraction_} NaN
     */
    static NaN: _Fraction_;
}

/**
 * _Matrix_ type argument.
 * - _Matrix_
 * - _Complex_
 * - number
 * - string
 * - Array<string|number|_Complex_|_Matrix_>
 * - Array<Array<string|number|_Complex_|_Matrix_>>
 * - {doubleValue:number}
 * - {toString:function}
 *
 * Initialization can be performed as follows.
 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
 * @typedef {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_|_Matrix_>|Array<Array<string|number|_Complex_|_Matrix_>>|{doubleValue:number}|{toString:function}} KMatrixInputData
 */
declare type KMatrixInputData = _Matrix_|_Complex_|number|string|Array<string|number|_Complex_|_Matrix_>|Array<Array<string|number|_Complex_|_Matrix_>>|{doubleValue:number}|{toString:any};


/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KMatrixSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */
declare type KMatrixSettings = {
    dimension?: string | number;
    correction?: any;
};

/**
 * Create a complex matrix.
 * Initialization can be performed as follows.
 * - 10, "10", "3 + 4j", "[ 1 ]", "[1, 2, 3]", "[1 2 3]", [1, 2, 3],
 * - [[1, 2], [3, 4]], "[1 2; 3 4]", "[1+2i 3+4i]",
 * - "[1:10]", "[1:2:3]" (MATLAB / Octave / Scilab compatible).
 * @param {KMatrixInputData} number - _Complex_ matrix. See how to use the function.
 */
declare class _Matrix_ {
    constructor(number: KMatrixInputData);
    /**
     * Create an entity object of this class.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_}
     */
    static create(number: KMatrixInputData): _Matrix_;
    /**
     * Convert number to _Matrix_ type.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_}
     */
    static valueOf(number: KMatrixInputData): _Matrix_;
    /**
     * Delete cache.
     */
    _clearCash(): void;
    /**
     * Deep copy.
     * @returns {_Matrix_}
     */
    clone(): _Matrix_;
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
     * @param {KMatrixInputData} number
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: KMatrixInputData, tolerance?: KMatrixInputData): boolean;
    /**
     * Array of real parts of elements in matrix.
     * @returns {Array<Array<number>>}
     */
    getNumberMatrixArray(): number[][];
    /**
     * _Complex_ array of complex numbers of each element of the matrix.
     * @returns {Array<Array<_Complex_>>}
     */
    getComplexMatrixArray(): _Complex_[][];
    /**
     * Perform the same process on all elements in the matrix.
     * @param {function(_Complex_, number, number): ?Object } eachfunc - Function(num, row, col)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    cloneMatrixDoEachCalculation(eachfunc: (...params: any[]) => any): _Matrix_;
    /**
     * Create _Matrix_ with specified initialization for each element in matrix.
     * @param {function(number, number): ?Object } eachfunc - Function(row, col)
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length=dimension] - Number of columns.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    static createMatrixDoEachCalculation(eachfunc: (...params: any[]) => any, dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Treat the columns of the matrix as vectors and execute the same process.
     * - If the matrix is a row vector, it performs the same processing for the row vector.
     * @param {function(Array<_Complex_>): Array<_Complex_>} array_function - Function(array)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    eachVectorAuto(array_function: (...params: any[]) => any): _Matrix_;
    /**
     * Treat the rows and columns of the matrix as vectors and perform the same processing.
     * 1. First run the same process for the row.
     * 2. Finally perform the same processing for the column.
     * @param {function(Array<_Complex_>): Array<_Complex_>} array_function - Function(array)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    eachVectorBoth(array_function: (...params: any[]) => any): _Matrix_;
    /**
     * Treat the rows of the matrix as vectors and execute the same process.
     * @param {function(Array<_Complex_>): Array<_Complex_>} array_function - Function(array)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    eachVectorRow(array_function: (...params: any[]) => any): _Matrix_;
    /**
     * Treat the columns of the matrix as vectors and execute the same process.
     * @param {function(Array<_Complex_>): Array<_Complex_>} array_function - Function(array)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    eachVectorColumn(array_function: (...params: any[]) => any): _Matrix_;
    /**
     * Treat the rows and columns of the matrix as vectors and perform the same processing.
     * The arguments of the method can switch the direction of the matrix to be executed.
     * @param {function(Array<_Complex_>): Array<_Complex_>} array_function - Function(array)
     * @param {string|number} [dimension="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    eachVector(array_function: (...params: any[]) => any, dimension?: string | number): _Matrix_;
    /**
     * Extract the specified part of the matrix.
     * @param {KMatrixInputData} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
     * @param {KMatrixInputData} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {_Matrix_}
     */
    getMatrix(row: KMatrixInputData, col: KMatrixInputData, isUpOffset?: boolean): _Matrix_;
    /**
     * Change specified element in matrix.
     * @param {KMatrixInputData} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
     * @param {KMatrixInputData} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
     * @param {KMatrixInputData} replace - _Matrix_ to be replaced.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {_Matrix_}
     */
    setMatrix(row: KMatrixInputData, col: KMatrixInputData, replace: KMatrixInputData, isUpOffset?: boolean): _Matrix_;
    /**
     * Returns the specified element in the matrix.
     * Each element of the matrix is composed of complex numbers.
     * @param {KMatrixInputData} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
     * @param {KMatrixInputData} [col] - If this is a matrix, the column number.
     * @returns {_Complex_}
     */
    getComplex(row_or_pos: KMatrixInputData, col?: KMatrixInputData): _Complex_;
    /**
     * Boolean value of the first element of the matrix.
     * @returns {boolean}
     */
    booleanValue: boolean;
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
     * @returns {_Complex_}
     */
    scalar: _Complex_;
    /**
     * Maximum size of rows or columns in the matrix.
     * @returns {number}
     */
    length: number;
    /**
     * Number of columns in the matrix.
     * @returns {number}
     */
    width: number;
    /**
     * Number of rows in matrix.
     * @returns {number}
     */
    height: number;
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
     * @param {KMatrixInputData} [p=2]
     * @returns {number}
     */
    norm(p?: KMatrixInputData): number;
    /**
     * Condition number of the matrix
     * @param {KMatrixInputData} [p=2]
     * @returns {number}
     */
    cond(p?: KMatrixInputData): number;
    /**
     * Inverse condition number.
     * @returns {number}
     */
    rcond(): number;
    /**
     * Rank.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    rank(tolerance?: KMatrixInputData): number;
    /**
     * Trace of a matrix.
     * Sum of diagonal elements.
     * @returns {_Complex_} trace(A)
     */
    trace(): _Complex_;
    /**
     * Determinant.
     * @returns {_Matrix_} |A|
     */
    det(): _Matrix_;
    /**
     * Creates a matrix composed of the specified number.
     * @param {KMatrixInputData} number - Value after initialization.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static memset(number: KMatrixInputData, dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Return identity matrix.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static eye(dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Create zero matrix.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static zeros(dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Create a matrix of all ones.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static ones(dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Generate a matrix composed of random values with uniform random numbers.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static rand(dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * Generate a matrix composed of random values with normal distribution.
     * @param {KMatrixInputData} dimension - Number of dimensions or rows.
     * @param {KMatrixInputData} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static randn(dimension: KMatrixInputData, column_length?: KMatrixInputData): _Matrix_;
    /**
     * If matrix, generate diagonal column vector.
     * If vector, generate a matrix with diagonal elements.
     * @returns {_Matrix_} _Matrix_ or vector created. See how to use the function.
     */
    diag(): _Matrix_;
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
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isReal(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is complex matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isComplex(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is zero matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isZeros(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is identity matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isIdentity(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is diagonal matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isDiagonal(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is tridiagonal matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTridiagonal(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is regular matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isRegular(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is orthogonal matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isOrthogonal(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is unitary matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isUnitary(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is symmetric matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isSymmetric(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is hermitian matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isHermitian(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is upper triangular matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleUpper(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is  lower triangular matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleLower(tolerance?: KMatrixInputData): boolean;
    /**
     * Return true if the matrix is permutation matrix.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isPermutation(tolerance?: KMatrixInputData): boolean;
    /**
     * Number of rows and columns of matrix.
     * @param {?string|?number} [dimension] direction. 1/"row", 2/"column"
     * @returns {_Matrix_} [row_length, column_length]
     */
    size(dimension?: string | number): _Matrix_;
    /**
     * Compare values.
     * - Return value between scalars is of type Number.
     * - Return value between matrices is type _Matrix_.
     * @param {KMatrixInputData} number
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {number|_Matrix_} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: KMatrixInputData, tolerance?: KMatrixInputData): number | _Matrix_;
    /**
     * Add.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A + B
     */
    add(number: KMatrixInputData): _Matrix_;
    /**
     * Subtract.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A - B
     */
    sub(number: KMatrixInputData): _Matrix_;
    /**
     * Multiply.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A * B
     */
    mul(number: KMatrixInputData): _Matrix_;
    /**
     * Divide.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A / B
     */
    div(number: KMatrixInputData): _Matrix_;
    /**
     * Power function.
     * - Supports only integers.
     * @param {KMatrixInputData} number - 整数
     * @returns {_Matrix_} pow(A, B)
     */
    pow(number: KMatrixInputData): _Matrix_;
    /**
     * Multiplication for each element of matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A .* B
     */
    dotmul(number: KMatrixInputData): _Matrix_;
    /**
     * Division for each element of matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A ./ B
     */
    dotdiv(number: KMatrixInputData): _Matrix_;
    /**
     * Inverse of each element of matrix.
     * @returns {_Matrix_} 1 ./ A
     */
    dotinv(): _Matrix_;
    /**
     * Power function for each element of the matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A .^ B
     */
    dotpow(number: KMatrixInputData): _Matrix_;
    /**
     * Multiplication for each element of matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A .* B
     * @deprecated use the dotmul.
     */
    nmul(number: KMatrixInputData): _Matrix_;
    /**
     * Division for each element of matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A ./ B
     * @deprecated use the dotdiv.
     */
    ndiv(number: KMatrixInputData): _Matrix_;
    /**
     * Inverse of each element of matrix.
     * @returns {_Matrix_} 1 ./ A
     * @deprecated use the dotinv.
     */
    ninv(): _Matrix_;
    /**
     * Power function for each element of the matrix.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_} A .^ B
     * @deprecated use the dotpow.
     */
    npow(number: KMatrixInputData): _Matrix_;
    /**
     * Real part of each element.
     * @returns {_Matrix_} real(A)
     */
    real(): _Matrix_;
    /**
     * Imaginary part of each element of the matrix.
     * @returns {_Matrix_} imag(A)
     */
    imag(): _Matrix_;
    /**
     * The argument of each element of matrix.
     * @returns {_Matrix_} arg(A)
     */
    arg(): _Matrix_;
    /**
     * The positive or negative signs of each element of the matrix.
     * - +1 if positive, -1 if negative, 0 if 0, norm if complex number.
     * @returns {_Matrix_}
     */
    sign(): _Matrix_;
    /**
     * Test if each element of the matrix is integer.
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testInteger(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * Test if each element of the matrix is complex integer.
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testComplexInteger(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * real(this) === 0
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testZero(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * real(this) === 1
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testOne(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * Test if each element of the matrix is complex.
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testComplex(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * Test if each element of the matrix is real.
     * - 1 if true, 0 if false.
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testReal(tolerance?: KMatrixInputData): _Matrix_;
    /**
     * Test if each element of the matrix is NaN.
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testNaN(): _Matrix_;
    /**
     * real(this) > 0
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testPositive(): _Matrix_;
    /**
     * real(this) < 0
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testNegative(): _Matrix_;
    /**
     * real(this) >= 0
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testNotNegative(): _Matrix_;
    /**
     * Test if each element of the matrix is positive infinite.
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testPositiveInfinity(): _Matrix_;
    /**
     * Test if each element of the matrix is negative infinite.
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testNegativeInfinity(): _Matrix_;
    /**
     * Test if each element of the matrix is infinite.
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testInfinite(): _Matrix_;
    /**
     * Test if each element of the matrix is finite.
     * - 1 if true, 0 if false.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testFinite(): _Matrix_;
    /**
     * Absolute value.
     * @returns {_Matrix_} abs(A)
     */
    abs(): _Matrix_;
    /**
     * _Complex_ conjugate matrix.
     * @returns {_Matrix_} real(A) - imag(A)j
     */
    conj(): _Matrix_;
    /**
     * this * -1
     * @returns {_Matrix_} -A
     */
    negate(): _Matrix_;
    /**
     * Square root.
     * @returns {_Matrix_} sqrt(A)
     */
    sqrt(): _Matrix_;
    /**
     * Logarithmic function.
     * @returns {_Matrix_} log(A)
     */
    log(): _Matrix_;
    /**
     * Exponential function.
     * @returns {_Matrix_} exp(A)
     */
    exp(): _Matrix_;
    /**
     * Sine function.
     * @returns {_Matrix_} sin(A)
     */
    sin(): _Matrix_;
    /**
     * Cosine function.
     * @returns {_Matrix_} cos(A)
     */
    cos(): _Matrix_;
    /**
     * Tangent function.
     * @returns {_Matrix_} tan(A)
     */
    tan(): _Matrix_;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI/2, PI/2].
     * @returns {_Matrix_} atan(A)
     */
    atan(): _Matrix_;
    /**
     * Atan (arc tangent) function.
     * - Return the values of [-PI, PI].
     * - Supports only real numbers.
     * @param {KMatrixInputData} number - X
     * @returns {_Matrix_} atan2(Y, X)
     */
    atan2(number: KMatrixInputData): _Matrix_;
    /**
     * Floor.
     * @returns {_Matrix_} floor(A)
     */
    floor(): _Matrix_;
    /**
     * Ceil.
     * @returns {_Matrix_} ceil(A)
     */
    ceil(): _Matrix_;
    /**
     * Rounding to the nearest integer.
     * @returns {_Matrix_} round(A)
     */
    round(): _Matrix_;
    /**
     * To integer rounded down to the nearest.
     * @returns {_Matrix_} fix(A), trunc(A)
     */
    fix(): _Matrix_;
    /**
     * _Fraction_.
     * @returns {_Matrix_} fract(A)
     */
    fract(): _Matrix_;
    /**
     * Normalized sinc function.
     * @returns {_Matrix_} sinc(A)
     */
    sinc(): _Matrix_;
    /**
     * Rotate matrix 90 degrees clockwise.
     * @param {KMatrixInputData} rot_90_count - Number of times rotated by 90 degrees.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    rot90(rot_90_count: KMatrixInputData): _Matrix_;
    /**
     * Change the size of the matrix.
     * Initialized with 0 when expanding.
     * @param {KMatrixInputData} row_length - Number of rows of matrix to resize.
     * @param {KMatrixInputData} column_length - Number of columns of matrix to resize.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    resize(row_length: KMatrixInputData, column_length: KMatrixInputData): _Matrix_;
    /**
     * Remove the row in this matrix.
     * @param {KMatrixInputData} delete_row_index - Number of row of matrix to delete.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    deleteRow(delete_row_index: KMatrixInputData): _Matrix_;
    /**
     * Remove the column in this matrix.
     * @param {KMatrixInputData} delete_column_index - Number of column of matrix to delete.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    deleteColumn(delete_column_index: KMatrixInputData): _Matrix_;
    /**
     * Swap rows in the matrix.
     * @param {KMatrixInputData} exchange_row_index1 - Number 1 of row of matrix to exchange.
     * @param {KMatrixInputData} exchange_row_index2 - Number 2 of row of matrix to exchange.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    exchangeRow(exchange_row_index1: KMatrixInputData, exchange_row_index2: KMatrixInputData): _Matrix_;
    /**
     * Swap columns in the matrix.
     * @param {KMatrixInputData} exchange_column_index1 - Number 1 of column of matrix to exchange.
     * @param {KMatrixInputData} exchange_column_index2 - Number 2 of column of matrix to exchange.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    exchangeColumn(exchange_column_index1: KMatrixInputData, exchange_column_index2: KMatrixInputData): _Matrix_;
    /**
     * Combine matrix to the right of this matrix.
     * @param {KMatrixInputData} left_matrix - _Matrix_ to combine.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    concatRight(left_matrix: KMatrixInputData): _Matrix_;
    /**
     * Combine matrix to the bottom of this matrix.
     * @param {KMatrixInputData} bottom_matrix - _Matrix_ to combine.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    concatBottom(bottom_matrix: KMatrixInputData): _Matrix_;
    /**
     * Clip each element of matrix to specified range.
     * @param {KMatrixInputData} min
     * @param {KMatrixInputData} max
     * @returns {_Matrix_} min(max(x, min), max)
     */
    clip(min: KMatrixInputData, max: KMatrixInputData): _Matrix_;
    /**
     * Create row vector with specified initial value, step value, end condition.
     * @param {KMatrixInputData} start_or_stop
     * @param {KMatrixInputData} [stop]
     * @param {KMatrixInputData} [step=1]
     * @returns {_Matrix_}
     */
    static arange(start_or_stop: KMatrixInputData, stop?: KMatrixInputData, step?: KMatrixInputData): _Matrix_;
    /**
     * Circular shift.
     * @param {KMatrixInputData} shift_size
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    circshift(shift_size: KMatrixInputData, type?: KMatrixSettings): _Matrix_;
    /**
     * Circular shift.
     * @param {KMatrixInputData} shift_size
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    roll(shift_size: KMatrixInputData, type?: KMatrixSettings): _Matrix_;
    /**
     * Change the shape of the matrix.
     * The number of elements in the matrix doesn't increase or decrease.
     * @param {KMatrixInputData} row_length - Number of rows of matrix to reshape.
     * @param {KMatrixInputData} column_length - Number of columns of matrix to reshape.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    reshape(row_length: KMatrixInputData, column_length: KMatrixInputData): _Matrix_;
    /**
     * Flip this matrix left and right.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    fliplr(): _Matrix_;
    /**
     * Flip this matrix up and down.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    flipud(): _Matrix_;
    /**
     * Flip this matrix.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    flip(type?: KMatrixSettings): _Matrix_;
    /**
     * Index sort.
     * - Sorts by row when setting index by row vector to the argument.
     * - Sorts by column when setting index by column vector to the argument.
     * @param {KMatrixInputData} v - Vector with index. (See the description of this function)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    indexsort(v: KMatrixInputData): _Matrix_;
    /**
     * Transpose a matrix.
     * @returns {_Matrix_} A^T
     */
    transpose(): _Matrix_;
    /**
     * Hermitian transpose.
     * @returns {_Matrix_} A^T
     */
    ctranspose(): _Matrix_;
    /**
     * Hermitian transpose.
     * @returns {_Matrix_} A^T
     */
    T(): _Matrix_;
    /**
     * Inner product/Dot product.
     * @param {KMatrixInputData} number
     * @param {KMatrixInputData} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {_Matrix_} A・B
     */
    inner(number: KMatrixInputData, dimension?: KMatrixInputData): _Matrix_;
    /**
     * LUP decomposition.
     * - P'*L*U=A
     * - P is permutation matrix.
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @returns {{P: _Matrix_, L: _Matrix_, U: _Matrix_}} {L, U, P}
     */
    lup(): {P: _Matrix_, L: _Matrix_, U: _Matrix_};
    /**
     * LU decomposition.
     * - L*U=A
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @returns {{L: _Matrix_, U: _Matrix_}} {L, U}
     */
    lu(): {L: _Matrix_, U: _Matrix_};
    /**
     * Solving a system of linear equations to be Ax = B
     * @param {KMatrixInputData} number - B
     * @returns {_Matrix_} x
     */
    linsolve(number: KMatrixInputData): _Matrix_;
    /**
     * QR decomposition.
     * - Q*R=A
     * - Q is orthonormal matrix.
     * - R is upper triangular matrix.
     * @returns {{Q: _Matrix_, R: _Matrix_}} {Q, R}
     */
    qr(): {Q: _Matrix_, R: _Matrix_};
    /**
     * Tridiagonalization of symmetric matrix.
     * - Don't support complex numbers.
     * - P*H*P'=A
     * - P is orthonormal matrix.
     * - H is tridiagonal matrix.
     * - The eigenvalues of H match the eigenvalues of A.
     * @returns {{P: _Matrix_, H: _Matrix_}} {P, H}
     */
    tridiagonalize(): {P: _Matrix_, H: _Matrix_};
    /**
     * Eigendecomposition of symmetric matrix.
     * - Don't support complex numbers.
     * - V*D*V'=A.
     * - V is orthonormal matrix. and columns of V are the right eigenvectors.
     * - D is a matrix containing the eigenvalues on the diagonal component.
     * @returns {{V: _Matrix_, D: _Matrix_}} {D, V}
     */
    eig(): {V: _Matrix_, D: _Matrix_};
    /**
     * Singular Value Decomposition (SVD).
     * - U*S*V'=A
     * - U and V are orthonormal matrices.
     * - S is a matrix with singular values in the diagonal.
     * @returns {{U: _Matrix_, S: _Matrix_, V: _Matrix_}} U*S*V'=A
     */
    svd(): {U: _Matrix_, S: _Matrix_, V: _Matrix_};
    /**
     * Inverse matrix of this matrix.
     * @returns {_Matrix_} A^-1
     */
    inv(): _Matrix_;
    /**
     * Pseudo-inverse matrix.
     * @returns {_Matrix_} A^+
     */
    pinv(): _Matrix_;
    /**
     * Log-gamma function.
     * @returns {_Matrix_}
     */
    gammaln(): _Matrix_;
    /**
     * Gamma function.
     * @returns {_Matrix_}
     */
    gamma(): _Matrix_;
    /**
     * Incomplete gamma function.
     * @param {KMatrixInputData} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    gammainc(a: KMatrixInputData, tail?: string): _Matrix_;
    /**
     * _Probability_ density function (PDF) of the gamma distribution.
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gampdf(k: KMatrixInputData, s: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gamcdf(k: KMatrixInputData, s: KMatrixInputData): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gaminv(k: KMatrixInputData, s: KMatrixInputData): _Matrix_;
    /**
     * Beta function.
     * @param {KMatrixInputData} y
     * @returns {_Matrix_}
     */
    beta(y: KMatrixInputData): _Matrix_;
    /**
     * Incomplete beta function.
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    betainc(a: KMatrixInputData, b: KMatrixInputData, tail?: string): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    betacdf(a: KMatrixInputData, b: KMatrixInputData): _Matrix_;
    /**
     * _Probability_ density function (PDF) of beta distribution.
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    betapdf(a: KMatrixInputData, b: KMatrixInputData): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    betainv(a: KMatrixInputData, b: KMatrixInputData): _Matrix_;
    /**
     * Factorial function, x!.
     * @returns {_Matrix_}
     */
    factorial(): _Matrix_;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {KMatrixInputData} k
     * @returns {_Matrix_}
     */
    nchoosek(k: KMatrixInputData): _Matrix_;
    /**
     * Error function.
     * @returns {_Matrix_}
     */
    erf(): _Matrix_;
    /**
     * Complementary error function.
     * @returns {_Matrix_}
     */
    erfc(): _Matrix_;
    /**
     * Inverse function of Error function.
     * @returns {_Matrix_}
     */
    erfinv(): _Matrix_;
    /**
     * Inverse function of Complementary error function.
     * @returns {_Matrix_}
     */
    erfcinv(): _Matrix_;
    /**
     * _Probability_ density function (PDF) of normal distribution.
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    normpdf(u?: KMatrixInputData, s?: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    normcdf(u?: KMatrixInputData, s?: KMatrixInputData): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    norminv(u?: KMatrixInputData, s?: KMatrixInputData): _Matrix_;
    /**
     * _Probability_ density function (PDF) of Student's t-distribution.
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tpdf(v: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tcdf(v: KMatrixInputData): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tinv(v: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * - If tails = 1, TDIST returns the one-tailed distribution.
     * - If tails = 2, TDIST returns the two-tailed distribution.
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @param {KMatrixInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {_Matrix_}
     */
    tdist(v: KMatrixInputData, tails: KMatrixInputData): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tinv2(v: KMatrixInputData): _Matrix_;
    /**
     * _Probability_ density function (PDF) of chi-square distribution.
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2pdf(k: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2cdf(k: KMatrixInputData): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2inv(k: KMatrixInputData): _Matrix_;
    /**
     * _Probability_ density function (PDF) of F-distribution.
     * - In the argument, specify the degree of freedom of ratio of two variables according to chi-square distribution.
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    fpdf(d1: KMatrixInputData, d2: KMatrixInputData): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    fcdf(d1: KMatrixInputData, d2: KMatrixInputData): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    finv(d1: KMatrixInputData, d2: KMatrixInputData): _Matrix_;
    /**
     * Maximum number.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} max([A, B])
     */
    max(type?: KMatrixSettings): _Matrix_;
    /**
     * Minimum number.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} min([A, B])
     */
    min(type?: KMatrixSettings): _Matrix_;
    /**
     * Sum.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    sum(type?: KMatrixSettings): _Matrix_;
    /**
     * Arithmetic average.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mean(type?: KMatrixSettings): _Matrix_;
    /**
     * Product of array elements.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    prod(type?: KMatrixSettings): _Matrix_;
    /**
     * Geometric mean.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    geomean(type?: KMatrixSettings): _Matrix_;
    /**
     * Median.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    median(type?: KMatrixSettings): _Matrix_;
    /**
     * Mode.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mode(type?: KMatrixSettings): _Matrix_;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {number} nth_order
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    moment(nth_order: number, type?: KMatrixSettings): _Matrix_;
    /**
     * Variance.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    var(type?: KMatrixSettings): _Matrix_;
    /**
     * Standard deviation.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    std(type?: KMatrixSettings): _Matrix_;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {?string|?number} [algorithm]
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mad(algorithm?: string | number, type?: KMatrixSettings): _Matrix_;
    /**
     * Skewness.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    skewness(type?: KMatrixSettings): _Matrix_;
    /**
     * Covariance matrix or Covariance value.
     * - Get a variance-covariance matrix from 1 matrix.
     * - Get a covariance from 2 vectors.
     * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    cov(y_or_type?: KMatrixSettings | KMatrixInputData, type?: KMatrixSettings): _Matrix_;
    /**
     * The samples are standardize to a mean value of 0, standard deviation of 1.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    standardization(type?: KMatrixSettings): _Matrix_;
    /**
     * Correlation matrix or Correlation coefficient.
     * - Get a correlation matrix from 1 matrix.
     * - Get a correlation coefficient from 2 vectors.
     * @param {KMatrixSettings|KMatrixInputData} [y_or_type]
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    corrcoef(y_or_type?: KMatrixSettings | KMatrixInputData, type?: KMatrixSettings): _Matrix_;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {string} [order]
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    sort(order?: string, type?: KMatrixSettings): _Matrix_;
    /**
     * Discrete Fourier transform (DFT).
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} fft(x)
     */
    fft(type?: KMatrixSettings): _Matrix_;
    /**
     * Inverse discrete Fourier transform (IDFT).
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} ifft(x)
     */
    ifft(type?: KMatrixSettings): _Matrix_;
    /**
     * Power spectral density.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} abs(fft(x)).^2
     */
    powerfft(type?: KMatrixSettings): _Matrix_;
    /**
     * Discrete cosine transform (_DCT_-II, _DCT_).
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} dct(x)
     */
    dct(type?: KMatrixSettings): _Matrix_;
    /**
     * Inverse discrete cosine transform (_DCT_-III, IDCT).
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_} idct(x)
     */
    idct(type?: KMatrixSettings): _Matrix_;
    /**
     * Discrete two-dimensional Fourier transform (2D DFT).
     * @returns {_Matrix_}
     */
    fft2(): _Matrix_;
    /**
     * Inverse discrete two-dimensional Fourier transform (2D IDFT).
     * @returns {_Matrix_}
     */
    ifft2(): _Matrix_;
    /**
     * Discrete two-dimensional cosine transform (2D _DCT_).
     * @returns {_Matrix_}
     */
    dct2(): _Matrix_;
    /**
     * Inverse discrete two-dimensional cosine transform (2D IDCT).
     * @returns {_Matrix_}
     */
    idct2(): _Matrix_;
    /**
     * Convolution integral, Polynomial multiplication.
     * @param {KMatrixInputData} number
     * @returns {_Matrix_}
     */
    conv(number: KMatrixInputData): _Matrix_;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {KMatrixInputData} [number] - _Matrix_ to calculate the correlation.
     * @returns {_Matrix_}
     */
    xcorr(number?: KMatrixInputData): _Matrix_;
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
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static window(name: string, size: KMatrixInputData, periodic?: string | number): _Matrix_;
    /**
     * Hann (Hanning) window.
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hann(size: KMatrixInputData, periodic?: string | number): _Matrix_;
    /**
     * Hamming window.
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hamming(size: KMatrixInputData, periodic?: string | number): _Matrix_;
    /**
     * _FFT_ shift.
     * Circular shift beginning at the center of the signal.
     * @param {KMatrixSettings} [type]
     * @returns {_Matrix_}
     */
    fftshift(type?: KMatrixSettings): _Matrix_;
    /**
     * 1
     * @returns {_Matrix_} 1
     */
    static ONE: _Matrix_;
    /**
     * 2
     * @returns {_Matrix_} 2
     */
    static TWO: _Matrix_;
    /**
     * 10
     * @returns {_Matrix_} 10
     */
    static TEN: _Matrix_;
    /**
     * 0
     * @returns {_Matrix_} 0
     */
    static ZERO: _Matrix_;
    /**
     * -1
     * @returns {_Matrix_} -1
     */
    static MINUS_ONE: _Matrix_;
    /**
     * i, j
     * @returns {_Matrix_} i
     */
    static I: _Matrix_;
    /**
     * PI.
     * @returns {_Matrix_} 3.14...
     */
    static PI: _Matrix_;
    /**
     * 0.25 * PI.
     * @returns {_Matrix_} 0.78...
     */
    static QUARTER_PI: _Matrix_;
    /**
     * 0.5 * PI.
     * @returns {_Matrix_} 1.57...
     */
    static HALF_PI: _Matrix_;
    /**
     * 2 * PI.
     * @returns {_Matrix_} 6.28...
     */
    static TWO_PI: _Matrix_;
    /**
     * E, Napier's constant.
     * @returns {_Matrix_} 2.71...
     */
    static E: _Matrix_;
    /**
     * log_e(2)
     * @returns {_Matrix_} ln(2)
     */
    static LN2: _Matrix_;
    /**
     * log_e(10)
     * @returns {_Matrix_} ln(10)
     */
    static LN10: _Matrix_;
    /**
     * log_2(e)
     * @returns {_Matrix_} log_2(e)
     */
    static LOG2E: _Matrix_;
    /**
     * log_10(e)
     * @returns {_Matrix_} log_10(e)
     */
    static LOG10E: _Matrix_;
    /**
     * sqrt(2)
     * @returns {_Matrix_} sqrt(2)
     */
    static SQRT2: _Matrix_;
    /**
     * sqrt(0.5)
     * @returns {_Matrix_} sqrt(0.5)
     */
    static SQRT1_2: _Matrix_;
    /**
     * 0.5
     * @returns {_Matrix_} 0.5
     */
    static HALF: _Matrix_;
    /**
     * Positive infinity.
     * @returns {_Matrix_} Infinity
     */
    static POSITIVE_INFINITY: _Matrix_;
    /**
     * Negative Infinity.
     * @returns {_Matrix_} -Infinity
     */
    static NEGATIVE_INFINITY: _Matrix_;
    /**
     * Not a Number.
     * @returns {_Matrix_} NaN
     */
    static NaN: _Matrix_;
}

/**
 * Class for linear algebra for `_Matrix_` class.
 * - These methods can be used in the `_Matrix_` method chain.
 * - This class cannot be called directly.
 */
declare class _LinearAlgebra_ {
    /**
     * Inner product/Dot product.
     * @param {KMatrixInputData} A
     * @param {KMatrixInputData} B
     * @param {KMatrixInputData} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {_Matrix_} A・B
     */
    static inner(A: any, B: any, dimension: any): _Matrix_;
    /**
     * p-norm.
     * @param {KMatrixInputData} mat
     * @param {KMatrixInputData} [p=2]
     * @returns {number}
     */
    static norm(mat: any, p: any): number;
    /**
     * Condition number of the matrix
     * @param {KMatrixInputData} mat
     * @param {KMatrixInputData} [p=2]
     * @returns {number}
     */
    static cond(mat: any, p: any): number;
    /**
     * Inverse condition number.
     * @param {KMatrixInputData} mat
     * @returns {number}
     */
    static rcond(mat: any): number;
    /**
     * Rank.
     * @param {KMatrixInputData} mat
     * @param {KMatrixInputData} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    static rank(mat: any, tolerance: any): number;
    /**
     * Trace of a matrix.
     * Sum of diagonal elements.
     * @param {KMatrixInputData} mat
     * @returns {_Complex_}
     */
    static trace(mat: any): _Complex_;
    /**
     * Determinant.
     * @param {KMatrixInputData} mat
     * @returns {_Matrix_} |A|
     */
    static det(mat: any): _Matrix_;
    /**
     * LUP decomposition.
     * - P'*L*U=A
     * - P is permutation matrix.
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {KMatrixInputData} mat - A
     * @returns {{P: _Matrix_, L: _Matrix_, U: _Matrix_}} {L, U, P}
     */
    static lup(mat: any): {P: _Matrix_, L: _Matrix_, U: _Matrix_};
    /**
     * LU decomposition.
     * - L*U=A
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {KMatrixInputData} mat - A
     * @returns {{L: _Matrix_, U: _Matrix_}} {L, U}
     */
    static lu(mat: any): {L: _Matrix_, U: _Matrix_};
    /**
     * Solving a system of linear equations to be Ax = B
     * @param {KMatrixInputData} mat - A
     * @param {KMatrixInputData} number - B
     * @returns {_Matrix_} x
     * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
     */
    static linsolve(mat: any, number: any): _Matrix_;
    /**
     * QR decomposition.
     * - Q*R=A
     * - Q is orthonormal matrix.
     * - R is upper triangular matrix.
     * @param {KMatrixInputData} mat - A
     * @returns {{Q: _Matrix_, R: _Matrix_}} {Q, R}
     */
    static qr(mat: any): {Q: _Matrix_, R: _Matrix_};
    /**
     * Tridiagonalization of symmetric matrix.
     * - Don't support complex numbers.
     * - P*H*P'=A
     * - P is orthonormal matrix.
     * - H is tridiagonal matrix.
     * - The eigenvalues of H match the eigenvalues of A.
     * @param {KMatrixInputData} mat - A
     * @returns {{P: _Matrix_, H: _Matrix_}} {P, H}
     */
    static tridiagonalize(mat: any): {P: _Matrix_, H: _Matrix_};
    /**
     * Eigendecomposition of symmetric matrix.
     * - Don't support complex numbers.
     * - V*D*V'=A.
     * - V is orthonormal matrix. and columns of V are the right eigenvectors.
     * - D is a matrix containing the eigenvalues on the diagonal component.
     * @param {KMatrixInputData} mat - A
     * @returns {{V: _Matrix_, D: _Matrix_}} {D, V}
     * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
     */
    static eig(mat: any): {V: _Matrix_, D: _Matrix_};
    /**
     * Singular Value Decomposition (SVD).
     * - U*S*V'=A
     * - U and V are orthonormal matrices.
     * - S is a matrix with singular values in the diagonal.
     * @param {KMatrixInputData} mat - A
     * @returns {{U: _Matrix_, S: _Matrix_, V: _Matrix_}} U*S*V'=A
     */
    static svd(mat: any): {U: _Matrix_, S: _Matrix_, V: _Matrix_};
    /**
     * Inverse matrix of this matrix.
     * @param {KMatrixInputData} mat - A
     * @returns {_Matrix_} A^-1
     */
    static inv(mat: any): _Matrix_;
    /**
     * Pseudo-inverse matrix.
     * @param {KMatrixInputData} mat - A
     * @returns {_Matrix_} A^+
     */
    static pinv(mat: any): _Matrix_;
}

/**
 * Calculating probability class for `_Matrix_` class.
 * - These methods can be used in the `_Matrix_` method chain.
 * - This class cannot be called directly.
 */
declare class _Probability_ {
    /**
     * Log-gamma function.
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static gammaln(x: any): _Matrix_;
    /**
     * Gamma function.
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static gamma(x: any): _Matrix_;
    /**
     * Incomplete gamma function.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    static gammainc(x: any, a: any, tail?: string): _Matrix_;
    /**
     * _Probability_ density function (PDF) of the gamma distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gampdf(x: any, k: any, s: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gamcdf(x: any, k: any, s: any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - Shape parameter.
     * @param {KMatrixInputData} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gaminv(x: any, k: any, s: any): _Matrix_;
    /**
     * Beta function.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} y
     * @returns {_Matrix_}
     */
    static beta(x: any, y: any): _Matrix_;
    /**
     * Incomplete beta function.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    static betainc(x: any, a: any, b: any, tail?: string): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    static betacdf(x: any, a: any, b: any): _Matrix_;
    /**
     * _Probability_ density function (PDF) of beta distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    static betapdf(x: any, a: any, b: any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} a
     * @param {KMatrixInputData} b
     * @returns {_Matrix_}
     */
    static betainv(x: any, a: any, b: any): _Matrix_;
    /**
     * Factorial function, x!.
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static factorial(x: any): _Matrix_;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k
     * @returns {_Matrix_}
     */
    static nchoosek(x: any, k: any): _Matrix_;
    /**
     * Error function.
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static erf(x: any): _Matrix_;
    /**
     * Complementary error function.
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static erfc(x: any): _Matrix_;
    /**
     * Inverse function of Error function.
     * @param {KMatrixInputData} p
     * @returns {_Matrix_}
     */
    static erfinv(p: any): _Matrix_;
    /**
     * Inverse function of Complementary error function.
     * @param {KMatrixInputData} p
     * @returns {_Matrix_}
     */
    static erfcinv(p: any): _Matrix_;
    /**
     * _Probability_ density function (PDF) of normal distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static normpdf(x: any, u: any, s: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static normcdf(x: any, u: any, s: any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} [u=0.0] - Average value.
     * @param {KMatrixInputData} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static norminv(x: any, u: any, s: any): _Matrix_;
    /**
     * _Probability_ density function (PDF) of Student's t-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tpdf(x: any, v: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tcdf(x: any, v: any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tinv(x: any, v: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @param {KMatrixInputData} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {_Matrix_}
     */
    static tdist(x: any, v: any, tails: any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tinv2(x: any, v: any): _Matrix_;
    /**
     * _Probability_ density function (PDF) of chi-square distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2pdf(x: any, k: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2cdf(x: any, k: any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2inv(x: any, k: any): _Matrix_;
    /**
     * _Probability_ density function (PDF) of F-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static fpdf(x: any, d1: any, d2: any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static fcdf(x: any, d1: any, d2: any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {KMatrixInputData} x
     * @param {KMatrixInputData} d1 - The degree of freedom of the molecules.
     * @param {KMatrixInputData} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static finv(x: any, d1: any, d2: any): _Matrix_;
}

/**
 * Setting random numbers
 * @typedef {Object} KRandomSettings
 * @property {number} [seed] Seed number for random number generation. If not specified, create from time.
 * @property {string} [algorithm="FAST"] Algorithm type : "XORSHIFT" / "MLS" / "FAST"
 */
declare type KRandomSettings = {
    seed?: number;
    algorithm?: string;
};

/**
 * Create _Random_.
 * - algorithm : "XORSHIFT" / "MLS" / "FAST"
 * @param {number|KRandomSettings} [init_data] - Seed number for random number generation. If not specified, create from time.
 */
declare class _Random_ {
    constructor(init_data?: number | KRandomSettings);
    /**
     * Initialize random seed.
     * @param {number} seed
     */
    setSeed(seed: number): void;
    /**
     * 32-bit random number.
     * @returns {number} - 32-bit random number
     */
    genrand_int32(): number;
    /**
     * _Random_ number of specified bit length.
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
     * _Random_ boolean.
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
     * _Random_ numbers from a Gaussian distribution.
     * This random number is a distribution with an average value of 0 and a standard deviation of 1.
     * @returns {number}
     */
    nextGaussian(): number;
}

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KSignalSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 */
declare type KSignalSettings = {
    dimension?: string | number;
};

/**
 * _Signal_ processing class for `_Matrix_` class.
 * - These methods can be used in the `_Matrix_` method chain.
 * - This class cannot be called directly.
 */
declare class _Signal_ {
    /**
     * Discrete Fourier transform (DFT).
     * @param {KMatrixInputData} x
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_} fft(x)
     */
    static fft(x: any, type?: KSignalSettings): _Matrix_;
    /**
     * Inverse discrete Fourier transform (IDFT),
     * @param {KMatrixInputData} X
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_} ifft(X)
     */
    static ifft(X: any, type?: KSignalSettings): _Matrix_;
    /**
     * Power spectral density.
     * @param {KMatrixInputData} x
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_} abs(fft(x)).^2
     */
    static powerfft(x: any, type?: KSignalSettings): _Matrix_;
    /**
     * Discrete cosine transform (_DCT_-II, _DCT_).
     * @param {KMatrixInputData} x
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_} dct(x)
     */
    static dct(x: any, type?: KSignalSettings): _Matrix_;
    /**
     * Inverse discrete cosine transform (_DCT_-III, IDCT),
     * @param {KMatrixInputData} X
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_} idct(x)
     */
    static idct(X: any, type?: KSignalSettings): _Matrix_;
    /**
     * Discrete two-dimensional Fourier transform (2D DFT).
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static fft2(x: any): _Matrix_;
    /**
     * Inverse discrete two-dimensional Fourier transform (2D IDFT),
     * @param {KMatrixInputData} X
     * @returns {_Matrix_}
     */
    static ifft2(X: any): _Matrix_;
    /**
     * Discrete two-dimensional cosine transform (2D _DCT_).
     * @param {KMatrixInputData} x
     * @returns {_Matrix_}
     */
    static dct2(x: any): _Matrix_;
    /**
     * Inverse discrete two-dimensional cosine transform (2D IDCT),
     * @param {KMatrixInputData} X
     * @returns {_Matrix_}
     */
    static idct2(X: any): _Matrix_;
    /**
     * Convolution integral, Polynomial multiplication.
     * @param {KMatrixInputData} x1
     * @param {KMatrixInputData} x2
     * @returns {_Matrix_}
     */
    static conv(x1: any, x2: any): _Matrix_;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {KMatrixInputData} x1
     * @param {KMatrixInputData} [x2] - _Matrix_ to calculate the correlation.
     * @returns {_Matrix_}
     */
    static xcorr(x1: any, x2: any): _Matrix_;
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
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static window(name: string, size: any, periodic?: string | number): _Matrix_;
    /**
     * Hann (Hanning) window.
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hann(size: any, periodic?: string | number): _Matrix_;
    /**
     * Hamming window.
     * @param {KMatrixInputData} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hamming(size: any, periodic?: string | number): _Matrix_;
    /**
     * _FFT_ shift.
     * Circular shift beginning at the center of the signal.
     * @param {KMatrixInputData} x
     * @param {KSignalSettings} [type]
     * @returns {_Matrix_}
     */
    static fftshift(x: any, type?: KSignalSettings): _Matrix_;
}

/**
 * Collection of calculation settings for matrix.
 * - Available options vary depending on the method.
 * @typedef {Object} KStatisticsSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 * @property {Object} [correction] Correction value. For statistics. 0(unbiased), 1(sample).
 */
declare type KStatisticsSettings = {
    dimension?: string | number;
    correction?: any;
};

/**
 * Class for statistical processing for `_Matrix_` class.
 * - These methods can be used in the `_Matrix_` method chain.
 * - This class cannot be called directly.
 */
declare class _Statistics_ {
    /**
     * Maximum number.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_} max([A, B])
     */
    static max(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Minimum number.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_} min([A, B])
     */
    static min(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Sum.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static sum(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Arithmetic average.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mean(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Product of array elements.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static prod(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Geometric mean.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static geomean(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Median.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static median(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Mode.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mode(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {KMatrixInputData} x
     * @param {number} nth_order
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static moment(x: any, nth_order: number, type?: KStatisticsSettings): _Matrix_;
    /**
     * Variance.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static var(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Standard deviation.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static std(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {KMatrixInputData} x
     * @param {?string|?number} [algorithm]
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mad(x: any, algorithm?: string | number, type?: KStatisticsSettings): _Matrix_;
    /**
     * Skewness.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static skewness(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Covariance matrix or Covariance value.
     * - Get a variance-covariance matrix from 1 matrix.
     * - Get a covariance from 2 vectors.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings|KMatrixInputData} [y_or_type]
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static cov(x: any, y_or_type: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * The samples are standardize to a mean value of 0, standard deviation of 1.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static standardization(x: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Correlation matrix or Correlation coefficient.
     * - Get a correlation matrix from 1 matrix.
     * - Get a correlation coefficient from 2 vectors.
     * @param {KMatrixInputData} x
     * @param {KStatisticsSettings|KMatrixInputData} [y_or_type]
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static corrcoef(x: any, y_or_type: any, type?: KStatisticsSettings): _Matrix_;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {KMatrixInputData} x
     * @param {string} [order]
     * @param {KStatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static sort(x: any, order?: string, type?: KStatisticsSettings): _Matrix_;
}

/**
 * Settings for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisSettings
 * @property {KMatrixInputData} samples explanatory variable. (Each column is a parameters and each row is a samples.)
 * @property {KMatrixInputData} target response variable. / actual values. (column vector)
 * @property {boolean} [is_standardised=false] Use standardized partial regression coefficients.
 */
declare type KMultipleRegressionAnalysisSettings = {
    is_standardised?: boolean;
};

/**
 * Vector state
 * @typedef {Object} KMultipleRegressionAnalysisVectorState
 * @property {number} df degree of freedom
 * @property {number} SS sum of squares
 * @property {number} MS unbiased_variance
 */
declare type KMultipleRegressionAnalysisVectorState = {
    df: number;
    SS: number;
    MS: number;
};

/**
 * Analysis of variance. ANOVA.
 * @typedef {Object} KMultipleRegressionAnalysisAnova
 * @property {KMultipleRegressionAnalysisVectorState} regression regression.
 * @property {KMultipleRegressionAnalysisVectorState} residual residual error.
 * @property {KMultipleRegressionAnalysisVectorState} total total.
 * @property {number} F F value. Dispersion ratio (F0)
 * @property {number} significance_F Significance F. Test with F distribution with q, n-q-1 degrees of freedom.(_Probability_ of error.)
 */
declare type KMultipleRegressionAnalysisAnova = {
    regression: KMultipleRegressionAnalysisVectorState;
    residual: KMultipleRegressionAnalysisVectorState;
    total: KMultipleRegressionAnalysisVectorState;
    F: number;
    significance_F: number;
};

/**
 * Regression table data.
 * @typedef {Object} KMultipleRegressionAnalysisPartialRegressionData
 * @property {number} coefficient Coefficient.
 * @property {number} standard_error Standard error.
 * @property {number} t_stat t-statistic.
 * @property {number} p_value P-value. Risk factor.
 * @property {number} lower_95 Lower limit of a 95% confidence interval.
 * @property {number} upper_95 Upper limit of a 95% confidence interval.
 */
declare type KMultipleRegressionAnalysisPartialRegressionData = {
    coefficient: number;
    standard_error: number;
    t_stat: number;
    p_value: number;
    lower_95: number;
    upper_95: number;
};

/**
 * Regression table.
 * @typedef {Object} KMultipleRegressionAnalysisPartialRegression
 * @property {KMultipleRegressionAnalysisPartialRegressionData} intercept Intercept.
 * @property {KMultipleRegressionAnalysisPartialRegressionData[]} parameters Parameters.
 */
declare type KMultipleRegressionAnalysisPartialRegression = {
    intercept: KMultipleRegressionAnalysisPartialRegressionData;
    parameters: KMultipleRegressionAnalysisPartialRegressionData[];
};

/**
 * Output for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisOutput
 * @property {number} q number of explanatory variables.
 * @property {number} n number of samples.
 * @property {number[][]} predicted_values predicted values. (column vector)
 * @property {number} sY Variance of predicted values of target variable.
 * @property {number} sy Variance of measured values of target variable.
 * @property {number} multiple_R Multiple R. Multiple correlation coefficient.
 * @property {number} R_square R Square. Coefficient of determination.
 * @property {number} adjusted_R_square Adjusted R Square. Adjusted coefficient of determination.
 * @property {KMultipleRegressionAnalysisAnova} ANOVA analysis of variance.
 * @property {number} Ve Unbiased variance of residuals. (Ve)
 * @property {number} standard_error Standard error. (SE)
 * @property {number} AIC Akaike's Information Criterion. (AIC)
 * @property {KMultipleRegressionAnalysisPartialRegression} regression_table Regression table.
 */
declare type KMultipleRegressionAnalysisOutput = {
    q: number;
    n: number;
    predicted_values: number[][];
    sY: number;
    sy: number;
    multiple_R: number;
    R_square: number;
    adjusted_R_square: number;
    ANOVA: KMultipleRegressionAnalysisAnova;
    Ve: number;
    standard_error: number;
    AIC: number;
    regression_table: KMultipleRegressionAnalysisPartialRegression;
};

/**
 * Multiple regression analysis.
 */
declare class MultipleRegressionAnalysis {
    /**
     * Multiple regression analysis
     * @param {KMultipleRegressionAnalysisSettings} settings - input data
     * @returns {KMultipleRegressionAnalysisOutput} analyzed data
     */
    static runMultipleRegressionAnalysis(settings: KMultipleRegressionAnalysisSettings): KMultipleRegressionAnalysisOutput;
}

/**
 * Tools for analyzing data.
 */
declare class _DataAnalysis_ {
    /**
     * Multiple regression analysis
     * @param {KMultipleRegressionAnalysisSettings} settings - input data
     * @returns {KMultipleRegressionAnalysisOutput} analyzed data
     */
    static runMultipleRegressionAnalysis(settings: any): KMultipleRegressionAnalysisOutput;
}


/**
 * _Fraction_ type argument.
 * - _Fraction_
 * - _BigInteger_
 * - _BigDecimal_
 * - number
 * - string
 * - Array<KBigIntegerInputData>
 * - {numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}
 * - {doubleValue:number}
 * - {toString:function}
 * @typedef {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<KBigIntegerInputData>|{numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}|{doubleValue:number}|{toString:function}} KFractionInputData
 */
declare type KFractionInputData = _Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<KBigIntegerInputData>|{numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}|{doubleValue:number}|{toString:any};
