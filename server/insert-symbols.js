require('dotenv').config();
const mongoose = require("mongoose");
const dbActions = require("./src/db/db-actions");


const symbols = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc'
    },
    {
        symbol: 'AMGN',
        name: 'Amgen Inc'
    },
    {
        symbol: 'AXP',
        name: 'American Express Co'
    },
    {
        symbol: 'BA',
        name: 'Boeing Co'
    },
    {
        symbol: 'CAT',
        name: 'Caterpillar Inc'
    },
    {
        symbol: 'CRM',
        name: 'Salesforce.Com Inc'
    },
    {
        symbol: 'CSCO',
        name: 'Cisco Systems Inc'
    },
    {
        symbol: 'CVX',
        name: 'Chevron Corp'
    },
    {
        symbol: 'DIS',
        name: 'Walt Disney Co'
    },
    {
        symbol: 'DOW',
        name: 'Dow Inc'
    },
    {
        symbol: 'GS',
        name: 'Goldman Sachs Group Inc'
    },
    {
        symbol: 'HD',
        name: 'Home Depot Inc'
    },
    {
        symbol: 'HON',
        name: 'Honeywell International Inc'
    },
    {
        symbol: 'IBM',
        name: 'International Business Machines Corp'
    },
    {
        symbol: 'INTC',
        name: 'Intel Corp'
    },
    {
        symbol: 'JNJ',
        name: 'Johnson & Johnson'
    },
    {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co'
    },
    {
        symbol: 'KO',
        name: 'Coca-Cola Co'
    },
    {
        symbol: 'MCD',
        name: 'McDonald\'s Corp'
    },
    {
        symbol: 'MMM',
        name: '3M Co'
    },
    {
        symbol: 'MRK',
        name: 'Merck & Co Inc'
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corp'
    },
    {
        symbol: 'NKE',
        name: 'Nike Inc'
    },
    {
        symbol: 'PG',
        name: 'Procter & Gamble Co'
    },
    {
        symbol: 'TRV',
        name: 'Travelers Companies Inc'
    },
    {
        symbol: 'UNH',
        name: 'UnitedHealth Group Inc'
    },
    {
        symbol: 'V',
        name: 'Visa Inc'
    },
    {
        symbol: 'VZ',
        name: 'Verizon Communications Inc'
    },
    {
        symbol: 'WBA',
        name: 'Walgreens Boots Alliance Inc'
    },
    {
        symbol: 'WMT',
        name: 'Walmart Inc'
    }
];


(async () => {

    mongoose.connection.on('connected', async () => {

        for (let i = 0; i < symbols.length; i++) {
            if (!await dbActions.findSymbolByName(symbols[i].symbol)) {
                await dbActions.insertSymbol(symbols[i].symbol, symbols[i].name);
            }
        }

        await mongoose.disconnect();
        console.log('Done');

    });

    try {
        await mongoose.connect(process.env.DBURI);
    } catch (e) {
        console.log(e);
    }

})();
