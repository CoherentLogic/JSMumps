const jsmumps = require('../lib/jsmumps');
const jsm = new jsmumps.JSMumps();

const utils = {
    mockData: function(callback) {
        
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

        jsm.kill("KBBMTEST", [], (err, data) => {
            if(!err) {
                jsm.setObject("KBBMTEST", [], testObj, (err, data) => {
                    if(!err) {
                        callback();
                    }
                    else {
                        throw("Could not set up mock data.");
                    }
                });
            }
            else {
                throw("Could not set up mock data.");
            }
        });
    
        return;
    }
};

module.exports = utils;