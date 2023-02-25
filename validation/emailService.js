const nodemailer = require("nodemailer")


const sendEmail = (token, email) => {
    const html = `<p>You requested for email verification, kindly use this <a href="http://localhost:8000/api/v1/users/verify/email?token=${token}&email=${email}">link</a> to verify your email address</p>`;

    const transporter = nodemailer.createTransport({
        host: 'faithfulolaleru.com',
        port: 465,
        secure: true,
        auth: {
            user: 'faithful@faithfulolaleru.com',
            pass: 'ionknowmyname'
        }
    })

    transporter.sendMail({
        from: 'faithful@faithfulolaleru.com',
        to: email,
        subject: 'Validate your Account!',
        html: html
    })
    .then((message) => {
        console.log("Message sent --> " + message.messageId);
        return {
            message: "Email Sent Successfully",
            messageId: message.messageId
        }
    })
    .catch((err) => {
        console.log("Error in sending email--> " + err.message);
        return {
            message: "Email Failed to Send",
            messageId: null
        }
    })    
}

const resetPassword = (email) => {
    const html = `<p>You requested for to reset password, kindly use this <a href="http://localhost:3000/user/newPassword">link</a> to reset your password</p>`;

    const transporter = nodemailer.createTransport({
        host: 'faithfulolaleru.com',
        port: 465,
        secure: true,
        auth: {
            user: 'faithful@faithfulolaleru.com',
            pass: 'ionknowmyname'
        }
    })

    transporter.sendMail({
        from: 'faithful@faithfulolaleru.com',
        to: email,
        subject: 'Reset your Password!',
        html: html
    })
    .then((message) => {
        console.log("Message sent --> " + message.messageId);
        return {
            message: "Email Sent Successfully",
            messageId: message.messageId
        }
    })
    .catch((err) => {
        console.log("Error in sending email--> " + err.message);
        return {
            message: "Email Failed to Send",
            messageId: null
        }
    })    
}

const resetPassword2 = async (otp, email) => {
    const html = `<p>You requested to reset password, kindly use the code below to reset your password</p><p><h1>${otp}</h1></p>`;

    const transporter = nodemailer.createTransport({
        host: 'faithfulolaleru.com',
        port: 465,
        secure: true,
        auth: {
            user: 'faithful@faithfulolaleru.com',
            pass: 'ionknowmyname'
        }
    })

    transporter.sendMail({
        from: 'faithful@faithfulolaleru.com',
        to: email,
        subject: 'Reset your Password!',
        html: html
    })
    .then((message) => {
        console.log("Message sent --> " + message.messageId);
        return {
            message: "Email Sent Successfully",
            messageId: message.messageId
        }
    })
    .catch((err) => {
        console.log("Error in sending email--> " + err.message);
        return {
            message: "Email Failed to Send",
            messageId: null
        }
    })    
}

module.exports = { sendEmail, resetPassword, resetPassword2 };