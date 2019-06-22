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
const dts_text = File.loadTextFile("./out/types.d.ts");
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

File.saveTextFile(
	"./build/konpeito.d.ts",
	dts_text_line.join("\n")
);

File.deleteDirectory("./out");
