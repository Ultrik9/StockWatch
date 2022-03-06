const config = require("../config");

const customHeaders = () => (req, res, next) => {

    res.header('Access-Control-Expose-Headers', config.accessTokenName);

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');

    next();

}

module.exports = customHeaders;


