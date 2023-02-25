const mongoose = require("mongoose")

const connectDB = async () => {
    mongoose.set('strictQuery', false)
    const conn = await mongoose.connect(process.env.DATABASE)
    console.log("MongoDB connection success")
}

module.exports = { connectDB }
