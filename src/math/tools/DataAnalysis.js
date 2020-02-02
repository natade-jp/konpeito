/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Matrix from "../Matrix.js";

/**
 * Settings for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisSettings
 * @property {import("../Matrix.js").KMatrixInputData} samples explanatory variable (Each column is a parameters and each row is a samples.)
 * @property {import("../Matrix.js").KMatrixInputData} target response variable / actual values (column vector)
 * @property {boolean} [is_standardised=false] Use standardized partial regression coefficients.
 */

/**
 * Vector state
 * @typedef {Object} KMultipleRegressionAnalysisVectorState
 * @property {Matrix} df degree of freedom
 * @property {Matrix} SS sum of squares
 * @property {Matrix} MS unbiased_variance
 */

/**
 * Output for multiple regression analysis
 * @typedef {Object} KMultipleRegressionAnalysisOutput
 * @property {Matrix} q number of explanatory variables
 * @property {Matrix} n number of samples
 * @property {Matrix} partial_regression_coefficient partial regression coefficient (column vector)
 * @property {Matrix} bias bias
 * @property {Matrix} predicted_values predicted values (column vector)
 * @property {Matrix} sY Variance of predicted values of target variable
 * @property {Matrix} sy Variance of measured values of target variable
 * @property {Matrix} multiple_R Multiple R. Multiple correlation coefficient.
 * @property {Matrix} R_square R Square. Coefficient of determination.
 * @property {Matrix} adjusted_R_square Adjusted R Square. Adjusted coefficient of determination.
 * @property {KMultipleRegressionAnalysisVectorState} regression state of regression
 * @property {KMultipleRegressionAnalysisVectorState} residual state of residual error
 * @property {KMultipleRegressionAnalysisVectorState} total state of total
 * @property {Matrix} Ve Unbiased variance of residuals (Ve)
 * @property {Matrix} standard_error Standard error (SE)
 * @property {Matrix} regression_F F value. Dispersion ratio (F0)
 * @property {Matrix} regression_significance_F Significance F. Test with F distribution with q, n-q-1 degrees of freedom.(Probability of error.)
 * @property {Matrix} AIC Akaike's Information Criterion (AIC)
 */

export default class DataAnalysis {

