/**
 * 計算に利用できるデータを提供するクラス
 * 大まかに、 BigInteger, BigDecimal, Matrix の3つに分かれる。
 * Matrix は、 Complex を包括している。
 * 多倍長整数演算を特化した計算クラスは、 BigInteger 。
 * 任意精度浮動小数点演算を特化した計算クラスは、 BigDecimal 。
 * 信号処理や統計処理等を備えた汎用的な計算クラスは、 Matrix 。
 */
declare class konpeito {
    /**
     * 多倍長整数クラス
     * @returns {typeof BigInteger}
     */
    static BigInteger: any;
    /**
     * 任意精度浮動小数点クラス
     * @returns {typeof BigDecimal}
     */
    static BigDecimal: any;
    /**
     * BigDecimal用の丸め設定クラス
     * @returns {typeof RoundingMode}
     */
    static RoundingMode: any;
    /**
     * BigDecimal用の環境設定クラス
     * @returns {typeof MathContext}
     */
    static MathContext: any;
    /**
     * 複素数クラス
     * @returns {typeof Complex}
     */
    static Complex: any;
    /**
     * 複素行列クラス
     * @returns {typeof Matrix}
     */
    static Matrix: any;
    /**
     * 乱数クラス
     * @returns {typeof Random}
     */
    static Random: any;
}

/**
 * 任意精度浮動小数点を作成
 * 配列で設定する場合は、 BigInteger, [スケール値=0], [環境=default], [精度設定=default]
 * オブジェクトで設定する場合は、 integer, [scale=0], [default_context=default], [context=default]
 * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - 任意精度実数データ
 */
