const chalk = require('chalk');
const JSMumps = require('../lib/jsmumps');

const spec = require(process.argv[2]);

function JSMTestRunner(testModule)
{
    this.jsm = new JSMumps({logLevel: 3});
    this.test = require(testModule);
    this.successes = 0;
    this.failures = 0;
    this.needed = this.test.tests.length;

    process.stdout.write(chalk.blue(this.test.name + "   [" + this.needed + " TEST(S)]\n"));

    return this;
}

JSMTestRunner.prototype.run = function() {

    var self = this;

    const tests = this.test.tests;

    for(var i in tests) {

        var curTest = parseInt(i) + 1;
        if(tests[i].async) {
            var testType = "ASYNCHRONOUS";
        }
        else {
            var testType = "SYNCHRONOUS";
        }
        process.stdout.write(chalk.blue("   TEST " + curTest + " OF " + tests.length + "   [" + tests[i].type + "/" + testType + "]:  "));
        process.stdout.write(chalk.blue(tests[i].description + "\n"));

        tests[i].test(this);   
    }



    setTimeout(() => {
        if(self.successes === self.needed) {
            console.log(chalk.bold.green("ALL TESTS PASSED FOR DRILL [" + self.test.name + "]"));
        }
        else {
            console.log(chalk.bold.red(self.failures + " TESTS FAILED FOR DRILL [" + self.test.name + "]"));
        }
    }, 2000);


}

JSMTestRunner.prototype.success = function() {
    this.successes++;
}

JSMTestRunner.prototype.failure = function() {
    this.failures++;
}

function JSMTestSuite(tests)
{
    this.tests = tests;

    console.log("JSMumps Testing Framework v0.01\n  Copyright (C) 2017 Coherent Logic Development\n\n");

    return this;
}

JSMTestSuite.prototype.run = function() {
    console.log(chalk.blue("   SUITE: " + this.tests.length + " DRILL(S)"))
    for(var i in this.tests) {
        var curDrill = parseInt(i) + 1;
        process.stdout.write(chalk.blue("   DRILL " +  curDrill + " OF " + this.tests.length + ": "));
        var module = "../test/test-" + this.tests[i];
        var runner = new JSMTestRunner(module);
        var success = runner.run();
    }
}

const testSuite = new JSMTestSuite(spec);

testSuite.run();

setTimeout(() => {
    process.exit(0);
}, 5000);