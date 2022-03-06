const mongoose = require('mongoose');

const UserSessionsSchema = new mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    regIP: {
        type: String
    },
    regUA: {
        type: String
    },
    regLanguage: {
        type: String
    },
    swuid: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true,
        index: {unique: true, sparse: true}
    }

});

const UserSymbolSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    sharesAmount: {
        type: Number
    },
    buyPrice: {
        type: Number
    }
})

const UserListsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isSocial: {
        type: Boolean,
        required: true
    },
    symbols: {
        type: [UserSymbolSchema],
        ref: 'Symbol'
    }

});

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: {unique: true}
    },
    authMethod: {
        type: String,
        enum: ['generic', 'google'],
        required: true
    },
    password: {
        type: String
    },
    sessions: {
        type: [UserSessionsSchema]
    },
    lists: [UserListsSchema]

}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);