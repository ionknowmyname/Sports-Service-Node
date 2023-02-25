const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config();

const createJwtToken = (user) => {

    return jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
    })
}

module.exports = { createJwtToken }