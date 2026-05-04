const request = require('supertest');
const {Rental} = require('../../../models/rental');
const {User} = require('../../../models/user');
const mongoose = require('mongoose');
const moment = require('moment');
const {Movie} = require('../../../models/movie');

describe('/api/return',()=>{
    let server;
    
    let token, customerId, movieId;
    let rental;
    let movie;
    beforeEach(async ()=>{
        server = require('../../../vidly');

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        
        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: {name: '12345'},
            numberInStock: 10
        });

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345',
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
         });

        await movie.save();
        await rental.save();
    });

    afterEach(async ()=>{
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({customerId, movieId})
    };

    it('should return 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for this customer/movie', async () => {
        await Rental.deleteMany({});
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it('should return 400 if return is already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 200 if we have a valid request', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('should set the return date if input is valid', async () => {
        await exec();
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set the rental fee', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increase the movie stock', async () => {
        const res = await exec();
        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental in the response body', async () => {
        const res = await exec();
        expect(Object.keys(res.body))
        .toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'])
        );
    });


});