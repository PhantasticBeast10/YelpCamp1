const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utilities/catchAsync");

const reviews = require("../controllers/reviews");

const { 
    isLoggedIn, 
    validateReview, 
    verifyAuthor 
} = require("../middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
    "/:reviewId",
    isLoggedIn,
    verifyAuthor,
    catchAsync(reviews.deleteReview)
);

module.exports = router;
