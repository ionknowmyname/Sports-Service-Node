const express = require("express");
const router = express.Router();

const users = require("../controllers/userController");



router.post("/register", users.create);

router.post("/login", users.login);

router.put("/verify/phone", users.verifyPhone);

router.get("/verify/email", users.verifyEmail);

router.put("/:userId/password/update", users.updatePassword);

router.post("/password/reset/request", users.forgotPassword);

router.post("/password/reset/validate", users.validateOtp);

router.put("/password/reset/new", users.setNewPassword);

router.put("/:userId/username/update", users.updateUsername);

router.post("/:userId/logout", users.logout);




module.exports = router;