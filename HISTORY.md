# History

## v0.1.X
- BigDecimal clip の戻り値のコメントが誤っていたのを修正
- 型定義ファイルで戻り値が「any」となっていた部分を修正
- デバッグ用のクラス Log を削除
- 英語に翻訳中（247/1479）

## v0.1.10
- arange, crip, circshift, roll, fftshift, reshape, indexsort 追加
- concatRight のメソッド名が concatLeft になっていたのを修正

## v0.1.9
- 型定義ファイルを自動作成するように設定
- buildデータに圧縮前のデータも含めるように設定
- JSDocコメントが誤っている部分などを修正
- インストール／ビルド用のメモを作成

## v0.1.8
- テスト整備完了
- hann, hamming の戻り値が行列ではなく配列になっていたのを修正
- コンパイル用のスクリプトをリファクタリング
- ESDoc で作成したドキュメントのサイズを削減
- ESDoc でエラーとなるが @ts-check でエラーにならないコードに変更
- 上記に合わせて ESDoc 用のバッチをドキュメント作成用のスクリプトに埋め込み
- ドキュメントのフォルダ名を docs に変更

## v0.1.7
- Signal fft, ifft, dct, idct, powerfft 実行する次元の方向を選択できるように修正
- Signal xcorr 計算するベクトル同士の長さが異なる場合に、0挿入するように修正
- ドキュメントを "ESDoc Hosting Service"から"GitHub Pages"に移動

## v0.1.6
- Statistics テストコード用の実装が混じっていたのを削除(Math.StatisticsTool = StatisticsTool)
- Statistics mad 中央絶対偏差を計算できるように修正
- Statistics skewness 補正のパラメータが無効だったのを修正
- Statistics sort 降順ソートが上手く動作していなかったのを修正
- Complex pow 結果が実数にも関わらず複素数として計算する場合があるのを修正

## v0.1.5
- Travis CIでの自動テスト実行を設定
- README.md にバッチ追加
- Matrix eachVectorRow 関数が正しく機能していなかった問題を修正
- Matrix eachVectorBoth 入力と出力の行列のサイズが等しくない場合にエラーが発生する問題を修正
- Matrix にあった max と min を Statistics へ移動。引数で方向を設定できるように変更
- Complex _toInteger 戻り値を return ではなく throw にしていた不具合を修正
- Statistics gaminv 引数によって正しく計算できない場合がある問題を修正
- Statistics betainv 自由度によって正しく計算できない場合がある問題を修正
- Statistics betainv p=0のときに、0を返さずNaNを返していた問題を修正
- Statistics betapdf NaNをかえす場合は0を返すように修正
- Statistics chi2pdf x=0のときに、0.5を返さず0.0を返していた問題を修正
- Statistics fpdf x=0のときに、0を返さずNaNを返していた問題を修正

## v0.1.4
- Matrix create 文字列の非数、無限大の入力に対応
- Matrix equals ベクトル（スカラ・行列除く）同士の比較方法が誤っていたのを修正
- Matrix isPermutation [0 0 1;1 0 0;0 0 0]を置換行列と誤判定する問題を修正
- Complex create 文字列の非数、無限大の入力に対応
- Complex getDecimalPosition 非数、無限大に対応

## v0.1.3
- バッチ用スクリプトのフォルダ構成を整理
- Matrix 無限大、非数が入っていると正しく表示できない問題を修正
- Matrix equals スカラー値同士の比較時に誤差を指定できない問題を修正
- Matrix isIdentity 正方行列以外でも正しく動作するように修正
- Matrix isTridiagonal 正方行列の制限を撤去
- Matrix 置換行列、上三角行列、下三角行列の判定を追加
- Matrix 1行の文字列で出力する toOneLineString を追加
- Matrix コンストラクタをリファクタリング
- Matrix 単位行列を判定方法の誤りを修正
- Matrix resize を実行すると必ずエラーが発生していた問題を修正
- LinearAlgebra norm 列ベクトルの1ノルム、2ノルム、一般化pノルムなどに不具合があったのを修正
- LinearAlgebra rank 正方行列以外の行列で誤る場合があったのを修正
- LinearAlgebra qr 零行列を入れるとエラーが発生するのを修正
- LinearAlgebra eig 固有値の順番が異常になっていたのを修正
- LinearAlgebra svd 零行列を入れるとエラーが発生するのを修正
- LinearAlgebra cond 零行列、及びベクトルを入れると正しくない値がかえるのを修正

## v0.1.2
- Jest 導入
- Matrix 系以外についてテストを追加
- Matrix 行列の割り算で割る値がランク落ちしている場合でも割れるように修正
- Matrix 行列の累乗（整数のみ対応）を追加
- LinearAlgebra 条件数及びその逆数を追加
- Statistics 歪度を追加
- Statistics 中心積率を追加
- Statistics 平均偏差を追加
- Statistics prodを追加
- Statistics geomeanの計算方法の誤りを修正
- BigInteger デフォルトの乱数を設定できる機能を追加
- BigInteger 素数判定のアルゴリズムを変更
- Complex compareTo 見直し
- Complex log(-1)の計算結果が誤っていたのを修正
- Complex arg(-1)の計算結果が誤っていたのを修正
- Complex isComplex, isComplexInteger 関数の説明が分かりにくい部分を修正
- Complex squareの複素数を入力したときの値が誤っていたのを修正
- Complex sinc関数を非正規化 sinc 関数から、正規化 sinc 関数に変更

## v0.1.1
- 全体 ドキュメントの整備
- 全体 リファクタリング
- 全体 @ts-check 追加 (import文の部分だけはどうしてもエラーが出て直せなかったのでとりあえず無視)
- Complex 定数を追加
- BigInteger 否定論理和を追加
- BigInteger 階乗関数を追加
- 全オブジェクトで足りないメソッドを追加、及びメソッド名の統一（intValue, doubleValueなど）
- 偏角をangleからargへ統一
- フォルダ名をリファクタリング
- LinearAlgebra LU分解を追加
- LinearAlgebra 行列式を高速化

## v0.1.0
- npm 公開
- バージョン管理開始

