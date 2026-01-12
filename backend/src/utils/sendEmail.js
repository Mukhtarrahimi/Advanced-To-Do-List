const nodemailer = require("nodemailer");

const sendEmail = async({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;
