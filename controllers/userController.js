
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/users.model");

//load login pge

exports.loadlogin = async (req, res) => {
    try {
        // if(req.session?.admin){
        if (req.session && req.session.admin) {
            return res.redirect("/admin/dashboard");
        }
        if (req.session.user) {
            return res.redirect('/user/userhome')
        }
        res.render("userlogin", { messages: req.flash() });
    
    } catch (err) {
        console.error("Load login error:", err);
        res.status(400).send("Something went wrong");
    }
};

//load signup page

exports.loadsignup = (req, res) => {
    res.render("usersignup");
};

//logout user

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/user/login");
    })
}

//load user home page

exports.loadhome = (req, res) => {
    if (!req.session.user) {
        return res.redirect("/user/login")
    }
    res.render("userhome", { user: req.session.user })
}

//sending user signup details

exports.postSignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "Email already registered, Please login!");
            return res.redirect("/user/signup");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect("/user/login");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error while signing up");
    }
};

//sending user login details

exports.postlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
    
        if(!user){
            req.flash("error","User not found");
            return res.redirect("/user/login");
        }

        //comparing password

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            req.flash("error", "Incorrect Password");
            return res.redirect("/user/login");
        }

        if(user.role==="admin"){
            req.flash("error","Please login in admin panel");
            return res.redirect("/admin/adminlogin");
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        
        
        res.redirect("/user/userhome");

    } catch (err) {
        console.log(err);
        res.status(500).send("Login error..");
    }
};


