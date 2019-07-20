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
}

/**
 * Setting of calculation result of division.
 * @typedef {Object} BigDecimalDivideType
 * @property {number} [scale] Scale of rounding.
 * @property {_RoundingModeEntity_} [roundingMode] Rounding mode.
 * @property {_MathContext_} [context] Configuration.(scale and roundingMode are unnecessary.)
 */
declare type BigDecimalDivideType = {
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
 * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,context:?_MathContext_}|_BigInteger_|Object} number - Real data.
 */
declare class _BigDecimal_ {
    constructor(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any);
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
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number - Real data.
     * @returns {_BigDecimal_}
     */
    static create(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Create a number using settings of this number.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number - Real data.
     * @param {_MathContext_} [mc] - Setting preferences when creating objects.
     * @returns {_BigDecimal_}
     */
    createUsingThisSettings(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, mc?: _MathContext_): _BigDecimal_;
    /**
     * Convert number to _BigDecimal_ type.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} x
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} [scale]
     * @returns {_BigDecimal_}
     */
    static valueOf(x: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, scale?: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
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
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} n
     * @returns {_BigDecimal_}
     */
    movePointLeft(n: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Move the decimal point to the right.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} n
     * @returns {_BigDecimal_}
     */
    movePointRight(n: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Remove the 0 to the right of the numbers and normalize the scale.
     * @returns {_BigDecimal_}
     */
    stripTrailingZeros(): _BigDecimal_;
    /**
     * Add.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A + B
     */
    add(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Subtract.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A - B
     */
    subtract(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Subtract.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A - B
     */
    sub(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Multiply.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A * B
     */
    multiply(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Multiply.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A * B
     */
    mul(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide not calculated to the decimal point.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} (int)(A / B)
     */
    divideToIntegralValue(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide and remainder.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {Array<_BigDecimal_>} [C = (int)(A / B), A - C * B]
     */
    divideAndRemainder(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_[];
    /**
     * Remainder of division.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A % B
     */
    rem(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Modulo, positive remainder of division.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} A mod B
     */
    mod(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
    /**
     * Divide.
     * - The argument can specify the scale after calculation.
     * - In the case of precision infinity, it may generate an error by a repeating decimal.
     * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
     * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_|BigDecimalDivideType} [type] - Scale, _MathContext_, _RoundingMode_ used for the calculation.
     * @returns {_BigDecimal_}
     */
    divide(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, type?: _MathContext_ | BigDecimalDivideType): _BigDecimal_;
    /**
     * Divide.
     * - The argument can specify the scale after calculation.
     * - In the case of precision infinity, it may generate an error by a repeating decimal.
     * - When "{}" is specified for the argument, it is calculated on the scale of "this.scale() - divisor.scale()".
     * - When null is specified for the argument, it is calculated on the scale of "divisor.default_context".
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_|BigDecimalDivideType} [type] - Scale, _MathContext_, _RoundingMode_ used for the calculation.
     * @returns {_BigDecimal_} A / B
     */
    div(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, type?: _MathContext_ | BigDecimalDivideType): _BigDecimal_;
    /**
     * Inverse number of this value.
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} 1 / A
     */
    inv(context?: _MathContext_): _BigDecimal_;
    /**
     * Power function.
     * - Supports only integers.
     * - An exception occurs when doing a huge multiplication.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of the B.
     * @returns {_BigDecimal_} pow(A, B)
     */
    pow(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, context?: _MathContext_): _BigDecimal_;
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
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} n
     * @returns {_BigDecimal_} A * 10^floor(n)
     */
    scaleByPowerOfTen(n: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
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
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, tolerance?: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): boolean;
    /**
     * Compare values.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} [tolerance=0] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, tolerance?: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): number;
    /**
     * Maximum number.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @returns {_BigDecimal_} max([A, B])
     */
    max(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Minimum number.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} number
     * @returns {_BigDecimal_} min([A, B])
     */
    min(number: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Clip number within range.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} min
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} max
     * @returns {_BigDecimal_} min(max(x, min), max)
     */
    clip(min: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, max: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): _BigDecimal_;
    /**
     * Convert to string.
     * @returns {string}
     */
    toString(): string;
    /**
     * Convert to string using scientific notation.
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} e_len - Number of digits in exponent part.
     * @returns {string}
     */
    toScientificNotation(e_len: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any): string;
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
     * @param {_BigDecimal_|number|string|Array<_BigInteger_|number|_MathContext_>|{integer:_BigInteger_,scale:?number,default_context:?_MathContext_,context:?_MathContext_}|_BigInteger_|Object} new_scale - New scale.
     * @param {_RoundingModeEntity_} [rounding_mode=_RoundingMode_.UNNECESSARY] - Rounding method when converting precision.
     * @returns {_BigDecimal_}
     */
    setScale(new_scale: _BigDecimal_ | number | string | (_BigInteger_ | number | _MathContext_)[] | any | _BigInteger_ | any, rounding_mode?: _RoundingModeEntity_): _BigDecimal_;
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
     * Square.
     * param {_MathContext_} [mc] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} A^2
     */
    square(): _BigDecimal_;
    /**
     * Square root.
     * param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} sqrt(A)
     */
    sqrt(): _BigDecimal_;
    /**
     * Reciprocal square root.
     * param {_MathContext_} [context] - _MathContext_ setting after calculation. If omitted, use the _MathContext_ of this object.
     * @returns {_BigDecimal_} rsqrt(A)
     */
    rsqrt(): _BigDecimal_;
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
     * @returns {_BigDecimal_} PI
     */
    static PI: _BigDecimal_;
    /**
     * E, Napier's constant.
     * @returns {_BigDecimal_} E
     */
    static E: _BigDecimal_;
}

/**
 * Create an arbitrary-precision integer.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3", ["1200", 10]
 * - "0xff", ["ff", 16]
 * - "0o01234567", ["01234567", 8]
 * - "0b0110101", ["0110101", 2]
 * @param {_BigInteger_|number|string|Array<string|number>|Object} [number] - Numeric data. See how to use the function.
 */
declare class _BigInteger_ {
    constructor(number?: _BigInteger_ | number | string | (string | number)[] | any);
    /**
     * Create an entity object of this class.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_}
     */
    static create(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Create an arbitrary-precision integer.
     * - Does not support strings using exponential notation.
     * - If you want to initialize with the specified base number, please set up with an array ["ff", 16].
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_}
     */
    static valueOf(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * _Random_ number of specified bit length.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bitsize - Bit length.
     * @param {_Random_} [random] - Class for creating random numbers.
     * @returns {_BigInteger_}
     */
    static createRandomBigInteger(bitsize: _BigInteger_ | number | string | (string | number)[] | any, random?: _Random_): _BigInteger_;
    /**
     * Convert to string.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [radix=10] - Base number.
     * @returns {string}
     */
    toString(radix?: _BigInteger_ | number | string | (string | number)[] | any): string;
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
    signum(): number;
    /**
     * The positive or negative sign of this number.
     * - +1 if positive, -1 if negative, 0 if 0.
     * @returns {number}
     */
    sign(): number;
    /**
     * Add.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A + B
     */
    add(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Subtract.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A - B
     */
    subtract(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Subtract.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A - B
     */
    sub(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Multiply.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A * B
     */
    multiply(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Multiply.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A * B
     */
    mul(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Divide and remainder.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {Array<_BigInteger_>} [C = fix(A / B), A - C * B]
     */
    divideAndRemainder(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_[];
    /**
     * Divide.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} fix(A / B)
     */
    divide(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Divide.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} fix(A / B)
     */
    div(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Remainder of division.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A % B
     */
    remainder(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Remainder of division.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A % B
     */
    rem(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Modulo, positive remainder of division.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A mod B
     */
    mod(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Modular exponentiation.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} exponent
     * @param {_BigInteger_|number|string|Array<string|number>|Object} m
     * @returns {_BigInteger_} A^B mod m
     */
    modPow(exponent: _BigInteger_ | number | string | (string | number)[] | any, m: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Modular multiplicative inverse.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} m
     * @returns {_BigInteger_} A^(-1) mod m
     */
    modInverse(m: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Factorial function, x!.
     * @returns {_BigInteger_} n!
     */
    factorial(): _BigInteger_;
    /**
     * Multiply a multiple of ten.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} n
     * @returns {_BigInteger_} x * 10^n
     */
    scaleByPowerOfTen(n: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Power function.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} exponent
     * @returns {_BigInteger_} pow(A, B)
     */
    pow(exponent: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
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
     * @param {_BigInteger_|number|string|Array<string|number>|Object} point - Array address.
     * @returns {number}
     */
    getShort(point: _BigInteger_ | number | string | (string | number)[] | any): number;
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
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} gcd(x, y)
     */
    gcd(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Extended Euclidean algorithm.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {Array<_BigInteger_>} [a, b, gcd(x, y)], Result of calculating a*x + b*y = gcd(x, y).
     */
    extgcd(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_[];
    /**
     * Least common multiple.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} lcm(x, y)
     */
    lcm(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Equals.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {boolean} A === B
     */
    equals(number: _BigInteger_ | number | string | (string | number)[] | any): boolean;
    /**
     * Compare values without sign.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
     */
    compareToAbs(number: _BigInteger_ | number | string | (string | number)[] | any): number;
    /**
     * Compare values.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: _BigInteger_ | number | string | (string | number)[] | any): number;
    /**
     * Maximum number.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} max([A, B])
     */
    max(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Minimum number.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} min([A, B])
     */
    min(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Clip number within range.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} min
     * @param {_BigInteger_|number|string|Array<string|number>|Object} max
     * @returns {_BigInteger_} min(max(x, min), max)
     */
    clip(min: _BigInteger_ | number | string | (string | number)[] | any, max: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Prime represented within the specified bit length.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bits - Bit length.
     * @param {_Random_} [random] - Class for creating random numbers.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [create_count=500] - Number of times to retry if prime generation fails.
     * @returns {_BigInteger_}
     */
    static probablePrime(bits: _BigInteger_ | number | string | (string | number)[] | any, random?: _Random_, certainty?: _BigInteger_ | number | string | (string | number)[] | any, create_count?: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Return true if the value is prime number by Miller-Labin prime number determination method.
     * Attention : it takes a very long time to process.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @returns {boolean}
     */
    isProbablePrime(certainty?: _BigInteger_ | number | string | (string | number)[] | any): boolean;
    /**
     * Next prime.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [certainty=100] - Repeat count (prime precision).
     * @param {_BigInteger_|number|string|Array<string|number>|Object} [search_max=100000] - Search range of next prime.
     * @returns {_BigInteger_}
     */
    nextProbablePrime(certainty?: _BigInteger_ | number | string | (string | number)[] | any, search_max?: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * this << n
     * @param {_BigInteger_|number|string|Array<string|number>|Object} n
     * @returns {_BigInteger_} A << n
     */
    shift(n: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * this << n
     * @param {_BigInteger_|number|string|Array<string|number>|Object} n
     * @returns {_BigInteger_} A << n
     */
    shiftLeft(n: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * this >> n
     * @param {_BigInteger_|number|string|Array<string|number>|Object} n
     * @returns {_BigInteger_} A >> n
     */
    shiftRight(n: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
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
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A & B
     */
    and(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical OR.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A | B
     */
    or(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical Exclusive-OR.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A ^ B
     */
    xor(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical Not. (mutable)
     * @returns {_BigInteger_} !A
     */
    not(): _BigInteger_;
    /**
     * Logical Not-AND.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A & (!B)
     */
    andNot(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical Not-AND.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} A & (!B)
     */
    nand(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical Not-OR.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} !(A | B)
     */
    orNot(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Logical Not-OR.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} number
     * @returns {_BigInteger_} !(A | B)
     */
    nor(number: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * this | (1 << n)
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bit
     * @returns {_BigInteger_}
     */
    setBit(bit: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Invert a specific bit.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bit
     * @returns {_BigInteger_}
     */
    flipBit(bit: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Lower a specific bit.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bit
     * @returns {_BigInteger_}
     */
    clearBit(bit: _BigInteger_ | number | string | (string | number)[] | any): _BigInteger_;
    /**
     * Test if a particular bit is on.
     * @param {_BigInteger_|number|string|Array<string|number>|Object} bit
     * @returns {boolean}
     */
    testBit(bit: _BigInteger_ | number | string | (string | number)[] | any): boolean;
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
}

/**
 * Create a complex number.
 *
 * Initialization can be performed as follows.
 * - 1200, "1200", "12e2", "1.2e3"
 * - "3 + 4i", "4j + 3", [3, 4].
 * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number - _Complex_ number. See how to use the function.
 */
declare class _Complex_ {
    constructor(number: _Complex_ | number | string | number[] | any | any);
    /**
     * Create an entity object of this class.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_}
     */
    static create(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Convert number to _Complex_ type.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_}
     */
    static valueOf(number: _Complex_ | number | string | number[] | any | any): _Complex_;
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
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} A + B
     */
    add(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Subtract.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} A - B
     */
    sub(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Multiply.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} A * B
     */
    mul(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Inner product/Dot product.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} A * conj(B)
     */
    dot(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Divide.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} A / B
     */
    div(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Modulo, positive remainder of division.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number - Divided value (real number only).
     * @returns {_Complex_} A mod B
     */
    mod(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Inverse number of this value.
     * @returns {_Complex_} 1 / A
     */
    inv(): _Complex_;
    /**
     * Equals.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: _Complex_ | number | string | number[] | any | any, tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * Compare values.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: _Complex_ | number | string | number[] | any | any, tolerance?: _Complex_ | number | string | number[] | any | any): number;
    /**
     * Maximum number.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} max([A, B])
     */
    max(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Minimum number.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} min([A, B])
     */
    min(number: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Clip number within range.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} min
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} max
     * @returns {_Complex_} min(max(x, min), max)
     */
    clip(min: _Complex_ | number | string | number[] | any | any, max: _Complex_ | number | string | number[] | any | any): _Complex_;
    /**
     * Return true if the value is integer.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isInteger(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * Returns true if the vallue is complex integer (including normal integer).
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} real(A) === integer && imag(A) === integer
     */
    isComplexInteger(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * this === 0
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 0
     */
    isZero(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * this === 1
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} A === 1
     */
    isOne(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * Returns true if the vallue is complex number (imaginary part is not 0).
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) !== 0
     */
    isComplex(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
    /**
     * Return true if the value is real number.
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [tolerance=Number.EPSILON] - Calculation tolerance of calculation.
     * @returns {boolean} imag(A) === 0
     */
    isReal(tolerance?: _Complex_ | number | string | number[] | any | any): boolean;
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
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {_Complex_} pow(A, B)
     */
    pow(number: _Complex_ | number | string | number[] | any | any): _Complex_;
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
     * @param {_Complex_|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - X
     * @returns {_Complex_} atan2(Y, X)
     */
    atan2(number?: _Complex_ | number | string | number[] | any | any): _Complex_;
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
     * Pi.
     * @returns {_Complex_} 3.14...
     */
    static PI: _Complex_;
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
 * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} [number] - _Fraction_ data. See how to use the function.
 */
declare class _Fraction_ {
    constructor(number?: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any);
    /**
     * @type {_BigInteger_}
     */
    numerator: _BigInteger_;
    /**
     * @type {_BigInteger_}
     */
    denominator: _BigInteger_;
    /**
     * Create an entity object of this class.
     * @returns {_Fraction_}
     */
    static create(): _Fraction_;
    /**
     * Convert number to _Fraction_ type.
     * @returns {_Fraction_}
     */
    static valueOf(): _Fraction_;
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
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {_Fraction_}
     */
    add(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Subtract.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {_Fraction_}
     */
    sub(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Multiply.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {_Fraction_}
     */
    mul(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Divide.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {_Fraction_}
     */
    div(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Inverse number of this value.
     * @return {_Fraction_}
     */
    inv(): _Fraction_;
    /**
     * Modulo, positive remainder of division.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @return {_Fraction_}
     */
    mod(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Power function.
     * - Supports only integers.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {_Fraction_} pow(A, B)
     */
    pow(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Factorial function, x!.
     * - Supports only integers.
     * @returns {_Fraction_} n!
     */
    factorial(): _Fraction_;
    /**
     * Multiply a multiple of ten.
     * - Supports only integers.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} n
     * @returns {_Fraction_}
     */
    scaleByPowerOfTen(n: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
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
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {boolean} A === B
     */
    equals(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): boolean;
    /**
     * Compare values.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} num
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(num: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): number;
    /**
     * Maximum number.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
     * @returns {_Fraction_} max([A, B])
     */
    max(number: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Minimum number.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} number
     * @returns {_Fraction_} min([A, B])
     */
    min(number: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
    /**
     * Clip number within range.
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} min
     * @param {_Fraction_|_BigInteger_|_BigDecimal_|number|string|Array<Object>|{numerator:Object,denominator:Object}|Object} max
     * @returns {_Fraction_} min(max(x, min), max)
     */
    clip(min: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any, max: _Fraction_ | _BigInteger_ | _BigDecimal_ | number | string | object[] | any | any): _Fraction_;
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
 * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - _Complex_ matrix. See how to use the function.
 */
declare class _Matrix_ {
    constructor(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any);
    /**
     * Create an entity object of this class.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_}
     */
    static create(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Convert number to _Matrix_ type.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_}
     */
    static valueOf(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean} A === B
     */
    equals(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length=dimension] - Number of columns.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    static createMatrixDoEachCalculation(eachfunc: (...params: any[]) => any, dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} row - A vector containing the row numbers to extract from this matrix. If you specify ":" select all rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} col - A vector containing the column numbers to extract from this matrix. If you specify ":" select all columns.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {_Matrix_}
     */
    getMatrix(row: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, col: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, isUpOffset?: boolean): _Matrix_;
    /**
     * Change specified element in matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} row - A vector containing the row numbers to replace in this matrix. If you specify ":" select all rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} col - A vector containing the column numbers to replace in this matrix. If you specify ":" select all columns.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} replace - _Matrix_ to be replaced.
     * @param {boolean} [isUpOffset=false] - Set offset of matrix position to 1 with true.
     * @returns {_Matrix_}
     */
    setMatrix(row: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, col: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, replace: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, isUpOffset?: boolean): _Matrix_;
    /**
     * Returns the specified element in the matrix.
     * Each element of the matrix is composed of complex numbers.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} row_or_pos - If this is a matrix, the row number. If this is a vector, the address.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [col] - If this is a matrix, the column number.
     * @returns {_Complex_}
     */
    getComplex(row_or_pos: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, col?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Complex_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [p=2]
     * @returns {number}
     */
    norm(p?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Condition number of the matrix
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [p=2]
     * @returns {number}
     */
    cond(p?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Inverse condition number.
     * @returns {number}
     */
    rcond(): number;
    /**
     * Rank.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    rank(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - Value after initialization.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static memset(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Return identity matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static eye(dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Create zero matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static zeros(dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Create a matrix of all ones.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static ones(dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Generate a matrix composed of random values with uniform random numbers.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static rand(dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Generate a matrix composed of random values with normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} dimension - Number of dimensions or rows.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [column_length] - Number of columns.
     * @returns {_Matrix_}
     */
    static randn(dimension: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isReal(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is complex matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isComplex(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is zero matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isZeros(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is identity matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isIdentity(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is diagonal matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isDiagonal(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is tridiagonal matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTridiagonal(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is regular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isRegular(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is orthogonal matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isOrthogonal(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is unitary matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isUnitary(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is symmetric matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isSymmetric(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is hermitian matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isHermitian(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is upper triangular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleUpper(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is  lower triangular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isTriangleLower(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Return true if the matrix is permutation matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {boolean}
     */
    isPermutation(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): boolean;
    /**
     * Number of rows and columns of matrix.
     * @returns {_Matrix_} [row_length, column_length]
     */
    size(): _Matrix_;
    /**
     * Compare values.
     * - Return value between scalars is of type Number.
     * - Return value between matrices is type _Matrix_.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number|_Matrix_} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number | _Matrix_;
    /**
     * Add.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A + B
     */
    add(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Subtract.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A - B
     */
    sub(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Multiply.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A * B
     */
    mul(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Divide.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A / B
     */
    div(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Power function.
     * - Supports only integers.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - 整数
     * @returns {_Matrix_} pow(A, B)
     */
    pow(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Multiplication for each element of matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A .* B
     */
    dotmul(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Division for each element of matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A ./ B
     */
    dotdiv(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of each element of matrix.
     * @returns {_Matrix_} 1 ./ A
     */
    dotinv(): _Matrix_;
    /**
     * Power function for each element of the matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A .^ B
     */
    dotpow(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Multiplication for each element of matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A .* B
     * @deprecated use the dotmul.
     */
    nmul(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Division for each element of matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A ./ B
     * @deprecated use the dotdiv.
     */
    ndiv(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of each element of matrix.
     * @returns {_Matrix_} 1 ./ A
     * @deprecated use the dotinv.
     */
    ninv(): _Matrix_;
    /**
     * Power function for each element of the matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_} A .^ B
     * @deprecated use the dotpow.
     */
    npow(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testInteger(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Test if each element of the matrix is complex integer.
     * - 1 if true, 0 if false.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testComplexInteger(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * real(this) === 0
     * - 1 if true, 0 if false.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testZero(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * real(this) === 1
     * - 1 if true, 0 if false.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testOne(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Test if each element of the matrix is complex.
     * - 1 if true, 0 if false.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testComplex(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Test if each element of the matrix is real.
     * - 1 if true, 0 if false.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {_Matrix_} _Matrix_ with elements of the numerical value of 1 or 0.
     */
    testReal(tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - X
     * @returns {_Matrix_} atan2(Y, X)
     */
    atan2(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} rot_90_count - Number of times rotated by 90 degrees.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    rot90(rot_90_count: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Change the size of the matrix.
     * Initialized with 0 when expanding.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} row_length - Number of rows of matrix to resize.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} column_length - Number of columns of matrix to resize.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    resize(row_length: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Remove the row in this matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} delete_row_index - Number of row of matrix to delete.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    deleteRow(delete_row_index: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Remove the column in this matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} delete_column_index - Number of column of matrix to delete.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    deleteColumn(delete_column_index: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Swap rows in the matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} exchange_row_index1 - Number 1 of row of matrix to exchange.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} exchange_row_index2 - Number 2 of row of matrix to exchange.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    exchangeRow(exchange_row_index1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, exchange_row_index2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Swap columns in the matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} exchange_column_index1 - Number 1 of column of matrix to exchange.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} exchange_column_index2 - Number 2 of column of matrix to exchange.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    exchangeColumn(exchange_column_index1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, exchange_column_index2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Combine matrix to the right of this matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} left_matrix - _Matrix_ to combine.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    concatRight(left_matrix: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Combine matrix to the bottom of this matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} bottom_matrix - _Matrix_ to combine.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    concatBottom(bottom_matrix: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Clip each element of matrix to specified range.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} min
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} max
     * @returns {_Matrix_} min(max(x, min), max)
     */
    clip(min: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, max: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Create row vector with specified initial value, step value, end condition.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} start_or_stop
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [stop]
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [step=1]
     * @returns {_Matrix_}
     */
    static arange(start_or_stop: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, stop?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, step?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Circular shift.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} shift_size
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    circshift(shift_size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: MatrixSettings): _Matrix_;
    /**
     * Circular shift.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} shift_size
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    roll(shift_size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: MatrixSettings): _Matrix_;
    /**
     * Change the shape of the matrix.
     * The number of elements in the matrix doesn't increase or decrease.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} row_length - Number of rows of matrix to reshape.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} column_length - Number of columns of matrix to reshape.
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    reshape(row_length: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, column_length: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    flip(type?: MatrixSettings): _Matrix_;
    /**
     * Index sort.
     * - Sorts by row when setting index by row vector to the argument.
     * - Sorts by column when setting index by column vector to the argument.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - Vector with index. (See the description of this function)
     * @returns {_Matrix_} _Matrix_ after function processing.
     */
    indexsort(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {_Matrix_} A・B
     */
    inner(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, dimension?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - B
     * @returns {_Matrix_} x
     */
    linsolve(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    gammainc(a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tail?: string): _Matrix_;
    /**
     * Probability density function (PDF) of the gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gampdf(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gamcdf(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    gaminv(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Beta function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} y
     * @returns {_Matrix_}
     */
    beta(y: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Incomplete beta function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    betainc(a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tail?: string): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    betacdf(a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    betapdf(a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    betainv(a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Factorial function, x!.
     * @returns {_Matrix_}
     */
    factorial(): _Matrix_;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k
     * @returns {_Matrix_}
     */
    nchoosek(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * Probability density function (PDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    normpdf(u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    normcdf(u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    norminv(u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tpdf(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tcdf(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tinv(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * - If tails = 1, TDIST returns the one-tailed distribution.
     * - If tails = 2, TDIST returns the two-tailed distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {_Matrix_}
     */
    tdist(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tails: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    tinv2(v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2pdf(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2cdf(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    chi2inv(k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of F-distribution.
     * - In the argument, specify the degree of freedom of ratio of two variables according to chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    fpdf(d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    fcdf(d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    finv(d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Maximum number.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} max([A, B])
     */
    max(type?: MatrixSettings): _Matrix_;
    /**
     * Minimum number.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} min([A, B])
     */
    min(type?: MatrixSettings): _Matrix_;
    /**
     * Sum.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    sum(type?: MatrixSettings): _Matrix_;
    /**
     * Arithmetic average.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mean(type?: MatrixSettings): _Matrix_;
    /**
     * Product of array elements.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    prod(type?: MatrixSettings): _Matrix_;
    /**
     * Geometric mean.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    geomean(type?: MatrixSettings): _Matrix_;
    /**
     * Median.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    median(type?: MatrixSettings): _Matrix_;
    /**
     * Mode.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mode(type?: MatrixSettings): _Matrix_;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {number} nth_order
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    moment(nth_order: number, type?: MatrixSettings): _Matrix_;
    /**
     * Variance.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    var(type?: MatrixSettings): _Matrix_;
    /**
     * Standard deviation.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    std(type?: MatrixSettings): _Matrix_;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {?string|?number} [algorithm]
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    mad(algorithm?: string | number, type?: MatrixSettings): _Matrix_;
    /**
     * Skewness.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    skewness(type?: MatrixSettings): _Matrix_;
    /**
     * Covariance matrix.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    cov(type?: MatrixSettings): _Matrix_;
    /**
     * The samples are normalized to a mean value of 0, standard deviation of 1.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    normalize(type?: MatrixSettings): _Matrix_;
    /**
     * Correlation matrix.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    corrcoef(type?: MatrixSettings): _Matrix_;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {string} [order]
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    sort(order?: string, type?: MatrixSettings): _Matrix_;
    /**
     * Discrete Fourier transform (DFT).
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} fft(x)
     */
    fft(type?: MatrixSettings): _Matrix_;
    /**
     * Inverse discrete Fourier transform (IDFT).
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} ifft(x)
     */
    ifft(type?: MatrixSettings): _Matrix_;
    /**
     * Power spectral density.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} abs(fft(x)).^2
     */
    powerfft(type?: MatrixSettings): _Matrix_;
    /**
     * Discrete cosine transform (_DCT_-II, _DCT_).
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} dct(x)
     */
    dct(type?: MatrixSettings): _Matrix_;
    /**
     * Inverse discrete cosine transform (_DCT_-III, IDCT).
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_} idct(x)
     */
    idct(type?: MatrixSettings): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number
     * @returns {_Matrix_}
     */
    conv(number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [number] - _Matrix_ to calculate the correlation.
     * @returns {_Matrix_}
     */
    xcorr(number?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static window(name: string, size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * Hann (Hanning) window.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hann(size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * Hamming window.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hamming(size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * _FFT_ shift.
     * Circular shift beginning at the center of the signal.
     * @param {MatrixSettings} [type]
     * @returns {_Matrix_}
     */
    fftshift(type?: MatrixSettings): _Matrix_;
}

/**
 * Class for linear algebra for _Matrix_ class.
 */
declare class _LinearAlgebra_ {
    /**
     * Inner product/Dot product.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} A
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} B
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [dimension=1] - Dimension of matrix used for calculation. (1 or 2)
     * @returns {_Matrix_} A・B
     */
    static inner(A: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, B: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, dimension?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * p-norm.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [p=2]
     * @returns {number}
     */
    static norm(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, p?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Condition number of the matrix
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [p=2]
     * @returns {number}
     */
    static cond(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, p?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Inverse condition number.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @returns {number}
     */
    static rcond(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Rank.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [tolerance] - Calculation tolerance of calculation.
     * @returns {number} rank(A)
     */
    static rank(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tolerance?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): number;
    /**
     * Trace of a matrix.
     * Sum of diagonal elements.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @returns {_Complex_}
     */
    static trace(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Complex_;
    /**
     * Determinant.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat
     * @returns {_Matrix_} |A|
     */
    static det(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * LUP decomposition.
     * - P'*L*U=A
     * - P is permutation matrix.
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{P: _Matrix_, L: _Matrix_, U: _Matrix_}} {L, U, P}
     */
    static lup(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {P: _Matrix_, L: _Matrix_, U: _Matrix_};
    /**
     * LU decomposition.
     * - L*U=A
     * - L is lower triangular matrix.
     * - U is upper triangular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{L: _Matrix_, U: _Matrix_}} {L, U}
     */
    static lu(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {L: _Matrix_, U: _Matrix_};
    /**
     * Solving a system of linear equations to be Ax = B
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} number - B
     * @returns {_Matrix_} x
     * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
     */
    static linsolve(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, number: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * QR decomposition.
     * - Q*R=A
     * - Q is orthonormal matrix.
     * - R is upper triangular matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{Q: _Matrix_, R: _Matrix_}} {Q, R}
     */
    static qr(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {Q: _Matrix_, R: _Matrix_};
    /**
     * Tridiagonalization of symmetric matrix.
     * - Don't support complex numbers.
     * - P*H*P'=A
     * - P is orthonormal matrix.
     * - H is tridiagonal matrix.
     * - The eigenvalues of H match the eigenvalues of A.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{P: _Matrix_, H: _Matrix_}} {P, H}
     */
    static tridiagonalize(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {P: _Matrix_, H: _Matrix_};
    /**
     * Eigendecomposition of symmetric matrix.
     * - Don't support complex numbers.
     * - V*D*V'=A.
     * - V is orthonormal matrix. and columns of V are the right eigenvectors.
     * - D is a matrix containing the eigenvalues on the diagonal component.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{V: _Matrix_, D: _Matrix_}} {D, V}
     * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
     */
    static eig(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {V: _Matrix_, D: _Matrix_};
    /**
     * Singular Value Decomposition (SVD).
     * - U*S*V'=A
     * - U and V are orthonormal matrices.
     * - S is a matrix with singular values in the diagonal.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {{U: _Matrix_, S: _Matrix_, V: _Matrix_}} U*S*V'=A
     */
    static svd(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): {U: _Matrix_, S: _Matrix_, V: _Matrix_};
    /**
     * Inverse matrix of this matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {_Matrix_} A^-1
     */
    static inv(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Pseudo-inverse matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} mat - A
     * @returns {_Matrix_} A^+
     */
    static pinv(mat: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
}

/**
 * Create _Random_.
 * @param {number} [seed] - Seed number for random number generation. If not specified, create from time.
 */
declare class _Random_ {
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
 * @typedef {Object} SignalSettings
 * @property {?string|?number} [dimension="auto"] Calculation direction. 0/"auto", 1/"row", 2/"column", 3/"both".
 */
declare type SignalSettings = {
    dimension?: string | number;
};

/**
 * _Signal_ processing class for _Matrix_ class.
 */
declare class _Signal_ {
    /**
     * Discrete Fourier transform (DFT).
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {_Matrix_} fft(x)
     */
    static fft(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
    /**
     * Inverse discrete Fourier transform (IDFT),
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} X
     * @param {SignalSettings} [type]
     * @returns {_Matrix_} ifft(X)
     */
    static ifft(X: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
    /**
     * Power spectral density.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {_Matrix_} abs(fft(x)).^2
     */
    static powerfft(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
    /**
     * Discrete cosine transform (_DCT_-II, _DCT_).
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {_Matrix_} dct(x)
     */
    static dct(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
    /**
     * Inverse discrete cosine transform (_DCT_-III, IDCT),
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} X
     * @param {SignalSettings} [type]
     * @returns {_Matrix_} idct(x)
     */
    static idct(X: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
    /**
     * Discrete two-dimensional Fourier transform (2D DFT).
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static fft2(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse discrete two-dimensional Fourier transform (2D IDFT),
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} X
     * @returns {_Matrix_}
     */
    static ifft2(X: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Discrete two-dimensional cosine transform (2D _DCT_).
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static dct2(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse discrete two-dimensional cosine transform (2D IDCT),
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} X
     * @returns {_Matrix_}
     */
    static idct2(X: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Convolution integral, Polynomial multiplication.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x1
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x2
     * @returns {_Matrix_}
     */
    static conv(x1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, x2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * ACF(Autocorrelation function), cros-correlation function.
     * - If the argument is omitted, it is calculated by the autocorrelation function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x1
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [x2] - _Matrix_ to calculate the correlation.
     * @returns {_Matrix_}
     */
    static xcorr(x1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, x2?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
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
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static window(name: string, size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * Hann (Hanning) window.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hann(size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * Hamming window.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} size - Window length
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric" (default) , 1/"periodic"
     * @returns {_Matrix_} Column vector.
     */
    static hamming(size: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, periodic?: string | number): _Matrix_;
    /**
     * _FFT_ shift.
     * Circular shift beginning at the center of the signal.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {SignalSettings} [type]
     * @returns {_Matrix_}
     */
    static fftshift(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: SignalSettings): _Matrix_;
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
 * Class for statistical processing for _Matrix_ class.
 */
declare class _Statistics_ {
    /**
     * Log-gamma function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static gammaln(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Gamma function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static gamma(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Incomplete gamma function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    static gammainc(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tail?: string): _Matrix_;
    /**
     * Probability density function (PDF) of the gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gampdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gamcdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of gamma distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - Shape parameter.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} s - Scale parameter.
     * @returns {_Matrix_}
     */
    static gaminv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Beta function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} y
     * @returns {_Matrix_}
     */
    static beta(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, y: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Incomplete beta function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @param {string} [tail="lower"] - lower (default) , "upper"
     * @returns {_Matrix_}
     */
    static betainc(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tail?: string): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    static betacdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    static betapdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of beta distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} a
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} b
     * @returns {_Matrix_}
     */
    static betainv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, a: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, b: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Factorial function, x!.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static factorial(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Binomial coefficient, number of all combinations, nCk.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k
     * @returns {_Matrix_}
     */
    static nchoosek(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Error function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static erf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Complementary error function.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @returns {_Matrix_}
     */
    static erfc(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static normpdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static normcdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of normal distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [u=0.0] - Average value.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} [s=1.0] - Variance value.
     * @returns {_Matrix_}
     */
    static norminv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, u?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, s?: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tpdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tcdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tinv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of Student's t-distribution that can specify tail.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} tails - Tail. (1 = the one-tailed distribution, 2 =  the two-tailed distribution.)
     * @returns {_Matrix_}
     */
    static tdist(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, tails: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse of cumulative distribution function (CDF) of Student's t-distribution in two-sided test.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} v - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static tinv2(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, v: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2pdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2cdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of chi-square distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} k - The degrees of freedom. (DF)
     * @returns {_Matrix_}
     */
    static chi2inv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, k: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Probability density function (PDF) of F-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static fpdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Cumulative distribution function (CDF) of F-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static fcdf(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Inverse function of cumulative distribution function (CDF) of F-distribution.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d1 - The degree of freedom of the molecules.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} d2 - The degree of freedom of the denominator
     * @returns {_Matrix_}
     */
    static finv(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d1: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, d2: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any): _Matrix_;
    /**
     * Maximum number.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_} max([A, B])
     */
    static max(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Minimum number.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_} min([A, B])
     */
    static min(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Sum.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static sum(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Arithmetic average.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mean(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Product of array elements.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static prod(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Geometric mean.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static geomean(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Median.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static median(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Mode.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mode(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Moment.
     * - Moment of order n. Equivalent to the definition of variance at 2.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {number} nth_order
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static moment(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, nth_order: number, type?: StatisticsSettings): _Matrix_;
    /**
     * Variance.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static var(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Standard deviation.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static std(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Mean absolute deviation.
     * - The "algorithm" can choose "0/mean"(default) and "1/median".
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {?string|?number} [algorithm]
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static mad(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, algorithm?: string | number, type?: StatisticsSettings): _Matrix_;
    /**
     * Skewness.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static skewness(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Covariance matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static cov(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * The samples are normalized to a mean value of 0, standard deviation of 1.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static normalize(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Correlation matrix.
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static corrcoef(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, type?: StatisticsSettings): _Matrix_;
    /**
     * Sort.
     * - The "order" can choose "ascend"(default) and "descend".
     * @param {_Matrix_|_Complex_|number|string|Array<string|number|_Complex_>|Array<Array<string|number|_Complex_>>|Object} x
     * @param {string} [order]
     * @param {StatisticsSettings} [type]
     * @returns {_Matrix_}
     */
    static sort(x: _Matrix_ | _Complex_ | number | string | (string | number | _Complex_)[] | (string | number | _Complex_)[][] | any, order?: string, type?: StatisticsSettings): _Matrix_;
}

