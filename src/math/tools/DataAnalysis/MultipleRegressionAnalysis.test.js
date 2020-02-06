import MultipleRegressionAnalysis from "./MultipleRegressionAnalysis.js";
import Matrix from "../../core/Matrix.js";
const $ = Matrix.create;

/**
 * @type {number}
 */
let test_count = 0;

/**
 * check x === y
 * @param {string} name
 * @param {any} x 
 * @param {any} y 
 */
const equalResultsValue = function(name, x, y) {
	
	/**
	 * @type {boolean}
	 */
	let result = false;
	/**
	 * @type {string}
	 */
	let text_x = "";
	/**
	 * @type {string}
	 */
	let text_y = "";

	const target_x = (x !== undefined) ? $(x) : $(0);
	const target_y = (y !== undefined) ? $(y) : $(0);
	result = false;
	if((x !== undefined) && (y !== undefined)) {
		text_x = target_x.toOneLineString();
		text_y = target_y.toOneLineString();
		result = target_x.equals(target_y, 0.001);
	}
	else if(x !== undefined) {
		text_x = target_x.toOneLineString();
		text_y = "undefined";
		result = false;
	}
	else if(y !== undefined) {
		text_x = "undefined";
		text_y = target_y.toOneLineString();
		result = false;
	}
	else {
		text_x = "undefined";
		text_y = "undefined";
		result = false;
	}
	
	test_count++;
	test(test_count + " " + name + " " + " = " + text_x + " === " + text_y, () => { expect(result).toBe(true); });
};

/**
 * check x[key] === y[key]
 * @param {string} name
 * @param {string} key
 * @param {any} x 
 * @param {any} y 
 */
const equalResultsKeyValue = function(name, key, x, y) {
	equalResultsValue(name + " " + key, x[key], y[key]);
};

/**
 * check x === y
 * @param {string} name
 * @param {any} x 
 * @param {any} y 
 */
const equalResultsArray = function(name, x, y) {
	for(const key in x) {
		if(key in y) {
			equalResultsKeyValue(name, key, x, y);
		}
		else {
			const text_x = $(x[key]).toOneLineString();
			const text_y = "undefined";
			const result = false;
			test_count++;
			test(test_count + " " + name + " " + key + " = " + text_x + " === " + text_y, () => { expect(result).toBe(true); });
		}
	}
};

{
	const x = "[5 5 7 5 8 12]'";
	const y = "[8 9 13 11 14 17]'";
	const result = MultipleRegressionAnalysis.doMultipleRegressionAnalysis({ samples : x, target : y });
	const ans = {
		"q": 1,
		"n": 6,
		"predicted_values": [
			[
				9.736842105263158
			],
			[
				9.736842105263158
			],
			[
				12
			],
			[
				9.736842105263158
			],
			[
				13.131578947368421
			],
			[
				17.657894736842106
			]
		],
		"sY": 8.10964912280702,
		"sy": 9.333333333333334,
		"multiple_R": 0.9321432172384291,
		"R_square": 0.8688909774436093,
		"adjusted_R_square": 0.8361137218045113,
		"ANOVA": {
			"regression": {
				"df": 1,
				"SS": 48.657894736842124,
				"MS": 48.657894736842124
			},
			"residual": {
				"df": 4,
				"SS": 7.342105263157894,
				"MS": 1.8355263157894735
			},
			"total": {
				"df": 5,
				"SS": 56,
				"MS": 11.2
			},
			"F": 26.508960573476717,
			"significance_F": 0.006750589714221045
		},
		"Ve": 1.8355263157894735,
		"standard_error": 1.3548159711892511,
		"AIC": 24.23845931565762,
		"regression_table": {
			"intercept": {
				"coefficient": 4.078947368421051,
				"standard_error": 1.63486511171962,
				"t_stat": 2.4949748692909854,
				"p_value": 0.06712619520541963,
				"lower_95": -0.4601658686715391,
				"upper_95": 8.61806060551364
			},
			"parameters": [
				{
					"coefficient": 1.1315789473684212,
					"standard_error": 0.21978017221697452,
					"t_stat": 5.148685324767548,
					"p_value": 0.006750589714221045,
					"lower_95": 0.5213713639970732,
					"upper_95": 1.7417865307397693
				}
			]
		}
	};

	equalResultsKeyValue("MultipleRegressionAnalysis", "q", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "n", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "multiple_R", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "R_square", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "adjusted_R_square", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "standard_error", result, ans);

	equalResultsArray("MultipleRegressionAnalysis ANOVA.regression", result.ANOVA.regression, ans.ANOVA.regression);
	equalResultsArray("MultipleRegressionAnalysis ANOVA.residual", result.ANOVA.residual, ans.ANOVA.residual);
	
	equalResultsArray("MultipleRegressionAnalysis regression_table.intercept", result.regression_table.intercept, ans.regression_table.intercept);
	equalResultsArray("MultipleRegressionAnalysis regression_table.parameters[0]", result.regression_table.parameters[0], ans.regression_table.parameters[0]);
}

