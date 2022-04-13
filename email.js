const sendgrid = require('@sendgrid/mail');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const sendgrid_api=process.env.SENDGRID_API_KEY;
// console.log(sendgrid_api);
sendgrid.setApiKey(sendgrid_api);

function sendMail(email){
  const msg = {
    to: email,
    from: 'prince.patel@jungleworks.com',
    subject: 'schedule email',
    text: 'sending a test scheduled email',
};
sendgrid
    .send(msg)
    .then((resp) => {
      console.log('Email sent\n', resp)
    })
    .catch((error) => {
      console.error(error)
    })
    
  }

  module.exports.sendMail=sendMail;


