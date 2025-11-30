
/*const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const bcrypt = require('bcryptjs');
*/

const request = require("supertest");
const app = require("../app"); // Tu aplicación Express
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Mock de axios
jest.mock("axios");
const axios = require("axios");

describe("POST /api/user/login/github", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("crea un nuevo usuario con GitHub si no existe y devuelve un token", async () => {
    // Mock de respuestas de GitHub
    axios.post.mockResolvedValue({
      data: {
        access_token: "fake_github_token"
      }
    });

    axios.get
      .mockResolvedValueOnce({
        data: {
          id: 123456,
          login: "github-user"
        }
      })
      .mockResolvedValueOnce({
        data: [
          { email: "test@example.com", primary: true, verified: true }
        ]
      });

      console.log('hola mundo')
    const response = await request(app)
      .post("/api/user/login/github")
      .send({ code: "fake_code_from_github" })
      .expect(200);

      console.log('response', response.body)
      
    expect(response.body.token).toBeDefined();
    expect(response.body.userName).toBe("github-user");

    const userInDb = await User.findOne({ email: "test@example.com" });
    console.log('userInDb', userInDb)
    expect(userInDb).not.toBeNull();
    expect(userInDb.githubId).toBe('123456');
  }, 100000);



  it("devuelve error si no se proporciona code", async () => {
    const response = await request(app)
      .post("/api/user/login/github")
      .send({})
      .expect(400);

    expect(response.body.error).toBe("Falta el código de GitHub");
  }, 100000);
});

afterAll(async () => {
  await mongoose.connection.close();
});

