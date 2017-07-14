/*
 * test-import.js
 * Test the import() API
 *
 * Requires KBBMJSMT routine.
 */

const path = require('path');
const chalk = require('chalk');
const JSMumps = require('../lib/jsmumps');

// instantiate JSMumps
const jsm = new JSMumps();

// test async
const jsmtAsync = jsm.import("KBBMJSMT", true);

console.log("Testing procedure with arguments (async)");
jsmtAsync.procArguments(1, 2, 3, (err, result) => {
    if(err) {
        failure("Error calling procedure with arguments (async)");
    }
    else {
        success("Procedure with arguments (async) result: " + result.result);
    }
});

console.log("Testing procedure without arguments (async)");
jsmtAsync.procNoArguments((err, result) => {
    if(err) {
        failure("Error calling procedure without arguments (async)");
    }
    else {
        success("Procedure with arguments (async) result: " + result.result);
    }
});

console.log("Testing extrinsic function with arguments (async)");
jsmtAsync.funcArguments(1, 2, 3, (err, result) => {
    if(err) {
        failure("Error calling extrinsic function with arguments (async)");
    }
    else {
        success("Extrinsic function with arguments (async) result: " + result.result);
    }
});

console.log("Testing extrinsic function without arguments (async)");
jsmtAsync.funcNoArguments((err, result) => {
    if(err) {
        failure("Error calling extrinsic function without arguments (async)");
    }
    else {
        success("Extrinsic function without arguments (async) result: " + result.result);
    }
});

function scriptPath()
{
    return path.basename(__filename);
}

function success(msg)
{
    console.error(chalk.bold.green("[" + scriptPath() + "] SUCCESS: " + msg));

    //process.exit(0);
}

function failure(msg)
{
    console.error(chalk.bold.red("[" + scriptPath() + "] FAILURE: " + msg));

    //process.exit(1); 
}