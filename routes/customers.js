const express = require('express');
const {Customer,validateCustomer} = require('../models/customer');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const validateObjectId =require('../middleware/validateObjectId');


router.get('/', async (req, res) => {
    const customers = await Customer.find();
    res.send(customers);
})

router.post('/', [auth,validate(validateCustomer)],async (req, res) => {
    const customer = new Customer({
        name : req.body.name,
        phone : req.body.phone,
        isGold : req.body.isGold
    });
    await customer.save();

    res.send(customer);
})

router.put('/:id',[auth,validateObjectId,validate(validateCustomer)],async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id,
        {
            name : req.body.name,
            phone : req.body.phone,
            isGold : req.body.isGold
        },
        {new: true});

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
})

router.delete('/:id',[auth,admin,validateObjectId], async (req, res) => {
    const customer =  await Customer.findByIdAndDelete(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
})

router.get('/:id', [validateObjectId], async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
})

module.exports = router;
