const genres = require("../routes/genres");
const customers = require("../routes/customers");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const user = require("../routes/users");
const auth = require("../routes/auth");
const error = require("../middleware/error");
const returns = require("../routes/return");
const express = require("express");

module.exports =function(app){
    app.use(express.json());
    app.use('/api/genres', genres);
    app.use('/api/customers', customers);
    app.use('/api/movies',movies);
    app.use('/api/rentals',rentals);
    app.use('/api/users',user);
    app.use('/api/auth',auth);
    app.use('/api/returns',returns);
    app.use(error); // Handling Rejected Promises
}