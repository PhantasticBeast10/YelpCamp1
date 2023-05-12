const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected!");
});

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const price = Math.ceil(Math.random() * 200);
        const randomCity = random(cities);
        const c = new Campground({
            owner: "637099946b0b32f7d6d94356",
            title: `${random(descriptors)} ${random(places)}`,
            images: [
                {
                    url: "https://res.cloudinary.com/dv53bipye/image/upload/v1638013225/YelpCamp/noxqv1qkzls9umtbc5yi.jpg",
                    filename: "YelpCamp/noxqv1qkzls9umtbc5yi",
                },
                {
                    url: "https://res.cloudinary.com/dv53bipye/image/upload/v1670006003/YelpCamp/wc8ppbpvya7b4koopext.jpg",
                    filename: "YelpCamp/wc8ppbpvya7b4koopext",
                },
            ],
            location: `${randomCity.city}, ${randomCity.state}`,
            geometry: { type: "Point", coordinates: [randomCity.longitude, randomCity.latitude] },
            description: "blah blah blah blah",
            price,
        });
        await c.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
