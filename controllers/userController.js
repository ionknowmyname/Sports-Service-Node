const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendSMS = require("../validation/twilioService")
const { sendEmail, resetPassword2 } = require("../validation/emailService")
const { createJwtToken } = require("../config/generateToken")
const uuid = require('uuid').v4



const create = async (req, res) => {
    
    if (!req.body.email || !req.body.phonenumber || !req.body.password) {
        res.status(400).send({
            message: "Fields cannot be empty!"
        });

        return;
    }

    const { email, phonenumber, password } = req.body;

    await User.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(400).json({
                message: "User already exist",
            });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000);
        const newToken = uuid();

        bcrypt.hash(password, 10, (err, hashedPass) => {
            if (err) {
                console.log("Error while hashing password --> " + err);
                return res.status(401).json({
                    message: "Error while hashing password"
                });
            }

            let user = new User({
                username: email,   // default username is email
                email, 
                phonenumber,
                password: hashedPass,
                otp: newOtp,
                token: newToken
            });

            user.save()
                .then((user) => {

                    // send phone & email validation
                    const smsResponse = sendSMS(newOtp, phonenumber)
                    const emailResponse = sendEmail(newToken, email)

                    res.status(200).send({
                        message: "User Created Successfully",
                        data: user 
                    });
                })
                .catch((err) => {
                    console.log("Error while creating user --> " + err.message);
                    res.status(500).send({
                        message: "Some error occurred while creating User"
                    });
                });
        });
    });
    
}

const login = (req, res) => {

    const { login, password } = req.body;
  
    User.findOne({ $or: [ { email: login }, { phonenumber: login } ] }).select("+password")
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: "User does not exist. Please signup.",
                });
            }

            bcrypt.compare(password, user.password, (err, result) => {

                if (err) {
                    console.log("Error while comparing password with bcrypt --> " + err.message);
                    return res.status(400).json({
                        message: "Error while comparing password with bcrypt",
                    });
                }

                if (result) {

                    if(user.isActive === false) {
                        return res.status(403).json({
                            message: "User is not active, activate via email or phone",
                        });
                    }

                    const token = createJwtToken(user);
                    console.log("token from login --> ", token);

                    // res.header("x-auth-token", token).json({
                    //     user: { username /* email, role */ },
                    //     token: token,
                    //     msg: "Successful Login",
                    // });

                    // console.log("res.header: ", res.header);
                    

                    return res.status(200).json({
                        message: "User Login Successful",
                        data: {
                            jwt: token,
                            user: user
                        }
                    }); 
                } else {

                    return res.status(401).json({
                        message: "Password does not match",
                    });
                }
            });
        })
        .catch((err) => {
            console.log("Error while logging in user --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while logging in user"
            });
        });
   
}

const verifyPhone = async (req, res) => {
    const { otp, phonenumber } = req.body;
    const toUpdate = {
        isActive: true,
        phoneVerified: true,
        otp: Math.floor(100000 + Math.random() * 900000) // after verifying phone successfully, set new otp 
    }
    
    User.findOneAndUpdate({ phonenumber }, toUpdate, { new: true })
        .then((user) => {
            // not checking time constraints, so long as it matches

            const otpFromDB = user.otp;

            if(otp !== otpFromDB) {
                res.status(400).send({
                    message: "Invalid otp"
                });
            }

            res.status(200).json({
                msg: "User phone number sucessfully verified",
                updatedUser: user,
            });
        })
        .catch((err) => {
            console.log("Error while verifying user phone number --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while verifying user phone number"
            });
        });
}

const verifyEmail = async (req, res) => {
    const { token, email } = req.query;  // params
    const toUpdate = {
        isActive: true,
        emailVerified: true, 
        token: uuid()     // also set new uuid token if email is verified successfully
    }

    console.log("token from email verify query params --> " + token);
    console.log("email from email verify query params --> " + email)

    User.findOneAndUpdate({ email }, toUpdate, { new: true })
        .then((user) => {
            // not checking time constraints, so long as it matches

            const tokenFromDB = user.token;

            if(token !== tokenFromDB) {
                res.status(400).send({
                    message: "Invalid token"
                });
            }

            res.status(200).json({
                msg: "User email sucessfully verified",
                updatedUser: user,
            });
        })
        .catch((err) => {
            console.log("Error while verifying user email --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while verifying user email"
            });
        });
    
}

