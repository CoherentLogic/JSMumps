## JSMumps

*JSMumps* is a Node.js module that allows the [NodeM](https://github.com/dlwicksell/nodem) GT.M Binding to be used asynchronously, as well as providing an easy means of storing Javascript objects in a MUMPS database and retrieving them into your Javascript code.

JSMumps' object storage and retrieval mechanisms implement the JSON-M specification to provide lossless data fidelity when dealing with MUMPS nodes containing both data and child nodes.

## Credits

The getObject() and setObject() APIs are based on similar APIs in [CFMumps](http://www.coherent-logic.com/cm/products/cfmumps), which were implemented with the assistance of David Wicksell, whose JSON-M specification they implement.

## Copyright and License

*JSMumps* is Copyright (C) 2017 Coherent Logic Development LLC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

## Installation

### With npm

`npm install jsmumps`

## Architecture

JSMumps will by default fork 10 child processes to handle database connections. This is necessary because NodeM does not yet support asynchronous database operations. Each database operation specified in your code will be handled by a free child process; if no child processes are available to service an operation, new child processes will be created as needed.

JSMumps redefines `process.exit()` in order to cleanly shut down child processes and close all open connections to NodeM.

## API Overview

### Instantiating JSMumps

The following example will create an instance of the JSMumps API using 30 child processes in the variable `jsm`, running at log level 4:

```javascript
    const jsmumps = require('jsmumps');

    var jsm = new jsm.JSMumps({
        workerCount: 30,
        logLevel: 4
    });
```    

From this point, you will be able to call JSMumps methods.

## API Reference

At any point within the documentation, the `jsmumps` variable is assumed to be a reference to the jsmumps module, as loaded with `const jsmumps = require('jsmumps');`, and the `jsm` variable is assumed to be an instance of the JSMumps class within it.

### JSMumps()

Instantiates the JSMumps API.

```javascript
    var jsm = new jsmumps.JSMumps(opts);
```

#### Arguments

* *opts*: an object containing the initial configuration of JSMumps, e.g.:

```javascript
    {
        workerCount: 5,
        logLevel: 3
    }
```

`workerCount` is a positive integer indicating the number of child processes to pre-fork when initializing JSMumps. Default value is 10.

`logLevel` indicates the level of logging desired, and is a positive integer in the range 0-4. A logLevel of 0 specifies no logging, a logLevel of 1 adds critical errors, 2 adds non-critical warnings, 3 adds informational messages, and 4 adds debugging messages (useful if you are adding new functionality to JSMumps). The default value is 2 (critical errors and non-critical warnings only).