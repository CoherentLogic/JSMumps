
const chalk = require('chalk');

/*
 *  moduleName: a string 
 *
 *  logLevel: 0 = no logging
 *            1 = error
 *            2 = warning
 *            3 = info
 *            4 = debug
 *
 */
function Logger(opts) {

    if(opts) {
        this.logLevel = opts.logLevel || 2;
        this.moduleName = opts.moduleName || "LOG";
    }
    else {
        this.logLevel = 2;
        this.moduleName = "";
    }


    return this;
}

Logger.prototype.debug = function (msg) {

    var curDate = new Date();

    if(this.logLevel >= 4) {
        console.error(chalk.bold.blue(curDate + " " + this.moduleName + " DEBUG:  " + msg));
    }

};

Logger.prototype.info = function (msg) {

    var curDate = new Date();

    if(this.logLevel >= 3) {
        console.error(chalk.bold.green(curDate + " " + this.moduleName + " INFO:  " + msg));
    }

};

Logger.prototype.warning = function (msg) {

    var curDate = new Date();

    if(this.logLevel >= 2) {
        console.error(chalk.bold.orange(curDate + " " + this.moduleName + " WARNING:  " + msg));
    }

};

Logger.prototype.error = function (msg) {

    var curDate = new Date();

    if(this.logLevel >= 1) {
        console.error(chalk.bold.red(curDate + " " + this.moduleName + " ERROR:  " + msg));
    }

};

module.exports = {
    Logger: Logger
};