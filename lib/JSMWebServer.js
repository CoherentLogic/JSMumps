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

var Cookies = require('cookies');
var Session = require('./JSMSession');
var Application = require('./JSMApplication');
var fs = require('fs');

function Cache(entries)
{
    this.cache = {};
    this.cacheEntries = entries;
    
    return(this);
}

Cache.prototype.purge = function()
{
    this.cache = {};
}

Cache.prototype.insert = function(entry) {
    if(this.cache.length < this.cacheEntries) {
	this.cache[entry.path] = {
	    data: entry.data,
	    mtime: entry.mtime,
	    lastRef: Date.now(),
	    refCount: 1
	}
    }
    else {
	this.purge();
	this.insert(entry);
    }
}

Cache.prototype.fetch = function(filePath) {

    var fs = require('fs');
    var stats = fs.statSync(filePath);
           
    // cannot cache dynamic content at all
    if(this.isStaticContent(filePath)) {
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

		this.insert(entry);
		
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

	    this.insert(entry);

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

Cache.prototype.isStaticContent = function(filePath) {
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
    
    this.port = options.port;
    this.workers = options.workers;
    this.documentRoot = options.documentRoot;
    this.log = options.log;
    this.routes = options.routes;
    this.protocol = options.protocol;

    if(this.protocol === "https") {
	this.sslKey = options.sslKey;
	this.sslCert = options.sslCert;
    }

    this.maxSessionAge = options.maxSessionAge * 60000;
    this.Util = require('./JSMUtil');
    this.MUMPS = require('mumps');
    this.Cluster = require('cluster');
    this.db = new this.MUMPS.Gtm();
    this.children = new Array();
    
    var fs = require('fs');

    var that = this;


    Server.prototype.writeLog = function(message) {
	var dateTime = that.Util.JSMDateTime();

	console.log(dateTime + " (PID " + process.pid + "):  " + message);
    };

    Server.prototype.getRequestURL = function(request) {
	return(that.protocol + "://" + request.headers.host + request.url);
    };

    Server.prototype.onRequest = function(request, response) {
	that.writeLog(request.connection.remoteAddress + " " + request.method + " " + request.headers.host + request.url);

	that.parsedURL = require('url').parse(that.getRequestURL(request));
	that.parsedURL.systemPath = that.documentRoot + that.parsedURL.pathname;
	that.parsedURL.pathComponents = that.parsedURL.pathname.substring(1).split("/");
	that.parsedURL.documentRoot = that.documentRoot;


	var tmp = [];

	for(i = 0; i < that.parsedURL.pathComponents.length - 1; i++) {
	    tmp.push(that.parsedURL.pathComponents[i]);
	}
	
	var basePath = tmp.join("/");
	if(basePath.charAt(0) != "/") {
	    basePath = "/" + basePath;
	}
	if(basePath.charAt(basePath.length - 1) != "/") {
	    basePath = basePath + "/";
	}

	that.parsedURL.basePath = basePath;

	var cookies = new Cookies(request, response);
	var session = new Session.JSMSession({request: request,
					      response: response,
					      server: that});


	that.app = new Application.JSMApplication(session,
						  request,
						  response,
						  that.parsedURL, 
						  function (err, result) {

						  });


    };

    Server.prototype.onListen = function() {
	that.writeLog("Server listening on port " + that.port);
    };

    Server.prototype.start = function() {


	if(that.Cluster.isMaster) {
	    that.writeLog("Starting " + that.workers + " worker processes to handle requests");


	    for(i = 0; i < that.workers; i++) {
		that.children.push(that.Cluster.fork());
	    }

	    process.on('SIGINT', function() {
		that.writeLog("Master process " + process.pid + " is shutting down");

		for(child in that.children) {
		    that.children[child].send('SIGINT');		    
		}
		process.exit(1);
	    });

	}
	else if (that.Cluster.isWorker) {
	    	   	    
	    that.writeLog("Worker process " + process.pid + " startup beginning");	   

	    if(that.protocol === "http") {
		that.http = require('http');
		that.server = that.http.createServer(that.onRequest);
	    }
	    else if (that.protocol === "https") {
		that.http = require('https');
		that.server = that.http.createServer({key: fs.readFileSync(that.sslKey),
						      cert: fs.readFileSync(that.sslCert)},
						     that.onRequest);
	    }
	  
	    that.server.listen(that.port, that.onListen);	  

	    var dbResult = that.db.open();
	    if(dbResult.ok === 1) {
		that.writeLog("MUMPS database connected successfully (" + that.db.version() + ")");

	    }
	    else {
		that.writeLog("MUMPS database connection failed");
	    }

	    process.on('SIGINT', function () {
		that.writeLog("Worker process " + process.pid + " is shutting down");
		that.server.close();
		process.exit(0);		   
	    });	   
	
	    that.writeLog("Worker process " + process.pid + " startup complete.");

	}

	return(0);
    };   

    return(this);
}



module.exports = {
    Server: Server
};

