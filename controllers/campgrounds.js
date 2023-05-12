const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

const index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
};

const renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

const showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!campground) {
        req.flash("error", "Cannot find Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
};

const renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

const createCampground = async (req, res, next) => {
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
    }));
    newCampground.owner = req.user._id;
    await newCampground.save();
    req.flash("success", "Successfully created campground!");
    res.redirect(`/campgrounds/${newCampground._id}`);
};

const updateCampground = async (req, res) => {
    const campground = { ...req.body.campground };
    const updatedCampground = await Campground.findByIdAndUpdate(
        req.params.id,
        campground
    );
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }
    const images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
    }));
    updatedCampground.images.push(...images);
    await updatedCampground.save();
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${req.params.id}`);
};

const deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};

module.exports = {
    index,
    renderNewForm,
    showCampground,
    renderEditForm,
    createCampground,
    updateCampground,
    deleteCampground,
};
