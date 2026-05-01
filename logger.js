const winston = require('winston');

module.exports = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({ filename: 'logfile.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

