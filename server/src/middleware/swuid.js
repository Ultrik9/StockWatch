const config = require('../config');
const {v4: uuidv4} = require('uuid');

const swuid = () => (req, res, next) => {

    let swuid = req.cookies[config.swuidCookieName];

    if (!swuid) {
        res.cookie(config.swuidCookieName, uuidv4(), {maxAge: config.swuidExpire, httpOnly: true, sameSite: 'lax'});
    } else {
        res.cookie(config.swuidCookieName, swuid, {maxAge: config.swuidExpire, httpOnly: true, sameSite: 'lax'});
    }

    next();

}

module.exports = swuid;