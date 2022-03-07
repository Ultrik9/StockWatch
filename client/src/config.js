//const serverUrl = 'http://localhost:5001';

const protocol = 'https';
const appDomain = 'test-her44.herokuapp.com';
const serverGqlUrl = `${protocol}://${appDomain}/graphql`;
const googleOauthRedirectUrl = `${protocol}://${appDomain}/auth_redirects/google/`;
const shareUrl = `${protocol}://${appDomain}/share/`;

const googleAppId = '1026335654505-cshcnsandc3bl6lfgjvrr9ur9gla09j5.apps.googleusercontent.com';
const googleOauthRequestUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleAppId}&response_type=code&scope=email+profile&redirect_uri=${encodeURIComponent(googleOauthRedirectUrl)}`;

const maxLists = 20;
const maxSymbols = 50;

const listPollInterval = 90 * 1000;

const maxStocksAmount = 1000000;
const minStocksPrice = 0.01;
const maxStocksPrice = 1000000;

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

const formsConfig = {
    email: {
        messages: {
            empty: 'please enter e-mail',
            pattern: 'this field must be valid e-mail format',
        },
        pattern: /^\S+@\S+\.\S+$/i

    },
    password: {
        messages: {
            empty: 'please enter password',
            length: 'password must be 6 to 16 characters long',
            mismatch: 'passwords did not match'
        },
        minLength: 6,
        maxLength: 16

    },
    newListName: {
        messages: {
            empty: 'please enter list-table name',
            length: 'list-table name must be 1 to 16 characters long',
        },
        minLength: 1,
        maxLength: 16
    },
    newSymbol: {
        messages: {
            incorrect: 'incorrect symbol'
        }
    },
    newSymbolPrice: {
        messages: {
            incorrect: 'incorrect price'
        },
        pattern: /^\d+(\.\d{0,2})?$/
    },
    newSymbolAmount: {
        messages: {
            incorrect: 'incorrect amount'
        }
    },
    newSymbolPriceAndAmount: {
        messages: {
            incorrect: 'enter the correct price and quantity or leave these fields untouched'
        }
    }
}

const accessTokenName = 'sw-access-token';
const socialAuthTempCookieName = 'sw-auth-tmp';
const localStorageTokenName = 'sw-access-token';
const selectedListIdName = 'sw-selected-list';

const serverMessages = {
    'mutation_error': 'An error occurred during network communication.',
    'bad_swuid': 'Error! Please turn on cookies, reload this page and try again.',
    'bad_login': 'Error! No such e-mail.',
    'bad_password': 'Error! Incorrect password.',
    'bad_session': 'Error! Please turn on cookies, reload this page and try again. You may also have to clear this site settings.',
    'bad_or_expired_refresh_token': 'Error! Bad or expired refresh token.',
    'bad_access_token': 'Error! Bad access token.',
    'lists_limit_exceeded': 'Lists limit reached. You cant add any more lists.',
    'symbols_limit_exceeded': 'Symbols limit reached. You cant add any more symbols.',
    'user_exist': 'This email is already registered with StockWatch.',
    'bad_list': 'Error! No such list-table.',
    'bad_list_name': 'Error! Bad list name.',
    'no_user': 'Error! No such user.',
    'bad_symbol': 'Error! No such symbol.',
    'no_symbols': 'Error! No symbols in database.',
}

/*
bad_id
 */

const clientMessages = {
    'logoutError': 'An error occurred during logout.',
    'logOutAllMessage': 'You are logged out of all devices. Other devices sessions may still be valid for a short time.'
}

const config = {
    listPollInterval,
    maxStocksAmount,
    minStocksPrice,
    maxStocksPrice,
    errorMessage404,
    errorMessageOther,
    formsConfig,
    serverMessages,
    clientMessages,
    accessTokenName,
    socialAuthTempCookieName,
    localStorageTokenName,
    selectedListIdName,
    serverGqlUrl,
    googleOauthRequestUrl,
    shareUrl,
    maxLists,
    maxSymbols
}

export default config;
