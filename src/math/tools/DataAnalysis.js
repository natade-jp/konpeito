/**
 * The script is part of konpeito.
 * 
 * AUTHOR:
 *  natade (http://twitter.com/natadea)
 * 
 * LICENSE:
 *  The MIT license https://opensource.org/licenses/MIT
 */


import MultipleRegressionAnalysis from "./DataAnalysis/MultipleRegressionAnalysis.js";

/**
 * Tools for analyzing data.
 */
export default class DataAnalysis {

	/**
	 * Multiple regression analysis
	 * @param {KMultipleRegressionAnalysisSettings} settings - input data
	 * @returns {KMultipleRegressionAnalysisOutput} analyzed data
	 */
	static doMultipleRegressionAnalysis(settings) {
		return MultipleRegressionAnalysis.doMultipleRegressionAnalysis(settings);
	}

}