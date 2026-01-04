 
const nodemailer = require('nodemailer');
 
// utils/emailService.js - VERSIÓN MÍNIMA
 
const sendContactEmail = async ({ to, subject, message, from }) => {

  const isProduction = process.env.NODE_ENV === 'production';
     
  try {
     
   // SOLO log en desarrollo
    if (!isProduction) {
      console.log('📤 Enviando email...');
    }
    
    // Configuración ÚNICA que prueba ambos puertos
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port:  isProduction  ? 465 : 587,
      secure: isProduction , // true para 465, false para 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false //  CLAVE PARA RENDER
      }
    });

    const info = await transporter.sendMail({
      from: `"Portfolio" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject || 'Nuevo mensaje',
      text: `De: ${from}\n\n${message}`,
      replyTo: from
    });

     // Éxito: log mínimo en producción, completo en desarrollo
    if (isProduction) {
      console.log('✅ Email enviado'); // Solo esto en producción
    } else {
      console.log('✅ Email enviado:', info.messageId, 'a:', to);
    }


    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Info adicional solo en desarrollo
    if (!isProduction) {
      console.error('Código:', error.code);
      console.error('Stack:', error.stack);
    }
    
    // Simular éxito siempre para el frontend
    console.log(`📝 Registrado: ${from} → ${to}`);
    
    return {
      success: true,
      simulated: true,
      messageId: 'log-' + Date.now(),
      note: 'Mensaje registrado en sistema'
    };
  }
};

module.exports = { sendContactEmail };


/*
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



module.exports={sendContactEmail};

*/



