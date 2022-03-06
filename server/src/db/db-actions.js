const user = require('./models/user');
const symbol = require('./models/symbol');


const findUserByEmail = (email, isGeneric = true) => {

    return user.findOne({'email': email, 'authMethod': isGeneric ? 'generic' : 'google'});

}

const findUserByEmailNoMethod = (email) => {

    return user.findOne({'email': email});

}

const findUserById = (id) => {

    return user.findById(id);

}

const findUserByIdAndToken = (id, token) => {

    return user.findOne({'_id': id, 'sessions.refreshToken': token});

}

const findUserByEmailAndPassword = (email, password) => {

    return user.findOne({'email': email, 'authMethod': 'generic', 'password': password});

}

const insertGenericUser = (email, password) => {

    return user.create({email: email, authMethod: 'generic', password: password, sessions: [], lists: []});

}

const insertGoogleUser = (email) => {

    return user.create({email: email, authMethod: 'google', password: 'n/a', sessions: [], lists: []});

}

const findSymbolByName = (symbolName) => {

    return symbol.findOne({'symbol': symbolName});

}

const insertSymbol = (symbolName, companyName) => {

    return symbol.create({symbol: symbolName, name: companyName, price: 0, change: 0, candles: {prices: [], timestamps: []}});

}

const updateSymbolPriceAndChange = (id, price, change) => {

    return symbol.findOneAndUpdate(
        {'_id': id},
        {price: price, change: change}
    );

}

const updateSymbolCandles = (id, candles, timestamps) => {

    return symbol.findOneAndUpdate(
        {'_id': id},
        {'candles.prices': candles, 'candles.timestamps': timestamps}
    );

}

const getAllSymbols = () => {

    return symbol.find({}).sort({symbol: 'asc'});

}


module.exports = {
    findUserByEmail,
    findUserByEmailNoMethod,
    findUserById,
    findUserByIdAndToken,
    findUserByEmailAndPassword,
    insertGenericUser,
    insertGoogleUser,

    findSymbolByName,
    insertSymbol,

    getAllSymbols,

    updateSymbolPriceAndChange,
    updateSymbolCandles,


}