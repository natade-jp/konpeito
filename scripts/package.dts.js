const File = require("./File.js");

// npx jsdoc -c ".jsdoc.json" -r "./src/"
try {
	File.exec("npx jsdoc -c \".jsdoc.json\" -r \"./src/\"");
}
catch (error) {
	// {typeof XXX} という型で不正エラーが発生するが、
	// d.ts作成が目的のため影響がないと思われる。
}

File.copy(
	"./out/types.d.ts",
	"./build/konpeito.d.ts"
);

File.deleteDirectory("./out");
