/*
 * test-import.js
 * Test the import() API
 *
 * Requires KBBMJSMT routine.
 */

module.exports = {
    name: "import()",
    tests: [{
        description: "procedure with arguments (async)",
        type: "INTEGRATION",
        async: true,
        test: function (testRunner) {
            const jsmtAsync = testRunner.jsm.import("KBBMJSMT", true);

            jsmtAsync.procArguments(1, 2, 3, (err, result) => {
                if(err) {
                    testRunner.failure();
                }
                else {
                    testRunner.success();
                }
            });
        }
    }, {
        description: "procedure without arguments (async)",
        type: "INTEGRATION",
        async: true,
        test: function (testRunner) {
            const jsmtAsync = testRunner.jsm.import("KBBMJSMT", true);

            jsmtAsync.procNoArguments((err, result) => {
                if(err) {
                    testRunner.failure();
                }
                else {
                    testRunner.success();
                }
            });
        }
    }, {
        description: "extrinsic function with arguments (async)",
        type: "INTEGRATION",
        async: true,
        test: function (testRunner) {
            const jsmtAsync = testRunner.jsm.import("KBBMJSMT", true);

            jsmtAsync.funcArguments(1, 2, 3, (err, result) => {
                if(err) {
                    testRunner.failure();
                }
                else {
                    testRunner.success();
                }
            });
        }
    }, {
        description: "extrinsic function without arguments (async)",
        type: "INTEGRATION",
        async: true,
        test: function (testRunner) {
            const jsmtAsync = testRunner.jsm.import("KBBMJSMT", true);

            jsmtAsync.funcNoArguments((err, result) => {
                if(err) {
                    testRunner.failure();
                }
                else {
                    testRunner.success();
                }
            });
        }
    }]
};