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

// esdoc
exec("npx esdoc");
