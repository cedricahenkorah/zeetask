const nodemailer = require("nodemailer");

const PasswordResetMail = (resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Welcome to ${teamName}!`,
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("error: ", err);
      return res.status(500).json({ message: "Failed to send reset email" });
    } else {
      console.log("Email sent: " + info.response);
      return res.status(200).json({ message: "Reset email sent successfully" });
    }
  });
};

module.exports = PasswordResetMail;
