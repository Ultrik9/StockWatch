const jwt = require('jsonwebtoken');
const hash = require('hash.js');
const {v4: uuidv4} = require("uuid");
const config = require("../config");
const validators = require("../libs/validators")
const dbActions = require("../db/db-actions");
const getUserIp = require("../libs/get-user-ip");

const CryptoJS = require("crypto-js");

const {withAuth} = require('../auth/auth');


const genericSignupResolver = {

    Mutation: {

        async genericSignup(parent, args, context, info) {

            const swuid = context.req.cookies[config.swuidCookieName];

            if (!validators.checkSWUIDPattern(swuid)) {
                return {
                    result: false,
                    errorReason: 'bad_swuid',
                    id: null
                };
            }

            try {

                const email = args.input.email.toLowerCase();

                const checkEmail = await dbActions.findUserByEmailNoMethod(email);

                if (checkEmail === null) {

                    const doc = await dbActions.insertGenericUser(email, hash.sha256().update(args.input.password + process.env.SALT1).digest('hex'));
                    const id = doc._id.valueOf();

                    const accessToken = jwt.sign({id: id, type: 'access'}, process.env.KEY1, {expiresIn: config.accessTokenExpire / 1000});
                    const refreshToken = jwt.sign({id: id, type: 'refresh'}, process.env.KEY2, {expiresIn: config.refreshTokenExpire / 1000});

                    context.res.cookie(config.refreshCookieName, refreshToken, {maxAge: config.refreshTokenExpire - config.tokenExpireDiff, httpOnly: true, sameSite: 'lax'});
                    context.res.header(config.accessTokenName, accessToken);

                    doc.sessions.push({
                        timestamp: Date.now(),
                        regIP: getUserIp(context.req),
                        regUA: context.req.headers['user-agent'],
                        regLanguage: context.req.headers['accept-language'],
                        swuid: swuid,
                        refreshToken: refreshToken
                    });

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null,
                        id: id
                    };

                } else {

                    return {
                        result: false,
                        errorReason: 'user_exist',
                        id: null
                    };

                }

            } catch (e) {
                return {
                    result: false,
                    errorReason: e.message,
                    id: null
                };

            }
        }
    }
}

const genericLoginResolver = {

    Mutation: {

        async genericLogin(parent, args, context, info) {

            const swuid = context.req.cookies[config.swuidCookieName];

            if (!validators.checkSWUIDPattern(swuid)) {
                return {
                    result: false,
                    errorReason: 'bad_swuid',
                    id: null
                };
            }

            try {

                const email = args.input.email.toLowerCase();

                let doc = await dbActions.findUserByEmail(email);

                if (!doc) {
                    return {
                        result: false,
                        errorReason: 'bad_login',
                        id: null
                    };
                }

                doc = await dbActions.findUserByEmailAndPassword(email, hash.sha256().update(args.input.password + process.env.SALT1).digest('hex'));

                if (!doc) {
                    return {
                        result: false,
                        errorReason: 'bad_password',
                        id: null
                    };
                }

                const id = doc._id.valueOf();

                const accessToken = jwt.sign({id: id, type: 'access'}, process.env.KEY1, {expiresIn: config.accessTokenExpire / 1000});
                const refreshToken = jwt.sign({id: id, type: 'refresh'}, process.env.KEY2, {expiresIn: config.refreshTokenExpire / 1000});

                context.res.cookie(config.refreshCookieName, refreshToken, {maxAge: config.refreshTokenExpire - config.tokenExpireDiff, httpOnly: true, sameSite: 'lax'});
                context.res.header(config.accessTokenName, accessToken);

                let session = doc.sessions.find(session => session.swuid === swuid);

                if (!session) {

                    if (doc.sessions.length >= config.sessionsLimit) {
                        doc.sessions.shift();
                    }

                    doc.sessions.push({
                        timestamp: Date.now(),
                        regIP: getUserIp(context.req),
                        regUA: context.req.headers['user-agent'],
                        regLanguage: context.req.headers['accept-language'],
                        swuid: swuid,
                        refreshToken: refreshToken
                    });

                } else {
                    session.timestamp = Date.now();
                    session.refreshToken = refreshToken;

                }

                await doc.save();

                return {
                    result: true,
                    errorReason: null,
                    id: id
                };

            } catch (e) {
                console.log('E', e);
                return {
                    result: false,
                    errorReason: e.message,
                    id: null
                };
            }
        }
    }
}


