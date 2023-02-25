const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || ""

    try {
        const verified  = jwt.verify(token, process.env.JWT_SECRET)
        req.verifiedUser = verified.user   // add verifiedUser object to the req
        console.log("Verification success!", verified)

        next()
    } catch (err) {
        console.log("Verification failed!", err)

        next()
    }
}

module.exports = { authenticate }