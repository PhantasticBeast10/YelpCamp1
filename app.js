if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const serverless = require("serverless-http");

const ExpressError = require("./utilities/ExpressError");

const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelpcamp";

// "mongodb://localhost:27017/yelpcamp"

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

app.use(helmet({ crossOriginEmbedderPolicy: false }));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv53bipye/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv53bipye/",
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv53bipye/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dv53bipye/"];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dv53bipye/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/",
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
                mediaSrc: ["https://res.cloudinary.com/dv53bipye/"],
                childSrc: ["blob:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

const secret = process.env.SECRET || "wazzup"

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/newFakeUser", async (req, res) => {
    const user = new User({ email: "chhaprisaala@abc.in", username: "chomu" });
    const newUser = await User.register(user, "chicken");
    res.send(newUser);
});

app.use("/campgrounds/:campId/reviews", reviewRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { errCode = 500 } = err;
    if (!err.msg) err.msg = "Kuch gadbad hui hain!";
    res.status(errCode).render("error", { err });
});

app.listen(8080, () => {
    console.log("LISTENING ON PORT 8080...");
});
