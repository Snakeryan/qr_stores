const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Mongo connected."))
    .catch(err => console.log("Error: ", err));

const sample = (array) => (array[Math.floor(Math.random() * array.length)]);

const seedDB = async() => {
    await Campground.deleteMany({})
    for (let i = 0; i <= 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            geometry: {
                "type": "Point",
                "coordinates": [cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            author: "60ebe6aea4808774941725ea",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: " Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga nemo delectus natus veritatis! Voluptas tempore quae ratione! Consequatur delectus iste consequuntur? Quia facere quisquam aperiam vitae. Assumenda, corporis. Blanditiis, voluptatibus!",
            price,
            images: [{
                "url": "https://res.cloudinary.com/dzbat8o0x/image/upload/v1626206605/YelpCamp/wk24r6pjhwx3sulpnwvq.png",
                "filename": "YelpCamp/wk24r6pjhwx3sulpnwvq"
            }, {
                "url": "https://res.cloudinary.com/dzbat8o0x/image/upload/v1626206606/YelpCamp/pn7n6mltfc7iolmstoti.png",
                "filename": "YelpCamp/pn7n6mltfc7iolmstoti"
            }]
        });
        await camp.save();
    }
}




seedDB().then(() => {
    mongoose.connection.close();
})