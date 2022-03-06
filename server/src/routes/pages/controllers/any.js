const config = require('../../../config');

const anyPageController = (req, res, next) => {
    res.render('index', { title: '' });
}

module.exports = anyPageController;