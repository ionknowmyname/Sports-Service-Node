const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors");
const user = require("./routes/user");

const { connectDB } = require("./dbConnection")


const { createJwtToken } = require("./config/generateToken")
const { authenticate } = require("./config/authentication")



const app = express()

dotenv.config()

connectDB()

app.use(authenticate)

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: `${process.env.FRONT_URL}`
        })
    );
}


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/api/v1/users", user);


const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})