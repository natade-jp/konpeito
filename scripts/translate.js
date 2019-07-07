const File = require("./File.js");
const CSV = require("./CSV.js");
const JSDocTranslater = require("./JSDocTranslater.js");

/**
 * @type {string}
 */
let action_type = null;
let import_langage = "en";
if(process.argv[2]) {
	action_type = process.argv[2];
}
else if(process.argv[3]) {
	import_langage = process.argv[3];
}


const type = {
	source		: "./src/",
	destination	: "./scripts/",
	includes	: ["\\.mjs$"],
	excludes	: ["\\.test\\.mjs$"],
};

const filelist = File.createTargetList(type);
const json_array = [];

if(action_type === "export") {
	console.log("export");

	for(let i = 0; i < filelist.length; i++) {
		const text = File.loadTextFile(filelist[i]);
		const target_list = JSDocTranslater.exportTypeList(text);
		for(let j = 0; j < target_list.length; j++) {
			json_array.push(target_list[j]);
		}
	}
	
	const csv_array = CSV.toCSVArrayFromJSONArray(json_array,
		[
			"class", "name", "modifier", "type", "prm_name", "text"
		]
	);
	const csv_text = CSV.create(csv_array, "\t");

	File.saveTextFileWithBOM(type.destination + "translate_export.csv", csv_text);
}
else if(action_type === "import") {
	console.log("import");

	const csv_text = File.loadTextFile(type.destination + "translate.csv");
	const csv_array = CSV.parse(csv_text, "\t");
	const json_array = CSV.toJSONArrayFromCSVArray(csv_array);

	/**
	 * @type {Array<{name: string; modifier: string; class: string; type: string; text: string; prm_name: string; }>}
	 */
	const dictionary = [];

	for(let i = 0; i < json_array.length; i++) {
		dictionary.push({
			name: json_array[i]["name"],
			modifier: json_array[i]["modifier"],
			class: json_array[i]["class"],
			type: json_array[i]["type"],
			prm_name: json_array[i]["prm_name"],
			text: json_array[i][import_langage]
		});
	}

	for(let i = 0; i < filelist.length; i++) {
		const text = File.loadTextFile(filelist[i]);
		const text_translate = JSDocTranslater.importTypeList(text, dictionary);
		break;
	}
}


