/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */

import PrincipalComponentAnalysis from "./DataAnalysis/PrincipalComponentAnalysis.js";
import MultipleRegressionAnalysis from "./DataAnalysis/MultipleRegressionAnalysis.js";

/**
 * Tools for analyzing data.
 */
export default class DataAnalysis {

	/**
	 * Principal component analysis.
	 * @param {import("./DataAnalysis/PrincipalComponentAnalysis.js").KPrincipalComponentAnalysisSettings} settings - input data
	 * @returns {import("./DataAnalysis/PrincipalComponentAnalysis.js").KPrincipalComponentAnalysisOutput} analyzed data
	 */
	static runPrincipalComponentAnalysis(settings) {
		return PrincipalComponentAnalysis.runPrincipalComponentAnalysis(settings);
	}

	/**
	 * Multiple regression analysis
	 * @param {import("./DataAnalysis/MultipleRegressionAnalysis.js").KMultipleRegressionAnalysisSettings} settings - input data
	 * @returns {import("./DataAnalysis/MultipleRegressionAnalysis.js").KMultipleRegressionAnalysisOutput} analyzed data
	 */
	static runMultipleRegressionAnalysis(settings) {
		return MultipleRegressionAnalysis.runMultipleRegressionAnalysis(settings);
	}

}