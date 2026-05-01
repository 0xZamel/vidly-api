const winston = require("winston");

module.exports = function (app) {
    winston.exceptions.handle(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({filename: 'uncaughtException.log'}));

    process.on('unhandledRejection', err => {
        throw err;
    })
}