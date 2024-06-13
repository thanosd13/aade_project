const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dimopthan@gmail.com', // Replace with your email
        pass: 'gxyx jxnr irsy dejn' // Replace with your email password
    }
});

// Email options
let mailOptions = {
    from: 'new_app@gmail.com', // Sender address
    to: 'adimopoulos@ceid.upatras.gr', // List of recipients
    subject: 'new app', // Subject line
    text: 'Καλώς ήρθατε!', // Plain text body
    html: '<b>Καλώς ήρθατε στην εφαρμογή μας!</b>' // HTML body
};


const sendEmail = async function () {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error: ${error}`);
        }
        console.log(`Message Sent: ${info.response}`);
    });
}


module.exports = sendEmail;