# History

## v5.2.0
### 機能追加
- `BigInteger`, `BigDecimal`, `Fraction`, `Complex`, `Matrix` 間で値の変更ができる共通メソッドを追加
### 改善
- `BigInteger` の`longValue`が需要がないと思うためを非推奨
- `Complex`, `Matrix` から数値へ変換した場合に計算誤差を除去する動作へ変更
### 不具合
- `Matrix`, `Complex` にて、`Tool`クラスから`private`メソッドを呼んでエラーが出ていたのを修正

## v5.1.0
### 機能追加
- `Probability` に二項分布とポアソン分布の分布関数、密度関数、逆密度関数を追加
- IEでも実行できるように互換性向上用の`Polyfill`クラスを追加
### 改善
- `Probability` のいくつかの関数で非数を入力したときに正常な値を返せなかったのを修正
### 不具合
- `Probability` の `nchoosek` で巨大な値を入力すると非数で返ってしまう不具合を修正

## v5.0.1
### 変更
- 不要なデータが入っていたのを削除

## v5.0.0
### 機能追加
- `MathContext`, `Random` クラスに `create` メソッドを追加
- `MathContext` クラスに `increasePrecision`, `decreasePrecision` メソッドを追加
- `BigDecimal` クラスに `pushDefaultContext`, `popDefaultContext` メソッドを追加
- `BigDecimal` クラスに乱数作成 `rand`, `randn` を追加
- `BigInteger`, `BigDecimal`, `Complex`, `Matrix` クラスに立方根 `cbrt` を追加
- `BigInteger`, `BigDecimal`, `Complex`, `Matrix` クラスに `log2`, `log10` を追加
- `BigDecimal`, `Complex`, `Matrix` クラスに `expm1`, `log1p` を追加
### 改善
- `BigDecimal` クラスの `PI`, `E` で `MathContext.DECIMAL256` の精度までは計算済みの値を返すようにして高速化
- `Matrix`, `Complex` クラスの `rand`, `randn` の引数に乱数を設定できるように改善
- `Matrix` の `pow` について、値がスカラー値の場合は引数に実数を許可するように改善
- 32ビットの整数演算をビルドイン関数 `Math.imul` を利用するように変更
### 変更
- `BigDecimal` クラスの各メソッドで `MathContext` を引数に取ることができるようになっていたのを仕様シンプル化及び高速化のため `div` を除いて削除しました
### 不具合
- `BigDecimal` の無限精度で割り切れない値で `inv` 関数を使用すると非常に重たくなりフリーズする可能性がある不具合を修正
- `Complex` の `compareTo` で非数を比較した場合に正しい結果を返さない場合がある不具合を修正

## v4.1.0
### 改善
- `Complex` に `mod` しか実装されていなかったのを `rem` と `mod` を追加 
- その他、利用できるメソッドの統一化

## v4.0.2
### 改善
- `BigInteger` の非数や無限の対応強化
- `Fraction` に素数系関数を追加
- `Fraction` に `mod` しか実装されていなかったのを `rem` と `mod` を追加 
### 不具合
- `BigDecimal` に `mod` で被除と被除数の符号によって値が異常だった不具合を修正
- `v4.0.0` から内部のデバッグが有効になっており `Fraction` が利用できなかった不具合を修正

## v4.0.1
### 不具合
- `BigInteger` で `0` を掛け算した後に `-0` という内部データを持ってしまうデグレ(`v4.0.0`)を修正

## v4.0.0
### 機能追加
- `BigInteger`, `BigDecimal`, `Fraction`, `Complex` の引数に`boolean`型(`1` or `0`)を入力できる機能追加
- `BigInteger`, `BigDecimal`, `Fraction`, `Complex`, `Matrix` に `booleanValue` を実装
- `BigInteger` に `isPrime` を追加
- `BigInteger`, `BigDecimal`, `Fraction` に `NaN`, `Infinity` を実装、テストする関数も追加
- `BigDecimal` に双曲線関数、ビット演算、素数判定を追加
- `Complex` / `Matrix` に `isPositiveInfinity`, `isNegativeInfinity` を追加
### 改善
- `/core/tools/` 内で`Matrix`のメソッドチェーンからしか利用できないクラスについてクラス説明文に記載
- `README.md` にスパース行列に対応していないことを明記
- ファイルやフォルダの位置を整理
### 変更
- `BigInteger` を整理し `orNot`, `andNot` を削除
- `BigDecimal` の `inv` に `0` を入れた場合の処理を追加
- `BigDecimal` の `rsqrt` に`x <= 0`の数値を入れた場合の処理を追加
- `BigDecimal` の `sqrt` に`x < 0`の数値を入れた場合の処理を追加
### 不具合
- `BigInteger` に `mod` で被除と被除数の符号によって値が異常だった不具合を修正
- `BigInteger` の `isProbablePrime` の入力に`0`を入れると素数であると判定する不具合を修正
- `BigInteger` の `isProbablePrime` の入力に`x < 0`の値を入れるとフリーズする不具合を修正
- `BigDecimal` の `pow` の整数入力時の計算結果が無限精度になる不具合を修正
- `BigDecimal` の `pow` で `0` の `x` 乗が `1` になっていた不具合を修正
- `Complex` の `sign` に `NaN`を入れたときの動作が誤っていたのを修正

