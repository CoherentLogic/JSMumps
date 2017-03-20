const path = require('path');
const chalk = require('chalk');

const jsmumps = require('../lib/jsmumps');
const m = new jsmumps.JSMumps({
    workerCount: 5,
    logLevel: 4
});

var testObj = {
    users: {
        bjones: {
            email: "bjones@nowhere.com",
            name: "Barb Jones"
        },
        gfox: {
            email: "gfox@nowhere.com",
            name: "Greg Fox"
        },
        pwilson: {
            email: "pwilson@nowhere.com",
            name: "Paul Wilson"
        },
        qhastert: {
            email: "qhastert.com",
            name: "Quentin Hastert"
        }
    }
};

for(var i = 1; i < 100; i++) {
m.kill("KBBMTEST", [i], (err, data) => {
    if(!err) {
        m.setObject("KBBMTEST", [i], testObj, (err, data) => {
            if(err) {
                failure("could not set up test data");
            }

            m.get("KBBMTEST", [i, "users", "bjones", "name"], (err, data) => {
                if(err) failure(err.message);
                if(data.data !== "Barb Jones") failure("data mismatch");

                success("get() succeeded");
            });
        });
    }
    else {
        failure("could not set up test data");
    }
});
}

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
