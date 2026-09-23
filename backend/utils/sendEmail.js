const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'MessMate'} <${process.env.FROM_EMAIL || 'noreply@messmate.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(message);
  } else {
    // If no SMTP configured, log to terminal for instant testing (much faster than Ethereal)
    console.log('\n==================================================');
    console.log('📧 DEV MODE: MOCK EMAIL SENT');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Message:');
    console.log(options.message);
    console.log('==================================================\n');
  }
};

module.exports = sendEmail;
