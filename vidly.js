const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const user = require('./routes/users');
const auth = require('./routes/auth');

const app = express();
app.use(express.json());

if(!config.get('jwtPrivateKey')) {
    console.error('Missing JWT Private Key');
    process.exit(1);
}
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies',movies);
app.use('/api/rentals',rentals);
app.use('/api/users',user);
app.use('/api/auth',auth);


mongoose.connect('mongodb://localhost/vidly')
.then(() => {console.log('MongoDB Connected');})
.catch(err => console.error('connection error:'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server started on port 3000'));
