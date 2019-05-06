const fs = require("fs");

const exec = function(command) {
	const execSync = require("child_process").execSync;
	execSync(command);
};

const copy = function(from, to) {
	const bin = fs.readFileSync(from);
	fs.writeFileSync(to, bin);
};

const makeDirectory = function( path ) {
	if(fs.existsSync(path)) {
		return;
	}
	fs.mkdirSync(path, (err, folder) => {
		if(err) {
			throw err;
		}
	});
};

const deleteDirectory = function( path ) {
	if(!fs.existsSync(path)) {
		return;
	}
	fs.rmdirSync(path, (err, folder) => {
		if(err) {
			throw err;
		}
	});
};

const src = "./docsrc";

makeDirectory(src);

copy("./src/mathx/BigDecimal.mjs", src + "/BigDecimal.js");
copy("./src/mathx/BigInteger.mjs", src + "/BigInteger.js");
copy("./src/mathx/Complex.mjs", src + "/Complex.js");
copy("./src/mathx/Matrix.mjs", src + "/Matrix.js");
copy("./src/mathx/toolbox/RoundingMode.mjs", src + "/RoundingMode.js");
copy("./src/mathx/toolbox/MathContext.mjs", src + "/MathContext.js");

// esdoc
exec("npx esdoc");

//deleteDirectory(src);
