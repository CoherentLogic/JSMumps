


function JSMSocketServer(server)
{
    this.io = require("socket.io");    
    server.writeLog("Starting WebSocket Listener");
    this.io.listen(server.server);

    return(this);
}

module.exports = {
    JSMSocketServer: JSMSocketServer
};
