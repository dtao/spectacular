window.addEventListener('load', function() {
  var jasmineEnv = jasmine.getEnv();

  jasmineEnv.updateInterval = 1000;

  function addFailureInformation(spec, row) {
    var failures = spec.results().getItems().filter(function(result) {
      return !result.passed();
    });

    var descriptionCell = row.querySelector('.description');

    failures.forEach(function(failure) {
      var message = document.createElement('div');
      message.className = 'failure-message';
      message.textContent = failure.message;
      descriptionCell.appendChild(message);

      var trace = document.createElement('pre');
      trace.className = 'failure-trace';
      trace.textContent = failure.trace.stack;
      descriptionCell.appendChild(trace);
    });
  }

  jasmineEnv.addReporter({
    reportSpecResults: function(spec) {
      var specRow = document.getElementById('spec-' + spec.exampleId);
      var resultCell = specRow.querySelector('.result');

      if (spec.results().passed()) {
        specRow.classList.add('passed');
        resultCell.textContent = 'passed';
      } else {
        specRow.classList.add('failed');
        resultCell.textContent = 'failed';
        addFailureInformation(spec, specRow);
      }
    }
  });

  jasmineEnv.execute();
});
