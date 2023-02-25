const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: { 
            type: String,
            required: false,
        },
        email: { 
            type: String, 
            required: true,
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please Enter a valid email",
            ], 
        },
        phonenumber: { 
            type: String,
            required: true,
            unique: true,
            match: [
                /^\+(?:[0-9] ?){12}[0-9]$/,
                "Please Enter a valid Phonenumber",
            ], 
        }, 
        password: { 
            type: String, 
            required: true,
            select: false,
        },
        interests: { 
            type: [String],
        },
        otp: { 
            type: String, 
            required: true,
        },
        token: { 
            type: String, 
            required: true,
        },
        isActive: { 
            type: Boolean,
            default: false, 
        }, 
        emailVerified: { 
            type: Boolean,
            default: false, 
        }, 
        phoneVerified: { 
            type: Boolean,
            default: false, 
        }, 
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;