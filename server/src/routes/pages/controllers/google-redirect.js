const url = require('url');
const axios = require('axios');
const config = require('../../../config');
const validators = require('../../../libs/validators');
const getUserIp = require('../../../libs/get-user-ip');
const dbActions = require("../../../db/db-actions");
const jwt = require("jsonwebtoken");

const googleSignupOrLogin = async (email, req, res) => {


    const swuid = req.cookies[config.swuidCookieName];

    if (!validators.checkSWUIDPattern(swuid)) {
        return false;
    }

    try {

        let doc = await dbActions.findUserByEmail(email);

        if (doc) {
            return false;
        }

        doc = await dbActions.findUserByEmail(email, false);

        if (doc === null) {

            doc = await dbActions.insertGoogleUser(email);
            const id = doc._id.valueOf();

            const accessToken = jwt.sign({id: id, type: 'access'}, process.env.KEY1, {expiresIn: config.accessTokenExpire / 1000});
            const refreshToken = jwt.sign({id: id, type: 'refresh'}, process.env.KEY2, {expiresIn: config.refreshTokenExpire / 1000});

            res.cookie(config.refreshCookieName, refreshToken, {maxAge: config.refreshTokenExpire - config.tokenExpireDiff, httpOnly: true});

            doc.sessions.push({
                timestamp: Date.now(),
                regIP: getUserIp(req),
                regUA: req.headers['user-agent'],
                regLanguage: req.headers['accept-language'],
                swuid: swuid,
                refreshToken: refreshToken
            });

            await doc.save();

            return accessToken;

        } else {

            const id = doc._id.valueOf();

            const accessToken = jwt.sign({id: id, type: 'access'}, process.env.KEY1, {expiresIn: config.accessTokenExpire / 1000});
            const refreshToken = jwt.sign({id: id, type: 'refresh'}, process.env.KEY2, {expiresIn: config.refreshTokenExpire / 1000});

            res.cookie(config.refreshCookieName, refreshToken, {maxAge: config.refreshTokenExpire - config.tokenExpireDiff, httpOnly: true});

            let session = doc.sessions.find(session => session.swuid === swuid);

            if (!session) {

                if (doc.sessions.length >= config.sessionsLimit) {
                    doc.sessions.shift();
                }

                doc.sessions.push({
                    timestamp: Date.now(),
                    regIP: getUserIp(req),
                    regUA: req.headers['user-agent'],
                    regLanguage: req.headers['accept-language'],
                    swuid: swuid,
                    refreshToken: refreshToken
                });

            } else {
                session.timestamp = Date.now();
                session.refreshToken = refreshToken;

            }

            await doc.save();

            return accessToken;

        }

    } catch (e) {
        return false;
    }

}

const googleRedirectController = async (req, res, next) => {

    const queryObject = url.parse(req.url, true).query;

    if (queryObject.code) {

        try {

            let googleTokenResponse = await axios({

                method: 'post',
                url: config.googleOauthTokenUrl,
                data: {
                    'client_id': process.env.GOOGLE_API_ID,
                    'client_secret': process.env.GOOGLE_API_SECRET,
                    'redirect_uri': config.googleOauthRedirectUrl,
                    'grant_type': 'authorization_code',
                    'code': queryObject.code
                }

            });

            if (googleTokenResponse.data['access_token']) {

                const googleUserInfoResponse = await axios.get(`${config.googleOauthUserInfoUrl + googleTokenResponse.data['access_token']}`);

                if (googleUserInfoResponse.data['email']) {

                    const token = await googleSignupOrLogin(googleUserInfoResponse.data['email'], req, res);

                    if (token) {
                        res.cookie(config.socialAuthTempCookieName, token);
                        res.redirect('/panel');
                    } else {
                        res.render('error', config.errorMessageOther);
                    }

                } else {
                    res.render('error', config.errorMessageOther);
                }

            } else {
                res.render('error', config.errorMessageOther);
            }

        } catch (e) {
            res.render('error', config.errorMessageOther);
        }

    } else {
        res.render('error', config.errorMessageOther);
    }


}

module.exports = googleRedirectController;