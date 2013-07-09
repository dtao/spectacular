#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var exec     = require('child_process').exec;
var Mustache = require('mustache');

function copyFile(source, dest) {
  var filename = path.basename(source);
  var content = fs.readFileSync(source, 'utf-8');
  fs.writeFileSync(path.join(dest, filename), content, 'utf-8');
}

var directory = process.argv[2] || process.cwd();
var templatePath = path.join(__dirname, '../templates/spectacular');
exec('jsdoc --recurse ' + directory + ' --template ' + templatePath, function(error, stdout) {
  if (error) {
    console.log('Error: ' + error);
    return;
  }

  var methods   = JSON.parse(stdout);
  var config    = JSON.parse(fs.readFileSync(path.join(directory, 'spectacle.json'), 'utf-8'));
  var outputDir = path.join(directory, config.outputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  copyFile(path.join(directory, config.main + '.js'), outputDir);
  copyFile(path.join(templatePath, 'jasmine.js'), outputDir);
  copyFile(path.join(templatePath, 'spec_reporter.js'), outputDir);

  var pageTemplate = fs.readFileSync(path.join(templatePath, 'index.mustache'), 'utf-8');
  var pageHtml = Mustache.render(pageTemplate, {
    title: config.title,
    stylesheets: config.stylesheets,
    main: config.main,
    methods: methods
  });
  fs.writeFileSync(path.join(outputDir, 'index.html'), pageHtml);

  var specsTemplate = fs.readFileSync(path.join(templatePath, 'specs.mustache'), 'utf-8');
  var specJs = Mustache.render(specsTemplate, {
    title: config.title,
    methods: methods
  });
  fs.writeFileSync(path.join(outputDir, config.main + '_spec.js'), specJs);
});
