

const app = require('../app');
const mongoose = require('mongoose');
const supertest = require('supertest')
const User = require('../models/user')
const api = supertest(app)


describe("test para user", () =>{
    let token;
    let userId;

    
    beforeEach(async () =>{
        await User.deleteMany({})

        const userToLogin = {
            userName:'testUser',
            email: 'testuser@example.com',
            password: 'Password123',
        }


        await api.post('/api/user/signup')
            .send(userToLogin);

        const loginResponse = await api
            .post('/api/user/login')
            .send({email:userToLogin.email, password:userToLogin.password});


        token = loginResponse.body.token;
        userId = loginResponse.body.id;
    }, 100000);


    
    test('actualizar propiedades del usuario', async () =>{

        //console.log('token' , token)
        //console.log('userId', userId)
  

        //  /${userId}
        const response = await api
            .put(`/api/user/profile/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({jobTitle:'desarrollo',biography:'trabajo duro'})
            .expect(200)
            .expect('Content-Type',/application\/json/)


            //console.log('response',response.body)

            expect(response.body.userName).toBe('testUser')
            expect(response.body.jobTitle).toBe('desarrollo')
            expect(response.body.biography).toBe('trabajo duro')

    })



})