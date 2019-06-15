const File = require("./File.js");

// サンプルファイルは直接関連付ける
File.saveTextFile(
	"./html/examples/libs/konpeito.mjs",
	"import konpeito from \"../../../src/konpeito.mjs\";export default konpeito;"
);
