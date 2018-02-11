const TestRunner = require('./src/test-runner.js');
const start = require('./start.json');

const jobRunner = new TestRunner(start);
jobRunner.run();