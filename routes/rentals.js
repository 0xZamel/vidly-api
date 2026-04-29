const express = require('express');
const router = express.Router();
const {Rental, validate} =  require("../models/rental");
const {Movie} = require("../models/movie");
const {Customer} = require("../models/customer");



router.get('/', async (req, res) => {
    const rental = await Rental.find();
    res.send(rental);
})
router.post('/', async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Invalid Movie.');

    const customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Invalid Customer.');

    if(movie.numberInStock === 0)
        return res.status(400).send('Movie not in stock.');
    let rental = new Rental({
        customer: {
            _id:customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie : {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate

        }
    });

    try {
        await rental.save();
        movie.numberInStock--;
        await movie.save();
        res.send(rental);
    }
    catch(err) {
        await Rental.findByIdAndDelete(rental._id);
        res.status(500).send("Failed");
    }
})
router.put('/:id', async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid Movie.');

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid Customer.');


    const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        {
            customer: {
                _id: customer._id,
                name: customer.name,
                phone: customer.phone
            },
            movie: {
                _id: movie._id,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            }
        },
        { new: true }
    );

    if(!rental) return res.status(404).send('Error updating movie');
    res.send(rental);
})
router.delete('/:id', async (req, res) => {
    const rental =  await Rental.findByIdAndDelete(req.params.id);

    if(!rental) return res.status(404).send('Error deleting rental');

    await Movie.findByIdAndUpdate(
        rental.movie._id,
        {$inc : {numberInStock: 1}}
    )
    res.send(rental);
})
router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if(!rental) return res.status(404).send('Not Found');
    res.send(rental);
})
module.exports = router;
