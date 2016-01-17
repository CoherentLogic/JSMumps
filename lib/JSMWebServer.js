/*
 * JSMumps
 *  Asynchronous Web Server for NodeM
 *
 * JSMWebServer.js - core web server object
 *
 * John Willis <jpw@coherent-logic.com>
 * Copyright (C) 2016 Coherent Logic Development LLC
 *
 */


function Cache(entries)
{
    this.cache = {};
    this.cacheEntries = entries;
    
    return(this);
}

Cache.prototype.Purge = function()
{
    this.cache = {};
}

Cache.prototype.Insert = function(entry) {
    if(this.cache.length < this.cacheEntries) {
	this.cache[entry.path] = {
	    data: entry.data,
	    mtime: entry.mtime,
	    lastRef: Date.now(),
	    refCount: 1
	}
    }
    else {
	this.Purge();
	this.Insert(entry);
    }
}

Cache.prototype.Fetch = function(filePath) {

    var fs = require('fs');
    var stats = fs.statSync(filePath);
           
    // cannot cache dynamic content at all
    if(this.IsStaticContent(filePath)) {
	// check for cache entry
	if(this.cache[filePath]) {
	    // it exists. is it current?
	    var fileMTime = stats.mtime.getTime();

	    if(!stats.isFile()) {
		if(stats.isDirectory()) {
		    //TODO: return directory listing
		}
		else {
		    return({
			success: 0,
			cacheState: 'error',
			errorCode: 'NOEXIST',
			data: ''
		    });
		}
	    }
	    
	    if(fileMTime === this.cache[filePath].mtime) {
		// cache hit
		this.cache[filePath].lastRef = Date.now();
		this.cache[filePath].refCount++;
		return({
		    success: 1,
		    cacheState: 'hit',
		    errorCode: '',
		    data: this.cache[filePath].data,
		    mtime: this.cache[filePath].mtime
		});
	    }
	    else {
		// file on disk newer than cache; reload
		stats = fs.statSync(filePath);
		fileMTime = stats.mtime.getTime();
		
		var entry = {
		    path: filePath,
		    mtime: fileMTime,
		    data: fs.readFileSync(filePath)
		};

		this.Insert(entry);
		
		return({
		    success: 1,
		    cacheState: 'miss',
		    errorCode: '',
		    data: entry.data,
		    mtime: entry.mtime
		});
	    }	    

	} // is in cache
	else {
	    // file never cached
	    stats = fs.statSync(filePath);
	    fileMTime = stats.mtime.getTime();	    

	    var entry = {
		path: filePath,
		mtime: fileMTime,
		data: fs.readFileSync(filePath)
	    };

	    this.Insert(entry);

	    return({
		success: 1,
		cacheState: 'miss',
		errorCode: '',
		data: entry.data,
		mtime: entry.mtime
	    });	    
	}
    } 
    else {
	// file not cacheable

    }
	    
};

Cache.prototype.IsStaticContent = function(filePath) {
    var pth = require('path');
    var fileExt = pth.extname(filePath);

    if(fileExt.toLowerCase() != ".jsm") {
	return(true);
    }
    else {
	return(false);
    }    
};

function Server(options)
{
    
    this.Port = options.Port;
    this.Workers = options.Workers;
    this.DocumentRoot = options.DocumentRoot;
    this.Log = options.Log;

    this.MaxSessionAge = options.MaxSessionAge * 60000;
    this.Util = require('./JSMUtil');
    this.MUMPS = require('nodem');
    this.Cluster = require('cluster');
    this.DB = new this.MUMPS.Gtm();
    this.Children = new Array();
    
    var fs = require('fs');

    this.Error404 = fs.readFileSync('404.html');

    var that = this;


    Server.prototype.WriteLog = function(message) {
	var dateTime = that.Util.JSMDateTime();

	console.log(dateTime + " (PID " + process.pid + "):  " + message);
    };

    Server.prototype.OnRequest = function(request, response) {
	that.WriteLog(request.connection.remoteAddress + " " + request.method + " " + request.headers.host + request.url);
	var fs = require('fs');
	var filePath = that.DocumentRoot + request.url;
	var Cookies = require('cookies');
	var cookies = new Cookies(request, response);


	var Session = require('./JSMSession');
	var session = new Session.JSMSession({request: request,
					      response: response,
					      server: that});


	fs.readFile(filePath, function (err, data) {
	    var respData = "";
	    
	    if(err) {
		switch(err.code) {
		case 'ENOENT':
		    // error 404
		    response.statusCode = 404;
		    respData = that.Error404;
		    break;
		default:
		    break;
		}
	    }
	    else {
		response.statusCode = 200;

		respData = data;
	    }

	    response.end(respData);
	});

    };

    Server.prototype.OnListen = function() {
	that.WriteLog("Server listening on port " + that.Port);
    };

    Server.prototype.Start = function() {


	if(that.Cluster.isMaster) {
	    that.WriteLog("Starting " + that.Workers + " worker processes to handle requests");


	    for(i = 0; i < that.Workers; i++) {
		that.Children.push(that.Cluster.fork());
	    }

	    process.on('SIGINT', function() {
		that.WriteLog("Master process " + process.pid + " is shutting down");

		for(child in that.Children) {
		    that.Children[child].send('SIGINT');		    
		}
		process.exit(1);
	    });

	}
	else if (that.Cluster.isWorker) {

	    	   	    
	    that.WriteLog("Worker process " + process.pid + " startup beginning");	   


	    that.http = require('http');
	    that.server = that.http.createServer(that.OnRequest);

	    that.server.listen(that.Port, that.OnListen);

	    var dbResult = that.DB.open();
	    if(dbResult.ok === 1) {
		that.WriteLog("MUMPS database connected successfully (" + that.DB.version() + ")");

	    }
	    else {
		that.WriteLog("MUMPS database connection failed");
	    }

	    process.on('SIGINT', function () {
		that.WriteLog("Worker process " + process.pid + " is shutting down");
		that.server.close();
		process.exit(0);		   
	    });	   
	
	    that.WriteLog("Worker process " + process.pid + " startup complete.");

	}

	return(0);
    };   

    return(this);
}



module.exports = {
    Server: Server
};