## v3.0.0
### 機能追加
- `Probability` に `erfinv`, `erfcinv` を追加
- `Matrix` に重回帰分析 `MultipleRegressionAnalysis` を追加
- `Matrix` に `height` と `width` を追加
- `Matrix` に `Complex` と同様の定数を追加
### 改善
- `Matrix` の文字列での初期化時に`'`をつけて転置行列として初期化できる機能を追加
- `Statistics` の `cov` に共分散を求める機能を追加
- `Statistics` の `corrcoef ` に相関係数を求める機能を追加
- `Matrix` の `size` に引数を追加して行か、列を直接取得できるように変更
### 変更
- 翻訳を正しい翻訳に変更 正規化`normalize`から標準化を示す`standardization`に変更
- `DataAnalysis` クラスを追加のためファイルやフォルダの場所を整備しました
### 不具合
- `Probability` の `tdist` の引数にマイナスの値を入れると誤った確率値を出す不具合を修正

## v2.0.0
### 機能追加
- `Random`に、Xorshiftを追加しアルゴリズムを選択できるように変更。
これにより、デフォルトをXorshiftにしたため、乱数の初期化方法が変わり互換性がなくなるため、Ver2系とします。
### 改善
- ビルドしたスクリプトにバージョン情報を表記する
- 引数のパラメータを`@typedef`を用いて、まとめるように改善
### 変更
- 開発用外部パッケージを更新
- `@ts-check`でエラーになっていた箇所を修正
- `@typedef`で作成していたパラメータ名を被らないように最初にKをつけるようにした。

## v1.3.5
### 変更
- `dependencies` に入っていた `eslint` を `devDependencies` に移動

## v1.3.4
### 変更
- `package.json` の `main` で指定しているファイルを、UMD形式からCommonJS形式に変更

## v1.3.3
### 変更
- `build`フォルダ内のファイル名を変更

## v1.3.2
### 変更
- 開発用外部パッケージを更新

## v1.3.1
### 変更
- `package.json`内のtypes指定による型定義を削除

## v1.3.0
### 改善
- 元々VSCodeで未対応だった「`mjs`」拡張子を、対応している「`js`」形式に変更しました。
これにより、module形式で利用が出来なくなりますが、`build`内の`mjs`拡張子のファイルを使用すれば問題ありません。
- npmパッケージでは不要だったsrcフォルダを削除しました。

## v1.2.1
### 不具合
- 引数のコメントの付け方に誤りがあったのを修正

## v1.2.0
### 機能追加
- `BigDecimal` に三角関数, 指数関数, `isInteger` を追加
- `Complex` に `QUARTER_PI`, `HALF_PI`, `TWO_PI` を追加
### 改善
- `BigDecimal` `isZero`, `isOne` に許容誤差を設定できるようにした
- 統計用のクラスを確率と統計に切り分けしました。
### 不具合
- `BigDecimal` `mod` の計算時に `undefined` を返す場合があったのを修正
- `BigDecimal` `inv` の計算時に負の値を入れると計算が終わらない問題を修正

## v1.1.0
### 機能追加
- `BigInteger`  に `sqrt`, `square` を追加
- `BigDecimal` に `inv`, `sqrt`, `rsqrt`, `square`, `pi`, `e` を追加
- `Complex` に `rsqrt` を追加
### 仕様変更
- `BigDecimal` の作成時に `default_context` の設定を行えないようにしました。代わりに新規作成時の`context`の設定がデフォルトとなります。
### 改善
- `BigDecimal` `div` 引数を強化及び、詳細なコメントを追加
- `MathContext.DECIMAL256` の定義を追加
### 不具合
- `BigDecimal` `div` 引数の設定が正しく反映されない場合がある問題を修正
- `Signal`.FFTの計算キャッシュが効いていない問題を修正

