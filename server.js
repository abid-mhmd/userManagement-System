const express = require("express");
const path = require("path");
const flash = require("connect-flash");
const connectDB = require("./config/db");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();

const app = express();

const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");

connectDB();

const PORT = process.env.PORT || 3000;


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true
    }
}))
app.use(nocache());

app.use(flash());

app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));



app.use("/user", userRouter);
app.use("/admin", adminRouter);


app.get("/", (req, res) => {
    res.redirect("/user/login")
})


app.listen(PORT, () => console.log("server running"));