const config = require('../config')
const dbActions = require("../db/db-actions");
const axios = require("axios");

const finnhubPrices = async () => {

    const symbols = await dbActions.getAllSymbols();

    if (symbols) {

        let timeout = 0;

        symbols.forEach(symbol => {

            timeout += config.finnhubBatchQueryTS;

            setTimeout(async () => {

                try {

                    const finnhubResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol.symbol}&token=${process.env.FINNHUB_TOKEN}`);

                    if (finnhubResponse.data['c'] && finnhubResponse.data['d'] && typeof finnhubResponse.data['c'] === 'number' && typeof finnhubResponse.data['d'] === 'number') {

                        await dbActions.updateSymbolPriceAndChange(symbol._id.valueOf(), finnhubResponse.data['c'], finnhubResponse.data['d']);

                    }

                } catch (e) {
                    console.log(e);
                }
            }, timeout);

        });
    }


}

const finnhubCandles = async () => {

    const symbols = await dbActions.getAllSymbols();

    if (symbols) {

        let timeout = 0;

        symbols.forEach(symbol => {

            timeout += config.finnhubBatchQueryTS;

            const tStart = Math.round(Date.now() / 1000) - config.candlesStartDiff;
            const tEnd = Math.round(Date.now() / 1000);

            setTimeout(async () => {

                try {

                    const finnhubResponse = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol.symbol}&resolution=15&from=${tStart}&to=${tEnd}&token=${process.env.FINNHUB_TOKEN}`);

                    if (finnhubResponse.data['c'] && finnhubResponse.data['t'] && finnhubResponse.data['c'] instanceof Array && finnhubResponse.data['t'] instanceof Array && typeof finnhubResponse.data['c'][0] === 'number' && typeof finnhubResponse.data['t'][0] === 'number') {

                        await dbActions.updateSymbolCandles(symbol._id.valueOf(), finnhubResponse.data['c'], finnhubResponse.data['t']);

                    }

                } catch (e) {
                    console.log(e);
                }
            }, timeout);

        });
    }

}

module.exports = {finnhubCandles, finnhubPrices};