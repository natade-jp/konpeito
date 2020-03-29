const File = require("./File.js");

// npx jsdoc -c "./scripts/.dts.json" -r "./src/"
try {
	File.exec("npx jsdoc -c \"./scripts/.dts.json\" -r \"./src/\"");
}
catch (error) {
	// {typeof XXX} という型で不正エラーが発生するが、
	// d.ts作成が目的のため影響がないと思われる。
}

// 自動生成したdtsファイルを解析
let dts_text = File.loadTextFile("./out/types.d.ts");

// 戻り値の補正
// 戻り値が any で終わっているものは解析エラーの可能性があるため、returns の情報を使用する
{
	const dts_text_line = dts_text.split("\n");
	for(let i = 0; i < dts_text_line.length; i++) {
		const line = dts_text_line[i];
		if(!line.endsWith(": any;")) {
			continue;
		}
		// 戻り値がanyで終わっているものは解析エラーの可能性がある。
		let returns = null;
		for(let j = i - 3; j < i; j++) {
			// {} の入れ子について
			// 1重 (\{[^{]*\})
			// 2重 (\{[^{]*((\{[^{]*\})*[^{]*)\})
			// 3重 (\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})
			// 3重まで対応
			if(/(\s*\*\s*@returns?\s*)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})/.test(dts_text_line[j])) {
				const match = dts_text_line[j].match(/(\s*\*\s*@returns?\s*)(\{[^{]*((\{[^{]*((\{[^{]*\})*[^{]*)\})*[^{]*)\})/)[0];
				const with_block = match.replace(/(\s*\*\s*@returns?\s*)/, "");
				returns = with_block.replace(/(^{)|(}$)/g, "");
				break;
			}
		}
		if(returns === null) {
			continue;
		}
		// 2行前がreturnコメントなら、returnコメントを採用
		dts_text_line[i] = line.replace(/: any;$/, ": " + returns + ";");
	}
	dts_text = dts_text_line.join("\n");
}

{
	// なぜか追加されない行があるので追加する。
	dts_text += "\n" +
	"/**" + "\n" +
	" * Fraction type argument." + "\n" +
	" * - Fraction" + "\n" +
	" * - BigInteger" + "\n" +
	" * - BigDecimal" + "\n" +
	" * - number" + "\n" +
	" * - string" + "\n" +
	" * - Array<KBigIntegerInputData>" + "\n" +
	" * - {numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}" + "\n" +
	" * - {doubleValue:number}" + "\n" +
	" * - {toString:function}" + "\n" +
	" * @typedef {Fraction|BigInteger|BigDecimal|number|string|Array<KBigIntegerInputData>|{numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}|{doubleValue:number}|{toString:function}} KFractionInputData" + "\n" +
	" */" + "\n" +
	"declare type KFractionInputData = Fraction|BigInteger|BigDecimal|number|string|Array<KBigIntegerInputData>|{numerator:KBigIntegerInputData,denominator:KBigIntegerInputData}|{doubleValue:number}|{toString:any};";
}

{
	// "import("./*/*.js")." などのimport文の除去
	dts_text = dts_text.replace(/import\([^)]*\)\./g, "");
}

{
	// 型定義ファイルで無名関数を戻り値として返す場合の記述方法が不明なので、 any にしておく。
	// static COMPARE_DEFAULT: function(string, string): number;
	dts_text = dts_text.replace(/: function\([^;]+;/g, ": any;");
}

{
	// 以下のようなコードが原因不明で入り込む場合があるので削除する
	// declare var default: any;
	dts_text = dts_text.replace(/\ndeclare var default: any;\n/g, "\n");
}


{
	// @typedef しかない行の後に作成された、「declare type」が不正なので修正する。
	// /**
	//  * @typedef {number|string|BigDecimal|BigInteger|{toBigDecimal:function}|{doubleValue:number}|{toString:function}} KBigDecimalLocalInputData
	//  * @typedef {{integer:BigInteger,scale:?number,context:?MathContext}} KBigDecimalScaleData
	//  * @typedef {KBigDecimalLocalInputData|Array<KBigDecimalLocalInputData|MathContext>|KBigDecimalScaleData} KBigDecimalInputData
	//  */
	// declare type ~~
	const dts_text_line = dts_text.split("\n");
	for(let i = 0; i < dts_text_line.length; i++) {
		const line = dts_text_line[i];
		if(!line.startsWith("declare type ")) {
			continue;
		}
		// 見つけた行の上を探索する。
		let output = "";
		let is_hit = false;
		let last_line = 0;
		let is_first = true;
		for(let j = i - 1; j >= 0; j--) {
			const up_line = dts_text_line[j];
			// */
			if(/\s*\*\/\s*/.test(up_line)) {
				continue;
			}
			// * @typedef 
			if(!(/\s*\*\s+@typedef\s+/.test(up_line))) {
				break;
			}
			// {{integer:BigInteger,scale:?number,context:?MathContext}} KBigDecimalScaleData
			const match_data = up_line.trim().replace(/\s*\*\s+@typedef\s+/, "").match(/^\{([^\t ]*)\}\s+([\w]+)$/);
			if(match_data === null) {
				break;
			}
			is_hit = true;
			last_line = j;
			// function が戻り値の場合の定義が不明なので、 any にしておく
			// ?がついた値は利用できないので消す
			const objtype = match_data[1].replace(/function/g, "any").replace(/\?/g, "");
			const name = match_data[2];
			let add_data;
			if(is_first) {
				add_data = up_line + "\n" + " */\n" + "declare type " + name + " = " + objtype + ";\n";
				is_first = false;
			}
			else {
				add_data = "/**\n" + up_line + "\n" + " */\n" + "declare type " + name + " = " + objtype + ";\n";
			}
			output = add_data + output;
		}
		if(is_hit) {
			// last_line ~ i 行までを削除する
			const delete_line_start = last_line;
			const delete_line_length = i - last_line + 1;
			dts_text_line.splice(delete_line_start, delete_line_length);
			i = last_line;
			// 修正した行を追記
			dts_text_line.splice(i, 0, output);
			i++;	
		}
	}
	dts_text = dts_text_line.join("\n");
}

// 型の補正
// 内部で使用する、Matrix型などは konpeito で閉じた世界の型なので、
// 外部に見せる必要がなく、見せると衝突してしまう可能性が高いため、装飾する。
{
	const types = [
		"BigDecimal",
		"BigDecimalCache",
		"BigDecimalConst",
		"BigDecimalTool",
		"BigInteger",
		"BigIntegerTool",
		"Complex",
		"ComplexTool",
		"DataAnalysis",
		"PrincipalComponentAnalysis",
		"MultipleRegressionAnalysis",
		"DCT",
		"FFT",
		"FFTCache",
		"Fraction",
		"FractionTool",
		"LinearAlgebra",
		"LinearAlgebraTool",
		"MathContext",
		"Matrix",
		"MatrixTool",
		"Probability",
		"ProbabilityComplex",
		"ProbabilityTool",
		"Random",
		"RandomTool",
		"RandomBase",
		"Xorshift",
		"MaximumLengthSequence",
		"RoundingMode",
		"RoundingMode_CEILING",
		"RoundingMode_DOWN",
		"RoundingMode_FLOOR",
		"RoundingMode_HALF_DOWN",
		"RoundingMode_HALF_EVEN",
		"RoundingMode_HALF_UP",
		"RoundingMode_UNNECESSARY",
		"RoundingMode_UP",
		"RoundingModeEntity",
		"Signal",
		"SignalTool",
		"Statistics",
		"Polyfill"
	];
	for(let i = 0; i < types.length; i++) {
		const word = types[i];
		let reg = null;
		// 文字列を装飾する
		reg = new RegExp("([\\W])(" + word + ")([\\W])", "g");
		dts_text = dts_text.replace(reg, "$1_$2_$3");

		// 装飾が不要な箇所を元に戻す
		reg = new RegExp("(static )(_" + word + "_)(: typeof )(_" + word + "_;)", "g");
		dts_text = dts_text.replace(reg, "$1" + word + "$3$4");
	}
}


File.saveTextFile("./build/index.d.ts", dts_text);
File.deleteDirectory("./out");
