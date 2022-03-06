const mongoose = require('mongoose');

const SymbolSchema = new mongoose.Schema({
    symbol: {
        type: String,
        index: {unique: true}
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    change: {
        type: Number,
        required: true
    },
    candles: {
        prices: {
            type: [Number]
        },
        timestamps: {
            type: [Number]
        }
    }

}, {timestamps: true});

module.exports = mongoose.model('Symbol', SymbolSchema);