const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

async function testEmail() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  console.log(`Testing SMTP: ${smtpHost}:${smtpPort} with ${smtpUser}`);

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.verify();
    console.log('SMTP connection verified successfully!', info);
  } catch (err) {
    console.error('SMTP initialization failed:', err.message);
  }
}

testEmail();
