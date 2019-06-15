const fs = require("fs");
const child_process = require("child_process");

class File {

	/**
	 * UTF-8 でテキストを書き込む
	 * @param {string} path 
	 * @param {string} text 
	 */
	static saveTextFile(path, text) {
		fs.writeFileSync(path, text, "utf-8");
	}

	/**
	 * UTF-8 with BOM でテキストを書き込む
	 * @param {string} path 
	 * @param {string} text 
	 */
	static saveTextFileWithBOM(path, text) {
		if (text.length > 0 && text.charAt(0) !== "\uFEFF") {
			fs.writeFileSync(path, "\uFEFF" + text, "utf-8");
		}
		else {
			fs.writeFileSync(path, text, "utf-8");
		}
	}

	/**
	 * BOMあり／なしに関わらず、UTF-8のテキストを読み込む
	 * @param {string} path
	 * @returns {string} テキストデータ 
	 */
	static loadTextFile(path) {
		const text = fs.readFileSync(path, "utf-8");
		if (text.length > 0 && text.charAt(0) === "\uFEFF") {
			return text.substr(1);
		}
		else {
			return text;
		}
	}

	/**
	 * 実行する
	 * @param {string} command 
	 */
	static exec(command) {
		const execSync = child_process.execSync;
		execSync(command);
	}

	/**
	 * ファイルが存在するか調べる
	 * @param {string} path 
	 */
	static isExist(path) {
		try {
			fs.statSync(path);
			return true;
		}
		catch (error) {
			if(error.code === "ENOENT") {
				return false;
			} else {
				console.log(error);
			}
		}
		return false;
	}

	/**
	 * ファイルをコピーする
	 * @param {string} from 
	 * @param {string} to 
	 */
	static copy(from, to) {
		const bin = fs.readFileSync(from);
		fs.writeFileSync(to, bin);
	}

	/**
	 * ファイルを削除する
	 * @param {string} path 
	 */
	static deleteTextFile(path) {
		if(!File.isExist(path)) {
			return;
		}
		fs.unlinkSync(path);
	}

	/**
	 * フォルダを作成する
	 * @param {string} path 
	 */
	static makeDirectory(path) {
		if(File.isExist(path)) {
			return;
		}
		fs.mkdirSync(path);
	}

	/**
	 * フォルダを削除する
	 * @param {string} path 
	 */
	static deleteDirectory(path) {
		if(!File.isExist(path)) {
			return;
		}
		fs.rmdirSync(path);
	}
}

module.exports = File;
