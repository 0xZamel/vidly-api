const winston = require('winston');
const logger = require('../logger');

module.exports = function (err , req, res, next) {
    winston.error = (err.message,err);

    res.status(500).send('something went wrong');
}