declare class BigDecimal {
    constructor(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any);
    /**
     * BigDecimal を作成
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number - 任意精度実数データ
     * @returns {BigDecimal}
     */
    static create(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 指定した数値から BigDecimal 型に変換
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} x
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} [scale]
     * @returns {BigDecimal}
     */
    static valueOf(x: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, scale?: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 符号を除いた文字列を作成
     * キャッシュがなければ作成し、キャッシュがあればそれを返す
     * @returns {string}
     */
    _getUnsignedIntegerString(): string;
    /**
     * ディープコピー
     * @returns {BigDecimal}
     */
    clone(): BigDecimal;
    /**
     * 倍率
     * @returns {number}
     */
    scale(): number;
    /**
     * 符号値
     * 1, -1, 0の場合は0を返す
     * @returns {number}
     */
    signum(): number;
    /**
     * 符号値
     * 1, -1, 0の場合は0を返す
     * @returns {number}
     */
    sign(): number;
    /**
     * 精度
     * @returns {number}
     */
    precision(): number;
    /**
     * 指数表記部分を取り除いた整数
     * @returns {BigInteger}
     */
    unscaledValue(): BigInteger;
    /**
     * 科学的表記法による文字列化
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} e_len - 指数部の桁数
     * @returns {string}
     */
    toScientificNotation(e_len: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): string;
    /**
     * 文字列化
     * 指数が不要の場合は指数表記なし
     * @returns {string}
     */
    toString(): string;
    /**
     * 技術表記法による文字列化
     * 指数が不要の場合は指数表記なし
     * @returns {string}
     */
    toEngineeringString(): string;
    /**
     * 指数表記なしの文字列化
     * @returns {string}
     */
    toPlainString(): string;
    /**
     * 設定された精度で表すことができる最も小さな値
     * @returns {BigDecimal}
     */
    ulp(): BigDecimal;
    /**
     * スケールの再設定
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} new_scale - 新しいスケール
     * @param {RoundingModeEntity} [rounding_mode=RoundingMode.UNNECESSARY] - 精度を変換する際の丸め方
     * @param {MathContext} [mc] - 切り替え先の設定（これのみ変更する場合は、roundを使用すること）
     * @returns {BigDecimal}
     */
    setScale(new_scale: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, rounding_mode?: RoundingModeEntity, mc?: MathContext): BigDecimal;
    /**
     * 環境設定を切り替える
     * @param {MathContext} mc - 切り替え先の設定
     * @returns {BigDecimal}
     */
    round(mc: MathContext): BigDecimal;
    /**
     * 絶対値
     * @param {MathContext} [mc] - 計算に使用する設定
     * @returns {BigDecimal} abs(A)
     */
    abs(mc?: MathContext): BigDecimal;
    /**
     * 正数
     * @param {MathContext} [mc] - 計算に使用する設定
     * @returns {BigDecimal} +A
     */
    plus(mc?: MathContext): BigDecimal;
    /**
     * 負数
     * @param {MathContext} [mc] - 計算に使用する設定
     * @returns {BigDecimal} -A
     */
    negate(mc?: MathContext): BigDecimal;
    /**
     * 値同士を比較
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): number;
    /**
     * 等式
     * 精度やスケール含めて等しいかをテストする
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {boolean} A === B
     */
    equals(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): boolean;
    /**
     * 最大値
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {BigDecimal} max([A, B])
     */
    max(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 最小値
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @returns {BigDecimal} min([A, B])
     */
    min(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 精度は変更させずスケールのみを変更させ10の倍数を乗算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal} A * 10^floor(n)
     */
    scaleByPowerOfTen(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 小数点の位置を左へ移動
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal}
     */
    movePointLeft(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 小数点の位置を右へ移動
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} n
     * @returns {BigDecimal}
     */
    movePointRight(n: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any): BigDecimal;
    /**
     * 数字の右側にある0を取り除き、スケールを正規化
     * @returns {BigDecimal}
     */
    stripTrailingZeros(): BigDecimal;
    /**
     * 加算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、加算先の設定デフォルト値を使用する
     * @returns {BigDecimal} A + B
     */
    add(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 減算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、減算先の設定デフォルト値を使用する
     * @returns {BigDecimal} A - B
     */
    subtract(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 減算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、減算先の設定デフォルト値を使用する
     * @returns {BigDecimal} A - B
     */
    sub(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 乗算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、乗算先の設定デフォルト値を使用する
     * @returns {BigDecimal} A * B
     */
    multiply(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 乗算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、乗算先の設定デフォルト値を使用する
     * @returns {BigDecimal} A * B
     */
    mul(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 小数点まで求めない割り算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
     * @returns {BigDecimal} (int)(A / B)
     */
    divideToIntegralValue(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 割り算と余り
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
     * @returns {Array<BigDecimal>} [C = (int)(A / B), A - C * B]
     */
    divideAndRemainder(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal[];
    /**
     * 割り算の余り
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
     * @returns {BigDecimal} A % B
     */
    rem(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 割り算の正の余り
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、割る先の設定デフォルト値を使用する
     * @returns {BigDecimal} A mod B
     */
    mod(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * 割り算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
     * @returns {BigDecimal}
     */
    divide(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, type?: any): BigDecimal;
    /**
     * 割り算
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {{scale: ?number, context: ?MathContext, roundingMode: ?RoundingModeEntity}} [type] - 計算に使用する scale, context, roundingMode を設定する
     * @returns {BigDecimal} A / B
     */
    div(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, type?: any): BigDecimal;
    /**
     * BigInteger に変換
     * @returns {BigInteger}
     */
    toBigInteger(): BigInteger;
    /**
     * BigInteger に変換
     * 変換に失敗した場合は例外
     * @returns {BigInteger}
     */
    toBigIntegerExact(): BigInteger;
    /**
     * 32ビット整数に変換
     * @returns {number}
     */
    intValue: any;
    /**
     * 32ビット整数に変換
     * 変換に失敗した場合は例外
     * @returns {number}
     */
    intValueExact: any;
    /**
     * 32ビット実数に変換
     * @returns {number}
     */
    floatValue: any;
    /**
     * 64ビット実数に変換
     * @returns {number}
     */
    doubleValue: any;
    /**
     * 累乗
     * 巨大な乗算をする場合は例外を発生させる
     * @param {BigDecimal|number|string|Array<BigInteger|number|MathContext>|{integer:BigInteger,scale:?number,default_context:?MathContext,context:?MathContext}|BigInteger|Object} number
     * @param {MathContext} [context] - 計算に使用する設定、省略した場合は、累乗先の設定デフォルト値を使用する
     * @returns {BigDecimal} pow(A, B)
     */
    pow(number: BigDecimal | number | string | (BigInteger | number | MathContext)[] | any | BigInteger | any, context?: MathContext): BigDecimal;
    /**
     * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定
     * @param {MathContext} [context=MathContext.DECIMAL128]
     */
    static setDefaultContext(context?: MathContext): void;
    /**
     * オブジェクトを新規作成時に環境設定を変更しなかった場合に設定されるデフォルト設定を取得
     * @returns {MathContext}
     */
    static getDefaultContext(): MathContext;
    /**
     * 0
     * @returns {BigDecimal} 0
     */
    static ZERO: any;
    /**
     * 1
     * @returns {BigDecimal} 1
     */
    static ONE: any;
    /**
     * 2
     * @returns {BigDecimal} 2
     */
    static TWO: any;
    /**
     * 10
     * @returns {BigDecimal} 10
     */
    static TEN: any;
}

/**
 * 多倍長整数を作成
 * 文字列で指定する場合は指数表記には非対応。
 * 指定した進数で指定する場合は["ff", 16] という配列で指定する。
 * @param {BigInteger|number|string|Array<string|number>|Object} [number] - 整数値
 */
declare class BigInteger {
    constructor(number?: BigInteger | number | string | (string | number)[] | any);
    /**
     * BigIntegerを作成する
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger}
     */
    static create(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * BigInteger を作成
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger}
     */
    static valueOf(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 指定したビット数以内の乱数
     * @param {BigInteger|number|string|Array<string|number>|Object} bitsize - 作成する乱数のビット数
     * @param {Random} [random] - 作成に使用するRandom
     * @returns {BigInteger}
     */
    static createRandomBigInteger(bitsize: BigInteger | number | string | (string | number)[] | any, random?: Random): BigInteger;
    /**
     * 指定したビット数以内の素数
     * @param {BigInteger|number|string|Array<string|number>|Object} bits - 作成する素数の乱数のビット数
     * @param {Random} [random] - 作成に使用するRandom
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - ミラーラビン素数判定法に使用する繰り返し回数
     * @param {BigInteger|number|string|Array<string|number>|Object} [create_count=500] - 乱数生成回数
     * @returns {BigInteger}
     */
    static probablePrime(bits: BigInteger | number | string | (string | number)[] | any, random?: Random, certainty?: BigInteger | number | string | (string | number)[] | any, create_count?: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 等式
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {boolean} A === B
     */
    equals(number: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * 文字列化
     * @param {BigInteger|number|string|Array<string|number>|Object} [radix=10] - 文字列変換後の進数
     * @returns {string}
     */
    toString(radix?: BigInteger | number | string | (string | number)[] | any): string;
    /**
     * 16進数ごとの配列で構成される内部値の指定した位置の値
     * @param {BigInteger|number|string|Array<string|number>|Object} point - 内部配列の位置
     * @returns {number}
     */
    getShort(point: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * 32ビット整数値
     * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
     * @returns {number}
     */
    intValue: any;
    /**
     * 64ビット整数値
     * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
     * @returns {number}
     */
    longValue: any;
    /**
     * 64ビット実数値
     * 数値が大きいなど、収まりきらない場合に正確な数値にならない場合がある
     * @returns {number}
     */
    doubleValue: any;
    /**
     * ディープコピー
     * @returns {BigInteger}
     */
    clone(): BigInteger;
    /**
     * 実部の負数を判定
     * @returns {boolean} real(x) < 0
     */
    isNegative(): boolean;
    /**
     * 0 を判定
     * @returns {boolean} A === 0
     */
    isZero(): boolean;
    /**
     * 正数を判定
     * @returns {boolean} real(x) > 0
     */
    isPositive(): boolean;
    /**
     * 2進数で表した場合に最も右側に現れる1の桁数
     * @returns {number} 存在しない場合は -1
     */
    getLowestSetBit(): number;
    /**
     * 2進数で表した場合の長さ
     * @returns {number}
     */
    bitLength(): number;
    /**
     * 2の補数表現で表した場合に立つビットの数
     * @returns {number}
     */
    bitCount(): number;
    /**
     * 論理積
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & B
     */
    and(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 論理和
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A | B
     */
    or(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 排他的論理和
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A ^ B
     */
    xor(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * ビット反転（ミュータブル）
     * @returns {BigInteger} !A
     */
    not(): BigInteger;
    /**
     * 否定論理積
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & (!B)
     */
    andNot(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 否定論理積
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A & (!B)
     */
    nand(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 否定論理和
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} !(A | B)
     */
    orNot(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 否定論理和
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} !(A | B)
     */
    nor(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * ユークリッド互除法
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} gcd(x, y)
     */
    gcd(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 拡張ユークリッド互除法
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {Array<BigInteger>} a*x + b*y = c = gcd(x, y) となる [a, b, c]
     */
    extgcd(number: BigInteger | number | string | (string | number)[] | any): BigInteger[];
    /**
     * 絶対値
     * @returns {BigInteger} abs(A)
     */
    abs(): BigInteger;
    /**
     * 負数
     * @returns {BigInteger} -A
     */
    negate(): BigInteger;
    /**
     * 符号値
     * @returns {number} 1, -1, 0の場合は0を返す
     */
    signum(): number;
    /**
     * 符号値
     * @returns {number} 1, -1, 0の場合は0を返す
     */
    sign(): number;
    /**
     * 符号を除いた値同士を比較
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {number} abs(A) < abs(B) ? 1 : (abs(A) === abs(B) ? 0 : -1)
     */
    compareToAbs(number: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * 値同士を比較
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: BigInteger | number | string | (string | number)[] | any): number;
    /**
     * 最大値
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} max([A, B])
     */
    max(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 最小値
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} min([A, B])
     */
    min(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * ビットシフト
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A << n
     */
    shift(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 左へビットシフト
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A << n
     */
    shiftLeft(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 右へビットシフト
     * @param {BigInteger|number|string|Array<string|number>|Object} n
     * @returns {BigInteger} A >> n
     */
    shiftRight(n: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 加算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A + B
     */
    add(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 減算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A - B
     */
    subtract(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 減算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A - B
     */
    sub(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 乗算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A * B
     */
    multiply(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 乗算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A * B
     */
    mul(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 割り算と余り
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {Array<BigInteger>} [C = floor(A / B), A - C * B]
     */
    divideAndRemainder(number: BigInteger | number | string | (string | number)[] | any): BigInteger[];
    /**
     * 割り算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} floor(A / B)
     */
    divide(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 割り算
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} floor(A / B)
     */
    div(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 割り算の余り
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A % B
     */
    remainder(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 割り算の余り
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A % B
     */
    rem(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 割り算の正の余り
     * @param {BigInteger|number|string|Array<string|number>|Object} number
     * @returns {BigInteger} A mod B
     */
    mod(number: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 特定のビットを立てる
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    setBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 特定のビットを反転させる
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    flipBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 特定のビットを下げる
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {BigInteger}
     */
    clearBit(bit: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 指定のビットの判定
     * @param {BigInteger|number|string|Array<string|number>|Object} bit
     * @returns {boolean}
     */
    testBit(bit: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * 累乗
     * @param {BigInteger|number|string|Array<string|number>|Object} exponent
     * @returns {BigInteger} pow(A, B)
     */
    pow(exponent: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 冪剰余
     * @param {BigInteger|number|string|Array<string|number>|Object} exponent
     * @param {BigInteger|number|string|Array<string|number>|Object} m
     * @returns {BigInteger} A^B mod m
     */
    modPow(exponent: BigInteger | number | string | (string | number)[] | any, m: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * モジュラ逆数
     * @param {BigInteger|number|string|Array<string|number>|Object} m
     * @returns {BigInteger} A^(-1) mod m
     */
    modInverse(m: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * ミラーラビン素数判定法による複素判定
     * （非常に重たいので注意）
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - 素数判定法の繰り返し回数
     * @returns {boolean}
     */
    isProbablePrime(certainty?: BigInteger | number | string | (string | number)[] | any): boolean;
    /**
     * 次の素数
     * @param {BigInteger|number|string|Array<string|number>|Object} [certainty=100] - 素数判定法の繰り返し回数
     * @param {BigInteger|number|string|Array<string|number>|Object} [search_max=100000] - 次の素数を見つけるまでの回数
     * @returns {BigInteger}
     */
    nextProbablePrime(certainty?: BigInteger | number | string | (string | number)[] | any, search_max?: BigInteger | number | string | (string | number)[] | any): BigInteger;
    /**
     * 階乗関数
     * @returns {BigInteger} n!
     */
    factorial(): BigInteger;
    /**
     * 乱数を指定しなかった場合のデフォルト乱数を設定する
     * @param {Random} random
     */
    static setDefaultRandom(random: Random): void;
    /**
     * 乱数を指定しなかった場合のデフォルト乱数を取得する
     * @returns {Random}
     */
    static getDefaultRandom(): Random;
    /**
     * 0
     * @returns {BigInteger} 0
     */
    static ZERO: any;
    /**
     * 1
     * @returns {BigInteger} 1
     */
    static ONE: any;
    /**
     * 2
     * @returns {BigInteger} 2
     */
    static TWO: any;
    /**
     * 10
     * @returns {BigInteger} 10
     */
    static TEN: any;
}

/**
 * 複素数を作成
 * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - 複素数( "1 + j", [1 , 1] など)
 */
declare class Complex {
    constructor(number: Complex | number | string | number[] | any | any);
    /**
     * Complex を作成
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex}
     */
    static create(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 指定した数値から Complex 型に変換
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex}
     */
    static valueOf(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 32ビット整数に変換
     * @returns {number}
     */
    intValue: any;
    /**
     * 64ビット実数に変換
     * @returns {number}
     */
    doubleValue: any;
    /**
     * ディープコピー
     * @returns {Complex}
     */
    clone(): Complex;
    /**
     * 文字列データ
     * @returns {string}
     */
    toString(): string;
    /**
     * ランダムな値を作成
     * @returns {Complex}
     */
    static rand(): Complex;
    /**
     * 正規分布に従うランダムな値を作成
     * @returns {Complex}
     */
    static randn(): Complex;
    /**
     * 等式
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} A === B
     */
    equals(number: Complex | number | string | number[] | any | any, epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 実部
     * @returns {number} real(A)
     */
    real: any;
    /**
     * 虚部
     * @returns {number} imag(A)
     */
    imag: any;
    /**
     * ノルム
     * @returns {number} |A|
     */
    norm: any;
    /**
     * 偏角
     * @returns {number} arg(A)
     */
    arg: any;
    /**
     * 実部、虚部を表す際の小数点以下の桁数
     * @returns {number} 小数点の桁数
     */
    getDecimalPosition(): number;
    /**
     * 加算
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A + B
     */
    add(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 減算
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A - B
     */
    sub(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 乗算
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A * B
     */
    mul(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * ドット積
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A * conj(B)
     */
    dot(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 割り算
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} A / B
     */
    div(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 割り算の正の余り
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number - 複素数を含まない数値
     * @returns {Complex} A mod B
     */
    mod(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 逆数
     * @returns {Complex} 1 / A
     */
    inv(): Complex;
    /**
     * 符号値
     * @returns {Complex} [-1,1] 複素数の場合はノルムを1にした値。
     */
    sign(): Complex;
    /**
     * 最大値
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {Complex} max([A, B])
     */
    max(number: Complex | number | string | number[] | any | any, epsilon?: Complex | number | string | number[] | any | any): Complex;
    /**
     * 最小値
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {Complex} min([A, B])
     */
    min(number: Complex | number | string | number[] | any | any, epsilon?: Complex | number | string | number[] | any | any): Complex;
    /**
     * 値同士を比較
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {number} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: Complex | number | string | number[] | any | any, epsilon?: Complex | number | string | number[] | any | any): number;
    /**
     * 整数を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean}
     */
    isInteger(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 複素整数（整数も含む）を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} real(A) === 整数 && imag(A) === 整数
     */
    isComplexInteger(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 0 を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} A === 0
     */
    isZero(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 1 を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} A === 1
     */
    isOne(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 複素数（虚部が0以外）を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} imag(A) !== 0
     */
    isComplex(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 実数を判定
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [epsilon=Number.EPSILON] - 誤差を実数で指定
     * @returns {boolean} imag(A) === 0
     */
    isReal(epsilon?: Complex | number | string | number[] | any | any): boolean;
    /**
     * 非数を判定
     * @returns {boolean} isNaN(A)
     */
    isNaN(): boolean;
    /**
     * 実部の正数を判定
     * @returns {boolean} real(x) > 0
     */
    isPositive(): boolean;
    /**
     * 実部の負数を判定
     * @returns {boolean} real(x) < 0
     */
    isNegative(): boolean;
    /**
     * 実部の非負値を判定
     * @returns {boolean} real(x) >= 0
     */
    isNotNegative(): boolean;
    /**
     * 無限を判定
     * @returns {boolean} isInfinite(A)
     */
    isInfinite(): boolean;
    /**
     * 有限数を判定
     * @returns {boolean} !isNaN(A) && !isInfinite(A)
     */
    isFinite(): boolean;
    /**
     * 絶対値
     * @returns {Complex} abs(A)
     */
    abs(): Complex;
    /**
     * 共役複素数
     * @returns {Complex} real(A) - imag(A)j
     */
    conj(): Complex;
    /**
     * 負数
     * @returns {Complex} -A
     */
    negate(): Complex;
    /**
     * 累乗
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} number
     * @returns {Complex} pow(A, B)
     */
    pow(number: Complex | number | string | number[] | any | any): Complex;
    /**
     * 2乗
     * @returns {Complex} pow(A, 2)
     */
    square(): Complex;
    /**
     * 平方根
     * @returns {Complex} sqrt(A)
     */
    sqrt(): Complex;
    /**
     * 対数
     * @returns {Complex} log(A)
     */
    log(): Complex;
    /**
     * 指数
     * @returns {Complex} exp(A)
     */
    exp(): Complex;
    /**
     * sin
     * @returns {Complex} sin(A)
     */
    sin(): Complex;
    /**
     * cos
     * @returns {Complex} cos(A)
     */
    cos(): Complex;
    /**
     * tan
     * @returns {Complex} tan(A)
     */
    tan(): Complex;
    /**
     * atan
     * @returns {Complex} atan(A)
     */
    atan(): Complex;
    /**
     * atan2
     * @param {Complex|number|string|Array<number>|{_re:number,_im:number}|Object} [number] - 実数で指定。省略時は、本オブジェクトの偏角を返す。
     * @returns {Complex} atan2(Y, X)
     */
    atan2(number?: Complex | number | string | number[] | any | any): Complex;
    /**
     * 正規化 sinc
     * @returns {Complex} sinc(A)
     */
    sinc(): Complex;
    /**
     * floor
     * @returns {Complex} floor(A)
     */
    floor(): Complex;
    /**
     * ceil
     * @returns {Complex} ceil(A)
     */
    ceil(): Complex;
    /**
     * 四捨五入
     * @returns {Complex} round(A)
     */
    round(): Complex;
    /**
     * 整数化
     * @returns {Complex} fix(A)
     */
    fix(): Complex;
    /**
     * 小数部の抽出
     * @returns {Complex} fract(A)
     */
    fract(): Complex;
    /**
     * 1
     * @returns {Complex} 1
     */
    static ONE: any;
    /**
     * 2
     * @returns {Complex} 2
     */
    static TWO: any;
    /**
     * 10
     * @returns {Complex} 10
     */
    static TEN: any;
    /**
     * 0
     * @returns {Complex} 0
     */
    static ZERO: any;
    /**
     * -1
     * @returns {Complex} -1
     */
    static MINUS_ONE: any;
    /**
     * i, j
     * @returns {Complex} i
     */
    static I: any;
    /**
     * PI
     * @returns {Complex} 3.14...
     */
    static PI: any;
    /**
     * E
     * @returns {Complex} 2.71...
     */
    static E: any;
    /**
     * LN2
     * @returns {Complex} ln(2)
     */
    static LN2: any;
    /**
     * LN10
     * @returns {Complex} ln(10)
     */
    static LN10: any;
    /**
     * LOG2E
     * @returns {Complex} log_2(e)
     */
    static LOG2E: any;
    /**
     * LOG10E
     * @returns {Complex} log_10(e)
     */
    static LOG10E: any;
    /**
     * SQRT2
     * @returns {Complex} sqrt(2)
     */
    static SQRT2: any;
    /**
     * SQRT1_2
     * @returns {Complex} sqrt(0.5)
     */
    static SQRT1_2: any;
    /**
     * 0.5
     * @returns {Complex} 0.5
     */
    static HALF: any;
    /**
     * 正の無限大
     * @returns {Complex} Infinity
     */
    static POSITIVE_INFINITY: any;
    /**
     * 負の無限大
     * @returns {Complex} -Infinity
     */
    static NEGATIVE_INFINITY: any;
    /**
     * 非数
     * @returns {Complex} NaN
     */
    static NaN: any;
}

/**
 * 任意精度の環境設定データ
 * @param {string|number} precision_or_name - 精度を数値で指定するか、設定自体を文字列で指定する
 * @param {RoundingModeEntity} [roundingMode=RoundingMode.HALF_UP] - 丸めモード
 */
declare class MathContext {
    constructor(precision_or_name: string | number, roundingMode?: RoundingModeEntity);
    /**
     * 精度
     * @returns {number}
     */
    getPrecision(): number;
    /**
     * 丸め方
     * @returns {RoundingModeEntity}
     */
    getRoundingMode(): RoundingModeEntity;
    /**
     * 環境が等しいか
     * @param {MathContext} x - 比較対象
     * @returns {boolean}
     */
    equals(x: MathContext): boolean;
    /**
     * 文字列化
     * @returns {string}
     */
    toString(): string;
    /**
     * 制限を設けない（ただし、割り算で循環小数の場合にエラーが出ます。）
     * @returns {MathContext}
     */
    static UNLIMITED: any;
    /**
     * 32ビットの実数型 ( float ) と同等
     * @returns {MathContext}
     */
    static DECIMAL32: any;
    /**
     * 64ビットの実数型 ( double ) と同等
     * @returns {MathContext}
     */
    static DECIMAL64: any;
    /**
     * 128ビットの実数型 ( long double ) と同等
     * @returns {MathContext}
     */
    static DECIMAL128: any;
}

/**
 * BigDecimal用の丸めモードの基底クラス
 * @interface
 */
declare interface RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    getAddNumber(x: number): number;
}

declare interface RoundingMode_UP extends RoundingModeEntity {
}

/**
 * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_UP implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_DOWN extends RoundingModeEntity {
}

/**
 * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_DOWN implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_CEILING extends RoundingModeEntity {
}

/**
 * 正の無限大に近づく
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_CEILING implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_FLOOR extends RoundingModeEntity {
}

/**
 * 負の無限大に近づく
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_FLOOR implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_UP extends RoundingModeEntity {
}

/**
 * 四捨五入
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_UP implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_DOWN extends RoundingModeEntity {
}

/**
 * 五捨六入
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_DOWN implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_HALF_EVEN extends RoundingModeEntity {
}

/**
 * 等間隔なら偶数側へ丸める
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_HALF_EVEN implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

declare interface RoundingMode_UNNECESSARY extends RoundingModeEntity {
}

/**
 * 丸めない（丸める必要が出る場合はエラー）
 * @implements {RoundingModeEntity}
 */
declare class RoundingMode_UNNECESSARY implements RoundingModeEntity {
    /**
     * 丸めモードの名前を英語の大文字で取得する
     * @returns {string} 丸めモード名
     */
    static toString(): string;
    /**
     * 丸めに必要な加算値
     * @param {number} x - 1ケタ目の値
     * @returns {number} いくつ足すと丸められるか
     */
    static getAddNumber(x: number): number;
}

/**
 * BigDecimal用の丸めモードクラス
 */
declare class RoundingMode {
    /**
     * 指定した文字列で表される丸めクラスを取得する
     * @param {string|RoundingModeEntity|Object} name - モードの英数名
     * @returns {typeof RoundingModeEntity}
     */
    static valueOf(name: string | RoundingModeEntity | any): any;
    /**
     * 絶対値の切り上げ（1桁目が0より大きければ桁上げする）
     * @returns {typeof RoundingModeEntity}
     */
    static UP: any;
    /**
     * 絶対値の切り下げ（1桁目が0より大きければ桁下げする）
     * @returns {typeof RoundingModeEntity}
     */
    static DOWN: any;
    /**
     * 正の無限大に近づく
     * @returns {typeof RoundingModeEntity}
     */
    static CEILING: any;
    /**
     * 負の無限大に近づく
     * @returns {typeof RoundingModeEntity}
     */
    static FLOOR: any;
    /**
     * 四捨五入
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_UP: any;
    /**
     * 五捨六入
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_DOWN: any;
    /**
     * 等間隔なら偶数側へ丸める
     * @returns {typeof RoundingModeEntity}
     */
    static HALF_EVEN: any;
    /**
     * 丸めない（丸める必要が出る場合はエラー）
     * @returns {typeof RoundingModeEntity}
     */
    static UNNECESSARY: any;
}

/**
 * 複素行列を作成
 * 引数は次のタイプをとれます
 * ・4 				整数や実数
 * ・"1 + j"		文字列で複素数をわたす
 * ・[1,2]			1次元配列
 * ・[[1,2],[3,4]]	行列
 * ・["1+j", "2+j"]	複素数を含んだ行列
 * ・"[1 1:0.5:3]"		MATLAB/Octave/Scilab互換
 * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 行列データ( "1 + j", [1 , 1] など)
 */
declare class Matrix {
    constructor(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any);
    /**
     * Matrix を作成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    static create(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 指定した数値から Matrix 型に変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    static valueOf(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * キャッシュを削除
     */
    _clearCash(): void;
    /**
     * ディープコピー
     * @returns {Matrix}
     */
    clone(): Matrix;
    /**
     * 文字列化
     * @returns {string}
     */
    toString(): string;
    /**
     * 文字列化（1行で表す）
     * @returns {string}
     */
    toOneLineString(): string;
    /**
     * 等式
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean} A === B
     */
    equals(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 行列を構成する複素数の実部の配列
     * @returns {Array<Array<number>>}
     */
    getNumberMatrixArray(): number[][];
    /**
     * 行列を構成する複素数のComplex型の配列
     * @returns {Array<Array<Complex>>}
     */
    getComplexMatrixArray(): Complex[][];
    /**
     * 本オブジェクト内の全要素に同一処理を実行
     * @param {function(Complex, number, number): ?Object } eachfunc - Function(num, row, col)
     * @returns {Matrix} 処理実行後の行列
     */
    cloneMatrixDoEachCalculation(eachfunc: (...params: any[]) => any): Matrix;
    /**
     * 行列内の各値に対して指定した初期化を行ったMatrixを作成
     * @param {function(number, number): ?Object } eachfunc - Function(row, col)
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length=dimension] - 列数
     * @returns {Matrix} 処理実行後の行列
     */
    static createMatrixDoEachCalculation(eachfunc: (...params: any[]) => any, dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の列をベクトルとみなし同一処理を実行、行ベクトルであれば行ベクトルに対し同一処理を実行
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} 処理実行後の行列
     */
    eachVectorAuto(array_function: (...params: any[]) => any): Matrix;
    /**
     * 行列の行と列をベクトルとみなし同一処理を実行
     * 先に行に対して同一処理を実行後の行列に対し、列ごとにさらに同一処理を実行する
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} 処理実行後の行列
     */
    eachVectorBoth(array_function: (...params: any[]) => any): Matrix;
    /**
     * 行列の行をベクトルとみなし同一処理を実行
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} 処理実行後の行列
     */
    eachVectorRow(array_function: (...params: any[]) => any): Matrix;
    /**
     * 行列の列をベクトルとみなし同一処理を実行
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @returns {Matrix} 処理実行後の行列
     */
    eachVectorColumn(array_function: (...params: any[]) => any): Matrix;
    /**
     * 引数に設定された行／列をベクトルとみなし同一処理を実行
     * @param {function(Array<Complex>): Array<Complex>} array_function - Function(array)
     * @param {string|number} [dimtype="auto"] - 0/"auto", 1/"row", 2/"column", 3/"both"
     * @returns {Matrix} 処理実行後の行列
     */
    eachVector(array_function: (...params: any[]) => any, dimtype?: string | number): Matrix;
    /**
     * 行列内の指定した箇所の行列
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 抽出する行番号が入ったベクトル,":"で全ての行抽出
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 抽出する列番号が入ったベクトル,":"で全ての列抽出
     * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
     * @returns {Matrix}
     */
    getMatrix(row: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, isUpOffset?: boolean): Matrix;
    /**
     * 行列内の指定した箇所の値を変更する
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row - 変更する行番号が入ったベクトル,":"で全ての行抽出
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} col - 変更する列番号が入ったベクトル,":"で全ての列抽出
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} replace - 変更内容の行列
     * @param {boolean} [isUpOffset=false] - 位置のオフセットを1にするか
     * @returns {Matrix}
     */
    setMatrix(row: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, replace: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, isUpOffset?: boolean): Matrix;
    /**
     * 行列内の指定した箇所の値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_or_pos - 行列なら行番号, ベクトルの場合は値の位置番号
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [col] - 列番号（行列の場合は指定する）
     * @returns {Complex}
     */
    getComplex(row_or_pos: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, col?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Complex;
    /**
     * 行列の最初の要素の整数値
     * @returns {number}
     */
    intValue: any;
    /**
     * 行列の最初の要素の実数値
     * @returns {number}
     */
    doubleValue: any;
    /**
     * 行列の最初の要素
     * @returns {Complex}
     */
    scalar: any;
    /**
     * 行数及び列数の最大値
     * @returns {number}
     */
    length: any;
    /**
     * 1ノルム
     * @returns {number}
     */
    norm1: any;
    /**
     * 2ノルム
     * @returns {number}
     */
    norm2: any;
    /**
     * pノルム
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    norm(p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * 条件数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    cond(p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * 1ノルムの条件数の逆数
     * @returns {number}
     */
    rcond(): number;
    /**
     * ランク
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {number} rank(A)
     */
    rank(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * トレース
     * @returns {Complex} trace(A)
     */
    trace(): Complex;
    /**
     * 行列式
     * @returns {Matrix} |A|
     */
    det(): Matrix;
    /**
     * 指定した数値で初期化
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 初期値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static memset(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 単位行列を生成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static eye(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 零行列を生成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static zeros(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 1で構成した行列を生成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static ones(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 乱数で構成した行列を生成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static rand(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布に従う乱数で構成した行列を生成
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} dimension - 次元数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [column_length] - 列数
     * @returns {Matrix}
     */
    static randn(dimension: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
     * @returns {Matrix} 行列なら対角成分を列ベクトルを生成、ベクトルなら対角成分を持つ行列を生成
     */
    diag(): Matrix;
    /**
     * スカラー値の判定
     * @returns {boolean}
     */
    isScalar(): boolean;
    /**
     * 行ベクトル／横ベクトルの判定
     * @returns {boolean}
     */
    isRow(): boolean;
    /**
     * 列ベクトル／縦ベクトルの判定
     * @returns {boolean}
     */
    isColumn(): boolean;
    /**
     * ベクトルの判定
     * @returns {boolean}
     */
    isVector(): boolean;
    /**
     * 行列の判定
     * @returns {boolean}
     */
    isMatrix(): boolean;
    /**
     * 正方行列の判定
     * @returns {boolean}
     */
    isSquare(): boolean;
    /**
     * 実行列の判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isReal(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 複素行列の判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isComplex(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 零行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isZeros(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 単位行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isIdentity(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 対角行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isDiagonal(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 三重対角行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isTridiagonal(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 正則行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isRegular(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 直行行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isOrthogonal(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * ユニタリ行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isUnitary(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 対称行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isSymmetric(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * エルミート行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isHermitian(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 上三角行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isTriangleUpper(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 下三角行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isTriangleLower(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 置換行列を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {boolean}
     */
    isPermutation(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): boolean;
    /**
     * 行列の行数と列数
     * @returns {Matrix} [row_length column_length]
     */
    size(): Matrix;
    /**
     * 値同士を比較
     * スカラー同士の場合の戻り値は、number型。
     * 行列同士の場合は、各項の比較結果が入った、Matrix型。
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {number|Matrix} A > B ? 1 : (A === B ? 0 : -1)
     */
    compareTo(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number | Matrix;
    /**
     * 加算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A + B
     */
    add(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 減算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A - B
     */
    sub(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 乗算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A * B
     */
    mul(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 割り算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A / B
     */
    div(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 整数での累乗
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - 整数
     * @returns {Matrix} pow(A, B)
     */
    pow(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の各項ごとの掛け算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .* B
     */
    nmul(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の各項ごとの割り算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A ./ B
     */
    ndiv(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の各項ごとの逆数
     * @returns {Matrix} 1 ./ A
     */
    ninv(): Matrix;
    /**
     * 行列の各項ごとの累乗
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix} A .^ B
     */
    npow(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の実部
     * @returns {Matrix} real(A)
     */
    real(): Matrix;
    /**
     * 各項の虚部
     * @returns {Matrix} imag(A)
     */
    imag(): Matrix;
    /**
     * 各項の偏角
     * @returns {Matrix} arg(A)
     */
    arg(): Matrix;
    /**
     * 各項の符号値
     * @returns {Matrix} [-1,1] 複素数の場合はノルムを1にした値。
     */
    sign(): Matrix;
    /**
     * 各項の整数を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testInteger(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の複素整数を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testComplexInteger(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の 0 を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testZero(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の 1 を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testOne(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の複素数を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testComplex(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の実数を判定
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testReal(epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 各項の非数を判定
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testNaN(): Matrix;
    /**
     * real(x) > 0
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testPositive(): Matrix;
    /**
     * real(x) < 0
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testNegative(): Matrix;
    /**
     * real(x) >= 0
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testNotNegative(): Matrix;
    /**
     * 各項の無限を判定
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testInfinite(): Matrix;
    /**
     * 各項の有限数を判定
     * @returns {Matrix} 1 or 0 で構成された行列
     */
    testFinite(): Matrix;
    /**
     * 絶対値
     * @returns {Matrix} abs(A)
     */
    abs(): Matrix;
    /**
     * 複素共役行列
     * @returns {Matrix} real(A) - imag(A)j
     */
    conj(): Matrix;
    /**
     * 負数
     * @returns {Matrix} -A
     */
    negate(): Matrix;
    /**
     * 平方根
     * @returns {Matrix} sqrt(A)
     */
    sqrt(): Matrix;
    /**
     * 対数
     * @returns {Matrix} log(A)
     */
    log(): Matrix;
    /**
     * 指数
     * @returns {Matrix} exp(A)
     */
    exp(): Matrix;
    /**
     * sin
     * @returns {Matrix} sin(A)
     */
    sin(): Matrix;
    /**
     * cos
     * @returns {Matrix} cos(A)
     */
    cos(): Matrix;
    /**
     * tan
     * @returns {Matrix} tan(A)
     */
    tan(): Matrix;
    /**
     * atan
     * @returns {Matrix} atan(A)
     */
    atan(): Matrix;
    /**
     * atan2
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - スカラー
     * @returns {Matrix} atan2(Y, X)
     */
    atan2(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * floor
     * @returns {Matrix} floor(A)
     */
    floor(): Matrix;
    /**
     * ceil
     * @returns {Matrix} ceil(A)
     */
    ceil(): Matrix;
    /**
     * 四捨五入
     * @returns {Matrix} round(A)
     */
    round(): Matrix;
    /**
     * 整数化
     * @returns {Matrix} fix(A)
     */
    fix(): Matrix;
    /**
     * 小数部の抽出
     * @returns {Matrix} fract(A)
     */
    fract(): Matrix;
    /**
     * sinc
     * @returns {Matrix} sinc(A)
     */
    sinc(): Matrix;
    /**
     * 行列を時計回りに回転
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} rot_90_count - 回転する回数
     * @returns {Matrix} 処理実行後の行列
     */
    rot90(rot_90_count: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列を拡張、拡張した項は、0で初期化
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} row_length - 新しい行の長さ
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} column_length - 新しい列の長さ
     * @returns {Matrix} 処理実行後の行列
     */
    resize(row_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, column_length: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列内の行を消去
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_row_index - 行番号
     * @returns {Matrix} 処理実行後の行列
     */
    deleteRow(delete_row_index: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列内の列を消去
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} delete_column_index - 列番号
     * @returns {Matrix} 処理実行後の行列
     */
    deleteColumn(delete_column_index: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列内の行を交換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index1 - 行番号1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_row_index2 - 行番号2
     * @returns {Matrix} 処理実行後の行列
     */
    exchangeRow(exchange_row_index1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, exchange_row_index2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列内の列を交換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index1 - 行番号1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} exchange_column_index2 - 行番号2
     * @returns {Matrix} 処理実行後の行列
     */
    exchangeColumn(exchange_column_index1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, exchange_column_index2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の右に行列を結合
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} left_matrix - 結合したい行列
     * @returns {Matrix} 処理実行後の行列
     */
    concatLeft(left_matrix: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 行列の下に行列を結合
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} bottom_matrix - 結合したい行列
     * @returns {Matrix} 処理実行後の行列
     */
    concatBottom(bottom_matrix: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 転置行列
     * @returns {Matrix} A^T
     */
    transpose(): Matrix;
    /**
     * エルミート転置行列
     * @returns {Matrix} A^T
     */
    ctranspose(): Matrix;
    /**
     * エルミート転置行列
     * @returns {Matrix} A^T
     */
    T(): Matrix;
    /**
     * ドット積
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] 計算するときに使用する次元（1 or 2）
     * @returns {Matrix} A・B
     */
    inner(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * LUP分解
     * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
     */
    lup(): any;
    /**
     * LU分解
     * @returns {{L: Matrix, U: Matrix}} L*U=A
     */
    lu(): any;
    /**
     * 一次方程式を解く
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
     * @returns {Matrix} Ax=B となる x
     */
    linsolve(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * QR分解
     * @returns {{Q: Matrix, R: Matrix}} Q*R=A, Qは正規直行行列、Rは上三角行列
     */
    qr(): any;
    /**
     * 対称行列の三重対角化
     * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
     */
    tridiagonalize(): any;
    /**
     * 対称行列の固有値分解
     * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
     */
    eig(): any;
    /**
     * 特異値分解
     * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
     */
    svd(): any;
    /**
     * 逆行列
     * @returns {Matrix} A^-1
     */
    inv(): Matrix;
    /**
     * 疑似逆行列
     * @returns {Matrix} A^+
     */
    pinv(): Matrix;
    /**
     * 対数ガンマ関数
     * @returns {Matrix}
     */
    gammaln(): Matrix;
    /**
     * ガンマ関数
     * @returns {Matrix}
     */
    gamma(): Matrix;
    /**
     * 不完全ガンマ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {string} [tail="lower"] - lower/upper
     * @returns {Matrix}
     */
    gammainc(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * ガンマ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    gampdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ガンマ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    gamcdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ガンマ分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    gaminv(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
     * @returns {Matrix}
     */
    beta(y: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 不完全ベータ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @param {string} [tail="lower"] - lower/upper
     * @returns {Matrix}
     */
    betainc(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * ベータ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betacdf(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betapdf(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    betainv(a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * x! 階乗関数
     * @returns {Matrix}
     */
    factorial(): Matrix;
    /**
     * nCk 二項係数またはすべての組合わせ
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
     * @returns {Matrix}
     */
    nchoosek(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 誤差関数
     * @returns {Matrix}
     */
    erf(): Matrix;
    /**
     * 相補誤差関数
     * @returns {Matrix}
     */
    erfc(): Matrix;
    /**
     * 正規分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    normpdf(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    normcdf(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    norminv(u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    tpdf(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    tcdf(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    tinv(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 尾部が指定可能なt分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
     * @returns {Matrix}
     */
    tdist(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tails: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 両側検定時のt分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    tinv2(v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    chi2pdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    chi2cdf(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    chi2inv(k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    fpdf(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    fcdf(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    finv(d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 最大値
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} max([A, B])
     */
    max(type?: any): Matrix;
    /**
     * 最小値
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} min([A, B])
     */
    min(type?: any): Matrix;
    /**
     * 合計
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    sum(type?: any): Matrix;
    /**
     * 相加平均
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    mean(type?: any): Matrix;
    /**
     * 配列の積
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    prod(type?: any): Matrix;
    /**
     * 相乗平均／幾何平均
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    geomean(type?: any): Matrix;
    /**
     * 中央値
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    median(type?: any): Matrix;
    /**
     * 最頻値
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    mode(type?: any): Matrix;
    /**
     * 中心積率
     * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
     * @returns {Matrix}
     */
    moment(type?: any): Matrix;
    /**
     * 分散
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    var(type?: any): Matrix;
    /**
     * 標準偏差
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    std(type?: any): Matrix;
    /**
     * 標準偏差
     * @param {{dimension : (?string|?number), algorithm : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    mad(type?: any): Matrix;
    /**
     * 歪度
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    skewness(type?: any): Matrix;
    /**
     * 共分散行列
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    cov(type?: any): Matrix;
    /**
     * 標本の標準化
     * 平均値0、標準偏差1に変更する
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    normalize(type?: any): Matrix;
    /**
     * 相関行列
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    corrcoef(type?: any): Matrix;
    /**
     * ソート
     * @param {{dimension : (?string|?number), order : ?string}} [type]
     * @returns {Matrix}
     */
    sort(type?: any): Matrix;
    /**
     * 離散フーリエ変換
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} fft(x)
     */
    fft(type?: any): Matrix;
    /**
     * 逆離散フーリエ変換
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} ifft(x)
     */
    ifft(type?: any): Matrix;
    /**
     * パワースペクトル密度
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} abs(fft(x)).^2
     */
    powerfft(type?: any): Matrix;
    /**
     * 離散コサイン変換
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} dct(x)
     */
    dct(type?: any): Matrix;
    /**
     * 逆離散コサイン変換
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} idct(x)
     */
    idct(type?: any): Matrix;
    /**
     * 2次元の離散フーリエ変換
     * @returns {Matrix}
     */
    fft2(): Matrix;
    /**
     * 2次元の逆離散フーリエ変換
     * @returns {Matrix}
     */
    ifft2(): Matrix;
    /**
     * 2次元の離散コサイン変換
     * @returns {Matrix}
     */
    dct2(): Matrix;
    /**
     * 2次元の逆離散コサイン変換
     * @returns {Matrix}
     */
    idct2(): Matrix;
    /**
     * 畳み込み積分、多項式乗算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number
     * @returns {Matrix}
     */
    conv(number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 自己相関関数、相互相関関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [number] - 省略した場合は自己相関関数
     * @returns {Matrix}
     */
    xcorr(number?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 窓関数
     * @param {string} name - 窓関数の名前
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static window(name: string, size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * ハニング窓
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static hann(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * ハミング窓
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static hamming(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
}

/**
 * Matrix用の線形代数用の計算クラス
 */
declare class LinearAlgebra {
    /**
     * ドット積
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} A
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} B
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [dimension=1] 計算するときに使用する次元（1 or 2）
     * @returns {Matrix} A・B
     */
    static inner(A: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, B: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, dimension?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * pノルム
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    static norm(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * 条件数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [p=2]
     * @returns {number}
     */
    static cond(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, p?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * 1ノルムの条件数の逆数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {number}
     */
    static rcond(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * ランク
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [epsilon] - 誤差
     * @returns {number} rank(A)
     */
    static rank(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, epsilon?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): number;
    /**
     * トレース
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {Complex}
     */
    static trace(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Complex;
    /**
     * 行列式
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat
     * @returns {Matrix} |A|
     */
    static det(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * LUP分解
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{P: Matrix, L: Matrix, U: Matrix}} P'*L*U=A
     */
    static lup(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * LU分解
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{L: Matrix, U: Matrix}} L*U=A
     */
    static lu(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * 連立一次方程式を解く
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} number - B
     * @returns {Matrix} Ax=B となる x
     * @todo 安定化のためQR分解を用いた手法に切り替える。あるいはlup分解を使用した関数に作り替える。
     */
    static linsolve(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, number: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * QR分解
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{Q: Matrix, R: Matrix}}  Q*R=A, Qは正規直行行列、Rは上三角行列
     */
    static qr(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * 対称行列の三重対角化
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{P: Matrix, H: Matrix}} P*H*P'=A, Hは三重対角行列、Pは正規直行行列、三重対角行列の固有値は元の行列と一致
     */
    static tridiagonalize(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * 対称行列の固有値分解
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{V: Matrix, D: Matrix}} V*D*V'=A, Vは右固有ベクトルを列にもつ行列で正規直行行列、Dは固有値を対角成分に持つ行列
     * @todo 対称行列しか対応できていないので、対称行列ではないものはQR分解を用いた手法に切り替える予定。
     */
    static eig(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * 特異値分解
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {{U: Matrix, S: Matrix, V: Matrix}} U*S*V'=A
     */
    static svd(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): any;
    /**
     * 逆行列
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {Matrix} A^-1
     */
    static inv(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 疑似逆行列
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} mat - A
     * @returns {Matrix} A^+
     */
    static pinv(mat: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
}

/**
 * 乱数を初期化する
 * @param {number} [seed] - 乱数のシード値、指定しない場合は時刻から作成する
 */
declare class Random {
    constructor(seed?: number);
    /**
     * 内部データをシャッフル
     */
    _rnd521(): void;
    /**
     * 乱数を初期化する
     * @param {number} seed
     */
    setSeed(seed: number): void;
    /**
     * 32ビットの乱数
     * @returns {number} - 32ビットの乱数
     */
    genrand_int32(): number;
    /**
     * 指定したビット数の乱数
     * @param {number} bits - 必要なビット数（64まで可能）
     * @returns {number}
     */
    next(bits: number): number;
    /**
     * 指定したサイズの8ビットの乱数
     * @param {number} size - 必要な長さ
     * @returns {Array<number>}
     */
    nextBytes(size: number): number[];
    /**
     * 16ビットの乱数
     * @returns {number}
     */
    nextShort(): number;
    /**
     * 32ビットの乱数
     * @param {number} [x] - 指定した値未満の数値を作る
     * @returns {number}
     */
    nextInt(x?: number): number;
    /**
     * 64ビットの乱数
     * @returns {number}
     */
    nextLong(): number;
    /**
     * 正負の乱数
     * @returns {boolean}
     */
    nextBoolean(): boolean;
    /**
     * 0 <= x < 1 のFloat(23ビット)乱数
     * @returns {number}
     */
    nextFloat(): number;
    /**
     * 0 <= x < 1 のDouble(52ビット)乱数
     * @returns {number}
     */
    nextDouble(): number;
    /**
     * 平均値0、標準偏差1のガウシアン分布に基づく乱数
     * @returns {number}
     */
    nextGaussian(): number;
}

/**
 * Matrix用の信号処理用の計算クラス
 */
declare class Signal {
    /**
     * 離散フーリエ変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} fft(x)
     */
    static fft(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 逆離散フーリエ変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} ifft(X)
     */
    static ifft(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * パワースペクトル密度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} abs(fft(x)).^2
     */
    static powerfft(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 離散コサイン変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} dct(x)
     */
    static dct(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 逆離散コサイン変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} idct(x)
     */
    static idct(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 2次元の離散フーリエ変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static fft2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 2次元の逆離散フーリエ変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @returns {Matrix}
     */
    static ifft2(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 2次元のDCT変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static dct2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 2次元の逆DCT変換
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} X
     * @returns {Matrix}
     */
    static idct2(X: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 畳み込み積分、多項式乗算
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x2
     * @returns {Matrix}
     */
    static conv(x1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, x2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 自己相関関数、相互相関関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x1
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [x2] - 省略した場合は自己相関関数
     * @returns {Matrix}
     */
    static xcorr(x1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, x2?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 窓関数
     * @param {string} name - 窓関数の名前
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static window(name: string, size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * ハニング窓
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static hann(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
    /**
     * ハミング窓
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} size - 長さ
     * @param {string|number} [periodic="symmetric"] - 0/"symmetric", 1/"periodic"
     * @returns {Matrix} 列ベクトル
     */
    static hamming(size: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, periodic?: string | number): Matrix;
}

/**
 * Matrix用の統計処理用の計算クラス
 */
declare class Statistics {
    /**
     * 対数ガンマ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static gammaln(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ガンマ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static gamma(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 不完全ガンマ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {string} [tail="lower"] - lower/upper
     * @returns {Matrix}
     */
    static gammainc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * ガンマ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    static gampdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ガンマ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    static gamcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ガンマ分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 形状母数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} s - 尺度母数
     * @returns {Matrix}
     */
    static gaminv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} y
     * @returns {Matrix}
     */
    static beta(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, y: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 不完全ベータ関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @param {string} [tail="lower"] - lower/upper
     * @returns {Matrix}
     */
    static betainc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tail?: string): Matrix;
    /**
     * ベータ分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betacdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betapdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * ベータ分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} a
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} b
     * @returns {Matrix}
     */
    static betainv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, a: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, b: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * x! 階乗関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static factorial(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * nCk 二項係数またはすべての組合わせ
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k
     * @returns {Matrix}
     */
    static nchoosek(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 誤差関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static erf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 相補誤差関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @returns {Matrix}
     */
    static erfc(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    static normpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    static normcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 正規分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [u=0.0] - 平均値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} [s=1.0] - 分散
     * @returns {Matrix}
     */
    static norminv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, u?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, s?: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    static tpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    static tcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * t分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    static tinv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 尾部が指定可能なt分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} tails - 尾部(1...片側、2...両側)
     * @returns {Matrix}
     */
    static tdist(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, tails: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 両側検定時のt分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} v - 自由度
     * @returns {Matrix}
     */
    static tinv2(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, v: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    static chi2pdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    static chi2cdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * カイ二乗分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} k - 自由度
     * @returns {Matrix}
     */
    static chi2inv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, k: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の確率密度関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    static fpdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の累積分布関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    static fcdf(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * F分布の累積分布関数の逆関数
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d1 - 分子の自由度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} d2 - 分母の自由度
     * @returns {Matrix}
     */
    static finv(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d1: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, d2: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any): Matrix;
    /**
     * 最大値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} max([A, B])
     */
    static max(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 最小値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix} min([A, B])
     */
    static min(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 合計
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static sum(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 相加平均
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static mean(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 配列の積
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static prod(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 相乗平均／幾何平均
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static geomean(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 中央値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static median(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 最頻値
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static mode(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 中心積率
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number, nth_order : number}} [type]
     * @returns {Matrix} n次のモーメント、2で分散の定義と同等。
     */
    static moment(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 分散
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static var(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 標準偏差
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static std(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 絶対偏差
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), algorithm : (?string|?number)}} [type]
     * @returns {Matrix}
     */
    static mad(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 歪度
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static skewness(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 共分散行列
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static cov(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 標本の標準化
     * 平均値0、標準偏差1に変更する
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static normalize(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * 相関行列
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), correction : ?number}} [type]
     * @returns {Matrix}
     */
    static corrcoef(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
    /**
     * ソート
     * @param {Matrix|Complex|number|string|Array<string|number|Complex>|Array<Array<string|number|Complex>>|Object} x
     * @param {{dimension : (?string|?number), order : ?string}} [type]
     * @returns {Matrix}
     */
    static sort(x: Matrix | Complex | number | string | (string | number | Complex)[] | (string | number | Complex)[][] | any, type?: any): Matrix;
}

