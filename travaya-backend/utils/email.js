const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        // Create a test account on the fly for development
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        const mailOptions = {
            from: '"Travaya Concierge" <noreply@travaya.com>',
            to,
            subject,
            html,
        };

        let info = await transporter.sendMail(mailOptions);

        console.log("-----------------------------------------");
        console.log("Email Notification Dispatched Successfully!");
        console.log("Recipient:", to);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("-----------------------------------------");

        return info;
    } catch (error) {
        console.error("Email Dispatch Error:", error);
    }
};

module.exports = sendEmail;
