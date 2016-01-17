/*
 * JSMumps
 *  Asynchronous Web Server for NodeM
 *
 * StartServer.js - core web server object
 *
 * John Willis <jpw@coherent-logic.com>
 * Copyright (C) 2016 Coherent Logic Development LLC
 *
 */

var FS = require('fs');
var JSMConfig = JSON.parse(FS.readFileSync('WebServerConfig.json', 'utf8'));

var JSMContexts = [];
var Context = "";

var JSM = require('./JSMWebServer');

for(Context in JSMConfig.Contexts) {
    
    JSMContexts[Context] = new JSM.Server(JSMConfig.Contexts[Context]);
    JSMContexts[Context].Start();

}
