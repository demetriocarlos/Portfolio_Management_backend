
const forgotRouter = require('express').Router();
const User = require('../models/user');
const {sendContactEmail} = require('../utils/emailService')
const bcrypt = require('bcryptjs')

 function generarNumeroAleatorio() {
            const min = 10000;      // 5 dígitos: 10000
            const max = 9999999;    // 7 dígitos: 9999999
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

 

forgotRouter.post("/forgot-password", async (request, response,next) =>{
    try{
        const {email} = request.body;

          
        const userEmail = await User.findOne({email:email})

        const codigo = generarNumeroAleatorio().toString();
       

        if(!userEmail){
            return response.status(404).json({error:"No hay ninguna cuenta registrada con este correo"})
        }

        userEmail.resetCode = codigo;
        userEmail.resetCodeExpires= Date.now() + 10 * 60 * 1000;
        await userEmail.save();

        await sendContactEmail({
            to:email,
            subject:"Código para restablecer contraseña",
            message: `Tu código es: ${codigo}`,
            from:process.env.SENDGRID_VERIFIED_SENDER
        }) 

        response.status(200).json({message: 'Correo enviado correctamente'});


    }catch(error){
        console.error("Error al intentar restableser la contraseña", error)
        next(error)
    }
})





forgotRouter.put("/reset-password", async (request, response, next) =>{
    try{
        const {email, code, password} = request.body;
         
        
        const user = await User.findOne({email});


        
        if (!user  || user.resetCode !== code || Date.now() > user.resetCodeExpires){
            return response.status(403).json({error:"Código inválido o expirado"})
        }

         const trimmedNewPassword = password.trim();
 
        user.passwordHash = await bcrypt.hash(trimmedNewPassword,10)
        user.resetCode= undefined;
        user.resetCodeExpires = undefined;

        await user.save();
         
        response.status(200).json({ message: "Contraseña actualizada con éxito" })
    }catch(error){
        console.error("Error al restablecer la contraseña", error)
        next(error)
    }
})





module.exports = forgotRouter;




