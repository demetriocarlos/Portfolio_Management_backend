
const contactRouter = require('express').Router();
const {sendContactEmail} = require("../utils/emailService")
const User = require('../models/user')


contactRouter.post('/', async (request, response,next) => {
    try{
        const {projectOwnerId, fromEmail, message} = request.body;
        
        const owner = await User.findById(projectOwnerId);

        if (!projectOwnerId || !fromEmail || !message) {
            return response.status(400).json({ error: "Faltan datos para enviar el correo" });
        }

        if(!owner || !owner.email){
            return response.status(404).json({error:"No se encontró el usuario destino"})
        }
        
         
        await sendContactEmail({
            to: owner.email, // Correo del dueño del portafolio
            subject:"Contacto desde tu portafolio",
            message,
            from:fromEmail, // Correo del visitante
        });

        response.status(200).json({message: 'Correo enviado correctamente'});


    }catch(error){
        console.error('Error al enviar el correo', error);
        next(error)
    }
});


module.exports = contactRouter;

