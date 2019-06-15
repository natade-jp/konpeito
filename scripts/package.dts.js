const File = require("./File.js");

File.exec("npx jsdoc -c \".jsdoc.json\" -r \"./src/\"");

File.copy(
	"./out/types.d.ts",
	"./build/konpeito.d.ts"
);

File.deleteDirectory("./out");
