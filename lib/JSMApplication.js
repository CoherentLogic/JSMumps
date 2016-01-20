
function JSMApplication(session, request, response, parsedURL, callback)
{
    var contextModule = parsedURL.documentRoot + parsedURL.basePath + "appContext.js";

    session.server.writeLog("Attempting to load application context module " + contextModule);
    try {
	this.context = require(contextModule);

	
	var result = this.context.init({session: session,
					request: request,
					response: response});

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
