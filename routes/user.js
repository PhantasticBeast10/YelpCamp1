const express = require("express");
const router = express.Router();

const passport = require("passport");

const catchAsync = require("../utilities/catchAsync");

const users = require("../controllers/users");

router
    .route("/signup")
    .get(users.renderSignupForm)
    .post(catchAsync(users.createUser));

router
    .route("/login")
    .get(users.renderLoginForm)
    .post(
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
            keepSessionInfo: true,
        }),
        catchAsync(users.login)
    );

router.get("/logout", users.logout);

module.exports = router;
