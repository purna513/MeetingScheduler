const nodemailer = require('nodemailer');
let sendEmail = (sendEmailOptions) => {

    let account = {
        user: 'blikesekhar@gmail.com',
        pass: 'Purna@1234'  
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: account.user, 
            pass: account.pass 
        }
    });
        
    let mailOptions = {
        from: 'blikesekhar@gmail.com', 
        to: sendEmailOptions.email, 
        subject: sendEmailOptions.subject, 
        text: `Dear ${sendEmailOptions.name},
               Welcome to our MeetUp App a brand new aplication with plenty of user friendly function.
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
