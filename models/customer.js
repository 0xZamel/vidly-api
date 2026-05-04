const Joi = require('joi');
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
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
});
const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer){
    const schema = Joi.object({
        name : Joi.string().min(5).max(55).required(),
        phone : Joi.string().min(5).max(55).required(),
        isGold : Joi.boolean()
    });
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
