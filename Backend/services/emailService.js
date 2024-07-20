require("dotenv").config();
const nodemailer = require("nodemailer");

const HOST = process.env.SMTP_HOST;
const PORT = process.env.SMTP_PORT;
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

const sendEmail = async (to, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: USER,
        pass: PASS,
      },
      tls: {
        ciphers: "SSLv3",
      },
    });

    let info = await transporter.sendMail({
      from: EMAIL_FROM, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: message, // plain text body
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };
