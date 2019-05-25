# History

## v0.1.X
- Jest 導入
- Matrix 行列の割り算で割る値がランク落ちしている場合でも割れるように修正
- Matrix 行列の累乗（整数のみ対応）を追加
- LinearAlgebra 条件数及びその逆数を追加
- Statistics 歪度を追加
- Statistics 中心積率を追加
- Statistics 平均偏差を追加
- Statistics prodを追加
- Statistics geomeanの計算方法の誤りを修正

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

