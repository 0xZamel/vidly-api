const express = require('express');
const router = express.Router();
const {Rental, validateReturn} =  require("../models/rental");
const {Movie} = require("../models/movie");
const {Customer} = require("../models/customer");
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const moment = require('moment');


router.post('/',[auth,validate(validateReturn)], async (req, res) => {
    
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if(!rental) return res.status(404).send('Rental not found');
    if(rental.dateReturned) return res.status(400).send('Return already processed');
    
    rental.return();
    await rental.save();

    await Movie.updateOne({_id: rental.movie._id}, {
        $inc: {numberInStock: 1}
    });


    res.status(200).send(rental);
});


module.exports = router;
