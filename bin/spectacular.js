#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var exec     = require('child_process').exec;
var Mustache = require('mustache');
var wrench   = require('wrench');

function ensureDirectoryExists(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function copyFile(source, dest) {
  var filename = path.basename(source);
  var content = fs.readFileSync(source, 'utf-8');
  fs.writeFileSync(path.join(dest, filename), content, 'utf-8');
}

var directory = process.argv[2] || process.cwd();
var config = JSON.parse(fs.readFileSync(path.join(directory, 'spectacular.json'), 'utf-8'));
var mainPath = path.join(directory, config.main + '.js');
var templatePath = path.join(__dirname, '../templates/spectacular');
exec('jsdoc ' + mainPath + ' --template ' + templatePath, function(error, stdout) {
  if (error) {
    console.log('Error: ' + error);
    return;
  }

  var methods   = JSON.parse(stdout);
  var outputDir = path.join(directory, config.outputDir);

  ensureDirectoryExists(outputDir);

  if (config.assetDirs) {
    config.assetDirs.forEach(function(assetDir) {
      var folderName = path.basename(assetDir);
      wrench.copyDirSyncRecursive(path.join(directory, assetDir), path.join(outputDir, folderName));
    });
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

  var specDirectory = path.join(outputDir, 'spec');
  ensureDirectoryExists(specDirectory);

  var mainFilename = path.basename(config.main);
  fs.writeFileSync(path.join(specDirectory, mainFilename + '_spec.js'), specJs);
});
