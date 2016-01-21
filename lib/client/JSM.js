
function _JSM()
{
    this.io = io.connect();

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
		    this.writeLog("JSM.Application." + msg.type + " is not a function");
		}
	    }
	    else {
		this.writeLog("JSM.Application." + msg.type + " is undefined");
	    }
	}
	else {
	    this.writeLog("Malformed message received (no 'type' field)");
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
