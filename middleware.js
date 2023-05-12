const ExpressError = require("./utilities/ExpressError");

const Campground = require("./models/campground");
const Review = require("./models/review");

const {
    campgroundValidationSchema,
    reviewValidationSchema,
} = require("./validationSchemas");

const validateCampground = (req, res, next) => {
    const { error } = campgroundValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((d) => d.message).join("\n");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewValidationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((d) => d.message).join("\n");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "Sign In to Continue!");
        return res.redirect("/login");
    }
    next();
};

const verifyOwner = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground.owner.equals(req.user._id)) {
        req.flash(
            "error",
            "Modification can only be done by Campground Owners!"
        );
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    next();
};

const verifyAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "Deletion can only be done by Review Authors!");
        return res.redirect(`/campgrounds/${campId}`);
    }
    next();
};

module.exports = {
    validateCampground,
    validateReview,
    isLoggedIn,
    verifyOwner,
    verifyAuthor,
};
