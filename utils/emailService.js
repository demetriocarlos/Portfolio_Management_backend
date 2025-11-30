 
const nodemailer = require('nodemailer');


/*const transporter = nodemailer.createTransport({
     host: 'smtp.sendgrid.net',
    port: 587,
    auth:{
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    },
});*/

const transporter = nodemailer.createTransport({
  service: "gmail", // Usa Gmail
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

transporter.verify((error, success) => {
  if (error) console.error("Error al conectar con Gmail:", error);
  else console.log("Servidor de correo listo para enviar mensajes ✔️");
});


const sendContactEmail = async ({to,subject, message, from}) =>{
    const mailOptions = {
        from: `"Portafolio Contacto" <${process.env.EMAIL_USER}>`,  // remitente fijo
        to,  // correo del propietario del portafolio
        subject,
        text:message,
        replyTo: from, // correo del visitante
    };

    try {
    await transporter.sendMail(mailOptions);
     
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
    throw error;
  }
}


module.exports={sendContactEmail};





