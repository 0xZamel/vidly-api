let server;
const request = require("supertest");
const {User} = require("../../../models/user");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
describe('/api/auth',()=>{
    beforeEach(() => {server = require('../../../vidly');});
    afterEach(async() => {
        await User.deleteMany({});
        await server.close()}
    );

    describe('POST /api/auth',()=>{
        let email,password;
        const exec = function(){
            return request(server)
                .post('/api/auth')
                .send({email: email,password: password});
        }
        beforeEach(async() => {
            email = 'user1@gmail.com';
            password = '12345';
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            await User.insertOne({email: email, password: hashed,name:'user1'});
        })
        it('should return 400 if email is less than 5 char',async ()=>{
            email = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if email is more than 255 char',async ()=>{
            email = new Array(258).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if email is not valid',async ()=>{
            email = 'user1'
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if email is not found',async ()=>{
            email = 'user2@gmail.com'
            const res = await exec();
            expect(res.status).toBe(400);
        })


        it('should return 400 if password is incorrect',async ()=>{
            password = '123456';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return token if email and password are correct',async ()=>{
            const res = await exec();
            expect(res.status).toBe(200);
            const decoded = jwt.verify(res.text, config.get('jwtPrivateKey'));
            expect(decoded._id).toBeDefined();
        })

    })
})