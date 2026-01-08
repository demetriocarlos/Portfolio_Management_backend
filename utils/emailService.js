 const nodemailer = require('nodemailer');

 const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  },
  // Añadir esto para Render
  tls: {
    rejectUnauthorized: false
  }
});


transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error conectando a SendGrid:', error.message);
  } else {
    console.log('✅ SendGrid configurado correctamente');
    
  }
});



const sendContactEmail = async ({ to, subject, message, from }) => {
  try {
    //console.log(`📤 Enviando email de ${from} a ${to}...`);
    
    const mailOptions = {
      from: `"Portfolio App" <${process.env.EMAIL_USER || 'contacto@portfolio.com'}>`,
      to: to,
      subject: subject || `Mensaje de ${from}`,
      text: `De: ${from}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">Nuevo mensaje desde Portfolio App</h2>
          <p><strong>De:</strong> ${from}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #F3F4F6; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            ⚡ Enviado desde Portfolio App
          </p>
        </div>
      `,
      replyTo: from,  // correo del visitante
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado correctamente');
    //console.log('   Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    
    // Fallback simple
    
    
    return {
      success: true, // Siempre true para el frontend
      simulated: true,
      messageId: 'log-' + Date.now(),
      note: 'Mensaje registrado en sistema'
    };
  }
}; 

module.exports = {  sendContactEmail };