const logoutResolver = {

    Mutation: {

        logout(parent, args, context, info) {

            const resolver = async (userId, refreshToken) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    }

                    const sessionIdx = doc.sessions.findIndex(session => session.refreshToken === refreshToken);

                    if (sessionIdx === -1) {
                        return {
                            result: false,
                            errorReason: 'bad_session'
                        }
                    }

                    context.res.clearCookie(config.refreshCookieName, {httpOnly: true, sameSite: 'lax'});

                    if (args.input.all) {
                        doc.sessions = [];
                    } else {
                        doc.sessions.splice(sessionIdx, 1);
                    }

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null,
                    };

                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context, true);

        }
    }
}


const addNewListResolver = {

    Mutation: {

        addNewList(parent, args, context, info) {

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    }

                    if (doc.lists.length >= config.maxLists) {
                        return {
                            result: false,
                            errorReason: 'lists_limit_exceeded',
                            id: null
                        };
                    }

                    const listName = args.input.name.trim();

                    if (listName.length === 0) {
                        return {
                            result: false,
                            errorReason: 'bad_list_name'
                        };
                    }

                    doc.lists.push({
                        name: listName,
                        isSocial: false,
                        symbols: []
                    });

                    const listId = doc.lists[doc.lists.length - 1]._id.valueOf();

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null,
                        id: listId
                    };


                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);

        }
    }
}

const deleteListResolver = {

    Mutation: {

        deleteList(parent, args, context, info) {

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    }

                    const listId = args.input.id

                    const listIdx = doc.lists.findIndex(list => list._id.valueOf() === listId);

                    if (listIdx === -1) {
                        return {
                            result: false,
                            errorReason: 'bad_list'
                        };
                    }

                    doc.lists.splice(listIdx, 1);

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null
                    };

                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);

        }
    }
}

const authorizeResolver = {

    Mutation: {

        authorize(parent, args, context, info) {

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    } else {
                        return {
                            result: true,
                            errorReason: null,
                            id: userId,
                            email: doc.toJSON().email,
                        }
                    }


                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);

        }
    }
}

const getUserListsResolver = {

    Query: {

        async getUserLists(parent, args, context, info) {

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    } else {
                        return {
                            result: true,
                            errorReason: null,
                            lists: doc.toJSON().lists.map(list => {
                                return {...list, id: list._id.valueOf()}
                            }),
                        }
                    }

                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);
        }
    }
}

const getUserListDataResolver = {

    Query: {

        async getUserListData(parent, args, context, info) {

            const listId = args.input.listId;

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        };
                    }

                    const listIdx = doc.lists.findIndex(list => list._id.valueOf() === listId);

                    if (listIdx === -1) {
                        return {
                            result: false,
                            errorReason: 'bad_list'
                        };
                    }

                    const list = doc.lists[listIdx].toJSON();

                    const symbolsData = [];

                    for (let i = 0; i < list.symbols.length; i++) {

                        const listSymbol = list.symbols[i];
                        const symbol = await dbActions.findSymbolByName(listSymbol.symbol);

                        if (!symbol) {
                            return {
                                result: false,
                                errorReason: 'bad_symbol'
                            };
                        }

                        symbolsData.push({
                            symbolId: listSymbol._id.valueOf(),
                            symbol: symbol.symbol,
                            name: symbol.name,
                            sharesAmount: listSymbol.sharesAmount,
                            buyPrice: listSymbol.buyPrice,
                            price: symbol.price,
                            change: symbol.change,
                            candles: symbol.candles
                        })

                    }

                    const listShareId = encodeURIComponent(CryptoJS.AES.encrypt(`${process.env.KEY3}|${userId}|${list._id.valueOf()}`, process.env.KEY3).toString());

                    return {
                        result: true,
                        errorReason: null,
                        listId: list._id.valueOf(),
                        listName: list.name,
                        isSocial: list.isSocial,
                        listShareId: listShareId,
                        symbolsData: symbolsData
                    };


                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);
        }
    }
}

