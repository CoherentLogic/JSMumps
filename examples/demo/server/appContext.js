var Application = {

    init: function(options) {
	console.log("This application is far worse than moo shu pork!");

	return(true);
    },

    onConnected: function() {
	console.log("Woohoo! Client connected!");
    },

    onMessage: function(data) {
	console.log("Got message from client");
	console.log(data);
    }

};

module.exports = Application;