var fs = require('fs');

function JSMApplication(session, request, response, parsedURL, callback)
{
    this.io = require('socket.io');
    
    var configFile = parsedURL.documentRoot + parsedURL.basePath + "app.json";

    try {
	this.config = JSON.parse(fs.readFileSync(configFile));

	var contextModule = parsedURL.documentRoot + parsedURL.basePath + this.config.contextModule;



	session.server.writeLog("Attempting to load application context module " + contextModule);
    }
    catch (ex) {}

    try {
	this.context = require(contextModule);

	
	var result = this.context.init({session: session,
					request: request,
					response: response});

	session.server.writeLog("Starting websocket listener");
	this.listener = this.io.listen(session.server.server);
	
	var tcontext = this.context;
	this.listener.sockets.on('connection', function(socket) {
	    console.log("WebSocket Connected");
	    if(tcontext.onConnected) {
		tcontext.onConnected();
	    }

	    if(tcontext.onMessage) {
		socket.on('message', tcontext.onMessage);
	    }
	});

	if(callback) {
	    callback(null, result);
	} 
    }
    catch(ex) {
	session.server.writeLog("Failed to load " + contextModule + " (" + ex + ")");
	callback(ex, null);
    }
    
    return(this);
}

module.exports = {
    JSMApplication: JSMApplication
};
