const twilio = require('twilio');
const dotenv = require("dotenv")

dotenv.config()
    

const sendSMS = (otp, phone) => {

    const accountSid = process.env.twilio_ACCOUNT_SID; 
    const authToken = process.env.twilio_AUTH_TOKEN; 
    const sender = process.env.twilio_SENDER;  

    const client = new twilio(accountSid, authToken);

    client.messages.create({
        body: `Kindly use ${otp} to activate`,
        to: phone, 
        from: sender 
    })
    .then((message) => {
        console.log("message sid from twilio response --> " + message.sid)

        return {
            message: message
        }
    })
    .catch((err) => {
        console.log("Error in sending sms--> " + err.message);
    });

}

module.exports = sendSMS;