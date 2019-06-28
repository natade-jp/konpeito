const File = require("./File.js");
const CSV = require("./CSV.js");
const JSDocTranslater = require("./JSDocTranslater.js");

/**
 * @type {string}
 */
let arguments = null;
if(process.argv[2]) {
	arguments = process.argv[2];
}

const type = {
	source		: "./src/",
	destination	: "./scripts/",
	includes	: ["\\.mjs$"],
	excludes	: ["\\.test\\.mjs$"],
};

const filelist = File.createTargetList(type);
const type_list = [];

for(const i in filelist) {
	const text = File.loadTextFile(filelist[i]);
	const target_list = JSDocTranslater.createTypeList(text);
	for(let j = 0; j < target_list.length; j++) {
		type_list.push(target_list[j]);
	}
}

const csv_obj = CSV.toCSVArrayFromJSONArray(type_list);
const csv_text = CSV.create(csv_obj);

File.saveTextFileWithBOM(type.destination + "translate2.csv", csv_text);
