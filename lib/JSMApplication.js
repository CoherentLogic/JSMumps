
function JSMApplication(session, request, response, parsedURL)
{
    this.URL = require('url');

    var requestURL = parsedURL.href;

    console.log(requestURL);

}

module.exports = {
    JSMApplication: JSMApplication
};
