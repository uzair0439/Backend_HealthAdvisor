const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "uzairkhan0439@gmail.com",
      pass: "LIONEL@MESSI10",
    },
  
  });
  // send mail with defined transport object
  const message = {
    from: `kabirenger@gmail.com`,
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    html: options.html,
  };
  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};
module.exports = sendEmail;