## v1.0.0
### 機能追加
- `Fraction`.を追加
- `BigInteger`  `lcm` 最小公倍数を求める計算を追加
- `BigDecimal` `isNegative`, `isZero`, `isOne`, `isPositive`, `isNotNegative`, `floor`, `ceil`, `fix`, `fract`, `factorial` を追加
- `BigInteger`  `isOne`, `isNotNegative`, `scaleByPowerOfTen`.を追加
- `BigDecimal` の `equals`, `compareTo` に許容誤差を設定できる機能を追加
- `BigDecimal` の `round` の引数を省略した場合は、一般的な小数点以下を四捨五入する動作とする機能を追加
### 改善
- `BigInteger` , `BigDecimal` 「`-1`」の定数を追加
- `BigInteger`  作成時の引数に `BigDecimal` を入れた場合を対応
- `BigInteger`  戻り値のコメントに未翻訳があった場所を修正
- `BigDecimal` の引数に`Number`型の浮動小数点で初期化した場合に、小数点の最も下位の桁のみ四捨五入するように動作を変更
- `Matrix` 引数でメンバーの省略が可能なオブジェクトの指定に `typedef` で独自型を定義するように修正
- 引数に `epsilon` と記載されている変数名をより意味合いに近い `tolerance` に変更
- `d.ts` ファイルの中のクラス名を他と被らないように修正
- 「`x | 0`」としている部分の多くを「`Math.trunc`」に置き換え
- `BigInteger` , `BigDecimal`, `Fraction`, `Complex`, `Matrix` 互換性用のテストケースを追加
### 不具合
- `BigDecimal` `divid` で1度計算した後の結果のデフォルト環境設定が `UNLIMITED`.に設定されてしまうバグを修正
- `Matrix`, `Complex` `valueOf`.メソッドが正しく動作していない問題を修正
- `BigDecimal` `pow` の引数の条件判定で計算できるのにエラーで返す場合があったのを修正
- `fract` の動作が、 `x - trunc(x)` となっていたのを修正。ただしくは、 `x - floor(x)`

## v0.1.15
- ignoreリストを見直し
- `Matrix` `nmul`, `ndiv`, `ninv`, `npow` を廃止予定にし、`dotmul`, `dotdiv`, `dotinv`, `dotpow` を追加

## v0.1.14
- `BigInteger`  `and`, `or`, `xor` の計算後に`equals`の結果が誤る場合がある問題を修正
- `BigInteger`  xorの計算結果が異常な値になっていた問題を修正
- `BigInteger`  テストケース見直し

## v0.1.13
- `BigInteger`  の引数で「`12300e-1`」の文字列でも初期化ができるように修正。
- ドキュメント（jsdoc）をリファクタリング。記載誤りの修正。

## v0.1.12
- `BigInteger`  の引数に指数表記の文字列を対応
- `BigInteger`  の引数にNumber型で、`1e20`より大きな数値で初期化した際に、正しく取得できなかった問題を修正
- `BigInteger`  の引数で文字列を入れた場合に、「`0`」から始めると8進数とみなす仕様を「`0o`」に変更
- `BigDecimal` の引数にNumber型の浮動小数点で初期化すると、誤差が大きくなってしまう場合がある問題を修正

## v0.1.11
- `BigDecimal` `clip` の戻り値のコメントが誤っていたのを修正
- 型定義ファイルで戻り値が「`any`」となっていた部分を修正
- デバッグ用のクラス `Log` を削除
- ドキュメント（jsdoc）を英語に翻訳

## v0.1.10
- `arange`, `crip`, `circshift`, `roll`, `fftshift`, `reshape`, `indexsort` 追加
- `concatRight`.のメソッド名が `concatLeft` になっていたのを修正

## v0.1.9
- 型定義ファイルを自動作成するように設定
- buildデータに圧縮前のデータも含めるように設定
- JSDocコメントが誤っている部分などを修正
- インストール／ビルド用のメモを作成

## v0.1.8
- テスト整備完了
- `hann`, `hamming` の戻り値が行列ではなく配列になっていたのを修正
- コンパイル用のスクリプトをリファクタリング
- ESDoc で作成したドキュメントのサイズを削減
- ESDoc でエラーとなるが`@ts-check`でエラーにならないコードに変更
- 上記に合わせて ESDoc 用のバッチをドキュメント作成用のスクリプトに埋め込み
- ドキュメントのフォルダ名を `docs` に変更

## v0.1.7
- `Signal`, `fft`, `ifft`, `dct`, `idct`, `powerfft` 実行する次元の方向を選択できるように修正
- `Signal`, `xcorr` 計算するベクトル同士の長さが異なる場合に、`0`挿入するように修正
- ドキュメントを ESDoc Hosting Service から GitHub Pages に移動

## v0.1.6
- `Statistics` テストコード用の実装が混じっていたのを削除(`Math.StatisticsTool = StatisticsTool`)
- `Statistics` `mad` 中央絶対偏差を計算できるように修正
- `Statistics` `skewness` 補正のパラメータが無効だったのを修正
- `Statistics` `sort` 降順ソートが上手く動作していなかったのを修正
- `Complex` `pow` 結果が実数にも関わらず複素数として計算する場合があるのを修正