const addSymbolToListResolver = {

    Mutation: {

        addSymbolToList(parent, args, context, info) {

            const listId = args.input.listId;

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        };
                    }

                    const listIdx = doc.lists.findIndex(list => list._id.valueOf() === listId);

                    if (listIdx === -1 || doc.lists[listIdx].isSocial) {
                        return {
                            result: false,
                            errorReason: 'bad_list'
                        };
                    }

                    const symbol = await dbActions.findSymbolByName(args.input.symbol);

                    if (!symbol) {
                        return {
                            result: false,
                            errorReason: 'bad_symbol'
                        };
                    }

                    if (doc.lists.length >= config.maxSymbols) {
                        return {
                            result: false,
                            errorReason: 'symbols_limit_exceeded'
                        };
                    }

                    let sharesAmount = parseInt(args.input.sharesAmount);
                    sharesAmount = isNaN(sharesAmount) ? 0 : sharesAmount;
                    if (sharesAmount > config.maxStocksAmount) {
                        sharesAmount = config.maxStocksAmount;
                    }
                    if (sharesAmount < 0) {
                        sharesAmount = 0;
                    }

                    let buyPrice = parseFloat(args.input.buyPrice);
                    buyPrice = isNaN(buyPrice) ? 0 : buyPrice;
                    if (buyPrice < config.minStocksPrice) {
                        buyPrice = 0;
                    }
                    if (buyPrice > config.maxStocksPrice) {
                        buyPrice = config.maxStocksPrice;
                    }

                    if (buyPrice === 0 || sharesAmount === 0) {
                        sharesAmount = 0;
                        buyPrice = 0;
                    }

                    doc.lists[listIdx].symbols.push({symbol: args.input.symbol, sharesAmount: sharesAmount, buyPrice: buyPrice});

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null
                    };


                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);

        }
    }
}

const deleteSymbolFromListResolver = {

    Mutation: {

        deleteSymbolFromList(parent, args, context, info) {

            const listId = args.input.listId;
            const symbolId = args.input.symbolId;

            const resolver = async (userId) => {

                try {

                    const doc = await dbActions.findUserById(userId);

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_user'
                        }
                    }

                    const listIdx = doc.lists.findIndex(list => list._id.valueOf() === listId);

                    if (listIdx === -1 || doc.lists[listIdx].isSocial) {
                        return {
                            result: false,
                            errorReason: 'bad_list'
                        };
                    }

                    const symbolIdx = doc.lists[listIdx].symbols.findIndex(symbol => symbol._id.valueOf() === symbolId);

                    if (symbolIdx === -1) {
                        return {
                            result: false,
                            errorReason: 'bad_symbol'
                        };
                    }

                    doc.lists[listIdx].symbols.splice(symbolIdx, 1);

                    await doc.save();

                    return {
                        result: true,
                        errorReason: null
                    };


                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return withAuth(resolver, context);

        }
    }
}

const getAllSymbolsResolver = {

    Query: {

        async getAllSymbols(parent, args, context, info) {

            const resolver = async () => {

                try {

                    const doc = await dbActions.getAllSymbols();

                    if (!doc) {
                        return {
                            result: false,
                            errorReason: 'no_symbols',
                            symbols: null
                        };
                    }

                    return {
                        result: true,
                        errorReason: null,
                        symbols: doc.map(symbol => {
                            symbol = symbol.toJSON();
                            return {
                                ...symbol,
                                _id: symbol._id.valueOf(),
                                symbolId: symbol._id.valueOf()
                            }
                        })
                    };

                } catch (e) {
                    return {
                        result: false,
                        errorReason: e.message
                    };
                }

            }

            return resolver();
        }
    }
}

module.exports = [
    genericSignupResolver,
    genericLoginResolver,
    logoutResolver,
    addNewListResolver,
    deleteListResolver,
    authorizeResolver,
    getUserListsResolver,
    getUserListDataResolver,
    addSymbolToListResolver,
    deleteSymbolFromListResolver,
    getAllSymbolsResolver
];