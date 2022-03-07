const CryptoJS = require("crypto-js");

const {checkAuthByRefreshToken} = require('../../../auth/auth');
const dbActions = require("../../../db/db-actions");

const config = require('../../../config');

const shareController = async (req, res, next) => {

    let shareString;

    try {
        shareString = CryptoJS.AES.decrypt(req.params.shareId, process.env.KEY3).toString(CryptoJS.enc.Utf8);
    } catch {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'Bad share id'});

    }

    const frags = shareString.split('|');

    if (frags.length !== 3 || frags[0] !== process.env.KEY3) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'Bad share id'});
    }

    const sharerId = frags[1];
    const sharerListId = frags[2];

    let refreshToken = req.cookies[config.refreshCookieName];

    if (!refreshToken) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'You must be logged in to accept the shared list'});
    }

    const authResult = await checkAuthByRefreshToken(refreshToken);


    if (!authResult.result) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'You must be logged in to accept the shared list'});
    }

    let userId = authResult.userId;

    if (userId === sharerId) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'You cant add your own list'});
    }


    const sharerDoc = await dbActions.findUserById(sharerId);
    const userDoc = await dbActions.findUserById(userId);

    const listIdx = sharerDoc.lists.findIndex(list => list._id.valueOf() === sharerListId);

    if (!sharerDoc || !userDoc || listIdx === -1) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'Unable to share'});
    }

    if (userDoc.lists.length >= config.maxLists) {
        return res.render('error', {...config.errorMessageShare, errorMessage: 'You can\'t add any more lists'});

    }

    const list = sharerDoc.toJSON().lists[listIdx];

    const symbols = list.symbols.map(symbol => {
        delete symbol._id;
        return symbol;
    });

    userDoc.lists.push({
        name: list.name,
        isSocial: true,
        symbols: symbols
    });

    await userDoc.save();

    res.redirect('/panel');

}

module.exports = shareController;