const updatePassword = async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body; 

    User.findById({ _id: userId }, { oldPassword, newPassword }, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: "User does not exist. Please signup.",
                });
            }

            bcrypt.hash(newPassword, 10, (err, hashedPass) => {
                if (err) {
                    console.log("Error while hashing password --> " + err);
                    return res.status(401).json({
                        message: "Error while hashing password"
                    });
                }
    
                user.password = hashedPass;
    
                user.save()
                    .then((user) => {
    
                        res.status(200).send({
                            message: "User Password Updated Successfully",
                            updatedUser: user 
                        });
                    })
                    .catch((err) => {
                        console.log("Error while updating password 1 --> " + err.message);
                        res.status(500).send({
                            message: "Some error occurred while updating password"
                        });
                    });
            });
            
        })
        .catch((err) => {
            console.log("Error while updating password 2 --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while updating password"
            });
        });
    
}

const forgotPassword = async (req, res) => {
    const { email } = req.body; 

    // Not required but can reset Password in DB to dummy password
    // can also set the user to inactive, & activate back after setting new password

    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(400).json({
                message: "User does not exist. Please signup.",
            });
        }

        const response = resetPassword2(user.otp, email);
        console.log("Response from email Service during Password reset --> " + response);

        if(response.messageId !== null) {
            return res.status(200).send({
                message: `Successfully sent Reset email to ${email}`
            });
        } else {
            return res.status(400).send({
                message: `Failed to send Reset email to ${email}`
            });
        }

        
    })
    .catch((err) => {
        console.log("Error while sending Reset Password email --> " + err.message);
        res.status(500).send({
            message: "Some error occurred while sending Reset Password email"
        });
    });
    
}

const validateOtp = async (req, res) => {
    const { otp, email } = req.body;  

    const newOtp = Math.floor(100000 + Math.random() * 900000);   // set new otp after every use

    User.findOneAndUpdate({ email }, { newOtp }, { new: true })
        .then((user) => {

            if(otp !== user.otp) {
                res.status(400).send({
                    message: "Invalid OTP"
                });
            }

            res.status(200).json({
                message: "OTP is valid",
                updatedUser: user,
            });
        })
        .catch((err) => {
            console.log("Error while validating OTP --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while validating OTP"
            });
        });
    
}

const setNewPassword = async (req, res) => {
    const { newPassword, email } = req.body;  // email should not come from body, do something bout it
    // const { email } = req.params; // do something bout email

    User.findOne({ email: email }, { newPassword }, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: "User does not exist. Please signup.",
                });
            }

            bcrypt.hash(newPassword, 10, (err, hashedPass) => {
                if (err) {
                    console.log("Error while hashing password --> " + err);
                    return res.status(401).json({
                        message: "Error while hashing password"
                    });
                }
    
                user.password = hashedPass;
    
                user.save()
                    .then((user) => {
    
                        res.status(200).send({
                            message: "User Password Reset Successfully",
                            updatedUser: user 
                        });
                    })
                    .catch((err) => {
                        console.log("Error while resetting password 1 --> " + err.message);
                        res.status(500).send({
                            message: "Some error occurred while resetting password"
                        });
                    });
            });
            
        })
        .catch((err) => {
            console.log("Error while resetting password 2 --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while resetting password"
            });
        });

}

const updateUsername = async (req, res) => {
    const { userId } = req.params;
    const { username } = req.body;

    User.findByIdAndUpdate({ _id: userId }, { username }, { new: true })
        .then((user) => {
            
            if (!user) {
                return res.status(404).json({
                    message: "User does not exist. Please signup.",
                });
            }

            res.status(200).json({
                msg: "User username sucessfully updated",
                updatedUser: user,
            });
        })
        .catch((err) => {
            console.log("Error while updating User username --> " + err.message);
            res.status(500).send({
                message: "Some error occurred while updating User username"
            });
        });
    
}

const getUserById = async (req, res) => {
    
    const { userId } = req.params;
    User.findById({ _id: userId }).then((user) => {
        
        if (!user) {
            return res.status(404).json({
                message: "User does not exist. Please signup.",
            });
        }

        res.status(200).json({
            user: user,
        });

    })
    .catch((err) => {
        console.log("Error while retrieving user by id --> " + err.message);
        res.status(500).send({
            message: "Some error occurred while retrieving user by id"
        });
    });
    
}

const logout = async (req, res) => {
    
    // NA: handle in front 
    
}


module.exports = { create, login, verifyPhone, verifyEmail, updatePassword, forgotPassword,
                validateOtp, setNewPassword, updateUsername, getUserById, logout }

