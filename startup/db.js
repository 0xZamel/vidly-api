
const mongoose = require("mongoose");
const logger = require("../logger");

module.exports = function (app) {
    mongoose.connect('mongodb://localhost/vidly')
        .then(() => {
            logger.info('MongoDB Connected');
        })
}