	/**
	 * Multiple regression analysis
	 * @param {KMultipleRegressionAnalysisSettings} settings
	 * @returns {KMultipleRegressionAnalysisOutput}
	 */
	static MultipleRegressionAnalysis(settings) {
		//最小二乗法により重回帰分析する。
		//参考文献
		//[1] 図解でわかる多変量解析―データの山から本質を見抜く科学的分析ツール
		//    涌井 良幸, 涌井 貞美, 日本実業出版社 (2001/01)
		//[2] これならわかる Excelで楽に学ぶ多変量解析
		//    長谷川 勝也, 技術評論社 (2002/07)
		//[3] ど素人の「Excel 回帰分析」表の見方 (単回帰分析)
		//   http://atiboh.sub.jp/t07kaikibunseki.html
		//[4] 赤池の情報量基準（AIC）の計算方法
		//   http://software.ssri.co.jp/statweb2/tips/tips_10.html

		// samples 説明変量。行がサンプル。列が各値。
		// target  目的変量・実測値。縦ベクトル。
		// is_standardised trueで標準化偏回帰係数
		let samples = Matrix.create(settings.samples);
		let target = Matrix.create(settings.target);
		const set_unbiased = {correction : 1};
		const set_sample = {correction : 0};

		// 標準化偏回帰係数を調べるために平均0 分散1に正規化する
		if(settings.is_standardised) {
			samples = samples.standardization();
			target = target.standardization();
		}

		// 説明変量・説明変数の数 q
		const number_of_explanatory_variables = Matrix.create(samples.width);
		// 標本数(観測数) n
		const number_of_samples = Matrix.create(samples.height);

		// 共分散行列
		const S = samples.cov(set_sample);
		const S_rcond = S.rcond();
		// どこかの値に相関が非常に高いものがあり計算できない。
		if(S_rcond <= 1e-10) {
			console.log("Analysis failed due to highly correlated explanatory variables.(rcond : " + S_rcond + ")");
			return null;
		}

		// 目的変量との共分散(縦ベクトル)
		const y_array = [];
		const max = number_of_explanatory_variables.intValue;
		for(let i = 0; i < max; i++) {
			y_array[i] = samples.getMatrix(":", i).cov(target, set_sample);
		}
		const Y = Matrix.create(y_array);

		// 偏回帰係数(縦ベクトル)
		const partial_regression_coefficient =  S.inv().mul(Y);
		// バイアス・定数項・切片
		const bias = target.mean().sub(samples.mean().mul(partial_regression_coefficient));
		// 予測値(縦ベクトル)
		const predicted_values = samples.mul(partial_regression_coefficient).add(bias);
		// 目的変量の予測値の分散
		const sY = predicted_values.var(set_unbiased);
		// 目的変量の実測値の分散
		const sy = target.var(set_unbiased);
		// 重相関係数
		const multiple_R = predicted_values.corrcoef(target, set_unbiased);
		// 決定係数・寄与率
		const R_square = sY.div(sy);

		// 回帰
		const regression_df = number_of_explanatory_variables;					// 自由度
		const regression_SS = predicted_values.sub(target.mean()).dotpow(2).sum();	// 平方和(変動)・MSr
		const regression_MS = regression_SS.div(regression_df);	// 不偏分散(分散)
		
		// 残差 residual error
		const residual_df = number_of_samples.sub(number_of_explanatory_variables).sub(1);	// 自由度
		const residual_SS = predicted_values.sub(target).dotpow(2).sum();	// 平方和(変動)・MSe
		const residual_MS = residual_SS.div(residual_df);	// 不偏分散(分散)

		// 全体
		const total_df = number_of_samples.sub(1);	// 自由度
		const total_SS = target.sub(target.mean()).dotpow(2).sum();	// 平方和(変動)・MSt・VE
		const total_MS = total_SS.div(total_df);	// 不偏分散(分散)

		// Ve(残差の不偏分散)
		const Ve = residual_MS;
		
		// SE(標準誤差, SE, standard error)
		const standard_error = Ve.sqrt();

		// 回帰の分散比(F値)(観測された分散比)・F0
		const regression_F = regression_MS.div(residual_MS);

		// 回帰の有意 F significance F
		// 自由度 q, n-q-1 のF分布による検定
		// 誤りが発生する確率(1 - cdf('F',X,A,B))
		// F分布を用いて、誤りが発生する確率を調べる (有意 F)
		const regression_significance_F = Matrix.ONE.sub(regression_F.fcdf(regression_df, residual_df));
		
		// 自由度修正済決定係数・補正R2 adjusted R2, 自由度修正済決定係数 / 自由度調整済寄与率
		// 1 - (残差による変動 / 残差の自由度) / (全変動 / 全体の自由度)
		const adjusted_R_square = Matrix.ONE.sub(residual_MS.div(total_MS));
		
		// 赤池情報量規準(Akaike's Information Criterion, AIC)
		// 回帰式に定数項を含む場合の式
		// out.n * (log(2 * pi * (table(2, 2)/out.n)) + 1) + 2 * (out.q + 2);
		const AIC = number_of_samples.mul(
			residual_SS.div(number_of_samples).mul(2.0 * Math.PI).log().add(1)
		).add(number_of_explanatory_variables.add(2).mul(2));

		/**
		 * @type {KMultipleRegressionAnalysisOutput}
		 */
		const output = {
			q : number_of_explanatory_variables.doubleValue,
			n : number_of_samples.doubleValue,
			partial_regression_coefficient : partial_regression_coefficient,
			bias : bias.doubleValue,
			predicted_values : predicted_values,
			sY : sY.doubleValue,
			sy : sy.doubleValue,
			multiple_R : multiple_R.doubleValue,
			R_square : R_square.doubleValue,
			adjusted_R_square : adjusted_R_square.doubleValue,
			regression : {
				df : regression_df.doubleValue,
				SS : regression_SS.doubleValue,
				MS : regression_MS.doubleValue
			},
			residual : {
				df : residual_df.doubleValue,
				SS : residual_SS.doubleValue,
				MS : residual_MS.doubleValue
			},
			total : {
				df : total_df.doubleValue,
				SS : total_SS.doubleValue,
				MS : total_MS.doubleValue
			},
			Ve : Ve.doubleValue,
			standard_error : standard_error.doubleValue,
			regression_F : regression_F.doubleValue,
			regression_significance_F : regression_significance_F.doubleValue,
			AIC : AIC.doubleValue
		};

		return output;
	}

}
