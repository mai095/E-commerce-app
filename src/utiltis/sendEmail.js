import nodemailer from "nodemailer";

async function sendEmail({ to, subject, html, attachments = [] }) {
  // &sender
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

    const info =await transporter.sendMail({
      from: `E-Commerce ${process.env.SENDER_EMAIL}`,
      to,
      subject,
      html,
      attachments
    });

  if (info.accepted.length > 0) return true;
  return false;
}

export default sendEmail;
