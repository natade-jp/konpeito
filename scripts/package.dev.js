const File = require("./File.js");

// サンプルファイルは直接関連付ける
File.saveTextFile(
	"./html/examples/libs/konpeito.js",
	"import konpeito from \"../../../src/konpeito.js\";export default konpeito;"
);
