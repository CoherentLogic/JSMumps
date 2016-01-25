/*
 * StartServer.js
 *  Server startup routine
 *
 * Copyright (C)  Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 * This file is part of JSMumps.
 * 
 * JSMumps is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * JSMumps is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


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
