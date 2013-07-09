var fs       = require('fs');
var Mustache = require('./mustache.js');

function getMethodData(doclet) {
  return {
    longname: doclet.longname,
    name: doclet.name,
    description: doclet.description,
    scope: doclet.scope,
    params: doclet.params,
    returns: doclet.returns,
    examples: getExamples(doclet)
  };
}

function getExamples(doclet) {
  return getShortExamples(doclet).concat(doclet.examples || []);
}

function getShortExamples(doclet) {
  if (!doclet.tags) {
    return [];
  }

  var exampleCases = doclet.tags
    .filter(function(tag) { return tag.originalTitle === 'examples' })
    .map(function(tag) { return getExampleCases(tag.text); });

  // Flatten example cases into one array.
  var shortExamples = [];
  exampleCases.forEach(function(cases) {
    cases.forEach(function(exampleCase) {
      if (typeof exampleCase !== 'undefined') {
        shortExamples.push(exampleCase);
      }
    });
  });

  return shortExamples;
}

function getExampleCases(tag) {
  var lines = tag.split('\n');

  return lines.map(function(line) {
    var parts = line.split(/\s*\/{2}\s*=>\s*/, 2); // matches: '// =>'

    if (parts.length < 2) {
      return undefined;
    }

    var actual = parts[0];
    var expected = parts[1];
    var description = 'returns ' + expected + ' for ' + actual;

    return {
      exampleId: getExampleId(),
      description: description,
      actual: actual,
      expected: expected
    };
  });
}

var exampleIdCounter = 1;
function getExampleId() {
  return exampleIdCounter++;
}

exports.publish = function(data, opts) {
  var doclets = data().get();

  var config = JSON.parse(fs.readFileSync('spectacle.json', 'utf-8'));

  var methods = doclets
    .filter(function(doclet) { return doclet.kind === 'function'; })
    .map(getMethodData);

  fs.copyFileSync(config.main + '.js', config.outputDir);
  fs.copyFileSync('templates/spectacular/jasmine.js', config.outputDir);
  fs.copyFileSync('templates/spectacular/spec_reporter.js', config.outputDir);

  var pageTemplate = fs.readFileSync('templates/spectacular/index.mustache', 'utf-8');
  var pageHtml = Mustache.render(pageTemplate, {
    title: config.title,
    stylesheets: config.stylesheets,
    main: config.main,
    methods: methods
  });
  fs.writeFileSync(config.outputDir + '/index.html', pageHtml, 'utf-8');

  var specsTemplate = fs.readFileSync('templates/spectacular/specs.mustache', 'utf-8');
  var specJs = Mustache.render(specsTemplate, {
    title: config.title,
    methods: methods
  });
  fs.writeFileSync(config.outputDir + '/' + config.main + '_spec.js', specJs, 'utf-8');
};
