const File = require("./File.js");

// npx jsdoc -c ".jsdoc.json" -r "./src/"
File.exec("npx jsdoc -c \".jsdoc.json\" -r \"./src/\"");

File.copy(
	"./out/types.d.ts",
	"./build/konpeito.d.ts"
);

File.deleteDirectory("./out");
