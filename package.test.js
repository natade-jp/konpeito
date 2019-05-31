// @ts-nocheck

const saveTextFile = function(filename, text) {
	const fs = require("fs");
	fs.writeFileSync(filename, text, "utf-8");
};

const deleteTextFile = function(filename) {
	const fs = require("fs");
	fs.unlinkSync(filename);
};

const exec = function(command) {
	const execSync = require("child_process").execSync;
	execSync(command);
};

const jest_config_js = {
	"verbose": true,
	"rootDir": "./src",
	"moduleFileExtensions": [
		"js",
		"mjs"
	],
	"testMatch": [
	],
	"transform": {
		"^.+\\.(js|mjs)$": "babel-jest"
	}
};

if(process.argv[2]) {
	const test_file_name = process.argv[2];
	jest_config_js["testMatch"].push("**/?(*.)" + test_file_name + ".test.mjs");
}
else {
	jest_config_js["testMatch"].push("**/__tests__/**/*.?(m)js?(x)");
	jest_config_js["testMatch"].push("**/?(*.)(spec|test).?(m)js?(x)");
}

saveTextFile(
	"jest.config.js",
	"module.exports = " + JSON.stringify( jest_config_js ) + ";"
);

exec("npx jest");

deleteTextFile("jest.config.js");
