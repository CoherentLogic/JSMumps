/*
 * JSM.js
 *  JSM client support library
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



function _JSM()
{
    this.io = io.connect();

    that = this;

    this.io.on('jsm_message', function(msg) {
	if(msg.type) {
	    if(JSM.Application[msg.type]) {
		if(typeof JSM.Application[msg.type] === "function") {
		    if(msg.data) {
			JSM.Application[msg.type](msg.data);
		    }
		    else {
			JSM.Application[msg.type]("");
		    }
		}
		else {
		    that.writeLog("JSM.Application." + msg.type + " is not a function");
		}
	    }
	    else {
		that.writeLog("JSM.Application." + msg.type + " is undefined");
	    }
	}
	else {
	    that.writeLog("Malformed message received (no 'type' field)");
	}
    });
}

_JSM.prototype.send = function(type, data) {
    this.io.emit('jsm_message',
		 {type: type,
		  data: data});
};

_JSM.prototype.writeLog = function(msg) {
    console.log("JSMumps Client: " + msg);
};

var JSM = new _JSM();
