#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var restler = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};



var checkHtml = function(html, checksfile, t, callback) {
    var doFinal = function() {

    if($ === undefined) {
	throw new Error('problem trying to check html');
    }

    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    callback(out);
    };

    var $;
    var urlCallback = function(result, error) {
	if(error !== undefined) {
	throw new Error('Problem trying to access url: ' + error);
	}

	$ = result; // result is a cheerio instance
	doFinal();
    };
    var checkHtmlUrl = function() {
	cheerioRestlerHtmlUrl(urlCallback, html);
    };
    var checkHtmlFile = function() {
	$ = cheerioHtmlFile(html);
	doFinal();
    };

    if(t === 'url') {
	checkHtmlUrl();
    } else if(type === 'file') {
	checkHtmlFile();
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// callback is called once growler has completed the request
// callback(result, error)
// callback 'result' is a cheerio instance with the page loaded in (on success)
var cheerioRestlerHtmlUrl = function(callback, url) {
  restler.get(url).on('complete', function(result) {
    if(result instanceof Error) {
      console.log('Error while trying to parse ' + url + ': ' + result.message);
	callback(result, result.message);
    } else { // OK
      callback(cheerio.load(result));
    }
  });
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <html_url>', 'URL to index.html')
	.parse(process.argv);

    var printResult = function(rslt) {
	var outJson = JSON.stringify(rslt, null, 4);
	console.log(outJson);
    };

    var type;
    if(program.url) {
	type = "url";
	checkHtml(program.url, program.checks, type, printResult);
    } else if(program.file) {
	type = "file";
	checkHtml(program.file, program.checks, type, printResult);
    } else {
	type = "file"; // Defaults to file
	checkHtml(program.file, program.checks, type, printResult);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
