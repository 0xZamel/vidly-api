const mongoose = require("mongoose");
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {genreSchema} = require("./genre");

const rentalSchema = new mongoose.Schema({
    customer: {
        type : new mongoose.Schema({
            name: {
                type: String,
                required: true ,
                minlength: 5,
                maxlength: 55
            },
            isGold : {
                type : Boolean,
                default: false
            },
            phone : {
                type: String,
                required: true ,
                minlength: 5,
                maxlength: 55
            }
        }),
        required: true

    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        default: Date.now,
        required: true
    },
    dateReturned: {
        type: Date,

    },
    rentalFee:{
        type: Number,
        min: 0
    }

});
const Rental = mongoose.model("Rental", rentalSchema);
function validateRental(rental){
    const Schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return Schema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validateRental