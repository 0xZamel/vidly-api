let server;
const {User } = require("../../../models/user");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


describe('/api/users',()=>{
    beforeEach(() => {server = require('../../../vidly');});
    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });



    describe('GET /me', () => {
        it('should return the user',async ()=>{
            const user = new User({name : 'user1', email: 'user1@example.com', password: 'password1'});
            await user.save();

            const token = user.generateAuthToken();

            const res = await request(server)
                .get('/api/users/me')
                .set('x-auth-token', token);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'user1');
            expect(res.body).toHaveProperty('email', 'user1@example.com');
        })
    })

    

    describe('POST /', () => {
        let name,email,password,salt;

        const exec = async()=>{
            return await request(server)
                .post('/api/users')
                .send({name: name,email: email, password: password});
        };

        beforeEach(async () => {
            name = 'user1';
            email = 'user1@example.com';
            password = 'password1';
            salt = await bcrypt.genSalt(10);
        });

    
        it('should return 400 if user name is less than 3 characters',async ()=>{
            name = '12';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 50 characters',async ()=>{
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        
        it('should return 400 if password is less than 5 characters',async ()=>{
            password = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if password is more than 255 characters',async ()=>{
            password = new Array(257).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is less than 5 characters',async ()=>{
            email = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is more than 255 characters',async ()=>{
            email = new Array(257).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is invalid',async ()=>{
            email = 'invalidemail';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is already registered',async ()=>{
            await User.insertMany([
                {name : 'user1', email: 'user1@example.com', password: 'password1'}
            ]);
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the user if it is valid',async ()=>{
            await exec();
            const user = await User.findOne({email: email});
            expect(user).not.toBeNull();
        });

        it('should hash the  password if it is valid',async ()=>{
            const res = await exec();
            const user = await User.findOne({email: email});
            const validPassword = await bcrypt.compare(password, user.password);
            expect(validPassword).toBe(true);

        });

        it('should return the user if valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('name',name);
            expect(res.body).toHaveProperty('email',email);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).not.toHaveProperty('password');
        })

        it('should return token in header',async ()=>{
            const res = await exec();
            expect(res.header).toHaveProperty('x-auth-token');
        })
        


    })

    

    




})