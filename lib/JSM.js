var Q = require('q');

function JSM(socket, db) {


    this.send = function(type, data) {
	socket.emit('jsm_message',
		    {type: type,
		     data: data});
    };

    this.get = function(global, subscripts, callback) {

	var deferred = Q.defer();

	var result = db.get({global: global,
			     subscripts: subscripts},
			    function(err, data) {
				if(err) {
				    deferred.reject(err);
				}
				else {
				    deferred.resolve(data);
				}
			    });

	return(deferred.promise.nodeify(callback));

    };

    return(this);
}

JSM.prototype.set = function(global, subscripts, value, callback) {

};

JSM.prototype.kill = function(global, subscripts, callback) {

};

JSM.prototype.merge = function(srcGlobal, srcSubscripts, dstGlobal, dstSubscripts, callback) {

};

JSM.prototype.lock = function(global, subscripts, callback) {

};

JSM.prototype.unlock = function(global, subscripts, callback) {
    
    // calling with no arguments will do a global unlock
};

JSM.prototype.data = function(global, subscripts, callback) {

};

JSM.prototype.order = function(global, subscripts, callback) {

};

JSM.prototype.previous = function(global, subscripts, callback) {

};

JSM.prototype.query = function(glvn, callback) {

};

JSM.prototype.version = function(callback) {

};

JSM.prototype.call = function(fn, args, callback) {

};

module.exports = {
    init: JSM
};
