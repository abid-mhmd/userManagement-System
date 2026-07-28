const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/users.model");
const { message } = require("statuses");

//loading admin loginpage

exports.adminlogin = async (req, res) => {
    try {
        if (req.session.user) {
            return res.redirect("/user/userhome")
        }
        if (req.session.admin) {
            return res.redirect('/admin/dashboard')
        }
        res.render("adminlogin", { messages: req.flash() });
    } catch (err) {
        console.error("Load login error:", err);
        res.status(400).send("Something went wrong");
    }
};

//sending admin logindata

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.role !== "admin") {
            req.flash("error", "Admin not found, Please SignUp");
            return res.redirect("/admin/adminlogin");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            req.flash("error", "Incorrect Password");
            return res.redirect("/admin/adminlogin");
        }
`       `
        req.session.admin = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        return res.redirect("/admin/dashboard");
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/admin/adminlogin");
    }
};

//loading admin dashboard

exports.showDashboard = async (req, res) => {
    try {
        const searchQuery = req.query.query || "";
        let users;
        if (searchQuery.trim() === "") {
            users = await User.find({ role: "user" });
        } else {
            users = await User.find({
                role: "user",
                $or: [
                    { username: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } }
                ]
            });
        }
        res.render("dashboard", { users, searchQuery, messages: req.flash() });

    } catch (err) {
        req.flash("error", "Unable to load dashboard");
        return res.redirect("/admin/dashboard");
    }
};

// exports.editUser = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const { username, email } = req.body;
//         await User.findByIdAndUpdate(id, { username, email });

//         req.flash("success", "User updated successfully!");
//         return res.redirect("/admin/dashboard");

//     } catch (err) {
//         req.flash("error", err.message);
//         res.redirect("/admin/dashboard");
//     }
// }


//admin logout 

exports.adminlogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/adminlogin")
    })
}

//edit user

exports.updateUser = async (req, res) => {
    try {
        if (!req.session.user && !req.session.admin) {
            return res.redirect("/admin/adminloagin");
        }
        const userId = req.params.id;
        const { username, email } = req.body;
        if (!username) {
            req.flash("error", "Username is required");
            return res.redirect("/admin/dashboard");
        }
        if (!email) {
            req.flash("error", "Emil is required");
            return res.redirect("/admin/dashboard");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            req.flash("error", "Invalid email format");
            return res.redirect("/admin/dashboard");
        }

        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/admin/dashboard");
        }
        const existing = await User.findOne({ email: email, _id: { $ne: userId } });
        if (existing) {
            req.flash("error", "Email is already in use");
            return res.redirect("/admin/dashboard");
        }
        await User.findByIdAndUpdate(userId, { username, email });
        req.flash("success", "User updated successfully");
        return res.redirect("/admin/dashboard");
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to update user");
        return res.redirect("/admin/dashboard");
    }
};


//add user

exports.addUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !/^[A-Za-z]+$/.test(username)) {
            req.flash("error", "Username is required and must contin letters");
            return res.redirect("/admin/dashboard");
        }
        if (!email || !email.includes("@")) {
            req.flash("error", "Enter a valid email");
            return res.redirect("/admin/dashboard");
        }
        if (!password || password.length < 6) {
            req.flash("error", "Passwordmust be at least 6 charactors");
            return res.redirect("/admin/dashboard");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "Email is already registred");
            return res.redirect("/admin/dashboard");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        req.flash("success", "User added successfully");
        res.redirect("/admin/dashboard");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something wrong .Please try again");
        res.redirect("/admin/dashboard");
    }
}

//delete user

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/admin/dashboard");
        }
        await User.findByIdAndDelete(userId);
        req.flash("success", "User deleted successfully");
        res.redirect("/admin/dashboard");
    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to delete user");
        res.redirect("/admin/dashboard");
    }
};
