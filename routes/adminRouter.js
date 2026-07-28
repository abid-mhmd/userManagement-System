const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController.js")
const Auth = require("../middleware/Auth.js")


router.get("/adminlogin", Auth.redirectIfAdmin, adminController.adminlogin);

router.post("/adminlogin", Auth.redirectIfAdmin, adminController.postLogin)


router.get("/dashboard", Auth.ensureAdmin, adminController.showDashboard);

router.get("/logout", adminController.adminlogout);

router.post("/edit-user/:id", Auth.ensureAdmin, adminController.updateUser);

// router.post("/edit-user/:id", Auth.ensureAdmin, adminController.editUser);

router.post("/add-user", Auth.ensureAdmin, adminController.addUser)

router.get("/delete/:id", Auth.ensureAdmin, adminController.deleteUser);


module.exports = router;