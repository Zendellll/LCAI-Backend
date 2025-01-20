const router = require("express").Router();
const nodemailer = require("nodemailer");

router.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).send("Missing required fields");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      //   user: process.env.EMAIL_PROVIDER || "amir@lcai.earth", // Replace with your email
      user: "eransevil2@gmail.com", // Replace with your email
      pass: process.env.EMAIL_PASSWORD, // Use the App Password here
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      //   to: process.env.EMAIL_PROVIDER || "amir@lcai.earth",
      to: "amir@lcai.earth",
      subject: subject,
      text: message + "\n\nSent from: " + email,
    });
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

module.exports = router;
