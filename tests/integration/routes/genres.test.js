let server;
const {Genre } = require("../../../models/genre");
const {User } = require("../../../models/user");
const request = require("supertest");
const mongoose = require("mongoose");

describe('/api/genres',()=>{
    beforeEach(() => {server = require('../../../vidly');});
    afterEach(async () => {
        await Genre.deleteMany({});
        await server.close();
    });



    describe('GET /', () => {
        it('should return all genres',async ()=>{
            await Genre.insertMany([
                {name : 'genre1'},
                {name : 'genre2'}
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(genre => genre.name =='genre1')).toBeTruthy();
            expect(res.body.some(genre => genre.name =='genre2')).toBeTruthy();
        })
    })

    describe('GET /:id', () => {
        it('should return a genre if the given id is valid',async ()=>{
            const genre1 = new Genre({name : 'genre1'});

            await genre1.save();

            const res = await request(server).get(`/api/genres/${genre1._id}`);

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(genre1._id.toHexString());
            expect(res.body).toHaveProperty('name', genre1.name);
        })

        it('should return 404 with if the given id is invalid',async ()=>{
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
        })

        it('should return 404 with if no genre with the gived id',async ()=>{
            const id = new mongoose.Types.ObjectId();
            const res = await request(server).get('/api/genres/' + id);

            expect(res.status).toBe(404);
        })

    })

    describe('POST /', () => {
        let token,name;

        const exec = async()=>{
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: name});
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        })

        it('should return 401 if user is not logged in',async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 400 if genre is less than 5 characters',async ()=>{
            name = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if genre is more than 50 characters',async ()=>{
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should save the genre if it is valid',async ()=>{
            await exec();
            const genre = await Genre.findOne({name: 'genre1'});
            expect(genre).not.toBeNull();
        })

        it('should return the genre if it is valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','genre1');
        })

    })

    describe('PUT /:id', ()=>{

        let token,name,id;

        const exec = ()=>{
            return  request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({name: name});
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();
            name = 'genre1';
            id = new mongoose.Types.ObjectId();
            await Genre.insertOne({_id:id,name: 'oldGenre'});
        })

        it('should return 401 if user is not logged in',async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 400 if genre is less than 5 characters',async ()=>{
            name = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if genre is more than 50 characters',async ()=>{
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 404 if genre is not updated',async ()=>{
            id = new mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should update the genre if it is valid',async ()=>{
            await exec();
            const genre1 = await Genre.find({name: 'genre1'});
            const genre2 = await Genre.find({name: 'oldGenre'});

            expect(genre1).not.toBeNull();
            expect(genre2.length).toBe(0);
        })

        it('should return the genre if it is valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','genre1');
        })

    })

    describe('DELETE /:id', ()=>{
        let id;
        const exec = ()=>{
            return  request(server)
                .delete(`/api/genres/${id}`)
                .set('x-auth-token', token);
        }
        beforeEach(async () => {
            id = new mongoose.Types.ObjectId();
            token = new User({isAdmin : true}).generateAuthToken();
            await Genre.insertOne({_id:id,name: 'genre1'});
        })
        it('should return 404 if no genre with the given id',async ()=>{
            id = new mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return 200 if it is deleted',async ()=>{
            const res = await exec();
            expect(res.status).toBe(200);
        })

        it('should return the genre if it is deleted',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id',id.toHexString());
            expect(res.body).toHaveProperty('name','genre1');
        })
    })




})