{
	const x = "[5.5 12;4.5 9;4.1 8;3.5 6;2.5 5;2.3 6;2.7 5;2.8 4]";
	const y = "[73; 59; 56; 31; 28; 31; 30; 25]";
	const result = MultipleRegressionAnalysis.doMultipleRegressionAnalysis({ samples : x, target : y });
	const ans = {
		"q": 2,
		"n": 8,
		"predicted_values": [
			[
				75.83447377714992
			],
			[
				56.64404909058803
			],
			[
				49.934729825181
			],
			[
				37.45362440402614
			],
			[
				27.931705809641535
			],
			[
				31.82842574607099
			],
			[
				28.869238919300727
			],
			[
				24.503752428041672
			]
		],
		"sY": 277.7047059862264,
		"sy": 289.484375,
		"multiple_R": 0.9794427501279707,
		"R_square": 0.9593081007782419,
		"adjusted_R_square": 0.9430313410895387,
		"ANOVA": {
			"regression": {
				"df": 2,
				"SS": 2221.637647889811,
				"MS": 1110.8188239449055
			},
			"residual": {
				"df": 5,
				"SS": 94.23735211018895,
				"MS": 18.84747042203779
			},
			"total": {
				"df": 7,
				"SS": 2315.875,
				"MS": 330.8392857142857
			},
			"F": 58.93728967713661,
			"significance_F": 0.00033401802256727287
		},
		"Ve": 18.84747042203779,
		"standard_error": 4.34136734474725,
		"AIC": 50.4340171754824,
		"regression_table": {
			"intercept": {
				"coefficient": -7.958723291541588,
				"standard_error": 5.444484810635138,
				"t_stat": -1.4617954808130225,
				"p_value": 0.2036463862692668,
				"lower_95": -21.95421705015804,
				"upper_95": 6.036770467074863
			},
			"parameters": [
				{
					"coefficient": 4.6876655482959535,
					"standard_error": 4.033171035431498,
					"t_stat": 1.1622778967503997,
					"p_value": 0.2975793071675239,
					"lower_95": -5.6799306553987225,
					"upper_95": 15.05526175199063
				},
				{
					"coefficient": 4.834253046088648,
					"standard_error": 1.7238464783002552,
					"t_stat": 2.8043408197551973,
					"p_value": 0.03779957152493174,
					"lower_95": 0.40296460154439817,
					"upper_95": 9.265541490632899
				}
			]
		}
	};

	equalResultsKeyValue("MultipleRegressionAnalysis", "q", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "n", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "multiple_R", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "R_square", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "adjusted_R_square", result, ans);
	equalResultsKeyValue("MultipleRegressionAnalysis", "standard_error", result, ans);

	equalResultsArray("MultipleRegressionAnalysis ANOVA.regression", result.ANOVA.regression, ans.ANOVA.regression);
	equalResultsArray("MultipleRegressionAnalysis ANOVA.residual", result.ANOVA.residual, ans.ANOVA.residual);
	
	equalResultsArray("MultipleRegressionAnalysis regression_table.intercept", result.regression_table.intercept, ans.regression_table.intercept);
	equalResultsArray("MultipleRegressionAnalysis regression_table.parameters[0]", result.regression_table.parameters[0], ans.regression_table.parameters[0]);
	equalResultsArray("MultipleRegressionAnalysis regression_table.parameters[1]", result.regression_table.parameters[1], ans.regression_table.parameters[1]);

}