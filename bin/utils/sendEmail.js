const Resend = require("resend");

require("dotenv").config();

const resend = new Resend.Resend(process.env.RESEND_EMAIL);

exports.send_mail = async (res, email, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "noreply.disengage.online",
      to: ["delivered@resend.dev"],
      subject,
      html,
    });
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error });
  }
};
