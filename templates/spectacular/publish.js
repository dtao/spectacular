var fs = require('fs');

function getClassData(doclet, doclets) {
  var classData = getMethodData(doclet);

  var nameMatcher = new RegExp('^' + classData.name);
  classData.methods = doclets
    .filter(function(doclet) { return doclet.kind === 'function'; })
    .filter(function(doclet) { return nameMatcher.test(doclet.longname); })
    .map(getMethodData);

  return classData;
}

function getMethodData(doclet) {
  return {
    longname: doclet.longname,
    name: doclet.name,
    description: doclet.description,
    scope: doclet.scope,
    params: doclet.params,
    returns: doclet.returns,
    examples: getExamples(doclet),
    comparisons: getComparisons(doclet)
  };
}

function getExamples(doclet) {
  return getShortExamples(doclet).concat(doclet.examples || []);
}

function getShortExamples(doclet) {
  if (!doclet.tags) { return []; }

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
  return lines.map(getExampleCase);
}

function getExampleCase(text) {
  var parts = text.split(/\s*\/{2}\s*=>\s*/, 2); // matches: '// =>'

  if (parts.length < 2) {
    return undefined;
  }

  var actual = parts[0];
  var expected = parts[1];
  var throwsError = expected === '(error)';

  var description = throwsError ?
    ('throws an error for ' + actual) :
    ('returns ' + expected + ' for ' + actual);

  return {
    exampleId: getExampleId(),
    description: description,
    actual: actual,
    expected: expected,
    throwsError: throwsError
  };
}

function getComparisons(doclet) {
  if (!doclet.tags) { return []; }

  var comparisonCases = doclet.tags
    .filter(function(tag) { return tag.originalTitle === 'compareTo'; })
    .map(function(tag) { return getComparisonCase(tag.text); });

  return comparisonCases;
}

function getComparisonCase(tag) {
  var lines = tag.split('\n');
  var name = lines[0];

  return {
    name: name,
    examples: lines.slice(1).map(function(text) {
      var exampleCase = getExampleCase(text);
      exampleCase.description = 'returns the same result as ' + name + ' for ' + exampleCase.actual;
      return exampleCase;
    })
  };
}

var exampleIdCounter = 1;
function getExampleId() {
  return exampleIdCounter++;
}

exports.publish = function(data, opts) {
  data({ undocumented: true }).remove();

  var doclets = data().get();

  var classes = doclets
    .filter(function(doclet) { return doclet.kind === 'class'; })
    .map(function(doclet) { return getClassData(doclet, doclets); });

  var methods = doclets
    .filter(function(doclet) { return doclet.kind === 'function'; })
    .filter(function(doclet) { return !(/[#\.]/).test(doclet.longname); })
    .map(getMethodData);

  var dataToPublish = {
    classes: classes,
    methods: methods
  };

  console.log(JSON.stringify(dataToPublish));
};
