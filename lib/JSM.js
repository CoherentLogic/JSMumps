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
				    if(data.defined) {
					deferred.resolve(data.data);
				    }
				    else {
					deferred.reject("Undefined");
				    }
				}
			    });

	return(deferred.promise.nodeify(callback));

    };

    this.getSync = function(global, subscripts) {
	
	var result = db.get({global: global, 
			     subscripts: subscripts});

	if(result.defined) {
	    return(result.data);
	}
	else {
	    throw("Undefined");
	}

    };

    this.set = function(global, subscripts, value, callback) {
	
	var deferred = Q.defer();

	var result = db.set({global: global,
			     subscripts: subscripts,
			     value: value},
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

    this.setSync = function(global, subscripts, value) {

	var result = db.set({global: global,
			     subscripts: subscripts,
			     value: value});

	return(result);

    };

    this.kill = function(global, subscripts, callback) {

	var deferred = Q.defer();

	var result = db.kill({global: global,
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

    this.killSync = function(global, subscripts) {
	
	var result = db.kill({global: global,
			      subscripts: subscripts});

	return(result);
    };

    this.merge = function(srcGlobal, srcSubscripts, dstGlobal, dstSubscripts, callback) {

	var deferred = Q.defer();

	var result = db.merge({to: {global: dstGlobal,
				    subscripts: dstSubscripts},
			       from: {global: srcGlobal,
				      subscripts: srcSubscripts}},
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

    this.mergeSync = function(srcGlobal, srcSubscripts, dstGlobal, dstSubscripts) {

	var result = db.merge({to: {global: dstGlobal,
				    subscripts: dstSubscripts},
			       from: {global: srcGlobal,
				      subscripts: srcSubscripts}});

	return(result);

    };
    
    this.lock = function(global, subscripts, callback) {
	
	var deferred = Q.defer();

	var result = db.lock({global: global,
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

    this.lockSync = function(global, subscripts) {

	var result = db.lock({global: global,
			      subscripts: subscripts});

	return(result);

    };
    
    this.unlock = function(global, subscripts, callback) {

	var deferred = Q.defer();

	var result = db.unlock({global: global,
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

    this.unlockSync = function(global, subscripts) {

	var result = db.unlock({global: global,
				subscripts: subscripts});

	return(result);

    };

    this.unlockAll = function(callback) {

	var deferred = Q.defer();

	var result = db.unlock(function (err, data) {
	    if(err) {
		deferred.reject(err);
	    }
	    else {
		deferred.resolve(data);
	    }
	});

	return(deferred.promise.nodeify(callback));
	
    };

    this.unlockAllSync = function() {

	var result = db.unlock();

	return(result);

    };

    this.encodeDataReturn = function(dataReturn) {

	var isDefined = false;
	var hasData = false;
	var hasSubnodes = false;

	switch(dataReturn) {
	case 0:
	    isDefined = false;
	    hasData = false;
	    hasSubnodes = false;
	    break;
	case 1:
	    isDefined = true;
	    hasData = true;
	    hasSubnodes = false;
	    break;
	case 10:
	    isDefined = true;
	    hasData = false;
	    hasSubnodes = true;
	    break;
	case 11:
	    isDefined = true;
	    hasData = true;
	    hasSubnodes = true;
	    break;
	}

	return({isDefined: isDefined,
		hasData: hasData,
		hasSubnodes: hasSubnodes});

    };
    
    this.data = function(global, subscripts, callback) {

	var deferred = Q.defer();

	var result = db.data({global: global,
			      subscripts: subscripts},
			     function(err, data) {
				 if(err) {
				     deferred.reject(err);
				 }
				 else {
				     deferred.resolve(this.encodeDataReturn(data.defined));
				 }
			     });

	return(deferred.promise.nodeify(callback));

    };

    this.dataSync = function(global, subscripts) {

	var result = db.data({global: global,
			      subscripts: subscripts});

	return(this.encodeDataReturn(result.defined));

    };
    
    this.next = function(global, subscripts, result, callback) {
	
	var deferred = Q.defer();

	var res = db.order({global: global,
			    subscripts: subscripts,
			    result: result},
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

    this.nextSync = function(global, subscripts, result) {
	
	var res = db.order({global: global,
			    subscripts: subscripts,
			    result: result});

	return(res);

    };
    
    this.previous = function(global, subscripts, result, callback) {

	var deferred = Q.defer();

	var res = db.previous({global: global,
			       subscripts: subscripts,
			       result: result},
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
    
    this.previousSync = function(global, subscripts, result) {
	
	var res = db.previous({global: global,
				  subscripts: subscripts,
				  result: result});

	return(res);
	
    };
    
    this.nextNode = function(global, subscripts, result, callback) {
	
	var deferred = Q.defer();

	var res = db.next_node({global: global,
				subscripts: subscripts,
				result: result},
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

    this.nextNodeSync = function(global, subscripts, result) {

	var res = db.next_node({global: global,
				subscripts: subscripts,
				result: result});

	return(res);
	
    };

    this.previousNode = function(global, subscripts, result, callback) {

	var deferred = Q.defer();

	var res = db.previous_node({global: global,
				    subscripts: subscripts,
				    result: result},
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

    this.previousNodeSync = function(global, subscripts, result) {
	
	var res = db.previous_node({global: global,
				    subscripts: subscripts,
				    result: result});

	return(res);

    };    
    
    this.version = function(callback) {

	var deferred = Q.defer();

	var result = db.version(function(err, data) {
	    if(err) {
		deferred.reject(err);
	    }
	    else {
		deferred.resolve(data);
	    }
	});

	return(deferred.promise.nodeify(callback));

    };

    this.versionSync = function() {
	
	var result = db.version();

	return(result);

    };
    
    this.call = function(fn, args, callback) {
	
	var deferred = Q.defer();

	var result = db.function({"function": fn,
				  "arguments": args},
				 function(err, data) {
				     if(err) {
					 deferred.reject(err);
				     }
				     else {
					 deferred.resolve(data.result);
				     }
				 });

	return(deferred.promise.nodeify(callback));

    };

    this.callSync = function(fn, args) {

	var result = db.function({"function": fn,
				  "arguments": args});

	return(result.result);

    };    

    this.increment = function(global, subscripts, callback) {

	var deferred = Q.defer();

	var result = db.increment({global: global,
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

    this.incrementSync = function(global, subscripts) {
    
	var res = db.increment({global: global,
				subscripts: subscripts});

	return(res);

    };

    return(this);
}


module.exports = {
    init: JSM
};
