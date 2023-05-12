const User = require("../models/user");

const renderSignupForm = (req, res) => {
    res.render("users/signup");
};

const createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body.user;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, function (err) {
            if (err) {
                return next(err);
            }
            req.flash("success", "Successfully Signed In!");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

const renderLoginForm = (req, res) => {
    res.render("users/login");
};

const login = async (req, res) => {
    req.flash("success", "Welcome Back!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

const logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Buh-Bye!");
        res.redirect("/campgrounds");
    });
};

module.exports = {
    renderSignupForm,
    createUser,
    renderLoginForm,
    login,
    logout,
};
