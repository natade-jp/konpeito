const File = require("./File.js");

/**
 * 
 * @param {string} filename 
 */
const addHeader = function(filename) {
	const build_date = new Date();
	const header = [];
	header.push("/*!");
	header.push(" * konpeito.js");
	header.push(" * https://github.com/natade-jp/konpeito");
	header.push(" * Copyright 2013-" + build_date.getFullYear() + " natade < https://github.com/natade-jp >");
	header.push(" *");
	header.push(" * The MIT license.");
	header.push(" * https://opensource.org/licenses/MIT");
	header.push(" */");
	header.push("");
	const header_string = header.join("\n");
	const text = File.loadTextFile(filename);
	File.saveTextFile(filename, header_string + text);
};

// rollup
File.exec("npx rollup -c \"./scripts/rollup.config.js\"");

// 先頭に著作権表記をするターゲット
const target_file = [
	"./build/esm/index.js",
	"./build/CommonJS/index.js",
	"./build/konpeito.esm.min.js",
	"./build/konpeito.umd.min.js"
];

// ヘッダ追加
for(const key in target_file) {
	addHeader(target_file[key]);
}

// ES6用のモジュールをnode.jsで利用できるように修正する
{
	let text = File.loadTextFile("./build/CommonJS/index.js");
	text = text.replace("export default konpeito;", "module.exports = konpeito;");
	File.saveTextFile("./build/CommonJS/index.js", text);
}

// サンプルファイルはbuild内のデータと関連付ける
File.saveTextFile(
	"./html/examples/libs/konpeito.js",
	"import konpeito from \"../../../build/konpeito.esm.min.js\";export default konpeito;"
);
