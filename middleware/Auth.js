const isAuth = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    return res.redirect("/user/login");
};

const redirectIfAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/user/userhome");
    }
    return next();
};

const redirectIfAdmin = (req, res, next) => {
    if (req.session.admin) {
        return res.redirect("/admin/dashboard");
    }
    return next();
};
function ensureAdmin(req, res, next) {
    if (req.session.admin) {
        return next();
    }
    res.redirect("/admin/adminlogin");
}


module.exports = { ensureAdmin, isAuth, redirectIfAuth, redirectIfAdmin };
