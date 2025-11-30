
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
     


    //rutas
    const userRouter = require('./Controllers/user')
    const loginRouter = require('./Controllers/login')
    const projectRouter = require('./Controllers/project')
    const contactRouter = require('./Controllers/contact')
    const forgotRouter = require('./Controllers/forgot-password')

    const middleware = require('./utils/middleware')

    require('./mongo')


    app.use(cors())
    app.use(express.static('dist'))
    app.use(express.json())


    app.use(middleware.tokenExtractor)
    app.use(middleware.requestLogger)

    app.use('/api/user', userRouter);
    app.use('/api/user/login', loginRouter);
    app.use('/api/user', forgotRouter)
    app.use('/api/user/projects',middleware.userExtractor, projectRouter);
    app.use('/api/user/contact', middleware.userExtractor, contactRouter)

    // Middlewares (después de las rutas)
    app.use(middleware.errorHandler)
    
    app.use(middleware.unknownEndpoint)


 
module.exports= app;