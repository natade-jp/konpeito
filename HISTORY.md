# History

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

