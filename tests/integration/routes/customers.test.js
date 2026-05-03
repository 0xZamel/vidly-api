let server;
const {Customer } = require("../../../models/customer");
const {User } = require("../../../models/user");
const request = require("supertest");
const mongoose = require("mongoose");

describe("/api/customers", () => {
    beforeEach( () => {server = require("../../../vidly"); });
    afterEach( async () => {
        await Customer.deleteMany({});
        await server.close();
    })

    describe('GET /', () => {
        it('should return all customers',async ()=>{
            await Customer.insertMany([
                {name : 'customer1',phone : '12345'},
                {name : 'customer2',phone : '12345'},
            ]);

            const res = await request(server).get('/api/customers');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(customer => customer.name =='customer1')).toBeTruthy();
            expect(res.body.some(customer => customer.name =='customer2')).toBeTruthy();
        })
    })

    describe('POST /', () => {
        let phone,name,isGold,token;

        const exec = async()=>{
            return await request(server)
                .post('/api/customers')
                .set('x-auth-token', token)
                .send({name: name, phone: phone, isGold: isGold});
        }

        beforeEach(() => {
            name = 'customer1';
            phone = '12345';
            isGold = false;
            token = new User().generateAuthToken();
        })

        it('should return 401 if user is not logged in',async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 400 if customer name is less than 5 characters',async ()=>{
            name = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if customer name is more than 55 characters',async ()=>{
            name = new Array(57).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if customer phone is less than 5 characters',async ()=>{
            phone = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })
        
        it('should return 400 if customer phone is more than 55 characters',async ()=>{
            phone = new Array(57).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if customer isGold is not boolean',async ()=>{
            isGold = 'notboolean';
            const res = await exec();
            expect(res.status).toBe(400);
        })


        it('should save the customer if it is valid',async ()=>{
            await exec();
            const customer = await Customer.findOne({name: 'customer1'});
            expect(customer).not.toBeNull();
        })

        it('should return the customer if it is valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','customer1');
            expect(res.body).toHaveProperty('phone','12345');
            expect(res.body).toHaveProperty('isGold',false);
        })

    })
    
    describe('PUT /:id', ()=>{

        let phone,name,id,isGold,token;

        const exec = ()=>{
            return  request(server)
                .put('/api/customers/' + id)
                .set('x-auth-token',token)
                .send({name: name, phone: phone, isGold: isGold});
        }

        beforeEach(async () => {
            name = 'customer1';
            phone = '12345';
            isGold = false;
            id = new mongoose.Types.ObjectId();
            token = new User().generateAuthToken();
            await Customer.insertOne(
                {_id:id,name: 'oldCustomer', phone: '67890', isGold: false});
        })

        it('should return 401 if user is not logged in',async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        })

        it('should return 404 if id is invalid',async ()=>{
            id = '123';
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should return 400 if customer name is less than 5 characters',async ()=>{
            name = '123';
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 400 if customer name is more than 55 characters',async ()=>{
            name = new Array(57).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        })

        it('should return 404 if customer is not found',async ()=>{
            id = new mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        })

        it('should update the customer if it is valid',async ()=>{
            await exec();
            const customer1 = await Customer.find({name: 'customer1'});
            const customer2 = await Customer.find({name: 'oldCustomer'});

            expect(customer1).not.toBeNull();
            expect(customer2.length).toBe(0);
        })

        it('should return the customer if it is valid',async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name','customer1');
            expect(res.body).toHaveProperty('phone','12345');
            expect(res.body).toHaveProperty('isGold',false);
        })
    })

    describe('DELETE /:id', ()=>{
        let id,token;
            const exec = ()=>{
                return  request(server)
                    .delete(`/api/customers/${id}`)
                    .set('x-auth-token', token);

            }
            beforeEach(async () => {
                id = new mongoose.Types.ObjectId();
                token = new User({isAdmin : true}).generateAuthToken();
                await Customer.insertOne({_id:id,name: 'customer1', phone: '12345', isGold: false});
            })

            it('should return 401 if user is not logged in',async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
            })

            it('should return 403 if user is not an admin',async ()=>{
            token = new User({isAdmin : false}).generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
            })
            
            it('should return 404 if id is invalid',async ()=>{
            id = '123';
            const res = await exec();
            expect(res.status).toBe(404);
            })

            it('should return 404 if no customer with the given id',async ()=>{
                id = new mongoose.Types.ObjectId();
                const res = await exec();
                expect(res.status).toBe(404);
            })
    
            it('should return 200 if it is deleted',async ()=>{
                const res = await exec();
                expect(res.status).toBe(200);
            })
    
            it('should return the customer if it is deleted',async ()=>{
                const res = await exec();
                expect(res.body).toHaveProperty('_id',id.toHexString());
                expect(res.body).toHaveProperty('name','customer1');
            })
    })

    describe('GET /:id', ()=>{
        let id;

        const exec = ()=>{
            return  request(server)
                .get(`/api/customers/${id}`)
        }

        beforeEach(async () => {
            id = new mongoose.Types.ObjectId();
            await Customer.insertOne({_id:id,name: 'customer1', phone: '12345', isGold: false});
        });

        it('should return 404 if no customer with the given id',async ()=>{
            id = new mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return the customer if it is found',async ()=>{
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id',id.toHexString());
            expect(res.body).toHaveProperty('name','customer1');
            expect(res.body).toHaveProperty('phone','12345');
            expect(res.body).toHaveProperty('isGold',false);
        });


    })
        
        
})