## v0.1.5
- Travis CI での自動テスト実行を設定
- `README.md` にバッチ追加
- `Matrix` `eachVectorRow` 関数が正しく機能していなかった問題を修正
- `Matrix` `eachVectorBoth` 入力と出力の行列のサイズが等しくない場合にエラーが発生する問題を修正
- `Matrix` にあった `max` と `min` を `Statistics` へ移動。引数で方向を設定できるように変更
- `Complex` `_toInteger` 戻り値を `return` ではなく `throw` にしていた不具合を修正
- `Statistics` `gaminv` 引数によって正しく計算できない場合がある問題を修正
- `Statistics` `betainv` 自由度によって正しく計算できない場合がある問題を修正
- `Statistics` `betainv` `p=0`のときに、`0`を返さず`NaN`を返していた問題を修正
- `Statistics` `betapdf` `NaN`をかえす場合は`0`を返すように修正
- `Statistics` `chi2pdf` `x=0`のときに、`0.5`を返さず`0.0`を返していた問題を修正
- `Statistics` `fpdf` `x=0`のときに、`0`を返さず`NaN`を返していた問題を修正

## v0.1.4
- `Matrix` `create` 文字列の非数、無限大の入力に対応
- `Matrix` `equals` ベクトル（スカラ・行列除く）同士の比較方法が誤っていたのを修正
- `Matrix` `isPermutation` `[0 0 1;1 0 0;0 0 0]`を置換行列と誤判定する問題を修正
- `Complex` `create` 文字列の非数、無限大の入力に対応
- `Complex` `getDecimalPosition` 非数、無限大に対応

## v0.1.3
- バッチ用スクリプトのフォルダ構成を整理
- `Matrix` 無限大、非数が入っていると正しく表示できない問題を修正
- `Matrix` `equals` スカラー値同士の比較時に誤差を指定できない問題を修正
- `Matrix` `isIdentity` 正方行列以外でも正しく動作するように修正
- `Matrix` `isTridiagonal` 正方行列の制限を撤去
- `Matrix` 置換行列、上三角行列、下三角行列の判定を追加
- `Matrix` 1行の文字列で出力する `toOneLineString` を追加
- `Matrix` コンストラクタをリファクタリング
- `Matrix` 単位行列を判定方法の誤りを修正
- `Matrix` `resize` を実行すると必ずエラーが発生していた問題を修正
- `LinearAlgebra` `norm` 列ベクトルの1ノルム、2ノルム、一般化pノルムなどに不具合があったのを修正
- `LinearAlgebra` `rank` 正方行列以外の行列で誤る場合があったのを修正
- `LinearAlgebra` `qr` 零行列を入れるとエラーが発生するのを修正
- `LinearAlgebra` `eig` 固有値の順番が異常になっていたのを修正
- `LinearAlgebra` `svd` 零行列を入れるとエラーが発生するのを修正
- `LinearAlgebra` `cond` 零行列、及びベクトルを入れると正しくない値がかえるのを修正

## v0.1.2
- Jest 導入
- `Matrix` 系以外についてテストを追加
- `Matrix` 行列の割り算で割る値がランク落ちしている場合でも割れるように修正
- `Matrix` 行列の累乗（整数のみ対応）を追加
- `LinearAlgebra` 条件数及びその逆数を追加
- `Statistics` 歪度を追加
- `Statistics` 中心積率を追加
- `Statistics` 平均偏差を追加
- `Statistics` `prod` を追加
- `Statistics` `geomean` の計算方法の誤りを修正
- `BigInteger`  デフォルトの乱数を設定できる機能を追加
- `BigInteger`  素数判定のアルゴリズムを変更
- `Complex` `compareTo` 見直し
- `Complex` `log(-1)`の計算結果が誤っていたのを修正
- `Complex` `arg(-1)`の計算結果が誤っていたのを修正
- `Complex` `isComplex`, `isComplexInteger` 関数の説明が分かりにくい部分を修正
- `Complex` squareの複素数を入力したときの値が誤っていたのを修正
- `Complex` sinc関数を非正規化 `sinc` 関数から、正規化 `sinc` 関数に変更

## v0.1.1
- 全体 ドキュメントの整備
- 全体 リファクタリング
- 全体 `@ts-check` 追加 (`import`文の部分だけはどうしてもエラーが出て直せなかったのでとりあえず無視)
- `Complex` 定数を追加
- `BigInteger`  否定論理和を追加
- `BigInteger`  階乗関数を追加
- 全オブジェクトで足りないメソッドを追加、及びメソッド名の統一（`intValue`, `doubleValue`など）
- 偏角を`angle`から`arg`へ統一
- フォルダ名をリファクタリング
- `LinearAlgebra` LU分解を追加
- `LinearAlgebra` 行列式を高速化

## v0.1.0
- npm 公開
- バージョン管理開始

