const nodem = require('nodem');
const _ = require('underscore');

var current = {
    global: null,
    subscripts: []
};

var db = new nodem.Gtm();

var result = db.open();

if(!result.ok) {
    sendMessage('INIT_ERROR', {message: "Error opening GT.M"});
}

const nodemAPI = {

    getObject: function (opts) {

        var result = null;

        try {
            result = {
                data: nodemAPI.getObjectX(), 
                ok: 1
            };
        }
        catch(ex) {
            result = {
                data: {}, 
                ok: 0, 
                ErrorMessage: ex, 
                ErrorCode: ""
            };
        }
 
        return result;
    },

    getObjectX: function (subscripts, outputStruct) {

        if(subscripts) {
            var mSubscripts = fastClone(subscripts);
        }
        else {
            var mSubscripts = fastClone(current.subscripts);
        }

        if(!outputStruct) {
            var outStruct = {};
        }
        else {
            var outStruct = fastClone(outputStruct);
        }

        var lastResult = false;
        
        mSubscripts.push("");

        while(!lastResult) {

            var order = db.order({global: current.global, subscripts: mSubscripts});
            
            if(!order.ok) {
                throw("NodeM error calling order()");
            }

            if(order.result === "") {
                lastResult = true;
                
                continue;
            }

            mSubscripts = order.subscripts;
            
            var structSubs = mSubscripts.slice(current.subscripts.length);
            var data = db.data({global: current.global, subscripts: mSubscripts});

            switch(data.defined) {
            case 11:
                var nodeValue = db.get({global: current.global, subscripts: mSubscripts});

                if(!nodeValue.ok) {
                    throw("NodeM error calling get()");
                }

                buildObject(outStruct, structSubs, nodeValue.data, true);
                _.extend(outStruct, nodemAPI.getObjectX(mSubscripts, outStruct));
                break;
            case 10:
                _.extend(outStruct, nodemAPI.getObjectX(mSubscripts, outStruct))
                break;
            case 1:
                buildObject(outStruct, structSubs, db.get({global: current.global, subscripts: mSubscripts}).data, false);
                break;
            }

        }

        return outStruct;   
    },

    setObject: function (opts) {

        var result = null;

        try {
            result = {
                data: nodemAPI.setObjectX(opts.data), 
                ok: 1
            };
        }
        catch(ex) {
            result = {
                data: {}, 
                ok: 0, 
                ErrorMessage: "Error in setObject()", 
                ErrorCode: ""
            };
        }

        return result;
    },

    setObjectX: function (inputObject, subscripts) {
    
        if(subscripts) {
            var subs = fastClone(subscripts);
        }
        else {
            var subs = fastClone(current.subscripts);
        }

        for(var key in inputObject) {

            subs.push(key);
            
            switch(typeof inputObject[key]) {
                case 'object':
                    nodemAPI.setObjectX(inputObject[key], subs);
                    break;
                case 'string':
                case 'number':                
                    var result = db.set({global: current.global, subscripts: subs, data: inputObject[key]});
                    if(!result.ok) {
                        throw("NodeM error calling set()");
                    }
                    break;
            }

            subs.pop();
        }

        return;
    },

    get: function (opts) {
        return db.get({global: current.global, subscripts: current.subscripts});
    },

    set: function (opts) {
        return db.set({global: current.global, subscripts: current.subscripts, data: opts.data});
    },

    kill: function (opts) {
        return db.kill({global: current.global, subscripts: current.subscripts, data: opts.data});
    },

    lock: function (opts) {
        return db.lock({global: current.global, subscripts: current.subscripts, timeout: opts.timeout || 0});
    },

    unlock: function (opts) {
        return db.unlock({global: current.global, subscripts: current.subscripts});
    },

    data: function (opts) {
        return db.data({global: current.global, subscripts: current.subscripts});
    },

    order: function (opts) {
        return db.order({global: current.global, subscripts: current.subscripts});
    },

    query: function (opts) {
        return db.next_node({global: current.global, subscripts: current.subscripts});
    },

    function: function (opts) {
        return db.function({function: opts.func, arguments: opts.args});
    },

    procedure: function (opts) {
        
    }

};

function fastClone(obj)
{
    return JSON.parse(JSON.stringify(obj));
}

function isNumeric(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function buildObject(obj, keyArray, value, lastKeyEmpty)
{
    if(lastKeyEmpty) {
       keyArray.push("");
    }
    
    lastKeyIndex = keyArray.length - 1;

    for(var i = 0; i < lastKeyIndex; ++ i) {
        
        key = keyArray[i];
        
        if (!(key in obj)) {
           obj[key] = {};
        }
        
        obj = obj[key];
    }

    obj[keyArray[lastKeyIndex]] = value;    
}

function handleMessage(msg)
{

    if(msg.action === "CP_SHUTDOWN") {
        fs.writeSync(fd, "Before db.close\n");
        fs.writeSync(fd, JSON.stringify(db.close()));
        process.exit();
    }

    if(!msg.options) {
        throw("Invalid message sent to worker process.");
    }

    current.global = msg.options.global || null;
    current.subscripts = msg.options.subscripts || [];

    var result = nodemAPI[msg.action](msg.options);

    if(result.ok) {
        sendMessage('DBOP_COMPLETE', result);
    }
    else {
        var errObj = {
            message: result.ErrorMessage || "",
            code: result.ErrorCode || ""
        };
        
        sendMessage('DBOP_ERROR', errObj);
    }

     fs.closeSync(fd);
}

function sendMessage(type, data)
{
    var msg = {
        type: type,
        data: data
    };

    process.send(msg);
}

process.on('message', handleMessage);