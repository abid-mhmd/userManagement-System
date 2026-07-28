const User=require("../models/users.model");

exports.forceLogout = async (req,res,next)=>{
    if(!req.session.user){
        return res.redirect("/user/login");
    }
    try{
        const currentUser=await User.findById(req.session.user.id);

        if(!currentUser){
            req.flash("error","Your account is deleted by admin");
            req.session.destroy(err=>{
                if(err){
                    console.error("Sesion destroy error",err);
                }
                res.clearCookie('connect.id');
                return res.redirect("/user/login");
            })
            return ;
        }
        next();
    }catch(err){
        console.log(err);
        res.status(500).send("server error");
    }
    
}