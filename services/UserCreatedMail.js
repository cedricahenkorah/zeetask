const nodemailer = require("nodemailer");

const mailContent = (
  firstName,
  username,
  email,
  password,
  teamName,
  adminName
) => `
<p>Hello ${firstName},</p>


<p>Visit [website] and log in using: http://localhost:3000</p>

<p>Username: ${username} </p>
<p>Email: ${email} </p>
<p>Password: ${password} </p>
<p>Team: ${teamName} </p>
<p>Admin: ${adminName} </p>


<p>Feel free to reach out if you need help. We're excited to have you on board! </p>

<p>Best regards,</p>
<p>ZeeTask Team</p>
`;

const UserCreatedMail = (
  firstName,
  username,
  email,
  password,
  teamName,
  adminName
) => {
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
    subject: "Successful Onboarding on ZeeTask",
    html: mailContent(
      firstName,
      username,
      email,
      password,
      teamName,
      adminName
    ),
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("error: ", err);
      // return res
      //   .status(500)
      //   .json({ message: "Failed to send account created email" });
    } else {
      console.log("Email sent: " + info.response);
      // return res
      //   .status(200)
      //   .json({ message: "Account created email sent successfully" });
    }
  });
};

module.exports = UserCreatedMail;
