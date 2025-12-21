
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
require('dotenv').config()
const axios = require("axios")
 


loginRouter.post('/', async (request,response, next) => {
    try{
        const { email, password} = request.body;  // Extraemos el  correo y contraseña del cuerpo de la solicitud

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim()
 
        // Buscamos al usuario por correo en la base de datos
        const user =await User.findOne({email});
        

        // Comparamos la contraseña si el usuario existe
        const passwordCorrect = user 
            ? await bcrypt.compare(password, user.passwordHash) // Compara las contraseñas
            :false;

        // Si el correo no existe o la contraseña es incorrecta, respondemos con un error 401
        if(!(user && passwordCorrect)){
            return response.status(401).json({  
                error:'invalid email or password'
            })
        }

        // Si las credenciales son correctas, creamos un objeto que contiene el  correo electronico y el ID del usuario
        const userForToken = {
            userName:user.userName,
            id : user._id
        }

         
        // Firmamos un token JWT con el objeto userForToken y una clave secreta almacenada en las variables de entorno
        const token = jwt.sign(
            userForToken,
            process.env.SECRET,
        )

        response
        .status(200)
        .send({token, userName: user.userName,  email: user.email,  id:user._id})
    }catch (error){
        console.error('Error al iniciar sesion', error)
        next(error)
    }
})




loginRouter.post("/github", async (request, response, next) => {
     
    const {code} = request.body;
   
     
    if(!code){
        return response.status(400).json({ error: "Falta el código de GitHub" })
    }

    try{
 
        // 1. Intercambiar el code por un access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                 code,
            },
            {
                headers:{
                    Accept:"application/json",
                },
            }
        );

         
        const accessToken = tokenResponse.data.access_token;
         
        // 2. Obtener información del usuario con el token
        const userResponse = await axios.get("https://api.github.com/user",  {
            headers:{
                Authorization:`Bearer ${accessToken}`
            }
        })

         

        const emailResponse = await axios.get("https://api.github.com/user/emails", {
            headers:{
                Authorization:`Bearer ${accessToken}`,      
            }
        });

         

        const githubProfile = userResponse.data;
        const primaryEmail = emailResponse.data.find(e => e.primary && e.verified)?.email;


        if(!primaryEmail){
            return response.status(400).json({error: "No se pudo obtener un correo verificado"})
        }
        

        // 3. Buscar si el usuario ya existe
        let user = await User.findOne({githubId: githubProfile.id});

        if(!user){
            // Si no, crearlo
            user = new User({
                userName:githubProfile.login,
                email: primaryEmail,
                //passwordHash: "Github1", // dummy para cumplir validación
                githubId: githubProfile.id,
            });

            await user.save()
        }


        // 4. Crear JWT
        const userForToken = {
            userName: user.userName,
            id: user._id
        }


        const token = jwt.sign(userForToken, process.env.SECRET);

        response.status(200).json({
            token,
            userName: user.userName,
            email: user.email,
            id: user._id
        });
    }catch (error){
        console.error("Error en login con GitHub", error.response?.data || error.message)
        next(error);
    }



});




module.exports = loginRouter;
