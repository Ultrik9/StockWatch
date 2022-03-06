const express = require('express');
const router = express.Router();

const anyPageController = require('./controllers/any');
const googleRedirectController = require('./controllers/google-redirect');
const shareController = require('./controllers/share');

router.get('/auth_redirects/google', googleRedirectController);
router.get('/share/:shareId', shareController);
router.get(['/', '/login', '/signup', '/panel'], anyPageController);

module.exports = router;