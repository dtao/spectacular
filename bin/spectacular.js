#!/usr/bin/env node

var fs       = require('fs');
var path     = require('path');
var exec     = require('child_process').exec;

var glob     = require('glob');
var LESS     = require('less');
var Mustache = require('mustache');
var SASS     = require('sass');
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

// TODO: It seriously just occurred to me that this script could use some good
// ol' refactoring (already)!

exec('jsdoc ' + mainPath + ' --template ' + templatePath, function(error, stdout) {
  if (error) {
    console.error(error);
    return;
  }

  var data = JSON.parse(stdout);
  var outputDir = path.join(directory, config.outputDir);

  ensureDirectoryExists(outputDir);

  if (config.assetDirs) {
    config.assetDirs.forEach(function(assetDir) {
      var folderName = path.basename(assetDir);
      var source = path.join(directory, assetDir);
      var destination = path.join(outputDir, folderName);
      console.log('Copying ' + source + ' folder to ' + destination + '...');
      wrench.copyDirSyncRecursive(source, destination, { forceDelete: true });

      var lessFiles = glob.sync('*.less', { cwd: destination });
      lessFiles.forEach(function(lessFile) {
        console.log('Compiling ' + lessFile + '...');
        var less = fs.readFileSync(path.join(destination, lessFile), 'utf-8');

        var parser = new LESS.Parser({
          paths: [destination],
          filename: lessFile
        });

        parser.parse(less, function(err, tree) {
          if (err) {
            console.error(err);
            return;
          }

          var basename = path.basename(lessFile, '.less');
          fs.writeFileSync(path.join(destination, basename + '.css'), tree.toCSS());
        });
      });

      var sassFiles = glob.sync('*.sass', { cwd: destination });
      sassFiles.forEach(function(sassFile) {
        console.log('Compiling ' + sassFile + '...');

        // TODO: Figure out why this doesn't work so well using the sass module.
        // var sass = fs.readFileSync(path.join(destination, sassFile), 'utf-8');
        // var css = SASS.render(sass);
        // var basename = path.basename(sassFile, '.sass');
        // fs.writeFileSync(path.join(destination, basename + '.css'), css);

        var basename = path.basename(sassFile, '.sass');
        exec('sass ' + path.join(destination, sassFile) + ' ' + path.join(destination, basename + '.css'), function(err) {
          if (err) {
            console.error(err);
          }
        });
      });
    });
  }

  var mainFilename = path.basename(config.main, '.js');
  copyFile(path.join(directory, config.main + '.js'), outputDir);

  var pageTemplate = fs.readFileSync(path.join(templatePath, 'index.mustache'), 'utf-8');
  var pageHtml = Mustache.render(pageTemplate, {
    title: config.title,
    htmlTitle: config.htmlTitle || config.title,
    stylesheets: config.stylesheets,
    main: mainFilename,
    classes: data.classes,
    methods: data.methods
  });
  fs.writeFileSync(path.join(outputDir, 'index.html'), pageHtml);

  var specsTemplate = fs.readFileSync(path.join(templatePath, 'jasmine.mustache'), 'utf-8');
  var specJs = Mustache.render(specsTemplate, {
    title: config.title,
    methods: data.methods
  });

  var specDirectory = path.join(outputDir, 'spec');
  ensureDirectoryExists(specDirectory);

  fs.writeFileSync(path.join(specDirectory, mainFilename + '_spec.js'), specJs);

  data.classes.forEach(function(pseudoclass) {
    var classSpec = Mustache.render(specsTemplate, {
      title: pseudoclass.name,
      methods: pseudoclass.methods
    });

    fs.writeFileSync(path.join(specDirectory, pseudoclass.name + '_spec.js'), classSpec);
  });

  var specSupportDirectory = path.join(specDirectory, 'support');
  ensureDirectoryExists(specSupportDirectory);
  copyFile(path.join(templatePath, 'jasmine.js'), specSupportDirectory);
  copyFile(path.join(templatePath, 'spec_reporter.js'), specSupportDirectory);
});
