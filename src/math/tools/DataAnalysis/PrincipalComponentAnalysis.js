/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import Matrix from "../../core/Matrix.js";
import Complex from "../../core/Complex.js";

/**
 * Settings for principal component analysis.
 * @typedef {Object} KPrincipalComponentAnalysisSettings
 * @property {import("../../core/Matrix.js").KMatrixInputData} samples explanatory variable. (Each column is a parameters and each row is a samples.)
 * @property {boolean} [is_unbiased=true] Use unbiased variance when calculating variance from samples.
 * @property {boolean} [is_standardised=false] Use standardized explanatory variables. Use the correlation matrix instead of the covariance matrix.
 */

/**
 * @typedef {Object} KPrincipalComponent
 * @property {number} eigen_value Contribution. Eigen value. Variance of principal components.
 * @property {number[]} factor_loading Factor loading. Eigen vector. Principal component coefficients.
 * @property {number[]} factor_loading_contribution_rate Factor loading contribution rate.
 * @property {number} cumulative_contribution_ratio Cumulative contribution ratio.
 * @property {number} contribution_ratio Contribution ratio.
 * @property {number[]} score Principal component score.
 */

/**
 * Output for principal component analysis.
 * @typedef {Object} KPrincipalComponentAnalysisOutput
 * @property {KPrincipalComponent[]} principal_component Principal component.
 */

/**
 * Principal component analysis.
 */
export default class PrincipalComponentAnalysis {

	/**
	 * Principal component analysis.
	 * @param {KPrincipalComponentAnalysisSettings} settings - input data
	 * @returns {KPrincipalComponentAnalysisOutput} analyzed data
	 */
	static runPrincipalComponentAnalysis(settings) {
		// 主成分分析を行う
		// 参考文献
		// [1] 図解でわかる多変量解析―データの山から本質を見抜く科学的分析ツール
		//     涌井 良幸, 涌井 貞美, 日本実業出版社 (2001/01)
		
		// samples 説明変量。行がサンプル。列が各値。
		let samples = Matrix.create(settings.samples);
		const is_unbiased = settings.is_unbiased === undefined ? false : settings.is_unbiased;
		const correction = {correction : is_unbiased ? 1 : 0};

		// true になっている場合は標準化を行う。
		// つまり、共分散行列ではなく、相関行列で主成分分析することと同等である。
		if(settings.is_standardised) {
			samples = samples.standardization(correction);
		}

		// 共分散行列、あるいは相関行列を求める
		const r = samples.cov(correction);

		// 固有値(特異値)ベクトルを求める
		const svd = r.svd();
		// 固有値 = 主成分の分散 = 寄与度
		const eigen_value = svd.S.diag();
		// 固有ベクトル = 行ごとに、第○主成分の係数。= 因子負荷量
		// 行が各主成分に相当し、各列にそのパラメータの係数
		const factor_loading = svd.U.T().negate();
		// 固有ベクトルの寄与率 = 行ごとに、第○主成分の係数の寄与率
		// 行が各主成分に相当し、各列にそのパラメータの係数の寄与率
		const factor_loading_contribution_rate = factor_loading.dotpow(2);

		// 寄与率
		const eigen_sum = eigen_value.sum();
		const contribution_ratio = eigen_value.dotdiv(eigen_sum);

		// 累積寄与率
		let x = Complex.ZERO;
		const cumulative_contribution_ratio = Matrix.createMatrixDoEachCalculation(function(row, col) {
			x = x.add(contribution_ratio.getComplex(row + col));
			return x;
		}, contribution_ratio.column_length, contribution_ratio.row_length);

		// 主成分得点
		// 行が各主成分に相当し、各列にそのレコードの主成分の得点
		samples = samples.sub(samples.mean({dimension : "column"}));	// 平均を0にする
		const principal_component_score = Matrix.createMatrixDoEachCalculation(function(row, col) {
			return samples.getMatrix(col, ":").dotmul(factor_loading.getMatrix(row, ":")).sum();
		}, eigen_value.length, samples.size(1));

		{
			const array_eigen_value = eigen_value.T().getNumberMatrixArray()[0];
			const array_factor_loading = factor_loading.getNumberMatrixArray();
			const array_factor_loading_contribution_rate = factor_loading_contribution_rate.getNumberMatrixArray();
			const array_cumulative_contribution_ratio = cumulative_contribution_ratio.getNumberMatrixArray()[0];
			const array_contribution_ratio = contribution_ratio.T().getNumberMatrixArray()[0];
			const array_score = principal_component_score.getNumberMatrixArray();

			/**
			 * @type {KPrincipalComponent[]}
			 */
			const principal_component = [];
			for(let i = 0; i < eigen_value.length; i++) {
				principal_component.push({
					eigen_value : array_eigen_value[i],
					factor_loading : array_factor_loading[i],
					factor_loading_contribution_rate : array_factor_loading_contribution_rate[i],
					cumulative_contribution_ratio : array_cumulative_contribution_ratio[i],
					contribution_ratio : array_contribution_ratio[i],
					score : array_score[i]
				});
			}

			return {
				principal_component : principal_component
			};
		}
	}

}
