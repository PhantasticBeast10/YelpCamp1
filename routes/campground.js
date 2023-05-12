const express = require("express");
const router = express.Router();

const catchAsync = require("../utilities/catchAsync");

const campgrounds = require("../controllers/campgrounds");

const {
    isLoggedIn,
    validateCampground,
    verifyOwner,
} = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
    .route("/")
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        catchAsync(campgrounds.createCampground)
    );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .patch(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        verifyOwner,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(isLoggedIn, verifyOwner, catchAsync(campgrounds.deleteCampground));

router.get(
    "/:id/edit",
    isLoggedIn,
    verifyOwner,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
