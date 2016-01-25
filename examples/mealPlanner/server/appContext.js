var Application = {

    init: function(options) {
	return(true);
    },

    onConnected: function() {

    },

    getDishes: function(options) {	
	
	var subscript = "";
	var dishes = {};
	var record = {};

	do {
	    subscript = this.JSM.nextSync("KBBMMEAL", ["Dishes", options.category, subscript]);
	    if(subscript != "") {
		dishes[subscript] = this.JSM.getSync("KBBMMEAL", ["Dishes", options.category, subscript]);
	    }
	} while (subscript != "")

	this.JSM.send("gotDishes", dishes);

    },

};

module.exports = Application;
