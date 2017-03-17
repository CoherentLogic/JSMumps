const path = require('path');
const chalk = require('chalk');

const jsmumps = require('../lib/jsmumps');
const m = new jsmumps.JSMumps();

m.kill("KBBMTEST", [], (err, data) => {
    if(!err) {
        m.set("KBBMTEST", [], "Barb Jones", (err, data) => {
            if(err) {
                failure("set() failed");
            }

            m.get("KBBMTEST", [], (err, data) => {
                if(err) failure(err.message);
                if(data.data !== "Barb Jones") failure("data mismatch");

                success("set() succeeded");
            });
        });
    }
    else {
        failure("could not set up test data");
    }
});

function scriptPath()
{
    return path.basename(__filename);
}


function success(msg)
{
    console.error(chalk.bold.green("[" + scriptPath() + "] SUCCESS: " + msg));

    process.exit(0);
}

function failure(msg)
{
    console.error(chalk.bold.red("[" + scriptPath() + "] FAILURE: " + msg));

    process.exit(1); 
}
