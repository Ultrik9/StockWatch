const config = require('../config')
const dbActions = require("../db/db-actions");
const axios = require("axios");

const finhubPrices = async () => {

    const symbols = await dbActions.getAllSymbols();

    if (symbols) {

        let timeout = 0;

        symbols.forEach(symbol => {

            timeout += config.finhubBatchQueryTS;

            setTimeout(async () => {

                try {

                    const finhubResponse = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol.symbol}&token=${process.env.FINHUB_TOKEN}`);

                    if (finhubResponse.data['c'] && finhubResponse.data['d'] && typeof finhubResponse.data['c'] === 'number' && typeof finhubResponse.data['d'] === 'number') {

                        await dbActions.updateSymbolPriceAndChange(symbol._id.valueOf(), finhubResponse.data['c'], finhubResponse.data['d']);

                    }

                } catch (e) {
                    console.log(e);
                }
            }, timeout);

        });
    }


}

const finhubCandles = async () => {

    const symbols = await dbActions.getAllSymbols();

    if (symbols) {

        let timeout = 0;

        symbols.forEach(symbol => {

            timeout += config.finhubBatchQueryTS;

            const tStart = Math.round(Date.now() / 1000) - config.candlesStartDiff;
            const tEnd = Math.round(Date.now() / 1000);

            setTimeout(async () => {

                try {

                    const finhubResponse = await axios.get(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol.symbol}&resolution=15&from=${tStart}&to=${tEnd}&token=${process.env.FINHUB_TOKEN}`);

                    if (finhubResponse.data['c'] && finhubResponse.data['t'] && finhubResponse.data['c'] instanceof Array && finhubResponse.data['t'] instanceof Array && typeof finhubResponse.data['c'][0] === 'number' && typeof finhubResponse.data['t'][0] === 'number') {

                        await dbActions.updateSymbolCandles(symbol._id.valueOf(), finhubResponse.data['c'], finhubResponse.data['t']);

                    }

                } catch (e) {
                    console.log(e);
                }
            }, timeout);

        });
    }

}

module.exports = {finhubCandles, finhubPrices};