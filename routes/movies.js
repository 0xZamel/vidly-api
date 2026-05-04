const express = require('express');
const router = express.Router();
const {Movie, validateMovie} =  require("../models/movie");
const {Genre} = require("../models/genre");
const validate = require('../middleware/validate');



router.get('/', async (req, res) => {
    const movie = await Moive.find();
    res.send(movie);
})
router.post('/',validate(validateMovie), async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(404).send('Invalid Genre.');

    const movie = new Movie({
        title : req.body.title,
        genre : {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    await movie.save();
    res.send(movie);
})
router.put('/:id',validate(validateMovie), async (req, res) => {
    const movie = await Moive.findByIdAndUpdate(req.params.id,
        {title : req.body.title},
        {new: true});

    if(!movie) return res.status(404).send('Error updating movie');
    res.send(movie);
})
router.delete('/:id', async (req, res) => {
    const movie =  await Moive.findByIdAndDelete(req.params.id);

    if(!movie) return res.status(404).send('Error updating movie');

    res.send(movie);
})
router.get('/:id', async (req, res) => {
    const movie = await Moive.findById(req.params.id);
    if(!movie) return res.status(404).send('Not Found');
    res.send(movie);
})

module.exports = router;
