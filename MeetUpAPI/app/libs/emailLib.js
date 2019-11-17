'use strict';

const nodemailer = require('nodemailer');
let sendEmail = (sendEmailOptions) => {

    let account = {
        user: 'blikesekhar@gmail.com', //emailid
        pass: 'Purna@1234'  //password
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: account.user, 
            pass: account.pass 
        }
    });

    //console.log("from node mailer"+transporter.auth.user)
    // setup email data with unicode symbols
    let mailOptions = {
        from: 'blikesekhar@gmail.com', // sender address
        to: sendEmailOptions.email, // list of receivers
        subject: sendEmailOptions.subject, // Subject line
        text: `Dear ${sendEmailOptions.name},
               Welcome to our Soft Chat a brand new chat application for our admirable Employees.
        `, // plain text body
        html: sendEmailOptions.html // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        else{
            console.log('Message successfully sent.', info);
        }
       
    });

}
module.exports = {
    sendEmail: sendEmail
  }
