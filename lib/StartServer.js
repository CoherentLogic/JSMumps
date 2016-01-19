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

var fs = require('fs');
var jsmConfig = JSON.parse(fs.readFileSync('WebServerConfig.json', 'utf8'));
var jsmContexts = [];
var context = "";

var jsmServer = require('./JSMWebServer');

for(context in jsmConfig.contexts) {
    
    jsmContexts[context] = new jsmServer.Server(jsmConfig.contexts[context]);
    jsmContexts[context].start();

}
