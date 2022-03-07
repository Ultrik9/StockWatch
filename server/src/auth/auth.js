const config = require("../config");
const jwt = require("jsonwebtoken");
const validators = require("../libs/validators");
const dbActions = require("../db/db-actions");


const checkAuthByRefreshToken = async (refreshToken) => {

    try {

        let refreshId = null;
        let isRefreshTokenBad = false;
        let sessionIdx;

        jwt.verify(refreshToken, process.env.KEY2, (err, decoded) => {
            if (err) {
                isRefreshTokenBad = true;
            } else {
                refreshId = decoded.id;
            }
        });

        if (isRefreshTokenBad) {
            return {
                result: false
            };
        }

        const doc = await dbActions.findUserById(refreshId);

        if (!doc) {
            return {
                result: false
            };
        }

        sessionIdx = doc.sessions.findIndex(session => session.refreshToken === refreshToken);

        if (sessionIdx === -1) {
            return {
                result: false
            };
        }

        return {
            result: true,
            userId: refreshId
        }

    } catch (e) {

        return {
            result: false
        };

    }

}

const checkAndRefreshLogin = async (req, res, disableHeaders) => {

    try {

        let accessToken = req.headers[config.accessTokenName];
        let refreshToken = req.cookies[config.refreshCookieName];


        let accessId = null;
        let refreshId = null;
        let isAccessTokenValidButExpired = false;
        let isAccessTokenBad = false;
        let isRefreshTokenBad = false;
        let sessionIdx;


        jwt.verify(accessToken, process.env.KEY1, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    accessId = jwt.decode(accessToken).id;
                    isAccessTokenValidButExpired = true;
                } else {
                    isAccessTokenBad = true;
                }
            } else {
                accessId = decoded.id;
            }
        });

        if (isAccessTokenBad) {
            return {
                result: false,
                errorReason: 'bad_access_token',
            };
        }

        jwt.verify(refreshToken, process.env.KEY2, (err, decoded) => {
            if (err) {
                isRefreshTokenBad = true;
            } else {
                refreshId = decoded.id;
            }
        });

        if (isRefreshTokenBad) {
            return {
                result: false,
                errorReason: 'bad_or_expired_refresh_token',
            };
        }

        if (accessId !== refreshId || !validators.checkIdPattern(accessId)) {
            return {
                result: false,
                errorReason: 'bad_id',
            };
        }

        if (!isAccessTokenBad && !isAccessTokenValidButExpired) {
            return {
                result: true,
                errorReason: null,
                accessId: accessId,
                refreshToken: refreshToken
            };
        }

        if (isAccessTokenValidButExpired) {

            const doc = await dbActions.findUserById(accessId);

            if (!doc) {
                return {
                    result: false,
                    errorReason: 'bad_login'
                };
            }


            sessionIdx = doc.sessions.findIndex(session => session.refreshToken === refreshToken);

            if (sessionIdx === -1) {
                return {
                    result: false,
                    errorReason: 'bad_session'
                };
            }

            accessToken = jwt.sign({id: accessId, type: 'access'}, process.env.KEY1, {expiresIn: config.accessTokenExpire / 1000});
            refreshToken = jwt.sign({id: accessId, type: 'refresh'}, process.env.KEY2, {expiresIn: config.refreshTokenExpire / 1000});

            doc.sessions[sessionIdx].timestamp = Date.now();
            doc.sessions[sessionIdx].refreshToken = refreshToken;

            await doc.save();

            if (!disableHeaders) {
                res.cookie(config.refreshCookieName, refreshToken, {maxAge: config.refreshTokenExpire - config.tokenExpireDiff, httpOnly: true, sameSite: 'lax'});
                res.header(config.accessTokenName, accessToken);
            }

        }

        return {
            result: true,
            errorReason: null,
            accessId: accessId,
            refreshToken: refreshToken
        }

    } catch (e) {

        return {
            result: false,
            errorReason: e.message
        };

    }

}

const withAuth = async (resolver, context, disableHeaders = false) => {

    const checkResult = await checkAndRefreshLogin(context.req, context.res, disableHeaders);

    if (!checkResult.result) {
        return checkResult;
    }

    return await resolver(checkResult.accessId, checkResult.refreshToken);

}

module.exports = {
    checkAuthByRefreshToken,
    checkAndRefreshLogin,
    withAuth
}
