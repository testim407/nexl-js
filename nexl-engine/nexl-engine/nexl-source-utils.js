/**************************************************************************************
 nexl-source-utils

 Copyright (c) 2016-2017 Yevgeny Sergeyev
 License : Apache 2.0

 Set of utility functions for nexl-source
 **************************************************************************************/

const esprima = require('esprima');
const path = require('path');
const util = require('util');
const fs = require('fs');
const vm = require('vm');
const j79 = require('j79-utils');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function resolveIncludeDirectiveDom(item) {
	if (!item.expression || item.expression["type"] != "Literal") {
		return null;
	}

	var itemValue = item.expression.raw;

	if (!itemValue) {
		return null;
	}

	// regex tells : starts from quote OR single quote, @ character, one OR unlimited amount of any character, ends with the same quote which it was started
	itemValue = itemValue.match(/^('|")@\s(.+)(\1)$/);
	if (itemValue && itemValue.length === 4) {
		return itemValue[2];
	} else {
		return null;
	}
}

// parses javascript provided as text and resolves nexl include directives ( like "@import ../../src.js"; )
function resolveIncludeDirectives(text) {
	var result = [];

	// parse source code with esprima
	var srcParsed = esprima.parse(text);

	// iterating over and looking for include directives
	for (var key in srcParsed.body) {
		var item = srcParsed.body[key];

		// resolve include directive from dom item
		var includeDirective = resolveIncludeDirectiveDom(item);
		if (includeDirective != null) {
			result.push(includeDirective);
		}
	}

	return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

NexlSourceCodeAssembler.prototype.assembleSourceCodeAsText = function (asText) {
	// the text
	var result = asText.text;

	// validating
	if (!j79.isString(result)) {
		throw '[nexlSource.asText.text] is not provided or not of string type';
	}

	// resolving include directives
	var includeDirectives = resolveIncludeDirectives(result);

	// iterating over and processing
	for (var index in includeDirectives) {
		var includeDirective = includeDirectives[index];

		// does directive have an absolute path ?
		if (path.isAbsolute(includeDirective)) {
			result += this.assembleSourceCodeAsFile({"fileName": includeDirective});
			continue;
		}

		// directive has a relative path. is path4imports provided ?
		if (!asText.path4imports) {
			throw util.format('Source code contains reference to [%s] file for import, but you didn\'t provide a [nexlSource.asFile.path4imports]', includeDirective);
		}

		if (!fs.existsSync(asText.path4imports)) {
			throw util.format('Path [%s] you provided in [nexlSource.asFile.path4imports] doesn\'t exist', asText.path4imports);
		}

		var fullPath = path.join(asText.path4imports, includeDirective);
		result += this.assembleSourceCodeAsFile({"fileName": fullPath});
	}

	return result;
};

NexlSourceCodeAssembler.prototype.assembleSourceCodeAsFile = function (asFile) {
	var result;
	var fileName = asFile.fileName;

	// is already included ?
	if (this.filesRegistry.indexOf(fileName) >= 0) {
		return '';
	}

	// adding to registry
	this.filesRegistry.push(fileName);

	// is file exists ?
	if (!fs.existsSync(fileName)) {
		throw util.format("The source [%s] file, doesn't exist", fileName);
	}

	// is it file and not a directory or something else ?
	if (!fs.lstatSync(fileName).isFile()) {
		throw util.format("The  [%s] source is not a file", fileName);
	}

	// reading file content
	try {
		result = fs.readFileSync(fileName, "UTF-8");
	} catch (e) {
		throw util.format("Failed to read [%s] source content , error : [%s]", fileName, e);
	}


	// resolving include directives
	var includeDirectives = resolveIncludeDirectives(result);

	// iterating over and processing
	for (var index in includeDirectives) {
		var includeDirective = includeDirectives[index];

		// does directive have an absolute path ?
		if (path.isAbsolute(includeDirective)) {
			result += this.assembleSourceCodeAsFile({"fileName": includeDirective});
			continue;
		}

		// resolve file path
		var filePath = path.dirname(fileName);

		var fullPath = path.join(filePath, includeDirective);
		result += this.assembleSourceCodeAsFile({"fileName": fullPath});
	}

	return result;
};

NexlSourceCodeAssembler.prototype.assemble = function () {
	this.filesRegistry = [];

	// validating nexlSource
	if (this.nexlSource === 'undefined') {
		throw "nexl source is not provided";
	}

	// is both provided ?
	if (this.nexlSource.asText && this.nexlSource.asFile) {
		throw "You have to provide asText or asFile, but not both at a same time";
	}

	// is nexl source code provided as text ?
	if (j79.isObject(this.nexlSource.asText)) {
		return this.assembleSourceCodeAsText(this.nexlSource.asText);
	}

	// is nexl source code provided as file ?
	if (j79.isObject(this.nexlSource.asFile)) {
		return this.assembleSourceCodeAsFile(this.nexlSource.asFile);
	}

	throw "nexlSource is empty ( doesn't contain asText or asFile properties )";
};

function NexlSourceCodeAssembler(nexlSource) {
	this.nexlSource = nexlSource;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function createContext(nexlSource) {
	var context = {};
	context.nexl = {};

	var sourceCode = new NexlSourceCodeAssembler(nexlSource).assemble();

	try {
		vm.runInNewContext(sourceCode, context);
	} catch (e) {
		throw "Got a problem with a nexl source : " + e;
	}

	return context;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function parseAndPushVariableItem(varDeclaration, result) {
	for (var i = 0; i < varDeclaration.declarations.length; i++) {
		var item = varDeclaration.declarations[i];
		var variableInfo = {};

		variableInfo.name = item.id.name;
		if (item.init !== null) {
			variableInfo.type = item.init.type;
		}

		result.push(variableInfo);
	}
}

function parseAndPushExpressionItem(item, result) {
	if (item.expression.left === undefined || item.expression.left.name === undefined) {
		return;
	}

	var variableInfo = {
		type: item.expression.right.type,
		name: item.expression.left.name
	};

	result.push(variableInfo);
}

function parseAndPushFunctionItem(item, result) {
	var variableInfo = {
		type: item.type,
		name: item.id.name
	};

	result.push(variableInfo);
}

function parseAndPushSourceCodeItem(item, result) {
	switch (item.type) {
		case 'VariableDeclaration': {
			parseAndPushVariableItem(item, result);
			return;
		}

		case 'ExpressionStatement' : {
			parseAndPushExpressionItem(item, result);
			return;
		}

		case 'FunctionDeclaration' : {
			parseAndPushFunctionItem(item, result);
			return;
		}
	}
}

function resolveJsVariables(nexlSource) {
	var sourceCode = new NexlSourceCodeAssembler(nexlSource).assemble();
	var parsedCode = esprima.parse(sourceCode).body;
	var result = [];

	for (var i = 0; i < parsedCode.length; i++) {
		var item = parsedCode[i];
		parseAndPushSourceCodeItem(item, result);
	}

	return result;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// exports
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.createContext = createContext;
module.exports.resolveJsVariables = resolveJsVariables;