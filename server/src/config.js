const accessTokenExpire = 5 * 60 * 1000;
const refreshTokenExpire = 180 * 86400 * 1000;
const tokenExpireDiff = 10000;
const swuidExpire = 365 * 86400 * 1000;
const sessionsLimit = 10;

const maxLists = 20;
const maxSymbols = 50;

const candlesStartDiff = 3 * 86400;

const finhubBatchQueryTS = 1300;

const maxStocksAmount = 1000000;
const minStocksPrice = 0.01;
const maxStocksPrice = 1000000;

const swuidCookieName = 'sw-swuid';
const accessTokenName = 'sw-access-token';
const refreshCookieName = 'sw-refresh-token';
const socialAuthTempCookieName = 'sw-auth-tmp';

const protocol = 'https';
const appDomain = 'test-her44.herokuapp.com';

const googleOauthRedirectUrl = `${protocol}://${appDomain}/auth_redirects/google/`;
const googleOauthRequestUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_API_ID}&response_type=code&scope=email+profile&redirect_uri=${encodeURIComponent(googleOauthRedirectUrl)}`;
const googleOauthTokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
const googleOauthUserInfoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=';

const errorMessage404 = {
    title: '404',
    errorType: '404',
    errorHeader: 'Page not found',
    errorMessage: 'The page you are looking for might have been removed had its name changed or is temporarily unavailable'
};
const errorMessageOther = {
    title: 'Error',
    errorType: 'Error',
    errorHeader: 'Something went wrong',
    errorMessage: 'Looks like our site is unable to service your request, sorry about that'
};
const errorMessageShare = {
    title: 'List share error',
    errorType: 'Error',
    errorHeader: 'List share error',
    errorMessage: ''
};

module.exports = {
    accessTokenExpire,
    refreshTokenExpire,
    tokenExpireDiff,
    swuidExpire,
    sessionsLimit,
    maxLists,
    maxSymbols,
    candlesStartDiff,
    finhubBatchQueryTS,
    swuidCookieName,
    accessTokenName,
    refreshCookieName,
    socialAuthTempCookieName,
    googleOauthRedirectUrl,
    googleOauthRequestUrl,
    googleOauthTokenUrl,
    googleOauthUserInfoUrl,
    errorMessage404,
    errorMessageOther,
    errorMessageShare,
	maxStocksAmount,
    minStocksPrice,
    maxStocksPrice,
}