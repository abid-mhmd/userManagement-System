const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const Auth = require("../middleware/Auth.js");
const { forceLogout } = require("../middleware/forceLogout.js");

router.get("/login", Auth.redirectIfAuth, userController.loadlogin);

router.get("/signup", Auth.redirectIfAuth, userController.loadsignup);

router.post("/signup", Auth.redirectIfAuth, userController.postSignup);

router.post("/login", Auth.redirectIfAuth, userController.postlogin);

router.get("/userhome",forceLogout,Auth.isAuth, userController.loadhome);

router.get("/logout", userController.logout);



module.exports = router;